/**
 * Clipboard helper utilities.
 *
 * Replaces the 5-line copy-to-clipboard pattern repeated multiple times
 * across nikke-team-builder.html and other examples.
 *
 * All functions guard against missing DOM/navigator for Node import compat.
 *
 * @module core/clipboard-helpers
 */

/**
 * Copy text to clipboard and briefly swap a button's label to confirm success.
 *
 * @param {Element|null} buttonEl - Button element whose label to swap (required)
 * @param {string} text - Text to copy (required, non-empty)
 * @param {object} [options]
 * @param {string} [options.successLabel='COPIED'] - Label shown on the button after copy
 * @param {number} [options.durationMs=1200] - How long to show the success label (ms)
 * @returns {Promise<boolean>} True if copy succeeded, false otherwise
 */
export async function copyWithFeedback(buttonEl, text, options = {}) {
  if (!buttonEl || !text) return false;

  const { successLabel = 'COPIED', durationMs = 1200 } = options;

  if (typeof navigator === 'undefined' || !navigator.clipboard) {
    console.warn('[clipboard-helpers] copyWithFeedback: navigator.clipboard not available');
    return false;
  }

  try {
    await navigator.clipboard.writeText(text);
    const orig = buttonEl.textContent;
    buttonEl.textContent = successLabel;
    setTimeout(() => { buttonEl.textContent = orig; }, durationMs);
    return true;
  } catch (err) {
    console.error('[clipboard-helpers] copyWithFeedback failed:', err);
    return false;
  }
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { copyWithFeedback };
}
