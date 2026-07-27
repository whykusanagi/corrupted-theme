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
  assert.deepEqual(MicroGfx.primitives, [
    'barcode', 'dotMatrix', 'gaugeStack', 'histogram', 'coordReadout',
    'dimension', 'sparkline', 'keyValue', 'qr',
  ]);
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
  assert.match(CODE, /const ARCHETYPES = \['columnLeft', 'columnRight', 'split', 'band', 'wall', 'wall'\]/);
  assert.match(CODE, /const kind = pick\(rng, ARCHETYPES\)/, 'archetype is seeded');
  assert.match(CODE, /const order = shuffled\(rng, available\)/, 'primitive order is seeded');
  assert.match(CODE, /const count = min \+ Math\.floor\(rng\(\)/, 'primitive count is seeded');
  // Unspecified layers are seeded; explicit options still win.
  assert.match(CODE, /base:\s+ul\.base\s+\?\? pick\(rng,/);
  assert.match(CODE, /halftone:\s+ul\.halftone\s+\?\? rng\(\)/);
});

test('modules carry the full anatomy, in the theme\'s own vocabulary', () => {
  // The reference this grammar borrows from says ACCESS GRANTED / INPUT
  // VERIFIED. Ours must speak the corrupted dialect, and it must reuse the
  // vocabulary that already exists rather than inventing a second one.
  assert.match(CODE, /import \{[\s\S]*?TERMINAL_HEADERS[\s\S]*?\} from '\.\.\/core\/terminal-vocab\.js'/);
  assert.match(CODE, /pick\(rng, headers\)/, 'status line comes from TERMINAL_HEADERS');
  assert.match(CODE, /nsfw \? \[\.\.\.TERMINAL_STATUS, \.\.\.NSFW_TERMINAL_STATUS\]/,
    'keyValue honours the NSFW split');
  // Module anatomy: mark+unit+pill, status, display, body, footer.
  for (const part of ['MARKS', 'UNITS', 'PILL_KEYS']) {
    assert.match(CODE, new RegExp(`const ${part} = \\[`), `${part} defined`);
  }
  assert.match(CODE, /function drawModule\(parent, ctx, box, bodyName\)/);
  // Slots too short for the anatomy fall back to a bare primitive.
  assert.match(CODE, /if \(box\.h >= 110\) drawModule/);
});

test('the package ships no persona strings in module headers', () => {
  const units = CODE.match(/const UNITS = \[[\s\S]*?\];/)[0];
  for (const banned of ['celeste', 'kusanagi', 'abyss', 'succubus']) {
    assert.ok(!units.toLowerCase().includes(banned), `UNITS must stay impersonal: ${banned}`);
  }
});

test('paper polarity inverts the field, not the palette', () => {
  // Not the print-industrial cream-and-black it borrows grammar from: magenta
  // and violet keep carrying structure, cyan stays accent-only.
  assert.match(CODE, /const PAPER_FIELDS = \[/);
  assert.match(CODE, /const PAPER_INK = '#1a1430'/);
  const fn = CODE.match(/function resolvePolarity[\s\S]*?\n\}/)[0];
  assert.match(fn, /\.\.\.theme, bg: field, ink: PAPER_INK/,
    'only bg and ink change; structure/accent/highlight are preserved');
});

test('polarity is an independent axis — it must not perturb the rng stream', () => {
  // Branching on the option consumed a different number of rng draws in each
  // arm, so the same seed produced a different composition per polarity.
  // Both draws now always happen and the unused one is discarded.
  const fn = CODE.match(/function resolvePolarity[\s\S]*?\n\}/)[0];
  assert.match(fn, /const seeded = pick\(rng, POLARITY_POOL\);\s*\n\s*const field = pick\(rng, PAPER_FIELDS\);/,
    'both draws happen unconditionally, before any branch');
  const branchIdx = fn.indexOf('requested === ');
  const drawIdx = fn.lastIndexOf('pick(rng,');
  assert.ok(drawIdx < branchIdx, 'no rng draw may sit inside the polarity branch');
});

/** WCAG relative luminance + contrast ratio. */
function luminance(hex) {
  const c = [1, 3, 5].map(i => parseInt(hex.slice(i, i + 2), 16) / 255)
    .map(v => (v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4));
  return 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2];
}
const contrast = (a, b) => {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
};

test('Pattern 5 accessibility: primary text clears 4.5:1 in both polarities', () => {
  // The spec requires primary text to stay legible against its local
  // background. Both polarities have to hold it, not just the dark default.
  const themes = CODE.match(/const THEMES = \{[\s\S]*?\n\};/)[0];
  const rows = [...themes.matchAll(/(\w+):\s*\{ bg: '(#[0-9a-f]{6})', ink: '(#[0-9a-f]{6})'/g)];
  assert.ok(rows.length >= 4, 'found the theme table');
  for (const [, name, bg, ink] of rows) {
    const r = contrast(ink, bg);
    assert.ok(r >= 4.5, `dark/${name}: ink on bg is ${r.toFixed(1)}:1`);
  }
  // Paper polarity: the deep-violet ink against every pale field.
  const paperInk = /const PAPER_INK = '(#[0-9a-f]{6})'/.exec(CODE)[1];
  const fields = [...CODE.match(/const PAPER_FIELDS = \[([^\]]*)\]/)[1]
    .matchAll(/#[0-9a-f]{6}/g)].map(m => m[0]);
  assert.ok(fields.length >= 3, 'found the paper fields');
  for (const f of fields) {
    const r = contrast(paperInk, f);
    assert.ok(r >= 4.5, `paper field ${f}: ink is ${r.toFixed(1)}:1`);
  }
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
