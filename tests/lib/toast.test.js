import { strict as assert } from 'node:assert';
import { test } from 'node:test';
import { Toast } from '../../src/lib/toast.js';

test('Toast exports singleton with show/success/error/info methods', () => {
  assert.equal(typeof Toast.show,    'function');
  assert.equal(typeof Toast.success, 'function');
  assert.equal(typeof Toast.error,   'function');
  assert.equal(typeof Toast.info,    'function');
});

test('Toast.show is safe to call in Node (no DOM)', () => {
  const result = Toast.show('test');
  // Returns null in Node (no document); must not throw
  assert.equal(result, null);
});

test('Toast.success is safe to call in Node', () => {
  assert.equal(Toast.success('ok'), null);
});

test('Toast.error is safe to call in Node', () => {
  assert.equal(Toast.error('fail'), null);
});

test('Toast.info is safe to call in Node', () => {
  assert.equal(Toast.info('note'), null);
});

test('Toast methods accept options object in Node without crashing', () => {
  const result = Toast.show('test', { duration: 5000 });
  assert.equal(result, null);
});
