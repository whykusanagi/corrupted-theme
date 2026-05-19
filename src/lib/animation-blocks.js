/**
 * Animation Building Blocks
 * =========================
 * Ten modular animation components that compose into full transition scenes.
 * Each block follows the package-canonical API:
 *
 *   new ClassName(element, options)
 *   instance.start()   → starts the animation (async: resolves when done)
 *   instance.stop()    → cancels in-progress animation, leaves DOM in place
 *   instance.destroy() → full cleanup: cancel timers + remove DOM nodes
 *
 * Additionally, `play()` is available on every class as an async alias for
 * `start()` — kept for compatibility with celeste-tts-bot consumers that
 * call `await block.play()`.
 *
 * Merged from celeste-tts-bot:
 *   obs/transitions/animation-blocks.js (TitleDecoder, ProgressBar,
 *     ScanlineSweep, TerminalBoot, GlitchPulse)
 *   obs/transitions/terminal-blocks.js (ASCIIBorder, SystemDiagnostic,
 *     LoadingBarMulti, DataTransmission, TerminalPrompt)
 *
 * Adaptations:
 *   - `lewdMode` option deprecated in favour of `nsfw` (one-time warn shim)
 *   - All charsets sourced from CorruptionCharsets (canonical JSON)
 *   - All timers tracked via TimerRegistry (clearAll() on stop/destroy)
 *   - document / requestAnimationFrame / setTimeout guarded for Node compat
 *
 * @module lib/animation-blocks
 * @see CORRUPTED_THEME_SPEC.md — Corruption Patterns reference
 */

import { CorruptionCharsets } from '../core/corruption-charsets.js';
import { TimerRegistry } from '../core/timer-registry.js';

// ─── Shared helpers ────────────────────────────────────────────────────────────

/**
 * Clamp n between lo and hi (inclusive).
 * @param {number} n
 * @param {number} lo
 * @param {number} hi
 * @returns {number}
 */
function _clamp(n, lo, hi) {
  return n < lo ? lo : n > hi ? hi : n;
}

/**
 * Safe requestAnimationFrame — no-op if window/requestAnimationFrame is absent.
 * Returns the rAF id, or 0 in Node.
 * @param {Function} fn
 * @returns {number}
 */
function _raf(fn) {
  if (typeof requestAnimationFrame !== 'undefined') {
    return requestAnimationFrame(fn);
  }
  return 0;
}

/**
 * Safe cancelAnimationFrame — no-op in Node.
 * @param {number} id
 */
function _caf(id) {
  if (typeof cancelAnimationFrame !== 'undefined') {
    cancelAnimationFrame(id);
  }
}

/**
 * Safe setTimeout — falls back to a no-op in Node when called inside a class
 * that guards DOM usage. Returns the timeout id, or 0 in Node.
 * @param {Function} fn
 * @param {number} delay
 * @returns {number}
 */
function _setTimeout(fn, delay) {
  if (typeof setTimeout !== 'undefined') {
    return setTimeout(fn, delay);
  }
  return 0;
}

/**
 * Build a single-char corrupt character from the canonical charsets.
 * Picks uniformly at random from katakana + symbols + blocks.
 * @returns {string}
 */
function _corruptChar() {
  const pool = CorruptionCharsets.katakana + CorruptionCharsets.symbols + CorruptionCharsets.blocks;
  return pool[Math.floor(Math.random() * pool.length)];
}

/**
 * Return true if we have access to the DOM (browser / jsdom environment).
 * @returns {boolean}
 */
function _hasDom() {
  return typeof document !== 'undefined';
}

// ─── Deprecation shim helper ──────────────────────────────────────────────────

/**
 * Apply the lewdMode → nsfw deprecation shim for a given class.
 * @param {Function} Cls   — The class (for Cls._warnedLewdMode flag)
 * @param {Object}   opts  — The options object, mutated in place
 */
function _applyLewdModeShim(Cls, opts) {
  if (opts.lewdMode !== undefined) {
    if (!Cls._warnedLewdMode) {
      // eslint-disable-next-line no-console
      console.warn(
        `${Cls.name}: 'lewdMode' is deprecated. Use 'nsfw' instead. Removed in 0.3.0.`
      );
      Cls._warnedLewdMode = true;
    }
    opts.nsfw = opts.lewdMode;
  }
}


// ═══════════════════════════════════════════════════════════════════════════════
// CLASS 1: TitleDecoder
// Character-by-character decoding from corruption to clear text.
// Canonical pattern: "Character-by-Character Decoding" (CORRUPTED_THEME_SPEC.md §5.1)
// ═══════════════════════════════════════════════════════════════════════════════

export class TitleDecoder {
  /**
   * @param {HTMLElement|null} container  — Parent element to append title into
   * @param {Object}           [options]
   * @param {string}           [options.finalText='SYSTEM READY']  — Target text
   * @param {number}           [options.duration=2000]             — ms
   * @param {boolean}          [options.nsfw=false]                — include NSFW chars
   * @param {string}           [options.color='#00ffff']
   * @param {string}           [options.fontSize='48px']
   */
  constructor(container, options = {}) {
    _applyLewdModeShim(TitleDecoder, options);

    this.container = container;
    this.options = {
      finalText: options.finalText || 'SYSTEM READY',
      duration:  options.duration  || 2000,
      nsfw:      options.nsfw      || false,
      color:     options.color     || '#00ffff',
      fontSize:  options.fontSize  || '48px',
    };

    this._element = null;
    this._timers  = new TimerRegistry();
    this._rafId   = 0;
    this._resolve = null;
    this._destroyed = false;
  }

  // ── Charset override (read-only, kept for tests that may inspect it) ──────
  static get KATAKANA() { return CorruptionCharsets.katakana; }
  static get SYMBOLS()  { return CorruptionCharsets.symbols; }
  static get BLOCKS()   { return CorruptionCharsets.blocks; }

  /** @returns {string} one random corrupt character */
  _randomCorruptChar() {
    const pool = this.options.nsfw
      ? CorruptionCharsets.all
      : CorruptionCharsets.standard;
    return pool[Math.floor(Math.random() * pool.length)];
  }

