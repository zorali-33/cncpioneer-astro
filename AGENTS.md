# Project design requirements

The owner approved a fixed typography system on 2026-10-28. Read `TYPOGRAPHY.md` before editing or adding page styling. Use Inter for body and navigation, DM Sans for headings, and JetBrains Mono for small technical labels. Reuse the role tokens in `public/brand-theme.css`; do not add another font family or independent heading scale unless the owner explicitly changes this requirement.

Keep the normalization and release audit in place. After typography or shared template changes, run `npm run release:verify` and inspect representative desktop and mobile pages. Retain the approved colour tokens and page content unless the current request changes them.
