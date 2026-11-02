import {spawnSync} from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const build=path.resolve(process.argv[2]||path.join(root,'dist'));
const reports=path.resolve(process.argv[3]||path.join(root,'seo-migration/reports'));
fs.mkdirSync(reports,{recursive:true});
if(!fs.existsSync(path.join(build,'sitemap.xml')))throw Error('Build and generate indexing assets before acceptance.');
const checks=[
  {name:'Regression tests',args:['--test','scripts/page-removals.test.mjs','scripts/site-schema.test.mjs','scripts/seo-template.test.mjs','scripts/breadcrumbs.test.mjs','scripts/presentation-integrity.test.mjs','scripts/image-assets.test.mjs','scripts/editorial-corrections.test.mjs','scripts/url-corrections.test.mjs','scripts/quote-form.test.mjs','scripts/private-request-path.test.mjs','scripts/archive-page.test.mjs','scripts/brand-palette.test.mjs','scripts/site-typography.test.mjs','scripts/parts-navigation.test.mjs']},
  {name:'Rendered HTML, SEO, Schema, links and search index',args:['scripts/site-integrity-audit.mjs',build,path.join(reports,'site-integrity.json')]},
  {name:'CSS, fonts and JavaScript dependencies',args:['scripts/asset-dependency-audit.mjs',build,path.join(reports,'asset-dependencies.json')]},
  {name:'404 hosting rules and archive pagination',args:['scripts/build-routing-audit.mjs',build,path.join(reports,'build-routing.json')]},
  {name:'WebP format, strict 100 KB limit, filenames and reviewed content',args:['scripts/content-and-media-audit.mjs',build,path.join(reports,'content-and-media.json')]},
  {name:'Share image URLs, reviewed citations and crawlable page entry points',args:['scripts/url-integrity-audit.mjs',build,path.join(reports,'url-integrity.json')]},
  {name:'Quote form deployment files and private configuration isolation',args:['scripts/quote-mail-audit.mjs',build,path.join(reports,'quote-mail.json')]},
  {name:'Native archive content, pagination order, title branding and runtime independence',args:['scripts/native-cleanup-audit.mjs',build,path.join(reports,'native-cleanup.json')]},
  {name:'Approved palette across rendered pages and reachable UI styles',args:['scripts/brand-palette-audit.mjs',build,path.join(reports,'brand-palette.json')]},
  {name:'Approved Inter / DM Sans / JetBrains Mono roles and local font loading',args:['scripts/site-typography-audit.mjs',build,path.join(reports,'site-typography.json')]},
  {name:'Custom Parts main navigation, category filters and complete product coverage',args:['scripts/parts-navigation-audit.mjs',build,path.join(reports,'parts-navigation.json')]},
];
const results=[];
for(const check of checks){
  const run=spawnSync(process.execPath,check.args,{cwd:root,encoding:'utf8'});
  const log=(run.stdout||'')+(run.stderr||'');
  const file=`acceptance-${results.length+1}.log`;
  fs.writeFileSync(path.join(reports,file),log);
  results.push({name:check.name,status:run.status===0?'pass':'fail',exitCode:run.status,log:file});
  console.log(`${run.status===0?'PASS':'FAIL'} ${check.name}`);
  if(run.status!==0)console.log(log.slice(-5000));
}
const failed=results.filter(r=>r.status==='fail');
const report={generatedAt:new Date().toISOString(),build,status:failed.length?'fail':'pass',results,excluded:['Live SMTP authentication and inbox delivery are not proven by static acceptance; run the separate PHP checks.','Live production deployment and Search Console validation require the production environment.'],advisories:'Title/description character counts are editorial targets, not fixed Google validity limits. Historical mirror audits remain available separately.'};
fs.writeFileSync(path.join(reports,'release-acceptance.json'),JSON.stringify(report,null,2));
fs.writeFileSync(path.join(reports,'release-acceptance.md'),`# Release acceptance\n\nStatus: ${report.status}\n\nBuild: ${build}\n\n${results.map(r=>`- ${r.status.toUpperCase()}: ${r.name} (${r.log})`).join('\n')}\n\nLive SMTP authentication, inbox delivery, deployment and Search Console validation are not covered by static acceptance. Run the separate PHP tests and verify delivery on the host.\n\n${report.advisories}\n`);
process.exitCode=failed.length?1:0;

