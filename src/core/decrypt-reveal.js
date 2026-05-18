/**
 * DecryptReveal
 *
 * Fixed-length decryption animation. The target string is shown at its final
 * length from frame 1, scrambled with random characters from a charset, and
 * progressively resolves left-to-right to the target text (chaos → order).
 *
 * **Distinction from TypingAnimation:**
 *   - TypingAnimation (src/lib/typing-animation.js) — streaming/typed reveal:
 *     the string *grows* over time, character-by-character, with a phrase-buffer
 *     flicker in the not-yet-revealed tail.
 *   - DecryptReveal (this module) — fixed-length decryption: the string is
 *     always shown at its *final length* but scrambled; random characters from
 *     the charset fill unrevealed positions and progressively resolve to the
 *     target. Use this for code reveals, passwords, terminal boot sequences.
 *
 * All active animations are tracked via TimerRegistry so that a single
 * stop() / destroy() call tears everything down cleanly.
 *
 * Visibility API integration: on document.hidden the manager auto-stops
 * to avoid burning CPU while the tab is not visible; on document.visibilityState
 * returning "visible" start() is called (currently a deliberate no-op — callers
 * re-queue animations explicitly, matching browser memory model expectations).
 *
 * Node / SSR compatibility: every `document` access is guarded by a
 * `typeof document !== 'undefined'` check so importing in Node (tests, bundlers)
 * does not throw.
 *
 * @module core/decrypt-reveal
 * @version 0.2.0
 * @author whykusanagi
 * @license MIT
 *
 * @see src/core/corruption-charsets.js — charset definitions
 * @see src/core/timer-registry.js     — timer lifecycle helper
 * @see src/lib/typing-animation.js    — streaming/typed reveal (string grows over time)
 * @see CORRUPTED_THEME_SPEC.md         — visual aesthetic specification (Pattern 1)
 */

import { CorruptionCharsets } from './corruption-charsets.js';
import { TimerRegistry } from './timer-registry.js';

/* ─────────────────────────────────────────────────────────────────────────
   INTERNAL PATTERN HELPER
   ───────────────────────────────────────────────────────────────────────── */

/**
 * Pattern 1: character-by-character decode.
 * Progresses left-to-right; corrupted tail uses random chars from charset.
 *
 * @param {object}       element  - DOM element (must have .textContent)
 * @param {string}       finalText
 * @param {TimerRegistry} timers
 * @param {object}       opts
 * @param {number}       [opts.duration=2000]
 * @param {string}       [opts.charset]
 * @returns {{ cleanup: Function, isAnimating: Function }}
 */
function _decode(element, finalText, timers, opts = {}) {
  const duration = opts.duration ?? 2000;
  const charset  = opts.charset  ?? CorruptionCharsets.standard;
  const steps    = 20;
  const interval = Math.max(16, Math.floor(duration / steps));
  let step = 0;
  let done = false;

  const id = timers.setInterval(() => {
    if (step >= steps) {
      element.textContent = finalText;
      timers.clearInterval(id);
      done = true;
      return;
    }

    const progress = step / steps;
    const decoded = finalText.split('').map((char, i) => {
      if (char === ' ') return ' ';
      if (i < finalText.length * progress) return char;
      return charset[Math.floor(Math.random() * charset.length)];
    }).join('');

    element.textContent = decoded;
    step++;
  }, interval);

  return {
    cleanup:     () => { timers.clearInterval(id); done = true; },
    isAnimating: () => !done,
  };
}


/* ─────────────────────────────────────────────────────────────────────────
   PUBLIC CLASS
   ───────────────────────────────────────────────────────────────────────── */

/**
 * @class DecryptReveal
 *
 * Manages multiple simultaneous fixed-length decryption animations. Each call
 * to decode() returns a numeric ID; use cleanup(id) to cancel a single
 * animation, or stop() to cancel everything at once.
 *
 * For streaming/typed reveal where the string grows over time, see TypingAnimation.
 *
 * @param {object}  [options={}]
 * @param {string}  [options.charset]       - Default charset for decode operations.
 *                                            Overridable per-call.
 *                                            Defaults to CorruptionCharsets.standard.
 */
export class DecryptReveal {
  constructor(options = {}) {
    /** @type {string} */
    this._defaultCharset = options.charset ?? CorruptionCharsets.standard;

    /**
     * Central timer registry — ALL intervals/timeouts go through here so
     * stop() can cancel them in one call.
     * @type {TimerRegistry}
     */
    this._timers = new TimerRegistry();

    /**
     * Per-animation state keyed by numeric ID.
     * @type {Map<number, { type: string, handle: { cleanup: Function, isAnimating: Function }, element: object }>}
     */
    this._animations = new Map();

    /** @type {number} */
    this._nextId = 1;

    /** @type {boolean} */
    this._destroyed = false;

    // Visibility API auto-cleanup (browser only)
    if (typeof document !== 'undefined') {
      this._handleVisibilityChange = this._handleVisibilityChange.bind(this);
      document.addEventListener('visibilitychange', this._handleVisibilityChange);
    }
  }

