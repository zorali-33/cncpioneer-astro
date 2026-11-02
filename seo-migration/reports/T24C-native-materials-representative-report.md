# T24C Native Materials Representative Pages Report

Date: 2026-10-12

## Scope

Converted four previously mirrored material pages into native Astro routes while preserving the source SEO fields, page media, hero content, core sections, FAQ schema, and CTA structure.

- `/materials/nitinol-cnc-machining`
- `/materials/kovar-cnc-machining`
- `/materials/invar-cnc-machining`
- `/materials/stainless-steel-cnc-machining`

## Files Added

- `src/components/native/MaterialPage.astro`
- `src/pages/materials/nitinol-cnc-machining.astro`
- `src/pages/materials/kovar-cnc-machining.astro`
- `src/pages/materials/invar-cnc-machining.astro`
- `src/pages/materials/stainless-steel-cnc-machining.astro`

## Files Updated

- `src/layouts/BaseLayout.astro`
- `src/components/native/PageHero.astro`

## Validation

- `npm.cmd run build`: pass
- `npm.cmd run release:verify`: pass
- Acceptance audit: 7/7 passing
- Dist route manifest:
  - routes: 404
  - indexable: 389
  - noindex: 15
  - inSitemap: 389

## Runtime Signature Spot Check

The four converted material dist pages were scanned for the following legacy WordPress / Elementor runtime signatures:

- `elementor-`
- `data-elementor-type`
- `data-widget_type`
- `wp-admin`
- `wp-json`
- `googlesitekit`
- `elementorFrontendConfig`
- `ElementorProFrontendConfig`
- `rocket_beacon_data`
- `data-lazy-src`
- `wp-content/plugins`
- `wp-includes`

Result: 0 matches on all four converted material pages.

## Notes

Build route-conflict warnings are expected because the native Astro files intentionally override the mirrored catch-all route for these URLs.
