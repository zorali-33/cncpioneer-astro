# T24A Native Services Pilot Report

Status: pass
Date: 2026-10-12

## Scope

Implemented the first native Astro rewrite pilot for:

- `/services/cnc-turning-and-milling`

This page now uses a dedicated Astro route instead of the mirrored catch-all HTML route.

## Files Added

- `src/layouts/BaseLayout.astro`
- `src/components/native/SeoHead.astro`
- `src/components/native/SiteHeader.astro`
- `src/components/native/SiteFooter.astro`
- `src/components/native/PageHero.astro`
- `src/pages/services/cnc-turning-and-milling.astro`

## What Changed

- Rebuilt the page with native Astro components.
- Removed page dependency on Elementor DOM classes.
- Removed page dependency on Elementor page CSS.
- Replaced mirrored WordPress header/footer markup with native header/footer components.
- Preserved the existing SEO title, meta description, canonical route, robots value, OG image, H1, main section headings, CTA text, core content, and image assets.
- Kept only a small native header interaction script for mobile menu and submenu toggles.

## Source Content Preserved

Main page sections preserved:

- Hero with breadcrumbs and CTA
- Available Materials for CNC Turning and Milling
- Advantages of CNC Turning and Milling
- Industries We Serve with CNC Turning and Milling
- Why Choose CNCPioneer?
- Questions / Contact CTA
- Footer navigation and contact details

## Build Result

`npm.cmd run build` passed.

Astro confirmed the intended route override:

- `/services/cnc-turning-and-milling` from `/[...slug]` conflicts with higher priority route `/services/cnc-turning-and-milling`

This is expected and confirms the native page is taking priority over the mirrored page.

## Page-Level Cleanup Verification

Checked generated file:

- `dist/services/cnc-turning-and-milling/index.html`

Forbidden runtime and mirrored-DOM signatures found:

- `elementor-`: 0
- `data-elementor-type`: 0
- `data-widget_type`: 0
- `wp-admin`: 0
- `wp-json`: 0
- `googlesitekit`: 0
- `elementorFrontendConfig`: 0
- `ElementorProFrontendConfig`: 0
- `rocket_beacon_data`: 0
- `data-lazy-src`: 0
- `wp-content/plugins`: 0
- `wp-includes`: 0

## Release Verification

`npm.cmd run release:verify` passed.

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

## Assessment

The pilot proves the migration path is workable:

1. A mirrored page can be replaced by a dedicated native Astro route.
2. SEO and route counts can remain stable.
3. Elementor and WordPress runtime dependencies can be removed at the page level.
4. Shared components can now be reused for the rest of the services group.

## Next Recommended Step

Proceed with the remaining services pages:

- `/services`
- `/services/swiss-machining`
- `/services/swiss-machining/swiss-micro-machining`
- `/services/swiss-machining/swiss-screw-machining`

After the full services group is native, move to the materials template group.
