import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(__dirname, "..");
const mirroredRoot = path.join(projectRoot, "src", "mirrored-pages");
const publicRoot = path.join(projectRoot, "public");
const manifestPath = path.join(mirroredRoot, "manifest.json");
const reportDir = path.join(projectRoot, "seo-migration", "reports");
const reportPath = path.join(reportDir, "T07-P1-missing-blog-url-fix-report.md");
const changesPath = path.join(reportDir, "T07-P1-missing-blog-url-changes.csv");

const redirects = [
  {
    source: "/blog/ai-cnc-machining",
    target: "/blog/what-is-cnc",
    title: "AI CNC Machining Redirect | CNCPioneer",
    description: "This historical AI CNC machining URL now points readers to CNCPioneer's CNC machining guide for process basics, capabilities, design notes, and manufacturing context.",
    reason: "Historical Ahrefs 404 with no local source page; closest existing general CNC machining guide.",
  },
  {
    source: "/blog/ai-cnc-programming",
    target: "/blog/what-is-cnc",
    title: "AI CNC Programming Redirect | CNCPioneer",
    description: "This historical AI CNC programming URL now points readers to CNCPioneer's CNC guide for programming context, machining basics, process choices, and design advice.",
    reason: "Historical Ahrefs 404 with no local source page; closest existing CNC fundamentals article.",
  },
  {
    source: "/blog/cnc-locating-pinsi",
    target: "/blog/cnc-locating-pins",
    title: "CNC Locating Pins Redirect | CNCPioneer",
    description: "This misspelled CNC locating pins URL now points to the correct CNCPioneer article about locating pin types, design principles, tolerances, and applications.",
    reason: "Typo URL found in existing internal reference links.",
  },
  {
    source: "/blog/cnc-machining-defense",
    target: "/blog/cnc-milling-and-turning-defense",
    title: "CNC Machining Defense Redirect | CNCPioneer",
    description: "This historical defense CNC machining URL now points to CNCPioneer's defense milling and turning guide for materials, tolerances, quality, and applications.",
    reason: "Historical Ahrefs 404 and related defense article already exists locally.",
  },
  {
    source: "/blog/swiss-machining-defense",
    target: "/services/swiss-machining",
    title: "Swiss Machining Defense Redirect | CNCPioneer",
    description: "This historical Swiss machining defense URL now points to CNCPioneer's Swiss machining service page for precision components, materials, tolerances, and quality support.",
    reason: "Historical Ahrefs 404 and no matching local article; closest existing Swiss machining page.",
  },
];

const linkMap = new Map(redirects.map((item) => [item.source, item.target]));
const changes = [];

let filesScanned = 0;
let filesWithReplacements = 0;
let replacements = 0;

for (const file of [...findHtmlFiles(mirroredRoot), ...findCacheFiles(publicRoot)]) {
  filesScanned += 1;
  const before = fs.readFileSync(file, "utf8");
  let after = before;

  for (const [source, target] of linkMap) {
    const pattern = new RegExp(escapeRegExp(source), "g");
    const matches = after.match(pattern);
    if (!matches) continue;

    after = after.replace(pattern, target);
    replacements += matches.length;
    changes.push({
      type: "internal_link",
      source,
      target,
      file: path.relative(projectRoot, file).replaceAll("\\", "/"),
      count: String(matches.length),
      note: "Updated internal reference away from historical 404 URL.",
    });
  }

  if (after !== before) {
    fs.writeFileSync(file, after);
    filesWithReplacements += 1;
  }
}

let redirectPagesWritten = 0;
for (const item of redirects) {
  const file = path.join(mirroredRoot, item.source.replace(/^\/+/, ""), "index.html");
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, redirectHtml(item));
  redirectPagesWritten += 1;
  changes.push({
    type: "redirect_page",
    source: item.source,
    target: item.target,
    file: path.relative(projectRoot, file).replaceAll("\\", "/"),
    count: "1",
    note: item.reason,
  });
}

