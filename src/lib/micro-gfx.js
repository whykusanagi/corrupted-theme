/**
 * MicroGfx — seeded generative instrument graphics.
 *
 * Composes instrument-panel primitives (barcodes, gauge stacks, histograms,
 * coordinate readouts, dimension marks) into a framed poster, card or banner,
 * then degrades the surface with warp, erode and grain. Implements
 * CORRUPTED_THEME_SPEC.md Pattern 5: Static Material Degradation.
 *
 * Same seed → byte-identical artwork. A poster you cannot regenerate is not a
 * design system output, so `seed` is returned even when you don't supply one.
 *
 * ## Safety
 *
 * The SVG is built as a DOM tree — `createElementNS` for elements,
 * `textContent` for every caller-supplied string. No markup is ever
 * concatenated, so caller text cannot become elements or event handlers.
 * `mount()` appends that tree directly.
 *
 * The `svg` string is a *serialisation output*, for writing to a file or
 * handing to `toPNG()`. Do not assign it to `innerHTML` — round-tripping
 * through an HTML parser gives back the injection surface this design avoids.
 *
 * No external references are emitted (no `<image href>`), so the canvas in
 * `toPNG()` never taints and `toBlob` cannot throw SecurityError.
 *
 * @example
 *   import { MicroGfx } from '@whykusanagi/corrupted-theme/micro-gfx';
 *   const art = MicroGfx.generate({ seed: 1234, format: 'poster' });
 *   MicroGfx.mount(document.querySelector('#stage'), art);
 *   const blob = await MicroGfx.toPNG(art, { scale: 2 });
 *
 * @module lib/micro-gfx
 * @version 0.3.2
 * @author whykusanagi
 * @license MIT
 *
 * @composes CorruptedMandala — the other seeded static composition; the
 *   mandala is symbolic where MicroGfx is instrumental
 */

import { CorruptionCharsets } from '../core/corruption-charsets.js';
import { seededRandom } from '../core/random-utils.js';

const NS = 'http://www.w3.org/2000/svg';

/** Aspect presets. Pass `{ w, h }` for anything else. */
const FORMATS = {
  card:     { w: 1200, h: 630 },
  banner:   { w: 1500, h: 500 },
  poster:   { w: 1080, h: 1350 },
  portrait: { w: 1080, h: 1920 },
  square:   { w: 1080, h: 1080 },
};

/**
 * Themes are built from the theme colours — magenta, violet, white. Cyan and
 * red are accents, used for a single highlight, never for the body of a
 * composition. See CORRUPTED_THEME_SPEC.md "Color Palette".
 */
const THEMES = {
  magenta: { bg: '#0a0a0a', ink: '#ffffff', structure: '#8b5cf6', accent: '#ff00ff', highlight: '#00ffff' },
  violet:  { bg: '#0a0a0a', ink: '#ffffff', structure: '#ff00ff', accent: '#8b5cf6', highlight: '#00ffff' },
  mono:    { bg: '#0a0a0a', ink: '#ffffff', structure: '#8b5cf6', accent: '#d94f90', highlight: '#00ffff' },
  void:    { bg: '#000000', ink: '#d94f90', structure: '#8b5cf6', accent: '#ff00ff', highlight: '#ff0000' },
};

const PRIMITIVES = ['barcode', 'dotMatrix', 'gaugeStack', 'histogram', 'coordReadout', 'dimension'];

const MONO = "'Courier New', Courier, monospace";

/** Create an SVG element. Text is set via textContent — never parsed as markup. */
function el(name, attrs = {}, parent = null, text = null) {
  const n = document.createElementNS(NS, name);
  for (const k in attrs) n.setAttribute(k, String(attrs[k]));
  if (text != null) n.textContent = String(text);
  if (parent) parent.appendChild(n);
  return n;
}

const clamp01 = v => Math.min(1, Math.max(0, Number.isFinite(v) ? v : 0));
const pick = (rng, arr) => arr[Math.floor(rng() * arr.length)];

