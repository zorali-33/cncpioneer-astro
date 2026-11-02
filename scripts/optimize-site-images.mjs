import fs from 'node:fs/promises';
import path from 'node:path';
import {createHash} from 'node:crypto';
import {fileURLToPath} from 'node:url';
import sharp from 'sharp';
import {parse,walkSync,ELEMENT_NODE} from 'ultrahtml';
import {decodeHTML} from 'entities';
import {rewriteImageReferences} from '../src/image-assets.mjs';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const publicRoot=path.join(root,'public'),outputRoot=path.join(publicRoot,'assets/images');
const backupRoot=path.join(root,'work/original-images-20261027');
const manifestFile=path.join(root,'src/data/imageAssets.json');
const MAX_BYTES=100000;
const old=JSON.parse(await fs.readFile(manifestFile,'utf8'));
const assets={...old.assets},sources=[],textFiles=[],hints=new Map(),names=new Map(),hashes=new Map();
const knownOutputs=new Set(Object.values(assets).map(asset=>path.resolve(publicRoot,'.'+asset.src)));
const hash=data=>createHash('sha256').update(data).digest('hex');
function inside(file,base){const relative=path.relative(base,file);if(relative.startsWith('..')||path.isAbsolute(relative))throw Error('Path outside intended workspace: '+file);return relative;}
async function walk(directory){
 for(const entry of await fs.readdir(directory,{withFileTypes:true})){
  const file=path.join(directory,entry.name);inside(file,publicRoot);
  if(knownOutputs.has(file))continue;
  if(entry.isDirectory())await walk(file);
  else if(/\.(?:jpe?g|png|gif|webp|avif|svg|ico)$/i.test(file)){
   if(/(?:\/webfonts\/|\/fonts\/).*\.svg$/i.test(file.replaceAll('\\','/')))continue;
   sources.push(file);
  }else if(/\.(?:css|js|json|html|xml|webmanifest)$/i.test(file))textFiles.push(file);
 }
}
await walk(publicRoot);
async function collectHints(directory){
 try{for(const entry of await fs.readdir(directory,{withFileTypes:true})){
  const file=path.join(directory,entry.name);
  if(entry.isDirectory())await collectHints(file);
  else if(entry.name==='index.html'){
   const html=await fs.readFile(file,'utf8');
   walkSync(parse(html),node=>{
    if(node.type!==ELEMENT_NODE||node.name!=='img'||!node.attributes.src)return;
    let key;try{key=decodeURIComponent(new URL(decodeHTML(node.attributes.src),'https://www.cncpioneer.com').pathname);}catch{return;}
    const alt=decodeHTML(node.attributes.alt||'');
    if(alt.length>5&&!hints.has(key))hints.set(key,alt);
   });
  }
 }}catch(error){if(error.code!=='ENOENT')throw error;}
}
await collectHints(path.join(root,'dist'));
for(const asset of Object.values(assets)){names.set(path.basename(asset.src),asset.sha256);hashes.set(asset.sha256,asset);}
await fs.mkdir(outputRoot,{recursive:true});await fs.mkdir(backupRoot,{recursive:true});
function words(value){return value.normalize('NFKD').replace(/[\u0300-\u036f\u200b-\u200f\ufeff]/g,'').replace(/&/g,' and ').toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-+|-+$/g,'');}
function nameFor(file,key,buffer){
 let stem=path.basename(file,path.extname(file));
 if(stem==='concept-1'||/^concept-\d+$/.test(stem))stem=buffer.toString('utf8').match(/<title\b[^>]*>([^<]+)<\/title>/i)?.[1]||path.basename(path.dirname(file))+'-'+stem;
 const short={ar:'manufacturing-partner-ar-logo',br:'manufacturing-partner-br-logo',jh:'manufacturing-partner-jh-logo',jt:'manufacturing-partner-jt-logo',abb:'abb-company-logo',bosch:'bosch-company-logo',siemens:'siemens-company-logo',ev:'electric-vehicle-industry', '5g':'5g-communications-equipment'};
 const size=stem.match(/-\d+x\d+(?:-\d+)?$/)?.[0]||'';
 const plain=stem.replace(/-\d+x\d+(?:-\d+)?$/,'').toLowerCase();
 if(short[plain])stem=short[plain]+size;
 if(/^(?:img|image|untitled|[0-9]+|[a-f0-9]{20,})(?:[-_\d]|$)/i.test(stem))stem=hints.get(key)||stem.replace(/^(?:img|image|untitled|[0-9]+)[-_]*/i,'')||path.basename(path.dirname(file))+'-machined-component';
 stem=stem.replace(/^00778[-_ ]*/,'precision-').replace(/cncpioneer_nav_logo/i,'cncpioneer-company-navigation-logo').replace(/cropped-site-icon/i,'cncpioneer-site-icon');
 stem=words(stem).replace(/-?(?:no20background|no-background|generated)(?:-|$)/g,'-').replace(/-+/g,'-').replace(/-$/,'').slice(0,125).replace(/-$/,'');
 if(!/[a-z]{3}/.test(stem))stem='cncpioneer-machined-component-'+stem;
 if(inside(file,publicRoot).replaceAll('\\','/').startsWith('assets/images/'))stem+='-optimized';
 return stem;
}
async function encode(buffer,metadata){
 if(metadata.format==='webp'&&buffer.length<MAX_BYTES)return {buffer,width:metadata.width,height:metadata.height,quality:'original'};
 let longest=Math.min(Math.max(metadata.width,metadata.height),1600),result;
 for(let step=0;step<12;step++){
  for(const quality of [86,78,70]){
   const image=sharp(buffer,{animated:true}).autoOrient().resize({width:metadata.width>=metadata.height?Math.round(longest):undefined,height:metadata.height>metadata.width?Math.round(longest):undefined,withoutEnlargement:true});
   result=await image.webp({quality,alphaQuality:100,effort:4,smartSubsample:true}).toBuffer({resolveWithObject:true});
   if(result.data.length<MAX_BYTES)return {buffer:result.data,width:result.info.width,height:result.info.height,quality};
  }
  longest=Math.round(longest*0.82);
 }
 throw Error('Cannot meet strict image size limit');
}
let cursor=0,done=0;const failures=[],processed=[];
async function worker(){while(cursor<sources.length){
 const file=sources[cursor++],relative=inside(file,publicRoot),key='/'+relative.replaceAll('\\','/');
 try{
  const buffer=await fs.readFile(file),sha256=hash(buffer);
  let asset=hashes.get(sha256);
  if(!asset){
   const metadata=await sharp(buffer,{animated:true}).metadata();
   if(!metadata.width||!metadata.height)throw Error('Missing dimensions');
   const encoded=await encode(buffer,metadata),stem=nameFor(file,key,buffer);
   let filename=stem+'.webp',index=2;
   while(names.has(filename)&&names.get(filename)!==sha256)filename=stem+'-view-'+index+++'.webp';
   names.set(filename,sha256);
   const output=path.join(outputRoot,filename);inside(output,outputRoot);
   await fs.writeFile(output,encoded.buffer);
   asset={src:'/assets/images/'+filename,width:encoded.width,height:encoded.height,bytes:encoded.buffer.length,quality:encoded.quality,sha256};
   hashes.set(sha256,asset);
  }
  assets[key]={...asset,originalBytes:buffer.length};
  const backup=path.join(backupRoot,relative);inside(backup,backupRoot);
  await fs.mkdir(path.dirname(backup),{recursive:true});
  try{const previous=await fs.readFile(backup);if(hash(previous)!==sha256)throw Error('Backup already exists with different contents: '+key);}
  catch(error){if(error.code==='ENOENT')await fs.copyFile(file,backup);else throw error;}
  if(hash(await fs.readFile(backup))!==sha256)throw Error('Backup verification failed');
  processed.push(file);
 }catch(error){failures.push({source:key,error:error.message});}
 done++;if(done%250===0)console.log(`Images encoded and backed up: ${done}/${sources.length}`);
}}
sharp.concurrency(1);
await Promise.all(Array.from({length:6},worker));
if(failures.length){await fs.writeFile(path.join(root,'work/image-optimization-failures.json'),JSON.stringify(failures,null,2));throw Error(JSON.stringify(failures));}
await fs.writeFile(manifestFile,JSON.stringify({version:1,maxBytes:MAX_BYTES,assets:Object.fromEntries(Object.entries(assets).sort(([a],[b])=>a.localeCompare(b)))},null,2)+'\n');
let rewritten=0;
for(const file of textFiles){const source=await fs.readFile(file,'utf8'),base='/'+inside(file,publicRoot).replaceAll('\\','/');const result=rewriteImageReferences(source,base,assets);if(result!==source){await fs.writeFile(file,result);rewritten++;}}
// Every original is recoverable outside public before removing its public copy.
const cleanupPending=[];
for(const file of processed){
 inside(file,publicRoot);
 for(let attempt=0;attempt<6;attempt++){
  try{await fs.unlink(file);break;}
  catch(error){
   if(error.code==='ENOENT')break;
   if(['EBUSY','EPERM'].includes(error.code)&&attempt<5){await new Promise(resolve=>setTimeout(resolve,150*(attempt+1)));continue;}
   if(path.extname(file).toLowerCase()==='.webp'){
    const key='/'+inside(file,publicRoot).replaceAll('\\','/');
    const optimized=path.join(publicRoot,assets[key].src);
    try{await fs.writeFile(file,await fs.readFile(optimized));break;}catch{}
   }
   cleanupPending.push({file,error:error.message});break;
  }
 }
}
const unique=new Map(Object.values(assets).map(asset=>[asset.src,asset]));
const report={date:'2026-10-27',sourceImages:Object.keys(assets).length,optimizedImages:unique.size,strictMaxBytes:MAX_BYTES,largestBytes:Math.max(...[...unique.values()].map(x=>x.bytes)),sourceBytes:Object.values(assets).reduce((sum,x)=>sum+x.originalBytes,0),optimizedBytes:[...unique.values()].reduce((sum,x)=>sum+x.bytes,0),rewrittenPublicFiles:rewritten,backupRoot,cleanupPending,failures};
await fs.writeFile(path.join(root,'work/image-optimization-20261027.json'),JSON.stringify(report,null,2));console.log(JSON.stringify(report,null,2));
