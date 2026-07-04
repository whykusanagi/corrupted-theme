/**
 * Shared internals for the stream-overlay suite (chromatic-pulse,
 * binary-particles, glitch-title-card, terminal-takeover, stream-ticker).
 *
 * Private module — not exported from package.json. Ported from
 * spatial_videos/pipeline/overlay/scene.js with phrase pools re-routed
 * through the canonical corruption-phrases library (de-theming contract:
 * NSFW only via nsfw:true opt-in).
 *
 * @module lib/_overlay-shared
 */

import { SFW_PHRASES, NSFW_PHRASES } from '../core/corruption-phrases.js';

export const BINARY_POOL = ['01011010', '11001010', '10101010', '11110000', '00110011', '10011001', '11001100', '01010101', '11011011', '00100010'];
export const HEX_POOL = ['0xDEAD', '0xBEEF', '0xCAFE', '0x1337', '0xBABE', '0xFACE', '0xC0DE', '0xF00D', '0xFADE', '0xABCD'];

/**
 * Pick a phrase deterministically from the canonical pools.
 * @param {() => number} rng - Generator from seededRandom() (or Math.random)
 * @param {boolean} [nsfw=false] - Include NSFW pool (opt-in)
 * @returns {string} Phrase
 */
export function pickSeededPhrase(rng, nsfw = false) {
  const pool = nsfw ? SFW_PHRASES.concat(NSFW_PHRASES) : SFW_PHRASES;
  return pool[Math.floor(rng() * pool.length)];
}

/**
 * Pick a corruption token: binary, hex, or phrase content.
 * Distribution matches the source overlay: 35% binary / 35% hex / 30% phrase.
 * @param {() => number} rng - Generator from seededRandom() (or Math.random)
 * @param {'binary'|'hex'|'phrases'|'mixed'} [kind='mixed'] - Token pool
 * @param {boolean} [nsfw=false] - Include NSFW phrases (opt-in)
 * @returns {string} Token text
 */
export function pickSeededToken(rng, kind = 'mixed', nsfw = false) {
  if (kind === 'binary') return BINARY_POOL[Math.floor(rng() * BINARY_POOL.length)];
  if (kind === 'hex') return HEX_POOL[Math.floor(rng() * HEX_POOL.length)];
  if (kind === 'phrases') return pickSeededPhrase(rng, nsfw);
  const r = rng();
  if (r < 0.35) return BINARY_POOL[Math.floor(rng() * BINARY_POOL.length)];
  if (r < 0.70) return HEX_POOL[Math.floor(rng() * HEX_POOL.length)];
  return pickSeededPhrase(rng, nsfw);
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { BINARY_POOL, HEX_POOL, pickSeededPhrase, pickSeededToken };
}
