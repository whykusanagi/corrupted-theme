/**
 * CorruptedMandala — procedural SVG sacred-geometry background.
 *
 * Builds a rotating "corrupted icon" composition: mandorla (or circle) halo,
 * dashed quadrant arcs, concentric rings, three counter-rotating rings of
 * phrase text, phase-staggered pulsing stars, and an ornamental frame with
 * top/bottom labels. Everything is generated — no image assets.
 *
 * Absorbed from spatial_videos/pipeline/iconography_bg/assets/
 * iconography-mode.js. THE PACKAGE IS THE ONLY HOME FOR THIS VISUAL —
 * downstream projects must import it, never re-vendor it. De-themed:
 * persona label defaults and the incantations.json fetch are replaced by
 * options + the canonical corruption-phrases library.
 *
 * The artwork tints (#ff82d9 / #b08aff / #7ef0ff — accent-light family) are
 * part of this visual's identity and intentionally not remapped to the
 * corruption-state palette; override via options.colors if needed.
 *
 * @example Fullscreen ambient background
 *   import { CorruptedMandala } from '@whykusanagi/corrupted-theme/corrupted-mandala';
 *   const mandala = new CorruptedMandala(svgEl, { labelTop: 'MY.CHANNEL' });
 *   mandala.init().resize(1920, 1080).setActive(true);
 *
 * @example Deterministic video export
 *   // CSS-only animation: freeze any frame via seekAnimations
 *   import { seekAnimations } from '@whykusanagi/corrupted-theme/time-utils';
 *   seekAnimations(svgEl, frameIdx / 60);
 *
 * @module lib/corrupted-mandala
 * @version 0.3.0
 * @author whykusanagi
 * @license MIT
 *
 * @see docs/RENDER_TO_VIDEO.md — deterministic export recipe
 * @composes CRTEffects — layer scanlines/aberration over the mandala
 * @composes BinaryParticles — add a rising token field in front
 */

import { seededRandom } from '../core/random-utils.js';
import { pickSeededPhrase } from './_overlay-shared.js';

const SEPARATORS = { outer: '⚠', middle: '◈', inner: '001011' };

const STAR_DENSITY = {
  low:    { radii: [0.55, 0.85],                                sizes: [14, 9] },
  medium: { radii: [0.55, 0.69, 0.85, 1.01],                    sizes: [17, 13, 10, 7] },
  high:   { radii: [0.55, 0.62, 0.69, 0.77, 0.85, 0.95, 1.01],  sizes: [17, 14, 12, 10, 9, 8, 7] },
};

/** Angular spokes (degrees). 90°/270° skipped so stars never overlap a
 *  centered subject's head/body silhouette. */
const STAR_ANGLES = [
  0, 15, 30, 45, 60, 75,
  105, 120, 135, 150, 165, 180, 195, 210, 225, 240, 255,
  285, 300, 315, 330, 345,
];

const DEFAULT_COLORS = {
  pink: '#ff82d9', violet: '#b08aff', iceCyan: '#7ef0ff', plum: '#3a1828',
  cyan: '#00ffff', white: '#ffffff', accent: '#d94f90',
};

const SVG_NS = 'http://www.w3.org/2000/svg';

/**
 * @class CorruptedMandala
 * @param {SVGSVGElement|null} svgElement - Target <svg> (cleared and rebuilt)
 * @param {object} [options={}]
 * @param {string}  [options.labelTop='CORRUPTED']      - Frame top label
 * @param {string}  [options.labelBottom='ARCHIVE.SYS'] - Frame bottom label
 * @param {'low'|'medium'|'high'} [options.starDensity='medium'] - Star ring density
 * @param {boolean} [options.mandorla=true]      - true = vesica-piscis halo, false = circle
 * @param {object|null} [options.ringPhrases=null] - {outer, middle, inner} phrase arrays;
 *                                                   null = seeded picks from corruption-phrases
 * @param {number}  [options.rotationSpeed=1]    - Ring rotation multiplier (1 = 60s/40s cycles)
 * @param {number}  [options.textScale=2.0]      - Ring text size multiplier
 * @param {object}  [options.elements]           - Visibility: {frame, mandorla, arcs, rings, text, stars}
 * @param {object}  [options.colors]             - Override artwork tints (see DEFAULT_COLORS)
 * @param {boolean} [options.nsfw=false]         - Include NSFW phrases in seeded picks (opt-in)
 * @param {number|null} [options.seed=null]      - Seed for deterministic phrase picks
 */
