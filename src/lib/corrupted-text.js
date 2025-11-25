/**
 * Corrupted Text Animation
 * Cycles through Japanese (hiragana/katakana/kanji), romaji, and English text
 * 
 * Usage:
 * <span class="corrupted-multilang" 
 *       data-english="Hello" 
 *       data-romaji="konnichiwa" 
 *       data-hiragana="こんにちは" 
 *       data-katakana="コンニチハ" 
 *       data-kanji="今日は">
 * </span>
 */

class CorruptedText {
  constructor(element, options = {}) {
    this.element = element;
    this.options = {
      duration: options.duration || 3000, // Total animation duration
      cycleDelay: options.cycleDelay || 100, // Delay between character changes
      startDelay: options.startDelay || 0, // Initial delay before starting
      loop: options.loop !== false, // Whether to loop
      finalText: options.finalText || null, // Final text to settle on (null = loop)
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

    // Filter out null variants
    this.availableVariants = Object.entries(this.variants)
      .filter(([_, value]) => value !== null)
      .map(([key, value]) => ({ type: key, text: value }));

    if (this.availableVariants.length === 0) {
      console.warn('CorruptedText: No text variants found');
      return;
    }

    this.currentVariantIndex = 0;
    this.isAnimating = false;
    this.animationFrame = null;

    this.init();
  }

  init() {
    // Add corrupted class if not present
    if (!this.element.classList.contains('corrupted-multilang')) {
      this.element.classList.add('corrupted-multilang');
    }

    // Store original text
    this.originalText = this.element.textContent.trim();

    // Start animation after delay
    if (this.options.startDelay > 0) {
      setTimeout(() => this.start(), this.options.startDelay);
    } else {
      this.start();
    }
  }

  start() {
    if (this.isAnimating) return;
    this.isAnimating = true;
    this.animate();
  }

  stop() {
    this.isAnimating = false;
    if (this.animationFrame) {
      cancelAnimationFrame(this.animationFrame);
    }
  }

  animate() {
    if (!this.isAnimating) return;

    const variant = this.availableVariants[this.currentVariantIndex];
    this.corruptToText(variant.text, () => {
      // Move to next variant
      this.currentVariantIndex = (this.currentVariantIndex + 1) % this.availableVariants.length;

      // Check if we should stop
      if (!this.options.loop && this.currentVariantIndex === 0) {
        // If we have a final text, use it, otherwise use original
        const finalText = this.options.finalText || this.variants.english;
        this.corruptToText(finalText, () => {
          this.isAnimating = false;
        });
        return;
      }

      // Continue animation
      setTimeout(() => {
        if (this.isAnimating) {
          this.animate();
        }
      }, this.options.duration / this.availableVariants.length);
    });
  }

  corruptToText(targetText, callback) {
    const currentText = this.element.textContent.trim();
    const maxLength = Math.max(currentText.length, targetText.length);
    const steps = 20; // Number of corruption steps
    let step = 0;

    // Character sets for corruption effect
    const corruptChars = 'アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワヲン0123456789!@#$%^&*()_+-=[]{}|;:,.<>?~`';
    const romajiChars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
    const allCorruptChars = corruptChars + romajiChars + 'あいうえおかきくけこさしすせそたちつてとなにぬねのはひふへほまみむめもやゆよらりるれろわをん';

    const corrupt = () => {
      if (step >= steps) {
        // Set final text
        this.element.textContent = targetText;
        if (callback) callback();
        return;
      }

      // Generate corrupted text
      let corrupted = '';
      for (let i = 0; i < maxLength; i++) {
        if (i < targetText.length && step > steps * 0.7) {
          // Start revealing target text
          const revealProgress = (step - steps * 0.7) / (steps * 0.3);
          if (Math.random() < revealProgress) {
            corrupted += targetText[i];
          } else {
            corrupted += allCorruptChars[Math.floor(Math.random() * allCorruptChars.length)];
          }
        } else {
          // Random corruption
          corrupted += allCorruptChars[Math.floor(Math.random() * allCorruptChars.length)];
        }
      }

      this.element.textContent = corrupted;
      step++;

      this.animationFrame = requestAnimationFrame(() => {
        setTimeout(corrupt, this.options.cycleDelay);
      });
    };

    corrupt();
  }

  // Public method to restart animation
  restart() {
    this.stop();
    this.currentVariantIndex = 0;
    this.start();
  }

  // Public method to set final text and stop
  settle(finalText) {
    this.stop();
    this.corruptToText(finalText || this.variants.english, () => {
      this.isAnimating = false;
    });
  }
}

// Auto-initialize elements with corrupted-multilang class
function initCorruptedText() {
  document.querySelectorAll('.corrupted-multilang').forEach(element => {
    if (!element.corruptedTextInstance) {
      element.corruptedTextInstance = new CorruptedText(element);
    }
  });
}

// Initialize on DOM ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initCorruptedText);
} else {
  initCorruptedText();
}

// Export for manual use
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { CorruptedText, initCorruptedText };
}

