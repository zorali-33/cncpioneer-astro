import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(__dirname, "..");
const reportDir = path.join(projectRoot, "seo-migration", "reports");
const actionPlanPath = path.join(reportDir, "T02-english-action-plan.csv");
const pagesRoot = path.join(projectRoot, "src", "mirrored-pages");
const auditCsvPath = path.join(reportDir, "T04-P1-current-seo-audit.csv");
const summaryCsvPath = path.join(reportDir, "T04-P1-current-seo-problem-summary.csv");
const mdPath = path.join(reportDir, "T04-P1-current-seo-audit.md");

const actionRows = csvRows(actionPlanPath)
  .filter((row) => row.priority === "P1" && row.classification === "mirrored_page_seo_structure");

const audited = actionRows.map(auditRow);
writeCsv(auditCsvPath, audited, [
  "path",
  "source_file",
  "title_length",
  "meta_description_count",
  "meta_description_length",
  "h1_count",
  "canonical",
  "og_title",
  "og_description",
  "og_url",
  "current_problem_count",
  "current_problems",
  "title",
  "meta_description",
  "h1",
  "ahrefs_issues",
]);

const problemCounts = {};
for (const row of audited) {
  for (const problem of row.current_problems.split(" | ").filter(Boolean)) {
    problemCounts[problem] = (problemCounts[problem] || 0) + 1;
  }
}

const problemRows = Object.entries(problemCounts)
  .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
  .map(([problem, count]) => ({ problem, count: String(count) }));
writeCsv(summaryCsvPath, problemRows, ["problem", "count"]);

const cleanCount = audited.filter((row) => row.current_problem_count === "0").length;
fs.writeFileSync(mdPath, `# T04 P1 Current SEO Audit

Status: complete
Date: ${new Date().toISOString().slice(0, 19).replace("T", " ")}

## Scope

Audited the current local source for the ${audited.length} P1 mirrored pages from T02.

## Outputs

- \`seo-migration/reports/T04-P1-current-seo-audit.csv\`
- \`seo-migration/reports/T04-P1-current-seo-problem-summary.csv\`

## Summary

- Mirrored P1 pages audited: ${audited.length}
- Pages currently passing local title/meta/H1/canonical/OG structure checks: ${cleanCount}
- Pages with at least one current local structure problem: ${audited.length - cleanCount}

## Current Problem Counts

${problemRows.map((row) => `- ${row.problem}: ${row.count}`).join("\n") || "- None"}

## Notes

- This audit checks current local HTML, not only historical Ahrefs labels.
- Title target: 30-60 characters.
- Meta description target: 120-155 characters.
- The audit does not edit pages.
`);

console.log(JSON.stringify({
  audited: audited.length,
  clean: cleanCount,
  problem_pages: audited.length - cleanCount,
}, null, 2));

process.exit(cleanCount === audited.length ? 0 : 1);

function auditRow(row) {
  const filePath = path.join(pagesRoot, row.owner);
  const html = fs.readFileSync(filePath, "utf8");
  const title = clean(extractTag(html, "title"));
  const descriptions = extractMetaAll(html, "name", "description").map(clean);
  const h1s = extractAllTags(html, "h1").map(clean);
  const canonical = clean(extractLink(html, "canonical"));
  const og = Object.fromEntries(
    (html.match(/<meta\b[^>]*>/gi) || [])
      .filter((tag) => getAttr(tag, "property").toLowerCase().startsWith("og:"))
      .map((tag) => [getAttr(tag, "property").toLowerCase(), clean(getAttr(tag, "content"))]),
  );

  const problems = [];
  if (!title) problems.push("missing_title");
  else if (title.length > 60) problems.push("title_too_long");
  else if (title.length < 30) problems.push("title_too_short");

  if (descriptions.length === 0) problems.push("missing_meta_description");
  else if (descriptions.length > 1) problems.push("multiple_meta_description");
  else if (descriptions[0].length > 155) problems.push("meta_description_too_long");
  else if (descriptions[0].length < 120) problems.push("meta_description_too_short");

  if (h1s.length === 0) problems.push("missing_h1");
  else if (h1s.length > 1) problems.push("multiple_h1");

  if (!canonical) problems.push("missing_canonical");
  for (const key of ["og:title", "og:description", "og:url"]) {
    if (!og[key]) problems.push(`missing_${key.replace(":", "_")}`);
  }

  return {
    path: row.path,
    source_file: row.owner,
    title_length: String(title.length),
    meta_description_count: String(descriptions.length),
    meta_description_length: String(descriptions[0]?.length || 0),
    h1_count: String(h1s.length),
    canonical,
    og_title: og["og:title"] || "",
    og_description: og["og:description"] || "",
    og_url: og["og:url"] || "",
    current_problem_count: String(problems.length),
    current_problems: problems.join(" | "),
    title,
    meta_description: descriptions[0] || "",
    h1: h1s[0] || "",
    ahrefs_issues: row.issues || "",
  };
}

function extractTag(html, tag) {
  return html.match(new RegExp(`<${tag}\\b[^>]*>([\\s\\S]*?)<\\/${tag}>`, "i"))?.[1] || "";
}

function extractAllTags(html, tag) {
  return [...html.matchAll(new RegExp(`<${tag}\\b[^>]*>([\\s\\S]*?)<\\/${tag}>`, "gi"))].map((match) => match[1]);
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

function csvRows(filePath) {
  const text = fs.readFileSync(filePath, "utf8").replace(/^\uFEFF/, "");
  const lines = text.split(/\r?\n/).filter(Boolean);
  const headers = parseCsvLine(lines.shift() || "");
  return lines.map((line) => {
    const cells = parseCsvLine(line);
    return Object.fromEntries(headers.map((header, index) => [header, cells[index] || ""]));
  });
}

function parseCsvLine(line) {
  const cells = [];
  let cell = "";
  let quoted = false;
  for (let index = 0; index < line.length; index += 1) {
    const char = line[index];
    if (quoted) {
      if (char === "\"" && line[index + 1] === "\"") {
        cell += "\"";
        index += 1;
      } else if (char === "\"") {
        quoted = false;
      } else {
        cell += char;
      }
    } else if (char === "\"") {
      quoted = true;
    } else if (char === ",") {
      cells.push(cell);
      cell = "";
    } else {
      cell += char;
    }
  }
  cells.push(cell);
  return cells;
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
