<?php
declare(strict_types=1);
namespace CNCPioneer\Quote;

use PHPMailer\PHPMailer\PHPMailer;

require_once __DIR__ . '/../vendor/phpmailer/Exception.php';
require_once __DIR__ . '/../vendor/phpmailer/PHPMailer.php';
require_once __DIR__ . '/../vendor/phpmailer/SMTP.php';

const MAX_DRAWING_BYTES = 50 * 1024 * 1024;
const ALLOWED_EXTENSIONS = ['pdf', 'step', 'stp', 'iges', 'igs', 'stl', 'dxf', 'dwg', 'zip'];

final class RequestError extends \RuntimeException {
    public function __construct(public readonly int $status, string $message) { parent::__construct($message); }
}

function field(array $data, string $key, int $max, bool $multiline = false): string {
    if (!isset($data[$key]) || !is_string($data[$key])) throw new RequestError(422, 'Please complete all required fields.');
    $value = trim($data[$key]);
    if ($value === '' || strlen($value) > $max || preg_match('//u', $value) !== 1) throw new RequestError(422, 'Please check the length and format of your details.');
    if (preg_match($multiline ? '/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/' : '/[\x00-\x1F\x7F]/', $value)) throw new RequestError(422, 'Please remove unsupported characters from your details.');
    return $value;
}

function optionalField(array $data, string $key, int $max): string {
    if (!isset($data[$key])) return '';
    if (!is_string($data[$key])) throw new RequestError(422, 'Please check the length and format of your details.');
    $value = trim($data[$key]);
    if ($value === '') return '';
    if (strlen($value) > $max || preg_match('//u', $value) !== 1 || preg_match('/[\x00-\x1F\x7F]/', $value)) {
        throw new RequestError(422, 'Please check the length and format of your details.');
    }
    return $value;
}

function validateFields(array $post): array {
    if (!empty($post['company_website'])) throw new RequestError(422, 'Unable to submit this request.');
    $fields = [
        'first_name' => field($post, 'first_name', 160),
        'last_name' => field($post, 'last_name', 160),
        'phone' => optionalField($post, 'phone', 80),
        'email' => field($post, 'email', 254),
        'country' => optionalField($post, 'country', 160),
        'message' => field($post, 'message', 12000, true),
    ];
    if (!filter_var($fields['email'], FILTER_VALIDATE_EMAIL)) throw new RequestError(422, 'Please enter a valid email address.');
    if ($fields['phone'] !== '' && !preg_match('/^[0-9()#&+*=.,\s-]{5,80}$/', $fields['phone'])) throw new RequestError(422, 'Please enter a valid phone number.');
    return $fields;
}

function validateDrawing(array $file, bool $requireUploadedFile = true): array {
    if (!isset($file['error']) || is_array($file['error'])) throw new RequestError(422, 'Please attach your drawing or CAD file.');
    if (in_array($file['error'], [UPLOAD_ERR_INI_SIZE, UPLOAD_ERR_FORM_SIZE], true)) throw new RequestError(413, 'The drawing must be no larger than 50 MB.');
    if ($file['error'] !== UPLOAD_ERR_OK || !is_string($file['tmp_name'] ?? null) || !is_string($file['name'] ?? null)) throw new RequestError(422, 'The drawing could not be uploaded. Please select it again.');
    $temporary = $file['tmp_name'];
    if (($requireUploadedFile && !is_uploaded_file($temporary)) || !is_file($temporary)) throw new RequestError(422, 'The drawing could not be uploaded.');
    $size = filesize($temporary);
    if ($size === false || $size < 1 || $size > MAX_DRAWING_BYTES) throw new RequestError(413, 'Attach a non-empty drawing no larger than 50 MB.');
    $original = basename(str_replace('\\', '/', $file['name']));
    $extension = strtolower(pathinfo($original, PATHINFO_EXTENSION));
    if (!in_array($extension, ALLOWED_EXTENSIONS, true)) throw new RequestError(422, 'Use PDF, STEP, STP, IGES, IGS, STL, DXF, DWG or ZIP files.');
    $name = preg_replace('/[^\p{L}\p{N}_. ()-]/u', '-', $original);
    if (!$name || strlen($name) > 200) $name = 'project-drawing.' . $extension;
    $prefix = file_get_contents($temporary, false, null, 0, 1024);
    if ($extension === 'pdf' && strpos((string) $prefix, '%PDF-') === false) throw new RequestError(422, 'The selected PDF is not a valid PDF file.');
    if ($extension === 'zip' && !str_starts_with((string) $prefix, 'PK')) throw new RequestError(422, 'The selected ZIP is not a valid ZIP file.');
    return ['path' => $temporary, 'name' => $name, 'size' => $size, 'type' => $extension === 'pdf' ? 'application/pdf' : ($extension === 'zip' ? 'application/zip' : 'application/octet-stream')];
}

