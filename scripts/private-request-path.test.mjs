import test from 'node:test';
import assert from 'node:assert/strict';
import {publicRequestPath,isPrivateRequestPath} from './private-request-path.mjs';
import integration from './quote-mail-integration.mjs';
import {createStaticRequestHandler} from './static-server.mjs';
import {mkdtempSync,writeFileSync,unlinkSync,rmdirSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join} from 'node:path';

const paths=['/.cncpioneer-mail.php','/.cncpioneer-mail%2ephp','/%61pi/lib/quote-mail%2ephp','/%41PI/vendor/phpmailer/SMTP.PHP','/@fs/C:/project/.cncpioneer-mail.php','/@fs/C:/project/%2ecncpioneer-mail.php','/.htaccess','/api/.user.ini','/%61pi%5clib%5cquote-mail%2ephp'];
const response=()=>({status:0,body:'',writeHead(code){this.status=code;},end(body=''){this.body=body;}});
test('Private paths are checked after decoding, including filesystem and Windows variants',()=>{
  for(const path of paths)assert.equal(isPrivateRequestPath(publicRequestPath(path)),true,path);
  assert.equal(publicRequestPath('/bad%XX'),null);
  assert.equal(publicRequestPath('/bad%00'),null);
});
test('The Vite middleware blocks private files before its filesystem handler',()=>{
  let config,middleware;
  integration().hooks['astro:config:setup']({updateConfig:value=>{config=value;}});
  config.vite.plugins[0].configureServer({middlewares:{use:value=>{middleware=value;}}});
  for(const path of paths){const res=response();let next=false;middleware({url:path},res,()=>{next=true;});assert.equal(res.status,404,path);assert.equal(next,false);}
  const res=response();middleware({url:'/bad%XX'},res,()=>{});assert.equal(res.status,400);
});
test('Static preview never serves an encoded PHP path or a dotfile',async()=>{
  const directory=mkdtempSync(join(tmpdir(),'cncp-static-private-'));
  writeFileSync(join(directory,'.cncpioneer-mail.php'),'TEST_ONLY_NOT_A_PASSWORD');
  try{
    const handle=createStaticRequestHandler({directory});
    for(const path of paths){const res=response();await handle({url:path,method:'GET'},res);assert.equal(res.status,404,path);assert.equal(res.body.includes('TEST_ONLY_NOT_A_PASSWORD'),false);}
    const res=response();await handle({url:'/%61pi/quote%2ephp',method:'GET'},res);assert.equal(res.status,503);assert.equal(JSON.parse(res.body).ok,false);
  }finally{unlinkSync(join(directory,'.cncpioneer-mail.php'));rmdirSync(directory);}
});
