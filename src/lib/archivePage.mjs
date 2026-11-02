import {postsPerPage} from '../blog-archive.mjs';
import {getAuthorPostsPerPage} from '../author-archive.mjs';
import {getReviewedSeo} from '../data/pageSeoOverrides.mjs';

export function archivePage(articles,{page=1,authorSlug='',authorName=''}={}) {
  const selected=authorSlug?articles.filter(post=>post.authorSlug===authorSlug):articles;
  const perPage=authorSlug?getAuthorPostsPerPage(authorSlug):postsPerPage;
  const lastPage=Math.ceil(selected.length/perPage);
  if(!Number.isInteger(page)||page<1||page>lastPage)throw new Error('Invalid archive page');
  const base=authorSlug?`/author/${authorSlug}`:'/blog';
  const href=number=>number===1?base:`${base}/page/${number}`;
  const route=href(page);
  const reviewed=getReviewedSeo(route);
  const title=reviewed.title||(authorSlug?`${authorName}${page>1?` Articles – Page ${page} of ${lastPage}`:' CNC Machining Articles'} | CNCPioneer`:`CNC Machining Blog${page>1?` – Page ${page}`:''} | CNCPioneer`);
  const description=reviewed.description||(authorSlug?`Read CNC machining articles by ${authorName} on Swiss machining, turning and milling, materials, and component design. Browse page ${page} of the article archive.`:`Browse page ${page} of CNCPioneer’s CNC machining blog. Explore more guides to processes, materials, component design, and inspection.`);
  return {page,lastPage,route,href,posts:selected.slice((page-1)*perPage,page*perPage),title,description,previous:page>1?href(page-1):'',next:page<lastPage?href(page+1):''};
}
