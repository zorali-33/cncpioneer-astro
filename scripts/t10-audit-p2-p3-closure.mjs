import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(__dirname, "..");
const distRoot = path.join(projectRoot, "dist");
const srcRoot = path.join(projectRoot, "src");
const publicRoot = path.join(projectRoot, "public");
const reportDir = path.join(projectRoot, "seo-migration", "reports");
const actionPlanPath = path.join(reportDir, "T02-english-action-plan.csv");
const csvPath = path.join(reportDir, "T10-P2-P3-closure-audit.csv");
const mdPath = path.join(reportDir, "T10-P2-P3-closure-audit.md");

const rows = readCsv(actionPlanPath)
  .filter((row) => ["P2", "P3"].includes(row.priority))
  .map(auditRow);

const byStatus = countBy(rows, "status");
const byClass = countBy(rows, "classification");
const unresolved = rows.filter((row) => row.status !== "resolved" && row.status !== "external_reference_ok");

writeCsv(csvPath, rows, [
  "priority",
  "classification",
  "path",
  "status",
  "evidence",
  "recommended_action",
]);

fs.writeFileSync(mdPath, `# T10 P2/P3 Closure Audit

Status: complete
Date: ${new Date().toISOString().slice(0, 19).replace("T", " ")}

## Scope

Audited all English-scope P2 and P3 rows from \`T02-english-action-plan.csv\` after the T06, T08, and T09 remediation passes.

## Summary

- Rows audited: ${rows.length}
- Resolved rows: ${rows.filter((row) => row.status === "resolved").length}
- External reference rows confirmed: ${rows.filter((row) => row.status === "external_reference_ok").length}
- Unresolved rows: ${unresolved.length}

## By Classification

${formatCounts(byClass)}

## By Status

${formatCounts(byStatus)}

## Notes

- \`generated_parts_archive\` rows are considered resolved when the generated \`dist\` route exists and the generated pagination audit is clean.
- \`mirrored_page_link_technical\` rows are considered resolved when the current T08 link audit reports zero findings.
- \`ahrefs_only_nonlocal_url\` rows are considered resolved when a route or historical asset path exists locally; duplicate slash routes are normalized to the canonical path for validation.
- \`external_or_reference_url\` rows are not converted into local pages. They are confirmed when no local HTML contains a mistaken root-relative link to that path.

## Outputs

- \`seo-migration/reports/T10-P2-P3-closure-audit.csv\`
- \`seo-migration/reports/T10-P2-P3-closure-audit.md\`
`);

console.log(JSON.stringify({
  audited: rows.length,
  resolved: rows.filter((row) => row.status === "resolved").length,
  externalReferenceOk: rows.filter((row) => row.status === "external_reference_ok").length,
  unresolved: unresolved.length,
  byStatus,
}, null, 2));

function auditRow(row) {
  const classification = row.classification;
  const routePath = row.path || pathnameFromUrl(row.url);

  if (classification === "generated_parts_archive") {
    const exists = routeExists(routePath);
    const generatedAuditClean = generatedPaginationAuditClean(routePath);
    return {
      ...pick(row),
      status: exists && generatedAuditClean ? "resolved" : "needs_review",
      evidence: `route_exists=${exists}; generated_pagination_clean=${generatedAuditClean}`,
    };
  }

  if (classification === "mirrored_page_link_technical") {
    const clean = t08AuditClean();
    return {
      ...pick(row),
      status: clean ? "resolved" : "needs_review",
      evidence: clean ? "T08 current link audit has zero findings" : "T08 current link audit still has findings",
    };
  }

  if (classification === "ahrefs_only_nonlocal_url") {
    const normalized = normalizeRoute(routePath);
    const isAsset = /^\/wp-content\//.test(normalized);
    const exists = isAsset ? assetExists(normalized) : routeExists(normalized);
    return {
      ...pick(row),
      status: exists ? "resolved" : "needs_review",
      evidence: `${isAsset ? "asset" : "route"}_exists=${exists}; normalized_path=${normalized}`,
    };
  }

  if (classification === "external_or_reference_url") {
    const relativeReferences = findRelativeReferences(routePath);
    return {
      ...pick(row),
      status: relativeReferences.length ? "needs_review" : "external_reference_ok",
      evidence: relativeReferences.length
        ? `root-relative references found: ${relativeReferences.slice(0, 5).join(" | ")}`
        : "no mistaken root-relative href/src references found in local HTML",
    };
  }

  return {
    ...pick(row),
    status: "needs_review",
    evidence: "unhandled classification",
  };
}

function pick(row) {
  return {
    priority: row.priority,
    classification: row.classification,
    path: row.path || pathnameFromUrl(row.url),
    recommended_action: row.recommended_action,
  };
}

function routeExists(routePath) {
  const cleanPath = normalizeRoute(routePath);
  const file = cleanPath === "/" ? path.join(distRoot, "index.html") : path.join(distRoot, cleanPath.slice(1), "index.html");
  return fs.existsSync(file);
}

function assetExists(assetPath) {
  const relative = normalizeRoute(assetPath).slice(1);
  return fs.existsSync(path.join(publicRoot, relative)) && fs.existsSync(path.join(distRoot, relative));
}

function generatedPaginationAuditClean(routePath) {
  const audit = path.join(reportDir, "T06-generated-pagination-audit.csv");
  if (!fs.existsSync(audit)) return false;
  const row = readCsv(audit).find((item) => normalizeRoute(item.path) === normalizeRoute(routePath));
  return Boolean(row) && !row.problems;
}

function t08AuditClean() {
  const audit = path.join(reportDir, "T08-P2-current-link-audit.csv");
  if (!fs.existsSync(audit)) return false;
  return readCsv(audit).length === 0;
}

function findRelativeReferences(routePath) {
  const normalized = normalizeRoute(routePath);
  const pattern = new RegExp(`(?:href|src)=(["'])${escapeRegExp(normalized)}(?:[?#][^"']*)?\\1`, "i");
  return findFiles(srcRoot, /\.html$/)
    .filter((file) => pattern.test(fs.readFileSync(file, "utf8")))
    .map((file) => path.relative(projectRoot, file).replaceAll("\\", "/"));
}

function normalizeRoute(value) {
  const parsed = pathnameFromUrl(value);
  return `/${parsed.replace(/^\/+/, "").replace(/\/{2,}/g, "/")}`.replace(/\/+$/, "") || "/";
}

function pathnameFromUrl(value) {
  const text = String(value || "").trim();
  if (!text) return "";
  try {
    return new URL(text).pathname;
  } catch {
    return text.split(/[?#]/)[0];
  }
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

function countBy(records, key) {
  return records.reduce((acc, record) => {
    acc[record[key]] = (acc[record[key]] || 0) + 1;
    return acc;
  }, {});
}

function formatCounts(counts) {
  return Object.entries(counts)
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
    .map(([name, count]) => `- ${name}: ${count}`)
    .join("\n") || "- None";
}

function escapeRegExp(value) {
  return String(value).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function readCsv(filePath) {
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
