import fs from 'node:fs';
import path from 'node:path';
import {parse,walkSync,ELEMENT_NODE} from 'ultrahtml';
import {decodeHTML} from 'entities';
const out=path.dirname(new URL(import.meta.url).pathname.replace(/^\/([A-Za-z]:)/,'$1'));
const origin='https://www.cncpioneer.com';
const live=JSON.parse(fs.readFileSync(path.join(out,'live-crawl.json')));
const local=JSON.parse(fs.readFileSync(path.join(out,'local-diagnostic.json')));
const norm=p=>decodeURIComponent(p).replace(/\/index\.html$/,'').replace(/\/$/,'')||'/';
const routes=new Set([...local.pages.map(p=>p.route),'/404.html']);
const brokenLinks=[];
for(const r of live.responses)for(const a of r.page?.links||[]){try{const u=new URL(decodeHTML(a.href),r.url);if(['www.cncpioneer.com','cncpioneer.com'].includes(u.hostname)&&['http:','https:'].includes(u.protocol)&&!routes.has(norm(u.pathname))&&!fs.existsSync(path.join('dist',decodeURIComponent(u.pathname))))brokenLinks.push({from:r.requested,to:u.href,text:a.text});}catch{}}
const groups=key=>{const m=new Map();for(const r of live.responses){const v=r.page?.[key];if(!v)continue;if(!m.has(v))m.set(v,[]);m.get(v).push(r.requested);}return [...m].filter(([,p])=>p.length>1).map(([value,pages])=>({value,pages}));};
const redirected=live.responses.filter(r=>r.requested!==r.url).map(r=>({requested:r.requested,final:r.url,canonical:r.page?.canonical}));
const assets=new Set();
for(const route of ['/','/services/swiss-machining','/blog/what-is-cnc','/custom-cnc-parts/5-axis-cnc-machining-aerospace-components']){
  const p=live.responses.find(r=>norm(new URL(r.requested).pathname)===route)?.page;if(!p)continue;
  for(const a of [...p.styles,...p.scripts,...p.preloads.map(p=>p.href),...p.images.slice(0,3).map(i=>i.src)])if(a&&!a.startsWith('data:'))assets.add(new URL(a,origin).href);
}
const results=[];
let cursor=0;
async function worker(){while(cursor<assets.size){const u=[...assets][cursor++];try{const r=await fetch(u,{signal:AbortSignal.timeout(15000)});const bytes=(await r.arrayBuffer()).byteLength;results.push({url:u,status:r.status,bytes,headers:Object.fromEntries(r.headers)});}catch(e){results.push({url:u,error:e.message});}}}
await Promise.all(Array.from({length:3},worker));
const emptyAlts=local.pages.flatMap(p=>p.images.filter(i=>i.alt==='').map(i=>({page:p.route,src:i.src})));
const firstMainImages=[];
for(const p of local.pages.filter(p=>p.route.startsWith('/blog/'))){const file=path.join('dist',p.route,'index.html');if(!fs.existsSync(file))continue;const els=[];walkSync(parse(fs.readFileSync(file,'utf8')),n=>{if(n.type===ELEMENT_NODE)els.push(n);});const main=els.find(n=>n.name==='main');let image;walkSync(main,n=>{if(!image&&n.name==='img')image=n;});if(image)firstMainImages.push({page:p.route,src:image.attributes.src,loading:image.attributes.loading,priority:image.attributes.fetchpriority});}
const eagerPages=local.pages.map(p=>({page:p.route,eagerOrDefaultImages:p.images.filter(i=>i.loading!=='lazy').length,highPriorityImages:p.images.filter(i=>i.fetchpriority==='high').length})).sort((a,b)=>b.highPriorityImages-a.highPriorityImages||b.eagerOrDefaultImages-a.eagerOrDefaultImages);
const report={generatedAt:new Date().toISOString(),summary:{redirectedSitemapUrls:redirected.length,liveTitleDuplicateGroups:groups('title').length,liveDescriptionDuplicateGroups:groups('description').length,liveUnresolvedInternalLinks:brokenLinks.length,assetsSampled:results.length,assetFailures:results.filter(r=>r.status!==200).length,emptyAltOccurrences:emptyAlts.length,emptyAltUniqueImages:new Set(emptyAlts.map(i=>i.src)).size,blogMainFirstImages:firstMainImages.length,blogLazyFirstImages:firstMainImages.filter(i=>i.loading==='lazy').length},redirected,liveTitleDuplicates:groups('title'),liveDescriptionDuplicates:groups('description'),brokenLinks,assets:results,emptyAlts,firstMainImages,eagerPages:eagerPages.slice(0,20)};
fs.writeFileSync(path.join(out,'followup.json'),JSON.stringify(report,null,2));
console.log(JSON.stringify({summary:report.summary,redirectExamples:redirected.slice(0,4),brokenLinks:brokenLinks.slice(0,12),assetResults:results.map(({url,status,bytes,headers,error})=>({url,status,bytes,cache:headers?.['cache-control'],encoding:headers?.['content-encoding'],error})),eagerPages:report.eagerPages.slice(0,6)},null,2));
