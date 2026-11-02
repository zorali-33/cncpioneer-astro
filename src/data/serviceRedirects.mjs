// Swiss service detail content is consolidated into the main service page.
export const serviceRedirects = {
  '/services/swiss-machining/swiss-screw-machining': '/services/swiss-machining',
  '/services/swiss-machining/swiss-micro-machining': '/services/swiss-machining',
};

export const isRetiredService = (route) => Object.hasOwn(serviceRedirects, `/${route.replace(/^\/+|\/+$/g, '')}`);
