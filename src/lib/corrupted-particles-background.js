// src/lib/corrupted-particles-background.js
// CorruptedParticlesBackground — Auto-injects CorruptedParticles canvas behind a target element.
// Part of @whykusanagi/corrupted-theme
//
// Layer stack (back to front) matching the reference site implementation:
//   video (.background-media)  z-index: -3
//   particles canvas           z-index:  0  (inserted as sibling *before* target)
//   glass-backdrop             z-index: -1  (sits above canvas via stacking context)
//   page content               z-index: 1+
//
// DPR strategy: the canvas sits behind backdrop-filter:blur() so retina resolution
// is invisible but costs 4×GPU fill rate.  We temporarily shadow window.devicePixelRatio
// to 1 around the CorruptedParticles constructor (which reads it in _resize()), then
// restore the real value so other components are unaffected.

import { CorruptedParticles } from './corrupted-particles.js';

export class CorruptedParticlesBackground {
  /**
   * @param {object} [options]
   * @param {string}  [options.targetSelector='.glass-backdrop']  CSS selector for the element
   *                                                               the canvas is inserted before.
   * @param {boolean} [options.nsfw=false]        Passed through as nsfw to CorruptedParticles.
   * @param {number}  [options.count=25]          Particle count (default lower than CorruptedParticles
   *                                               default because the canvas sits behind blur).
   * @param {number}  [options.speed=0.5]         Particle speed multiplier.
   * @param {number}  [options.lineDistance=100]  Max distance for connection lines.
   * @param {string}  [options.canvasId='particles-bg']  id attribute on the injected canvas.
   */
  constructor(options = {}) {
    this.options = {
      targetSelector: options.targetSelector ?? '.glass-backdrop',
      nsfw:           options.nsfw           ?? false,
      count:          options.count          ?? 25,
      speed:          options.speed          ?? 0.5,
      lineDistance:   options.lineDistance   ?? 100,
      canvasId:       options.canvasId       ?? 'particles-bg',
    };

    this._canvas    = null;
    this._particles = null;
    this._destroyed = false;
    this._onVisibility = null;

    // Node.js / SSR guard — no DOM, nothing to do.
    if (typeof document === 'undefined') return;

    if (document.readyState === 'loading') {
      this._onReady = () => this._init();
      document.addEventListener('DOMContentLoaded', this._onReady);
    } else {
      this._init();
    }
  }

  _init() {
    if (this._destroyed) return;

    // Clean up the readyState listener if it was registered.
    if (this._onReady) {
      document.removeEventListener('DOMContentLoaded', this._onReady);
      this._onReady = null;
    }

    if (typeof CorruptedParticles === 'undefined' && typeof module === 'undefined') {
      // CJS/ESM should always have it via import; guard is belt-and-suspenders.
      console.warn('CorruptedParticlesBackground: CorruptedParticles not available');
      return;
    }

    const target = document.querySelector(this.options.targetSelector);
    if (!target) {
      console.warn(
        `CorruptedParticlesBackground: target "${this.options.targetSelector}" not found`
      );
      return;
    }

    // Create canvas and insert as sibling immediately before the target element,
    // matching the reference site layer stack.
    this._canvas = document.createElement('canvas');
    this._canvas.id = this.options.canvasId;
    this._canvas.style.cssText =
      'position:fixed;inset:0;width:100%;height:100%;z-index:0;pointer-events:none;';

    target.parentNode.insertBefore(this._canvas, target);

    // Force DPR=1 for the background canvas — it is blurred by backdrop-filter so
    // retina detail is invisible but GPU fill rate would be 4× higher without this.
    // We restore the real value immediately after construction.
    const realDPR = window.devicePixelRatio;
    Object.defineProperty(window, 'devicePixelRatio', { value: 1, configurable: true });

    this._particles = new CorruptedParticles(this._canvas, {
      count:        this.options.count,
      speed:        this.options.speed,
      lineDistance: this.options.lineDistance,
      nsfw:         this.options.nsfw,
    });

    // Restore so other components (e.g. vortex, main canvas) use the real DPR.
    Object.defineProperty(window, 'devicePixelRatio', { value: realDPR, configurable: true });

    // Pause rendering when the page is hidden to save CPU/GPU.
    this._onVisibility = () => {
      if (this._destroyed) return;
      if (document.hidden) {
        this._particles?.stop?.();
      } else {
        this._particles?.start?.();
      }
    };
    document.addEventListener('visibilitychange', this._onVisibility);
  }

  /** Manually start (or resume after stop()). No-op if not yet initialised or destroyed. */
  start() {
    if (this._destroyed) return;
    this._particles?.start?.();
  }

  /** Pause rendering without tearing down. Resumes on start() or visibilitychange. */
  stop() {
    this._particles?.stop?.();
  }

  /**
   * Tear down completely: stop animation, remove canvas from DOM, remove listeners.
   * After destroy() this instance cannot be reused.
   */
  destroy() {
    if (this._destroyed) return;
    this._destroyed = true;

    if (typeof document !== 'undefined') {
      if (this._onReady) {
        document.removeEventListener('DOMContentLoaded', this._onReady);
        this._onReady = null;
      }
      if (this._onVisibility) {
        document.removeEventListener('visibilitychange', this._onVisibility);
        this._onVisibility = null;
      }
    }

    this._particles?.destroy?.();
    this._canvas?.remove?.();
    this._canvas    = null;
    this._particles = null;
  }
}

// CommonJS shim — mirrors the pattern used by corrupted-particles.js and corrupted-vortex.js.
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { CorruptedParticlesBackground };
}
