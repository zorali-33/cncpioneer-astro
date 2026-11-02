from __future__ import annotations

import csv
from collections import Counter, defaultdict
from datetime import datetime
from pathlib import Path


PROJECT_ROOT = Path(__file__).resolve().parents[1]
REPORT_DIR = PROJECT_ROOT / "seo-migration" / "reports"
INPUT_CSV = REPORT_DIR / "T01-local-route-inventory.csv"

FATAL_ISSUES = {
    "Error-404_page",
    "Error-4XX_page",
    "Error-indexable-Multiple_meta_description_tags",
    "Error-Image_broken",
    "Error-Page_has_broken_image",
}

SEO_STRUCTURE_ISSUES = {
    "Warning-indexable-Meta_description_tag_missing_or_empty",
    "Warning-indexable-Meta_description_too_long",
    "Warning-indexable-Meta_description_too_short",
    "Warning-indexable-Title_too_long",
    "Warning-indexable-Title_too_short",
    "Warning-indexable-H1_tag_missing_or_empty",
    "Notice-indexable-Title_tag_changed",
    "Notice-indexable-Meta_description_changed",
    "Warning-Open_Graph_tags_incomplete",
    "Warning-Open_Graph_URL_not_matching_canonical",
    "Notice-Indexable_page_not_in_sitemap",
}

LINK_TECHNICAL_ISSUES = {
    "Warning-indexable-Page_has_links_to_redirect",
    "Warning-indexable-Page_has_links_to_redirect-links",
    "Warning-indexable-Redirected_page_has_no_incoming_internal_links-links",
    "Warning-3XX_redirect",
    "Warning-3XX_redirect-links",
    "Notice-HTTP_to_HTTPS_redirect",
    "Error-Double_slash_in_URL",
    "Error-Double_slash_in_URL-links",
}

PERFORMANCE_CONTENT_ISSUES = {
    "Warning-CSS_file_size_too_large-links",
    "Warning-Slow_page",
    "Warning-indexable-Slow_server_response_for_AI_crawlers",
    "Notice-indexable-Pages_have_high_AI_content_levels",
    "Notice-indexable-Word_count_changed",
    "Notice-Changed_pages_not_submitted_to_IndexNow",
}

EXTERNAL_ISSUES = {
    "Notice-External_3XX_redirect",
    "Notice-External_3XX_redirect-links",
    "Notice-External_4XX",
    "Notice-External_4XX-links",
}


def read_rows() -> list[dict[str, str]]:
    with INPUT_CSV.open("r", encoding="utf-8-sig", newline="") as input_file:
        return list(csv.DictReader(input_file))


def split_issues(value: str) -> list[str]:
    return [part.strip() for part in (value or "").split("|") if part.strip()]


def issue_groups(issues: list[str]) -> list[str]:
    groups: list[str] = []
    issue_set = set(issues)
    if issue_set & FATAL_ISSUES:
        groups.append("fatal")
    if issue_set & SEO_STRUCTURE_ISSUES:
        groups.append("seo_structure")
    if issue_set & LINK_TECHNICAL_ISSUES:
        groups.append("link_technical")
    if issue_set & PERFORMANCE_CONTENT_ISSUES:
        groups.append("performance_content")
    if issue_set & EXTERNAL_ISSUES:
        groups.append("external")
    unknown = issue_set - FATAL_ISSUES - SEO_STRUCTURE_ISSUES - LINK_TECHNICAL_ISSUES - PERFORMANCE_CONTENT_ISSUES - EXTERNAL_ISSUES
    if unknown:
        groups.append("other")
    return groups


def owner_for_path(row: dict[str, str]) -> str:
    path = row["path"]
    if row["in_manifest"] == "yes":
        return row["manifest_file"] or "src/mirrored-pages"
    if path == "/":
        return "src/pages/index.astro"
    if path.startswith("/blog/page/"):
        return "src/blog-archive.mjs + src/pages/blog/page/[page].astro"
    if path.startswith("/author/") and "/page/" in path:
        return "src/author-archive.mjs + src/pages/author/[author]/page/[page].astro"
    if path.startswith("/custom-cnc-parts/page/") or path == "/custom-cnc-parts":
        return "src/parts-archive.mjs + custom-cnc-parts Astro routes"
    return ""


