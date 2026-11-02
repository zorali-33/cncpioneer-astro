import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(__dirname, "..");
const mirroredRoot = path.join(projectRoot, "src", "mirrored-pages");
const publicRoot = path.join(projectRoot, "public");
const reportDir = path.join(projectRoot, "seo-migration", "reports");
const actionPlanPath = path.join(reportDir, "T02-english-action-plan.csv");
const manifestPath = path.join(mirroredRoot, "manifest.json");
const csvPath = path.join(reportDir, "T08-P2-current-link-audit.csv");
const mdPath = path.join(reportDir, "T08-P2-current-link-audit.md");

const manifest = JSON.parse(fs.readFileSync(manifestPath, "utf8"));
const routes = new Set(["/"]);
for (const entry of manifest) routes.add(`/${entry.slug}`.replace(/\/+$/, "") || "/");
routes.add("/custom-cnc-parts");
for (let page = 2; page <= 20; page += 1) routes.add(`/blog/page/${page}`);
for (let page = 2; page <= 20; page += 1) routes.add(`/custom-cnc-parts/page/${page}`);

const pages = parseCsv(fs.readFileSync(actionPlanPath, "utf8"))
  .filter((row) => row.priority === "P2" && row.classification === "mirrored_page_link_technical")
  .map((row) => row.owner)
  .filter(Boolean);

const rows = [];
for (const owner of pages) {
  const file = path.join(mirroredRoot, owner);
  if (!fs.existsSync(file)) {
    rows.push({ page: owner, attr: "", value: "", normalized: "", issue: "missing_source_file", note: "" });
    continue;
  }

  const html = fs.readFileSync(file, "utf8");
  for (const link of extractLinks(html)) {
    for (const value of expandValues(link.value)) {
      const issue = classifyValue(value, link.attr);
      if (!issue) continue;
      rows.push({
        page: owner,
        attr: link.attr,
        value,
        normalized: normalizeUrl(value),
        issue: issue.type,
        note: issue.note,
      });
    }
  }
}

const counts = new Map();
const pageCounts = new Map();
for (const row of rows) {
  counts.set(row.issue, (counts.get(row.issue) || 0) + 1);
  pageCounts.set(row.page, (pageCounts.get(row.page) || 0) + 1);
}

writeCsv(csvPath, rows, ["page", "attr", "value", "normalized", "issue", "note"]);

const issueSummary = [...counts.entries()].sort((a, b) => b[1] - a[1]).map(([issue, count]) => `- ${issue}: ${count}`).join("\n") || "- None";
const pageSummary = [...pageCounts.entries()].sort((a, b) => b[1] - a[1]).slice(0, 25).map(([page, count]) => `- ${page}: ${count}`).join("\n") || "- None";

fs.writeFileSync(mdPath, `# T08 P2 Current Link Audit

Status: complete
Date: ${new Date().toISOString().slice(0, 19).replace("T", " ")}

## Scope

Audited the current local source for the 21 P2 pages classified as \`mirrored_page_link_technical\`.

## Summary

- P2 source pages audited: ${pages.length}
- Current link/resource findings: ${rows.length}

## Issue Counts

${issueSummary}

## Pages With Findings

${pageSummary}

## Outputs

- \`seo-migration/reports/T08-P2-current-link-audit.csv\`
- \`seo-migration/reports/T08-P2-current-link-audit.md\`
`);

console.log(JSON.stringify({
  pagesAudited: pages.length,
  findings: rows.length,
  issues: Object.fromEntries(counts),
}, null, 2));

function classifyValue(value, attr) {
  if (!value || shouldSkip(value)) return null;

  const normalized = normalizeUrl(value);
  if (!normalized) return null;

  if (isCncpioneerAbsolute(value)) {
    return { type: "site_absolute_url", note: "Use root-relative URL to avoid local redirects." };
  }

  if (/^\/[^/]+\/\//.test(normalized)) {
    return { type: "internal_double_slash", note: "Internal path contains a double slash." };
  }

  if (isAssetPath(normalized)) {
    if (!assetExists(normalized)) return { type: "missing_local_asset", note: "Referenced local asset does not exist in public." };
    return null;
  }

  if (isInternalRoute(normalized) && !routeExists(normalized)) {
    return { type: "missing_internal_route", note: "Internal route is not generated locally." };
  }

  return null;
}

