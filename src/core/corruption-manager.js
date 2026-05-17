/**
 * CorruptionManager
 *
 * Unified lifecycle runner for the three canonical corruption animation
 * patterns defined in CORRUPTED_THEME_SPEC.md:
 *
 *   Pattern 1 — decode()  : Character-by-character reveal (chaos → order)
 *   Pattern 2 — flicker() : Rapid phrase cycling (instability / buffering)
 *   Pattern 3 — hybrid()  : Phrase flicker phase → character decode phase
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
 * Ported from celeste-tts-bot/obs/shared/corruption-utils.js:232-460
 * with the following intentional adaptations:
 *   - Charset source replaced with canonical CorruptionCharsets (T1)
 *   - Phrase source replaced with POOLS / getPhraseByContext (plan #1)
 *   - phraseFlicker no longer returns a Promise; all patterns use
 *     TimerRegistry for uniform cleanup
 *   - lewdMode option renamed → nsfw  (canonical CLAUDE.md name)
 *   - Constructor accepts options object (not positional args)
 *   - Public start() method added (pair to stop())
 *   - destroy() sets this._destroyed = true; instance not reusable after
 *
 * @module core/corruption-manager
 * @version 0.2.0
 * @author whykusanagi
 * @license MIT
 *
 * @see src/core/corruption-charsets.js — charset definitions
 * @see src/core/corruption-phrases.js — phrase pools
 * @see src/core/timer-registry.js     — timer lifecycle helper
 * @see CORRUPTED_THEME_SPEC.md         — visual aesthetic specification
 */

import { CorruptionCharsets } from './corruption-charsets.js';
import { SFW_PHRASES, NSFW_PHRASES, getPhraseByContext } from './corruption-phrases.js';
import { TimerRegistry } from './timer-registry.js';

/* ─────────────────────────────────────────────────────────────────────────
   INTERNAL PATTERN HELPERS
   Each helper wires into a caller-supplied TimerRegistry so that cleanup
   is automatic. Returns a cleanup function for per-animation teardown.
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

/**
 * Pattern 2: phrase flickering.
 * Cycles through the phrases array at flickerInterval ms, then writes finalText.
 *
 * @param {object}       element
 * @param {string[]}     phrases
 * @param {string}       finalText   - Text to write when duration elapses. Pass '' to leave last phrase.
 * @param {TimerRegistry} timers
 * @param {object}       opts
 * @param {number}       [opts.duration=3000]
 * @param {number}       [opts.flickerInterval=100]
 * @returns {{ cleanup: Function, isAnimating: Function }}
 */
function _flicker(element, phrases, finalText, timers, opts = {}) {
  const duration        = opts.duration        ?? 3000;
  const flickerInterval = opts.flickerInterval ?? 100;

  if (!phrases || phrases.length === 0) {
    element.textContent = finalText;
    return { cleanup: () => {}, isAnimating: () => false };
  }

  let index   = 0;
  let elapsed = 0;
  let done    = false;

  const id = timers.setInterval(() => {
    if (elapsed >= duration) {
      element.textContent = finalText;
      timers.clearInterval(id);
      done = true;
      return;
    }
    element.textContent = phrases[index % phrases.length];
    index++;
    elapsed += flickerInterval;
  }, flickerInterval);

  return {
    cleanup:     () => { timers.clearInterval(id); done = true; },
    isAnimating: () => !done,
  };
}

/**
 * Pattern 3: hybrid — flicker phase → decode phase.
 * First half of duration is phrase flickering; second half is char decode.
 *
 * @param {object}       element
 * @param {string[]}     flickerPhrases
 * @param {string}       finalText
 * @param {TimerRegistry} timers
 * @param {object}       opts
 * @param {number}       [opts.duration=4000]
 * @param {string}       [opts.charset]
 * @param {number}       [opts.flickerInterval=100]
 * @returns {{ cleanup: Function, isAnimating: Function }}
 */
function _hybrid(element, flickerPhrases, finalText, timers, opts = {}) {
  const duration        = opts.duration        ?? 4000;
  const charset         = opts.charset         ?? CorruptionCharsets.standard;
  const flickerInterval = opts.flickerInterval ?? 100;

  const flickerDuration = duration / 2;
  const decodeDuration  = duration / 2;

  let decodeHandle = null;
  let done         = false;

  // Phase 1: flicker
  const flickerHandle = _flicker(element, flickerPhrases, '', timers, {
    duration: flickerDuration,
    flickerInterval,
  });

  // Phase 2: schedule decode start after flickerDuration
  const phase2Id = timers.setTimeout(() => {
    flickerHandle.cleanup();
    decodeHandle = _decode(element, finalText, timers, {
      duration: decodeDuration,
      charset,
    });

    // Mark done after decode completes
    timers.setTimeout(() => {
      done = true;
    }, decodeDuration);
  }, flickerDuration);

  return {
    cleanup: () => {
      timers.clearTimeout(phase2Id);
      flickerHandle.cleanup();
      if (decodeHandle) decodeHandle.cleanup();
      done = true;
    },
    isAnimating: () => !done,
  };
}


/* ─────────────────────────────────────────────────────────────────────────
   PUBLIC CLASS
   ───────────────────────────────────────────────────────────────────────── */

