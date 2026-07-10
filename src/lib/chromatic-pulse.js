/**
 * ChromaticPulse — RGB-split chromatic-aberration pulse on any element.
 *
 * Periodically splits the element's text into magenta/cyan fringes via
 * text-shadow, ramping in and out on a triangle wave (peak mid-pulse).
 * Static between pulses; motion indicates instability (spec tenet 3).
 *
 * RGB-split chromatic-aberration pulse overlay for any text element.
 *
 * @example Live (random cadence)
 *   import { ChromaticPulse } from '@whykusanagi/corrupted-theme/chromatic-pulse';
 *   const pulse = new ChromaticPulse(logoEl, { intensity: 1 });
 *   pulse.start();
 *
 * @example Deterministic frame rendering (video export)
 *   const pulse = new ChromaticPulse(logoEl, { seed: 42 });
 *   pulse.renderFrame(frameIdx, 60);   // same frame → same pixels
 *
 * @module lib/chromatic-pulse
 * @version 0.3.0
 * @author whykusanagi
 * @license MIT
 *
 * @see docs/RENDER_TO_VIDEO.md — deterministic export recipe
 * @composes StreamTicker — pulse the corner-logo text of a stream overlay
 */

import { seededRandom } from '../core/random-utils.js';

/**
 * @class ChromaticPulse
 * @param {Element|null} element - Target element (its text gets the fringe)
 * @param {object} [options={}]
 * @param {number}   [options.intensity=1]           - Fringe offset multiplier (1 = up to 4px)
 * @param {number[]} [options.interval=[2000,6000]]  - [min,max] ms between pulse starts (live mode)
 * @param {number}   [options.pulseMs=150]           - Duration of one pulse
 * @param {number|null} [options.seed=null]          - Seed for deterministic cadence (null = Math.random)
 */
export class ChromaticPulse {
  constructor(element, options = {}) {
    this.element = element;
    this.options = {
      intensity: options.intensity ?? 1,
      interval:  Array.isArray(options.interval) ? options.interval : [2000, 6000],
      pulseMs:   options.pulseMs ?? 150,
      seed:      options.seed ?? null,
    };
    this._rng = this.options.seed === null ? Math.random : seededRandom(this.options.seed);
    this._raf = null;
    this._destroyed = false;
    this._running = false;
    this._savedShadow = element ? element.style.textShadow : '';
    this._nextPulseAt = 0;
    this._pulseStart = -1;
  }

  /* ── Public API ──────────────────────────────────────────────────────── */

  /**
   * Start the live pulse loop. Idempotent.
   * @returns {this}
   */
  start() {
    if (this._destroyed || this._running || !this.element) return this;
    this._running = true;
    const [min, max] = this.options.interval;
    this._nextPulseAt = performance.now() + min + this._rng() * (max - min);
    const tick = (now) => {
      if (!this._running) return;
      if (this._pulseStart < 0 && now >= this._nextPulseAt) this._pulseStart = now;
      if (this._pulseStart >= 0) {
        const t = (now - this._pulseStart) / this.options.pulseMs;
        if (t >= 1) {
          this._applyShadow(0);
          this._pulseStart = -1;
          this._nextPulseAt = now + min + this._rng() * (max - min);
        } else {
          this._applyShadow(1 - Math.abs(t * 2 - 1)); // triangle wave 0..1..0
        }
      }
      this._raf = requestAnimationFrame(tick);
    };
    this._raf = requestAnimationFrame(tick);
    return this;
  }

  /**
   * Render one deterministic frame (video export). Pulses fire at a fixed
   * period = mean of options.interval; each occupies the first pulseMs.
   * @param {number} frameIdx - Frame number (0-based)
   * @param {number} [fps=60] - Frames per second of the export
   */
  renderFrame(frameIdx, fps = 60) {
    if (this._destroyed || !this.element) return;
    const [min, max] = this.options.interval;
    const periodFrames = Math.max(1, Math.round(((min + max) / 2 / 1000) * fps));
    const pulseFrames = Math.max(1, Math.round((this.options.pulseMs / 1000) * fps));
    const pos = frameIdx % periodFrames;
    const t = pos / pulseFrames;
    this._applyShadow(t < 1 ? 1 - Math.abs(t * 2 - 1) : 0);
  }

  /** Stop pulsing and restore the element's original text-shadow. */
  stop() {
    this._running = false;
    if (this._raf !== null) {
      cancelAnimationFrame(this._raf);
      this._raf = null;
    }
    this._pulseStart = -1;
    if (this.element) this.element.style.textShadow = this._savedShadow;
  }

  /** Tear down and release the element reference. Not reusable after. */
  destroy() {
    if (this._destroyed) return;
    this.stop();
    this._destroyed = true;
    this.element = null;
  }

  /* ── Internals ───────────────────────────────────────────────────────── */

  _applyShadow(k) {
    if (!this.element) return;
    if (k <= 0) {
      this.element.style.textShadow = this._savedShadow;
      return;
    }
    const ox = (4 * k * this.options.intensity).toFixed(2);
    const glow = (20 + 8 * k).toFixed(1);
    this.element.style.textShadow =
      `${-ox}px 0 0 #ff00ff, ${ox}px 0 0 #00ffff, 0 0 ${glow}px #8b5cf6`;
  }
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { ChromaticPulse };
}
