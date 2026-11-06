# Shared site header and footer

Blog home, all article detail pages, and the Ryan Wang author landing page retained an older, separate header/footer implementation. They now use the same SiteHeader, SiteHeaderSpacer and SiteFooter components as the homepage. Shared shell CSS has one source in src/styles/site-shell.css; obsolete blog and author shell styles were removed. Content, image choices, article URLs, typography tokens and the sticky left-hand desktop table of contents are preserved.

Release acceptance now compares the rendered header and footer on every generated page with the homepage, allowing the navigation's current-page state to differ. This covers 347 pages, including the 404 page.

Desktop (1440 px) and mobile (390 px) browser checks cover the blog home, article details, author page, footer, mobile menu and Materials submenu. Header/footer computed styles match the homepage; the active navigation item's text width may differ. The desktop table of contents remains on the left; mobile keeps the static collapsed directory. No horizontal overflow was observed.

The reported missing blog covers were not deleted. All 90 category article cards reference 71 unique cover assets. Live HTTP requests returned 200 for all 71 files and full WebP decoding passed. The four reported covers also loaded successfully in the local browser. The earlier loading failure could not be reproduced, so no speculative image replacements were made.