export const MicroGfx = {
  formats: FORMATS,
  themes: Object.keys(THEMES),
  primitives: PRIMITIVES,

  /**
   * Build one artwork.
   *
   * @param {object} [options={}]
   * @param {number|null} [options.seed=null] - null picks one; the seed used is returned
   * @param {'card'|'banner'|'poster'|'portrait'|'square'|{w:number,h:number}} [options.format='card']
   * @param {'magenta'|'violet'|'mono'|'void'|object} [options.theme='magenta']
   * @param {object}  [options.layers] - base, halftone, rails, scanlines, glyphs
   * @param {string[]} [options.primitives] - which instrument primitives to place
   * @param {number}  [options.density=0.5] - 0..1, how much of the frame primitives fill
   * @param {{warp:number,erode:number,grain:number}} [options.degrade] - Pattern 5 knobs, each 0..1
   * @param {{title:string,eyebrow:string,serial:string,nameplate:string}} [options.text]
   * @param {boolean} [options.nsfw=false] - allow NSFW phrases in the glyph layer
   * @returns {{svg:string, node:SVGSVGElement, seed:number, width:number, height:number}}
   */
  generate(options = {}) {
    if (typeof document === 'undefined') {
      throw new Error('MicroGfx.generate requires a DOM; it builds SVG nodes rather than concatenating markup');
    }

    const seed = Number.isFinite(options.seed)
      ? options.seed >>> 0
      : Math.floor(Math.random() * 0xffffffff) >>> 0;
    const rng = seededRandom(seed);

    const fmt = typeof options.format === 'object' && options.format
      ? { w: Math.max(1, options.format.w | 0), h: Math.max(1, options.format.h | 0) }
      : (FORMATS[options.format] || FORMATS.card);

    const theme = typeof options.theme === 'object' && options.theme
      ? { ...THEMES.magenta, ...options.theme }
      : (THEMES[options.theme] || THEMES.magenta);

    const layers = {
      base: 'grid', halftone: true, rails: true, scanlines: true, glyphs: true,
      ...(options.layers || {}),
    };
    const d = options.degrade || {};
    const degrade = {
      warp:  clamp01(d.warp ?? 0.2),
      erode: clamp01(d.erode ?? 0),
      grain: clamp01(d.grain ?? 0.06),
    };
    const density = clamp01(options.density ?? 0.5);
    const chosen = Array.isArray(options.primitives) ? options.primitives : PRIMITIVES;
    const text = options.text || {};

    const svg = el('svg', {
      xmlns: NS,
      viewBox: `0 0 ${fmt.w} ${fmt.h}`,
      width: fmt.w,
      height: fmt.h,
      'shape-rendering': 'geometricPrecision',
    });

    defs(svg, seed, degrade);
    el('rect', { x: 0, y: 0, width: fmt.w, height: fmt.h, fill: theme.bg }, svg);

    // Everything below the grain sits inside the warp group, so degradation
    // bends the composition rather than being painted over the top of it.
    const ink = el('g', degrade.warp > 0 ? { filter: 'url(#mgfx-warp)' } : {}, svg);
    const g = degrade.erode > 0 ? el('g', { filter: 'url(#mgfx-erode)' }, ink) : ink;

    const ctx = { rng, w: fmt.w, h: fmt.h, theme, density };
    if (layers.base && layers.base !== 'flat') drawBase(g, ctx, layers.base);
    if (layers.halftone) drawHalftone(g, ctx);
    if (layers.glyphs) drawGlyphs(g, ctx, options.nsfw === true);
    drawPrimitives(g, ctx, chosen);
    if (layers.rails) drawRails(g, ctx);
    drawText(g, ctx, text);
    if (layers.scanlines) drawScanlines(g, ctx);
    if (degrade.grain > 0) {
      el('rect', {
        x: 0, y: 0, width: fmt.w, height: fmt.h,
        filter: 'url(#mgfx-grain)', opacity: degrade.grain, 'pointer-events': 'none',
      }, svg);
    }

    return {
      node: svg,
      get svg() { return new XMLSerializer().serializeToString(svg); },
      seed,
      width: fmt.w,
      height: fmt.h,
    };
  },

  /**
   * Append the artwork to an element, replacing anything already there.
   * This is the only supported DOM path — it appends nodes, never markup.
   * @param {Element} element
   * @param {{node:SVGSVGElement}} result - from generate()
   */
  mount(element, result) {
    if (!element || !result || !result.node) return null;
    element.replaceChildren(result.node);
    return result.node;
  },

  /**
   * Rasterise to PNG.
   *
   * Serialises to a data URI and loads it through an `<img>`, which is a
   * non-interactive context: scripts and external references are inert there.
   * Combined with emitting no external refs, the canvas never taints, so
   * `toBlob` cannot throw SecurityError.
   *
   * @param {{node:SVGSVGElement,width:number,height:number}} result
   * @param {{scale?:number}} [opts={}]
   * @returns {Promise<Blob>}
   */
  toPNG(result, opts = {}) {
    const scale = Number.isFinite(opts.scale) && opts.scale > 0 ? opts.scale : 1;
    const w = Math.round(result.width * scale);
    const h = Math.round(result.height * scale);
    return new Promise((resolve, reject) => {
      const clone = result.node.cloneNode(true);
      clone.setAttribute('width', w);
      clone.setAttribute('height', h);
      const xml = new XMLSerializer().serializeToString(clone);
      const img = new Image();
      img.onload = () => {
        const cv = document.createElement('canvas');
        cv.width = w; cv.height = h;
        cv.getContext('2d').drawImage(img, 0, 0, w, h);
        cv.toBlob(b => b ? resolve(b) : reject(new Error('MicroGfx.toPNG: toBlob returned null')), 'image/png');
      };
      img.onerror = () => reject(new Error('MicroGfx.toPNG: SVG failed to rasterise'));
      img.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(xml);
    });
  },
};

