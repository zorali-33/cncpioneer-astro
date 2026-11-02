import { defineMiddleware } from 'astro:middleware';
import { applyPageSeoTemplate } from './data/pageSeoTemplate.mjs';
import { applySiteSchema } from './data/siteSchema.mjs';
import { isNotFoundPagePath } from './data/pageRemovals.mjs';
import { applyImageDimensions } from './image-layout.mjs';
import { applyOptimizedImageReferences } from './image-assets.mjs';
import { applySpellingCorrections } from './data/spellingCorrections.mjs';
import { applyReviewedUrlCorrections } from './data/urlCorrections.mjs';
import { applyBrandTheme } from './brand-palette.mjs';
import { applySiteBreadcrumbs } from './data/siteBreadcrumbs.mjs';

// Runs during prerendering as well as local development, including native pages
// and historical mirrored pages. Archived source documents remain unchanged.
export const onRequest = defineMiddleware(async (context, next) => {
  if (isNotFoundPagePath(context.url.pathname)) {
    const response = await context.rewrite('/404');
    const headers = new Headers(response.headers);
    headers.delete('location');
    headers.delete('content-length');
    headers.set('X-Robots-Tag', 'noindex');
    return new Response(context.request.method === 'HEAD' ? null : applyBrandTheme(await response.text()), { status: 404, headers });
  }
  const response = await next();
  if (response.status === 404) {
    const headers = new Headers(response.headers);
    headers.delete('location');
    headers.delete('content-length');
    headers.set('X-Robots-Tag', 'noindex');
    return new Response(context.request.method === 'HEAD' ? null : applyBrandTheme(await response.text()), { status: 404, headers });
  }
  if (response.status !== 200 || !response.headers.get('content-type')?.includes('text/html')) return response;
  const correctedHtml = applyReviewedUrlCorrections(applySpellingCorrections(await response.text(), context.url.pathname),context.url.pathname);
  const html = applyOptimizedImageReferences(correctedHtml, context.url.pathname);
  const headers = new Headers(response.headers);
  headers.delete('content-length');
  const normalizedHtml = applyPageSeoTemplate(applySiteBreadcrumbs(html, context.url.pathname), context.url.pathname);
  return new Response(applyBrandTheme(await applyImageDimensions(applySiteSchema(normalizedHtml, context.url.pathname))), { status: response.status, statusText: response.statusText, headers });
});