def classify(row: dict[str, str]) -> tuple[str, str, str, str]:
    path = row["path"]
    in_manifest = row["in_manifest"] == "yes"
    in_dist = row["in_dist"] == "yes"
    in_workbook = row["in_workbook"] == "yes"
    issues = split_issues(row.get("issues", ""))
    groups = issue_groups(issues)
    issue_set = set(issues)

    if in_workbook and not in_dist:
        return (
            "P0",
            "workbook_missing_local_dist",
            "must_fix",
            "English workbook URL is missing from current local build. Add or restore the route before SEO cleanup.",
        )

    if in_manifest and not in_dist:
        return (
            "P0",
            "manifest_not_built",
            "must_fix",
            "Manifest route is not emitted to dist. Check Astro static path generation.",
        )

    if not in_dist and not in_workbook:
        if issue_set & FATAL_ISSUES and path.startswith("/blog/"):
            return (
                "P1",
                "ahrefs_only_missing_blog_url",
                "review_redirect_or_restore",
                "Ahrefs reports a missing historical English blog URL. Decide whether to restore content or add a redirect.",
            )
        if issue_set & EXTERNAL_ISSUES or path.startswith(("/article/", "/articles/", "/bitstream/", "/10.")):
            return (
                "P3",
                "external_or_reference_url",
                "defer_or_fix_source_link",
                "This is not a local page route. If linked from a local page, fix the outbound citation/link source later.",
            )
        return (
            "P2",
            "ahrefs_only_nonlocal_url",
            "review",
            "Ahrefs-only English path not present in workbook or local build. Verify whether it should exist or redirect.",
        )

    if not in_manifest and in_dist:
        if path == "/":
            return (
                "P1" if groups else "P3",
                "home_generated_route",
                "seo_review",
                "Home page is generated outside manifest. Check metadata, canonical, and global link issues.",
            )
        if path.startswith("/blog/page/") or (path.startswith("/author/") and "/page/" in path):
            return (
                "P1" if "seo_structure" in groups else "P2",
                "generated_archive_pagination",
                "fix_generator_metadata",
                "Generated pagination route. Fix metadata/sitemap/canonical in archive generator, not mirrored HTML.",
            )
        if path.startswith("/custom-cnc-parts"):
            return (
                "P1" if "seo_structure" in groups else "P2",
                "generated_parts_archive",
                "fix_parts_archive_generator",
                "Generated custom parts route. Fix card/catalog metadata in parts archive generator.",
            )
        return (
            "P2",
            "generated_non_manifest_route",
            "review_generator",
            "Dist route is generated outside manifest. Identify owning Astro generator before editing.",
        )

    if in_manifest and in_dist:
        if "fatal" in groups:
            return (
                "P0",
                "mirrored_page_fatal_issue",
                "must_fix",
                "Mirrored English page has fatal Ahrefs issue such as 4XX, broken image, or duplicate meta.",
            )
        if "seo_structure" in groups:
            return (
                "P1",
                "mirrored_page_seo_structure",
                "fix_page_or_batch_script",
                "Mirrored English page needs title/meta/H1/OG/canonical/sitemap cleanup.",
            )
        if "link_technical" in groups:
            return (
                "P2",
                "mirrored_page_link_technical",
                "batch_fix_links",
                "Mirrored English page mainly has redirect/internal-link URL cleanup issues.",
            )
        if "performance_content" in groups:
            return (
                "P2",
                "mirrored_page_performance_content",
                "batch_or_defer",
                "Mirrored English page has performance/content notices. Batch after structural SEO fixes.",
            )
        if groups:
            return (
                "P3",
                "mirrored_page_low_priority_notice",
                "defer",
                "Mirrored English page has low-priority or uncategorized notices.",
            )
        return (
            "P4",
            "mirrored_page_no_mapped_issue",
            "no_action_now",
            "Local mirrored English page has no mapped Ahrefs issue in current baseline.",
        )

    return (
        "P3",
        "unclassified",
        "review",
        "Route combination is unusual. Review manually before editing.",
    )