export class CorruptedMandala {
  constructor(svgElement, options = {}) {
    this.svg = svgElement;
    this.options = {
      labelTop:      options.labelTop ?? 'CORRUPTED',
      labelBottom:   options.labelBottom ?? 'ARCHIVE.SYS',
      starDensity:   options.starDensity ?? 'medium',
      mandorla:      options.mandorla ?? true,
      ringPhrases:   options.ringPhrases ?? null,
      rotationSpeed: options.rotationSpeed ?? 1,
      textScale:     options.textScale ?? 2.0,
      elements: {
        frame: true, mandorla: true, arcs: true, rings: true, text: true, stars: true,
        ...(options.elements || {}),
      },
      colors: { ...DEFAULT_COLORS, ...(options.colors || {}) },
      nsfw:   options.nsfw ?? false,
      seed:   options.seed ?? null,
    };
    this._seed = this.options.seed ?? Math.floor(Math.random() * 0xffffffff);
    this._phrases = this.options.ringPhrases ?? this._pickPhrases();
    this._destroyed = false;
    this.active = false;
    this.currentW = 1920;
    this.currentH = 1080;
  }

  /* ── Public API ──────────────────────────────────────────────────────── */

  /**
   * Build the composition at the current size. Call once after construction
   * (kept as a separate step for source API compatibility).
   * @returns {this}
   */
  init() {
    if (this._destroyed || !this.svg) return this;
    this.svg.classList.add('corrupted-mandala');
    this.svg.style.setProperty('--mandala-speed', String(this.options.rotationSpeed));
    this._rebuild();
    return this;
  }

  /**
   * Show/hide the composition (display toggle; rebuild state is kept).
   * @param {boolean} active
   * @returns {this}
   */
  setActive(active) {
    this.active = !!active;
    if (this.svg) this.svg.classList.toggle('active', this.active);
    return this;
  }

  /**
   * Resize the composition. Full rebuild — resize is infrequent and the
   * geometry is cheap (source approach).
   * @param {number} w - Canvas width in px
   * @param {number} h - Canvas height in px
   * @returns {this}
   */
  resize(w, h) {
    this.currentW = w;
    this.currentH = h;
    if (!this._destroyed && this.svg) this._rebuild();
    return this;
  }

  /**
   * Update the frame labels without a rebuild.
   * @param {string} [top] - New top label (undefined = keep)
   * @param {string} [bottom] - New bottom label (undefined = keep)
   */
  setLabels(top, bottom) {
    if (top !== undefined) this.options.labelTop = top;
    if (bottom !== undefined) this.options.labelBottom = bottom;
    const grp = this.svg?.querySelector('.mandala-grp-frame');
    const labels = grp ? grp.querySelectorAll('text') : [];
    if (labels.length >= 2) {
      labels[0].textContent = this.options.labelTop;
      labels[1].textContent = this.options.labelBottom;
    }
  }

  /** Clear the SVG and release references. Not reusable after. */
  destroy() {
    if (this._destroyed) return;
    this._destroyed = true;
    if (this.svg) {
      this._clear();
      this.svg.classList.remove('corrupted-mandala', 'active');
    }
    this.svg = null;
  }

  /* ── Internals (ported near-verbatim from IconographyMode) ──────────── */