  /**
   * Start decoding animation.
   * @returns {Promise<void>} Resolves when animation completes and hold expires.
   */
  start() {
    return new Promise((resolve) => {
      this._resolve = resolve;

      if (!_hasDom() || !this.container) {
        // Node / no container — resolve immediately
        this._resolve();
        this._resolve = null;
        return;
      }

      this._element = document.createElement('div');
      this._element.style.cssText = `
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        font-size: ${this.options.fontSize};
        font-family: 'Courier New', monospace;
        color: ${this.options.color};
        text-shadow: 0 0 20px ${this.options.color};
        letter-spacing: 4px;
        white-space: nowrap;
        z-index: 100;
      `;
      this.container.appendChild(this._element);

      const finalText  = this.options.finalText;
      const chars      = finalText.split('');
      const totalChars = chars.length;
      const startTime  = Date.now();

      const animate = () => {
        if (this._destroyed) return;

        const elapsed  = Date.now() - startTime;
        const progress = Math.min(elapsed / this.options.duration, 1);
        const decoded  = Math.floor(progress * totalChars);

        let display = '';
        for (let i = 0; i < chars.length; i++) {
          if (i < decoded) {
            display += chars[i];
          } else if (i === decoded) {
            display += Math.random() > 0.5 ? chars[i] : this._randomCorruptChar();
          } else {
            display += this._randomCorruptChar();
          }
        }
        this._element.textContent = display;

        if (decoded < totalChars && Math.random() > 0.7) {
          this._element.style.textShadow = `
            0 0 20px ${this.options.color},
            2px 0 10px #ff0000,
            -2px 0 10px #0000ff
          `;
        } else {
          this._element.style.textShadow = `0 0 20px ${this.options.color}`;
        }

        if (progress < 1) {
          this._rafId = _raf(animate);
        } else {
          this._element.textContent = finalText;
          this._element.style.textShadow = `0 0 20px ${this.options.color}`;
          this._timers.setTimeout(() => {
            if (this._resolve) {
              this._resolve();
              this._resolve = null;
            }
          }, 500);
        }
      };

      this._rafId = _raf(animate);
    });
  }

  /** Alias: backward compat with celeste-tts-bot `await block.play()`. */
  play() { return this.start(); }

  /** Cancel in-progress animation. Does not remove DOM nodes. */
  stop() {
    _caf(this._rafId);
    this._rafId = 0;
    this._timers.clearAll();
    if (this._resolve) {
      this._resolve();
      this._resolve = null;
    }
  }

  /** Full cleanup — cancel timers and remove DOM nodes. */
  destroy() {
    this.stop();
    if (this._element && this._element.parentNode) {
      this._element.parentNode.removeChild(this._element);
    }
    this._element  = null;
    this._destroyed = true;
  }
}

TitleDecoder._warnedLewdMode = false;


// ═══════════════════════════════════════════════════════════════════════════════
// CLASS 2: ProgressBar
// Loading bar with glitch effects.
// ═══════════════════════════════════════════════════════════════════════════════

export class ProgressBar {
  /**
   * @param {HTMLElement|null} container
   * @param {Object}  [options]
   * @param {number}  [options.duration=2000]
   * @param {string}  [options.color='#00ffff']
   * @param {number}  [options.height=4]           — px
   * @param {string}  [options.position='bottom']  — 'top'|'bottom'
   * @param {boolean} [options.glitch=true]
   */
  constructor(container, options = {}) {
    _applyLewdModeShim(ProgressBar, options);

    this.container = container;
    this.options = {
      duration: options.duration  || 2000,
      color:    options.color     || '#00ffff',
      height:   options.height    || 4,
      position: options.position  || 'bottom',
      glitch:   options.glitch    !== false,
    };

    this._element   = null;
    this._bar       = null;
    this._timers    = new TimerRegistry();
    this._rafId     = 0;
    this._resolve   = null;
    this._destroyed = false;
  }

  start() {
    return new Promise((resolve) => {
      this._resolve = resolve;

      if (!_hasDom() || !this.container) {
        this._resolve();
        this._resolve = null;
        return;
      }

      this._element = document.createElement('div');
      const posStyle = this.options.position === 'top' ? 'top: 0' : 'bottom: 0';
      this._element.style.cssText = `
        position: absolute;
        ${posStyle};
        left: 0;
        width: 100%;
        height: ${this.options.height}px;
        background: rgba(0, 0, 0, 0.5);
        border: 1px solid ${this.options.color};
        z-index: 99;
      `;

      this._bar = document.createElement('div');
      this._bar.style.cssText = `
        width: 0%;
        height: 100%;
        background: ${this.options.color};
        box-shadow: 0 0 10px ${this.options.color};
      `;
      this._element.appendChild(this._bar);
      this.container.appendChild(this._element);

      const startTime = Date.now();
      const animate = () => {
        if (this._destroyed) return;

        const elapsed  = Date.now() - startTime;
        const progress = Math.min(elapsed / this.options.duration, 1);

        this._bar.style.width = `${progress * 100}%`;

        if (this.options.glitch && Math.random() > 0.9) {
          this._bar.style.boxShadow = `0 0 20px ${this.options.color}, 0 0 30px #ff00ff`;
        } else {
          this._bar.style.boxShadow = `0 0 10px ${this.options.color}`;
        }

        if (progress < 1) {
          this._rafId = _raf(animate);
        } else {
          this._timers.setTimeout(() => {
            if (this._resolve) {
              this._resolve();
              this._resolve = null;
            }
          }, 200);
        }
      };

      this._rafId = _raf(animate);
    });
  }

  play() { return this.start(); }

  stop() {
    _caf(this._rafId);
    this._rafId = 0;
    this._timers.clearAll();
    if (this._resolve) {
      this._resolve();
      this._resolve = null;
    }
  }

  destroy() {
    this.stop();
    if (this._element && this._element.parentNode) {
      this._element.parentNode.removeChild(this._element);
    }
    this._element   = null;
    this._bar       = null;
    this._destroyed = true;
  }
}

ProgressBar._warnedLewdMode = false;


// ═══════════════════════════════════════════════════════════════════════════════
// CLASS 3: ScanlineSweep
// Horizontal CRT-style scan line sweep.
// ═══════════════════════════════════════════════════════════════════════════════

export class ScanlineSweep {
  /**
   * @param {HTMLElement|null} container
   * @param {Object} [options]
   * @param {number} [options.duration=1500]
   * @param {string} [options.color='#00ffff']
   * @param {number} [options.sweeps=2]   — number of vertical passes
   */
  constructor(container, options = {}) {
    _applyLewdModeShim(ScanlineSweep, options);

    this.container = container;
    this.options = {
      duration: options.duration || 1500,
      color:    options.color    || '#00ffff',
      sweeps:   options.sweeps   || 2,
    };

    this._element   = null;
    this._timers    = new TimerRegistry();
    this._rafId     = 0;
    this._resolve   = null;
    this._destroyed = false;
  }

