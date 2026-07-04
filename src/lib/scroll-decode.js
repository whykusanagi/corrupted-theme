/**
 * ScrollDecode — text decodes as it scrolls into view.
 *
 * Wraps the Pattern-1 fixed-length decode in viewport lifecycle: the element
 * shows scrambled charset noise until it enters the viewport, then resolves
 * to its readable text (chaos → order). Three modes:
 *   - default:  decode once on first viewport entry
 *   - rearm:    re-corrupt on exit, decode again on every entry
 *   - progress: decode fraction is BOUND to scroll position — scrolling
 *     backward re-corrupts (scrubbing, like a video timeline)
 *
 * Design reference: anime.js v4 `onScroll` / ScrollObserver (MIT) — API
 * model only, zero dependencies. Built on the package's own
 * IntersectionObserver convention + DecryptReveal.
 *
 * DecryptReveal exposes no partial-reveal API, so progress mode drives the
 * reveal fraction directly via ScrollDecode.scramble() (same char mapping
 * as Pattern 1: spaces preserved, unrevealed positions cycle charset noise).
 *
 * Accessibility: prefers-reduced-motion renders the final readable text
 * immediately and does nothing else (spec: stable readable endpoints).
 *
 * @example Portfolio section reveals
 *   import { ScrollDecode } from '@whykusanagi/corrupted-theme/scroll-decode';
 *   document.querySelectorAll('.decode-on-scroll').forEach((el) =>
 *     new ScrollDecode(el).start());
 *
 * @example Scroll-scrubbed decode
 *   new ScrollDecode(headline, { progress: true }).start();
 *
 * @module lib/scroll-decode
 * @version 0.3.0
 * @author whykusanagi
 * @license MIT
 *
 * @see src/core/decrypt-reveal.js — Pattern 1 decode engine (trigger mode)
 * @see CORRUPTED_THEME_SPEC.md — Pattern 1 (character corruption)
 * @composes CorruptedTimeline — sequence decodes after scene transitions
 */

import { DecryptReveal } from '../core/decrypt-reveal.js';
import { CorruptionCharsets } from '../core/corruption-charsets.js';

/**
 * @class ScrollDecode
 * @param {Element|null} element - Element whose textContent is the target
 * @param {object} [options={}]
 * @param {boolean} [options.rearm=false]    - Re-corrupt on viewport exit, decode on re-entry
 * @param {boolean} [options.progress=false] - Bind decode fraction to scroll position (overrides rearm)
 * @param {number}  [options.threshold=0.1]  - IntersectionObserver threshold (trigger modes)
 * @param {number}  [options.duration=2000]  - Decode duration ms (trigger modes)
 * @param {string}  [options.charset]        - Charset (default CorruptionCharsets.standard)
 */
export class ScrollDecode {
  constructor(element, options = {}) {
    this.element = element;
    this.options = {
      rearm:     options.rearm ?? false,
      progress:  options.progress ?? false,
      threshold: options.threshold ?? 0.1,
      duration:  options.duration ?? 2000,
      charset:   options.charset ?? CorruptionCharsets.standard,
    };
    this._text = element ? element.textContent : '';
    this._reveal = new DecryptReveal({ charset: this.options.charset });
    this._observer = null;
    this._onScroll = null;
    this._decoded = false;
    this._running = false;
    this._destroyed = false;
  }

  /* ── Public API ──────────────────────────────────────────────────────── */

  /**
   * Arm the viewport lifecycle. Idempotent.
   * @returns {this}
   */
  start() {
    if (this._destroyed || this._running || !this.element) return this;
    this._running = true;

    if (this._prefersReducedMotion()) {
      this.element.textContent = this._text; // static fallback: readable endpoint
      return this;
    }

    if (this.options.progress) {
      this._onScroll = () => this._renderProgress();
      window.addEventListener('scroll', this._onScroll, { passive: true });
      window.addEventListener('resize', this._onScroll, { passive: true });
      this._renderProgress();
      return this;
    }

    // Trigger modes: scramble now, decode on entry
    this.element.textContent = ScrollDecode.scramble(this._text, 0, this.options.charset);
    this._observer = new IntersectionObserver((entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting && !this._decoded) {
          this._decoded = true;
          this._reveal.decode(this.element, this._text, { duration: this.options.duration });
          if (!this.options.rearm) this._observer.disconnect();
        } else if (!entry.isIntersecting && this._decoded && this.options.rearm) {
          this._decoded = false;
          this._reveal.stop();
          this.element.textContent = ScrollDecode.scramble(this._text, 0, this.options.charset);
        }
      }
    }, { threshold: this.options.threshold });
    this._observer.observe(this.element);
    return this;
  }

  /** Detach observers/listeners and cancel any running decode. Reusable. */
  stop() {
    this._running = false;
    if (this._observer) { this._observer.disconnect(); this._observer = null; }
    if (this._onScroll) {
      window.removeEventListener('scroll', this._onScroll);
      window.removeEventListener('resize', this._onScroll);
      this._onScroll = null;
    }
    this._reveal.stop();
    this._decoded = false;
  }

  /** Stop, restore the readable text, release references. Not reusable. */
  destroy() {
    if (this._destroyed) return;
    this.stop();
    if (this.element) this.element.textContent = this._text;
    this._destroyed = true;
    this.element = null;
  }

  /* ── Pure helpers ────────────────────────────────────────────────────── */

  /**
   * Pattern-1 scramble at a fixed reveal fraction. Pure aside from rng.
   * @param {string} text - Target text
   * @param {number} progress - 0..1 revealed fraction (clamped)
   * @param {string} charset - Corruption charset
   * @param {() => number} [rng=Math.random] - Injectable for deterministic tests
   * @returns {string} Scrambled string, same length as text
   */
  static scramble(text, progress, charset, rng = Math.random) {
    const p = Math.min(1, Math.max(0, progress));
    if (p >= 1) return text;
    return text.split('').map((char, i) => {
      if (char === ' ') return ' ';
      if (i < text.length * p) return char;
      return charset[Math.floor(rng() * charset.length)];
    }).join('');
  }

  /**
   * Element's traversal progress through the viewport: 0 when its top edge
   * is at the viewport bottom, 1 when its bottom edge reaches 25% depth.
   * @param {DOMRect} rect - element.getBoundingClientRect()
   * @param {number} viewportH - window.innerHeight
   * @returns {number} 0..1
   */
  static viewportProgress(rect, viewportH) {
    const span = Math.max(1, viewportH * 0.75 + rect.height);
    return Math.min(1, Math.max(0, (viewportH - rect.top) / span));
  }

  /* ── Internals ───────────────────────────────────────────────────────── */

  _renderProgress() {
    if (this._destroyed || !this.element) return;
    const p = ScrollDecode.viewportProgress(
      this.element.getBoundingClientRect(), window.innerHeight
    );
    this.element.textContent = ScrollDecode.scramble(this._text, p, this.options.charset);
  }

  _prefersReducedMotion() {
    return typeof matchMedia === 'function' &&
      matchMedia('(prefers-reduced-motion: reduce)').matches;
  }
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { ScrollDecode };
}
