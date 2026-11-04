import { isNotFoundPagePath } from "../src/data/pageRemovals.mjs";
import {pageRedirects, normalizePagePath, resolvePagePath} from '../src/data/siteUrls.mjs';
import { createReadStream, existsSync } from "node:fs";
import { stat } from "node:fs/promises";
import { createServer } from "node:http";
import { extname, isAbsolute, join, relative, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";
import { publicRequestPath, isPrivateRequestPath } from './private-request-path.mjs';

const root = resolve(fileURLToPath(new URL("../dist/", import.meta.url)));
const host = process.env.HOST || "127.0.0.1";
const port = Number(process.env.PORT || 4321);

const mimeTypes = {
  ".css": "text/css; charset=utf-8",
  ".gif": "image/gif",
  ".html": "text/html; charset=utf-8",
  ".ico": "image/x-icon",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".png": "image/png",
  ".svg": "image/svg+xml",
  ".webm": "video/webm",
  ".webp": "image/webp",
  ".woff": "font/woff",
  ".woff2": "font/woff2",
};

function isInsideRoot(directory, filePath) {
  const child = relative(directory, filePath);
  return !isAbsolute(child) && child !== '..' && !child.startsWith(`..${sep}`);
}

async function resolveRequestPath(url, directory) {
  const pathname = publicRequestPath(url);
  if(pathname===null)return null;
  const requested = resolve(directory, `.${pathname}`);
  if (!isInsideRoot(directory, requested)) return null;

  if (existsSync(requested)) {
    const info = await stat(requested);
    if (info.isDirectory()) return join(requested, "index.html");
    return requested;
  }

  const indexFile = join(requested, "index.html");
  if (existsSync(indexFile)) return indexFile;

  return null;
}

export function createStaticRequestHandler({ directory = root } = {}) {
  const buildRoot = resolve(directory);
  const sendNotFound = (request, response) => {
    response.writeHead(404, { "Content-Type": "text/html; charset=utf-8", "X-Robots-Tag": "noindex", "Cache-Control": "no-cache" });
    const notFound = join(buildRoot, '404.html');
    if (request.method === 'HEAD') response.end();
    else if (existsSync(notFound)) createReadStream(notFound).pipe(response);
    else response.end('Not found');
  };
  return async (request, response) => {
  try {
    const pathname = publicRequestPath(request.url || '/');
    if(pathname===null){response.writeHead(400,{'Content-Type':'text/plain; charset=utf-8'});response.end('Bad request');return;}
    if (pathname === '/api/quote.php') {
      response.writeHead(503, { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store', 'X-Robots-Tag': 'noindex' });
      response.end(JSON.stringify({ ok: false, message: 'Your enquiry was not sent. Please email info@cncpioneer.com.' }));
      return;
    }
    if (pathname.toLowerCase().startsWith('/api/') || isPrivateRequestPath(pathname)) {
      sendNotFound(request, response);
      return;
    }
    const normalizedPath = normalizePagePath(pathname);
    if (Object.hasOwn(pageRedirects, normalizedPath)) {
      response.writeHead(301, {Location: resolvePagePath(normalizedPath) + new URL(request.url, 'http://localhost').search, 'Cache-Control':'no-cache'});
      response.end();
      return;
    }
    if (isNotFoundPagePath(pathname) || /^\/404(?:\.html)?\/?$/.test(pathname)) {
      sendNotFound(request, response);
      return;
    }
    const filePath = await resolveRequestPath(request.url || "/", buildRoot);
    if (!filePath || !existsSync(filePath)) {
      sendNotFound(request, response);
      return;
    }
    if (filePath.endsWith(`${sep}index.html`) && pathname !== normalizedPath) {
      response.writeHead(301, {Location: normalizedPath + new URL(request.url, 'http://localhost').search, 'Cache-Control':'no-cache'});
      response.end();
      return;
    }

    response.writeHead(200, {
      "Content-Type": mimeTypes[extname(filePath).toLowerCase()] || "application/octet-stream",
      "Cache-Control": "no-cache",
    });

    if (request.method === "HEAD") {
      response.end();
      return;
    }

    createReadStream(filePath).pipe(response);
  } catch (error) {
    response.writeHead(500, { "Content-Type": "text/plain; charset=utf-8" });
    response.end("Server error");
  }
  };
}

// Importing the handler for verification must not launch a second local server.
if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  createServer(createStaticRequestHandler()).listen(port, host, () => {
    console.log(`Static server ready at http://${host}:${port}/`);
  });
}
