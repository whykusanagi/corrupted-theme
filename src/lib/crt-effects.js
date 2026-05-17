// src/lib/crt-effects.js
// CRT post-processing effects — scanlines, chromatic aberration, flicker, vignette, pixel distortion
// Ported from celeste-tts-bot/obs/transitions/crt-effects.js
// Part of @whykusanagi/corrupted-theme (0.2.0)
//
// API:
//   new CRTEffects(containerEl, options)
//   instance.start()          — create scanlines + vignette overlays, begin flicker if enabled
//   instance.stop()           — pause flicker; overlays remain
//   instance.destroy()        — full cleanup, remove overlays, reset styles
//
//   CRTEffects.prototype.createScanlines()
//   CRTEffects.prototype.applyChromaticAberration(element, intensity)
//   CRTEffects.prototype.startFlicker(element, intensity, frequency)
//   CRTEffects.prototype.stopFlicker(element)
//   CRTEffects.prototype.applyPixelDistortion(canvas)
//   CRTEffects.prototype.applyCRTGlow(element, color, intensity)
//   CRTEffects.prototype.addPhosphorTrail(canvas, color)
//   CRTEffects.prototype.applyVignette(element, intensity)
//   CRTEffects.prototype.animateRGBSplit(element, duration)
//   CRTEffects.prototype.screenShake(element, duration, intensity)
//   CRTEffects.prototype.cleanup()   — alias for destroy(), per upstream API
//
//   applyCRTGlow(element, color, intensity) — standalone helper (no class needed)

// ─── Canonical color tokens (spec-defined) ────────────────────────────────────
const CORRUPTED_MAGENTA2 = '#d94f90'; // --corrupted-magenta2 high-energy glow
const CORRUPTED_PURPLE   = '#8b5cf6'; // --corrupted-purple  secondary glow
const CORRUPTED_MAGENTA  = '#ff00ff'; // --corrupted-magenta outer glow

// ─── CSS injection (keyframes + utility classes) ──────────────────────────────
// Static keyframes live in animations.css; this function ensures the
// runtime-only .crt-* rules are present when JS is loaded from a CDN/bundle
// that does not include the CSS file.
const _STYLE_ID = 'crt-effects-styles';

export function injectCRTStyles() {
  if (typeof document === 'undefined') return;
  if (document.getElementById(_STYLE_ID)) return;

  const style = document.createElement('style');
  style.id = _STYLE_ID;
  style.textContent = `
    .crt-screen {
      position: relative;
      overflow: hidden;
      background: #000;
    }

    .crt-phosphor-glow {
      filter:
        brightness(1.2)
        drop-shadow(0 0 10px ${CORRUPTED_MAGENTA2})
        drop-shadow(0 0 20px ${CORRUPTED_PURPLE})
        drop-shadow(0 0 30px ${CORRUPTED_MAGENTA});
    }

    .crt-text {
      font-family: 'Courier New', 'Consolas', monospace;
      color: #ffffff;
      text-shadow:
        -1px -1px 0 #000000,
         1px -1px 0 #000000,
        -1px  1px 0 #000000,
         1px  1px 0 #000000,
        0 0 10px ${CORRUPTED_MAGENTA2},
        0 0 20px ${CORRUPTED_PURPLE},
        0 0 30px ${CORRUPTED_MAGENTA},
        0 0 40px #00ffff40;
      letter-spacing: 2px;
    }

    .chromatic-aberration {
      position: relative;
    }

    .chromatic-aberration::before,
    .chromatic-aberration::after {
      content: attr(data-text);
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
    }

    .chromatic-aberration::before {
      color: #ff0000;
      transform: translateX(-2px);
      opacity: 0.7;
      mix-blend-mode: screen;
    }

    .chromatic-aberration::after {
      color: #00ffff;
      transform: translateX(2px);
      opacity: 0.5;
      mix-blend-mode: screen;
    }
  `;

  document.head.appendChild(style);
}

// ─── CRTEffects class ─────────────────────────────────────────────────────────

export class CRTEffects {
  /**
   * @param {HTMLElement|null} container  — target element for overlay nodes;
   *                                        pass null for Node.js environments
   * @param {object}           [options]
   * @param {boolean}          [options.autoStart=false]  — call start() on construction
   * @param {boolean}          [options.scanlines=true]   — include scanline overlay
   * @param {boolean}          [options.vignette=true]    — include vignette overlay
   * @param {number}           [options.vignetteIntensity=0.3]
   * @param {boolean}          [options.flicker=false]    — enable opacity flicker
   * @param {number}           [options.flickerIntensity=0.05]
   * @param {number}           [options.flickerFrequency=100]  — ms base interval
   */
  constructor(container, options = {}) {
    this.container = container;
    this._destroyed = false;

    this._opts = {
      autoStart:        options.autoStart        ?? false,
      scanlines:        options.scanlines        ?? true,
      vignette:         options.vignette         ?? true,
      vignetteIntensity: options.vignetteIntensity ?? 0.3,
      flicker:          options.flicker          ?? false,
      flickerIntensity: options.flickerIntensity ?? 0.05,
      flickerFrequency: options.flickerFrequency ?? 100,
    };

    // Internal effect handles
    this._effects = {
      scanlines: null,   // DOM node
      vignette:  null,   // DOM node
      flicker:   false,  // running flag
    };

    this._flickerTimeoutId = null;

    if (this._opts.autoStart) this.start();
  }

