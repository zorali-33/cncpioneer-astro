import assert from 'node:assert/strict';
import { test } from 'node:test';
import { mkdtemp, mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { Writable } from 'node:stream';
import { once } from 'node:events';
import { isNotFoundPagePath, notFoundPagePaths, notFoundPathVariants } from '../src/data/pageRemovals.mjs';
import { retiredPagePaths, normalizeInternalHref } from '../src/data/siteUrls.mjs';
import { createStaticRequestHandler } from './static-server.mjs';
import removalIntegration from './industry-redirect-integration.mjs';

class CapturedResponse extends Writable {
  chunks = [];
  writeHead(status, headers) { this.status = status; this.headers = headers; }
  _write(chunk, encoding, done) { this.chunks.push(Buffer.from(chunk)); done(); }
  get body() { return Buffer.concat(this.chunks).toString('utf8'); }
}

async function request(handler, url, method = 'GET') {
  const response = new CapturedResponse();
  const finished = once(response, 'finish');
  await handler({ url, method }, response);
  await finished;
  return response;
}

test('retired and removed pages match URL variants without removing current destinations', () => {
  for (const route of notFoundPagePaths) {
    for (const variant of notFoundPathVariants(route)) assert.ok(isNotFoundPagePath(variant), variant);
  }
  assert.ok(isNotFoundPagePath('/custom-cnc-parts/%65vtol-bearing-housing/index.html'));
  assert.ok(!isNotFoundPagePath('/custom-cnc-parts/bearing-housing'));
  assert.ok(!isNotFoundPagePath('/blog/swiss-machining'));
  assert.ok(!isNotFoundPagePath('/blog/page/10'));
  assert.ok(!isNotFoundPagePath('/wp-content/uploads/evtol-bearing-housing.jpg'));
  assert.equal(normalizeInternalHref('/custom-cnc-parts/evtol-bearing-housing?drawing=1#details'), '/custom-cnc-parts/bearing-housing?drawing=1#details');
});

test('static requests return branded 404 without Location even when stale redirect files exist', async () => {
  const directory = await mkdtemp(join(tmpdir(), 'cncpioneer-404-test-'));
  try {
    await writeFile(join(directory, '404.html'), '<h1>404</h1><a href="/">Back Home</a>');
    await mkdir(join(directory, 'custom-cnc-parts/evtol-bearing-housing'), { recursive: true });
    await writeFile(join(directory, 'custom-cnc-parts/evtol-bearing-housing/index.html'), '<meta http-equiv="refresh" content="0;url=/custom-cnc-parts/bearing-housing">');
    await mkdir(join(directory, 'custom-cnc-parts/bearing-housing'), { recursive: true });
    await writeFile(join(directory, 'custom-cnc-parts/bearing-housing/index.html'), '<h1>Current bearing housing</h1>');
    const handler = createStaticRequestHandler({ directory });
    for (const route of notFoundPagePaths) {
      for (const variant of notFoundPathVariants(route)) {
        const response = await request(handler, variant + '?check=1');
        assert.equal(response.status, 404, variant);
        assert.equal(response.headers.Location, undefined);
        assert.equal(response.headers['X-Robots-Tag'], 'noindex');
        assert.match(response.body, /Back Home/);
        assert.ok(!response.body.includes('http-equiv'));
      }
    }
    const head = await request(handler, '/blog/what-is-laser-cutting/index.html', 'HEAD');
    assert.equal(head.status, 404);
    assert.equal(head.body, '');
    const unknown = await request(handler, '/unknown-page');
    assert.equal(unknown.status, 404);
    assert.match(unknown.body, /Back Home/);
    const current = await request(handler, '/custom-cnc-parts/bearing-housing?drawing=1');
    assert.equal(current.status, 200);
    assert.match(current.body, /Current bearing housing/);
    const traversal = await request(handler, '/..%2fprivate.txt');
    assert.equal(traversal.status, 404);
  } finally { await rm(directory, { recursive: true, force: true }); }
});

test('hosting rules cover retired index.html URLs with 404 status and no 301', async () => {
  const directory = await mkdtemp(join(tmpdir(), 'cncpioneer-host-rules-'));
  try {
    await removalIntegration().hooks['astro:build:done']({ dir: new URL('file:///' + directory.replaceAll('\\', '/') + '/') });
    const netlify = await readFile(join(directory, '_redirects'), 'utf8');
    const apache = await readFile(join(directory, '.htaccess'), 'utf8');
    assert.ok(!/\b301\b/.test(netlify + apache));
    const apacheRules = apache.split('\n').filter((line) => line.startsWith('RewriteRule '))
      .map((line) => new RegExp(line.split(' ')[1]));
    for (const route of notFoundPagePaths) {
      for (const variant of notFoundPathVariants(route)) {
        assert.ok(netlify.includes(variant + ' /404.html 404!\n'), variant);
        assert.ok(apacheRules.some((rule) => rule.test(variant.slice(1))), variant);
      }
    }
    for (const route of retiredPagePaths) assert.ok(isNotFoundPagePath(route));
  } finally { await rm(directory, { recursive: true, force: true }); }
});