/* ── Pattern 5: degradation filters ─────────────────────────────────────── */

/**
 * Warp bends geometry, erode eats ink coverage, grain is sensor noise.
 * Every filter seeds from the composition seed, so the damage is reproducible.
 */
function defs(svg, seed, degrade) {
  const defsEl = el('defs', {}, svg);
  const fs = seed % 1000;

  const warp = el('filter', {
    id: 'mgfx-warp', x: '-8%', y: '-8%', width: '116%', height: '116%',
  }, defsEl);
  el('feTurbulence', {
    type: 'fractalNoise', baseFrequency: '0.018', numOctaves: '2', seed: fs, result: 'noise',
  }, warp);
  el('feDisplacementMap', {
    in: 'SourceGraphic', in2: 'noise', scale: (degrade.warp * 14).toFixed(2),
    xChannelSelector: 'R', yChannelSelector: 'G',
  }, warp);

  const erode = el('filter', {
    id: 'mgfx-erode', x: '-6%', y: '-6%', width: '112%', height: '112%',
  }, defsEl);
  el('feTurbulence', {
    type: 'fractalNoise', baseFrequency: '0.45 0.55', numOctaves: '2',
    seed: (fs + 7) % 1000, result: 'nz',
  }, erode);
  // Push the noise to near-binary alpha, then keep only the ink under it.
  // Capped so a glyph never loses more than roughly a third of its coverage.
  el('feColorMatrix', {
    in: 'nz', type: 'matrix', result: 'mask',
    values: `0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 ${-1.4 - degrade.erode * 0.5} ${1.28 + degrade.erode * 0.2}`,
  }, erode);
  el('feComposite', { in: 'SourceGraphic', in2: 'mask', operator: 'in' }, erode);

  const grain = el('filter', { id: 'mgfx-grain' }, defsEl);
  el('feTurbulence', {
    type: 'fractalNoise', baseFrequency: '0.8', numOctaves: '2',
    seed: fs, stitchTiles: 'stitch',
  }, grain);
  el('feColorMatrix', {
    type: 'matrix',
    values: '0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 0.6 0',
  }, grain);
}

/* ── Layers ─────────────────────────────────────────────────────────────── */

function drawBase(parent, { rng, w, h, theme }, style) {
  const g = el('g', { opacity: 0.18 }, parent);
  if (style === 'mesh') {
    const step = 90 + rng() * 60;
    for (let y = step; y < h; y += step) {
      el('path', {
        d: `M0 ${y.toFixed(1)} Q ${w / 2} ${(y + (rng() - 0.5) * 60).toFixed(1)} ${w} ${y.toFixed(1)}`,
        fill: 'none', stroke: theme.structure, 'stroke-width': 1,
      }, g);
    }
    return;
  }
  const step = 60;
  for (let x = step; x < w; x += step) {
    el('line', { x1: x, y1: 0, x2: x, y2: h, stroke: theme.structure, 'stroke-width': 0.5 }, g);
  }
  for (let y = step; y < h; y += step) {
    el('line', { x1: 0, y1: y, x2: w, y2: y, stroke: theme.structure, 'stroke-width': 0.5 }, g);
  }
}

