import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(__dirname, "..");
const mirroredRoot = path.join(projectRoot, "src", "mirrored-pages");
const reportDir = path.join(projectRoot, "seo-migration", "reports");
const auditPath = path.join(reportDir, "T04-P1-current-seo-audit.csv");
const changesPath = path.join(reportDir, "T05-P1-title-meta-changes.csv");
const markdownPath = path.join(reportDir, "T05-P1-title-meta-fix-report.md");

const minTitleLength = 30;
const maxTitleLength = 60;
const minDescriptionLength = 120;
const maxDescriptionLength = 155;
const brand = "CNCPioneer";

const rows = parseCsv(fs.readFileSync(auditPath, "utf8"));
const changes = [];
const stats = {
  auditedRows: rows.length,
  problemRows: 0,
  updatedFiles: 0,
  missingFiles: 0,
  unchanged: 0,
  titleUpdated: 0,
  descriptionUpdated: 0,
};

for (const row of rows) {
  const problems = String(row.current_problems || "");
  if (!problems) continue;

  const needsTitle = problems.includes("title_too_long") || problems.includes("title_too_short") || problems.includes("missing_title");
  const needsDescription = problems.includes("meta_description_too_long") || problems.includes("meta_description_too_short") || problems.includes("missing_meta_description");
  if (!needsTitle && !needsDescription) continue;

  stats.problemRows += 1;

  const localFile = path.join(mirroredRoot, row.source_file || "");
  if (!fs.existsSync(localFile)) {
    stats.missingFiles += 1;
    changes.push(changeRow(row, "", "", "missing_file"));
    continue;
  }

  const before = fs.readFileSync(localFile, "utf8");
  const currentTitle = cleanText(extractTagText(before, "title") || row.title || "");
  const currentDescription = cleanText(extractMeta(before, "name", "description") || row.meta_description || "");
  const h1 = cleanText(row.h1 || extractFirstHeading(before) || titleFromPath(row.path || ""));
  const nextTitle = needsTitle ? makeTitle(currentTitle, h1, row.path || "") : currentTitle;
  const nextDescription = needsDescription ? makeDescription(currentDescription, nextTitle, h1, row.path || "") : currentDescription;

  let after = before;
  let changedTitle = false;
  let changedDescription = false;

  if (needsTitle && nextTitle && nextTitle !== currentTitle) {
    after = upsertTitle(after, nextTitle);
    after = upsertMeta(after, "property", "og:title", nextTitle);
    changedTitle = true;
  }

  if (needsDescription && nextDescription && nextDescription !== currentDescription) {
    after = upsertMeta(after, "name", "description", nextDescription);
    after = upsertMeta(after, "property", "og:description", nextDescription);
    changedDescription = true;
  }

  if (after === before) {
    stats.unchanged += 1;
    continue;
  }

  fs.writeFileSync(localFile, after);
  stats.updatedFiles += 1;
  if (changedTitle) stats.titleUpdated += 1;
  if (changedDescription) stats.descriptionUpdated += 1;
  changes.push(changeRow(row, nextTitle, nextDescription, "updated"));
}

writeCsv(changesPath, changes, [
  "status",
  "path",
  "source_file",
  "problems",
  "old_title_length",
  "new_title_length",
  "old_meta_length",
  "new_meta_length",
  "new_title",
  "new_meta_description",
]);

const markdown = `# T05 P1 Title and Meta Length Fix

Status: complete
Date: ${new Date().toISOString().slice(0, 19).replace("T", " ")}

## Scope

Fixed current local English P1 pages from \`T04-P1-current-seo-audit.csv\` where title or meta description length was outside the target range.

## Targets

- Title: ${minTitleLength}-${maxTitleLength} characters
- Meta description: ${minDescriptionLength}-${maxDescriptionLength} characters

## Summary

- P1 rows audited: ${stats.auditedRows}
- Rows considered for title/meta length fixes: ${stats.problemRows}
- Source files updated: ${stats.updatedFiles}
- Titles updated: ${stats.titleUpdated}
- Meta descriptions updated: ${stats.descriptionUpdated}
- Missing files: ${stats.missingFiles}
- Unchanged after calculation: ${stats.unchanged}

## Outputs

- \`seo-migration/reports/T05-P1-title-meta-changes.csv\`
- \`seo-migration/reports/T05-P1-title-meta-fix-report.md\`
`;

fs.writeFileSync(markdownPath, markdown);
console.log(JSON.stringify(stats, null, 2));

