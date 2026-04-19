/**
 * Corrupted Text Animation
 *
 * Cycles through Japanese (hiragana/katakana/kanji), romaji, and English text variants
 * with character-level corruption effects. The text progressively corrupts from one
 * variant to another, creating a glitchy Matrix-style transformation effect.
 *
 * @class CorruptedText
 * @version 1.0.0
 * @author whykusanagi
 * @license MIT
 *
 * @example Basic Usage (Auto-initialization via data attributes)
 * ```html
 * <span class="corrupted-multilang"
 *       data-english="Hello World"
 *       data-romaji="konnichiwa"
 *       data-hiragana="こんにちは"
 *       data-katakana="コンニチハ"
 *       data-kanji="今日は">
 * </span>
 * ```
 *
 * @example Manual Initialization
 * ```javascript
 * const element = document.querySelector('.my-text');
 * const corrupted = new CorruptedText(element, {
 *   duration: 3000,
 *   cycleDelay: 100,
 *   loop: true
 * });
 *
 * // Control playback
 * corrupted.start();
 * corrupted.stop();
 * corrupted.restart();
 * corrupted.settle('Final Text');
 * ```
 *
 * @see https://github.com/whykusanagi/corrupted-theme
 * @see CORRUPTED_THEME_SPEC.md - Character-by-Character Decoding pattern
 */
class CorruptedText {
  /**
   * Creates a new CorruptedText animation instance
   *
   * @param {HTMLElement} element - The DOM element to animate
   * @param {Object} [options={}] - Configuration options
   * @param {number} [options.duration=3000] - Total animation duration in milliseconds
   * @param {number} [options.cycleDelay=100] - Delay between character corruption steps (ms)
   * @param {number} [options.startDelay=0] - Initial delay before animation starts (ms)
   * @param {boolean} [options.loop=true] - Whether to loop through variants continuously
   * @param {string|null} [options.finalText=null] - Text to settle on after cycle (if loop=false)
   */
  constructor(element, options = {}) {
    this.element = element;
    this.options = {
      duration: options.duration || 3000,
      cycleDelay: options.cycleDelay || 100,
      startDelay: options.startDelay || 0,
      loop: options.loop !== false,
      finalText: options.finalText || null,
      ...options
    };

    // Get text variants from data attributes
    this.variants = {
      english: this.element.dataset.english || this.element.textContent.trim(),
      romaji: this.element.dataset.romaji || null,
      hiragana: this.element.dataset.hiragana || null,
      katakana: this.element.dataset.katakana || null,
      kanji: this.element.dataset.kanji || null
    };

    // Filter out null variants and create array of available variants
    this.availableVariants = Object.entries(this.variants)
      .filter(([_, value]) => value !== null)
      .map(([key, value]) => ({ type: key, text: value }));

    if (this.availableVariants.length === 0) {
      console.warn('CorruptedText: No text variants found for element', element);
      return;
    }

    this.currentVariantIndex = 0;
    this.isAnimating = false;
    this.animationFrame = null;
    this._startDelayId = null;
    this._animateTimeoutId = null;
    this._corruptTimeoutId = null;

    this.init();
  }

  /**
   * Initialize the corruption animation
   * @private
   */
  init() {
    // Add corrupted class for styling
    if (!this.element.classList.contains('corrupted-multilang')) {
      this.element.classList.add('corrupted-multilang');
    }

    // Store original text
    this.originalText = this.element.textContent.trim();

    // Start animation after configured delay
    if (this.options.startDelay > 0) {
      this._startDelayId = setTimeout(() => this.start(), this.options.startDelay);
    } else {
      this.start();
    }
  }

  /**
   * Start the corruption animation
   * @public
   */
  start() {
    if (this.isAnimating) return;
    this.isAnimating = true;
    this.animate();
  }

  /**
   * Stop the corruption animation
   * @public
   */
  stop() {
    this.isAnimating = false;
    if (this.animationFrame) cancelAnimationFrame(this.animationFrame);
    if (this._startDelayId) clearTimeout(this._startDelayId);
    if (this._animateTimeoutId) clearTimeout(this._animateTimeoutId);
    if (this._corruptTimeoutId) clearTimeout(this._corruptTimeoutId);
    this.animationFrame = null;
    this._startDelayId = null;
    this._animateTimeoutId = null;
    this._corruptTimeoutId = null;
  }

