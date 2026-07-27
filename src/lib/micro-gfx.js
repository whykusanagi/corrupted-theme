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
import {
  TERMINAL_HEADERS, NSFW_TERMINAL_HEADERS,
  TERMINAL_STATUS, NSFW_TERMINAL_STATUS,
  HEX_CHARS,
} from '../core/terminal-vocab.js';

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

/**
 * Paper polarity inverts the FIELD, not the palette. Magenta and violet still
 * carry structure and accent; cyan stays accent-only. This is deliberately not
 * the print-industrial cream-and-black it borrows its grammar from — a
 * corrupted artifact on pale stock still reads as corrupted.
 */
const PAPER_FIELDS = ['#f5f1f8', '#e8e4f0', '#efe9f2'];
const PAPER_INK = '#1a1430';

const POLARITY_POOL = ['dark', 'dark', 'dark', 'paper'];

/**
 * Resolve polarity while consuming a FIXED number of rng draws.
 *
 * Branching on the option here would desync the stream, so the same seed
 * would produce a different composition in each polarity. Polarity is meant
 * to be an independent axis — the same poster in a different colourway — so
 * both draws always happen and the unused one is discarded.
 */
function resolvePolarity(theme, requested, rng) {
  const seeded = pick(rng, POLARITY_POOL);
  const field = pick(rng, PAPER_FIELDS);
  const polarity = requested === 'paper' || requested === 'dark' ? requested : seeded;
  return {
    polarity,
    theme: polarity === 'paper' ? { ...theme, bg: field, ink: PAPER_INK } : theme,
  };
}

/**
 * Generic system-unit names for module headers. Deliberately impersonal: the
 * package ships no persona strings.
 */
const UNITS = [
  'NEURAL DIV', 'ARCHIVE UNIT', 'BUFFER LAB', 'DECODE WORKS', 'SIGNAL DIV',
  'CORE SYS', 'MEMORY BANK', 'PARITY OFFICE', 'VECTOR UNIT', 'CIPHER DIV',
];
const MARKS = ['✳', '✦', '◈', '⊕', '☰', '◇'];
const PILL_KEYS = ['REV', 'BUILD', 'VER', 'LOT', 'SEQ'];

