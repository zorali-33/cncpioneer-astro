# CNCPioneer Astro Static Build

Local source for the CNCPioneer static website. Local changes do not publish to the live WordPress site.

## Astro rendering and migrated content

The active website is built with native Astro pages and shared components. On 2026-10-27, the remaining 19 heavy blog/author archive views and the industry overview were migrated from mirrored document templates to `ArchivePage.astro` and `industries.astro`. They share the native header, footer, SEO and search. Their URLs, article order and pagination are retained; WordPress and Elementor runtime scripts, styles and APIs are not required.

Historical HTML under `src/mirrored-pages` remains a build-time content source for article bodies and metadata. Existing class names or old asset folder names in archived content do not run WordPress or Elementor. Original public assets are retained for recovery; they are not all requested by active pages. The native archives, industry overview and FAQ use a small local Latin font stylesheet instead of the former all-language, all-weight font bundle.

## Commands

```sh
npm install
npm run dev
npm run build
npm run audit:acceptance
npm run manifest:dist
npm run release:verify
```

- `build` generates static pages, robots.txt, sitemap.xml, and hosting rules without rewriting source documents.
- `audit:acceptance` checks the current rendered output: metadata, Schema, landmarks, duplicate IDs, internal links, fragments, image alt text, search-index destinations, CSS/font/JavaScript dependencies, pagination, retired-route rules, and regression tests. JSON and Markdown results are saved under `seo-migration/reports`. These are local checks; they do not validate production hosting or Google indexing.
- To check an isolated build, run `node scripts/release-acceptance.mjs <build-directory> <report-directory>` after generating its indexing assets.
- `manifest:dist` exports the current route inventory.
- `release:verify` builds and runs the current acceptance gate and route export.
- `audit:migration-history` preserves the original mirror-migration audits for historical diagnosis. They use the old migration baseline and are not the release gate.
- `repair:legacy` explicitly repairs imported historical mirror sources. Run it only when importing or maintaining those sources; normal builds do not mutate them.

## Routing and retired pages

Per the owner's current instruction, retired URLs return **404**, including slash and index.html variants. No 301 redirects or browser-refresh fallback pages are generated.

- The combined removal registry is `src/data/pageRemovals.mjs`.
- Astro middleware and the provided static server enforce the removal registry.
- Builds emit `_redirects` and Apache `.htaccess` rules. Deploy the file supported by the hosting platform; other hosts must implement the equivalent removal policy and serve the branded `404.html` with HTTP 404.
- Former redirect mappings remain as internal-link repair data in `src/data/siteUrls.mjs`. They do not authorize redirects for incoming requests.
- Removed URLs are excluded from routes, sitemap and search results. Historical mirrored HTML remains archived for recovery.

## Shared metadata and presentation

Canonical identities and internal URL normalization live in `src/data/siteUrls.mjs`. Reviewed metadata lives in `src/data/pageSeoOverrides.mjs`; the shared SEO and Schema templates apply to native and mirrored pages.

Website image assets are WebP files strictly smaller than 100,000 bytes, with descriptive lowercase English filenames. Run `npm run images:optimize` after adding images. The optimizer preserves aspect ratios and transparency, adjusts quality and resolution to meet the limit, and keeps verified originals outside public in `work/original-images-20261027`.

`src/data/imageAssets.json` maps original and intermediate image URLs to the optimized files. Shared middleware and the image integration update markup, Open Graph, JSON-LD, CSS, client data and responsive image descriptors. Normal builds do not rewrite archived source documents. Any legacy copies held open by another Windows process are excluded from the deployed output. SVG font resources are fonts; inline SVG controls remain code rather than bitmap image assets.

Image aspect ratios are read from local assets by `src/image-layout.mjs` and inserted into rendered HTML. CSS sizing and crops are preserved. No remote images are fetched at build time. Release acceptance enforces actual WebP encoding, strict byte limits, descriptive filename syntax, valid image references and the absence of repeated benefit-card text.

Page modification dates use the explicit content revision ledger `src/data/pageRevisions.json` and source dates. Build times and filesystem mtimes do not become sitemap or article modification dates.

Reviewed product heading and 17-4PH material corrections live in `src/data/productEditorialCorrections.mjs`. Confirmed spelling, duplicate-word and shared CTA punctuation fixes live in `src/data/spellingCorrections.mjs`, applied before SEO and Schema generation. Known errors are covered by release acceptance and `scripts/editorial-corrections.test.mjs`; URLs and existing article fragment IDs remain unchanged.

Reviewed publisher and standards references live in `src/data/urlCorrections.mjs`. Pinterest image parameters are rewritten through `src/image-assets.mjs`, including URL-encoded media values. Release acceptance also verifies share-image targets, known retired citations and incoming links for every indexable page with `scripts/url-integrity-audit.mjs`. External access restrictions are reported separately from confirmed 404 responses.

## Assets and backend scope

Static assets live in `public`. Search uses the generated local search index. Native and legacy header controls support the existing navigation patterns.

The quote form posts to `/api/quote.php`, a PHP SMTP handler for Hostinger. The confirmed sender and SMTP account are `zora@richonn.com.cn`; enquiries go to `info@cncpioneer.com`, with the customer's email in Reply-To. No WordPress backend is required.

Keep `.cncpioneer-mail.php` outside the public document root. It is ignored by Git and never copied into `dist`. Deployment steps and the distinction between local checks and live mail delivery are documented in [server/DEPLOYMENT.md](server/DEPLOYMENT.md).

Run `npm run test:quote-mail` with PHP 8.2+ available on PATH, or set `CNCP_PHP_BINARY` to its executable. The tests use dummy credentials and do not send email. `server/check-mail.php` separately checks the private configuration and SMTP authentication without sending a message. A passed build is not proof of SMTP login, inbox delivery or production deployment.

The Node development and static preview servers do not execute PHP. They return a clear failure response for form submission rather than serving PHP source or showing a false success. An optional loopback PHP bridge is described in the deployment guide.