  /**
   * Fully tear down this instance: stop animation and release element reference.
   * @public
   */
  destroy() {
    this.stop();
    if (this.element && this.element.corruptedTextInstance === this) {
      delete this.element.corruptedTextInstance;
    }
    this.element = null;
  }

  /**
   * Main animation loop - cycles through text variants
   * @private
   */
  animate() {
    if (!this.isAnimating) return;

    const variant = this.availableVariants[this.currentVariantIndex];
    this.corruptToText(variant.text, () => {
      // Move to next variant in cycle
      this.currentVariantIndex = (this.currentVariantIndex + 1) % this.availableVariants.length;

      // Check if animation should stop
      if (!this.options.loop && this.currentVariantIndex === 0) {
        // One full cycle complete - settle on final text
        const finalText = this.options.finalText || this.variants.english;
        this.corruptToText(finalText, () => {
          this.isAnimating = false;
        });
        return;
      }

      // Continue animation to next variant
      this._animateTimeoutId = setTimeout(() => {
        if (this.isAnimating) {
          this.animate();
        }
      }, this.options.duration / this.availableVariants.length);
    });
  }

  /**
   * Corrupt the current text to a target text with progressive reveal
   *
   * @param {string} targetText - The text to reveal through corruption
   * @param {Function} callback - Called when corruption is complete
   * @private
   */
  corruptToText(targetText, callback) {
    const currentText = this.element.textContent.trim();
    const maxLength = Math.max(currentText.length, targetText.length);
    const steps = 20; // Number of corruption animation steps
    let step = 0;

    // Character sets for corruption effect (from CORRUPTED_THEME_SPEC.md)
    const katakana = 'アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワヲン';
    const hiragana = 'あいうえおかきくけこさしすせそたちつてとなにぬねのはひふへほまみむめもやゆよらりるれろわをん';
    const romaji = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
    const symbols = '0123456789!@#$%^&*()_+-=[]{}|;:,.<>?~`';

    // Combined corruption character set
    const allCorruptChars = katakana + hiragana + romaji + symbols;

    const corrupt = () => {
      if (step >= steps) {
        // Animation complete - set final text
        this.element.textContent = targetText;
        if (callback) callback();
        return;
      }

      // Generate corrupted text with progressive reveal
      let corrupted = '';
      for (let i = 0; i < maxLength; i++) {
        if (i < targetText.length && step > steps * 0.7) {
          // Last 30% of animation - start revealing target text
          const revealProgress = (step - steps * 0.7) / (steps * 0.3);
          if (Math.random() < revealProgress) {
            corrupted += targetText[i];
          } else {
            corrupted += allCorruptChars[Math.floor(Math.random() * allCorruptChars.length)];
          }
        } else {
          // First 70% - full random corruption
          corrupted += allCorruptChars[Math.floor(Math.random() * allCorruptChars.length)];
        }
      }

      this.element.textContent = corrupted;
      step++;

      // Schedule next corruption step
      this.animationFrame = requestAnimationFrame(() => {
        this._corruptTimeoutId = setTimeout(corrupt, this.options.cycleDelay);
      });
    };

    corrupt();
  }

  /**
   * Restart the animation from the beginning
   * @public
   */
  restart() {
    this.stop();
    this.currentVariantIndex = 0;
    this.start();
  }

  /**
   * Stop animation and settle on a specific text
   *
   * @param {string} [finalText] - Text to settle on (defaults to english variant)
   * @public
   */
  settle(finalText) {
    this.stop();
    this.corruptToText(finalText || this.variants.english, () => {
      this.isAnimating = false;
    });
  }
}

/**
 * Auto-initialize all elements with the 'corrupted-multilang' class
 *
 * This function is automatically called on DOM ready and can be called
 * manually to initialize dynamically added elements.
 *
 * @public
 */
function initCorruptedText() {
  document.querySelectorAll('.corrupted-multilang').forEach(element => {
    if (!element.corruptedTextInstance) {
      element.corruptedTextInstance = new CorruptedText(element);
    }
  });
}

// Auto-initialize on DOM ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initCorruptedText);
} else {
  initCorruptedText();
}

// Export for both ES6 modules and CommonJS
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { CorruptedText, initCorruptedText };
}

// Export for ES6 modules
if (typeof exports !== 'undefined') {
  exports.CorruptedText = CorruptedText;
  exports.initCorruptedText = initCorruptedText;
}
