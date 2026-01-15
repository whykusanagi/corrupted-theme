/**
 * Typing Animation with Buffer Corruption
 *
 * Simulates typing text with "buffer corruption" - phrases flickering through
 * as the neural network attempts to decode corrupted data before revealing
 * the final stable text.
 *
 * Implements Pattern 2 (Phrase Flickering / Buffer Corruption) from CORRUPTED_THEME_SPEC.md
 *
 * @class TypingAnimation
 * @version 1.0.0
 * @author whykusanagi
 * @license MIT
 *
 * @example SFW Mode (Default)
 * ```javascript
 * const element = document.querySelector('.typing-text');
 * const typing = new TypingAnimation(element, {
 *   typingSpeed: 40,
 *   glitchChance: 0.08
 *   // nsfw: false (default - SFW phrases only)
 * });
 *
 * typing.start('Neural corruption detected...');
 * ```
 *
 * @example NSFW Mode (Explicit Opt-in)
 * ```javascript
 * // ⚠️ 18+ Content Warning
 * const typing = new TypingAnimation(element, {
 *   nsfw: true  // Explicit opt-in for NSFW phrases
 * });
 * ```
 *
 * @see CORRUPTED_THEME_SPEC.md - Pattern 2: Phrase Flickering (Buffer Corruption)
 * @see corruption-phrases.js - Phrase library with SFW/NSFW split
 */

import { getRandomPhrase, getRandomPhraseByCategory } from './corruption-phrases.js';

class TypingAnimation {
  /**
   * Creates a new TypingAnimation instance
   *
   * @param {HTMLElement} element - The DOM element to animate
   * @param {Object} [options={}] - Configuration options
   * @param {number} [options.typingSpeed=40] - Characters per second
   * @param {number} [options.glitchChance=0.08] - Probability of corruption appearing (0-1)
   * @param {number} [options.tickRate=33] - Update interval in milliseconds (~30fps)
   * @param {boolean} [options.nsfw=false] - Enable NSFW phrases (explicit opt-in required)
   * @param {Function} [options.onComplete=null] - Callback when typing completes
   */
  constructor(element, options = {}) {
    this.element = element;
    this.options = {
      typingSpeed: options.typingSpeed || 40, // characters per second
      glitchChance: options.glitchChance || 0.08, // 8% chance of buffer corruption
      tickRate: options.tickRate || 33, // ~30fps update rate
      nsfw: options.nsfw || false, // SFW by default
      onComplete: options.onComplete || null,
      ...options
    };

    this.content = '';
    this.displayedLen = 0;
    this.done = false;
    this.intervalId = null;
  }

  /**
   * SFW Japanese phrases (cute, playful, atmospheric)
   * @private
   */
  static SFW_JAPANESE = [
    // Cute/Playful
    'ニャー',               // Nyaa (cat sound)
    'かわいい',             // Kawaii (cute)
    'きゃー',               // Kyaa (excited squeal)
    'あはは',               // Ahaha (laughing)
    'うふふ',               // Ufufu (giggle)
    'やだ',                 // Yada (no way!)
    'ばか',                 // Baka (idiot/dummy)
    'デレデレ',             // Deredere (lovestruck)

    // Flirty/Teasing
    'もう...見ないでよ...',           // Don't look at me...
    'そんな目で見ないで... ♡',       // Don't look at me like that...
    'ドキドキしちゃう...',            // My heart racing...

    // Atmospheric/Corruption
    '闇が...私を呼んでいる...',       // The darkness calls to me...
    '深淵に...落ちていく...',         // Falling into the abyss...
    'もう逃げない...',                // Won't run anymore...
    '私...アビスの一部に...',         // I become part of the abyss...
  ];

  /**
   * NSFW Japanese phrases (explicit intimate/sexual) - OPT-IN ONLY
   * @private
   */
  static NSFW_JAPANESE = [
    'ずっと...してほしい... ♥',      // Please keep doing it...
    '壊れちゃう...ああ...もうダメ...', // I'm breaking... can't anymore...
    '好きにして...お願い...',         // Do as you please... please...
    '感じちゃう...やめて...',         // Feeling it... stop...
    '頭...溶けていく...',             // My mind... melting...
    '許して...もう戻れない...',       // Forgive me... can't go back...
    '変態',                           // Hentai (pervert)
    'えっち',                         // Ecchi (lewd/sexual)
  ];

