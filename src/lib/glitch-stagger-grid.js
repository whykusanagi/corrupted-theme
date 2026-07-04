/**
 * GlitchStaggerGrid — Pattern 4: staggered grid corruption.
 *
 * Corruption ripples across a grid of elements outward from an origin.
 * Each element runs a short character-decode burst whose start is delayed
 * by its distance from the origin (the "wave"); behind the wavefront,
 * elements settle to stable cyan. The grid always ends fully readable.
 *
 * Color ramp per spec: purple (#8b5cf6) wavefront → magenta (#ff00ff)
 * mid-decay → cyan (#00ffff) settled. Design reference: anime.js v4 grid
 * `stagger` (MIT) — API model only, zero dependencies.
 *
 * Spec floors enforced: wave ≥ 40ms/neighbor, burst frames ≥ 100ms, total
 * settle ≤ 4s (delays auto-scale down), ≤ maxConcurrent simultaneous
 * bursts (queued), prefers-reduced-motion → final state immediately.
 *
 * @example "Starting soon" tile wall
 *   import { GlitchStaggerGrid } from '@whykusanagi/corrupted-theme/glitch-stagger-grid';
 *   new GlitchStaggerGrid(tileWall, { origin: 'center', wave: 80 })
 *     .play(() => console.log('settled'));
 *
 * @module lib/glitch-stagger-grid
 * @version 0.3.0
 * @author whykusanagi
 * @license MIT
 *
 * @see CORRUPTED_THEME_SPEC.md — Pattern 4: Staggered Grid Corruption
 * @see src/core/corruption-easings.js — STAGGER presets (grid-index variant)
 * @composes CorruptedTimeline — ripple a nav grid after a scene transition
 */

import { CorruptionCharsets } from '../core/corruption-charsets.js';
import { TimerRegistry } from '../core/timer-registry.js';

const RAMP = { wavefront: '#8b5cf6', mid: '#ff00ff', settled: '#00ffff' };
const BURST_MS = 800;
const FRAME_MS = 100;      // spec floor: ≥100ms per flicker frame
const SETTLE_CAP_MS = 4000;

/**
 * @class GlitchStaggerGrid
 * @param {Element|null} container - Grid container
 * @param {object} [options={}]
 * @param {string} [options.selector=':scope > *'] - Which children ripple
 * @param {'center'|number|number[]} [options.origin='center'] - Ripple origin:
 *   'center', an element index, or [x, y] px within the container
 * @param {number} [options.wave=80] - ms per grid-unit of distance (clamped ≥40)
 * @param {string} [options.charset='standard'] - CorruptionCharsets set name
 * @param {number} [options.maxConcurrent=12] - Simultaneous bursts (spec cap)
 */
export class GlitchStaggerGrid {
  constructor(container, options = {}) {
    this.container = container;
    this.options = {
      selector: options.selector ?? ':scope > *',
      origin: options.origin ?? 'center',
      wave: Math.max(40, options.wave ?? 80),
      charset: options.charset ?? 'standard',
      maxConcurrent: options.maxConcurrent ?? 12,
    };
    this._timers = new TimerRegistry();
    this._playing = false;
    this._destroyed = false;
    this._originals = null;
  }

  /* ── Public API ──────────────────────────────────────────────────────── */

