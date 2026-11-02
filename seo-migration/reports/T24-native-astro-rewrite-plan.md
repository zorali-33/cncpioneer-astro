# T24 Native Astro Rewrite Plan

Status: planning
Date: 2026-10-12

## Goal

Rewrite the remaining mirrored WordPress / Elementor pages into maintainable native Astro templates while preserving the current public layout, visual design, interactions, indexing state, canonical URLs, title tags, meta descriptions, and internal links.

This is a second-stage migration. The first-stage cleanup already removed WordPress / plugin runtime scripts from generated HTML. T24 focuses on replacing Elementor-dependent DOM and CSS with native Astro components.

## Current Audit

### Route Counts

- Dist HTML routes: 404
- Indexable routes: 389
- Noindex fallback routes: 15
- Mirrored source `index.html` files: 366
- Mirrored files still containing Elementor class-based markup: 351
- Mirrored files still containing removed WordPress / plugin runtime signatures: 0

### Mirrored Source Groups

| Group | Mirrored pages | Notes |
| --- | ---: | --- |
| `custom-cnc-parts` | 156 | Largest product-like section. Needs card/archive templates plus detail templates. |
| `blog` | 135 | Content-heavy pages. Needs article template, TOC, related posts, pagination. |
| `materials` | 40 | Similar landing/detail pattern. Header/hero has had repeated layout issues. |
| `industries` | 23 | Similar detail pattern. Semiconductor requires original-page parity check. |
| `services` | 5 | Smallest and best pilot group. |
| `author` | 2 | Low priority, likely simple archive pages. |
| `resources` | 2 | Low volume, inspect before template choice. |
| Root/home | 1 | High visual risk because of hero video and homepage sections. |
| `about-us` | 1 | Carousel/trusted/factory interactions need native handling. |
| `cnc-machining-quote` | 1 | Form/CTA page, needs careful interaction and SEO check. |

## Key Assessment

The site is currently clean enough to ship from a runtime perspective: generated HTML no longer calls Site Kit, WordPress admin bar code, Elementor frontend runtime, WP Rocket runtime, `wp-json`, or `wp-admin` scripts.

However, it is not yet a true native Astro implementation. Most mirrored pages still use Elementor DOM class names and page-level CSS for layout. Removing all Elementor classes and CSS in one pass would break the design, especially responsive headers, hero sections, product cards, blog TOC, related posts, and carousel sections.

The correct approach is template-by-template replacement:

1. Preserve the current page as visual baseline.
2. Extract structured content and assets.
3. Rebuild the page using native Astro components.
4. Compare visual output and SEO output.
5. Only then remove the old Elementor DOM/CSS for that page family.

## Non-Negotiable Rules

- Do not reintroduce WordPress, Site Kit, admin bar, Elementor runtime, WP Rocket, or backend/editor scripts.
- Do not change URLs unless an existing redirect/noindex fallback already covers the route.
- Do not change index/noindex status without an explicit SEO reason.
- Keep title tags roughly 30-60 characters where possible.
- Keep meta descriptions roughly 120-160 characters where possible.
- Preserve canonical URLs.
- Preserve H1/H2 hierarchy.
- Preserve visible content, CTA text, breadcrumbs, images, and internal links unless replacing a wrong image/title already identified by the user.
- Validate desktop and mobile views before marking a template complete.

## Recommended Execution Order

### Phase 1: Native Foundation

Build shared Astro infrastructure before touching all pages.

Deliverables:

- `BaseLayout.astro`
- `SeoHead.astro`
- `SiteHeader.astro`
- `SiteFooter.astro`
- `Breadcrumbs.astro`
- `Hero.astro`
- `CTAButton.astro`
- `ResponsiveImage.astro`
- `FaqAccordion.astro`
- `Pagination.astro`
- `RelatedCards.astro`

Reasoning:

Most visual bugs reported so far came from repeated header, dropdown, hero, pagination, FAQ, related-card, and carousel behavior. These should become shared components first, otherwise the same issue will be fixed many times.

Acceptance:

- Header desktop/mobile dropdown works without Elementor selectors.
- Footer layout matches current site.
- No external WordPress/plugin scripts.
- Shared SEO component outputs valid title, description, canonical, robots, Open Graph where available.

### Phase 2: Pilot Rewrite, Services Group

Start with the smallest representative group:

- `/services/cnc-turning-and-milling`
- `/services/swiss-machining`
- `/services`
- Remaining service pages in the 5-page group.

Reasoning:

Services has low page count but includes common sections: header, hero, breadcrumbs, two-column content, CTA, FAQ, footer. It is the safest place to prove the native template before scaling.

Acceptance:

- Native Astro route renders instead of mirrored HTML.
- Layout visually matches current page at desktop and mobile widths.
- SEO title/meta/canonical are unchanged or improved within agreed limits.
- `npm.cmd run release:verify` passes.
- Dist HTML for these pages has zero `elementor-`, `wp-admin`, `wp-json`, `googlesitekit`, `elementorFrontendConfig`, and `rocket_beacon_data`.

### Phase 3: Materials Detail Template

Rewrite the 40 material pages.

Priority examples based on previously reported header issues:

- `/materials/nitinol-cnc-machining`
- `/materials/kovar-cnc-machining`
- `/materials/invar-cnc-machining`
- `/materials/stainless-steel-cnc-machining`

