import test from 'node:test';
import assert from 'node:assert/strict';
import {archivePage} from '../src/lib/archivePage.mjs';
import {getReviewedSeo} from '../src/data/pageSeoOverrides.mjs';
import {titleBrandOverrides} from '../src/data/titleBrandOverrides.mjs';
import {getBlogArticles} from '../src/blog-archive.mjs';
import {getBlogDetailEntries,getBlogAuthor} from '../src/blog-detail-native.mjs';
import fs from 'node:fs';
import {blogCategories,blogCategoryFor,blogCategoryCounts,validateBlogCategories} from '../src/data/blogCategories.mjs';
import {breadcrumbSchema} from '../src/data/pageSeoTemplate.mjs';

const posts=Array.from({length:31},(_,index)=>({slug:`post-${index}`,authorSlug:index<22?'david-li':'ryan-wang'}));
test('native editorial articles participate in discovery with complete author and detail metadata',()=>{
  const entry=getBlogDetailEntries({}).find(post=>post.slug==='what-is-automation-equipment');
  assert.ok(getBlogArticles({}).some(post=>post.slug===entry.slug));
  assert.equal(entry.detail.slug,entry.slug);
  assert.equal(getBlogAuthor(entry.authorSlug).name,'Zora');
  assert.equal(entry.detail.faqs.length,6);
  assert.equal(entry.detail.tocItems.length,8);
  assert.equal((entry.detail.articleHtml.match(/<table\b/g)||[]).length,3);
  assert.equal((entry.detail.articleHtml.match(/<img\b/g)||[]).length,4);
  assert.equal((entry.detail.articleHtml.match(/href="\/industries\/automation-equipment"/g)||[]).length,1);
  assert.match(entry.detail.articleHtml,/>custom machined parts<\/a>/);
  assert.doesNotMatch(entry.detail.articleHtml,/Publishing notes|Primary keyword|Meta description|\\text\{/);
});
test('Native archives preserve slice order, independent author filtering and canonical pagination',()=>{
  const blog=archivePage(posts,{page:2});assert.deepEqual(blog.posts,posts.slice(9,18));assert.equal(blog.previous,'/blog');assert.equal(blog.next,'/blog/page/3');
  const author=archivePage(posts,{page:3,authorSlug:'david-li',authorName:'David Li'});assert.deepEqual(author.posts,posts.slice(18,22));assert.equal(author.previous,'/author/david-li/page/2');assert.equal(author.next,'');
  const ryan=archivePage(posts,{authorSlug:'ryan-wang',authorName:'Ryan Wang'});assert.deepEqual(ryan.posts,posts.slice(22));assert.equal(ryan.next,'');
  for(const page of [0,-1,1.5,5])assert.throws(()=>archivePage(posts,{page}));
});

test('SPM guide preserves its distinct metadata and one commercial contextual anchor',()=>{
  const entry=getBlogDetailEntries({}).find(post=>post.slug==='spm-machined-vs-bought-parts');
  assert.ok(getBlogArticles({}).some(post=>post.slug===entry.slug));
  assert.match(entry.detail.title,/^SPM Parts: What Is Machined vs Bought/);
  assert.match(entry.detail.articleTitle,/^Special Purpose Machines \(SPM\)/);
  assert.equal(entry.detail.faqs.length,6);
  assert.equal((entry.detail.articleHtml.match(/<table\b/g)||[]).length,2);
  assert.equal((entry.detail.articleHtml.match(/<img\b/g)||[]).length,3);
  assert.equal((entry.detail.articleHtml.match(/href="\/industries\/automation-equipment"/g)||[]).length,1);
  assert.match(entry.detail.articleHtml,/>machined to drawing<\/a>/);
  assert.match(entry.detail.articleHtml,/href="\/blog\/what-is-automation-equipment"/);
  assert.doesNotMatch(entry.detail.articleHtml,/Publishing notes|Primary keyword|Keyword split/);
});
test('All reviewed titles retain the brand suffix without discarding existing descriptions',()=>{
  assert.equal(Object.keys(titleBrandOverrides).length,25);
  for(const [route,title]of Object.entries(titleBrandOverrides)){assert.ok(title.endsWith(' | CNCPioneer'),route);assert.equal(getReviewedSeo(route).title,title);}
  assert.match(getReviewedSeo('/author/ryan-wang').description,/Swiss/);
});

test('six blog categories cover every live article once and retain the reviewed counts',()=>{
  const sources={};
  for(const slug of fs.readdirSync('src/mirrored-pages/blog')){
    const file=`src/mirrored-pages/blog/${slug}/index.html`;
    if(fs.existsSync(file))sources[file]=fs.readFileSync(file,'utf8');
  }
  const articles=getBlogArticles(sources);
  validateBlogCategories(articles);
  assert.equal(articles.length,90);
  assert.deepEqual(blogCategoryCounts(articles).map(category=>category.count),[20,19,12,6,23,10]);
  const seen=new Set();
  for(const category of blogCategories){
    const first=archivePage(articles,{categoryId:category.id});
    const actual=[];
    for(let page=1;page<=first.lastPage;page++){
      const model=archivePage(articles,{categoryId:category.id,page});
      assert.equal(model.route,category.href+(page===1?'':`/page/${page}`));
      assert.ok(model.posts.every(post=>blogCategoryFor(post.slug).id===category.id));
      assert.ok(model.title.endsWith(' | CNCPioneer'));
      for(const post of model.posts){assert.ok(!seen.has(post.slug),post.slug);seen.add(post.slug);actual.push(post.slug);}
    }
    assert.equal(actual.length,first.total);
  }
  assert.equal(seen.size,articles.length);
  assert.throws(()=>validateBlogCategories([...articles,{slug:'unclassified-new-post'}]));
  assert.throws(()=>archivePage(articles,{categoryId:'missing'}));
});

test('category pagination breadcrumbs retain the category parent',()=>{
  const crumbs=breadcrumbSchema('/blog/category/materials/page/2','Materials — Page 2').itemListElement;
  assert.deepEqual(crumbs.map(item=>item.name),['Home','Blog','Materials','Page 2']);
  assert.equal(crumbs[2].item,'https://www.cncpioneer.com/blog/category/materials');
});