  // ── Lifecycle ──────────────────────────────────────────────────────────────

  /** Attach overlay DOM nodes and begin configured effects. */
  start() {
    if (this._destroyed || typeof document === 'undefined' || !this.container) return;

    injectCRTStyles();

    if (this._opts.scanlines && !this._effects.scanlines) {
      this.createScanlines();
    }
    if (this._opts.vignette && !this._effects.vignette) {
      this._effects.vignette = this.applyVignette(this.container, this._opts.vignetteIntensity);
    }
    if (this._opts.flicker) {
      this.startFlicker(this.container, this._opts.flickerIntensity, this._opts.flickerFrequency);
    }
  }

  /** Pause flicker; leave DOM overlays in place. */
  stop() {
    if (this._destroyed) return;
    if (this._effects.flicker && this.container) {
      this.stopFlicker(this.container);
    }
  }

  /** Full teardown — removes overlays, resets styles, marks destroyed. */
  destroy() {
    if (this._destroyed) return;
    this._destroyed = true;
    this.cleanup();
  }

  // ── Effect primitives ──────────────────────────────────────────────────────

  /** Append a scanline overlay div to `this.container`. */
  createScanlines() {
    if (typeof document === 'undefined' || !this.container) return null;

    const scanlines = document.createElement('div');
    scanlines.className = 'crt-scanlines';
    scanlines.style.cssText = `
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      pointer-events: none;
      background: repeating-linear-gradient(
        0deg,
        rgba(0, 0, 0, 0.15) 0px,
        rgba(0, 0, 0, 0.15) 1px,
        transparent 1px,
        transparent 2px
      );
      animation: scanline-movement 8s linear infinite;
      z-index: 1000;
    `;

    this._effects.scanlines = scanlines;
    this.container.appendChild(scanlines);
    return scanlines;
  }

  /**
   * Apply RGB-split chromatic aberration filter to an element.
   * @param {HTMLElement} element
   * @param {number}      [intensity=2]  — pixel offset
   */
  applyChromaticAberration(element, intensity = 2) {
    element.style.filter = `
      drop-shadow(${intensity}px 0 0 red)
      drop-shadow(-${intensity}px 0 0 cyan)
    `;
    element.style.setProperty('--chroma-offset', `${intensity}px`);
  }

  /**
   * Start random-interval opacity flicker on an element.
   * @param {HTMLElement} element
   * @param {number}      [intensity=0.05]   — max opacity reduction
   * @param {number}      [frequency=100]    — base interval in ms
   */
  startFlicker(element, intensity = 0.05, frequency = 100) {
    if (typeof setTimeout === 'undefined') return;

    const tick = () => {
      if (!this._effects.flicker || this._destroyed) return;
      element.style.opacity = String(1 - Math.random() * intensity);
      const nextDelay = frequency + Math.random() * frequency;
      this._flickerTimeoutId = setTimeout(tick, nextDelay);
    };

    this._effects.flicker = true;
    this._flickerTimeoutId = setTimeout(tick, 0);
  }

  /**
   * Stop opacity flicker and restore element opacity.
   * @param {HTMLElement} element
   */
  stopFlicker(element) {
    this._effects.flicker = false;
    if (this._flickerTimeoutId !== null && this._flickerTimeoutId !== undefined) {
      clearTimeout(this._flickerTimeoutId);
      this._flickerTimeoutId = null;
    }
    if (element) element.style.opacity = '1';
  }

  /**
   * Apply random horizontal pixel-row displacement to a canvas (glitch slice).
   * @param {HTMLCanvasElement} canvas
   */
  applyPixelDistortion(canvas) {
    if (typeof document === 'undefined') return;

    const ctx      = canvas.getContext('2d');
    const imgData  = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const numLines = 5 + Math.floor(Math.random() * 10);

    for (let i = 0; i < numLines; i++) {
      const y      = Math.floor(Math.random() * canvas.height);
      const offset = Math.floor(Math.random() * 20) - 10;
      const height = 1 + Math.floor(Math.random() * 3);

      for (let row = y; row < Math.min(y + height, canvas.height); row++) {
        const rowStart = row * canvas.width * 4;
        const rowData  = imgData.data.slice(rowStart, rowStart + canvas.width * 4);

        for (let x = 0; x < canvas.width; x++) {
          const srcX    = (x + offset + canvas.width) % canvas.width;
          const destIdx = (row * canvas.width + x) * 4;
          const srcIdx  = srcX * 4;

          imgData.data[destIdx]     = rowData[srcIdx];
          imgData.data[destIdx + 1] = rowData[srcIdx + 1];
          imgData.data[destIdx + 2] = rowData[srcIdx + 2];
          imgData.data[destIdx + 3] = rowData[srcIdx + 3];
        }
      }
    }

    ctx.putImageData(imgData, 0, 0);
  }

