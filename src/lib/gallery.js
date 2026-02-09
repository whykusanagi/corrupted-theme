/**
 * gallery.js — Gallery System with Lightbox and NSFW Support
 *
 * A complete gallery system with filtering, lightbox viewer, and NSFW content handling.
 * Integrates with the Corrupted Theme design system.
 * Supports multiple independent gallery instances on a single page.
 *
 * @module gallery
 * @version 2.0.0
 * @license MIT
 *
 * Features:
 * - Responsive gallery grid
 * - Category filtering with animated transitions
 * - Fullscreen lightbox with keyboard navigation
 * - NSFW content blur with click-to-reveal
 * - Lazy loading support
 * - Touch gesture support for mobile
 * - Multiple galleries per page
 *
 * Usage:
 * ```html
 * <div class="filter-bar">
 *   <button class="filter-btn active" data-filter="all">All</button>
 *   <button class="filter-btn" data-filter="photos">Photos</button>
 * </div>
 * <div class="gallery-container" id="gallery">
 *   <div class="gallery-item" data-tags="photos">
 *     <img src="image.jpg" alt="Description">
 *     <div class="gallery-caption">Caption</div>
 *   </div>
 * </div>
 *
 * <script type="module">
 *   import { initGallery } from '@whykusanagi/corrupted-theme/gallery';
 *   const gallery = initGallery('#gallery');
 *   // gallery.destroy() when done
 * </script>
 * ```
 */

import { TimerRegistry } from '../core/timer-registry.js';
import { EventTracker } from '../core/event-tracker.js';

// ============================================================================
// CONFIGURATION
// ============================================================================

const DEFAULT_CONFIG = {
  // Gallery selectors
  gallerySelector: '.gallery-container',
  itemSelector: '.gallery-item',
  filterBarSelector: '.filter-bar',
  filterBtnSelector: '.filter-btn',

  // Lightbox
  enableLightbox: true,
  lightboxId: 'corrupted-lightbox',

  // NSFW
  enableNsfw: true,
  nsfwSelector: '.nsfw-content',
  nsfwWarning: '18+ Click to View',

  // Animation
  filterAnimation: true,
  animationDuration: 300,

  // Keyboard
  enableKeyboard: true,

  // Callbacks
  onFilter: null,
  onLightboxOpen: null,
  onLightboxClose: null,
  onNsfwReveal: null
};

// Instance counter for unique lightbox IDs
let instanceCounter = 0;

// ============================================================================
// GALLERY CLASS
// ============================================================================

class Gallery {
  /**
   * @param {string|HTMLElement} selector - Gallery container selector or element
   * @param {Object} options - Configuration options
   */
  constructor(selector, options = {}) {
    this._id = ++instanceCounter;
    this._events = new EventTracker();
    this._timers = new TimerRegistry();

    this.config = { ...DEFAULT_CONFIG, ...options };

    if (typeof selector === 'string') {
      this.config.gallerySelector = selector;
    } else if (selector instanceof HTMLElement) {
      // When passed an element directly, derive a selector from its ID
      // or fall back to a unique attribute for querySelectorAll compatibility
      if (selector.id) {
        this.config.gallerySelector = `#${selector.id}`;
      } else {
        const attrKey = `data-gallery-${this._id}`;
        selector.setAttribute(attrKey, '');
        this.config.gallerySelector = `[${attrKey}]`;
      }
    }

    // Per-instance lightbox ID
    this.config.lightboxId = `corrupted-lightbox-${this._id}`;

    this.currentFilter = 'all';
    this.lightboxOpen = false;
    this.currentImageIndex = 0;
    this.galleryImages = [];

    this._init();
  }

  // --------------------------------------------------------------------------
  // INITIALIZATION
  // --------------------------------------------------------------------------

  /** @private */
  _init() {
    if (this.config.enableLightbox) {
      this._createLightbox();
    }

    this._initFilterButtons();
    this._initGalleryItems();

    if (this.config.enableNsfw) {
      this._initNsfwContent();
    }

    if (this.config.enableKeyboard) {
      this._events.add(document, 'keydown', (e) => this._handleKeyboard(e));
    }

    this._updateGalleryImages();
  }

  // --------------------------------------------------------------------------
  // LIGHTBOX
  // --------------------------------------------------------------------------

  /** @private */
  _createLightbox() {
    if (document.getElementById(this.config.lightboxId)) return;

    const lightbox = document.createElement('div');
    lightbox.id = this.config.lightboxId;
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

    // All listeners tracked for cleanup
    this._events.add(lightbox.querySelector('.lightbox-close'), 'click', () => this.closeLightbox());
    this._events.add(lightbox.querySelector('.lightbox-prev'), 'click', () => this.navigateLightbox(-1));
    this._events.add(lightbox.querySelector('.lightbox-next'), 'click', () => this.navigateLightbox(1));
    this._events.add(lightbox, 'click', (e) => {
      if (e.target === lightbox) this.closeLightbox();
    });

    // Touch gestures
    let touchStartX = 0;
    this._events.add(lightbox, 'touchstart', (e) => {
      touchStartX = e.touches[0].clientX;
    }, { passive: true });

    this._events.add(lightbox, 'touchend', (e) => {
      const touchEndX = e.changedTouches[0].clientX;
      const diff = touchStartX - touchEndX;
      if (Math.abs(diff) > 50) {
        this.navigateLightbox(diff > 0 ? 1 : -1);
      }
    }, { passive: true });
  }

