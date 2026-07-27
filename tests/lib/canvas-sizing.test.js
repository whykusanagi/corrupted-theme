// tests/lib/canvas-sizing.test.js — source-level guard for the HiDPI sizing fix
import { strict as assert } from 'node:assert';
import { test } from 'node:test';
import { readFileSync } from 'node:fs';

const read = f => readFileSync(new URL(`../../src/lib/${f}`, import.meta.url), 'utf8');
const HELPER = read('_canvas-sizing.js');
const CANVAS_COMPONENTS = ['corrupted-globe.js', 'corrupted-graph.js', 'audio-spectrum.js'];

test('every canvas component sizes through the shared helper', () => {
  // Duplicating the DPR dance per component is how the sizing bug reached
  // three files at once. One helper, one place to fix it.
  for (const f of CANVAS_COMPONENTS) {
    const src = read(f);
    assert.match(src, /import \{ fitCanvas \} from '\.\/_canvas-sizing\.js'/, `${f} imports the helper`);
    assert.match(src, /fitCanvas\(this\.canvas, this\.ctx/, `${f} calls it`);
  }
});

test('no component re-implements the DPR resize inline', () => {
  for (const f of CANVAS_COMPONENTS) {
    const src = read(f);
    assert.ok(!/devicePixelRatio/.test(src), `${f} must not compute DPR itself`);
    assert.ok(!/canvas\.width = Math\.round/.test(src), `${f} must not set the backing store itself`);
  }
});

test('the helper pins CSS size only when the attribute drives layout', () => {
  // A bare <canvas width=600> takes its LAYOUT size from the attribute, so
  // writing the DPR-scaled backing size grows the element, re-fires the
  // ResizeObserver and doubles it again. Canvases sized by CSS must be left
  // alone or they stop being responsive.
  assert.match(HELPER, /function attributeDrivesLayout\(canvas\)/);
  assert.match(HELPER, /canvas\.style\.width = `\$\{rect\.width\}px`/);
  const fn = HELPER.match(/if \(state\.__ctSizingProbed === undefined\)[\s\S]*?\n  \}/)[0];
  assert.match(fn, /if \(state\.__ctSizingProbed\)/, 'pinning is conditional on the probe');
});

test('the probe restores the attribute it nudged', () => {
  const fn = HELPER.match(/function attributeDrivesLayout[\s\S]*?\n\}/)[0];
  assert.match(fn, /const original = canvas\.width;/);
  assert.match(fn, /canvas\.width = original;/, 'must restore, not leave the nudged value');
});

test('zero-sized canvases are a no-op, not a divide-by-zero', () => {
  assert.match(HELPER, /if \(rect\.width === 0 \|\| rect\.height === 0\) return null;/);
});
