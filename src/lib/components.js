/**
 * Component Helpers
 * JavaScript utilities for interactive Bootstrap-equivalent components
 *
 * Provides helper functions for:
 * - Accordion/Collapse
 * - Modal
 * - Dropdown
 * - Tabs
 * - Toast Notifications
 * - Auto-initialization via data-ct-* attributes
 *
 * @module components
 * @version 2.0.0
 */

import { EventTracker } from '../core/event-tracker.js';

// ========== ACCORDION / COLLAPSE ==========

/**
 * Initialize all accordions on the page
 * Auto-called on DOMContentLoaded
 */
export function initAccordions() {
  document.querySelectorAll('.accordion').forEach(accordion => {
    // Skip if already initialized
    if (accordion.dataset.accordionInitialized === 'true') {
      return;
    }

    accordion.querySelectorAll('.accordion-item').forEach(item => {
      const header = item.querySelector('.accordion-header');
      if (!header) return;

      header.addEventListener('click', () => {
        const wasActive = item.classList.contains('active');

        // Close all items in this accordion (unless it's already active)
        accordion.querySelectorAll('.accordion-item').forEach(otherItem => {
          if (otherItem !== item) {
            otherItem.classList.remove('active');
          }
        });

        // Toggle this item
        if (wasActive) {
          item.classList.remove('active');
        } else {
          item.classList.add('active');
        }
      });
    });

    accordion.dataset.accordionInitialized = 'true';
  });
}

/**
 * Toggle a collapse element
 * @param {HTMLElement|string} element - Element or selector
 */
export function toggleCollapse(element) {
  const el = typeof element === 'string' ? document.querySelector(element) : element;
  if (!el) return;

  el.classList.toggle('show');
}

/**
 * Show a collapse element
 * @param {HTMLElement|string} element - Element or selector
 */
export function showCollapse(element) {
  const el = typeof element === 'string' ? document.querySelector(element) : element;
  if (!el) return;

  el.classList.add('show');
}

/**
 * Hide a collapse element
 * @param {HTMLElement|string} element - Element or selector
 */
export function hideCollapse(element) {
  const el = typeof element === 'string' ? document.querySelector(element) : element;
  if (!el) return;

  el.classList.remove('show');
}

// ========== TOAST NOTIFICATIONS ==========

/**
 * Toast notification system
 */
class ToastManager {
  constructor() {
    this.container = null;
    this.toasts = [];
  }

  /**
   * Ensure toast container exists
   */
  ensureContainer() {
    if (!this.container || !document.contains(this.container)) {
      this.container = document.querySelector('.toast-container');

      if (!this.container) {
        this.container = document.createElement('div');
        this.container.className = 'toast-container';
        document.body.appendChild(this.container);
      }
    }

    return this.container;
  }

  /**
   * Show a toast notification
   * @param {Object} options - Toast configuration
   * @param {string} options.title - Toast title
   * @param {string} options.message - Toast message
   * @param {string} [options.type='info'] - Toast type (success, warning, error, info)
   * @param {number} [options.duration=5000] - Auto-dismiss duration (0 = no auto-dismiss)
   * @param {Function} [options.onClose] - Callback when toast is closed
   * @returns {HTMLElement} Toast element
   */
  show(options) {
    const {
      title = '',
      message = '',
      type = 'info',
      duration = 5000,
      onClose = null
    } = options;

    const container = this.ensureContainer();

    // Create toast element
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;

    // Create toast content using safe DOM methods
    if (title) {
      const header = document.createElement('div');
      header.className = 'toast-header';
      const titleSpan = document.createElement('span');
      titleSpan.textContent = title;
      header.appendChild(titleSpan);
      toast.appendChild(header);
    }

    const body = document.createElement('div');
    body.className = 'toast-body';
    body.textContent = message;
    toast.appendChild(body);

    const closeBtn = document.createElement('button');
    closeBtn.className = 'toast-close';
    closeBtn.setAttribute('aria-label', 'Close');
    closeBtn.textContent = '\u00d7';
    closeBtn.addEventListener('click', () => {
      this.dismiss(toast, onClose);
    });
    toast.appendChild(closeBtn);

    // Add to container
    container.appendChild(toast);
    this.toasts.push(toast);

    // Auto-dismiss (tracked for cleanup on manual dismiss)
    if (duration > 0) {
      toast._autoDismissId = setTimeout(() => {
        toast._autoDismissId = null;
        this.dismiss(toast, onClose);
      }, duration);
    }

    return toast;
  }

  /**
   * Dismiss a toast
   * @param {HTMLElement} toast - Toast element to dismiss
   * @param {Function} [onClose] - Callback when toast is closed
   */
  dismiss(toast, onClose = null) {
    if (!toast || !document.contains(toast)) return;

    // Clear auto-dismiss timer if dismissing early
    if (toast._autoDismissId) {
      clearTimeout(toast._autoDismissId);
      toast._autoDismissId = null;
    }

    toast.classList.add('hiding');

    setTimeout(() => {
      if (toast.parentNode) {
        toast.parentNode.removeChild(toast);
      }

      // Remove from tracking array
      const index = this.toasts.indexOf(toast);
      if (index > -1) {
        this.toasts.splice(index, 1);
      }

      if (onClose) {
        onClose();
      }
    }, 300); // Match animation duration
  }

