import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {parse,walkSync,ELEMENT_NODE} from 'ultrahtml';
import {decodeHTML} from 'entities';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const build=path.resolve(process.argv[2]||path.join(root,'dist'));
const output=path.resolve(process.argv[3]||path.join(root,'seo-migration/reports/asset-dependencies.json'));
const queue=new Set(), visited=new Set(), errors=[];
const hosts=new Set(['www.cncpioneer.com','cncpioneer.com','127.0.0.1','localhost']);
let references=0, pages=0;
function reference(value, from) {
  value=decodeHTML(value.trim()).replace(/^(["'])([\s\S]*)\1$/, '$2');
  if(!value || /^(?:#|data:|blob:)/i.test(value)) return;
  let url;
  try {url=new URL(value,'https://www.cncpioneer.com'+from);}catch{return;}
  if(!hosts.has(url.hostname)) return;
  const key=decodeURIComponent(url.pathname);
  const file=path.resolve(build,'.'+key);
  const relative=path.relative(build,file);
  references++;
  if(relative.startsWith('..')||path.isAbsolute(relative)||!fs.existsSync(file)) errors.push({from,value,target:key});
  else if(/\.(?:css|m?js)$/i.test(key))queue.add(key);
}
function css(source,from) {
  // Ignore comments so obsolete examples do not become false missing assets.
  source=source.replace(/\/\*[\s\S]*?\*\//g,'');
  for(const match of source.matchAll(/url\(\s*(?:"([^"]*)"|'([^']*)'|([^)]*?))\s*\)/gi))reference(match[1]??match[2]??match[3],from);
  for(const match of source.matchAll(/@import\s+["']([^"']+)["']/gi))reference(match[1],from);
}
function walk(dir) {
  for(const entry of fs.readdirSync(dir,{withFileTypes:true})) {
    const file=path.join(dir,entry.name);
    if(entry.isDirectory())walk(file);
    else if(entry.name==='index.html'||entry.name==='404.html') {
      pages++;
      const from='/'+path.relative(build,file).replaceAll('\\','/');
      const source=fs.readFileSync(file,'utf8');
      walkSync(parse(source),node=>{
        if(node.type!==ELEMENT_NODE)return;
        if(node.name==='link' && /stylesheet|modulepreload/.test(node.attributes.rel||''))reference(node.attributes.href||'',from);
        if(node.name==='script' && node.attributes.src)reference(node.attributes.src,from);
        if(node.attributes.style)css(node.attributes.style,from);
        if(node.name==='style')css((node.children||[]).map(n=>n.value||'').join(''),from);
      });
    }
  }
}
walk(build);
for(const key of queue) {
  if(visited.has(key))continue;
  visited.add(key);
  const source=fs.readFileSync(path.join(build,key),'utf8');
  if(key.endsWith('.css'))css(source,key);
  else for(const match of source.matchAll(/(?:\bimport\s*\(\s*|\b(?:import|export)\s+(?:[^;\n]*?\s+from\s*)?)["']([^"']+)["']/g)) {
    if(/^(?:\.|\/|https?:)/.test(match[1]))reference(match[1],key);
  }
}
const report={generatedAt:new Date().toISOString(),build,pages,assetsVisited:visited.size,references,errors};
fs.mkdirSync(path.dirname(output),{recursive:true});fs.writeFileSync(output,JSON.stringify(report,null,2));
console.log(JSON.stringify({...report,errors:errors.slice(0,35)},null,2));
process.exitCode=errors.length?1:0;