const manifest = JSON.parse(fs.readFileSync(manifestPath, "utf8"));
const existingSlugs = new Set(manifest.map((entry) => entry.slug));
let manifestAdded = 0;
for (const item of redirects) {
  const slug = item.source.replace(/^\/+/, "");
  if (existingSlugs.has(slug)) continue;
  manifest.push({ slug, file: `${slug}/index.html` });
  existingSlugs.add(slug);
  manifestAdded += 1;
}

manifest.sort((a, b) => a.slug.localeCompare(b.slug, "en", { sensitivity: "base" }));
fs.writeFileSync(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`);

writeCsv(changesPath, changes, ["type", "source", "target", "file", "count", "note"]);

fs.writeFileSync(reportPath, `# T07 P1 Missing Blog URL Fix

Status: complete
Date: ${new Date().toISOString().slice(0, 19).replace("T", " ")}

## Scope

Handled the 6 English P1 historical blog URLs classified as \`ahrefs_only_missing_blog_url\`.

## Summary

- HTML files scanned: ${filesScanned}
- Files with internal link replacements: ${filesWithReplacements}
- Internal URL replacements: ${replacements}
- Redirect fallback pages written: ${redirectPagesWritten}
- Manifest entries added: ${manifestAdded}

## Redirect Map

${redirects.map((item) => `- \`${item.source}\` -> \`${item.target}\``).join("\n")}

## Outputs

- \`seo-migration/reports/T07-P1-missing-blog-url-fix-report.md\`
- \`seo-migration/reports/T07-P1-missing-blog-url-changes.csv\`

## Notes

- The static fallback pages use meta refresh and JavaScript redirection because this local Astro static build does not define server-level 301 redirects.
- Internal links were updated to point directly to current local pages where possible.
`);

console.log(JSON.stringify({
  filesScanned,
  filesWithReplacements,
  replacements,
  redirectPagesWritten,
  manifestAdded,
}, null, 2));

function redirectHtml(item) {
  const canonical = `https://www.cncpioneer.com${item.target}`;
  return `<!doctype html>
<html lang="en-US">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${escapeHtml(item.title)}</title>
  <meta name="description" content="${escapeAttr(item.description)}">
  <meta name="robots" content="noindex, follow">
  <link rel="canonical" href="${escapeAttr(canonical)}">
  <meta property="og:title" content="${escapeAttr(item.title)}">
  <meta property="og:description" content="${escapeAttr(item.description)}">
  <meta property="og:url" content="${escapeAttr(canonical)}">
  <meta http-equiv="refresh" content="0; url=${escapeAttr(item.target)}">
  <script>window.location.replace(${JSON.stringify(item.target)});</script>
</head>
<body>
  <main>
    <h1>${escapeHtml(item.title.replace(" Redirect | CNCPioneer", ""))}</h1>
    <p>This page has moved to <a href="${escapeAttr(item.target)}">${escapeHtml(item.target)}</a>.</p>
  </main>
</body>
</html>
`;
}

function findHtmlFiles(root) {
  const files = [];
  for (const entry of fs.readdirSync(root, { withFileTypes: true })) {
    const fullPath = path.join(root, entry.name);
    if (entry.isDirectory()) {
      files.push(...findHtmlFiles(fullPath));
    } else if (entry.name.endsWith(".html")) {
      files.push(fullPath);
    }
  }
  return files;
}

function findCacheFiles(root) {
  if (!fs.existsSync(root)) return [];
  const files = [];
  for (const entry of fs.readdirSync(root, { withFileTypes: true })) {
    const fullPath = path.join(root, entry.name);
    if (entry.isDirectory()) {
      files.push(...findCacheFiles(fullPath));
    } else {
      files.push(fullPath);
    }
  }
  return files;
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

function escapeRegExp(value) {
  return String(value).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
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