  /**
   * Dismiss all toasts
   */
  dismissAll() {
    [...this.toasts].forEach(toast => this.dismiss(toast));
  }

  /**
   * Tear down the toast system: dismiss all toasts and remove container.
   */
  destroy() {
    this.dismissAll();
    if (this.container && this.container.parentNode) {
      this.container.parentNode.removeChild(this.container);
    }
    this.container = null;
    this.toasts = [];
  }

  // Convenience methods for different toast types

  success(message, title = 'Success', duration = 5000) {
    return this.show({ message, title, type: 'success', duration });
  }

  warning(message, title = 'Warning', duration = 5000) {
    return this.show({ message, title, type: 'warning', duration });
  }

  error(message, title = 'Error', duration = 7000) {
    return this.show({ message, title, type: 'error', duration });
  }

  info(message, title = '', duration = 5000) {
    return this.show({ message, title, type: 'info', duration });
  }
}

// Create global toast instance
const toastManager = new ToastManager();

/**
 * Show a toast notification
 * @param {Object} options - Toast configuration
 * @returns {HTMLElement} Toast element
 */
export function showToast(options) {
  return toastManager.show(options);
}

/**
 * Toast convenience methods
 */
export const toast = {
  success: (message, title, duration) => toastManager.success(message, title, duration),
  warning: (message, title, duration) => toastManager.warning(message, title, duration),
  error: (message, title, duration) => toastManager.error(message, title, duration),
  info: (message, title, duration) => toastManager.info(message, title, duration),
  dismiss: (toastEl, callback) => toastManager.dismiss(toastEl, callback),
  dismissAll: () => toastManager.dismissAll()
};

// ========== MODAL ==========

/**
 * Modal manager with lifecycle management
 *
 * Usage:
 * ```html
 * <button data-ct-toggle="modal" data-ct-target="#my-modal">Open</button>
 * <div class="modal-overlay" id="my-modal">
 *   <div class="modal">
 *     <div class="modal-header">
 *       <h3 class="modal-title">Title</h3>
 *       <button class="modal-close">&times;</button>
 *     </div>
 *     <div class="modal-body">Content</div>
 *   </div>
 * </div>
 * ```
 */
class ModalManager {
  constructor() {
    this._events = new EventTracker();
    this._initialized = new Set();
  }

  /**
   * Initialize a modal overlay
   * @param {string|HTMLElement} selector - Modal overlay selector or element
   */
  init(selector) {
    const overlay = typeof selector === 'string'
      ? document.querySelector(selector) : selector;
    if (!overlay || this._initialized.has(overlay)) return;

    const closeBtn = overlay.querySelector('.modal-close');
    if (closeBtn) {
      this._events.add(closeBtn, 'click', () => this.close(overlay));
    }

    // Close on overlay click (outside modal content)
    this._events.add(overlay, 'click', (e) => {
      if (e.target === overlay) this.close(overlay);
    });

    this._initialized.add(overlay);
  }

  /**
   * Open a modal
   * @param {string|HTMLElement} selector - Modal overlay selector or element
   */
  open(selector) {
    const overlay = typeof selector === 'string'
      ? document.querySelector(selector) : selector;
    if (!overlay) return;

    overlay.classList.add('active');
    document.body.style.overflow = 'hidden';

    overlay.dispatchEvent(new CustomEvent('modal:open', { bubbles: true }));
  }

  /**
   * Close a modal
   * @param {string|HTMLElement} selector - Modal overlay selector or element
   */
  close(selector) {
    const overlay = typeof selector === 'string'
      ? document.querySelector(selector) : selector;
    if (!overlay) return;

    overlay.classList.remove('active');
    document.body.style.overflow = '';

    overlay.dispatchEvent(new CustomEvent('modal:close', { bubbles: true }));
  }

  /**
   * Tear down all tracked listeners and state
   */
  destroy() {
    this._events.removeAll();
    this._initialized.clear();
  }
}

const modalManager = new ModalManager();

/**
 * Open a modal by selector
 * @param {string|HTMLElement} selector
 */
export function openModal(selector) {
  modalManager.open(selector);
}

/**
 * Close a modal by selector
 * @param {string|HTMLElement} selector
 */
export function closeModal(selector) {
  modalManager.close(selector);
}

// ========== DROPDOWN ==========

/**
 * Dropdown manager with click-outside-to-close
 *
 * Usage:
 * ```html
 * <div class="dropdown">
 *   <button class="dropdown-toggle" data-ct-toggle="dropdown">Menu</button>
 *   <div class="dropdown-menu">
 *     <a class="dropdown-item" href="#">Item 1</a>
 *   </div>
 * </div>
 * ```
 */
class DropdownManager {
  constructor() {
    this._events = new EventTracker();
    this._initialized = false;
    this._outsideClickBound = false;
  }

