# T17 Dist Smoke Check

Status: pass
Date: 2026-10-10

## Scope

Performed a direct smoke check against the generated `dist` output after the final acceptance pass.

## Files Checked

- `dist/robots.txt`: exists
- `dist/sitemap.xml`: exists
- `dist/industries/semiconductor/index.html`: exists
- `dist/custom-cnc-parts/index.html`: exists
- `dist/custom-cnc-parts/page/2/index.html`: exists
- `dist/blog/page/15/index.html`: exists as noindex historical fallback

## Page Spot Checks

### Semiconductor

- Title: `Semiconductor CNC Machining | CNCPioneer`
- Meta description: present
- Canonical: `/industries/semiconductor`
- `og:url`: `/industries/semiconductor`
- H1 count: one visible H1 retained
- Former duplicate H1 section was demoted to H2

### Custom CNC Parts Archive

- `/custom-cnc-parts/` has title, meta description, canonical, og:url, and H1.
- `/custom-cnc-parts/page/2/` has title, meta description, canonical, og:url, and H1.

### Historical Blog Pagination

- `/blog/page/15/` is `noindex, follow`
- Canonical points to `/blog/page/14`
- Refresh fallback points to `/blog/page/14`

## Sitemap Spot Check

Included indexable URLs:

- `https://www.cncpioneer.com/custom-cnc-parts/page/2/`
- `https://www.cncpioneer.com/industries/semiconductor/`

Excluded noindex historical fallback examples:

- `/blog/page/15/`
- `/blog/cnc-milling-parts/`
- `/blog/medical-swiss-machining/`
- `/industries/railroad-machining-services/`
- `/blog/cnc-locating-pinsi/`

## Result

The generated dist output matches the final acceptance reports and is ready for the next deployment/review step.
