import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(__dirname, "..");
const distRoot = path.join(projectRoot, "dist");
const reportDir = path.join(projectRoot, "seo-migration", "reports");
const csvPath = path.join(reportDir, "T19-dist-route-manifest.csv");
const mdPath = path.join(reportDir, "T19-dist-route-manifest.md");
const site = "https://www.cncpioneer.com";

if (!fs.existsSync(distRoot)) {
  throw new Error("dist directory does not exist. Run npm run build first.");
}

const sitemapSet = new Set(readSitemapUrls().map(normalizeUrl));
const rows = findFiles(distRoot, /^index\.html$/)
  .map((file) => {
    const html = fs.readFileSync(file, "utf8");
    const route = routeFromFile(file);
    const title = clean(extractTag(html, "title"));
    const description = clean(extractMeta(html, "name", "description"));
    const canonical = clean(extractLink(html, "canonical"));
    const ogUrl = clean(extractMeta(html, "property", "og:url"));
    const noindex = extractMetaAll(html, "name", "robots").some((value) => /\bnoindex\b/i.test(value));
    const sitemapUrl = noindex ? normalizeUrl(`${site}${route}`) : normalizeUrl(canonical || `${site}${route}`);
    return {
      route,
      indexable: noindex ? "no" : "yes",
      in_sitemap: sitemapSet.has(sitemapUrl) ? "yes" : "no",
      title_length: String(title.length),
      description_length: String(description.length),
      canonical,
      og_url: ogUrl,
      title,
      description,
    };
  })
  .sort((a, b) => a.route.localeCompare(b.route, "en", { sensitivity: "base" }));

writeCsv(csvPath, rows, [
  "route",
  "indexable",
  "in_sitemap",
  "title_length",
  "description_length",
  "canonical",
  "og_url",
  "title",
  "description",
]);

const indexable = rows.filter((row) => row.indexable === "yes");
const noindex = rows.filter((row) => row.indexable === "no");
const sitemapIncluded = rows.filter((row) => row.in_sitemap === "yes");

fs.writeFileSync(mdPath, `# T19 Dist Route Manifest

Status: generated
Date: ${new Date().toISOString().slice(0, 19).replace("T", " ")}

## Scope

Generated a page-level manifest from the current \`dist\` HTML output.

## Summary

- HTML routes listed: ${rows.length}
- Indexable routes: ${indexable.length}
- Noindex routes: ${noindex.length}
- Routes marked in sitemap: ${sitemapIncluded.length}

## Output

- \`seo-migration/reports/T19-dist-route-manifest.csv\`
`);

console.log(JSON.stringify({
  routes: rows.length,
  indexable: indexable.length,
  noindex: noindex.length,
  inSitemap: sitemapIncluded.length,
}, null, 2));

function readSitemapUrls() {
  const sitemapPath = path.join(distRoot, "sitemap.xml");
  if (!fs.existsSync(sitemapPath)) return [];
  const xml = fs.readFileSync(sitemapPath, "utf8");
  return [...xml.matchAll(/<loc>([\s\S]*?)<\/loc>/g)].map((match) => decodeHtml(match[1].trim()));
}

function findFiles(root, filePattern) {
  const found = [];
  for (const entry of fs.readdirSync(root, { withFileTypes: true })) {
    const full = path.join(root, entry.name);
    if (entry.isDirectory()) found.push(...findFiles(full, filePattern));
    else if (filePattern.test(entry.name)) found.push(full);
  }
  return found;
}

function routeFromFile(file) {
  const dir = path.relative(distRoot, path.dirname(file)).replaceAll("\\", "/");
  return dir ? `/${dir}/` : "/";
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
