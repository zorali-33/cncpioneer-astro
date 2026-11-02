import { mkdir, readFile, stat, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const pagesRoot = path.join(projectRoot, "src/mirrored-pages");
const publicRoot = path.join(projectRoot, "public");
const manifestPath = path.join(pagesRoot, "manifest.json");
const origin = "https://www.cncpioneer.com";
const userAgent = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36";
const assetUrls = new Set();
const downloaded = [];
const failures = [];
const missingAtOrigin = [];

const inputs = process.argv.slice(2);
if (inputs.length === 0) {
  throw new Error("Usage: node scripts/import-pages.mjs <site page URL> [...]");
}

function isSameSite(url) {
  return url.hostname === "www.cncpioneer.com" || url.hostname === "cncpioneer.com";
}

function urlFrom(value, base) {
  if (!value || /^(?:#|data:|mailto:|tel:|javascript:)/i.test(value)) return null;
  try {
    return new URL(value.replaceAll("&amp;", "&"), base);
  } catch {
    return null;
  }
}

function queueAsset(value, base) {
  const url = urlFrom(value, base);
  if (!url || !isSameSite(url)) return;
  if (!/^\/(?:wp-content|wp-includes)\//.test(url.pathname)) return;
  url.protocol = "https:";
  url.hostname = "www.cncpioneer.com";
  url.hash = "";
  assetUrls.add(url.href);
}

function collectAssets(text, base) {
  const attributes = /\b(?:href|src|poster|data-src|data-lazy-src|data-rocket-src|data-bg|data-background|data-background-image)=["']([^"']+)["']/gi;
  for (const match of text.matchAll(attributes)) queueAsset(match[1], base);

  const srcsets = /\b(?:srcset|data-srcset|data-lazy-srcset)=["']([^"']+)["']/gi;
  for (const match of text.matchAll(srcsets)) {
    for (const entry of match[1].split(",")) queueAsset(entry.trim().split(/\s+/)[0], base);
  }

  for (const match of text.matchAll(/url\(\s*(['"]?)(.*?)\1\s*\)/gi)) {
    queueAsset(match[2], base);
  }
  for (const match of text.matchAll(/@import\s+(?:url\()?\s*["']([^"']+)["']/gi)) {
    queueAsset(match[1], base);
  }
}

function localize(text) {
  return text
    .replaceAll(/https?:\/\/(?:www\.)?cncpioneer\.com(?=\/)/gi, "")
    .replaceAll(/\/\/(?:www\.)?cncpioneer\.com(?=\/)/gi, "")
    .replaceAll(/https?:\\\/\\\/(?:www\.)?cncpioneer\.com(?=\\\/)/gi, "");
}

function assetPath(url) {
  const segments = new URL(url).pathname.split("/").filter(Boolean).map((segment) =>
    decodeURIComponent(segment).replace(/[<>:"\\|?*\x00-\x1f]/g, "_"),
  );
  return path.join(publicRoot, ...segments);
}

async function fetchWithRetry(url) {
  let lastError;
  for (let attempt = 0; attempt < 3; attempt += 1) {
    try {
      const response = await fetch(url, {
        headers: { "user-agent": userAgent, accept: "*/*" },
        redirect: "follow",
        signal: AbortSignal.timeout(60000),
      });
      if (response.status === 404) {
        const error = new Error(`HTTP 404: ${url}`);
        error.status = 404;
        throw error;
      }
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      return response;
    } catch (error) {
      if (error.status === 404) throw error;
      lastError = error;
      await new Promise((resolve) => setTimeout(resolve, 500 * (attempt + 1)));
    }
  }
  throw new Error(`${url}: ${lastError.message}`);
}

async function downloadAsset(url) {
  const destination = assetPath(url);
  try {
    if ((await stat(destination)).size > 0) return;
  } catch {
    // The asset has not been mirrored yet.
  }

  try {
    const response = await fetchWithRetry(url);
    const extension = path.extname(new URL(url).pathname).toLowerCase();
    const textAsset = extension === ".css" || extension === ".js" || extension === ".mjs";
    await mkdir(path.dirname(destination), { recursive: true });
    if (textAsset) {
      const text = await response.text();
      if (extension === ".css") collectAssets(text, response.url);
      await writeFile(destination, localize(text), "utf8");
    } else {
      await writeFile(destination, Buffer.from(await response.arrayBuffer()));
    }
    downloaded.push(url);
  } catch (error) {
    if (error.status === 404) missingAtOrigin.push(url);
    else failures.push(error.message);
  }
}

async function runPool(items, limit, worker) {
  let next = 0;
  await Promise.all(Array.from({ length: limit }, async () => {
    while (next < items.length) await worker(items[next++]);
  }));
}

const manifest = JSON.parse(await readFile(manifestPath, "utf8"));
const existing = new Set(manifest.map((page) => page.slug));
const pages = [];
for (const input of inputs) {
  const url = urlFrom(input, origin);
  if (!url || !isSameSite(url) || url.search || url.hash) {
    throw new Error(`Invalid site page URL: ${input}`);
  }
  const slug = url.pathname.replace(/^\/+|\/+$/g, "");
  if (!slug || existing.has(slug)) throw new Error(`Page already mirrored: ${slug}`);
  const response = await fetchWithRetry(url.href);
  if (new URL(response.url).pathname.replace(/\/$/, "") !== url.pathname.replace(/\/$/, "")) {
    throw new Error(`Page redirected: ${url.href} -> ${response.url}`);
  }
  const html = await response.text();
  if (!/<html\b/i.test(html) || !/<\/html>/i.test(html)) {
    throw new Error(`Incomplete HTML: ${url.href}`);
  }
  collectAssets(html, response.url);
  pages.push({ slug, file: `${slug}/index.html`, html: localize(html) });
  existing.add(slug);
  console.error(`Fetched page ${slug}: ${html.length} characters`);
}

for (const chunk of ["background-slideshow", "background-video", "text-editor", "image-carousel"]) {
  queueAsset(`/wp-content/plugins/elementor/assets/js/chunks/${chunk}.min.js?ver=4.3.2`, origin);
}

let processed = 0;
while (processed < assetUrls.size) {
  const batch = [...assetUrls].slice(processed);
  processed = assetUrls.size;
  await runPool(batch, 8, downloadAsset);
  console.error(`Assets checked: ${processed}/${assetUrls.size}, downloaded: ${downloaded.length}, missing at origin: ${missingAtOrigin.length}, failed: ${failures.length}`);
}
if (failures.length > 0) throw new Error(`Asset download failures:\n${failures.join("\n")}`);

for (const page of pages) {
  const destination = path.join(pagesRoot, page.file);
  await mkdir(path.dirname(destination), { recursive: true });
  await writeFile(destination, page.html, "utf8");
  manifest.push({ slug: page.slug, file: page.file });
}
manifest.sort((a, b) => a.slug.localeCompare(b.slug));
await writeFile(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`, "utf8");
console.log(JSON.stringify({ pages: pages.map((page) => page.slug), assetsDownloaded: downloaded.length, assetsChecked: assetUrls.size, missingAtOrigin }));