  /**
   * Run the ripple once. Idempotent while playing.
   * @param {Function} [onComplete] - Fires when every element has settled
   * @returns {this}
   */
  play(onComplete) {
    if (this._destroyed || this._playing || !this.container) return this;
    const els = [...this.container.querySelectorAll(this.options.selector)];
    if (!els.length) { onComplete?.(); return this; }
    this._playing = true;
    this._originals = els.map((el) => ({ el, text: el.textContent, color: el.style.color }));

    if (this._prefersReducedMotion()) {
      // Static fallback: final state — readable, settled cyan
      for (const { el } of this._originals) el.style.color = RAMP.settled;
      this._playing = false;
      onComplete?.();
      return this;
    }

    const cRect = this.container.getBoundingClientRect();
    const centers = els.map((el) => {
      const r = el.getBoundingClientRect();
      return [r.left - cRect.left + r.width / 2, r.top - cRect.top + r.height / 2];
    });
    const origin = this._resolveOrigin(centers, cRect);
    const delays = GlitchStaggerGrid.computeDelays(centers, origin, this.options.wave);

    // Spec: total settle ≤ 4s — scale delays down if the tail would exceed it
    const maxDelay = Math.max(...delays);
    const scale = maxDelay + BURST_MS > SETTLE_CAP_MS
      ? (SETTLE_CAP_MS - BURST_MS) / maxDelay : 1;

    const charset = CorruptionCharsets[this.options.charset] ?? CorruptionCharsets.standard;
    let running = 0;
    let finished = 0;
    const queue = [];

    const finish = () => {
      finished++;
      running--;
      if (queue.length) queue.shift()();
      if (finished === els.length) {
        this._playing = false;
        onComplete?.();
      }
    };
    const tryBurst = (i) => {
      const run = () => { running++; this._burst(els[i], this._originals[i].text, charset, finish); };
      if (running < this.options.maxConcurrent) run();
      else queue.push(run); // spec cap: defer past maxConcurrent
    };

    els.forEach((_, i) => {
      this._timers.setTimeout(() => tryBurst(i), Math.round(delays[i] * scale));
    });
    return this;
  }

  /** Cancel mid-ripple and restore original text/colors. Reusable. */
  stop() {
    this._timers.clearAll();
    this._playing = false;
    if (this._originals) {
      for (const { el, text, color } of this._originals) {
        el.textContent = text;
        el.style.color = color;
      }
    }
  }

  /** Stop and release references. Not reusable. */
  destroy() {
    if (this._destroyed) return;
    this.stop();
    this._timers.destroy();
    this._destroyed = true;
    this.container = null;
    this._originals = null;
  }

  /* ── Pure helpers ────────────────────────────────────────────────────── */

  /**
   * Distance-proportional delays, normalized so one nearest-neighbor step
   * equals `wave` ms (uniform 3×3 grid: center 0, corners √2·wave).
   * @param {number[][]} centers - [x, y] element centers
   * @param {number[]} origin - [x, y] ripple origin
   * @param {number} wave - ms per grid unit (clamped ≥40)
   * @returns {number[]} Delay ms per element
   */
  static computeDelays(centers, origin, wave) {
    const w = Math.max(40, wave);
    // Grid unit = smallest nonzero distance between any two element centers
    let unit = Infinity;
    for (let i = 0; i < centers.length; i++) {
      for (let j = i + 1; j < centers.length; j++) {
        const d = Math.hypot(centers[i][0] - centers[j][0], centers[i][1] - centers[j][1]);
        if (d > 0.5 && d < unit) unit = d;
      }
    }
    if (!isFinite(unit)) unit = 100;
    return centers.map(([x, y]) =>
      Math.round(Math.hypot(x - origin[0], y - origin[1]) / unit * w));
  }

  /* ── Internals ───────────────────────────────────────────────────────── */

  _resolveOrigin(centers, cRect) {
    const { origin } = this.options;
    if (Array.isArray(origin)) return origin;
    if (typeof origin === 'number' && centers[origin]) return centers[origin];
    return [cRect.width / 2, cRect.height / 2]; // 'center'
  }

  _burst(el, text, charset, done) {
    const frames = Math.max(1, Math.round(BURST_MS / FRAME_MS));
    let frame = 0;
    el.style.color = RAMP.wavefront;
    const id = this._timers.setInterval(() => {
      frame++;
      const progress = frame / frames;
      if (progress >= 1) {
        this._timers.clearInterval(id);
        el.textContent = text;              // readable endpoint
        el.style.color = RAMP.settled;      // stable cyan
        done();
        return;
      }
      el.style.color = progress < 0.5 ? RAMP.wavefront : RAMP.mid;
      el.textContent = text.split('').map((char, i) => {
        if (char === ' ') return ' ';
        if (i < text.length * progress) return char;
        return charset[Math.floor(Math.random() * charset.length)];
      }).join('');
    }, FRAME_MS);
  }

  _prefersReducedMotion() {
    return typeof matchMedia === 'function' &&
      matchMedia('(prefers-reduced-motion: reduce)').matches;
  }
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { GlitchStaggerGrid };
}
