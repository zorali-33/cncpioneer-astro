import fs from 'node:fs';
import path from 'node:path';
import postcss from 'postcss';
import {parse,walkSync,ELEMENT_NODE,TEXT_NODE} from 'ultrahtml';
import {decodeHTML} from 'entities';
import {siteFontUrl,headingFontUrl,siteFonts,headingType} from '../src/site-typography.mjs';
const build=path.resolve(process.argv[2]||'dist'),output=path.resolve(process.argv[3]||'seo-migration/reports/site-typography.json');
const errors=[],stylesheets=new Set(),fontFaces=[];let pages=0,declarations=0,headingDeclarations=0;
const foreignFont=/fonts\.(?:googleapis|gstatic)\.com|Poppins|Montserrat|Archivo|Merriweather|Roboto/i;
function files(dir){return fs.readdirSync(dir,{withFileTypes:true}).flatMap(e=>e.isDirectory()?files(path.join(dir,e.name)):[path.join(dir,e.name)]);}
function checkCss(source,file,inline=false,context=''){
  const ast=postcss.parse(inline?`x{${source}}`:source);
  ast.walkAtRules('font-face',rule=>{
    const face=Object.fromEntries(rule.nodes.filter(n=>n.type==='decl').map(d=>[d.prop,d.value]));fontFaces.push({file,...face});
    const expected=siteFonts.find(font=>font.family===face['font-family'].replaceAll(/["']/g,''));
    if(!expected||face['font-weight']!=='400 700'||!face.src.includes(expected.url)||face['font-display']!=='swap')errors.push({file,issue:'Unexpected font face',face});
  });
  ast.walkAtRules('import',rule=>{if(foreignFont.test(rule.params))errors.push({file,issue:'Retired font import',value:rule.params});});
  ast.walkDecls(d=>{
    const heading=headingType(inline?context:d.parent.selector||'');
    if(d.prop==='font-size'&&heading&&!file.endsWith('brand-theme.css')){
      headingDeclarations++;
      if(d.value!==`var(--type-${heading})`)errors.push({file,issue:'Heading size bypasses shared scale',selector:d.parent.selector,value:d.value,heading});
    }
    if(d.prop!=='font'&&d.prop!=='font-family'&&!/^--font-/.test(d.prop))return;
    if(d.parent.type==='atrule'&&d.parent.name==='font-face')return;
    declarations++;
    const value=d.value.trim();
    if(foreignFont.test(value))errors.push({file,issue:'Retired font family',property:d.prop,value});
    if(d.prop==='font-family'&&!['var(--font-sans)','var(--font-heading)','var(--font-mono)','inherit'].includes(value))errors.push({file,issue:'Non-unified family',value});
    if(d.prop==='font'&&(!/var\(--font-(?:sans|heading|mono)\)|^(?:inherit|initial|unset|revert(?:-layer)?)$/.test(value)||/^var\(--font-/.test(value)))errors.push({file,issue:'Unreviewed or incomplete font shorthand',value});
  });
}
function stylesheet(href){
  if(/^(https?:|\/\/)/.test(href))return;
  const file=path.join(build,href.split('?')[0]);if(stylesheets.has(file))return;stylesheets.add(file);checkCss(fs.readFileSync(file,'utf8'),file);
}
for(const file of files(build).filter(f=>f.endsWith('.html'))){
  pages++;let preload=0,theme=0;
  walkSync(parse(fs.readFileSync(file,'utf8')),n=>{
    if(n.type!==ELEMENT_NODE)return;
    if(n.name==='link'){
      const href=decodeHTML(n.attributes.href||'');
      if(/fonts\.(?:googleapis|gstatic)\.com/.test(href))errors.push({file,issue:'External font dependency',href});
      if(n.attributes.rel==='preload'&&n.attributes.as==='font'){
        if([siteFontUrl,headingFontUrl].includes(href) && 'crossorigin' in n.attributes)preload++;else errors.push({file,issue:'Unexpected font preload',href});
      }
      if(n.attributes.id==='cncpioneer-brand-theme')theme++;
      if(n.attributes.rel==='stylesheet')stylesheet(href);
    }
    if(n.name==='style')for(const text of n.children||[])if(text.type===TEXT_NODE)checkCss(text.value,file);
    if(n.attributes.style)checkCss(decodeHTML(n.attributes.style),file,true,n.name+'.'+(n.attributes.class||''));
    if(n.name==='font'&&n.attributes.face&&n.attributes.face!=='Inter')errors.push({file,issue:'Legacy font tag',face:n.attributes.face});
    if(n.attributes['font-family']&&n.attributes['font-family']!=='Inter')errors.push({file,issue:'SVG font attribute',face:n.attributes['font-family']});
  });
  if(preload!==2||theme!==1)errors.push({file,issue:'Missing or duplicate shared font load',preload,theme});
}
if(fontFaces.length!==3||new Set(fontFaces.map(f=>f['font-family'])).size!==3)errors.push({issue:'Expected three approved local font faces',fontFaces});
for(const font of siteFonts)if(!fs.existsSync(path.join(build,font.url)))errors.push({issue:'Missing local font file',family:font.family});
const report={generatedAt:new Date().toISOString(),status:errors.length?'fail':'pass',pages,stylesheets:stylesheets.size,fontDeclarations:declarations,headingDeclarations,fontFaces,errors};
fs.mkdirSync(path.dirname(output),{recursive:true});fs.writeFileSync(output,JSON.stringify(report,null,2));console.log(JSON.stringify({...report,errors:errors.slice(0,20)},null,2));process.exitCode=errors.length?1:0;
