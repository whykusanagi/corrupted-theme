/**
 * Carousel / Slideshow Component
 *
 * A lightweight carousel with autoplay, touch/swipe, keyboard navigation,
 * and dot indicators. Integrates with the Corrupted Theme design system.
 *
 * @module carousel
 * @version 1.0.0
 * @license MIT
 *
 * Usage:
 * ```html
 * <div class="carousel" data-ct-autoplay data-ct-interval="5000">
 *   <div class="carousel-inner">
 *     <div class="carousel-slide active">
 *       <img src="slide1.jpg" alt="Slide 1">
 *     </div>
 *     <div class="carousel-slide">
 *       <img src="slide2.jpg" alt="Slide 2">
 *     </div>
 *   </div>
 * </div>
 *
 * <script type="module">
 *   import { initCarousel } from '@whykusanagi/corrupted-theme/carousel';
 *   const carousel = initCarousel('.carousel');
 *   // carousel.destroy() when done
 * </script>
 * ```
 */

import { TimerRegistry } from '../core/timer-registry.js';
import { EventTracker } from '../core/event-tracker.js';

// Instance counter for unique IDs
let instanceCounter = 0;

class Carousel {
  /**
   * @param {string|HTMLElement} selector - Carousel container selector or element
   * @param {Object} [options={}] - Configuration options
   * @param {boolean} [options.autoplay=false] - Auto-advance slides
   * @param {number} [options.interval=5000] - Autoplay interval in ms
   * @param {boolean} [options.indicators=true] - Show dot indicators
   * @param {boolean} [options.controls=true] - Show prev/next controls
   * @param {boolean} [options.keyboard=true] - Enable keyboard navigation
   * @param {boolean} [options.touch=true] - Enable touch/swipe
   * @param {boolean} [options.pauseOnHover=true] - Pause autoplay on hover
   */
  constructor(selector, options = {}) {
    this._id = ++instanceCounter;
    this._events = new EventTracker();
    this._timers = new TimerRegistry();

    const el = typeof selector === 'string'
      ? document.querySelector(selector) : selector;
    if (!el) {
      console.warn('[Carousel] Element not found:', selector);
      return;
    }

    this.container = el;
    this.inner = el.querySelector('.carousel-inner');
    if (!this.inner) {
      console.warn('[Carousel] Missing .carousel-inner');
      return;
    }

    // Merge options with data attributes and defaults
    this.config = {
      autoplay: el.hasAttribute('data-ct-autoplay') || options.autoplay || false,
      interval: parseInt(el.dataset.ctInterval) || options.interval || 5000,
      indicators: options.indicators !== false,
      controls: options.controls !== false,
      keyboard: options.keyboard !== false,
      touch: options.touch !== false,
      pauseOnHover: options.pauseOnHover !== false
    };

    this.slides = Array.from(this.inner.querySelectorAll('.carousel-slide'));
    this.currentIndex = this.slides.findIndex(s => s.classList.contains('active'));
    if (this.currentIndex === -1) this.currentIndex = 0;

    this._autoplayIntervalId = null;

    this._init();
  }

  /** @private */
  _init() {
    // Ensure first slide is active
    this.slides.forEach((slide, i) => {
      slide.classList.toggle('active', i === this.currentIndex);
    });

    if (this.config.controls) this._createControls();
    if (this.config.indicators) this._createIndicators();
    if (this.config.touch) this._initTouch();

    if (this.config.keyboard) {
      this._events.add(document, 'keydown', (e) => {
        // Only respond when carousel or its children are focused
        if (!this.container.contains(document.activeElement) &&
            document.activeElement !== document.body) return;
        if (e.key === 'ArrowLeft') this.prev();
        else if (e.key === 'ArrowRight') this.next();
      });
    }

    if (this.config.pauseOnHover) {
      this._events.add(this.container, 'mouseenter', () => this._pauseAutoplay());
      this._events.add(this.container, 'mouseleave', () => {
        if (this.config.autoplay) this._startAutoplay();
      });
    }

    if (this.config.autoplay) this._startAutoplay();

    // Make container focusable for keyboard nav
    if (!this.container.hasAttribute('tabindex')) {
      this.container.setAttribute('tabindex', '0');
    }
  }

  /** @private */
  _createControls() {
    const prevBtn = document.createElement('button');
    prevBtn.className = 'carousel-control carousel-prev';
    prevBtn.setAttribute('aria-label', 'Previous slide');
    prevBtn.innerHTML = '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M15 18l-6-6 6-6"/></svg>';

    const nextBtn = document.createElement('button');
    nextBtn.className = 'carousel-control carousel-next';
    nextBtn.setAttribute('aria-label', 'Next slide');
    nextBtn.innerHTML = '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 18l6-6-6-6"/></svg>';

    this.container.appendChild(prevBtn);
    this.container.appendChild(nextBtn);

    this._events.add(prevBtn, 'click', () => this.prev());
    this._events.add(nextBtn, 'click', () => this.next());
  }

