import fs from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {rewriteImageReferences,optimizedImageAssets} from '../src/image-assets.mjs';

export default function imageAssetsIntegration(){return {
 name:'optimized-webp-image-assets',
 hooks:{
  'astro:config:setup':({updateConfig})=>updateConfig({vite:{plugins:[{
   name:'resolve-optimized-image-urls',enforce:'pre',
   transform(code,id){if(/\.(?:astro|css)(?:\?|$)/.test(id)){const result=rewriteImageReferences(code);if(result!==code)return {code:result,map:null};}}
  }]}}),
  'astro:build:done':async({dir})=>{
   const root=fileURLToPath(dir);
   async function walk(directory){for(const entry of await fs.readdir(directory,{withFileTypes:true})){
    const file=path.join(directory,entry.name);
    if(entry.isDirectory())await walk(file);
    else if(/\.(?:html|css|js|json|xml|webmanifest)$/i.test(file)){
     const original=await fs.readFile(file,'utf8'),base='/'+path.relative(root,file).replaceAll('\\','/');
     const result=rewriteImageReferences(original,base);
     if(result!==original)await fs.writeFile(file,result);
    }
   }}
   await walk(root);
   // Public originals held open by another Windows app are not deployed.
   for(const old of Object.keys(optimizedImageAssets)){
    const file=path.resolve(root,'.'+old),relative=path.relative(root,file);
    if(relative.startsWith('..')||path.isAbsolute(relative))throw Error('Unsafe legacy image path');
    try{await fs.unlink(file);}catch(error){if(error.code!=='ENOENT')throw error;}
   }
  }
 }
};}
