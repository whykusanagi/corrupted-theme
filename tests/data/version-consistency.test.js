// tests/data/version-consistency.test.js — one version, asserted everywhere.
//
// CLAUDE.md §5 says version numbers must be synchronised, and
// docs/governance/VERSION_REFERENCES.md keeps a hand-maintained table of every
// file that carries one. That table drifts: its line numbers date from the
// 0.1.x era, and it never listed examples/anime-blocks-advanced.html at all, so
// nine HTML footers still advertised v0.3.2 after the 0.3.3 bump — along with
// four CDN pins and two npm install examples that would have handed readers the
// previous release.
//
// A checklist cannot enforce itself. This can.
//
// The rule is narrow on purpose: only strings that ASSERT THE CURRENT VERSION
// are checked. Historical references — CHANGELOG entries, `@version` module
// headers recording when a file last changed, "new in 0.3.1" feature labels,
// version-history table rows — are release history and must never be rewritten.
import { strict as assert } from 'node:assert';
import { test } from 'node:test';
import { readFileSync, readdirSync, statSync, existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const VERSION = JSON.parse(readFileSync(path.join(ROOT, 'package.json'), 'utf8')).version;

/**
 * Patterns that claim to be the shipped version. Each capture must equal
 * package.json's version.
 */
const CLAIMS = [
  ['page footer', /Corrupted Theme<\/strong>\s*v(\d+\.\d+\.\d+)/g],
  ['page footer', /Corrupted Theme v(\d+\.\d+\.\d+)/g],
  ['hero badge', />v(\d+\.\d+\.\d+)\s*(?:—|-|&mdash;)/g],
  ['CDN pin', /corrupted-theme\/@(\d+\.\d+\.\d+)\//g],
  ['npm install pin', /@whykusanagi\/corrupted-theme@(\d+\.\d+\.\d+)/g],
  ['current-version line', /[Cc]urrent [Vv]ersion\**:?\s*\**\s*(\d+\.\d+\.\d+)/g],
];

/**
 * Files whose version strings are illustrative, not live. Both are called out
 * in VERSION_REFERENCES.md's "What to Leave Alone" section: they show what a
 * release note or an `npm list` output looks like, using an arbitrary version.
 */
const ILLUSTRATIVE = new Set([
  'docs/governance/DESIGN_SYSTEM_GOVERNANCE.md',
  'docs/governance/VERSION_MANAGEMENT.md',
]);

/** Release history — every past version legitimately appears here. */
const HISTORY = (rel) => rel === 'CHANGELOG.md' || rel.includes('docs/planning/');

function docsAndPages() {
  const out = [];
  (function walk(dir) {
    if (!existsSync(path.join(ROOT, dir))) return;
    for (const e of readdirSync(path.join(ROOT, dir))) {
      if (e === 'node_modules' || e === '.git') continue;
      const rel = path.join(dir, e);
      if (statSync(path.join(ROOT, rel)).isDirectory()) { walk(rel); continue; }
      if (/\.(md|html)$/.test(e) && !e.includes('.min.')) out.push(rel);
    }
  })('docs');
  (function walk(dir) {
    for (const e of readdirSync(path.join(ROOT, dir))) {
      const rel = path.join(dir, e);
      if (statSync(path.join(ROOT, rel)).isDirectory()) { walk(rel); continue; }
      if (e.endsWith('.html')) out.push(rel);
    }
  })('examples');
  out.push('index.html', 'README.md');
  return out.filter((f) => !HISTORY(f) && !ILLUSTRATIVE.has(f));
}

test('every current-version claim matches package.json', () => {
  const stale = [];
  for (const rel of docsAndPages()) {
    const src = readFileSync(path.join(ROOT, rel), 'utf8');
    for (const [kind, rx] of CLAIMS) {
      for (const m of src.matchAll(rx)) {
        if (m[1] !== VERSION) stale.push(`${rel}: ${kind} says ${m[1]}, package.json says ${VERSION}`);
      }
    }
  }
  assert.deepEqual([...new Set(stale)], [],
    'these advertise a version the package no longer is — a stale CDN or install '
    + 'pin hands the reader the previous release');
});

test('the governance checklist records the current version', () => {
  const p = path.join(ROOT, 'docs/governance/VERSION_REFERENCES.md');
  if (!existsSync(p)) return;   // untracked, local-only; skip where absent
  const m = /\*\*Current Version\*\*:\s*(\d+\.\d+\.\d+)/.exec(readFileSync(p, 'utf8'));
  assert.ok(m, 'VERSION_REFERENCES.md must state a Current Version');
  assert.equal(m[1], VERSION);
});

test('the flares module header matches the release it ships in', () => {
  // Module @version headers record when a file last changed, so most legitimately
  // lag. The one added this release must not.
  const src = readFileSync(path.join(ROOT, 'src/lib/corrupted-flares.js'), 'utf8');
  const m = /@version\s+(\d+\.\d+\.\d+)/.exec(src);
  assert.ok(m, 'corrupted-flares.js must carry an @version');
  assert.equal(m[1], VERSION);
});

test('the spec header matches its own newest Version History entry', () => {
  // The header said 1.2 while the history already recorded 1.3 — the spec
  // contradicting itself about what version it is.
  const src = readFileSync(path.join(ROOT, 'CORRUPTED_THEME_SPEC.md'), 'utf8');
  const header = /^\*\*Version:\*\*\s*(\d+\.\d+)/m.exec(src);
  assert.ok(header, 'spec must declare a **Version:**');
  const newest = /^- \*\*(\d+\.\d+)\*\*\s*\(/m.exec(src.slice(src.indexOf('## Version History')));
  assert.ok(newest, 'spec must have a Version History');
  assert.equal(header[1], newest[1],
    'spec header and the top Version History entry disagree');
});
