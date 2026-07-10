/**
 * StreamTicker — ambient corner logo + scrolling corruption ticker.
 *
 * Two persistent overlay layers for stream scenes: a corner badge (optional
 * logo image with a pulsing glow, text, and label) and a bottom ticker strip
 * scrolling corruption phrases. Runs indefinitely until stop().
 *
 * Scrolling ticker / ambient overlay layer. No built-in branding; pass
 * logoText / logoSrc / label options.
 *
 * @example Branded stream overlay
 *   import { StreamTicker } from '@whykusanagi/corrupted-theme/stream-ticker';
 *   new StreamTicker(stageEl, {
 *     logoText: 'mychannel',
 *     label: 'LIVE',
 *     logoSrc: '/assets/logo.png',
 *   }).start();
 *
 * @module lib/stream-ticker
 * @version 0.3.0
 * @author whykusanagi
 * @license MIT
 *
 * @see docs/RENDER_TO_VIDEO.md — deterministic export recipe
 * @composes ChromaticPulse — attach to the returned logo text element for beat pulses
 */

import { seededRandom } from '../core/random-utils.js';
import { pickSeededPhrase } from './_overlay-shared.js';

/**
 * @class StreamTicker
 * @param {Element|null} container - Positioned container to overlay
 * @param {object} [options={}]
 * @param {string}  [options.logoText='']    - Corner badge text ('' = hidden)
 * @param {string|null} [options.logoSrc=null] - Corner logo image URL (null = none)
 * @param {string}  [options.label='']       - Small label under the badge text
 * @param {string[]|null} [options.items=null] - Ticker items; null = seeded corruption phrases
 * @param {number}  [options.speed=120]      - Ticker scroll speed, px/s
 * @param {boolean} [options.nsfw=false]     - Include NSFW phrases (opt-in)
 * @param {number|null} [options.seed=null]  - Seed for deterministic phrase picks
 */
export class StreamTicker {
  constructor(container, options = {}) {
    this.container = container;
    this.options = {
      logoText: options.logoText ?? '',
      logoSrc:  options.logoSrc ?? null,
      label:    options.label ?? '',
      items:    Array.isArray(options.items) ? options.items : null,
      speed:    options.speed ?? 120,
      nsfw:     options.nsfw ?? false,
      seed:     options.seed ?? null,
    };
    this._seed = this.options.seed ?? Math.floor(Math.random() * 0xffffffff);
    this._corner = null;
    this._ticker = null;
    this._raf = null;
    this._frame = 0;
    this._running = false;
    this._destroyed = false;
  }

  /* ── Public API ──────────────────────────────────────────────────────── */

  /**
   * Mount the layers and start the live loop. Idempotent.
   * @returns {this}
   */
  start() {
    if (this._destroyed || this._running || !this.container) return this;
    this._running = true;
    this._ensureLayers();
    const tick = () => {
      if (!this._running) return;
      this.renderFrame(this._frame++);
      this._raf = requestAnimationFrame(tick);
    };
    this._raf = requestAnimationFrame(tick);
    return this;
  }

  /**
   * Render one deterministic frame. Ticker phrases refresh every 30 frames;
   * logo glow pulses on a 240-frame (4s) cycle — matching the source.
   * @param {number} frameIdx - Frame number (0-based)
   * @param {number} [fps=60] - Unused; present for suite API consistency
   */
  renderFrame(frameIdx, fps = 60) {
    if (this._destroyed || !this.container) return;
    this._ensureLayers();

    // Logo glow pulse (accent → purple ramp, cosine ease)
    const img = this._corner.querySelector('.logo-img');
    if (img) {
      const pulse = 0.5 - 0.5 * Math.cos(((frameIdx % 240) / 240) * 2 * Math.PI);
      const lerp = (lo, hi) => (lo + (hi - lo) * pulse).toFixed(1);
      img.style.filter =
        `drop-shadow(0 0 ${lerp(8, 12)}px rgba(217, 79, 144, 1)) ` +
        `drop-shadow(0 0 ${lerp(15, 20)}px rgba(217, 79, 144, 0.85)) ` +
        `drop-shadow(0 0 ${lerp(25, 35)}px rgba(139, 92, 246, 0.7)) ` +
        `brightness(${(1.2 + 0.2 * pulse).toFixed(2)})`;
    }

    // Ticker content refresh (deterministic per 30-frame window) + scroll
    const width = this.container.getBoundingClientRect().width || 1920;
    if (frameIdx % 30 === 0 || !this._ticker.textContent) {
      let items = this.options.items;
      if (!items) {
        const rng = seededRandom((this._seed + Math.floor(frameIdx / 30)) >>> 0);
        items = Array.from({ length: 12 }, () => pickSeededPhrase(rng, this.options.nsfw));
      }
      const strip = items.join('   //   ');
      this._ticker.textContent = `${strip}   //   ${strip}`;
    }
    const pxPerFrame = this.options.speed / fps;
    this._ticker.style.transform = `translateX(${-((frameIdx * pxPerFrame) % width)}px)`;
  }

  /** Stop the loop and unmount both layers. Reusable. */
  stop() {
    this._running = false;
    if (this._raf !== null) {
      cancelAnimationFrame(this._raf);
      this._raf = null;
    }
    if (this._corner) { this._corner.remove(); this._corner = null; }
    if (this._ticker) { this._ticker.remove(); this._ticker = null; }
    this._frame = 0;
  }

  /** Tear down and release references. Not reusable after. */
  destroy() {
    if (this._destroyed) return;
    this.stop();
    this._destroyed = true;
    this.container = null;
  }

  /* ── Internals ───────────────────────────────────────────────────────── */

  _ensureLayers() {
    if (this._corner) return;
    const corner = document.createElement('div');
    corner.className = 'corrupted-corner-logo';
    if (this.options.logoSrc) {
      const img = document.createElement('img');
      img.className = 'logo-img';
      img.src = this.options.logoSrc;
      img.alt = this.options.logoText || 'logo';
      corner.appendChild(img);
    }
    const text = document.createElement('div');
    text.className = 'logo-text';
    text.textContent = this.options.logoText;
    const label = document.createElement('div');
    label.className = 'logo-label';
    label.textContent = this.options.label;
    corner.append(text, label);

    const ticker = document.createElement('div');
    ticker.className = 'corrupted-ticker';

    this.container.append(corner, ticker);
    this._corner = corner;
    this._ticker = ticker;
  }
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { StreamTicker };
}
