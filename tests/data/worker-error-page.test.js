import { test } from 'node:test';
import assert from 'node:assert/strict';
import worker from '../../worker/index.js';

test('the example Worker serves the packaged 404 with a real 404 status', async () => {
  const urls = [];
  const env = {
    ASSETS: {
      fetch: async (request) => {
        const url = new URL(request.url);
        urls.push(url.pathname);
        if (url.pathname === '/errors/404.html') {
          return new Response('<h1>Page Not Found</h1>', {
            headers: { 'Content-Type': 'text/html; charset=utf-8' },
          });
        }
        return new Response('Not found', { status: 404 });
      },
    },
  };
  const response = await worker.fetch(new Request('https://example.test/missing'), env);
  assert.deepEqual(urls, ['/missing', '/errors/404.html']);
  assert.equal(response.status, 404);
  assert.match(await response.text(), /Page Not Found/);
  assert.match(response.headers.get('content-security-policy'), /default-src/);
});

test('the example Worker leaves successful assets and missing fallback alone', async () => {
  for (const status of [200, 404]) {
    const env = { ASSETS: { fetch: async () => new Response('Asset', { status }) } };
    const response = await worker.fetch(new Request('https://example.test/asset'), env);
    assert.equal(response.status, status);
    assert.equal(await response.text(), 'Asset');
  }
});
