import assert from 'node:assert/strict';
import {test} from 'node:test';
import fs from 'node:fs/promises';
import path from 'node:path';
import {parse, walkSync, ELEMENT_NODE} from 'ultrahtml';
import {addArchiveContentTarget, repairBlogLinkIds, repairBlogMedia} from '../src/blog-link-repairs.mjs';
import {applyImageDimensions} from '../src/image-layout.mjs';

test('archive content is a single main landmark and retains the real footer',()=>{
  const original='<html><body><header>Menu</header><footer data-elementor-type="archive" class="elementor-location-archive"><div>Cards</div></footer><footer data-elementor-type="footer">Contact</footer></body></html>';
  const result=addArchiveContentTarget(original);
  assert.equal((result.match(/<main\b/g)||[]).length,1);
  assert.match(result,/<main[^>]*id="content"[^>]*>.*Cards.*<\/main>/);
  assert.match(result,/<footer data-elementor-type="footer">Contact<\/footer>/);
  assert.equal(addArchiveContentTarget(result),result);
});

test('URL-shaped citation IDs are removed without changing links or reference targets',()=>{
  const original='<p><a id="/blog/part#ref01" href="/blog/part#ref01">[1]</a><a href="/blog/part#ref01" id="/blog/part#ref01">[1]</a></p><p id="ref01">Reference</p><a id="back-to-notes" href="#ref01">Notes</a>';
  const result=repairBlogLinkIds(original);
  assert.equal((result.match(/href="\/blog\/part#ref01"/g)||[]).length,2);
  assert.ok(!result.includes('id="/blog/part#ref01"'));
  assert.ok(result.includes('<p id="ref01">Reference</p>'));
  assert.ok(result.includes('id="back-to-notes"'));
});

test('image dimensions reserve the real ratio, preserve CSS and skip external or missing files',async()=>{
  const directory=path.resolve('public/__layout-test');
  await fs.mkdir(directory,{recursive:true});
  const file=path.join(directory,'part.svg');
  try {
    await fs.writeFile(file,'<svg xmlns="http://www.w3.org/2000/svg" width="80" height="40"></svg>');
    const original='<html><body><img src="/__layout-test/part.svg" style="object-fit:contain" loading="lazy"><img src="/__layout-test/part.svg" width="160"><img src="https://example.com/a.jpg"><img src="/missing.jpg"><script>const template="<img src=\'/x\'>";</script></body></html>';
    const result=await applyImageDimensions(original), images=[];
    walkSync(parse(result),node=>{if(node.type===ELEMENT_NODE && node.name==='img')images.push(node.attributes);});
    assert.deepEqual([images[0].width,images[0].height],['80','40']);
    assert.equal(images[0].style,'object-fit:contain');
    assert.equal(images[0].loading,'lazy');
    assert.deepEqual([images[1].width,images[1].height],['160','80']);
    assert.equal(images[2].width,undefined);
    assert.equal(images[3].width,undefined);
    assert.ok(result.includes('<script>const template="<img src=\'/x\'>";</script>'));
    assert.equal(await applyImageDimensions(result),result);
  } finally {
    await fs.unlink(file);
    await fs.rmdir(directory);
  }
});

test('reviewed blog media repairs preserve content around unavailable external images',()=>{
  const original='<p>Section introduction</p><figure class="wp-block-image"><img src="https://ultramachining.com/a.webp"><noscript><img src="https://ultramachining.com/a.webp"></noscript></figure><p>Section conclusion</p>';
  const result=repairBlogMedia(original,'cnc-milling-and-turning-defense');
  assert.ok(!result.includes('ultramachining.com'));
  assert.match(result,/src="\/wp-content\/uploads\/2026\/02\/5-axis-CNC-machine.jpg"/);
  assert.ok(result.startsWith('<p>Section introduction</p>'));
  assert.ok(result.endsWith('<p>Section conclusion</p>'));
  assert.equal(repairBlogMedia(result,'cnc-milling-and-turning-defense'),result);
});
