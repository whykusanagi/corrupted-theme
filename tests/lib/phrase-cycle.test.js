// tests/lib/phrase-cycle.test.js
import { strict as assert } from 'node:assert';
import { test } from 'node:test';
import { PhraseCycle } from '../../src/lib/phrase-cycle.js';

test('PhraseCycle is a class', () => {
  assert.equal(typeof PhraseCycle, 'function');
});

test('PhraseCycle can be constructed and destroyed in Node (no DOM)', () => {
  const c = new PhraseCycle(null, { phrases: ['a', 'b', 'c'] });
  c.destroy();
  assert.equal(c._destroyed, true);
});

test('PhraseCycle has start/stop/destroy/isRunning methods', () => {
  const c = new PhraseCycle(null);
  assert.equal(typeof c.start, 'function');
  assert.equal(typeof c.stop, 'function');
  assert.equal(typeof c.destroy, 'function');
  assert.equal(typeof c.isRunning, 'function');
  c.destroy();
});

test('PhraseCycle.start() with empty phrases array writes finalText immediately', () => {
  const fakeEl = { textContent: '' };
  const c = new PhraseCycle(fakeEl, { phrases: [], finalText: 'DONE' });
  c.start();
  assert.equal(fakeEl.textContent, 'DONE');
  c.destroy();
});

test('PhraseCycle.start() with no phrases and no finalText is a no-op', () => {
  const fakeEl = { textContent: 'orig' };
  const c = new PhraseCycle(fakeEl, { phrases: [] });
  c.start();
  assert.equal(fakeEl.textContent, 'orig');
  c.destroy();
});

test('PhraseCycle.start() immediately writes the first phrase', () => {
  const fakeEl = { textContent: '' };
  const c = new PhraseCycle(fakeEl, { phrases: ['first', 'second'], interval: 50 });
  c.start();
  assert.equal(fakeEl.textContent, 'first');
  c.destroy();
});

test('PhraseCycle.start() then stop() leaves last shown phrase visible', () => {
  const fakeEl = { textContent: '' };
  const c = new PhraseCycle(fakeEl, { phrases: ['only-phrase'] });
  c.start();
  c.stop();
  assert.equal(fakeEl.textContent, 'only-phrase');
  c.destroy();
});

test('PhraseCycle.destroy() releases the element reference', () => {
  const fakeEl = { textContent: '' };
  const c = new PhraseCycle(fakeEl, { phrases: ['x'] });
  c.destroy();
  assert.equal(c.element, null);
});

test('PhraseCycle.destroy() is idempotent', () => {
  const c = new PhraseCycle(null, { phrases: ['x'] });
  c.destroy();
  c.destroy();
  assert.equal(c._destroyed, true);
});

test('PhraseCycle.isRunning() reflects state', () => {
  const fakeEl = { textContent: '' };
  const c = new PhraseCycle(fakeEl, { phrases: ['a', 'b', 'c'], loop: true });
  assert.equal(c.isRunning(), false);
  c.start();
  assert.equal(c.isRunning(), true);
  c.stop();
  assert.equal(c.isRunning(), false);
  c.destroy();
});

test('PhraseCycle.start() is idempotent (calling while running is no-op)', () => {
  const fakeEl = { textContent: '' };
  const c = new PhraseCycle(fakeEl, { phrases: ['a', 'b'] });
  c.start();
  const indexAfterFirstStart = c._index;
  c.start();
  // Second call should not reset _index to 0
  assert.ok(c._index >= indexAfterFirstStart, 'second start() must not reset _index');
  c.destroy();
});
