import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const minDescriptionLength = 120;
const maxDescriptionLength = 155;
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(__dirname, "..");
const mirroredRoot = path.join(projectRoot, "src", "mirrored-pages");
const csvPath = process.argv[2];

if (!csvPath) {
  console.error("Usage: node scripts/fix-short-meta-descriptions-from-csv.mjs <screaming-frog-csv>");
  process.exit(1);
}

const csv = readTextFile(csvPath);
const records = parseCsv(csv);
const urlColumn = findColumn(records[0] || {}, ["Address", "URL", "Url", "url"]);

if (!urlColumn) {
  console.error("Could not find a URL column in the CSV.");
  process.exit(1);
}

const report = {
  csvRows: records.length,
  updated: 0,
  skippedWithinRange: 0,
  missingLocalFile: 0,
  unchanged: 0,
  files: [],
  missingUrls: [],
};

for (const record of records) {
  const url = record[urlColumn];
  const localFile = resolveLocalFile(url);

  if (!localFile || !fs.existsSync(localFile)) {
    report.missingLocalFile += 1;
    report.missingUrls.push(url);
    continue;
  }

  const before = fs.readFileSync(localFile, "utf8");
  const currentDescription = extractMeta(before, "name", "description").trim();

  if (currentDescription.length >= minDescriptionLength && currentDescription.length <= maxDescriptionLength) {
    report.skippedWithinRange += 1;
    continue;
  }

  const description = makeDescription(before, url);
  const afterDescription = upsertMeta(before, "name", "description", description);
  const after = upsertWeakMeta(afterDescription, "property", "og:description", description);

  if (after === before) {
    report.unchanged += 1;
    continue;
  }

  fs.writeFileSync(localFile, after);
  report.updated += 1;
  report.files.push(path.relative(projectRoot, localFile).replaceAll("\\", "/"));
}

console.log(JSON.stringify(report, null, 2));

function resolveLocalFile(value) {
  if (!value) return "";

  let pathname = "";
  try {
    pathname = new URL(value).pathname;
  } catch {
    pathname = String(value);
  }

  pathname = decodeURIComponent(pathname)
    .replace(/\/+$/, "")
    .replace(/^\/+/, "");

  if (!pathname) return path.join(mirroredRoot, "index.html");
  return path.join(mirroredRoot, pathname, "index.html");
}

function makeDescription(html, url) {
  const title = cleanTitle(extractTagText(html, "title") || extractFirstHeading(html) || titleFromUrl(url));
  const pageType = getPageType(url);
  const templates = {
    blog: `Read ${title} from CNCPioneer for practical CNC machining guidance, material insights, manufacturing tips, quality control, and design advice.`,
    services: `${title} from CNCPioneer, covering precision CNC capabilities, tolerances, materials, finishing options, inspection, and fast custom quotes.`,
    materials: `${title} services from CNCPioneer, covering material properties, CNC machining guidance, tolerances, finishing options, and custom part quotes.`,
    industries: `${title} CNC machining solutions from CNCPioneer, supporting precision components, certified quality, material selection, finishing, and manufacturing.`,
    parts: `${title} from CNCPioneer, featuring custom CNC machined components, materials, tolerances, surface finishing, inspection support, and fast quotes.`,
    default: `${title} from CNCPioneer, with precision CNC machining, material options, quality control, finishing services, and custom manufacturing support.`,
  };

  const description = normalizeSentence(templates[pageType] || templates.default);
  if (description.length >= minDescriptionLength && description.length <= maxDescriptionLength) return description;

  if (description.length > maxDescriptionLength) return truncateAtWord(description, maxDescriptionLength);

  const expanded = normalizeSentence(`${description.replace(/[.!?]$/, "")}, backed by responsive engineering support.`);
  return expanded.length <= maxDescriptionLength ? expanded : truncateAtWord(expanded, maxDescriptionLength);
}

function getPageType(url) {
  const pathname = safePathname(url);
  if (pathname.startsWith("/blog/")) return "blog";
  if (pathname.startsWith("/services/")) return "services";
  if (pathname.startsWith("/materials/")) return "materials";
  if (pathname.startsWith("/industries/")) return "industries";
  if (pathname.startsWith("/custom-cnc-parts/")) return "parts";
  return "default";
}

function upsertMeta(html, attr, key, content) {
  const pattern = new RegExp(`<meta\\b(?=[^>]*${attr}=["']${escapeRegExp(key)}["'])[^>]*>`, "i");
  const tag = `<meta ${attr}="${escapeHtml(key)}" content="${escapeHtml(content)}">`;

  if (pattern.test(html)) {
    return html.replace(pattern, tag);
  }

  if (/<title\b/i.test(html)) {
    return html.replace(/(<title\b[\s\S]*?<\/title>)/i, `$1\n\t${tag}`);
  }

  return html.replace(/<head\b[^>]*>/i, (match) => `${match}\n\t${tag}`);
}

function upsertWeakMeta(html, attr, key, content) {
  const pattern = new RegExp(`<meta\\b(?=[^>]*${attr}=["']${escapeRegExp(key)}["'])[^>]*>`, "i");
  const existing = html.match(pattern)?.[0] || "";

  if (!existing) return html;

  const existingContent = getAttr(existing, "content") || "";
  if (existingContent.trim().length >= minDescriptionLength && existingContent.trim().length <= maxDescriptionLength) {
    return html;
  }

  const tag = `<meta ${attr}="${escapeHtml(key)}" content="${escapeHtml(content)}">`;
  return html.replace(pattern, tag);
}

