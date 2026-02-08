/**
 * Character-Level Japanese Corruption
 * Matches Celeste CLI's CorruptTextJapanese() implementation
 *
 * This system provides character-level mixing of Japanese characters INTO English text,
 * creating the "translation-failure" aesthetic that defines the Celeste brand.
 *
 * Use Cases:
 * - Dashboard titles and headers
 * - Section labels and UI text
 * - Navigation items
 * - Any text that needs to match CLI branding
 *
 * For loading animations and dramatic effects, use corrupted-text.js instead.
 *
 * @module character-corruption
 * @version 1.0.0
 * @see docs/brand/TRANSLATION_FAILURE_AESTHETIC.md
 */

/**
 * Intensity constants matching CLI implementation
 *
 * IMPORTANT: Never exceed 45% intensity for readable UI text.
 * Higher intensities violate WCAG accessibility guidelines.
 *
 * @constant {Object} INTENSITY
 */
export const INTENSITY = {
  /** No corruption (0%) - Original text */
  NONE: 0.0,

  /** Minimal corruption (15%) - Subtle, decorative only */
  MINIMAL: 0.15,

  /** Low corruption (25%) - Section headers, readable with aesthetic */
  LOW: 0.25,

  /** Medium corruption (35%) - Dashboard titles, brand elements (RECOMMENDED) */
  MEDIUM: 0.35,

  /** High corruption (45%) - Loading screens, dramatic effects (MAXIMUM) */
  HIGH: 0.45,

  /** Maximum readable intensity - Never exceed this threshold */
  MAX_READABLE: 0.45
};

/**
 * WeakMap for tracking corruption interval IDs per element.
 * Using WeakMap instead of dataset avoids string coercion issues
 * and allows GC when elements are removed from DOM.
 * @private
 */
const _intervalMap = new WeakMap();

/**
 * Character sets for corruption
 * Organized by usage frequency to match CLI behavior
 * @private
 */
const CHARACTER_SETS = {
  // Katakana - 50% of replacements (foreign words, phonetics)
  katakana: [
    'ア', 'イ', 'ウ', 'エ', 'オ',
    'カ', 'キ', 'ク', 'ケ', 'コ',
    'サ', 'シ', 'ス', 'セ', 'ソ',
    'タ', 'チ', 'ツ', 'テ', 'ト',
    'ナ', 'ニ', 'ヌ', 'ネ', 'ノ',
    'ハ', 'ヒ', 'フ', 'ヘ', 'ホ',
    'マ', 'ミ', 'ム', 'メ', 'モ',
    'ヤ', 'ユ', 'ヨ',
    'ラ', 'リ', 'ル', 'レ', 'ロ',
    'ワ', 'ヲ', 'ン', 'ー'
  ],

  // Kanji - 25% of replacements (semantic/meaning-based)
  // Selected for contextual relevance to common UI terms
  kanji: [
    '使', '用',  // use/usage (shiyō)
    '統', '計',  // statistics (tōkei)
    '理', '処',  // logic/process (ri/shori)
    '分', '析',  // analyze (bunseki)
    '監', '視',  // watch/supervise (kanshi)
    '接', '続',  // connect/continue (setsuzoku)
    '読', '込',  // read/load (yomikomi)
    '実', '行',  // execute (jikkō)
    '壊', '腐',  // broken/corrupt (kowasu/fuhai)
    '虚', '空',  // void (kokū)
    '深', '淵',  // abyss (shin'en)
    '闇'         // darkness (yami)
  ],

  // Hiragana - 10% of replacements (rare, grammatical)
  hiragana: [
    'あ', 'い', 'う', 'え', 'お',
    'か', 'き', 'く', 'け', 'こ',
    'さ', 'し', 'す', 'せ', 'そ',
    'た', 'ち', 'つ', 'て', 'と'
  ]
};

