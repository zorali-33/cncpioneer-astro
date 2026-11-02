import manifest from './data/imageAssets.json' with {type:'json'};
import {parse,walkSync,ELEMENT_NODE} from 'ultrahtml';
import {decodeHTML,escapeAttribute} from 'entities';

const ownHosts=new Set(['www.cncpioneer.com','cncpioneer.com','localhost','127.0.0.1']);
const outputMetadata=new Map(Object.values(manifest.assets).map(asset=>[asset.src,asset]));
const legacyImageAliases={
 '/wp-content/uploads/2026/01/cropped-site-icon-270x270.png':'/wp-content/uploads/2026/01/cropped-site-icon-192x192.png',
};
const authorAvatars={
 'cce2715f1891c236d55b31c5be14173bd51ad76c7664cf39b084d84aafecc9e0':'/wp-content/uploads/2026/03/ryan-wang-100X100.jpg',
 'f2a239e711cbc68334e67f119f1c777ec37a814519043b0f491e7789c279a776':'/wp-content/uploads/2026/03/david-li-150x150-1.jpg',
};

export function optimizedImageUrl(value,base='/',assets=manifest.assets){
  if(!value || /^(?:data:|blob:|#)/i.test(value))return value;
  let url;
  try{url=new URL(decodeHTML(value),'https://www.cncpioneer.com'+base);}catch{return value;}
  if(url.hostname==='secure.gravatar.com'){
    const original=authorAvatars[url.pathname.split('/').pop()];
    return assets[original]?'https://www.cncpioneer.com'+assets[original].src:value;
  }
  if(!ownHosts.has(url.hostname))return value;
  let key;try{key=decodeURIComponent(url.pathname);}catch{return value;}
  const asset=assets[key]||assets[legacyImageAliases[key]];
  if(!asset)return value;
  return /^(?:https?:)?\/\//i.test(value)?'https://www.cncpioneer.com'+asset.src:asset.src;
}

export function optimizedShareImageUrl(value,base='/',assets=manifest.assets){
  let url;
  try{url=new URL(decodeHTML(value),'https://www.cncpioneer.com'+base);}catch{return value;}
  if(!/(?:^|\.)pinterest\.com$/i.test(url.hostname)||!/^\/pin\/create\/button\/?$/.test(url.pathname))return value;
  const media=url.searchParams.get('media');if(!media)return value;
  const next=optimizedImageUrl(media,base,assets);if(next===media)return value;
  url.searchParams.set('media',next);
  const result=url.href;
  return value.includes('&amp;')?result.replaceAll('&','&amp;'):result;
}

// Covers HTML attributes, srcset, JSON-LD, serialized client data, SVG image
// links and CSS URLs. Only URLs present in the reviewed manifest can change.
export function rewriteImageReferences(source,base='/',assets=manifest.assets){
  source=source.replace(/(["'])([^"'<>\r\n]+)\1/g,(whole,quote,value)=>{
    const next=optimizedImageUrl(optimizedShareImageUrl(value,base,assets),base,assets);
    return next===value?whole:quote+next+quote;
  });
  source=source.replace(/url\(\s*(["']?)([^)"']+)\1\s*\)/gi,(whole,quote,value)=>{
    const next=optimizedImageUrl(value.trim(),base,assets);
    return next===value.trim()?whole:`url(${quote}${next}${quote})`;
  });
  return source.replace(/(?:(?:https?:)?\/\/[a-z0-9.:-]+)?\/(?:wp-content|wp-includes|assets)\/[^\s"'<>\\),;]+?\.(?:jpe?g|png|gif|webp|avif|svg|ico)(?:\?[^\s"'<>\\),;]*)?/gi,value=>optimizedImageUrl(value,base,assets));
}

export function applyOptimizedImageReferences(html,route){
  html=rewriteImageReferences(html,route);
  const nodes=[];
  walkSync(parse(html),node=>{if(node.type===ELEMENT_NODE)nodes.push(node);});
  const image=nodes.find(n=>n.name==='meta'&&n.attributes.property==='og:image')?.attributes.content;
  let pathname;try{pathname=image?new URL(decodeHTML(image),'https://www.cncpioneer.com').pathname:undefined;}catch{}
  const asset=outputMetadata.get(pathname);
  const values=asset?{'og:image:type':'image/webp','og:image:width':String(asset.width),'og:image:height':String(asset.height)}:{};
  const edits=[];
  for(const node of nodes)if(node.name==='meta'&&values[node.attributes.property]){
    const tag=html.slice(node.loc[0].start,node.loc[0].end).replace(/\bcontent=(?:"[^"]*"|'[^']*')/i,`content="${values[node.attributes.property]}"`);
    edits.push({start:node.loc[0].start,end:node.loc[0].end,tag});
  }
  if(asset&&(asset.width<300||asset.height<157))for(const node of nodes.filter(n=>n.name==='meta'&&n.attributes.name==='twitter:card')){
    const tag=html.slice(node.loc[0].start,node.loc[0].end).replace(/\bcontent=(?:"[^"]*"|'[^']*')/i,'content="summary"');
    edits.push({start:node.loc[0].start,end:node.loc[0].end,tag});
  }
  for(const node of nodes.filter(n=>['img','source','link'].includes(n.name))){
    let tag=html.slice(node.loc[0].start,node.loc[0].end),changed=false;
    for(const attr of ['srcset','data-srcset','data-lazy-srcset']){
      const original=decodeHTML(node.attributes[attr]||'');if(!original)continue;
      const seen=new Set();
      const candidates=original.split(',').map(candidate=>{
        const match=candidate.trim().match(/^(\S+)\s+(\d+)w$/);if(!match)return candidate.trim();
        let key;try{key=new URL(match[1],'https://www.cncpioneer.com'+route).pathname;}catch{return candidate.trim();}
        const image=outputMetadata.get(key);return image?`${match[1]} ${image.width}w`:candidate.trim();
      }).filter(candidate=>{const descriptor=candidate.match(/\s+(\d+)w$/)?.[1];if(!descriptor)return true;if(seen.has(descriptor))return false;seen.add(descriptor);return true;});
      const value=candidates.join(', ');
      if(value!==original){tag=tag.replace(new RegExp(`(\\s${attr}=)(?:"[^"]*"|'[^']*')`,'i'),(_,prefix)=>prefix+'"'+escapeAttribute(value)+'"');changed=true;}
    }
    if(node.attributes.type?.startsWith('image/') && /\/assets\/images\/[^"']+\.webp/.test(tag)){
      tag=tag.replace(/(\btype=)(?:"[^"]*"|'[^']*')/i,'$1"image/webp"');changed=true;
    }
    if(changed)edits.push({start:node.loc[0].start,end:node.loc[0].end,tag});
  }
  for(const edit of edits.sort((a,b)=>b.start-a.start))html=html.slice(0,edit.start)+edit.tag+html.slice(edit.end);
  return html;
}

export const optimizedImageAssets=manifest.assets;
