// tests/lib/corrupted-mandala.test.js — pure-logic tests (no DOM)
import { strict as assert } from 'node:assert';
import { test } from 'node:test';
import { CorruptedMandala } from '../../src/lib/corrupted-mandala.js';
import { SFW_PHRASES } from '../../src/core/corruption-phrases.js';

test('de-themed defaults (no persona strings)', () => {
  const m = new CorruptedMandala(null);
  assert.equal(m.options.labelTop, 'CORRUPTED');
  assert.equal(m.options.labelBottom, 'ARCHIVE.SYS');
  assert.equal(m.options.starDensity, 'medium');
  assert.equal(m.options.mandorla, true);
  assert.equal(m.options.nsfw, false);
});

test('seeded ring phrases are deterministic and SFW by default', () => {
  const a = new CorruptedMandala(null, { seed: 99 });
  const b = new CorruptedMandala(null, { seed: 99 });
  assert.deepEqual(a._phrases, b._phrases);
  for (const ring of ['outer', 'middle', 'inner']) {
    const phrase = a._phrases[ring][0];
    assert.ok(SFW_PHRASES.some(p => p.toUpperCase() === phrase), `${ring}: ${phrase}`);
  }
});

test('ringPhrases option overrides seeded picks', () => {
  const m = new CorruptedMandala(null, { ringPhrases: { outer: ['A'], middle: ['B'], inner: ['C'] } });
  assert.equal(m._getPhrase('outer'), 'A');
  assert.equal(m._getPhrase('inner'), 'C');
});

test('geometry: R = 0.46 * min(W,H), centered', () => {
  const m = new CorruptedMandala(null);
  m.currentW = 1920; m.currentH = 1080;
  const { cx, cy, R } = m._geom();
  assert.equal(cx, 960);
  assert.equal(cy, 540);
  assert.equal(R, 1080 * 0.46);
});

test('star path is a closed 4-point star scaled by size', () => {
  const m = new CorruptedMandala(null);
  const d = m._starPathD(16);
  assert.ok(d.startsWith('M 0,-16'));
  assert.ok(d.endsWith('Z'));
  assert.ok(d.includes('L 16,0'));
  assert.ok(d.includes('L 4,-4'));  // inner radius = size/4
});
