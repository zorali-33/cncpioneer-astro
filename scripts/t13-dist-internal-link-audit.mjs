import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(__dirname, "..");
const distRoot = path.join(projectRoot, "dist");
const reportDir = path.join(projectRoot, "seo-migration", "reports");
const csvPath = path.join(reportDir, "T13-dist-internal-link-audit.csv");
const mdPath = path.join(reportDir, "T13-dist-internal-link-audit.md");
const siteHostPattern = /^(?:www\.)?cncpioneer\.com$/i;
const ignoredSchemes = /^(?:mailto:|tel:|javascript:|data:|blob:|#)/i;

if (!fs.existsSync(distRoot)) {
  throw new Error("dist directory does not exist. Run npm run build first.");
}

const htmlFiles = findFiles(distRoot, /^index\.html$/);
const findings = [];
let checkedReferences = 0;

for (const file of htmlFiles) {
  const html = fs.readFileSync(file, "utf8");
  const page = routeFromFile(file);
  for (const ref of extractReferences(html)) {
    const normalized = normalizeInternalUrl(ref.value);
    if (!normalized) continue;
    checkedReferences += 1;
    const resolution = resolveInternal(normalized);
    if (!resolution.exists) {
      findings.push({
        page,
        file: rel(file),
        attr: ref.attr,
        value: ref.value,
        normalized,
        kind: resolution.kind,
        expected: resolution.expected,
      });
    }
  }
}

writeCsv(csvPath, findings, ["page", "file", "attr", "value", "normalized", "kind", "expected"]);

const byKind = countBy(findings, "kind");
const byPage = countBy(findings, "page");
fs.writeFileSync(mdPath, `# T13 Dist Internal Link Audit

Status: ${findings.length ? "needs attention" : "pass"}
Date: ${new Date().toISOString().slice(0, 19).replace("T", " ")}

## Scope

Scanned generated HTML in \`dist\` for internal \`href\`, \`src\`, \`data-src\`, \`data-lazy-src\`, \`srcset\`, \`poster\`, and \`action\` references.

## Summary

- HTML pages scanned: ${htmlFiles.length}
- Internal references checked: ${checkedReferences}
- Missing internal references: ${findings.length}

## Missing References By Kind

${formatCounts(byKind)}

## Pages With Missing References

${formatCounts(byPage)}

## Outputs

- \`seo-migration/reports/T13-dist-internal-link-audit.csv\`
- \`seo-migration/reports/T13-dist-internal-link-audit.md\`
`);

console.log(JSON.stringify({
  pagesScanned: htmlFiles.length,
  checkedReferences,
  missingReferences: findings.length,
  byKind,
}, null, 2));

process.exit(findings.length ? 1 : 0);

function extractReferences(html) {
  const refs = [];
  const attrPattern = /\b(href|src|data-src|data-lazy-src|poster|action)\s*=\s*(["'])(.*?)\2/gi;
  for (const match of html.matchAll(attrPattern)) {
    refs.push({ attr: match[1].toLowerCase(), value: decodeHtml(match[3]) });
  }

  const srcsetPattern = /\bsrcset\s*=\s*(["'])(.*?)\1/gi;
  for (const match of html.matchAll(srcsetPattern)) {
    for (const candidate of decodeHtml(match[2]).split(",")) {
      const value = candidate.trim().split(/\s+/)[0];
      if (value) refs.push({ attr: "srcset", value });
    }
  }
  return refs;
}

function normalizeInternalUrl(value) {
  const text = String(value || "").trim();
  if (!text || ignoredSchemes.test(text)) return "";
  if (text.startsWith("//")) return "";

  try {
    const parsed = new URL(text);
    if (!siteHostPattern.test(parsed.host)) return "";
    return parsed.pathname || "/";
  } catch {
    if (!text.startsWith("/")) return "";
    return text.split(/[?#]/)[0] || "/";
  }
}

function resolveInternal(urlPath) {
  const cleanPath = decodeURIComponent(urlPath).replace(/\/{2,}/g, "/");
  if (looksLikeAsset(cleanPath)) {
    const expected = path.join(distRoot, cleanPath.replace(/^\/+/, ""));
    return { exists: fs.existsSync(expected), kind: "asset", expected: rel(expected) };
  }

  const htmlFile = cleanPath === "/"
    ? path.join(distRoot, "index.html")
    : path.join(distRoot, cleanPath.replace(/^\/+|\/+$/g, ""), "index.html");
  if (fs.existsSync(htmlFile)) return { exists: true, kind: "page", expected: rel(htmlFile) };

  const directFile = path.join(distRoot, cleanPath.replace(/^\/+/, ""));
  return { exists: fs.existsSync(directFile), kind: "page_or_file", expected: rel(directFile) };
}

function looksLikeAsset(urlPath) {
  return /\.[a-z0-9]{2,8}$/i.test(urlPath)
    || urlPath.startsWith("/wp-content/")
    || urlPath.startsWith("/_astro/")
    || urlPath.startsWith("/assets/");
}

function routeFromFile(file) {
  const dir = path.relative(distRoot, path.dirname(file)).replaceAll("\\", "/");
  return dir ? `/${dir}/` : "/";
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

function countBy(records, key) {
  return records.reduce((acc, record) => {
    const value = record[key] || "";
    acc[value] = (acc[value] || 0) + 1;
    return acc;
  }, {});
}

function formatCounts(counts) {
  return Object.entries(counts)
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
    .map(([name, count]) => `- ${name}: ${count}`)
    .join("\n") || "- None";
}

function rel(file) {
  return path.relative(projectRoot, file).replaceAll("\\", "/");
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