  /**
   * Opens the lightbox with specified image
   * @param {number} index - Index of image in gallery
   */
  openLightbox(index) {
    const lightbox = document.getElementById(this.config.lightboxId);
    if (!lightbox || !this.galleryImages[index]) return;

    this.currentImageIndex = index;
    this.lightboxOpen = true;

    const imageData = this.galleryImages[index];
    const img = lightbox.querySelector('.lightbox-image');
    const caption = lightbox.querySelector('.lightbox-caption');
    const counter = lightbox.querySelector('.lightbox-counter');

    img.src = imageData.src;
    img.alt = imageData.alt || '';

    if (imageData.isNsfw) {
      img.classList.add('nsfw-revealed');
    } else {
      img.classList.remove('nsfw-revealed');
    }

    caption.textContent = imageData.caption || '';
    caption.style.display = imageData.caption ? 'block' : 'none';

    counter.textContent = `${index + 1} / ${this.galleryImages.length}`;

    lightbox.querySelector('.lightbox-prev').disabled = index === 0;
    lightbox.querySelector('.lightbox-next').disabled = index === this.galleryImages.length - 1;

    lightbox.classList.add('active');
    document.body.style.overflow = 'hidden';

    if (this.config.onLightboxOpen) {
      this.config.onLightboxOpen(imageData, index);
    }
  }

  /**
   * Closes the lightbox
   */
  closeLightbox() {
    const lightbox = document.getElementById(this.config.lightboxId);
    if (!lightbox) return;

    lightbox.classList.remove('active');
    document.body.style.overflow = '';
    this.lightboxOpen = false;

    if (this.config.onLightboxClose) {
      this.config.onLightboxClose();
    }
  }

  /**
   * Navigates to next/previous image in lightbox
   * @param {number} direction - 1 for next, -1 for previous
   */
  navigateLightbox(direction) {
    const newIndex = this.currentImageIndex + direction;
    if (newIndex >= 0 && newIndex < this.galleryImages.length) {
      this.openLightbox(newIndex);
    }
  }

  // --------------------------------------------------------------------------
  // FILTERING
  // --------------------------------------------------------------------------

  /**
   * Filters gallery items by category
   * @param {string} filter - Filter value (tag name or 'all')
   */
  filter(filter) {
    const galleries = document.querySelectorAll(this.config.gallerySelector);

    galleries.forEach(gallery => {
      const items = gallery.querySelectorAll(this.config.itemSelector);

      items.forEach(item => {
        const tags = (item.dataset.tags || '').split(',').map(t => t.trim());
        const shouldShow = filter === 'all' || tags.includes(filter);

        if (this.config.filterAnimation) {
          item.style.transition = `opacity ${this.config.animationDuration}ms ease, transform ${this.config.animationDuration}ms ease`;

          if (shouldShow) {
            item.style.opacity = '0';
            item.style.transform = 'scale(0.9)';
            item.style.display = '';

            requestAnimationFrame(() => {
              item.style.opacity = '1';
              item.style.transform = 'scale(1)';
            });
          } else {
            item.style.opacity = '0';
            item.style.transform = 'scale(0.9)';

            this._timers.setTimeout(() => {
              item.style.display = 'none';
            }, this.config.animationDuration);
          }
        } else {
          item.style.display = shouldShow ? '' : 'none';
        }
      });
    });

    this.currentFilter = filter;
    this._updateGalleryImages();

    // Update filter button active state
    document.querySelectorAll(this.config.filterBtnSelector).forEach(btn => {
      btn.classList.toggle('active', btn.dataset.filter === filter);
    });

    if (this.config.onFilter) {
      this.config.onFilter(filter);
    }
  }

  // --------------------------------------------------------------------------
  // NSFW HANDLING
  // --------------------------------------------------------------------------

  /**
   * Reveals NSFW content on click
   * @param {HTMLElement} element - NSFW content element
   */
  revealNsfw(element) {
    if (element.classList.contains('revealed')) return;
    element.classList.add('revealed');

    if (this.config.onNsfwReveal) {
      this.config.onNsfwReveal(element);
    }
  }

  /** @private */
  _initNsfwContent() {
    const container = document.querySelector(this.config.gallerySelector);
    if (!container) return;

    container.querySelectorAll(this.config.nsfwSelector).forEach(item => {
      if (!item.dataset.warning) {
        item.dataset.warning = this.config.nsfwWarning;
      }

      this._events.add(item, 'click', (e) => {
        if (!item.classList.contains('revealed')) {
          e.preventDefault();
          e.stopPropagation();
          this.revealNsfw(item);
        }
      });
    });
  }