function loadConfig(?string $filename = null): array {
    $filename ??= getenv('CNCP_MAIL_CONFIG') ?: dirname(__DIR__, 3) . '/.cncpioneer-mail.php';
    if (!is_file($filename)) throw new RequestError(503, 'The enquiry service is temporarily unavailable. Please email info@cncpioneer.com.');
    $config = require $filename;
    if (!is_array($config) || !is_string($config['smtp_password'] ?? null) || trim($config['smtp_password']) === '') throw new RequestError(503, 'The enquiry service is temporarily unavailable. Please email info@cncpioneer.com.');
    foreach (['smtp_username', 'from_email', 'to_email'] as $key) {
        if (!filter_var($config[$key] ?? '', FILTER_VALIDATE_EMAIL)) throw new RequestError(503, 'The enquiry service is temporarily unavailable. Please email info@cncpioneer.com.');
    }
    if (($config['smtp_host'] ?? '') !== 'smtp.exmail.qq.com' || (int) ($config['smtp_port'] ?? 0) !== 465) throw new RequestError(503, 'The enquiry service is temporarily unavailable. Please email info@cncpioneer.com.');
    if ($config['from_email'] !== $config['smtp_username']) throw new RequestError(503, 'The enquiry service is temporarily unavailable. Please email info@cncpioneer.com.');
    return $config;
}

function verifyOrigin(array $server, array $config): void {
    $origin = $server['HTTP_ORIGIN'] ?? '';
    if ($origin === '' && isset($server['HTTP_REFERER'])) {
        $parts = parse_url($server['HTTP_REFERER']);
        if (isset($parts['scheme'], $parts['host'])) $origin = $parts['scheme'] . '://' . $parts['host'] . (isset($parts['port']) ? ':' . $parts['port'] : '');
    }
    if (!is_string($origin) || !in_array($origin, $config['allowed_origins'] ?? [], true)) throw new RequestError(403, 'Please submit the form from the CNCPioneer website.');
}

function rateLimit(string $ip, string $secret, ?string $directory = null, ?int $now = null): void {
    $now ??= time();
    $directory ??= sys_get_temp_dir() . '/cncpioneer-quotes-' . substr(hash('sha256', __DIR__), 0, 16);
    if (!is_dir($directory) && !mkdir($directory, 0700, true) && !is_dir($directory)) throw new RequestError(503, 'Please try again later or email info@cncpioneer.com.');
    $handle = fopen($directory . '/attempts.json', 'c+');
    if (!$handle || !flock($handle, LOCK_EX)) throw new RequestError(503, 'Please try again later or email info@cncpioneer.com.');
    try {
        $state = json_decode(stream_get_contents($handle) ?: '{}', true);
        if (!is_array($state)) $state = [];
        $state = array_filter($state, static fn($item) => is_array($item) && ($item['start'] ?? 0) > $now - 900);
        $key = hash_hmac('sha256', $ip, $secret);
        $entry = $state[$key] ?? ['start' => $now, 'count' => 0];
        if ($entry['count'] >= 8) throw new RequestError(429, 'Too many requests. Please wait 15 minutes or email info@cncpioneer.com.');
        $entry['count']++;
        $state[$key] = $entry;
        rewind($handle); ftruncate($handle, 0); fwrite($handle, json_encode($state, JSON_THROW_ON_ERROR)); fflush($handle);
        @chmod($directory . '/attempts.json', 0600);
    } finally { flock($handle, LOCK_UN); fclose($handle); }
}

function createMailer(array $config): PHPMailer {
    $mail = new PHPMailer(true);
    $mail->isSMTP();
    $mail->Host = $config['smtp_host'];
    $mail->Port = (int) $config['smtp_port'];
    $mail->SMTPAuth = true;
    $mail->SMTPSecure = PHPMailer::ENCRYPTION_SMTPS;
    $mail->Username = $config['smtp_username'];
    $mail->Password = $config['smtp_password'];
    $mail->SMTPDebug = 0;
    $mail->Timeout = 15;
    $mail->CharSet = PHPMailer::CHARSET_UTF8;
    $mail->setFrom($config['from_email'], $config['from_name'] ?? 'CNCPioneer Website');
    $mail->addAddress($config['to_email']);
    return $mail;
}

function deliverQuote(array $fields, array $drawing, array $config, string $receipt, ?callable $send = null): void {
    $mail = createMailer($config);
    $name = $fields['first_name'] . ' ' . $fields['last_name'];
    $mail->addReplyTo($fields['email'], $name);
    $mail->Subject = 'CNC machining enquiry [' . $receipt . ']';
    $mail->isHTML(false);
    $mail->Body = "New website enquiry\nReference: $receipt\nReceived: " . gmdate('c') . "\n\nName: $name\nEmail: {$fields['email']}\nPhone: {$fields['phone']}\nCountry: {$fields['country']}\n\nProject requirements:\n{$fields['message']}\n\nDrawing: {$drawing['name']}\n";
    $mail->addAttachment($drawing['path'], $drawing['name'], PHPMailer::ENCODING_BASE64, $drawing['type']);
    $sent = $send ? $send($mail) : $mail->send();
    if ($sent !== true) throw new \RuntimeException('SMTP delivery was not accepted');
}
