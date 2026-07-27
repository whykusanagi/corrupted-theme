// tests/core/lipsync.test.js — pure math, no DOM
import { strict as assert } from 'node:assert';
import { test } from 'node:test';
import { LIPSYNC, rms, smoothRms, mouthTarget, approach } from '../../src/core/lipsync.js';

const near = (a, b, eps = 1e-9) => assert.ok(Math.abs(a - b) < eps, `${a} !== ${b}`);

test('rms of silence is 0; empty and missing buffers are safe', () => {
  assert.equal(rms(new Float32Array(64)), 0);
  assert.equal(rms(new Float32Array(0)), 0);
  assert.equal(rms(null), 0);
  assert.equal(rms(undefined), 0);
});

test('rms of a constant signal is its magnitude, sign-independent', () => {
  near(rms(new Float32Array(16).fill(0.5)), 0.5);
  near(rms(new Float32Array(16).fill(-0.5)), 0.5, 1e-7);
});

test('rms of a full-scale square wave is 1', () => {
  const buf = Float32Array.from({ length: 32 }, (_, i) => (i % 2 ? 1 : -1));
  near(rms(buf), 1, 1e-7);
});

test('smoothRms is an exponential moving average', () => {
  near(smoothRms(0, 1, 0.5), 0.5);
  near(smoothRms(1, 0, 0.5), 0.5);
  assert.equal(smoothRms(0.7, 0.2, 1), 0.7, 'factor 1 freezes the previous value');
  assert.equal(smoothRms(0.7, 0.2, 0), 0.2, 'factor 0 passes the raw value straight through');
});

test('smoothRms converges toward a steady input', () => {
  let s = 0;
  for (let i = 0; i < 40; i++) s = smoothRms(s, 0.8);
  assert.ok(Math.abs(s - 0.8) < 1e-6, `converged to ${s}`);
});

test('mouthTarget normalises against the ceiling and clamps to 0..1', () => {
  near(mouthTarget(0.03, 0.06), 0.5);
  assert.equal(mouthTarget(0.5, 0.06), 1, 'loud input clamps to fully open');
  assert.equal(mouthTarget(-1, 0.06), 0, 'negative clamps to closed');
  assert.equal(mouthTarget(0.5, 0), 0, 'a zero ceiling cannot divide — returns closed');
  assert.equal(mouthTarget(0.5, -1), 0, 'a negative ceiling is rejected too');
});

test('approach moves a fraction of the remaining distance', () => {
  near(approach(0, 1, 0.5), 0.5);
  near(approach(0.5, 1, 0.5), 0.75);
  assert.equal(approach(0.4, 0.4, 0.35), 0.4, 'already at target is a no-op');
});

test('approach converges without overshooting', () => {
  let v = 0;
  for (let i = 0; i < 60; i++) v = approach(v, 1);
  assert.ok(v > 0.999 && v <= 1, `converged to ${v}`);
});

test('the documented defaults are the ones the functions actually use', () => {
  assert.equal(LIPSYNC.SMOOTH_FACTOR, 0.5);
  assert.equal(LIPSYNC.RMS_CEILING, 0.06);
  assert.equal(LIPSYNC.INTERP, 0.35);
  near(smoothRms(0, 1), smoothRms(0, 1, LIPSYNC.SMOOTH_FACTOR));
  near(mouthTarget(0.06), mouthTarget(0.06, LIPSYNC.RMS_CEILING));
  near(approach(0, 1), approach(0, 1, LIPSYNC.INTERP));
});

test('end to end: a quiet buffer opens partway, a loud one opens fully', () => {
  const drive = (amp, frames = 30) => {
    const buf = new Float32Array(128).fill(amp);
    let smoothed = 0, weight = 0;
    for (let i = 0; i < frames; i++) {
      smoothed = smoothRms(smoothed, rms(buf));
      weight = approach(weight, mouthTarget(smoothed));
    }
    return weight;
  };
  const quiet = drive(0.03);
  const loud = drive(0.5);
  assert.ok(quiet > 0.4 && quiet < 0.6, `quiet settled at ${quiet.toFixed(3)}`);
  assert.ok(loud > 0.99, `loud settled at ${loud.toFixed(3)}`);
  assert.ok(drive(0) < 1e-6, 'silence stays closed');
});