  start() {
    return new Promise((resolve) => {
      this._resolve = resolve;

      if (!_hasDom() || !this.container) {
        this._resolve();
        this._resolve = null;
        return;
      }

      this._element = document.createElement('div');
      this._element.style.cssText = `
        position: absolute;
        left: 0;
        width: 100%;
        height: 3px;
        background: linear-gradient(to bottom, transparent, ${this.options.color}, transparent);
        box-shadow: 0 0 20px ${this.options.color};
        z-index: 98;
      `;
      this.container.appendChild(this._element);

      const startTime    = Date.now();
      const sweepDuration = this.options.duration / this.options.sweeps;

      const animate = () => {
        if (this._destroyed) return;

        const elapsed       = Date.now() - startTime;
        const totalProgress = elapsed / this.options.duration;
        const sweepProgress = (elapsed % sweepDuration) / sweepDuration;

        this._element.style.top = `${sweepProgress * 100}%`;

        if (Math.random() > 0.7) {
          this._element.style.opacity = String(_clamp(0.5 + Math.random() * 0.5, 0, 1));
        } else {
          this._element.style.opacity = '1';
        }

        if (totalProgress < 1) {
          this._rafId = _raf(animate);
        } else {
          if (this._resolve) {
            this._resolve();
            this._resolve = null;
          }
        }
      };

      this._rafId = _raf(animate);
    });
  }

  play() { return this.start(); }

  stop() {
    _caf(this._rafId);
    this._rafId = 0;
    this._timers.clearAll();
    if (this._resolve) {
      this._resolve();
      this._resolve = null;
    }
  }

  destroy() {
    this.stop();
    if (this._element && this._element.parentNode) {
      this._element.parentNode.removeChild(this._element);
    }
    this._element   = null;
    this._destroyed = true;
  }
}

ScanlineSweep._warnedLewdMode = false;


// ═══════════════════════════════════════════════════════════════════════════════
// CLASS 4: TerminalBoot
// Boot-sequence text lines with typewriter / cursor effect.
// ═══════════════════════════════════════════════════════════════════════════════

export class TerminalBoot {
  /**
   * @param {HTMLElement|null} container
   * @param {Object}   [options]
   * @param {number}   [options.duration=3000]
   * @param {string[]} [options.lines]    — array of boot log lines.
   *   ⚠️ SECURITY: rendered as raw HTML via innerHTML. Pass static/author-
   *   controlled content only. If lines could contain user input, escape
   *   HTML entities (`&`, `<`, `>`, `"`) before passing.
   * @param {string}   [options.color='#00ffff']
   * @param {string}   [options.fontSize='16px']
   */
  constructor(container, options = {}) {
    _applyLewdModeShim(TerminalBoot, options);

    this.container = container;
    this.options = {
      duration: options.duration || 3000,
      lines:    options.lines    || [
        '> INITIALIZING NEURAL MATRIX...',
        '> LOADING CORRUPTION PROTOCOLS...',
        '> CALIBRATING REALITY DISTORTION...',
        '> SYSTEM ONLINE',
      ],
      color:    options.color    || '#00ffff',
      fontSize: options.fontSize || '16px',
    };

    this._element   = null;
    this._timers    = new TimerRegistry();
    this._rafId     = 0;
    this._resolve   = null;
    this._destroyed = false;
  }

  start() {
    return new Promise((resolve) => {
      this._resolve = resolve;

      if (!_hasDom() || !this.container) {
        this._resolve();
        this._resolve = null;
        return;
      }

      this._element = document.createElement('div');
      this._element.style.cssText = `
        position: absolute;
        top: 20px;
        left: 20px;
        font-family: 'Courier New', monospace;
        font-size: ${this.options.fontSize};
        color: ${this.options.color};
        text-shadow: 0 0 10px ${this.options.color};
        line-height: 1.8;
        z-index: 100;
      `;
      this.container.appendChild(this._element);

      const timePerLine = this.options.duration / this.options.lines.length;
      const startTime   = Date.now();

      const animate = () => {
        if (this._destroyed) return;

        const elapsed     = Date.now() - startTime;
        const currentLine = Math.floor(elapsed / timePerLine);

        if (currentLine < this.options.lines.length) {
          let html = '';
          for (let i = 0; i <= currentLine; i++) {
            html += this.options.lines[i];
            if (i === currentLine) {
              html += '<span style="animation: blink 0.5s infinite;">█</span>';
            }
            html += '<br>';
          }
          this._element.innerHTML = html;
          this._rafId = _raf(animate);
        } else {
          this._element.innerHTML = this.options.lines.join('<br>');
          this._timers.setTimeout(() => {
            if (this._resolve) {
              this._resolve();
              this._resolve = null;
            }
          }, 300);
        }
      };

      this._rafId = _raf(animate);
    });
  }

  play() { return this.start(); }

  stop() {
    _caf(this._rafId);
    this._rafId = 0;
    this._timers.clearAll();
    if (this._resolve) {
      this._resolve();
      this._resolve = null;
    }
  }

  destroy() {
    this.stop();
    if (this._element && this._element.parentNode) {
      this._element.parentNode.removeChild(this._element);
    }
    this._element   = null;
    this._destroyed = true;
  }
}

TerminalBoot._warnedLewdMode = false;


// ═══════════════════════════════════════════════════════════════════════════════
// CLASS 5: GlitchPulse
// Full-screen corruption pulse with random glitch bars.
// ═══════════════════════════════════════════════════════════════════════════════

export class GlitchPulse {
  /**
   * @param {HTMLElement|null} container
   * @param {Object} [options]
   * @param {number} [options.duration=1000]
   * @param {number} [options.intensity=0.5]  — max bar opacity
   * @param {string} [options.color='#ff00ff']
   */
  constructor(container, options = {}) {
    _applyLewdModeShim(GlitchPulse, options);

    this.container = container;
    this.options = {
      duration:  options.duration  || 1000,
      intensity: options.intensity || 0.5,
      color:     options.color     || '#ff00ff',
    };

    this._element   = null;
    this._timers    = new TimerRegistry();
    this._rafId     = 0;
    this._resolve   = null;
    this._destroyed = false;
  }

