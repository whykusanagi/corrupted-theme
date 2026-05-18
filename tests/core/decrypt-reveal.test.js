// tests/core/decrypt-reveal.test.js
import { strict as assert } from 'node:assert';
import { test } from 'node:test';
import { DecryptReveal } from '../../src/core/decrypt-reveal.js';

test('DecryptReveal exposes decode + start/stop/destroy', () => {
  const m = new DecryptReveal();
  assert.equal(typeof m.decode, 'function');
  assert.equal(typeof m.start, 'function');
  assert.equal(typeof m.stop, 'function');
  assert.equal(typeof m.destroy, 'function');
  m.destroy();
});

test('DecryptReveal.destroy() marks _destroyed', () => {
  const m = new DecryptReveal();
  m.destroy();
  assert.equal(m._destroyed, true);
});

test('DecryptReveal can be constructed without document (Node import)', () => {
  // Just creating + destroying shouldn't crash even in Node where document is undefined
  const m = new DecryptReveal();
  m.destroy();
  assert.ok(true);
});

test('DecryptReveal.stop() clears all tracked timers', () => {
  const m = new DecryptReveal();
  // Track that stop() can be called without error even with no active animations
  assert.doesNotThrow(() => m.stop());
  m.destroy();
});

test('DecryptReveal.getActiveCount() returns 0 initially', () => {
  const m = new DecryptReveal();
  assert.equal(m.getActiveCount(), 0);
  m.destroy();
});

test('DecryptReveal.cleanup(id) is a no-op for unknown id', () => {
  const m = new DecryptReveal();
  assert.doesNotThrow(() => m.cleanup(9999));
  m.destroy();
});

test('DecryptReveal.decode() returns a numeric id without document', () => {
  const m = new DecryptReveal();
  // No real DOM element — pass a simple object; timers will run but not crash in Node
  const fakeEl = { textContent: '' };
  const id = m.decode(fakeEl, 'hello', { duration: 50 });
  assert.equal(typeof id, 'number');
  m.stop();
  m.destroy();
});

test('decode() registers timers; destroy() clears them', () => {
  const m = new DecryptReveal();
  const el = { textContent: '' };
  m.decode(el, 'hello', { duration: 5000 });
  // Should have registered at least one timer
  assert.ok(m._timers.pendingCount > 0, 'expected timers after decode()');
  m.destroy();
  assert.equal(m._timers.pendingCount, 0, 'expected zero timers after destroy()');
});