  _pickPhrases() {
    const rng = seededRandom(this._seed);
    const pick = () => pickSeededPhrase(rng, this.options.nsfw).toUpperCase();
    return { outer: [pick()], middle: [pick()], inner: [pick()] };
  }

  _getPhrase(ring) {
    const list = this._phrases[ring];
    return (list && list.length) ? list[0] : 'SIGNAL LOST';
  }

  _geom() {
    const W = this.currentW, H = this.currentH;
    const cx = W / 2, cy = H / 2;
    const R = Math.min(W, H) * 0.46;
    return { W, H, cx, cy, R };
  }

  _el(name, attrs = {}, parent = null) {
    const node = document.createElementNS(SVG_NS, name);
    for (const [k, v] of Object.entries(attrs)) {
      if (v !== undefined && v !== null) node.setAttribute(k, String(v));
    }
    if (parent) parent.appendChild(node);
    return node;
  }

  _clear() {
    while (this.svg.firstChild) this.svg.removeChild(this.svg.firstChild);
  }

  _rebuild() {
    this._clear();
    const { W, H } = this._geom();
    this.svg.setAttribute('viewBox', `0 0 ${W} ${H}`);
    this.svg.setAttribute('preserveAspectRatio', 'none');
    this._buildMandorla();
    this._buildArcs();
    this._buildRings();
    this._buildTextBands();
    this._buildStars();
    this._buildFrame();
  }

  _buildMandorla() {
    const { cx, cy, R } = this._geom();
    const C = this.options.colors;
    const g = this._el('g', { class: 'mandala-grp-mandorla' }, this.svg);
    if (!this.options.elements.mandorla) g.classList.add('corrupted-mandala-hidden');

    const gradId = 'corrupted-mandala-halo-grad';
    const defs = this._el('defs', {}, g);
    const grad = this._el('radialGradient', { id: gradId, cx: '50%', cy: '50%', r: '50%' }, defs);
    const stops = [
      { offset: '0%',   color: C.pink,    opacity: 0 },
      { offset: '45%',  color: C.accent,  opacity: 0.35 },
      { offset: '85%',  color: C.violet,  opacity: 0.40 },
      { offset: '100%', color: C.cyan,    opacity: 0.10 },
    ];
    for (const s of stops) {
      this._el('stop', { offset: s.offset, 'stop-color': s.color, 'stop-opacity': s.opacity }, grad);
    }

    if (!this.options.mandorla) {
      this._el('circle', { cx, cy, r: R * 0.95, fill: `url(#${gradId})`, opacity: 0.95 }, g);
      this._el('circle', {
        cx, cy, r: R * 0.95, fill: 'none', stroke: C.pink, 'stroke-width': 4, opacity: 0.9,
      }, g);
      this._el('circle', {
        cx, cy, r: R * 0.95 * 0.92, fill: 'none', stroke: C.cyan, 'stroke-width': 1.5,
        opacity: 0.55, transform: `translate(${R * 0.04}, ${R * 0.04})`,
      }, g);
    } else {
      // Mandorla (vesica piscis) — Hr = vertical half-axis, Wr = horizontal
      const Hr = R * 0.95;
      const Wr = R * 0.61;
      const d = `M ${cx},${cy - Hr} ` +
        `C ${cx + Wr},${cy - Hr * 0.4} ${cx + Wr},${cy + Hr * 0.4} ${cx},${cy + Hr} ` +
        `C ${cx - Wr},${cy + Hr * 0.4} ${cx - Wr},${cy - Hr * 0.4} ${cx},${cy - Hr} Z`;
      this._el('path', { d, fill: `url(#${gradId})`, opacity: 0.95 }, g);
      this._el('path', { d, fill: 'none', stroke: C.pink, 'stroke-width': 4, opacity: 0.9 }, g);
      this._el('path', {
        d, fill: 'none', stroke: C.cyan, 'stroke-width': 1.5, opacity: 0.55,
        transform: `translate(${R * 0.04}, ${R * 0.04}) scale(0.92) translate(${cx * 0.087 / 0.92}, ${cy * 0.087 / 0.92})`,
      }, g);
    }
  }

