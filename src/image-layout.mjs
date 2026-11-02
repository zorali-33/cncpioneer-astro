import fs from 'node:fs/promises';
import path from 'node:path';
import { imageMetadata } from 'astro/assets/utils';
import { parse, walkSync, ELEMENT_NODE } from 'ultrahtml';
import { decodeHTML } from 'entities';

const metadataCache = new Map();
const publicRoot = path.resolve('public');

async function dimensions(source) {
  let url;
  try { url = new URL(decodeHTML(source), 'https://www.cncpioneer.com'); } catch { return; }
  if (!['www.cncpioneer.com', 'cncpioneer.com', 'localhost', '127.0.0.1'].includes(url.hostname)) return;
  let file;
  try { file = path.resolve(publicRoot, '.' + decodeURIComponent(url.pathname)); } catch { return; }
  const relative = path.relative(publicRoot, file);
  if (relative.startsWith('..') || path.isAbsolute(relative)) return;
  let stat;
  try { stat = await fs.stat(file); } catch { return; }
  const previous = metadataCache.get(file);
  if (previous?.mtime === stat.mtimeMs) return previous.value;
  const value = fs.readFile(file).then(data => imageMetadata(data, file)).then(metadata => {
    const {width, height} = metadata;
    return width > 0 && height > 0 ? {width, height} : undefined;
  }).catch(() => undefined);
  metadataCache.set(file, {mtime:stat.mtimeMs, value});
  return value;
}

// Reserve the actual image aspect ratio without recompressing files or changing
// CSS sizing, object-fit, crops, source URLs, or lazy-loading behaviour.
export async function applyImageDimensions(html) {
  const images=[];
  walkSync(parse(html), node => {
    if(node.type===ELEMENT_NODE && node.name==='img' && node.attributes.src && (!node.attributes.width || !node.attributes.height)) images.push(node);
  });
  const edits=await Promise.all(images.map(async node => {
    const size=await dimensions(node.attributes.src);
    if(!size) return;
    const width=Number(node.attributes.width), height=Number(node.attributes.height);
    if((node.attributes.width && !(width>0)) || (node.attributes.height && !(height>0))) return;
    let attributes='';
    if(!width) attributes+=` width="${height ? Math.round(height*size.width/size.height) : size.width}"`;
    if(!height) attributes+=` height="${width ? Math.round(width*size.height/size.width) : size.height}"`;
    const tag=html.slice(node.loc[0].start,node.loc[0].end).replace(/\s*\/?>$/, ending=>attributes+ending);
    return {start:node.loc[0].start,end:node.loc[0].end,tag};
  }));
  for(const edit of edits.filter(Boolean).sort((a,b)=>b.start-a.start)) html=html.slice(0,edit.start)+edit.tag+html.slice(edit.end);
  return html;
}
