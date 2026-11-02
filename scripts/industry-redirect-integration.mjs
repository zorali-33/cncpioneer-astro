import fs from 'node:fs/promises';
import { notFoundPagePaths, notFoundPathVariants } from '../src/data/pageRemovals.mjs';

// Match the development removal policy on supported static hosting platforms.
export default function industryRedirectIntegration() {
  return {
    name: 'retired-page-not-found-rules',
    hooks: {
      'astro:build:done': async ({ dir }) => {
        const removedRoutes = [...notFoundPagePaths].sort();
        const removedRules = removedRoutes.flatMap((route) => notFoundPathVariants(route).map((variant) => `${variant} /404.html 404!`));
        await fs.writeFile(new URL('_redirects', dir), removedRules.join('\n') + '\n');
        await fs.writeFile(new URL('.htaccess', dir), '# Custom not-found page\nErrorDocument 404 /404.html\nRewriteEngine On\n' +
          removedRoutes.map((route) => `RewriteRule ^${route.slice(1).replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}(?:/index\\.html)?/?$ - [R=404,L]`).join('\n') + '\n');
      }
    }
  };
}
