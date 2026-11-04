import {industryRedirects} from './industryRedirects.mjs';
import {materialRedirects} from './materialRedirects.mjs';
import {serviceRedirects} from './serviceRedirects.mjs';
import {consolidatedBlogSlugs} from './blogConsolidation.mjs';

// Reviewed equivalents for the 2026-11-04 SEO repair. Out-of-range pagination,
// removed topics and unrelated replacement suggestions remain genuine 404s.
export const permanentPageRedirects = {
  ...industryRedirects,
  ...materialRedirects,
  ...serviceRedirects,
  ...Object.fromEntries(Object.entries(consolidatedBlogSlugs)
    .filter(([slug]) => slug !== 'micro-cnc-machining')
    .map(([from, to]) => [`/blog/${from}`, `/blog/${to}`])),
  '/blog/cnc-locating-pinsi': '/blog/cnc-locating-pins',
  '/blog/cnc-machining-defense': '/blog/cnc-milling-and-turning-defense',
  '/blog/cnc-milling-parts': '/blog/cnc-milling-machine-parts',
  '/blog/medical-swiss-machining': '/industries/medical-swiss-machining',
  '/custom-cnc-parts/cnc-turning-milling-parts': '/custom-cnc-parts/cnc-turning-and-milling-parts',
  '/custom-cnc-parts/machined-contacts': '/custom-cnc-parts/precision-connector-contacts',
  '/custom-cnc-parts/aluminum-alloy-5-axis-cnc-machining': '/custom-cnc-parts/5-axis-aluminum-cnc-machining-parts',
  '/custom-cnc-parts/connector-pins-swiss-screw-machining': '/custom-cnc-parts/connector-pins',
  '/custom-cnc-parts/server-parts': '/custom-cnc-parts/server-components',
  '/custom-cnc-parts/custom-flange-manufacturing': '/custom-cnc-parts/flanges',
  '/custom-cnc-parts/harmonic-drive-components': '/custom-cnc-parts/harmonic-drive-gearbox',
  '/custom-cnc-parts/planetary-gearbox-components': '/custom-cnc-parts/planetary-gearbox',
  '/custom-cnc-parts/radar': '/custom-cnc-parts/radar-systems-parts-machining',
  '/custom-cnc-parts/rails': '/custom-cnc-parts/rail-machining',
  '/custom-cnc-parts/semiconductor-vacuum-chamber-parts': '/custom-cnc-parts/semiconductor-vacuum-chamber',
};
