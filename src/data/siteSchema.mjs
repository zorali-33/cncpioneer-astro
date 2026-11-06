import { parse, walkSync, ELEMENT_NODE, TEXT_NODE } from 'ultrahtml';
import { decodeHTML } from 'entities';
import { SITE_URL, canonicalPageUrl, normalizePagePath, isRetiredPagePath } from './siteUrls.mjs';
import { jsonLd } from './articleSchema.mjs';

export const ORGANIZATION_ID = SITE_URL + '/#organization';
export const WEBSITE_ID = SITE_URL + '/#website';
const ref = (id) => ({ '@id': id });
const types = (node) => [].concat(node?.['@type'] || []);
const isType = (node, type) => types(node).includes(type);
const attr = (node, key) => decodeHTML(node?.attributes?.[key] || '');
const textOf = (node) => node.type === TEXT_NODE ? node.value
  : node.name === 'br' ? ' ' : (node.children || []).map(textOf).join('');
const cleanText = (node) => decodeHTML(textOf(node)).replace(/\s+/g, ' ').trim();
const ownHosts = new Set(['cncpioneer.com', 'www.cncpioneer.com', 'localhost', '127.0.0.1', '[::1]']);
const isDescendantOf = (node, test) => {
  for (let parent = node.parent; parent; parent = parent.parent) if (test(parent)) return true;
  return false;
};
const inNavigation = (node) => isDescendantOf(node, (parent) =>
  // Historical Elementor archives wrap their main content in a footer element.
  // Its explicit archive role distinguishes it from the actual site footer.
  (['header', 'footer', 'nav'].includes(parent.name) && attr(parent, 'data-elementor-type') !== 'archive') ||
  /^(header|footer)$/.test(attr(parent, 'data-elementor-type')) ||
  /elementor-location-(header|footer)|breadcrumb|pagination/.test(attr(parent, 'class')));

// Identity and contact fields come from the site's visible header/footer.
// Deliberately omit unverifiable ratings, certifications, prices and legal identifiers.
export function organizationSchema() {
  return {
    '@type': 'Organization', '@id': ORGANIZATION_ID, name: 'CNCPioneer',
    url: SITE_URL + '/',
    logo: { '@type': 'ImageObject', '@id': SITE_URL + '/#logo', url: SITE_URL + '/wp-content/uploads/2025/11/cncpioneer_nav_logo.png' },
    email: 'info@cncpioneer.com', telephone: '+8613725562746',
    address: {
      '@type': 'PostalAddress',
      streetAddress: 'Room 1202B54, 12th Floor, Tairan Cangsong Building, No. 25, Futian District',
      addressLocality: 'Shenzhen', addressCountry: 'CN',
    },
  };
}

export function websiteSchema() {
  return { '@type': 'WebSite', '@id': WEBSITE_ID, name: 'CNCPioneer',
    url: SITE_URL + '/', publisher: ref(ORGANIZATION_ID), inLanguage: 'en-US' };
}

function flattenDocuments(value) {
  if (Array.isArray(value)) return value.flatMap(flattenDocuments);
  if (!value || typeof value !== 'object') return [];
  if (Array.isArray(value['@graph'])) return value['@graph'].flatMap(flattenDocuments);
  const { '@context': context, ...node } = value;
  return [node];
}

