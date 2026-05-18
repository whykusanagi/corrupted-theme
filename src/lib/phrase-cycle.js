/**
 * PhraseCycle — discrete phrase-state cycling primitive.
 *
 * Replaces the entire element's text with phrase A, then phrase B, etc.,
 * at a fixed interval. After `duration` ms (or one full cycle), settles on
 * `finalText`. Optionally loops forever instead of settling.
 *
 * Different from:
 *   - TypingAnimation (src/lib/typing-animation.js) — streaming/typed reveal:
 *     the string *grows* over time, character-by-character, with a phrase-buffer
 *     flicker in the not-yet-revealed tail.
 *   - DecryptReveal (src/core/decrypt-reveal.js) — fixed-length decryption:
 *     the string is always shown at its *final length* but scrambled; random
 *     characters from the charset fill unrevealed positions and progressively
 *     resolve to the target.
 *
 * PhraseCycle replaces the *entire element text* with each phrase in sequence.
 * String length may vary between phrases. Use for: loading screens, boot-up
 * sequences, "decrypting" preambles before a result is shown, glitch transitions
 * between named states.
 *
 * Recovers the .flicker pattern that was dropped from CorruptionManager
 * during the DecryptReveal rename (PR #23).
 *
 * @example Basic settling cycle
 *   import { PhraseCycle } from '@whykusanagi/corrupted-theme/phrase-cycle';
 *   const cycle = new PhraseCycle(element, {
 *     phrases: ['Initializing...', 'Connecting...', 'Authenticating...'],
 *     interval: 400,
 *     finalText: 'Ready.',
 *   });
 *   cycle.start();
 *
 * @example Looping (no settle)
 *   new PhraseCycle(loaderEl, {
 *     phrases: ['Loading.', 'Loading..', 'Loading...'],
 *     interval: 300,
 *     loop: true,
 *   }).start();
 *
 * @module lib/phrase-cycle
 * @version 0.2.0
 * @author whykusanagi
 * @license MIT
 *
 * @see src/core/decrypt-reveal.js   — fixed-length char-level decryption
 * @see src/lib/typing-animation.js  — streaming/typed reveal (string grows over time)
 * @see CORRUPTED_THEME_SPEC.md       — visual aesthetic specification (Pattern 2)
 */

import { TimerRegistry } from '../core/timer-registry.js';

/* ─────────────────────────────────────────────────────────────────────────
   PUBLIC CLASS
   ───────────────────────────────────────────────────────────────────────── */

/**
 * @class PhraseCycle
 *
 * Discrete phrase-state cycling. Replaces the entire element's text with each
 * phrase in sequence at a fixed interval, then settles on `finalText`.
 * Optional `loop: true` cycles forever without settling.
 *
 * @param {object|null} element - DOM element with .textContent, or null (safe)
 * @param {object} [options={}]
 * @param {string[]} [options.phrases=[]]       - Ordered array of phrases to cycle through
 * @param {number}   [options.interval=200]     - ms between phrase swaps
 * @param {number|null} [options.duration=null] - Total ms before settling.
 *                                                null = phrases.length × interval (one full pass)
 * @param {string|null} [options.finalText=null] - Text written after cycle ends.
 *                                                 null = leave last-shown phrase visible
 * @param {boolean}  [options.loop=false]       - If true, cycle forever; ignore duration + finalText
 */
export class PhraseCycle {
  constructor(element, options = {}) {
    this.element = element;
    this.options = {
      phrases:   Array.isArray(options.phrases) ? options.phrases : [],
      interval:  options.interval  ?? 200,
      duration:  options.duration  ?? null,
      finalText: options.finalText ?? null,
      loop:      options.loop      ?? false,
    };
    this._timers    = new TimerRegistry();
    this._destroyed = false;
    this._running   = false;
    this._index     = 0;
  }

  /* ── Public API ──────────────────────────────────────────────────────── */

  /**
   * Start the cycle. Idempotent: calling start() while already running is a no-op.
   * Calling start() after stop() restarts from the first phrase.
   *
   * @returns {this}
   */
  start() {
    if (this._destroyed || this._running) return this;

    const { phrases, interval, duration, finalText, loop } = this.options;

    // Edge case: no phrases — just write finalText (if present) and return
    if (phrases.length === 0) {
      if (this.element && finalText !== null) {
        this.element.textContent = finalText;
      }
      return this;
    }

    this._running = true;
    this._index   = 0;

    // Show first phrase immediately so there is no 1-tick blank state
    if (this.element) {
      this.element.textContent = phrases[0];
    }
    this._index = 1;

    // Cycle interval — advances through phrases on every tick
    this._timers.setInterval(() => {
      if (this._destroyed || !this.element) return;
      this.element.textContent = phrases[this._index % phrases.length];
      this._index++;
    }, interval);

    // Schedule settle unless looping forever
    if (!loop) {
      const settleMs = duration ?? (phrases.length * interval);
      this._timers.setTimeout(() => {
        this._timers.clearAll();
        if (this._destroyed) return;
        if (this.element && finalText !== null) {
          this.element.textContent = finalText;
        }
        this._running = false;
      }, settleMs);
    }

    return this;
  }

  /**
   * Stop the cycle without settling.
   * Leaves the last-shown phrase visible in the element.
   * The instance is reusable: calling start() again restarts from the first phrase.
   */
  stop() {
    this._timers.clearAll();
    this._running = false;
  }

  /**
   * Tear down and release the element reference.
   * Idempotent. The instance is NOT reusable after destroy().
   */
  destroy() {
    if (this._destroyed) return;
    this._destroyed = true;
    this.stop();
    this.element = null;
  }

  /**
   * Whether the cycle is currently running.
   * @returns {boolean}
   */
  isRunning() {
    return this._running;
  }
}

/* ─────────────────────────────────────────────────────────────────────────
   CJS INTEROP
   ───────────────────────────────────────────────────────────────────────── */
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { PhraseCycle };
}
