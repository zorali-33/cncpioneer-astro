import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { parse, walkSync, ELEMENT_NODE, TEXT_NODE } from 'ultrahtml';
import { decodeHTML } from 'entities';
import { canonicalPageUrl } from '../src/data/siteUrls.mjs';
import { isNotFoundPagePath } from '../src/data/pageRemovals.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const build = path.resolve(process.argv[2] || path.join(root, 'dist'));
const output = path.resolve(process.argv[3] || path.join(root, 'seo-migration/reports/site-integrity.json'));
const files = new Map();
function collect(dir) {
  for (const entry of fs.readdirSync(dir, {withFileTypes:true})) {
    const file = path.join(dir, entry.name);
    if (entry.isDirectory()) collect(file);
    else files.set('/' + path.relative(build, file).replaceAll('\\','/'), file);
  }
}
collect(build);
const pages = new Map();
const errors = [], warnings = [];
const text = node => decodeHTML(node?.type === TEXT_NODE ? node.value : (node?.children || []).map(text).join('')).replace(/\s+/g,' ').trim();
const hasImageName = node => node.name === 'img' && !!node.attributes.alt || (node.children || []).some(hasImageName);
for (const [key, file] of files) {
  if (!key.endsWith('/index.html') && key !== '/404.html') continue;
  const html = fs.readFileSync(file, 'utf8'), nodes = [];
  walkSync(parse(html), node => { if (node.type === ELEMENT_NODE) nodes.push(node); });
  const route = key.replace(/\/index\.html$/, '') || '/';
  const attrs = node => node.attributes;
  const meta = (name, attribute='name') => nodes.filter(n=>n.name==='meta' && attrs(n)[attribute]===name).map(n=>decodeHTML(attrs(n).content || ''));
  const noindex = meta('robots').some(v=>/\bnoindex\b/i.test(v));
  const canonical = nodes.filter(n=>n.name==='link' && attrs(n).rel==='canonical').map(n=>decodeHTML(attrs(n).href || ''));
  const title = nodes.filter(n=>n.name==='title').map(text);
  const descriptions = meta('description');
  const h1 = nodes.filter(n=>n.name==='h1').map(text);
  const ids = new Map();
  for (const n of nodes) if (attrs(n).id) {
    const id = decodeHTML(attrs(n).id);
    ids.set(id, (ids.get(id)||0)+1);
  }
  const issue = (code, details={}) => errors.push({page:route, code, ...details});
  const warn = (code, details={}) => warnings.push({page:route, code, ...details});
  if(title.length!==1 || !title[0]) issue('title_count', {count:title.length});
  if(descriptions.length!==1 || !descriptions[0]) issue('description_count', {count:descriptions.length});
  if(h1.length!==1 || !h1[0]) issue('h1_count', {count:h1.length});
  if (!noindex) {
    let previousLevel = 0;
    for (const heading of nodes.filter(n => /^h[1-6]$/.test(n.name))) {
      const level = Number(heading.name.slice(1));
      if (!text(heading)) issue('empty_heading', {element:heading.name});
      if (previousLevel && level > previousLevel + 1) issue('heading_level_skip', {from:previousLevel, to:level, heading:text(heading)});
      previousLevel = level;
    }
  }
  if (!noindex && (canonical.length!==1 || canonical[0]!==canonicalPageUrl(route))) issue('canonical_mismatch', {canonical});
  if (!noindex && (meta('og:url','property').length!==1 || meta('og:url','property')[0]!==canonical[0])) issue('og_url_mismatch');
  if (!noindex && meta('og:type','property')[0] !== (/^\/blog\//.test(route) && !/\/page\//.test(route) ? 'article' : 'website')) issue('og_type_mismatch', {value:meta('og:type','property')});
  if (!nodes.some(n=>n.name==='html' && attrs(n).lang)) issue('missing_language');
  const mains = nodes.filter(n=>n.name==='main' || attrs(n).role==='main');
  if(mains.length!==1) issue('main_landmark_count', {count:mains.length});
  for(const [id,count] of ids) if(count>1) issue('duplicate_id', {id,count});
  for(const n of nodes) {
    for (const attr of ['aria-labelledby','aria-describedby','aria-controls', ...(n.name==='label'?['for']:[])]) {
      for(const id of (attrs(n)[attr] || '').split(/\s+/).filter(Boolean)) if(!ids.has(decodeHTML(id))) issue('missing_id_reference', {element:n.name, attr, id});
    }
    if(n.name==='img' && !Object.hasOwn(attrs(n),'alt')) issue('missing_image_alt', {src:attrs(n).src});
    if(n.name==='img' && (!attrs(n).width || !attrs(n).height)) warn('image_dimensions_missing',{src:attrs(n).src});
    if(n.name==='a' && !text(n) && !attrs(n)['aria-label'] && !attrs(n)['aria-labelledby'] && !hasImageName(n)) issue('unnamed_link',{href:attrs(n).href});
  }
  let graph;
  const schemas = nodes.filter(n=>n.name==='script' && attrs(n).type==='application/ld+json');
  if (!noindex && schemas.length!==1) issue('schema_script_count', {count:schemas.length});
  for(const schema of schemas) {
    try { graph=JSON.parse((schema.children||[]).map(n=>n.value||'').join('')); }
    catch { issue('invalid_schema_json'); }
  }
  if(!noindex && graph) {
    if(graph['@context']!=='https://schema.org' || !Array.isArray(graph['@graph'])) issue('schema_graph_missing');
    const graphIds = new Set();
    for(const n of graph['@graph']||[]) {
      if(n['@id'] && graphIds.has(n['@id'])) issue('duplicate_schema_id', {id:n['@id']});
      graphIds.add(n['@id']);
      for(const date of ['datePublished','dateModified']) if(n[date] && (!Number.isFinite(Date.parse(n[date])) || Date.parse(n[date])>Date.now()+86400000)) issue('invalid_schema_date',{date,value:n[date]});
    }
    if(!(graph['@graph']||[]).some(n=>n['@id']===canonical[0])) issue('schema_page_id_mismatch');
  }
  if(!noindex && (title[0]?.length>60 || title[0]?.length<30)) warn('title_length_review',{length:title[0]?.length});
  if(!noindex && (descriptions[0]?.length>160 || descriptions[0]?.length<120)) warn('description_length_review',{length:descriptions[0]?.length});
  if(isNotFoundPagePath(route)) issue('removed_route_emitted');
  pages.set(key,{route,html,nodes,ids,noindex,title:title[0],description:descriptions[0],h1:h1[0],canonical:canonical[0]});
}
const sitemap = fs.readFileSync(path.join(build,'sitemap.xml'),'utf8');
const locs = [...sitemap.matchAll(/<loc>(.*?)<\/loc>/g)].map(m=>decodeHTML(m[1]));
const hosts = new Set(['cncpioneer.com','www.cncpioneer.com','127.0.0.1','localhost']);
let references=0, fragments=0;
for(const page of pages.values()) {
  if(page.noindex && locs.includes(canonicalPageUrl(page.route))) errors.push({page:page.route,code:'noindex_in_sitemap'});
  if(!page.noindex && !locs.includes(page.canonical)) errors.push({page:page.route,code:'missing_from_sitemap'});
  for(const n of page.nodes) {
    const a=n.attributes;
    const attributes = [...(['a','area','link'].includes(n.name)?['href']:[]), ...(['img','source','script','iframe','video','audio','input'].includes(n.name)?['src']:[]), ...(n.name==='video'?['poster']:[]), ...(n.name==='form'?['action']:[]), ...(['img','source'].includes(n.name)?['srcset','data-src','data-lazy-src','data-srcset']:[])];
    for(const attr of attributes) {
      const original=decodeHTML(a[attr]||'').trim();
      if(!original || /^(?:data:|blob:|tel:|mailto:|javascript:)/i.test(original)) continue;
      for(const value of attr.endsWith('srcset')?original.split(',').map(v=>v.trim().split(/\s+/)[0]):[original]) {
        let url;
        try { url=new URL(value,'https://www.cncpioneer.com'+page.route); } catch { errors.push({page:page.route,code:'invalid_url',value}); continue; }
        if(!hosts.has(url.hostname)||!/^https?:$/.test(url.protocol)) continue;
        references++;
        let target=decodeURIComponent(url.pathname).replace(/\/{2,}/g,'/');
        const key=files.has(target)?target:target.replace(/\/+$/,'')+'/index.html';
        if(!files.has(key) || (pages.has(key) && isNotFoundPagePath(pages.get(key).route))) errors.push({page:page.route,code:'missing_internal_target',attr,value});
        const targetPage=pages.get(key);
        if(url.hash && ['a','area'].includes(n.name) && targetPage) {
          const hash=decodeURIComponent(url.hash.slice(1)).split(':~:text=')[0];
          if(!hash || /^(?:top|elementor-action:)/i.test(hash)) continue;
          fragments++;
          if(!targetPage.ids.has(hash)) errors.push({page:page.route,code:'missing_fragment',value});
        }
      }
    }
  }
}
for(const loc of locs) if(![...pages.values()].some(p=>!p.noindex && p.canonical===loc)) errors.push({page:loc,code:'sitemap_target_missing'});
if(new Set(locs).size!==locs.length) errors.push({code:'duplicate_sitemap_urls'});
for(const property of ['title','description']) {
  const values=new Map();
  for(const page of pages.values()) if(!page.noindex && page[property]) values.set(page[property], [...(values.get(page[property])||[]),page.route]);
  for(const [value,routes] of values) if(routes.length>1) errors.push({code:'duplicate_'+property,value,pages:routes});
}
const searchFile=files.get('/search-index.json');
let searchRecords=0;
if(searchFile) {
  const search=JSON.parse(fs.readFileSync(searchFile,'utf8'));
  searchRecords=search.length;
  for(const item of search) if(!pages.has(item.href.replace(/\/$/,'')+'/index.html') || isNotFoundPagePath(item.href)) errors.push({code:'search_target_missing',href:item.href});
}
const counts=items=>items.reduce((acc,item)=>(acc[item.code]=(acc[item.code]||0)+1,acc),{});
const report={generatedAt:new Date().toISOString(), build, pages:pages.size, indexable:[...pages.values()].filter(p=>!p.noindex).length, sitemapUrls:locs.length, references, fragments, searchRecords, errorCounts:counts(errors), warningCounts:counts(warnings),errors,warnings, inventory:[...pages.values()].map(({route,title,description,h1,canonical,noindex})=>({route,title,description,h1,canonical,noindex}))};
fs.mkdirSync(path.dirname(output),{recursive:true});
fs.writeFileSync(output,JSON.stringify(report,null,2));
console.log(JSON.stringify({...report,inventory:undefined,warnings:undefined,errors:errors.slice(0,35)},null,2));
process.exitCode=errors.length?1:0;
