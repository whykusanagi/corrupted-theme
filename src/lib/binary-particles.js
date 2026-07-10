/**
 * BinaryParticles — rising binary/hex/phrase token field.
 *
 * Corruption tokens drift upward through the lower part of a container,
 * fading in and out. Fully stateless per frame: every particle's position
 * is a pure function of (frame index, particle index, seed), so live
 * playback and deterministic video export share one code path.
 *
 * Rising binary/hex/phrase token field. Supports continuous emission or
 * beat-synced bursts; pass `beats` (seconds) to keep beat-synced bursts.
 *
 * @example Ambient field
 *   import { BinaryParticles } from '@whykusanagi/corrupted-theme/binary-particles';
 *   new BinaryParticles(stageEl, { count: 30, charset: 'mixed' }).start();
 *
 * @module lib/binary-particles
 * @version 0.3.0
 * @author whykusanagi
 * @license MIT
 *
 * @see docs/RENDER_TO_VIDEO.md — deterministic export recipe
 * @composes CorruptedParticles — canvas-based sibling for dense backgrounds;
 *   BinaryParticles is DOM-based and export-deterministic
 */

import { seededRandom } from '../core/random-utils.js';
import { pickSeededToken } from './_overlay-shared.js';

const COLORS = ['#00ffff', '#8b5cf6', '#d94f90', '#ff00ff'];
const LIFETIME_FRAMES = 90; // 1.5s at 60fps (source constant)

/**
 * @class BinaryParticles
 * @param {Element|null} container - Positioned container to fill
 * @param {object} [options={}]
 * @param {number}  [options.count=24]        - Particles alive at any moment
 * @param {'binary'|'hex'|'phrases'|'mixed'} [options.charset='mixed'] - Token pool
 * @param {number}  [options.speed=1]         - Rise-speed multiplier
 * @param {number}  [options.opacity=0.3]     - Peak particle opacity
 * @param {number[]|null} [options.beats=null] - Beat times (s) for burst emission; null = continuous
 * @param {boolean} [options.nsfw=false]      - Include NSFW phrases (opt-in)
 * @param {number|null} [options.seed=null]   - Base seed (null = random per instance)
 */
export class BinaryParticles {
  constructor(container, options = {}) {
    this.container = container;
    this.options = {
      count:   options.count ?? 24,
      charset: options.charset ?? 'mixed',
      speed:   options.speed ?? 1,
      opacity: options.opacity ?? 0.3,
      beats:   Array.isArray(options.beats) ? options.beats : null,
      nsfw:    options.nsfw ?? false,
      seed:    options.seed ?? null,
    };
    this._seedBase = this.options.seed ?? Math.floor(Math.random() * 0xffffffff);
    this._layer = null;
    this._raf = null;
    this._frame = 0;
    this._running = false;
    this._destroyed = false;
  }

  /* ── Public API ──────────────────────────────────────────────────────── */

  /**
   * Start live playback (rAF-driven). Idempotent.
   * @returns {this}
   */
  start() {
    if (this._destroyed || this._running || !this.container) return this;
    this._running = true;
    const tick = () => {
      if (!this._running) return;
      this.renderFrame(this._frame++);
      this._raf = requestAnimationFrame(tick);
    };
    this._raf = requestAnimationFrame(tick);
    return this;
  }

  /**
   * Render one deterministic frame. Same (frameIdx, seed) → identical DOM.
   * ponytail: rebuilds the particle layer every frame (source-faithful, one
   * reflow via single-child swap); switch to per-particle transform updates
   * if profiling ever shows this over the 5ms budget.
   * @param {number} frameIdx - Frame number (0-based)
   * @param {number} [fps=60] - Frames per second (used for beat sync)
   */
  renderFrame(frameIdx, fps = 60) {
    if (this._destroyed || !this.container) return;
    const rect = this.container.getBoundingClientRect();
    const w = rect.width || 1920;
    const h = rect.height || 1080;

    const layer = document.createElement('div');
    layer.className = 'corrupted-flow-particles';

    if (this.options.beats) {
      // Beat-burst mode: 3 particles per beat, alive for LIFETIME_FRAMES
      this.options.beats.forEach((beatS, bi) => {
        const age = frameIdx - Math.round(beatS * fps);
        if (age < 0 || age >= LIFETIME_FRAMES) return;
        for (let p = 0; p < 3; p++) {
          this._drawParticle(layer, w, h, age, bi * 9311 + p * 1009, bi);
        }
      });
    } else {
      // Continuous mode: `count` recycled slots, phase-offset so births spread out
      for (let i = 0; i < this.options.count; i++) {
        const phase = Math.floor((i * LIFETIME_FRAMES) / this.options.count);
        const age = (frameIdx + phase) % LIFETIME_FRAMES;
        const generation = Math.floor((frameIdx + phase) / LIFETIME_FRAMES);
        this._drawParticle(layer, w, h, age, i * 1009 + generation * 9311, i + generation);
      }
    }

    // Single-child swap = one reflow per frame
    if (this._layer) this._layer.replaceWith(layer);
    else this.container.appendChild(layer);
    this._layer = layer;
  }

  /** Stop live playback and remove the particle layer. Reusable. */
  stop() {
    this._running = false;
    if (this._raf !== null) {
      cancelAnimationFrame(this._raf);
      this._raf = null;
    }
    if (this._layer) {
      this._layer.remove();
      this._layer = null;
    }
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

  _drawParticle(layer, w, h, age, slotSeed, colorIdx) {
    const rng = seededRandom((this._seedBase + slotSeed) >>> 0);
    // Spawn in the lower 60% of the frame (source intent: keep faces clear)
    const spawnX = w * (0.05 + rng() * 0.90);
    const spawnY = h * (0.40 + rng() * 0.50);
    const vy = -(120 + rng() * 100) * (h / 1080) * this.options.speed;
    const vx = (rng() - 0.5) * 80 * (w / 1920) * this.options.speed;
    const t01 = age / LIFETIME_FRAMES;

    let opacity;
    if (age < 10) opacity = age / 10;
    else if (age > LIFETIME_FRAMES - 30) opacity = (LIFETIME_FRAMES - age) / 30;
    else opacity = 1.0;
    opacity *= this.options.opacity;

    const el = document.createElement('div');
    el.className = 'corrupted-flow-particle';
    el.style.cssText =
      `left: ${(spawnX + vx * t01).toFixed(0)}px; top: ${(spawnY + vy * t01).toFixed(0)}px; ` +
      `color: ${COLORS[colorIdx % COLORS.length]}; opacity: ${opacity.toFixed(2)}; ` +
      `font-size: ${14 + Math.floor(rng() * 8)}px;`;
    el.textContent = pickSeededToken(rng, this.options.charset, this.options.nsfw);
    layer.appendChild(el);
  }
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { BinaryParticles };
}
