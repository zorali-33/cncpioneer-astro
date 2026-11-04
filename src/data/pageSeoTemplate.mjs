import { parse, walkSync, ELEMENT_NODE, TEXT_NODE } from 'ultrahtml';
import { decodeHTML, escapeAttribute } from 'entities';
import { canonicalPageUrl, normalizePagePath, normalizeInternalHref, isRetiredPagePath } from './siteUrls.mjs';
import { getPageModifiedTime } from './pageDates.mjs';
import { jsonLd } from './articleSchema.mjs';
import {getReviewedSeo} from './pageSeoOverrides.mjs';

const sectionNames = { blog: 'Blog', 'custom-cnc-parts': 'Custom CNC Parts', materials: 'Materials', industries: 'Industries', services: 'Services', resources: 'Resources' };
const authorNames = { 'ryan-wang': 'Ryan Wang', 'david-li': 'David Li' };
const textOf = (node) => node.type === TEXT_NODE ? node.value : node.name === 'br' ? ' ' : (node.children || []).map(textOf).join('');
const cleanText = (node) => decodeHTML(textOf(node)).replace(/\s+/g, ' ').trim();
const attr = (node, key) => decodeHTML(node.attributes[key] || '');

export function breadcrumbSchema(route, title, currentLabel = '', visibleParents = []) {
  if (route === '/') return null;
  const parts = route.slice(1).split('/');
  const crumbs = [{ name: 'Home', item: canonicalPageUrl('/') }];
  const pagination = route.match(/\/page\/(\d+)$/);
  if (visibleParents.length && !pagination) {
    crumbs.splice(0, crumbs.length, ...visibleParents);
    if (crumbs[0].item !== canonicalPageUrl('/')) crumbs.unshift({name:'Home',item:canonicalPageUrl('/')});
    crumbs.push({name:currentLabel || title,item:canonicalPageUrl(route)});
  } else if (parts[0] === 'author' && authorNames[parts[1]]) {
    crumbs.push({ name: authorNames[parts[1]], item: canonicalPageUrl(`/author/${parts[1]}`) });
    if (pagination) crumbs.push({ name: `Page ${pagination[1]}`, item: canonicalPageUrl(route) });
  } else {
    if (parts.length > 1 && sectionNames[parts[0]]) crumbs.push({ name: sectionNames[parts[0]], item: canonicalPageUrl('/' + parts[0]) });
    crumbs.push({ name: pagination ? `Page ${pagination[1]}` : currentLabel || (parts.length === 1 && sectionNames[parts[0]]) || title, item: canonicalPageUrl(route) });
  }
  if (crumbs.some((crumb) => !crumb.name)) throw new Error(`Missing breadcrumb label: ${route}`);
  return { '@context': 'https://schema.org', '@type': 'BreadcrumbList', '@id': canonicalPageUrl(route) + '#breadcrumb',
    itemListElement: crumbs.map((crumb, i) => ({ '@type': 'ListItem', position: i + 1, ...crumb })) };
}

function normalizeSchema(value, route, key = '') {
  if (Array.isArray(value)) return value.map((entry) => normalizeSchema(entry, route, key));
  if (value && typeof value === 'object') {
    const result = Object.fromEntries(Object.entries(value).map(([name, entry]) => [name, normalizeSchema(entry, route, name)]));
    if (result['@type'] === 'Person' && result.url?.includes('/author/') && !result['@id']) result['@id'] = result.url + '#person';
    return result;
  }
  if (typeof value === 'string' && ['url', '@id', 'item', 'mainEntityOfPage', 'sameAs'].includes(key)) {
    return value.startsWith('#') ? canonicalPageUrl(route) + value : normalizeInternalHref(value, route, true);
  }
  return value;
}

