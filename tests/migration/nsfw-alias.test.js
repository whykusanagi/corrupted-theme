// tests/migration/nsfw-alias.test.js
// TDD red→green for the includeLewd → nsfw deprecation shim in CorruptedParticles
import { strict as assert } from 'node:assert';
import { test } from 'node:test';
import { CorruptedParticles } from '../../src/lib/corrupted-particles.js';

// Minimal Canvas 2D context stub — enough for CorruptedParticles constructor
function mockCanvas() {
  const ctx = {
    clearRect: () => {}, fillRect: () => {}, fillText: () => {},
    beginPath: () => {}, arc: () => {}, fill: () => {}, stroke: () => {},
    moveTo: () => {}, lineTo: () => {},
    save: () => {}, restore: () => {}, translate: () => {}, scale: () => {},
    setTransform: () => {},
    set fillStyle(v) {}, set strokeStyle(v) {}, set globalAlpha(v) {},
    set lineWidth(v) {}, set font(v) {}, set textAlign(v) {}, set textBaseline(v) {},
    set globalCompositeOperation(v) {},
    get globalCompositeOperation() { return 'source-over'; },
  };
  const canvas = {
    getContext: () => ctx,
    getBoundingClientRect: () => ({ left: 0, top: 0, width: 100, height: 100 }),
    addEventListener: () => {}, removeEventListener: () => {},
    width: 100, height: 100,
    style: {},
    parentNode: null,
  };
  ctx.canvas = canvas;
  return canvas;
}

test('CorruptedParticles: nsfw option works as canonical name', () => {
  const c = mockCanvas();
  const p = new CorruptedParticles(c, { nsfw: true });
  assert.equal(p.options.nsfw, true, 'options.nsfw should be true when passed directly');
  if (typeof p.destroy === 'function') p.destroy();
});

test('CorruptedParticles: nsfw defaults to false', () => {
  const c = mockCanvas();
  const p = new CorruptedParticles(c, {});
  assert.equal(p.options.nsfw, false, 'options.nsfw should default to false');
  if (typeof p.destroy === 'function') p.destroy();
});

test('CorruptedParticles: includeLewd aliases to nsfw with one-time warn', () => {
  // Reset the shared warned flag for test isolation
  CorruptedParticles._warnedIncludeLewd = false;

  const warned = [];
  const origWarn = console.warn;
  console.warn = (...args) => warned.push(args.join(' '));

  try {
    const c1 = mockCanvas();
    const p1 = new CorruptedParticles(c1, { includeLewd: true });
    assert.equal(p1.options.nsfw, true, 'includeLewd: true should alias to nsfw: true');
    assert.equal(warned.length, 1, 'should warn exactly once on first use');
    assert.ok(
      warned[0].includes("'includeLewd' is deprecated"),
      `warn message should mention deprecation; got: "${warned[0]}"`
    );

    // Second instantiation must NOT warn again
    const c2 = mockCanvas();
    const p2 = new CorruptedParticles(c2, { includeLewd: true });
    assert.equal(p2.options.nsfw, true, 'second instance: nsfw should also be true');
    assert.equal(warned.length, 1, 'second instantiation should not warn again');

    if (typeof p1.destroy === 'function') p1.destroy();
    if (typeof p2.destroy === 'function') p2.destroy();
  } finally {
    console.warn = origWarn;
  }
});