  /**
   * Apply phosphor glow filter to an element (instance method variant).
   * @param {HTMLElement} element
   * @param {string}      [color=CORRUPTED_MAGENTA2]
   * @param {number}      [intensity=20]
   */
  applyCRTGlow(element, color = CORRUPTED_MAGENTA2, intensity = 20) {
    element.style.filter = `
      brightness(1.1)
      drop-shadow(0 0 ${intensity}px ${color})
      drop-shadow(0 0 ${intensity * 2}px ${color})
    `;
  }

  /**
   * Overlay semi-transparent color fill on a canvas to simulate phosphor trail.
   * @param {HTMLCanvasElement} canvas
   * @param {string}            [color='rgba(217, 79, 144, 0.1)']
   */
  addPhosphorTrail(canvas, color = 'rgba(217, 79, 144, 0.1)') {
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = color;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }

  /**
   * Append a radial-gradient vignette overlay to `container`.
   * @param {HTMLElement} element     — container to append overlay to
   * @param {number}      [intensity=0.3]
   * @returns {HTMLElement|null}      the vignette node
   */
  applyVignette(element, intensity = 0.3) {
    if (typeof document === 'undefined' || !element) return null;

    const vignette = document.createElement('div');
    vignette.className = 'crt-vignette';
    vignette.style.cssText = `
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      pointer-events: none;
      background: radial-gradient(
        ellipse at center,
        transparent 0%,
        transparent 50%,
        rgba(0, 0, 0, ${intensity}) 100%
      );
      z-index: 999;
    `;

    element.appendChild(vignette);
    return vignette;
  }

  /**
   * Animate RGB split for a short duration at ~60fps using rAF.
   * @param {HTMLElement} element
   * @param {number}      [duration=200]  — ms
   */
  animateRGBSplit(element, duration = 200) {
    if (typeof requestAnimationFrame === 'undefined') return;

    let frame = 0;
    const maxFrames = duration / 16;

    const animate = () => {
      if (this._destroyed || frame >= maxFrames) {
        element.style.filter = 'none';
        return;
      }
      this.applyChromaticAberration(element, 2 + Math.random() * 8);
      frame++;
      requestAnimationFrame(animate);
    };

    animate();
  }

  /**
   * Shake element via random transform offsets for a fixed duration.
   * @param {HTMLElement} element
   * @param {number}      [duration=300]   — ms
   * @param {number}      [intensity=5]    — max px displacement
   */
  screenShake(element, duration = 300, intensity = 5) {
    if (typeof requestAnimationFrame === 'undefined') return;

    const originalTransform = element.style.transform || '';
    let startTime = null;

    const shake = (timestamp) => {
      if (this._destroyed) {
        element.style.transform = originalTransform;
        return;
      }
      if (!startTime) startTime = timestamp;
      const elapsed = timestamp - startTime;

      if (elapsed >= duration) {
        element.style.transform = originalTransform;
        return;
      }

      const x = (Math.random() - 0.5) * intensity * 2;
      const y = (Math.random() - 0.5) * intensity * 2;
      element.style.transform = `${originalTransform} translate(${x}px, ${y}px)`;

      requestAnimationFrame(shake);
    };

    requestAnimationFrame(shake);
  }

  /**
   * Remove all injected overlays and reset container styles.
   * Alias for destroy() — kept for upstream API compatibility.
   */
  cleanup() {
    if (this._effects.scanlines) {
      this._effects.scanlines.remove();
      this._effects.scanlines = null;
    }

    if (this._effects.flicker && this.container) {
      this.stopFlicker(this.container);
    }

    if (this.container) {
      // Remove any vignette nodes added via applyVignette
      if (typeof this.container.querySelectorAll === 'function') {
        this.container.querySelectorAll('.crt-vignette').forEach(v => v.remove());
      }
      this.container.style.filter    = '';
      this.container.style.opacity   = '1';
      this.container.style.transform = '';
    }

    this._effects.vignette = null;
  }
}

// ─── Standalone helper ────────────────────────────────────────────────────────

/**
 * Apply a phosphor glow filter to any element without needing a CRTEffects instance.
 *
 * @param {HTMLElement} element
 * @param {string}      [color='#d94f90']  — glow color (default: --corrupted-magenta2)
 * @param {number}      [intensity=20]     — drop-shadow blur radius in px
 */
export function applyCRTGlow(element, color = CORRUPTED_MAGENTA2, intensity = 20) {
  element.style.filter = `
    brightness(1.1)
    drop-shadow(0 0 ${intensity}px ${color})
    drop-shadow(0 0 ${intensity * 2}px ${color})
  `;
}

// ─── CJS interop stub ─────────────────────────────────────────────────────────
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { CRTEffects, applyCRTGlow, injectCRTStyles };
}
