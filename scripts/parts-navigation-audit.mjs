import fs from 'node:fs';
import path from 'node:path';
import {parse,walkSync,ELEMENT_NODE} from 'ultrahtml';
import {decodeHTML} from 'entities';
import {catalogCategories,catalogParts} from '../src/parts-catalog-native.mjs';
import {partCategoryHref} from '../src/data/partTaxonomy.mjs';
import {equipmentDocuments} from '../src/data/equipmentDocument.mjs';
import {industryNavigation} from '../src/data/industryNavigation.mjs';
import {createHash} from 'node:crypto';
const build=path.resolve(process.argv[2]||'dist'),output=path.resolve(process.argv[3]||'seo-migration/reports/parts-navigation.json');
const errors=[];let pages=0;
function files(dir){return fs.readdirSync(dir,{withFileTypes:true}).flatMap(e=>e.isDirectory()?files(path.join(dir,e.name)):[path.join(dir,e.name)]);}
function text(n){return decodeHTML(n.value||(n.children||[]).map(text).join('')).replace(/\s+/g,' ').trim();}
for(const file of files(build).filter(f=>f.endsWith('.html'))){
  pages++;const navs=[];walkSync(parse(fs.readFileSync(file,'utf8')),n=>{if(n.type===ELEMENT_NODE&&n.name==='nav'&&/(?:^|\s)primary-nav(?:\s|$)/.test(n.attributes.class||''))navs.push(n);});
  if(navs.length!==1){errors.push({file,issue:'Expected one primary navigation',count:navs.length});continue;}
  const links=[];walkSync(navs[0],n=>{if(n.name==='a')links.push({href:decodeHTML(n.attributes.href||''),text:text(n)});});
  const resourcesButtons=[];
  walkSync(navs[0],n=>{if(n.name==='button'&&n.attributes['aria-controls']==='resources-submenu')resourcesButtons.push(n);});
  if(resourcesButtons.length!==1)errors.push({file,issue:'Resources must be one non-link disclosure button'});
  if(links.some(link=>link.text==='Resources'))errors.push({file,issue:'Resources parent remains a link'});
  for(const href of ['/blog','/resources/faqs','/resources/equipment-list'])if(!links.some(link=>link.href===href))errors.push({file,issue:'Resource submenu destination missing',href});
  for(const link of links)if(link.href.includes('#parts-catalog'))errors.push({file,issue:'Catalog fragment in navigation link',href:link.href});
  if(links.filter(l=>l.href==='/custom-cnc-parts'&&l.text==='Custom Parts').length!==1)errors.push({file,issue:'Custom Parts main entry missing or duplicated'});
  for(const category of catalogCategories)if(links.filter(l=>l.href===partCategoryHref(category.id)&&l.text===category.label).length!==1)errors.push({file,issue:'Category link missing or duplicated',category:category.id});
  for(const industry of industryNavigation.flatMap(group=>group.children))if(links.filter(l=>l.href===industry.href&&l.text===industry.label).length!==1)errors.push({file,issue:'Industry menu link missing or duplicated',href:industry.href});
  if(links.some(l=>/^\/industries\/.*swiss-machining$/.test(l.href)))errors.push({file,issue:'Swiss industry child page mixed into industry navigation'});
}
const catalogFile=path.join(build,'custom-cnc-parts/index.html'),catalogHtml=fs.readFileSync(catalogFile,'utf8');
if(!fs.existsSync(path.join(build,'resources/equipment-list/index.html')))errors.push({issue:'Equipment List page missing'});
else {
  const equipmentHtml=fs.readFileSync(path.join(build,'resources/equipment-list/index.html'),'utf8');
  const nodes=[];walkSync(parse(equipmentHtml),n=>{if(n.type===ELEMENT_NODE)nodes.push(n);});
  const main=nodes.find(n=>n.name==='main');
  if(nodes.some(n=>['object','embed','iframe'].includes(n.name)&&(n.attributes.type==='application/pdf'||/\.pdf(?:[?#]|$)/i.test(n.attributes.data||n.attributes.src||''))))errors.push({issue:'Equipment page must use compact PDF links, not embedded viewers'});
  if(main)walkSync(main,n=>{if(n.name==='a'&&/^\/services(?:\/|$)/.test(n.attributes.href||''))errors.push({issue:'Equipment content links to a service instead of the uploaded documents',href:n.attributes.href});});
  for(const document of equipmentDocuments){
    const file=path.join(build,document.url);
    if(!fs.existsSync(file)){errors.push({issue:'Equipment PDF missing',file});continue;}
    const bytes=fs.readFileSync(file);
    if(bytes.subarray(0,5).toString()!=='%PDF-'||bytes.length!==document.bytes||createHash('sha256').update(bytes).digest('hex')!==document.sha256)errors.push({issue:'Equipment PDF differs from supplied original',file});
    if(nodes.filter(n=>n.name==='a'&&n.attributes.href===document.url&&n.attributes.download===document.filename).length!==1)errors.push({issue:'Equipment PDF download missing or duplicated',url:document.url});
    if(!nodes.some(n=>n.name==='a'&&n.attributes.href===document.url&&n.attributes.target==='_blank'))errors.push({issue:'Equipment PDF new-tab fallback missing',url:document.url});
  }
}
walkSync(parse(catalogHtml),n=>{if(n.name==='a'&&(n.attributes.href||'').includes('#parts-catalog'))errors.push({issue:'Catalog link retains fragment',href:n.attributes.href});});
for(const category of catalogCategories)if(!catalogHtml.includes(`data-pl-category="${category.id}"`))errors.push({issue:'Missing catalog category control',category:category.id});
const serialized=catalogHtml.match(/<script[^>]*id="pl-catalog-data"[^>]*>([\s\S]*?)<\/script>/)?.[1];
if(!serialized)errors.push({issue:'Missing browser catalog data'});
else {
  const parts=JSON.parse(serialized);
  if(parts.length!==catalogParts.length)errors.push({issue:'Catalog omitted parts'});
  for(const category of catalogCategories)if(parts.filter(p=>p.category===category.id).length!==category.count)errors.push({issue:'Browser category count mismatch',category});
}
const report={generatedAt:new Date().toISOString(),status:errors.length?'fail':'pass',pages,parts:catalogParts.length,categories:catalogCategories,errors};
fs.mkdirSync(path.dirname(output),{recursive:true});fs.writeFileSync(output,JSON.stringify(report,null,2));console.log(JSON.stringify(report,null,2));process.exitCode=errors.length?1:0;
