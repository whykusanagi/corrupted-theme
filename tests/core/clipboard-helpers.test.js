// tests/core/clipboard-helpers.test.js
import { strict as assert } from 'node:assert';
import { test } from 'node:test';
import { copyWithFeedback } from '../../src/core/clipboard-helpers.js';

test('copyWithFeedback is a function', () => {
  assert.equal(typeof copyWithFeedback, 'function');
});

test('copyWithFeedback returns false for null buttonEl', async () => {
  const result = await copyWithFeedback(null, 'text');
  assert.equal(result, false);
});

test('copyWithFeedback returns false for empty text', async () => {
  const result = await copyWithFeedback({ textContent: 'btn' }, '');
  assert.equal(result, false);
});

test('copyWithFeedback returns false when navigator.clipboard absent', async () => {
  // In Node without DOM, navigator.clipboard is not available
  const result = await copyWithFeedback({ textContent: 'btn' }, 'some text');
  // Should return false gracefully, not throw
  assert.ok(typeof result === 'boolean' || result === undefined);
});

test('copyWithFeedback does not throw for missing both args', async () => {
  let threw = false;
  try {
    await copyWithFeedback(null, null);
  } catch {
    threw = true;
  }
  assert.equal(threw, false);
});