  _buildArcs() {
    const { cx, cy, R } = this._geom();
    const C = this.options.colors;
    const g = this._el('g', { class: 'mandala-grp-arcs' }, this.svg);
    if (!this.options.elements.arcs) g.classList.add('corrupted-mandala-hidden');

    const ptOn = (rFrac, angleDeg) => {
      const a = angleDeg * Math.PI / 180;
      return [cx + Math.cos(a) * R * rFrac, cy + Math.sin(a) * R * rFrac];
    };

    const arcSpec = [
      [1.05, 335,  25, C.pink, 3,   '22 12', 0.75, 8],
      [1.05,  55, 125, C.pink, 3,   '22 12', 0.75, 8],
      [1.05, 155, 205, C.pink, 3,   '22 12', 0.75, 8],
      [1.05, 235, 305, C.pink, 3,   '22 12', 0.75, 8],
      [0.91, 340,  20, C.cyan, 2,   '12 10', 0.55, 5],
      [0.91,  70, 110, C.cyan, 2,   '12 10', 0.55, 5],
      [0.91, 160, 200, C.cyan, 2,   '12 10', 0.55, 5],
      [0.91, 250, 290, C.cyan, 2,   '12 10', 0.55, 5],
    ];

    for (const [rFrac, a1, a2, stroke, sw, dash, op, dotR] of arcSpec) {
      const [x1, y1] = ptOn(rFrac, a1);
      const [x2, y2] = ptOn(rFrac, a2);
      const span = ((a2 - a1) % 360 + 360) % 360;
      const largeArc = span > 180 ? 1 : 0;
      const r = R * rFrac;
      this._el('path', {
        d: `M ${x1},${y1} A ${r},${r} 0 ${largeArc},1 ${x2},${y2}`,
        fill: 'none', stroke, 'stroke-width': sw, 'stroke-dasharray': dash,
        'stroke-linecap': 'round', opacity: op,
      }, g);
      this._el('circle', { cx: x1, cy: y1, r: dotR, fill: stroke }, g);
      this._el('circle', { cx: x2, cy: y2, r: dotR, fill: stroke }, g);
    }
  }

  _buildRings() {
    const { cx, cy, R } = this._geom();
    const C = this.options.colors;
    const g = this._el('g', { class: 'mandala-grp-rings' }, this.svg);
    if (!this.options.elements.rings) g.classList.add('corrupted-mandala-hidden');

    const rings = [
      { r: 1.03, stroke: C.white,   sw: 2,   op: 0.40, dash: null },
      { r: 1.00, stroke: C.cyan,    sw: 3,   op: 0.80, dash: null },
      { r: 0.92, stroke: C.pink,    sw: 2.5, op: 0.70, dash: null },
      { r: 0.85, stroke: C.pink,    sw: 2,   op: 0.50, dash: '10 6' },
      { r: 0.71, stroke: C.violet,  sw: 2.5, op: 0.65, dash: null },
      { r: 0.64, stroke: C.cyan,    sw: 1.8, op: 0.45, dash: '6 8' },
      { r: 0.51, stroke: C.cyan,    sw: 4,   op: 0.90, dash: null },
      { r: 0.48, stroke: C.iceCyan, sw: 1.5, op: 0.55, dash: null },
    ];
    for (const ring of rings) {
      const attrs = {
        cx, cy, r: R * ring.r, fill: 'none',
        stroke: ring.stroke, 'stroke-width': ring.sw, opacity: ring.op,
      };
      if (ring.dash) attrs['stroke-dasharray'] = ring.dash;
      this._el('circle', attrs, g);
    }
  }

