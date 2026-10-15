import { test } from 'node:test';
import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { once } from 'node:events';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');

async function startServer() {
  const child = spawn(process.execPath, ['scripts/static-server.js'], {
    cwd: ROOT,
    env: { ...process.env, STATIC_PORT: '0' },
    stdio: ['ignore', 'pipe', 'pipe'],
  });
  try {
    const [chunk] = await Promise.race([
      once(child.stdout, 'data'),
      once(child, 'exit').then(([code]) => { throw new Error(`Dev server exited: ${code}`); }),
    ]);
    const port = /:(\d+)/.exec(String(chunk))?.[1];
    if (!port) throw new Error(`Dev server did not print a port: ${chunk}`);
    return { child, origin: `http://127.0.0.1:${port}` };
  } catch (error) {
    child.kill();
    throw error;
  }
}

test('the local root serves the root page and its canonical dropdown targets', async () => {
  const { child, origin } = await startServer();
  try {
    const response = await fetch(`${origin}/`);
    assert.equal(response.status, 200);
    const html = await response.text();
    assert.match(html, /<title>Corrupted Theme - Design System<\/title>/);
    assert.equal(html, readFileSync(path.join(ROOT, 'index.html'), 'utf8'));

    const nav = html.split('<nav class="navbar">')[1].split('</nav>')[0];
    const links = [...nav.matchAll(/href="([^"]+)"/g)].map((match) => match[1]);
    const internal = [...new Set(links.filter((link) => !/^https?:\/\//.test(link))
      .map((link) => link.split('#')[0]))];
    for (const link of internal) {
      const target = new URL(link, origin);
      const result = await fetch(target);
      assert.equal(result.status, 200, `navbar link ${link} returned ${result.status}`);
    }
    assert.ok(internal.includes('examples/extensions-showcase.html'));
    assert.ok(internal.includes('examples/http-errors.html'));
  } finally {
    child.kill();
    await once(child, 'exit');
  }
});
