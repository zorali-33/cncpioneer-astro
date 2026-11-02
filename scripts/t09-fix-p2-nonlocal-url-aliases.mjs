import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(__dirname, "..");
const mirroredRoot = path.join(projectRoot, "src", "mirrored-pages");
const publicRoot = path.join(projectRoot, "public");
const manifestPath = path.join(mirroredRoot, "manifest.json");
const reportDir = path.join(projectRoot, "seo-migration", "reports");
const reportPath = path.join(reportDir, "T09-P2-nonlocal-url-fix-report.md");
const changesPath = path.join(reportDir, "T09-P2-nonlocal-url-changes.csv");

const redirects = [
  ["/blog/cnc-milling-parts", "/blog/cnc-milling-machine-parts", "CNC Milling Parts Redirect"],
  ["/blog/medical-swiss-machining", "/industries/medical-swiss-machining", "Medical Swiss Machining Redirect"],
  ["/industries/railroad-machining-services", "/industries/railway", "Railroad Machining Services Redirect"],
];

const dynamicBlogRedirects = [15, 16, 17, 18, 19, 20]
  .map((page) => [`/blog/page/${page}`, "/blog/page/14"]);

const assetAliases = [
  ["/wp-content/uploads/2021/07/5-Axis-Aluminum-Alloy-CNC-Precision-Machining-Medical-Parts.jpg", "/wp-content/uploads/2026/01/medical-cnc-machining.jpg"],
  ["/wp-content/uploads/2024/08/aluminum-alloys-and-their-melting-points-1024x658.webp", "/wp-content/uploads/2026/03/cnc-aluminum-milling.webp"],
  ["/wp-content/uploads/2026/06/construction-agricultural-reducer.jpg", "/wp-content/uploads/2026/05/construction-mining-gearbox-housing.jpg"],
  ["/wp-content/uploads/2026/06/robot-cell-chip-coolant-peripheral-hardware.jpg", "/wp-content/uploads/2026/06/robot-cell-measurement-air-gauge-vision-cmm.jpg"],
  ["/wp-content/uploads/2026/09/electricals.jpg", "/wp-content/uploads/2026/04/brass-electrical-connector-terminals.jpg"],
  ["/wp-content/uploads/2026/09/fluid-control.jpg", "/wp-content/uploads/2026/04/fluid-control.jpg"],
  ["/wp-content/uploads/2026/09/industrial-machinery.jpg", "/wp-content/uploads/2026/05/industrial-machinery.jpg"],
];

const changes = [];
let redirectPagesWritten = 0;
for (const [source, target, title] of redirects) {
  const file = path.join(mirroredRoot, source.replace(/^\/+/, ""), "index.html");
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, redirectHtml({ source, target, title }));
  redirectPagesWritten += 1;
  changes.push({ type: "redirect_page", source, target, file: rel(file), status: "written" });
}

const manifest = JSON.parse(fs.readFileSync(manifestPath, "utf8"));
const slugs = new Set(manifest.map((entry) => entry.slug));
let manifestAdded = 0;
for (const [source] of redirects) {
  const slug = source.replace(/^\/+/, "");
  if (slugs.has(slug)) continue;
  manifest.push({ slug, file: `${slug}/index.html` });
  slugs.add(slug);
  manifestAdded += 1;
}
const dynamicBlogRedirectSlugs = new Set(dynamicBlogRedirects.map(([source]) => source.replace(/^\/+/, "")));
const cleanedManifest = manifest
  .filter((entry) => !dynamicBlogRedirectSlugs.has(entry.slug))
  .sort((a, b) => a.slug.localeCompare(b.slug, "en", { sensitivity: "base" }));
fs.writeFileSync(manifestPath, `${JSON.stringify(cleanedManifest, null, 2)}\n`);

