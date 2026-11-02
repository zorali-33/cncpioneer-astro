import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {parse,walkSync,ELEMENT_NODE} from 'ultrahtml';
import {decodeHTML} from 'entities';
import {externalUrlCorrections,removedCitationUrls} from '../src/data/urlCorrections.mjs';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const build=path.resolve(process.argv[2]||path.join(root,'dist'));
const output=path.resolve(process.argv[3]||path.join(root,'seo-migration/reports/url-integrity.json'));
const pages=[],errors=[],incoming=new Map();let shareImages=0;
function scan(directory){for(const entry of fs.readdirSync(directory,{withFileTypes:true})){const file=path.join(directory,entry.name);if(entry.isDirectory())scan(file);else if(entry.name==='index.html'||entry.name==='404.html')pages.push({file,route:'/'+path.relative(build,file).replaceAll('\\','/').replace(/(?:^|\/)index\.html$/,'')});}}
scan(build);
for(const page of pages){
 const html=fs.readFileSync(page.file,'utf8'),nodes=[];walkSync(parse(html),node=>{if(node.type===ELEMENT_NODE)nodes.push(node);});
 page.noindex=nodes.some(n=>n.name==='meta'&&n.attributes.name==='robots'&&/noindex/.test(n.attributes.content||''));
 for(const node of nodes.filter(n=>n.name==='a'&&n.attributes.href)){
  const href=decodeHTML(node.attributes.href);let url;try{url=new URL(href,'https://www.cncpioneer.com'+page.route);}catch{continue;}
  if(Object.keys(externalUrlCorrections).includes(href)||removedCitationUrls.includes(href))errors.push({code:'known_broken_external_reference',page:page.route,href});
  if(['cncpioneer.com','www.cncpioneer.com'].includes(url.hostname)){
   const target=url.pathname.replace(/\/index\.html$/,'').replace(/\/$/,'')||'/';
   if(target!==page.route)incoming.set(target,(incoming.get(target)||0)+1);
  }
  if(/(?:^|\.)pinterest\.com$/.test(url.hostname)&&url.pathname==='/pin/create/button/'){
   const media=url.searchParams.get('media');if(!media)continue;shareImages++;
   let image;try{image=new URL(media);}catch{errors.push({code:'invalid_share_image',page:page.route,media});continue;}
   const imageFile=path.resolve(build,'.'+decodeURIComponent(image.pathname));
   const relative=path.relative(build,imageFile);
   if(relative.startsWith('..')||path.isAbsolute(relative)||!['www.cncpioneer.com','cncpioneer.com'].includes(image.hostname)||!image.pathname.endsWith('.webp')||!fs.existsSync(imageFile)||fs.statSync(imageFile).size>=100000)errors.push({code:'invalid_share_image',page:page.route,media});
   if(url.searchParams.get('url')!=='https://www.cncpioneer.com'+page.route)errors.push({code:'share_page_identity',page:page.route,value:url.searchParams.get('url')});
  }
 }
}
const orphans=pages.filter(p=>!p.noindex&&p.route!=='/'&&!incoming.has(p.route)).map(p=>p.route);
for(const route of orphans)errors.push({code:'orphan_indexable_page',route});
const turned=fs.readFileSync(path.join(build,'blog/cnc-turned-parts/index.html'),'utf8');
if(/15–18% annually/.test(turned))errors.push({code:'unsupported_market_claim_restored',route:'/blog/cnc-turned-parts'});
const report={generatedAt:new Date().toISOString(),pages:pages.length,shareImages,orphanPages:orphans,errors};
fs.mkdirSync(path.dirname(output),{recursive:true});fs.writeFileSync(output,JSON.stringify(report,null,2));console.log(JSON.stringify(report,null,2));process.exitCode=errors.length?1:0;
