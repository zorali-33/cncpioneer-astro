import {parse,walkSync,ELEMENT_NODE} from 'ultrahtml';
import {decodeHTML,escapeAttribute} from 'entities';
import {informativeImageDescriptions} from './data/imageEditorial.mjs';

const within = (node, parent) => {for(let n=node.parent;n;n=n.parent)if(n===parent)return true;return false;};
const inFallback = node => {for(let n=node.parent;n;n=n.parent)if(n.name==='noscript')return true;return false;};
const attribute = (tag, name, value) => {
  const pattern=new RegExp(`\\s${name}\\s*=\\s*(?:"[^"]*"|'[^']*'|[^\\s>]+)`,'i');
  if(value===null)return tag.replace(pattern,'');
  const rendered=` ${name}="${escapeAttribute(value)}"`;
  return pattern.test(tag)?tag.replace(pattern,()=>rendered):tag.replace(/\s*\/?>$/,end=>rendered+end);
};

export function applyArticleImagePolicy(html, route) {
  if(!/^\/blog\/[^/]+\/?$/.test(route))return html;
  const nodes=[];walkSync(parse(html),n=>{if(n.type===ELEMENT_NODE)nodes.push(n);});
  const article=nodes.find(n=>n.attributes.id==='main-article-content');
  if(!article)return html;
  const images=nodes.filter(n=>n.name==='img'&&within(n,article));
  const lead=images.find(n=>!inFallback(n)&&n.attributes.hidden===undefined&&n.attributes['aria-hidden']!=='true');
  const edits=[];
  for(const n of images){
    const original=html.slice(n.loc[0].start,n.loc[0].end);
    let tag=attribute(original,'loading',n===lead?'eager':'lazy');
    tag=attribute(tag,'fetchpriority',n===lead?'high':null);
    tag=attribute(tag,'decoding','async');
    let name;try{name=new URL(decodeHTML(n.attributes.src||''),'https://www.cncpioneer.com').pathname.split('/').pop();}catch{}
    const alt=informativeImageDescriptions[name];
    if(alt&&!decodeHTML(n.attributes.alt||'').trim())tag=attribute(tag,'alt',alt);
    if(tag!==original)edits.push({start:n.loc[0].start,end:n.loc[0].end,tag});
  }
  for(const edit of edits.sort((a,b)=>b.start-a.start))html=html.slice(0,edit.start)+edit.tag+html.slice(edit.end);
  return html;
}
