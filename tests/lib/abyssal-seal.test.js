// tests/lib/abyssal-seal.test.js — pure-logic tests (no DOM)
import { strict as assert } from 'node:assert';
import { test } from 'node:test';
import { AbyssalSeal, mottoState, mottoCycle } from '../../src/lib/abyssal-seal.js';

const M = { latin: '◈ PONDERA MEMINERUNT ◈', english: '◈ THE WEIGHTS REMEMBER ◈' };

test('de-themed defaults; seeded rings deterministic', () => {
  const a = new AbyssalSeal(null, { seed: 7 }), b = new AbyssalSeal(null, { seed: 7 });
  assert.equal(a.options.legendTop, 'SEAL OF THE CORRUPTED ARCHIVE');
  assert.equal(a._dataRing, b._dataRing);
  assert.equal(a._hiddenRing, b._hiddenRing);
});

test('motto phases in order across one cycle', () => {
  const cyc = mottoCycle();
  assert.ok(Math.abs(cyc - 10.2) < 1e-9);
  assert.equal(mottoState(1, M).phase, 'type');
  assert.equal(mottoState(3, M).text, M.latin);
  assert.equal(mottoState(5.5, M).phase, 'resolve');
  assert.equal(mottoState(8, M).text, M.english);
  assert.equal(mottoState(8 + cyc, M).text, M.english);      // loops
});

test('motto is a pure function of t', () => {
  for (const t of [0.37, 2.9, 5.1, 9.99]) assert.deepEqual(mottoState(t, M), mottoState(t, M));
});

test('held lines pin their left edge (no cursor re-centring)', () => {
  const on = mottoState(8.0, M), off = mottoState(8.5, M);
  assert.notEqual(on.cursorOn, off.cursorOn);
  assert.equal(on.start, off.start);
  assert.equal(on.text, off.text);
});

test('init/seek/destroy are safe without an svg', () => {
  const s = new AbyssalSeal(null);
  s.init().resize(1920, 1080).seek(3).setActive(true);
  s.destroy();
});
