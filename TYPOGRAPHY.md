# Fixed site typography

Approved by the site owner on 2026-10-28. Apply this system to all existing and future pages. Do not introduce another font family or a component-specific heading scale without a new owner instruction.

The source of truth is `public/brand-theme.css`. `src/site-typography.mjs` normalizes retained scoped and inline styles in development and production. The PostCSS plugin in `astro.config.mjs` applies it to compiled component stylesheets; `src/brand-palette.mjs` covers rendered HTML styles. The release typography audit checks every generated page and its loaded stylesheets. Do not bypass these checks.

| Role | Token / family | Size | Weight |
| --- | --- | --- | --- |
| Body, lists, form controls | `--font-sans`: Inter, system-ui, sans-serif | 16px | 400 |
| H1 | `--font-heading`: 'DM Sans', Inter, sans-serif | 40–64px | 400 |
| Non-home hero H1 | `--type-h1-hero` / DM Sans | 40–70px | 400 |
| H2 | `--type-h2` / DM Sans | clamp(2rem, 4vw, 3.125rem), 32–50px | 400 |
| H3 | `--type-h3` / DM Sans | 22–24px | 500 |
| H4 | `--type-h4` / DM Sans | 18px | 500 |
| Small body | `.body-small` / Inter | 15px | 400 |
| Small text | `small`, `.text-small` / Inter | 14px | 400 |
| Captions | `figcaption`, `.caption` / Inter | 13px | 400 |
| Eyebrows, kickers, parameter labels | `--font-mono`: 'JetBrains Mono', monospace | 12px | 500 |
| Small numbers, certificate codes, status labels | `.step-number`, `.cert-code`, `.status-tag` / JetBrains Mono | 11px | 500 |
| FAQ questions | DM Sans | 18px | 500 |
| FAQ answers | Inter | 14px | 400 |
| Navigation, including dropdowns | Inter | 14px desktop, 18px at ≤1024px | 400, current page / CTA 500 |
| Text brand name | `.brand-name`, `.logo-text`, `.brand__name` / DM Sans | 28px; ≤1024: 26px; ≤767: 24px; ≤360: 22px | 500 |
| Footer body | Inter | 14px, copyright 12px | 400 |
| Footer group headings | DM Sans | 18px | 500 |
| Table headers | Inter; `.mono-label` for JetBrains Mono | 14px; mono 12px | 500 |
| Table body | Inter | 14px (the owner's more specific table rule) | 400; emphasis 500 |

The logo is an image; text-brand tokens do not replace or distort it. Page headings use the H1/H2 scale; footer headings use the compact footer role. Inline emphasis inherits a heading's weight rather than making a 400-weight title bold.

All three normal variable fonts are self-hosted in `public/assets/fonts/`, with their OFL licenses. Inter and DM Sans are preloaded; JetBrains Mono loads when used. Keep `font-display: swap`. Latin font files cover the English website; the listed fallback stacks handle other characters. Do not add Google Fonts runtime requests.

Use semantic headings and captions. FAQ questions use `summary` within a FAQ container; answers use paragraphs. Use the documented small-text and label classes deliberately. Never shrink body copy merely to fit a card; adjust the layout instead.

After changing typography or adding a page template, run `npm run release:verify` and inspect the actual desktop and mobile computed styles. Check heading wrapping, table reading size, FAQ roles and navigation overflow. Preserve the approved colour palette, content and URLs.
