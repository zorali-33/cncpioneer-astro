# T24E Native Astro Industry Pages

Date: 2026-10-12

## Scope

Converted the English industry page group from mirrored WordPress/Elementor output to native Astro rendering.

## Pages Converted

- 22 industry routes now render through `src/pages/industries/[slug].astro`.
- The batch includes `/industries/semiconductor`, plus aerospace, automotive, defense, medical, oil & gas, railway, robotics, satellite, server, and related Swiss machining industry pages.

## Implementation

- Added `src/components/native/IndustryPage.astro`.
- Added `src/pages/industries/[slug].astro`.
- Added `scripts/t24-generate-native-industries.mjs`.
- Generated `src/data/nativeIndustries.mjs` from the mirrored industry pages.

## Data Guardrails

- Source extraction is limited to `<main id="content">` to avoid header/footer/menu contamination.
- Text extraction strips scripts/styles and filters contact, footer, menu, Elementor, and WordPress plugin noise.
- Long Elementor-composed headings are normalized for cleaner native rendering.
- SEO descriptions are normalized to stay within the current audit range.

## Validation

- `npm.cmd run release:verify`: PASS
- Acceptance audit: 7 checks passing, 0 failing.
- Dist manifest summary from release verification:
  - routes: 404
  - indexable: 390
  - noindex: 14
  - inSitemap: 390
- Industry page plugin/runtime signature scan:
  - pages scanned: 22
  - matches: 0

## Notes

- Astro route priority warnings for `/industries/[slug]`, `/materials/[slug]`, and native service routes are expected because native routes intentionally override mirrored catch-all output.
- `/industries/railroad-machining-services` is retained as a native historical URL page with SEO description length corrected for the audit threshold.
