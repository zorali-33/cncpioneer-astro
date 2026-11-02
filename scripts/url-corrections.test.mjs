import assert from 'node:assert/strict';
import {test} from 'node:test';
import {applyReviewedUrlCorrections,ASME_Y145,SAE_AS9102C} from '../src/data/urlCorrections.mjs';

test('reviewed external replacements retain citation IDs and remove the unsupported market claim',()=>{
 const source='<p>Aerospace and defense demand the highest levels of precision. The sector is growing at 15–18% annually. <a href="/blog/cnc-turned-parts#ref05">[5]</a></p><p id="ref05">[5] Fact.MR. <a href="https://www.factmr.com/report/aerospace-cnc-machining-market">Old source</a></p>';
 const result=applyReviewedUrlCorrections(source,'/blog/cnc-turned-parts');
 assert.ok(result.includes('id="ref05"'));
 assert.ok(result.includes('href="/blog/cnc-turned-parts#ref05"'));
 assert.ok(result.includes(SAE_AS9102C));
 assert.ok(!/15–18|factmr\.com|Fact\.MR/.test(result));
 assert.equal(applyReviewedUrlCorrections(result,'/blog/cnc-turned-parts'),result);
});

test('the locating-pin citation uses the standard named in its text and stays scoped to its page',()=>{
 const original='<p id="ref02">[2] Mner. <a href="https://mner.net/wp-content/uploads/2024/08/Technical-Drawing-for-Product-Design.pdf">Old reference</a></p>';
 const result=applyReviewedUrlCorrections(original,'/blog/cnc-locating-pins');
 assert.ok(result.includes('id="ref02"'));
 assert.ok(result.includes(ASME_Y145));
 assert.ok(!result.includes('mner.net'));
 assert.equal(applyReviewedUrlCorrections(original,'/blog/other'),original);
});
