from __future__ import annotations

import csv
import json
import re
import zipfile
from collections import Counter, defaultdict
from datetime import datetime
from html import unescape
from pathlib import Path
from urllib.parse import urlparse

from openpyxl import load_workbook


PROJECT_ROOT = Path(__file__).resolve().parents[1]
MANIFEST_PATH = PROJECT_ROOT / "src" / "mirrored-pages" / "manifest.json"
DIST_ROOT = PROJECT_ROOT / "dist"
REPORT_DIR = PROJECT_ROOT / "seo-migration" / "reports"
WORKBOOK_PATH = Path(r"E:\工作日志\2026年\10月份\10-8\网站页面.xlsx")
AHREFS_ZIP_PATH = Path(
    r"E:\工作日志\2026年\10月份\10-8\问题\cncpioneer_08-oct-2026_all-issues_2026-10-08_18-21-30.zip"
)

SITE_HOST = "www.cncpioneer.com"
URL_RE = re.compile(r"https?://[^\s\"'<>]+", re.I)
ENGLISH_WORKBOOK_SHEETS = {"网站地图", "英文收录页面"}
LANGUAGE_PREFIXES = {
    "ar",
    "de",
    "es",
    "fr",
    "it",
    "ja",
    "ko",
    "nl",
    "pl",
    "pt",
    "ru",
    "th",
    "tr",
    "vi",
    "zh",
    "zh-cn",
    "zh-tw",
}


def is_english_path(path: str) -> bool:
    first_segment = path.strip("/").split("/", 1)[0].lower()
    return first_segment not in LANGUAGE_PREFIXES


def normalize_url(value: str) -> tuple[str, str]:
    value = str(value or "").strip()
    if not value:
        return "", ""
    match = URL_RE.search(value)
    if match:
        value = match.group(0)
    parsed = urlparse(value)
    if not parsed.netloc and value.startswith("/"):
        path = value
        url = f"https://{SITE_HOST}{path}"
    elif parsed.netloc:
        path = parsed.path or "/"
        url = f"{parsed.scheme or 'https'}://{parsed.netloc}{path}"
        if parsed.query:
            url = f"{url}?{parsed.query}"
    else:
        return value, ""
    if path != "/":
        path = path.rstrip("/")
    return url, path


def path_from_slug(slug: str) -> str:
    slug = str(slug or "").strip("/")
    return "/" if not slug else f"/{slug}"


def route_from_dist_file(html_file: Path) -> str:
    rel = html_file.relative_to(DIST_ROOT).as_posix()
    if rel == "index.html":
        return "/"
    if rel.endswith("/index.html"):
        rel = rel[: -len("/index.html")]
    elif rel.endswith(".html"):
        rel = rel[: -len(".html")]
    return "/" + rel.strip("/")


def read_text(path: Path) -> str:
    return path.read_text(encoding="utf-8", errors="replace")


def extract_head_value(html: str, pattern: str) -> str:
    match = re.search(pattern, html, re.I | re.S)
    return unescape(match.group(1).strip()) if match else ""


def extract_meta(html: str) -> dict[str, str]:
    title = extract_head_value(html, r"<title[^>]*>(.*?)</title>")
    description = ""
    canonical = ""
    desc_match = re.search(
        r"<meta\b(?=[^>]*\bname=[\"']description[\"'])(?=[^>]*\bcontent=[\"']([^\"']*)[\"'])[^>]*>",
        html,
        re.I | re.S,
    )
    if desc_match:
        description = unescape(desc_match.group(1).strip())
    canon_match = re.search(
        r"<link\b(?=[^>]*\brel=[\"']canonical[\"'])(?=[^>]*\bhref=[\"']([^\"']*)[\"'])[^>]*>",
        html,
        re.I | re.S,
    )
    if canon_match:
        canonical = unescape(canon_match.group(1).strip())
    return {
        "title": title,
        "title_length": str(len(title)),
        "meta_description": description,
        "meta_description_length": str(len(description)),
        "canonical": canonical,
    }


