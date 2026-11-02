# T02 English Scope Classification

Status: complete
Date: 2026-10-10 10:41:36

## Inputs

- `seo-migration/reports/T01-local-route-inventory.csv`
- Scope: English routes only, as produced by T01.

## Outputs

- `seo-migration/reports/T02-english-action-plan.csv`
- `seo-migration/reports/T02-priority-summary.csv`

## Priority Summary

- P1: 363
- P2: 45
- P3: 28
- P0: 5

## Classification Summary

- mirrored_page_seo_structure: 324
- generated_archive_pagination: 32
- external_or_reference_url: 28
- mirrored_page_link_technical: 21
- ahrefs_only_nonlocal_url: 18
- ahrefs_only_missing_blog_url: 6
- generated_parts_archive: 6
- mirrored_page_fatal_issue: 5
- home_generated_route: 1

## Recommended Action Summary

- fix_page_or_batch_script: 324
- fix_generator_metadata: 32
- defer_or_fix_source_link: 28
- batch_fix_links: 21
- review: 18
- review_redirect_or_restore: 6
- fix_parts_archive_generator: 6
- must_fix: 5
- seo_review: 1

## Issue Group Summary

- performance_content: 395
- link_technical: 392
- seo_structure: 367
- other: 218
- external: 46
- fatal: 18

## P0 Must Fix

- `/blog/automotive-machining` - mirrored_page_fatal_issue - must_fix
- `/blog/medical-cnc-machining` - mirrored_page_fatal_issue - must_fix
- `/custom-cnc-parts/5-axis-cnc-machining-brass-parts` - mirrored_page_fatal_issue - must_fix
- `/custom-cnc-parts/reducer-shaft` - mirrored_page_fatal_issue - must_fix
- `/custom-cnc-parts/robotic-machining-cells` - mirrored_page_fatal_issue - must_fix

## P1 High Priority

- `/blog/ai-cnc-machining` - ahrefs_only_missing_blog_url - review_redirect_or_restore
- `/blog/ai-cnc-programming` - ahrefs_only_missing_blog_url - review_redirect_or_restore
- `/blog/cnc-locating-pinsi` - ahrefs_only_missing_blog_url - review_redirect_or_restore
- `/blog/cnc-machining-defense` - ahrefs_only_missing_blog_url - review_redirect_or_restore
- `/blog/cnc-musical-instruments` - ahrefs_only_missing_blog_url - review_redirect_or_restore
- `/blog/swiss-machining-defense` - ahrefs_only_missing_blog_url - review_redirect_or_restore
- `/author/david-li/page/2` - generated_archive_pagination - fix_generator_metadata
- `/author/david-li/page/3` - generated_archive_pagination - fix_generator_metadata
- `/author/david-li/page/4` - generated_archive_pagination - fix_generator_metadata
- `/author/ryan-wang/page/10` - generated_archive_pagination - fix_generator_metadata
- `/author/ryan-wang/page/11` - generated_archive_pagination - fix_generator_metadata
- `/author/ryan-wang/page/12` - generated_archive_pagination - fix_generator_metadata
- `/author/ryan-wang/page/13` - generated_archive_pagination - fix_generator_metadata
- `/author/ryan-wang/page/14` - generated_archive_pagination - fix_generator_metadata
- `/author/ryan-wang/page/15` - generated_archive_pagination - fix_generator_metadata
- `/author/ryan-wang/page/16` - generated_archive_pagination - fix_generator_metadata
- `/author/ryan-wang/page/17` - generated_archive_pagination - fix_generator_metadata
- `/author/ryan-wang/page/2` - generated_archive_pagination - fix_generator_metadata
- `/author/ryan-wang/page/3` - generated_archive_pagination - fix_generator_metadata
- `/author/ryan-wang/page/4` - generated_archive_pagination - fix_generator_metadata

## P2 Batch Cleanup

