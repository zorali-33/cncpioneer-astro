import { spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(__dirname, "..");
const reportDir = path.join(projectRoot, "seo-migration", "reports");
const mdPath = path.join(reportDir, "T12-final-acceptance-audit.md");
const csvPath = path.join(reportDir, "T12-final-acceptance-audit.csv");

const checks = [
  {
    id: "T04",
    name: "P1 mirrored page SEO structure",
    command: "node",
    args: ["scripts/t04-p1-current-seo-audit.mjs"],
    report: "T04-P1-current-seo-audit.csv",
    pass: () => csvRows("T04-P1-current-seo-audit.csv").every((row) => !row.problems),
    summary: () => summarizeCsvProblems("T04-P1-current-seo-audit.csv"),
  },
  {
    id: "T06",
    name: "Generated archive pagination SEO",
    command: "node",
    args: ["scripts/t06-audit-generated-pagination.mjs"],
    report: "T06-generated-pagination-audit.csv",
    pass: () => csvRows("T06-generated-pagination-audit.csv").every((row) => !row.problems),
    summary: () => summarizeCsvProblems("T06-generated-pagination-audit.csv"),
  },
  {
    id: "T08",
    name: "P2 mirrored page link technical",
    command: "node",
    args: ["scripts/t08-audit-p2-link-technical.mjs"],
    report: "T08-P2-current-link-audit.csv",
    pass: () => csvRows("T08-P2-current-link-audit.csv").length === 0,
    summary: () => "current findings: 0",
  },
  {
    id: "T10",
    name: "P2/P3 closure status",
    command: "node",
    args: ["scripts/t10-audit-p2-p3-closure.mjs"],
    report: "T10-P2-P3-closure-audit.csv",
    pass: () => csvRows("T10-P2-P3-closure-audit.csv")
      .every((row) => row.status === "resolved" || row.status === "external_reference_ok"),
    summary: () => summarizeStatus("T10-P2-P3-closure-audit.csv"),
  },
  {
    id: "T11",
    name: "Robots and sitemap indexing assets",
    command: "node",
    args: ["scripts/t11-generate-robots-sitemap.mjs"],
    report: "T11-site-indexing-assets.csv",
    pass: () => fs.existsSync(path.join(projectRoot, "dist", "robots.txt"))
      && fs.existsSync(path.join(projectRoot, "dist", "sitemap.xml"))
      && sitemapNoindexExcluded(),
    summary: () => summarizeIndexingAssets(),
  },
  {
    id: "T13",
    name: "Dist internal links and resources",
    command: "node",
    args: ["scripts/t13-dist-internal-link-audit.mjs"],
    report: "T13-dist-internal-link-audit.csv",
    pass: () => csvRows("T13-dist-internal-link-audit.csv").length === 0,
    summary: () => "missing internal references: 0",
  },
  {
    id: "T14",
    name: "Dist SEO integrity",
    command: "node",
    args: ["scripts/t14-dist-seo-integrity-audit.mjs"],
    report: "T14-dist-seo-integrity-audit.csv",
    pass: () => csvRows("T14-dist-seo-integrity-audit.csv").every((row) => !row.problems),
    summary: () => summarizeCsvProblems("T14-dist-seo-integrity-audit.csv"),
  },
];

const results = [];
for (const check of checks) {
  const run = spawnSync(check.command, check.args, {
    cwd: projectRoot,
    encoding: "utf8",
    shell: process.platform === "win32",
  });
  const commandPassed = run.status === 0;
  const auditPassed = commandPassed && check.pass();
  results.push({
    id: check.id,
    name: check.name,
    status: auditPassed ? "pass" : "fail",
    command_status: String(run.status ?? ""),
    report: `seo-migration/reports/${check.report}`,
    summary: commandPassed ? check.summary() : trimOutput(run.stderr || run.stdout),
  });
}

writeCsv(csvPath, results, ["id", "name", "status", "command_status", "report", "summary"]);

const failed = results.filter((result) => result.status !== "pass");
fs.writeFileSync(mdPath, `# T12 Final Acceptance Audit

Status: ${failed.length ? "needs attention" : "pass"}
Date: ${new Date().toISOString().slice(0, 19).replace("T", " ")}

## Scope

Ran the current local acceptance checks for the English-only migration track after T00-T14 remediation.

## Summary

- Checks run: ${results.length}
- Checks passing: ${results.length - failed.length}
- Checks failing: ${failed.length}

## Results

${results.map((result) => `- ${result.id} ${result.status.toUpperCase()}: ${result.name} (${result.summary})`).join("\n")}

## Notes

- This acceptance script checks the current source and current \`dist\` output.
- Run \`npm run build\` before T12 when page generation, sitemap contents, or internal references may have changed.
- The known Astro route priority warning for \`/custom-cnc-parts\` is not treated as a failure because the dedicated generated route renders that page.

## Outputs

- \`seo-migration/reports/T12-final-acceptance-audit.md\`
- \`seo-migration/reports/T12-final-acceptance-audit.csv\`
`);

console.log(JSON.stringify({
  checks: results.length,
  passing: results.length - failed.length,
  failing: failed.length,
  status: failed.length ? "needs_attention" : "pass",
}, null, 2));

process.exit(failed.length ? 1 : 0);

function summarizeCsvProblems(reportName) {
  const rows = csvRows(reportName);
  const problemRows = rows.filter((row) => row.problems);
  return `${rows.length} rows audited; problem rows: ${problemRows.length}`;
}

function summarizeStatus(reportName) {
  const rows = csvRows(reportName);
  const counts = countBy(rows, "status");
  return Object.entries(counts).map(([key, value]) => `${key}: ${value}`).join("; ");
}

function summarizeIndexingAssets() {
  const rows = csvRows("T11-site-indexing-assets.csv");
  const counts = countBy(rows, "status");
  const sitemap = fs.readFileSync(path.join(projectRoot, "dist", "sitemap.xml"), "utf8");
  const urlCount = (sitemap.match(/<loc>/g) || []).length;
  return `sitemap URLs: ${urlCount}; included: ${counts.included || 0}; excluded: ${counts.excluded || 0}`;
}

function sitemapNoindexExcluded() {
  const rows = csvRows("T11-site-indexing-assets.csv");
  const sitemap = fs.readFileSync(path.join(projectRoot, "dist", "sitemap.xml"), "utf8");
  return rows
    .filter((row) => row.status === "excluded")
    .every((row) => !sitemap.includes(`https://www.cncpioneer.com${row.path}`));
}

function csvRows(reportName) {
  const filePath = path.join(reportDir, reportName);
  const text = fs.readFileSync(filePath, "utf8").replace(/^\uFEFF/, "");
  const lines = text.split(/\r?\n/).filter(Boolean);
  const headers = parseCsvLine(lines.shift() || "");
  return lines.map((line) => {
    const cells = parseCsvLine(line);
    return Object.fromEntries(headers.map((header, index) => [header, cells[index] || ""]));
  });
}

function countBy(records, key) {
  return records.reduce((acc, record) => {
    const value = record[key] || "";
    acc[value] = (acc[value] || 0) + 1;
    return acc;
  }, {});
}

function trimOutput(value) {
  return String(value || "").replace(/\s+/g, " ").trim().slice(0, 240);
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
