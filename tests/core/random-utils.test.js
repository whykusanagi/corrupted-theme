// tests/core/random-utils.test.js
import { strict as assert } from 'node:assert';
import { test } from 'node:test';
import { randomPick, randomInt, randomFloat, randomVariance, shuffle, randomSample, seededRandom } from '../../src/core/random-utils.js';

test('randomPick returns element from array', () => {
  const arr = ['a', 'b', 'c'];
  for (let i = 0; i < 20; i++) assert.ok(arr.includes(randomPick(arr)));
});

test('randomPick throws on empty array', () => {
  assert.throws(() => randomPick([]), /randomPick/);
});

test('randomPick throws on undefined', () => {
  assert.throws(() => randomPick(undefined), /randomPick/);
});

test('randomInt(min, max) is within range', () => {
  for (let i = 0; i < 100; i++) {
    const n = randomInt(1, 10);
    assert.ok(n >= 1 && n <= 10);
    assert.ok(Number.isInteger(n));
  }
});

test('randomInt(5, 5) always returns 5', () => {
  for (let i = 0; i < 10; i++) {
    assert.equal(randomInt(5, 5), 5);
  }
});

test('randomFloat(min, max) is within range', () => {
  for (let i = 0; i < 100; i++) {
    const n = randomFloat(0, 1);
    assert.ok(n >= 0 && n < 1);
  }
});

test('randomVariance returns value within expected bounds', () => {
  for (let i = 0; i < 100; i++) {
    const n = randomVariance(100, 0.2);
    assert.ok(n >= 80 && n <= 120);
  }
});

test('randomVariance uses 0.2 as default variance', () => {
  for (let i = 0; i < 50; i++) {
    const n = randomVariance(100);
    assert.ok(n >= 80 && n <= 120);
  }
});

test('shuffle returns array of same length with same elements', () => {
  const orig = [1, 2, 3, 4, 5];
  const out = shuffle([...orig]);
  assert.equal(out.length, orig.length);
  for (const x of orig) assert.ok(out.includes(x));
});

test('shuffle mutates and returns the same array reference', () => {
  const arr = [1, 2, 3];
  const returned = shuffle(arr);
  assert.equal(returned, arr);
});

test('randomSample(arr, n) returns n unique elements', () => {
  const out = randomSample([1, 2, 3, 4, 5], 3);
  assert.equal(out.length, 3);
  assert.equal(new Set(out).size, 3);
});

test('randomSample throws when count exceeds array length', () => {
  assert.throws(() => randomSample([1, 2], 5), /randomSample/);
});

test('randomSample with count = array length returns all elements', () => {
  const arr = [1, 2, 3];
  const out = randomSample(arr, 3);
  assert.equal(out.length, 3);
  for (const x of arr) assert.ok(out.includes(x));
});

// --- seededRandom (mulberry32) — 0.3.0 ---

test('seededRandom is deterministic for equal seeds', () => {
  const a = seededRandom(1234);
  const b = seededRandom(1234);
  const seqA = [a(), a(), a()];
  const seqB = [b(), b(), b()];
  assert.deepEqual(seqA, seqB);
  for (const v of seqA) assert.ok(v >= 0 && v < 1, `out of range: ${v}`);
});

test('seededRandom diverges across seeds', () => {
  assert.notEqual(seededRandom(1)(), seededRandom(2)());
});

test('seededRandom coerces seed to uint32 (frame-index friendly)', () => {
  // negative and float seeds must not throw and must be deterministic
  assert.equal(seededRandom(-1)(), seededRandom(-1)());
  assert.equal(seededRandom(0)(), seededRandom(0)());
});