  start() {
    return new Promise((resolve) => {
      this._resolve = resolve;

      if (!_hasDom() || !this.container) {
        this._resolve();
        this._resolve = null;
        return;
      }

      this._element = document.createElement('div');
      this._element.style.cssText = `
        position: absolute;
        top: 0; left: 0;
        width: 100%; height: 100%;
        pointer-events: none;
        z-index: 97;
        mix-blend-mode: screen;
      `;
      this.container.appendChild(this._element);

      const startTime = Date.now();
      const animate = () => {
        if (this._destroyed) return;

        const elapsed  = Date.now() - startTime;
        const progress = elapsed / this.options.duration;

        if (progress < 1) {
          if (Math.random() > 0.7) {
            const count = Math.floor(Math.random() * 5) + 3;
            let html = '';
            for (let i = 0; i < count; i++) {
              const top     = Math.random() * 100;
              const height  = Math.random() * 10 + 2;
              const opacity = Math.random() * this.options.intensity;
              html += `<div style="position:absolute;top:${top}%;left:0;width:100%;height:${height}%;background:${this.options.color};opacity:${opacity};"></div>`;
            }
            this._element.innerHTML = html;
          } else {
            this._element.innerHTML = '';
          }
          this._rafId = _raf(animate);
        } else {
          this._element.innerHTML = '';
          if (this._resolve) {
            this._resolve();
            this._resolve = null;
          }
        }
      };

      this._rafId = _raf(animate);
    });
  }

  play() { return this.start(); }

  stop() {
    _caf(this._rafId);
    this._rafId = 0;
    this._timers.clearAll();
    if (this._resolve) {
      this._resolve();
      this._resolve = null;
    }
  }

  destroy() {
    this.stop();
    if (this._element && this._element.parentNode) {
      this._element.parentNode.removeChild(this._element);
    }
    this._element   = null;
    this._destroyed = true;
  }
}

GlitchPulse._warnedLewdMode = false;


// ═══════════════════════════════════════════════════════════════════════════════
// CLASS 6: ASCIIBorder
// Terminal-style box border drawn with Unicode box-drawing characters.
// Supports single, double, heavy, and rounded styles; three draw orders.
// ═══════════════════════════════════════════════════════════════════════════════

export class ASCIIBorder {
  /**
   * @param {HTMLElement|null} container
   * @param {Object} [options]
   * @param {number} [options.duration=1500]
   * @param {string} [options.color='#ff8c00']
   * @param {number} [options.thickness=2]        — unused in current impl (visual scale)
   * @param {string} [options.style='double']      — 'single'|'double'|'heavy'|'rounded'
   * @param {number} [options.padding=20]
   * @param {string} [options.drawOrder='clockwise'] — 'clockwise'|'simultaneous'|'corners-first'
   */
  constructor(container, options = {}) {
    _applyLewdModeShim(ASCIIBorder, options);

    this.container = container;
    this.options = {
      duration:  options.duration  || 1500,
      color:     options.color     || '#ff8c00',
      thickness: options.thickness || 2,
      style:     options.style     || 'double',
      padding:   options.padding   || 20,
      drawOrder: options.drawOrder || 'clockwise',
    };

    this._element   = null;
    this._borders   = { top: null, right: null, bottom: null, left: null };
    this._corners   = { tl: null, tr: null, br: null, bl: null };
    this._timers    = new TimerRegistry();
    this._rafId     = 0;
    this._resolve   = null;
    this._destroyed = false;
  }

  static get CHARS() {
    return {
      single:  { h: '─', v: '│', tl: '┌', tr: '┐', br: '┘', bl: '└' },
      double:  { h: '═', v: '║', tl: '╔', tr: '╗', br: '╝', bl: '╚' },
      heavy:   { h: '━', v: '┃', tl: '┏', tr: '┓', br: '┛', bl: '┗' },
      rounded: { h: '─', v: '│', tl: '╭', tr: '╮', br: '╯', bl: '╰' },
    };
  }

  start() {
    return new Promise((resolve) => {
      this._resolve = resolve;

      if (!_hasDom() || !this.container) {
        this._resolve();
        this._resolve = null;
        return;
      }

      const chars   = ASCIIBorder.CHARS[this.options.style] || ASCIIBorder.CHARS.double;
      const { padding, color } = this.options;

      this._element = document.createElement('div');
      this._element.style.cssText = `
        position: absolute;
        top: ${padding}px; left: ${padding}px;
        right: ${padding}px; bottom: ${padding}px;
        pointer-events: none;
        z-index: 100;
      `;
      this.container.appendChild(this._element);

      // Corners
      const cornerDefs = [
        { key: 'tl', char: chars.tl, css: 'top: 0; left: 0;' },
        { key: 'tr', char: chars.tr, css: 'top: 0; right: 0;' },
        { key: 'br', char: chars.br, css: 'bottom: 0; right: 0;' },
        { key: 'bl', char: chars.bl, css: 'bottom: 0; left: 0;' },
      ];
      cornerDefs.forEach(({ key, char, css }) => {
        const el = document.createElement('div');
        el.style.cssText = `
          position: absolute; ${css}
          font-family: 'Courier New', monospace;
          font-size: 24px; color: ${color};
          text-shadow: 0 0 10px ${color};
          opacity: 0; will-change: opacity;
        `;
        el.textContent = char;
        this._element.appendChild(el);
        this._corners[key] = el;
      });

      // Edge borders
      // Use screen dimensions if available, else fall back to sensible defaults.
      const screenW = (typeof window !== 'undefined' ? window.innerWidth  : 800);
      const screenH = (typeof window !== 'undefined' ? window.innerHeight : 600);
      const hLength = (screenW - padding * 2 - 60) / 15;
      const vLength = (screenH - padding * 2 - 60) / 30;

      const borderDefs = [
        { key: 'top',    char: chars.h, css: `top: 0; left: 30px; right: 30px; display: flex; justify-content: space-around;`,           len: hLength },
        { key: 'bottom', char: chars.h, css: `bottom: 0; left: 30px; right: 30px; display: flex; justify-content: space-around;`,        len: hLength },
        { key: 'left',   char: chars.v, css: `left: 0; top: 30px; bottom: 30px; display: flex; flex-direction: column; justify-content: space-around;`, len: vLength },
        { key: 'right',  char: chars.v, css: `right: 0; top: 30px; bottom: 30px; display: flex; flex-direction: column; justify-content: space-around;`, len: vLength },
      ];
      borderDefs.forEach(({ key, char, css, len }) => {
        const el = document.createElement('div');
        el.style.cssText = `
          position: absolute; ${css}
          font-family: 'Courier New', monospace;
          font-size: 24px; color: ${color};
          text-shadow: 0 0 10px ${color};
          opacity: 0; will-change: opacity;
        `;
        for (let i = 0; i < Math.floor(len); i++) {
          const span = document.createElement('span');
          span.textContent = char;
          el.appendChild(span);
        }
        this._element.appendChild(el);
        this._borders[key] = el;
      });

      const startTime = Date.now();
      const animate = () => {
        if (this._destroyed) return;

        const elapsed  = Date.now() - startTime;
        const progress = Math.min(elapsed / this.options.duration, 1.0);

        if (this.options.drawOrder === 'corners-first') {
          if (progress < 0.3) {
            const cp = progress / 0.3;
            Object.values(this._corners).forEach(c => { c.style.opacity = String(cp); });
          } else {
            Object.values(this._corners).forEach(c => { c.style.opacity = '1'; });
            const ep = (progress - 0.3) / 0.7;
            Object.values(this._borders).forEach(b => { b.style.opacity = String(ep); });
          }
        } else if (this.options.drawOrder === 'clockwise') {
          const segments        = 8;
          const segDuration     = 1.0 / segments;
          const currentSegment  = Math.floor(progress / segDuration);
          const segProgress     = (progress % segDuration) / segDuration;
          const order = [
            this._corners.tl, this._borders.top,    this._corners.tr, this._borders.right,
            this._corners.br, this._borders.bottom, this._corners.bl, this._borders.left,
          ];
          order.forEach((el, idx) => {
            if (!el) return;
            if (idx < currentSegment) {
              el.style.opacity = '1';
            } else if (idx === currentSegment) {
              el.style.opacity = String(segProgress);
            } else {
              el.style.opacity = '0';
            }
          });
        } else {
          // simultaneous
          Object.values(this._corners).forEach(c => { c.style.opacity = String(progress); });
          Object.values(this._borders).forEach(b => { b.style.opacity = String(progress); });
        }

        if (progress < 1.0) {
          this._rafId = _raf(animate);
        } else {
          this._timers.setTimeout(() => {
            if (this._resolve) {
              this._resolve();
              this._resolve = null;
            }
          }, 100);
        }
      };

      this._rafId = _raf(animate);
    });
  }

