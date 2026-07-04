// tests/lib/overlay-shared.test.js
import { strict as assert } from 'node:assert';
import { test } from 'node:test';
import { BINARY_POOL, HEX_POOL, pickSeededPhrase, pickSeededToken } from '../../src/lib/_overlay-shared.js';
import { seededRandom } from '../../src/core/random-utils.js';
import { SFW_PHRASES, NSFW_PHRASES } from '../../src/core/corruption-phrases.js';

test('pickSeededPhrase is deterministic per seed', () => {
  assert.equal(pickSeededPhrase(seededRandom(7)), pickSeededPhrase(seededRandom(7)));
});

test('pickSeededPhrase default (nsfw=false) never returns NSFW content', () => {
  for (let s = 0; s < 500; s++) {
    const phrase = pickSeededPhrase(seededRandom(s));
    assert.ok(SFW_PHRASES.includes(phrase), `non-SFW phrase at seed ${s}: ${phrase}`);
    assert.ok(!NSFW_PHRASES.includes(phrase) || SFW_PHRASES.includes(phrase));
  }
});

test('pickSeededPhrase nsfw=true can reach the NSFW pool', () => {
  let hitNsfw = false;
  for (let s = 0; s < 2000 && !hitNsfw; s++) {
    hitNsfw = NSFW_PHRASES.includes(pickSeededPhrase(seededRandom(s), true));
  }
  assert.ok(hitNsfw, 'expected at least one NSFW pick across 2000 seeds');
});

test('pickSeededToken respects the kind pools', () => {
  for (let s = 0; s < 50; s++) {
    assert.ok(BINARY_POOL.includes(pickSeededToken(seededRandom(s), 'binary')));
    assert.ok(HEX_POOL.includes(pickSeededToken(seededRandom(s), 'hex')));
    assert.ok(SFW_PHRASES.includes(pickSeededToken(seededRandom(s), 'phrases')));
  }
});

test('pickSeededToken mixed distribution covers all three pools', () => {
  const kinds = { binary: 0, hex: 0, phrase: 0 };
  for (let s = 0; s < 300; s++) {
    const t = pickSeededToken(seededRandom(s), 'mixed');
    if (BINARY_POOL.includes(t)) kinds.binary++;
    else if (HEX_POOL.includes(t)) kinds.hex++;
    else kinds.phrase++;
  }
  assert.ok(kinds.binary > 0 && kinds.hex > 0 && kinds.phrase > 0, JSON.stringify(kinds));
});
