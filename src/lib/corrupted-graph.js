/**
 * CorruptedGraph — node-and-edge graph on canvas, in the corrupted aesthetic.
 *
 * Nodes render as katakana glyphs rather than dots, edges sag like cables,
 * and hovering a node decodes its label out of corruption. Layout is computed
 * in-package: a small force simulation for general graphs, or fixed columns
 * for bipartite ones. No dependency — a spring/repulsion integrator is
 * smaller than importing a graph library.
 *
 * Renders to canvas only and builds no HTML. Node metadata reaches you
 * through `onSelect`, so untrusted graph data can never become markup.
 *
 * @example Bipartite — accounts on the left, shared attributes on the right
 *   import { CorruptedGraph } from '@whykusanagi/corrupted-theme/corrupted-graph';
 *   const g = new CorruptedGraph(canvasEl, {
 *     nodes: [{ id: 'a1', type: 'account' }, { id: 'ip:1.2.3.4', type: 'ip' }],
 *     edges: [{ source: 'a1', target: 'ip:1.2.3.4' }],
 *     layout: 'bipartite',
 *     bipartite: { leftTypes: ['account'] },
 *   });
 *   g.start();
 *
 * @module lib/corrupted-graph
 * @version 0.3.2
 * @author whykusanagi
 * @license MIT
 *
 * @composes CorruptedGlobe — the other data-driven canvas surface; the graph
 *   is relational where the globe is spatial
 */

import { CorruptionCharsets } from '../core/corruption-charsets.js';
import { seededRandom } from '../core/random-utils.js';

const TAU = Math.PI * 2;

/* Theme colours carry the graph; cyan is used only to highlight the node
   under the pointer, which is exactly what the spec reserves accents for. */
const DEFAULT_NODE_COLORS = ['#ffffff', '#ff00ff', '#8b5cf6', '#d94f90'];
const EDGE_COLOR = 'rgba(139,92,246,0.30)';
const EDGE_DIM   = 'rgba(139,92,246,0.05)';
const DIM_NODE   = 'rgba(120,110,140,0.16)';
const HIGHLIGHT  = '#00ffff';

/**
 * Capture the pointer, tolerating ids the browser does not consider active.
 * setPointerCapture throws NotFoundError in that case, and an exception inside
 * pointerdown aborts the handler — which silently breaks dragging.
 */
function capturePointer(el, pointerId) {
  if (!el || !el.setPointerCapture) return;
  try { el.setPointerCapture(pointerId); } catch { /* pointer already released */ }
}