def write_csv(path: Path, rows: list[dict[str, str]], fieldnames: list[str]) -> None:
    with path.open("w", encoding="utf-8-sig", newline="") as output:
        writer = csv.DictWriter(output, fieldnames=fieldnames)
        writer.writeheader()
        for row in rows:
            writer.writerow({key: row.get(key, "") for key in fieldnames})


def main() -> None:
    rows = read_rows()
    classified: list[dict[str, str]] = []
    class_counter = Counter()
    priority_counter = Counter()
    action_counter = Counter()
    issue_group_counter = Counter()

    for row in rows:
        issues = split_issues(row.get("issues", ""))
        groups = issue_groups(issues)
        priority, classification, action, recommendation = classify(row)
        class_counter[classification] += 1
        priority_counter[priority] += 1
        action_counter[action] += 1
        for group in groups:
            issue_group_counter[group] += 1
        classified.append(
            {
                "priority": priority,
                "classification": classification,
                "recommended_action": action,
                "path": row["path"],
                "owner": owner_for_path(row),
                "in_manifest": row["in_manifest"],
                "in_dist": row["in_dist"],
                "in_workbook": row["in_workbook"],
                "workbook_refs": row.get("workbook_refs", ""),
                "title_length": row.get("title_length", ""),
                "meta_description_length": row.get("meta_description_length", ""),
                "issue_count": row.get("issue_count", "0"),
                "issue_groups": " | ".join(groups),
                "issues": row.get("issues", ""),
                "recommendation": recommendation,
            }
        )

    classified.sort(key=lambda row: (row["priority"], row["classification"], row["path"]))
    write_csv(
        REPORT_DIR / "T02-english-action-plan.csv",
        classified,
        [
            "priority",
            "classification",
            "recommended_action",
            "path",
            "owner",
            "in_manifest",
            "in_dist",
            "in_workbook",
            "workbook_refs",
            "title_length",
            "meta_description_length",
            "issue_count",
            "issue_groups",
            "issues",
            "recommendation",
        ],
    )

    summary_rows = []
    for priority in sorted(priority_counter):
        summary_rows.append(
            {
                "summary_type": "priority",
                "name": priority,
                "count": str(priority_counter[priority]),
            }
        )
    for name, count in class_counter.most_common():
        summary_rows.append({"summary_type": "classification", "name": name, "count": str(count)})
    for name, count in action_counter.most_common():
        summary_rows.append({"summary_type": "recommended_action", "name": name, "count": str(count)})
    for name, count in issue_group_counter.most_common():
        summary_rows.append({"summary_type": "issue_group", "name": name, "count": str(count)})

    write_csv(REPORT_DIR / "T02-priority-summary.csv", summary_rows, ["summary_type", "name", "count"])

    by_priority = defaultdict(list)
    for row in classified:
        by_priority[row["priority"]].append(row)

    def list_counts(counter: Counter) -> str:
        return "\n".join(f"- {name}: {count}" for name, count in counter.most_common()) or "- None"

    def sample_rows(priority: str, limit: int = 20) -> str:
        lines = []
        for row in by_priority.get(priority, [])[:limit]:
            lines.append(f"- `{row['path']}` - {row['classification']} - {row['recommended_action']}")
        return "\n".join(lines) or "- None"

    markdown = f"""# T02 English Scope Classification

Status: complete
Date: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}

## Inputs

- `seo-migration/reports/T01-local-route-inventory.csv`
- Scope: English routes only, as produced by T01.

## Outputs

- `seo-migration/reports/T02-english-action-plan.csv`
- `seo-migration/reports/T02-priority-summary.csv`

## Priority Summary

{list_counts(priority_counter)}

## Classification Summary

{list_counts(class_counter)}

## Recommended Action Summary

{list_counts(action_counter)}

## Issue Group Summary

{list_counts(issue_group_counter)}

## P0 Must Fix

{sample_rows("P0")}

## P1 High Priority

{sample_rows("P1")}

## P2 Batch Cleanup

{sample_rows("P2")}

## P3 Defer Or Manual Review

{sample_rows("P3")}

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
"""
    (REPORT_DIR / "T02-english-classification.md").write_text(markdown, encoding="utf-8")

    print(
        {
            "rows": len(classified),
            "priorities": dict(sorted(priority_counter.items())),
            "classes": dict(class_counter.most_common()),
        }
    )


if __name__ == "__main__":
    main()

