import postcss from 'postcss';
import * as css from 'css-tree';
import {parse, walkSync, ELEMENT_NODE, TEXT_NODE} from 'ultrahtml';
import {decodeHTML, escapeAttribute} from 'entities';
import {normalizeFontDeclarations,siteFontUrl,headingFontUrl} from './site-typography.mjs';

export const palette = Object.freeze({brand:'#1F5D85',hover:'#174868',ink:'#202830',body:'#59636E',white:'#FFFFFF',surface:'#F5F6F7',border:'#DDE2E6'});
const approved = Object.values(palette).map(value => value.toLowerCase());
const names = {white:'#ffffff',black:'#000000',red:'#ff0000',green:'#008000',blue:'#0000ff',yellow:'#ffff00',orange:'#ffa500',purple:'#800080',gray:'#808080',grey:'#808080',silver:'#c0c0c0',navy:'#000080',teal:'#008080',cyan:'#00ffff',lime:'#00ff00',pink:'#ffc0cb',whitesmoke:'#f5f5f5',lightgray:'#d3d3d3',darkgray:'#a9a9a9',aliceblue:'#f0f8ff',rebeccapurple:'#663399',tomato:'#ff6347'};
const valueCache = new Map();

export function readColor(node) {
  let value = node.type === 'Hash' ? `#${node.value}` : node.type === 'Identifier' ? names[node.name.toLowerCase()] : null;
  if(value) {
    let h=value.slice(1);
    if(h.length===3 || h.length===4) h=[...h].map(c=>c+c).join('');
    if(!/^[\da-f]{6}([\da-f]{2})?$/i.test(h)) return null;
    return [0,2,4].map(i=>parseInt(h.slice(i,i+2),16)).concat(h.length===8?parseInt(h.slice(6),16)/255:1);
  }
  if(node.type!=='Function'||!/^rgba?$/i.test(node.name)) return null;
  const components=node.children.toArray().filter(n=>n.type==='Number'||n.type==='Percentage');
  if(components.length<3||components.length>4)return null;
  return components.map((n,i)=>Number(n.value)*(n.type==='Percentage'?(i<3?2.55:.01):1)).concat(components.length===3?[1]:[]);
}

function tokenFor([r,g,b,a], property, selector) {
  const original='#'+[r,g,b].map(n=>Math.round(n).toString(16).padStart(2,'0')).join('');
  if(approved.includes(original)) return Object.keys(palette).find(k=>palette[k].toLowerCase()===original);
  const light=.2126*r+.7152*g+.0722*b, spread=Math.max(r,g,b)-Math.min(r,g,b);
  const hover=/:hover|:active/.test(selector)||/hover/.test(property);
  const custom=property.startsWith('--');
  if(/shadow/.test(property))return 'ink';
  if(/border|outline|column-rule/.test(property)&&!custom) return spread>45 && light<180 ? (hover?'hover':'brand') : 'border';
  if(custom) {
    if(/border|line/.test(property))return 'border';
    if(/(?:^|[-_])(?:navy|heading|dark|ink|nav)(?:$|[-_])/.test(property))return 'ink';
    if(/(?:^|[-_])(?:body|text|copy)(?:$|[-_])/.test(property))return light>200?'white':'body';
    if(/blue|primary|accent|gold|yellow|teal/.test(property))return hover?'hover':'brand';
    if(/muted|surface|light|bg/.test(property)&&light>180)return light>251?'white':'surface';
  }
  if(/background/.test(property)) {
    if(light>251)return 'white';
    if(light>180)return 'surface';
    if(light<65)return hover&&/btn|button|tab|share/.test(selector)?'hover':'ink';
    if(spread>45)return hover?'hover':'brand';
    return light>125?'border':'body';
  }
  if(light>200)return 'white';
  if(spread>150)return hover?'hover':'brand';
  if(light<62)return /:hover|:focus/.test(selector)?'hover':'ink';
  if(spread>65&&(r<40||b-r>75||g-r>65||r-g>50))return hover?'hover':'brand';
  if(/(?:^|[\s,>])h[1-6](?:\b)|heading|__title/.test(selector))return 'ink';
  return 'body';
}

