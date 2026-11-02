import fs from 'node:fs/promises';
import path from 'node:path';
import {createHash} from 'node:crypto';
import {rewriteImageReferences} from '../src/image-assets.mjs';
const publicRoot=path.resolve('public'),backupRoot=path.resolve('work/original-images-20261027');
const file='src/data/imageAssets.json',manifest=JSON.parse(await fs.readFile(file,'utf8'));
const unique=new Map(Object.values(manifest.assets).map(a=>[a.src,a]));
const industry=new Set('aerospace agriculture automation automotive automotives construction consumer defense electronics energy evtol exoskeleton hvac industrial marine medical mining motorsport optical petrochemical railway robotics security semiconductor telecom telecommunications'.split(' '));
const robots=new Set('casbot droidup engineai magiclab pndbotics robotera'.split(' '));
const logos=new Set('ford google honeywell meta'.split(' '));
const special={maxresdefault:'cnc-aluminum-pocket-milling-process',cncpioneer:'cncpioneer-cnc-machining-website-reference',airframe:'aircraft-airframe-assembly',avionics:'aircraft-avionics-installation',crankshaft:'precision-machined-crankshaft',fasteners:'custom-aerospace-threaded-fasteners',stamping:'metal-stamping-production-process',welding:'industrial-metal-welding-process'};
const aliases={},pending=[];
function inside(file,base){const rel=path.relative(base,file);if(rel.startsWith('..')||path.isAbsolute(rel))throw Error('Unsafe image path');return rel;}
for(const [old,asset]of unique){
 const stem=path.basename(old,'.webp');if(stem.includes('-'))continue;
 let name=special[stem]|| (logos.has(stem)?stem+'-company-logo':industry.has(stem)?stem+'-industry-application':robots.has(stem)?stem+'-humanoid-robot-reference':['inconel','monel','nitinol','titanium'].includes(stem)?stem+'-alloy-machining-material':stem+'-cnc-manufacturing-company-profile');
 const target='/assets/images/'+name+'.webp';
 const original=path.resolve(publicRoot,'.'+old),output=path.resolve(publicRoot,'.'+target);inside(original,publicRoot);inside(output,publicRoot);
 const data=await fs.readFile(original),sha256=createHash('sha256').update(data).digest('hex');
 const backup=path.resolve(backupRoot,'.'+old);inside(backup,backupRoot);await fs.mkdir(path.dirname(backup),{recursive:true});await fs.writeFile(backup,data);
 await fs.writeFile(output,data);
 for(const item of Object.values(manifest.assets))if(item.src===old)item.src=target;
 aliases[old]={...asset,src:target,sha256,originalBytes:data.length,alias:true};
 try{await fs.unlink(original);}catch(error){pending.push({original,error:error.code});}
}
Object.assign(manifest.assets,aliases);
manifest.assets=Object.fromEntries(Object.entries(manifest.assets).sort(([a],[b])=>a.localeCompare(b)));
await fs.writeFile(file,JSON.stringify(manifest,null,2)+'\n');
let changed=0;
async function rewrite(dir){for(const entry of await fs.readdir(dir,{withFileTypes:true})){
 const file=path.join(dir,entry.name);if(entry.isDirectory())await rewrite(file);
 else if(/\.(?:css|js|json|html|xml|webmanifest)$/.test(file)){
  const before=await fs.readFile(file,'utf8'),after=rewriteImageReferences(before,'/'+path.relative(publicRoot,file).replaceAll('\\','/'),manifest.assets);
  if(before!==after){await fs.writeFile(file,after);changed++;}
 }
}}
await rewrite(publicRoot);
console.log(JSON.stringify({renamed:Object.keys(aliases).length,rewrittenPublicFiles:changed,pendingUnreferencedCopies:pending},null,2));
