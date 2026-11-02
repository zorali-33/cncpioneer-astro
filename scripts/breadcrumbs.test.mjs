import assert from 'node:assert/strict';
import {test} from 'node:test';
import {parse,walkSync,ELEMENT_NODE,TEXT_NODE} from 'ultrahtml';
import {decodeHTML} from 'entities';
import {applySiteBreadcrumbs} from '../src/data/siteBreadcrumbs.mjs';
import {applyPageSeoTemplate} from '../src/data/pageSeoTemplate.mjs';
const html=body=>`<html><head><title>Page</title></head><body><main>${body}</main></body></html>`;
const nodes=source=>{const list=[];walkSync(parse(source),n=>{if(n.type===ELEMENT_NODE)list.push(n)});return list;};
const content=n=>decodeHTML(n.type===TEXT_NODE?n.value:(n.children||[]).map(content).join('')).trim();

test('legacy breadcrumbs retain placement, standardize separators and add a blue-current hook',()=>{
 const source=html('<nav class="breadcrumbs" aria-label="Breadcrumb"><a href="/">Home</a><span>&raquo;</span><a href="/materials">Materials</a><span>&raquo;</span><span>Steel &amp; Alloys</span></nav><h1>Steel CNC Machining</h1>');
 const result=applySiteBreadcrumbs(source,'/materials/stainless-steel-cnc-machining');
 const list=nodes(result),crumb=list.find(n=>'data-site-breadcrumb-nav' in n.attributes);
 assert.equal(crumb.attributes.class,'breadcrumbs');
 assert.equal(list.filter(n=>n.attributes['aria-current']==='page').length,1);
 assert.equal(content(list.find(n=>n.attributes['aria-current']==='page')),'Steel & Alloys');
 assert.equal(list.filter(n=>n.attributes.class==='site-breadcrumb-separator').length,2);
 assert.ok(list.filter(n=>n.attributes.class==='site-breadcrumb-separator').every(n=>content(n)==='/'&&n.attributes['aria-hidden']==='true'));
 assert.equal(applySiteBreadcrumbs(result,'/materials/stainless-steel-cnc-machining'),result);
});

test('nested blog breadcrumbs preserve outer layout and do not create nested navigation landmarks',()=>{
 const result=applySiteBreadcrumbs(html('<nav class="detail-breadcrumb-bar" aria-label="Breadcrumb"><div class="detail-breadcrumb-inner"><p id="breadcrumbs" class="detail-breadcrumbs"><span><a href="/">Home</a></span> » <span><a href="/blog">Blog</a></span> » <span aria-current="page">Milling Guide</span></p></div></nav><h1>Milling Guide</h1>'),'/blog/cnc-milling');
 const list=nodes(result); assert.equal(list.filter(n=>'data-site-breadcrumb-nav' in n.attributes).length,1);
 assert.equal(list.filter(n=>n.name==='nav'||n.attributes.role==='navigation').length,1);
 assert.ok(result.includes('class="detail-breadcrumb-inner"'));
});

test('visible industry parent links are retained and match BreadcrumbList data',()=>{
 const route='/industries/automotive-swiss-machining';
 const source=html('<nav aria-label="Breadcrumb"><a href="/">Home</a> / <a href="/industries">Industries</a> / <a href="/industries/automotive">Automotive</a> / <span>Automotive Swiss Machining</span></nav><h1>Automotive Swiss Machining</h1>');
 const result=applyPageSeoTemplate(applySiteBreadcrumbs(source,route),route);
 const schema=JSON.parse(result.match(/<script type="application\/ld\+json" data-site-breadcrumb>([\s\S]*?)<\/script>/)[1]);
 assert.deepEqual(schema.itemListElement.map(c=>c.name),['Home','Industries','Automotive','Automotive Swiss Machining']);
 assert.ok(result.includes('href="/industries/automotive"'));
});

test('paginated archives show a linked parent and the current page number',()=>{
 const result=applySiteBreadcrumbs(html('<nav aria-label="Breadcrumb"><a href="/">Home</a> » <span aria-current="page">Blog</span></nav><h1>Blog</h1>'),'/blog/page/3');
 assert.ok(result.includes('href="/blog">Blog</a>'));
 assert.ok(result.includes('aria-current="page">Page 3</span>'));
});

test('missing author and FAQ breadcrumbs are added once; home and 404 stay unchanged',()=>{
 for(const [route,title,current] of [['/author/ryan-wang/page/2','Ryan Wang','Page 2'],['/resources/faqs','FAQ','FAQ']]){
  const source=html(`<h1>${title}</h1><p>Content remains.</p>`),result=applySiteBreadcrumbs(source,route);
  assert.ok(result.includes(`aria-current="page">${current}</span>`));
  assert.equal(applySiteBreadcrumbs(result,route),result);
  assert.ok(result.includes(`<h1>${title}</h1><p>Content remains.</p>`));
 }
 const source=html('<h1>Home</h1>'); assert.equal(applySiteBreadcrumbs(source,'/'),source); assert.equal(applySiteBreadcrumbs(source,'/404'),source);
});
