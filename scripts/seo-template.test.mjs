import assert from 'node:assert/strict';
import { test } from 'node:test';
import { normalizeInternalHref, canonicalPageUrl } from '../src/data/siteUrls.mjs';
import { getPageModifiedTime } from '../src/data/pageDates.mjs';
import { applyPageSeoTemplate, breadcrumbSchema } from '../src/data/pageSeoTemplate.mjs';
import { createArticleSchema, jsonLd } from '../src/data/articleSchema.mjs';

test('page identities and navigation preserve URL semantics', () => {
  assert.equal(canonicalPageUrl('http://cncpioneer.com/blog/page/3/?x=1#test'), 'https://www.cncpioneer.com/blog/page/3');
  assert.equal(normalizeInternalHref('https://cncpioneer.com/blog/precision-medical-machining/?x=1#tolerances'), '/blog/medical-cnc-machining?x=1#tolerances');
  assert.equal(normalizeInternalHref('//www.cncpioneer.com/blog/'), '/blog');
  assert.equal(normalizeInternalHref('http://127.0.0.1:4321/materials/'), '/materials');
  assert.equal(normalizeInternalHref('/blog/index.html'), '/blog');
  assert.equal(normalizeInternalHref('?s=steel', '/search'), '/search?s=steel');
  assert.equal(normalizeInternalHref('/blog/medical-swiss-machining'), '/industries/medical-swiss-machining');
  for (const value of ['https://example.com/blog/', '//example.com/blog/', 'mailto:info@cncpioneer.com', 'tel:+8613725562746', '#steel', '/wp-content/uploads/a.jpg?size=2', '/files/drawing.step', '/blog/a/feed/']) assert.equal(normalizeInternalHref(value), value);
});

test('dates use an explicit content record, with no synthetic date for unknown pages', () => {
  assert.equal(getPageModifiedTime('/about-us', '2026-03-27T05:45:23+00:00'), '2026-10-27');
  assert.equal(getPageModifiedTime('/unrecorded-page'), undefined);
  assert.equal(getPageModifiedTime('/unrecorded-page', 'bad'), undefined);
  assert.equal(getPageModifiedTime('/blog/swiss-machining', '2026-10-23T00:00:00+08:00'), '2026-10-23');
  assert.equal(getPageModifiedTime('/unrecorded-page', '2026-09-10'), '2026-09-10');
});

test('HTML transformations do not edit scripts, styles, downloads or asset URLs', () => {
  const script = '<script>const sample = `<a href="https://www.cncpioneer.com/blog/">example</a>`;</script>';
  const style = '<style>.a:after{content:"<a href=\'/blog/\'>"}</style>';
  const download = '<a download href="https://www.cncpioneer.com/download/">Download</a>';
  const original = '<html><head><link rel="canonical" href="/blog/"><meta property="og:url" content="/blog/">' + script + style + '</head><body><h1>Blog &amp; News</h1><a href="https://www.cncpioneer.com/materials/?x=1&amp;y=2#copper">Materials</a>' + download + '<img src="/wp-content/uploads/part.jpg"></body></html>';
  const result = applyPageSeoTemplate(original, '/blog/');
  assert.ok(result.includes(script)); assert.ok(result.includes(style)); assert.ok(result.includes(download));
  assert.ok(result.includes('href="/materials?x=1&amp;y=2#copper"'));
  assert.ok(result.includes('<img src="/wp-content/uploads/part.jpg">'));
  assert.equal((result.match(/"@type":"BreadcrumbList"/g) || []).length, 1);
  assert.equal((applyPageSeoTemplate(result, '/blog').match(/"@type":"BreadcrumbList"/g) || []).length, 1);
  assert.ok(!applyPageSeoTemplate('<html><head><meta name="robots" content="noindex"></head><body><h1>Search</h1></body></html>', '/search').includes('BreadcrumbList'));
  assert.ok(!applyPageSeoTemplate('<html><head><meta http-equiv="refresh" content="0;url=/blog"></head></html>', '/old').includes('BreadcrumbList'));
});

test('breadcrumb hierarchy and Article fields match real pages and authors', () => {
  const crumbs = breadcrumbSchema('/blog/page/3', 'Blog').itemListElement;
  assert.deepEqual(crumbs.map((x) => x.name), ['Home', 'Blog', 'Page 3']);
  assert.deepEqual(crumbs.map((x) => x.position), [1, 2, 3]);
  assert.equal(breadcrumbSchema('/', 'Home'), null);
  assert.equal(breadcrumbSchema('/author/david-li/page/2', 'David Li').itemListElement[1].item, 'https://www.cncpioneer.com/author/david-li');
  const schema = createArticleSchema({ canonical:'/blog/swiss-machining', articleTitle:'Swiss Machining', description:'Guide', image:'/wp-content/uploads/a.jpg', publishedTime:'2026-01-01T12:00:00+00:00', modifiedTime:'2026-10-23T00:00:00+08:00' }, { name:'Ryan Wang', href:'/author/ryan-wang' }, [{ name:'David Li', href:'/author/david-li' }]);
  assert.equal(schema.author.url, 'https://www.cncpioneer.com/author/ryan-wang');
  assert.equal(schema.contributor[0].name, 'David Li');
  assert.equal(schema.datePublished, '2026-01-01T12:00:00+00:00');
  assert.ok(!jsonLd({ headline:'</script><script>alert(1)</script>' }).includes('<'));
});