  /** @private */
  _createIndicators() {
    const dots = document.createElement('div');
    dots.className = 'carousel-indicators';

    this.slides.forEach((_, i) => {
      const dot = document.createElement('button');
      dot.className = 'carousel-dot';
      dot.setAttribute('aria-label', `Go to slide ${i + 1}`);
      if (i === this.currentIndex) dot.classList.add('active');
      this._events.add(dot, 'click', () => this.goTo(i));
      dots.appendChild(dot);
    });

    this.container.appendChild(dots);
    this._dotsContainer = dots;
  }

  /** @private */
  _initTouch() {
    let startX = 0;
    let startY = 0;

    this._events.add(this.inner, 'touchstart', (e) => {
      startX = e.touches[0].clientX;
      startY = e.touches[0].clientY;
    }, { passive: true });

    this._events.add(this.inner, 'touchend', (e) => {
      const dx = startX - e.changedTouches[0].clientX;
      const dy = startY - e.changedTouches[0].clientY;
      // Only swipe if horizontal movement > vertical and > threshold
      if (Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > 50) {
        if (dx > 0) this.next();
        else this.prev();
      }
    }, { passive: true });
  }

  /** @private */
  _startAutoplay() {
    this._pauseAutoplay();
    this._autoplayIntervalId = this._timers.setInterval(
      () => this.next(),
      this.config.interval
    );
  }

  /** @private */
  _pauseAutoplay() {
    if (this._autoplayIntervalId != null) {
      this._timers.clearInterval(this._autoplayIntervalId);
      this._autoplayIntervalId = null;
    }
  }

  /**
   * Go to a specific slide
   * @param {number} index - Slide index (0-based)
   */
  goTo(index) {
    if (index < 0 || index >= this.slides.length || index === this.currentIndex) return;

    this.slides[this.currentIndex].classList.remove('active');
    this.currentIndex = index;
    this.slides[this.currentIndex].classList.add('active');

    this._updateIndicators();
  }

  /**
   * Go to the next slide (wraps around)
   */
  next() {
    this.goTo((this.currentIndex + 1) % this.slides.length);
  }

  /**
   * Go to the previous slide (wraps around)
   */
  prev() {
    this.goTo((this.currentIndex - 1 + this.slides.length) % this.slides.length);
  }

  /** @private */
  _updateIndicators() {
    if (!this._dotsContainer) return;
    const dots = this._dotsContainer.querySelectorAll('.carousel-dot');
    dots.forEach((dot, i) => {
      dot.classList.toggle('active', i === this.currentIndex);
    });
  }

  /**
   * Tear down this carousel instance
   */
  destroy() {
    this._pauseAutoplay();
    this._events.removeAll();
    this._timers.clearAll();

    // Remove generated controls and indicators
    this.container.querySelectorAll('.carousel-control, .carousel-indicators').forEach(el => el.remove());

    this._dotsContainer = null;
  }
}

// ============================================================================
// PUBLIC API
// ============================================================================

/** @type {Carousel|null} Default auto-initialized instance */
let _defaultInstance = null;

/**
 * Initialize a carousel instance
 * @param {string|HTMLElement} [selector='.carousel'] - Carousel container
 * @param {Object} [options={}] - Configuration options
 * @returns {Carousel} Carousel instance
 */
export function initCarousel(selector = '.carousel', options = {}) {
  const instance = new Carousel(selector, options);
  if (!_defaultInstance) {
    _defaultInstance = instance;
  }
  return instance;
}

/**
 * Destroy a carousel instance
 * @param {Carousel} [instance] - Instance to destroy (default: first created)
 */
export function destroyCarousel(instance) {
  const target = instance || _defaultInstance;
  if (target) {
    target.destroy();
    if (target === _defaultInstance) {
      _defaultInstance = null;
    }
  }
}

// Auto-initialize carousels with data-ct-autoplay
if (typeof document !== 'undefined') {
  const autoInit = () => {
    document.querySelectorAll('.carousel[data-ct-autoplay]').forEach(el => {
      initCarousel(el);
    });
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', autoInit);
  } else {
    autoInit();
  }
}

// Global export
if (typeof window !== 'undefined') {
  window.CorruptedCarousel = {
    init: initCarousel,
    destroy: destroyCarousel
  };
}
