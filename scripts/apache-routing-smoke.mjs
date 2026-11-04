import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import http from 'node:http';
import https from 'node:https';
import net from 'node:net';
import {spawn,execFileSync} from 'node:child_process';
import {pageRedirects,canonicalPageUrl} from '../src/data/siteUrls.mjs';
import {notFoundPagePaths,notFoundPathVariants} from '../src/data/pageRemovals.mjs';

// CI runs the generated .htaccess under real HTTP and HTTPS Apache listeners.
// The temporary self-signed certificate is trusted only by this test client.
if(process.platform!=='linux')throw Error('Run this hosting test in the Linux verification workflow.');
const build=path.resolve('dist'), temp=fs.mkdtempSync(path.join(os.tmpdir(),'cncpioneer-apache-'));
const freePort=()=>new Promise((resolve,reject)=>{const s=net.createServer();s.on('error',reject);s.listen(0,'127.0.0.1',()=>{const p=s.address().port;s.close(()=>resolve(p));});});
const httpPort=await freePort(), httpsPort=await freePort();
const cert=path.join(temp,'cert.pem'),key=path.join(temp,'key.pem');
execFileSync('openssl',['req','-x509','-newkey','rsa:2048','-nodes','-days','1','-keyout',key,'-out',cert,'-subj','/CN=www.cncpioneer.com','-addext','subjectAltName=DNS:www.cncpioneer.com,DNS:cncpioneer.com,IP:127.0.0.1'],{stdio:'ignore'});
const uid=process.getuid(),gid=process.getgid();
const config=[
  `ServerRoot "${temp}"`, `DefaultRuntimeDir "${temp}"`, `PidFile "${temp}/apache.pid"`,
  `Listen 127.0.0.1:${httpPort}`,`Listen 127.0.0.1:${httpsPort}`,
  'ServerName www.cncpioneer.com',
  ...['mpm_event','authz_core','authz_host','dir','mime','rewrite','headers','ssl','socache_shmcb'].map(n=>`LoadModule ${n}_module /usr/lib/apache2/modules/mod_${n}.so`),
  `User #${uid===0?33:uid}`,`Group #${gid===0?33:gid}`,
  `ErrorLog "${temp}/error.log"`,'LogLevel warn','TypesConfig /etc/mime.types',
  `DocumentRoot "${build}"`,
  `<Directory "${build}">`,'  Options +FollowSymLinks -Indexes','  AllowOverride All','  Require all granted','</Directory>',
  `<VirtualHost 127.0.0.1:${httpPort}>`,'  ServerName www.cncpioneer.com','</VirtualHost>',
  `<VirtualHost 127.0.0.1:${httpsPort}>`,'  ServerName www.cncpioneer.com','  SSLEngine on',`  SSLCertificateFile "${cert}"`,`  SSLCertificateKeyFile "${key}"`,'</VirtualHost>',
  '',
].join('\n');
const configFile=path.join(temp,'apache.conf');fs.writeFileSync(configFile,config);
execFileSync('/usr/sbin/apache2',['-t','-f',configFile],{stdio:'inherit'});
const server=spawn('/usr/sbin/apache2',['-f',configFile,'-DFOREGROUND'],{stdio:['ignore','ignore','pipe']});
let stderr='';server.stderr.on('data',c=>stderr+=c);
const ca=fs.readFileSync(cert);
function get(urlPath,{tls=true,host='www.cncpioneer.com'}={}){
  return new Promise((resolve,reject)=>{
    const request=(tls?https:http).get({hostname:'127.0.0.1',port:tls?httpsPort:httpPort,path:urlPath,headers:{Host:host},ca,servername:host},res=>{
      const chunks=[];res.on('data',c=>chunks.push(c));res.on('end',()=>resolve({status:res.statusCode,headers:res.headers,body:Buffer.concat(chunks).toString('utf8')}));
    });request.setTimeout(10000,()=>request.destroy(Error('Apache test request timed out')));request.on('error',reject);
  });
}
async function each(items,fn){let cursor=0;await Promise.all(Array.from({length:5},async()=>{while(cursor<items.length)await fn(items[cursor++]);}));}
try {
  let ready=false;
  for(let i=0;i<100;i++){
    if(server.exitCode!==null)throw Error('Apache exited: '+stderr);
    try{await get('/');ready=true;break;}catch{await new Promise(r=>setTimeout(r,100));}
  }
  assert.ok(ready,'Apache did not start: '+stderr);
  const urls=[...fs.readFileSync(path.join(build,'sitemap.xml'),'utf8').matchAll(/<loc>([^<]+)<\/loc>/g)].map(m=>new URL(m[1]));
  await each(urls,async url=>{
    const response=await get(url.pathname);
    assert.equal(response.status,200,`Canonical must be direct 200: ${url.pathname}`);
    assert.ok(!response.headers.location,url.pathname);
    assert.match(response.body,/<main\b/,url.pathname);
    for(const variant of url.pathname==='/'?['/index.html']:[url.pathname+'/',url.pathname+'/index.html']){
      const redirected=await get(variant+'?qty=10&material=steel%20alloy');
      assert.equal(redirected.status,301,variant);
      assert.equal(redirected.headers.location,url.href+'?qty=10&material=steel%20alloy',variant);
    }
  });
  await each(Object.entries(pageRedirects),async([from,to])=>{
    for(const variant of notFoundPathVariants(from)){
      const response=await get(variant+'?qty=10');
      assert.equal(response.status,301,variant);
      assert.equal(response.headers.location,canonicalPageUrl(to)+'?qty=10',variant);
    }
  });
  await each([...notFoundPagePaths,'/seo-test-does-not-exist'],async route=>{
    const response=await get(route);assert.equal(response.status,404,route);assert.match(response.body,/noindex/,route);
  });
  for(const tls of [false,true])for(const host of ['cncpioneer.com','www.cncpioneer.com']){
    if(tls&&host==='www.cncpioneer.com')continue;
    for(const [source,target] of [['/','/'],['/services/swiss-machining/','/services/swiss-machining'],['/services/swiss-machining/index.html','/services/swiss-machining'],['/blog/cnc-locating-pinsi/','/blog/cnc-locating-pins']]){
      const response=await get(source+'?qty=10',{tls,host});
      assert.equal(response.status,301,`${host}${source}`);
      assert.equal(response.headers.location,canonicalPageUrl(target)+'?qty=10');
    }
  }
  const resource=await get('/brand-theme.css?v=test');assert.equal(resource.status,200);assert.match(resource.headers['cache-control'],/no-cache/);
  console.log(JSON.stringify({canonicalDirect200:urls.length,permanentMoves:Object.keys(pageRedirects).length,true404:notFoundPagePaths.size+1,protocolAndHost:'pass',variantQueries:'preserved',sharedAssetRevalidation:'pass'}));
} catch(error){
  console.error(fs.existsSync(path.join(temp,'error.log'))?fs.readFileSync(path.join(temp,'error.log'),'utf8').slice(-4000):stderr);
  throw error;
} finally {
  server.kill('SIGTERM');
  await new Promise(resolve=>{if(server.exitCode!==null)resolve();else server.once('exit',resolve);});
  fs.rmSync(temp,{recursive:true,force:true});
}
