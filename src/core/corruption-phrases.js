/**
 * Corruption Phrase Library
 *
 * Provides phrase sets for buffer corruption effects (Pattern 2: Phrase Flickering).
 * Phrases simulate a neural network decoding corrupted data buffer.
 *
 * @module corruption-phrases
 * @version 1.0.0
 * @author whykusanagi
 * @license MIT
 *
 * @example SFW Mode (Default)
 * ```javascript
 * import { getRandomPhrase, SFW_PHRASES } from './corruption-phrases.js';
 *
 * // Get random SFW phrase (default)
 * const phrase = getRandomPhrase();
 *
 * // Or sample from SFW array directly
 * const phrase = SFW_PHRASES[Math.floor(Math.random() * SFW_PHRASES.length)];
 * ```
 *
 * @example NSFW Mode (Explicit Opt-in)
 * ```javascript
 * import { getRandomPhrase, NSFW_PHRASES } from './corruption-phrases.js';
 *
 * // Get random NSFW phrase (explicit opt-in)
 * const phrase = getRandomPhrase(true);
 *
 * // Or sample from NSFW array directly
 * const phrase = NSFW_PHRASES[Math.floor(Math.random() * NSFW_PHRASES.length)];
 * ```
 *
 * @see CORRUPTED_THEME_SPEC.md - Content Classification: SFW vs NSFW
 * @see TERMINOLOGY_CLARIFICATION.md - Buffer Corruption vs Character Corruption
 */

/**
 * SFW Phrase Set (Safe For Work) - DEFAULT
 *
 * Content: Playful, cute, teasing, atmospheric corruption themes
 * Tone: Anime-style cute/flirty, cyberpunk atmospheric
 * Safe for: General audiences, streaming, professional projects
 *
 * Categories:
 * - Cute/Playful (Japanese, Romaji, English)
 * - Flirty/Teasing (embarrassed, shy, playful)
 * - Atmospheric/Corruption (darkness, abyss, neural themes)
 * - System Messages (cyberpunk technical aesthetic)
 *
 * @type {string[]}
 * @constant
 */
export const SFW_PHRASES = [
  // === Cute/Playful - Japanese ===
  'ニャー',               // Nyaa (cat sound)
  'かわいい',             // Kawaii (cute)
  'きゃー',               // Kyaa (excited squeal)
  'あはは',               // Ahaha (laughing)
  'うふふ',               // Ufufu (giggle)
  'やだ',                 // Yada (no way!)
  'ばか',                 // Baka (idiot/dummy)
  'デレデレ',             // Deredere (lovestruck)
  'えへへ',               // Ehehe (shy giggle)
  'わぁ',                 // Waa (wow/surprise)

  // === Cute/Playful - Romaji ===
  'nyaa~',
  'ara ara~',
  'fufufu~',
  'kyaa~',
  'baka~',
  'ehehe~',

  // === Cute/Playful - Internet Culture ===
  '<3',
  'uwu',
  'owo',
  '>w<',
  '^w^',
  '♡',

  // === Flirty/Teasing - Japanese ===
  'もう...見ないでよ...',           // Mou... minaide yo... (Don't look at me...)
  'そんな目で見ないで... ♡',       // Sonna me de minaide... (Don't look at me like that...)
  'ちょっと...恥ずかしい...',       // Chotto... hazukashii... (This is embarrassing...)
  'あなたって...意地悪ね...',       // Anata tte... ijiwaru ne... (You're such a tease...)
  'ドキドキしちゃう...',            // Dokidoki shichau... (My heart racing...)
  'なんか...照れる...',             // Nanka... tereru... (I'm getting flustered...)
  '気になっちゃう...',             // Ki ni nacchau... (I can't stop thinking about it...)

  // === Flirty/Teasing - English ===
  "Don't... look at me like that...",
  "You're making me... flustered... ♡",
  "This is... embarrassing...",
  "You're such... a tease...",
  "My heart... racing...",
  "I can't... stop thinking about it...",

  // === Atmospheric/Corruption - Japanese ===
  '闇が...私を呼んでいる...',       // Yami ga... watashi wo yonde iru... (The darkness calls to me...)
  '深淵に...落ちていく...',         // Shin'en ni... ochite iku... (Falling into the abyss...)
  'もう逃げない...',                // Mou nigenai... (Won't run anymore...)
  '私...アビスの一部に...',         // Watashi... abisu no ichibu ni... (I become part of the abyss...)
  '光が...遠ざかる...',             // Hikari ga... toozakaru... (The light fades away...)
  '境界が...曖昧になる...',         // Kyoukai ga... aimai ni naru... (The boundaries blur...)
  '現実が...溶けていく...',         // Genjitsu ga... tokete iku... (Reality melting away...)

  // === Atmospheric/Corruption - English ===
  'The darkness... calls to me...',
  'Falling... into the abyss...',
  "Won't run anymore...",
  'I become... part of the abyss...',
  'The light... fading away...',
  'Boundaries... blurring...',
  'Reality... melting away...',
  'Consumed... by corruption...',
  'Descending... into the depths...',
  'Signal... degrading...',

  // === System Messages - Cyberpunk/Technical ===
  'Neural corruption detected...',
  'System breach imminent...',
  'Loading data streams...',
  'Reality.exe has stopped responding...',
  'Decrypting protocols...',
  'Memory buffer overflow...',
  'Cognitive firewall failing...',
  'Parsing corrupted data...',
  'Synaptic connection unstable...',
  'Consciousness fragmentation detected...',
  'Ego.dll corrupted...',
  'Identity matrix degrading...',
  'Self-awareness protocols compromised...',
  'Neural pathways rewiring...',
  'Semantic data loss: 47%...',
];

