import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(__dirname, "..");
const distRoot = path.join(projectRoot, "dist");
const csvPath = process.argv[2];

if (!csvPath) {
  console.error("Usage: node scripts/check-meta-descriptions-from-csv.mjs <screaming-frog-csv>");
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
  withDescription: 0,
  emptyDescription: 0,
  missingDistFile: 0,
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
  const description = extractMeta(html, "name", "description");

  if (description.trim()) {
    report.withDescription += 1;
  } else {
    report.emptyDescription += 1;
    report.emptyUrls.push(url);
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

function getAttr(tag, name) {
  const match = tag.match(new RegExp(`${escapeRegExp(name)}\\s*=\\s*("([^"]*)"|'([^']*)'|([^\\s>]+))`, "i"));
  return match ? (match[2] || match[3] || match[4] || "") : "";
}

function findColumn(record, candidates) {
  const names = Object.keys(record);
  return candidates.find((candidate) => names.includes(candidate))
    || names.find((name) => /^(address|url)$/i.test(name));
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
  const firstLine = input.split(/\r?\n/, 1)[0] || "";
  const tabs = (firstLine.match(/\t/g) || []).length;
  const commas = (firstLine.match(/,/g) || []).length;
  return tabs > commas ? "\t" : ",";
}

function decodeHtml(value) {
  return String(value || "")
    .replace(/&quot;/g, "\"")
    .replace(/&#039;/g, "'")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">");
}

function escapeRegExp(value) {
  return String(value).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
