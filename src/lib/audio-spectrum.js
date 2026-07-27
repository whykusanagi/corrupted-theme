/**
 * AudioSpectrum — canvas spectrum driven by real audio.
 *
 * `SpectrumTerminal` and `WaveformOscilloscope` draw plausible-looking
 * waveforms from `Math.sin`. This one reads an actual `AnalyserNode`, so the
 * bars follow the audio that is genuinely playing. `.levels` exposes bass,
 * mid, treble and rms for driving other components — feed it to
 * `corrupted-theme/lipsync` to turn amplitude into any 0..1 property.
 *
 * ## Privacy
 *
 * This component never calls `getUserMedia`. A microphone is a capture
 * surface and a permission prompt, so obtaining a `MediaStream` stays the
 * caller's explicit decision; pass one in if you want mic input.
 *
 * ## The media-element footgun
 *
 * `createMediaElementSource` REROUTES an element's output into the graph. If
 * you do not reconnect to `destination` the audio goes silent, which reads as
 * "the component broke my audio". `reconnectDestination` defaults to true so
 * that cannot happen by accident.
 *
 * @example
 *   import { AudioSpectrum } from '@whykusanagi/corrupted-theme/audio-spectrum';
 *   const spectrum = new AudioSpectrum(canvas, { source: audioEl });
 *   await spectrum.resume();   // browsers require a user gesture
 *   spectrum.start();
 *
 * @module lib/audio-spectrum
 * @version 0.3.2
 * @author whykusanagi
 * @license MIT
 *
 * @composes lipsync — the pure amplitude→target math behind `.levels`
 */

import { fitCanvas } from './_canvas-sizing.js';

/* Theme colours carry the bars; cyan marks only the peak band, which is the
   one place an accent belongs. See CORRUPTED_THEME_SPEC.md "Color Palette". */
const DEFAULT_PALETTE = ['#ffffff', '#d94f90', '#ff00ff'];
const PEAK = '#00ffff';

/**
 * @class AudioSpectrum
 * @param {HTMLCanvasElement|null} canvas
 * @param {object} [options={}]
 * @param {HTMLMediaElement|MediaStream|AudioNode|null} [options.source=null]
 * @param {number}  [options.fftSize=256]     - power of two, 32..32768
 * @param {number}  [options.bands=48]        - drawn bars
 * @param {number}  [options.smoothing=0.8]   - AnalyserNode smoothing, 0..1
 * @param {'bars'|'mirror'|'terminal'} [options.style='bars']
 * @param {string[]} [options.palette]        - low → high colour ramp
 * @param {boolean} [options.reconnectDestination=true] - keep audio audible
 * @param {boolean|'auto'} [options.reducedMotion='auto']
 *
 * @property {{bass:number, mid:number, treble:number, rms:number}} levels -
 *   Read fresh every frame while running, each 0..1. Feed to any component or
 *   helper that takes a normalised level; pairs with the `lipsync` module.
 */
export class AudioSpectrum {
  constructor(canvas, options = {}) {
    this.canvas = canvas;
    this.ctx = canvas ? canvas.getContext('2d') : null;

    this.options = {
      source: options.source ?? null,
      fftSize: normaliseFftSize(options.fftSize),
      bands: Math.max(4, Math.min(256, options.bands ?? 48)),
      smoothing: Math.min(1, Math.max(0, options.smoothing ?? 0.8)),
      style: options.style ?? 'bars',
      palette: Array.isArray(options.palette) && options.palette.length
        ? options.palette : DEFAULT_PALETTE,
      bandRanges: { bass: [0, 0.1], mid: [0.1, 0.4], treble: [0.4, 1], ...(options.bandRanges || {}) },
      reconnectDestination: options.reconnectDestination ?? true,
      reducedMotion: options.reducedMotion ?? 'auto',
    };

    /** @type {{bass:number, mid:number, treble:number, rms:number}} */
    this.levels = { bass: 0, mid: 0, treble: 0, rms: 0 };

    this._audioCtx = null;
    this._analyser = null;
    this._sourceNode = null;
    this._ownsContext = false;
    this._freq = null;
    this._raf = null;
    this._running = false;
    this._destroyed = false;
    this._cssW = 0;
    this._cssH = 0;
    this._resizeObserver = null;
    this._intersectionObserver = null;

    if (this.canvas) this.init();
  }

