import fs from 'node:fs/promises';
import path from 'node:path';
import {createHash} from 'node:crypto';
import {fileURLToPath} from 'node:url';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const publicRoot=path.join(root,'public'),backupRoot=path.join(root,'work/original-images-20261027');
const manifest=JSON.parse(await fs.readFile(path.join(root,'src/data/imageAssets.json'),'utf8'));
const hash=data=>createHash('sha256').update(data).digest('hex');
let removed=0;
for(const [old,asset]of Object.entries(manifest.assets)){
 const file=path.resolve(publicRoot,'.'+old),relative=path.relative(publicRoot,file);
 if(relative.startsWith('..')||path.isAbsolute(relative))throw Error('Unsafe original path');
 try{await fs.access(file);}catch{continue;}
 const backup=path.resolve(backupRoot,relative),optimized=path.resolve(publicRoot,'.'+asset.src);
 if(path.relative(backupRoot,backup).startsWith('..')||path.relative(publicRoot,optimized).startsWith('..'))throw Error('Unsafe backup or output path');
 if(hash(await fs.readFile(backup))!==asset.sha256)throw Error('Unverified backup: '+old);
 const converted=await fs.readFile(optimized);
 if(converted.length>=100000||converted.subarray(8,12).toString()!=='WEBP')throw Error('Invalid optimized replacement');
 await fs.unlink(file);removed++;
}
console.log(JSON.stringify({removed,verifiedBackups:true}));
