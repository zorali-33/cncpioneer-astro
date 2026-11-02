# T16 Handoff Checklist

Status: ready
Date: 2026-10-10

## Acceptance Commands

Run these from the Astro project root:

```bash
npm run build
npm run audit:acceptance
npm run manifest:dist
npm run release:verify
```

Expected acceptance output:

```json
{
  "checks": 7,
  "passing": 7,
  "failing": 0,
  "status": "pass"
}
```

## Project Root

`C:\Users\HP\Documents\Codex\2026-09-28\dom-css-1-1\outputs\cncpioneer-astro`

## Final Status Reports

- `seo-migration/reports/T12-final-acceptance-audit.md`
- `seo-migration/reports/T14-dist-seo-integrity-audit.md`
- `seo-migration/reports/T15-final-delivery-summary.md`
- `seo-migration/reports/T17-dist-smoke-check.md`
- `seo-migration/reports/T18-dist-release-fingerprint.md`
- `seo-migration/reports/T19-dist-route-manifest.csv`
- `seo-migration/reports/T20-post-deploy-url-checklist.md`
- `seo-migration/reports/T21-release-verify-result.md`
- `seo-migration/reports/T22-wp-runtime-cleanup-report.md`
- `seo-migration/reports/T23-wp-runtime-cleanup-verification.md`

## Key Scripts Added For Ongoing QA

- `scripts/t04-p1-current-seo-audit.py`
- `scripts/t06-audit-generated-pagination.mjs`
- `scripts/t08-audit-p2-link-technical.mjs`
- `scripts/t10-audit-p2-p3-closure.mjs`
- `scripts/t11-generate-robots-sitemap.mjs`
- `scripts/t12-final-acceptance-audit.mjs`
- `scripts/t13-dist-internal-link-audit.mjs`
- `scripts/t14-dist-seo-integrity-audit.mjs`
- `scripts/t19-generate-dist-route-manifest.mjs`
- `scripts/t22-clean-wp-runtime-scripts.mjs`

## Build Pipeline

The `npm run build` command now performs:

1. Elementor CSS repair.
2. GTranslate UI cleanup.
3. WordPress head resource cleanup.
4. Astro static build.
5. robots.txt and sitemap.xml generation.

## Current Known Build Note

Astro logs a route priority warning for `/custom-cnc-parts`. This is accepted because the dedicated generated route renders that page and the final acceptance audit passes.

## English-Only Boundary

The current remediation scope is English-only. The handoff scan found no `zh` hreflang or `/zh/` and `/cn/` path references in the T-series scripts or final summary.

## Do Not Treat As Current Failures

Some older intermediate CSV reports retain the original issue rows for traceability. The current pass/fail state is represented by T12 and T14 after the latest build.