  play() { return this.start(); }

  stop() {
    _caf(this._rafId);
    this._rafId = 0;
    this._timers.clearAll();
    if (this._resolve) {
      this._resolve();
      this._resolve = null;
    }
  }

  destroy() {
    this.stop();
    if (this._element && this._element.parentNode) {
      this._element.parentNode.removeChild(this._element);
    }
    this._element   = null;
    this._destroyed = true;
  }
}

ASCIIBorder._warnedLewdMode = false;


// ═══════════════════════════════════════════════════════════════════════════════
// CLASS 7: SystemDiagnostic
// Scrolling diagnostic log lines with fade-in and optional cursor blink.
// ═══════════════════════════════════════════════════════════════════════════════

export class SystemDiagnostic {
  /**
   * @param {HTMLElement|null} container
   * @param {Object}   [options]
   * @param {number}   [options.duration=3000]
   * @param {string[]} [options.lines]    — array of diagnostic log lines.
   *   ⚠️ SECURITY: rendered as raw HTML via innerHTML. Pass static/author-
   *   controlled content only. If lines could contain user input, escape
   *   HTML entities (`&`, `<`, `>`, `"`) before passing.
   * @param {string}   [options.color='#00ff00']
   * @param {string}   [options.position='left']   — 'left'|'right'|'center'
   * @param {string}   [options.fontSize='16px']
   * @param {number}   [options.scrollSpeed=1.0]   — multiplier (0.5=slow, 2.0=fast)
   * @param {boolean}  [options.showCursor=true]
   */
  constructor(container, options = {}) {
    _applyLewdModeShim(SystemDiagnostic, options);

    this.container = container;
    this.options = {
      duration:    options.duration    || 3000,
      lines:       options.lines       || [
        '> INITIALIZING NEURAL CORE...',
        '> LOADING CORRUPTION PROTOCOLS...',
        '> ESTABLISHING ABYSS CONNECTION...',
        '> CALIBRATING REALITY MATRIX...',
        '> SYSTEM CHECK: OK',
        '> MEMORY SCAN: COMPLETE',
        '> CORRUPTION LEVEL: 89%',
        '> READY FOR DEPLOYMENT',
      ],
      color:       options.color       || '#00ff00',
      position:    options.position    || 'left',
      fontSize:    options.fontSize    || '16px',
      scrollSpeed: options.scrollSpeed || 1.0,
      showCursor:  options.showCursor  !== undefined ? options.showCursor : true,
    };

    this._element      = null;
    this._lineElements = [];
    this._timers       = new TimerRegistry();
    this._rafId        = 0;
    this._resolve      = null;
    this._destroyed    = false;
  }

  start() {
    return new Promise((resolve) => {
      this._resolve = resolve;

      if (!_hasDom() || !this.container) {
        this._resolve();
        this._resolve = null;
        return;
      }

      const { lines, color, position, fontSize, showCursor } = this.options;
      this._element = document.createElement('div');

      const positionStyles = {
        left:   'left: 40px; text-align: left;',
        right:  'right: 40px; text-align: right;',
        center: 'left: 50%; transform: translateX(-50%); text-align: center;',
      };

      this._element.style.cssText = `
        position: absolute;
        top: 100px;
        ${positionStyles[position] || positionStyles.left}
        font-family: 'Courier New', monospace;
        font-size: ${fontSize};
        color: ${color};
        text-shadow: 0 0 10px ${color};
        line-height: 1.8;
        z-index: 101;
        pointer-events: none;
      `;
      this.container.appendChild(this._element);

      const timePerLine = (this.options.duration * 0.8) / lines.length;
      const startTime   = Date.now();

      const animate = () => {
        if (this._destroyed) return;

        const elapsed          = Date.now() - startTime;
        const currentLineIndex = Math.floor((elapsed / timePerLine) * this.options.scrollSpeed);

        if (currentLineIndex < lines.length) {
          while (this._lineElements.length <= currentLineIndex) {
            const div      = document.createElement('div');
            div.style.cssText = 'opacity: 0; will-change: opacity; margin: 2px 0;';
            const lineText = lines[this._lineElements.length];
            div.textContent = lineText;
            if (showCursor && this._lineElements.length === currentLineIndex) {
              div.innerHTML = lineText + '<span style="animation: blink 0.8s infinite;">█</span>';
            }
            this._element.appendChild(div);
            this._lineElements.push(div);
          }

          const lineProgress = ((elapsed % timePerLine) / timePerLine) * this.options.scrollSpeed;
          this._lineElements[currentLineIndex].style.opacity = String(Math.min(lineProgress * 3, 1.0));

          for (let i = 0; i < currentLineIndex; i++) {
            this._lineElements[i].style.opacity = '1';
            if (showCursor && this._lineElements[i].querySelector('span')) {
              this._lineElements[i].textContent = lines[i];
            }
          }

          this._rafId = _raf(animate);
        } else {
          if (showCursor && this._lineElements.length > 0) {
            const last = this._lineElements[this._lineElements.length - 1];
            last.textContent = lines[lines.length - 1];
          }
          this._timers.setTimeout(() => {
            if (this._resolve) {
              this._resolve();
              this._resolve = null;
            }
          }, 200);
        }
      };

      this._rafId = _raf(animate);
    });
  }

