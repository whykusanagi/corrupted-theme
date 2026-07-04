/**
 * Corruption easing + stagger presets.
 *
 * Named motion tokens for the corrupted-theme aesthetic, exported as JS
 * constants and mirrored as CSS custom properties in variables.css
 * (--ease-glitch-snap, --ease-decay, --ease-terminal-step). Design
 * reference: anime.js v4 easing/stagger API shapes (MIT) — reference only.
 *
 * @module core/corruption-easings
 * @version 0.3.0
 * @author whykusanagi
 * @license MIT
 *
 * @see src/css/variables.css — CSS custom-property mirrors
 * @see CORRUPTED_THEME_SPEC.md — Pattern 4 (stagger semantics)
 */

/** CSS easing strings for corruption motion. */
export const EASINGS = {
  /** Hard snap with overshoot — glitch pops, element arrivals. */
  glitchSnap: 'cubic-bezier(0.7, 0, 0.2, 1.4)',
  /** Bouncy settle — matches the theme's --transition-easing token. */
  decayEase: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
  /** Quantized terminal motion — cursor jumps, scan steps. */
  terminalStep: 'steps(8, end)',
};

/** Stagger delay generators (return delay in ms for element i). */
export const STAGGER = {
  /**
   * Pattern 4 ripple: delay proportional to grid distance from center.
   * @param {number} i - Element index (row-major)
   * @param {number} total - Total element count
   * @param {number} cols - Grid column count
   * @param {number} [wave=80] - ms per grid-unit of distance (clamped ≥40, spec floor)
   * @returns {number} Delay ms
   */
  rippleFromCenter(i, total, cols, wave = 80) {
    const w = Math.max(40, wave);
    const rows = Math.ceil(total / cols);
    const row = Math.floor(i / cols);
    const col = i % cols;
    const cr = (rows - 1) / 2;
    const cc = (cols - 1) / 2;
    return Math.round(Math.hypot(row - cr, col - cc) * w);
  },

  /**
   * Pattern 4 ripple from an arbitrary grid origin.
   * @param {number} i - Element index (row-major)
   * @param {number} cols - Grid column count
   * @param {number[]} origin - [row, col] origin
   * @param {number} [wave=80] - ms per grid-unit (clamped ≥40)
   * @returns {number} Delay ms
   */
  rippleFrom(i, cols, origin, wave = 80) {
    const w = Math.max(40, wave);
    const row = Math.floor(i / cols);
    const col = i % cols;
    return Math.round(Math.hypot(row - origin[0], col - origin[1]) * w);
  },
};

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { EASINGS, STAGGER };
}