  /* ── Pattern 1 ──────────────────────────────────────────────────────── */

  /**
   * Start a fixed-length decryption animation. The element is set to
   * `content` length from frame 1 (scrambled), then resolves left-to-right.
   *
   * @param {object} element          - DOM element with .textContent
   * @param {string} content          - Final readable text to decrypt to
   * @param {object} [opts={}]
   * @param {number} [opts.duration=2000]
   * @param {string} [opts.charset]   - Overrides manager-level default
   * @returns {number} Animation ID (pass to cleanup() to cancel early)
   */
  decode(element, content, opts = {}) {
    if (this._destroyed) return -1;
    const id = this._nextId++;
    const mergedOpts = { charset: this._defaultCharset, ...opts };
    const handle = _decode(element, content, this._timers, mergedOpts);

    this._animations.set(id, { type: 'decode', handle, element });

    // Auto-remove entry when animation completes naturally
    const duration = mergedOpts.duration ?? 2000;
    this._timers.setTimeout(() => {
      this._animations.delete(id);
    }, duration + 50);

    return id;
  }

  /* ── Lifecycle ──────────────────────────────────────────────────────── */

  /**
   * Cancel all active animations and clear their timers.
   * Visual state of elements is preserved (text remains as last written).
   * Called automatically when document.hidden becomes true.
   */
  stop() {
    for (const [, anim] of this._animations) {
      anim.handle.cleanup();
    }
    this._animations.clear();
    this._timers.clearAll();
  }

  /**
   * Resume hook — called automatically when document becomes visible again.
   * Intentional no-op: animations must be re-queued explicitly by callers.
   * Included to satisfy the symmetric start/stop API surface.
   */
  start() {
    // Deliberate no-op. Re-queue animations explicitly after stop().
  }

  /**
   * Cancel a single animation by its ID.
   * No-op if id is unknown or already cleaned up.
   *
   * @param {number} id - Return value from decode()
   */
  cleanup(id) {
    const anim = this._animations.get(id);
    if (!anim) return;
    anim.handle.cleanup();
    this._animations.delete(id);
  }

  /**
   * @deprecated Use stop() instead. Kept for source-compat with
   * celeste-tts-bot consumers. Slated for removal in 0.3.x.
   */
  cleanupAll() {
    return this.stop();
  }

  /**
   * Tear down the manager completely. Cancels all animations, removes the
   * visibilitychange listener, and marks the instance non-reusable.
   *
   * After destroy(), method calls are silently ignored (return -1 / undefined).
   */
  destroy() {
    this.stop();
    if (typeof document !== 'undefined' && this._handleVisibilityChange) {
      document.removeEventListener('visibilitychange', this._handleVisibilityChange);
    }
    this._destroyed = true;
  }

  /* ── Introspection ──────────────────────────────────────────────────── */

  /**
   * @returns {number} Count of animations currently tracked (some may have
   * completed naturally but not yet auto-removed).
   */
  getActiveCount() {
    return this._animations.size;
  }

  /**
   * @param {number} id
   * @returns {boolean} true while the animation is still running
   */
  isAnimating(id) {
    const anim = this._animations.get(id);
    if (!anim) return false;
    return anim.handle.isAnimating();
  }

  /* ── Private ────────────────────────────────────────────────────────── */

  /**
   * @private
   */
  _handleVisibilityChange() {
    if (typeof document === 'undefined') return;
    if (document.hidden) {
      this.stop();
    } else {
      this.start();
    }
  }
}

/* ─────────────────────────────────────────────────────────────────────────
   UTILITY EXPORT
   Thin wrapper that exposes the decode helper for callers who want to drive
   a single animation without a manager instance.
   ───────────────────────────────────────────────────────────────────────── */

/**
 * Convenience: decode a single element without a manager.
 * Returns a cleanup function.
 *
 * @param {object} element
 * @param {string} finalText
 * @param {object} [opts]
 * @returns {Function} cleanup — call to cancel early
 */
export function decodeText(element, finalText, opts = {}) {
  const timers = new TimerRegistry();
  const handle = _decode(element, finalText, timers, opts);
  return () => { handle.cleanup(); timers.clearAll(); };
}

/* ─────────────────────────────────────────────────────────────────────────
   CJS INTEROP
   ───────────────────────────────────────────────────────────────────────── */
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    DecryptReveal,
    decodeText,
  };
}
