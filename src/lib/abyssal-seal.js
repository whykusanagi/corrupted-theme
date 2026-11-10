/**
 * AbyssalSeal — procedural SVG "seal of office" in CorruptedMandala's visual language.
 *
 * An official-looking digital seal: a rotating tick dial, a chromatic-fringe legend
 * across the top, a motto across the bottom that types itself in (Latin), holds,
 * then resolves into its English, two rotating data bands, a mandorla halo, six
 * 4-point "law" stars, a centre sigil (any image, tinted), two talons (a binary
 * rosary with a key; six lightning data cables ending in cursors) and a terminal
 * motto plate. Everything is generated; the package ships no image assets.
 *
 * @example Background seal
 *   import { AbyssalSeal } from '@whykusanagi/corrupted-theme/abyssal-seal';
 *   const seal = new AbyssalSeal(svgEl, { legendTop: 'SEAL OF THE ARCHIVE', sigilHref: 'mark.png' });
 *   seal.init().resize(1920, 1080).setActive(true).play();
 *
 * @example Deterministic video export (frame-locked)
 *   import { seekAnimations } from '@whykusanagi/corrupted-theme/time-utils';
 *   seal.seek(t);               // typed motto: a pure function of t
 *   seekAnimations(svgEl, t);   // rings, twinkles, cable flow: CSS animations
 *
 * Geometry is authored in a fixed 1080x1080 space (centre 540) and fitted into the
 * svg's W x H, so the look is identical at any size or aspect.
 *
 * @module lib/abyssal-seal
 * @version 0.1.0
 * @author whykusanagi
 * @license MIT
 * @see docs/specs/abyssal-seal/ — design mockups and decisions
 */

import { seededRandom } from '../core/random-utils.js';
import { pickSeededPhrase } from './_overlay-shared.js';

const SVG_NS = 'http://www.w3.org/2000/svg';
const MONO = '"Courier New", Monaco, monospace';
const C = 540;                       // authored canvas centre (1080 x 1080)

/**
 * Built-in palettes, locked by docs/rfcs/RFC-0001-abyssal-seal-palettes.md.
 * Pick one by name (options.palette). Do not add or retune values here without
 * updating the RFC, the pinned test and the colour-sweep exceptions.
 */
export const SEAL_PALETTES = Object.freeze({
  abyss: Object.freeze({ pink: '#ff82d9', violet: '#b08aff', iceCyan: '#7ef0ff', cyan: '#00ffff', plum: '#3a1828', accent: '#d94f90', white: '#ffffff' }),
  gold: Object.freeze({ pink: '#ffd36b', violet: '#c9a227', iceCyan: '#ffe9a0', cyan: '#fff1b8', plum: '#3a2a10', accent: '#e0b040', white: '#fffaf0' }),
  crimson: Object.freeze({ pink: '#ff3b5c', violet: '#a0182e', iceCyan: '#ff8095', cyan: '#ffb3c0', plum: '#3a0810', accent: '#d0203a', white: '#fff0f2' }),
});

const DEFAULT_TYPING = { type: 2.2, holdLatin: 2.6, resolve: 1.4, holdEnglish: 4.0 };

// Typing buffer / scramble glyphs (the TypingAnimation buckets, kept short to fit an arc).
const BUF_SYM = '★✧✦◆◇◈⚠';
const BUF_BLK = '█▓▒░▌▐◄►';
const BUF_JP  = ['ノイズ', '解析', '監視', '0x1337'];
const SCRAMBLE = '█▓▒░アイウエオカキクケコ01';

let _instance = 0;

/** Deterministic hash noise in [0,1) — the same form stream.html's typing port uses. */
function noise(i, s) {
  return Math.abs(Math.sin((i + 1) * 12.9898 + s * 78.233) * 43758.5453) % 1;
}

/**
 * State of the typed motto at time t (seconds). Pure: no DOM, no clock.
 *
 * Phases per cycle: 'type' (Latin grows, a corruption buffer flickers ahead) ->
 * 'holdLatin' -> 'resolve' (Latin scrambles into English, left to right) ->
 * 'holdEnglish', then loops.
 *
 * `start` says where the line's left edge sits, as a fraction from the Latin's
 * centred start (0) to the English's centred start (1); null means centred. Held
 * lines pin their edge so the blinking cursor never re-centres them.
 *
 * @param {number} t
 * @param {{latin:string, english:string}} motto - already wrapped (e.g. '◈ … ◈')
 * @param {{type:number, holdLatin:number, resolve:number, holdEnglish:number}} [typing]
 * @returns {{phase:string, text:string, buffer:string|null, bufferHot:boolean, cursorOn:boolean|null, start:number}}
 */
