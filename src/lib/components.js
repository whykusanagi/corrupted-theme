/**
 * Component Helpers
 * JavaScript utilities for interactive Bootstrap-equivalent components
 *
 * Provides helper functions for:
 * - Accordion/Collapse
 * - Toast Notifications
 * - Auto-initialization
 *
 * @module components
 * @version 1.0.0
 */

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

// ========== AUTO-INITIALIZATION ==========

/**
 * Initialize all components on page load
 */
function initComponents() {
  // Initialize accordions
  if (document.querySelector('.accordion')) {
    initAccordions();
  }
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
  // Accordion
  initAccordions,
  toggleCollapse,
  showCollapse,
  hideCollapse,

  // Toast
  showToast,
  toast
};
