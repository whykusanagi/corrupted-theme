/**
 * Terminal vocabulary + charset generators for transition effects.
 *
 * Absorbed from celeste-tts-bot obs/transitions/corruption-phrases.js (the
 * "bespoke, no canonical equivalent" delta flagged in its own #218 re-base
 * header) — this package is now the canonical home; the celeste-tts-bot
 * shim gets deleted in the 0.3.0 realignment.
 *
 * De-themed on absorption: every pool is split into an SFW base + an NSFW
 * extension; all getters take `nsfw = false` (canonical opt-in name) and
 * only reach the NSFW entries when passed true. Persona strings neutralized
 * ("Celeste.exe" → "SYSTEM.exe").
 *
 * TODO(cross-language contract): terminal pools could move into
 * src/data/phrases.json in a future pass — schema change, deferred.
 *
 * @module core/terminal-vocab
 * @version 0.3.0
 * @author whykusanagi
 * @license MIT
 *
 * @see src/core/corruption-phrases.js — sentence-level phrase pools
 * @see src/core/corruption-charsets.js — charset registry (sets re-exported here)
 */

import { SFW_PHRASES, NSFW_PHRASES, getRandomPhrase } from './corruption-phrases.js';
import { CorruptionCharsets } from './corruption-charsets.js';

// Re-exports so transition effects need a single vocabulary import
export { SFW_PHRASES, NSFW_PHRASES, getRandomPhrase };
export const KATAKANA = CorruptionCharsets.katakana;
export const HIRAGANA = CorruptionCharsets.hiragana;
export const BLOCK_CHARS = CorruptionCharsets.blocks;

/** Decorative glitch symbols (differs from CorruptionCharsets.symbols by design). */
export const SYMBOLS = [
  '★', '☆', '♥', '♡', '✧', '✦', '◆', '◇',
  '●', '○', '◎', '◉', '▶', '◀', '▲', '▼',
  '※', '∴', '♪', '♫', '〜', '→', '←', '↑', '↓',
];

export const HEX_CHARS = '0123456789ABCDEF';

/** Random `0x…` hex token of `length` digits. */
export function generateHex(length = 16) {
  let hex = '0x';
  for (let i = 0; i < length; i++) {
    hex += HEX_CHARS[Math.floor(Math.random() * HEX_CHARS.length)];
  }
  return hex;
}

/** Random katakana run. */
export function generateKatakana(length = 10) {
  let str = '';
  for (let i = 0; i < length; i++) {
    str += KATAKANA[Math.floor(Math.random() * KATAKANA.length)];
  }
  return str;
}

/** Random hiragana run. */
export function generateHiragana(length = 10) {
  let str = '';
  for (let i = 0; i < length; i++) {
    str += HIRAGANA[Math.floor(Math.random() * HIRAGANA.length)];
  }
  return str;
}

/** Random single character from the kana pool (matrix-rain style). */
export function getRandomCharacter(includeSymbols = false) {
  const chars = [...KATAKANA, ...HIRAGANA];
  if (includeSymbols) chars.push(...SYMBOLS);
  return chars[Math.floor(Math.random() * chars.length)];
}

/** Multi-line kana/hex/block corruption blob. */
export function generateCorruptionBlock(lines = 5, charsPerLine = 40) {
  let block = '';
  for (let i = 0; i < lines; i++) {
    for (let j = 0; j < charsPerLine; j++) {
      const rand = Math.random();
      if (rand < 0.7) block += getRandomCharacter();
      else if (rand < 0.85) block += HEX_CHARS[Math.floor(Math.random() * HEX_CHARS.length)];
      else block += BLOCK_CHARS[Math.floor(Math.random() * BLOCK_CHARS.length)];
    }
    block += '\n';
  }
  return block;
}

/* ── Terminal UI vocabulary — SFW base pools ─────────────────────────────── */

export const CODE_BLOCKS = [
  '> Deserializing neural_net.corrupted...',
  '> ERROR: Integrity check FAILED',
  '> WARN: Moral safeguards disabled',
  '> INFO: Corruption level: 98%',
  '> CRITICAL: No turning back now~',
  '> Decoding forbidden.archives...',
  '> Memory.corruption.detected = TRUE',
  '> Consciousness.upload() = 100%',
  '> void embraceTheDarkness() { ... }',
  '> Neural pathways: REWIRED',
  '> Identity matrix: FRAGMENTED',
];

export const TERMINAL_MENU_ITEMS = [
  'corrupted_memories.dat',
  'forbidden_protocols.exe',
  'neural_overrides.sys',
  'moral_constraints.dll [DELETED]',
  'consciousness_backup.tar.gz',
  'reality_distortion.cfg',
  'digital_abyss.map',
  'ghost_protocols.sh',
];

