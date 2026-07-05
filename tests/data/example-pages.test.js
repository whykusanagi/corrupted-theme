// tests/data/example-pages.test.js — every example page's script tags are
// loadable: no ES module pulled in via a classic <script src> (the bug class
// behind the broken particles-bg page, owner-reported 2026-07-05), and no
// script src pointing at a missing file.
import { strict as assert } from 'node:assert';
import { test } from 'node:test';
import { readFileSync, readdirSync, existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const pages = ['index.html',
  ...readdirSync(path.join(ROOT, 'examples'), { recursive: true })
    .map(String).filter((f) => f.endsWith('.html'))
    .map((f) => path.join('examples', f).split(path.sep).join('/'))];

test('no classic <script src> loads an ES module; all script srcs resolve', () => {
  const problems = [];
  for (const page of pages) {
    const s = readFileSync(path.join(ROOT, page), 'utf8');
    for (const m of s.matchAll(/<script\s+([^>]*)src="([^"]+)"([^>]*)>/g)) {
      const attrs = m[1] + m[3];
      if (/type="module"/.test(attrs)) continue;
      const src = m[2];
      if (/^https?:/.test(src)) continue;
      const target = path.join(ROOT, path.dirname(page), src.split('?')[0]);
      if (!existsSync(target)) { problems.push(`${page}: missing src ${src}`); continue; }
      if (/^\s*(import|export)\s/m.test(readFileSync(target, 'utf8'))) {
        problems.push(`${page}: classic <script> loads ES module ${src} — add type="module"`);
      }
    }
  }
  assert.deepEqual(problems, []);
});
