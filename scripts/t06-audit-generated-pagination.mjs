import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(__dirname, "..");
const distRoot = path.join(projectRoot, "dist");
const reportDir = path.join(projectRoot, "seo-migration", "reports");
const csvPath = path.join(reportDir, "T06-generated-pagination-audit.csv");
const mdPath = path.join(reportDir, "T06-generated-pagination-audit.md");

const targets = [
  ...findFiles(path.join(distRoot, "blog", "page"), /^index\.html$/),
  ...findFiles(path.join(distRoot, "author"), /^index\.html$/).filter((file) => /\\page\\\d+\\index\.html$/.test(file)),
  ...findFiles(path.join(distRoot, "custom-cnc-parts", "page"), /^index\.html$/),
];

const rows = targets.map(auditFile);
const problemRows = rows.filter((row) => row.problems);
const counts = new Map();
for (const row of problemRows) {
  for (const problem of row.problems.split(" | ")) {
    counts.set(problem, (counts.get(problem) || 0) + 1);
  }
}

writeCsv(csvPath, rows, [
  "path",
  "file",
  "title_length",
  "meta_description_length",
  "h1_count",
  "canonical",
  "og_url",
  "prev_count",
  "next_count",
  "problems",
  "title",
  "meta_description",
]);

const summary = [...counts.entries()].sort((a, b) => b[1] - a[1])
  .map(([problem, count]) => `- ${problem}: ${count}`)
  .join("\n") || "- None";

fs.writeFileSync(mdPath, `# T06 Generated Pagination Audit

Status: complete
Date: ${new Date().toISOString().slice(0, 19).replace("T", " ")}

## Scope

Audited generated archive pagination pages in \`dist\`:

- \`/blog/page/*\`
- \`/author/*/page/*\`
- \`/custom-cnc-parts/page/*\`

## Summary

- Generated pagination pages audited: ${rows.length}
- Pages passing checks: ${rows.length - problemRows.length}
- Pages with problems: ${problemRows.length}

## Problem Counts

${summary}

## Outputs

- \`seo-migration/reports/T06-generated-pagination-audit.csv\`
- \`seo-migration/reports/T06-generated-pagination-audit.md\`
`);

console.log(JSON.stringify({
  audited: rows.length,
  clean: rows.length - problemRows.length,
  problemPages: problemRows.length,
  problems: Object.fromEntries(counts),
}, null, 2));

function auditFile(file) {
  const html = fs.readFileSync(file, "utf8");
  const route = `/${path.relative(distRoot, path.dirname(file)).replaceAll("\\", "/")}`;
  const title = clean(extractTag(html, "title"));
  const description = clean(extractMeta(html, "name", "description"));
  const canonical = clean(extractLink(html, "canonical"));
  const ogUrl = clean(extractMeta(html, "property", "og:url"));
  const h1Count = countMatches(html, /<h1\b/gi);
  const prevCount = countMatches(html, /<link\b(?=[^>]*rel=["']prev["'])/gi);
  const nextCount = countMatches(html, /<link\b(?=[^>]*rel=["']next["'])/gi);
  const problems = [];

  if (title.length < 30) problems.push("title_too_short");
  if (title.length > 60) problems.push("title_too_long");
  if (description.length < 120) problems.push("meta_description_too_short");
  if (description.length > 155) problems.push("meta_description_too_long");
  if (h1Count !== 1) problems.push("h1_count_not_one");
  if (!canonical) problems.push("missing_canonical");
  if (!ogUrl) problems.push("missing_og_url");
  if (canonical && ogUrl && normalizeUrl(canonical) !== normalizeUrl(ogUrl)) problems.push("og_url_canonical_mismatch");

  return {
    path: route,
    file: path.relative(projectRoot, file).replaceAll("\\", "/"),
    title_length: String(title.length),
    meta_description_length: String(description.length),
    h1_count: String(h1Count),
    canonical,
    og_url: ogUrl,
    prev_count: String(prevCount),
    next_count: String(nextCount),
    problems: problems.join(" | "),
    title,
    meta_description: description,
  };
}

function findFiles(root, filePattern) {
  if (!fs.existsSync(root)) return [];
  const found = [];
  for (const entry of fs.readdirSync(root, { withFileTypes: true })) {
    const fullPath = path.join(root, entry.name);
    if (entry.isDirectory()) {
      found.push(...findFiles(fullPath, filePattern));
    } else if (filePattern.test(entry.name)) {
      found.push(fullPath);
    }
  }
  return found;
}

function extractTag(html, tag) {
  return html.match(new RegExp(`<${tag}\\b[^>]*>([\\s\\S]*?)<\\/${tag}>`, "i"))?.[1] || "";
}

function extractMeta(html, attr, key) {
  const tags = html.match(/<meta\b[^>]*>/gi) || [];
  const tag = tags.find((item) => getAttr(item, attr).toLowerCase() === key.toLowerCase());
  return tag ? getAttr(tag, "content") : "";
}

function extractLink(html, rel) {
  const tags = html.match(/<link\b[^>]*>/gi) || [];
  const tag = tags.find((item) => getAttr(item, "rel").toLowerCase() === rel.toLowerCase());
  return tag ? getAttr(tag, "href") : "";
}

function getAttr(tag, name) {
  const match = tag.match(new RegExp(`\\b${name}\\s*=\\s*(["'])(.*?)\\1`, "i"));
  return match ? decodeHtml(match[2]) : "";
}

function clean(value) {
  return decodeHtml(String(value || "").replace(/<[^>]+>/g, " ")).replace(/\s+/g, " ").trim();
}

function decodeHtml(value) {
  return String(value || "")
    .replace(/&#x([0-9a-f]+);/gi, (_, hex) => String.fromCodePoint(Number.parseInt(hex, 16)))
    .replace(/&#(\d+);/g, (_, number) => String.fromCodePoint(Number.parseInt(number, 10)))
    .replace(/&quot;/g, "\"")
    .replace(/&#039;|&apos;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&amp;/g, "&");
}

function normalizeUrl(value) {
  return String(value || "").replace(/^https?:\/\/(?:www\.)?cncpioneer\.com/i, "").replace(/\/+$/, "") || "/";
}

function countMatches(value, pattern) {
  return (value.match(pattern) || []).length;
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
