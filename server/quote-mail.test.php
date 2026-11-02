<?php
declare(strict_types=1);
require dirname(__DIR__) . '/public/api/lib/quote-mail.php';
use CNCPioneer\Quote\RequestError;
use function CNCPioneer\Quote\{validateFields, validateDrawing, verifyOrigin, rateLimit, createMailer, deliverQuote, loadConfig};

$checks = 0;
function check(bool $value, string $label): void { global $checks; if (!$value) throw new RuntimeException($label); $checks++; }
function rejects(callable $call, int $status): void { try { $call(); } catch (RequestError $error) { check($error->status === $status, 'Unexpected rejection status'); return; } throw new RuntimeException('Expected request rejection'); }
$directory = sys_get_temp_dir() . '/cncp-quote-tests-' . bin2hex(random_bytes(6));
mkdir($directory, 0700, true);
try {
    $config = ['smtp_host' => 'smtp.exmail.qq.com', 'smtp_port' => 465, 'smtp_username' => 'zora@richonn.com.cn', 'smtp_password' => 'LOCAL_TEST_VALUE_NO_CONNECTION', 'from_email' => 'zora@richonn.com.cn', 'from_name' => 'CNCPioneer Website', 'to_email' => 'info@cncpioneer.com', 'allowed_origins' => ['https://www.cncpioneer.com']];
    $post = ['first_name' => 'Example', 'last_name' => 'Buyer', 'email' => 'buyer@example.test', 'phone' => '+1 202 555 0123', 'country' => 'United States', 'message' => "Material: 6061-T6\nQuantity: 25\nFinish: to drawing", 'to_email' => 'unauthorized@example.test'];
    $fields = validateFields($post);
    check(!isset($fields['to_email']), 'Browser must not control recipients');
    rejects(fn() => validateFields(array_replace($post, ['email' => "buyer@example.test\r\nBcc: bad@example.test"])), 422);
    rejects(fn() => validateFields(array_replace($post, ['company_website' => 'spam'])), 422);
    rejects(fn() => validateFields(array_replace($post, ['country' => 'Select Country'])), 422);
    rejects(fn() => validateFields(array_replace($post, ['first_name' => ['invalid']])), 422);
    verifyOrigin(['HTTP_ORIGIN' => 'https://www.cncpioneer.com'], $config);
    rejects(fn() => verifyOrigin(['HTTP_ORIGIN' => 'https://attacker.example'], $config), 403);
    rejects(fn() => verifyOrigin([], $config), 403);
    rejects(fn() => loadConfig($directory . '/missing.php'), 503);
    file_put_contents($directory . '/empty.php', '<?php return [];');
    rejects(fn() => loadConfig($directory . '/empty.php'), 503);
    $pdf = $directory . '/drawing.pdf';
    file_put_contents($pdf, "%PDF-1.4\nLocal test drawing; no customer information.\n%%EOF");
    $upload = ['error' => UPLOAD_ERR_OK, 'tmp_name' => $pdf, 'name' => "../drawing\r\n.pdf"];
    $drawing = validateDrawing($upload, false);
    check(!str_contains($drawing['name'], "\r") && !str_contains($drawing['name'], '/'), 'Unsafe attachment filename');
    rejects(fn() => validateDrawing($upload), 422);
    rejects(fn() => validateDrawing(array_replace($upload, ['name' => 'malicious.php']), false), 422);
    rejects(fn() => validateDrawing(['error' => UPLOAD_ERR_INI_SIZE], false), 413);
    rejects(fn() => validateDrawing(array_replace($upload, ['name' => 'not-a-zip.zip']), false), 422);
    $large = fopen($directory . '/large.step', 'w'); ftruncate($large, 10000001); fclose($large);
    rejects(fn() => validateDrawing(['error' => 0, 'tmp_name' => $directory . '/large.step', 'name' => 'large.step'], false), 413);
    for ($i = 0; $i < 8; $i++) rateLimit('192.0.2.1', 'test-only-key', $directory . '/rate', 2000);
    rejects(fn() => rateLimit('192.0.2.1', 'test-only-key', $directory . '/rate', 2001), 429);
    check(!str_contains(file_get_contents($directory . '/rate/attempts.json'), '192.0.2.1'), 'Rate limit stores raw addresses');
    rateLimit('192.0.2.1', 'test-only-key', $directory . '/rate', 3000);
    $mailer = createMailer($config);
    check($mailer->SMTPAuth && $mailer->SMTPSecure === 'ssl' && $mailer->SMTPOptions === [], 'TLS authentication must stay enabled');
    deliverQuote($fields, $drawing, $config, 'local-test-reference', function ($mail) {
        check($mail->From === 'zora@richonn.com.cn', 'Incorrect sender');
        check($mail->getToAddresses()[0][0] === 'info@cncpioneer.com', 'Incorrect recipient');
        check(in_array('buyer@example.test', array_column($mail->getReplyToAddresses(), 0), true), 'Missing customer Reply-To');
        check($mail->preSend(), 'Cannot compose message');
        $mime = $mail->getSentMIMEMessage();
        check(str_contains($mime, 'Content-Disposition: attachment;'), 'Missing drawing attachment');
        check(str_contains($mime, 'local-test-reference'), 'Missing receipt reference');
        check(!str_contains($mime, 'LOCAL_TEST_VALUE_NO_CONNECTION'), 'Credentials leaked into mail');
        return true; // Local MIME inspection only. No network delivery.
    });
    try { deliverQuote($fields, $drawing, $config, 'failed-reference', fn($mail) => false); throw new LogicException('False success'); } catch (RuntimeException $error) { check(!($error instanceof LogicException), 'False success after mail rejection'); }
    echo json_encode(['checks' => $checks, 'passed' => true, 'emailsSent' => 0]) . PHP_EOL;
} finally {
    foreach (glob($directory . '/rate/*') ?: [] as $file) unlink($file);
    if (is_dir($directory . '/rate')) rmdir($directory . '/rate');
    foreach (glob($directory . '/*') ?: [] as $file) unlink($file);
    rmdir($directory);
}
