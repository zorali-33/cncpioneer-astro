import { copyFile, mkdir, readFile, readdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const sourceCache = path.resolve(
  projectRoot,
  "../cncpioneer-static-clean/wp-content/cache/min/1",
);
const publicCache = path.join(projectRoot, "public/wp-content/cache/min/1");
const pagesRoot = path.join(projectRoot, "src/mirrored-pages");
const pageScripts = new Map([
  [
    "blog/automotive-machining/index.html",
    "46d00e06a01db731ba6100bf41cdbc5a.js",
  ],
  [
    "blog/medical-cnc-machining/index.html",
    "ddd8d082850e91966188aefbe84a0d41.js",
  ],
  [
    "custom-cnc-parts/5-axis-cnc-machining-aerospace-components/index.html",
    "aeacb8a9ddf7a8d6f1ab48aafc8d1fb3.js",
  ],
  [
    "custom-cnc-parts/aluminium-alloy-cnc-turning-bushing/index.html",
    "72dbe75728069c2b38480709f4227c61.js",
  ],
  [
    "custom-cnc-parts/reducer-shaft/index.html",
    "76aac2c03908d7ec31007536a596462a.js",
  ],
  [
    "custom-cnc-parts/robotic-machining-cells/index.html",
    "a0448734f8880205169be8ff4030d85e.js",
  ],
]);
const cacheOrigin = "https://www.cncpioneer.com/wp-content/cache/min/1/";
const cacheLocal = "/wp-content/cache/min/1/";

async function walk(directory) {
  const files = [];
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const entryPath = path.join(directory, entry.name);
    if (entry.isDirectory()) files.push(...(await walk(entryPath)));
    else if (entry.isFile()) files.push(entryPath);
  }
  return files;
}

const cssFiles = (await walk(sourceCache)).filter((file) => file.endsWith(".css"));
for (const sourceFile of [
  ...cssFiles,
  ...[...pageScripts.values()].map((script) => path.join(sourceCache, script)),
]) {
  const destination = path.join(publicCache, path.relative(sourceCache, sourceFile));
  await mkdir(path.dirname(destination), { recursive: true });
  await copyFile(sourceFile, destination);
}

let pagesChanged = 0;
for (const pageFile of (await walk(pagesRoot)).filter((file) => file.endsWith(".html"))) {
  const original = await readFile(pageFile, "utf8");
  let html = original.replaceAll(
    /https:\/\/www\.cncpioneer\.com(\/wp-content\/cache\/min\/1\/[^\s"'<>]+\.css(?:\?[^\s"'<>]*)?)/g,
    "$1",
  );
  const pagePath = path.relative(pagesRoot, pageFile).split(path.sep).join("/");
  const pageScript = pageScripts.get(pagePath);
  if (pageScript) html = html.replaceAll(`${cacheOrigin}${pageScript}`, `${cacheLocal}${pageScript}`);
  if (html !== original) {
    await writeFile(pageFile, html, "utf8");
    pagesChanged += 1;
  }
}

console.log(JSON.stringify({ copiedCss: cssFiles.length, copiedScripts: pageScripts.size, pagesChanged }));