  /**
   * SFW Romaji/Internet culture phrases
   * @private
   */
  static SFW_ROMAJI = [
    'nyaa~', 'ara ara~', 'fufufu~', 'kyaa~', 'baka~',
    '<3', 'uwu', 'owo', '>w<', '^w^'
  ];

  /**
   * NSFW Romaji phrases - OPT-IN ONLY
   * @private
   */
  static NSFW_ROMAJI = [
    'Zutto... shite hoshii... ♥',
    'Kowarechau... aa... mou dame...',
    'Motto... motto... ♥'
  ];

  /**
   * SFW English phrases (atmospheric, system messages)
   * @private
   */
  static SFW_ENGLISH = [
    // Atmospheric
    'The darkness... calls to me...',
    'Falling... into the abyss...',
    "Won't run anymore...",
    'Consumed... by corruption...',

    // System messages
    'Neural corruption detected...',
    'System breach imminent...',
    'Loading data streams...',
    'Reality.exe has stopped responding...',
    'Decrypting protocols...',
    'Memory buffer overflow...',
  ];

  /**
   * NSFW English phrases - OPT-IN ONLY
   * @private
   */
  static NSFW_ENGLISH = [
    'Please... keep going... ♥',
    "I'm breaking... can't anymore...",
    'Do as you please... please...',
    'My mind... melting away...',
    'Pleasure protocols loading...',
    'Moral subroutines: DISABLED',
    'Corruption level: CRITICAL',
  ];

  /**
   * Symbol corruption (decorative, SFW)
   * @private
   */
  static SYMBOLS = [
    '★', '☆', '♥', '♡', '✧', '✦', '◆', '◇', '●', '○',
    '♟', '☣', '☭', '☾', '⚔', '✡', '☯', '⚡'
  ];

  /**
   * Block corruption characters (heavy degradation)
   * @private
   */
  static BLOCKS = [
    '█', '▓', '▒', '░', '▄', '▀', '▌', '▐',
    '╔', '╗', '╚', '╝', '═', '║', '╠', '╣',
    '▲', '▼', '◄', '►', '◊', '○', '●', '◘'
  ];

  /**
   * Start typing animation with buffer corruption
   *
   * @param {string} content - The final text to reveal
   * @public
   */
  start(content) {
    this.content = content;
    this.displayedLen = 0;
    this.done = false;

    if (this.intervalId) {
      clearInterval(this.intervalId);
    }

    this.intervalId = setInterval(() => this.tick(), this.options.tickRate);
  }