  play() { return this.start(); }

  stop() {
    _caf(this._rafId);
    this._rafId = 0;
    this._timers.clearAll();
    if (this._resolve) {
      this._resolve();
      this._resolve = null;
    }
  }

  destroy() {
    this.stop();
    if (this._element && this._element.parentNode) {
      this._element.parentNode.removeChild(this._element);
    }
    this._element      = null;
    this._lineElements = [];
    this._destroyed    = true;
  }
}

SystemDiagnostic._warnedLewdMode = false;


// ═══════════════════════════════════════════════════════════════════════════════
// CLASS 8: LoadingBarMulti
// Multiple labelled loading bars with individual speeds, scanline shimmer, and
// optional glitch stutter.
// ═══════════════════════════════════════════════════════════════════════════════

export class LoadingBarMulti {
  /**
   * @param {HTMLElement|null} container
   * @param {Object}   [options]
   * @param {number}   [options.duration=3000]
   * @param {Array}    [options.bars]             — array of { label, speed, color }
   * @param {number}   [options.width=400]
   * @param {number}   [options.height=20]
   * @param {string}   [options.position='center'] — 'center'|'bottom'|'top'
   * @param {boolean}  [options.showPercentage=true]
   * @param {boolean}  [options.glitchEffect=true]
   */
  constructor(container, options = {}) {
    _applyLewdModeShim(LoadingBarMulti, options);

    this.container = container;
    this.options = {
      duration:       options.duration       || 3000,
      bars:           options.bars           || [
        { label: 'NEURAL CORE',      speed: 1.0, color: '#ff8c00' },
        { label: 'MEMORY BANKS',     speed: 0.8, color: '#00ffff' },
        { label: 'CORRUPTION MODULE',speed: 1.2, color: '#8b5cf6' },
        { label: 'REALITY MATRIX',   speed: 0.9, color: '#00ff00' },
      ],
      width:          options.width          || 400,
      height:         options.height         || 20,
      position:       options.position       || 'center',
      showPercentage: options.showPercentage !== undefined ? options.showPercentage : true,
      glitchEffect:   options.glitchEffect   !== undefined ? options.glitchEffect   : true,
    };

    this._element      = null;
    this._barElements  = [];
    this._timers       = new TimerRegistry();
    this._rafId        = 0;
    this._resolve      = null;
    this._destroyed    = false;
  }

  start() {
    return new Promise((resolve) => {
      this._resolve = resolve;

      if (!_hasDom() || !this.container) {
        this._resolve();
        this._resolve = null;
        return;
      }

      const { bars, width, height, position, showPercentage, glitchEffect } = this.options;

      this._element = document.createElement('div');
      const posStyles = {
        center: 'top: 50%; left: 50%; transform: translate(-50%, -50%);',
        bottom: 'bottom: 100px; left: 50%; transform: translateX(-50%);',
        top:    'top: 100px; left: 50%; transform: translateX(-50%);',
      };
      this._element.style.cssText = `
        position: absolute;
        ${posStyles[position] || posStyles.center}
        z-index: 101;
        pointer-events: none;
      `;
      this.container.appendChild(this._element);

      bars.forEach((barConfig) => {
        const barContainer = document.createElement('div');
        barContainer.style.cssText = `
          margin: 15px 0;
          font-family: 'Courier New', monospace;
          font-size: 14px;
        `;

        const label = document.createElement('div');
        label.style.cssText = `
          color: ${barConfig.color};
          text-shadow: 0 0 10px ${barConfig.color};
          margin-bottom: 5px;
          letter-spacing: 2px;
        `;
        label.textContent = barConfig.label;
        barContainer.appendChild(label);

        const barBg = document.createElement('div');
        barBg.style.cssText = `
          width: ${width}px; height: ${height}px;
          background: rgba(0, 0, 0, 0.8);
          border: 2px solid ${barConfig.color};
          box-shadow: 0 0 15px ${barConfig.color};
          position: relative; overflow: hidden;
        `;

        const barFill = document.createElement('div');
        barFill.style.cssText = `
          height: 100%; width: 0%;
          background: ${barConfig.color};
          box-shadow: 0 0 20px ${barConfig.color}, inset 0 0 10px rgba(255,255,255,0.3);
          will-change: width;
          position: relative;
        `;

        const scanline = document.createElement('div');
        scanline.style.cssText = `
          position: absolute; top: 0; left: -50%; width: 50%; height: 100%;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.6), transparent);
          will-change: transform;
        `;
        barFill.appendChild(scanline);
        barBg.appendChild(barFill);

        let percentText = null;
        if (showPercentage) {
          percentText = document.createElement('div');
          percentText.style.cssText = `
            position: absolute; top: 50%; right: 10px;
            transform: translateY(-50%);
            color: #fff; font-weight: bold;
            text-shadow: 0 0 10px ${barConfig.color};
            font-size: 12px;
          `;
          percentText.textContent = '0%';
          barBg.appendChild(percentText);
        }

        barContainer.appendChild(barBg);
        this._element.appendChild(barContainer);
        this._barElements.push({ fill: barFill, scanline, percent: percentText, config: barConfig });
      });

      const startTime = Date.now();
      const animate = () => {
        if (this._destroyed) return;

        const elapsed      = Date.now() - startTime;
        const baseProgress = elapsed / this.options.duration;
        let   allComplete  = true;

        this._barElements.forEach((bar) => {
          const barProgress = Math.min(baseProgress * bar.config.speed, 1.0);
          if (barProgress < 1.0) allComplete = false;

          bar.fill.style.width = `${barProgress * 100}%`;
          if (bar.percent) {
            bar.percent.textContent = `${Math.floor(barProgress * 100)}%`;
          }

          const scanPos = (barProgress * 150) % 150;
          bar.scanline.style.transform = `translateX(${scanPos}%)`;

          if (glitchEffect && Math.random() < 0.02) {
            bar.fill.style.opacity = '0.7';
            // Use native setTimeout here (not tracked) for the tiny 50ms restore —
            // this is fire-and-forget; destroy() will clean the DOM anyway.
            _setTimeout(() => { bar.fill.style.opacity = '1'; }, 50);
          }
        });

        if (!allComplete) {
          this._rafId = _raf(animate);
        } else {
          this._timers.setTimeout(() => {
            if (this._resolve) {
              this._resolve();
              this._resolve = null;
            }
          }, 300);
        }
      };

      this._rafId = _raf(animate);
    });
  }

