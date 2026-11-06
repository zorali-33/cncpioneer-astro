// Retired industry landing pages. Keep this map after deleting their content.
export const industryRedirects = {
  '/industries/railroad-machining-services': '/industries/railway',
  '/industries/defense-precision-machining': '/industries/defense',
  '/industries/robotics-cnc-machining': '/industries/robotics',
  '/industries/semiconductor-cnc-machining': '/industries/semiconductor'
};

export const isRetiredIndustry = (slug) => Object.hasOwn(industryRedirects, `/${slug.replace(/^\/+|\/+$/g, '')}`);