  /**
   * Stop the typing animation
   * @public
   */
  stop() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
    this.done = true;
  }

  /**
   * Advance the typing animation by one tick
   * @private
   */
  tick() {
    if (this.isDone()) {
      this.stop();
      if (this.options.onComplete) {
        this.options.onComplete();
      }
      return;
    }

    // Calculate characters to advance based on speed
    // typingSpeed is chars/sec, we tick ~30 times/sec
    const charsPerTick = Math.max(1, Math.floor(this.options.typingSpeed / 30));
    this.displayedLen = Math.min(this.displayedLen + charsPerTick, this.content.length);

    this.render();
  }

  /**
   * Check if typing is complete
   * @returns {boolean} True if animation is done
   * @private
   */
  isDone() {
    return this.done || this.displayedLen >= this.content.length;
  }

  /**
   * Get the currently revealed portion of text
   * @returns {string} Revealed text
   * @private
   */
  getDisplayed() {
    return this.content.substring(0, this.displayedLen);
  }

  /**
   * Get random buffer corruption phrase with appropriate color
   *
   * Samples from phrase buffer based on SFW/NSFW mode and renders
   * with color-coded corruption aesthetic.
   *
   * Color scheme:
   * - SFW phrases: Magenta (#d94f90) - playful corruption
   * - NSFW phrases: Purple (#8b5cf6) - deep/intimate corruption
   * - Symbols: Magenta (#d94f90)
   * - Blocks: Red (#ff0000) - terminal/critical state
   *
   * @returns {string} HTML string with colored corruption phrase
   * @private
   */
  getRandomCorruption() {
    const r = Math.random();

    // Select appropriate phrase sets based on nsfw option
    const japaneseSet = this.options.nsfw
      ? TypingAnimation.NSFW_JAPANESE
      : TypingAnimation.SFW_JAPANESE;

    const romajiSet = this.options.nsfw
      ? TypingAnimation.NSFW_ROMAJI
      : TypingAnimation.SFW_ROMAJI;

    const englishSet = this.options.nsfw
      ? TypingAnimation.NSFW_ENGLISH
      : TypingAnimation.SFW_ENGLISH;

    // Color for phrase corruption (SFW vs NSFW)
    const phraseColor = this.options.nsfw ? '#8b5cf6' : '#d94f90';

    if (r < 0.30) {
      // Japanese phrase buffer corruption
      const phrase = japaneseSet[Math.floor(Math.random() * japaneseSet.length)];
      return `<span style="color: ${phraseColor};">${phrase}</span>`;
    } else if (r < 0.50) {
      // English phrase buffer corruption
      const phrase = englishSet[Math.floor(Math.random() * englishSet.length)];
      return `<span style="color: ${phraseColor};">${phrase}</span>`;
    } else if (r < 0.65) {
      // Romaji buffer corruption
      const phrase = romajiSet[Math.floor(Math.random() * romajiSet.length)];
      return `<span style="color: ${phraseColor};">${phrase}</span>`;
    } else if (r < 0.80) {
      // Symbols - decorative corruption (always SFW)
      const symbol = TypingAnimation.SYMBOLS[
        Math.floor(Math.random() * TypingAnimation.SYMBOLS.length)
      ];
      return `<span style="color: #d94f90;">${symbol}</span>`;
    } else {
      // Block chars - terminal/critical state (always SFW)
      const char = TypingAnimation.BLOCKS[
        Math.floor(Math.random() * TypingAnimation.BLOCKS.length)
      ];
      return `<span style="color: #ff0000;">${char}</span>`;
    }
  }

  /**
   * Render the current state of the typing animation
   *
   * Displays revealed text (white) and occasional buffer corruption
   * phrases (magenta or purple) simulating neural decoding process.
   *
   * @private
   */
  render() {
    let displayed = this.getDisplayed();

    // Add buffer corruption at the "cursor" position
    if (!this.isDone() && Math.random() < this.options.glitchChance) {
      displayed += this.getRandomCorruption();
    }

    // Rendered text: white for stable, corruption colors for buffer glitches
    this.element.innerHTML = `<span style="color: #ffffff;">${displayed}</span>`;
  }

  /**
   * Stop animation and immediately show final text
   *
   * @param {string} [finalText] - Text to display (defaults to content)
   * @public
   */
  settle(finalText) {
    this.stop();
    this.element.innerHTML = `<span style="color: #ffffff;">${finalText || this.content}</span>`;
  }

  /**
   * Restart the animation from the beginning
   * @public
   */
  restart() {
    this.start(this.content);
  }
}

/**
 * Auto-initialize all elements with the 'typing-animation' class
 * @public
 */
function initTypingAnimation() {
  document.querySelectorAll('.typing-animation').forEach(element => {
    if (!element.typingInstance) {
      const nsfw = element.dataset.nsfw === 'true'; // Explicit opt-in via data attribute
      element.typingInstance = new TypingAnimation(element, { nsfw });

      // Auto-start if data-content is provided
      if (element.dataset.content) {
        element.typingInstance.start(element.dataset.content);
      }
    }
  });
}

// Auto-initialize on DOM ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initTypingAnimation);
} else {
  initTypingAnimation();
}

// Export for both ES6 modules and CommonJS
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { TypingAnimation, initTypingAnimation };
}

// Export for ES6 modules
if (typeof exports !== 'undefined') {
  exports.TypingAnimation = TypingAnimation;
  exports.initTypingAnimation = initTypingAnimation;
}

export { TypingAnimation, initTypingAnimation };