- `/blog/cnc-milling-parts` - ahrefs_only_nonlocal_url - review
- `/blog/medical-swiss-machining` - ahrefs_only_nonlocal_url - review
- `/blog/page/15` - ahrefs_only_nonlocal_url - review
- `/blog/page/16` - ahrefs_only_nonlocal_url - review
- `/blog/page/17` - ahrefs_only_nonlocal_url - review
- `/blog/page/18` - ahrefs_only_nonlocal_url - review
- `/blog/page/19` - ahrefs_only_nonlocal_url - review
- `/blog/page/20` - ahrefs_only_nonlocal_url - review
- `/industries/railroad-machining-services` - ahrefs_only_nonlocal_url - review
- `/services//swiss-machining` - ahrefs_only_nonlocal_url - review
- `/wp-content/plugins/wpforms-lite/assets/css/frontend/modern/wpforms-full.min.css` - ahrefs_only_nonlocal_url - review
- `/wp-content/uploads/2021/07/5-Axis-Aluminum-Alloy-CNC-Precision-Machining-Medical-Parts.jpg` - ahrefs_only_nonlocal_url - review
- `/wp-content/uploads/2024/08/aluminum-alloys-and-their-melting-points-1024x658.webp` - ahrefs_only_nonlocal_url - review
- `/wp-content/uploads/2026/06/construction-agricultural-reducer.jpg` - ahrefs_only_nonlocal_url - review
- `/wp-content/uploads/2026/06/robot-cell-chip-coolant-peripheral-hardware.jpg` - ahrefs_only_nonlocal_url - review
- `/wp-content/uploads/2026/09/electricals.jpg` - ahrefs_only_nonlocal_url - review
- `/wp-content/uploads/2026/09/fluid-control.jpg` - ahrefs_only_nonlocal_url - review
- `/wp-content/uploads/2026/09/industrial-machinery.jpg` - ahrefs_only_nonlocal_url - review
- `/custom-cnc-parts/page/2` - generated_parts_archive - fix_parts_archive_generator
- `/custom-cnc-parts/page/3` - generated_parts_archive - fix_parts_archive_generator

## P3 Defer Or Manual Review

- `/10.1016/j.promfg.2016.08.093` - external_or_reference_url - defer_or_fix_source_link
- `/article/10.1007/s11633-019-1190-y` - external_or_reference_url - defer_or_fix_source_link
- `/article/10.1007/s12541-025-01318-2` - external_or_reference_url - defer_or_fix_source_link
- `/article/10.1007/s40436-020-00323-0` - external_or_reference_url - defer_or_fix_source_link
- `/articles/a-history-of-precision-the-invention-and-evolution-of-swiss-style-machining-` - external_or_reference_url - defer_or_fix_source_link
- `/articles/understanding-swiss-type-machining` - external_or_reference_url - defer_or_fix_source_link
- `/bitstream/handle/1721.1/69013/Kinematic%20coupling%20review%20article.pdf` - external_or_reference_url - defer_or_fix_source_link
- `/cgi/viewcontent.cgi` - external_or_reference_url - defer_or_fix_source_link
- `/codes-standards/find-codes-standards/y14-5-geometric-dimensioning-tolerancing` - external_or_reference_url - defer_or_fix_source_link
- `/context/mesp/article/1687/viewcontent/F12_FDR.pdf` - external_or_reference_url - defer_or_fix_source_link
- `/d2000-18.html` - external_or_reference_url - defer_or_fix_source_link
- `/e0018-20.html` - external_or_reference_url - defer_or_fix_source_link
- `/journal/journal-of-manufacturing-processes` - external_or_reference_url - defer_or_fix_source_link
- `/machinery-s-handbook-31st-edition-large-print` - external_or_reference_url - defer_or_fix_source_link
- `/manufacturingscience/article/146/4/041004/1195163` - external_or_reference_url - defer_or_fix_source_link
- `/products/codes-standards/y145-2018-dimensioning-and-tolerancing` - external_or_reference_url - defer_or_fix_source_link
- `/report/aerospace-cnc-machining-market` - external_or_reference_url - defer_or_fix_source_link
- `/science/article/abs/pii/S0007850612002077` - external_or_reference_url - defer_or_fix_source_link
- `/science/article/pii/S0924013696000301` - external_or_reference_url - defer_or_fix_source_link
- `/science/article/pii/S145239812400483X` - external_or_reference_url - defer_or_fix_source_link

## Execution Recommendation

1. Fix P0 first if any remain.
2. Then handle P1 generated archive metadata and mirrored page SEO structure issues.
3. After P1, batch P2 redirect/link cleanup and performance/content notices.
4. Keep P3 Ahrefs-only external/reference URLs out of page migration work unless they are linked from local pages.

## Notes

- This classification does not edit site pages.
- Generated routes should be fixed in their generator modules, not in `dist`.
- Mirrored routes should be fixed in `src/mirrored-pages/**/index.html` or with targeted migration scripts.
- Ahrefs-only paths are included so historical 404s and outbound reference issues are visible, but they are not counted as missing English workbook pages.