// Parse once, then splice only selected tags/JSON-LD by their original offsets.
// CSS, scripts, forms, content markup and asset URLs are not reserialized.
export function applyPageSeoTemplate(html, pathname) {
  const route = normalizePagePath(pathname);
  const nodes = [];
  walkSync(parse(html), (node) => { if (node.type === ELEMENT_NODE) nodes.push(node); });
  const head = nodes.find((node) => node.name === 'head');
  if (!head) return html;
  const metas = nodes.filter((node) => node.name === 'meta');
  const refresh = metas.some((node) => attr(node, 'http-equiv').toLowerCase() === 'refresh');
  const noindex = metas.some((node) => attr(node, 'name').toLowerCase() === 'robots' && /noindex/i.test(attr(node, 'content')));
  const indexable = !refresh && !noindex && !isRetiredPagePath(route);
  const edits = [];
  const replaceTag = (node, replacement) => edits.push({ start: node.loc[0].start, end: node.loc[0].end, replacement });
  const replaceAttribute = (node, name, value) => {
    const tag = html.slice(node.loc[0].start, node.loc[0].end);
    const pattern = new RegExp(`(\\s${name}\\s*=\\s*)(?:"[^"]*"|'[^']*'|[^\\s>]+)`, 'i');
    replaceTag(node, tag.replace(pattern, (_, prefix) => prefix + '"' + escapeAttribute(value) + '"'));
  };
  const canonical = canonicalPageUrl(route);
  const reviewedDescription = getReviewedSeo(route).description;
  const extraHead = [];
  let foundCanonical = false, foundOgUrl = false;
  const metaValue = (key) => attr(metas.find((node) => attr(node, 'property') === key) || { attributes: {} }, 'content');
  const modified = getPageModifiedTime(route, metaValue('article:modified_time'), metaValue('article:published_time'));
  for (const node of nodes) {
    if (['a', 'area'].includes(node.name) && node.attributes.href !== undefined && node.attributes.download === undefined) {
      const original = attr(node, 'href');
      const normalized = normalizeInternalHref(original, route);
      if (normalized !== original) replaceAttribute(node, 'href', normalized);
    } else if (node.name === 'link' && indexable) {
      const rel = attr(node, 'rel').toLowerCase();
      if (rel === 'canonical') {
        if (foundCanonical) replaceTag(node, '');
        else replaceAttribute(node, 'href', canonical);
        foundCanonical = true;
      } else if (['prev', 'next'].includes(rel) || (rel === 'alternate' && node.attributes.hreflang)) {
        replaceAttribute(node, 'href', normalizeInternalHref(attr(node, 'href'), route, true));
      }
    } else if (node.name === 'meta' && indexable) {
      const property = attr(node, 'property');
      if (reviewedDescription && (attr(node, 'name') === 'description' || property === 'og:description' || attr(node, 'name') === 'twitter:description')) replaceAttribute(node, 'content', reviewedDescription);
      else if (property === 'og:url') { replaceAttribute(node, 'content', canonical); foundOgUrl = true; }
      else if (attr(node, 'name') === 'last-modified') replaceTag(node, '');
      // Only blog articles use Article Open Graph properties.
      else if (property === 'article:modified_time') {
        if (/^\/blog\/[^/]+$/.test(route)) replaceAttribute(node, 'content', modified || attr(node, 'content'));
        else replaceTag(node, '');
      } else if (property === 'og:type' && !/^\/blog\/[^/]+$/.test(route)) replaceAttribute(node, 'content', 'website');
    } else if (node.name === 'script' && attr(node, 'type') === 'application/ld+json' && indexable) {
      const source = html.slice(node.loc[0].end, node.loc[1].start);
      let schema;
      try { schema = JSON.parse(source); } catch { throw new Error(`Invalid JSON-LD in ${route}`); }
      // This template owns its breadcrumb block; rerunning it is idempotent.
      if (schema['@type'] === 'BreadcrumbList') edits.push({ start: node.loc[0].start, end: node.loc[1].end, replacement: '' });
      else edits.push({ start: node.loc[0].end, end: node.loc[1].start, replacement: jsonLd(normalizeSchema(schema, route)) });
    }
  }
  if (indexable) {
    if (!foundCanonical) extraHead.push(`<link rel="canonical" href="${escapeAttribute(canonical)}">`);
    if (!foundOgUrl) extraHead.push(`<meta property="og:url" content="${escapeAttribute(canonical)}">`);
    if (modified) extraHead.push(`<meta name="last-modified" content="${escapeAttribute(modified.slice(0, 10))}">`);
    const h1 = nodes.find((node) => node.name === 'h1');
    // Prefer the current label shown in an existing visible breadcrumb.
    const currentCrumb = nodes.find((node) => attr(node, 'aria-current') === 'page' && (() => {
      let parent = node.parent;
      while (parent) {
        if (/breadcrumb/i.test((parent.attributes?.class || '') + ' ' + (parent.attributes?.['aria-label'] || ''))) return true;
        parent = parent.parent;
      }
      return false;
    })());
    let crumbContainer = currentCrumb?.parent;
    while (crumbContainer && !('data-site-breadcrumb-nav' in (crumbContainer.attributes || {}))) crumbContainer = crumbContainer.parent;
    const visibleParents = crumbContainer ? nodes.filter(node => node.name === 'a' && (() => {
      for (let parent = node.parent; parent; parent = parent.parent) if (parent === crumbContainer) return true;
      return false;
    })()).map(node => ({name:cleanText(node),item:canonicalPageUrl(attr(node,'href'))})) : [];
    const breadcrumb = breadcrumbSchema(route, h1 ? cleanText(h1) : '', currentCrumb ? cleanText(currentCrumb) : '', visibleParents);
    if (breadcrumb) extraHead.push(`<script type="application/ld+json" data-site-breadcrumb>${jsonLd(breadcrumb)}</script>`);
    edits.push({ start: head.loc[1].start, end: head.loc[1].start, replacement: extraHead.join('\n') });
  }
  for (const edit of edits.sort((a, b) => b.start - a.start)) html = html.slice(0, edit.start) + edit.replacement + html.slice(edit.end);
  return html;
}
