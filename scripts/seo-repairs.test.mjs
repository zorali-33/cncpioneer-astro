import assert from 'node:assert/strict';
import {test} from 'node:test';
import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {parse,walkSync,ELEMENT_NODE} from 'ultrahtml';
import {decodeHTML} from 'entities';
import {applyAssetVersions} from '../src/asset-versioning.mjs';
import {applyArticleImagePolicy} from '../src/article-image-policy.mjs';
import {applyPageSeoTemplate} from '../src/data/pageSeoTemplate.mjs';
import {seoRepairDescriptions} from '../src/data/seoRepairDescriptions.mjs';

test('public resource identities follow file contents without editing inline scripts', () => {
  const inline='<script>const sample="<link href=\'/brand-theme.css\'>";</script>';
  const html='<html><head><link href="/brand-theme.css?theme=main&amp;v=old" rel="stylesheet"><script src="/site-search.js"></script>'+inline+'</head></html>';
  const result=applyAssetVersions(html);
  const expected=createHash('sha256').update(readFileSync('public/brand-theme.css')).digest('hex').slice(0,12);
  assert.ok(result.includes(`/brand-theme.css?theme=main&amp;v=${expected}`));
  assert.ok(result.includes(inline));
  assert.equal(applyAssetVersions(result),result);
});

test('article image priorities distinguish the lead, body and inactive noscript copy', () => {
  const source='<main><div id="main-article-content"><figure><img src="/assets/images/brass-cnc-machining-parts.webp" alt="" loading="lazy"><noscript><img src="/assets/images/brass-cnc-machining-parts.webp" alt=""></noscript></figure><p>Machining guidance</p><img src="/assets/images/other.webp" alt="Detail" fetchpriority="high"></div><img src="/author.webp" loading="lazy"></main>';
  const result=applyArticleImagePolicy(source,'/blog/brass-cnc-machining'), images=[];
  walkSync(parse(result),n=>{if(n.type===ELEMENT_NODE&&n.name==='img')images.push(n.attributes);});
  assert.equal(images[0].loading,'eager');
  assert.equal(images[0].fetchpriority,'high');
  assert.equal(images[0].alt,'Examples of brass CNC machined components');
  assert.equal(images[1].loading,'lazy');
  assert.equal(images[1].fetchpriority,undefined);
  assert.equal(images[2].loading,'lazy');
  assert.equal(images[2].fetchpriority,undefined);
  assert.equal(images[3].loading,'lazy');
  assert.ok(result.includes('<p>Machining guidance</p>'));
  assert.equal(applyArticleImagePolicy(result,'/blog/brass-cnc-machining'),result);
  assert.equal(applyArticleImagePolicy(source,'/blog/page/2'),source);
});

test('reviewed descriptions are complete and consistent in search and social tags', () => {
  for(const [route,description] of Object.entries(seoRepairDescriptions)){
    assert.ok(!/\b(?:and|or|with|for|including)[,.]?$/i.test(description),route);
    const html='<html><head><meta name="description" content="Old summary, and."><meta property="og:description" content="Old summary, and."></head><body><h1>Page</h1></body></html>';
    const result=applyPageSeoTemplate(html,route), descriptions=[];
    walkSync(parse(result),n=>{if(n.name==='meta'&&(n.attributes.name==='description'||n.attributes.property==='og:description'))descriptions.push(decodeHTML(n.attributes.content));});
    assert.deepEqual(descriptions,[description,description],route);
  }
});