  play() { return this.start(); }

  stop() {
    _caf(this._rafId);
    this._rafId = 0;
    this._timers.clearAll();
    if (this._resolve) {
      this._resolve();
      this._resolve = null;
    }
  }

  destroy() {
    this.stop();
    if (this._element && this._element.parentNode) {
      this._element.parentNode.removeChild(this._element);
    }
    this._element     = null;
    this._barElements = [];
    this._destroyed   = true;
  }
}

LoadingBarMulti._warnedLewdMode = false;


// ═══════════════════════════════════════════════════════════════════════════════
// CLASS 9: DataTransmission
// Streaming data-packet animation — rows or columns of light pulses that
// traverse the container and a live data-rate counter.
// ═══════════════════════════════════════════════════════════════════════════════

export class DataTransmission {
  /**
   * @param {HTMLElement|null} container
   * @param {Object}  [options]
   * @param {number}  [options.duration=2500]
   * @param {string}  [options.color='#00ffff']
   * @param {string}  [options.direction='horizontal'] — 'horizontal'|'vertical'
   * @param {number}  [options.packetCount=20]
   * @param {number}  [options.packetSize=6]           — px
   * @param {boolean} [options.showDataRate=true]
   */
  constructor(container, options = {}) {
    _applyLewdModeShim(DataTransmission, options);

    this.container = container;
    this.options = {
      duration:     options.duration     || 2500,
      color:        options.color        || '#00ffff',
      direction:    options.direction    || 'horizontal',
      packetCount:  options.packetCount  || 20,
      packetSize:   options.packetSize   || 6,
      showDataRate: options.showDataRate !== undefined ? options.showDataRate : true,
    };

    this._element   = null;
    this._packets   = [];
    this._timers    = new TimerRegistry();
    this._rafId     = 0;
    this._resolve   = null;
    this._destroyed = false;
  }

  start() {
    return new Promise((resolve) => {
      this._resolve = resolve;

      if (!_hasDom() || !this.container) {
        this._resolve();
        this._resolve = null;
        return;
      }

      const { color, direction, packetCount, packetSize, showDataRate } = this.options;

      this._element = document.createElement('div');
      this._element.style.cssText = `
        position: absolute;
        top: 0; left: 0;
        width: 100%; height: 100%;
        z-index: 100;
        pointer-events: none;
      `;
      this.container.appendChild(this._element);

      let dataRateDisplay = null;
      if (showDataRate) {
        dataRateDisplay = document.createElement('div');
        dataRateDisplay.style.cssText = `
          position: absolute;
          top: 20px; right: 20px;
          font-family: 'Courier New', monospace;
          font-size: 14px;
          color: ${color};
          text-shadow: 0 0 10px ${color};
        `;
        dataRateDisplay.textContent = 'DATA RATE: 0 KB/s';
        this._element.appendChild(dataRateDisplay);
      }

      const screenW = typeof window !== 'undefined' ? window.innerWidth  : 800;
      const screenH = typeof window !== 'undefined' ? window.innerHeight : 600;

      for (let i = 0; i < packetCount; i++) {
        const packet = document.createElement('div');

        if (direction === 'horizontal') {
          const yPos = 100 + (i * (screenH - 200) / packetCount);
          packet.style.cssText = `
            position: absolute;
            left: -${packetSize * 3}px;
            top: ${yPos}px;
            width: ${packetSize * 3}px; height: ${packetSize}px;
            background: linear-gradient(90deg, transparent, ${color}, transparent);
            box-shadow: 0 0 10px ${color};
            will-change: transform;
          `;
        } else {
          const xPos = 100 + (i * (screenW - 200) / packetCount);
          packet.style.cssText = `
            position: absolute;
            left: ${xPos}px;
            top: -${packetSize * 3}px;
            width: ${packetSize}px; height: ${packetSize * 3}px;
            background: linear-gradient(180deg, transparent, ${color}, transparent);
            box-shadow: 0 0 10px ${color};
            will-change: transform;
          `;
        }

        this._element.appendChild(packet);
        this._packets.push({
          element: packet,
          delay:   i * 50,
          speed:   0.9 + Math.random() * 0.2,
        });
      }

      const startTime = Date.now();
      const animate = () => {
        if (this._destroyed) return;

        const elapsed  = Date.now() - startTime;
        const progress = Math.min(elapsed / this.options.duration, 1.0);

        this._packets.forEach((pkt) => {
          const pktElapsed  = Math.max(0, elapsed - pkt.delay);
          const pktProgress = Math.min((pktElapsed / this.options.duration) * pkt.speed, 1.0);

          if (direction === 'horizontal') {
            const xPos = -packetSize * 3 + pktProgress * (screenW + packetSize * 6);
            pkt.element.style.transform = `translateX(${xPos}px)`;
          } else {
            const yPos = -packetSize * 3 + pktProgress * (screenH + packetSize * 6);
            pkt.element.style.transform = `translateY(${yPos}px)`;
          }

          if (pktProgress > 0.9) {
            pkt.element.style.opacity = String((1.0 - pktProgress) * 10);
          }
        });

        if (dataRateDisplay) {
          const rate = Math.floor(progress * 9999);
          dataRateDisplay.textContent = `DATA RATE: ${rate.toLocaleString()} KB/s`;
        }

        if (progress < 1.0) {
          this._rafId = _raf(animate);
        } else {
          this._timers.setTimeout(() => {
            if (this._resolve) {
              this._resolve();
              this._resolve = null;
            }
          }, 200);
        }
      };

      this._rafId = _raf(animate);
    });
  }

  play() { return this.start(); }