/** Corner screentone — dense at the corner, thinning inward. */
function drawHalftone(parent, { rng, w, h, theme }) {
  const g = el('g', { opacity: 0.5 }, parent);
  const corner = pick(rng, [[0, 0], [1, 0], [0, 1], [1, 1]]);
  const cols = 26, rows = 18, cell = Math.min(w, h) / 26;
  for (let i = 0; i < cols; i++) {
    for (let j = 0; j < rows; j++) {
      const t = 1 - Math.hypot(i / cols, j / rows) / 1.41;
      if (t <= 0 || rng() > t) continue;
      const x = corner[0] ? w - i * cell : i * cell;
      const y = corner[1] ? h - j * cell : j * cell;
      el('circle', { cx: x.toFixed(1), cy: y.toFixed(1), r: (t * cell * 0.28).toFixed(2), fill: theme.structure }, g);
    }
  }
}

function drawGlyphs(parent, { rng, w, h, theme }, nsfw) {
  const set = nsfw ? CorruptionCharsets.all : CorruptionCharsets.standard;
  const g = el('g', { opacity: 0.35 }, parent);
  const n = 10 + Math.floor(rng() * 10);
  for (let i = 0; i < n; i++) {
    let s = '';
    const len = 1 + Math.floor(rng() * 4);
    for (let k = 0; k < len; k++) s += set[Math.floor(rng() * set.length)];
    el('text', {
      x: (rng() * w).toFixed(1), y: (rng() * h).toFixed(1),
      'font-family': MONO, 'font-size': (12 + rng() * 22).toFixed(0),
      fill: rng() < 0.25 ? theme.accent : theme.structure,
    }, g, s);
  }
}

/** Thin structural rails inset from the frame edge. */
function drawRails(parent, { w, h, theme }) {
  const g = el('g', { opacity: 0.6 }, parent);
  const m = Math.round(Math.min(w, h) * 0.045);
  el('rect', {
    x: m, y: m, width: w - m * 2, height: h - m * 2,
    fill: 'none', stroke: theme.structure, 'stroke-width': 1,
  }, g);
  // corner ticks — the accent's one appearance
  const t = m * 0.6;
  for (const [cx, cy, dx, dy] of [[m, m, 1, 1], [w - m, m, -1, 1], [m, h - m, 1, -1], [w - m, h - m, -1, -1]]) {
    el('path', {
      d: `M${cx} ${cy + dy * t} L${cx} ${cy} L${cx + dx * t} ${cy}`,
      fill: 'none', stroke: theme.highlight, 'stroke-width': 2,
    }, g);
  }
}

function drawScanlines(parent, { w, h }) {
  const g = el('g', { opacity: 0.14, 'pointer-events': 'none' }, parent);
  for (let y = 0; y < h; y += 3) {
    el('rect', { x: 0, y, width: w, height: 1, fill: '#000000' }, g);
  }
}

/* ── Text ───────────────────────────────────────────────────────────────── */

/** Every string here goes in via textContent — never parsed as markup (S1). */
function drawText(parent, { w, h, theme }, text) {
  const m = Math.round(Math.min(w, h) * 0.045) + 22;
  if (text.eyebrow) {
    el('text', {
      x: m, y: m + 14, 'font-family': MONO, 'font-size': 15,
      'letter-spacing': 4, fill: theme.accent,
    }, parent, text.eyebrow);
  }
  if (text.title) {
    el('text', {
      x: m, y: m + 62, 'font-family': MONO, 'font-size': 44,
      'font-weight': 'bold', fill: theme.ink,
    }, parent, text.title);
  }
  if (text.serial) {
    el('text', {
      x: m, y: h - m + 6, 'font-family': MONO, 'font-size': 13,
      'letter-spacing': 2, fill: theme.structure,
    }, parent, text.serial);
  }
  if (text.nameplate) {
    const t = el('text', {
      x: w - m, y: h - m + 6, 'font-family': MONO, 'font-size': 13,
      'letter-spacing': 2, fill: theme.ink, 'text-anchor': 'end',
    }, parent, text.nameplate);
    t.setAttribute('opacity', '0.85');
  }
}

/* ── Instrument primitives ──────────────────────────────────────────────── */