  // --------------------------------------------------------------------------
  // KEYBOARD NAVIGATION
  // --------------------------------------------------------------------------

  /** @private */
  _handleKeyboard(e) {
    if (!this.lightboxOpen) return;

    switch (e.key) {
      case 'Escape':
        this.closeLightbox();
        break;
      case 'ArrowLeft':
        this.navigateLightbox(-1);
        break;
      case 'ArrowRight':
        this.navigateLightbox(1);
        break;
    }
  }

  // --------------------------------------------------------------------------
  // INITIALIZATION HELPERS
  // --------------------------------------------------------------------------

  /** @private */
  _initFilterButtons() {
    document.querySelectorAll(this.config.filterBtnSelector).forEach(btn => {
      this._events.add(btn, 'click', () => {
        this.filter(btn.dataset.filter || 'all');
      });
    });
  }

  /** @private */
  _initGalleryItems() {
    document.querySelectorAll(`${this.config.gallerySelector} ${this.config.itemSelector}`).forEach((item) => {
      const img = item.querySelector('img');

      if (img && this.config.enableLightbox) {
        img.style.cursor = 'pointer';
        this._events.add(img, 'click', (e) => {
          if (item.classList.contains('nsfw-content') && !item.classList.contains('revealed')) {
            return;
          }

          e.stopPropagation();
          const visibleIndex = this.galleryImages.findIndex(i => i.element === item);
          if (visibleIndex !== -1) {
            this.openLightbox(visibleIndex);
          }
        });
      }
    });
  }

  // --------------------------------------------------------------------------
  // UTILITY
  // --------------------------------------------------------------------------

  /** @private */
  _updateGalleryImages() {
    this.galleryImages = [];

    document.querySelectorAll(`${this.config.gallerySelector} ${this.config.itemSelector}`).forEach((item, index) => {
      if (item.style.display === 'none') return;

      const img = item.querySelector('img');
      const caption = item.querySelector('.gallery-caption');

      if (img) {
        this.galleryImages.push({
          src: img.dataset.fullSrc || img.src,
          alt: img.alt,
          caption: caption ? caption.textContent : '',
          isNsfw: item.classList.contains('nsfw-content'),
          element: item,
          originalIndex: index
        });
      }
    });
  }

  /**
   * Refresh the gallery image list (call after dynamic content changes)
   */
  refresh() {
    this._updateGalleryImages();
  }

  /**
   * @returns {Array} Copy of current gallery images
   */
  getImages() {
    return [...this.galleryImages];
  }

  /**
   * @returns {string} Current filter value
   */
  getCurrentFilter() {
    return this.currentFilter;
  }

  // --------------------------------------------------------------------------
  // DESTROY
  // --------------------------------------------------------------------------

  /**
   * Tear down this gallery instance: remove event listeners, lightbox, and state.
   */
  destroy() {
    this._events.removeAll();
    this._timers.clearAll();

    const lightbox = document.getElementById(this.config.lightboxId);
    if (lightbox) {
      lightbox.remove();
    }

    this.currentFilter = 'all';
    this.lightboxOpen = false;
    this.currentImageIndex = 0;
    this.galleryImages = [];
  }
}

// ============================================================================
// PUBLIC API — backward compatible
// ============================================================================

/** @type {Gallery|null} Default auto-initialized instance */
let _defaultInstance = null;

/**
 * Initializes a gallery instance
 * @param {string|HTMLElement} [selector='.gallery-container'] - Gallery container selector or element
 * @param {Object} [options={}] - Configuration options
 * @returns {Gallery} Gallery instance with filter, openLightbox, closeLightbox, destroy, etc.
 */
export function initGallery(selector = '.gallery-container', options = {}) {
  const instance = new Gallery(selector, options);
  // Track as default if this is the first / auto-init call
  if (!_defaultInstance) {
    _defaultInstance = instance;
  }
  return instance;
}

/**
 * Destroys a gallery instance. If no instance is passed, destroys the default instance.
 * @param {Gallery} [instance] - Gallery instance to destroy
 */
export function destroyGallery(instance) {
  const target = instance || _defaultInstance;
  if (target) {
    target.destroy();
    if (target === _defaultInstance) {
      _defaultInstance = null;
    }
  }
}

// Auto-initialize if DOM is ready and elements exist
if (typeof document !== 'undefined') {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      if (document.querySelector('.gallery-container')) {
        _defaultInstance = initGallery();
      }
    });
  } else {
    if (document.querySelector('.gallery-container')) {
      _defaultInstance = initGallery();
    }
  }
}

// Export for global usage
if (typeof window !== 'undefined') {
  window.CorruptedGallery = {
    init: initGallery,
    destroy: destroyGallery
  };
}
