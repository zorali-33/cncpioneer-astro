# Hostinger intermittent HTTP 429 investigation

Investigation date: 2026-11-02. This report does not claim the incident is resolved.

## Verified observations

- An authenticated GitHub Actions job connected to the Hostinger FTP account and inspected the domain document root, available parent .htaccess files and the site's error log.
- The site's .htaccess contains 404 handling for retired URLs; no explicit 429, throttle or connection-limit directive was found. No .user.ini was present in the document root. The checked domain parent directories did not expose additional .htaccess files.
- The site's available error log was 204,672 bytes / 1,040 decoded lines. No matching 429, throttling or resource-limit event was identified. The collector could not parse timestamps in this file, so its recency is not established. This is not an access log and cannot rule out blocking before the website handler.
- A GitHub-hosted runner received HTTP 200 for both cncpioneer.com and www.cncpioneer.com at /, /index.html and /robots.txt. No Retry-After or x-hcdn-request-id header was observed in those successful responses.
- At approximately 17:36 China time, direct IPv4, direct IPv6 and the configured local proxy each received HTTP 200 for the homepage.
- The live brand-theme.css response already had Cache-Control: public, max-age=604800. An experimental local cache-rule change was withdrawn and was not deployed.
- Browser screenshots supplied by the owner demonstrate intermittent 429 responses during ordinary browsing. Successful diagnostic requests do not invalidate those observations.

## What remains unknown

The actual 429-producing layer, rule ID, blocked source address, request-rate threshold and hosting resource usage at the failure time remain unknown. FTP access does not expose Hostinger's server protection configuration or the hPanel access-log service. Browser automation was previously stopped because its safety check could not verify the current browser URL; authentication cookies were not extracted to bypass that restriction.

## Prepared Hostinger support request (not sent)

Our static Astro website cncpioneer.com repeatedly returns an empty HTTP 429 response to ordinary Chrome visitors, then recovers. Please investigate the request-denial / LiteSpeed per-client throttling / infrastructure protection logs for this domain on 2026-11-02, correlating with the owner's hPanel access logs and browser failure times.

We verified no explicit 429 or rate-limit rules in the domain .htaccess or checked parents. The site's FTP-visible error log does not reveal a corresponding rate-limit event, and successful static CSS responses already have a 7-day cache lifetime. Direct IPv4, IPv6 and proxy requests can all return 200 between incidents; a GitHub-hosted runner also received 200 on both apex and www.

Please identify the exact layer and rule generating 429, the applicable source-address / connection / request thresholds, and whether this hosting account reached CPU, RAM, entry-process or other resource limits at the reported times. If legitimate browser traffic is being misclassified, please apply the appropriate provider-side correction and explain how we can verify it. We are not requesting removal of site security protections or an unverified hosting upgrade.

## Evidence

- Initial read-only diagnostic: https://github.com/zorali-33/cncpioneer-astro/actions/runs/41421383118
- Rule / error-log diagnostic: https://github.com/zorali-33/cncpioneer-astro/actions/runs/41421598807

No production website or proxy setting was changed by this investigation. The repository now contains a manually dispatched diagnostic workflow for future reproduction.