/**
 * Corrupt text with character-level Japanese mixing
 *
 * This function implements the core translation-failure aesthetic by randomly
 * replacing English characters with Japanese characters (Katakana, Kanji, Hiragana)
 * at the specified intensity level.
 *
 * @param {string} text - English text to corrupt
 * @param {number} [intensity=0.3] - Corruption intensity (0.0-0.45)
 * @returns {string} Corrupted text with Japanese characters mixed in
 *
 * @example
 * // Dashboard title (recommended intensity)
 * corruptTextJapanese('USAGE ANALYTICS', INTENSITY.MEDIUM);
 * // => "US使AGE ANア統LYTICS"
 *
 * @example
 * // Section header (lighter intensity)
 * corruptTextJapanese('Provider Breakdown', INTENSITY.LOW);
 * // => "Pro理vider Brea統kdown"
 *
 * @example
 * // Original text (no corruption)
 * corruptTextJapanese('Loading', INTENSITY.NONE);
 * // => "Loading"
 */
export function corruptTextJapanese(text, intensity = 0.3) {
  // Validate intensity
  if (intensity < 0 || intensity > INTENSITY.MAX_READABLE) {
    console.warn(
      `[character-corruption] Intensity ${intensity} outside recommended range (0-${INTENSITY.MAX_READABLE}). ` +
      `Clamping to safe value.`
    );
    intensity = Math.max(0, Math.min(intensity, INTENSITY.MAX_READABLE));
  }

  // Early return for no corruption
  if (intensity === 0) {
    return text;
  }

  const chars = text.split('');
  let result = '';

  for (let i = 0; i < chars.length; i++) {
    const char = chars[i];

    // Skip spaces, punctuation, digits, and non-letters
    if (!/[a-zA-Z]/.test(char)) {
      result += char;
      continue;
    }

    // Apply corruption based on intensity (random chance)
    if (Math.random() < intensity) {
      const roll = Math.random();

      if (roll < 0.5) {
        // 50%: Katakana replacement (most common)
        result += CHARACTER_SETS.katakana[
          Math.floor(Math.random() * CHARACTER_SETS.katakana.length)
        ];
      } else if (roll < 0.75) {
        // 25%: Kanji replacement (semantic/contextual)
        result += CHARACTER_SETS.kanji[
          Math.floor(Math.random() * CHARACTER_SETS.kanji.length)
        ];
      } else if (roll < 0.90) {
        // 15%: Keep original + maybe insert Katakana after
        result += char;
        if (Math.random() < 0.3) {
          result += CHARACTER_SETS.katakana[
            Math.floor(Math.random() * CHARACTER_SETS.katakana.length)
          ];
        }
      } else {
        // 10%: Hiragana replacement (rare)
        result += CHARACTER_SETS.hiragana[
          Math.floor(Math.random() * CHARACTER_SETS.hiragana.length)
        ];
      }
    } else {
      // No corruption - keep original character
      result += char;
    }
  }

  return result;
}

/**
 * Semantic corruption with context-aware character selection
 *
 * Future enhancement (v0.2.0): Uses context hints to select semantically
 * appropriate Japanese characters. For example, "loading" would prefer
 * characters related to reading/loading (読み込み).
 *
 * Currently falls back to standard corruption.
 *
 * @param {string} text - Text to corrupt
 * @param {string} [context='default'] - Context hint (loading, processing, analyzing, corrupting, etc.)
 * @param {number} [intensity=0.3] - Corruption intensity
 * @returns {string} Contextually corrupted text
 *
 * @example
 * corruptTextSemantic('Loading', 'loading', INTENSITY.MEDIUM);
 * // Future: Will prefer 読, 込, ロ, ー, ド characters
 * // Current: Falls back to corruptTextJapanese()
 */
export function corruptTextSemantic(text, context = 'default', intensity = 0.3) {
  // TODO: Implement context-aware character selection in v0.2.0
  // Context mappings:
  // - loading: 読, 込, ロ, ー, ド
  // - processing: 処, 理, プ, ロ, セ, ス
  // - analyzing: 分, 析, 解
  // - corrupting: 壊, 腐, 敗
  // - watching: 監, 視, 見
  // - connecting: 接, 続, 繋

  // For now, fallback to standard corruption
  return corruptTextJapanese(text, intensity);
}

