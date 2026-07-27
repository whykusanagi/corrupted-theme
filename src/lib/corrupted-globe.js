/**
 * CorruptedGlobe — orthographic wireframe globe with great-circle arcs.
 *
 * A slowly rotating sphere drawn as a graticule, with animated arcs that
 * travel between latitude/longitude pairs along true great-circle paths and
 * land with an impact ring. Points and arcs are colour-ramped by weight, so
 * the globe reads as traffic converging on (or radiating from) a location.
 *
 * Canvas 2D, no dependency, no map data — the sphere is a graticule rather
 * than a coastline, which keeps it weightless and on-aesthetic.
 *
 * @example Traffic converging on one location
 *   import { CorruptedGlobe } from '@whykusanagi/corrupted-theme/corrupted-globe';
 *   const globe = new CorruptedGlobe(canvasEl, {
 *     origin: { lat: 37.77, lon: -122.42 },
 *     points: [{ lat: 51.5, lon: -0.13, weight: 0.8 }],
 *   });
 *   globe.start();
 *   globe.fire({ lat: 51.5, lon: -0.13 }, { weight: 0.8 });
 *
 * @module lib/corrupted-globe
 * @version 0.3.2
 * @author whykusanagi
 * @license MIT
 *
 * @composes CorruptedMandala — the other radial-geometry surface; the globe
 *   is spatial/data-driven where the mandala is symbolic
 */

const TAU = Math.PI * 2;
const D2R = Math.PI / 180;

const DEFAULT_PALETTE = {
  sphere:    'rgba(8,6,18,0.82)',
  limb:      'rgba(0,255,255,0.28)',  // the one cyan accent — spec: highlight use only
  graticule: 'rgba(139,92,246,0.16)',
  glowInner: 'rgba(139,92,246,0.10)',
  glowOuter: 'rgba(139,92,246,0.05)',
  origin:     'rgba(0,255,0,0.9)',    // green = system reference (spec)
  originRing: '0,255,0',   // rgb triplet — alpha is animated by the pulse
  impact:     '255,0,255', // rgb triplet — alpha is animated by ring expansion
  // Volume ramp reads as rising corruption: stable white -> playful magenta2
  // -> primary magenta. Per CORRUPTED_THEME_SPEC.md "Color Palette".
  ramp: [
    'rgba(255,255,255,0.75)', // low    — white, stable/quiet
    'rgba(217,79,144,0.85)',  // mid    — magenta2, high-energy
    'rgba(255,0,255,0.95)',   // high   — magenta, primary corruption
  ],
};

const isLatLon = p =>
  p && Number.isFinite(p.lat) && Number.isFinite(p.lon) &&
  p.lat >= -90 && p.lat <= 90 && p.lon >= -180 && p.lon <= 180;

/**
 * @class CorruptedGlobe
 * @param {HTMLCanvasElement|null} canvas - Target canvas
 * @param {object}  [options={}]
 * @param {{lat:number,lon:number}} [options.origin={lat:0,lon:0}] - Default arc endpoint
 * @param {Array<{lat:number,lon:number,weight?:number,color?:string}>} [options.points=[]] - Static markers
 * @param {number}  [options.spin=0.0009]   - Rotation in radians per ms; 0 = static
 * @param {number}  [options.tilt=-18]      - Axial tilt in degrees
 * @param {number}  [options.radius=0.42]   - Globe radius as a fraction of min(w, h)
 * @param {{parallels:number,meridians:number}|false} [options.graticule] - Grid step in degrees
 * @param {object}  [options.arc]           - Arc behaviour
 * @param {number}  [options.arc.lift=0.22]     - Peak altitude, fraction of globe radius
 * @param {number}  [options.arc.duration=1400] - Flight time in ms
 * @param {number}  [options.arc.trail=0.42]    - Visible fraction trailing the head
 * @param {number}  [options.arc.steps=44]      - Polyline resolution
 * @param {boolean} [options.arc.impactRing=true] - Expanding ring on landing
 * @param {object}  [options.palette]       - Colour overrides; see DEFAULT_PALETTE
 * @param {{drag:boolean}} [options.interactive] - Pointer drag to rotate
 * @param {boolean|'auto'} [options.reducedMotion='auto'] - Honour prefers-reduced-motion
 */
