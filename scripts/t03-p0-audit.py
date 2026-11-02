from __future__ import annotations

import csv
import re
from collections import defaultdict
from datetime import datetime
from html import unescape
from pathlib import Path
from urllib.parse import urlparse


PROJECT_ROOT = Path(__file__).resolve().parents[1]
PUBLIC_ROOT = PROJECT_ROOT / "public"
PAGES_ROOT = PROJECT_ROOT / "src" / "mirrored-pages"
REPORT_DIR = PROJECT_ROOT / "seo-migration" / "reports"
ACTION_PLAN = REPORT_DIR / "T02-english-action-plan.csv"

URL_ATTR_RE = re.compile(r"\b(?:src|href|data-src|data-lazy-src|poster)=([\"'])(.*?)\1", re.I | re.S)
SRCSET_RE = re.compile(r"\b(?:srcset|data-srcset)=([\"'])(.*?)\1", re.I | re.S)
META_DESC_RE = re.compile(
    r"<meta\b(?=[^>]*\bname=[\"']description[\"'])(?=[^>]*\bcontent=[\"']([^\"']*)[\"'])[^>]*>",
    re.I | re.S,
)
TITLE_RE = re.compile(r"<title[^>]*>(.*?)</title>", re.I | re.S)
H1_RE = re.compile(r"<h1\b[^>]*>(.*?)</h1>", re.I | re.S)


def load_p0_rows() -> list[dict[str, str]]:
    with ACTION_PLAN.open("r", encoding="utf-8-sig", newline="") as input_file:
        return [row for row in csv.DictReader(input_file) if row.get("priority") == "P0"]


def clean_html_text(value: str) -> str:
    value = re.sub(r"<[^>]+>", " ", value or "")
    value = re.sub(r"\s+", " ", unescape(value)).strip()
    return value


def local_path_from_url(value: str) -> str:
    value = unescape(value or "").strip()
    if not value or value.startswith(("data:", "mailto:", "tel:", "#", "javascript:")):
        return ""
    parsed = urlparse(value)
    if parsed.netloc and parsed.netloc not in {"www.cncpioneer.com", "cncpioneer.com"}:
        return ""
    path = parsed.path if parsed.netloc else value.split("?", 1)[0].split("#", 1)[0]
    if not path.startswith("/"):
        return ""
    return path


def public_exists(local_path: str) -> bool:
    if not local_path:
        return True
    candidate = (PUBLIC_ROOT / local_path.strip("/")).resolve()
    try:
        candidate.relative_to(PUBLIC_ROOT.resolve())
    except ValueError:
        return False
    return candidate.exists()


def extract_srcset_urls(value: str) -> list[str]:
    urls = []
    for part in (value or "").split(","):
        token = part.strip().split(" ", 1)[0].strip()
        if token:
            urls.append(token)
    return urls


def audit_page(row: dict[str, str]) -> dict[str, object]:
    page_file = PAGES_ROOT / row["owner"]
    html = page_file.read_text(encoding="utf-8", errors="replace")
    title_match = TITLE_RE.search(html)
    h1_match = H1_RE.search(html)
    meta_descriptions = META_DESC_RE.findall(html)

    local_urls = []
    for _, value in URL_ATTR_RE.findall(html):
        local = local_path_from_url(value)
        if local:
            local_urls.append(local)
    for _, value in SRCSET_RE.findall(html):
        for src in extract_srcset_urls(value):
            local = local_path_from_url(src)
            if local:
                local_urls.append(local)

    missing_assets = sorted({url for url in local_urls if url.startswith(("/wp-content/", "/wp-includes/")) and not public_exists(url)})
    double_slash_urls = sorted(
        {
            value
            for value in local_urls
            if "//" in value.replace("https://", "").replace("http://", "")
            or re.search(r"https?://www\.cncpioneer\.com//", value)
        }
    )

    return {
        "path": row["path"],
        "source_file": str(page_file.relative_to(PROJECT_ROOT)),
        "title": clean_html_text(title_match.group(1) if title_match else ""),
        "title_length": len(clean_html_text(title_match.group(1) if title_match else "")),
        "h1": clean_html_text(h1_match.group(1) if h1_match else ""),
        "h1_count": len(H1_RE.findall(html)),
        "meta_description_count": len(meta_descriptions),
        "meta_description_lengths": ", ".join(str(len(clean_html_text(item))) for item in meta_descriptions),
        "missing_asset_count": len(missing_assets),
        "missing_assets": missing_assets,
        "double_slash_count": len(double_slash_urls),
        "double_slash_urls": double_slash_urls,
        "ahrefs_issues": row.get("issues", ""),
    }


def write_csv(path: Path, rows: list[dict[str, object]]) -> None:
    fieldnames = [
        "path",
        "source_file",
        "title_length",
        "h1_count",
        "meta_description_count",
        "meta_description_lengths",
        "missing_asset_count",
        "double_slash_count",
        "title",
        "h1",
        "missing_assets",
        "double_slash_urls",
        "ahrefs_issues",
    ]
    with path.open("w", encoding="utf-8-sig", newline="") as output:
        writer = csv.DictWriter(output, fieldnames=fieldnames)
        writer.writeheader()
        for row in rows:
            normalized = dict(row)
            normalized["missing_assets"] = " | ".join(row["missing_assets"])
            normalized["double_slash_urls"] = " | ".join(row["double_slash_urls"])
            writer.writerow(normalized)


def main() -> None:
    rows = [audit_page(row) for row in load_p0_rows()]
    write_csv(REPORT_DIR / "T03-P0-audit.csv", rows)

    missing_by_page = "\n".join(
        f"- `{row['path']}`: {row['missing_asset_count']} missing assets, "
        f"{row['meta_description_count']} meta descriptions, {row['h1_count']} H1"
        for row in rows
    )
    detail_lines = []
    for row in rows:
        if row["missing_assets"]:
            detail_lines.append(f"### {row['path']}")
            detail_lines.extend(f"- `{asset}`" for asset in row["missing_assets"][:20])
    details = "\n".join(detail_lines) or "- No missing local assets detected."

    markdown = f"""# T03 P0 Audit

Status: audit complete
Date: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}

## Scope

The audit checks the five P0 English pages from T02.

## Output

- `seo-migration/reports/T03-P0-audit.csv`

## Summary

{missing_by_page}

## Missing Asset Details

{details}

## Notes

- This audit checks local HTML references against files under `public`.
- It does not fetch production assets.
- It does not edit page files.
"""
    (REPORT_DIR / "T03-P0-audit.md").write_text(markdown, encoding="utf-8")
    print({"audited": len(rows), "missing_assets": sum(int(row["missing_asset_count"]) for row in rows)})


if __name__ == "__main__":
    main()

