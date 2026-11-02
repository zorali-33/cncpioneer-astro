# 询价表单邮件部署（Hostinger + 腾讯企业邮）

已确认：`zora@richonn.com.cn` 登录 SMTP 并发信，`info@cncpioneer.com` 收件。客户邮箱放在 Reply-To，方便直接回复客户。网站公开联系邮箱仍为 info。

## 部署目录

在 Hostinger 为该域名启用 PHP 8.2 或以上版本以及 OpenSSL。将本项目构建后的 `dist` 内容部署到域名的 `public_html`，保留隐藏的 `.htaccess` 文件。部署整个站点会替换现有网站，须在确认发布时执行；本地修改不会自动上线。

```text
域名目录/
├── .cncpioneer-mail.php        私密配置，位于 public_html 外
└── public_html/
    ├── cnc-machining-quote/index.html
    ├── _astro/                页面资源（表单脚本也可能内联在页面中）
    ├── api/
    │   ├── quote.php
    │   ├── .htaccess
    │   ├── .user.ini
    │   ├── lib/quote-mail.php
    │   └── vendor/phpmailer/  三个 PHP 类、LICENSE 和 .htaccess
    ├── .htaccess
    └── 其他构建文件
```

私密配置已保存在项目根目录 `.cncpioneer-mail.php`，**不要把它放进 public_html，也不要发到聊天中**。迁移到主机时将它放在 public_html 的上一级，权限尽可能设置为只有站点运行账号能读取。若主机目录不同，可通过服务端环境变量 `CNCP_MAIL_CONFIG` 指向绝对路径。不要在浏览器脚本里设置密码。

配置示例在 `server/mail-config.example.php`。确认 smtp_username 和 from_email 都为 zora，to_email 为 info，smtp_password 必须是 **zora 账号的腾讯企业邮客户端专用密码**。SMTP 为 `smtp.exmail.qq.com:465`，使用加密连接和认证。允许来源默认为 `https://www.cncpioneer.com` 和 `https://cncpioneer.com`；测试域名需由管理员单独加入，不能使用通配符。

若当前线上仍是 WordPress，不要只上传 PHP 接口便认为现有 WordPress 表单已接通：本方案同时依赖此 Astro 项目的询价页面及脚本。正式发布前应备份原站并确认部署范围。

## 验证与上线

1. 本地运行 `npm run test:quote-mail`（PHP 8.2+；也可设置 `CNCP_PHP_BINARY`）。此测试只检查验证、附件、邮件组合和错误响应，不发送邮件。
2. 运行 `npm run release:verify`，上传通过检查的构建产物。
3. 在主机终端用 PHP 执行项目的 `server/check-mail.php`，或在私密目录保留相同结构后运行。它只尝试 SMTP 登录，输出脱敏结果，不发送邮件。不要把诊断脚本部署进 public_html。
4. 经站点所有者确认后，通过上线表单发送一份明确标注测试的询价及无敏感信息的图纸，在 info 收件箱及垃圾邮件箱核对。SMTP 接受提交不等于已进入收件箱。
5. 验证表单失败时保留内容并提示错误、成功时显示提交编号，确认回复邮件指向客户邮箱。确认 `/api/lib/`、`/api/vendor/` 和 `/api/.user.ini` 无法通过网页访问；`GET /api/quote.php` 应返回 405 JSON。

附件支持 PDF、STEP、STP、IGES、IGS、STL、DXF、DWG、ZIP，最大 **10,000,000 字节**。主机需允许至少 10M upload_max_filesize 和 16M post_max_size；目录已附 `.user.ini`，若主机覆盖它，在 PHP 设置里同步修改。上传文件通过临时文件作为邮件附件，不存入网站公开目录。

如主机连接 SMTP 超时，先由 Hostinger 检查出站 465 端口和 DNS；不要关闭 TLS 证书验证。如收到认证失败，再核对 zora 的客户端专用密码及腾讯企业邮客户端登录权限。当前电脑超时不能证明密码错误，也不能证明主机连接会失败。

## 本地预览

`npm run dev` 和静态预览服务器不执行 PHP，默认提交返回 503 并提示联系 info，不会假装已发送。

需要测试真实 PHP 处理时，可在另一个终端执行：

```powershell
php -S 127.0.0.1:8099 -t public
```

再设置 `CNCP_QUOTE_DEV_SERVER=http://127.0.0.1:8099` 后启动 Astro 开发服务，并仅在私密配置中临时加入实际本地来源（例如 `http://127.0.0.1:4321`）。完整有效的表单会真实发信；普通本地验证应使用测试脚本。不要把本地来源加入正式配置，也不要对外开放 PHP 开发服务器。

2026-10-27 本地 SMTP 连接检查结果：连接超时（10060），未完成登录，未发送邮件。Hostinger 部署和实际收信仍待验证。