export class CorruptedGlobe {
  constructor(canvas, options = {}) {
    this.canvas = canvas;
    this.ctx = canvas ? canvas.getContext('2d') : null;

    const arc = options.arc || {};
    this.options = {
      origin:   isLatLon(options.origin) ? options.origin : { lat: 0, lon: 0 },
      spin:     options.spin ?? 0.0009,
      tilt:     (options.tilt ?? -18) * D2R,
      radius:   options.radius ?? 0.42,
      graticule: options.graticule === false
        ? false
        : { parallels: 30, meridians: 30, ...(options.graticule || {}) },
      arc: {
        lift:       arc.lift ?? 0.22,
        duration:   arc.duration ?? 1400,
        trail:      arc.trail ?? 0.42,
        steps:      arc.steps ?? 44,
        impactRing: arc.impactRing ?? true,
      },
      palette:     { ...DEFAULT_PALETTE, ...(options.palette || {}) },
      interactive: { drag: true, ...(options.interactive || {}) },
      reducedMotion: options.reducedMotion ?? 'auto',
    };

    this.rot = 0;
    this.arcs = [];
    this.points = [];
    this.setPoints(options.points || []);

    this._raf = null;
    this._last = 0;
    this._running = false;
    this._destroyed = false;
    this._cssW = 0;
    this._cssH = 0;
    this._R = 0;
    this._drag = null;
    this._resizeObserver = null;
    this._intersectionObserver = null;

    this._onPointerDown = this._onPointerDown.bind(this);
    this._onPointerMove = this._onPointerMove.bind(this);
    this._onPointerUp   = this._onPointerUp.bind(this);

    if (this.canvas) this.init();
  }

  /* ── Public API ──────────────────────────────────────────────────────── */

