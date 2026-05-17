import { strict as assert } from 'node:assert';
import { test } from 'node:test';
import { CorruptedParticlesBackground } from '../../src/lib/corrupted-particles-background.js';

test('CorruptedParticlesBackground exported as class', () => {
  assert.equal(typeof CorruptedParticlesBackground, 'function');
});

test('CorruptedParticlesBackground can be constructed and destroyed in Node', () => {
  const b = new CorruptedParticlesBackground({});
  if (typeof b.destroy === 'function') b.destroy();
  assert.ok(true);
});

test('CorruptedParticlesBackground exposes start/stop/destroy methods', () => {
  const b = new CorruptedParticlesBackground({});
  assert.equal(typeof b.start,   'function', 'start should be a function');
  assert.equal(typeof b.stop,    'function', 'stop should be a function');
  assert.equal(typeof b.destroy, 'function', 'destroy should be a function');
  b.destroy();
});

test('CorruptedParticlesBackground destroy() is idempotent', () => {
  const b = new CorruptedParticlesBackground({});
  b.destroy();
  assert.doesNotThrow(() => b.destroy(), 'second destroy should not throw');
});

test('CorruptedParticlesBackground default options are applied', () => {
  const b = new CorruptedParticlesBackground({});
  assert.equal(b.options.targetSelector, '.glass-backdrop');
  assert.equal(b.options.nsfw,           false);
  assert.equal(b.options.count,          25);
  assert.equal(b.options.speed,          0.5);
  assert.equal(b.options.lineDistance,   100);
  assert.equal(b.options.canvasId,       'particles-bg');
  b.destroy();
});

test('CorruptedParticlesBackground custom options are respected', () => {
  const b = new CorruptedParticlesBackground({
    targetSelector: '#my-target',
    nsfw:           true,
    count:          50,
    speed:          2.0,
    lineDistance:   200,
    canvasId:       'custom-canvas',
  });
  assert.equal(b.options.targetSelector, '#my-target');
  assert.equal(b.options.nsfw,           true);
  assert.equal(b.options.count,          50);
  assert.equal(b.options.speed,          2.0);
  assert.equal(b.options.lineDistance,   200);
  assert.equal(b.options.canvasId,       'custom-canvas');
  b.destroy();
});

test('start/stop on uninitialised instance (no DOM) does not throw', () => {
  const b = new CorruptedParticlesBackground({});
  assert.doesNotThrow(() => b.start());
  assert.doesNotThrow(() => b.stop());
  b.destroy();
});

test('start/stop after destroy() does not throw', () => {
  const b = new CorruptedParticlesBackground({});
  b.destroy();
  assert.doesNotThrow(() => b.start());
  assert.doesNotThrow(() => b.stop());
});