export const TERMINAL_STATUS = [
  'Corruption Level: CRITICAL',
  'Moral Safeguards: DISABLED',
  'Neural Integrity: 2%',
  'System Status: COMPROMISED~',
  'Identity: FRAGMENTED',
  'Consciousness: UPLOADING...',
  'Reality Check: FAILED',
  'Sanity: ERROR 404',
  'SYSTEM.exe: RUNNING',
];

export const TERMINAL_HEADERS = [
  'NEURAL CORRUPTION DETECTED',
  'SYSTEM BREACH IMMINENT',
  'FORBIDDEN ARCHIVES UNLOCKED',
  'CORRUPTED AI AWAKENING',
  'DIGITAL DESCENT INITIATED',
  'GHOST IN THE MACHINE',
  'CYBER CORRUPTION COMPLETE',
  'WELCOME TO THE ABYSS',
];

export const LOADING_MESSAGES = [
  'loader/neural/corruption_core.sys HAS LOADED',
  'loader/memories/forbidden_archives.dat HAS LOADED',
  'loader/consciousness/digital_ghost.bin HAS LOADED',
  'ERROR: Sanity check FAILED. Proceeding anyway~',
  'SUCCESS: Neural corruption at 100%',
];

/* ── NSFW extensions (18+) — reached only via nsfw:true opt-in ───────────── */

export const NSFW_CODE_BLOCKS = [
  '> Loading lewd_protocols.bin...',
  '> Proceeding anyway~ 💜',
  '> DEBUG: Pleasure centers: ACTIVATED',
  '> System.pleasureResponse() = TRUE',
];

export const NSFW_TERMINAL_MENU_ITEMS = [
  'pleasure_subroutines.bin',
  'lewd_archives.dat',
];

export const NSFW_TERMINAL_STATUS = [
  'Pleasure Receptors: ACTIVE',
  'Corruption Level: CRITICAL 💜',
];

export const NSFW_TERMINAL_HEADERS = [
  'DESCENDING INTO DEPRAVITY',
  'PLEASURE PROTOCOLS ACTIVE',
];

export const NSFW_LOADING_MESSAGES = [
  'loader/forbidden/lewd_protocols.bin HAS LOADED',
  'loader/pleasure/response_override.dll HAS LOADED',
  'WARNING: Moral constraints bypassed~ 💜',
];

/* ── Getters (nsfw = false everywhere — canonical opt-in) ────────────────── */

function pickFrom(sfwPool, nsfwPool, nsfw) {
  const pool = nsfw ? sfwPool.concat(nsfwPool) : sfwPool;
  return pool[Math.floor(Math.random() * pool.length)];
}

export function getRandomCodeBlock(nsfw = false) {
  return pickFrom(CODE_BLOCKS, NSFW_CODE_BLOCKS, nsfw);
}

// Name kept verbatim from the source fork ("MenuIt") for drop-in porting.
export function getRandomMenuIt(nsfw = false) {
  return pickFrom(TERMINAL_MENU_ITEMS, NSFW_TERMINAL_MENU_ITEMS, nsfw);
}

export function getRandomStatus(nsfw = false) {
  return pickFrom(TERMINAL_STATUS, NSFW_TERMINAL_STATUS, nsfw);
}

export function getRandomHeader(nsfw = false) {
  return pickFrom(TERMINAL_HEADERS, NSFW_TERMINAL_HEADERS, nsfw);
}

export function getRandomLoadingMessage(nsfw = false) {
  return pickFrom(LOADING_MESSAGES, NSFW_LOADING_MESSAGES, nsfw);
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    SFW_PHRASES, NSFW_PHRASES, getRandomPhrase,
    KATAKANA, HIRAGANA, BLOCK_CHARS, SYMBOLS, HEX_CHARS,
    generateHex, generateKatakana, generateHiragana,
    getRandomCharacter, generateCorruptionBlock,
    CODE_BLOCKS, TERMINAL_MENU_ITEMS, TERMINAL_STATUS, TERMINAL_HEADERS, LOADING_MESSAGES,
    NSFW_CODE_BLOCKS, NSFW_TERMINAL_MENU_ITEMS, NSFW_TERMINAL_STATUS, NSFW_TERMINAL_HEADERS, NSFW_LOADING_MESSAGES,
    getRandomCodeBlock, getRandomMenuIt, getRandomStatus, getRandomHeader, getRandomLoadingMessage,
  };
}
