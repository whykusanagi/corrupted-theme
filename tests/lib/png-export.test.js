import { strict as assert } from 'node:assert';
import { test } from 'node:test';
import { exportElementAsPng } from '../../src/lib/png-export.js';

test('exportElementAsPng is a function', () => {
  assert.equal(typeof exportElementAsPng, 'function');
});

test('exportElementAsPng throws on null element', async () => {
  await assert.rejects(
    () => exportElementAsPng(null),
    /element is required/
  );
});

test('exportElementAsPng throws on undefined element', async () => {
  await assert.rejects(
    () => exportElementAsPng(undefined),
    /element is required/
  );
});

test('exportElementAsPng throws in Node (no document)', async () => {
  // In Node environment, document is undefined
  const fakeEl = { tagName: 'DIV' };
  await assert.rejects(
    () => exportElementAsPng(fakeEl),
    /browser environment|html2canvas/
  );
});
