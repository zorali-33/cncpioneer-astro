# T24D Native Materials Batch Report

Date: 2026-10-12

## Scope

Converted the shared-template materials pages from mirrored WordPress / Elementor HTML into native Astro using a data-driven dynamic route.

Native route:

- `src/pages/materials/[slug].astro`

Generated source data:

- `src/data/nativeMaterials.mjs`

Extraction script:

- `scripts/t24-generate-native-materials.mjs`

## Coverage

The script extracted and generated native data for 38 material detail pages:

- `6061-aluminum-cnc-machining`
- `6061-t6-aluminum-cnc-machining`
- `abs-cnc-machining`
- `acrylic-cnc-machining`
- `alloy-steel-cnc-machining`
- `aluminum-cnc-machining`
- `aluminum-cnc-turning-and-milling`
- `aluminum-swiss-machining`
- `brass-cnc-machining`
- `brass-swiss-machining`
- `bronze-cnc-machining`
- `carbon-steel-cnc-machining`
- `copper-cnc-machining`
- `hdpe-cnc-machining`
- `inconel-600-cnc-machining`
- `inconel-625-cnc-machining`
- `inconel-718-cnc-machining`
- `inconel-cnc-machining`
- `invar-cnc-machining`
- `kovar-cnc-machining`
- `magnesium-cnc-machining`
- `nickel-swiss-machining`
- `nitinol-cnc-machining`
- `nylon-66-cnc-machining`
- `nylon-cnc-machining`
- `peek-cnc-machining`
- `peek-cnc-turning-and-milling`
- `peek-swiss-machining`
- `polycarbonate-cnc-machining`
- `polypropylene-cnc-machining`
- `pom-cnc-machining`
- `ptfe-cnc-machining`
- `stainless-steel-cnc-machining`
- `stainless-steel-cnc-turning-and-milling`
- `stainless-steel-swiss-machining`
- `titanium-cnc-machining`
- `titanium-swiss-machining`
- `ultem-cnc-machining`

The special page `/materials/metal-cnc-machining` remains on the mirrored catch-all route for later single-page migration.

## Data Quality Checks

- Pages generated: 38
- Missing required data: 0
- CSS / Elementor selector text mixed into generated data: 0
- Native material dist pages scanned for legacy runtime signatures: 0 matches

Scanned signatures:

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

## Validation

- `npm.cmd run build`: pass
- `npm.cmd run release:verify`: pass
- Acceptance audit: 7/7 passing
- Dist route manifest:
  - routes: 404
  - indexable: 389
  - noindex: 15
  - inSitemap: 389

## Notes

Build route-conflict warnings are expected. They confirm the native `/materials/[slug]` route intentionally overrides mirrored catch-all pages for these material URLs.
