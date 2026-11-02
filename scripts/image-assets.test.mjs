import assert from 'node:assert/strict';
import {test} from 'node:test';
import {parse,walkSync,ELEMENT_NODE} from 'ultrahtml';
import {optimizedImageUrl,rewriteImageReferences,applyOptimizedImageReferences,optimizedImageAssets} from '../src/image-assets.mjs';

test('image URL rewriting covers markup, CSS and JSON while preserving external references',()=>{
 const assets={'/images/part.jpg':{src:'/assets/images/brass-threaded-fitting.webp'}};
 const source='<img src="/images/part.jpg"><style>.part{background:url(../images/part.jpg)}</style><script type="application/ld+json">{"image":"https://www.cncpioneer.com/images/part.jpg"}</script><img src="https://example.com/images/part.jpg">';
 const result=rewriteImageReferences(source,'/styles/main.css',assets);
 assert.ok(result.includes('src="/assets/images/brass-threaded-fitting.webp"'));
 assert.ok(result.includes('url(/assets/images/brass-threaded-fitting.webp)'));
 assert.ok(result.includes('"image":"https://www.cncpioneer.com/assets/images/brass-threaded-fitting.webp"'));
 assert.ok(result.includes('src="https://example.com/images/part.jpg"'));
 assert.equal(rewriteImageReferences(result,'/styles/main.css',assets),result);
});

test('Pinterest media parameters are encoded WebP URLs without changing the shared page or description',()=>{
 const assets={'/images/part.jpg':{src:'/assets/images/brass-threaded-fitting.webp'}};
 const media='https://www.cncpioneer.com/images/part.jpg';
 const original=new URL('https://pinterest.com/pin/create/button/');
 original.searchParams.set('url','https://www.cncpioneer.com/blog/part');
 original.searchParams.set('description','Custom parts & inspection');
 original.searchParams.set('media',media);
 const source=`<a href="${original.href.replaceAll('&','&amp;')}">Share</a>`;
 const result=rewriteImageReferences(source,'/blog/part',assets);
 const decoded=result.match(/href="([^"]+)"/)[1].replaceAll('&amp;','&');
 const next=new URL(decoded);
 assert.equal(next.searchParams.get('media'),'https://www.cncpioneer.com/assets/images/brass-threaded-fitting.webp');
 assert.equal(next.searchParams.get('url'),original.searchParams.get('url'));
 assert.equal(next.searchParams.get('description'),original.searchParams.get('description'));
 assert.equal(rewriteImageReferences(result,'/blog/part',assets),result);
 const unrelated='<a href="https://example.com/?media='+encodeURIComponent(media)+'">Example</a>';
 assert.equal(rewriteImageReferences(unrelated,'/blog/part',assets),unrelated);
});

test('legacy tile icon and known author avatars resolve to existing local WebP assets',()=>{
 const icon=optimizedImageAssets['/wp-content/uploads/2026/01/cropped-site-icon-192x192.png'];
 assert.ok(icon);
 assert.equal(optimizedImageUrl('/wp-content/uploads/2026/01/cropped-site-icon-270x270.png'),icon.src);
 for(const [hash,path] of [
  ['cce2715f1891c236d55b31c5be14173bd51ad76c7664cf39b084d84aafecc9e0','/wp-content/uploads/2026/03/ryan-wang-100X100.jpg'],
  ['f2a239e711cbc68334e67f119f1c777ec37a814519043b0f491e7789c279a776','/wp-content/uploads/2026/03/david-li-150x150-1.jpg'],
 ]){
  assert.ok(optimizedImageAssets[path]);
  assert.equal(optimizedImageUrl(`https://secure.gravatar.com/avatar/${hash}?s=96`),'https://www.cncpioneer.com'+optimizedImageAssets[path].src);
 }
 assert.equal(optimizedImageUrl('https://secure.gravatar.com/avatar/unrelated?s=96'),'https://secure.gravatar.com/avatar/unrelated?s=96');
});

test('responsive descriptors and Open Graph metadata use the encoded image dimensions',()=>{
 const [original,asset]=Object.entries(optimizedImageAssets).find(([key])=>key.endsWith('.png'));
 const source=`<html><head><meta property="og:image" content="${original}"><meta property="og:image:type" content="image/png"><meta property="og:image:width" content="9999"><meta property="og:image:height" content="9999"></head><body><picture><source type="image/png" srcset="${original} 9999w, ${original} 8888w"><img src="${original}" alt="Part"></picture></body></html>`;
 const result=applyOptimizedImageReferences(source,'/parts');const nodes=[];walkSync(parse(result),node=>{if(node.type===ELEMENT_NODE)nodes.push(node)});
 assert.equal(nodes.find(n=>n.name==='source').attributes.srcset,`${asset.src} ${asset.width}w`);
 assert.equal(nodes.find(n=>n.name==='source').attributes.type,'image/webp');
 assert.equal(nodes.find(n=>n.attributes.property==='og:image:type').attributes.content,'image/webp');
 assert.equal(nodes.find(n=>n.attributes.property==='og:image:width').attributes.content,String(asset.width));
 assert.equal(nodes.find(n=>n.attributes.property==='og:image:height').attributes.content,String(asset.height));
 assert.equal(applyOptimizedImageReferences(result,'/parts'),result);
});
