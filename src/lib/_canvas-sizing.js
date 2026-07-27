/**
 * Private — shared HiDPI canvas sizing. Not exported from package.json.
 *
 * ## The feedback loop this exists to prevent
 *
 * A canvas with no author CSS size takes its LAYOUT size from its `width` and
 * `height` **attributes**. Writing the DPR-scaled backing size therefore
 * changes the layout box, which re-fires the ResizeObserver, which measures
 * the larger box and scales again. On a 2× display the canvas doubles; it only
 * appears to settle because the browser throttles runaway observer loops.
 *
 * The consumer sees a canvas twice the size they asked for and drawing that
 * lands in the wrong place, with no error. Blind documentation validation hit
 * this immediately with a plain `<canvas width="600" height="600">`, which is
 * exactly how someone writes their first one.
 *
 * The fix is to pin the CSS size the first time we size a canvas whose layout
 * is attribute-driven. That converts it to CSS-driven, so the backing store
 * and the layout box stop feeding each other. Canvases that already get their
 * size from CSS (`width: 100%`, a flex/grid cell) are left alone and stay
 * responsive.
 *
 * @module lib/_canvas-sizing
 * @version 0.3.2
 * @license MIT
 */

/**
 * Does this canvas take its layout size from the width/height attributes?
 *
 * Probed once by nudging the attribute and re-measuring. Two forced reflows at
 * init is a fair price for not shipping a silent sizing bug.
 *
 * @param {HTMLCanvasElement} canvas
 * @returns {boolean}
 */
function attributeDrivesLayout(canvas) {
  const before = canvas.getBoundingClientRect().width;
  if (before === 0) return false;
  const original = canvas.width;
  canvas.width = original + 17;                  // odd nudge: no chance of a coincidental match
  const after = canvas.getBoundingClientRect().width;
  canvas.width = original;
  return after !== before;
}

/**
 * Size a canvas backing store for the current device pixel ratio.
 *
 * @param {HTMLCanvasElement} canvas
 * @param {CanvasRenderingContext2D} ctx
 * @param {{maxDpr?: number, state?: object}} [opts]
 * @returns {{w: number, h: number, dpr: number}|null} CSS-pixel size, or null
 *   when the canvas is not laid out yet (zero-sized) and nothing was changed.
 */
export function fitCanvas(canvas, ctx, opts = {}) {
  if (!canvas || !ctx) return null;
  const maxDpr = opts.maxDpr ?? 2;
  const state = opts.state ?? canvas;

  const rect = canvas.getBoundingClientRect();
  if (rect.width === 0 || rect.height === 0) return null;

  // Probe once per canvas, then pin so the attribute stops driving layout.
  if (state.__ctSizingProbed === undefined) {
    state.__ctSizingProbed = attributeDrivesLayout(canvas);
    if (state.__ctSizingProbed) {
      canvas.style.width = `${rect.width}px`;
      canvas.style.height = `${rect.height}px`;
    }
  }

  const dpr = Math.min(window.devicePixelRatio || 1, maxDpr);
  const w = Math.round(rect.width * dpr);
  const h = Math.round(rect.height * dpr);
  if (canvas.width !== w) canvas.width = w;
  if (canvas.height !== h) canvas.height = h;
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

  return { w: rect.width, h: rect.height, dpr };
}