function absoluteUrl(value, route) {
  if (!value) return value;
  try {
    const url = new URL(value, SITE_URL + route);
    if (!['http:', 'https:'].includes(url.protocol)) return value;
    if (!ownHosts.has(url.hostname.toLowerCase())) return url.href;
    // Asset paths must retain their filename; page identities follow existing redirects.
    if (/^\/(?:wp-content|wp-includes|assets|_astro)\//.test(url.pathname)) return SITE_URL + url.pathname + url.search + url.hash;
    return canonicalPageUrl(url.pathname) + url.search + url.hash;
  } catch { return value; }
}

const urlKeys = new Set(['url', '@id', 'item', 'image', 'logo', 'thumbnailUrl', 'contentUrl', 'embedUrl', 'sameAs', 'mainEntityOfPage']);
function normalizeNode(value, route, key = '') {
  if (Array.isArray(value)) return value.map((entry) => normalizeNode(entry, route, key));
  if (value && typeof value === 'object') {
    const result = Object.fromEntries(Object.entries(value).filter(([key]) => key !== '@context')
      .map(([key, entry]) => [key, normalizeNode(entry, route, key)]));
    if (isType(result, 'Person') && result.url?.includes('/author/')) {
      result.url = canonicalPageUrl(result.url.replace(/\/page\/\d+$/, ''));
      result['@id'] = result.url + '#person';
      if (result.sameAs) {
        result.sameAs = [].concat(result.sameAs).filter((url) => {
          try { return !ownHosts.has(new URL(url).hostname.toLowerCase()); } catch { return false; }
        });
        if (!result.sameAs.length) delete result.sameAs;
      }
    }
    return result;
  }
  return typeof value === 'string' && urlKeys.has(key) ? absoluteUrl(value, route) : value;
}

function collectionItems(nodes, route) {
  const blogList = route === '/blog' || /^\/blog\/page\/\d+$/.test(route) || /^\/blog\/category\/[^/]+(?:\/page\/\d+)?$/.test(route) || /^\/author\/[^/]+\/page\/\d+$/.test(route);
  const prefix = blogList ? '/blog/' : route + '/';
  const items = new Map();
  for (const node of nodes) {
    if (node.name !== 'a' || inNavigation(node)) continue;
    let url;
    try { url = new URL(attr(node, 'href'), SITE_URL); } catch { continue; }
    if (!ownHosts.has(url.hostname.toLowerCase()) || url.hash || url.search) continue;
    if (blogList && !isDescendantOf(node, (parent) => /^h[2-6]$/.test(parent.name))) continue;
    if (route === '/resources') {
      if (!['/blog', '/resources/faqs', '/materials', '/custom-cnc-parts'].includes(url.pathname) && !url.pathname.startsWith('/blog/')) continue;
    } else if (!url.pathname.startsWith(prefix) || /\/page\/\d+/.test(url.pathname)) continue;
    const labelNode = (node.children || []).find((child) => /^h[2-6]$/.test(child.name));
    const name = labelNode ? cleanText(labelNode) : attr(node, 'aria-label') || cleanText(node);
    if (!name || /^(?:read more|learn more|quote now)/i.test(name)) continue;
    const itemUrl = canonicalPageUrl(url.pathname);
    if (!items.has(itemUrl)) items.set(itemUrl, { '@type': 'ListItem', position: items.size + 1, name, url: itemUrl });
  }
  return [...items.values()];
}

// One output graph for all rendered templates, including historical HTML pages.
// Reuse typed article/breadcrumb/catalog data already emitted by those templates.
// Only JSON-LD tags are replaced; content, links, styling and ordinary scripts stay intact.
export function applySiteSchema(html, pathname) {
  const route = normalizePagePath(pathname);
  const nodes = [];
  walkSync(parse(html), (node) => { if (node.type === ELEMENT_NODE) nodes.push(node); });
  const head = nodes.find((node) => node.name === 'head');
  if (!head?.loc?.[1] || isRetiredPagePath(route)) return html;
  const metas = nodes.filter((node) => node.name === 'meta');
  if (metas.some((node) => attr(node, 'http-equiv').toLowerCase() === 'refresh'
    || (['robots', 'googlebot'].includes(attr(node, 'name').toLowerCase()) && /noindex/i.test(attr(node, 'content'))))) return html;
  const h1 = nodes.find((node) => node.name === 'h1');
  if (!h1) return html;

  const meta = (name) => attr(metas.find((node) => attr(node, 'name') === name || attr(node, 'property') === name), 'content');
  const canonical = canonicalPageUrl(route);
  const schemaTags = nodes.filter((node) => node.name === 'script' && attr(node, 'type').toLowerCase() === 'application/ld+json');
  const existing = schemaTags.flatMap((node) => {
    const source = html.slice(node.loc[0].end, node.loc[1].start);
    try { return flattenDocuments(JSON.parse(source)).map((value) => normalizeNode(value, route)); }
    catch { throw new Error('Invalid JSON-LD in ' + route); }
  });
  const graph = new Map();
  const add = (node) => graph.set(node['@id'] || JSON.stringify(node), node);
  const catalog = existing.find((node) => isType(node, 'CollectionPage'));
  const article = existing.find((node) => types(node).some((type) => ['Article', 'BlogPosting', 'NewsArticle'].includes(type)));
  const person = existing.find((node) => isType(node, 'Person'));
  const breadcrumb = existing.find((node) => isType(node, 'BreadcrumbList'));
  const authorPage = /^\/author\/[^/]+$/.test(route);
  const authorArchive = /^\/author\/[^/]+\/page\/\d+$/.test(route);
  const collection = Boolean(catalog) || ['/materials', '/industries', '/services', '/resources', '/blog'].includes(route)
    || /^\/blog\/page\/\d+$/.test(route) || /^\/blog\/category\/[^/]+(?:\/page\/\d+)?$/.test(route) || authorArchive;
  const service = /^\/(?:custom-cnc-parts|materials|industries|services)\/[^/]+$/.test(route);
  const name = cleanText(h1);
  const pageType = route === '/about-us' ? 'AboutPage' : route === '/cnc-machining-quote' ? 'ContactPage'
    : authorPage && person ? 'ProfilePage' : route === '/resources/faqs' ? 'FAQPage' : collection ? 'CollectionPage' : 'WebPage';
  const page = {
    ...(catalog || {}),
    '@type': pageType, '@id': canonical, url: canonical, name,
    ...(meta('description') ? { description: meta('description') } : {}),
    isPartOf: ref(WEBSITE_ID), publisher: ref(ORGANIZATION_ID), inLanguage: 'en-US',
    ...(breadcrumb ? { breadcrumb: ref(breadcrumb['@id']) } : {}),
  };
  const heroImage = nodes.find((node) => node.name === 'img' && /(?:^|\s)hero-img(?:\s|$)/.test(attr(node, 'class')));
  const image = absoluteUrl(heroImage ? attr(heroImage, 'src') : meta('og:image'), route);
  if (image && !/nav_logo|site-icon|gravatar\.com/i.test(image)) page.primaryImageOfPage = { '@type': 'ImageObject', url: image };

  if (route === '/' || route === '/about-us') add(organizationSchema());
  if (route === '/') add(websiteSchema());
  if (route === '/about-us') page.mainEntity = ref(ORGANIZATION_ID);
  if (route === '/cnc-machining-quote') page.about = ref(ORGANIZATION_ID);
  if (person && (authorPage || authorArchive)) {
    person.worksFor = ref(ORGANIZATION_ID);
    add(person);
    if (authorPage) page.mainEntity = ref(person['@id']);
    else page.about = ref(person['@id']);
  }
  if (article) {
    article.mainEntityOfPage = ref(canonical);
    article.publisher = ref(ORGANIZATION_ID);
    article.isPartOf = ref(WEBSITE_ID);
    page.mainEntity = ref(article['@id']);
    add(article);
  }
  if (service) {
    const serviceNode = { '@type': 'Service', '@id': canonical + '#service', url: canonical, name,
      ...(meta('description') ? { description: meta('description') } : {}),
      serviceType: route.startsWith('/custom-cnc-parts/') ? 'Custom CNC parts manufacturing' : name,
      provider: ref(ORGANIZATION_ID), mainEntityOfPage: ref(canonical),
      ...(image && page.primaryImageOfPage ? { image } : {}),
    };
    page.mainEntity = ref(serviceNode['@id']);
    add(serviceNode);
  }
  if (collection) {
    const mainEntity = catalog?.mainEntity;
    const list = mainEntity?.['@id'] ? existing.find((node) => node['@id'] === mainEntity['@id']) : mainEntity;
    const items = list && isType(list, 'ItemList') ? list.itemListElement : collectionItems(nodes, route);
    if (items?.length) {
      const itemList = { ...(list || {}), '@type': 'ItemList', '@id': canonical + '#items',
        numberOfItems: list?.numberOfItems ?? items.length, itemListElement: items };
      page.mainEntity = ref(itemList['@id']);
      add(itemList);
    }
  }
  const questions = new Map();
  for (const node of existing.filter((node) => isType(node, 'FAQPage'))) {
    for (const question of [].concat(node.mainEntity || [])) {
      if (isType(question, 'Question') && question.name && question.acceptedAnswer)
        questions.set(JSON.stringify([question.name, question.acceptedAnswer]), question);
    }
  }
  if (questions.size) {
    if (pageType === 'FAQPage') page.mainEntity = [...questions.values()];
    else add({ '@type': 'FAQPage', '@id': canonical + '#faq', url: canonical, isPartOf: ref(canonical), mainEntity: [...questions.values()] });
  }
  if (breadcrumb) add(breadcrumb);
  // Preserve any unrelated schema types a specialized template may add later.
  const owned = new Set(['Organization', 'WebSite', 'WebPage', 'AboutPage', 'ContactPage', 'ProfilePage', 'CollectionPage', 'FAQPage', 'Person', 'BreadcrumbList', 'ItemList', 'Service', 'Article', 'BlogPosting', 'NewsArticle']);
  for (const node of existing) if (!types(node).some((type) => owned.has(type))) add(node);
  add(page);

  const edits = schemaTags.map((node) => ({ start: node.loc[0].start, end: node.loc[1].end, value: '' }));
  edits.push({ start: head.loc[1].start, end: head.loc[1].start, value:
    '<script type="application/ld+json" data-site-schema>' + jsonLd({ '@context': 'https://schema.org', '@graph': [...graph.values()] }) + '</script>\n' });
  for (const edit of edits.sort((a, b) => b.start - a.start)) html = html.slice(0, edit.start) + edit.value + html.slice(edit.end);
  return html;
}