/**
 * @class CorruptionManager
 *
 * Manages multiple simultaneous corruption animations. Each call to
 * decode() / flicker() / hybrid() returns a numeric ID; use cleanup(id)
 * to cancel a single animation, or stop() to cancel everything at once.
 *
 * @param {object}  [options={}]
 * @param {boolean} [options.nsfw=false]    - Include NSFW phrase pools when
 *                                            generating default phrase lists.
 * @param {string}  [options.charset]       - Default charset for decode/hybrid.
 *                                            Overridable per-call.
 */
export class CorruptionManager {
  constructor(options = {}) {
    /** @type {boolean} */
    this.nsfw = options.nsfw ?? false;

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
   * Start a character-by-character decode animation.
   *
   * @param {object} element          - DOM element with .textContent
   * @param {string} content          - Final readable text to decode to
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

  /* ── Pattern 2 ──────────────────────────────────────────────────────── */

  /**
   * Start a phrase-flickering animation.
   *
   * @param {object}   element
   * @param {string[]} phrases         - Phrases to cycle through. If omitted or
   *                                     empty, falls back to SFW (or NSFW) phrase pool.
   * @param {object}   [opts={}]
   * @param {number}   [opts.duration=3000]
   * @param {number}   [opts.flickerInterval=100]
   * @param {string}   [opts.finalText='']   - Text written when duration elapses
   * @param {boolean}  [opts.nsfw]            - Overrides manager-level nsfw flag
   * @returns {number} Animation ID
   */
  flicker(element, phrases, opts = {}) {
    if (this._destroyed) return -1;
    const id    = this._nextId++;
    const nsfw  = opts.nsfw ?? this.nsfw;
    const pool  = nsfw ? NSFW_PHRASES : SFW_PHRASES;
    const list  = (Array.isArray(phrases) && phrases.length > 0)
      ? phrases
      : pool.slice(0, 8); // reasonable default subset

    const finalText = opts.finalText ?? '';
    const handle = _flicker(element, list, finalText, this._timers, opts);
    this._animations.set(id, { type: 'flicker', handle, element });

    const duration = opts.duration ?? 3000;
    this._timers.setTimeout(() => {
      this._animations.delete(id);
    }, duration + 50);

    return id;
  }

  /* ── Pattern 3 ──────────────────────────────────────────────────────── */

  /**
   * Start a hybrid animation (phrase flicker phase → character decode phase).
   *
   * @param {object}   element
   * @param {string[]} phrases         - Phrases for the flicker phase. Falls back
   *                                     to default pool if empty.
   * @param {string}   content         - Final text for the decode phase
   * @param {object}   [opts={}]
   * @param {number}   [opts.duration=4000]
   * @param {string}   [opts.charset]
   * @param {number}   [opts.flickerInterval=100]
   * @param {boolean}  [opts.nsfw]
   * @returns {number} Animation ID
   */
  hybrid(element, phrases, content, opts = {}) {
    if (this._destroyed) return -1;
    const id   = this._nextId++;
    const nsfw = opts.nsfw ?? this.nsfw;
    const pool = nsfw ? NSFW_PHRASES : SFW_PHRASES;
    const list = (Array.isArray(phrases) && phrases.length > 0)
      ? phrases
      : pool.slice(0, 8);

    const mergedOpts = { charset: this._defaultCharset, ...opts };
    const handle = _hybrid(element, list, content, this._timers, mergedOpts);
    this._animations.set(id, { type: 'hybrid', handle, element });

    const duration = mergedOpts.duration ?? 4000;
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
   * @param {number} id - Return value from decode() / flicker() / hybrid()
   */
  cleanup(id) {
    const anim = this._animations.get(id);
    if (!anim) return;
    anim.handle.cleanup();
    this._animations.delete(id);
  }

  /**
   * Cancel all animations (alias of stop() for source-compat with
   * celeste-tts-bot callers that used cleanupAll()).
   */
  cleanupAll() {
    this.stop();
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
   UTILITY EXPORTS
   Thin wrappers that expose the canonical helpers for callers who want to
   drive a single animation without a manager instance (matches
   celeste-tts-bot's top-level export surface).
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

/**
 * Convenience: flicker a single element without a manager.
 * Returns a cleanup function.
 *
 * @param {object}   element
 * @param {string[]} phrases
 * @param {string}   finalText
 * @param {object}   [opts]
 * @returns {Function} cleanup
 */
export function phraseFlicker(element, phrases, finalText, opts = {}) {
  const timers = new TimerRegistry();
  const handle = _flicker(element, phrases, finalText, timers, opts);
  return () => { handle.cleanup(); timers.clearAll(); };
}

/**
 * Convenience: hybrid-decode a single element without a manager.
 * Returns a cleanup function.
 *
 * @param {object}   element
 * @param {string[]} flickerPhrases
 * @param {string}   finalText
 * @param {object}   [opts]
 * @returns {Function} cleanup
 */
export function hybridDecode(element, flickerPhrases, finalText, opts = {}) {
  const timers = new TimerRegistry();
  const handle = _hybrid(element, flickerPhrases, finalText, timers, opts);
  return () => { handle.cleanup(); timers.clearAll(); };
}

/* ─────────────────────────────────────────────────────────────────────────
   CJS INTEROP
   ───────────────────────────────────────────────────────────────────────── */
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    CorruptionManager,
    decodeText,
    phraseFlicker,
    hybridDecode,
  };
}