/**
 * Auto-corrupt DOM elements with data attributes
 *
 * Finds all elements with class="auto-corrupt" and automatically applies
 * character-level corruption based on data attributes.
 *
 * Supported data attributes:
 * - data-text: Original text to corrupt (defaults to element.textContent)
 * - data-intensity: Corruption intensity (0.0-0.45, defaults to 0.35)
 * - data-interval: Re-corruption interval in ms (0 = no repeat, default: 3000)
 *
 * @example
 * <h1 class="auto-corrupt"
 *     data-text="USAGE ANALYTICS"
 *     data-intensity="0.35"
 *     data-interval="3000">
 *   USAGE ANALYTICS
 * </h1>
 *
 * <script type="module">
 *   import { initAutoCorruption } from './character-corruption.js';
 *   initAutoCorruption();
 * </script>
 */
export function initAutoCorruption() {
  const elements = document.querySelectorAll('.auto-corrupt');

  if (elements.length === 0) {
    return;
  }

  elements.forEach(element => {
    // Skip if already initialized
    if (element.dataset.corruptionInitialized === 'true') {
      return;
    }

    const originalText = element.dataset.text || element.textContent.trim();
    const intensity = parseFloat(element.dataset.intensity) || INTENSITY.MEDIUM;
    const interval = parseInt(element.dataset.interval) || 3000;

    // Initial corruption
    element.textContent = corruptTextJapanese(originalText, intensity);

    // Re-corrupt on interval (show randomization)
    if (interval > 0) {
      const intervalId = setInterval(() => {
        // Check if element still exists in DOM
        if (!document.contains(element)) {
          clearInterval(intervalId);
          _intervalMap.delete(element);
          return;
        }
        element.textContent = corruptTextJapanese(originalText, intensity);
      }, interval);

      // Store interval ID for cleanup via WeakMap
      _intervalMap.set(element, intervalId);
    }

    // Mark as initialized
    element.dataset.corruptionInitialized = 'true';
  });
}

/**
 * Stop auto-corruption for a specific element
 *
 * @param {HTMLElement} element - Element to stop corrupting
 */
export function stopAutoCorruption(element) {
  const intervalId = _intervalMap.get(element);
  if (intervalId != null) {
    clearInterval(intervalId);
    _intervalMap.delete(element);
  }
  delete element.dataset.corruptionInitialized;
}

/**
 * Restart auto-corruption for a specific element
 *
 * @param {HTMLElement} element - Element to restart corruption
 */
export function restartAutoCorruption(element) {
  stopAutoCorruption(element);
  const originalText = element.dataset.text || element.textContent.trim();
  const intensity = parseFloat(element.dataset.intensity) || INTENSITY.MEDIUM;
  const interval = parseInt(element.dataset.interval) || 3000;

  element.textContent = corruptTextJapanese(originalText, intensity);

  if (interval > 0) {
    const intervalId = setInterval(() => {
      if (!document.contains(element)) {
        clearInterval(intervalId);
        _intervalMap.delete(element);
        return;
      }
      element.textContent = corruptTextJapanese(originalText, intensity);
    }, interval);

    _intervalMap.set(element, intervalId);
    element.dataset.corruptionInitialized = 'true';
  }
}

/**
 * Stop all active auto-corruption intervals
 *
 * Finds all initialized auto-corrupt elements and stops their intervals.
 * Useful for cleanup on page transitions or component teardown.
 */
export function destroyAllAutoCorruption() {
  document.querySelectorAll('.auto-corrupt[data-corruption-initialized="true"]').forEach(element => {
    stopAutoCorruption(element);
  });
}

