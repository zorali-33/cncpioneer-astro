import fs from 'node:fs';
import {parse,walkSync,ELEMENT_NODE,TEXT_NODE} from 'ultrahtml';
import {decodeHTML} from 'entities';
import {createHash} from 'node:crypto';
const out='seo-migration/reports/blog-duplicates';
const text=n=>decodeHTML(n.type===TEXT_NODE?n.value:(n.children||[]).filter(c=>!['script','style'].includes(c.name)).map(text).join(' ')).replace(/\s+/g,' ').trim();
const words=s=>s.toLowerCase().replace(/[^a-z0-9]+/g,' ').trim().split(/\s+/).filter(Boolean);
const shingle=w=>new Set(w.slice(0,-4).map((_,i)=>w.slice(i,i+5).join(' ')));
const posts=[];const paragraphs=new Map();
for(const e of fs.readdirSync('dist/blog',{withFileTypes:true})) {
  if(!e.isDirectory()||e.name==='page')continue;
  const file=`dist/blog/${e.name}/index.html`;if(!fs.existsSync(file))continue;
  const nodes=[];walkSync(parse(fs.readFileSync(file,'utf8')),n=>{if(n.type===ELEMENT_NODE)nodes.push(n);});
  const body=nodes.find(n=>n.attributes.id==='main-article-content');if(!body)continue;
  const title=text(nodes.find(n=>n.name==='h1'));
  const plain=text(body),tokens=words(plain),blocks=[];
  walkSync(body,n=>{if(n.type===ELEMENT_NODE&&['p','li'].includes(n.name)){
    const value=text(n),w=words(value);if(w.length<30)return;
    const key=w.join(' ');blocks.push({text:value,words:w.length,key});
    if(!paragraphs.has(key))paragraphs.set(key,{text:value,words:w.length,pages:new Set()});
    paragraphs.get(key).pages.add('/blog/'+e.name);
  }});
  posts.push({route:'/blog/'+e.name,title,plain,tokens,blocks,shingles:shingle(tokens),hash:createHash('sha256').update(tokens.join(' ')).digest('hex')});
}
const pairs=[];
for(let i=0;i<posts.length;i++)for(let j=i+1;j<posts.length;j++) {
  const a=posts[i],b=posts[j];let common=0;
  const small=a.shingles.size<b.shingles.size?a.shingles:b.shingles,large=small===a.shingles?b.shingles:a.shingles;
  for(const s of small)if(large.has(s))common++;
  const jac=common/(a.shingles.size+b.shingles.size-common),contain=common/Math.min(a.shingles.size,b.shingles.size);
  pairs.push({a:a.route,b:b.route,titleA:a.title,titleB:b.title,exact:a.hash===b.hash,jaccard:Math.round(jac*10000)/100,shorterOverlap:Math.round(contain*10000)/100,commonFiveWordPhrases:common});
}
pairs.sort((a,b)=>b.jaccard-a.jaccard);
const repeated=[...paragraphs.values()].filter(p=>p.pages.size>1).map(p=>({...p,pages:[...p.pages]})).sort((a,b)=>b.pages.length-a.pages.length||b.words-a.words);
const perPage=posts.map(p=>({route:p.route,title:p.title,words:p.tokens.length,exactRepeatBlocks:p.blocks.filter(b=>paragraphs.get(b.key).pages.size>1).length,repeatedParagraphWords:p.blocks.filter(b=>paragraphs.get(b.key).pages.size>1).reduce((n,b)=>n+b.words,0)}));
const report={generatedAt:new Date().toISOString(),scope:'Current generated blog article bodies only (#main-article-content); excludes header, footer, quote forms, related cards and archives. English word-normalized exact comparison and unique 5-word shingle overlap. Lexical similarity is not a search-engine penalty or a semantic cannibalization verdict.',summary:{articles:posts.length,pairs:pairs.length,exactDuplicatePairs:pairs.filter(p=>p.exact).length,pairsAtLeast50PercentJaccard:pairs.filter(p=>p.jaccard>=50).length,pairsAtLeast30PercentJaccard:pairs.filter(p=>p.jaccard>=30).length,repeatedBlocksOf30Words:repeated.length},topPairs:pairs.slice(0,30),repeatedBlocks:repeated,pages:perPage.sort((a,b)=>b.repeatedParagraphWords-a.repeatedParagraphWords)};
fs.mkdirSync(out,{recursive:true});fs.writeFileSync(`${out}/audit.json`,JSON.stringify(report,null,2));
const esc=s=>'"'+String(s).replaceAll('"','""')+'"';
fs.writeFileSync(`${out}/pairs.csv`,'page_a,page_b,jaccard_percent,shorter_overlap_percent,exact\n'+pairs.map(p=>[p.a,p.b,p.jaccard,p.shorterOverlap,p.exact].map(esc).join(',')).join('\n'));
fs.writeFileSync(`${out}/review.md`,'# 博客正文重复检测\n\n'+report.scope+'\n\n'+Object.entries(report.summary).map(([k,v])=>`- ${k}: ${v}`).join('\n')+'\n\n## 重合度最高的文章组合\n\n| 页面 A | 页面 B | 5词组 Jaccard | 短文覆盖率 |\n|---|---|---:|---:|\n'+report.topPairs.slice(0,15).map(p=>`| ${p.a} | ${p.b} | ${p.jaccard}% | ${p.shorterOverlap}% |`).join('\n')+'\n\n## 跨文章重复段落（至少30词）\n\n'+repeated.slice(0,20).map(p=>`### ${p.pages.length} 篇文章，${p.words} 词\n\n${p.text}\n\n${p.pages.join('\n\n')}`).join('\n\n'));
console.log(JSON.stringify({summary:report.summary,topPairs:report.topPairs.slice(0,12),repeated:repeated.slice(0,6),pages:report.pages.slice(0,8)},null,2));
