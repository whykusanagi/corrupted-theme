/**
 * Typing Animation with Buffer Corruption
 *
 * Simulates typing text with "buffer corruption" - phrases continuously flickering
 * to the right of the revealed text as the neural network decodes corrupted data,
 * before finally settling on stable readable output.
 *
 * Implements Pattern 2 (Phrase Flickering / Buffer Corruption) from CORRUPTED_THEME_SPEC.md
 *
 * Key design: char-advance and buffer-flicker run on **independent** timers so the
 * buffer is always visible while typing is in progress, not probabilistic.
 *
 * @class TypingAnimation
 * @version 1.1.0
 * @author whykusanagi
 * @license MIT
 *
 * @example SFW Mode (Default)
 * ```javascript
 * const element = document.querySelector('.typing-text');
 * const typing = new TypingAnimation(element, {
 *   duration: 2000,         // 2s total regardless of text length
 *   loop: true,
 *   loopDelay: 1500,
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

import phrases from '../data/phrases.json' with { type: 'json' };
import charsets from '../data/charsets.json' with { type: 'json' };

class TypingAnimation {
  /**
   * Module-scope flag: fire the glitchChance deprecation warning at most once
   * per page load, regardless of how many TypingAnimation instances are created.
   * @type {boolean}
   */
  static _warnedGlitchChance = false;

  /**
   * Creates a new TypingAnimation instance
   *
   * @param {HTMLElement} element - The DOM element to animate
   * @param {Object} [options={}] - Configuration options
   * @param {number|null} [options.duration=null] - Total ms for one typing pass.
   *   When set, char interval = max(33, duration/length). Takes priority over typingSpeed.
   * @param {number} [options.typingSpeed=12] - Chars/sec; used only when duration is null.
   * @param {boolean} [options.bufferEnabled=true] - Show always-on buffer corruption phrase.
   *   Set false for a clean typewriter effect with no buffer.
   * @param {number} [options.bufferFlickerSpeed=100] - ms between buffer phrase swaps
   *   (independent of char-advance rate).
   * @param {boolean} [options.loop=false] - Automatically restart after loopDelay ms.
   * @param {number} [options.loopDelay=1500] - ms to hold settled text before restarting.
   * @param {boolean} [options.nsfw=false] - Enable NSFW phrases (explicit opt-in required)
   * @param {Function} [options.onComplete=null] - Callback when typing completes
   * @param {number} [options.glitchChance] - DEPRECATED. Ignored; buffer is always-on.
   *   Fires a one-time console.warn per page load. Use bufferEnabled: false to disable buffer.
   */
  constructor(element, options = {}) {
    this.element = element;

    // Deprecation warning for glitchChance — fires at most once per page load
    if (options.glitchChance !== undefined && !TypingAnimation._warnedGlitchChance) {
      console.warn(
        "TypingAnimation: 'glitchChance' is deprecated and ignored — buffer is always-on now. " +
        "Use bufferEnabled: false to disable."
      );
      TypingAnimation._warnedGlitchChance = true;
    }

    this.options = {
      duration:            options.duration            ?? null,
      typingSpeed:         options.typingSpeed         ?? 12,
      bufferEnabled:       options.bufferEnabled       ?? true,
      bufferFlickerSpeed:  options.bufferFlickerSpeed  ?? 100,
      loop:                options.loop                ?? false,
      loopDelay:           options.loopDelay           ?? 1500,
      nsfw:                options.nsfw                ?? false,
      onComplete:          options.onComplete          ?? null,
    };

    // Instance state
    this.content            = '';
    this.displayedLen       = 0;
    this.done               = false;
    this.currentBufferPhrase = null;

    // Three independent timer IDs (replacing the old single intervalId)
    this.charIntervalId    = null;
    this.flickerIntervalId = null;
    this.loopTimeoutId     = null;
  }

  // ---------------------------------------------------------------------------
  // Canonical data accessors (read from src/data/*.json)
  // ---------------------------------------------------------------------------

  static get SFW_JAPANESE() {
    const j = phrases.sfw.japanese;
    return [...j.data, ...j.system, ...j.status, ...j.void, ...j.memory, ...j.glitch];
  }
  static get NSFW_JAPANESE() {
    const j = phrases.nsfw.japanese;
    return [...j.data, ...j.system, ...j.status, ...j.void, ...j.memory, ...j.glitch];
  }
  static get SFW_ROMAJI() {
    const r = phrases.sfw.romaji;
    return [...r.data, ...r.system, ...r.status, ...r.void, ...r.memory, ...r.glitch];
  }
  static get NSFW_ROMAJI() {
    const r = phrases.nsfw.romaji;
    return [...r.data, ...r.system, ...r.status, ...r.void, ...r.memory, ...r.glitch];
  }
  static get SFW_ENGLISH() {
    const e = phrases.sfw.english;
    return [...e.data, ...e.system, ...e.status, ...e.void, ...e.memory, ...e.glitch];
  }
  static get NSFW_ENGLISH() {
    const e = phrases.nsfw.english;
    return [...e.data, ...e.system, ...e.status, ...e.void, ...e.memory, ...e.glitch];
  }
  static get SYMBOLS() {
    return charsets.symbols.split('');
  }
  static get BLOCKS() {
    return charsets.blocks.split('');
  }

  // ---------------------------------------------------------------------------
  // Public API
  // ---------------------------------------------------------------------------

  /**
   * Start typing animation with buffer corruption
   *
   * Clears any running timers, resets state, then kicks off two independent
   * intervals: one for char-advance, one for buffer-phrase flicker.
   *
   * @param {string} content - The final text to reveal
   * @public
   */
  start(content) {
    this._clearTimers();

    this.content      = content;
    this.displayedLen = 0;
    this.done         = false;

    // Seed initial buffer phrase so first render() is not empty
    if (this.options.bufferEnabled) {
      this.currentBufferPhrase = this.getRandomCorruption();
    }

    // Render first frame immediately (no 1-tick blank flash)
    this.render();

    // Char-advance timer
    const charInterval = this._computeCharInterval();
    this.charIntervalId = setInterval(() => this.tick(), charInterval);

    // Buffer-flicker timer (independent of char advance)
    if (this.options.bufferEnabled) {
      this.flickerIntervalId = setInterval(() => {
        this.currentBufferPhrase = this.getRandomCorruption();
        this.render();
      }, this.options.bufferFlickerSpeed);
    }
  }

  /**
   * Stop the typing animation, clearing all timers.
   * Leaves current visual state intact.
   * @public
   */
  stop() {
    this._clearTimers();
    this.done = true;
  }

  /**
   * Fully tear down this instance: stop all timers, clear the element,
   * and release the DOM reference. After calling destroy(), this instance
   * is not reusable — create a new TypingAnimation if you need one.
   * @public
   */
  destroy() {
    this._clearTimers();
    this.done = true;
    this.currentBufferPhrase = null;
    if (this.element) {
      this.element.textContent = '';
      this.element = null;
    }
  }

  /**
   * Restart the animation from the beginning using the same content.
   * @public
   */
  restart() {
    this.start(this.content);
  }

  /**
   * Stop animation and immediately show final text (no animation).
   *
   * @param {string} [finalText] - Text to display (defaults to this.content)
   * @public
   */
  settle(finalText) {
    if (!this.element) return;
    this.stop();
    this.currentBufferPhrase = null;
    this.element.textContent = '';
    const span = document.createElement('span');
    span.style.color = '#ffffff';
    span.textContent = finalText ?? this.content;
    this.element.appendChild(span);
  }

  // ---------------------------------------------------------------------------
  // Internal helpers
  // ---------------------------------------------------------------------------

  /**
   * Advance revealed text by one character and call render().
   * Delegates to _onComplete() when the full text is revealed.
   * @private
   */
  tick() {
    // Advance exactly one character per tick
    this.displayedLen = Math.min(this.displayedLen + 1, this.content.length);
    this.render();

    if (this.displayedLen >= this.content.length) {
      this._onComplete();
    }
  }

  /**
   * Check if typing is complete.
   * @returns {boolean}
   * @private
   */
  isDone() {
    return this.done || this.displayedLen >= this.content.length;
  }

  /**
   * Get the currently revealed portion of text.
   * @returns {string}
   * @private
   */
  getDisplayed() {
    return this.content.substring(0, this.displayedLen);
  }

  /**
   * Compute char-advance interval in ms.
   *
   * Priority: duration (fixed total time) → typingSpeed (chars/sec).
   * Floored at 33ms (~30fps) to avoid burning unnecessary frames.
   *
   * @returns {number} Interval in ms
   * @private
   */
  _computeCharInterval() {
    const { duration, typingSpeed } = this.options;
    if (duration !== null && this.content.length > 0) {
      return Math.max(33, duration / this.content.length);
    }
    return Math.max(33, 1000 / typingSpeed);
  }

  /**
   * Clear all active timers. Safe to call repeatedly.
   *
   * NOTE: _onComplete() intentionally does NOT call this method — it needs
   * to clear char+flicker intervals while preserving loopTimeoutId so the
   * loop restart can be scheduled. If you add a fourth timer here, update
   * _onComplete() to clear or preserve it as appropriate.
   *
   * @private
   */
  _clearTimers() {
    if (this.charIntervalId !== null) {
      clearInterval(this.charIntervalId);
      this.charIntervalId = null;
    }
    if (this.flickerIntervalId !== null) {
      clearInterval(this.flickerIntervalId);
      this.flickerIntervalId = null;
    }
    if (this.loopTimeoutId !== null) {
      clearTimeout(this.loopTimeoutId);
      this.loopTimeoutId = null;
    }
  }

  /**
   * Called when the full text has been revealed.
   *
   * Stops char and flicker intervals, hides buffer, fires onComplete callback,
   * then either schedules a loop restart or marks animation as done.
   * @private
   */
  _onComplete() {
    // Stop char and flicker intervals (NOT loopTimeoutId — set below)
    if (this.charIntervalId !== null) {
      clearInterval(this.charIntervalId);
      this.charIntervalId = null;
    }
    if (this.flickerIntervalId !== null) {
      clearInterval(this.flickerIntervalId);
      this.flickerIntervalId = null;
    }

    // Hide buffer, render settled state
    this.currentBufferPhrase = null;
    this.render();

    // Fire user callback
    if (this.options.onComplete) {
      this.options.onComplete();
    }

    if (this.options.loop) {
      // Schedule restart; store ID so stop()/destroy() can cancel it
      this.loopTimeoutId = setTimeout(() => {
        this.loopTimeoutId = null;
        this.start(this.content);
      }, this.options.loopDelay);
    } else {
      this.done = true;
    }
  }

  /**
   * Render the current state of the typing animation.
   *
   * DOM layout while typing:
   *   [revealed-text (white)] [space] [bufferPhrase (magenta/purple)]
   *
   * DOM layout when done:
   *   [revealed-text (white)]
   *
   * All DOM construction uses createElement/textContent/appendChild —
   * no innerHTML, preserving XSS hardening from v0.1.7.
   *
   * @private
   */
  render() {
    if (!this.element) return;
    const isDone = this.isDone();
    const displayed = this.getDisplayed();

    // Clear and rebuild safely (no innerHTML)
    this.element.textContent = '';

    // Revealed text span (white)
    const textSpan = document.createElement('span');
    textSpan.style.color = '#ffffff';
    textSpan.textContent = displayed;
    this.element.appendChild(textSpan);

    // Buffer corruption phrase — always present while typing, if enabled and available
    if (!isDone && this.options.bufferEnabled && this.currentBufferPhrase) {
      this.element.appendChild(document.createTextNode(' '));
      this.element.appendChild(this.currentBufferPhrase.cloneNode(true));
    }
  }

  /**
   * Get random buffer corruption phrase as a colored <span> element.
   *
   * Samples from phrase buffer based on SFW/NSFW mode and renders
   * with color-coded corruption aesthetic.
   *
   * Category distribution:
   *   0–29%  Japanese phrase  (SFW or NSFW per options.nsfw)
   *   30–49% English phrase
   *   50–64% Romaji phrase
   *   65–79% Symbol (always SFW)
   *   80–99% Block character (always SFW)
   *
   * Color scheme:
   *   SFW phrases:  Magenta (#d94f90) — playful corruption
   *   NSFW phrases: Purple  (#8b5cf6) — deep/intimate corruption
   *   Symbols:      Magenta (#d94f90)
   *   Blocks:       Red     (#ff0000) — terminal/critical state
   *
   * @returns {HTMLSpanElement} Colored span with textContent set
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

    let text;
    let color;

    if (r < 0.30) {
      // Japanese phrase buffer corruption
      text = japaneseSet[Math.floor(Math.random() * japaneseSet.length)];
      color = phraseColor;
    } else if (r < 0.50) {
      // English phrase buffer corruption
      text = englishSet[Math.floor(Math.random() * englishSet.length)];
      color = phraseColor;
    } else if (r < 0.65) {
      // Romaji buffer corruption
      text = romajiSet[Math.floor(Math.random() * romajiSet.length)];
      color = phraseColor;
    } else if (r < 0.80) {
      // Symbols — decorative corruption (always SFW)
      text = TypingAnimation.SYMBOLS[
        Math.floor(Math.random() * TypingAnimation.SYMBOLS.length)
      ];
      color = '#d94f90';
    } else {
      // Block chars — terminal/critical state (always SFW)
      text = TypingAnimation.BLOCKS[
        Math.floor(Math.random() * TypingAnimation.BLOCKS.length)
      ];
      color = '#ff0000';
    }

    // Build DOM element (XSS-safe — no innerHTML)
    const span = document.createElement('span');
    span.style.color = color;
    span.textContent = text;
    return span;
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

// Auto-initialize on DOM ready (browser only)
if (typeof document !== 'undefined') {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initTypingAnimation);
  } else {
    initTypingAnimation();
  }
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
