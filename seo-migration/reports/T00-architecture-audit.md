# T00 Architecture Audit

Status: complete with follow-up risks
Date: 2026-10-10
Project root: `C:\Users\HP\Documents\Codex\2026-09-28\dom-css-1-1\outputs\cncpioneer-astro`

## Scope

This audit checks the local Astro migration structure before continuing the full CNCPioneer SEO and 1:1 migration plan. It is based on local source inspection only. No production site, DNS, hosting, or deployment settings were changed.

## Current Architecture

- The local site is an Astro static project. `astro.config.mjs` sets `output: "static"`.
- The project is mostly a WordPress/Elementor mirror:
  - Raw mirrored HTML is stored in `src/mirrored-pages/**/index.html`.
  - Route inventory is stored in `src/mirrored-pages/manifest.json`.
  - Generic mirrored routes are served by `src/pages/[...slug].astro`.
  - The home page is served by `src/pages/index.astro`.
- Dynamic/generated archive routes also exist:
  - `src/pages/blog/page/[page].astro`
  - `src/pages/author/[author]/page/[page].astro`
  - `src/pages/custom-cnc-parts.astro`
  - `src/pages/custom-cnc-parts/page/[page].astro`
- Build output recently generated 389 pages. This is more than the mirrored manifest count because archive and pagination routes are generated in addition to mirrored pages.

## Page Counts

- `src/mirrored-pages/manifest.json`: 350 mirrored routes.
- Manifest top-level distribution:
  - `custom-cnc-parts`: 156
  - `blog`: 121
  - `materials`: 40
  - `industries`: 22
  - `services`: 5
  - `author`: 2
  - `resources`: 2
  - `about-us`: 1
  - `cnc-machining-quote`: 1
- `网站页面.xlsx` comparison from the plan review:
  - English sitemap sheet: 351 URLs including header, so 350 data URLs if the header is excluded, or 351 rows total depending on counting method.
  - English unindexed sheet: 150 rows including header, so 149 data URLs.
  - All-language unindexed sheet: 1001 rows including header, so 1000 data URLs.

The SOP's "102 unindexed" number should be treated as historical or partial unless a newer source proves it. The current working number from the supplied workbook is 149 English unindexed URLs.

## Source Of Truth

Current source of truth is mixed:

- Mirrored page body/head content: `src/mirrored-pages/**/index.html`
- Route availability: `src/mirrored-pages/manifest.json`
- Blog archive behavior: `src/blog-archive.mjs`
- Author archive behavior: `src/author-archive.mjs`
- Custom CNC parts archive behavior: `src/parts-archive.mjs`
- Runtime/header/interaction fixes: files under `public/mirror-*.css` and `public/mirror-*.js`
- Import/update pipeline for new mirrored pages: `scripts/import-pages.mjs`

There is no single centralized SEO metadata model yet. Most SEO fixes are currently written directly into mirrored HTML, while generated archive pages modify metadata at render time.

## Build Scripts

`package.json` scripts:

- `dev`: `node ./scripts/astro-env.mjs dev`
- `build`: `node ./scripts/repair-elementor-css.mjs && node ./scripts/remove-gtranslate.mjs && node ./scripts/astro-env.mjs build`
- `preview`: `node ./scripts/astro-env.mjs preview`
- `localize:cache`: `node ./scripts/localize-cache-assets.mjs`
- `repair:css`: `node ./scripts/repair-elementor-css.mjs`
- `clean:gtranslate`: `node ./scripts/remove-gtranslate.mjs`

Important risk: the current `build` command is not purely read-only. It runs scripts that can write back into `src/mirrored-pages` before building.

## Import And Asset Pipeline

`scripts/import-pages.mjs` is the main import tool for production URLs. It:

- Fetches pages from `https://www.cncpioneer.com`.
- Rejects URLs outside the same origin.
- Rejects slugs that already exist locally.
- Copies same-site `wp-content` and `wp-includes` assets into `public`.
- Rewrites `https://www.cncpioneer.com/...` asset URLs to local relative paths.
- Updates `src/mirrored-pages/manifest.json`.
- Adds selected Elementor JavaScript chunks for specific widget types.