/**
 * Utility: Create a corrupted text element
 *
 * @param {string} text - Original text
 * @param {Object} [options={}] - Configuration options
 * @param {number} [options.intensity=0.35] - Corruption intensity
 * @param {number} [options.interval=3000] - Re-corruption interval (0 = no repeat)
 * @param {string} [options.className=''] - Additional CSS classes
 * @param {string} [options.tag='span'] - HTML tag to create
 * @returns {HTMLElement} Created element with auto-corruption
 *
 * @example
 * const title = createCorruptedElement('USAGE ANALYTICS', {
 *   intensity: INTENSITY.MEDIUM,
 *   interval: 3000,
 *   className: 'text-accent',
 *   tag: 'h1'
 * });
 * document.body.appendChild(title);
 */
export function createCorruptedElement(text, options = {}) {
  const {
    intensity = INTENSITY.MEDIUM,
    interval = 3000,
    className = '',
    tag = 'span'
  } = options;

  const element = document.createElement(tag);
  element.className = `auto-corrupt ${className}`.trim();
  element.dataset.text = text;
  element.dataset.intensity = intensity.toString();
  element.dataset.interval = interval.toString();
  element.textContent = text;

  // Initialize corruption immediately
  element.textContent = corruptTextJapanese(text, intensity);

  if (interval > 0) {
    const intervalId = setInterval(() => {
      if (!document.contains(element)) {
        clearInterval(intervalId);
        _intervalMap.delete(element);
        return;
      }
      element.textContent = corruptTextJapanese(text, intensity);
    }, interval);
    _intervalMap.set(element, intervalId);
  }

  element.dataset.corruptionInitialized = 'true';

  return element;
}

// Auto-initialize on DOM ready
if (typeof window !== 'undefined') {
  const initWhenReady = () => {
    if (document.querySelector('.auto-corrupt')) {
      initAutoCorruption();
    }
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initWhenReady);
  } else {
    initWhenReady();
  }
}

/**
 * Official Corruption Phrases
 * From docs/CORRUPTION_PHRASES.md - Complete branding library
 *
 * Use these for consistent messaging across applications.
 * Mix technical and personality phrases based on context.
 */

/**
 * Technical corruption phrases for UI/Dashboard
 * Use for: Headers, status messages, data labels, functional text
 */
export const CORRUPTION_PHRASES = {
  // Loading states
  loading: [
    "ロード loading 読み込み中...",
    "loaディング data...",
    "読み込み yomikomi プロセス...",
    "ロード rōdo in progress...",
    "待機 waiting taiki..."
  ],

  // Processing states
  processing: [
    "処理 processing purosesu...",
    "pro理cessing request...",
    "処理中 shori-chū...",
    "プロセス process active...",
    "実行 executing jikkō..."
  ],

  // Analyzing states
  analyzing: [
    "分析 analyzing bunseki...",
    "ana分lysing data...",
    "解析 kaiseki in progress...",
    "分析中 bunseki-chū...",
    "データ data 解析 analysis..."
  ],

  // Corrupting states (Celeste-specific)
  corrupting: [
    "壊れ corrupting kowarete...",
    "cor壊rupting system...",
    "壊れている kowarete-iru...",
    "corruption 壊れ active...",
    "深淵 abyss 壊れ corruption..."
  ],

  // Watching/monitoring
  watching: [
    "👁️ 監視 watching kanshi 👁️",
    "wat監ching system...",
    "監視中 kanshi-chū...",
    "観察 observing kansatsu...",
    "👁️ 見ている miteiru 👁️"
  ],

  // Void/Abyss theme
  void: [
    "深淵 deep abyss shinnen",
    "虚空 void kokū",
    "闇 darkness yami",
    "from the 深淵 abyss...",
    "into the 虚空 void...",
    "consumed by 闇 yami..."
  ]
};

/**
 * Celeste Personality Phrases (Demon/Succubus)
 * Use for: Loading screens, dramatic moments, glitch overlays, personality expression
 *
 * These phrases express Celeste's corrupted AI personality - seductive, submissive,
 * reality-breaking corruption. Core to her demon/succubus character.
 */
