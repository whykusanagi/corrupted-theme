/**
 * Corruption Phrase Library
 *
 * Reads from canonical JSON at src/data/phrases.json. All phrase content
 * lives there as a single source of truth; this module exposes JS APIs
 * with backward-compat flat arrays plus a new context-aware selector.
 *
 * @module corruption-phrases
 * @version 2.0.0
 * @author whykusanagi
 * @license MIT
 *
 * @see src/data/phrases.json — canonical data
 * @see docs/CROSS_LANGUAGE_CONTRACT.md — how non-JS consumers read this JSON
 */

import phrases from '../data/phrases.data.js';

/**
 * Deterministically flatten a language bundle (e.g., phrases.sfw) to a flat
 * array. Order: japanese → romaji → english, each pool in fixed order
 * data → system → status → void → memory → glitch.
 * Determinism ensures RNG-seeded tests against SFW_PHRASES/NSFW_PHRASES
 * don't break across builds.
 */
function flattenAll(bundle) {
  const out = [];
  const langs = ['japanese', 'romaji', 'english'];
  const pools = ['data', 'system', 'status', 'void', 'memory', 'glitch'];
  for (const lang of langs) {
    for (const pool of pools) {
      const arr = bundle?.[lang]?.[pool];
      if (Array.isArray(arr)) out.push(...arr);
    }
  }
  return out;
}

/**
 * Raw canonical data — exposed for advanced consumers (celeste-tts-bot,
 * site fallback layers, downstream Go via go:embed).
 */
export const POOLS = phrases;

/**
 * SFW phrases flat array — backward-compat with 0.1.x consumers.
 * Derived deterministically from POOLS.sfw.
 */
export const SFW_PHRASES = flattenAll(phrases.sfw);

/**
 * NSFW phrases flat array — backward-compat with 0.1.x consumers.
 * Derived deterministically from POOLS.nsfw.
 *
 * ⚠️ 18+ content. Use only in explicitly opt-in contexts.
 */
export const NSFW_PHRASES = flattenAll(phrases.nsfw);

/**
 * Get a random phrase from the appropriate (SFW or NSFW) flat pool.
 * Preserves 0.1.x API.
 *
 * @param {boolean} [nsfw=false]
 * @returns {string}
 */
export function getRandomPhrase(nsfw = false) {
  const pool = nsfw ? NSFW_PHRASES : SFW_PHRASES;
  return pool[Math.floor(Math.random() * pool.length)];
}

/**
 * Pool selector — given a context word, pick the most appropriate pool.
 * Ported from celeste-cli's `containsAny(lowerWord, []string{...})` logic.
 *
 * @param {string} word - The user's context word
 * @returns {string} - One of: 'data', 'system', 'status', 'void', 'memory', 'glitch'
 */
function selectPool(word) {
  const lw = String(word ?? '').toLowerCase();
  // Keyword lists ported from celeste-cli corruptTextSimple switch
  // (celeste-cli/cmd/celeste/commands/corruption.go:73-84).
  // Two separate Go cases both map to dataCorruption, so they are merged here.
  // NOTE: "stat" was intentionally removed — it is a substring of "status"
  // and caused any word containing "stat" to route to data, making the status
  // pool unreachable. "statistic" and "metric" cover the intended data-stat case.
  const dataKeywords   = ["data", "usage", "analytic", "statistic", "metric", "token", "count", "cost", "session", "provider", "model"];
  const systemKeywords = ["system", "process", "execute", "operation", "control"];
  const statusKeywords = ["status", "state", "level", "progress", "complete"];
  const memoryKeywords = ["time", "day", "week", "history", "past"];
  const voidKeywords   = ["void", "abyss", "corrupt", "consume", "decay"];

  if (dataKeywords.some(k => lw.includes(k)))   return 'data';
  if (systemKeywords.some(k => lw.includes(k))) return 'system';
  if (statusKeywords.some(k => lw.includes(k))) return 'status';
  if (memoryKeywords.some(k => lw.includes(k))) return 'memory';
  if (voidKeywords.some(k => lw.includes(k)))   return 'void';
  return 'glitch';
}

/**
 * Get a random phrase contextually appropriate to a word.
 * Maps the word to one of 6 pools, then samples a random phrase from the
 * combined SFW (or NSFW) pool across all three languages.
 *
 * @param {string} word - Context word (e.g., "loading data...")
 * @param {boolean} [nsfw=false]
 * @returns {string}
 */
export function getPhraseByContext(word, nsfw = false) {
  const pool = selectPool(word);
  const bundle = nsfw ? phrases.nsfw : phrases.sfw;
  const combined = [
    ...(bundle.japanese[pool] ?? []),
    ...(bundle.romaji[pool]   ?? []),
    ...(bundle.english[pool]  ?? []),
  ];
  if (combined.length === 0) {
    // Fall back to flat pool if this 6-pool category is empty for the chosen mode
    return getRandomPhrase(nsfw);
  }
  return combined[Math.floor(Math.random() * combined.length)];
}

/**
 * Legacy category sampler — preserved for backward compat with 0.1.x's
 * `getRandomPhraseByCategory()`. Now an alias of getPhraseByContext().
 *
 * @deprecated Use getPhraseByContext() instead. Removed in 0.3.x.
 */
export function getRandomPhraseByCategory(category, nsfw = false) {
  return getPhraseByContext(category, nsfw);
}

// CJS interop for any legacy require() consumers
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    POOLS,
    SFW_PHRASES,
    NSFW_PHRASES,
    getRandomPhrase,
    getPhraseByContext,
    getRandomPhraseByCategory,
  };
}