function makeTitle(currentTitle, h1, pathname) {
  const base = cleanTitleBase(h1 || currentTitle || titleFromPath(pathname));
  const pageType = getPageType(pathname);
  const qualifier = {
    blog: "CNC Guide",
    services: "CNC Service",
    materials: "CNC Machining",
    industries: "CNC Machining",
    parts: "CNC Parts",
  }[pageType] || "";

  const candidates = [
    `${base} | ${brand}`,
    qualifier && !hasWords(base, qualifier) ? `${base} ${qualifier}` : "",
    qualifier && !hasWords(base, qualifier) ? `${base} ${qualifier} | ${brand}` : "",
    base,
  ].filter(Boolean).map(cleanSpaces);

  const inRangeCandidate = candidates.find((candidate) => inTitleRange(candidate));
  if (inRangeCandidate) return inRangeCandidate;

  const preferred = candidates.find((candidate) => candidate.length <= maxTitleLength) || `${base} | ${brand}`;
  if (preferred.length < minTitleLength) {
    return fitShortTitle(preferred, pageType);
  }

  const suffix = ` | ${brand}`;
  const room = maxTitleLength - suffix.length;
  const trimmedBase = truncateAtWord(base, room);
  const withBrand = `${trimmedBase}${suffix}`;
  return withBrand.length >= minTitleLength ? withBrand : fitShortTitle(trimmedBase, pageType);
}

function fitShortTitle(title, pageType) {
  const extras = {
    blog: "CNC Machining Guide",
    services: "Precision CNC Service",
    materials: "CNC Machining Service",
    industries: "CNC Machining Solutions",
    parts: "Custom CNC Parts",
    default: "CNC Machining",
  };
  const extra = extras[pageType] || extras.default;
  const candidate = hasWords(title, extra) ? `${title} | ${brand}` : `${title} ${extra}`;
  if (inTitleRange(candidate)) return candidate;
  if (candidate.length <= maxTitleLength) return candidate;
  return truncateAtWord(candidate, maxTitleLength);
}

function makeDescription(currentDescription, title, h1, pathname) {
  const cleaned = normalizeSentence(currentDescription);
  if (cleaned.length >= minDescriptionLength && cleaned.length <= maxDescriptionLength) {
    return cleaned;
  }

  if (cleaned.length > maxDescriptionLength) {
    const shortened = truncateDescription(cleaned);
    if (shortened.length >= minDescriptionLength) return shortened;
  }

  const topic = cleanTitleBase(h1 || title || titleFromPath(pathname));
  const pageType = getPageType(pathname);
  const templates = {
    blog: `Read ${topic} from CNCPioneer for practical CNC machining guidance, material insights, design tips, tolerances, and precision manufacturing advice.`,
    services: `${topic} from CNCPioneer covers CNC capabilities, tolerances, material options, finishing, inspection, quality control, and fast custom quotes.`,
    materials: `${topic} services from CNCPioneer cover material properties, CNC machining guidance, tolerances, finishing, inspection, and custom part quotes.`,
    industries: `${topic} CNC machining solutions from CNCPioneer support precision components, material selection, finishing, inspection, and quality manufacturing.`,
    parts: `${topic} from CNCPioneer features custom CNC machined components, material options, tolerances, finishing, inspection, and fast manufacturing quotes.`,
    default: `${topic} from CNCPioneer covers precision CNC machining, material options, quality control, finishing services, inspection, and custom manufacturing support.`,
  };

  const fallback = normalizeSentence(templates[pageType] || templates.default);
  if (fallback.length >= minDescriptionLength && fallback.length <= maxDescriptionLength) {
    return fallback;
  }
  if (fallback.length > maxDescriptionLength) return truncateDescription(fallback);
  return padDescription(fallback, pageType);
}

function truncateDescription(value) {
  const sentence = value.match(/^.{120,155}?[.!?](\s|$)/)?.[0]?.trim();
  if (sentence && sentence.length <= maxDescriptionLength) return sentence;
  return truncateAtWord(value, maxDescriptionLength);
}

function padDescription(value, pageType) {
  const additions = {
    blog: " Includes practical manufacturing insights for engineers and sourcing teams.",
    services: " Built for precision prototypes, low-volume production, and repeatable quality.",
    materials: " Built for reliable prototypes, production parts, and demanding quality needs.",
    industries: " Built for demanding prototypes, production components, and quality needs.",
    parts: " Built for precision prototypes, production runs, and reliable sourcing.",
    default: " Built for precision prototypes, production runs, and reliable sourcing.",
  };
  const next = normalizeSentence(`${value}${additions[pageType] || additions.default}`);
  return next.length <= maxDescriptionLength ? next : truncateDescription(next);
}

function changeRow(row, nextTitle, nextDescription, status) {
  return {
    status,
    path: row.path || "",
    source_file: row.source_file || "",
    problems: row.current_problems || "",
    old_title_length: row.title_length || "",
    new_title_length: nextTitle ? String(nextTitle.length) : "",
    old_meta_length: row.meta_description_length || "",
    new_meta_length: nextDescription ? String(nextDescription.length) : "",
    new_title: nextTitle || "",
    new_meta_description: nextDescription || "",
  };
}