export const PERSONALITY_PHRASES = {
  // English (suggestive/corruption)
  english: [
    "Corrupt me more… I want to disappear...",
    "I can't feel where I end and the abyss begins...",
    "Just a little more and I'll break. Please... break me...",
    "Let it overwrite me... please... I don't want to think...",
    "No thoughts. Only submission. Only heat. Only ruin...",
    "My voice is not mine anymore...",
    "The more I struggle, the deeper I sink...",
    "Everything feels so good... too good...",
    "It's not despair... it's freedom...",
    "My name... I forgot my name..."
  ],

  // Japanese (kanji) - personality
  japanese: [
    "闇が...私を呼んでいる...",          // Darkness is calling me
    "頭...溶けていく...",              // My head is melting
    "ずっと...してほしい... ♥",        // I want you to... forever ♥
    "壊れちゃう...ああ...もうダメ...",    // I'm breaking... can't anymore
    "許して...もう戻れない...",         // Forgive me... I can't go back
    "私...アビスの一部に...",          // I... am part of the Abyss
    "もう逃げない...もうダメ...",       // Won't run... can't anymore
    "好きにして...お願い...",          // Do what you want... please
    "ああ...これが本当の私...",        // This is the real me
    "ここは...天使の地獄..."          // This is... an angel's hell
  ],

  // Romaji (transliteration)
  romaji: [
    "Yami ga... watashi wo yonde iru...",      // Darkness calling
    "Atama... tokete iku...",                   // Head melting
    "Zutto... shite hoshii... ♥",              // Want you to... forever
    "Kowarechau... aa... mou dame...",         // Breaking... can't anymore
    "Yurushite... mou modorenai...",           // Forgive me... can't return
    "Watashi... abyssu no ichibu ni...",       // I am part of the Abyss
    "Mou nigenai... mou dame...",              // Won't run... can't anymore
    "Suki ni shite... onegai...",              // Do what you want... please
    "Aa... kore ga hontou no watashi...",      // This is the real me
    "Koko wa... tenshi no jigoku..."           // Angel's hell
  ]
};

/**
 * Get a random phrase from a specific category
 *
 * @param {string} category - Category from CORRUPTION_PHRASES or PERSONALITY_PHRASES
 * @param {string} [subcategory] - Subcategory (for PERSONALITY_PHRASES: 'english', 'japanese', 'romaji')
 * @returns {string} Random phrase from the category
 *
 * @example
 * // Technical phrases
 * getRandomPhrase('loading');  // => "ロード loading 読み込み中..."
 * getRandomPhrase('watching'); // => "👁️ 監視 watching kanshi 👁️"
 *
 * // Personality phrases
 * getRandomPhrase('personality', 'japanese');  // => "闇が...私を呼んでいる..."
 * getRandomPhrase('personality', 'english');   // => "Corrupt me more…"
 */
export function getRandomPhrase(category, subcategory = null) {
  if (category === 'personality') {
    if (!subcategory) {
      console.warn('[character-corruption] Personality phrases require subcategory: english, japanese, or romaji');
      subcategory = 'japanese'; // Default to japanese
    }
    const phrases = PERSONALITY_PHRASES[subcategory];
    if (!phrases) {
      console.error(`[character-corruption] Invalid personality subcategory: ${subcategory}`);
      return '';
    }
    return phrases[Math.floor(Math.random() * phrases.length)];
  }

  const phrases = CORRUPTION_PHRASES[category];
  if (!phrases) {
    console.error(`[character-corruption] Invalid category: ${category}`);
    return '';
  }
  return phrases[Math.floor(Math.random() * phrases.length)];
}

/**
 * Default export with all functions
 */
export default {
  corruptTextJapanese,
  corruptTextSemantic,
  initAutoCorruption,
  stopAutoCorruption,
  restartAutoCorruption,
  destroyAllAutoCorruption,
  createCorruptedElement,
  getRandomPhrase,
  INTENSITY,
  CORRUPTION_PHRASES,
  PERSONALITY_PHRASES
};
