import {parse, walkSync, ELEMENT_NODE, TEXT_NODE} from 'ultrahtml';
import {decodeHTML, escapeAttribute} from 'entities';
import {breadcrumbSchema} from './pageSeoTemplate.mjs';
import {normalizePagePath, normalizeInternalHref, canonicalPageUrl, isRetiredPagePath} from './siteUrls.mjs';

const attr = (node,key) => decodeHTML(node.attributes?.[key] || '');
const text = node => node.type === TEXT_NODE ? node.value : node.name === 'br' ? ' ' : (node.children || []).map(text).join('');
const label = node => decodeHTML(text(node)).replace(/\s+/g,' ').trim();
const within = (node,parent) => {for(let ancestor=node.parent;ancestor;ancestor=ancestor.parent)if(ancestor===parent)return true;return false;};
const isCrumbContainer = node => ['nav','p','div','ol','ul'].includes(node.name)
  && /breadcrumb/i.test([attr(node,'class'),attr(node,'id'),attr(node,'aria-label')].join(' '));

// Keep template placement and outer attributes; standardize visible semantics.
export function applySiteBreadcrumbs(html,pathname) {
  const route=normalizePagePath(pathname);
  if(route==='/' || route==='/404' || isRetiredPagePath(route))return html;
  const nodes=[];
  walkSync(parse(html),node=>{if(node.type===ELEMENT_NODE)nodes.push(node);});
  const h1=nodes.find(node=>node.name==='h1');
  if(!h1)return html;
  const candidates=nodes.filter(isCrumbContainer);
  const containers=candidates.filter(node=>!candidates.some(child=>within(child,node)));
  const edits=[];
  const render=(currentLabel='',parents=[])=>{
    const crumbs=breadcrumbSchema(route,label(h1),currentLabel,parents).itemListElement;
    return crumbs.map((crumb,index)=>{
      const separator=index?'<span class="site-breadcrumb-separator" aria-hidden="true">/</span>':'';
      const content=index===crumbs.length-1
        ? `<span class="site-breadcrumb-current" aria-current="page">${escapeAttribute(crumb.name)}</span>`
        : `<a href="${escapeAttribute(new URL(crumb.item).pathname)}">${escapeAttribute(crumb.name)}</a>`;
      return separator+content;
    }).join('');
  };
  for(const container of containers) {
    if('data-site-breadcrumb-nav' in container.attributes || !container.loc?.[1])continue;
    const descendants=nodes.filter(node=>within(node,container));
    const explicit=descendants.find(node=>attr(node,'aria-current')==='page');
    const leafLabels=descendants.filter(node=>['span','a','strong'].includes(node.name)
      && !(node.children||[]).some(child=>child.type===ELEMENT_NODE)
      && !/^[\/›»>]+$/.test(label(node)) && label(node));
    const current=explicit || leafLabels.at(-1);
    const parents=descendants.filter(node=>node.name==='a' && label(node))
      .map(node=>({name:label(node),item:normalizeInternalHref(attr(node,'href'),route,true)}))
      .filter(crumb=>crumb.item.startsWith(canonicalPageUrl('/'))&&crumb.item!==canonicalPageUrl(route));
    let opening=html.slice(container.loc[0].start,container.loc[0].end);
    opening=opening.replace(/>$/,' data-site-breadcrumb-nav>');
    const inNav=container.name==='nav'||nodes.some(node=>node.name==='nav'&&within(container,node));
    if(!inNav)opening=opening.replace(/>$/,' role="navigation" aria-label="Breadcrumb">');
    edits.push({start:container.loc[0].start,end:container.loc[1].start,replacement:opening+render(current?label(current):'',parents)});
  }
  if(!containers.length) {
    const main=nodes.find(node=>node.name==='main');
    if(main)edits.push({start:main.loc[0].end,end:main.loc[0].end,replacement:`<div class="site-breadcrumb-row"><nav aria-label="Breadcrumb" data-site-breadcrumb-nav>${render()}</nav></div>`});
  }
  for(const edit of edits.sort((a,b)=>b.start-a.start))html=html.slice(0,edit.start)+edit.replacement+html.slice(edit.end);
  return html;
}
