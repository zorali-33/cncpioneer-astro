import {test} from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import {catalogParts,catalogCategories} from '../src/parts-catalog-native.mjs';
import {classifyPart,partCategories,partCategoryHref} from '../src/data/partTaxonomy.mjs';
import {getSiteNavigation} from '../src/data/siteNavigation.mjs';

test('every live part belongs to one nonempty category and reviewed ambiguous parts are grouped correctly',()=>{
  assert.equal(new Set(catalogParts.map(p=>p.slug)).size,catalogParts.length);
  assert.equal(catalogCategories.reduce((sum,c)=>sum+c.count,0),catalogParts.length);
  assert.equal(catalogCategories.length,8);
  for(const [slug,expected] of Object.entries({'ev-charging-gun':'pins','ev-charging-plug':'pins','liquid-cooling-connectors':'fittings','bearing-housing':'housings','screw-threaded-sleeve':'bushings','titanium-swiss-screw-machined-parts':'components','humanoid-robot-finger-joints':'structures','hydraulic-cylinder-piston-machining':'structures'})){
    assert.equal(catalogParts.find(p=>p.slug===slug)?.category,expected,slug);
  }
  assert.equal(classifyPart({slug:'gearbox-housing'}).id,'housings');
});
test('Custom Parts navigation points to the existing directory and all eight valid category filters',()=>{
  const nav=getSiteNavigation('/custom-cnc-parts/motor-shaft');
  const entry=nav.find(n=>n.label==='Custom Parts');
  assert.equal(entry.href,'/custom-cnc-parts');assert.equal(entry.active,true);
  assert.equal(entry.children.length,8);
  assert.ok(!entry.children.some(child=>child.href===entry.href));
  for(const child of entry.children)assert.equal(new URL(child.href,'https://www.cncpioneer.com').hash,'');
  for(const category of partCategories){const link=entry.children.find(n=>n.href===partCategoryHref(category.id));assert.ok(link);assert.ok(catalogParts.some(p=>p.category===category.id));}
  assert.equal(getSiteNavigation('/custom-cnc-parts/page/2').find(n=>n.label==='Custom Parts').active,true);
  assert.equal(getSiteNavigation('/blog').find(n=>n.label==='Custom Parts').active,false);
});
test('Resources is a disclosure with Blog, FAQ and Equipment List links',()=>{
  for(const route of ['/','/blog/example','/resources/faqs','/resources/equipment-list']){
    const resources=getSiteNavigation(route).find(item=>item.label==='Resources');
    assert.equal(resources.href,undefined);assert.equal(resources.id,'resources');
    assert.deepEqual(resources.children.map(item=>item.href),['/blog','/resources/faqs','/resources/equipment-list']);
    assert.equal(resources.active,route!=='/');
  }
});

function clientFor(search){
  const make=()=>({textContent:'',innerHTML:'',hidden:false,value:'',dataset:{},options:[],listeners:{},classList:{toggle(){}},addEventListener(name,fn){this.listeners[name]=fn;},setAttribute(){},scrollIntoView(){},focus(){},querySelectorAll(){return [];}});
  const elements=new Map();const selectors=['#pl-catalog-data','[data-pl-search]','[data-pl-material]','[data-pl-sort]','[data-pl-results]','[data-pl-count]','[data-pl-empty]','[data-pl-clear]','[data-pl-pagination]','[data-pl-note]','[data-pl-tools]','[data-pl-categories]','[data-pl-reset]','[data-pl-heading]','[data-pl-explore]','#parts-catalog'];
  for(const s of selectors)elements.set(s,make());
  elements.get('#pl-catalog-data').textContent=JSON.stringify(catalogParts);
  elements.get('[data-pl-material]').options=[{value:'all'}];elements.get('[data-pl-heading]').textContent='Find your next component.';
  const buttons=['all',...partCategories.map(c=>c.id)].map(id=>{const button=make(),count=make();button.dataset.plCategory=id;button.querySelector=()=>count;return button;});
  const root={dataset:{page:'1',perPage:'24'},querySelector:s=>elements.get(s),querySelectorAll:()=>buttons};
  const history=[];const window={location:{search,pathname:'/custom-cnc-parts'},history:{replaceState(_s,_t,url){history.push(url);},pushState(_s,_t,url){history.push(url);}},addEventListener(){},matchMedia:()=>({matches:true})};
  vm.runInNewContext(fs.readFileSync('src/scripts/parts-library.js','utf8'),{document:{querySelector:()=>root},window,URLSearchParams,setTimeout,clearTimeout});
  return {elements,buttons,history};
}
test('category menu deep links render the correct parts, heading and filtered pagination',()=>{
  const {elements}=clientFor('?type=pins&p=2');
  const pins=catalogParts.filter(p=>p.category==='pins');
  assert.equal(elements.get('[data-pl-heading]').textContent,'Pins & Contacts');
  const html=elements.get('[data-pl-results]').innerHTML;
  for(const part of pins.slice(24))assert.ok(html.includes(part.href));
  assert.ok(!html.includes('/custom-cnc-parts/liquid-cooling-connectors'));
  assert.match(elements.get('[data-pl-count]').textContent,new RegExp(`of ${pins.length} parts`));
  assert.match(elements.get('[data-pl-pagination]').innerHTML,/type=pins/);
  assert.doesNotMatch(elements.get('[data-pl-pagination]').innerHTML,/#parts-catalog/);
});
test('switching category from a filtered result updates the URL and displayed products',()=>{
  const {elements,buttons,history}=clientFor('?type=pins');
  const bushings=buttons.find(b=>b.dataset.plCategory==='bushings');
  elements.get('[data-pl-categories]').listeners.click({target:{closest:()=>bushings}});
  assert.match(history.at(-1),/type=bushings/);
  assert.doesNotMatch(history.at(-1),/#/);
  assert.equal(elements.get('[data-pl-heading]').textContent,'Bushings & Sleeves');
  assert.ok(elements.get('[data-pl-results]').innerHTML.includes('/custom-cnc-parts/bronze-sleeve-bushings'));
  assert.ok(!elements.get('[data-pl-results]').innerHTML.includes('/custom-cnc-parts/brass-contact-pins'));
});
test('Explore parts scrolls to the catalog without adding a URL fragment',()=>{
  const {elements,history}=clientFor('?type=pins');let scrolled=false;
  elements.get('#parts-catalog').scrollIntoView=()=>{scrolled=true;};
  elements.get('[data-pl-explore]').listeners.click();
  assert.equal(scrolled,true);assert.equal(history.length,0);
});
