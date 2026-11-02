<?php
declare(strict_types=1);

use CNCPioneer\Quote\RequestError;
use function CNCPioneer\Quote\{loadConfig, verifyOrigin, validateFields, validateDrawing, rateLimit, deliverQuote};

ini_set('display_errors', '0');
header('Content-Type: application/json; charset=utf-8');
header('Cache-Control: no-store');
header('X-Content-Type-Options: nosniff');
header('X-Robots-Tag: noindex, nofollow');

function respond(int $status, array $payload): never {
    http_response_code($status);
    if ($status === 429) header('Retry-After: 900');
    echo json_encode($payload, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    exit;
}

if (($_SERVER['REQUEST_METHOD'] ?? '') !== 'POST') {
    header('Allow: POST');
    respond(405, ['ok' => false, 'message' => 'Please submit the enquiry form.']);
}
if ((int) ($_SERVER['CONTENT_LENGTH'] ?? 0) > 60000000) respond(413, ['ok' => false, 'message' => 'The drawing must be no larger than 50 MB.']);

$receipt = bin2hex(random_bytes(8));
try {
    require __DIR__ . '/lib/quote-mail.php';
    $config = loadConfig();
    verifyOrigin($_SERVER, $config);
    $fields = validateFields($_POST);
    $drawing = validateDrawing($_FILES['drawing'] ?? []);
    rateLimit($_SERVER['REMOTE_ADDR'] ?? 'unknown', $config['smtp_password']);
    deliverQuote($fields, $drawing, $config, $receipt);
    respond(200, ['ok' => true, 'id' => $receipt, 'message' => 'Thank you. Your enquiry has been sent to CNCPioneer.']);
} catch (RequestError $error) {
    respond($error->status, ['ok' => false, 'message' => $error->getMessage()]);
} catch (Throwable $error) {
    // Do not log message text, credentials, customer details or drawing contents.
    error_log('CNCPioneer quote delivery failed; reference=' . $receipt . '; type=' . get_class($error));
    respond(503, ['ok' => false, 'message' => 'Your enquiry was not sent. Please try again or email info@cncpioneer.com.']);
}