function extractLinks(html) {
  const links = [];
  const attrPattern = /\b(href|src|action|data-lazy-src|data-lazy-srcset|srcset|imagesrcset)\s*=\s*(["'])(.*?)\2/gis;
  for (const match of html.matchAll(attrPattern)) {
    links.push({ attr: match[1].toLowerCase(), value: decodeHtml(match[3]) });
  }
  return links;
}

function expandValues(value) {
  if (!value) return [];
  if (value.includes(",") && /\s+\d+[wx](?:,|$)/.test(value)) {
    return value.split(",").map((item) => item.trim().split(/\s+/)[0]).filter(Boolean);
  }
  return [value];
}

function normalizeUrl(value) {
  const trimmed = String(value || "").trim();
  if (!trimmed) return "";
  if (/^https?:\/\/(?:www\.)?cncpioneer\.com\b/i.test(trimmed)) {
    try {
      const parsed = new URL(trimmed);
      return `${parsed.pathname}${parsed.search || ""}${parsed.hash || ""}`;
    } catch {
      return trimmed.replace(/^https?:\/\/(?:www\.)?cncpioneer\.com/i, "");
    }
  }
  return trimmed;
}

function shouldSkip(value) {
  return /^(#|mailto:|tel:|javascript:|data:|blob:)/i.test(value)
    || /^https?:\/\/(?!www\.cncpioneer\.com|cncpioneer\.com)/i.test(value)
    || value.includes("{{");
}

function isCncpioneerAbsolute(value) {
  return /^https?:\/\/(?:www\.)?cncpioneer\.com\b/i.test(value);
}

function isAssetPath(value) {
  return /^\/(?:wp-content|wp-includes)\//.test(value.split(/[?#]/)[0]);
}

function assetExists(value) {
  const cleanPath = value.split(/[?#]/)[0].replace(/^\/+/, "");
  return fs.existsSync(path.join(publicRoot, cleanPath));
}

function isInternalRoute(value) {
  return value.startsWith("/") && !isAssetPath(value);
}

function routeExists(value) {
  const pathname = value.split(/[?#]/)[0].replace(/\/+$/, "") || "/";
  return routes.has(pathname);
}

function decodeHtml(value) {
  return String(value || "")
    .replace(/&#x([0-9a-f]+);/gi, (_, hex) => String.fromCodePoint(Number.parseInt(hex, 16)))
    .replace(/&#(\d+);/g, (_, number) => String.fromCodePoint(Number.parseInt(number, 10)))
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, "\"")
    .replace(/&#039;|&apos;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">");
}

function parseCsv(csvText) {
  const text = csvText.replace(/^\uFEFF/, "");
  const rows = [];
  let row = [];
  let field = "";
  let inQuotes = false;
  for (let index = 0; index < text.length; index += 1) {
    const char = text[index];
    const next = text[index + 1];
    if (inQuotes) {
      if (char === "\"" && next === "\"") {
        field += "\"";
        index += 1;
      } else if (char === "\"") {
        inQuotes = false;
      } else {
        field += char;
      }
      continue;
    }
    if (char === "\"") inQuotes = true;
    else if (char === ",") {
      row.push(field);
      field = "";
    } else if (char === "\n") {
      row.push(field);
      rows.push(row);
      row = [];
      field = "";
    } else if (char !== "\r") {
      field += char;
    }
  }
  if (field || row.length) {
    row.push(field);
    rows.push(row);
  }
  const headers = rows.shift() || [];
  return rows.filter((values) => values.some(Boolean)).map((values) => Object.fromEntries(headers.map((header, index) => [header, values[index] || ""])));
}

function writeCsv(filePath, records, headers) {
  const lines = [headers.join(",")];
  for (const record of records) {
    lines.push(headers.map((header) => csvCell(record[header] || "")).join(","));
  }
  fs.writeFileSync(filePath, `\uFEFF${lines.join("\n")}\n`);
}

function csvCell(value) {
  const text = String(value);
  return /[",\n\r]/.test(text) ? `"${text.replace(/"/g, "\"\"")}"` : text;
}
