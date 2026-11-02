# T23 WordPress Runtime Cleanup Verification

Status: pass
Date: 2026-10-12

## Scope

Verified the cleanup requested after reviewing `/services/cnc-turning-and-milling/`, where WordPress, Elementor, WP Rocket, Site Kit, and other plugin runtime scripts remained in mirrored HTML.

## What Was Found

The issue was real and was not limited to one page. The mirrored source still contained WordPress runtime JavaScript and lazy-load attributes across hundreds of pages.

Examples included:

- `elementorFrontendConfig`
- `ElementorProFrontendConfig`
- `wp-admin/admin-ajax.php`
- `wp-json`
- Google Site Kit runtime scripts
- WP Rocket runtime scripts
- `rocket_beacon_data`
- `speculationrules`
- `data-lazy-src`
- `rocket-lazyload`

## Cleanup Applied

Added `scripts/t22-clean-wp-runtime-scripts.mjs` and wired it into `npm run build`.

Initial cleanup actions included:

- Files changed: 351
- Total first-pass cleanup actions: 16005
- Lazy images promoted to real `src`: 3711
- WordPress/plugin script tags removed: 1216
- WordPress `wp-includes` script tags removed: 702
- Runtime config script blocks removed: 3855
- WP Rocket / WordPress generator traces removed.

Follow-up cleanup included:

- `rocket_beacon_data` blocks removed: 163
- Lazy iframe sources promoted: 28
- Lazy background images promoted: 84
- Remaining lazy attributes removed: 112

## What Was Intentionally Kept

Elementor DOM classes and page-level CSS were kept because the mirrored pages still rely on them for layout and visual parity.

## Verification

Checked the specific page:

- `src/mirrored-pages/services/cnc-turning-and-milling/index.html`
- `dist/services/cnc-turning-and-milling/index.html`

Result:

- WordPress/plugin runtime matches: 0
- Lazy-load attribute matches: 0
- Remaining script on the dist page: `/mirror-header-controls.js`, the local static header interaction script.

Checked all generated HTML in `dist`:

- WordPress/plugin runtime matches: 0

## Release Verification

`npm.cmd run release:verify` completed successfully after cleanup.

```json
{
  "checks": 7,
  "passing": 7,
  "failing": 0,
  "status": "pass"
}
```

Manifest result:

```json
{
  "routes": 404,
  "indexable": 389,
  "noindex": 15,
  "inSitemap": 389
}
```

## Related Files

- `scripts/t22-clean-wp-runtime-scripts.mjs`
- `seo-migration/reports/T22-wp-runtime-cleanup-report.md`
- `seo-migration/reports/T12-final-acceptance-audit.md`
