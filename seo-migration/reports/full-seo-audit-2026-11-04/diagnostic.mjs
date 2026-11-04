import fs from 'node:fs';
import path from 'node:path';
import {parse, walkSync, ELEMENT_NODE, TEXT_NODE} from 'ultrahtml';
import {decodeHTML} from 'entities';
import {createHash} from 'node:crypto';
import {retiredPageTargets} from '../../../src/data/siteUrls.mjs';

// Read-only diagnostic: writes audit artifacts only; never modifies site content.
const out = path.dirname(new URL(import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, '$1'));
const root = path.resolve('dist');
const origin = 'https://www.cncpioneer.com';
const plain = n => !n ? '' : decodeHTML(n.type === TEXT_NODE ? n.value : ['script','style','noscript'].includes(n.name) ? '' : (n.children || []).map(plain).join(' ')).replace(/\s+/g,' ').trim();
const elements = html => { const a=[]; walkSync(parse(html), n=>{if(n.type===ELEMENT_NODE)a.push(n);}); return a; };
const meta = (a,key) => a.find(n=>n.name==='meta' && (n.attributes.name===key || n.attributes.property===key))?.attributes.content || '';
const rel = (a,key) => a.find(n=>n.name==='link' && n.attributes.rel===key)?.attributes.href || '';
const hash = t => createHash('sha256').update(t).digest('hex');
function inspect(html, route) {
  const a=elements(html), main=a.find(n=>n.name==='main'), schemas=[], schemaErrors=[];
  for(const n of a.filter(n=>n.name==='script' && n.attributes.type==='application/ld+json')) {
    try { const d=JSON.parse((n.children||[]).map(n=>n.value||'').join('')); schemas.push(...(Array.isArray(d)?d:d['@graph']||[d])); }
    catch(e){schemaErrors.push(e.message);}
  }
  const body=plain(main), headings=a.filter(n=>/^h[1-6]$/.test(n.name));
  return {route, title:plain(a.find(n=>n.name==='title')), description:meta(a,'description'), canonical:rel(a,'canonical'), robots:meta(a,'robots'), xrobots:'', lang:a.find(n=>n.name==='html')?.attributes.lang,
    viewport:meta(a,'viewport'), h1:headings.filter(n=>n.name==='h1').map(plain), headings:headings.map(n=>({level:Number(n.name[1]),text:plain(n)})),
    bytes:Buffer.byteLength(html), mainWords:body.split(/\s+/).filter(Boolean).length, mainHash:hash(body.toLowerCase()),
    schemaTypes:[...new Set(schemas.flatMap(n=>[].concat(n['@type']||[])))], schemaErrors,
    dates:schemas.filter(n=>n.datePublished||n.dateModified).map(n=>({type:n['@type'],published:n.datePublished,modified:n.dateModified})),
    images:a.filter(n=>n.name==='img').map(n=>({src:n.attributes.src,alt:n.attributes.alt,width:n.attributes.width,height:n.attributes.height,loading:n.attributes.loading,fetchpriority:n.attributes.fetchpriority,srcset:!!n.attributes.srcset})),
    scripts:a.filter(n=>n.name==='script' && n.attributes.src).map(n=>n.attributes.src),
    styles:a.filter(n=>n.name==='link' && n.attributes.rel==='stylesheet').map(n=>n.attributes.href),
    preloads:a.filter(n=>n.name==='link' && ['preload','preconnect'].includes(n.attributes.rel)).map(n=>({...n.attributes})),
    brandReferences:(html.match(/(?:src|href)=["'][^"']*headwayer[^"']*["']/gi)||[]),
    links:a.filter(n=>n.name==='a' && n.attributes.href).map(n=>({href:n.attributes.href,text:plain(n)}))};
}
const pages=[];
function walk(dir){for(const e of fs.readdirSync(dir,{withFileTypes:true})){const f=path.join(dir,e.name);if(e.isDirectory())walk(f);else if(e.name==='index.html'||f===path.join(root,'404.html')) {const route=e.name==='404.html'?'/404.html':'/'+path.relative(root,path.dirname(f)).replaceAll('\\','/');pages.push(inspect(fs.readFileSync(f,'utf8'),route));}}}
walk(root);
const indexable=pages.filter(p=>!/noindex/i.test(p.robots));
function duplicates(key){const map=new Map();for(const p of indexable){const k=p[key];if(!map.has(k))map.set(k,[]);map.get(k).push(p.route);}return [...map].filter(([,v])=>v.length>1).map(([value,routes])=>({value,routes}));}
const templateDescriptions=indexable.filter(p=>/Read CNCPioneer.s guide to|Read .+ from CNCPioneer for practical|including material properties, CNC machining guidance/.test(p.description));
const suspiciousDescriptions=indexable.filter(p=>/\b(?:and|or|with|for|including)[,.]?$/i.test(p.description)||/guidance, design\.$|insights, manufacturing\.$|quality control, and\.$/.test(p.description));
const local={generatedAt:new Date().toISOString(),summary:{pages:pages.length,indexable:indexable.length,titleDuplicates:duplicates('title').length,descriptionDuplicates:duplicates('description').length,exactMainDuplicates:duplicates('mainHash').length,templateDescriptions:templateDescriptions.length,suspiciousDescriptions:suspiciousDescriptions.length,images:pages.reduce((n,p)=>n+p.images.length,0),missingImageAlt:pages.reduce((n,p)=>n+p.images.filter(i=>i.alt===undefined).length,0),emptyImageAlt:pages.reduce((n,p)=>n+p.images.filter(i=>i.alt==='').length,0),missingImageDimensions:pages.reduce((n,p)=>n+p.images.filter(i=>!i.width||!i.height).length,0),withoutViewport:pages.filter(p=>!p.viewport).length,schemaErrors:pages.filter(p=>p.schemaErrors.length).length},titleDuplicates:duplicates('title'),descriptionDuplicates:duplicates('description'),exactMainDuplicates:duplicates('mainHash'),templateDescriptions:templateDescriptions.map(({route,description})=>({route,description})),suspiciousDescriptions:suspiciousDescriptions.map(({route,description})=>({route,description})),retiredWithReplacement:Object.entries(retiredPageTargets).map(([from,to])=>({from,to})),pages};
fs.writeFileSync(path.join(out,'local-diagnostic.json'),JSON.stringify(local,null,2));
console.log('LOCAL',JSON.stringify(local.summary));

const live=[];
async function request(url,follow=true){
  const started=performance.now();
  try {const r=await fetch(url,{redirect:follow?'follow':'manual',signal:AbortSignal.timeout(20000),headers:{'User-Agent':'CNCPioneer-Owner-SEO-Audit/1.0','Accept-Encoding':'gzip, br'}}),body=await r.text();
    return {requested:url,url:r.url,status:r.status,elapsedMs:Math.round(performance.now()-started),headers:Object.fromEntries(r.headers),body};
  }catch(e){return {requested:url,error:e.message,cause:e.cause?.code,elapsedMs:Math.round(performance.now()-started)};}
}
async function chain(url){const hops=[];for(let i=0;i<8;i++){const r=await request(url,false);const {body,...data}=r;hops.push(data);if(![301,302,303,307,308].includes(r.status)||!r.headers?.location)break;url=new URL(r.headers.location,url).href;}return hops;}
const probes=[origin+'/',origin+'/robots.txt',origin+'/sitemap.xml','http://cncpioneer.com/','http://www.cncpioneer.com/','https://cncpioneer.com/',origin+'/services/swiss-machining/',origin+'/services/swiss-machining/index.html',origin+'/services/swiss-machining?utm_source=seo-audit',origin+'/index.html',origin+'/seo-audit-missing-page-20261104',origin+'/search?q=cnc',origin+'/blog/cnc-machining-defense',origin+'/blog/medical-swiss-machining',origin+'/blog/cnc-locating-pinsi'];
const probeResults=[];
for(let i=0;i<probes.length;i+=3){const batch=await Promise.all(probes.slice(i,i+3).map(async u=>({requested:u,hops:await chain(u)})));probeResults.push(...batch);}
fs.writeFileSync(path.join(out,'live-http-probes.json'),JSON.stringify({generatedAt:new Date().toISOString(),probes:probeResults},null,2));
console.log('PROBES',JSON.stringify(probeResults.map(p=>({url:p.requested,hops:p.hops.map(h=>({status:h.status,url:h.requested,location:h.headers?.location,error:h.error}))}))));
const robots=await request(origin+'/robots.txt'), sitemap=await request(origin+'/sitemap.xml');
if(robots.body)fs.writeFileSync(path.join(out,'live-robots.txt'),robots.body);
if(sitemap.body)fs.writeFileSync(path.join(out,'live-sitemap.xml'),sitemap.body);
const locs=[...(sitemap.body||'').matchAll(/<loc>([^<]+)<\/loc>/g)].map(m=>decodeHTML(m[1]));
const targets=[...new Set([...indexable.map(p=>origin+(p.route==='/'?'/':p.route)),...locs])].filter(u=>u.startsWith(origin) && !/\.xml$/.test(u));
console.log('LIVE CRAWL START',targets.length);
let cursor=0,done=0;
async function worker(){while(cursor<targets.length){const u=targets[cursor++],r=await request(u);const {body,...response}=r;const page=body&&/text\/html/i.test(r.headers?.['content-type']||'')?inspect(body,new URL(u).pathname):null;
  if(u===origin+'/'&&body)fs.writeFileSync(path.join(out,'live-home.html'),body);
  live.push({...response,page});done++;if(done%40===0)console.log('LIVE PROGRESS',done+'/'+targets.length);}}
await Promise.all(Array.from({length:4},worker));
live.sort((a,b)=>a.requested.localeCompare(b.requested));
const liveIndexable=live.filter(r=>r.status===200&&r.page&&!/noindex/i.test(r.page.robots));
const issues=live.flatMap(r=>{const p=r.page,a=[];if(r.error)a.push({code:'request_error',url:r.requested,error:r.error,cause:r.cause});else if(r.status!==200)a.push({code:'not_200',url:r.requested,status:r.status});if(p){if(p.canonical!==r.requested)a.push({code:'canonical_mismatch',url:r.requested,canonical:p.canonical});if(p.h1.length!==1)a.push({code:'h1_count',url:r.requested,count:p.h1.length});if(!p.description)a.push({code:'missing_description',url:r.requested});if(p.brandReferences.length)a.push({code:'other_brand_filename',url:r.requested,references:p.brandReferences});if(p.schemaErrors.length)a.push({code:'schema_json_error',url:r.requested,errors:p.schemaErrors});if(/noindex/i.test(p.robots+' '+r.headers?.['x-robots-tag']))a.push({code:'noindex',url:r.requested});}return a;});
const liveReport={generatedAt:new Date().toISOString(),scope:'Public HTTP crawl of local indexable URLs plus live sitemap URLs; one request per URL, four workers; timings are observations, not Lighthouse/CrUX or user performance.',summary:{attempted:live.length,statuses:live.reduce((a,r)=>(a[r.status||'error']=(a[r.status||'error']||0)+1,a),{}),liveSitemapUrls:locs.length,localSitemapUrls:indexable.length,liveOnlySitemap:locs.filter(u=>!indexable.some(p=>origin+(p.route==='/'?'/':p.route)===u)),localOnlySitemap:indexable.map(p=>origin+(p.route==='/'?'/':p.route)).filter(u=>!locs.includes(u)),indexable200:liveIndexable.length,issueCounts:issues.reduce((a,r)=>(a[r.code]=(a[r.code]||0)+1,a),{}),robotsStatus:robots.status,sitemapStatus:sitemap.status},issues,responses:live};
fs.writeFileSync(path.join(out,'live-crawl.json'),JSON.stringify(liveReport,null,2));
console.log('LIVE SUMMARY',JSON.stringify(liveReport.summary));
