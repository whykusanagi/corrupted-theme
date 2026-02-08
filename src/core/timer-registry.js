/**
 * TimerRegistry - Centralized timer tracking for component lifecycle cleanup.
 *
 * Wraps setTimeout, setInterval, and requestAnimationFrame so that all
 * pending async work can be cancelled in a single clearAll() call.
 *
 * Usage:
 *   const timers = new TimerRegistry();
 *   timers.setTimeout(() => { ... }, 1000);
 *   timers.setInterval(() => { ... }, 500);
 *   timers.requestAnimationFrame((ts) => { ... });
 *   timers.clearAll();  // cancels everything
 *
 * @module core/timer-registry
 */

export class TimerRegistry {
  constructor() {
    this._timeouts = new Set();
    this._intervals = new Set();
    this._rafs = new Set();
  }

  /**
   * Tracked setTimeout — auto-removes ID after callback fires.
   * @param {Function} fn
   * @param {number} delay
   * @returns {number} timeout ID
   */
  setTimeout(fn, delay) {
    const id = setTimeout(() => {
      this._timeouts.delete(id);
      fn();
    }, delay);
    this._timeouts.add(id);
    return id;
  }

  /**
   * Tracked setInterval.
   * @param {Function} fn
   * @param {number} delay
   * @returns {number} interval ID
   */
  setInterval(fn, delay) {
    const id = setInterval(fn, delay);
    this._intervals.add(id);
    return id;
  }

  /**
   * Tracked requestAnimationFrame — auto-removes ID after callback fires.
   * @param {Function} fn
   * @returns {number} RAF ID
   */
  requestAnimationFrame(fn) {
    const id = requestAnimationFrame((ts) => {
      this._rafs.delete(id);
      fn(ts);
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

  /** @returns {number} count of pending timers */
  get pendingCount() {
    return this._timeouts.size + this._intervals.size + this._rafs.size;
  }
}
