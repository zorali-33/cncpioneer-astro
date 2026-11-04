import fs from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import { notFoundPagePaths, notFoundPathVariants } from '../src/data/pageRemovals.mjs';
import {pageRedirects, canonicalPageUrl} from '../src/data/siteUrls.mjs';

// Match the development removal policy on supported static hosting platforms.
export default function industryRedirectIntegration() {
  return {
    name: 'canonical-page-hosting-rules',
    hooks: {
      'astro:build:done': async ({ dir }) => {
        const root = fileURLToPath(dir), routes = [];
        async function collect(folder) {
          for (const entry of await fs.readdir(folder, {withFileTypes:true})) {
            const file = path.join(folder, entry.name);
            if (entry.isDirectory()) await collect(file);
            else if (entry.name === 'index.html') routes.push('/' + path.relative(root, folder).replaceAll('\\', '/'));
          }
        }
        await collect(root);
        routes.sort();
        const escape = value => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        const removedRoutes = [...notFoundPagePaths].sort();
        const removedRules = removedRoutes.flatMap((route) => notFoundPathVariants(route).map((variant) => `${variant} /404.html 404!`));
        const redirects = Object.entries(pageRedirects).sort(([a], [b]) => a.localeCompare(b));
        const canonicalVariants = routes.flatMap(route => route === '/'
          ? [`/index.html ${canonicalPageUrl('/')} 301!`]
          : [`${route}/ ${canonicalPageUrl(route)} 301!`, `${route}/index.html ${canonicalPageUrl(route)} 301!`]);
        await fs.writeFile(new URL('_redirects', dir), [
          ...redirects.flatMap(([from, to]) => notFoundPathVariants(from).map(variant => `${variant} ${canonicalPageUrl(to)} 301!`)),
          ...removedRules, ...canonicalVariants,
          'http://cncpioneer.com/* https://www.cncpioneer.com/:splat 301!',
          'https://cncpioneer.com/* https://www.cncpioneer.com/:splat 301!',
          'http://www.cncpioneer.com/* https://www.cncpioneer.com/:splat 301!',
          ...routes.filter(route => route !== '/').map(route => `${route} ${route}/index.html 200!`),
          '',
        ].join('\n'));
        await fs.writeFile(new URL('.htaccess', dir), [
          '# CNCPioneer canonical URLs: HTTPS, www, no trailing slash.',
          '# Prevent directory listings when DirectorySlash is disabled.',
          'Options -Indexes -MultiViews',
          'DirectorySlash Off',
          'DirectoryIndex index.html',
          'ErrorDocument 404 /404.html',
          'RewriteEngine On',
          '# Reviewed moves go directly to the final host and path; preserve queries.',
          ...redirects.map(([from, to]) => `RewriteRule ^${escape(from.slice(1))}(?:/index\\.html)?/*$ ${canonicalPageUrl(to)} [R=301,L]`),
          '# Removed content without an equivalent replacement stays 404.',
          ...removedRoutes.map(route => `RewriteRule ^${escape(route.slice(1))}(?:/index\\.html)?/?$ - [R=404,L]`),
          '# THE_REQUEST guards prevent internal index.html rewrites from redirecting.',
          'RewriteCond %{THE_REQUEST} "\\s/+[^?\\s]*index\\.html(?:[?\\s])" [NC]',
          'RewriteRule ^(.+)/index\\.html$ https://www.cncpioneer.com/$1 [R=301,L]',
          'RewriteCond %{THE_REQUEST} "\\s/+index\\.html(?:[?\\s])" [NC]',
          'RewriteRule ^index\\.html$ https://www.cncpioneer.com/ [R=301,L]',
          'RewriteCond %{THE_REQUEST} "\\s/+[^?\\s]+/+(?:[?\\s])"',
          'RewriteCond %{REQUEST_FILENAME}/index.html -f',
          'RewriteRule ^(.+?)/+$ https://www.cncpioneer.com/$1 [R=301,L]',
          '# Canonicalize navigation without redirecting existing API POST bodies.',
          'RewriteCond %{REQUEST_METHOD} ^(?:GET|HEAD)$',
          'RewriteCond %{HTTPS} !=on [OR]',
          'RewriteCond %{HTTP_HOST} !^www\\.cncpioneer\\.com$ [NC]',
          'RewriteRule ^ https://www.cncpioneer.com%{REQUEST_URI} [R=301,L]',
          '# Serve the index internally so the canonical directory URL returns 200.',
          'RewriteCond %{REQUEST_FILENAME}/index.html -f',
          'RewriteRule ^(.+?)/?$ $1/index.html [L]',
          '<IfModule mod_headers.c>',
          '  <FilesMatch "^(?:brand-theme\\.css|site-search\\.(?:css|js)|navigation-accessibility\\.js|search-index\\.json)$">',
          '    Header set Cache-Control "no-cache"',
          '  </FilesMatch>',
          '</IfModule>',
          '',
        ].join('\n'));
      }
    }
  };
}
