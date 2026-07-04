/**
 * CorruptedTimeline — sequence animation blocks into one orchestrated scene.
 *
 * Chains any objects following the package animation contract — `play(cb)`
 * (all animation-blocks and transitions) or `start()`/`stop()` plus an
 * explicit `{ duration }` — with absolute, relative, and label offsets:
 *
 *   const tl = new CorruptedTimeline({ onComplete: done });
 *   tl.add(new TerminalBoot(stage))                 // t=0 (first item)
 *     .add(new ScanlineSweep(stage), '+=200')       // 200ms after boot ends
 *     .label('reveal')                              // mark that moment
 *     .add(new GlitchPulse(stage), 'reveal')        // at the label
 *     .add(new TitleDecoder(stage, {...}), 1500)    // absolute: t0+1500ms
 *     .play();
 *
 * Design reference: anime.js v4 `createTimeline` (MIT) — API model only,
 * zero dependencies. Extends the DecryptReveal lifecycle approach (central
 * TimerRegistry; one stop() tears everything down) rather than forking it.
 *
 * Scheduling model (documented semantics):
 * - Relative offsets ('+=N' / '-=N') and labels are COMPLETION-DRIVEN: an
 *   item's end is when its play(cb) callback fires (or start()+duration
 *   elapses). '-=N' starts N ms before the previous item's end is *expected*
 *   only when duration is known; otherwise it degrades to '+=0' with a
 *   console.warn (blocks without duration cannot be anticipated).
 * - pause() suspends pending starts (in-flight block animations have no
 *   pause API and keep running to completion; they will not chain further
 *   until play() resumes).
 * - seek(ms) restarts the schedule treating entries whose resolved absolute
 *   start is < ms as already-complete (skipped); chains hanging off skipped
 *   entries begin immediately.
 *
 * @module lib/corrupted-timeline
 * @version 0.3.0
 * @author whykusanagi
 * @license MIT
 *
 * @see src/core/timer-registry.js — timer lifecycle
 * @see src/core/corruption-easings.js — EASINGS/STAGGER presets
 * @composes animation-blocks — TerminalBoot, ScanlineSweep, TitleDecoder, …
 * @composes transitions — the 12 composite scene transitions
 */

import { TimerRegistry } from '../core/timer-registry.js';

/**
 * @class CorruptedTimeline
 * @param {object} [options={}]
 * @param {boolean} [options.autoplay=false] - play() immediately on first add()
 * @param {Function|null} [options.onComplete=null] - Fires once every entry has completed
 */
export class CorruptedTimeline {
  constructor(options = {}) {
    this.options = {
      autoplay: options.autoplay ?? false,
      onComplete: options.onComplete ?? null,
    };
    /** @type {Array<{item: object, offset: number|string, opts: object, state: string}>} */
    this._entries = [];
    /** @type {Map<string, number>} label name → entry index it follows */
    this._labels = new Map();
    this._timers = new TimerRegistry();
    this._playing = false;
    this._destroyed = false;
    this._completed = 0;
  }

  /* ── Building ────────────────────────────────────────────────────────── */

  /**
   * Append an item.
   * @param {object} item - Object with play(cb), or start()/stop() + opts.duration
   * @param {number|string} [offset='+=0'] - ms from t0 | '+=N'/'-=N' after/before
   *   previous end | a label name
   * @param {object} [opts={}] - { duration } required for start()-style items
   * @returns {this}
   */
  add(item, offset = '+=0', opts = {}) {
    if (this._destroyed) return this;
    this._entries.push({ item, offset, opts, state: 'pending' });
    if (this.options.autoplay && !this._playing) this.play();
    return this;
  }

  /**
   * Mark the completion point of the previously added entry.
   * @param {string} name
   * @returns {this}
   */
  label(name) {
    this._labels.set(name, this._entries.length - 1);
    return this;
  }

  /* ── Playback ────────────────────────────────────────────────────────── */

  /**
   * Start (or resume after pause()) from the given position.
   * @param {number} [fromMs=0] - Only used on fresh starts; see seek()
   * @returns {this}
   */
  play(fromMs = 0) {
    if (this._destroyed || this._playing) return this;
    this._playing = true;
    this._entries.forEach((e, i) => {
      if (e.state !== 'pending') return;
      this._scheduleEntry(i, fromMs);
    });
    return this;
  }

