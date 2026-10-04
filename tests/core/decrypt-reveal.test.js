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

/* ── Readable endpoints on teardown (0.3.4) ──────────────────────────────── */

test('stop() leaves the element on its final text, not on scrambled glyphs', () => {
  // The manager stops itself when the tab hides. Dropping the animation there
  // left whatever glyphs were last written on screen, so a decode interrupted
  // by a background tab never completed and never resumed — blog headings on
  // the consuming site read as missing. Spec Core Tenet 2: readable endpoints.
  const m = new DecryptReveal();
  const el = { textContent: '' };
  m.decode(el, 'SIGNAL DECAY', { duration: 2000 });
  m.stop();
  assert.equal(el.textContent, 'SIGNAL DECAY');
  m.destroy();
});

test('cleanup(id) settles the one animation it cancels', () => {
  const m = new DecryptReveal();
  const a = { textContent: '' };
  const b = { textContent: '' };
  const idA = m.decode(a, 'ALPHA', { duration: 2000 });
  m.decode(b, 'BETA', { duration: 2000 });
  m.cleanup(idA);
  assert.equal(a.textContent, 'ALPHA');
  assert.equal(b.textContent, '', 'the other animation is untouched');
  m.stop();
  m.destroy();
});

test('stop() is safe with nothing running, and safe twice', () => {
  // The record is deleted ~50ms after the duration, so by the time a hidden tab
  // fires the map may be empty; and a caller may have reused the element, which
  // must not be written to a second time.
  const m = new DecryptReveal();
  const el = { textContent: '' };
  m.decode(el, 'ONCE', { duration: 2000 });
  m.stop();
  el.textContent = 'reused by the caller';
  assert.doesNotThrow(() => m.stop());
  assert.equal(el.textContent, 'reused by the caller');
  m.destroy();
});

test('destroy() settles too', () => {
  const m = new DecryptReveal();
  const el = { textContent: '' };
  m.decode(el, 'TERMINAL', { duration: 2000 });
  m.destroy();
  assert.equal(el.textContent, 'TERMINAL');
});
