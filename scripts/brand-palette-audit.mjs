import fs from 'node:fs';
import path from 'node:path';
import postcss from 'postcss';
import * as css from 'css-tree';
import {parse,walkSync,ELEMENT_NODE,TEXT_NODE} from 'ultrahtml';
import {decodeHTML} from 'entities';
import {palette,readColor} from '../src/brand-palette.mjs';
const build=path.resolve(process.argv[2]||'dist'), reportFile=path.resolve(process.argv[3]||'seo-migration/reports/brand-palette.json');
const allowed=new Set(Object.values(palette).map(c=>c.toLowerCase()));
const issues=[],cssFiles=new Set();let pageCount=0,inlineCount=0,values=0;
function files(dir){return fs.readdirSync(dir,{withFileTypes:true}).flatMap(d=>d.isDirectory()?files(path.join(dir,d.name)):[path.join(dir,d.name)]);}
function checkValue(value,file,context){
  let ast;try{ast=css.parse(value,{context:'value'});}catch(error){issues.push({file,context,error:error.message,value});return;}
  css.walk(ast,node=>{
    if(node.type==='Url'||node.type==='String')return css.walk.skip;
    const color=readColor(node);
    if(color){
      if(color[3]===0)return css.walk.skip;
      values++; const hex='#'+color.slice(0,3).map(n=>Math.round(n).toString(16).padStart(2,'0')).join('');
      if(!allowed.has(hex))issues.push({file,context,value,color:hex});
      return css.walk.skip;
    }
    if(node.type==='Raw' && /#[\da-f]{3,8}\b|rgba?\(/i.test(node.value))checkValue(node.value,file,context+' fallback');
    if(node.type==='Function'&&/^(?:hsl|hsla|hwb|lab|lch|oklab|oklch|color)$/i.test(node.name))issues.push({file,context,value,color:'Unreviewed colour function'});
  });
}
function checkCss(source,file,inline=false){
  let root;try{root=postcss.parse(inline?`x{${source}}`:source);}catch(error){issues.push({file,error:error.message});return;}
  root.walkDecls(d=>{
    if(/^(?:font|font-family|content|animation|transition|src)/.test(d.prop))return;
    checkValue(d.value,file,(d.parent.selector||'inline')+' '+d.prop);
  });
  root.walkAtRules('import',rule=>{
    const match=rule.params.match(/(?:url\()?['"]([^'"]+\.css)['"]/);if(match)addCss(match[1],file);
  });
}
function addCss(href,from){
  if(/^(?:https?:|data:|\/\/)/.test(href))return;
  const file=href.startsWith('/')?path.join(build,href.split('?')[0]):path.resolve(path.dirname(from),href.split('?')[0]);
  if(cssFiles.has(file))return;cssFiles.add(file);
  if(!fs.existsSync(file)){issues.push({file,error:'Missing stylesheet'});return;}
  checkCss(fs.readFileSync(file,'utf8'),file);
}
for(const file of files(build).filter(f=>f.endsWith('.html'))){
  pageCount++; const html=fs.readFileSync(file,'utf8');
  if((html.match(/id="cncpioneer-brand-theme"/g)||[]).length!==1)issues.push({file,error:'Expected exactly one shared theme'});
  walkSync(parse(html),n=>{
    if(n.type!==ELEMENT_NODE)return;
    if(n.name==='link'&&n.attributes.rel==='stylesheet')addCss(decodeHTML(n.attributes.href||''),file);
    if(n.name==='style')for(const t of n.children||[])if(t.type===TEXT_NODE)checkCss(t.value,file);
    if(n.attributes.style){inlineCount++;checkCss(decodeHTML(n.attributes.style),file,true);}
    for(const attribute of ['fill','stroke','stop-color','color','bgcolor'])if(n.attributes[attribute])checkValue(decodeHTML(n.attributes[attribute]),file,n.name+' '+attribute);
  });
}
const result={generatedAt:new Date().toISOString(),status:issues.length?'fail':'pass',pages:pageCount,stylesheets:cssFiles.size,inlineStyles:inlineCount,literalColors:values,palette,issues,scope:'Authored UI styles and inline SVG. Photographs, videos, product illustrations and logo image pixels retain their original colours.'};
fs.mkdirSync(path.dirname(reportFile),{recursive:true});fs.writeFileSync(reportFile,JSON.stringify(result,null,2));
console.log(JSON.stringify({...result,issues:issues.slice(0,20)},null,2));process.exitCode=issues.length?1:0;
