// tests/data/agent-surface-css.test.js — the agent surface must describe the
// stylesheets too.
//
// A CSS export reached dist/manifest.json as its path and nothing else, so the
// release whose headline was ~90 classes was invisible to the surface that
// exists for agents to read. Both blind agents in the 0.3.4 docs validation
// reported it independently: given only llms.txt they could not answer a single
// question about the vocabulary.
import assert from 'node:assert/strict';
import { test } from 'node:test';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { describeStylesheet } from '../../scripts/generate-manifest.js';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const read = (p) => readFileSync(path.join(ROOT, p), 'utf8');
const manifest = () => JSON.parse(read('dist/manifest.json'));

test('a stylesheet entry describes what it defines and what it reads', () => {
  const editorial = manifest().exports.find((e) => e.export === './editorial');
  assert.ok(editorial, './editorial is not in the manifest');
  for (const cls of ['ct-card', 'ct-rank', 'ct-label', 'ct-spark']) {
    assert.ok(editorial.classes.includes(cls), `manifest omits .${cls}`);
  }
  for (const mod of ['is-raised', 'has-tick']) {
    assert.ok(editorial.modifiers.includes(mod), `manifest omits .${mod}`);
  }
  assert.equal(editorial.knobs['--ct-grid-min'], '260px');
  assert.equal(editorial.knobs['--ct-measure'], '47rem');
});

test('a stylesheet entry matches what the file actually defines', () => {
  // Both directions, and modifiers too. A one-way `claims .x` check passed when
  // a class vanished from a selector but survived in a comment, and it never
  // read e.modifiers at all.
  for (const e of manifest().exports.filter((x) => x.type === 'css')) {
    const fresh = describeStylesheet(read(e.path));
    assert.deepEqual(e.classes, fresh.classes, `${e.export} classes are stale`);
    assert.deepEqual(e.modifiers, fresh.modifiers, `${e.export} modifiers are stale`);
  }
});

test('a stylesheet with no classes describes itself without crashing', () => {
  // variables.css is :root tokens only; theme.css is nothing but @imports.
  for (const rel of ['src/css/variables.css', 'src/css/theme.css']) {
    const out = describeStylesheet(read(rel));
    assert.ok(Array.isArray(out.classes), rel);
    assert.ok(Array.isArray(out.modifiers), rel);
    assert.equal(typeof out.knobs, 'object', rel);
  }
  const empty = describeStylesheet('');
  assert.deepEqual(empty.classes, []);
  assert.deepEqual(empty.modifiers, []);
  assert.deepEqual(empty.knobs, {});
});

test('the class names 0.3.4 removed appear nowhere in the agent surface', () => {
  const surface = read('dist/manifest.json') + read('dist/llms.txt');
  for (const gone of ['ct-tile', 'ct-stat', 'ct-cell', 'ct-spark-cap', 'ct-media-portrait']) {
    assert.ok(!new RegExp(`${gone}\\b`).test(surface), `${gone} survives in the agent surface`);
  }
});

test('llms.txt stays inside its dense-surface budget', () => {
  // It is read whole by an agent before anything else, so it has a size bound.
  //
  // 0.3.0 built it against 16KB at ~10KB of content and then never asserted it:
  // by 0.3.4 the file was 24.5KB before this release added anything, because
  // every component since has appended a line and one of them (corrupted-flares)
  // is 2.2KB on its own. Describing the stylesheets costs ~2.2KB more. The bound
  // here is the one that holds today, and it exists so the next release cannot
  // grow the file unnoticed the way the last four did. Shrinking the JS entries
  // is its own piece of work.
  const bytes = Buffer.byteLength(read('dist/llms.txt'));
  assert.ok(bytes < 32768, `llms.txt is ${bytes} bytes`);
});

test('a knob default survives nested parens, and a nested var() is its own knob', () => {
  // The fallback scanner stopped at the first ')', so every default carrying
  // parens reached the surface truncated — `var(--accent` for --ct-tone — and a
  // var() nested inside a fallback was swallowed whole, which hid --ct-cols,
  // the column-count knob, from the release that exists to describe it.
  const d = describeStylesheet('.a{color:var(--x, rgba(1, 2, 3, .4)); gap:var(--y, calc(var(--z, 2) * 1rem))}');
  assert.equal(d.knobs['--x'], 'rgba(1, 2, 3, .4)');
  assert.equal(d.knobs['--y'], 'calc(var(--z, 2) * 1rem)');
  assert.equal(d.knobs['--z'], '2');
  assert.equal(describeStylesheet('.a{color:var(--bare)}').knobs['--bare'], null);

  const editorial = manifest().exports.find((e) => e.export === './editorial');
  assert.equal(editorial.knobs['--ct-tone'], 'var(--accent)');
  assert.equal(editorial.knobs['--ct-row-cols'], 'auto minmax(0, 1fr) auto');
  assert.ok('--ct-cols' in editorial.knobs, 'manifest omits the --ct-cols knob');
});

test('no stylesheet reaches the surface with a truncated knob default', () => {
  // The guard the first version did not have: it asserted two knobs whose
  // defaults happened to be scalars, so it could not see six broken ones.
  for (const e of manifest().exports.filter((x) => x.type === 'css')) {
    for (const [name, value] of Object.entries(e.knobs ?? {})) {
      if (value === null) continue;
      const opens = (value.match(/\(/g) ?? []).length;
      const closes = (value.match(/\)/g) ?? []).length;
      assert.equal(opens, closes, `${e.export} ${name} default is unbalanced: ${JSON.stringify(value)}`);
    }
  }
});

test('an @import target is not a class', () => {
  // `@import './variables.css'` matched the class regex, so the root export
  // published a phantom class named `css` — and the drift guard passed, because
  // `.css` does appear in the file it checks against.
  assert.deepEqual(describeStylesheet("@import './variables.css';\n.real{color:red}").classes, ['real']);
  assert.deepEqual(describeStylesheet('@import url("x/y.css");').classes, []);
  assert.deepEqual(describeStylesheet(read('src/css/variables.css')).classes, []);
  for (const e of manifest().exports.filter((x) => x.type === 'css')) {
    for (const ext of ['css', 'png', 'woff2', 'svg', 'json']) {
      assert.ok(!e.classes.includes(ext), `${e.export} publishes phantom class .${ext}`);
    }
  }
});

test('a var() fallback survives nested parens and quoted strings', () => {
  const { knobs } = describeStylesheet(`
    .a { content: var(--ct-label, "yes)"); }
    .b { grid-template-columns: repeat(var(--ct-cols, 2), minmax(0, 1fr)); }
    .c { color: var(--ct-tone, var(--accent)); }
  `);
  assert.equal(knobs['--ct-label'], '"yes)"');   // the paren is inside a string
  assert.equal(knobs['--ct-cols'], '2');         // nested var() is its own knob
  assert.equal(knobs['--ct-tone'], 'var(--accent)');
});

test('a quoted attribute value is not a class', () => {
  const { classes } = describeStylesheet('.ct-card[data-label=".secret"] { color: red }');
  assert.deepEqual(classes, ['ct-card']);
});
