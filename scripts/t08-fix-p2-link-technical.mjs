import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(__dirname, "..");
const mirroredRoot = path.join(projectRoot, "src", "mirrored-pages");
const reportDir = path.join(projectRoot, "seo-migration", "reports");
const actionPlanPath = path.join(reportDir, "T02-english-action-plan.csv");
const changesPath = path.join(reportDir, "T08-P2-link-technical-changes.csv");
const reportPath = path.join(reportDir, "T08-P2-link-technical-fix-report.md");

const owners = parseCsv(fs.readFileSync(actionPlanPath, "utf8"))
  .filter((row) => row.priority === "P2" && row.classification === "mirrored_page_link_technical")
  .map((row) => row.owner)
  .filter(Boolean);

const changes = [];
const stats = {
  pagesConsidered: owners.length,
  pagesUpdated: 0,
  missingFiles: 0,
  wpHeadLinksRemoved: 0,
  doubleSlashFixed: 0,
  protocolRelativeFixed: 0,
  siteAbsoluteConverted: 0,
  missingCacheScriptsRemoved: 0,
  missingAlternateLinksRemoved: 0,
};

for (const owner of owners) {
  const file = path.join(mirroredRoot, owner);
  if (!fs.existsSync(file)) {
    stats.missingFiles += 1;
    changes.push(change(owner, "missing_file", "", "", 0));
    continue;
  }

  const before = fs.readFileSync(file, "utf8");
  let after = before;

  after = after.replace(/<link\b[^>]*(?:\/feed|\/comments\/feed|\/wp-json\/|\/xmlrpc\.php\?rsd|\/wp-json\/oembed\/1\.0\/embed|\/wp-json\/wp\/v2\/posts|rel=["']https:\/\/api\.w\.org\/["'])[^>]*>\s*/gi, (match) => {
    stats.wpHeadLinksRemoved += 1;
    changes.push(change(owner, "remove_wp_static_head_link", match, "", 1));
    return "";
  });

  after = after.replace(/(["'])\/services\/\/swiss-machining\b/g, (match, quote) => {
    stats.doubleSlashFixed += 1;
    changes.push(change(owner, "fix_double_slash_url", "/services//swiss-machining", "/services/swiss-machining", 1));
    return `${quote}/services/swiss-machining`;
  });

  after = after.replace(/\b(href|src|action|data-lazy-src)\s*=\s*(["'])\/\/www\.googletagmanager\.com/gi, (match, attr, quote) => {
    stats.protocolRelativeFixed += 1;
    changes.push(change(owner, "fix_protocol_relative_external", `${attr}=${quote}//www.googletagmanager.com`, `${attr}=${quote}https://www.googletagmanager.com`, 1));
    return `${attr}=${quote}https://www.googletagmanager.com`;
  });

  after = after.replace(/\b(href|src|action|data-lazy-src)\s*=\s*(["'])\/\/cdn-reach\.hostinger\.com/gi, (match, attr, quote) => {
    stats.protocolRelativeFixed += 1;
    changes.push(change(owner, "fix_protocol_relative_external", `${attr}=${quote}//cdn-reach.hostinger.com`, `${attr}=${quote}https://cdn-reach.hostinger.com`, 1));
    return `${attr}=${quote}https://cdn-reach.hostinger.com`;
  });

  after = after.replace(/<link\b(?=[^>]*\brel=["']alternate["'])(?=[^>]*\bhreflang=["']zh-TW["'])[^>]*>\s*/gi, (match) => {
    stats.missingAlternateLinksRemoved += 1;
    changes.push(change(owner, "remove_missing_language_alternate", match, "", 1));
    return "";
  });

  after = after.replace(/<script\b(?=[^>]*\bsrc=["']\/wp-content\/cache\/min\/1\/[a-f0-9]{32}\.js["'])[^>]*>\s*<\/script>\s*/gi, (match) => {
    stats.missingCacheScriptsRemoved += 1;
    changes.push(change(owner, "remove_missing_cache_script", match, "", 1));
    return "";
  });

  after = convertSiteAbsoluteAttrs(after, owner);

  if (after !== before) {
    fs.writeFileSync(file, after);
    stats.pagesUpdated += 1;
  }
}

writeCsv(changesPath, changes, ["page", "type", "before", "after", "count"]);

fs.writeFileSync(reportPath, `# T08 P2 Link Technical Fix

Status: complete
Date: ${new Date().toISOString().slice(0, 19).replace("T", " ")}

## Scope

Fixed current local link issues for the 21 P2 pages classified as \`mirrored_page_link_technical\`.

## Summary

- P2 pages considered: ${stats.pagesConsidered}
- Pages updated: ${stats.pagesUpdated}
- Missing source files: ${stats.missingFiles}
- WordPress feed/API/oEmbed head links removed: ${stats.wpHeadLinksRemoved}
- Internal double-slash URLs fixed: ${stats.doubleSlashFixed}
- Protocol-relative external URLs fixed: ${stats.protocolRelativeFixed}
- CNCPioneer absolute attribute URLs converted: ${stats.siteAbsoluteConverted}
- Missing WP Rocket cache scripts removed: ${stats.missingCacheScriptsRemoved}
- Missing language alternate links removed: ${stats.missingAlternateLinksRemoved}

## Outputs

- \`seo-migration/reports/T08-P2-link-technical-changes.csv\`
- \`seo-migration/reports/T08-P2-link-technical-fix-report.md\`
`);

console.log(JSON.stringify(stats, null, 2));

function convertSiteAbsoluteAttrs(html, owner) {
  return html.replace(/<([a-z0-9:-]+)\b([^<>]*?)>/gis, (tag, tagName, attrs) => {
    if (/^(meta|link)$/i.test(tagName) && /\b(?:property|rel)\s*=\s*(["'])(?:og:url|canonical)\1/i.test(attrs)) {
      return tag;
    }

    const nextAttrs = attrs.replace(/\b(href|src|action|data-lazy-src)\s*=\s*(["'])https?:\/\/(?:www\.)?cncpioneer\.com(\/[^"']*)?\2/gi, (match, attr, quote, pathname = "") => {
      const next = pathname || "/";
      stats.siteAbsoluteConverted += 1;
      changes.push(change(owner, "convert_site_absolute_url", match, `${attr}=${quote}${next}${quote}`, 1));
      return `${attr}=${quote}${next}${quote}`;
    });

    return nextAttrs === attrs ? tag : `<${tagName}${nextAttrs}>`;
  });
}

function change(page, type, before, after, count) {
  return {
    page,
    type,
    before: compact(before),
    after: compact(after),
    count: String(count),
  };
}

function compact(value) {
  return String(value || "").replace(/\s+/g, " ").trim().slice(0, 500);
}

function parseCsv(csvText) {
  const text = csvText.replace(/^\uFEFF/, "");
  const rows = [];
  let row = [];
  let field = "";
  let inQuotes = false;
  for (let index = 0; index < text.length; index += 1) {
    const char = text[index];
    const next = text[index + 1];
    if (inQuotes) {
      if (char === "\"" && next === "\"") {
        field += "\"";
        index += 1;
      } else if (char === "\"") {
        inQuotes = false;
      } else {
        field += char;
      }
      continue;
    }
    if (char === "\"") inQuotes = true;
    else if (char === ",") {
      row.push(field);
      field = "";
    } else if (char === "\n") {
      row.push(field);
      rows.push(row);
      row = [];
      field = "";
    } else if (char !== "\r") {
      field += char;
    }
  }
  if (field || row.length) {
    row.push(field);
    rows.push(row);
  }
  const headers = rows.shift() || [];
  return rows.filter((values) => values.some(Boolean)).map((values) => Object.fromEntries(headers.map((header, index) => [header, values[index] || ""])));
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
