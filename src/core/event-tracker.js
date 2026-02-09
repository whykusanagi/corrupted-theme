/**
 * EventTracker - Tracks addEventListener calls for bulk removal.
 *
 * Stores references to all attached listeners so they can be removed
 * in a single removeAll() call during component destroy().
 *
 * Usage:
 *   const events = new EventTracker();
 *   events.add(button, 'click', handler);
 *   events.add(window, 'resize', onResize, { passive: true });
 *   events.removeAll();  // removes everything
 *
 * @module core/event-tracker
 */

export class EventTracker {
  constructor() {
    /** @type {Array<{target: EventTarget, event: string, handler: Function, options: any}>} */
    this._listeners = [];
  }

  /**
   * Attach an event listener and track it for later removal.
   * @param {EventTarget} target - DOM element, window, or document
   * @param {string} event - Event name (e.g. 'click', 'keydown')
   * @param {Function} handler - Event handler function
   * @param {Object|boolean} [options] - addEventListener options
   */
  add(target, event, handler, options) {
    target.addEventListener(event, handler, options);
    this._listeners.push({ target, event, handler, options });
  }

  /** Remove all tracked listeners. Call this in destroy(). */
  removeAll() {
    for (const { target, event, handler, options } of this._listeners) {
      target.removeEventListener(event, handler, options);
    }
    this._listeners = [];
  }

  /** @returns {number} count of tracked listeners */
  get count() {
    return this._listeners.length;
  }
}