/** Stable 32-bit hash so a node's glyph and jitter don't change between runs. */
function hashId(str) {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

/**
 * @class CorruptedGraph
 * @param {HTMLCanvasElement|null} canvas
 * @param {object} [options={}]
 * @param {Array<{id:string,type?:string,weight?:number,x?:number,y?:number}>} [options.nodes=[]]
 * @param {Array<{source:string|number,target:string|number,weight?:number}>} [options.edges=[]]
 * @param {'force'|'bipartite'|'fixed'} [options.layout='force']
 * @param {object} [options.force] - charge, linkDistance, linkStrength, gravity, damping, alphaMin, maxTicks
 * @param {object} [options.bipartite] - leftTypes, gap, sort
 * @param {'glyph'|'circle'} [options.nodeShape='glyph']
 * @param {string} [options.glyphSet='katakana'] - CorruptionCharsets key
 * @param {Object<string,string>} [options.nodeColors] - node type → colour
 * @param {'line'|'cable'} [options.edgeStyle='cable']
 * @param {'none'|'hover'|'always'} [options.labels='hover']
 * @param {boolean} [options.labelDecode=true] - decode labels out of corruption on hover
 * @param {number} [options.idleGlitch=0.02] - per-frame chance a glyph re-rolls
 * @param {object} [options.interactive] - pan, zoom, hover, select
 * @param {number|{top:number,right:number,bottom:number,left:number}} [options.padding=26] - inset from the canvas edge
 * @param {number} [options.maxNodes=2000] - hard cap; excess is dropped with a warning
 * @param {number} [options.maxEdges=8000] - hard cap; excess is dropped with a warning
 * @param {boolean|'auto'} [options.reducedMotion='auto']
 * @param {Function|null} [options.onSelect] - (node|null) => void; caller owns any HTML
 * @param {Function|null} [options.onHover] - (node|null) => void
 */
export class CorruptedGraph {
  constructor(canvas, options = {}) {
    this.canvas = canvas;
    this.ctx = canvas ? canvas.getContext('2d') : null;

    const f = options.force || {};
    const b = options.bipartite || {};
    this.options = {
      layout: options.layout ?? 'force',
      force: {
        charge:       f.charge ?? -120,
        linkDistance: f.linkDistance ?? 40,
        linkStrength: f.linkStrength ?? 0.6,
        gravity:      f.gravity ?? 0.02,
        damping:      f.damping ?? 0.85,
        alphaMin:     f.alphaMin ?? 0.005,
        maxTicks:     f.maxTicks ?? 400,
      },
      bipartite: {
        leftTypes: Array.isArray(b.leftTypes) ? b.leftTypes : [],
        gap:       b.gap ?? 0.6,
        sort:      b.sort ?? 'degree',
      },
      nodeShape:  options.nodeShape ?? 'glyph',
      glyphSet:   options.glyphSet ?? 'katakana',
      nodeColors: options.nodeColors ?? null,
      edgeStyle:  options.edgeStyle ?? 'cable',
      labels:     options.labels ?? 'hover',
      labelDecode: options.labelDecode ?? true,
      idleGlitch: options.idleGlitch ?? 0.02,
      interactive: { pan: true, zoom: true, hover: true, select: true, ...(options.interactive || {}) },
      zoomRange:  options.zoomRange ?? [0.2, 8],
      padding:    options.padding ?? 26,
      maxNodes:   options.maxNodes ?? 2000,
      maxEdges:   options.maxEdges ?? 8000,
      reducedMotion: options.reducedMotion ?? 'auto',
      onSelect:   options.onSelect ?? null,
      onHover:    options.onHover ?? null,
    };

    this.nodes = [];
    this.edges = [];
    this._typeColor = new Map();
    this._filter = null;
    this._hover = null;
    this._selected = null;
    this._view = { k: 1, x: 0, y: 0 };
    this._decode = null;          // { node, t } — label decode progress

    this._raf = null;
    this._last = 0;
    this._running = false;
    this._destroyed = false;
    this._cssW = 0;
    this._cssH = 0;
    this._pan = null;
    this._resizeObserver = null;
    this._intersectionObserver = null;

    for (const m of ['_onPointerDown', '_onPointerMove', '_onPointerUp', '_onWheel']) {
      this[m] = this[m].bind(this);
    }

    this.setData({ nodes: options.nodes || [], edges: options.edges || [] });
    if (this.canvas) this.init();
  }

  /* ── Public API ──────────────────────────────────────────────────────── */

  init() {
    this._resize();
    const i = this.options.interactive;
    if (i.pan || i.hover || i.select) {
      this.canvas.addEventListener('pointerdown', this._onPointerDown);
      this.canvas.addEventListener('pointermove', this._onPointerMove);
      this.canvas.addEventListener('pointerup', this._onPointerUp);
      this.canvas.addEventListener('pointerleave', this._onPointerUp);
    }
    if (i.zoom) this.canvas.addEventListener('wheel', this._onWheel, { passive: false });

    this._resizeObserver = new ResizeObserver(() => this._resize());
    this._resizeObserver.observe(this.canvas);
    this._intersectionObserver = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting) this.start();
      else this.stop();
    }, { threshold: 0.1 });
    this._intersectionObserver.observe(this.canvas);
  }

  /**
   * Replace the graph. Layout runs synchronously here, not per frame.
   *
   * Over-cap input is truncated and invalid edges dropped, both with a
   * counted `console.warn` — a graph that silently renders less than you gave
   * it is worse than one that complains.
   * @param {{nodes:Array, edges:Array}} data
   * @returns {this}
   */
  setData({ nodes = [], edges = [] } = {}) {
    const { maxNodes, maxEdges } = this.options;

    let ns = Array.isArray(nodes) ? nodes.filter(n => n && n.id != null) : [];
    if (ns.length !== nodes.length) {
      console.warn(`CorruptedGraph: dropped ${nodes.length - ns.length} node(s) with no id`);
    }
    if (ns.length > maxNodes) {
      console.warn(`CorruptedGraph: ${ns.length} nodes exceeds maxNodes=${maxNodes}; dropped ${ns.length - maxNodes}`);
      ns = ns.slice(0, maxNodes);
    }

    const index = new Map();
    this.nodes = ns.map((n, i) => {
      index.set(String(n.id), i);
      const seed = hashId(String(n.id));
      return {
        id: String(n.id),
        type: n.type ?? 'default',
        weight: Number.isFinite(n.weight) ? n.weight : 1,
        data: n,
        x: Number.isFinite(n.x) ? n.x : 0,
        y: Number.isFinite(n.y) ? n.y : 0,
        vx: 0, vy: 0,
        degree: 0,
        seed,
        glyph: this._glyphFor(seed),
        sx: 0, sy: 0, r: 2,
      };
    });

    // Resolve endpoints by id first, then by numeric index (both are common
    // in exported graph data). Validated here so the draw loop never has to.
    const resolve = ref => {
      if (index.has(String(ref))) return index.get(String(ref));
      if (Number.isInteger(ref) && ref >= 0 && ref < this.nodes.length) return ref;
      return -1;
    };
    let dropped = 0;
    const es = [];
    for (const e of Array.isArray(edges) ? edges : []) {
      const pair = Array.isArray(e) ? { source: e[0], target: e[1] } : e;
      if (!pair) { dropped++; continue; }
      const a = resolve(pair.source);
      const b = resolve(pair.target);
      if (a < 0 || b < 0 || a === b) { dropped++; continue; }
      es.push({ a, b, weight: Number.isFinite(pair.weight) ? pair.weight : 1 });
      this.nodes[a].degree++;
      this.nodes[b].degree++;
      if (es.length >= maxEdges) break;
    }
    if (dropped) {
      console.warn(`CorruptedGraph: dropped ${dropped} edge(s) with unresolvable or self-referencing endpoints`);
    }
    const total = Array.isArray(edges) ? edges.length : 0;
    if (total - dropped > maxEdges) {
      console.warn(`CorruptedGraph: edges exceed maxEdges=${maxEdges}; dropped ${total - dropped - maxEdges}`);
    }
    this.edges = es;

    this._assignTypeColors();
    for (const n of this.nodes) n.r = this._radius(n);
    this.layout();
    return this;
  }

  /**
   * Recompute node positions. Called by setData; call again after changing
   * `options.layout`.
   * @returns {this}
   */
  layout() {
    if (!this.nodes.length) return this;
    if (this.options.layout === 'fixed') this._normalise();
    else if (this.options.layout === 'bipartite') this._layoutBipartite();
    else this._layoutForce();
    return this;
  }

  /** Start the render loop. Idempotent. */
  start() {
    if (this._destroyed || this._running || !this.ctx) return this;
    if (this._prefersReducedMotion()) { this._draw(); return this; }
    this._running = true;
    this._last = performance.now();
    const tick = now => {
      if (!this._running) return;
      const dt = Math.min(now - this._last, 60);
      this._last = now;
      this._step(dt);
      this._draw();
      this._raf = requestAnimationFrame(tick);
    };
    this._raf = requestAnimationFrame(tick);
    return this;
  }

  /** Stop the render loop. Reusable. */
  stop() {
    this._running = false;
    if (this._raf !== null) { cancelAnimationFrame(this._raf); this._raf = null; }
  }

  /** Tear down and release references. Not reusable after. */
  destroy() {
    if (this._destroyed) return;
    this.stop();
    if (this.canvas) {
      this.canvas.removeEventListener('pointerdown', this._onPointerDown);
      this.canvas.removeEventListener('pointermove', this._onPointerMove);
      this.canvas.removeEventListener('pointerup', this._onPointerUp);
      this.canvas.removeEventListener('pointerleave', this._onPointerUp);
      this.canvas.removeEventListener('wheel', this._onWheel);
    }
    if (this._resizeObserver) { this._resizeObserver.disconnect(); this._resizeObserver = null; }
    if (this._intersectionObserver) { this._intersectionObserver.disconnect(); this._intersectionObserver = null; }
    this._destroyed = true;
    this.nodes = [];
    this.edges = [];
    this.canvas = null;
    this.ctx = null;
  }

  /**
   * Dim everything the predicate rejects. `null` clears.
   * @param {((node:object)=>boolean)|null} fn
   */
  setFilter(fn) {
    this._filter = typeof fn === 'function' ? fn : null;
    return this;
  }

  /**
   * Convenience filter over id and type. Empty string clears.
   * @param {string} query
   */
  search(query) {
    const q = String(query || '').toLowerCase();
    return this.setFilter(q ? n => n.id.toLowerCase().includes(q) || n.type.toLowerCase().includes(q) : null);
  }

  /** Centre the view on a node by id. */
  focus(id) {
    const n = this.nodes.find(x => x.id === String(id));
    if (!n) return this;
    const e = this._extent();
    this._view.x = this._cssW / 2 - (e.x + n.x * e.w * this._view.k);
    this._view.y = this._cssH / 2 - (e.y + n.y * e.h * this._view.k);
    this._selected = n;
    return this;
  }

  /** Reset pan and zoom so the whole graph is in frame. */
  fit() {
    this._view = { k: 1, x: 0, y: 0 };
    return this;
  }

  /** The node under a canvas-space point, or null. */
  nodeAt(x, y) {
    let best = null;
    let bd = 14 * 14;
    for (const n of this.nodes) {
      const dx = n.sx - x, dy = n.sy - y;
      const d = dx * dx + dy * dy;
      if (d < bd) { bd = d; best = n; }
    }
    return best;
  }

  /* ── Layout ──────────────────────────────────────────────────────────── */

  /**
   * Spring/repulsion integrator run to convergence.
   *
   * ponytail: O(n²) repulsion, bounded by maxNodes (2000 → ~2M pair
   * computations per tick, which settles in well under a second and only runs
   * on setData, not per frame). Swap in Barnes-Hut only if that cap ever rises.
   */
  _layoutForce() {
    const { charge, linkDistance, linkStrength, gravity, damping, alphaMin, maxTicks } = this.options.force;
    const N = this.nodes;
    const rng = seededRandom(N.length * 7919);

    // Seed on a circle — deterministic, and avoids the degenerate all-at-origin
    // start where every repulsion vector is zero.
    N.forEach((n, i) => {
      const a = (i / N.length) * TAU;
      n.x = Math.cos(a) * 100 + (rng() - 0.5) * 8;
      n.y = Math.sin(a) * 100 + (rng() - 0.5) * 8;
      n.vx = n.vy = 0;
    });

    let alpha = 1;
    for (let tick = 0; tick < maxTicks && alpha > alphaMin; tick++) {
      for (let i = 0; i < N.length; i++) {
        for (let j = i + 1; j < N.length; j++) {
          const a = N[i], b = N[j];
          let dx = b.x - a.x, dy = b.y - a.y;
          let d2 = dx * dx + dy * dy;
          if (d2 < 0.01) { dx = 0.1; dy = 0.1; d2 = 0.02; }
          const f = (charge * alpha) / d2;
          const d = Math.sqrt(d2);
          const fx = (dx / d) * f, fy = (dy / d) * f;
          a.vx -= fx; a.vy -= fy;
          b.vx += fx; b.vy += fy;
        }
      }
      for (const e of this.edges) {
        const a = N[e.a], b = N[e.b];
        const dx = b.x - a.x, dy = b.y - a.y;
        const d = Math.hypot(dx, dy) || 0.01;
        const f = ((d - linkDistance) * linkStrength * alpha) / d;
        const fx = dx * f, fy = dy * f;
        a.vx += fx; a.vy += fy;
        b.vx -= fx; b.vy -= fy;
      }
      for (const n of N) {
        n.vx -= n.x * gravity * alpha;
        n.vy -= n.y * gravity * alpha;
        n.x += (n.vx *= damping);
        n.y += (n.vy *= damping);
      }
      alpha *= 0.985;
    }
    this._normalise();
  }

  /** Two fixed columns: leftTypes on the left, everything else on the right. */
  _layoutBipartite() {
    const { leftTypes, gap, sort } = this.options.bipartite;
    const isLeft = n => leftTypes.includes(n.type);
    const cmp = sort === 'weight' ? (a, b) => b.weight - a.weight
      : sort === 'id' ? (a, b) => a.id.localeCompare(b.id)
      : (a, b) => b.degree - a.degree;

    const cols = [this.nodes.filter(isLeft), this.nodes.filter(n => !isLeft(n))];
    const xs = [0.5 - gap / 2, 0.5 + gap / 2];
    cols.forEach((col, ci) => {
      col.sort(cmp);
      col.forEach((n, i) => {
        n.x = xs[ci];
        n.y = col.length === 1 ? 0.5 : i / (col.length - 1);
        n.vx = n.vy = 0;
      });
    });
    // Already in [0,1]; skip _normalise so an empty column can't collapse it.
  }

  /** Map whatever the layout produced into [0,1] on both axes. */
  _normalise() {
    const N = this.nodes;
    const xs = N.map(n => n.x), ys = N.map(n => n.y);
    const x0 = Math.min(...xs), x1 = Math.max(...xs);
    const y0 = Math.min(...ys), y1 = Math.max(...ys);
    const w = x1 - x0 || 1, h = y1 - y0 || 1;
    for (const n of N) {
      n.x = (n.x - x0) / w;
      n.y = (n.y - y0) / h;
    }
  }

  /* ── Internals ───────────────────────────────────────────────────────── */

  _prefersReducedMotion() {
    if (this.options.reducedMotion !== 'auto') return !!this.options.reducedMotion;
    return typeof matchMedia === 'function' && matchMedia('(prefers-reduced-motion: reduce)').matches;
  }

  _glyphFor(seed) {
    const set = CorruptionCharsets[this.options.glyphSet] || CorruptionCharsets.katakana;
    return set[seed % set.length];
  }

  _assignTypeColors() {
    this._typeColor = new Map();
    const types = [...new Set(this.nodes.map(n => n.type))].sort();
    types.forEach((t, i) => {
      const explicit = this.options.nodeColors && this.options.nodeColors[t];
      this._typeColor.set(t, explicit || DEFAULT_NODE_COLORS[i % DEFAULT_NODE_COLORS.length]);
    });
  }

  _radius(n) {
    return Math.min(7, 1.8 + Math.sqrt(n.degree) * 0.42);
  }

  /** Normalised padding — a number means all four sides. */
  _pad() {
    const p = this.options.padding;
    if (typeof p === 'number') return { top: p, right: p, bottom: p, left: p };
    return { top: 26, right: 26, bottom: 26, left: 26, ...(p || {}) };
  }

  /** Drawable extent. x and y scale independently so the graph fills the frame. */
  _extent() {
    const p = this._pad();
    return {
      x: p.left,
      y: p.top,
      w: Math.max(1, this._cssW - p.left - p.right),
      h: Math.max(1, this._cssH - p.top - p.bottom),
    };
  }

  _resize() {
    if (!this.canvas || !this.ctx) return;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const rect = this.canvas.getBoundingClientRect();
    if (rect.width === 0 || rect.height === 0) return;
    this.canvas.width = Math.round(rect.width * dpr);
    this.canvas.height = Math.round(rect.height * dpr);
    this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    this._cssW = rect.width;
    this._cssH = rect.height;
    if (!this._running) this._draw();
  }

  /** Advance idle glitch and label decode. Layout is already settled. */
  _step(dt) {
    const { idleGlitch } = this.options;
    if (idleGlitch > 0) {
      for (const n of this.nodes) {
        if (Math.random() < idleGlitch * (dt / 16.7)) n.glyph = this._glyphFor((n.seed + Date.now()) >>> 0);
      }
    }
    if (this._decode) {
      this._decode.t = Math.min(1, this._decode.t + dt / 320);
    }
  }

  _visible(n) { return !this._filter || this._filter(n); }

  _project() {
    const e = this._extent(), v = this._view;
    for (const n of this.nodes) {
      n.sx = e.x + n.x * e.w * v.k + v.x;
      n.sy = e.y + n.y * e.h * v.k + v.y;
    }
  }

  _draw() {
    const g = this.ctx;
    if (!g || this._cssW === 0) return;
    this._project();
    g.clearRect(0, 0, this._cssW, this._cssH);
    const dimming = !!this._filter;

    // edges
    g.lineWidth = 0.5;
    for (const e of this.edges) {
      const a = this.nodes[e.a], b = this.nodes[e.b];
      const lit = !dimming || this._visible(a) || this._visible(b);
      g.strokeStyle = lit ? EDGE_COLOR : EDGE_DIM;
      g.beginPath();
      g.moveTo(a.sx, a.sy);
      if (this.options.edgeStyle === 'cable') {
        // Sag toward the heavier end, jittered per edge pair so parallel runs
        // don't overlap into a single thick line.
        const mx = (a.sx + b.sx) / 2, my = (a.sy + b.sy) / 2;
        const sag = Math.hypot(b.sx - a.sx, b.sy - a.sy) * 0.12;
        const j = ((a.seed ^ b.seed) % 100) / 100 - 0.5;
        g.quadraticCurveTo(mx + j * sag, my + sag, b.sx, b.sy);
      } else {
        g.lineTo(b.sx, b.sy);
      }
      g.stroke();
    }

    // nodes — low-degree first so hubs land on top
    const order = [...this.nodes].sort((p, q) => p.degree - q.degree);
    for (const n of order) {
      const lit = !dimming || this._visible(n);
      const color = lit ? this._typeColor.get(n.type) : DIM_NODE;
      if (this.options.nodeShape === 'glyph') {
        const size = 9 + n.r;
        g.font = `${size}px 'Courier New', monospace`;
        g.textAlign = 'center';
        g.textBaseline = 'middle';
        g.fillStyle = color;
        g.fillText(n.glyph, n.sx, n.sy);
      } else {
        g.beginPath();
        g.arc(n.sx, n.sy, n.r, 0, TAU);
        g.fillStyle = color;
        g.fill();
      }
      if (n === this._hover || n === this._selected) {
        g.beginPath();
        g.arc(n.sx, n.sy, n.r + 6, 0, TAU);
        g.strokeStyle = HIGHLIGHT;   // accent: highlight only
        g.lineWidth = 1.5;
        g.stroke();
        g.lineWidth = 0.5;
      }
    }

    this._drawLabels();
  }

  _drawLabels() {
    const g = this.ctx;
    const mode = this.options.labels;
    if (mode === 'none') return;
    const targets = mode === 'always' ? this.nodes
      : (this._hover ? [this._hover] : this._selected ? [this._selected] : []);

    g.font = "11px 'Courier New', monospace";
    g.textAlign = 'left';
    g.textBaseline = 'middle';
    for (const n of targets) {
      g.fillStyle = '#ffffff';   // decoded text is white
      g.fillText(this._labelText(n), n.sx + n.r + 8, n.sy);
    }
  }

  /** Hovered labels decode out of corruption instead of just appearing. */
  _labelText(n) {
    if (!this.options.labelDecode || !this._decode || this._decode.node !== n) return n.id;
    const t = this._decode.t;
    if (t >= 1) return n.id;
    const set = CorruptionCharsets[this.options.glyphSet] || CorruptionCharsets.katakana;
    const shown = Math.floor(n.id.length * t);
    let out = n.id.slice(0, shown);
    for (let i = shown; i < n.id.length; i++) {
      out += n.id[i] === ' ' ? ' ' : set[Math.floor(Math.random() * set.length)];
    }
    return out;
  }

  /* ── Interaction ─────────────────────────────────────────────────────── */

  _local(e) {
    const r = this.canvas.getBoundingClientRect();
    return { x: e.clientX - r.left, y: e.clientY - r.top };
  }

  _onPointerDown(e) {
    const p = this._local(e);
    const hit = this.options.interactive.select ? this.nodeAt(p.x, p.y) : null;
    if (hit) {
      this._selected = hit;
      if (this.options.onSelect) this.options.onSelect(hit.data);
    } else {
      if (this._selected && this.options.onSelect) this.options.onSelect(null);
      this._selected = null;
      if (this.options.interactive.pan) {
        this._pan = { x: e.clientX, y: e.clientY };
        capturePointer(this.canvas, e.pointerId);
      }
    }
    if (!this._running) this._draw();
  }

  _onPointerMove(e) {
    if (this._pan) {
      this._view.x += e.clientX - this._pan.x;
      this._view.y += e.clientY - this._pan.y;
      this._pan = { x: e.clientX, y: e.clientY };
      if (!this._running) this._draw();
      return;
    }
    if (!this.options.interactive.hover) return;
    const p = this._local(e);
    const hit = this.nodeAt(p.x, p.y);
    if (hit !== this._hover) {
      this._hover = hit;
      this._decode = hit && this.options.labelDecode ? { node: hit, t: 0 } : null;
      if (this.options.onHover) this.options.onHover(hit ? hit.data : null);
      if (!this._running) this._draw();
    }
  }

  _onPointerUp() { this._pan = null; }

  _onWheel(e) {
    e.preventDefault();
    const [lo, hi] = this.options.zoomRange;
    const p = this._local(e);
    const k = Math.min(hi, Math.max(lo, this._view.k * (e.deltaY < 0 ? 1.1 : 1 / 1.1)));
    // Keep the point under the cursor fixed while zooming.
    const ratio = k / this._view.k;
    this._view.x = p.x - (p.x - this._view.x) * ratio;
    this._view.y = p.y - (p.y - this._view.y) * ratio;
    this._view.k = k;
    if (!this._running) this._draw();
  }
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { CorruptedGraph };
}
