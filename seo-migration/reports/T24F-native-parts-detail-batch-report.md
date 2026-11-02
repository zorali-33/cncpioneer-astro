# T24F Native Custom CNC Parts Detail Batch Report

Date: 2026-10-12

## Scope

- Migrated 155 English `/custom-cnc-parts/[slug]/` product detail pages from mirrored WordPress/Elementor HTML into native Astro rendering.
- Kept `/custom-cnc-parts/` as the existing aggregate/listing experience.
- Used `src/parts-archive.mjs` as the source of truth for corrected product titles and product images, including the manual overrides requested during QA.

## Files Changed

- `src/pages/custom-cnc-parts/[slug].astro`
- `src/components/native/PartPage.astro`
- `src/components/native/FaqList.astro`
- `src/data/nativeParts.mjs`
- `scripts/t24-generate-native-parts.mjs`
- `src/layouts/BaseLayout.astro`

## Migration Notes

- Product detail pages now render through native Astro components instead of shipping mirrored Elementor DOM and plugin runtime scripts.
- Product metadata is generated from mirrored local pages plus the corrected archive data in `src/parts-archive.mjs`.
- SEO titles are guarded to 30-60 characters.
- SEO descriptions are guarded to 120-155 characters.
- FAQs render through the shared native FAQ component.
- Related product cards use native data and preserve the corrected product image/title overrides.

## Key QA Overrides Preserved

- `5-axis-cnc-machining-mechanical-parts`
  - Title: `Mechanical Parts`
  - Image: `/wp-content/uploads/2026/09/5-axis-cnc-machined-mechanical-components.jpg`
- `5-axis-aluminum-cnc-machining-parts`
  - Title: `Aluminum Parts`
  - Image: `/wp-content/uploads/2026/08/5-axis-aluminum-aerospace-structural-fitting.jpg`
- `5-axis-cnc-machining-for-aluminum-structures`
  - Title: `Aluminum Structures`
  - Image: `/wp-content/uploads/2026/09/custom-cnc-5-axis-machining-for-aluminum-structures.jpg`
- `5-axis-cnc-machining-aerospace-components`
  - Title: `Aerospace Components`
  - Image: `/wp-content/uploads/2026/09/aerospace-structural-brackets-fittings.jpg`
- `aluminum-alloy-5-axis-cnc-machining`
  - Title: `Aluminum Alloy 5-Axis CNC Machining`
  - Image: `/wp-content/uploads/2026/09/aluminum-alloy-5-axis-cnc-machined-components.jpg`
- `aluminum-cnc-turning-parts`
  - Title: `Precision Aluminum CNC Turning Parts`
  - Image: `/wp-content/uploads/2026/08/hex-square-aluminum-turning-standoffs.jpg`
- `cnc-turning-precision-washers`
  - Title: `CNC Turning Precision Washers`
- `titanium-swiss-screw-machined-parts`
  - Image: `/wp-content/uploads/2026/09/titanium-swiss-screw-parts-cutout.png`

## Verification

- `npm.cmd run release:verify`: PASS
  - checks: 7
  - passing: 7
  - failing: 0
- Dist route manifest:
  - routes: 404
  - indexable: 390
  - noindex: 14
  - inSitemap: 390
- Product detail residual runtime scan:
  - pages scanned: 155
  - Elementor / WordPress admin / Site Kit / plugin runtime signature hits: 0

## Template QA Follow-Up

- Rechecked `/custom-cnc-parts/spring-loaded-test-pins/` against the original product-template HTML supplied during QA.
- Updated the native product detail component to use the original product-template section model and class names, including:
  - `hero`
  - `hero-image-wrap`
  - `section-overview`
  - `why-cards`
  - `portfolio-grid`
  - `section-materials`
  - `section-surface`
  - `section-quality`
  - `faq-accordion`
- Restored the original product-template hero image behavior for this page:
  - `/wp-content/uploads/2026/09/spring-loaded-test-pins-machining.jpg`
- Kept SEO metadata present and indexable:
  - title: `Spring Loaded Test Pins - CNCPioneer`
  - canonical: `/custom-cnc-parts/spring-loaded-test-pins`
  - meta description rewritten to a complete 120-155 character sentence.
- Re-ran `npm.cmd run release:verify`: PASS.
- Re-ran product detail residual runtime scan:
  - pages scanned: 155
  - Elementor / WordPress admin / Site Kit / plugin runtime signature hits: 0

## Second Visual QA Follow-Up

- Rechecked `/custom-cnc-parts/spring-loaded-test-pins/` against the supplied full-page screenshots.
- Corrected remaining product-template mismatches:
  - Overview section restored to original left-image / right-text ordering.
  - Portfolio section restored to the three product cards: pogo pin plungers, pogo pin barrels, spring probe test pins.
  - Applications section restored to the three application cards: automotive, semiconductor, aerospace.
  - Materials section reduced to the original three-card view for this page.
  - Spring Loaded Test Pins page no longer renders the Related Custom CNC Parts block after FAQ, matching the latest supplied reference screenshot.
  - Final CTA restored to the original `cta-final` style with blue-green background and white/outline buttons.
- `npm.cmd run build`: PASS.
- `npm.cmd run release:verify`: PASS.
  - checks: 7
  - passing: 7
  - failing: 0
  - routes: 404
  - indexable: 390
  - noindex: 14
  - inSitemap: 390

## Expected Build Warnings

Astro reports route-match warnings because the new native route `/custom-cnc-parts/[slug].astro` intentionally takes precedence over the broad mirrored catch-all route. This is expected for this migration batch.
