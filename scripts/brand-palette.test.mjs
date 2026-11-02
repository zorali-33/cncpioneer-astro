import {test} from 'node:test';
import assert from 'node:assert/strict';
import {normalizeStylesheet,applyBrandTheme} from '../src/brand-palette.mjs';

test('colours are normalized without changing URLs, text, selectors or geometry',()=>{
  const css='.red{color:red;background:url("/assets/red#fff.webp") #fafafa;margin:12px;content:"red #fff"}';
  const result=normalizeStylesheet(css);
  assert.match(result,/color:var\(--color-brand\)/);
  assert.match(result,/url\("?\/assets\/red#fff.webp"?\)/);
  assert.match(result,/margin:12px/);
  assert.match(result,/content:"red #fff"/);
  assert.equal(normalizeStylesheet(result),result);
});
test('inline styles, style blocks, SVG and theme injection preserve document meaning',()=>{
  const html='<html><head><style>h1{color:#16163f}</style><script type="application/ld+json">{"name":"red #fff"}</script></head><body><p style="color:red;background:url(&quot;/red.webp&quot;)">Red #fff</p><svg><path fill="#00aaaa" d="M1 2" /></svg></body></html>';
  const result=applyBrandTheme(html);
  assert.match(result,/h1\{color:var\(--color-ink\)\}/);
  assert.match(result,/color:var\(--color-brand\)/);
  assert.match(result,/fill="var\(--color-brand\)"/);
  assert.match(result,/Red #fff/);
  assert.match(result,/\{"name":"red #fff"\}/);
  assert.equal((result.match(/id="cncpioneer-brand-theme"/g)||[]).length,1);
  assert.equal(applyBrandTheme(result),result);
});