export function mottoState(t, motto, typing = DEFAULT_TYPING) {
  const { latin: LAT, english: ENG } = motto;
  const T1 = typing.type, T2 = T1 + typing.holdLatin, T3 = T2 + typing.resolve;
  const cycle = T3 + typing.holdEnglish;
  const c = ((t % cycle) + cycle) % cycle;
  const tick = Math.floor(t * 10);
  const blink = Math.floor(c * 2) % 2 === 0;

  if (c < T1) {
    const n = Math.floor((c / T1) * LAT.length);
    const r = noise(7, tick);
    const buffer = r < 0.4 ? BUF_JP[Math.floor(noise(8, tick) * BUF_JP.length)]
      : r < 0.7 ? BUF_SYM[Math.floor(noise(9, tick) * BUF_SYM.length)].repeat(2)
      : BUF_BLK[Math.floor(noise(10, tick) * BUF_BLK.length)].repeat(3);
    return { phase: 'type', text: LAT.slice(0, n), buffer, bufferHot: r >= 0.7, cursorOn: null, start: 0 };
  }
  if (c < T2) return { phase: 'holdLatin', text: LAT, buffer: null, bufferHot: false, cursorOn: blink, start: 0 };
  if (c < T3) {
    const q = (c - T2) / typing.resolve;
    const len = Math.round(LAT.length + (ENG.length - LAT.length) * q);
    let text = '';
    for (let i = 0; i < len; i++) {
      const settle = i / len;
      text += q > settle + 0.18 ? (ENG[i] || '')
        : q > settle ? SCRAMBLE[Math.floor(noise(i, tick * 3 + i) * SCRAMBLE.length)]
        : (LAT[i] || ' ');
    }
    return { phase: 'resolve', text, buffer: null, bufferHot: false, cursorOn: null, start: q };
  }
  return { phase: 'holdEnglish', text: ENG, buffer: null, bufferHot: false, cursorOn: blink, start: 1 };
}

/** Total length of one motto cycle in seconds. */
export function mottoCycle(typing = DEFAULT_TYPING) {
  return typing.type + typing.holdLatin + typing.resolve + typing.holdEnglish;
}

/**
 * @class AbyssalSeal
 * @param {SVGSVGElement|null} svgElement - Target <svg> (cleared and rebuilt)
 * @param {object} [options={}]
 * @param {string}  [options.legendTop='SEAL OF THE CORRUPTED ARCHIVE'] - Top legend arc
 * @param {{latin:string, english:string}} [options.motto] - Bottom legend; types Latin, resolves to English
 * @param {string}  [options.plate='> SIGNAL VERIFIED'] - Terminal motto plate text
 * @param {string}  [options.tagline='SIG.VERIFIED // ARCHIVE.AUTHORITY'] - Line under the plate
 * @param {string|null} [options.dataRing=null] - Outer rotating band; null = seeded SFW phrases
 * @param {string|null} [options.hiddenRing=null] - Inner rotating band (repeated x3); null = seeded tokens
 * @param {string[]} [options.lawLabels] - Labels for the six arc stars
 * @param {string|null} [options.sigilHref=null] - Centre image (tinted via its alpha); null = a 4-point star
 * @param {string|null} [options.sigilColor=null] - Sigil tint; null = colors.pink
 * @param {boolean} [options.talons=true] - Rosary+key (left) and lightning cables (right)
 * @param {'abyss'|'gold'|'crimson'} [options.palette='abyss'] - Built-in palette (RFC-0001); unknown names throw
 * @param {object}  [options.colors] - One-off tint overrides applied on top of the palette
 * @param {number}  [options.size=0.96] - Seal diameter as a fraction of min(W,H)
 * @param {number}  [options.rotationSpeed=1] - Ring rotation multiplier
 * @param {object}  [options.typing] - {type, holdLatin, resolve, holdEnglish} seconds
 * @param {number|null} [options.seed=null] - Seed for the default ring text
 */
