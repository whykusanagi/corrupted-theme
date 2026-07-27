// tests/data/documented-defaults.test.js
//
// Asserts that every DOCUMENTED default matches the REAL runtime default.
//
// This class of defect is invisible to both of the other checks we run: the
// docs look right, and blind implementers get plausible behaviour, so nobody
// notices the published number is wrong. It surfaced a real one — `tilt` was
// documented in degrees but stored in radians, so `globe.options.tilt = -30`
// silently meant -1719 degrees. The sibling options (spin, layout, style) are
// live-writable and the example pages write them, so callers do exactly that.
import { strict as assert } from 'node:assert';
import { test } from 'node:test';
import manifest from '../../dist/manifest.json' with { type: 'json' };
import { CorruptedGlobe } from '../../src/lib/corrupted-globe.js';
import { CorruptedGraph } from '../../src/lib/corrupted-graph.js';
import { AudioSpectrum } from '../../src/lib/audio-spectrum.js';
import { MicroGfx } from '../../src/lib/micro-gfx.js';
import { createFrameClock, createDissolve } from '../../src/core/canvas-seek.js';
import { LIPSYNC, approach } from '../../src/core/lipsync.js';

/** Constructor inputs that are stored as data, not as config on `.options`. */
const DATA_NOT_CONFIG = new Set(['points', 'nodes', 'edges', 'source']);

/** Parse a documented default string back into a JS value. */
function parseDocDefault(d) {
  const t = String(d).trim();
  if (t === 'null') return null;
  if (t === 'true') return true;
  if (t === 'false') return false;
  if (t === '[]') return [];
  const unquoted = t.replace(/^'|'$/g, '');
  if (unquoted !== t) return unquoted;
  return t !== '' && !Number.isNaN(Number(t)) ? Number(t) : t;
}

const CASES = [
  ['./corrupted-globe', () => new CorruptedGlobe(null)],
  ['./corrupted-graph', () => new CorruptedGraph(null)],
  ['./audio-spectrum', () => new AudioSpectrum(null)],
];

for (const [key, make] of CASES) {
  test(`${key}: documented defaults match the constructed instance`, () => {
    const entry = manifest.exports.find((e) => e.export === key);
    assert.ok(entry, `${key} is in the manifest`);
    const inst = make();
    let compared = 0;

    for (const o of entry.options ?? []) {
      if (o.default === undefined || DATA_NOT_CONFIG.has(o.name)) continue;
      const documented = parseDocDefault(o.default);
      // Nested option groups are compared by their own sub-entries.
      if (typeof documented === 'object' && documented !== null) continue;
      const actual = inst.options[o.name];
      if (typeof actual === 'object' && actual !== null) continue;

      assert.notEqual(actual, undefined,
        `${key}: '${o.name}' is documented with a default but is absent from options`);
      assert.equal(actual, documented,
        `${key}: '${o.name}' documented as ${JSON.stringify(documented)} but is ${JSON.stringify(actual)}`);
      compared++;
    }
    assert.ok(compared >= 4, `${key}: expected several defaults to compare, got ${compared}`);
  });
}

test('a documented default published as a malformed literal fails loudly', () => {
  // `[options.nodes=[]]` once published its default as a bare `[` because the
  // extractor stopped at the first `]`. Anything unparseable is a doc defect.
  for (const e of manifest.exports) {
    for (const o of e.options ?? []) {
      if (o.default === undefined) continue;
      assert.ok(!/^[[({]$|^\s*$/.test(String(o.default)),
        `${e.export}: '${o.name}' has a malformed default ${JSON.stringify(o.default)}`);
    }
  }
});

test('corrupted-globe: tilt is stored in the unit it is documented in', () => {
  assert.equal(new CorruptedGlobe(null).options.tilt, -18, 'degrees, not radians');
  assert.equal(new CorruptedGlobe(null, { tilt: -30 }).options.tilt, -30);
  // And the conversion still happens where it matters.
  const flat = new CorruptedGlobe(null, { tilt: 0 });
  const tilted = new CorruptedGlobe(null, { tilt: -18 });
  for (const g of [flat, tilted]) { g._cssW = 400; g._cssH = 400; g._R = 100; }
  assert.notEqual(flat.proj(45, 0).y, tilted.proj(45, 0).y, 'tilt still affects projection');
});

test('canvas-seek: documented defaults and phase enum hold at runtime', () => {
  assert.equal(createFrameClock().fps, 30);
  const env = createDissolve();
  assert.equal(env.total, 2800, '800 reveal + 1200 hold + 800 dissolve');

  const seen = new Set();
  for (let t = 0; t <= env.total + 200; t += 10) seen.add(env.at(t).phase);
  for (const p of ['reveal', 'hold', 'dissolve', 'gone']) {
    assert.ok(seen.has(p), `documented phase '${p}' is reachable`);
  }
  // The documented curve: rises 0→1, holds at 1, falls back to 0.
  assert.equal(env.at(0).revealed, 0);
  assert.equal(env.at(800).revealed, 1);
  assert.equal(env.at(1500).revealed, 1);
  assert.equal(env.at(2800).revealed, 0);
});

test('lipsync: documented constants and argument order hold at runtime', () => {
  assert.equal(LIPSYNC.SMOOTH_FACTOR, 0.5);
  assert.equal(LIPSYNC.RMS_CEILING, 0.06);
  assert.equal(LIPSYNC.INTERP, 0.35);
  // approach(current, target, step) — a swapped order would return 0.5 too,
  // so check an asymmetric case that only holds for the documented order.
  assert.equal(approach(0, 1, 0.25), 0.25);
  assert.equal(approach(1, 0, 0.25), 0.75);
});

test('micro-gfx: published format sizes match the real table', () => {
  assert.deepEqual(MicroGfx.formats, {
    card:     { w: 1200, h: 630 },
    banner:   { w: 1500, h: 500 },
    poster:   { w: 1080, h: 1350 },
    portrait: { w: 1080, h: 1920 },
    square:   { w: 1080, h: 1080 },
  });
  assert.deepEqual(MicroGfx.themes, ['magenta', 'violet', 'mono', 'void']);
  assert.throws(() => MicroGfx.generate(), /requires a DOM/);
});
