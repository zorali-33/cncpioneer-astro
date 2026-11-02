import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(__dirname, "..");
const reportDir = path.join(projectRoot, "seo-migration", "reports");
const csvPath = path.join(reportDir, "T14-source-seo-fix-report.csv");
const mdPath = path.join(reportDir, "T14-source-seo-fix-report.md");

const fixes = [
  {
    route: "/blog/aluminium-melting-point/",
    title: "Aluminium Melting Point Guide | CNCPioneer",
    description: "Learn aluminium melting point ranges, alloy behavior, heat factors, and practical uses in CNC machining, aerospace, automotive, and recycling work.",
  },
  {
    route: "/blog/china-humanoid-robot-companies/",
    title: "Top China Humanoid Robot Companies | CNCPioneer",
    description: "Explore leading China humanoid robot companies in 2026, with market context, robotics applications, and manufacturing insights for precision CNC parts.",
  },
  {
    route: "/blog/cnc-automotive/",
    title: "CNC Automotive Machining Guide | CNCPioneer",
    description: "Learn how CNC automotive machining supports engine parts, housings, brackets, fixtures, tight tolerances, materials, finishes, and scalable production.",
  },
  {
    route: "/blog/cnc-heat-sink-manufacturing/",
    title: "CNC Heat Sink Manufacturing Guide | CNCPioneer",
    description: "Explore CNC heat sink manufacturing for thermal design, aluminum and copper materials, fin geometry, surface finishes, tolerances, and production tips.",
  },
  {
    route: "/blog/cnc-machining-fillets/",
    title: "CNC Machining Fillets Design Guide | CNCPioneer",
    description: "Learn CNC machining fillet design basics, radius selection, tooling limits, stress reduction, cost control, and practical tips for stronger machined parts.",
  },
  {
    route: "/blog/cnc-machining-materials/",
    description: "Compare CNC machining materials for strength, weight, corrosion resistance, cost, and performance across metals, plastics, and production needs.",
  },
  {
    route: "/blog/cnc-vs-rapid-prototyping/",
    title: "CNC vs Rapid Prototyping Guide | CNCPioneer",
    description: "Compare CNC machining and rapid prototyping for cost, speed, accuracy, materials, surface finish, and production readiness across real part projects.",
  },
  {
    route: "/blog/fr4-cnc-machining/",
    title: "FR4 CNC Machining Guide | CNCPioneer",
    description: "Explore FR4 CNC machining for circuit boards, insulating parts, fixtures, material behavior, tooling, tolerances, edge quality, and production tips.",
  },
  {
    route: "/blog/precision-medical-machining/",
    title: "Precision Medical Machining Guide | CNCPioneer",
    description: "Learn precision medical machining requirements for implants, surgical tools, device parts, biocompatible materials, tolerances, finishing, and quality.",
  },
  {
    route: "/blog/what-is-a-cnc-lathe/",
    title: "CNC Lathe Types, Parts, and Uses | CNCPioneer",
    description: "Learn what a CNC lathe is, how it works, key parts, common machine types, materials, applications, design tips, and future trends.",
  },
  {
    route: "/custom-cnc-parts/reducer-shaft/",
    title: "Reducer Shaft CNC Machining | CNCPioneer",
    description: "Order reducer shaft CNC machining with tight concentricity, durable materials, controlled finishes, inspection support, and custom production options.",
  },
  {
    route: "/custom-cnc-parts/robotic-machining-cells/",
    title: "Robotic Machining Cells | CNCPioneer",
    description: "Get robotic machining cell components with precision CNC parts, fixture features, compliance mechanisms, durable materials, finishes, and quality control.",
  },
  {
    route: "/industries/semiconductor/",
    title: "Semiconductor CNC Machining | CNCPioneer",
    description: "Explore CNCPioneer semiconductor CNC machining for precision housings, fixtures, vacuum parts, connectors, materials, tolerances, and quality support.",
    demoteHeading: "Recommended Materials & Surface Finishes",
  },
];

const results = [];

for (const fix of fixes) {
  const filePath = path.join(projectRoot, "src", "mirrored-pages", fix.route.replace(/^\/|\/$/g, ""), "index.html");
  if (!fs.existsSync(filePath)) {
    results.push({ route: fix.route, status: "missing_file", file: path.relative(projectRoot, filePath), notes: "" });
    continue;
  }

  let html = fs.readFileSync(filePath, "utf8");
  const before = html;

  if (fix.title) {
    html = replaceFirst(html, /<title>[\s\S]*?<\/title>/i, `<title>${escapeHtml(fix.title)}</title>`);
    html = upsertMeta(html, "property", "og:title", fix.title);
  }

  if (fix.description) {
    html = upsertMeta(html, "name", "description", fix.description);
    html = upsertMeta(html, "property", "og:description", fix.description);
  }

  if (fix.demoteHeading) {
    const escaped = escapeRegExp(fix.demoteHeading);
    html = html.replace(
      new RegExp(`<h1([^>]*)>\\s*${escaped}\\s*<\\/h1>`, "i"),
      `<h2$1>${fix.demoteHeading}</h2>`,
    );
  }

  fs.writeFileSync(filePath, html);
  results.push({
    route: fix.route,
    status: html === before ? "unchanged" : "updated",
    file: path.relative(projectRoot, filePath).replaceAll("\\", "/"),
    notes: [fix.title ? "title" : "", fix.description ? "description" : "", fix.demoteHeading ? "h1_demoted" : ""]
      .filter(Boolean)
      .join(" | "),
  });
}

writeCsv(csvPath, results, ["route", "status", "file", "notes"]);

fs.writeFileSync(mdPath, `# T14 Source SEO Fix Report

Status: ${results.every((row) => row.status !== "missing_file") ? "complete" : "needs attention"}
Date: ${new Date().toISOString().slice(0, 19).replace("T", " ")}

## Scope

Applied source-level SEO fixes for the remaining indexable pages flagged by the dist integrity audit.

## Summary

- Routes targeted: ${results.length}
- Updated: ${results.filter((row) => row.status === "updated").length}
- Missing files: ${results.filter((row) => row.status === "missing_file").length}

## Outputs

- \`seo-migration/reports/T14-source-seo-fix-report.csv\`
- \`seo-migration/reports/T14-source-seo-fix-report.md\`
`);

console.log(JSON.stringify({
  targeted: results.length,
  updated: results.filter((row) => row.status === "updated").length,
  missing: results.filter((row) => row.status === "missing_file").length,
}, null, 2));

function replaceFirst(value, pattern, replacement) {
  if (!pattern.test(value)) return value;
  return value.replace(pattern, replacement);
}

function upsertMeta(html, attr, key, content) {
  const escapedContent = escapeHtml(content);
  const pattern = new RegExp(`<meta\\b(?=[^>]*\\b${attr}\\s*=\\s*(["'])${escapeRegExp(key)}\\1)[^>]*>`, "i");
  const replacement = `<meta ${attr}="${key}" content="${escapedContent}" />`;

  if (pattern.test(html)) {
    return html.replace(pattern, replacement);
  }

  const titleMatch = html.match(/<title>[\s\S]*?<\/title>/i);
  if (titleMatch) {
    return html.replace(titleMatch[0], `${titleMatch[0]}\n\t${replacement}`);
  }

  return html.replace(/<head[^>]*>/i, (head) => `${head}\n\t${replacement}`);
}

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
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
