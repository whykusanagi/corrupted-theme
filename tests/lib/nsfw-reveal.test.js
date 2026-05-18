import { strict as assert } from 'node:assert';
import { test } from 'node:test';
import { NsfwReveal } from '../../src/lib/nsfw-reveal.js';

test('NsfwReveal class is exported', () => {
  assert.equal(typeof NsfwReveal, 'function');
});

test('NsfwReveal constructs with null target in Node without crashing', () => {
  const n = new NsfwReveal(null);
  assert.equal(n._destroyed, false);
  assert.equal(n._revealed,  false);
  n.destroy();
  assert.equal(n._destroyed, true);
});

test('NsfwReveal.reveal() is a no-op with null target', () => {
  const n = new NsfwReveal(null);
  n.reveal();   // should not throw
  n.reveal();   // idempotent
  assert.ok(true);
  n.destroy();
});

test('NsfwReveal.destroy() is idempotent', () => {
  const n = new NsfwReveal(null);
  n.destroy();
  n.destroy();  // second call must not throw
  assert.equal(n._destroyed, true);
});

test('NsfwReveal.reveal() after destroy() is a no-op', () => {
  const n = new NsfwReveal(null);
  n.destroy();
  n.reveal();   // must not throw; _revealed should remain false since _destroyed
  assert.equal(n._revealed, false);
});

test('NsfwReveal default options are applied', () => {
  const n = new NsfwReveal(null);
  assert.equal(n.options.warning, 'NSFW — click to reveal');
  assert.equal(n.options.blurPx, 20);
  n.destroy();
});

test('NsfwReveal custom options are respected', () => {
  const n = new NsfwReveal(null, { warning: 'Click to show', blurPx: 10 });
  assert.equal(n.options.warning, 'Click to show');
  assert.equal(n.options.blurPx, 10);
  n.destroy();
});
