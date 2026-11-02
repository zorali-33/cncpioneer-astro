import test from 'node:test';
import assert from 'node:assert/strict';
import {applyContextualLinks as link} from '../src/data/contextualLinks.mjs';

test('contextual links preserve prose and skip navigation, forms, existing anchors and self links',()=>{
  const input='<main><header><p>Swiss machining</p></header><p>CNCPioneer reviews Swiss machining drawings.</p><p>We plan CNC turning operations.</p><form><p>5-axis machining</p></form><p><a href="/services">CNC machining services</a></p></main>';
  const output=link(input,'/sample');
  assert.equal(link(output,'/sample'),output);
  assert.ok(output.includes('<header><p>Swiss machining</p></header>'));
  assert.ok(output.includes('<form><p>5-axis machining</p></form>'));
  assert.ok(output.includes('<a href="/services">CNC machining services</a>'));
  assert.equal(output.replace(/<a href="[^"]+" data-contextual-link="[^"]+">([^<]+)<\/a>/g,'$1'),input);
  assert.equal(link('<main><p>Swiss machining</p></main>','/services/swiss-machining'),'<main><p>Swiss machining</p></main>');
});

test('editorial additions appear once and equipment download rules are preserved',()=>{
  const source='<main><p>From flat mounting surfaces to holes, we plan the drawing.</p></main>';
  const output=link(source,'/services/3-axis-cnc-machining');
  assert.ok(output.includes('href="/blog/cnc-drilling"'));
  assert.equal(link(output,'/services/3-axis-cnc-machining'),output);
  const equipment='<main><p>CNC turning and milling</p></main>';
  assert.equal(link(equipment,'/resources/equipment-list'),equipment);
});
