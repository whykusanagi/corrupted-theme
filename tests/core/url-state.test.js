// tests/core/url-state.test.js
import { strict as assert } from 'node:assert';
import { test } from 'node:test';
import { serializeFormToParams, applyParamsToForm, buildShareUrl } from '../../src/core/url-state.js';

test('serializeFormToParams returns URLSearchParams for null input', () => {
  const result = serializeFormToParams(null);
  assert.ok(result instanceof URLSearchParams);
  assert.equal([...result].length, 0);
});

test('serializeFormToParams returns URLSearchParams for undefined input', () => {
  const result = serializeFormToParams(undefined);
  assert.ok(result instanceof URLSearchParams);
});

test('applyParamsToForm does not throw on null form', () => {
  applyParamsToForm(null, new URLSearchParams('a=1'));
  assert.ok(true);
});

test('applyParamsToForm does not throw on null params', () => {
  applyParamsToForm(null, new URLSearchParams());
  assert.ok(true);
});

test('buildShareUrl returns a string', () => {
  const result = buildShareUrl(null, 'https://example.com/page');
  assert.equal(typeof result, 'string');
  assert.ok(result.startsWith('https://example.com/'));
});

test('buildShareUrl with null form produces URL with no search params', () => {
  const result = buildShareUrl(null, 'https://example.com/page');
  const url = new URL(result);
  assert.equal([...url.searchParams].length, 0);
});

test('buildShareUrl preserves base URL origin', () => {
  const result = buildShareUrl(null, 'https://whykusanagi.xyz/nikke');
  assert.ok(result.startsWith('https://whykusanagi.xyz/'));
});
