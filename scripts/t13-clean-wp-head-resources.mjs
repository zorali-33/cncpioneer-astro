import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(__dirname, "..");
const mirroredRoot = path.join(projectRoot, "src", "mirrored-pages");
const reportDir = path.join(projectRoot, "seo-migration", "reports");
const reportPath = path.join(reportDir, "T13-wp-head-resource-cleanup-report.md");
const changesPath = path.join(reportDir, "T13-wp-head-resource-cleanup-changes.csv");

const patterns = [
  {
    name: "rss_feed_link",
    pattern: /<link\b(?=[^>]*\brel=["']alternate["'])(?=[^>]*\btype=["']application\/rss\+xml["'])[^>]*>\s*/gi,
  },
  {
    name: "wp_json_link",
    pattern: /<link\b(?=[^>]*\brel=["']https:\/\/api\.w\.org\/["'])[^>]*>\s*/gi,
  },
  {
    name: "wp_json_alternate_link",
    pattern: /<link\b(?=[^>]*\brel=["']alternate["'])(?=[^>]*\btype=["']application\/json["'])(?=[^>]*\/wp-json\/)[^>]*>\s*/gi,
  },
  {
    name: "xmlrpc_edituri_link",
    pattern: /<link\b(?=[^>]*\brel=["']EditURI["'])(?=[^>]*xmlrpc\.php)[^>]*>\s*/gi,
  },
  {
    name: "oembed_discovery_link",
    pattern: /<link\b(?=[^>]*\brel=["']alternate["'])(?=[^>]*\boembed\/1\.0\/embed)[^>]*>\s*/gi,
  },
  {
    name: "wp_rocket_missing_cache_script",
    pattern: /<script\b(?=[^>]*\bsrc=["'](?:https?:\/\/www\.cncpioneer\.com)?\/wp-content\/cache\/min\/1\/[^"']+\.js["'])[^>]*><\/script>\s*/gi,
  },
  {
    name: "non_english_hreflang_link",
    pattern: /<link\b(?=[^>]*\brel=["']alternate["'])(?=[^>]*\bhreflang=["'](?:zh-TW|zh-CN|de|es|fr|it|ja|ko|pt|ru)["'])[^>]*>\s*/gi,
  },
];

const changes = [];
for (const file of findFiles(mirroredRoot, /^index\.html$/)) {
  const before = fs.readFileSync(file, "utf8");
  let after = before;
  const counts = {};
  for (const item of patterns) {
    let count = 0;
    after = after.replace(item.pattern, () => {
      count += 1;
      return "";
    });
    if (count) counts[item.name] = count;
  }

  if (after !== before) {
    fs.writeFileSync(file, after);
    changes.push({
      file: rel(file),
      ...Object.fromEntries(patterns.map((item) => [item.name, counts[item.name] || 0])),
      total: Object.values(counts).reduce((sum, value) => sum + value, 0),
    });
  }
}

writeCsv(changesPath, changes, ["file", ...patterns.map((item) => item.name), "total"]);

const totals = {};
for (const change of changes) {
  for (const item of patterns) {
    totals[item.name] = (totals[item.name] || 0) + Number(change[item.name] || 0);
  }
}

fs.writeFileSync(reportPath, `# T13 WordPress Head Resource Cleanup

Status: complete
Date: ${new Date().toISOString().slice(0, 19).replace("T", " ")}

## Scope

Removed WordPress runtime discovery resources from mirrored source pages. These resources point to dynamic WordPress endpoints or missing WP Rocket cache bundles that are not part of the static Astro output.

## Summary

- Files changed: ${changes.length}
- Total removed tags: ${Object.values(totals).reduce((sum, value) => sum + value, 0)}

## Removed By Type

${formatCounts(totals)}

## Outputs

- \`seo-migration/reports/T13-wp-head-resource-cleanup-report.md\`
- \`seo-migration/reports/T13-wp-head-resource-cleanup-changes.csv\`
`);

console.log(JSON.stringify({
  filesChanged: changes.length,
  totalRemoved: Object.values(totals).reduce((sum, value) => sum + value, 0),
  totals,
}, null, 2));

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

function formatCounts(counts) {
  return Object.entries(counts)
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
    .map(([name, count]) => `- ${name}: ${count}`)
    .join("\n") || "- None";
}

function rel(file) {
  return path.relative(projectRoot, file).replaceAll("\\", "/");
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
