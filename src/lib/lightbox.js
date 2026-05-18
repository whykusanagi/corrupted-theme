/**
 * lightbox.js — Standalone Lightbox for the Corrupted Theme
 *
 * Extracted from gallery.js (0.2.0) so consumers wanting only a fullscreen
 * image viewer don't have to import the full gallery system.
 *
 * Features:
 * - Fullscreen image overlay with prev/next navigation
 * - Keyboard navigation (Escape, ArrowLeft, ArrowRight)
 * - Touch gesture support (swipe left/right)
 * - NSFW-aware image display
 * - Lifecycle-safe via EventTracker + TimerRegistry
 *
 * @module lightbox
 * @version 0.2.0
 * @license MIT
 *
 * Usage:
 * ```js
 * import { Lightbox } from '@whykusanagi/corrupted-theme/lightbox';
 *
 * const lb = new Lightbox(null, {
 *   lightboxId: 'my-lightbox',
 *   onOpen: (imageData, index) => console.log('opened', index),
 *   onClose: () => console.log('closed'),
 * });
 *
 * lb.setImages([
 *   { src: 'a.jpg', alt: 'Image A', caption: 'Caption A', isNsfw: false }
 * ]);
 * lb.open(0);
 *
 * // When done:
 * lb.destroy();
 * ```
 */

import { EventTracker } from '../core/event-tracker.js';

// ============================================================================
// CONFIGURATION
// ============================================================================

let _instanceCounter = 0;

const DEFAULT_CONFIG = {
  /** Unique DOM id for this lightbox element. Auto-generated if not set. */
  lightboxId: null,
  /** Called with (imageData, index) when a lightbox opens. */
  onOpen: null,
  /** Called with no arguments when a lightbox closes. */
  onClose: null,
  /** Enable keyboard navigation. */
  enableKeyboard: true,
};

// ============================================================================
// LIGHTBOX CLASS
// ============================================================================

export class Lightbox {
  /**
   * @param {null|HTMLElement} _unused  Reserved for future anchor-element support.
   *                                    Pass `null` — the lightbox is appended to document.body.
   * @param {object} options            Configuration overrides (see DEFAULT_CONFIG).
   */
  constructor(_unused, options = {}) {
    this._id = ++_instanceCounter;
    this._events = new EventTracker();

    this.config = {
      ...DEFAULT_CONFIG,
      lightboxId: `corrupted-lightbox-${this._id}`,
      ...options,
    };

    /** @type {Array<{src:string, alt:string, caption:string, isNsfw:boolean}>} */
    this._images = [];
    this._currentIndex = 0;
    this._isOpen = false;

    if (typeof document !== 'undefined') {
      this._createDOM();
      if (this.config.enableKeyboard) {
        this._events.add(document, 'keydown', (e) => this._handleKeyboard(e));
      }
    }
  }

  // --------------------------------------------------------------------------
  // PUBLIC API
  // --------------------------------------------------------------------------

  /**
   * Replace the image list. Accepts the same shape gallery.js produces:
   * `{ src, alt, caption, isNsfw, [element], [originalIndex] }`
   * @param {Array<object>} images
   */
  setImages(images) {
    this._images = Array.isArray(images) ? images : [];
  }

  /**
   * Open the lightbox at the given index.
   * @param {number} index
   */
  open(index) {
    const lightbox = document.getElementById(this.config.lightboxId);
    if (!lightbox || !this._images[index]) return;

    this._currentIndex = index;
    this._isOpen = true;

    const imageData = this._images[index];
    const img     = lightbox.querySelector('.lightbox-image');
    const caption = lightbox.querySelector('.lightbox-caption');
    const counter = lightbox.querySelector('.lightbox-counter');

    img.src = imageData.src;
    img.alt = imageData.alt || '';

    if (imageData.isNsfw) {
      img.classList.add('nsfw-revealed');
    } else {
      img.classList.remove('nsfw-revealed');
    }

    caption.textContent    = imageData.caption || '';
    caption.style.display  = imageData.caption ? 'block' : 'none';
    counter.textContent    = `${index + 1} / ${this._images.length}`;

    lightbox.querySelector('.lightbox-prev').disabled = index === 0;
    lightbox.querySelector('.lightbox-next').disabled = index === this._images.length - 1;

    lightbox.classList.add('active');
    document.body.style.overflow = 'hidden';

    if (this.config.onOpen) {
      this.config.onOpen(imageData, index);
    }
  }

