// tests/lib/micro-gfx.test.js — module-surface tests (no DOM)
//
// MicroGfx builds SVG as a DOM tree rather than concatenating markup, so
// generate() needs a document. Rendering is verified in the browser; these
// cover the parts that are checkable headless, plus the safety invariants
// that must hold in the source itself.
import { strict as assert } from 'node:assert';
import { test } from 'node:test';
import { readFileSync } from 'node:fs';
import { MicroGfx } from '../../src/lib/micro-gfx.js';

const SRC = readFileSync(new URL('../../src/lib/micro-gfx.js', import.meta.url), 'utf8');
/** Source with comments stripped — the module's own docs mention innerHTML in
 *  order to warn against it, and a prose mention is not a code path. */
const CODE = SRC.replace(/\/\*[\s\S]*?\*\//g, '').replace(/^\s*\/\/.*$/gm, '');

test('exposes formats, themes and primitives', () => {
  assert.deepEqual(Object.keys(MicroGfx.formats), ['card', 'banner', 'poster', 'portrait', 'square']);
  assert.deepEqual(MicroGfx.formats.card, { w: 1200, h: 630 });
  assert.deepEqual(MicroGfx.themes, ['magenta', 'violet', 'mono', 'void']);
  assert.deepEqual(MicroGfx.primitives,
    ['barcode', 'dotMatrix', 'gaugeStack', 'histogram', 'coordReadout', 'dimension']);
});

test('generate() fails loudly without a DOM rather than emitting broken markup', () => {
  assert.throws(() => MicroGfx.generate(), /requires a DOM/);
});

test('mount() is inert on bad input instead of throwing', () => {
  assert.equal(MicroGfx.mount(null, null), null);
  assert.equal(MicroGfx.mount({}, null), null);
});

/* ── Pattern 5 safety invariants, asserted against the source ───────────── */

test('S1: no markup is ever concatenated', () => {
  assert.ok(!/innerHTML/.test(CODE), 'no innerHTML');
  assert.ok(!/insertAdjacentHTML/.test(CODE), 'no insertAdjacentHTML');
  assert.ok(!/DOMParser/.test(CODE), 'no parsing of built strings back into DOM');
  // Elements come from createElementNS; caller text goes through textContent.
  assert.match(CODE, /createElementNS/);
  assert.match(CODE, /n\.textContent = String\(text\)/);
});

test('S1: every caller-supplied string reaches the SVG as element text', () => {
  // drawText must pass text.* as the `text` argument of el(), which is the
  // textContent path — never as an attribute value that could carry markup.
  for (const field of ['eyebrow', 'title', 'serial', 'nameplate']) {
    const re = new RegExp(`\\}, parent, text\\.${field}\\)`);
    assert.match(SRC, re, `text.${field} must be passed as textContent`);
  }
});

test('S3: no external references are emitted, so the PNG canvas cannot taint', () => {
  assert.ok(!/'image'/.test(CODE), 'no <image> elements');
  assert.ok(!/xlink:href/.test(CODE), 'no xlink:href');
  assert.ok(!/\bhref\b\s*:/.test(CODE), 'no href attributes');
});

test('the degradation filters implement Pattern 5', () => {
  assert.match(SRC, /id: 'mgfx-warp'/);
  assert.match(SRC, /id: 'mgfx-erode'/);
  assert.match(SRC, /id: 'mgfx-grain'/);
  assert.match(SRC, /feDisplacementMap/, 'warp displaces geometry');
  assert.match(SRC, /feComposite/, 'erode composites ink through a noise mask');
  assert.match(SRC, /stitchTiles/, 'grain tiles seamlessly');
});

test('every filter seeds from the composition seed, so damage is reproducible', () => {
  // Pattern 5 makes determinism non-negotiable: a poster you cannot
  // regenerate is not a design system output.
  assert.match(SRC, /const fs = seed % 1000/);
  const seedUses = SRC.match(/seed: fs|seed: \(fs \+ \d+\) % 1000/g) || [];
  assert.ok(seedUses.length >= 3, `all three filters seeded, found ${seedUses.length}`);
});

test('the seed drives composition, not just noise', () => {
  // The first cut varied texture but reused one of two fixed column layouts,
  // so every seed produced recognisably the same poster. Composition choices
  // — archetype, primitive order, primitive count, layer set — must all come
  // from the seeded rng.
  assert.match(CODE, /const ARCHETYPES = \['columnLeft', 'columnRight', 'split', 'band'\]/);
  assert.match(CODE, /const kind = pick\(rng, ARCHETYPES\)/, 'archetype is seeded');
  assert.match(CODE, /const order = shuffled\(rng, available\)/, 'primitive order is seeded');
  assert.match(CODE, /const count = min \+ Math\.floor\(rng\(\)/, 'primitive count is seeded');
  // Unspecified layers are seeded; explicit options still win.
  assert.match(CODE, /base:\s+ul\.base\s+\?\? pick\(rng,/);
  assert.match(CODE, /halftone:\s+ul\.halftone\s+\?\? rng\(\)/);
});

test('the palette uses theme colours; cyan and red appear only as highlights', () => {
  const themes = SRC.match(/const THEMES = \{[\s\S]*?\n\};/)[0];
  for (const line of themes.split('\n').filter(l => l.includes('bg:'))) {
    const highlight = /highlight: '(#[0-9a-f]{6})'/.exec(line);
    const accent = /accent: '(#[0-9a-f]{6})'/.exec(line);
    const structure = /structure: '(#[0-9a-f]{6})'/.exec(line);
    assert.ok(highlight, `theme declares a highlight: ${line.trim()}`);
    // Accents are legibility tools, so they may only sit in `highlight`.
    for (const m of [accent, structure]) {
      assert.ok(!['#00ffff', '#ff0000'].includes(m[1]),
        `accent colour ${m[1]} must not carry the composition: ${line.trim()}`);
    }
  }
});
