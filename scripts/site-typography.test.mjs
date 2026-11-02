import {test} from 'node:test';
import assert from 'node:assert/strict';
import {normalizeFontShorthand,headingType,typographyRole} from '../src/site-typography.mjs';
import {normalizeStylesheet,applyBrandTheme} from '../src/brand-palette.mjs';

test('font shorthand keeps weights, responsive sizes, styles and line heights',()=>{
  for(const [value,expected]of [
    ['400 15px/1.5 Poppins, Arial, sans-serif','400 15px/1.5 var(--font-sans)'],
    ['600 clamp(27px,3.6vw,40px)/1.25 Poppins,Arial,sans-serif','600 clamp(27px,3.6vw,40px)/1.25 var(--font-sans)'],
    ['italic 500 1rem/1.6 "Roboto Slab",Georgia,serif','italic 500 1rem/1.6 var(--font-sans)'],
    ['24px/1 Arial,sans-serif','24px/1 var(--font-sans)'],
    ['inherit','inherit'],
  ]){assert.equal(normalizeFontShorthand(value),expected);assert.equal(normalizeFontShorthand(expected),expected);}
});
test('family normalization covers inline HTML and removes retired font loads without changing copy',()=>{
  const html='<html><head><link rel="preconnect" href="https://fonts.gstatic.com" /><link href="https://fonts.googleapis.com/css2?family=Poppins" rel="stylesheet" /><style>p{font-family:"Archivo",serif;font-size:16px}a{font:600 14px/1.4 Arial}</style><script type="application/ld+json">{"name":"Archivo Roboto Slab"}</script></head><body><p style="font-family:Georgia;font-size:14px"><font face="Poppins">Keep these words</font></p></body></html>';
  const result=applyBrandTheme(html);
  assert.doesNotMatch(result,/fonts\.(?:googleapis|gstatic)\.com/);
  assert.match(result,/font-family:var\(--font-sans\);font-size:16px/);
  assert.match(result,/font:500 14px\/1.4 var\(--font-sans\)/);
  assert.match(result,/face="Inter">Keep these words/);
  assert.match(result,/\{"name":"Archivo Roboto Slab"\}/);
  assert.equal((result.match(/id="cncpioneer-font-preload"/g)||[]).length,1);
  assert.equal(applyBrandTheme(result),result);
  assert.equal(normalizeStylesheet('p{font-family:Roboto}'),'p{font-family:var(--font-sans)}');
});

test('scoped heading declarations use responsive shared sizes while compact labels retain their size',()=>{
  const result=normalizeStylesheet('.home-hero h1{font-size:58px;line-height:1.12}.home-section h2{font-size:32px;font-weight:600}.article-content h2{font-size:28px}.site-footer h2{font-size:22px}.home-hero__eyebrow{font-size:14px;font-weight:500}p{font-family:Poppins;font-weight:300}');
  assert.match(result,/\.home-hero h1\{font-size:var\(--type-h1-home\)/);
  assert.match(result,/\.home-section h2\{font-size:var\(--type-h2\);font-weight:400/);
  assert.match(result,/\.article-content h2\{font-size:var\(--type-h2-article\)/);
  assert.match(result,/\.site-footer h2\{font-size:22px/);
  assert.match(result,/eyebrow\{font-size:var\(--type-label\);font-weight:500/);
  assert.match(result,/p\{font-family:var\(--font-sans\);font-weight:400/);
});

test('heading ancestors and excluded eyebrow classes do not misclassify body copy',()=>{
  assert.equal(headingType('.hero h1 + p'),null);
  assert.equal(typographyRole('.home-hero__copy > p:not(.home-hero__eyebrow)'),null);
  assert.equal(typographyRole('.faq-list details summary'),'faq-question');
  assert.equal(typographyRole('.faq-list details p'),'faq-answer');
  const source='h2,p{font-family:Roboto;font-size:20px;font-weight:700}.section-kicker{font-family:Arial;font-size:16px}';
  const result=normalizeStylesheet(source);
  assert.match(result,/h2\{font-family:var\(--font-heading\);font-size:var\(--type-h2\);font-weight:400/);
  assert.match(result,/p\{font-family:var\(--font-sans\);font-size:20px;font-weight:500/);
  assert.match(result,/section-kicker\{font-family:var\(--font-mono\);font-size:var\(--type-label\)/);
  assert.equal(normalizeStylesheet(result),result);
});
