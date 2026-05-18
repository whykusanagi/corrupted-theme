/**
 * EventBar — horizontal status row with label + content + optional icon.
 *
 * Renders a list of event rows (e.g., "Latest Follow: @user1") into a
 * container element. Supports live updates via update(). Designed for
 * stream overlays, dashboards, or any "recent event" display.
 *
 * Ported from celeste-tts-bot/obs/break-overlay.html `.event-bar` markup.
 * Key additions vs. source HTML:
 *   - Class-based API with update() and destroy()
 *   - Optional icon span per row
 *   - Node-safe (no DOM access at construction time when element is null)
 *
 * @module lib/event-bar
 *
 * @example
 *   new EventBar(document.getElementById('events'), {
 *     items: [
 *       { label: 'Latest Follow', content: '@user1', icon: '★' },
 *       { label: 'Latest Sub',    content: '@user2', icon: '♥' },
 *       { label: 'Latest Tip',    content: '$5.00'             },
 *     ]
 *   });
 */

export class EventBar {
  /**
   * @param {Element|null} element - Container element (null is safe in Node)
   * @param {object}  [options]
   * @param {Array<{label: string, content: string, icon?: string}>} [options.items=[]]
   */
  constructor(element, options = {}) {
    this.element = element;
    this.options = {
      items: options.items ?? [],
    };
    this._destroyed = false;

    if (typeof document === 'undefined' || !element) return;
    this._render();
  }

  /**
   * Replace the displayed items with a new list.
   * No-op after destroy().
   *
   * @param {Array<{label: string, content: string, icon?: string}>|null} items
   */
  update(items) {
    if (this._destroyed) return;
    this.options.items = items ?? [];
    if (typeof document === 'undefined' || !this.element) return;
    this._render();
  }

  /** Remove all rendered content and mark instance as destroyed. */
  destroy() {
    if (this._destroyed) return;
    this._destroyed = true;
    if (this.element) {
      this.element.textContent = '';
      this.element.classList.remove('event-bar');
    }
  }

  // ── Private ────────────────────────────────────────────────────────────────

  _render() {
    if (this._destroyed || !this.element) return;

    this.element.textContent = '';
    this.element.classList.add('event-bar');

    for (const item of this.options.items) {
      const row = document.createElement('div');
      row.className = 'event-bar__row';

      if (item.icon) {
        const iconEl = document.createElement('span');
        iconEl.className = 'event-bar__icon';
        iconEl.textContent = item.icon;
        row.appendChild(iconEl);
      }

      const labelEl = document.createElement('span');
      labelEl.className = 'event-bar__label';
      labelEl.textContent = item.label;
      row.appendChild(labelEl);

      const contentEl = document.createElement('span');
      contentEl.className = 'event-bar__content';
      contentEl.textContent = item.content;
      row.appendChild(contentEl);

      this.element.appendChild(row);
    }
  }
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { EventBar };
}