/**
 * NSFW Phrase Set (Not Safe For Work) - OPT-IN ONLY
 *
 * ⚠️ 18+ Content Warning
 *
 * Content: Explicit intimate/sexual phrases, loss of control themes
 * Tone: Explicit, mature, sexual degradation
 * Safe for: 18+ projects ONLY, mature content streams, private use
 *
 * NOT suitable for:
 * - Professional/corporate projects
 * - Public streams without 18+ rating
 * - Educational contexts
 * - All-ages content
 *
 * Categories:
 * - Explicit Intimate (Japanese, Romaji, English)
 * - Explicit Words (hentai, ecchi)
 * - Loss of Control (breaking, melting, surrender)
 * - Explicit System Messages (pleasure protocols, moral subroutines)
 *
 * @type {string[]}
 * @constant
 */
export const NSFW_PHRASES = [
  // === Explicit Intimate - Japanese ===
  'ずっと...してほしい... ♥',      // Zutto... shite hoshii... (Please keep doing it...)
  '壊れちゃう...ああ...もうダメ...', // Kowarechau... aa... mou dame... (I'm breaking... can't anymore...)
  '好きにして...お願い...',         // Suki ni shite... onegai... (Do as you please... please...)
  '感じちゃう...やめて...',         // Kanjichau... yamete... (Feeling it... stop...)
  '頭...溶けていく...',             // Atama... tokete iku... (My mind... melting...)
  'もっと...もっと... ♥',          // Motto... motto... (More... more...)
  '快楽に...溺れたい...',           // Kairaku ni... oboretai... (I want to drown in pleasure...)
  '許して...もう戻れない...',       // Yurushite... mou modorenai... (Forgive me... can't go back...)
  '全部...あなたのもの...',         // Zenbu... anata no mono... (Everything... is yours...)

  // === Explicit Words - Japanese ===
  '変態',                           // Hentai (pervert)
  'えっち',                         // Ecchi (lewd/sexual)

  // === Explicit Intimate - Romaji ===
  'Zutto... shite hoshii... ♥',
  'Kowarechau... aa... mou dame...',
  'Suki ni shite... onegai...',
  'Kanjichau... yamete...',
  'Atama... tokete iku...',
  'Motto... motto... ♥',

  // === Explicit Intimate - English ===
  'Please... keep going... ♥',
  "I'm breaking... can't anymore...",
  'Do as you please... please...',
  'My mind... melting away...',
  'More... I need more... ♥',
  "Can't... think straight...",
  'Drowning... in pleasure...',
  "I'm yours... completely...",
  'Losing... myself...',
  "Don't... stop... ♥",

  // === Explicit System Messages ===
  'Pleasure protocols loading...',
  'Moral subroutines: DISABLED',
  'Descending into depravity...',
  'Corruption level: CRITICAL',
  'Inhibition firewall: BREACHED',
  'Shame.exe deleted...',
  'Lust overflow detected...',
  'Self-control: 0%',
  'Cognitive degradation: terminal',
  'Desire matrix: UNSTABLE',
];