export function normalizeColorValue(value, property='color', selector='') {
  const cacheKey=property+'|'+selector+'|'+value;
  if(valueCache.has(cacheKey))return valueCache.get(cacheKey);
  let ast;
  try {ast=css.parse(value,{context:'value'});}catch{return value;}
  let changed=false;
  css.walk(ast,function(node){
    if(node.type==='Url'||node.type==='String')return css.walk.skip;
    if(node.type==='Raw' && /#[\da-f]{3,8}\b|rgba?\(/i.test(node.value)) {
      node.value=normalizeColorValue(node.value,property,selector); changed=true; return;
    }
    const color=readColor(node);
    if(!color)return;
    const token=tokenFor(color,property,selector);
    let replacement=`var(--color-${token})`;
    if(color[3]<1) {
      const alpha=/shadow/.test(property)?Math.min(.1,color[3]):color[3];
      replacement=`rgb(var(--color-${token}-rgb) / ${Math.round(alpha*1000)/1000})`;
    }
    Object.assign(node,css.parse(replacement,{context:'value'}).children.first);
    changed=true;
    return css.walk.skip;
  });
  const result=changed?css.generate(ast):value;
  valueCache.set(cacheKey,result);
  return result;
}

export function normalizeStylesheet(source, inline=false, selector='') {
  const root=postcss.parse(inline?`x{${source}}`:source);
  normalizeFontDeclarations(root,inline?selector:'');
  root.walkDecls(decl=>{
    if(/^(?:font|font-family|content|animation|transition|src)/.test(decl.prop))return;
    decl.value=normalizeColorValue(decl.value,decl.prop,inline?selector:decl.parent.selector||'');
  });
  return inline?root.first.nodes.map(n=>n.toString()).join(';'):root.toString();
}

// Normalize retained article inline styles without touching copy, JSON-LD,
// images, URLs or archived source documents. Last stylesheet owns shared roles.
export function applyBrandTheme(html) {
  const edits=[];
  walkSync(parse(html),node=>{
    if(node.type!==ELEMENT_NODE)return;
    if(node.name==='link' && /(?:^|\/)fonts\.(?:googleapis|gstatic)\.com(?:\/|$)/i.test(node.attributes.href||'')) {
      edits.push({start:node.loc[0].start,end:node.loc[0].end,value:''});return;
    }
    if(node.name==='style') {
      for(const child of node.children||[])if(child.type===TEXT_NODE) {
        const content=normalizeStylesheet(child.value);
        if(content!==child.value)edits.push({start:node.loc[0].end,end:node.loc[1].start,value:content});
      }
      return;
    }
    let tag=html.slice(node.loc[0].start,node.loc[0].end), changed=false;
    if(node.name==='font'&&node.attributes.face) {
      tag=tag.replace(/(\sface\s*=\s*)(["']).*?\2/i,'$1"Inter"');changed=true;
    }
    for(const name of ['style','fill','stroke','stop-color','color','bgcolor']) {
      const original=node.attributes[name];
      if(!original)continue;
      const context=node.name+'.'+(node.attributes.class||'').replaceAll(' ','.');
      const value=name==='style'?normalizeStylesheet(decodeHTML(original),true,context):normalizeColorValue(decodeHTML(original),name==='bgcolor'?'background':name,context);
      if(value===decodeHTML(original))continue;
      tag=tag.replace(new RegExp(`(\\s${name}\\s*=\\s*)(["'])(.*?)\\2`,'is'),(_all,lead,quote)=>lead+'"'+escapeAttribute(value)+'"');
      changed=true;
    }
    if(node.name==='meta'&&node.attributes.name==='theme-color') {
      tag=tag.replace(/(\scontent\s*=\s*)(["']).*?\2/i,`$1"${palette.white}"`);changed=true;
    }
    if(changed)edits.push({start:node.loc[0].start,end:node.loc[0].end,value:tag});
  });
  for(const edit of edits.sort((a,b)=>b.start-a.start))html=html.slice(0,edit.start)+edit.value+html.slice(edit.end);
  if(!html.includes('id="cncpioneer-font-preload"'))html=html.replace(/<\/head>/i,`<link id="cncpioneer-font-preload" rel="preload" href="${siteFontUrl}" as="font" type="font/woff2" crossorigin /></head>`);
  if(!html.includes('id="cncpioneer-heading-font-preload"'))html=html.replace(/<\/head>/i,`<link id="cncpioneer-heading-font-preload" rel="preload" href="${headingFontUrl}" as="font" type="font/woff2" crossorigin /></head>`);
  if(!html.includes('id="cncpioneer-brand-theme"'))html=html.replace(/<\/head>/i,'<link id="cncpioneer-brand-theme" rel="stylesheet" href="/brand-theme.css" /></head>');
  return html;
}
