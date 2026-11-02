// Content consolidation approved for local implementation on 2026-10-16.
// Keep original mirrored HTML as an archive; only canonical articles appear in listings.
export const consolidatedBlogSlugs = {
  // Retired from the public site: focus enquiries on Swiss turning and mill-turn work.
  'micro-cnc-machining': 'swiss-machining',
  'cnc-meaning': 'what-is-cnc',
  'cnc-vs-conventional-machining': 'cnc-machining-vs-manual-machining',
  'injection-molding-vs-cnc-machining': 'cnc-machining-vs-injection-molding',
  'prototype-cnc-machining': 'cnc-prototyping',
  'cnc-custom-parts-prototyping': 'cnc-prototyping',
  'rapid-cnc-prototyping': 'cnc-prototyping',
  'cnc-vs-rapid-prototyping': '3d-printing-vs-cnc-machining',
  'cnc-machining-aerospace': 'aerospace-cnc-machining',
  'automotive-machining': 'cnc-machining-for-automotive-industry',
  'cnc-automotive': 'cnc-machining-for-automotive-industry',
  'precision-automotive-machining': 'cnc-machining-for-automotive-industry',
  'precision-medical-machining': 'medical-cnc-machining',
  'cnc-turning-and-milling-materials': 'cnc-machining-materials',
  'machining-surface-finish': 'surface-finish',
  'cnc-vs-laser-cutting': 'cnc-milling-vs-laser-cutting',
  'cnc-turning-and-milling': 'cnc-lathe-vs-mill',
};

export const blogConsolidationRedirects = {
  ...Object.fromEntries(Object.entries(consolidatedBlogSlugs).map(([from, to]) => [`/blog/${from}`, `/blog/${to}`])),
  ...Object.fromEntries(Array.from({ length: 10 }, (_, i) => [`/blog/page/${i + 11}`, '/blog/page/10'])),
  ...Object.fromEntries(Array.from({ length: 9 }, (_, i) => [`/author/ryan-wang/page/${i + 9}`, '/author/ryan-wang/page/8'])),
  '/author/david-li/page/4': '/author/david-li/page/3',
};

export const canonicalBlogSlug = (slug) => consolidatedBlogSlugs[slug] || slug;
export const isConsolidatedRoute = (route) => Object.hasOwn(blogConsolidationRedirects, `/${route.replace(/^\/+|\/+$/g, '')}`);

// Preserve query strings and fragments. Consolidated guides retain the old heading IDs.
export function resolveConsolidatedHref(href) {
  if (!href.startsWith('/') && !/^https?:\/\/(?:www\.)?cncpioneer\.com(?:\/|$)/i.test(href)) return href;
  const url = new URL(href, 'https://www.cncpioneer.com');
  const destination = blogConsolidationRedirects[url.pathname.replace(/\/+$/, '')];
  return destination ? destination + url.search + url.hash : href;
}

export function rewriteConsolidatedLinks(html) {
  return html.replace(/<a\b[^>]*>/gi, (tag) => tag.replace(/\bhref=(['"])(.*?)\1/i,
    (_, quote, href) => `href=${quote}${resolveConsolidatedHref(href)}${quote}`));
}