let assetAliasesWritten = 0;
for (const [target, source] of assetAliases) {
  const sourceFile = path.join(publicRoot, source.replace(/^\/+/, ""));
  const targetFile = path.join(publicRoot, target.replace(/^\/+/, ""));
  if (!fs.existsSync(sourceFile)) {
    changes.push({ type: "asset_alias", source, target, file: rel(targetFile), status: "missing_source" });
    continue;
  }

  fs.mkdirSync(path.dirname(targetFile), { recursive: true });
  fs.copyFileSync(sourceFile, targetFile);
  assetAliasesWritten += 1;
  changes.push({ type: "asset_alias", source, target, file: rel(targetFile), status: "written" });
}

for (const [source, target] of dynamicBlogRedirects) {
  changes.push({
    type: "dynamic_redirect_page",
    source,
    target,
    file: "src/pages/blog/page/[page].astro",
    status: "handled_by_dynamic_route",
  });
}

writeCsv(changesPath, changes, ["type", "source", "target", "file", "status"]);

fs.writeFileSync(reportPath, `# T09 P2 Nonlocal URL Fix

Status: complete
Date: ${new Date().toISOString().slice(0, 19).replace("T", " ")}

## Scope

Handled P2 URLs classified as \`ahrefs_only_nonlocal_url\` where the current local build still lacked a route or asset path.

## Summary

- Redirect fallback pages written: ${redirectPagesWritten}
- Manifest entries added: ${manifestAdded}
- Historical asset aliases written: ${assetAliasesWritten}

## Redirect Map

${redirects.map(([source, target]) => `- \`${source}\` -> \`${target}\``).join("\n")}

## Dynamic Blog Pagination Redirects

${dynamicBlogRedirects.map(([source, target]) => `- \`${source}\` -> \`${target}\``).join("\n")}

## Asset Aliases

${assetAliases.map(([target, source]) => `- \`${target}\` <- \`${source}\``).join("\n")}

## Notes

- Fallback pages are static \`noindex, follow\` redirect pages using meta refresh and JavaScript.
- Historical \`/blog/page/15-20\` URLs are handled by the dedicated Astro blog pagination route to avoid route priority conflicts.
- \`/services//swiss-machining\` resolves to the canonical \`/services/swiss-machining\` route in the local static output; internal double-slash links were already fixed in T08.

## Outputs

- \`seo-migration/reports/T09-P2-nonlocal-url-fix-report.md\`
- \`seo-migration/reports/T09-P2-nonlocal-url-changes.csv\`
`);

console.log(JSON.stringify({
  redirectPagesWritten,
  manifestAdded,
  assetAliasesWritten,
}, null, 2));

function redirectHtml({ source, target, title }) {
  const description = `${title} from CNCPioneer now points visitors to the closest current CNC machining resource while preserving the historical URL path.`;
  const canonical = `https://www.cncpioneer.com${target}`;
  return `<!doctype html>
<html lang="en-US">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${escapeHtml(title)} | CNCPioneer</title>
  <meta name="description" content="${escapeAttr(description)}">
  <meta name="robots" content="noindex, follow">
  <link rel="canonical" href="${escapeAttr(canonical)}">
  <meta property="og:title" content="${escapeAttr(`${title} | CNCPioneer`)}">
  <meta property="og:description" content="${escapeAttr(description)}">
  <meta property="og:url" content="${escapeAttr(canonical)}">
  <meta http-equiv="refresh" content="0; url=${escapeAttr(target)}">
  <script>window.location.replace(${JSON.stringify(target)});</script>
</head>
<body>
  <main>
    <h1>${escapeHtml(title)}</h1>
    <p>The historical URL <code>${escapeHtml(source)}</code> has moved to <a href="${escapeAttr(target)}">${escapeHtml(target)}</a>.</p>
  </main>
</body>
</html>
`;
}

function rel(file) {
  return path.relative(projectRoot, file).replaceAll("\\", "/");
}

function escapeHtml(value) {
  return String(value || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function escapeAttr(value) {
  return escapeHtml(value)
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
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