`scripts/localize-cache-assets.mjs` copies minified WordPress cache CSS/scripts from `../cncpioneer-static-clean/wp-content/cache/min/1` into `public/wp-content/cache/min/1` and rewrites mirrored HTML cache URLs. It currently has a small hard-coded page-to-script map for two custom CNC part pages.

## Header And Interaction Injection

`src/mirror-html.mjs` injects compatibility assets into mirrored HTML:

- `/mirror-header-dropdown.css`
- `/mirror-header-controls.js`
- `/mirror-elementor-interactions.js`
- Conditional table of contents, related posts, blog archive, trusted carousel, and factory carousel assets.

Special case: `src/pages/[...slug].astro` currently bypasses `withHeaderControls(html)` for `industries/semiconductor/index.html`. This likely came from a previous 1:1 reproduction requirement, but it should be explicitly tracked because it means that page does not receive the same header/control patches as other mirrored pages.

## SEO Ownership

SEO metadata is split across three mechanisms:

- Mirrored pages keep original HTML `<head>` tags, edited directly by local fix scripts.
- Blog and author archives update titles, descriptions, canonical, Open Graph, and pagination metadata in `src/blog-archive.mjs` and `src/author-archive.mjs`.
- Custom CNC parts archive updates title, description, canonical, Open Graph, and pagination metadata in `src/parts-archive.mjs`.

Recent local SEO scripts already created for CSV fixes:

- `scripts/fix-meta-descriptions-from-csv.mjs`
- `scripts/check-meta-descriptions-from-csv.mjs`
- `scripts/fix-long-meta-descriptions-from-csv.mjs`
- `scripts/check-long-meta-descriptions-from-csv.mjs`
- `scripts/fix-short-meta-descriptions-from-csv.mjs`
- `scripts/check-short-meta-descriptions-from-csv.mjs`
- `scripts/fix-title-tags-from-csv.mjs`
- `scripts/check-title-tags-from-csv.mjs`
- `scripts/fix-changed-meta-descriptions-from-csv.mjs`

These scripts are useful for the current cleanup, but they should be treated as migration utilities, not the final long-term SEO architecture.

## Deployment And Indexing Files

Not found in the local project root during this audit:

- `.openai/hosting.json`
- `netlify.toml`
- `vercel.json`
- `public/robots.txt`
- `public/sitemap.xml`
- `src/pages/sitemap.xml.js`
- `src/pages/robots.txt.js`

This means sitemap/robots generation and deployment ownership are unresolved in the local source. This should be addressed before any release gate.

## Forms, Analytics, And Third-Party Scripts

A scoped search outside mirrored WordPress assets did not find native local integrations for:

- WPForms/gravity/contact form handlers
- Google Analytics or Tag Manager wrappers
- reCAPTCHA/Turnstile wrappers

This does not prove the mirrored HTML contains none; it only means no clean local Astro integration was found outside `src/mirrored-pages`, `public/wp-content`, and `public/wp-includes`. A later task should audit third-party scripts page-by-page before production release.

## Git Status

Running `git status` from the project root failed because this local project root is not detected as a Git repository. Change tracking may be outside this folder, missing, or managed by the Codex workspace rather than local Git.

This is a release risk because large SEO/content migrations need a clear rollback mechanism.

## Key Risks

1. Build-time source mutation: `npm run build` runs scripts that can rewrite mirrored HTML.
2. SEO metadata is not centralized, so future CSV fixes can drift from generated archive metadata.
3. `industries/semiconductor` bypasses normal header/control injection.
4. No local sitemap/robots implementation was found.
5. Deployment ownership is unclear from the local source.
6. The SOP count of 102 unindexed URLs does not match the supplied workbook's 149 English unindexed data URLs.
7. Local project root is not a Git repository, so rollback/review discipline needs a replacement mechanism.

## Recommended Next Step

Proceed to T01/T02 baseline inventory before more page-by-page fixes:

1. Generate a local route inventory from `manifest.json`, generated archive paths, and `dist` after build.
2. Compare that inventory against `网站页面.xlsx`, the Ahrefs issue CSVs, and current local generated routes.
3. Produce one discrepancy table with columns: source URL, local route, route type, status, issue source, priority, and owner script/file.

Only after that should T03 DOM/CSS/JS extraction and T14 SEO cleanup continue, otherwise fixes may keep landing in the wrong layer.

