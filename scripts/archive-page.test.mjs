import test from 'node:test';
import assert from 'node:assert/strict';
import {archivePage} from '../src/lib/archivePage.mjs';
import {getReviewedSeo} from '../src/data/pageSeoOverrides.mjs';
import {titleBrandOverrides} from '../src/data/titleBrandOverrides.mjs';

const posts=Array.from({length:31},(_,index)=>({slug:`post-${index}`,authorSlug:index<22?'david-li':'ryan-wang'}));
test('Native archives preserve slice order, independent author filtering and canonical pagination',()=>{
  const blog=archivePage(posts,{page:2});assert.deepEqual(blog.posts,posts.slice(9,18));assert.equal(blog.previous,'/blog');assert.equal(blog.next,'/blog/page/3');
  const author=archivePage(posts,{page:3,authorSlug:'david-li',authorName:'David Li'});assert.deepEqual(author.posts,posts.slice(18,22));assert.equal(author.previous,'/author/david-li/page/2');assert.equal(author.next,'');
  const ryan=archivePage(posts,{authorSlug:'ryan-wang',authorName:'Ryan Wang'});assert.deepEqual(ryan.posts,posts.slice(22));assert.equal(ryan.next,'');
  for(const page of [0,-1,1.5,5])assert.throws(()=>archivePage(posts,{page}));
});
test('All reviewed titles retain the brand suffix without discarding existing descriptions',()=>{
  assert.equal(Object.keys(titleBrandOverrides).length,25);
  for(const [route,title]of Object.entries(titleBrandOverrides)){assert.ok(title.endsWith(' | CNCPioneer'),route);assert.equal(getReviewedSeo(route).title,title);}
  assert.match(getReviewedSeo('/author/ryan-wang').description,/Swiss/);
});
