import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const minDescriptionLength = 120;
const maxDescriptionLength = 155;
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(__dirname, "..");
const distRoot = path.join(projectRoot, "dist");
const csvPath = process.argv[2];

if (!csvPath) {
  console.error("Usage: node scripts/check-short-meta-descriptions-from-csv.mjs <screaming-frog-csv>");
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
  checkedExisting: 0,
  withinRange: 0,
  tooShort: 0,
  tooLong: 0,
  emptyDescription: 0,
  missingDistFile: 0,
  tooShortUrls: [],
  tooLongUrls: [],
  emptyUrls: [],
  missingUrls: [],
};

for (const record of records) {
  const url = record[urlColumn];
  const localFile = resolveDistFile(url);

  if (!localFile || !fs.existsSync(localFile)) {
    report.missingDistFile += 1;
    report.missingUrls.push(url);
    continue;
  }

  report.checkedExisting += 1;
  const html = fs.readFileSync(localFile, "utf8");
  const description = extractMeta(html, "name", "description").trim();

  if (!description) {
    report.emptyDescription += 1;
    report.emptyUrls.push(url);
  } else if (description.length < minDescriptionLength) {
    report.tooShort += 1;
    report.tooShortUrls.push({ url, length: description.length, description });
  } else if (description.length > maxDescriptionLength) {
    report.tooLong += 1;
    report.tooLongUrls.push({ url, length: description.length, description });
  } else {
    report.withinRange += 1;
  }
}

console.log(JSON.stringify(report, null, 2));

function resolveDistFile(value) {
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

  if (!pathname) return path.join(distRoot, "index.html");
  return path.join(distRoot, pathname, "index.html");
}

function extractMeta(html, attr, key) {
  const tags = html.match(/<meta\b[^>]*>/gi) || [];
  const tag = tags.find((item) => (getAttr(item, attr) || "").toLowerCase() === key.toLowerCase());
  return tag ? decodeHtml(getAttr(tag, "content") || "") : "";
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

function escapeRegExp(value) {
  return String(value).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