Reasoning:

These pages share a repeated hero/detail structure and have already shown header/hero layout drift. A native material detail template should remove that whole class of bugs.

Acceptance:

- Header no longer overlays the hero incorrectly.
- Hero title, breadcrumb, background image, CTA, and intro copy match current intended design.
- Internal links and canonical URLs preserved.
- All 40 material pages generated from structured data.

### Phase 4: Industries Detail Template

Rewrite the 23 industry pages.

Priority:

- `/industries/semiconductor`
- Other industry detail pages after template parity is confirmed.

Reasoning:

The semiconductor page was explicitly flagged as not being a 1:1 migration. It should be used as the representative parity target.

Acceptance:

- Semiconductor page matches original content, layout, DOM intent, CSS behavior, and animation behavior where the animation is user-visible.
- Native implementation does not depend on Elementor classes or scripts.
- Other industry pages reuse the same data/template structure.

### Phase 5: Custom CNC Parts Archive + Product Detail Pages

Rewrite the `custom-cnc-parts` section.

Scope:

- 156 mirrored detail pages.
- `/custom-cnc-parts` aggregate page.
- `/custom-cnc-parts/page/{n}` pagination.

Reasoning:

This is the largest commercial section. It should be handled only after shared cards, pagination, image mapping, and title normalization are stable. Many previous corrections were about wrong product images and overly long product titles.

Specific requirements:

- Product cards must use product images, not machining process images or application images.
- Card title should keep the product name only, except explicitly restored titles such as `CNC Turning Precision Washers`.
- Pagination must not produce runtime errors.
- Product archive page should be a real aggregate page with pagination.

Acceptance:

- Product image map reviewed page by page.
- Archive pagination works for every generated page.
- No wrong image classes already reported by the user.
- All product detail pages preserve canonical URL and SEO tags.

### Phase 6: Blog Article + Blog Archive Templates

Rewrite:

- 135 blog pages.
- `/blog`
- `/blog/page/{n}`
- Related posts component.
- TOC component.

Reasoning:

Blog pages have the highest Elementor markup density in the audit, often above 3,400 Elementor class occurrences per page. They are content-heavy and need careful article extraction rather than a quick visual rewrite.

Acceptance:

- TOC loads instantly and does not show a spinner.
- Related posts cards have stable image ratio and readable spacing.
- Pagination links resolve correctly.
- Article schema/SEO remains valid if currently present.
- No Elementor runtime or Elementor DOM remains in rewritten article pages.

### Phase 7: Homepage, About, Quote, Resources, Author

Rewrite the remaining special pages:

- `/`
- `/about-us`
- `/cnc-machining-quote`
- `/resources/*`
- `/author/*`

Reasoning:

These pages have unique interactions: homepage video, about-page carousels/trusted logos, quote forms, and archive-like layouts. They should come after repeated templates are stable.

Acceptance:

- Homepage hero video renders on desktop and mobile.
- About factory/trusted sections interact cleanly.
- Quote CTA/form remains usable.
- Author/resources pages retain index/noindex status and internal links.

## Verification Plan

Each phase must run:

```powershell
npm.cmd run release:verify
```

Additional checks per rewritten template:

- Search generated HTML for forbidden runtime strings:
  - `elementorFrontendConfig`
  - `ElementorProFrontendConfig`
  - `googlesitekit`
  - `wp-admin`
  - `wp-json`
  - `rocket_beacon_data`
  - `data-lazy-src`
- For native-complete pages, also check for:
  - `elementor-`
  - `data-elementor-type`
  - `data-widget_type`
- Compare title, meta description, canonical, robots, H1, and sitemap inclusion.
- Check desktop and mobile screenshots for layout drift.
- Check interactive components manually or via browser automation where available.

## Suggested Milestones

| Milestone | Scope | Expected outcome |
| --- | --- | --- |
| T24A | Component foundation + services pilot | Prove native Astro replacement without layout loss. |
| T24B | All services + materials | Remove Elementor dependency from 45 pages. |
| T24C | Industries | Remove Elementor dependency from 23 pages and fix semiconductor parity. |
| T24D | Custom parts archive + first 20 detail pages | Lock product card/image/title rules. |
| T24E | Remaining custom parts | Complete 156-page product section. |
| T24F | Blog archive + first 20 articles | Lock TOC/related/pagination behavior. |
| T24G | Remaining blog articles | Complete 135 blog pages. |
| T24H | Homepage/about/quote/resources/author | Complete special pages. |

## Risk Assessment

Highest risk:

- Blog articles, because of content volume and dense Elementor structure.
- Custom parts, because image/title correctness matters commercially and has already produced visible errors.
- Homepage/about, because of video and carousel interactions.

Medium risk:

- Materials and industries, because the templates are repetitive but header/hero alignment has been fragile.

Lowest risk:

- Services, resources, author pages.

## Recommendation

Start with T24A, not with all 351 pages at once.

The first concrete implementation should be `/services/cnc-turning-and-milling` as a native Astro pilot. After it passes visual and SEO checks, use the same component pattern for the rest of the services group, then proceed to materials and industries.

This keeps the migration controlled: every batch removes real Elementor dependency while protecting the existing design, layout, and SEO.