function extractMeta(html, attr, key) {
  const tags = html.match(/<meta\b[^>]*>/gi) || [];
  const tag = tags.find((item) => (getAttr(item, attr) || "").toLowerCase() === key.toLowerCase());
  return tag ? decodeHtml(getAttr(tag, "content") || "") : "";
}

function extractTagText(html, tag) {
  const match = html.match(new RegExp(`<${tag}[^>]*>([\\s\\S]*?)<\\/${tag}>`, "i"));
  return match ? stripTags(match[1]) : "";
}

function extractFirstHeading(html) {
  const match = html.match(/<h1\b[^>]*>([\s\S]*?)<\/h1>/i);
  return match ? stripTags(match[1]) : "";
}

function cleanTitle(value) {
  return decodeHtml(value)
    .replace(/\s*[-|]\s*CNCPioneer\s*$/i, "")
    .replace(/\s+/g, " ")
    .trim();
}

function titleFromUrl(value) {
  const parts = safePathname(value).split("/").filter(Boolean);
  return titleCase(parts[parts.length - 1] || "CNCPioneer");
}

function titleCase(value) {
  return String(value || "")
    .replace(/-/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .split(" ")
    .map((word) => {
      if (/^(cnc|oem|rf|ev|evtol)$/i.test(word)) return word.toUpperCase();
      return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
    })
    .join(" ");
}

function normalizeSentence(value) {
  const text = decodeHtml(value)
    .replace(/\s+/g, " ")
    .replace(/\s+([,.])/g, "$1")
    .trim()
    .replace(/[;:,-]\s*$/, "")
    .replace(/\s+\.\s*$/, ".");

  if (!text) return "";
  return /[.!?]$/.test(text) ? text : `${text}.`;
}

function truncateAtWord(value, maxLength) {
  const text = normalizeSentence(value);
  if (text.length <= maxLength) return text;

  const room = maxLength - 1;
  let truncated = text.slice(0, room).replace(/\s+\S*$/, "").replace(/[;:,\-\s]+$/, "");
  if (truncated.length < minDescriptionLength) {
    truncated = text.slice(0, room).replace(/[;:,\-\s]+$/, "");
  }
  return `${truncated}.`;
}

function safePathname(value) {
  try {
    return new URL(value).pathname;
  } catch {
    return String(value || "");
  }
}

function parseCsv(input) {
  const delimiter = detectDelimiter(input);
  const rows = [];
  let row = [];
  let cell = "";
  let quoted = false;

  for (let index = 0; index < input.length; index += 1) {
    const char = input[index];
    const next = input[index + 1];

    if (quoted && char === "\"" && next === "\"") {
      cell += "\"";
      index += 1;
      continue;
    }

    if (char === "\"") {
      quoted = !quoted;
      continue;
    }

    if (!quoted && char === delimiter) {
      row.push(cell);
      cell = "";
      continue;
    }

    if (!quoted && (char === "\n" || char === "\r")) {
      if (char === "\r" && next === "\n") index += 1;
      row.push(cell);
      rows.push(row);
      row = [];
      cell = "";
      continue;
    }

    cell += char;
  }

  if (cell || row.length) {
    row.push(cell);
    rows.push(row);
  }

  if (!rows.length) return [];
  const headers = rows.shift().map((header) => header.replace(/^\uFEFF/, "").trim());
  return rows
    .filter((items) => items.some((item) => item.trim()))
    .map((items) => Object.fromEntries(headers.map((header, index) => [header, items[index] || ""])));
}

function readTextFile(filePath) {
  const buffer = fs.readFileSync(filePath);
  if (buffer[0] === 0xff && buffer[1] === 0xfe) {
    return buffer.toString("utf16le").replace(/^\uFEFF/, "");
  }

  if (buffer[0] === 0xfe && buffer[1] === 0xff) {
    return Buffer.from(buffer.subarray(2).swap16()).toString("utf16le");
  }

  const sample = buffer.subarray(0, Math.min(buffer.length, 200));
  const nullCount = [...sample].filter((byte) => byte === 0).length;
  if (nullCount > sample.length / 4) {
    return buffer.toString("utf16le").replace(/^\uFEFF/, "");
  }

  return buffer.toString("utf8").replace(/^\uFEFF/, "");
}

function detectDelimiter(input) {
  const firstLine = String(input || "").split(/\r?\n/, 1)[0] || "";
  const tabs = (firstLine.match(/\t/g) || []).length;
  const commas = (firstLine.match(/,/g) || []).length;
  return tabs > commas ? "\t" : ",";
}

function findColumn(record, names) {
  const keys = Object.keys(record || {});
  return names.find((name) => keys.includes(name)) || keys.find((key) => /^(address|url)$/i.test(key)) || "";
}

function getAttr(tag, name) {
  const match = tag.match(new RegExp(`\\b${escapeRegExp(name)}\\s*=\\s*(["'])(.*?)\\1`, "i"));
  return match ? decodeHtml(match[2]) : "";
}

function stripTags(value) {
  return decodeHtml(String(value || "").replace(/<[^>]+>/g, " "));
}

function decodeHtml(value) {
  return String(value || "")
    .replace(/&#x([0-9a-f]+);/gi, (_, hex) => String.fromCodePoint(Number.parseInt(hex, 16)))
    .replace(/&#(\d+);/g, (_, number) => String.fromCodePoint(Number.parseInt(number, 10)))
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, "\"")
    .replace(/&#039;/g, "'")
    .replace(/&apos;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">");
}

function escapeHtml(value) {
  return String(value || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function escapeRegExp(value) {
  return String(value).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
