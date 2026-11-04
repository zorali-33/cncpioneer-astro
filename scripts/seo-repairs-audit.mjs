import fs from 'node:fs';
import path from 'node:path';
import {createHash} from 'node:crypto';
import {parse,walkSync,ELEMENT_NODE} from 'ultrahtml';
import {decodeHTML} from 'entities';
import {seoRepairDescriptions} from '../src/data/seoRepairDescriptions.mjs';
import {informativeImageDescriptions} from '../src/data/imageEditorial.mjs';

const build=path.resolve(process.argv[2]||'dist');
const output=path.resolve(process.argv[3]||'seo-migration/reports/seo-repairs.json');
const errors=[],counts={pages:0,versionedResources:0,articles:0,articleLeadImages:0,informativeImageDescriptions:0,reviewedDescriptions:0};
const shared=new Set(['/brand-theme.css','/site-search.css','/site-search.js','/navigation-accessibility.js']);
const ancestor=(node,test)=>{for(let n=node.parent;n;n=n.parent)if(test(n))return true;return false;};
function walk(dir){for(const e of fs.readdirSync(dir,{withFileTypes:true})){
  const file=path.join(dir,e.name);
  if(/headwayer/i.test(e.name))errors.push({file,code:'other_brand_asset'});
  if(e.isDirectory()){walk(file);continue;}
  if(e.name!=='index.html' && e.name!=='404.html')continue;
  const route=e.name==='404.html'?'/404.html':'/'+path.relative(build,path.dirname(file)).replaceAll('\\','/');
  const html=fs.readFileSync(file,'utf8'), nodes=[];
  walkSync(parse(html),n=>{if(n.type===ELEMENT_NODE)nodes.push(n);});counts.pages++;
  const description=decodeHTML(nodes.find(n=>n.name==='meta'&&n.attributes.name==='description')?.attributes.content||'');
  if(/\b(?:and|or|with|for|including)[,.]?$/i.test(description))errors.push({route,code:'unfinished_description'});
  if(seoRepairDescriptions[route]){
    counts.reviewedDescriptions++;
    if(description!==seoRepairDescriptions[route])errors.push({route,code:'reviewed_description_not_applied'});
  }
  for(const n of nodes){
    const value=n.name==='script'?n.attributes.src:n.name==='link'?n.attributes.href:null;
    if(!value)continue;
    const url=new URL(decodeHTML(value),'https://www.cncpioneer.com');
    if(url.hostname!=='www.cncpioneer.com'||!shared.has(url.pathname))continue;
    const expected=createHash('sha256').update(fs.readFileSync(path.join(build,url.pathname))).digest('hex').slice(0,12);
    if(url.searchParams.get('v')!==expected)errors.push({route,url:value,code:'unversioned_shared_asset'});
    else counts.versionedResources++;
  }
  if(/headwayer/i.test(html))errors.push({route,code:'other_brand_reference'});
  const article=nodes.find(n=>n.attributes.id==='main-article-content');
  if(!article)continue;counts.articles++;
  const images=nodes.filter(n=>n.name==='img'&&ancestor(n,p=>p===article));
  const active=images.filter(n=>!ancestor(n,p=>p.name==='noscript')&&n.attributes.hidden===undefined&&n.attributes['aria-hidden']!=='true');
  if(active.length){counts.articleLeadImages++;if(active[0].attributes.loading!=='eager'||active[0].attributes.fetchpriority!=='high')errors.push({route,code:'delayed_article_lead'});}
  for(const n of active.slice(1))if(n.attributes.loading!=='lazy'||n.attributes.fetchpriority==='high')errors.push({route,src:n.attributes.src,code:'eager_article_body_image'});
  for(const n of images){const name=new URL(decodeHTML(n.attributes.src||''),'https://www.cncpioneer.com').pathname.split('/').pop();
    if(informativeImageDescriptions[name]){counts.informativeImageDescriptions++;if(!decodeHTML(n.attributes.alt||'').trim())errors.push({route,src:n.attributes.src,code:'empty_informative_alt'});}
  }
}}
walk(build);
for(const route of Object.keys(seoRepairDescriptions))if(!fs.existsSync(path.join(build,route,'index.html')))errors.push({route,code:'reviewed_page_missing'});
const apache=fs.readFileSync(path.join(build,'.htaccess'),'utf8');
if(!apache.includes('Header set Cache-Control "no-cache"'))errors.push({code:'missing_shared_asset_revalidation'});
const report={generatedAt:new Date().toISOString(),...counts,errors};
fs.mkdirSync(path.dirname(output),{recursive:true});fs.writeFileSync(output,JSON.stringify(report,null,2));
console.log(JSON.stringify(report,null,2));process.exitCode=errors.length?1:0;
