// tests/data/editorial.test.js — guards for src/css/editorial.css (#76).
//
// These primitives were promoted because four consumers had each re-derived
// them and drifted. The guards below pin the decisions that make one shared
// copy safe to ship in the global bundle: prefixed names, token-only colour,
// motion that respects reduced-motion, labels that pass AA, and a demo page
// that exercises every class so the documented markup cannot rot.
import { strict as assert } from 'node:assert';
import { test } from 'node:test';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const read = (p) => readFileSync(path.join(ROOT, p), 'utf8');

const css = read('src/css/editorial.css');
const code = css.replace(/\/\*[\s\S]*?\*\//g, '');

/** Class names used in selectors (declaration bodies stripped first). */
function selectorClasses(source) {
  const selectors = source.replace(/\{[^{}]*\}/g, '{}');
  return new Set([...selectors.matchAll(/\.([a-zA-Z][\w-]*)/g)].map((m) => m[1]));
}

const classes = selectorClasses(code);

test('every class is ct- prefixed, or an is-* state on a ct- element', () => {
  // The sheet ships in the global bundle: a bare .tile or .spark would style
  // any consumer element that happens to share the name.
  const bad = [...classes].filter((c) => !c.startsWith('ct-') && !c.startsWith('is-'));
  assert.deepEqual(bad, []);
  for (const state of [...classes].filter((c) => c.startsWith('is-'))) {
    const uses = code.match(new RegExp(`[^\\s,{}]*\\.${state}\\b`, 'g'));
    for (const u of uses) assert.match(u, /\.ct-/, `.${state} must be scoped to a ct- element: ${u}`);
  }
});

test('keyframes are ct- prefixed', () => {
  for (const [, name] of code.matchAll(/@keyframes\s+([\w-]+)/g)) {
    assert.ok(name.startsWith('ct-'), `@keyframes ${name}`);
  }
});

test('colour comes from tokens only — no literal hex, rgb() or hsl()', () => {
  // Every literal in the ported rules equalled an existing token; keeping them
  // as tokens is what lets a consumer who overrides --accent get consistent
  // chrome, and it keeps color-sweep's ALLOWED list untouched.
  const literals = code.match(/#[0-9a-fA-F]{3,8}\b|\brgba?\(|\bhsla?\(/g) ?? [];
  assert.deepEqual(literals, []);
});

test('no --text-muted: it is under 4.5:1 on every surface these blocks use', () => {
  assert.doesNotMatch(code, /--text-muted/);
});

test('callout tones stay on the palette; accents never become a status', () => {
  const tone = (cls) => code.match(new RegExp(`\\.${cls}\\s*\\{\\s*--ct-tone:\\s*([^;]+);`))?.[1].trim();
  assert.equal(tone('ct-key'), 'var(--accent)');
  assert.equal(tone('ct-info'), 'var(--corrupted-purple)', 'info is violet, not cyan');
  assert.equal(tone('ct-warn'), 'var(--corrupted-red)');
  assert.doesNotMatch(code, /--corrupted-cyan|--corrupted-green/, 'cyan/green carry no data meaning here');
});

test('every animation runs only under prefers-reduced-motion: no-preference', () => {
  const guarded = code.match(/@media\s*\(prefers-reduced-motion:\s*no-preference\)\s*\{([\s\S]*?\})\s*\}/g) ?? [];
  const inside = guarded.join('\n');
  const all = code.match(/\banimation\s*:[^;]+;/g) ?? [];
  assert.ok(all.length > 0, 'expected the kicker pulse');
  for (const a of all) assert.ok(inside.includes(a), `unguarded: ${a}`);
});

test('gradient title has a forced-colors fallback', () => {
  assert.match(code, /@media\s*\(forced-colors:\s*active\)\s*\{\s*\.ct-title\s*\{[^}]*-webkit-text-fill-color:\s*CanvasText/);
});

test('an empty spark bar is declared after, and at least as specific as, the dimmed-bar rule', () => {
  // The yap port had these the other way round, so an empty bar never read as
  // empty. Equal specificity means source order decides.
  const dim = code.indexOf('.ct-spark-bar:not(:last-child)');
  const empty = code.indexOf('.ct-spark .ct-spark-bar.is-empty');
  assert.ok(dim > -1 && empty > dim);
});

test('.ct-cols collapses to one column only inside a media query', () => {
  // The yap port shipped the mobile rule bare, so columns never sat side by
  // side at any width.
  const bare = code.replace(/@media[^{]*\{(?:[^{}]*\{[^{}]*\})*[^{}]*\}/g, '');
  assert.doesNotMatch(bare, /\.ct-cols\s*\{[^}]*grid-template-columns:\s*1fr\s*;/);
});

test('--font-mono is declared, so its existing var() fallbacks stop firing', () => {
  assert.match(read('src/css/variables.css'), /--font-mono:\s*[^;]*monospace;/);
});

test('bundled in theme.css and exported on its own', () => {
  assert.match(read('src/css/theme.css'), /@import '\.\/editorial\.css';/);
  const pkg = JSON.parse(read('package.json'));
  assert.equal(pkg.exports['./editorial'], './src/css/editorial.css');
});

test('the demo page uses every class, and only classes that exist', () => {
  const html = read('examples/editorial.html');
  const used = new Set();
  for (const [, list] of html.matchAll(/class="([^"]*)"/g)) {
    for (const c of list.split(/\s+/)) if (c.startsWith('ct-') || c.startsWith('is-')) used.add(c);
  }
  const unknown = [...used].filter((c) => !classes.has(c));
  const unused = [...classes].filter((c) => !used.has(c));
  assert.deepEqual(unknown, [], 'demo uses classes the module does not define');
  assert.deepEqual(unused, [], 'module defines classes the demo never shows');
});

test('the reference doc shows markup for every component family', () => {
  const doc = read('docs/COMPONENTS_REFERENCE.md');
  const section = doc.slice(doc.indexOf('## Editorial'));
  assert.ok(section.length > 0 && doc.includes('## Editorial'));
  for (const root of ['ct-article', 'ct-section-h', 'ct-table', 'ct-callout', 'ct-cols', 'ct-grid',
    'ct-stat-row', 'ct-quote', 'ct-tiles', 'ct-spark', 'ct-awards']) {
    assert.match(section, new RegExp(`class="${root}[ "]`), `no markup example for .${root}`);
  }
});

test('quote attribution resets the global page-footer styles it would inherit', () => {
  // theme.css styles every <footer> as a page footer (border-top, padding).
  // The documented markup puts the attribution in a <footer>, so without a
  // reset a divider and an inset appear inside every quote.
  assert.match(read('src/css/theme.css'), /\nfooter\s*\{[^}]*border-top/);
  const attr = code.match(/\.ct-quote-attr\s*\{([^}]*)\}/)[1];
  assert.match(attr, /padding:\s*0;/);
  assert.match(attr, /border-top:\s*0;/);
});
