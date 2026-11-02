# T01 Baseline Inventory - English Scope

Status: complete
Date: 2026-10-10 10:35:40

## Inputs

- Local Astro project: `C:\Users\HP\Documents\Codex\2026-09-28\dom-css-1-1\outputs\cncpioneer-astro`
- Workbook: `E:\工作日志\2026年\10月份\10-8\网站页面.xlsx`
- Ahrefs ZIP: `E:\工作日志\2026年\10月份\10-8\问题\cncpioneer_08-oct-2026_all-issues_2026-10-08_18-21-30.zip`
- Scope: English URLs only. Workbook sheets included: `网站地图`, `英文收录页面`. Language-prefixed paths such as `/ar/...` are excluded.

## Outputs

- `seo-migration/reports/T01-local-route-inventory.csv`
- `seo-migration/reports/T01-workbook-url-comparison.csv`
- `seo-migration/reports/T01-ahrefs-issue-summary.csv`

## Workbook Summary

- 网站地图: 352 rows, 351 URL rows, 351 unique paths
- 英文收录页面: 150 rows, 149 URL rows, 149 unique paths

## Local Route Summary

- Manifest routes: 350
- Dist HTML routes: 389
- Workbook unique paths: 357
- All compared unique paths: 441
- Manifest routes missing in current dist: 0
- Dist routes not in manifest: 39
- Workbook paths missing in current dist: 0
- Workbook paths missing in manifest: 7
- Current dist routes not listed in workbook: 32
- Ahrefs-only English issue paths not in workbook or current dist: 52

## Ahrefs Issue Coverage

- Ahrefs CSV issue files scanned: 53
- Unique paths with at least one Ahrefs issue: 435

Top issue families by unique path:

- Warning-CSS_file_size_too_large-links: 389 unique paths
- Warning-indexable-Redirected_page_has_no_incoming_internal_links-links: 389 unique paths
- Warning-3XX_redirect-links: 389 unique paths
- Warning-indexable-Page_has_links_to_redirect: 388 unique paths
- Warning-indexable-Page_has_links_to_redirect-links: 388 unique paths
- Notice-Changed_pages_not_submitted_to_IndexNow: 291 unique paths
- Warning-Open_Graph_tags_incomplete: 193 unique paths
- Warning-indexable-Meta_description_tag_missing_or_empty: 138 unique paths
- Error-indexable-Orphan_page_(has_no_incoming_internal_links): 129 unique paths
- Warning-indexable-Title_too_long: 112 unique paths
- Error-Double_slash_in_URL-links: 97 unique paths
- Warning-indexable-Meta_description_too_long: 67 unique paths
- Warning-Slow_page: 49 unique paths
- Notice-indexable-Title_tag_changed: 45 unique paths
- Notice-Indexable_page_not_in_sitemap: 38 unique paths

## Workbook URLs Missing In Dist

- None

## Dist Routes Not In Manifest

These are likely Astro-generated archive/pagination routes or non-page assets rendered as HTML:

- /
- /author/david-li/page/2
- /author/david-li/page/3
- /author/david-li/page/4
- /author/ryan-wang/page/10
- /author/ryan-wang/page/11
- /author/ryan-wang/page/12
- /author/ryan-wang/page/13
- /author/ryan-wang/page/14
- /author/ryan-wang/page/15
- /author/ryan-wang/page/16
- /author/ryan-wang/page/17
- /author/ryan-wang/page/2
- /author/ryan-wang/page/3
- /author/ryan-wang/page/4
- /author/ryan-wang/page/5
- /author/ryan-wang/page/6
- /author/ryan-wang/page/7
- /author/ryan-wang/page/8
- /author/ryan-wang/page/9

## Ahrefs-Only English Issue Paths

These appear in Ahrefs issue exports but are not present in the English workbook scope or current local dist:

- /10.1016/j.promfg.2016.08.093
- /article/10.1007/s11633-019-1190-y
- /article/10.1007/s12541-025-01318-2
- /article/10.1007/s40436-020-00323-0
- /articles/a-history-of-precision-the-invention-and-evolution-of-swiss-style-machining-
- /articles/understanding-swiss-type-machining
- /bitstream/handle/1721.1/69013/Kinematic%20coupling%20review%20article.pdf
- /blog/ai-cnc-machining
- /blog/ai-cnc-programming
- /blog/cnc-locating-pinsi
- /blog/cnc-machining-defense
- /blog/cnc-milling-parts
- /blog/cnc-musical-instruments
- /blog/medical-swiss-machining
- /blog/page/15
- /blog/page/16
- /blog/page/17
- /blog/page/18
- /blog/page/19
- /blog/page/20

## Notes

- This is a baseline inventory only. It does not change page source files.
- `dist` reflects the most recent local build. If source changes occur, rerun `npm run build` and then rerun this inventory.
- The comparison normalizes URL paths by removing trailing slashes except for `/`.
- This T01 report intentionally excludes non-English language directories.
- Ahrefs issue files without URL-like values are counted in the summary but cannot be mapped to individual local paths.
