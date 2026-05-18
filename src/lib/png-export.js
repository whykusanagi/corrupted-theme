/**
 * Export a DOM element to a PNG file.
 *
 * Requires `html2canvas` as an optional peer dependency:
 *   npm install html2canvas
 *
 * @example
 *   const { exportElementAsPng } = await import('@whykusanagi/corrupted-theme/png-export');
 *   await exportElementAsPng(document.getElementById('card'), {
 *     filename: 'my-card.png',
 *     scale: 2,
 *     backgroundColor: '#000000'
 *   });
 *
 * @param {HTMLElement} el - The element to export
 * @param {object} [options]
 * @param {string} [options.filename='export.png'] - Download filename
 * @param {number} [options.scale=2] - Render scale (1 = 1:1, 2 = retina)
 * @param {string|null} [options.backgroundColor=null] - Optional background fill (transparent if null)
 * @returns {Promise<void>}
 */
export async function exportElementAsPng(el, options = {}) {
  const { filename = 'export.png', scale = 2, backgroundColor = null } = options;

  if (!el) {
    throw new Error('exportElementAsPng: element is required');
  }
  if (typeof document === 'undefined') {
    throw new Error('exportElementAsPng: requires a browser environment');
  }

  let html2canvas;
  try {
    html2canvas = (await import('html2canvas')).default ?? (await import('html2canvas'));
  } catch (err) {
    throw new Error(
      "png-export requires 'html2canvas' as a peer dependency. " +
      "Install with: npm install html2canvas"
    );
  }

  // Wait for fonts to load (so screenshots match what user sees)
  if (document.fonts?.ready) await document.fonts.ready;

  const canvas = await html2canvas(el, { scale, backgroundColor });
  const url = canvas.toDataURL('image/png');
  const link = document.createElement('a');
  link.download = filename;
  link.href = url;
  document.body.appendChild(link);  // Firefox requires this
  link.click();
  link.remove();
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { exportElementAsPng };
}