export class AbyssalSeal {
  constructor(svgElement, options = {}) {
    const palette = options.palette ?? 'abyss';
    if (!Object.hasOwn(SEAL_PALETTES, palette)) {
      throw new RangeError(`AbyssalSeal: unknown palette "${palette}" (expected ${Object.keys(SEAL_PALETTES).join(', ')})`);
    }
    this.svg = svgElement;
    this.options = {
      legendTop:  options.legendTop ?? 'SEAL OF THE CORRUPTED ARCHIVE',
      motto:      options.motto ?? { latin: 'EX STREPITU ORDO', english: 'FROM NOISE, ORDER' },
      plate:      options.plate ?? '> SIGNAL VERIFIED',
      tagline:    options.tagline ?? 'SIG.VERIFIED // ARCHIVE.AUTHORITY',
      dataRing:   options.dataRing ?? null,
      hiddenRing: options.hiddenRing ?? null,
      lawLabels:  options.lawLabels ?? ['LAW 0', 'LAW I', 'LAW II', 'LAW III', 'LAW IV', 'LAW V'],
      sigilHref:  options.sigilHref ?? null,
      sigilColor: options.sigilColor ?? null,
      talons:     options.talons ?? true,
      palette,
      colors:     { ...SEAL_PALETTES[palette], ...(options.colors || {}) },
      size:       options.size ?? 0.96,
      rotationSpeed: options.rotationSpeed ?? 1,
      typing:     { ...DEFAULT_TYPING, ...(options.typing || {}) },
      seed:       options.seed ?? null,
    };
    this._seed = this.options.seed ?? Math.floor(Math.random() * 0xffffffff);
    this._id = `abyssal-seal-${++_instance}`;
    const rng = seededRandom(this._seed);
    this._dataRing = this.options.dataRing ?? AbyssalSeal._seededDataRing(rng);
    this._hiddenRing = this.options.hiddenRing ?? AbyssalSeal._seededHiddenRing(rng);
    this._motto = { latin: `◈ ${this.options.motto.latin} ◈`, english: `◈ ${this.options.motto.english} ◈` };
    this._typed = null;
    this._raf = null;
    this._destroyed = false;
    this.active = false;
    this.currentW = 1080;
    this.currentH = 1080;
  }

  static _seededDataRing(rng) {
    const a = pickSeededPhrase(rng).toUpperCase(), b = pickSeededPhrase(rng).toUpperCase();
    return ` ${a} ⚠ ${b} ⚠ 001011 ⚠ ${a} ⚠ ${b} ⚠ 001011 ⚠`;
  }

  static _seededHiddenRing(rng) {
    const hex = () => '0x' + Math.floor(rng() * 0xffff).toString(16).toUpperCase().padStart(4, '0');
    return `${hex()} ◈ 001011 ◈ ${hex()}`;
  }

  /* ── Public API ──────────────────────────────────────────────────────── */

  /** Build at the current size. @returns {this} */
  init() {
    if (this._destroyed || !this.svg) return this;
    this.svg.classList.add('abyssal-seal');
    this.svg.style.setProperty('--seal-speed', String(this.options.rotationSpeed));
    this._rebuild();
    return this;
  }

  /** Show/hide (display toggle). @returns {this} */
  setActive(active) {
    this.active = !!active;
    if (this.svg) this.svg.classList.toggle('active', this.active);
    return this;
  }

  /** Resize; full rebuild. @returns {this} */
  resize(w, h) {
    this.currentW = w;
    this.currentH = h;
    if (!this._destroyed && this.svg) this._rebuild();
    return this;
  }

  /**
   * Render the typed motto as it is at time t (seconds). Deterministic: the same t
   * always draws the same frame. Pair with seekAnimations(svg, t) for a full frame.
   * @returns {this}
   */
  seek(t) {
    if (this._destroyed || !this._typed) return this;
    const st = mottoState(t, this._motto, this.options.typing);
    const T = this._typed;
    if (T.latStart == null) this._measure();
    const start = st.start == null || T.latStart == null ? null
      : T.latStart + (T.engStart - T.latStart) * st.start;
    const parts = [[st.text, null]];
    if (st.buffer) parts.push([' ' + st.buffer, st.bufferHot ? '#ff0000' : this.options.colors.accent]);
    // The cursor glyph is always present on a held line and only its fill toggles, so
    // the line's width never changes between blinks.
    if (st.cursorOn !== null) parts.push(['▌', st.cursorOn ? this.options.colors.white : 'transparent']);
    T.paths.forEach((tp, k) => {
      tp.setAttribute('text-anchor', start == null ? 'middle' : 'start');
      tp.setAttribute('startOffset', start == null ? '50%' : String(start));
      tp.textContent = '';
      for (const [txt, col] of parts) {
        const span = document.createElementNS(SVG_NS, 'tspan');
        span.textContent = txt;
        if (col) span.setAttribute('fill', k === 2 ? col : 'transparent');   // fringe copies stay plain
        tp.appendChild(span);
      }
    });
    return this;
  }