const DRAW = {
  barcode(g, { rng, theme }, b) {
    let x = b.x;
    while (x < b.x + b.w) {
      const bw = 1 + rng() * 5;
      if (rng() > 0.35) {
        el('rect', { x: x.toFixed(1), y: b.y, width: bw.toFixed(1), height: b.h, fill: theme.ink }, g);
      }
      x += bw + 1 + rng() * 3;
    }
  },

  dotMatrix(g, { rng, theme }, b) {
    const cols = 12, rows = Math.max(3, Math.round(b.h / (b.w / cols)));
    const cell = b.w / cols;
    for (let i = 0; i < cols; i++) {
      for (let j = 0; j < rows; j++) {
        if (rng() > 0.55) continue;
        el('circle', {
          cx: (b.x + i * cell + cell / 2).toFixed(1),
          cy: (b.y + j * cell + cell / 2).toFixed(1),
          r: (cell * 0.18).toFixed(2),
          fill: rng() < 0.15 ? theme.accent : theme.structure,
        }, g);
      }
    }
  },

  gaugeStack(g, { rng, theme }, b) {
    const rows = 4;
    const rh = b.h / rows;
    for (let i = 0; i < rows; i++) {
      const y = b.y + i * rh + rh * 0.25;
      const hh = rh * 0.4;
      el('rect', { x: b.x, y: y.toFixed(1), width: b.w, height: hh.toFixed(1), fill: 'none', stroke: theme.structure, 'stroke-width': 0.8 }, g);
      el('rect', { x: b.x, y: y.toFixed(1), width: (b.w * (0.15 + rng() * 0.8)).toFixed(1), height: hh.toFixed(1), fill: theme.accent, opacity: 0.75 }, g);
    }
  },

  histogram(g, { rng, theme }, b) {
    const n = 16;
    const bw = b.w / n;
    for (let i = 0; i < n; i++) {
      const hh = b.h * (0.12 + rng() * 0.88);
      el('rect', {
        x: (b.x + i * bw).toFixed(1), y: (b.y + b.h - hh).toFixed(1),
        width: (bw * 0.62).toFixed(1), height: hh.toFixed(1),
        fill: i === n - 1 ? theme.highlight : theme.ink, opacity: 0.9,
      }, g);
    }
  },

  coordReadout(g, { rng, theme }, b) {
    const lines = 4;
    for (let i = 0; i < lines; i++) {
      const lat = (rng() * 180 - 90).toFixed(4);
      const lon = (rng() * 360 - 180).toFixed(4);
      el('text', {
        x: b.x, y: (b.y + 14 + i * 18).toFixed(1),
        'font-family': MONO, 'font-size': 12, 'letter-spacing': 1,
        fill: i === 0 ? theme.ink : theme.structure,
      }, g, `${lat} / ${lon}`);
    }
  },

  dimension(g, { rng, theme }, b) {
    const y = b.y + b.h / 2;
    el('line', { x1: b.x, y1: y, x2: b.x + b.w, y2: y, stroke: theme.structure, 'stroke-width': 1 }, g);
    for (const x of [b.x, b.x + b.w]) {
      el('line', { x1: x, y1: y - 7, x2: x, y2: y + 7, stroke: theme.structure, 'stroke-width': 1 }, g);
    }
    el('text', {
      x: (b.x + b.w / 2).toFixed(1), y: (y - 10).toFixed(1),
      'font-family': MONO, 'font-size': 12, fill: theme.ink, 'text-anchor': 'middle',
    }, g, `${(120 + rng() * 900).toFixed(1)}mm`);
  },
};

/**
 * Place primitives down one side of the frame.
 *
 * ponytail: a fixed column of slots rather than a packing algorithm. The
 * composition reads as an instrument panel either way, and a solver here
 * would be a lot of code to place six rectangles.
 */
function drawPrimitives(parent, ctx, chosen) {
  const names = chosen.filter(n => DRAW[n]);
  if (!names.length) return;
  const { rng, w, h, density } = ctx;

  const g = el('g', {}, parent);
  const m = Math.round(Math.min(w, h) * 0.045) + 26;
  const slots = Math.max(1, Math.round(names.length * (0.4 + density * 0.6)));
  const colX = rng() < 0.5 ? m : w * 0.58;
  const colW = Math.min(w * 0.34, w - colX - m);
  const top = h * 0.32;
  const slotH = Math.min(96, (h - top - m) / slots);

  for (let i = 0; i < slots; i++) {
    const name = names[i % names.length];
    DRAW[name](g, ctx, {
      x: colX,
      y: top + i * slotH,
      w: colW,
      h: slotH * 0.62,
    });
  }
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { MicroGfx };
}