  /**
   * Initialize dropdown toggle behavior
   * @param {HTMLElement} toggle - The dropdown-toggle element
   */
  init(toggle) {
    const menu = toggle.parentElement?.querySelector('.dropdown-menu');
    if (!menu) return;

    this._events.add(toggle, 'click', (e) => {
      e.stopPropagation();
      const isOpen = menu.classList.contains('active');

      // Close all other dropdowns first
      this.closeAll();

      if (!isOpen) {
        menu.classList.add('active');
        toggle.classList.add('active');
      }
    });

    // Setup global click-outside handler once
    if (!this._outsideClickBound) {
      this._events.add(document, 'click', () => this.closeAll());
      this._outsideClickBound = true;
    }
  }

  /**
   * Close all open dropdowns
   */
  closeAll() {
    document.querySelectorAll('.dropdown-menu.active').forEach(menu => {
      menu.classList.remove('active');
    });
    document.querySelectorAll('.dropdown-toggle.active').forEach(toggle => {
      toggle.classList.remove('active');
    });
  }

  /**
   * Tear down all tracked listeners
   */
  destroy() {
    this.closeAll();
    this._events.removeAll();
    this._outsideClickBound = false;
  }
}

const dropdownManager = new DropdownManager();

// ========== TABS ==========

/**
 * Tab manager
 *
 * Usage:
 * ```html
 * <div class="tabs">
 *   <button class="tab active" data-ct-target="#panel-1">Tab 1</button>
 *   <button class="tab" data-ct-target="#panel-2">Tab 2</button>
 * </div>
 * <div class="tab-content active" id="panel-1">Panel 1</div>
 * <div class="tab-content" id="panel-2">Panel 2</div>
 * ```
 */
class TabManager {
  constructor() {
    this._events = new EventTracker();
  }

  /**
   * Initialize a tab container
   * @param {HTMLElement} tabsContainer - The .tabs element
   */
  init(tabsContainer) {
    const tabs = tabsContainer.querySelectorAll('.tab[data-ct-target]');

    tabs.forEach(tab => {
      this._events.add(tab, 'click', () => {
        // Deactivate all sibling tabs
        tabsContainer.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));

        // Hide all associated panels
        tabs.forEach(t => {
          const panel = document.querySelector(t.dataset.ctTarget);
          if (panel) panel.classList.remove('active');
        });

        // Activate clicked tab and its panel
        tab.classList.add('active');
        const panel = document.querySelector(tab.dataset.ctTarget);
        if (panel) panel.classList.add('active');
      });
    });
  }

  /**
   * Tear down all tracked listeners
   */
  destroy() {
    this._events.removeAll();
  }
}

const tabManager = new TabManager();

// ========== AUTO-INITIALIZATION ==========

/** @private Global Escape key handler for modals */
let _escapeHandlerBound = false;

/**
 * Initialize all components on page load.
 * Scans for data-ct-* attributes and wires up behavior.
 */
function initComponents() {
  // Accordions
  if (document.querySelector('.accordion')) {
    initAccordions();
  }

  // Modals — init overlays and wire triggers
  document.querySelectorAll('.modal-overlay').forEach(overlay => {
    modalManager.init(overlay);
  });

  document.querySelectorAll('[data-ct-toggle="modal"]').forEach(trigger => {
    const targetSel = trigger.dataset.ctTarget;
    if (!targetSel) return;
    trigger.addEventListener('click', () => modalManager.open(targetSel));
  });

  // Escape key closes active modals
  if (!_escapeHandlerBound && document.querySelector('.modal-overlay')) {
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        document.querySelectorAll('.modal-overlay.active').forEach(overlay => {
          modalManager.close(overlay);
        });
      }
    });
    _escapeHandlerBound = true;
  }

  // Dropdowns
  document.querySelectorAll('[data-ct-toggle="dropdown"]').forEach(toggle => {
    dropdownManager.init(toggle);
  });

  // Tabs
  document.querySelectorAll('.tabs').forEach(tabsContainer => {
    if (tabsContainer.querySelector('.tab[data-ct-target]')) {
      tabManager.init(tabsContainer);
    }
  });

  // Collapse triggers
  document.querySelectorAll('[data-ct-toggle="collapse"]').forEach(trigger => {
    const targetSel = trigger.dataset.ctTarget;
    if (!targetSel) return;
    trigger.addEventListener('click', () => toggleCollapse(targetSel));
  });
}

/**
 * Destroy all component managers and clean up listeners
 */
export function destroyComponents() {
  modalManager.destroy();
  dropdownManager.destroy();
  tabManager.destroy();
  toastManager.destroy();
}

// Auto-initialize on DOM ready
if (typeof window !== 'undefined') {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initComponents);
  } else {
    initComponents();
  }
}

// ========== EXPORTS ==========

export default {
  // Accordion / Collapse
  initAccordions,
  toggleCollapse,
  showCollapse,
  hideCollapse,

  // Modal
  openModal,
  closeModal,

  // Toast
  showToast,
  toast,

  // Lifecycle
  destroyComponents
};
