# T14 Dist SEO Integrity Audit

Status: needs attention
Date: 2026-10-22 10:20:04

## Scope

Audited every generated `index.html` in `dist` for SEO integrity after the static build.

## Summary

- HTML pages audited: 423
- Indexable pages audited: 349
- Noindex pages audited: 74
- Sitemap URLs: 349
- Pages with problems: 208

## Problem Counts

- meta_description_too_long: 116
- missing_meta_description: 80
- h1_count_not_one: 65
- missing_og_url: 65
- title_too_long: 14
- title_too_short: 4
- meta_description_too_short: 1

## Rules

- Indexable pages require one title, one meta description, one canonical, one `og:url`, one H1, and sitemap inclusion.
- Title target: 30-60 characters.
- Meta description target: 120-155 characters.
- Canonical and `og:url` must match after normalizing the `https://www.cncpioneer.com` origin.
- Noindex pages must be excluded from sitemap.

## Outputs

- `seo-migration/reports/T14-dist-seo-integrity-audit.csv`
- `seo-migration/reports/T14-dist-seo-integrity-audit.md`
