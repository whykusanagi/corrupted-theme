/**
 * TerminalTakeover — full-viewport "system corrupted" terminal card.
 *
 * Dims the container and floods it with `> `-prefixed corruption lines plus
 * a title banner, then clears after `duration`. Use for beat drops, raid
 * alerts, scene-change punctuation.
 *
 * Absorbed from spatial_videos/pipeline/overlay/scene.js (drawTakeover) —
 * single canonical home is this package. Lines are built with textContent
 * (never innerHTML) so caller-supplied messages cannot inject markup.
 *
 * @example Beat-drop takeover
 *   import { TerminalTakeover } from '@whykusanagi/corrupted-theme/terminal-takeover';
 *   new TerminalTakeover(stageEl, { title: 'SIGNAL LOST', duration: 800 }).start();
 *
 * @module lib/terminal-takeover
 * @version 0.3.0
 * @author whykusanagi
 * @license MIT
 *
 * @see docs/RENDER_TO_VIDEO.md — deterministic export recipe
 * @composes CorruptedTimeline — schedule takeovers on beats/labels
 */

import { seededRandom } from '../core/random-utils.js';
import { pickSeededPhrase } from './_overlay-shared.js';

/**
 * @class TerminalTakeover
 * @param {Element|null} container - Positioned container (card fills it)
 * @param {object} [options={}]
 * @param {string}   [options.title='SIGNAL LOST'] - Banner line (de-themed default)
 * @param {string[]|null} [options.messages=null]  - Fixed lines; null = seeded corruption phrases
 * @param {number}   [options.lines=18]            - Line count when messages is null
 * @param {number}   [options.duration=4000]       - ms visible before auto-clear
 * @param {boolean}  [options.nsfw=false]          - Include NSFW phrases (opt-in)
 * @param {number|null} [options.seed=null]        - Seed for deterministic line picks
 */
export class TerminalTakeover {
  constructor(container, options = {}) {
    this.container = container;
    this.options = {
      title:    options.title ?? 'SIGNAL LOST',
      messages: Array.isArray(options.messages) ? options.messages : null,
      lines:    options.lines ?? 18,
      duration: options.duration ?? 4000,
      nsfw:     options.nsfw ?? false,
      seed:     options.seed ?? null,
    };
    this._seed = this.options.seed ?? Math.floor(Math.random() * 0xffffffff);
    this._card = null;
    this._timeout = null;
    this._running = false;
    this._destroyed = false;
  }

  /* ── Public API ──────────────────────────────────────────────────────── */

  /**
   * Show the takeover; auto-clears after options.duration. Idempotent.
   * @param {Function} [onComplete] - Called after the card clears
   * @returns {this}
   */
  start(onComplete) {
    if (this._destroyed || this._running || !this.container) return this;
    this._running = true;
    this._draw();
    this._timeout = setTimeout(() => {
      this._timeout = null;
      this.stop();
      if (typeof onComplete === 'function') onComplete();
    }, this.options.duration);
    return this;
  }

  /**
   * Render one deterministic frame (video export): visible for the first
   * duration-worth of frames, cleared after.
   * @param {number} frameIdx - Frame number (0-based)
   * @param {number} [fps=60] - Frames per second of the export
   */
  renderFrame(frameIdx, fps = 60) {
    if (this._destroyed || !this.container) return;
    const visibleFrames = Math.max(1, Math.round((this.options.duration / 1000) * fps));
    if (frameIdx < visibleFrames) this._draw();
    else if (this._card) { this._card.remove(); this._card = null; }
  }

  /** Clear the card immediately. Reusable. */
  stop() {
    this._running = false;
    if (this._timeout !== null) {
      clearTimeout(this._timeout);
      this._timeout = null;
    }
    if (this._card) {
      this._card.remove();
      this._card = null;
    }
  }

  /** Tear down and release references. Not reusable after. */
  destroy() {
    if (this._destroyed) return;
    this.stop();
    this._destroyed = true;
    this.container = null;
  }

  /* ── Internals ───────────────────────────────────────────────────────── */

  _draw() {
    if (this._card) return; // content is deterministic per instance seed
    const card = document.createElement('div');
    card.className = 'corrupted-takeover';
    const rng = seededRandom(this._seed);
    const lines = this.options.messages ??
      Array.from({ length: this.options.lines }, () => pickSeededPhrase(rng, this.options.nsfw));
    for (const line of lines) {
      const div = document.createElement('div');
      div.textContent = `> ${line}`;   // textContent: injection-safe for caller messages
      card.appendChild(div);
    }
    const banner = document.createElement('div');
    banner.textContent = ` \n// ${this.options.title} //`;
    banner.style.whiteSpace = 'pre-line';
    card.appendChild(banner);
    this.container.appendChild(card);
    this._card = card;
  }
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { TerminalTakeover };
}
