// tests/core/canvas-seek.test.js — pure logic, no DOM
import { strict as assert } from 'node:assert';
import { test } from 'node:test';
import { createFrameClock, createDissolve } from '../../src/core/canvas-seek.js';

/* ── frame clock ────────────────────────────────────────────────────────── */

test('defaults to 30fps at frame 0', () => {
  const c = createFrameClock();
  assert.equal(c.fps, 30);
  assert.equal(c.frame, 0);
  assert.equal(c.time, 0);
});

test('time follows frame at the configured fps', () => {
  const c = createFrameClock({ fps: 25 });
  c.seek(50);
  assert.equal(c.time, 2000);
});

test('seek clamps negatives and floors fractions', () => {
  const c = createFrameClock();
  assert.equal(c.seek(-5), 0);
  assert.equal(c.seek(7.9), 7);
  assert.equal(c.seek(NaN), 0);
});

test('advance accumulates sub-frame remainder rather than dropping it', () => {
  // 10ms steps at 30fps (33.33ms/frame) must reach frame 3 after 100ms —
  // truncating each step instead would stay at frame 0 forever.
  const c = createFrameClock({ fps: 30 });
  for (let i = 0; i < 10; i++) c.advance(10);
  assert.equal(c.frame, 3);
});

test('advance does not drift over long runs', () => {
  // Subtracting a float frame-length in a loop stalls on exact boundaries and
  // loses frames steadily. Deriving from accumulated elapsed cannot: summing
  // 216k floats is off by ~3e-12 relative, which is at most one frame either
  // side of a boundary and never accumulates.
  const c = createFrameClock({ fps: 30 });
  const steps = 60 * 60 * 60;           // ~1h of 16.67ms frames
  for (let i = 0; i < steps; i++) c.advance(1000 / 60);
  const ideal = Math.floor((steps * (1000 / 60) * 30) / 1000);
  assert.ok(Math.abs(c.frame - ideal) <= 1,
    `after 1h expected ~${ideal} frames, got ${c.frame}`);
});

test('advance ignores non-positive deltas', () => {
  const c = createFrameClock();
  c.advance(-100);
  c.advance(0);
  c.advance(NaN);
  assert.equal(c.frame, 0);
});

test('frameAt maps time to a frame without moving the clock', () => {
  const c = createFrameClock({ fps: 30 });
  assert.equal(c.frameAt(1000), 30);
  assert.equal(c.frameAt(-5), 0);
  assert.equal(c.frame, 0, 'clock did not move');
});

/* ── determinism: the reason this module exists ─────────────────────────── */

test('the same frame yields the same values, however you arrive at it', () => {
  const c = createFrameClock({ seed: 1234 });
  c.seek(400);
  const viaSeek = [c.rngAt('particles')(), c.rngAt('particles')()];
  c.reset();
  for (let i = 0; i < 400; i++) c.advance(1000 / 30);
  const viaPlayback = [c.rngAt('particles')(), c.rngAt('particles')()];
  assert.deepEqual(viaSeek, viaPlayback);
});

test('rngFor renders any frame without seeking there first', () => {
  const c = createFrameClock({ seed: 99 });
  const direct = c.rngFor(750, 'glyphs')();
  c.seek(750);
  assert.equal(c.rngAt('glyphs')(), direct);
  assert.equal(c.frame, 750);
});

test('different frames, keys and seeds all decorrelate', () => {
  const c = createFrameClock({ seed: 5 });
  const a = c.rngFor(10, 'x')();
  assert.notEqual(a, c.rngFor(11, 'x')(), 'frame changes the stream');
  assert.notEqual(a, c.rngFor(10, 'y')(), 'key changes the stream');
  assert.notEqual(a, createFrameClock({ seed: 6 }).rngFor(10, 'x')(), 'seed changes the stream');
});

test('adjacent frames are not correlated (hash, not counter)', () => {
  // A naive seed+frame would make consecutive frames near-identical, which
  // shows up as visible banding in exported video.
  const c = createFrameClock({ seed: 7 });
  const firsts = [];
  for (let f = 0; f < 12; f++) firsts.push(c.rngFor(f, 'p')());
  const spread = Math.max(...firsts) - Math.min(...firsts);
  assert.ok(spread > 0.5, `adjacent frames should scatter, spread was ${spread.toFixed(3)}`);
});

test('two clocks with the same seed agree exactly', () => {
  const a = createFrameClock({ seed: 42 });
  const b = createFrameClock({ seed: 42 });
  for (const f of [0, 1, 99, 1000]) {
    assert.equal(a.rngFor(f)(), b.rngFor(f)());
  }
});

/* ── dissolve envelope ──────────────────────────────────────────────────── */

test('dissolve runs reveal -> hold -> dissolve -> gone', () => {
  const d = createDissolve({ revealMs: 800, holdMs: 1200, dissolveMs: 800 });
  assert.equal(d.total, 2800);
  assert.equal(d.at(0).phase, 'reveal');
  assert.equal(d.at(400).phase, 'reveal');
  assert.equal(d.at(900).phase, 'hold');
  assert.equal(d.at(2100).phase, 'dissolve');
  assert.equal(d.at(3000).phase, 'gone');
});

test('revealed rises to 1, holds, then falls back to 0', () => {
  const d = createDissolve({ revealMs: 1000, holdMs: 1000, dissolveMs: 1000 });
  assert.equal(d.at(0).revealed, 0);
  assert.equal(d.at(500).revealed, 0.5);
  assert.equal(d.at(1000).revealed, 1);
  assert.equal(d.at(1500).revealed, 1, 'holds fully revealed');
  assert.equal(d.at(2500).revealed, 0.5, 'falls back through the same values');
  assert.equal(d.at(9999).revealed, 0);
});

test('revealed is monotonic up then monotonic down — no flicker at the seams', () => {
  const d = createDissolve();
  let prev = -1;
  for (let t = 0; t <= 800; t += 40) {
    const v = d.at(t).revealed;
    assert.ok(v >= prev, `reveal must not go backwards at ${t}ms`);
    prev = v;
  }
  prev = 2;
  for (let t = 2000; t <= 2800; t += 40) {
    const v = d.at(t).revealed;
    assert.ok(v <= prev, `dissolve must not go forwards at ${t}ms`);
    prev = v;
  }
});

test('zero-length phases do not divide by zero', () => {
  const d = createDissolve({ revealMs: 0, holdMs: 0, dissolveMs: 0 });
  assert.equal(d.total, 0);
  const s = d.at(0);
  assert.equal(s.phase, 'gone');
  assert.ok(Number.isFinite(s.revealed));

  const noHold = createDissolve({ revealMs: 100, holdMs: 0, dissolveMs: 100 });
  assert.equal(noHold.at(100).phase, 'dissolve');
  assert.ok(Number.isFinite(noHold.at(100).revealed));
});

test('negative and non-finite times clamp to the start', () => {
  const d = createDissolve();
  assert.equal(d.at(-50).phase, 'reveal');
  assert.equal(d.at(NaN).revealed, 0);
});
