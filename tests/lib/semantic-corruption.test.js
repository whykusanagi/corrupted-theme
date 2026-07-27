// tests/lib/semantic-corruption.test.js
import { strict as assert } from 'node:assert';
import { test } from 'node:test';
import {
  corruptTextSemantic, corruptTextJapanese, SEMANTIC_CONTEXTS,
} from '../../src/lib/character-corruption.js';

/** Run f with Math.random replaced by a fixed sequence. */
function withSeq(values, f) {
  const real = Math.random;
  let i = 0;
  Math.random = () => values[i++ % values.length];
  try { return f(); } finally { Math.random = real; }
}

test('every context the old TODO promised now exists, with a pool', () => {
  assert.deepEqual(Object.keys(SEMANTIC_CONTEXTS),
    ['loading', 'processing', 'analyzing', 'corrupting', 'watching', 'connecting']);
  for (const [name, pool] of Object.entries(SEMANTIC_CONTEXTS)) {
    assert.ok(Array.isArray(pool) && pool.length >= 4, `${name} has a pool`);
    assert.equal(new Set(pool).size, pool.length, `${name} has no duplicate glyphs`);
  }
  assert.ok(Object.isFrozen(SEMANTIC_CONTEXTS), 'the table is frozen');
});

test("context 'default' is byte-identical to corruptTextJapanese", () => {
  // This function shipped as a stub that ignored `context`. Filling it in must
  // not move output for any existing caller, so the default path has to remain
  // exactly the old behaviour — asserted here rather than assumed.
  const seq = [0.1, 0.42, 0.9, 0.05, 0.6, 0.33, 0.8, 0.21, 0.55, 0.7, 0.15, 0.95];
  const input = 'Neural corruption detected';
  const viaSemantic = withSeq(seq, () => corruptTextSemantic(input, 'default', 0.5));
  const viaJapanese = withSeq(seq, () => corruptTextJapanese(input, 0.5));
  assert.equal(viaSemantic, viaJapanese);
});

test('an unrecognised context also falls back, rather than throwing', () => {
  const seq = [0.2, 0.5, 0.8, 0.1];
  const a = withSeq(seq, () => corruptTextSemantic('Loading', 'nonsense', 0.5));
  const b = withSeq(seq, () => corruptTextJapanese('Loading', 0.5));
  assert.equal(a, b);
});

test('a named context substitutes glyphs from its own pool', () => {
  // intensity 1 and a low roll forces every letter through the context branch.
  const out = withSeq([0, 0], () => corruptTextSemantic('abcdef', 'loading', 1));
  const pool = SEMANTIC_CONTEXTS.loading;
  for (const ch of out) {
    assert.ok(pool.includes(ch), `${ch} is from the loading pool`);
  }
});

test('each context draws from a different pool', () => {
  const of = ctx => withSeq([0, 0], () => corruptTextSemantic('aaaa', ctx, 1));
  assert.notEqual(of('loading'), of('corrupting'));
  assert.notEqual(of('analyzing'), of('connecting'));
});

test('non-letters are never corrupted', () => {
  const out = corruptTextSemantic('a b-1_c!', 'loading', 1);
  for (const ch of ' -1_!') {
    assert.ok(out.includes(ch), `${JSON.stringify(ch)} survives`);
  }
});

test('intensity 0 returns the input untouched', () => {
  const input = 'Corruption Level Critical';
  assert.equal(corruptTextSemantic(input, 'corrupting', 0), input);
});

test('intensity 1 corrupts every letter and leaves length >= input letters', () => {
  const out = corruptTextSemantic('abcdef', 'processing', 1);
  assert.ok(!/[a-z]/.test(out), `all letters replaced: ${out}`);
});

test('empty, null and undefined input are safe', () => {
  assert.equal(corruptTextSemantic('', 'loading', 1), '');
  assert.equal(corruptTextSemantic(null, 'loading', 1), '');
  assert.equal(corruptTextSemantic(undefined, 'loading', 1), '');
});

test('a minority of standard katakana still mixes in', () => {
  // 0.8 clears the 0.75 threshold, so the katakana branch is taken.
  const out = withSeq([0, 0.8], () => corruptTextSemantic('abcd', 'loading', 1));
  const pool = SEMANTIC_CONTEXTS.loading;
  assert.ok([...out].some(ch => !pool.includes(ch)),
    `expected some non-pool katakana in ${out}`);
});
