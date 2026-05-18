/**
 * ClockWidget — cycling multi-timezone clock display.
 *
 * Renders a date + time + timezone label, rotating through a configurable
 * list of IANA timezone strings on a configurable interval.
 *
 * Ported from celeste-tts-bot/obs/break-overlay.html ClockDisplay class.
 * Key differences from source:
 *   - Uses IANA timezone names with Intl.DateTimeFormat (source used manual
 *     UTC offset objects). This is more correct across DST boundaries.
 *   - Accepts an arbitrary element rather than querying fixed selectors.
 *   - Delegates timer lifecycle to TimerRegistry.
 *   - Exposes start()/stop()/destroy() lifecycle API.
 *   - aria-live="polite" applied on start() for screen-reader updates.
 *   - Guard for document/window allows construction in Node (tests, SSR).
 *
 * @module lib/clock-widget
 *
 * @example
 *   const widget = new ClockWidget(document.getElementById('clock'), {
 *     timezones: ['America/New_York', 'America/Chicago', 'America/Denver', 'America/Los_Angeles'],
 *     cycleMs:   10000,
 *     format:    '12h',
 *     showDate:  true,
 *   });
 *   widget.start();
 */

import { formatTime24h, formatTime12h, formatDate } from '../core/time-utils.js';
import { TimerRegistry } from '../core/timer-registry.js';

export class ClockWidget {
  /**
   * @param {Element|null} element - Container element to render into (null is safe in Node)
   * @param {object}  [options]
   * @param {string[]} [options.timezones=['America/Los_Angeles']] - IANA timezone names
   * @param {number}   [options.cycleMs=10000] - ms between timezone rotations
   * @param {'12h'|'24h'} [options.format='12h'] - Time format
   * @param {boolean}  [options.showDate=true] - Whether to render the date line
   */
  constructor(element, options = {}) {
    this.element = element;
    this.options = {
      timezones: options.timezones ?? ['America/Los_Angeles'],
      cycleMs:   options.cycleMs   ?? 10000,
      format:    options.format    ?? '12h',
      showDate:  options.showDate  ?? true,
    };
    this._currentIndex = 0;
    this._timers = new TimerRegistry();
    this._destroyed = false;
  }

  /** Start ticking and (if multiple timezones) rotating. */
  start() {
    if (this._destroyed) return;

    // ARIA: polite live region so screen readers announce updates without
    // interrupting the user mid-sentence.
    if (this.element && typeof this.element.setAttribute === 'function') {
      this.element.setAttribute('aria-live', 'polite');
    }

    // Initial render before first interval tick
    this._render();

    // Update displayed time every second
    this._timers.setInterval(() => this._render(), 1000);

    // Rotate timezone only when there are multiple timezones to cycle through
    if (this.options.timezones.length > 1) {
      this._timers.setInterval(() => {
        this._currentIndex = (this._currentIndex + 1) % this.options.timezones.length;
        this._render();
      }, this.options.cycleMs);
    }
  }

  /** Pause all timers without destroying the instance. */
  stop() {
    this._timers.clearAll();
  }

  /** Stop timers, remove ARIA attribute, and mark instance as destroyed. */
  destroy() {
    if (this._destroyed) return;
    this._destroyed = true;
    this._timers.destroy();
    if (this.element && typeof this.element.removeAttribute === 'function') {
      this.element.removeAttribute('aria-live');
    }
  }

  // ── Private ────────────────────────────────────────────────────────────────

  _render() {
    if (this._destroyed || !this.element) return;
    // Guard: element.textContent check covers JSDOM + real DOM
    if (typeof this.element.textContent === 'undefined') return;

    const tz = this.options.timezones[this._currentIndex];
    const now = this._nowInTimezone(tz);

    // Build child nodes without innerHTML to avoid XSS vectors
    this.element.textContent = '';

    const timeEl = this._el('div', 'clock-widget__time');
    const fmt = this.options.format === '24h' ? formatTime24h : formatTime12h;
    timeEl.textContent = fmt(now);
    this.element.appendChild(timeEl);

    if (this.options.showDate) {
      const dateEl = this._el('div', 'clock-widget__date');
      dateEl.textContent = formatDate(now);
      this.element.appendChild(dateEl);
    }

    const tzEl = this._el('div', 'clock-widget__timezone');
    // Display the IANA name, stripping continent prefix for readability
    // e.g., "America/Los_Angeles" → "Los_Angeles"
    tzEl.textContent = tz.includes('/') ? tz.split('/').pop().replace(/_/g, ' ') : tz;
    this.element.appendChild(tzEl);
  }

  /**
   * Return a Date whose wall-clock fields reflect the given IANA timezone.
   *
   * We use Intl.DateTimeFormat to extract the TZ-local date components, then
   * reassemble them into a plain Date so that formatTime24h / formatTime12h
   * (which call toLocaleTimeString on the object) receive the correct hours.
   *
   * @param {string} tz - IANA timezone name
   * @returns {Date}
   */
  _nowInTimezone(tz) {
    const now = new Date();
    try {
      // Extract local parts via Intl
      const fmt = new Intl.DateTimeFormat('en-US', {
        timeZone: tz,
        year: 'numeric', month: '2-digit', day: '2-digit',
        hour: '2-digit', minute: '2-digit', second: '2-digit',
        hour12: false,
      });
      const parts = fmt.formatToParts(now);
      const p = {};
      for (const { type, value } of parts) p[type] = value;
      // Construct a synthetic Date using the TZ-local wall-clock values.
      // The result is in the local system timezone, but its h/m/s reflect `tz`.
      return new Date(
        `${p.year}-${p.month}-${p.day}T${p.hour === '24' ? '00' : p.hour}:${p.minute}:${p.second}`
      );
    } catch {
      // Unknown or unsupported timezone — fall back to system time
      return now;
    }
  }

  /** Create a DOM element with a class name. Guarded for non-DOM envs. */
  _el(tag, className) {
    if (typeof document === 'undefined') {
      // Minimal stub so _render() never throws in Node
      return { textContent: '', className: '' };
    }
    const el = document.createElement(tag);
    el.className = className;
    return el;
  }
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { ClockWidget };
}
