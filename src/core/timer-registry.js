/**
 * TimerRegistry - Centralized timer tracking for component lifecycle cleanup.
 *
 * Wraps setTimeout, setInterval, and requestAnimationFrame so that all
 * pending async work can be cancelled in a single clearAll() call.
 *
 * Merges the TimerManager API surface from celeste-tts-bot/obs/shared/timer-manager.js:
 * - destroyed flag: guards new timers after destroy(), suppresses callbacks
 * - getCount(): returns { timers, intervals, total } breakdown
 * - destroy(): calls clearAll() then sets destroyed = true
 *
 * Usage:
 *   const timers = new TimerRegistry();
 *   timers.setTimeout(() => { ... }, 1000);
 *   timers.setInterval(() => { ... }, 500);
 *   timers.requestAnimationFrame((ts) => { ... });
 *   timers.clearAll();  // cancels everything
 *   timers.destroy();   // clearAll + marks instance as destroyed
 *
 * @module core/timer-registry
 */

export class TimerRegistry {
  constructor() {
    this._timeouts = new Set();
    this._intervals = new Set();
    this._rafs = new Set();
    /** @type {boolean} Set to true after destroy() — prevents new timers from being created. */
    this.destroyed = false;
  }

  /**
   * Tracked setTimeout — auto-removes ID after callback fires.
   * No-ops and returns null if the instance has been destroyed.
   * @param {Function} fn
   * @param {number} delay
   * @returns {number|null} timeout ID, or null if destroyed
   */
  setTimeout(fn, delay) {
    if (this.destroyed) {
      console.warn('[TimerRegistry] Cannot create timer — instance is destroyed');
      return null;
    }
    const id = setTimeout(() => {
      this._timeouts.delete(id);
      if (!this.destroyed) fn();
    }, delay);
    this._timeouts.add(id);
    return id;
  }

  /**
   * Tracked setInterval.
   * No-ops and returns null if the instance has been destroyed.
   * @param {Function} fn
   * @param {number} delay
   * @returns {number|null} interval ID, or null if destroyed
   */
  setInterval(fn, delay) {
    if (this.destroyed) {
      console.warn('[TimerRegistry] Cannot create interval — instance is destroyed');
      return null;
    }
    const id = setInterval(() => {
      if (!this.destroyed) fn();
    }, delay);
    this._intervals.add(id);
    return id;
  }

  /**
   * Tracked requestAnimationFrame — auto-removes ID after callback fires.
   * No-ops and returns null if the instance has been destroyed.
   * @param {Function} fn
   * @returns {number|null} RAF ID, or null if destroyed
   */
  requestAnimationFrame(fn) {
    if (this.destroyed) {
      console.warn('[TimerRegistry] Cannot create RAF — instance is destroyed');
      return null;
    }
    const id = requestAnimationFrame((ts) => {
      this._rafs.delete(id);
      if (!this.destroyed) fn(ts);
    });
    this._rafs.add(id);
    return id;
  }

  clearTimeout(id) {
    clearTimeout(id);
    this._timeouts.delete(id);
  }

  clearInterval(id) {
    clearInterval(id);
    this._intervals.delete(id);
  }

  cancelAnimationFrame(id) {
    cancelAnimationFrame(id);
    this._rafs.delete(id);
  }

  /** Cancel ALL tracked timers. Call this in destroy(). */
  clearAll() {
    this._timeouts.forEach(id => clearTimeout(id));
    this._intervals.forEach(id => clearInterval(id));
    this._rafs.forEach(id => cancelAnimationFrame(id));
    this._timeouts.clear();
    this._intervals.clear();
    this._rafs.clear();
  }

  /**
   * Get breakdown of pending timer counts.
   * Mirrors TimerManager.getCount() for source compatibility.
   * @returns {{ timers: number, intervals: number, total: number }}
   */
  getCount() {
    return {
      timers: this._timeouts.size,
      intervals: this._intervals.size,
      total: this._timeouts.size + this._intervals.size
    };
  }

  /**
   * Destroy this instance: cancel all pending timers and mark as destroyed.
   * After calling destroy(), new timers will be silently rejected.
   */
  destroy() {
    this.clearAll();
    this.destroyed = true;
  }

  /** @returns {number} count of all pending timers (timeouts + intervals + RAFs) */
  get pendingCount() {
    return this._timeouts.size + this._intervals.size + this._rafs.size;
  }
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { TimerRegistry };
}
