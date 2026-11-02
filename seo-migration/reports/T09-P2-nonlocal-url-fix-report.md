# T09 P2 Nonlocal URL Fix

Status: complete
Date: 2026-10-10 08:16:49

## Scope

Handled P2 URLs classified as `ahrefs_only_nonlocal_url` where the current local build still lacked a route or asset path.

## Summary

- Redirect fallback pages written: 3
- Manifest entries added: 0
- Historical asset aliases written: 7

## Redirect Map

- `/blog/cnc-milling-parts` -> `/blog/cnc-milling-machine-parts`
- `/blog/medical-swiss-machining` -> `/industries/medical-swiss-machining`
- `/industries/railroad-machining-services` -> `/blog/railroad-machining`

## Dynamic Blog Pagination Redirects

- `/blog/page/15` -> `/blog/page/14`
- `/blog/page/16` -> `/blog/page/14`
- `/blog/page/17` -> `/blog/page/14`
- `/blog/page/18` -> `/blog/page/14`
- `/blog/page/19` -> `/blog/page/14`
- `/blog/page/20` -> `/blog/page/14`

## Asset Aliases

- `/wp-content/uploads/2021/07/5-Axis-Aluminum-Alloy-CNC-Precision-Machining-Medical-Parts.jpg` <- `/wp-content/uploads/2026/01/medical-cnc-machining.jpg`
- `/wp-content/uploads/2024/08/aluminum-alloys-and-their-melting-points-1024x658.webp` <- `/wp-content/uploads/2026/03/cnc-aluminum-milling.webp`
- `/wp-content/uploads/2026/06/construction-agricultural-reducer.jpg` <- `/wp-content/uploads/2026/05/construction-mining-gearbox-housing.jpg`
- `/wp-content/uploads/2026/06/robot-cell-chip-coolant-peripheral-hardware.jpg` <- `/wp-content/uploads/2026/06/robot-cell-measurement-air-gauge-vision-cmm.jpg`
- `/wp-content/uploads/2026/09/electricals.jpg` <- `/wp-content/uploads/2026/04/brass-electrical-connector-terminals.jpg`
- `/wp-content/uploads/2026/09/fluid-control.jpg` <- `/wp-content/uploads/2026/04/fluid-control.jpg`
- `/wp-content/uploads/2026/09/industrial-machinery.jpg` <- `/wp-content/uploads/2026/05/industrial-machinery.jpg`

## Notes

- Fallback pages are static `noindex, follow` redirect pages using meta refresh and JavaScript.
- Historical `/blog/page/15-20` URLs are handled by the dedicated Astro blog pagination route to avoid route priority conflicts.
- `/services//swiss-machining` resolves to the canonical `/services/swiss-machining` route in the local static output; internal double-slash links were already fixed in T08.

## Outputs

- `seo-migration/reports/T09-P2-nonlocal-url-fix-report.md`
- `seo-migration/reports/T09-P2-nonlocal-url-changes.csv`