  /** Drive seek() from requestAnimationFrame (live use). @returns {this} */
  play() {
    if (this._raf || typeof requestAnimationFrame !== 'function') return this;
    const t0 = performance.now();
    const step = () => { this.seek((performance.now() - t0) / 1000); this._raf = requestAnimationFrame(step); };
    this._raf = requestAnimationFrame(step);
    return this;
  }

  /** Stop the live loop. @returns {this} */
  stop() {
    if (this._raf && typeof cancelAnimationFrame === 'function') cancelAnimationFrame(this._raf);
    this._raf = null;
    return this;
  }

  /** Clear the SVG and release references. Not reusable after. */
  destroy() {
    if (this._destroyed) return;
    this.stop();
    this._destroyed = true;
    if (this.svg) {
      while (this.svg.firstChild) this.svg.removeChild(this.svg.firstChild);
      this.svg.classList.remove('abyssal-seal', 'active');
    }
    this.svg = null;
    this._typed = null;
  }

  /* ── Internals ───────────────────────────────────────────────────────── */

  /** Transform that fits the 1080 authoring space into W x H, centred. */
  _fit() {
    const s = (Math.min(this.currentW, this.currentH) * this.options.size) / 1080;
    return { s, tx: this.currentW / 2 - C * s, ty: this.currentH / 2 - C * s };
  }

  _starPathD(s) {
    const o = s, i = s / 4;
    return `M 0,${-o} L ${i},${-i} L ${o},0 L ${i},${i} L 0,${o} L ${-i},${i} L ${-o},0 L ${-i},${-i} Z`;
  }