  _buildTextBands() {
    const { cx, cy, R } = this._geom();
    const C = this.options.colors;
    const g = this._el('g', { class: 'mandala-grp-text' }, this.svg);
    if (!this.options.elements.text) g.classList.add('corrupted-mandala-hidden');

    const defs = this._el('defs', {}, g);
    const bands = [
      // outer size 26→22 in source so the tiled phrase doesn't lap itself at textScale 2
      { ring: 'outer',  rFrac: 1.00, dir: 'cw',  color: C.white, size: 22, weight: 'bold',   spacing: 12 },
      { ring: 'middle', rFrac: 0.78, dir: 'ccw', color: C.pink,  size: 24, weight: 'normal', spacing: 10 },
      { ring: 'inner',  rFrac: 0.56, dir: 'cw',  color: C.cyan,  size: 20, weight: 'normal', spacing: 7 },
    ];

    const scale = this.options.textScale || 1;
    for (const b of bands) {
      const r = R * b.rFrac;
      const pathId = `corrupted-mandala-tp-${b.ring}`;
      this._el('path', {
        id: pathId,
        d: `M ${cx},${cy} m -${r},0 a ${r},${r} 0 1,1 ${r * 2},0 a ${r},${r} 0 1,1 -${r * 2},0`,
        fill: 'none',
      }, defs);

      // Rotating wrapper — transform-origin inline (center is size-dependent)
      const wrap = this._el('g', {
        class: b.dir === 'cw' ? 'corrupted-mandala-ring-cw' : 'corrupted-mandala-ring-ccw',
        style: `transform-origin: ${cx}px ${cy}px;`,
      }, g);

      const phrase = this._getPhrase(b.ring);
      const sep = SEPARATORS[b.ring];
      const text = this._el('text', {
        'font-family': 'Courier New, monospace',
        'font-size': Math.round(b.size * scale),
        'font-weight': b.weight,
        'letter-spacing': Math.round(b.spacing * scale),
        fill: b.color,
      }, wrap);
      const tp = this._el('textPath', { href: `#${pathId}`, startOffset: '0' }, text);
      tp.textContent = ` ${phrase} ${sep} ${phrase} ${sep} `;
    }
  }

  _buildStars() {
    const { cx, cy, R } = this._geom();
    const g = this._el('g', { class: 'mandala-grp-stars' }, this.svg);
    if (!this.options.elements.stars) g.classList.add('corrupted-mandala-hidden');

    const C = this.options.colors;
    const starColors = [C.white, C.cyan, C.pink, C.iceCyan];
    const density = STAR_DENSITY[this.options.starDensity] || STAR_DENSITY.medium;
    const { radii, sizes } = density;

    let colorIdx = 0;
    let phaseIdx = 0;
    for (const angleDeg of STAR_ANGLES) {
      const a = angleDeg * Math.PI / 180;
      for (let i = 0; i < radii.length; i++) {
        const x = cx + Math.cos(a) * R * radii[i];
        const y = cy + Math.sin(a) * R * radii[i];
        const wrap = this._el('g', { transform: `translate(${x},${y})` }, g);
        this._el('path', {
          d: this._starPathD(sizes[i]),
          fill: starColors[colorIdx++ % starColors.length],
          class: `corrupted-mandala-star ph${phaseIdx % 10}`,
        }, wrap);
        phaseIdx++;
      }
    }
  }

  _starPathD(s) {
    // 4-point star centered at (0,0), outer radius = s, inner radius = s/4
    const o = s, i = s / 4;
    return `M 0,${-o} L ${i},${-i} L ${o},0 L ${i},${i} L 0,${o} L ${-i},${i} L ${-o},0 L ${-i},${-i} Z`;
  }

