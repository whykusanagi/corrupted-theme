// tests/data/agent-surface-css.test.js — the agent surface must describe the
// stylesheets too.
//
// A CSS export reached dist/manifest.json as its path and nothing else, so the
// release whose headline was ~90 classes was invisible to the surface that
// exists for agents to read. Both blind agents in the 0.3.4 docs validation
// reported it independently: given only llms.txt they could not answer a single
// question about the vocabulary.
import { strict as assert } from 'node:assert';
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

test('every class the manifest claims for a stylesheet is defined in it', () => {
  // The surface must not drift from the file it describes.
  for (const e of manifest().exports.filter((x) => x.type === 'css')) {
    const src = read(e.path);
    for (const cls of e.classes) {
      assert.ok(new RegExp(`\\.${cls}\\b`).test(src), `${e.export} claims .${cls}`);
    }
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
