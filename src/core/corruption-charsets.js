/**
 * CorruptionCharsets
 *
 * Named registry over canonical src/data/charsets.json. Provides direct
 * named access (katakana, hiragana, kanji, symbols, blocks) plus
 * computed convenience sets (standard, soft, intense, all).
 *
 * Ported from celeste-tts-bot/obs/shared/corruption-utils.js with the
 * data side moved to canonical JSON.
 *
 * Computed set definitions:
 *   standard  = katakana + symbols  (matrix-style + decorative glitches)
 *   soft      = hiragana            (softer / intimate degradation)
 *   intense   = kanji + blocks      (deep corruption + severe data loss)
 *   all       = union of every set
 *
 * @module corruption-charsets
 */

import charsets from '../data/charsets.data.js';

export const CorruptionCharsets = {
  // Named sets (read-through to canonical JSON)
  get katakana() { return charsets.katakana; },
  get hiragana() { return charsets.hiragana; },
  get kanji()    { return charsets.kanji; },
  get symbols()  { return charsets.symbols; },
  get blocks()   { return charsets.blocks; },

  // Computed convenience sets
  get standard() { return charsets.katakana + charsets.symbols; },
  get soft()     { return charsets.hiragana; },
  get intense()  { return charsets.kanji + charsets.blocks; },
  get all()      { return charsets.katakana + charsets.hiragana + charsets.kanji + charsets.symbols + charsets.blocks; },
};

// CJS interop
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { CorruptionCharsets };
}
