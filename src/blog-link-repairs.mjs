import { parse, walkSync, ELEMENT_NODE } from 'ultrahtml';

const citationRepairs = new Set([
  "cnc-machining-heavy-truck-industry",
  "cnc-milling-machine-parts",
  "precision-aerospace-cnc-machined-parts",
  "precision-cnc-milling-parts",
  "precision-cnc-turning",
]);

// Apply presentation repairs without changing the archived source documents.
export function repairBlogArticleLinks(html, slug) {
  let result = html.replace(/(<a\b[^>]*\bhref=")https?:\/\/(?:www\.)?cncpioneer\.com(?=[/"?#])([^"\s]*)"/gi,
    (_, start, path) => `${start}${path.startsWith("/") ? path : `/${path}`}"`);

  result = result.replace(/(href=")\/blog\/medical-swiss-machining(?=["#?])/g, "$1/industries/medical-swiss-machining");

  if (!citationRepairs.has(slug)) return result;

  // These two reference lists retained IDs from an older numbering scheme.
  if (["precision-aerospace-cnc-machined-parts", "precision-cnc-milling-parts"].includes(slug)) {
    result = result.replace(/<p(?:\s+id="ref\d+")?>\s*\[(\d+)\]/g,
      (_, number) => `<p id="ref${number.padStart(2, "0")}">[${number}]`);
  }

  const citationPath = slug === "cnc-machining-heavy-truck-industry"
    ? "railroads-custom-o-rings-cnc-machining"
    : slug === "cnc-milling-machine-parts" ? "cnc-milling-parts" : slug;
  result = result.replace(/<a\b([^>]*)>([\s\S]*?)<\/a>/gi, (anchor, attributes, label) => {
    const target = attributes.match(/\bhref="\/blog\/([^"#]+)#(ref\d+)"/);
    if (!target || target[1] !== citationPath) return anchor;
    const number = Number(target[2].slice(3));
    const attrs = attributes
      .replace(/\bhref="[^"]*"/, `href="#${target[2]}"`)
      .replace(/\s+id="[^"]*"/, "");
    return `<a${attrs}>${label.replace(/\d+/, String(number))}</a>`;
  });
  return result;
}

export function repairBlogLinkIds(html) {
  // Run after the exact-match editorial link amendments. WordPress copied
  // destination URLs into IDs, so repeated citations created duplicate IDs.
  return html.replace(/(<a\b[^>]*?)\s+id="(?:https?:\/\/|\/)[^"]*"/gi, '$1');
}

export function repairBlogMedia(html, slug) {
  if (slug === 'aluminium-melting-point') {
    // The identical chart was already imported; its original host now rejects
    // requests. Keep the existing source attribution and use the local copy.
    html = html.replace(/src="https:\/\/hugh-aluminum\.com\/wp-content\/uploads\/2024\/08\/aluminum-alloys-and-their-melting-points-1024x658\.webp"/g,
      'src="/wp-content/uploads/2024/08/aluminum-alloys-and-their-melting-points-1024x658.webp"');
  }
  if (slug === 'cnc-milling-and-turning-defense') {
    const illustrations = [
      ['robersontool.com', '/wp-content/uploads/2026/10/defense-electronics-metal-enclosure-single-v1.webp', 'Machined metal enclosure with mounting holes and pockets'],
      ['ultramachining.com', '/wp-content/uploads/2026/02/5-axis-CNC-machine.jpg', 'CNC milling setup for a complex metal housing'],
      ['defenseadvancement.com', '/wp-content/uploads/2026/10/titanium-swiss-screw-machined-parts-overview.png', 'Turned titanium fastener examples'],
      ['hmaking.com', '/wp-content/uploads/2026/05/cnc-machining-parts-defense.jpg', 'Multi-axis machining of a complex metal component'],
    ];
    html = html.replace(/<figure\b[^>]*>[\s\S]*?<\/figure>/gi, figure => {
      const replacement = illustrations.find(([host]) => figure.includes('https://' + host) || figure.includes('https://www.' + host));
      return replacement ? `<figure class="wp-block-image"><img src="${replacement[1]}" alt="${replacement[2]}" loading="lazy" decoding="async" /></figure>` : figure;
    });
  }
  if (slug === 'stainless-steel-cnc-machining') {
    // The preceding grade table already supplies the comparison. Remove the
    // unavailable third-party graphic and its introductory sentence together.
    html = html.replace(/<p>And here&#8217;s a visual comparison of 304 vs\. 316 composition[\s\S]*?<\/p>\s*<figure\b[^>]*>[\s\S]*?images\.prismic\.io[\s\S]*?<\/figure>/i, '');
  }
  return html;
}

export function addArchiveContentTarget(html) {
  let archive;
  walkSync(parse(html), node => {
    if (node.type === ELEMENT_NODE && node.attributes['data-elementor-type'] === 'archive') archive ||= node;
  });
  if (!archive) return html;
  const opening = html.slice(archive.loc[0].start, archive.loc[0].end)
    .replace(/^<\w+/, '<main');
  const attrs = `${archive.attributes.id ? '' : ' id="content"'}${archive.attributes.tabindex ? '' : ' tabindex="-1"'}`;
  return html.slice(0, archive.loc[0].start) + opening.replace(/>$/, `${attrs}>`)
    + html.slice(archive.loc[0].end, archive.loc[1].start) + '</main>' + html.slice(archive.loc[1].end);
}