  /** Suspend pending starts (in-flight items run to completion). */
  pause() {
    this._playing = false;
    this._timers.clearAll();
    for (const e of this._entries) {
      if (e.state === 'scheduled') e.state = 'pending';
    }
  }

  /**
   * Jump the schedule: entries resolvable to a start < ms are skipped
   * (treated complete); the rest play with starts shifted by -ms.
   * @param {number} ms
   * @returns {this}
   */
  seek(ms) {
    this.stop();
    for (const e of this._entries) {
      if (typeof e.offset === 'number' && e.offset < ms) {
        e.state = 'done';
        this._completed++;
      }
    }
    this.play(ms);
    return this;
  }

  /** Cancel everything; entries reset to pending. Reusable. */
  stop() {
    this._playing = false;
    this._timers.clearAll();
    this._completed = 0;
    for (const e of this._entries) {
      if (e.item.stop) e.item.stop();
      e.state = 'pending';
    }
  }

  /** Stop and release references. Not reusable. */
  destroy() {
    if (this._destroyed) return;
    this.stop();
    this._timers.destroy();
    this._destroyed = true;
    this._entries = [];
    this._labels.clear();
  }

  /* ── Internals ───────────────────────────────────────────────────────── */

  _scheduleEntry(index, fromMs) {
    const entry = this._entries[index];

    if (typeof entry.offset === 'number') {
      const delay = Math.max(0, entry.offset - fromMs);
      entry.state = 'scheduled';
      this._timers.setTimeout(() => this._runEntry(index), delay);
      return;
    }

    if (typeof entry.offset === 'string' && /^[+-]=/.test(entry.offset)) {
      let extra = parseFloat(entry.offset.slice(2)) || 0;
      if (entry.offset.startsWith('-=')) {
        console.warn('[CorruptedTimeline] "-=" offsets need a known duration; treating as "+=0"');
        extra = 0;
      }
      this._chainAfter(index - 1, index, extra);
      return;
    }

    // Label offset: chain after the entry the label marks
    if (this._labels.has(entry.offset)) {
      this._chainAfter(this._labels.get(entry.offset), index, 0);
      return;
    }

    console.warn(`[CorruptedTimeline] Unknown offset "${entry.offset}"; treating as "+=0"`);
    this._chainAfter(index - 1, index, 0);
  }

  _chainAfter(prevIndex, index, extraMs) {
    const entry = this._entries[index];
    if (prevIndex < 0) {
      entry.state = 'scheduled';
      this._timers.setTimeout(() => this._runEntry(index), extraMs);
      return;
    }
    const prev = this._entries[prevIndex];
    if (prev.state === 'done') {
      entry.state = 'scheduled';
      this._timers.setTimeout(() => this._runEntry(index), extraMs);
    } else {
      // Wait for prev's completion callback to release this entry
      entry.state = 'scheduled';
      (prev.waiters ??= []).push({ index, extraMs });
    }
  }

  _runEntry(index) {
    if (this._destroyed || !this._playing) return;
    const entry = this._entries[index];
    entry.state = 'running';

    const complete = () => {
      if (this._destroyed || entry.state === 'pending' || entry.state === 'done') return;
      entry.state = 'done';
      this._completed++;
      for (const w of entry.waiters ?? []) {
        const waiter = this._entries[w.index];
        if (waiter.state === 'scheduled' && this._playing) {
          this._timers.setTimeout(() => this._runEntry(w.index), w.extraMs);
        }
      }
      entry.waiters = [];
      if (this._completed >= this._entries.length && this.options.onComplete) {
        this.options.onComplete();
      }
    };

    const { item, opts } = entry;
    if (typeof item.play === 'function') {
      // Two play() contracts coexist in the package:
      //   transitions/composites: play(options, callback)
      //   animation-blocks:       play() → Promise
      // Dispatch on arity; complete() is double-fire guarded either way.
      if (item.play.length >= 2) {
        item.play(opts.options ?? {}, complete);
      } else {
        const result = item.play(complete);
        if (result && typeof result.then === 'function') result.then(complete);
      }
    } else if (typeof item.start === 'function') {
      item.start();
      const duration = opts.duration ?? 0;
      if (!opts.duration) {
        console.warn('[CorruptedTimeline] start()-style item without opts.duration completes immediately');
      }
      this._timers.setTimeout(complete, duration);
    } else if (typeof item === 'function') {
      item();
      complete();
    }
  }
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { CorruptedTimeline };
}
