import { materialRedirects } from "./materialRedirects.mjs";
import { industryRedirects } from './industryRedirects.mjs';
import { blogConsolidationRedirects } from './blogConsolidation.mjs';
import { productRedirects } from './productRedirects.mjs';
import { serviceRedirects } from './serviceRedirects.mjs';

export const SITE_URL = 'https://www.cncpioneer.com';

// Historical aliases are retained only to identify routes that must return 404.
export const legacyRetiredPages = {
  '/blog/ai-cnc-machining': '/blog/what-is-cnc',
  '/blog/ai-cnc-programming': '/blog/what-is-cnc',
  '/blog/cnc-locating-pinsi': '/blog/cnc-locating-pins',
  '/blog/cnc-machining-defense': '/blog/cnc-milling-and-turning-defense',
  '/blog/cnc-milling-parts': '/blog/cnc-milling-machine-parts',
  '/blog/medical-swiss-machining': '/industries/medical-swiss-machining',
  '/blog/swiss-machining-defense': '/services/swiss-machining',
};
export const retiredPageTargets = {
  ...industryRedirects, ...blogConsolidationRedirects, ...productRedirects, ...materialRedirects,
  ...serviceRedirects, ...legacyRetiredPages,
};
export const retiredPagePaths = new Set(Object.keys(retiredPageTargets));

// Retired routes no longer redirect to an alternative page.
export const pageRedirects = {};

const ownHosts = new Set(['cncpioneer.com', 'www.cncpioneer.com', 'localhost', '127.0.0.1', '[::1]']);
export const normalizePagePath = (path) => path.replace(/\/index\.html$/i, '/').replace(/\/+$/, '') || '/';
export const isRetiredPagePath = (route) => retiredPagePaths.has(normalizePagePath(route));
export const isPagePath = (path) => !/^\/(?:wp-content|wp-includes|wp-json|_astro|assets)(?:\/|$)/i.test(path)
  && (!/\.[^/]+\/?$/.test(path) || /\/index\.html$/i.test(path))
  && !/(?:^|\/)feed\/?$/i.test(path);

export function resolvePagePath(path) {
  let result = normalizePagePath(path);
  const visited = new Set();
  while (pageRedirects[result]) {
    if (visited.has(result)) throw new Error(`Redirect cycle: ${result}`);
    visited.add(result);
    result = normalizePagePath(pageRedirects[result]);
  }
  return result;
}

// Canonical identities never contain a query or fragment. Navigation retains both.
export function canonicalPageUrl(value) {
  const url = new URL(value || '/', SITE_URL);
  return SITE_URL + resolvePagePath(url.pathname);
}

export function normalizeInternalHref(value, currentPath = '/', absolute = false) {
  if (!value || /^(?:#|mailto:|tel:|javascript:|data:)/i.test(value)) return value;
  let url;
  try { url = new URL(value, SITE_URL + normalizePagePath(currentPath)); } catch { return value; }
  if (!['http:', 'https:'].includes(url.protocol) || !ownHosts.has(url.hostname.toLowerCase()) || !isPagePath(url.pathname)) return value;
  // Visitors to a retired URL receive 404, but links rendered inside the site
  // should always point to the current page that replaced it.
  const targetPath = retiredPageTargets[normalizePagePath(url.pathname)] || url.pathname;
  const target = resolvePagePath(targetPath) + url.search + url.hash;
  return absolute ? SITE_URL + target : target;
}

export function absoluteAssetUrl(value) {
  return value ? new URL(value, SITE_URL).href : value;
}
