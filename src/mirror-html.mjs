import { searchDialogMarkup, searchAssetsMarkup } from "./search-ui.mjs";

export function withHeaderControls(html) {
  const tocScript = html.includes('data-widget_type="table-of-contents.default"')
    ? '<script src="/mirror-table-of-contents.js" defer></script>'
    : "";
  const relatedPostsStyle = html.includes('elementor-element-3be06d7d')
    ? '<link rel="stylesheet" href="/mirror-related-posts.css">'
    : "";
  const blogArchiveStyle = html.includes('elementor-element-50923972')
    ? '<link rel="stylesheet" href="/mirror-blog-archive.css">'
    : "";
  const trustedCarousel = html.includes('elementor-element-106ea122')
    ? {
        style: '<link rel="stylesheet" href="/mirror-trusted-carousel.css">',
        script: '<script src="/mirror-trusted-carousel.js" defer></script>',
      }
    : { style: "", script: "" };
  const factoryCarousel = html.includes('elementor-element-dcbcd94')
    ? {
        style: '<link rel="stylesheet" href="/mirror-factory-carousel.css">',
        script: '<script src="/mirror-factory-carousel.js" defer></script>',
      }
    : { style: "", script: "" };
  const swissMachiningHeroStyle = html.includes('data-elementor-id="525"')
    ? '<link rel="stylesheet" href="/mirror-swiss-machining-hero.css">'
    : "";
  const industriesStyle = html.includes('data-elementor-id="814"')
    ? '<link rel="stylesheet" href="/mirror-industries.css">'
    : "";
  const elementorInteractions = html.includes('data-widget_type="toggle.default"') || html.includes('data-widget_type="accordion.default"') || html.includes('data-widget_type="nested-tabs.default"')
    ? '<script src="/mirror-elementor-interactions.js" defer></script>'
    : "";
  return html
    .replace(/<\/head>/i, `<link rel="stylesheet" href="/mirror-header-dropdown.css">${searchAssetsMarkup}${relatedPostsStyle}${blogArchiveStyle}${trustedCarousel.style}${factoryCarousel.style}${swissMachiningHeroStyle}${industriesStyle}</head>`)
    .replace(
      /<\/body>/i,
      `${searchDialogMarkup}<script src="/mirror-header-controls.js" defer></script>${elementorInteractions}${tocScript}${trustedCarousel.script}${factoryCarousel.script}</body>`,
    );
}
