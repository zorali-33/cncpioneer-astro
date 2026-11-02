import {spawn, spawnSync} from 'node:child_process';
import {mkdtemp, readFile, writeFile, unlink, rmdir} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join, resolve} from 'node:path';
import {fileURLToPath} from 'node:url';
import {createServer} from 'node:net';
import assert from 'node:assert/strict';

const root=fileURLToPath(new URL('../',import.meta.url));
const php=process.env.CNCP_PHP_BINARY||'php';
const unit=spawnSync(php,['-n','server/quote-mail.test.php'],{cwd:root,encoding:'utf8'});
if(unit.error)throw new Error('PHP 8.2+ is required. Set CNCP_PHP_BINARY to the PHP executable.');
process.stdout.write(unit.stdout||'');
if(unit.status!==0){process.stderr.write(unit.stderr||'');process.exit(1);}

// Every HTTP request uses this dummy configuration. Never load the private password.
const directory=await mkdtemp(join(tmpdir(),'cncp-mail-http-'));
const configFile=join(directory,'config.php');
const example=await readFile(join(root,'server/mail-config.example.php'),'utf8');
await writeFile(configFile,example.replace("'smtp_password' => ''","'smtp_password' => 'LOCAL_TEST_NEVER_AUTHENTICATE'"));
const reservation=createServer();
await new Promise((accept,reject)=>{reservation.once('error',reject);reservation.listen(0,'127.0.0.1',accept);});
const port=reservation.address().port;
await new Promise(accept=>reservation.close(accept));
const child=spawn(php,['-n','-d','display_errors=0','-S',`127.0.0.1:${port}`,'-t',resolve(root,'public')],{cwd:root,env:{...process.env,CNCP_MAIL_CONFIG:configFile},stdio:['ignore','ignore','pipe']});
const exit=new Promise(accept=>child.once('exit',accept));
let checks=0;
const endpoint=`http://127.0.0.1:${port}/api/quote.php`;
try{
  await new Promise((accept,reject)=>{
    const timeout=setTimeout(()=>reject(new Error('PHP HTTP test server did not start')),10000);
    child.once('error',error=>{clearTimeout(timeout);reject(error);});
    child.stderr.on('data',data=>{if(data.toString().includes('Development Server')){clearTimeout(timeout);accept();}});
  });
  const check=async(status,options={})=>{
    const response=await fetch(endpoint,{...options,signal:AbortSignal.timeout(5000)});
    assert.equal(response.status,status);
    assert.match(response.headers.get('content-type'),/application\/json/);
    assert.match(response.headers.get('cache-control'),/no-store/);
    const body=await response.json();
    assert.equal(body.ok,false);
    assert.equal(body.id,undefined);
    assert.equal(JSON.stringify(body).includes('LOCAL_TEST_NEVER_AUTHENTICATE'),false);
    checks++;
  };
  await check(405);
  await check(403,{method:'POST',headers:{Origin:'https://invalid.example'}});
  await check(422,{method:'POST',headers:{Origin:'https://www.cncpioneer.com'}});
  const fields={first_name:'Local',last_name:'Test',email:'buyer@example.test',phone:'+1 202 555 0123',country:'United States',message:'Local validation only. Do not deliver.'};
  const form=()=>{const result=new FormData();for(const [name,value]of Object.entries(fields))result.set(name,value);return result;};
  await check(422,{method:'POST',headers:{Origin:'https://www.cncpioneer.com'},body:form()});
  const badFile=form();badFile.set('drawing',new Blob(['not executable']), 'blocked.php');
  await check(422,{method:'POST',headers:{Origin:'https://www.cncpioneer.com'},body:badFile});
  const badPdf=form();badPdf.set('drawing',new Blob(['not a PDF']), 'invalid.pdf');
  await check(422,{method:'POST',headers:{Origin:'https://www.cncpioneer.com'},body:badPdf});
  await check(413,{method:'POST',headers:{Origin:'https://www.cncpioneer.com'},body:Buffer.alloc(11000001)});
  await writeFile(configFile,'<?php return [];');
  await check(503,{method:'POST',headers:{Origin:'https://www.cncpioneer.com'}});
  console.log(JSON.stringify({httpChecks:checks,passed:true,emailsSent:0}));
}finally{
  child.kill();await exit;
  await unlink(configFile);await rmdir(directory);
}
