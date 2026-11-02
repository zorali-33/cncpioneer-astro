# T07 P1 Missing Blog URL Fix

Status: complete
Date: 2026-10-10 07:20:10

## Scope

Handled the 6 English P1 historical blog URLs classified as `ahrefs_only_missing_blog_url`.

## Summary

- HTML files scanned: 4115
- Files with internal link replacements: 1
- Internal URL replacements: 4
- Redirect fallback pages written: 6
- Manifest entries added: 0

## Redirect Map

- `/blog/ai-cnc-machining` -> `/blog/what-is-cnc`
- `/blog/ai-cnc-programming` -> `/blog/what-is-cnc`
- `/blog/cnc-locating-pinsi` -> `/blog/cnc-locating-pins`
- `/blog/cnc-machining-defense` -> `/blog/cnc-milling-and-turning-defense`
- `/blog/cnc-musical-instruments` -> `/blog/medical-cnc-machining`
- `/blog/swiss-machining-defense` -> `/services/swiss-machining`

## Outputs

- `seo-migration/reports/T07-P1-missing-blog-url-fix-report.md`
- `seo-migration/reports/T07-P1-missing-blog-url-changes.csv`

## Notes

- The static fallback pages use meta refresh and JavaScript redirection because this local Astro static build does not define server-level 301 redirects.
- Internal links were updated to point directly to current local pages where possible.
