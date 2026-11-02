# T20 Post-Deploy URL Checklist

Status: ready
Date: 2026-10-10

## Scope

Use this checklist after deployment to verify that the live site matches the accepted local `dist` output.

## Required URL Checks

### Indexing Assets

- `https://www.cncpioneer.com/robots.txt`
- `https://www.cncpioneer.com/sitemap.xml`

Expected:

- `robots.txt` allows crawling and references `https://www.cncpioneer.com/sitemap.xml`.
- `sitemap.xml` contains 389 URLs.
- No noindex historical fallback URLs should appear in the sitemap.

### Core Pages

- `https://www.cncpioneer.com/`
- `https://www.cncpioneer.com/about-us/`
- `https://www.cncpioneer.com/services/`
- `https://www.cncpioneer.com/materials/`
- `https://www.cncpioneer.com/industries/`
- `https://www.cncpioneer.com/blog/`
- `https://www.cncpioneer.com/custom-cnc-parts/`

Expected:

- HTTP 200.
- One H1.
- Title and meta description present.
- Canonical and `og:url` resolve to the same route.

### Archive Pagination

- `https://www.cncpioneer.com/blog/page/2/`
- `https://www.cncpioneer.com/blog/page/14/`
- `https://www.cncpioneer.com/custom-cnc-parts/page/2/`
- `https://www.cncpioneer.com/custom-cnc-parts/page/7/`

Expected:

- HTTP 200.
- Indexable.
- Present in sitemap.
- Pagination page title and description identify the page number.

### Historical Fallbacks

- `https://www.cncpioneer.com/blog/page/15/`
- `https://www.cncpioneer.com/blog/cnc-milling-parts/`
- `https://www.cncpioneer.com/blog/medical-swiss-machining/`
- `https://www.cncpioneer.com/industries/railroad-machining-services/`
- `https://www.cncpioneer.com/blog/cnc-locating-pinsi/`

Expected:

- `noindex, follow`.
- Excluded from sitemap.
- Canonical points to the replacement page.
- Browser refresh fallback points to the replacement page.

### User-Flagged Pages

- `https://www.cncpioneer.com/industries/semiconductor/`
- `https://www.cncpioneer.com/materials/nitinol-cnc-machining/`
- `https://www.cncpioneer.com/materials/kovar-cnc-machining/`
- `https://www.cncpioneer.com/materials/invar-cnc-machining/`
- `https://www.cncpioneer.com/custom-cnc-parts/5-axis-cnc-machining-aerospace-components/`
- `https://www.cncpioneer.com/custom-cnc-parts/aluminium-alloy-cnc-turning-bushing/`

Expected:

- Header renders correctly on desktop and mobile.
- Dropdown interactions do not cover or misalign page content.
- FAQ/TOC interactions work where present.
- SEO tags pass the same rules as T14.

## Local Comparison Commands

Before or after deployment, regenerate local acceptance artifacts with:

```bash
npm run build
npm run audit:acceptance
npm run manifest:dist
```

Use `seo-migration/reports/T19-dist-route-manifest.csv` as the local reference list for page-level SEO values.