  /** Close the lightbox. */
  close() {
    const lightbox = document.getElementById(this.config.lightboxId);
    if (!lightbox) return;

    lightbox.classList.remove('active');
    document.body.style.overflow = '';
    this._isOpen = false;

    if (this.config.onClose) {
      this.config.onClose();
    }
  }

  /**
   * Navigate to the next (+1) or previous (-1) image.
   * @param {number} direction  1 or -1
   */
  navigate(direction) {
    const next = this._currentIndex + direction;
    if (next >= 0 && next < this._images.length) {
      this.open(next);
    }
  }

  /** @returns {boolean} Whether the lightbox is currently open. */
  get isOpen() {
    return this._isOpen;
  }

  /** @returns {number} Index of the currently displayed image. */
  get currentIndex() {
    return this._currentIndex;
  }

  /**
   * Remove DOM element, cancel all event listeners, and release state.
   */
  destroy() {
    this._events.removeAll();

    if (typeof document !== 'undefined') {
      const el = document.getElementById(this.config.lightboxId);
      if (el) el.remove();
      if (this._isOpen) {
        document.body.style.overflow = '';
      }
    }

    this._images = [];
    this._isOpen = false;
  }

  // --------------------------------------------------------------------------
  // PRIVATE
  // --------------------------------------------------------------------------

  /** @private */
  _createDOM() {
    if (document.getElementById(this.config.lightboxId)) return;

    const lightbox = document.createElement('div');
    lightbox.id        = this.config.lightboxId;
    lightbox.className = 'lightbox';
    // Static HTML only — no interpolated variables, safe from XSS
    lightbox.innerHTML = `
      <button class="lightbox-close" aria-label="Close lightbox">&times;</button>
      <button class="lightbox-prev" aria-label="Previous image">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M15 18l-6-6 6-6"/>
        </svg>
      </button>
      <img class="lightbox-image" src="" alt="">
      <button class="lightbox-next" aria-label="Next image">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M9 18l6-6-6-6"/>
        </svg>
      </button>
      <div class="lightbox-caption"></div>
      <div class="lightbox-counter"></div>
    `;

    document.body.appendChild(lightbox);

    this._events.add(lightbox.querySelector('.lightbox-close'), 'click', () => this.close());
    this._events.add(lightbox.querySelector('.lightbox-prev'),  'click', () => this.navigate(-1));
    this._events.add(lightbox.querySelector('.lightbox-next'),  'click', () => this.navigate(1));
    this._events.add(lightbox, 'click', (e) => {
      if (e.target === lightbox) this.close();
    });

    // Touch gesture support
    let touchStartX = 0;
    this._events.add(lightbox, 'touchstart', (e) => {
      touchStartX = e.touches[0].clientX;
    }, { passive: true });
    this._events.add(lightbox, 'touchend', (e) => {
      const diff = touchStartX - e.changedTouches[0].clientX;
      if (Math.abs(diff) > 50) {
        this.navigate(diff > 0 ? 1 : -1);
      }
    }, { passive: true });
  }

  /** @private */
  _handleKeyboard(e) {
    if (!this._isOpen) return;
    switch (e.key) {
      case 'Escape':     this.close();         break;
      case 'ArrowLeft':  this.navigate(-1);    break;
      case 'ArrowRight': this.navigate(1);     break;
    }
  }
}

// CJS interop stub — mirrors pattern used by other lib files
if (typeof module !== 'undefined') {
  module.exports = { Lightbox };
}
