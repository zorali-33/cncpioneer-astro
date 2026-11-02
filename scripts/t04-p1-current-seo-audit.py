from __future__ import annotations

import csv
import re
from collections import Counter
from datetime import datetime
from html import unescape
from pathlib import Path


PROJECT_ROOT = Path(__file__).resolve().parents[1]
REPORT_DIR = PROJECT_ROOT / "seo-migration" / "reports"
ACTION_PLAN = REPORT_DIR / "T02-english-action-plan.csv"
PAGES_ROOT = PROJECT_ROOT / "src" / "mirrored-pages"

TITLE_RE = re.compile(r"<title[^>]*>(.*?)</title>", re.I | re.S)
H1_RE = re.compile(r"<h1\b[^>]*>(.*?)</h1>", re.I | re.S)
META_DESCRIPTION_TAG_RE = re.compile(
    r"<meta\b(?=[^>]*\bname=[\"']description[\"'])[^>]*>",
    re.I | re.S,
)
CANONICAL_TAG_RE = re.compile(
    r"<link\b(?=[^>]*\brel=[\"']canonical[\"'])[^>]*>",
    re.I | re.S,
)
OG_TAG_RE = re.compile(
    r"<meta\b(?=[^>]*\bproperty=[\"']og:[^\"']+[\"'])[^>]*>",
    re.I | re.S,
)
ATTR_RE = re.compile(r"\b([a-zA-Z_:.-]+)=(\"[^\"]*\"|'[^']*')", re.S)


def clean(value: str) -> str:
    value = re.sub(r"<[^>]+>", " ", value or "")
    return re.sub(r"\s+", " ", unescape(value)).strip()


def attrs(tag: str) -> dict[str, str]:
    result = {}
    for key, quoted_value in ATTR_RE.findall(tag):
        result[key.lower()] = quoted_value[1:-1]
    return result


def load_rows() -> list[dict[str, str]]:
    with ACTION_PLAN.open("r", encoding="utf-8-sig", newline="") as input_file:
        return [
            row
            for row in csv.DictReader(input_file)
            if row.get("priority") == "P1" and row.get("classification") == "mirrored_page_seo_structure"
        ]


def audit(row: dict[str, str]) -> dict[str, str]:
    html = (PAGES_ROOT / row["owner"]).read_text(encoding="utf-8", errors="replace")
    title = clean(TITLE_RE.search(html).group(1)) if TITLE_RE.search(html) else ""
    descriptions = [clean(attrs(tag).get("content", "")) for tag in META_DESCRIPTION_TAG_RE.findall(html)]
    h1s = [clean(match.group(1)) for match in H1_RE.finditer(html)]
    canonical_tag = CANONICAL_TAG_RE.search(html)
    canonical = clean(attrs(canonical_tag.group(0)).get("href", "")) if canonical_tag else ""
    og = {
        attrs(tag).get("property", "").lower(): clean(attrs(tag).get("content", ""))
        for tag in OG_TAG_RE.findall(html)
    }

    problems = []
    if not title:
        problems.append("missing_title")
    elif len(title) > 60:
        problems.append("title_too_long")
    elif len(title) < 30:
        problems.append("title_too_short")

    if len(descriptions) == 0:
        problems.append("missing_meta_description")
    elif len(descriptions) > 1:
        problems.append("multiple_meta_description")
    else:
        desc_len = len(descriptions[0])
        if desc_len > 155:
            problems.append("meta_description_too_long")
        elif desc_len < 120:
            problems.append("meta_description_too_short")

    if len(h1s) == 0:
        problems.append("missing_h1")
    elif len(h1s) > 1:
        problems.append("multiple_h1")

    if not canonical:
        problems.append("missing_canonical")

    for key in ("og:title", "og:description", "og:url"):
        if not og.get(key):
            problems.append(f"missing_{key.replace(':', '_')}")

    return {
        "path": row["path"],
        "source_file": row["owner"],
        "title_length": str(len(title)),
        "meta_description_count": str(len(descriptions)),
        "meta_description_length": str(len(descriptions[0]) if descriptions else 0),
        "h1_count": str(len(h1s)),
        "canonical": canonical,
        "og_title": og.get("og:title", ""),
        "og_description": og.get("og:description", ""),
        "og_url": og.get("og:url", ""),
        "current_problem_count": str(len(problems)),
        "current_problems": " | ".join(problems),
        "title": title,
        "meta_description": descriptions[0] if descriptions else "",
        "h1": h1s[0] if h1s else "",
        "ahrefs_issues": row.get("issues", ""),
    }


def write_csv(path: Path, rows: list[dict[str, str]]) -> None:
    fieldnames = [
        "path",
        "source_file",
        "title_length",
        "meta_description_count",
        "meta_description_length",
        "h1_count",
        "canonical",
        "og_title",
        "og_description",
        "og_url",
        "current_problem_count",
        "current_problems",
        "title",
        "meta_description",
        "h1",
        "ahrefs_issues",
    ]
    with path.open("w", encoding="utf-8-sig", newline="") as output:
        writer = csv.DictWriter(output, fieldnames=fieldnames)
        writer.writeheader()
        for row in rows:
            writer.writerow(row)


def main() -> None:
    audited = [audit(row) for row in load_rows()]
    write_csv(REPORT_DIR / "T04-P1-current-seo-audit.csv", audited)

    problem_counter = Counter()
    for row in audited:
        for problem in row["current_problems"].split(" | "):
            if problem:
                problem_counter[problem] += 1

    problem_rows = [
        {"problem": problem, "count": str(count)}
        for problem, count in problem_counter.most_common()
    ]
    with (REPORT_DIR / "T04-P1-current-seo-problem-summary.csv").open("w", encoding="utf-8-sig", newline="") as output:
        writer = csv.DictWriter(output, fieldnames=["problem", "count"])
        writer.writeheader()
        writer.writerows(problem_rows)

    clean_count = sum(1 for row in audited if row["current_problem_count"] == "0")
    markdown = f"""# T04 P1 Current SEO Audit

Status: complete
Date: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}

## Scope

Audited the current local source for the 324 P1 mirrored pages from T02.

## Outputs

- `seo-migration/reports/T04-P1-current-seo-audit.csv`
- `seo-migration/reports/T04-P1-current-seo-problem-summary.csv`

## Summary

- Mirrored P1 pages audited: {len(audited)}
- Pages currently passing local title/meta/H1/canonical/OG structure checks: {clean_count}
- Pages with at least one current local structure problem: {len(audited) - clean_count}

## Current Problem Counts

{chr(10).join(f"- {row['problem']}: {row['count']}" for row in problem_rows) or "- None"}

## Notes

- This audit checks current local HTML, not only historical Ahrefs labels.
- Title target: 30-60 characters.
- Meta description target: 120-155 characters.
- The audit does not edit pages.
"""
    (REPORT_DIR / "T04-P1-current-seo-audit.md").write_text(markdown, encoding="utf-8")
    print({"audited": len(audited), "clean": clean_count, "problem_pages": len(audited) - clean_count})


if __name__ == "__main__":
    main()
