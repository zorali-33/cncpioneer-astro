import fs from 'node:fs';
import path from 'node:path';
import {parse, ELEMENT_NODE, TEXT_NODE} from 'ultrahtml';
import {decodeHTML} from 'entities';

const root = path.resolve('dist');
const output = path.resolve('seo-migration/reports/internal-link-structure');
const files = new Map();
function collect(dir) {
  for (const e of fs.readdirSync(dir, {withFileTypes:true})) {
    const p = path.join(dir,e.name);
    if(e.isDirectory()) collect(p); else files.set('/'+path.relative(root,p).replaceAll('\\','/'),p);
  }
}
collect(root);
const norm = p => decodeURIComponent(p).replace(/\/index\.html$/,'/').replace(/\/$/,'') || '/';
const pages = new Map();
const text = n => decodeHTML(n.type===TEXT_NODE ? n.value : (n.children||[]).map(text).join('')).replace(/\s+/g,' ').trim();
const imageName = n => n.name==='img' ? n.attributes.alt||'' : (n.children||[]).map(imageName).join(' ');
for(const [p,file] of files) {
  if(!p.endsWith('/index.html') && p!=='/404.html') continue;
  const html=fs.readFileSync(file,'utf8');
  pages.set(norm(p),{route:norm(p),html,noindex:/<meta[^>]+name=["']robots["'][^>]+content=["'][^"']*noindex/i.test(html),ids:new Set(),links:[]});
}
const broken=[], fragments=[], emptyAnchors=[], noncanonical=[];
for(const page of pages.values()) {
  function visit(n,ancestors=[]) {
    if(n.type===ELEMENT_NODE) {
      if(n.attributes.id) page.ids.add(decodeHTML(n.attributes.id));
      if(n.name==='a' && n.attributes.href) {
        const href=decodeHTML(n.attributes.href);
        try {
          const url=new URL(href,'https://www.cncpioneer.com'+(page.route==='/'?'/':page.route+'/'));
          if(!['cncpioneer.com','www.cncpioneer.com'].includes(url.hostname) || !/^https?:$/.test(url.protocol)) return;
          const route=norm(url.pathname);
          const context=ancestors.map(a=>`${a.name||''} ${a.attributes?.class||''} ${a.attributes?.['aria-label']||''}`).join(' ');
          const kind=/\bheader\b|\bfooter\b/.test(context)?'sitewide':/breadcrumb/i.test(context)?'breadcrumb':/\bnav\b|pagination/i.test(context)?'navigation':'content';
          const anchor=text(n)||n.attributes['aria-label']||imageName(n).trim();
          const link={from:page.route,to:route,href,kind,anchor,hash:url.hash};
          page.links.push(link);
          if(!anchor) emptyAnchors.push(link);
          if(pages.has(route)) {
            if(url.hash) fragments.push(link);
            if(/\/index\.html$/.test(url.pathname)||url.protocol!=='https:'||url.hostname!=='www.cncpioneer.com') {
              if(/^https?:/.test(href)||/\/index\.html(?:#|$)/.test(href)) noncanonical.push(link);
            }
          } else if(!files.has(decodeURIComponent(url.pathname))) broken.push(link);
        } catch {}
      }
    }
    for(const child of n.children||[]) visit(child,[...ancestors,n]);
  }
  visit(parse(page.html));
}
const live=[...pages.values()].filter(p=>!p.noindex);
const incoming=new Map(live.map(p=>[p.route,new Set()]));
const contentIncoming=new Map(live.map(p=>[p.route,new Set()]));
for(const p of live) for(const l of p.links) if(l.to!==p.route && incoming.has(l.to)) {
  incoming.get(l.to).add(p.route);
  if(l.kind==='content') contentIncoming.get(l.to).add(p.route);
}
const depth=new Map([['/',0]]), queue=['/'];
for(let i=0;i<queue.length;i++) for(const l of pages.get(queue[i]).links) {
  if(incoming.has(l.to) && !depth.has(l.to)) {depth.set(l.to,depth.get(queue[i])+1);queue.push(l.to);}
}
const rows=live.map(p=>({route:p.route,depth:depth.get(p.route)??null,incomingPages:incoming.get(p.route).size,contentIncomingPages:contentIncoming.get(p.route).size,outgoingPages:new Set(p.links.filter(l=>incoming.has(l.to)&&l.to!==p.route).map(l=>l.to)).size,contentOutgoingPages:new Set(p.links.filter(l=>l.kind==='content'&&incoming.has(l.to)&&l.to!==p.route).map(l=>l.to)).size}));
const badFragments=fragments.filter(l=>!pages.get(l.to).ids.has(decodeURIComponent(l.hash.slice(1))));
const groups={};
for(const row of rows) {
  const group=row.route==='/'?'home':row.route.split('/')[1];
  const g=groups[group]??={pages:0,zeroContentIncoming:0,maxDepth:0};g.pages++;g.zeroContentIncoming+=Number(row.contentIncomingPages===0);g.maxDepth=Math.max(g.maxDepth,row.depth??0);
}
const report={generatedAt:new Date().toISOString(),scope:'Generated dist HTML; no live crawl. Incoming counts use unique source pages and exclude self links. Content means links outside header, footer, breadcrumb and nav; includes cards, CTAs and related links.',summary:{htmlPages:pages.size,indexablePages:live.length,internalAnchorOccurrences:live.reduce((n,p)=>n+p.links.length,0),brokenLinks:broken.length,brokenFragments:badFragments.length,emptyAnchors:emptyAnchors.length,noncanonicalLinks:noncanonical.length,orphans:rows.filter(r=>r.route!=='/'&&!r.incomingPages).length,unreachableFromHome:rows.filter(r=>r.depth===null).length,depthDistribution:rows.reduce((a,r)=>(a[r.depth??'unreachable']=(a[r.depth??'unreachable']||0)+1,a),{})},groups,broken,badFragments,emptyAnchors,noncanonical,rows:rows.sort((a,b)=>(b.depth??999)-(a.depth??999)||a.contentIncomingPages-b.contentIncomingPages)};
fs.mkdirSync(output,{recursive:true});
fs.writeFileSync(path.join(output,'audit.json'),JSON.stringify(report,null,2));
fs.writeFileSync(path.join(output,'pages.csv'),'route,depth,incoming_pages,content_incoming_pages,outgoing_pages,content_outgoing_pages\n'+report.rows.map(r=>[r.route,r.depth??'unreachable',r.incomingPages,r.contentIncomingPages,r.outgoingPages,r.contentOutgoingPages].join(',')).join('\n'));
console.log(JSON.stringify({summary:report.summary,groups,weakContent:rows.filter(r=>r.contentIncomingPages<=1).slice(0,45),deepest:rows.slice(0,20),broken:broken.slice(0,10),badFragments:badFragments.slice(0,10),noncanonical:noncanonical.slice(0,5)},null,2));