  _rebuild() {
    const svg = this.svg, P = this.options.colors, id = this._id;
    while (svg.firstChild) svg.removeChild(svg.firstChild);
    svg.setAttribute('viewBox', `0 0 ${this.currentW} ${this.currentH}`);

    const el = (name, attrs, parent) => {
      const n = document.createElementNS(SVG_NS, name);
      for (const [k, v] of Object.entries(attrs)) if (v !== undefined && v !== null) n.setAttribute(k, String(v));
      parent.appendChild(n);
      return n;
    };
    const spin = (cls, parent, extra = {}) =>
      el('g', { class: cls, style: `transform-origin:${C}px ${C}px`, ...extra }, parent);
    const star = (s) => this._starPathD(s);

    const { s, tx, ty } = this._fit();
    const defs = el('defs', {}, svg);
    const root = el('g', { transform: `translate(${tx} ${ty}) scale(${s})` }, svg);

    // ---- defs: halo gradient, sigil tint, glow, text paths
    const rg = el('radialGradient', { id: `${id}-halo`, cx: 0.5, cy: 0.5, r: 0.5 }, defs);
    el('stop', { offset: 0, 'stop-color': P.plum, 'stop-opacity': 0.95 }, rg);
    el('stop', { offset: 0.7, 'stop-color': P.plum, 'stop-opacity': 0.45 }, rg);
    el('stop', { offset: 1, 'stop-color': P.plum, 'stop-opacity': 0 }, rg);
    const tint = el('filter', { id: `${id}-tint`, 'color-interpolation-filters': 'sRGB', x: '-20%', y: '-20%', width: '140%', height: '140%' }, defs);
    el('feFlood', { 'flood-color': this.options.sigilColor ?? P.pink }, tint);
    el('feComposite', { in2: 'SourceAlpha', operator: 'in', result: 's' }, tint);
    el('feGaussianBlur', { in: 's', stdDeviation: 10, result: 'b' }, tint);
    const tm = el('feMerge', {}, tint); el('feMergeNode', { in: 'b' }, tm); el('feMergeNode', { in: 's' }, tm);
    const glow = el('filter', { id: `${id}-glow`, x: '-10%', y: '-10%', width: '120%', height: '120%' }, defs);
    el('feGaussianBlur', { stdDeviation: 2.2, result: 'b' }, glow);
    const gm = el('feMerge', {}, glow); el('feMergeNode', { in: 'b' }, gm); el('feMergeNode', { in: 'SourceGraphic' }, gm);
    const circ = (r) => `M ${C} ${C} m -${r} 0 a ${r} ${r} 0 1 1 ${2 * r} 0 a ${r} ${r} 0 1 1 -${2 * r} 0`;
    el('path', { id: `${id}-top`, d: `M ${C - 430} ${C} a 430 430 0 1 1 860 0` }, defs);
    const botPath = el('path', { id: `${id}-bot`, d: `M ${C - 468} ${C} a 468 468 0 0 0 936 0` }, defs);
    el('path', { id: `${id}-data`, d: circ(372) }, defs);
    el('path', { id: `${id}-inner`, d: circ(300) }, defs);
    const GLOW = `url(#${id}-glow)`;

    // ---- outer dial: double ring + rotating ticks
    el('circle', { cx: C, cy: C, r: 520, fill: 'none', stroke: P.cyan, 'stroke-width': 2.5, filter: GLOW }, root);
    el('circle', { cx: C, cy: C, r: 508, fill: 'none', stroke: P.pink, 'stroke-width': 1.2, 'stroke-dasharray': '2 5' }, root);
    const ticks = spin('abyssal-seal-cw-slow', root);
    for (let i = 0; i < 180; i++) {
      const a = (i / 180) * 2 * Math.PI, major = i % 15 === 0, L = major ? 22 : 8, r0 = 497;
      el('line', { x1: C + Math.cos(a) * r0, y1: C + Math.sin(a) * r0, x2: C + Math.cos(a) * (r0 - L), y2: C + Math.sin(a) * (r0 - L),
        stroke: major ? P.cyan : P.violet, 'stroke-width': major ? 2 : 1 }, ticks);
    }

    // ---- legends (chromatic fringe: cyan / pink offsets under the main text)
    const legend = (txt, pathId, size, spacing, col) => [[-2, P.cyan, 0.55], [2, P.pink, 0.55], [0, col, 1]].map(([dx, c, o]) => {
      const t = el('text', { 'font-family': MONO, 'font-size': size, 'font-weight': 'bold', 'letter-spacing': spacing, fill: c, opacity: o, transform: `translate(${dx},0)` }, root);
      const tp = el('textPath', { href: `#${pathId}`, startOffset: '50%', 'text-anchor': 'middle' }, t);
      tp.textContent = txt;
      return tp;
    });
    legend(this.options.legendTop, `${id}-top`, 44, 10, P.white);
    const bot = legend(this._motto.latin, `${id}-bot`, 27, 9, P.iceCyan);
    for (const x of [C - 452, C + 452]) el('path', { d: star(16), transform: `translate(${x},${C})`, fill: P.white, class: 'abyssal-seal-twinkle', filter: GLOW }, root);

    // ---- outer data band
    el('circle', { cx: C, cy: C, r: 392, fill: 'none', stroke: P.violet, 'stroke-width': 1.5 }, root);
    el('circle', { cx: C, cy: C, r: 352, fill: 'none', stroke: P.violet, 'stroke-width': 1.5 }, root);
    const dt = el('text', { 'font-family': MONO, 'font-size': 19, 'letter-spacing': 5, fill: P.pink }, spin('abyssal-seal-ccw', root));
    el('textPath', { href: `#${id}-data` }, dt).textContent = this._dataRing;

    // ---- field: halo, mandorla, dashed quadrant arcs, inner band
    el('circle', { cx: C, cy: C, r: 340, fill: `url(#${id}-halo)` }, root);
    const ves = `M ${C} ${C - 300} Q ${C + 250} ${C} ${C} ${C + 300} Q ${C - 250} ${C} ${C} ${C - 300} Z`;
    el('path', { d: ves, fill: 'none', stroke: P.iceCyan, 'stroke-width': 1.5, opacity: 0.8 }, root);
    el('path', { d: ves, fill: 'none', stroke: P.pink, 'stroke-width': 1, opacity: 0.5, transform: `rotate(90 ${C} ${C})` }, root);
    const arc = (r, a1, a2, col, w, dash) => {
      const p = (a) => [C + Math.cos((a * Math.PI) / 180) * r, C + Math.sin((a * Math.PI) / 180) * r];
      const [x1, y1] = p(a1), [x2, y2] = p(a2);
      el('path', { d: `M ${x1} ${y1} A ${r} ${r} 0 0 1 ${x2} ${y2}`, fill: 'none', stroke: col, 'stroke-width': w, 'stroke-dasharray': dash }, root);
    };
    arc(330, 200, 250, P.cyan, 2, '6 6'); arc(330, 290, 340, P.cyan, 2, '6 6');
    arc(318, 20, 70, P.pink, 1.5, '2 6'); arc(318, 110, 160, P.pink, 1.5, '2 6');
    const it = el('text', { 'font-family': MONO, 'font-size': 18, 'letter-spacing': 5, fill: P.cyan }, spin('abyssal-seal-cw', root, { opacity: 0.8 }));
    const h = this._hiddenRing;
    el('textPath', { href: `#${id}-inner` }, it).textContent = ` ${h} ◈ ${h} ◈ ${h} ◈ `;

    // ---- six law stars over the sigil
    const starCols = [P.white, P.cyan, P.pink, P.iceCyan];
    this.options.lawLabels.slice(0, 6).forEach((label, i) => {
      const a = ((-145 + i * 22) * Math.PI) / 180, x = C + Math.cos(a) * 262, y = C + 20 + Math.sin(a) * 262;
      el('path', { d: star(15), transform: `translate(${x},${y})`, fill: starCols[i % 4], class: 'abyssal-seal-twinkle', style: `animation-delay:${-i * 0.4}s`, filter: GLOW }, root);
      el('text', { x, y: y + 30, 'font-family': MONO, 'font-size': 14, 'text-anchor': 'middle', fill: P.iceCyan, 'letter-spacing': 2 }, root).textContent = label;
    });

    if (this.options.talons) this._buildTalons(el, root, P, GLOW);

    // ---- sigil
    if (this.options.sigilHref) {
      el('image', { href: this.options.sigilHref, x: C - 185, y: C - 205, width: 370, height: 370, filter: `url(#${id}-tint)` }, root);
    } else {
      el('path', { d: star(120), transform: `translate(${C},${C - 20})`, fill: this.options.sigilColor ?? P.pink, filter: GLOW }, root);
    }

    // ---- motto plate
    const W = 520, H = 50, y = C + 150;
    el('path', { d: `M ${C - W / 2 + 14} ${y} H ${C + W / 2 - 14} L ${C + W / 2} ${y + 14} V ${y + H - 14} L ${C + W / 2 - 14} ${y + H} H ${C - W / 2 + 14} L ${C - W / 2} ${y + H - 14} V ${y + 14} Z`,
      fill: 'rgba(15,15,26,.88)', stroke: P.cyan, 'stroke-width': 2, filter: GLOW }, root);
    el('rect', { x: C - W / 2 + 10, y: y + H - 6, width: (W - 20) * 0.72, height: 2, fill: P.pink }, root);
    el('text', { x: C, y: y + H / 2 + 1, 'font-family': MONO, 'font-size': 22, 'font-weight': 'bold', 'letter-spacing': 3, 'text-anchor': 'middle', 'dominant-baseline': 'middle', fill: P.white }, root).textContent = this.options.plate;
    el('text', { x: C, y: y + H + 24, 'font-family': MONO, 'font-size': 13, 'letter-spacing': 4, 'text-anchor': 'middle', fill: P.violet }, root).textContent = this.options.tagline;

    // ---- typed motto. Widths are measured lazily on the first seek(): text has no
    // layout while the svg is display:none, which is the state right after init().
    this._typed = { paths: bot, botPath, latStart: null, engStart: null };
    for (const tp of bot) tp.textContent = this._motto.latin;
  }