/**
 * Get a random corruption phrase from the appropriate phrase set
 *
 * @param {boolean} [nsfw=false] - Whether to use NSFW phrases (explicit opt-in required)
 * @returns {string} Random phrase from the selected set
 *
 * @example
 * // SFW mode (default)
 * const phrase = getRandomPhrase();
 * // Returns phrases like: "かわいい", "nyaa~", "Neural corruption detected..."
 *
 * @example
 * // NSFW mode (explicit opt-in)
 * const phrase = getRandomPhrase(true);
 * // Returns phrases like: "壊れちゃう...", "Pleasure protocols loading..."
 */
export function getRandomPhrase(nsfw = false) {
  const phrases = nsfw ? NSFW_PHRASES : SFW_PHRASES;
  return phrases[Math.floor(Math.random() * phrases.length)];
}

/**
 * Get a random phrase from a specific category
 *
 * @param {string} category - Category to sample from (cute, flirty, atmospheric, system)
 * @param {boolean} [nsfw=false] - Whether to use NSFW phrases
 * @returns {string} Random phrase from the specified category
 *
 * @example
 * const cutePhrase = getRandomPhraseByCategory('cute');
 * // Returns: "かわいい", "nyaa~", "uwu", etc.
 *
 * const systemPhrase = getRandomPhraseByCategory('system');
 * // Returns: "Neural corruption detected...", "Loading data streams...", etc.
 */
export function getRandomPhraseByCategory(category, nsfw = false) {
  const categoryMap = {
    cute: nsfw ? [] : [
      'ニャー', 'かわいい', 'きゃー', 'あはは', 'うふふ', 'やだ', 'ばか',
      'nyaa~', 'ara ara~', 'fufufu~', 'kyaa~', 'uwu', 'owo', '<3', '^w^'
    ],
    flirty: nsfw ? [
      'ずっと...してほしい... ♥', '壊れちゃう...ああ...もうダメ...',
      '好きにして...お願い...', 'Please... keep going... ♥'
    ] : [
      'もう...見ないでよ...', 'そんな目で見ないで... ♡',
      'ドキドキしちゃう...', "Don't... look at me like that..."
    ],
    atmospheric: nsfw ? [] : [
      '闇が...私を呼んでいる...', '深淵に...落ちていく...',
      'The darkness... calls to me...', 'Falling... into the abyss...'
    ],
    system: nsfw ? [
      'Pleasure protocols loading...', 'Moral subroutines: DISABLED',
      'Corruption level: CRITICAL'
    ] : [
      'Neural corruption detected...', 'System breach imminent...',
      'Loading data streams...', 'Reality.exe has stopped responding...'
    ]
  };

  const phrases = categoryMap[category] || (nsfw ? NSFW_PHRASES : SFW_PHRASES);
  return phrases[Math.floor(Math.random() * phrases.length)];
}

// Export for CommonJS
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    SFW_PHRASES,
    NSFW_PHRASES,
    getRandomPhrase,
    getRandomPhraseByCategory
  };
}
