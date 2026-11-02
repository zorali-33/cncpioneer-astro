import assert from 'node:assert/strict';
import {test} from 'node:test';
import {productContent} from '../src/data/productContent.mjs';
import {overviewHeadingCorrections} from '../src/data/productEditorialCorrections.mjs';
import {applySpellingCorrections} from '../src/data/spellingCorrections.mjs';

test('generated product data retains all reviewed headings and correct 17-4PH material statements',()=>{
 assert.equal(Object.keys(overviewHeadingCorrections).length,20);
 for(const [slug,title] of Object.entries(overviewHeadingCorrections)){
  assert.ok(productContent[slug].overviewPoints.some(point=>point.title===title),slug);
  assert.ok(!productContent[slug].overviewPoints.some(point=>point.title==='40'),slug);
 }
 for(const slug of ['bearing-housing','industrial-robot-arms']){
  const card=productContent[slug].materials.find(material=>/17-4PH/.test(material.title));
  assert.match(card.text,/\bMagnetic\b/);
  assert.ok(!/non[ -]magnetic/i.test(JSON.stringify(card)));
 }
});

test('spelling corrections preserve fragment URLs and keep FAQ markup consistent',()=>{
 const route='/blog/oil-gas-cnc-machining-parts';
 const source='<h2 id="section-7-quality-control-sta-n-dards"><strong>Quality Control Sta</strong>n<strong>dards</strong></h2><a href="#section-7-quality-control-sta-n-dards">Quality Control Sta n dards</a>';
 const result=applySpellingCorrections(source,route);
 assert.ok(result.includes('id="section-7-quality-control-sta-n-dards"'));
 assert.ok(result.includes('href="#section-7-quality-control-sta-n-dards"'));
 assert.ok(!result.includes('Sta n dards'));
 assert.equal(applySpellingCorrections(result,route),result);
 const faq='<h3>What is Koval Precision Machining Technology</h3><script type="application/ld+json">{"name":"What is Koval Precision Machining Technology"}</script>';
 assert.ok(!applySpellingCorrections(faq,'/materials/kovar-cnc-machining').includes('Koval'));
 const poly='<p>olycarbonate CNC Machining is suitable.</p>';
 const fixed=applySpellingCorrections(poly,'/materials/polycarbonate-cnc-machining');
 assert.equal(fixed,'<p>Polycarbonate CNC Machining is suitable.</p>');
 assert.equal(applySpellingCorrections(fixed,'/materials/polycarbonate-cnc-machining'),fixed);
 assert.equal(applySpellingCorrections(poly,'/other-page'),poly);
 assert.equal(applySpellingCorrections('<p>Our experts are here for you!.</p>','/materials'),'<p>Our experts are here for you!</p>');
 assert.equal(applySpellingCorrections('<p>Nylon Machining &#8211; Tips For Beginners!. It shows the process.</p>','/blog/nylon-cnc-machining'),'<p>Nylon Machining &#8211; Tips For Beginners! It shows the process.</p>');
 assert.equal(applySpellingCorrections('<a href="/blog/cnc-milling">What is CNC Milling?</a>.','/blog/what-is-a-cnc-lathe'),'<a href="/blog/cnc-milling">What is CNC Milling?</a>');
});
