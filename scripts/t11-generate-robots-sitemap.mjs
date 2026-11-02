import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { isRetiredMaterial } from "../src/data/materialRedirects.mjs";
import { isRetiredIndustry } from '../src/data/industryRedirects.mjs';
import { isConsolidatedRoute } from '../src/data/blogConsolidation.mjs';
import { isRemovedProductRoute } from '../src/data/productRemovals.mjs';
import { isRetiredProduct } from '../src/data/productRedirects.mjs';
import { isRetiredService } from '../src/data/serviceRedirects.mjs';
import { isRemovedBlogRoute } from '../src/data/blogRemovals.mjs';
import { isNotFoundPagePath } from '../src/data/pageRemovals.mjs';
import { SITE_URL, canonicalPageUrl, normalizePagePath } from '../src/data/siteUrls.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(__dirname, "..");
const distRoot = process.argv[2] ? path.resolve(process.argv[2]) : path.join(projectRoot, "dist");
const reportDir = process.argv[3] ? path.resolve(process.argv[3]) : path.join(projectRoot, "seo-migration", "reports");
fs.mkdirSync(reportDir, { recursive: true });
const csvPath = path.join(reportDir, "T11-site-indexing-assets.csv");
const mdPath = path.join(reportDir, "T11-site-indexing-assets-report.md");
const site = SITE_URL;

if (!fs.existsSync(distRoot)) {
  throw new Error("dist directory does not exist. Run the Astro build before generating sitemap assets.");
}

const pages = findFiles(distRoot, /^index\.html$/)
  .map(auditPage)
  .sort((a, b) => a.path.localeCompare(b.path, "en", { sensitivity: "base" }));

const indexable = pages.filter((page) => page.indexable);
const skipped = pages.filter((page) => !page.indexable);

fs.writeFileSync(path.join(distRoot, "sitemap.xml"), renderSitemap(indexable));
fs.writeFileSync(path.join(distRoot, "robots.txt"), renderRobots());

const rows = pages.map((page) => ({
  path: page.path,
  status: page.indexable ? "included" : "excluded",
  reason: page.reason,
  loc: page.indexable ? page.canonical : "",
  lastmod: page.indexable ? page.lastmod : "",
}));
writeCsv(csvPath, rows, ["path", "status", "reason", "loc", "lastmod"]);

fs.writeFileSync(mdPath, `# T11 Site Indexing Assets

Status: complete
Date: ${new Date().toISOString().slice(0, 19).replace("T", " ")}

## Scope

Generated production indexing assets from the built \`dist\` directory.

## Summary

- HTML index pages scanned: ${pages.length}
- URLs included in sitemap: ${indexable.length}
- URLs excluded from sitemap: ${skipped.length}
- Robots file: \`dist/robots.txt\`
- Sitemap file: \`dist/sitemap.xml\`

## Exclusions

${formatExclusions(skipped)}

## Rules

- Pages with \`<meta name="robots" content="noindex, follow">\` are excluded.
- The root page is emitted as \`${site}/\`.
- Other routes use the page's absolute canonical URL, without a trailing slash.
- Lastmod comes from the explicit page revision ledger / source content dates rendered in the page; unknown dates are omitted. Rebuilding does not update it.

## Outputs

- \`dist/robots.txt\`
- \`dist/sitemap.xml\`
- \`seo-migration/reports/T11-site-indexing-assets.csv\`
- \`seo-migration/reports/T11-site-indexing-assets-report.md\`
`);

console.log(JSON.stringify({
  scanned: pages.length,
  sitemapUrls: indexable.length,
  excluded: skipped.length,
  robots: "dist/robots.txt",
  sitemap: "dist/sitemap.xml",
}, null, 2));

function auditPage(file) {
  const html = fs.readFileSync(file, "utf8");
  const route = routeFromFile(file);
  const removed = isNotFoundPagePath(route) || isRemovedBlogRoute(route) || isRemovedProductRoute(route);
  const redirect = isRetiredIndustry(route) || isConsolidatedRoute(route) || isRetiredProduct(route) || isRetiredMaterial(route) || isRetiredService(route) || /<meta\b[^>]*http-equiv=["']refresh["']/i.test(html);
  const noindex = (html.match(/<meta\b[^>]*>/gi) || [])
    .some((tag) => getAttr(tag, "name").toLowerCase() === "robots"
      && getAttr(tag, "content").toLowerCase().includes("noindex"));
  const canonicalTag = (html.match(/<link\b[^>]*>/gi) || []).find((tag) => getAttr(tag, 'rel').toLowerCase() === 'canonical');
  const canonical = canonicalTag ? getAttr(canonicalTag, 'href') : '';
  const modifiedTag = (html.match(/<meta\b[^>]*>/gi) || []).find((tag) => getAttr(tag, 'name') === 'last-modified');
  const lastmod = modifiedTag ? getAttr(modifiedTag, 'content') : '';
  if (!removed && !noindex && !redirect && canonical !== canonicalPageUrl(route)) throw new Error(`Canonical mismatch for ${route}: ${canonical}`);
  if (lastmod && (!/^\d{4}-\d{2}-\d{2}$/.test(lastmod) || Number.isNaN(Date.parse(lastmod)))) throw new Error(`Invalid lastmod for ${route}`);
  return {
    path: route,
    file,
    canonical,
    lastmod,
    indexable: !removed && !noindex && !redirect,
    reason: removed ? "removed" : redirect ? "redirect" : noindex ? "noindex" : "indexable",
  };
}

function routeFromFile(file) {
  const dir = path.relative(distRoot, path.dirname(file)).replaceAll("\\", "/");
  if (!dir) return "/";
  return normalizePagePath(`/${dir.replace(/\/index$/, "")}`);
}

function renderSitemap(records) {
  const urls = records.map((page) => {
    return `  <url>
    <loc>${escapeXml(page.canonical)}</loc>${page.lastmod ? `\n    <lastmod>${escapeXml(page.lastmod)}</lastmod>` : ''}
  </url>`;
  }).join("\n");

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>
`;
}

function renderRobots() {
  return `User-agent: *
Allow: /

Sitemap: ${site}/sitemap.xml
`;
}

function findFiles(root, filePattern) {
  if (!fs.existsSync(root)) return [];
  const found = [];
  for (const entry of fs.readdirSync(root, { withFileTypes: true })) {
    const fullPath = path.join(root, entry.name);
    if (entry.isDirectory()) found.push(...findFiles(fullPath, filePattern));
    else if (filePattern.test(entry.name)) found.push(fullPath);
  }
  return found;
}

function formatExclusions(records) {
  if (!records.length) return "- None";
  return records.map((page) => `- \`${page.path}\`: ${page.reason}`).join("\n");
}

function escapeXml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function getAttr(tag, name) {
  const match = tag.match(new RegExp(`\\b${name}\\s*=\\s*(["'])(.*?)\\1`, "i"));
  return match ? match[2] : "";
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
