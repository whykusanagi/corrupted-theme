import { strict as assert } from 'node:assert';
import { test } from 'node:test';
import {
  SFW_PHRASES,
  NSFW_PHRASES,
  POOLS,
  getRandomPhrase,
  getPhraseByContext,
} from '../../src/core/corruption-phrases.js';

test('SFW_PHRASES is a non-empty array of strings', () => {
  assert.ok(Array.isArray(SFW_PHRASES));
  assert.ok(SFW_PHRASES.length > 0);
  assert.ok(SFW_PHRASES.every(p => typeof p === 'string'));
});

test('NSFW_PHRASES is a non-empty array of strings', () => {
  assert.ok(Array.isArray(NSFW_PHRASES));
  assert.ok(NSFW_PHRASES.length > 0);
  assert.ok(NSFW_PHRASES.every(p => typeof p === 'string'));
});

test('POOLS exposes sfw.japanese.system pool', () => {
  assert.ok(POOLS.sfw?.japanese?.system);
  assert.ok(Array.isArray(POOLS.sfw.japanese.system));
});

test('getRandomPhrase() returns a string from SFW_PHRASES', () => {
  const phrase = getRandomPhrase();
  assert.ok(typeof phrase === 'string');
  assert.ok(SFW_PHRASES.includes(phrase));
});

test('getRandomPhrase(true) returns a string from NSFW_PHRASES', () => {
  const phrase = getRandomPhrase(true);
  assert.ok(typeof phrase === 'string');
  assert.ok(NSFW_PHRASES.includes(phrase));
});

test('getPhraseByContext("system error") picks from system pool', () => {
  // Run many times to verify it lands in system pool (not other pools)
  for (let i = 0; i < 50; i++) {
    const phrase = getPhraseByContext('system error');
    const allSystemSfw = [
      ...POOLS.sfw.japanese.system,
      ...POOLS.sfw.romaji.system,
      ...POOLS.sfw.english.system,
    ];
    assert.ok(allSystemSfw.includes(phrase), `'${phrase}' not in system pools`);
  }
});

test('getPhraseByContext("void abyss") picks from void pool', () => {
  for (let i = 0; i < 50; i++) {
    const phrase = getPhraseByContext('void abyss');
    const allVoidSfw = [
      ...POOLS.sfw.japanese.void,
      ...POOLS.sfw.romaji.void,
      ...POOLS.sfw.english.void,
    ];
    assert.ok(allVoidSfw.includes(phrase), `'${phrase}' not in void pools`);
  }
});
