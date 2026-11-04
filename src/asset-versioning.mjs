import {readFileSync} from 'node:fs';
import path from 'node:path';
import {createHash} from 'node:crypto';
import {parse, walkSync, ELEMENT_NODE} from 'ultrahtml';
import {decodeHTML, escapeAttribute} from 'entities';

const sharedAssets = new Set(['/brand-theme.css', '/site-search.css', '/site-search.js', '/navigation-accessibility.js']);

// Fingerprint public entry points in both prerendered and development HTML.
// The file bytes, rather than a build clock, determine the cache identity.
export function applyAssetVersions(html) {
  const edits=[];
  walkSync(parse(html), node => {
    if (node.type !== ELEMENT_NODE || !['link','script'].includes(node.name)) return;
    const attr=node.name==='script'?'src':'href', value=decodeHTML(node.attributes[attr]||'');
    if (!value.startsWith('/')) return;
    const url=new URL(value, 'https://www.cncpioneer.com');
    if (!sharedAssets.has(url.pathname)) return;
    const bytes=readFileSync(path.resolve('public', '.'+url.pathname));
    const version=createHash('sha256').update(bytes).digest('hex').slice(0,12);
    url.searchParams.set('v',version);
    const next=url.pathname+url.search+url.hash;
    if (value===next) return;
    const tag=html.slice(node.loc[0].start,node.loc[0].end)
      .replace(new RegExp(`(\\s${attr}\\s*=\\s*)(?:"[^"]*"|'[^']*')`,'i'),(_,lead)=>lead+'"'+escapeAttribute(next)+'"');
    edits.push({start:node.loc[0].start,end:node.loc[0].end,tag});
  });
  for(const edit of edits.sort((a,b)=>b.start-a.start)) html=html.slice(0,edit.start)+edit.tag+html.slice(edit.end);
  return html;
}
