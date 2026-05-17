// tests/core/corruption-charsets.test.js
import { strict as assert } from 'node:assert';
import { test } from 'node:test';
import { CorruptionCharsets } from '../../src/core/corruption-charsets.js';

test('CorruptionCharsets exposes named sets', () => {
  assert.ok(typeof CorruptionCharsets.katakana === 'string');
  assert.ok(typeof CorruptionCharsets.hiragana === 'string');
  assert.ok(typeof CorruptionCharsets.kanji === 'string');
  assert.ok(typeof CorruptionCharsets.symbols === 'string');
  assert.ok(typeof CorruptionCharsets.blocks === 'string');
});

test('CorruptionCharsets.standard combines katakana + symbols', () => {
  assert.ok(CorruptionCharsets.standard.includes('ア'));
  assert.ok(CorruptionCharsets.standard.includes('★'));
});

test('CorruptionCharsets.intense includes kanji + blocks', () => {
  assert.ok(CorruptionCharsets.intense.includes('闇'));
  assert.ok(CorruptionCharsets.intense.includes('█'));
});

test('CorruptionCharsets.soft is hiragana only', () => {
  assert.equal(CorruptionCharsets.soft, CorruptionCharsets.hiragana);
});

test('CorruptionCharsets.all is the union of every set', () => {
  for (const set of ['katakana', 'hiragana', 'kanji', 'symbols', 'blocks']) {
    for (const ch of CorruptionCharsets[set]) {
      assert.ok(CorruptionCharsets.all.includes(ch), `'${ch}' missing from all`);
    }
  }
});