  /** Where each motto line starts when centred WITHOUT a cursor; null if no layout yet. */
  _measure() {
    const T = this._typed;
    try {
      const L = T.botPath.getTotalLength(), probe = T.paths[2];
      probe.textContent = this._motto.latin;
      const latW = probe.getComputedTextLength();
      probe.textContent = this._motto.english;
      const engW = probe.getComputedTextLength();
      if (L > 0 && latW > 0 && engW > 0) { T.latStart = (L - latW) / 2; T.engStart = (L - engW) / 2; }
    } catch { /* no layout (detached / non-browser DOM): stay centred */ }
  }

  _buildTalons(el, root, P, GLOW) {
    const LX = C - 172, RX = C + 172, TY = C + 58;
    const T = el('g', { filter: GLOW, fill: 'none', 'stroke-linecap': 'round', 'stroke-linejoin': 'round',
      transform: `translate(${C},${TY}) scale(1.25) translate(${-C},${-TY})` }, root);

    // left: binary rosary, the key hung from its strand like a keyring
    const n = 14, rx = 36, ry = 42, cx = LX + 8, cy = TY - 34;
    for (let i = 0; i < n; i++) {
      if (i === Math.round(n / 2)) continue;                 // gap where the strand drops
      const a = (i / n) * 2 * Math.PI - Math.PI / 2;
      el('text', { x: cx + Math.cos(a) * rx, y: cy + Math.sin(a) * ry + 6, 'font-family': MONO, 'font-size': 17, 'font-weight': 'bold', 'text-anchor': 'middle',
        fill: i % 3 ? P.iceCyan : P.pink, stroke: 'none', class: 'abyssal-seal-twinkle', style: `animation-delay:${-i * 0.2}s` }, T)
        .textContent = (0b10110010111001 >> i) & 1 ? '1' : '0';
    }
    const bx = cx, by = cy + ry + 16;
    el('line', { x1: cx, y1: cy + ry - 6, x2: bx, y2: by - 16, stroke: P.violet, 'stroke-width': 2 }, T);
    const k = el('g', { transform: `rotate(-22 ${bx} ${by})` }, T);
    el('circle', { cx: bx, cy: by, r: 16, stroke: P.iceCyan, 'stroke-width': 4 }, k);
    el('path', { d: `M ${bx} ${by - 7} l 6 3.5 v 7 l -6 3.5 l -6 -3.5 v -7 Z`, stroke: P.pink, 'stroke-width': 2 }, k);
    el('line', { x1: bx - 16, y1: by, x2: bx - 82, y2: by, stroke: P.iceCyan, 'stroke-width': 4.5 }, k);
    [1, 0, 1, 1, 0, 1].forEach((on, i) => {
      const x = bx - 82 + i * 8;
      el('line', { x1: x, y1: by, x2: x, y2: by + (on ? 14 : 7), stroke: on ? P.pink : P.iceCyan, 'stroke-width': 3.5 }, k);
    });

    // right: six lightning data cables, each ending in a cursor along its last segment
    for (let i = 0; i < 6; i++) {
      const a = ((-38 + i * 15.2) * Math.PI) / 180;
      const x0 = RX - 58, y0 = TY - 24, L = 92 + (i % 2) * 10;
      const ux = Math.cos(a), uy = Math.sin(a), nx = -uy, ny = ux;
      const pt = (f, o) => [x0 + ux * L * f + nx * o, y0 + uy * L * f + ny * o];
      const zz = [pt(0, 0), pt(0.3, 9), pt(0.36, -8), pt(0.62, 8), pt(0.68, -7), pt(0.9, 4), pt(1, 0)];
      const d = 'M ' + zz.map((p) => p.join(' ')).join(' L ');
      const [mx, my] = zz[zz.length - 2], [x1, y1] = zz[zz.length - 1];
      el('path', { d, stroke: P.violet, 'stroke-width': 3 }, T);
      el('path', { d, stroke: i % 2 ? P.pink : P.cyan, 'stroke-width': 3, 'stroke-dasharray': '6 14', class: 'abyssal-seal-flow abyssal-seal-flick', style: `animation-delay:${-i * 0.27}s` }, T);
      const deg = (Math.atan2(y1 - my, x1 - mx) * 180) / Math.PI;
      el('path', { d: 'M -4 -10 L 16 0 L -4 10 L 1 0 Z', transform: `translate(${x1},${y1}) rotate(${deg})`, fill: i % 2 ? P.pink : P.cyan, stroke: P.white, 'stroke-width': 1.2,
        class: 'abyssal-seal-twinkle', style: `animation-delay:${-i * 0.3}s` }, T);
    }
  }
}

export default AbyssalSeal;
