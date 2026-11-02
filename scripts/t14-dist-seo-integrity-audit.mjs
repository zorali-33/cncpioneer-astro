import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(__dirname, "..");
const distRoot = path.join(projectRoot, "dist");
const reportDir = path.join(projectRoot, "seo-migration", "reports");
const csvPath = path.join(reportDir, "T14-dist-seo-integrity-audit.csv");
const mdPath = path.join(reportDir, "T14-dist-seo-integrity-audit.md");
const site = "https://www.cncpioneer.com";

if (!fs.existsSync(distRoot)) {
  throw new Error("dist directory does not exist. Run npm run build first.");
}

const sitemapUrls = readSitemapUrls();
const sitemapSet = new Set(sitemapUrls.map(normalizeUrl));
const pages = findFiles(distRoot, /^index\.html$/).map(auditPage);
const rows = pages.sort((a, b) => a.path.localeCompare(b.path, "en", { sensitivity: "base" }));
const problemRows = rows.filter((row) => row.problems);
const indexableRows = rows.filter((row) => row.indexable === "yes");
const noindexRows = rows.filter((row) => row.indexable === "no");
const counts = countProblems(problemRows);

writeCsv(csvPath, rows, [
  "path",
  "indexable",
  "in_sitemap",
  "title_length",
  "meta_description_length",
  "h1_count",
  "canonical",
  "og_url",
  "problems",
  "title",
  "meta_description",
]);

fs.writeFileSync(mdPath, `# T14 Dist SEO Integrity Audit

Status: ${problemRows.length ? "needs attention" : "pass"}
Date: ${new Date().toISOString().slice(0, 19).replace("T", " ")}

## Scope

Audited every generated \`index.html\` in \`dist\` for SEO integrity after the static build.

## Summary

- HTML pages audited: ${rows.length}
- Indexable pages audited: ${indexableRows.length}
- Noindex pages audited: ${noindexRows.length}
- Sitemap URLs: ${sitemapUrls.length}
- Pages with problems: ${problemRows.length}

## Problem Counts

${formatCounts(counts)}

## Rules

- Indexable pages require one title, one meta description, one canonical, one \`og:url\`, one H1, and sitemap inclusion.
- Title target: 30-60 characters.
- Meta description target: 120-155 characters.
- Canonical and \`og:url\` must match after normalizing the \`${site}\` origin.
- Noindex pages must be excluded from sitemap.

## Outputs

- \`seo-migration/reports/T14-dist-seo-integrity-audit.csv\`
- \`seo-migration/reports/T14-dist-seo-integrity-audit.md\`
`);

console.log(JSON.stringify({
  pagesAudited: rows.length,
  indexable: indexableRows.length,
  noindex: noindexRows.length,
  sitemapUrls: sitemapUrls.length,
  problemPages: problemRows.length,
  problems: counts,
}, null, 2));

process.exit(problemRows.length ? 1 : 0);

function auditPage(file) {
  const html = fs.readFileSync(file, "utf8");
  const route = routeFromFile(file);
  const title = clean(extractTag(html, "title"));
  const descriptions = extractMetaAll(html, "name", "description").map(clean);
  const h1Count = countMatches(html, /<h1\b/gi);
  const canonical = clean(extractLink(html, "canonical"));
  const ogUrl = clean(extractMeta(html, "property", "og:url"));
  const noindex = extractMetaAll(html, "name", "robots").some((value) => /\bnoindex\b/i.test(value));
  const normalizedRoute = normalizeUrl(`${site}${route}`);
  const normalizedCanonical = normalizeUrl(canonical || `${site}${route}`);
  const inSitemap = noindex ? sitemapSet.has(normalizedRoute) : sitemapSet.has(normalizedCanonical);
  const problems = [];

  if (!title) problems.push("missing_title");
  else if (!noindex && title.length < 30) problems.push("title_too_short");
  else if (!noindex && title.length > 60) problems.push("title_too_long");

  if (descriptions.length === 0) problems.push("missing_meta_description");
  else if (descriptions.length > 1) problems.push("multiple_meta_description");
  else if (!noindex && descriptions[0].length < 120) problems.push("meta_description_too_short");
  else if (!noindex && descriptions[0].length > 155) problems.push("meta_description_too_long");

  if (h1Count !== 1) problems.push("h1_count_not_one");
  if (!canonical) problems.push("missing_canonical");
  if (!ogUrl) problems.push("missing_og_url");
  if (canonical && ogUrl && normalizeUrl(canonical) !== normalizeUrl(ogUrl)) problems.push("og_url_canonical_mismatch");

  if (noindex && inSitemap) problems.push("noindex_in_sitemap");
  if (!noindex && !inSitemap) problems.push("indexable_missing_from_sitemap");

  return {
    path: route,
    indexable: noindex ? "no" : "yes",
    in_sitemap: inSitemap ? "yes" : "no",
    title_length: String(title.length),
    meta_description_length: String(descriptions[0]?.length || 0),
    h1_count: String(h1Count),
    canonical,
    og_url: ogUrl,
    problems: problems.join(" | "),
    title,
    meta_description: descriptions[0] || "",
  };
}

