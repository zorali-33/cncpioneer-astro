// Removed on 2026-10-22/23: the business focuses on Swiss turning and mill-turn
// components. Oversized machining, seal manufacturing, rail glazing/wheels,
// complete mold manufacture, watchmaking and standalone laser guides are retired.
// No equivalent replacement articles; preserve the business scope.
// Retain the original mirror for recovery; public requests should return 404.
export const removedBlogSlugs = new Set([
  // No equivalent music article; do not redirect this unrelated topic to medical machining.
  'cnc-musical-instruments',
  'large-part-cnc-machining',
  'railroads-custom-o-rings-cnc-machining',
  'railroads-skylights-cnc-machining',
  'railroad-seals-cnc-machining',
  'cnc-automotive-mold-machining',
  'cnc-injection-mold-making',
  'railroad-wheel-machining',
  'cnc-watchmaking',
  'laser-marking',
  'sheet-metal-laser-cutter',
  'laser-cutting-vs-cnc-routing',
  'what-is-laser-cutting',
  'laser-vs-plasma-cutting',
  'avoid-haz-laser-cutting-sheet-metal',
  'laser-cutting-vs-waterjet-cutting',
]);

export const removedBlogRoutes = [...removedBlogSlugs].map((slug) => `/blog/${slug}`);
export const isRemovedBlogRoute = (route) => removedBlogRoutes.includes(`/${route.replace(/^\/+|\/+$/g, '')}`);
