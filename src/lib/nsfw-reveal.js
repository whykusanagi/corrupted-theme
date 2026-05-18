/**
 * NsfwReveal — blur-until-clicked overlay.
 *
 * Wraps any element with a CSS blur filter + click overlay. First click
 * removes the blur. Useful for NSFW images in galleries.
 *
 * The target element's parent must have `position: relative` (or similar)
 * for the absolutely-positioned overlay to sit on top of it correctly.
 *
 * @example
 *   import { NsfwReveal } from '@whykusanagi/corrupted-theme/nsfw-reveal';
 *
 *   const nr = new NsfwReveal(imgEl, { warning: 'NSFW — click to reveal' });
 *   // later:
 *   nr.destroy();
 */
export class NsfwReveal {
  /**
   * @param {Element|null} target   - The element to blur. May be null (Node / tests).
   * @param {Object} [options]
   * @param {string} [options.warning='NSFW — click to reveal']
   * @param {number} [options.blurPx=20]             - Blur radius in pixels.
   */
  constructor(target, options = {}) {
    this.target = target;
    this.options = {
      warning: options.warning ?? 'NSFW — click to reveal',
      blurPx:  options.blurPx  ?? 20,
    };

    this._revealed  = false;
    this._destroyed = false;
    this._onClick   = null;
    this._overlay   = null;

    if (typeof document === 'undefined' || !target) return;  // Node / null guard
    this._init();
  }

  // ─── Public API ───────────────────────────────────────────────────────────

  /** Remove the blur and overlay on demand (e.g. programmatic reveal). */
  reveal() {
    if (this._destroyed || this._revealed) return;

    if (this.target) {
      this.target.style.filter = '';
      this.target.classList.add('nsfw-revealed');
    }

    if (this._overlay) {
      this._overlay.remove();
      this._overlay = null;
    }

    this._revealed = true;
  }

  /**
   * Restore the element to its pre-NsfwReveal state and remove all
   * references. Safe to call multiple times.
   */
  destroy() {
    if (this._destroyed) return;
    this._destroyed = true;

    if (this._overlay) {
      if (this._onClick) {
        this._overlay.removeEventListener('click', this._onClick);
      }
      this._overlay.remove();
    }

    if (this.target) {
      this.target.style.filter = '';
      this.target.classList.remove('nsfw-content', 'nsfw-revealed');
    }

    this._overlay = null;
    this._onClick = null;
  }

  // ─── Private ──────────────────────────────────────────────────────────────

  _init() {
    // Mark and blur the target
    this.target.classList.add('nsfw-content');
    this.target.style.filter = `blur(${this.options.blurPx}px)`;

    // Build overlay
    this._overlay = document.createElement('div');
    this._overlay.className = 'nsfw-content-overlay';
    this._overlay.textContent = this.options.warning;
    this._overlay.style.cssText = [
      'position: absolute',
      'inset: 0',
      'display: flex',
      'align-items: center',
      'justify-content: center',
      'background: rgba(0, 0, 0, 0.8)',
      'color: #fff',
      'cursor: pointer',
      'font-size: 1rem',
      'z-index: 10',
      'user-select: none',
    ].join('; ');

    // Insert overlay immediately before the target in its parent
    this.target.parentNode?.insertBefore(this._overlay, this.target);

    this._onClick = () => this.reveal();
    this._overlay.addEventListener('click', this._onClick, { once: true });
  }
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { NsfwReveal };
}
