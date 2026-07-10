/**
 * GlitchTitleCard — █▓▒░ buffer-fill intro/outro title cards.
 *
 * `intro`: the title emerges character-by-character from a block-character
 * buffer, settling on the full readable text (chaos → order, spec tenet 1).
 * `outro`: the title appears with a corruption sub-phrase beneath it.
 *
 * Intro/outro title-card overlay with block-buffer character decoding.
 *
 * @example Stream intro card
 *   import { GlitchTitleCard } from '@whykusanagi/corrupted-theme/glitch-title-card';
 *   new GlitchTitleCard(stageEl, { text: 'ABYSS ONLINE', mode: 'intro' })
 *     .start(() => console.log('settled'));
 *
 * @module lib/glitch-title-card
 * @version 0.3.0
 * @author whykusanagi
 * @license MIT
 *
 * @see docs/RENDER_TO_VIDEO.md — deterministic export recipe
 * @see CORRUPTED_THEME_SPEC.md — Pattern 1 (character decoding)
 * @composes CorruptedTimeline — sequence intro card → scene → outro card
 */

import { seededRandom } from '../core/random-utils.js';
import { pickSeededPhrase } from './_overlay-shared.js';

const BUFFER_CHARS = '█▓▒░';

/**
 * @class GlitchTitleCard
 * @param {Element|null} container - Positioned container (card fills it)
 * @param {object} [options={}]
 * @param {string}  [options.text='']          - Title text
 * @param {'intro'|'outro'} [options.mode='intro'] - Card behavior
 * @param {number}  [options.duration=3000]    - Reveal duration ms (intro) / hold ms before onComplete (outro)
 * @param {string|null} [options.subtitle=null] - Outro sub-line (null = seeded corruption phrase)
 * @param {boolean} [options.nsfw=false]       - Include NSFW phrases in seeded subtitle (opt-in)
 * @param {number|null} [options.seed=null]    - Seed for deterministic subtitle/buffer
 */
export class GlitchTitleCard {
  constructor(container, options = {}) {
    this.container = container;
    this.options = {
      text:     options.text ?? '',
      mode:     options.mode === 'outro' ? 'outro' : 'intro',
      duration: options.duration ?? 3000,
      subtitle: options.subtitle ?? null,
      nsfw:     options.nsfw ?? false,
      seed:     options.seed ?? null,
    };
    this._seed = this.options.seed ?? Math.floor(Math.random() * 0xffffffff);
    this._card = null;
    this._raf = null;
    this._running = false;
    this._destroyed = false;
  }

  /* ── Public API ──────────────────────────────────────────────────────── */

  /**
   * Play the card. Intro reveals then settles readable and stays until
   * stop(); outro shows immediately and fires onComplete after duration.
   * Idempotent while running.
   * @param {Function} [onComplete] - Called once the card settles
   * @returns {this}
   */
  start(onComplete) {
    if (this._destroyed || this._running || !this.container) return this;
    this._running = true;
    const t0 = performance.now();
    const tick = (now) => {
      if (!this._running) return;
      const progress = Math.min(1, (now - t0) / this.options.duration);
      this.renderProgress(progress);
      if (progress < 1) {
        this._raf = requestAnimationFrame(tick);
      } else {
        this._raf = null;
        if (typeof onComplete === 'function') onComplete();
      }
    };
    this._raf = requestAnimationFrame(tick);
    return this;
  }

  /**
   * Render one deterministic frame (video export).
   * @param {number} frameIdx - Frame number (0-based)
   * @param {number} [fps=60] - Frames per second of the export
   */
  renderFrame(frameIdx, fps = 60) {
    const totalFrames = Math.max(1, Math.round((this.options.duration / 1000) * fps));
    this.renderProgress(Math.min(1, frameIdx / totalFrames));
  }

  /**
   * Render the card at an absolute progress position.
   * @param {number} progress - 0..1 through the reveal
   */
  renderProgress(progress) {
    if (this._destroyed || !this.container) return;
    const card = this._ensureCard();
    const { text, mode } = this.options;

    if (mode === 'intro') {
      // Reveal runs 20% hot so the buffer clears just before the end
      const reveal = Math.min(text.length, Math.floor(progress * text.length * 1.2));
      const revealed = text.slice(0, reveal);
      const buffer = BUFFER_CHARS.repeat(
        Math.ceil(Math.max(0, text.length - reveal) / BUFFER_CHARS.length) + 1
      ).slice(0, Math.max(0, text.length - reveal));
      card.querySelector('.title-main').textContent = revealed + buffer;
    } else {
      card.querySelector('.title-main').textContent = text;
      const sub = this.options.subtitle ??
        pickSeededPhrase(seededRandom(this._seed), this.options.nsfw);
      card.querySelector('.title-sub').textContent = sub;
    }
  }

  /** Stop and remove the card. Reusable. */
  stop() {
    this._running = false;
    if (this._raf !== null) {
      cancelAnimationFrame(this._raf);
      this._raf = null;
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

  _ensureCard() {
    if (this._card) return this._card;
    const card = document.createElement('div');
    card.className = 'corrupted-takeover corrupted-title-card';
    const main = document.createElement('div');
    main.className = 'title-main';
    const sub = document.createElement('div');
    sub.className = 'title-sub';
    card.append(main, sub);
    this.container.appendChild(card);
    this._card = card;
    return card;
  }
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { GlitchTitleCard };
}
