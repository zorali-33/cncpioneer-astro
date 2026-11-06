import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {parse,walkSync,ELEMENT_NODE} from 'ultrahtml';
import {getBlogArticles} from '../src/blog-archive.mjs';
import {archivePage} from '../src/lib/archivePage.mjs';
import {getBlogAuthor} from '../src/blog-detail-native.mjs';
import {titleBrandOverrides} from '../src/data/titleBrandOverrides.mjs';

const root=fileURLToPath(new URL('../',import.meta.url)),build=path.resolve(process.argv[2]||path.join(root,'dist'));
const errors=[],archives=[],allPages=[];
const readRoute=route=>fs.readFileSync(path.join(build,route,'index.html'),'utf8');
const inspect=html=>{const nodes=[];walkSync(parse(html),n=>{if(n.type===ELEMENT_NODE)nodes.push(n);});return nodes;};
const headings=nodes=>nodes.filter(n=>/^h[2-6]$/.test(n.name)&&/blog-post-title|author-post-title/.test(n.attributes.class||''));
const source={};for(const entry of fs.readdirSync(path.join(root,'src/mirrored-pages/blog'),{withFileTypes:true})){const file=path.join(root,'src/mirrored-pages/blog',entry.name,'index.html');if(entry.isDirectory()&&fs.existsSync(file))source[`blog/${entry.name}/index.html`]=fs.readFileSync(file,'utf8');}
const articles=getBlogArticles(source);
const models=[];for(let page=2;page<=archivePage(articles).lastPage;page++)models.push(archivePage(articles,{page}));
for(const authorSlug of ['david-li','ryan-wang']){const authorName=getBlogAuthor(authorSlug).name;const first=archivePage(articles,{authorSlug,authorName});for(let page=authorSlug==='david-li'?1:2;page<=first.lastPage;page++)models.push(archivePage(articles,{page,authorSlug,authorName}));}
for(const model of models){
  const html=readRoute(model.route),nodes=inspect(html),links=[];
  for(const heading of headings(nodes))walkSync(heading,node=>{if(node.name==='a')links.push(node.attributes.href);});
  const expected=model.posts.map(post=>`/blog/${post.slug}`);
  if(JSON.stringify(links)!==JSON.stringify(expected))errors.push({route:model.route,issue:'archive_content_or_order_changed',links,expected});
  if(!html.includes('data-native-archive'))errors.push({route:model.route,issue:'native_component_missing'});
  const styles=nodes.filter(n=>n.name==='link'&&n.attributes.rel==='stylesheet');
  if(styles.length>5)errors.push({route:model.route,issue:'excessive_stylesheet_count',count:styles.length});
  archives.push({route:model.route,posts:links.length,stylesheets:styles.length,htmlBytes:Buffer.byteLength(html)});
}
function scan(dir){for(const entry of fs.readdirSync(dir,{withFileTypes:true})){const file=path.join(dir,entry.name);if(entry.isDirectory())scan(file);else if(entry.name==='index.html'||entry.name==='404.html')allPages.push(file);}}
scan(build);
const shellSignature=node=>JSON.stringify(node&&{
  name:node.name,
  attributes:Object.fromEntries(Object.entries(node.attributes||{}).filter(([key])=>key!=='aria-current').map(([key,value])=>[key,key==='class'?value.split(/\s+/).filter(name=>name!=='is-active').join(' '):value]).sort(([a],[b])=>a.localeCompare(b))),
  children:(node.children||[]).filter(child=>child.type===ELEMENT_NODE||child.value?.trim()).map(child=>child.type===ELEMENT_NODE?JSON.parse(shellSignature(child)):child.value.trim()),
});
const homepageNodes=inspect(readRoute('/'));
const homepageHeader=shellSignature(homepageNodes.find(n=>n.name==='header'&&'data-native-header' in n.attributes));
const homepageFooter=shellSignature(homepageNodes.find(n=>n.name==='footer'&&'data-native-footer' in n.attributes));
for(const file of allPages){const html=fs.readFileSync(file,'utf8'),route='/'+path.relative(build,file).replaceAll('\\','/').replace(/\/index\.html$/,'');
  const nodes=inspect(html);
  for(const [tag,attribute,expected]of [['header','data-native-header',homepageHeader],['footer','data-native-footer',homepageFooter]]){
    const shells=nodes.filter(n=>n.name===tag&&Object.hasOwn(n.attributes,attribute));
    if(shells.length!==1||shellSignature(shells[0])!==expected)errors.push({route,issue:`${tag}_differs_from_homepage`});
  }
  for(const node of nodes){
    if(node.name==='script'&&/wp-includes|wp-content\/plugins|wp-content\/cache\/min/.test(node.attributes.src||''))errors.push({route,issue:'wordpress_runtime_script'});
    if(node.name==='link'&&node.attributes.rel==='stylesheet'&&/wp-includes|wp-content\/(?:plugins|cache)/.test(node.attributes.href||''))errors.push({route,issue:'legacy_stylesheet_dependency'});
    if(node.name==='a'&&node.attributes.href==='#')errors.push({route,issue:'placeholder_link'});
  }
  if(/(?:action|href|src)="[^\"]*(?:wp-admin|wp-json|admin-ajax\.php)/i.test(html))errors.push({route,issue:'wordpress_endpoint_reference'});
}
for(const [route,title]of Object.entries(titleBrandOverrides)){const nodes=inspect(readRoute(route)),node=nodes.find(n=>n.name==='title');const actual=(node?.children||[]).map(n=>n.value||'').join('').replaceAll('&amp;','&');if(actual!==title)errors.push({route,issue:'title_suffix_regression',actual,expected:title});}
const hub=readRoute('/industries');if(!hub.includes('data-native-industry-hub'))errors.push({route:'/industries',issue:'industry_native_component_missing'});
const faq=readRoute('/resources/faqs');if(/proprietary quotation software|400 RMB|no upfront non-recurring|1 to 3 business days/i.test(faq))errors.push({route:'/resources/faqs',issue:'unconfirmed_faq_commitment'});
const report={generatedAt:new Date().toISOString(),pages:allPages.length,nativeArchivePages:archives.length,archives,errors};
if(process.argv[3])fs.writeFileSync(process.argv[3],JSON.stringify(report,null,2));console.log(JSON.stringify(report,null,2));process.exitCode=errors.length?1:0;
