/**
 * Toast — singleton notification helper.
 *
 * Auto-mounts a DOM container on first use. Queue-safe stacking,
 * configurable duration. Pairs with src/css/toast.css.
 *
 * @example
 *   import { Toast } from '@whykusanagi/corrupted-theme/toast';
 *   Toast.show('Saved');
 *   Toast.success('OK', { duration: 3000 });
 *   Toast.error('Failed');
 *   Toast.info('Loading...');
 */

let _container = null;

function _ensureContainer() {
  if (typeof document === 'undefined') return null;
  if (_container && _container.isConnected) return _container;
  _container = document.createElement('div');
  _container.className = 'corrupted-toast-container';
  document.body.appendChild(_container);
  return _container;
}

function _emit(message, variant, options = {}) {
  const { duration = 2000 } = options;
  const container = _ensureContainer();
  if (!container) return null;

  const toast = document.createElement('div');
  toast.className = `corrupted-toast corrupted-toast--${variant}`;
  toast.textContent = message;
  container.appendChild(toast);

  // Force reflow for the enter animation
  if (typeof requestAnimationFrame !== 'undefined') {
    requestAnimationFrame(() => toast.classList.add('corrupted-toast--visible'));
  } else {
    toast.classList.add('corrupted-toast--visible');
  }

  setTimeout(() => {
    toast.classList.remove('corrupted-toast--visible');
    toast.addEventListener('transitionend', () => toast.remove(), { once: true });
    // Fallback removal in case transitionend doesn't fire
    setTimeout(() => { if (toast.isConnected) toast.remove(); }, 500);
  }, duration);

  return toast;
}

export const Toast = {
  show(message, options)    { return _emit(message, 'default', options); },
  success(message, options) { return _emit(message, 'success', options); },
  error(message, options)   { return _emit(message, 'error',   options); },
  info(message, options)    { return _emit(message, 'info',    options); },
};

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { Toast };
}
