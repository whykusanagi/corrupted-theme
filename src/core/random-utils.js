/**
 * Random utility functions.
 * Centralized random selection and variance helpers.
 *
 * Ported from celeste-tts-bot/obs/shared/random-utils.js.
 * All functions are pure (no side effects, no DOM dependency).
 *
 * @module core/random-utils
 */

/**
 * Select a random element from an array.
 * @param {Array} array - Array to select from
 * @returns {*} Random element
 * @throws {Error} If array is empty or undefined
 */
export function randomPick(array) {
  if (!array || array.length === 0) {
    throw new Error('randomPick: array is empty or undefined');
  }
  return array[Math.floor(Math.random() * array.length)];
}

/**
 * Generate a random integer between min and max (inclusive).
 * @param {number} min - Minimum value
 * @param {number} max - Maximum value
 * @returns {number} Random integer
 */
export function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * Generate a random float between min and max.
 * @param {number} min - Minimum value
 * @param {number} max - Maximum value
 * @returns {number} Random float
 */
export function randomFloat(min, max) {
  return Math.random() * (max - min) + min;
}

/**
 * Add random variance to a base value.
 * @param {number} base - Base value
 * @param {number} [variance=0.2] - Variance as decimal (0.2 = ±20%)
 * @returns {number} Value with random variance applied
 */
export function randomVariance(base, variance = 0.2) {
  const min = base * (1 - variance);
  const max = base * (1 + variance);
  return randomFloat(min, max);
}

/**
 * Shuffle array in place using the Fisher-Yates algorithm.
 * @param {Array} array - Array to shuffle (mutated in place)
 * @returns {Array} The same array reference, shuffled
 */
export function shuffle(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

/**
 * Select N random elements from an array without replacement.
 * @param {Array} array - Source array (not mutated)
 * @param {number} count - Number of elements to select
 * @returns {Array} Array of selected elements
 * @throws {Error} If count exceeds array length
 */
export function randomSample(array, count) {
  if (count > array.length) {
    throw new Error('randomSample: count exceeds array length');
  }
  return shuffle([...array]).slice(0, count);
}

/**
 * Create a deterministic pseudo-random generator (mulberry32).
 * Same seed → same sequence, across runs and engines. Seed a generator
 * with a frame index to make any animation renderable to video with
 * identical output per frame.
 *
 * Ported from spatial_videos/pipeline/overlay/phrases.js (mulberry32).
 *
 * @param {number} seed - Any number; coerced to uint32
 * @returns {() => number} Generator returning floats in [0, 1)
 *
 * @example
 * const rng = seededRandom(frameIdx);
 * const phrase = phrases[Math.floor(rng() * phrases.length)];
 */
export function seededRandom(seed) {
  let a = seed >>> 0;
  return function () {
    a |= 0; a = (a + 0x6D2B79F5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { randomPick, randomInt, randomFloat, randomVariance, shuffle, randomSample, seededRandom };
}
