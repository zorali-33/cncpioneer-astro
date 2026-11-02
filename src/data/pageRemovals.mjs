import { removedBlogRoutes } from './blogRemovals.mjs';
import { removedProductRoutes } from './productRemovals.mjs';
import { normalizePagePath, retiredPagePaths } from './siteUrls.mjs';

// One removal registry for development, static hosting and sitemap generation.
// Archived source content stays available for recovery, without a public route.
export const notFoundPagePaths = new Set([
  ...removedBlogRoutes, ...removedProductRoutes, ...retiredPagePaths,
]);

export function isNotFoundPagePath(pathname) {
  let decoded = pathname;
  try { decoded = decodeURIComponent(pathname); } catch { /* Keep malformed paths unchanged. */ }
  return notFoundPagePaths.has(normalizePagePath(decoded.replace(/\/+$/, '')));
}

export const notFoundPathVariants = (route) => [route, route + '/', route + '/index.html'];