  _buildFrame() {
    const { W, H } = this._geom();
    const C = this.options.colors;
    const g = this._el('g', { class: 'mandala-grp-frame' }, this.svg);
    if (!this.options.elements.frame) g.classList.add('corrupted-mandala-hidden');

    const borderW = Math.max(20, Math.min(W, H) * 0.033);
    const inset1 = borderW;
    const inset2 = borderW + 10;

    this._el('rect', {
      x: 0, y: 0, width: W, height: H,
      fill: 'none', stroke: C.plum, 'stroke-width': borderW,
    }, g);
    this._el('rect', {
      x: inset1, y: inset1, width: W - inset1 * 2, height: H - inset1 * 2,
      fill: 'none', stroke: C.pink, 'stroke-width': 3, opacity: 0.85,
    }, g);
    this._el('rect', {
      x: inset2, y: inset2, width: W - inset2 * 2, height: H - inset2 * 2,
      fill: 'none', stroke: C.cyan, 'stroke-width': 1, opacity: 0.5,
      'stroke-dasharray': '8 6',
    }, g);

    // Filigree corner ornaments (drawn at 200×200, scaled/mirrored per corner)
    const filScale = Math.min(W, H) / 1080;
    const corners = [
      { tx: 0, ty: 0, sx: 1, sy: 1 },
      { tx: W, ty: 0, sx: -1, sy: 1 },
      { tx: 0, ty: H, sx: 1, sy: -1 },
      { tx: W, ty: H, sx: -1, sy: -1 },
    ];
    for (const c of corners) {
      const fg = this._el('g', {
        transform: `translate(${c.tx},${c.ty}) scale(${c.sx * filScale},${c.sy * filScale})`,
      }, g);
      this._el('path', {
        d: 'M 30,30 L 200,30 L 200,38 L 38,38 L 38,200 L 30,200 Z',
        fill: C.pink, opacity: 0.9,
      }, fg);
      this._el('path', {
        d: 'M 50,50 L 170,50 M 50,50 L 50,170',
        fill: 'none', stroke: C.pink, 'stroke-width': 1.5, opacity: 0.55,
      }, fg);
      this._el('path', {
        d: 'M 60,60 C 80,50 110,55 130,75 S 160,110 150,140 ' +
           'C 145,155 130,160 120,150 C 112,142 115,128 125,128 C 132,128 135,135 132,140',
        fill: 'none', stroke: C.pink, 'stroke-width': 2.5, opacity: 0.85,
        'stroke-linecap': 'round',
      }, fg);
      this._el('circle', { cx: 135, cy: 135, r: 3.5, fill: C.cyan }, fg);
      this._el('path', {
        d: 'M 90,30 C 100,55 110,60 130,55',
        fill: 'none', stroke: C.pink, 'stroke-width': 1.8, opacity: 0.7,
      }, fg);
      this._el('path', {
        d: 'M 30,90 C 55,100 60,110 55,130',
        fill: 'none', stroke: C.pink, 'stroke-width': 1.8, opacity: 0.7,
      }, fg);
      const star = this._el('g', { transform: 'translate(150,150)' }, fg);
      this._el('path', {
        d: 'M 0,-13 L 3.25,-3.25 L 13,0 L 3.25,3.25 L 0,13 L -3.25,3.25 L -13,0 L -3.25,-3.25 Z',
        fill: C.white,
      }, star);
    }

    // Top + bottom labels
    const labelFont = Math.max(14, Math.round(borderW * 0.6));
    this._el('text', {
      x: W / 2, y: borderW * 0.9, 'text-anchor': 'middle',
      'font-family': 'Courier New, monospace', 'font-size': labelFont,
      'letter-spacing': 10, fill: C.pink, 'font-weight': 'bold',
    }, g).textContent = this.options.labelTop;
    this._el('text', {
      x: W / 2, y: H - borderW * 0.4, 'text-anchor': 'middle',
      'font-family': 'Courier New, monospace', 'font-size': labelFont,
      'letter-spacing': 10, fill: C.pink, 'font-weight': 'bold',
    }, g).textContent = this.options.labelBottom;
  }
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { CorruptedMandala };
}
