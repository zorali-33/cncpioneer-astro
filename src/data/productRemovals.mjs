// Removed on 2026-10-23 after the owner confirmed that large structural/wind-power flanges are not supplied.
// No equivalent replacement: return 404 and retain the original source only for recovery.
export const removedProductSlugs = new Set(['large-diameter-flanges']);
export const removedProductRoutes = [...removedProductSlugs].map(slug => `/custom-cnc-parts/${slug}`);
export const isRemovedProductRoute = route => removedProductRoutes.includes(`/${route.replace(/^\/+|\/+$/g, '')}`);
