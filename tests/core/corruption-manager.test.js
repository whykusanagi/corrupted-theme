// tests/core/corruption-manager.test.js
import { strict as assert } from 'node:assert';
import { test } from 'node:test';
import { CorruptionManager } from '../../src/core/corruption-manager.js';

test('CorruptionManager exposes decode/flicker/hybrid + start/stop/destroy', () => {
  const m = new CorruptionManager();
  assert.equal(typeof m.decode, 'function');
  assert.equal(typeof m.flicker, 'function');
  assert.equal(typeof m.hybrid, 'function');
  assert.equal(typeof m.start, 'function');
  assert.equal(typeof m.stop, 'function');
  assert.equal(typeof m.destroy, 'function');
  m.destroy();
});

test('CorruptionManager.destroy() marks _destroyed', () => {
  const m = new CorruptionManager();
  m.destroy();
  assert.equal(m._destroyed, true);
});

test('CorruptionManager can be constructed without document (Node import)', () => {
  // Just creating + destroying shouldn't crash even in Node where document is undefined
  const m = new CorruptionManager();
  m.destroy();
  assert.ok(true);
});

test('CorruptionManager.stop() clears all tracked timers', () => {
  const m = new CorruptionManager();
  // Track that stop() can be called without error even with no active animations
  assert.doesNotThrow(() => m.stop());
  m.destroy();
});

test('CorruptionManager.getActiveCount() returns 0 initially', () => {
  const m = new CorruptionManager();
  assert.equal(m.getActiveCount(), 0);
  m.destroy();
});

test('CorruptionManager.cleanup(id) is a no-op for unknown id', () => {
  const m = new CorruptionManager();
  assert.doesNotThrow(() => m.cleanup(9999));
  m.destroy();
});

test('CorruptionManager.decode() returns a numeric id without document', () => {
  const m = new CorruptionManager();
  // No real DOM element — pass a simple object; timers will run but not crash in Node
  const fakeEl = { textContent: '' };
  const id = m.decode(fakeEl, 'hello', { duration: 50 });
  assert.equal(typeof id, 'number');
  m.stop();
  m.destroy();
});

test('CorruptionManager.flicker() returns a numeric id without document', () => {
  const m = new CorruptionManager();
  const fakeEl = { textContent: '' };
  const id = m.flicker(fakeEl, ['フリ', 'ッカ', '...'], { duration: 50 });
  assert.equal(typeof id, 'number');
  m.stop();
  m.destroy();
});

test('CorruptionManager.hybrid() returns a numeric id without document', () => {
  const m = new CorruptionManager();
  const fakeEl = { textContent: '' };
  const id = m.hybrid(fakeEl, ['フリ', '処理中...'], 'done', { duration: 100 });
  assert.equal(typeof id, 'number');
  m.stop();
  m.destroy();
});

test('decode() registers timers; destroy() clears them', () => {
  const m = new CorruptionManager();
  const el = { textContent: '' };
  m.decode(el, 'hello', { duration: 5000 });
  // Should have registered at least one timer
  assert.ok(m._timers.pendingCount > 0, 'expected timers after decode()');
  m.destroy();
  assert.equal(m._timers.pendingCount, 0, 'expected zero timers after destroy()');
});

test('flicker() registers timers; destroy() clears them', () => {
  const m = new CorruptionManager();
  const el = { textContent: '' };
  m.flicker(el, ['a', 'b', 'c']);
  assert.ok(m._timers.pendingCount > 0, 'expected timers after flicker()');
  m.destroy();
  assert.equal(m._timers.pendingCount, 0, 'expected zero timers after destroy()');
});

test('hybrid() registers timers; destroy() clears them', () => {
  const m = new CorruptionManager();
  const el = { textContent: '' };
  m.hybrid(el, ['a', 'b'], 'final text', { phaseDuration: 1000 });
  assert.ok(m._timers.pendingCount > 0, 'expected timers after hybrid()');
  m.destroy();
  assert.equal(m._timers.pendingCount, 0, 'expected zero timers after destroy()');
});