function readSitemapUrls() {
  const sitemapPath = path.join(distRoot, "sitemap.xml");
  if (!fs.existsSync(sitemapPath)) return [];
  const xml = fs.readFileSync(sitemapPath, "utf8");
  return [...xml.matchAll(/<loc>([\s\S]*?)<\/loc>/g)].map((match) => decodeHtml(match[1].trim()));
}

function routeFromFile(file) {
  const dir = path.relative(distRoot, path.dirname(file)).replaceAll("\\", "/");
  return dir ? `/${dir}/` : "/";
}

function findFiles(root, filePattern) {
  if (!fs.existsSync(root)) return [];
  const found = [];
  for (const entry of fs.readdirSync(root, { withFileTypes: true })) {
    const full = path.join(root, entry.name);
    if (entry.isDirectory()) found.push(...findFiles(full, filePattern));
    else if (filePattern.test(entry.name)) found.push(full);
  }
  return found;
}

function extractTag(html, tag) {
  return html.match(new RegExp(`<${tag}\\b[^>]*>([\\s\\S]*?)<\\/${tag}>`, "i"))?.[1] || "";
}

function extractMeta(html, attr, key) {
  return extractMetaAll(html, attr, key)[0] || "";
}

function extractMetaAll(html, attr, key) {
  return (html.match(/<meta\b[^>]*>/gi) || [])
    .filter((tag) => getAttr(tag, attr).toLowerCase() === key.toLowerCase())
    .map((tag) => getAttr(tag, "content"));
}

function extractLink(html, rel) {
  const tag = (html.match(/<link\b[^>]*>/gi) || [])
    .find((item) => getAttr(item, "rel").toLowerCase() === rel.toLowerCase());
  return tag ? getAttr(tag, "href") : "";
}

function getAttr(tag, name) {
  const match = tag.match(new RegExp(`\\b${name}\\s*=\\s*(["'])(.*?)\\1`, "i"));
  return match ? decodeHtml(match[2]) : "";
}

function normalizeUrl(value) {
  const text = String(value || "").trim();
  if (!text) return "";
  let pathname = text;
  try {
    const parsed = new URL(text, site);
    pathname = parsed.pathname;
  } catch {
    pathname = text.replace(/^https?:\/\/(?:www\.)?cncpioneer\.com/i, "");
  }
  const cleanPath = `/${pathname.replace(/^\/+/, "")}`.replace(/\/+$/, "") || "/";
  return `${site}${cleanPath === "/" ? "/" : `${cleanPath}/`}`;
}

function countProblems(records) {
  const counts = {};
  for (const record of records) {
    for (const problem of record.problems.split(" | ").filter(Boolean)) {
      counts[problem] = (counts[problem] || 0) + 1;
    }
  }
  return counts;
}

function formatCounts(counts) {
  return Object.entries(counts)
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
    .map(([name, count]) => `- ${name}: ${count}`)
    .join("\n") || "- None";
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
