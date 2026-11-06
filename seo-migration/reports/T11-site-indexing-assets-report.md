# T11 Site Indexing Assets

Status: complete
Date: 2026-11-06 06:44:33

## Scope

Generated production indexing assets from the built `dist` directory.

## Summary

- HTML index pages scanned: 347
- URLs included in sitemap: 346
- URLs excluded from sitemap: 1
- Robots file: `dist/robots.txt`
- Sitemap file: `dist/sitemap.xml`

## Exclusions

- `/search`: noindex

## Rules

- Pages with `<meta name="robots" content="noindex, follow">` are excluded.
- The root page is emitted as `https://www.cncpioneer.com/`.
- Other routes use the page's absolute canonical URL, without a trailing slash.
- Lastmod comes from the explicit page revision ledger / source content dates rendered in the page; unknown dates are omitted. Rebuilding does not update it.

## Outputs

- `dist/robots.txt`
- `dist/sitemap.xml`
- `seo-migration/reports/T11-site-indexing-assets.csv`
- `seo-migration/reports/T11-site-indexing-assets-report.md`
