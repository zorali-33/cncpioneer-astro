import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {parse,walkSync,ELEMENT_NODE} from 'ultrahtml';
import {notFoundPagePaths,notFoundPathVariants} from '../src/data/pageRemovals.mjs';
import {canonicalPageUrl, pageRedirects, resolvePagePath} from '../src/data/siteUrls.mjs';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const build=path.resolve(process.argv[2]||path.join(root,'dist'));
const output=path.resolve(process.argv[3]||path.join(root,'seo-migration/reports/build-routing.json'));
const errors=[];
const rules=fs.readFileSync(path.join(build,'_redirects'),'utf8');
const apache=fs.readFileSync(path.join(build,'.htaccess'),'utf8');
const apachePatterns=apache.split('\n').filter(line=>line.startsWith('RewriteRule ')).map(line=>new RegExp(line.split(' ')[1]));
if(!apache.includes('DirectorySlash Off') || !apache.includes('Options -Indexes -MultiViews'))errors.push({code:'unsafe_directory_routing'});
if(!apache.includes('THE_REQUEST') || !apache.includes('RewriteRule ^(.+?)/?$ $1/index.html [L]'))errors.push({code:'missing_canonical_routing'});
for(const [route,target] of Object.entries(pageRedirects)){
  for(const variant of notFoundPathVariants(route))if(!rules.includes(`${variant} ${canonicalPageUrl(target)} 301!\n`))errors.push({route:variant,code:'missing_permanent_move'});
  if(!fs.existsSync(path.join(build,resolvePagePath(target),'index.html')))errors.push({route,target,code:'redirect_target_missing'});
  if(fs.existsSync(path.join(build,route,'index.html')))errors.push({route,code:'retired_html_emitted'});
}
for(const route of notFoundPagePaths){
  if(fs.existsSync(path.join(build,route,'index.html')))errors.push({route,code:'removed_html_emitted'});
  for(const variant of notFoundPathVariants(route)){
    if(!rules.includes(`${variant} /404.html 404!\n`))errors.push({route:variant,code:'missing_404_rule'});
    if(!apachePatterns.some(pattern=>pattern.test(variant.slice(1))))errors.push({route:variant,code:'missing_apache_404_rule'});
  }
}
const notFound=fs.readFileSync(path.join(build,'404.html'),'utf8');
if(!/noindex/.test(notFound)||!/Back Home/.test(notFound)||/http-equiv=["']refresh/i.test(notFound))errors.push({code:'invalid_404_page'});
const families=new Map();
function walk(dir){
  for(const entry of fs.readdirSync(dir,{withFileTypes:true})){
    const file=path.join(dir,entry.name);
    if(entry.isDirectory())walk(file);
    else if(entry.name==='index.html'){
      const route='/'+path.relative(build,path.dirname(file)).replaceAll('\\','/');
      const match=route.match(/^(\/blog(?:\/category\/[^/]+)?|\/custom-cnc-parts|\/author\/[^/]+)(?:\/page\/(\d+))?$/);
      if(!match)continue;
      const nodes=[];
      walkSync(parse(fs.readFileSync(file,'utf8')),n=>{if(n.type===ELEMENT_NODE)nodes.push(n);});
      const page=Number(match[2]||1),prefix=match[1];
      const headings=nodes.filter(n=>/^h[2-6]$/.test(n.name)&&/blog-post-title|author-post-title|elementor-post__title/.test(n.attributes.class||''));
      const items=new Set();
      if(prefix==='/custom-cnc-parts'){
        for(const n of nodes.filter(n=>n.name==='script'&&n.attributes.type==='application/ld+json')){
          const graph=JSON.parse((n.children||[]).map(c=>c.value||'').join(''))['@graph']||[];
          for(const list of graph.filter(n=>n['@type']==='ItemList'))for(const item of list.itemListElement||[])items.add(new URL(item.url||item.item,'https://www.cncpioneer.com').pathname);
        }
      } else {
        for(const heading of headings)walkSync(heading,n=>{if(n.name==='a'&&n.attributes.href)items.add(new URL(n.attributes.href,'https://www.cncpioneer.com').pathname);});
      }
      const headLinks=Object.fromEntries(nodes.filter(n=>n.name==='link'&&['prev','next'].includes(n.attributes.rel)).map(n=>[n.attributes.rel,n.attributes.href]));
      const family=families.get(prefix)||[];family.push({page,route,items:[...items],headLinks});families.set(prefix,family);
    }
  }
}
walk(build);
for(const [prefix,family]of families){
  family.sort((a,b)=>a.page-b.page);
  const seen=new Set();
  for(let index=0;index<family.length;index++){
    const current=family[index];
    if(current.page!==index+1)errors.push({route:current.route,code:'pagination_gap'});
    if(!current.items.length)errors.push({route:current.route,code:'empty_archive'});
    for(const item of current.items){if(seen.has(item))errors.push({route:current.route,item,code:'duplicate_paginated_item'});seen.add(item);}
    for(const [rel,expected]of [['prev',family[index-1]],['next',family[index+1]]]){
      const actual=current.headLinks[rel];
      if(expected ? actual!==canonicalPageUrl(expected.route) : !!actual)errors.push({route:current.route,code:'pagination_head_link',rel,actual,expected:expected?.route});
    }
  }
}
const report={generatedAt:new Date().toISOString(),permanentRedirects:Object.keys(pageRedirects).length,removedRoutes:notFoundPagePaths.size,notFoundVariants:notFoundPagePaths.size*3,families:[...families].map(([route,pages])=>({route,pages:pages.length,items:pages.reduce((sum,page)=>sum+page.items.length,0)})),errors};
fs.mkdirSync(path.dirname(output),{recursive:true});fs.writeFileSync(output,JSON.stringify(report,null,2));
console.log(JSON.stringify(report,null,2));process.exitCode=errors.length?1:0;