  /* ── Public API ──────────────────────────────────────────────────────── */

  init() {
    this._resize();
    this._resizeObserver = new ResizeObserver(() => this._resize());
    this._resizeObserver.observe(this.canvas);
    this._intersectionObserver = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting) this.start();
      else this.stop();
    }, { threshold: 0.1 });
    this._intersectionObserver.observe(this.canvas);
  }

  /**
   * Resume the AudioContext. Browsers start it suspended until a user
   * gesture, so call this from a click or keypress handler.
   * @returns {Promise<void>}
   */
  async resume() {
    this._ensureGraph();
    if (this._audioCtx && this._audioCtx.state === 'suspended') {
      await this._audioCtx.resume();
    }
  }

  /**
   * Replace the audio source. Accepts a media element, a MediaStream the
   * caller already obtained, or an existing AudioNode.
   * @param {HTMLMediaElement|MediaStream|AudioNode|null} source
   */
  setSource(source) {
    this.options.source = source ?? null;
    if (this._sourceNode) {
      try { this._sourceNode.disconnect(); } catch { /* already detached */ }
      this._sourceNode = null;
    }
    this._ensureGraph();
    return this;
  }

  /** Start drawing. Idempotent. */
  start() {
    if (this._destroyed || this._running || !this.ctx) return this;
    this._ensureGraph();
    if (this._prefersReducedMotion()) { this._sample(); this._draw(); return this; }
    this._running = true;
    const tick = () => {
      if (!this._running) return;
      this._sample();
      this._draw();
      this._raf = requestAnimationFrame(tick);
    };
    this._raf = requestAnimationFrame(tick);
    return this;
  }

  /** Stop drawing. The audio graph stays connected. Reusable. */
  stop() {
    this._running = false;
    if (this._raf !== null) { cancelAnimationFrame(this._raf); this._raf = null; }
  }

  /** Tear down. Only closes the AudioContext if this instance created it. */
  destroy() {
    if (this._destroyed) return;
    this.stop();
    if (this._resizeObserver) { this._resizeObserver.disconnect(); this._resizeObserver = null; }
    if (this._intersectionObserver) { this._intersectionObserver.disconnect(); this._intersectionObserver = null; }
    if (this._sourceNode) {
      try { this._sourceNode.disconnect(); } catch { /* already detached */ }
    }
    if (this._ownsContext && this._audioCtx) {
      try { this._audioCtx.close(); } catch { /* already closed */ }
    }
    this._destroyed = true;
    this._analyser = null;
    this._sourceNode = null;
    this._audioCtx = null;
    this.canvas = null;
    this.ctx = null;
  }

  /* ── Internals ───────────────────────────────────────────────────────── */

  _prefersReducedMotion() {
    if (this.options.reducedMotion !== 'auto') return !!this.options.reducedMotion;
    return typeof matchMedia === 'function' && matchMedia('(prefers-reduced-motion: reduce)').matches;
  }

  /** Build the graph lazily — constructing an AudioContext is a side effect. */
  _ensureGraph() {
    if (this._destroyed || this._analyser || !this.options.source) return;
    const Ctx = typeof AudioContext !== 'undefined' ? AudioContext
      : (typeof webkitAudioContext !== 'undefined' ? webkitAudioContext : null);
    if (!Ctx) return;

    const src = this.options.source;
    const isNode = typeof AudioNode !== 'undefined' && src instanceof AudioNode;

    // An AudioNode already belongs to a context, and nodes cannot be connected
    // across contexts. Join the caller's context rather than creating one —
    // creating our own here throws InvalidAccessError on the first connect.
    if (isNode) {
      this._audioCtx = src.context;
      this._ownsContext = false;
    } else if (!this._audioCtx) {
      this._audioCtx = new Ctx();
      this._ownsContext = true;
    }
    const ac = this._audioCtx;

    this._analyser = ac.createAnalyser();
    this._analyser.fftSize = this.options.fftSize;
    this._analyser.smoothingTimeConstant = this.options.smoothing;
    this._freq = new Uint8Array(this._analyser.frequencyBinCount);

    if (isNode) {
      this._sourceNode = src;
    } else if (typeof MediaStream !== 'undefined' && src instanceof MediaStream) {
      this._sourceNode = ac.createMediaStreamSource(src);
    } else if (src && typeof src.play === 'function') {
      this._sourceNode = ac.createMediaElementSource(src);
    } else {
      return;
    }

    this._sourceNode.connect(this._analyser);
    // Without this the element's audio is swallowed by the graph and goes
    // silent. Streams are not reconnected: that would echo a live mic.
    if (this.options.reconnectDestination && !(typeof MediaStream !== 'undefined' && src instanceof MediaStream)) {
      this._analyser.connect(ac.destination);
    }
  }

  _sample() {
    if (!this._analyser || !this._freq) return;
    this._analyser.getByteFrequencyData(this._freq);
    const n = this._freq.length;
    const { bass, mid, treble } = this.options.bandRanges;
    const avg = ([lo, hi]) => {
      const a = Math.floor(lo * n), b = Math.max(a + 1, Math.floor(hi * n));
      let sum = 0;
      for (let i = a; i < b && i < n; i++) sum += this._freq[i];
      return sum / ((b - a) * 255);
    };
    let sq = 0;
    for (let i = 0; i < n; i++) { const v = this._freq[i] / 255; sq += v * v; }
    this.levels = {
      bass: avg(bass), mid: avg(mid), treble: avg(treble),
      rms: Math.sqrt(sq / n),
    };
  }

  /** Down-sample the FFT bins into the drawn band count. */
  _bands() {
    const out = new Array(this.options.bands).fill(0);
    if (!this._freq) return out;
    const per = this._freq.length / this.options.bands;
    for (let i = 0; i < this.options.bands; i++) {
      const a = Math.floor(i * per), b = Math.max(a + 1, Math.floor((i + 1) * per));
      let sum = 0;
      for (let j = a; j < b && j < this._freq.length; j++) sum += this._freq[j];
      out[i] = sum / ((b - a) * 255);
    }
    return out;
  }

  _colorFor(v) {
    const p = this.options.palette;
    return p[Math.min(p.length - 1, Math.floor(v * p.length))];
  }

  _resize() {
    const fit = fitCanvas(this.canvas, this.ctx, { state: this });
    if (!fit) return;
    this._cssW = fit.w;
    this._cssH = fit.h;
    if (!this._running) this._draw();
  }

  _draw() {
    const g = this.ctx;
    if (!g || this._cssW === 0) return;
    const w = this._cssW, h = this._cssH;
    g.clearRect(0, 0, w, h);

    const bands = this._bands();
    const peak = bands.indexOf(Math.max(...bands));
    const bw = w / bands.length;

    if (this.options.style === 'terminal') {
      // Column of blocks per band — the readout register.
      const rows = 12;
      for (let i = 0; i < bands.length; i++) {
        const lit = Math.round(bands[i] * rows);
        for (let r = 0; r < lit; r++) {
          g.fillStyle = i === peak && r === lit - 1 ? PEAK : this._colorFor(r / rows);
          g.fillRect(i * bw + 1, h - (r + 1) * (h / rows) + 1, bw - 2, h / rows - 2);
        }
      }
      return;
    }

    for (let i = 0; i < bands.length; i++) {
      const v = bands[i];
      const bh = Math.max(1, v * h * (this.options.style === 'mirror' ? 0.5 : 1));
      g.fillStyle = i === peak ? PEAK : this._colorFor(v);
      if (this.options.style === 'mirror') {
        g.fillRect(i * bw + 1, h / 2 - bh, bw - 2, bh);
        g.fillRect(i * bw + 1, h / 2, bw - 2, bh);
      } else {
        g.fillRect(i * bw + 1, h - bh, bw - 2, bh);
      }
    }
  }
}

/** Clamp to a power of two in the range AnalyserNode accepts. */
function normaliseFftSize(v) {
  const n = Number.isFinite(v) ? v : 256;
  const p = Math.round(Math.log2(Math.min(32768, Math.max(32, n))));
  return 2 ** Math.min(15, Math.max(5, p));
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { AudioSpectrum };
}
