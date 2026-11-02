<?php
declare(strict_types=1);

// Copy to .cncpioneer-mail.php outside the web root. Never place the real secret in public_html.
return [
    'smtp_host' => 'smtp.exmail.qq.com',
    'smtp_port' => 465,
    'smtp_username' => 'zora@richonn.com.cn',
    'smtp_password' => '', // Tencent Exmail client-specific password; never paste into chat.
    'from_email' => 'zora@richonn.com.cn',
    'from_name' => 'CNCPioneer Website',
    'to_email' => 'info@cncpioneer.com',
    'allowed_origins' => ['https://www.cncpioneer.com', 'https://cncpioneer.com'],
];
