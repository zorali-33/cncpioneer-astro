import { readFile, readdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const pagesRoot = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "../src/mirrored-pages",
);
const brokenCustomCss =
  /(\.faq-question span\{[^}]*word-break:break-word !important;\s*\})\/\* End custom CSS \*\//g;

async function walk(directory) {
  const files = [];
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const entryPath = path.join(directory, entry.name);
    if (entry.isDirectory()) files.push(...(await walk(entryPath)));
    else if (entry.isFile() && entry.name.endsWith(".html")) files.push(entryPath);
  }
  return files;
}

let pagesChanged = 0;
for (const pageFile of await walk(pagesRoot)) {
  const original = await readFile(pageFile, "utf8");
  const html = original.replace(brokenCustomCss, "$1\n}\n/* End custom CSS */");
  if (html !== original) {
    await writeFile(pageFile, html, "utf8");
    pagesChanged += 1;
  }
}

console.log(JSON.stringify({ pagesChanged }));