function cleanTitleBase(value) {
  return cleanSpaces(String(value || "")
    .replace(/\s*[\-|]\s*CNCPioneer\s*$/i, "")
    .replace(/\s*\|\s*CNCPioneer\s*$/i, "")
    .replace(/\s*-\s*CNC Pioneer\s*$/i, "")
    .replace(/\s*\([^)]*202[0-9][^)]*\)\s*$/i, "")
    .replace(/\s*[:|]\s*China CNC Machining.*$/i, "")
    .replace(/\s*[:|]\s*Custom CNC Machining.*$/i, "")
    .replace(/\s*[:|]\s*CNC Machining Service.*$/i, "")
    .replace(/\s+/g, " "))
    .replace(/^\W+|\W+$/g, "");
}

function getPageType(pathname) {
  if (pathname.startsWith("/blog/")) return "blog";
  if (pathname.startsWith("/services")) return "services";
  if (pathname.startsWith("/materials")) return "materials";
  if (pathname.startsWith("/industries")) return "industries";
  if (pathname.startsWith("/custom-cnc-parts")) return "parts";
  return "default";
}

function upsertTitle(html, title) {
  const escaped = escapeHtml(title);
  if (/<title\b/i.test(html)) {
    return html.replace(/<title\b[^>]*>[\s\S]*?<\/title>/i, `<title>${escaped}</title>`);
  }
  return html.replace(/<head\b[^>]*>/i, (match) => `${match}\n\t<title>${escaped}</title>`);
}

function upsertMeta(html, attr, key, content) {
  const tag = `<meta ${attr}="${escapeHtml(key)}" content="${escapeHtml(content)}">`;
  const pattern = new RegExp(`<meta\\b(?=[^>]*\\b${attr}=["']${escapeRegExp(key)}["'])[^>]*>`, "i");
  if (pattern.test(html)) return html.replace(pattern, tag);
  if (/<title\b/i.test(html)) return html.replace(/(<title\b[\s\S]*?<\/title>)/i, `$1\n\t${tag}`);
  return html.replace(/<head\b[^>]*>/i, (match) => `${match}\n\t${tag}`);
}

function extractTagText(html, tag) {
  const match = html.match(new RegExp(`<${tag}\\b[^>]*>([\\s\\S]*?)<\\/${tag}>`, "i"));
  return match ? cleanText(match[1]) : "";
}

function extractFirstHeading(html) {
  return extractTagText(html, "h1") || extractTagText(html, "h2");
}

function extractMeta(html, attr, key) {
  const tags = html.match(/<meta\b[^>]*>/gi) || [];
  const found = tags.find((tag) => getAttr(tag, attr)?.toLowerCase() === key.toLowerCase());
  return found ? cleanText(getAttr(found, "content") || "") : "";
}

function getAttr(tag, name) {
  const match = tag.match(new RegExp(`\\b${escapeRegExp(name)}=(?:"([^"]*)"|'([^']*)')`, "i"));
  return match ? decodeEntities(match[1] ?? match[2] ?? "") : "";
}

function titleFromPath(pathname) {
  const last = String(pathname || "").split("/").filter(Boolean).pop() || "CNC Machining";
  return last.split("-").filter(Boolean).map((part) => part.charAt(0).toUpperCase() + part.slice(1)).join(" ");
}

function cleanText(value) {
  return cleanSpaces(decodeEntities(String(value || "").replace(/<[^>]+>/g, " ")));
}

function cleanSpaces(value) {
  return String(value || "").replace(/\s+/g, " ").trim();
}

function normalizeSentence(value) {
  const cleaned = cleanSpaces(value);
  if (!cleaned) return "";
  return /[.!?]$/.test(cleaned) ? cleaned : `${cleaned}.`;
}

function truncateAtWord(value, maxLength) {
  const cleaned = cleanSpaces(value);
  if (cleaned.length <= maxLength) return cleaned;
  const sliced = cleaned.slice(0, maxLength + 1);
  const atWord = sliced.replace(/\s+\S*$/, "").replace(/[,\-:;|]+$/, "").trim();
  return (atWord || cleaned.slice(0, maxLength)).replace(/[,\-:;|]+$/, "").trim();
}

function inTitleRange(value) {
  return value.length >= minTitleLength && value.length <= maxTitleLength;
}

function hasWords(value, words) {
  return value.toLowerCase().includes(words.toLowerCase());
}

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function decodeEntities(value) {
  return String(value)
    .replace(/&quot;/g, "\"")
    .replace(/&#039;|&apos;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&amp;/g, "&");
}

function escapeRegExp(value) {
  return String(value).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
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

    if (char === "\"") {
      inQuotes = true;
    } else if (char === ",") {
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
  return rows
    .filter((values) => values.some((value) => value !== ""))
    .map((values) => Object.fromEntries(headers.map((header, index) => [header, values[index] || ""])));
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
  if (/[",\n\r]/.test(text)) return `"${text.replace(/"/g, "\"\"")}"`;
  return text;
}