  stop() {
    _caf(this._rafId);
    this._rafId = 0;
    this._timers.clearAll();
    if (this._resolve) {
      this._resolve();
      this._resolve = null;
    }
  }

  destroy() {
    this.stop();
    if (this._element && this._element.parentNode) {
      this._element.parentNode.removeChild(this._element);
    }
    this._element   = null;
    this._packets   = [];
    this._destroyed = true;
  }
}

DataTransmission._warnedLewdMode = false;


// ═══════════════════════════════════════════════════════════════════════════════
// CLASS 10: TerminalPrompt
// Character-by-character typewriter of command strings with blinking cursor.
// ═══════════════════════════════════════════════════════════════════════════════

export class TerminalPrompt {
  /**
   * @param {HTMLElement|null} container
   * @param {Object}   [options]
   * @param {number}   [options.duration=2000]        — max total ms (safety cap)
   * @param {string[]} [options.commands]             — lines to type
   * @param {string}   [options.color='#00ff00']
   * @param {string}   [options.position='bottom-left'] — 'bottom-left'|'top-left'|'center'
   * @param {string}   [options.fontSize='16px']
   * @param {number}   [options.typingSpeed=50]       — ms per character
   */
  constructor(container, options = {}) {
    _applyLewdModeShim(TerminalPrompt, options);

    this.container = container;
    this.options = {
      duration:     options.duration     || 2000,
      commands:     options.commands     || [
        'celeste@abyss:~$ sudo init neural_core',
        '> Loading corruption protocols...',
        '> Establishing connection to the void...',
        '> System ready. All resistance is futile.',
      ],
      color:        options.color        || '#00ff00',
      position:     options.position     || 'bottom-left',
      fontSize:     options.fontSize     || '16px',
      typingSpeed:  options.typingSpeed  || 50,
    };

    this._element      = null;
    this._lineElements = [];
    this._timers       = new TimerRegistry();
    this._rafId        = 0;
    this._resolve      = null;
    this._currentLine  = 0;
    this._currentChar  = 0;
    this._lastCharTime = 0;
    this._destroyed    = false;
  }

  start() {
    return new Promise((resolve) => {
      this._resolve      = resolve;
      this._currentLine  = 0;
      this._currentChar  = 0;

      if (!_hasDom() || !this.container) {
        this._resolve();
        this._resolve = null;
        return;
      }

      const { commands, color, position, fontSize } = this.options;
      this._element = document.createElement('div');

      const posStyles = {
        'bottom-left': 'bottom: 40px; left: 40px;',
        'top-left':    'top: 40px; left: 40px;',
        'center':      'top: 50%; left: 50%; transform: translate(-50%, -50%);',
      };

      this._element.style.cssText = `
        position: absolute;
        ${posStyles[position] || posStyles['bottom-left']}
        font-family: 'Courier New', monospace;
        font-size: ${fontSize};
        color: ${color};
        text-shadow: 0 0 10px ${color};
        line-height: 1.6;
        z-index: 102;
        background: rgba(0, 0, 0, 0.9);
        padding: 20px;
        border: 2px solid ${color};
        box-shadow: 0 0 20px ${color};
        pointer-events: none;
        max-width: 600px;
      `;
      this.container.appendChild(this._element);

      this._lastCharTime = Date.now();

      const animate = () => {
        if (this._destroyed) return;

        const now = Date.now();

        if (now - this._lastCharTime >= this.options.typingSpeed && this._currentLine < commands.length) {
          if (!this._lineElements[this._currentLine]) {
            const div = document.createElement('div');
            this._element.appendChild(div);
            this._lineElements[this._currentLine] = div;
          }

          const command     = commands[this._currentLine];
          const displayText = command.substring(0, this._currentChar + 1);
          this._lineElements[this._currentLine].innerHTML =
            displayText + '<span style="animation: blink 0.5s infinite;">█</span>';

          this._currentChar++;
          this._lastCharTime = now;

          if (this._currentChar >= command.length) {
            this._lineElements[this._currentLine].textContent = command;
            this._currentLine++;
            this._currentChar = 0;
          }
        }

        if (this._currentLine < commands.length) {
          this._rafId = _raf(animate);
        } else {
          this._timers.setTimeout(() => {
            if (this._resolve) {
              this._resolve();
              this._resolve = null;
            }
          }, 500);
        }
      };

      this._rafId = _raf(animate);
    });
  }

  play() { return this.start(); }

  stop() {
    _caf(this._rafId);
    this._rafId = 0;
    this._timers.clearAll();
    if (this._resolve) {
      this._resolve();
      this._resolve = null;
    }
  }

  destroy() {
    this.stop();
    if (this._element && this._element.parentNode) {
      this._element.parentNode.removeChild(this._element);
    }
    this._element      = null;
    this._lineElements = [];
    this._destroyed    = true;
  }
}

TerminalPrompt._warnedLewdMode = false;


// ═══════════════════════════════════════════════════════════════════════════════
// COMPOSITION HELPERS
// Combine multiple blocks into full transition scenes.
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Play multiple animation blocks in parallel.
 * Calls destroy() on each block when all complete.
 * @param {Array} blocks
 * @returns {Promise<void>}
 */
export async function playParallel(blocks) {
  await Promise.all(blocks.map(block => block.start()));
  blocks.forEach(block => block.destroy());
}

/**
 * Play multiple animation blocks sequentially.
 * Calls destroy() on each block as it completes.
 * @param {Array} blocks
 * @returns {Promise<void>}
 */
export async function playSequence(blocks) {
  for (const block of blocks) {
    await block.start();
    block.destroy();
  }
}

/**
 * Play blocks with staggered start times.
 * @param {Array}  blocks
 * @param {number} [staggerDelay=200] — ms between each block start
 * @returns {Promise<void>}
 */
export async function playStaggered(blocks, staggerDelay = 200) {
  const promises = blocks.map((block, index) => new Promise((resolve) => {
    _setTimeout(async () => {
      await block.start();
      block.destroy();
      resolve();
    }, index * staggerDelay);
  }));
  await Promise.all(promises);
}


// ─── CJS interop ──────────────────────────────────────────────────────────────
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    TitleDecoder,
    ProgressBar,
    ScanlineSweep,
    TerminalBoot,
    GlitchPulse,
    ASCIIBorder,
    SystemDiagnostic,
    LoadingBarMulti,
    DataTransmission,
    TerminalPrompt,
    playParallel,
    playSequence,
    playStaggered,
  };
}
