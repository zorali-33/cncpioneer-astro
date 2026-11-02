import assert from 'node:assert/strict';
import { test } from 'node:test';
import { applySiteSchema, ORGANIZATION_ID, WEBSITE_ID } from '../src/data/siteSchema.mjs';
import { applyPageSeoTemplate } from '../src/data/pageSeoTemplate.mjs';
import { createArticleSchema } from '../src/data/articleSchema.mjs';

const script = (data) => '<script type="application/ld+json">' + JSON.stringify(data) + '</script>';
const html = (body, schema = [], meta = '') => '<html><head><meta name="description" content="Made to your drawing.">' + meta + schema.map(script).join('') + '</head><body>' + body + '</body></html>';
const transform = (source, route) => applySiteSchema(applyPageSeoTemplate(source, route), route);
const document = (source) => JSON.parse(source.match(/<script type="application\/ld\+json" data-site-schema>([\s\S]*?)<\/script>/)[1]);
const graph = (source) => document(source)['@graph'];
const node = (source, type) => graph(source).find((n) => [].concat(n['@type']).includes(type));

test('homepage defines site and organization identity; service pages reference them without offers', () => {
  const home = transform(html('<h1>Precision CNC Machining</h1>'), '/');
  assert.equal(node(home, 'Organization')['@id'], ORGANIZATION_ID);
  assert.equal(node(home, 'WebSite')['@id'], WEBSITE_ID);
  assert.equal(node(home, 'Organization').telephone, '+8613725562746');
  assert.equal(node(home, 'WebPage').url, 'https://www.cncpioneer.com/');
  assert.equal(node(home, 'BreadcrumbList'), undefined);
  const product = transform(html('<h1>Custom Brass<br>Flange Bushing</h1><img class="hero-img" src="/wp-content/uploads/part.webp">'), '/custom-cnc-parts/brass-flange-bushing');
  const service = node(product, 'Service');
  assert.equal(service.name, 'Custom Brass Flange Bushing');
  assert.equal(service.provider['@id'], ORGANIZATION_ID);
  assert.equal(service.image, 'https://www.cncpioneer.com/wp-content/uploads/part.webp');
  assert.equal(service.offers, undefined); assert.equal(service.aggregateRating, undefined);
  assert.equal(node(product, 'Organization'), undefined);
  assert.equal(node(product, 'WebPage').mainEntity['@id'], service['@id']);
});

test('existing article dates, contributors and headline survive consolidation', () => {
  const article = createArticleSchema({ canonical:'/blog/swiss-machining', articleTitle:'Swiss Machining Guide', description:'Guide', image:'/wp-content/uploads/guide.jpg', publishedTime:'2026-01-02T09:00:00+08:00' }, { name:'Ryan Wang', href:'/author/ryan-wang' }, [{ name:'David Li', href:'/author/david-li' }]);
  const result = transform(html('<h1>Swiss Machining Guide</h1>', [article]), '/blog/swiss-machining');
  const emitted = node(result, 'BlogPosting');
  assert.equal(emitted.datePublished, article.datePublished);
  assert.equal(emitted.dateModified, article.dateModified);
  assert.equal(emitted.headline, article.headline);
  assert.equal(emitted.author['@id'], 'https://www.cncpioneer.com/author/ryan-wang#person');
  assert.deepEqual(emitted.contributor, article.contributor);
  assert.equal(emitted.mainEntityOfPage['@id'], node(result, 'WebPage')['@id']);
  assert.equal((result.match(/application\/ld\+json/g) || []).length, 1);
});

test('FAQ groups merge without losing answers or generating multiple page identities', () => {
  const question = (name) => ({ '@type':'Question', name, acceptedAnswer:{ '@type':'Answer', text:'Existing answer.' } });
  const faq = (name) => ({ '@context':'https://schema.org', '@type':'FAQPage', mainEntity:[question(name)] });
  const result = transform(html('<h1>FAQ</h1><p>Questions</p>', [faq('First?'),faq('Second?'),faq('First?')]), '/resources/faqs');
  assert.equal(graph(result).filter(n=>n['@type']==='FAQPage').length,1);
  assert.equal(node(result,'FAQPage').mainEntity.length,2);
  assert.deepEqual(node(result,'FAQPage').mainEntity.map(q=>q.name),['First?','Second?']);
});

