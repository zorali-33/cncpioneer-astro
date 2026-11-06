import {postsPerPage} from '../blog-archive.mjs';
import {getAuthorPostsPerPage} from '../author-archive.mjs';
import {getReviewedSeo} from '../data/pageSeoOverrides.mjs';
import {blogCategoryById,blogCategoryFor} from '../data/blogCategories.mjs';

export function archivePage(articles,{page=1,authorSlug='',authorName='',categoryId=''}={}) {
  const category=categoryId?blogCategoryById(categoryId):null;
  if(categoryId&&!category)throw new Error('Unknown blog category');
  if(category&&authorSlug)throw new Error('Choose a category or an author archive');
  const selected=category?articles.filter(post=>blogCategoryFor(post.slug)?.id===category.id):authorSlug?articles.filter(post=>post.authorSlug===authorSlug):articles;
  const perPage=authorSlug?getAuthorPostsPerPage(authorSlug):postsPerPage;
  const lastPage=Math.ceil(selected.length/perPage);
  if(!Number.isInteger(page)||page<1||page>lastPage)throw new Error('Invalid archive page');
  const base=category?category.href:authorSlug?`/author/${authorSlug}`:'/blog';
  const href=number=>number===1?base:`${base}/page/${number}`;
  const route=href(page);
  const reviewed=getReviewedSeo(route);
  const title=reviewed.title||(category?`${category.title}${page>1?` – Page ${page}`:''} | CNCPioneer`:authorSlug?`${authorName}${page>1?` Articles – Page ${page} of ${lastPage}`:' CNC Machining Articles'} | CNCPioneer`:`CNC Machining Blog${page>1?` – Page ${page}`:''} | CNCPioneer`);
  const description=reviewed.description||(category?`${category.description}${page>1?` Browse page ${page} of ${lastPage}.`:''}`:authorSlug?`Read CNC machining articles by ${authorName} on Swiss machining, turning and milling, materials, and component design. Browse page ${page} of the article archive.`:`Browse page ${page} of CNCPioneer’s CNC machining blog. Explore more guides to processes, materials, component design, and inspection.`);
  return {page,lastPage,route,href,category,total:selected.length,posts:selected.slice((page-1)*perPage,page*perPage),title,description,previous:page>1?href(page-1):'',next:page<lastPage?href(page+1):''};
}