def load_manifest() -> list[dict[str, str]]:
    return json.loads(MANIFEST_PATH.read_text(encoding="utf-8"))


def load_dist_routes() -> dict[str, dict[str, str]]:
    routes: dict[str, dict[str, str]] = {}
    if not DIST_ROOT.exists():
        return routes
    for html_file in sorted(DIST_ROOT.rglob("*.html")):
        route = route_from_dist_file(html_file)
        meta = extract_meta(read_text(html_file))
        routes[route] = {
            "route": route,
            "dist_file": str(html_file.relative_to(PROJECT_ROOT)),
            **meta,
        }
    return routes


def detect_url_from_row(values: list[object]) -> str:
    for value in values:
        if value is None:
            continue
        text = str(value)
        match = URL_RE.search(text)
        if match:
            return match.group(0)
    return ""


def load_workbook_urls() -> tuple[list[dict[str, str]], list[dict[str, str]]]:
    workbook = load_workbook(WORKBOOK_PATH, read_only=True, data_only=True)
    urls: list[dict[str, str]] = []
    sheet_summary: list[dict[str, str]] = []
    for sheet_name in workbook.sheetnames:
        if sheet_name not in ENGLISH_WORKBOOK_SHEETS:
            continue
        ws = workbook[sheet_name]
        row_count = 0
        url_count = 0
        unique_paths: set[str] = set()
        for row_index, row in enumerate(ws.iter_rows(values_only=True), start=1):
            row_count += 1
            values = list(row)
            url = detect_url_from_row(values)
            if not url:
                continue
            normalized_url, normalized_path = normalize_url(url)
            if not normalized_path:
                continue
            if not is_english_path(normalized_path):
                continue
            url_count += 1
            unique_paths.add(normalized_path)
            urls.append(
                {
                    "source": "workbook",
                    "sheet": sheet_name,
                    "row": str(row_index),
                    "url": normalized_url,
                    "path": normalized_path,
                }
            )
        sheet_summary.append(
            {
                "sheet": sheet_name,
                "rows": str(row_count),
                "url_rows": str(url_count),
                "unique_paths": str(len(unique_paths)),
            }
        )
    workbook.close()
    return urls, sheet_summary


def decode_csv_bytes(data: bytes) -> str:
    if data.startswith(b"\xff\xfe") or data.startswith(b"\xfe\xff"):
        return data.decode("utf-16", errors="replace")
    for encoding in ("utf-8-sig", "utf-8", "gb18030", "latin-1"):
        try:
            return data.decode(encoding)
        except UnicodeDecodeError:
            continue
    return data.decode("utf-8", errors="replace")


def read_csv_rows(text: str) -> list[dict[str, str]]:
    sample = text[:8192]
    try:
        dialect = csv.Sniffer().sniff(sample, delimiters=",;\t")
    except csv.Error:
        dialect = csv.excel
    return list(csv.DictReader(text.splitlines(), dialect=dialect))


def load_ahrefs_issues() -> tuple[dict[str, set[str]], list[dict[str, str]]]:
    issues_by_path: dict[str, set[str]] = defaultdict(set)
    summaries: list[dict[str, str]] = []
    with zipfile.ZipFile(AHREFS_ZIP_PATH) as archive:
        for name in sorted(archive.namelist()):
            if not name.lower().endswith(".csv"):
                continue
            text = decode_csv_bytes(archive.read(name))
            rows = read_csv_rows(text)
            issue_name = Path(name).name.removesuffix(".csv")
            url_rows = 0
            matched_paths = set()
            for row in rows:
                url = ""
                for key, value in row.items():
                    if key and "url" in key.lower() and value:
                        url = value
                        break
                if not url:
                    url = detect_url_from_row(list(row.values()))
                normalized_url, normalized_path = normalize_url(url)
                if normalized_path:
                    if not is_english_path(normalized_path):
                        continue
                    url_rows += 1
                    matched_paths.add(normalized_path)
                    issues_by_path[normalized_path].add(issue_name)
            summaries.append(
                {
                    "issue_file": issue_name,
                    "rows": str(len(rows)),
                    "url_rows": str(url_rows),
                    "unique_paths": str(len(matched_paths)),
                }
            )
    return issues_by_path, summaries


