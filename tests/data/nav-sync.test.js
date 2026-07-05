// tests/data/nav-sync.test.js — the nav is byte-identical (per-page hrefs
// aside) on every site page; drift fails CI instead of shipping.
import { strict as assert } from 'node:assert';
import { test } from 'node:test';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { navPages, renderNav, NAV } from '../../scripts/sync-nav.js';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');

function extractNav(source) {
  const start = source.indexOf('<nav class="navbar">');
  if (start === -1) return null;
  const end = source.indexOf('</nav>', start);
  return source.slice(start, end + '</nav>'.length);
}

test('every site page carries the canonical nav for its location', () => {
  const pages = navPages();
  assert.ok(pages.length >= 25, `expected 25+ pages, got ${pages.length}`);
  for (const page of pages) {
    const actual = extractNav(readFileSync(path.join(ROOT, page), 'utf8'));
    assert.ok(actual, `${page}: no navbar found`);
    assert.equal(actual, renderNav(page), `${page}: nav drifted — run npm run nav:sync`);
  }
});

test('canonical nav lists every 0.3.0 demo page', () => {
  const targets = NAV.flatMap((e) => [e, ...(e.submenu ?? [])]).map((e) => e.target);
  for (const p of ['animations', 'stream-overlays', 'transitions', 'corrupted-mandala',
                   'scroll-decode', 'corrupted-timeline', 'glitch-stagger-grid']) {
    assert.ok(targets.includes(`examples/${p}.html`), `nav missing examples/${p}.html`);
  }
});

test('nav labels are identical across pages (structure never varies)', () => {
  const labels = (html) => [...html.matchAll(/<\/i> ([^<]+)</g)].map((m) => m[1].trim());
  const reference = labels(renderNav('index.html'));
  for (const page of navPages()) {
    assert.deepEqual(labels(renderNav(page)), reference, `${page}: label set differs`);
  }
});