  init() {
    this._resize();

    if (this.options.interactive.drag) {
      this.canvas.addEventListener('pointerdown', this._onPointerDown);
      this.canvas.addEventListener('pointermove', this._onPointerMove);
      this.canvas.addEventListener('pointerup',     this._onPointerUp);
      this.canvas.addEventListener('pointercancel', this._onPointerUp);
    }

    this._resizeObserver = new ResizeObserver(() => this._resize());
    this._resizeObserver.observe(this.canvas);

    this._intersectionObserver = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting) { this.start(); }
      else                           { this.stop();  }
    }, { threshold: 0.1 });
    this._intersectionObserver.observe(this.canvas);
  }

  /**
   * Start the animation loop. Idempotent.
   * Under reduced motion this paints one settled, readable frame instead of
   * looping — the accessibility contract is a stable end state, not no output.
   * @returns {this}
   */
  start() {
    if (this._destroyed || this._running || !this.ctx) return this;

    if (this._prefersReducedMotion()) {
      this._drawStatic();
      return this;
    }

    this._running = true;
    this._last = performance.now();
    const tick = now => {
      if (!this._running) return;
      const dt = Math.min(now - this._last, 60); // clamp tab-switch jumps
      this._last = now;
      this._draw(dt);
      this._raf = requestAnimationFrame(tick);
    };
    this._raf = requestAnimationFrame(tick);
    return this;
  }

  /** Stop the animation loop. Reusable. */
  stop() {
    this._running = false;
    if (this._raf !== null) {
      cancelAnimationFrame(this._raf);
      this._raf = null;
    }
  }

  /** Tear down and release references. Not reusable after. */
  destroy() {
    if (this._destroyed) return;
    this.stop();
    if (this.canvas && this.options.interactive.drag) {
      this.canvas.removeEventListener('pointerdown', this._onPointerDown);
      this.canvas.removeEventListener('pointermove', this._onPointerMove);
      this.canvas.removeEventListener('pointerup',     this._onPointerUp);
      this.canvas.removeEventListener('pointercancel', this._onPointerUp);
    }
    if (this._resizeObserver)       { this._resizeObserver.disconnect();       this._resizeObserver = null; }
    if (this._intersectionObserver) { this._intersectionObserver.disconnect(); this._intersectionObserver = null; }
    this._destroyed = true;
    this.arcs = [];
    this.points = [];
    this.canvas = null;
    this.ctx = null;
  }

  /**
   * Replace the static marker set. Invalid coordinates are dropped with a
   * warning rather than silently, so bad data is visible in the console.
   * @param {Array<{lat:number,lon:number,weight?:number,color?:string}>} points
   * @returns {this}
   */
  setPoints(points) {
    const list = Array.isArray(points) ? points : [];
    const valid = list.filter(isLatLon);
    if (valid.length !== list.length) {
      console.warn(
        `CorruptedGlobe: dropped ${list.length - valid.length} point(s) with ` +
        'invalid lat/lon (must be finite, lat -90..90, lon -180..180)'
      );
    }
    this.points = valid;
    return this;
  }

  /**
   * Launch an arc. Travels `from` → `to` (defaults to `options.origin`).
   * @param {{lat:number,lon:number}} from
   * @param {object} [opts={}]
   * @param {{lat:number,lon:number}} [opts.to]     - Endpoint; defaults to origin
   * @param {number} [opts.weight=0.5]              - 0..1, drives width and ramp colour
   * @param {string} [opts.color]                   - Explicit colour, overrides the ramp
   * @returns {this}
   */
  fire(from, opts = {}) {
    if (this._destroyed || !isLatLon(from)) return this;
    const to = isLatLon(opts.to) ? opts.to : this.options.origin;
    const weight = Math.min(Math.max(opts.weight ?? 0.5, 0), 1);
    this.arcs.push({
      from,
      to,
      color: opts.color || this.rampColor(weight),
      width: 0.6 + weight * 2.6,
      t: 0,
    });
    return this;
  }

  /**
   * Map a normalised weight onto the palette ramp.
   * @param {number} weight - 0..1
   * @returns {string} rgba colour
   */
  rampColor(weight) {
    const ramp = this.options.palette.ramp;
    const i = Math.min(Math.floor(weight * ramp.length), ramp.length - 1);
    return ramp[i];
  }

  /**
   * Project lat/lon onto the canvas.
   *
   * Orthographic. The `vis` test is deliberately two-part: a point is hidden
   * only when it is behind the sphere AND inside its silhouette. That second
   * clause is what lets a lifted arc stay visible as it crosses the limb —
   * simplifying it to `z > 0` makes arcs vanish at the edge.
   *
   * @param {number} lat
   * @param {number} lon
   * @param {number} [r=1] - Radius multiplier; > 1 lifts the point off the surface
   * @returns {{x:number,y:number,vis:boolean,z:number}}
   */
  proj(lat, lon, r = 1) {
    const p = lat * D2R;
    const l = lon * D2R + this.rot;
    const x = Math.cos(p) * Math.sin(l);
    const y = Math.sin(p);
    const z = Math.cos(p) * Math.cos(l);

    const tilt = this.options.tilt;
    const y2 = y * Math.cos(tilt) - z * Math.sin(tilt);
    const z2 = y * Math.sin(tilt) + z * Math.cos(tilt);

    const px = x * r, py = y2 * r, pz = z2 * r;
    const vis = pz > 0 || Math.hypot(px, py) >= 1;

    return {
      x: this._cssW / 2 + px * this._R,
      y: this._cssH / 2 - py * this._R,
      vis,
      z: pz,
    };
  }

  /**
   * Great-circle interpolation via slerp on unit vectors.
   * @param {number} lat1 @param {number} lon1
   * @param {number} lat2 @param {number} lon2
   * @param {number} t - 0..1
   * @returns {[number, number]} [lat, lon]
   */
  static greatCircle(lat1, lon1, lat2, lon2, t) {
    const v = (la, lo) => {
      const p = la * D2R, l = lo * D2R;
      return [Math.cos(p) * Math.cos(l), Math.cos(p) * Math.sin(l), Math.sin(p)];
    };
    const a = v(lat1, lon1), b = v(lat2, lon2);
    let d = a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
    d = Math.max(-1, Math.min(1, d));
    const o = Math.acos(d);
    if (o < 1e-6) return [lat1, lon1];          // coincident: nothing to interpolate
    const s = Math.sin(o);
    const k1 = Math.sin((1 - t) * o) / s;
    const k2 = Math.sin(t * o) / s;
    const p = [
      a[0] * k1 + b[0] * k2,
      a[1] * k1 + b[1] * k2,
      a[2] * k1 + b[2] * k2,
    ];
    return [Math.asin(p[2]) / D2R, Math.atan2(p[1], p[0]) / D2R];
  }

  /* ── Internals ───────────────────────────────────────────────────────── */

  _prefersReducedMotion() {
    if (this.options.reducedMotion !== 'auto') return !!this.options.reducedMotion;
    return typeof matchMedia === 'function' &&
      matchMedia('(prefers-reduced-motion: reduce)').matches;
  }

  _resize() {
    if (!this.canvas || !this.ctx) return;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const rect = this.canvas.getBoundingClientRect();
    if (rect.width === 0 || rect.height === 0) return;

    this.canvas.width  = Math.round(rect.width  * dpr);
    this.canvas.height = Math.round(rect.height * dpr);
    this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    this._cssW = rect.width;
    this._cssH = rect.height;
    this._R = Math.min(rect.width, rect.height) * this.options.radius;

    if (!this._running) this._drawStatic();
  }

  /** One settled frame: sphere, graticule, points, origin — no arcs in flight. */
  _drawStatic() {
    if (!this.ctx || this._cssW === 0) return;
    this._paintSphere();
    this._paintPoints();
    this._paintOrigin(0.5);
  }

  _draw(dt) {
    if (!this.ctx || this._cssW === 0) return;
    this.rot += this.options.spin * dt;
    this._paintSphere();
    this._paintPoints();
    this._paintOrigin((Math.sin(performance.now() / 380) + 1) / 2);
    this._paintArcs(dt);
  }

  _paintSphere() {
    const g = this.ctx;
    const { palette, graticule } = this.options;
    const cx = this._cssW / 2, cy = this._cssH / 2, R = this._R;

    g.clearRect(0, 0, this._cssW, this._cssH);

    // limb glow
    const grd = g.createRadialGradient(cx, cy, R * 0.6, cx, cy, R * 1.25);
    grd.addColorStop(0, palette.glowInner);
    grd.addColorStop(0.7, palette.glowOuter);
    grd.addColorStop(1, 'rgba(0,0,0,0)');
    g.fillStyle = grd;
    g.beginPath(); g.arc(cx, cy, R * 1.25, 0, TAU); g.fill();

    // sphere body
    g.beginPath(); g.arc(cx, cy, R, 0, TAU);
    g.fillStyle = palette.sphere; g.fill();
    g.strokeStyle = palette.limb; g.lineWidth = 1; g.stroke();

    if (!graticule) return;

    g.strokeStyle = palette.graticule;
    g.lineWidth = 0.6;
    for (let lat = -60; lat <= 60; lat += graticule.parallels) {
      this._strokeArcPath(lat, null);
    }
    for (let lon = -180; lon < 180; lon += graticule.meridians) {
      this._strokeArcPath(null, lon);
    }
  }

  /** Trace one parallel (fixed lat) or meridian (fixed lon), breaking at the limb. */
  _strokeArcPath(fixedLat, fixedLon) {
    const g = this.ctx;
    g.beginPath();
    let started = false;
    if (fixedLat !== null) {
      for (let lon = -180; lon <= 180; lon += 3) {
        started = this._lineSegment(g, this.proj(fixedLat, lon), started);
      }
    } else {
      for (let lat = -90; lat <= 90; lat += 3) {
        started = this._lineSegment(g, this.proj(lat, fixedLon), started);
      }
    }
    g.stroke();
  }

  _lineSegment(g, p, started) {
    if (!p.vis) return false;
    if (started) g.lineTo(p.x, p.y);
    else g.moveTo(p.x, p.y);
    return true;
  }

  _paintPoints() {
    const g = this.ctx;
    for (const m of this.points) {
      const p = this.proj(m.lat, m.lon);
      if (!p.vis) continue;
      const weight = Math.min(Math.max(m.weight ?? 0.5, 0), 1);
      g.beginPath();
      g.arc(p.x, p.y, 1.2 + weight * 3.2, 0, TAU);
      g.fillStyle = m.color || this.rampColor(weight);
      g.fill();
    }
  }

  _paintOrigin(pulse) {
    const g = this.ctx;
    const { origin, palette } = this.options;
    const s = this.proj(origin.lat, origin.lon);
    if (!s.vis) return;

    g.beginPath(); g.arc(s.x, s.y, 4 + pulse * 3, 0, TAU);
    g.fillStyle = palette.origin; g.fill();

    g.beginPath(); g.arc(s.x, s.y, 8 + pulse * 9, 0, TAU);
    g.strokeStyle = `rgba(${palette.originRing},${(0.5 - pulse * 0.4).toFixed(3)})`;
    g.lineWidth = 1; g.stroke();
  }

  _paintArcs(dt) {
    const g = this.ctx;
    const { arc, palette } = this.options;
    const FADE = 0.9;   // extra normalised time spent fading after landing
    const EXPIRE = 1 + FADE + 0.5;

    for (let i = this.arcs.length - 1; i >= 0; i--) {
      const a = this.arcs[i];
      a.t += dt / arc.duration;
      if (a.t > EXPIRE) { this.arcs.splice(i, 1); continue; }

      const head = Math.min(a.t, 1);
      const tail = Math.max(0, a.t - arc.trail);

      g.lineWidth = a.width;
      g.strokeStyle = a.color;
      g.beginPath();
      let started = false;
      for (let k = 0; k <= arc.steps; k++) {
        const t = tail + (head - tail) * (k / arc.steps);
        if (t < 0 || t > 1) continue;
        const [la, lo] = CorruptedGlobe.greatCircle(
          a.from.lat, a.from.lon, a.to.lat, a.to.lon, t
        );
        // Lift in 3D, not screen space, so limb occlusion stays correct
        const lift = 1 + Math.sin(t * Math.PI) * arc.lift;
        started = this._lineSegment(g, this.proj(la, lo, lift), started);
      }
      g.globalAlpha = a.t > 1 ? Math.max(0, 1 - (a.t - 1) / FADE) : 1;
      g.shadowBlur = 8;
      g.shadowColor = a.color;
      g.stroke();
      g.shadowBlur = 0;
      g.globalAlpha = 1;

      if (arc.impactRing && a.t >= 1 && a.t < 1.5) {
        const end = this.proj(a.to.lat, a.to.lon);
        if (end.vis) {
          const k = (a.t - 1) / 0.5;
          g.beginPath(); g.arc(end.x, end.y, 4 + k * 22, 0, TAU);
          g.strokeStyle = `rgba(${palette.impact},${(0.7 * (1 - k)).toFixed(3)})`;
          g.lineWidth = 1.4;
          g.stroke();
        }
      }
    }
  }

  _onPointerDown(e) {
    this._drag = e.clientX;
    if (this.canvas.setPointerCapture) this.canvas.setPointerCapture(e.pointerId);
  }

  _onPointerMove(e) {
    if (this._drag === null) return;
    this.rot += (e.clientX - this._drag) * 0.006;
    this._drag = e.clientX;
    if (!this._running) this._drawStatic();
  }

  _onPointerUp() {
    this._drag = null;
  }
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { CorruptedGlobe };
}
