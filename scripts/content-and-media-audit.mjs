import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import sharp from 'sharp';
import {parse,walkSync,ELEMENT_NODE,TEXT_NODE} from 'ultrahtml';
import {decodeHTML} from 'entities';
import {optimizedImageAssets} from '../src/image-assets.mjs';
import {applySpellingCorrections} from '../src/data/spellingCorrections.mjs';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const build=path.resolve(process.argv[2]||path.join(root,'dist'));
const output=path.resolve(process.argv[3]||path.join(root,'seo-migration/reports/content-and-media.json'));
const errors=[],images=[],pages=[],fontFiles=[];
const text=node=>decodeHTML(node?.type===TEXT_NODE?node.value:['style','script','noscript'].includes(node?.name)?'':(node?.children||[]).map(text).join(' ')).replace(/\s+/g,' ').trim();
function walk(directory){for(const entry of fs.readdirSync(directory,{withFileTypes:true})){
 const file=path.join(directory,entry.name),relative='/'+path.relative(build,file).replaceAll('\\','/');
 if(entry.isDirectory())walk(file);
 else if(/\.(?:jpe?g|png|webp|gif|avif|ico|svg)$/i.test(file)){
  if(/\/(?:fonts|webfonts)\/.*\.svg$/i.test(relative))fontFiles.push(relative);else images.push({file,relative});
 }else if(entry.name==='index.html'||entry.name==='404.html')pages.push({file,relative});
}}
walk(build);
let largestBytes=0,totalBytes=0,cursor=0;
const dimensions=new Map();
async function inspect(){while(cursor<images.length){const image=images[cursor++];const bytes=fs.readFileSync(image.file);largestBytes=Math.max(largestBytes,bytes.length);totalBytes+=bytes.length;
 if(!image.relative.endsWith('.webp')||bytes.subarray(0,4).toString()!=='RIFF'||bytes.subarray(8,12).toString()!=='WEBP')errors.push({code:'image_not_webp',file:image.relative});
 if(bytes.length>=100000)errors.push({code:'image_size_limit',file:image.relative,bytes:bytes.length});
 if(!/^[a-z0-9]+(?:-[a-z0-9]+)+\.webp$/.test(path.basename(image.relative))||/[a-f0-9]{20,}/i.test(path.basename(image.relative)))errors.push({code:'image_filename_review',file:image.relative});
 try{const metadata=await sharp(bytes).metadata();dimensions.set(image.relative,{width:metadata.width,height:metadata.height});}catch(error){errors.push({code:'undecodable_image',file:image.relative,message:error.message});}
}}
sharp.concurrency(1);await Promise.all(Array.from({length:4},inspect));
let imgElements=0,srcsetCandidates=0,benefitPages=0;
function checkUrl(value,page,kind){
 if(!value)return;let url;try{url=new URL(decodeHTML(value),'https://www.cncpioneer.com');}catch{return;}
 if(!['www.cncpioneer.com','cncpioneer.com','localhost','127.0.0.1'].includes(url.hostname)){errors.push({code:'external_image',page,kind,value});return;}
 if(!url.pathname.endsWith('.webp')||!dimensions.has(decodeURIComponent(url.pathname)))errors.push({code:'unoptimized_image_reference',page,kind,value});
}
for(const page of pages){
 const html=fs.readFileSync(page.file,'utf8'),nodes=[];walkSync(parse(html),node=>{if(node.type===ELEMENT_NODE)nodes.push(node);});
 const route=page.relative.replace(/\/index\.html$/,'')||'/';
 if(applySpellingCorrections(html,route)!==html)errors.push({code:'known_spelling_error',page:page.relative});
 const overview=nodes.find(node=>node.attributes.id==='product-overview');
 if(overview)walkSync(overview,node=>{if(node.name==='strong'&&text(node)==='40')errors.push({code:'truncated_overview_heading',page:page.relative});});
 const materialSection=nodes.find(node=>node.attributes.id==='product-materials');
 if(materialSection)walkSync(materialSection,node=>{if(node.name==='article'){const copy=text(node);if(/17-4PH/.test(copy)&&/non[ -]magnetic/i.test(copy))errors.push({code:'incorrect_17_4ph_magnetism',page:page.relative});}});
 for(const node of nodes){
  if(node.name==='img'){imgElements++;checkUrl(node.attributes.src,page.relative,'img');}
  if(['img','source'].includes(node.name))for(const attr of ['srcset','data-srcset','data-lazy-srcset'])for(const candidate of decodeHTML(node.attributes[attr]||'').split(',').filter(Boolean)){
   const [url,descriptor]=candidate.trim().split(/\s+/);srcsetCandidates++;checkUrl(url,page.relative,attr);
   let key;try{key=decodeURIComponent(new URL(url,'https://www.cncpioneer.com').pathname);}catch{continue;}
   if(descriptor?.endsWith('w')&&dimensions.has(key)&&Number(descriptor.slice(0,-1))!==dimensions.get(key).width)errors.push({code:'incorrect_srcset_width',page:page.relative,url,descriptor,actual:dimensions.get(key).width});
  }
  if(node.name==='meta'&&['og:image','twitter:image','msapplication-TileImage'].includes(node.attributes.property||node.attributes.name))checkUrl(node.attributes.content,page.relative,'metadata');
 }
 const benefits=nodes.find(n=>n.attributes.id==='machining-benefits');
 if(benefits){benefitPages++;const copies=[];walkSync(benefits,node=>{if(node.name==='article'&&/(?:^|\s)why-card(?:\s|$)/.test(node.attributes.class||'')){let paragraph;walkSync(node,n=>{if(n.name==='p')paragraph=n});if(paragraph)copies.push(text(paragraph));}});if(new Set(copies).size!==copies.length)errors.push({code:'duplicate_benefit_copy',page:page.relative});}
 if(/\/blog\/(?:stainless-steel-cnc-machining|cast-iron-cnc-machining-parts)\//.test(page.relative)){
  const article=nodes.find(n=>n.attributes.id==='main-article-content'),copy=text(article);
  if(/4x more corrosion|20% better|sortable breakdown|ASTM D2000|49 CFR Part 215/i.test(copy))errors.push({code:'unreviewed_technical_claim',page:page.relative});
  if(nodes.some(n=>n.name==='li'&&text(n)==='gas.'))errors.push({code:'broken_list_item',page:page.relative});
  const references=nodes.filter(n=>n.name==='a'&&/^https?:/.test(n.attributes.href||'')).map(n=>n.attributes.href);
  if(page.relative.includes('cast-iron')&&!references.some(url=>url.includes('store.astm.org/standards/a536')))errors.push({code:'missing_ductile_iron_reference',page:page.relative});
  if(page.relative.includes('stainless-steel')&&!references.some(url=>url.includes('outokumpu.com')))errors.push({code:'missing_stainless_reference',page:page.relative});
 }
}
const unique=new Set(Object.values(optimizedImageAssets).map(asset=>asset.src));
for(const src of unique)if(!dimensions.has(src))errors.push({code:'missing_manifest_image',src});
const report={generatedAt:new Date().toISOString(),pages:pages.length,imageFiles:images.length,imgElements,srcsetCandidates,benefitPages,largestBytes,strictMaxBytes:100000,totalBytes,fontFiles,errors};
fs.mkdirSync(path.dirname(output),{recursive:true});fs.writeFileSync(output,JSON.stringify(report,null,2));console.log(JSON.stringify({...report,errors:errors.slice(0,30)},null,2));process.exitCode=errors.length?1:0;