test('author identity is shared across pagination and company sameAs is removed', () => {
  const person={ '@type':'Person', name:'Ryan Wang', url:'/author/ryan-wang', sameAs:['http://www.cncpioneer.com'] };
  const root=transform(html('<h1>Ryan Wang</h1>',[[person]]),'/author/ryan-wang');
  assert.equal(node(root,'Person').sameAs,undefined);
  assert.equal(node(root,'Person').worksFor['@id'],ORGANIZATION_ID);
  assert.equal(node(root,'ProfilePage').mainEntity['@id'],node(root,'Person')['@id']);
  const archive=transform(html('<h1>Ryan Wang</h1><h3><a href="/blog/swiss-machining">Swiss Machining</a></h3>',[[person]]),'/author/ryan-wang/page/2');
  assert.equal(node(archive,'Person')['@id'],node(root,'Person')['@id']);
  assert.equal(node(archive,'CollectionPage').about['@id'],node(root,'Person')['@id']);
  assert.equal(node(archive,'ItemList').itemListElement[0].url,'https://www.cncpioneer.com/blog/swiss-machining');
});

test('catalog pagination retains total count and positions and transformations are idempotent', () => {
  const route='/custom-cnc-parts/page/2';
  const catalog={ '@type':'CollectionPage', name:'Parts', mainEntity:{ '@type':'ItemList',numberOfItems:147,itemListElement:[{'@type':'ListItem',position:25,name:'Example',url:'/custom-cnc-parts/example'}] }};
  const first=transform(html('<h1>Parts</h1>',[catalog]),route);
  const second=transform(first,route);
  assert.equal(node(second,'ItemList').numberOfItems,147);
  assert.equal(node(second,'ItemList').itemListElement[0].position,25);
  assert.deepEqual(graph(second),graph(first));
  assert.equal(graph(second).filter(n=>n['@type']==='BreadcrumbList').length,1);
});

test('collection lists use content links rather than header/footer or unrelated links', () => {
  const source=html('<header><a href="/materials/steel">Header Steel</a></header><h1>Materials</h1><main><a href="/materials/copper">Copper</a><a href="/materials/copper">Duplicate</a><a href="/blog/example">Article</a></main><footer><a href="/materials/bronze">Footer Bronze</a></footer>');
  const result=transform(source,'/materials');
  assert.deepEqual(node(result,'ItemList').itemListElement.map(i=>i.name),['Copper']);
});

test('legacy blog archive footer wrappers remain eligible as visible list content', () => {
  const source=html('<h1>Blog</h1><footer data-elementor-type="archive" class="elementor-location-archive"><a href="/blog/swiss-machining"><img src="/image.jpg"></a><h4><a href="/blog/swiss-machining">Swiss Machining</a></h4></footer><footer data-elementor-type="footer"><h4><a href="/blog/unrelated">Unrelated</a></h4></footer>');
  const result=transform(source,'/blog/page/2');
  assert.deepEqual(node(result,'ItemList').itemListElement.map(i=>i.name),['Swiss Machining']);
});

test('ordinary content and scripts are preserved; hostile strings stay inside JSON-LD', () => {
  const body='<h1>A &lt;/script&gt; &amp; B</h1><style>.x{color:red}</style><script>const s = "unchanged";</script><form action="/quote"><input name="drawing"></form>';
  const original=html(body);
  const result=transform(original,'/materials/example');
  assert.ok(result.includes(body));
  assert.equal(node(result,'Service').name,'A </script> & B');
  assert.ok(result.includes('\\u003c/script>'));
  const sourceNoLd=result.replace(/<script type="application\/ld\+json" data-site-schema>[\s\S]*?<\/script>\n/,'');
  assert.ok(sourceNoLd.includes('<script>const s = "unchanged";</script>'));
});

test('no schema is added to noindex, HTML redirects, or retired paths', () => {
  for (const [route,meta] of [['/search','<meta name="robots" content="noindex, follow">'],['/old','<meta http-equiv="refresh" content="0;url=/">'],['/custom-cnc-parts/evtol-bearing-housing','']]) {
    const source=html('<h1>Excluded</h1>',[],meta);
    assert.equal(applySiteSchema(source,route),source);
  }
});

