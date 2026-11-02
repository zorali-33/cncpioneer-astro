import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const minTitleLength = 30;
const maxTitleLength = 60;
const brand = "CNCPioneer";
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(__dirname, "..");
const mirroredRoot = path.join(projectRoot, "src", "mirrored-pages");
const csvPath = process.argv[2];

if (!csvPath) {
  console.error("Usage: node scripts/fix-title-tags-from-csv.mjs <screaming-frog-csv>");
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
  skippedGeneratedRoute: 0,
  skippedWithinRange: 0,
  missingLocalFile: 0,
  unchanged: 0,
  files: [],
  generatedUrls: [],
  missingUrls: [],
};

for (const record of records) {
  const url = record[urlColumn];
  const pathname = safePathname(url);

  if (isGeneratedRoute(pathname)) {
    report.skippedGeneratedRoute += 1;
    report.generatedUrls.push(url);
    continue;
  }

  const localFile = resolveLocalFile(url);
  if (!localFile || !fs.existsSync(localFile)) {
    report.missingLocalFile += 1;
    report.missingUrls.push(url);
    continue;
  }

  const before = fs.readFileSync(localFile, "utf8");
  const currentTitle = cleanSpaces(extractTagText(before, "title"));
  const nextTitle = makeTitle(before, url);

  if (currentTitle === nextTitle && inRange(currentTitle)) {
    report.skippedWithinRange += 1;
    continue;
  }

  const afterTitle = upsertTitle(before, nextTitle);
  const after = upsertOgTitle(afterTitle, nextTitle);

  if (after === before) {
    report.unchanged += 1;
    continue;
  }

  fs.writeFileSync(localFile, after);
  report.updated += 1;
  report.files.push(path.relative(projectRoot, localFile).replaceAll("\\", "/"));
}

console.log(JSON.stringify(report, null, 2));

function makeTitle(html, url) {
  const pathname = safePathname(url);
  const pageType = getPageType(pathname);
  const base = cleanBaseTitle(extractFirstHeading(html) || extractTagText(html, "title") || titleFromUrl(url));

  if (pageType === "parts") {
    return fitTitle(base, "Custom CNC Parts");
  }
  if (pageType === "materials") {
    return fitTitle(base, "CNC Machining");
  }
  if (pageType === "services") {
    return fitTitle(base, "CNC Service");
  }
  if (pageType === "industries") {
    return fitTitle(base, "CNC Machining");
  }
  if (pageType === "blog") {
    return fitTitle(base, "CNC Guide");
  }

  return fitTitle(base, "");
}

function fitTitle(baseValue, qualifier) {
  const base = cleanSpaces(baseValue);
  const suffix = ` | ${brand}`;
  const qualified = qualifier && !base.toLowerCase().includes(qualifier.toLowerCase())
    ? `${base} ${qualifier}`
    : base;

  const candidates = [
    `${base}${suffix}`,
    `${qualified}${suffix}`,
  ].filter(Boolean);

  const firstInRange = candidates.find(inRange);
  if (firstInRange) return firstInRange;

  const preferred = candidates.find((title) => title.length <= maxTitleLength) || candidates[0];
  if (preferred.length >= minTitleLength && preferred.length <= maxTitleLength) return preferred;
  if (preferred.length < minTitleLength) return preferred;

  const room = maxTitleLength - suffix.length;
  return `${truncateAtWord(base, room)}${suffix}`;
}

function inRange(value) {
  return value.length >= minTitleLength && value.length <= maxTitleLength;
}

function isGeneratedRoute(pathname) {
  return /^\/blog\/page\/\d+\/?$/.test(pathname)
    || /^\/author\/[^/]+\/page\/\d+\/?$/.test(pathname);
}

function getPageType(pathname) {
  if (pathname.startsWith("/blog/")) return "blog";
  if (pathname.startsWith("/services/")) return "services";
  if (pathname.startsWith("/materials/")) return "materials";
  if (pathname.startsWith("/industries/")) return "industries";
  if (pathname.startsWith("/custom-cnc-parts/")) return "parts";
  return "default";
}

function resolveLocalFile(value) {
  const pathname = decodeURIComponent(safePathname(value))
    .replace(/\/+$/, "")
    .replace(/^\/+/, "");

  if (!pathname) return path.join(mirroredRoot, "index.html");
  return path.join(mirroredRoot, pathname, "index.html");
}

function upsertTitle(html, title) {
  const escaped = escapeHtml(title);
  if (/<title\b/i.test(html)) {
    return html.replace(/<title\b[^>]*>[\s\S]*?<\/title>/i, `<title>${escaped}</title>`);
  }
  return html.replace(/<head\b[^>]*>/i, (match) => `${match}\n\t<title>${escaped}</title>`);
}

function upsertOgTitle(html, title) {
  const pattern = /<meta\b(?=[^>]*property=["']og:title["'])[^>]*>/i;
  const tag = `<meta property="og:title" content="${escapeHtml(title)}">`;
  if (pattern.test(html)) return html.replace(pattern, tag);
  return html.replace(/<\/head>/i, `\t${tag}\n</head>`);
}

function cleanBaseTitle(value) {
  let text = decodeHtml(value)
    .replace(/\s*[-|]\s*CNCPioneer\s*$/i, "")
    .replace(/\s+/g, " ")
    .trim();

  if (text.includes("|")) text = text.split("|")[0].trim();
  text = text
    .replace(/\bManufacturers?\b/gi, "Manufacturer")
    .replace(/\bManufacturing\b/gi, "Machining")
    .replace(/\s+/g, " ")
    .trim();

  return text || "Precision CNC Machining";
}

function truncateAtWord(value, maxLength) {
  const text = cleanSpaces(value);
  if (text.length <= maxLength) return text;
  let truncated = text.slice(0, maxLength).replace(/\s+\S*$/, "").replace(/[|,;:\-\s]+$/, "");
  if (truncated.length < 18) truncated = text.slice(0, maxLength).replace(/[|,;:\-\s]+$/, "");
  return truncated;
}

function extractTagText(html, tag) {
  const match = html.match(new RegExp(`<${tag}[^>]*>([\\s\\S]*?)<\\/${tag}>`, "i"));
  return match ? stripTags(match[1]) : "";
}

function extractFirstHeading(html) {
  const match = html.match(/<h1\b[^>]*>([\s\S]*?)<\/h1>/i);
  return match ? stripTags(match[1]) : "";
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

function stripTags(value) {
  return decodeHtml(String(value || "").replace(/<[^>]+>/g, " "));
}

function cleanSpaces(value) {
  return decodeHtml(value).replace(/\s+/g, " ").trim();
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