def write_csv(path: Path, rows: list[dict[str, str]], fieldnames: list[str]) -> None:
    with path.open("w", newline="", encoding="utf-8-sig") as output:
        writer = csv.DictWriter(output, fieldnames=fieldnames)
        writer.writeheader()
        for row in rows:
            writer.writerow({key: row.get(key, "") for key in fieldnames})


def main() -> None:
    REPORT_DIR.mkdir(parents=True, exist_ok=True)

    manifest = load_manifest()
    manifest_by_path = {path_from_slug(item["slug"]): item for item in manifest}
    dist_routes = load_dist_routes()
    workbook_urls, workbook_sheet_summary = load_workbook_urls()
    issues_by_path, issue_summary = load_ahrefs_issues()

    all_paths = sorted(
        set(manifest_by_path) | set(dist_routes) | {row["path"] for row in workbook_urls} | set(issues_by_path)
    )
    workbook_paths = {row["path"] for row in workbook_urls}
    workbook_refs_by_path: dict[str, list[str]] = defaultdict(list)
    for row in workbook_urls:
        workbook_refs_by_path[row["path"]].append(f"{row['sheet']}!R{row['row']}")

    route_rows: list[dict[str, str]] = []
    for path in all_paths:
        manifest_item = manifest_by_path.get(path)
        dist_item = dist_routes.get(path, {})
        issues = sorted(issues_by_path.get(path, []))
        route_rows.append(
            {
                "path": path,
                "in_manifest": "yes" if manifest_item else "no",
                "in_dist": "yes" if path in dist_routes else "no",
                "in_workbook": "yes" if path in workbook_paths else "no",
                "manifest_file": manifest_item.get("file", "") if manifest_item else "",
                "dist_file": dist_item.get("dist_file", ""),
                "workbook_refs": "; ".join(workbook_refs_by_path.get(path, [])),
                "title_length": dist_item.get("title_length", ""),
                "meta_description_length": dist_item.get("meta_description_length", ""),
                "canonical": dist_item.get("canonical", ""),
                "issue_count": str(len(issues)),
                "issues": " | ".join(issues),
            }
        )

    comparison_rows: list[dict[str, str]] = []
    seen_workbook_keys: set[tuple[str, str, str]] = set()
    for row in workbook_urls:
        key = (row["sheet"], row["row"], row["path"])
        if key in seen_workbook_keys:
            continue
        seen_workbook_keys.add(key)
        issues = sorted(issues_by_path.get(row["path"], []))
        comparison_rows.append(
            {
                **row,
                "in_manifest": "yes" if row["path"] in manifest_by_path else "no",
                "in_dist": "yes" if row["path"] in dist_routes else "no",
                "issue_count": str(len(issues)),
                "issues": " | ".join(issues),
            }
        )

    issue_counter = Counter()
    for issues in issues_by_path.values():
        for issue in issues:
            issue_counter[issue] += 1

    write_csv(
        REPORT_DIR / "T01-local-route-inventory.csv",
        route_rows,
        [
            "path",
            "in_manifest",
            "in_dist",
            "in_workbook",
            "manifest_file",
            "dist_file",
            "workbook_refs",
            "title_length",
            "meta_description_length",
            "canonical",
            "issue_count",
            "issues",
        ],
    )
    write_csv(
        REPORT_DIR / "T01-workbook-url-comparison.csv",
        comparison_rows,
        ["source", "sheet", "row", "url", "path", "in_manifest", "in_dist", "issue_count", "issues"],
    )
    write_csv(
        REPORT_DIR / "T01-ahrefs-issue-summary.csv",
        issue_summary,
        ["issue_file", "rows", "url_rows", "unique_paths"],
    )

    manifest_only = sorted(set(manifest_by_path) - set(dist_routes))
    dist_only = sorted(set(dist_routes) - set(manifest_by_path))
    workbook_missing_dist = sorted(workbook_paths - set(dist_routes))
    workbook_missing_manifest = sorted(workbook_paths - set(manifest_by_path))
    local_not_in_workbook = sorted(set(dist_routes) - workbook_paths)
    ahrefs_only = sorted(set(issues_by_path) - set(dist_routes) - workbook_paths)

    top_issues = issue_counter.most_common(15)
    sheet_lines = "\n".join(
        f"- {row['sheet']}: {row['rows']} rows, {row['url_rows']} URL rows, {row['unique_paths']} unique paths"
        for row in workbook_sheet_summary
    )
    top_issue_lines = "\n".join(f"- {name}: {count} unique paths" for name, count in top_issues)
    sample_missing_dist = "\n".join(f"- {path}" for path in workbook_missing_dist[:20]) or "- None"
    sample_dist_only = "\n".join(f"- {path}" for path in dist_only[:20]) or "- None"

    markdown = f"""# T01 Baseline Inventory - English Scope

Status: complete
Date: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}

## Inputs

- Local Astro project: `{PROJECT_ROOT}`
- Workbook: `{WORKBOOK_PATH}`
- Ahrefs ZIP: `{AHREFS_ZIP_PATH}`
- Scope: English URLs only. Workbook sheets included: `网站地图`, `英文收录页面`. Language-prefixed paths such as `/ar/...` are excluded.

## Outputs

- `seo-migration/reports/T01-local-route-inventory.csv`
- `seo-migration/reports/T01-workbook-url-comparison.csv`
- `seo-migration/reports/T01-ahrefs-issue-summary.csv`

## Workbook Summary

{sheet_lines}

## Local Route Summary

- Manifest routes: {len(manifest_by_path)}
- Dist HTML routes: {len(dist_routes)}
- Workbook unique paths: {len(workbook_paths)}
- All compared unique paths: {len(all_paths)}
- Manifest routes missing in current dist: {len(manifest_only)}
- Dist routes not in manifest: {len(dist_only)}
- Workbook paths missing in current dist: {len(workbook_missing_dist)}
- Workbook paths missing in manifest: {len(workbook_missing_manifest)}
- Current dist routes not listed in workbook: {len(local_not_in_workbook)}
- Ahrefs-only English issue paths not in workbook or current dist: {len(ahrefs_only)}

## Ahrefs Issue Coverage

- Ahrefs CSV issue files scanned: {len(issue_summary)}
- Unique paths with at least one Ahrefs issue: {len(issues_by_path)}

Top issue families by unique path:

{top_issue_lines}

## Workbook URLs Missing In Dist

{sample_missing_dist}

## Dist Routes Not In Manifest

These are likely Astro-generated archive/pagination routes or non-page assets rendered as HTML:

{sample_dist_only}

## Ahrefs-Only English Issue Paths

These appear in Ahrefs issue exports but are not present in the English workbook scope or current local dist:

{chr(10).join(f"- {path}" for path in ahrefs_only[:20]) or "- None"}

## Notes

- This is a baseline inventory only. It does not change page source files.
- `dist` reflects the most recent local build. If source changes occur, rerun `npm run build` and then rerun this inventory.
- The comparison normalizes URL paths by removing trailing slashes except for `/`.
- This T01 report intentionally excludes non-English language directories.
- Ahrefs issue files without URL-like values are counted in the summary but cannot be mapped to individual local paths.
"""
    (REPORT_DIR / "T01-baseline-inventory.md").write_text(markdown, encoding="utf-8")

    print(
        json.dumps(
            {
                "manifest_routes": len(manifest_by_path),
                "dist_routes": len(dist_routes),
                "workbook_unique_paths": len(workbook_paths),
                "ahrefs_issue_files": len(issue_summary),
                "paths_with_issues": len(issues_by_path),
                "workbook_missing_dist": len(workbook_missing_dist),
                "dist_only": len(dist_only),
            },
            ensure_ascii=False,
            indent=2,
        )
    )


if __name__ == "__main__":
    main()
