import { defineConfig } from "astro/config";
import industryRedirectIntegration from "./scripts/industry-redirect-integration.mjs";
import { SITE_URL } from "./src/data/siteUrls.mjs";
import imageAssetsIntegration from './scripts/image-assets-integration.mjs';
import quoteMailIntegration from './scripts/quote-mail-integration.mjs';
import {normalizeFontDeclarations} from './src/site-typography.mjs';

export default defineConfig({
  site: SITE_URL,
  devToolbar: {
    enabled: false,
  },
  output: "static",
  vite: {
    css: {
      postcss: {
        plugins: [{
          postcssPlugin: 'cncpioneer-approved-typography',
          Once(root) { normalizeFontDeclarations(root); },
        }],
      },
    },
  },
  integrations: [industryRedirectIntegration(), imageAssetsIntegration(), quoteMailIntegration()],
});
