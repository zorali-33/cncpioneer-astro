<?php
declare(strict_types=1);
require dirname(__DIR__) . '/public/api/lib/quote-mail.php';

$stage = 'configuration';
$mail = null;
try {
    $config = \CNCPioneer\Quote\loadConfig();
    $mail = \CNCPioneer\Quote\createMailer($config);
    $stage = 'smtp';
    $connected = $mail->smtpConnect();
    $mail->smtpClose();
    echo json_encode(['configured' => true, 'authenticated' => $connected, 'from' => $config['from_email'], 'to' => $config['to_email'], 'emailSent' => false], JSON_UNESCAPED_SLASHES) . PHP_EOL;
    exit($connected ? 0 : 1);
} catch (Throwable $error) {
    $smtpCode = $mail ? ($mail->getSMTPInstance()->getError()['smtp_code'] ?? null) : null;
    if ($mail) $mail->smtpClose();
    // Never print exceptions or replies that might contain sensitive details.
    echo json_encode(['configured' => $stage !== 'configuration', 'authenticated' => false, 'stage' => $stage, 'smtpCode' => $smtpCode, 'emailSent' => false]) . PHP_EOL;
    exit(1);
}