const PRIMITIVES = ['barcode', 'dotMatrix', 'gaugeStack', 'histogram',
  'coordReadout', 'dimension', 'sparkline', 'keyValue', 'qr'];

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
   * @param {'dark'|'paper'} [options.polarity] - omit to let the seed choose
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

    const baseTheme = typeof options.theme === 'object' && options.theme
      ? { ...THEMES.magenta, ...options.theme }
      : (THEMES[options.theme] || THEMES.magenta);
    const { polarity, theme } = resolvePolarity(baseTheme, options.polarity, rng);

    // Unspecified layers are chosen by the seed. Explicit options still win,
    // so a caller can pin a look and still roll the details.
    const ul = options.layers || {};
    const layers = {
      base:      ul.base      ?? pick(rng, ['grid', 'mesh', 'flat', 'grid', 'mesh']),
      halftone:  ul.halftone  ?? rng() < 0.75,
      rails:     ul.rails     ?? true,
      scanlines: ul.scanlines ?? rng() < 0.8,
      glyphs:    ul.glyphs    ?? true,
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

    const ctx = { rng, w: fmt.w, h: fmt.h, theme, density, nsfw: options.nsfw === true };
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
      polarity,
      archetype: ctx.archetype,
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


/* ── New body primitives ────────────────────────────────────────────────── */

Object.assign(DRAW, {
  /** Line chart with a dashed envelope — the reference's most frequent body. */
  sparkline(g, { rng, theme }, b) {
    const n = 22;
    const pts = [];
    let v = 0.5;
    for (let i = 0; i < n; i++) {
      v = Math.min(0.95, Math.max(0.05, v + (rng() - 0.5) * 0.42));
      pts.push([b.x + (i / (n - 1)) * b.w, b.y + b.h - v * b.h]);
    }
    el('polyline', {
      points: pts.map(p => `${p[0].toFixed(1)},${p[1].toFixed(1)}`).join(' '),
      fill: 'none', stroke: theme.ink, 'stroke-width': 1.4,
    }, g);
    // dashed envelope above and below
    for (const off of [-b.h * 0.22, b.h * 0.22]) {
      el('polyline', {
        points: pts.map(p => `${p[0].toFixed(1)},${(p[1] + off).toFixed(1)}`).join(' '),
        fill: 'none', stroke: theme.structure, 'stroke-width': 0.7,
        'stroke-dasharray': '3 4', opacity: 0.7,
      }, g);
    }
  },

  /** Label/value rows. Values come from the theme's own status vocabulary. */
  keyValue(g, { rng, theme, nsfw }, b) {
    const pool = nsfw ? [...TERMINAL_STATUS, ...NSFW_TERMINAL_STATUS] : TERMINAL_STATUS;
    const rows = Math.max(2, Math.min(4, Math.floor(b.h / 15)));
    for (let i = 0; i < rows; i++) {
      const raw = pick(rng, pool);
      const [k, v] = raw.includes(':') ? raw.split(':') : [raw, ''];
      const y = b.y + 11 + i * 14;
      el('text', {
        x: b.x, y: y.toFixed(1), 'font-family': MONO, 'font-size': 10,
        fill: theme.structure,
      }, g, k.trim().toUpperCase());
      if (v) {
        el('text', {
          x: (b.x + b.w).toFixed(1), y: y.toFixed(1), 'font-family': MONO,
          'font-size': 10, fill: theme.ink, 'text-anchor': 'end',
        }, g, v.trim());
      }
    }
  },

  /** Block matrix. Not a real encoder — a plausible machine-readable mark. */
  qr(g, { rng, theme }, b) {
    const n = 11;
    const side = Math.min(b.w, b.h);
    const cell = side / n;
    const finder = (cx, cy) => {
      el('rect', { x: b.x + cx * cell, y: b.y + cy * cell, width: cell * 3, height: cell * 3,
        fill: 'none', stroke: theme.ink, 'stroke-width': cell * 0.5 }, g);
    };
    for (let i = 0; i < n; i++) {
      for (let j = 0; j < n; j++) {
        const inFinder = (i < 4 && j < 4) || (i > n - 5 && j < 4) || (i < 4 && j > n - 5);
        if (inFinder || rng() > 0.5) continue;
        el('rect', {
          x: (b.x + i * cell).toFixed(1), y: (b.y + j * cell).toFixed(1),
          width: cell.toFixed(1), height: cell.toFixed(1), fill: theme.ink,
        }, g);
      }
    }
    finder(0, 0); finder(n - 3, 0); finder(0, n - 3);
  },
});

/* ── Module grammar ─────────────────────────────────────────────────────── */

function hex(rng, n) {
  let out = '';
  for (let i = 0; i < n; i++) out += HEX_CHARS[Math.floor(rng() * HEX_CHARS.length)];
  return out;
}

/** Wide-tracked caps, the way the reference sets its status lines. */
function statusLine(g, ctx, x, y, w, textStr) {
  const { theme } = ctx;
  const size = Math.max(7, Math.min(10, w / 26));
  el('text', {
    x, y, 'font-family': MONO, 'font-size': size.toFixed(1),
    'letter-spacing': (size * 0.42).toFixed(1), fill: theme.structure,
  }, g, textStr.toUpperCase().slice(0, 30));
}

/**
 * Draw one labelled module.
 *
 * The anatomy — mark + unit + pill, status line, big display, body primitive,
 * footer meta — is what makes a composition read as a spec sheet rather than
 * scattered decoration. Every string is placed via el(…, text), i.e.
 * textContent, so this adds no injection surface.
 */
function drawModule(parent, ctx, box, bodyName) {
  const { rng, theme, nsfw } = ctx;
  const g = el('g', {}, parent);
  const framed = rng() < 0.42;
  const pad = framed ? 10 : 0;

  if (framed) {
    el('rect', {
      x: box.x - pad, y: box.y - pad,
      width: box.w + pad * 2, height: box.h + pad * 2,
      fill: 'none', stroke: theme.structure, 'stroke-width': 1, opacity: 0.8,
    }, g);
  }

  let y = box.y + 9;
  const x = box.x;

  // header: mark + unit + right-aligned pill
  el('text', { x, y, 'font-family': MONO, 'font-size': 9, fill: theme.accent },
    g, `${pick(rng, MARKS)} ${pick(rng, UNITS)}`);
  if (box.w > 150 && rng() < 0.75) {
    const label = `${pick(rng, PILL_KEYS)} ${Math.floor(rng() * 99)}`;
    const pw = label.length * 5.4 + 8;
    el('rect', {
      x: (x + box.w - pw).toFixed(1), y: (y - 7).toFixed(1),
      width: pw.toFixed(1), height: 10, rx: 2,
      fill: 'none', stroke: theme.structure, 'stroke-width': 0.8,
    }, g);
    el('text', {
      x: (x + box.w - pw / 2).toFixed(1), y: (y + 1).toFixed(1),
      'font-family': MONO, 'font-size': 7, fill: theme.structure, 'text-anchor': 'middle',
    }, g, label);
  }
  y += 14;

  // status line, from the theme's own vocabulary
  const headers = nsfw ? [...TERMINAL_HEADERS, ...NSFW_TERMINAL_HEADERS] : TERMINAL_HEADERS;
  statusLine(g, ctx, x, y, box.w, pick(rng, headers));
  y += 16;

  // big display: hex code, katakana, or a numeral
  const kind = rng();
  const display = kind < 0.4 ? `0X${hex(rng, 2)}`
    : kind < 0.7 ? String(Math.floor(rng() * 999)).padStart(3, '0')
    : CorruptionCharsets.katakana[Math.floor(rng() * CorruptionCharsets.katakana.length)]
      + CorruptionCharsets.katakana[Math.floor(rng() * CorruptionCharsets.katakana.length)];
  const dsize = Math.max(16, Math.min(34, box.w / 6));
  el('text', {
    x, y: (y + dsize * 0.75).toFixed(1), 'font-family': MONO,
    'font-size': dsize.toFixed(0), 'font-weight': 'bold', fill: theme.ink,
  }, g, display);
  y += dsize + 8;

  // body primitive, in whatever height is left
  const bodyH = box.y + box.h - y - 12;
  if (bodyH > 12 && DRAW[bodyName]) {
    DRAW[bodyName](g, ctx, { x, y, w: box.w, h: bodyH });
  }

  // footer meta
  el('text', {
    x, y: (box.y + box.h).toFixed(1), 'font-family': MONO, 'font-size': 7.5,
    fill: theme.structure, opacity: 0.9,
  }, g, `${pick(rng, ['ID', 'REF', 'SN', 'CODE'])} ${hex(rng, 4)}-${Math.floor(rng() * 99)}`);
}

/** Fisher-Yates with the seeded rng, so the primitive order varies per seed. */
function shuffled(rng, arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/**
 * Layout archetypes. The seed picks one, which is what makes two seeds look
 * like different posters rather than the same poster with different noise.
 *
 * ponytail: four hand-written arrangements, not a packing solver. A solver
 * would be far more code to place a handful of rectangles, and the archetypes
 * are what give the output its instrument-panel character anyway.
 */
const ARCHETYPES = ['columnLeft', 'columnRight', 'split', 'band', 'wall', 'wall'];

function slotsFor(kind, { w, h }, m, count, rng) {
  const out = [];
  if (kind === 'wall') {
    // Tile modules edge to edge across the whole frame. The reference's most
    // striking composition, and the only one that fills rather than insets.
    const cols = w > h ? 3 + Math.floor(rng() * 2) : 2 + Math.floor(rng() * 2);
    const gap = 18;
    // Reserve a header band so the title block does not land on top of the
    // first row of modules. The reference does the same thing.
    const top = m + 62;
    const cw = (w - m * 2 - gap * (cols - 1)) / cols;
    const rows = Math.max(2, Math.floor((h - top - m) / 150));
    const ch = (h - top - m - gap * (rows - 1)) / rows;
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        out.push({ x: m + c * (cw + gap), y: top + r * (ch + gap), w: cw, h: ch });
      }
    }
    return out;
  }
  if (kind === 'band') {
    const bandY = h * (0.42 + (count % 3) * 0.06);
    const bw = (w - m * 2) / count;
    for (let i = 0; i < count; i++) {
      out.push({ x: m + i * bw, y: bandY, w: bw * 0.82, h: Math.min(110, h * 0.16) });
    }
    return out;
  }
  if (kind === 'split') {
    const colW = Math.min(w * 0.3, (w - m * 3) / 2);
    const per = Math.ceil(count / 2);
    const top = h * 0.3;
    const slotH = Math.min(96, (h - top - m) / per);
    for (let i = 0; i < count; i++) {
      const side = i < per ? 0 : 1;
      const row = i % per;
      out.push({
        x: side === 0 ? m : w - m - colW,
        y: top + row * slotH, w: colW, h: slotH * 0.62,
      });
    }
    return out;
  }
  const left = kind === 'columnLeft';
  const colW = Math.min(w * 0.34, w * 0.36);
  const x = left ? m : w - m - colW;
  const top = h * 0.3;
  const slotH = Math.min(96, (h - top - m) / count);
  for (let i = 0; i < count; i++) {
    out.push({ x, y: top + i * slotH, w: colW, h: slotH * 0.62 });
  }
  return out;
}

function drawPrimitives(parent, ctx, chosen) {
  const available = chosen.filter(n => DRAW[n]);
  if (!available.length) return;
  const { rng, w, h, density } = ctx;

  const g = el('g', {}, parent);
  const m = Math.round(Math.min(w, h) * 0.045) + 26;

  // Which primitives, how many, and in what order — all from the seed.
  const order = shuffled(rng, available);
  const min = Math.max(1, Math.round(available.length * 0.35));
  const max = Math.max(min, Math.round(available.length * (0.45 + density * 0.55)));
  const count = min + Math.floor(rng() * (max - min + 1));

  const kind = pick(rng, ARCHETYPES);
  const boxes = slotsFor(kind, { w, h }, m, count, rng);

  // Modules where there is room for the full anatomy; bare primitives where
  // the slot is too short for a header, display and footer to read.
  boxes.forEach((box, i) => {
    const name = order[i % order.length];
    if (box.h >= 110) drawModule(g, ctx, box, name);
    else DRAW[name](g, ctx, box);
  });

  ctx.archetype = kind;
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { MicroGfx };
}
