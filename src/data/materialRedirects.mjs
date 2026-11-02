// T3: one 6061 material page with alloy and temper guidance.
export const materialRedirects = {
  "/materials/6061-aluminum-cnc-machining": "/materials/6061-t6-aluminum-cnc-machining"
};
export const isRetiredMaterial = route => Object.hasOwn(materialRedirects, `/${route.replace(/^\/+|\/+$/g, "")}`);
