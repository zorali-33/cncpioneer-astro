import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';

const source=fs.readFileSync(new URL('../src/scripts/quote-form.js',import.meta.url),'utf8');
function setup(result){
  let handler,resetCount=0,requests=0,validity='';
  const buttonLabel={textContent:'Send Quote Request'};
  const button={disabled:false,querySelector(){return buttonLabel;}};
  const status={dataset:{},textContent:'',focus(){}};
  const drawing={files:[{name:'drawing.pdf',size:256}],addEventListener(){},setCustomValidity(value){validity=value;},reportValidity(){}};
  const form={action:'https://www.cncpioneer.com/api/quote.php',querySelector(selector){return selector.startsWith('button')?button:selector.startsWith('input')?drawing:status;},reportValidity(){return true;},addEventListener(event,listener){handler=listener;},reset(){resetCount++;}};
  vm.runInNewContext(source,{document:{querySelectorAll:()=>[form]},FormData:class{},AbortController,setTimeout,clearTimeout,fetch:async()=>{requests++;return typeof result==='function'?result():{ok:result.httpOk,headers:{get:()=>result.contentType||'application/json'},json:async()=>result.body};}});
  return {button,buttonLabel,status,drawing,submit:()=>handler({preventDefault(){}}),get resets(){return resetCount;},get requests(){return requests;},get validity(){return validity;}};
}
test('A delivery failure preserves form details and restores the submit button',async()=>{
  const page=setup({httpOk:false,body:{ok:false,message:'Service unavailable'}});
  await page.submit();assert.equal(page.resets,0);assert.equal(page.status.dataset.state,'error');assert.equal(page.status.textContent,'Service unavailable');assert.equal(page.button.disabled,false);
});
test('A success requires an explicit server receipt',async()=>{
  const incomplete=setup({httpOk:true,body:{ok:true}});await incomplete.submit();assert.equal(incomplete.resets,0);assert.equal(incomplete.status.dataset.state,'error');
  const accepted=setup({httpOk:true,body:{ok:true,id:'test-reference'}});await accepted.submit();assert.equal(accepted.resets,1);assert.equal(accepted.status.dataset.state,'success');assert.match(accepted.status.textContent,/test-reference/);
});
test('An unsupported upload never reaches the endpoint',async()=>{
  const page=setup({});page.drawing.files=[{name:'blocked.php',size:100}];await page.submit();assert.equal(page.requests,0);assert.match(page.validity,/PDF/);
});
test('A double click does not send duplicate pending requests',async()=>{
  let release;const pending=new Promise(resolve=>{release=resolve;});const page=setup(()=>pending);const first=page.submit();await page.submit();assert.equal(page.requests,1);release({ok:false,headers:{get:()=> 'application/json'},json:async()=>({ok:false})});await first;assert.equal(page.button.disabled,false);
});
