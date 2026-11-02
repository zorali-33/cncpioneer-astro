# T18 Dist Release Fingerprint

Status: recorded
Date: 2026-10-10

## Scope

Recorded a deployment-ready fingerprint for the current generated `dist` output after final acceptance and smoke checks.

## Dist Counts

- Total files: 4171
- HTML `index.html` pages: 404
- Sitemap URLs: 389
- Noindex fallback pages: 15
- Core SEO tag spot-count: 1616

The core SEO tag spot-count represents four expected tags across 404 generated HTML pages:

- `<title>`
- `<meta name="description">`
- `<link rel="canonical">`
- `<meta property="og:url">`

## Key File Hashes

### robots.txt

- Path: `dist/robots.txt`
- SHA256: `9B4996ACC8A7F613D5CAF224355B64E5CD35F897DCC7D1A967C1FD38199894F0`

### sitemap.xml

- Path: `dist/sitemap.xml`
- SHA256: `C3FA43BB72E559AB21CAE2923801B6EE1D4853B305F625739C0C3AC37028BD5A`

## Consistency Notes

- The 389 sitemap URLs match the 389 indexable pages reported by T14.
- The 15 noindex fallback pages match the noindex count reported by T14.
- The 404 HTML pages match the full dist SEO integrity audit page count.
- The 1616 SEO tag count confirms the expected four core SEO tags are present across all generated HTML pages.

## Related Reports

- `seo-migration/reports/T12-final-acceptance-audit.md`
- `seo-migration/reports/T14-dist-seo-integrity-audit.md`
- `seo-migration/reports/T17-dist-smoke-check.md`
