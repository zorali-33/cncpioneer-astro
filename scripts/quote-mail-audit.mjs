import fs from 'node:fs';
import path from 'node:path';
import {createHash} from 'node:crypto';
import {fileURLToPath} from 'node:url';

const root=fileURLToPath(new URL('../',import.meta.url));
const build=path.resolve(process.argv[2]||path.join(root,'dist'));
const reportPath=process.argv[3];
const errors=[];
const check=(condition,label)=>{if(!condition)errors.push(label);};
const text=file=>fs.existsSync(file)?fs.readFileSync(file,'utf8'):'';
const html=text(path.join(build,'cnc-machining-quote/index.html'));
check(/action="\/api\/quote.php"/.test(html),'Missing PHP form action');
check(/enctype="multipart\/form-data"/.test(html),'Missing multipart upload form');
check(/data-quote-status/.test(html),'Missing accessible delivery status');
check(/method="post"/i.test(html),'Missing POST form method');
for(const file of ['api/quote.php','api/lib/quote-mail.php','api/.user.ini','api/.htaccess','api/lib/.htaccess','api/vendor/.htaccess','api/vendor/phpmailer/LICENSE'])check(fs.existsSync(path.join(build,file)),`Missing deployment file: ${file}`);
const lock=JSON.parse(text(path.join(root,'server/phpmailer-lock.json')));
for(const {file,sha256}of lock.files){
  const target=path.join(build,'api/vendor/phpmailer',file);
  check(fs.existsSync(target)&&createHash('sha256').update(fs.readFileSync(target)).digest('hex')===sha256,`Unexpected PHPMailer file: ${file}`);
}
for(const folder of ['api/lib','api/vendor'])check(/Require all denied/i.test(text(path.join(build,folder,'.htaccess'))),`Missing access restriction: ${folder}`);
for(const name of fs.readdirSync(build,{recursive:true}))check(!/(?:^|[\\/])(?:\.cncpioneer-mail\.php|check-mail\.php|quote-mail\.test\.php|mail-config\.example\.php)$/.test(name),'Private configuration or diagnostic script found in build');
check(text(path.join(root,'.gitignore')).split(/\r?\n/).includes('.cncpioneer-mail.php'),'Private configuration is not ignored');
const scripts=fs.existsSync(path.join(build,'_astro'))?fs.readdirSync(path.join(build,'_astro')).filter(name=>name.endsWith('.js')).map(name=>text(path.join(build,'_astro',name))).join('\n'):'';
const clientCode=html+'\n'+scripts; // Astro may inline small processed scripts.
check(clientCode.includes('AbortController')&&clientCode.includes('Sending your enquiry.'),'Missing form delivery script');
const report={generatedAt:new Date().toISOString(),status:errors.length?'fail':'pass',errors,liveDeliveryVerified:false};
if(reportPath)fs.writeFileSync(reportPath,JSON.stringify(report,null,2));
console.log(JSON.stringify(report));process.exitCode=errors.length?1:0;
