// tests/core/terminal-vocab.test.js — SFW/NSFW pool split + generators
import { strict as assert } from 'node:assert';
import { test } from 'node:test';
import {
  CODE_BLOCKS, TERMINAL_MENU_ITEMS, TERMINAL_STATUS, TERMINAL_HEADERS, LOADING_MESSAGES,
  NSFW_CODE_BLOCKS, NSFW_TERMINAL_MENU_ITEMS, NSFW_TERMINAL_STATUS, NSFW_TERMINAL_HEADERS, NSFW_LOADING_MESSAGES,
  getRandomCodeBlock, getRandomMenuIt, getRandomStatus, getRandomHeader, getRandomLoadingMessage,
  generateHex, generateKatakana, getRandomCharacter, generateCorruptionBlock,
  KATAKANA, HIRAGANA,
} from '../../src/core/terminal-vocab.js';

const SUGGESTIVE = /lewd|pleasure|deprav/i;

test('SFW pools contain no suggestive content', () => {
  for (const pool of [CODE_BLOCKS, TERMINAL_MENU_ITEMS, TERMINAL_STATUS, TERMINAL_HEADERS, LOADING_MESSAGES]) {
    for (const entry of pool) assert.ok(!SUGGESTIVE.test(entry), `suggestive SFW entry: ${entry}`);
  }
});

test('default getters (nsfw=false) never return NSFW entries', () => {
  const nsfwAll = new Set([
    ...NSFW_CODE_BLOCKS, ...NSFW_TERMINAL_MENU_ITEMS, ...NSFW_TERMINAL_STATUS,
    ...NSFW_TERMINAL_HEADERS, ...NSFW_LOADING_MESSAGES,
  ]);
  for (let i = 0; i < 300; i++) {
    for (const get of [getRandomCodeBlock, getRandomMenuIt, getRandomStatus, getRandomHeader, getRandomLoadingMessage]) {
      assert.ok(!nsfwAll.has(get()), `NSFW leak from ${get.name}`);
    }
  }
});

test('nsfw=true getters can reach the NSFW pool', () => {
  let hit = false;
  for (let i = 0; i < 500 && !hit; i++) {
    hit = NSFW_CODE_BLOCKS.includes(getRandomCodeBlock(true));
  }
  assert.ok(hit, 'expected an NSFW code block within 500 draws');
});

test('generators produce well-formed tokens', () => {
  assert.match(generateHex(8), /^0x[0-9A-F]{8}$/);
  assert.equal(generateKatakana(5).length, 5);
  assert.ok([...KATAKANA, ...HIRAGANA].includes(getRandomCharacter()));
  assert.equal(generateCorruptionBlock(3, 10).split('\n').length, 4); // 3 lines + trailing
});
