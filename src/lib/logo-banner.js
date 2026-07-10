/**
 * LogoBanner — positioned logo with optional subtitle and reveal animation.
 *
 * Decoupled from WHYKUSANAGI branding — accepts arbitrary src + subtitle.
 * Supports five positions, three size presets, and three animation modes.
 *
 * Key differences from source:
 *   - No hardcoded "WHYKUSANAGI" text or womb-tattoo asset path
 *   - No inline style injection — uses CSS classes (logo-banner--* BEM modifiers)
 *   - show()/hide() retained; update() added for live option changes
 *   - Node-safe: no document/window access when element is null
 *   - _destroyed guard prevents use-after-destroy
 *
 * @module lib/logo-banner
 *
 * @example
 *   const banner = new LogoBanner(document.getElementById('logo'), {
 *     src:         '/assets/logo.png',
 *     subtitle:    'CORRUPTED STREAM',
 *     size:        'normal',
 *     animation:   'fade',
 *     position:    'top-left',
 *     showSubtitle: true,
 *   });
 *   banner.show();
 */

/** @type {Record<string, {width: string, height: string}>} */
const SIZE_MAP = {
  small:  { width: '350px', height: '80px'  },
  normal: { width: '500px', height: '120px' },
  large:  { width: '650px', height: '150px' },
};

/** @type {Record<string, {top?: string, bottom?: string, left?: string, right?: string, transform?: string}>} */
const POSITION_MAP = {
  'top-left':     { top: '20px',  left: '20px'  },
  'top-right':    { top: '20px',  right: '20px' },
  'top-center':   { top: '20px',  left: '50%',  transform: 'translateX(-50%)' },
  'center':       { top: '50%',   left: '50%',  transform: 'translate(-50%, -50%)' },
  'bottom-left':  { bottom: '20px', left: '20px'  },
  'bottom-right': { bottom: '20px', right: '20px' },
};

export class LogoBanner {
  /**
   * @param {Element|null} element - Container element (null is safe in Node)
   * @param {object}  [options]
   * @param {string}  [options.src='']           - Image src (empty = no image)
   * @param {string}  [options.subtitle='']      - Subtitle text
   * @param {boolean} [options.showSubtitle=true] - Whether to render subtitle
   * @param {'small'|'normal'|'large'} [options.size='normal']
   * @param {'fade'|'slide'|'none'} [options.animation='fade']
   * @param {'top-left'|'top-right'|'top-center'|'center'|'bottom-left'|'bottom-right'} [options.position='top-right']
   * @param {number}  [options.zIndex=250]
   */
  constructor(element, options = {}) {
    this.element = element;
    this.options = {
      src:          options.src          ?? '',
      subtitle:     options.subtitle     ?? '',
      showSubtitle: options.showSubtitle !== false,
      size:         options.size         ?? 'normal',
      animation:    options.animation    ?? 'fade',
      position:     options.position     ?? 'top-right',
      zIndex:       options.zIndex       ?? 250,
    };
    this._destroyed = false;

    if (typeof document === 'undefined' || !element) return;
    this._render();
  }

  /** Reveal the banner using the configured animation. */
  show() {
    if (this._destroyed || !this.element) return;
    const el = this.element;
    if (this.options.animation === 'fade') {
      // Tiny timeout lets the browser register the initial opacity:0 before
      // the transition begins — mirrors the source's 100ms setTimeout pattern.
      setTimeout(() => { el.style.opacity = '0.9'; }, 16);
    } else if (this.options.animation === 'slide') {
      el.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
      const pos = POSITION_MAP[this.options.position] || POSITION_MAP['top-right'];
      // Shift 20px in the direction away from the nearest edge, then ease back
      const baseTransform = pos.transform || '';
      el.style.transform = baseTransform + ' translateX(-20px)';
      el.style.opacity = '0';
      setTimeout(() => {
        el.style.transform = baseTransform;
        el.style.opacity = '0.9';
      }, 16);
    } else {
      el.style.opacity = '0.9';
    }
  }

  /** Hide the banner (CSS transition handles the fade). */
  hide() {
    if (this._destroyed || !this.element) return;
    this.element.style.opacity = '0';
  }

  /**
   * Merge new options and re-render.
   * No-op after destroy().
   *
   * @param {Partial<typeof this.options>} options
   */
  update(options) {
    if (this._destroyed) return;
    Object.assign(this.options, options);
    if (typeof document === 'undefined' || !this.element) return;
    this._render();
  }

  /** Remove rendered content and mark instance as destroyed. */
  destroy() {
    if (this._destroyed) return;
    this._destroyed = true;
    if (this.element) {
      this.element.textContent = '';
      // Remove all BEM modifier classes added by _applyLayout
      for (const cls of [...this.element.classList]) {
        if (cls.startsWith('logo-banner')) this.element.classList.remove(cls);
      }
    }
  }

  // ── Private ────────────────────────────────────────────────────────────────

  _render() {
    if (this._destroyed || !this.element) return;

    this.element.textContent = '';
    this._applyLayout();

    if (this.options.src) {
      const img = document.createElement('img');
      img.src = this.options.src;
      img.alt = this.options.subtitle || 'Logo';
      img.className = 'logo-banner__img';
      this.element.appendChild(img);
    }

    if (this.options.showSubtitle && this.options.subtitle) {
      const sub = document.createElement('div');
      sub.className = 'logo-banner__subtitle';
      sub.textContent = this.options.subtitle;
      this.element.appendChild(sub);
    }
  }

  /** Apply size, position, animation, and z-index via inline styles + BEM classes. */
  _applyLayout() {
    const el = this.element;

    // BEM modifiers
    el.classList.add('logo-banner');
    el.classList.add(`logo-banner--${this.options.size}`);
    el.classList.add(`logo-banner--${this.options.position}`);
    if (this.options.animation !== 'none') {
      el.classList.add(`logo-banner--${this.options.animation}`);
    }

    // Dimensional inline styles (match source's explicit sizes)
    const sizeProps = SIZE_MAP[this.options.size] || SIZE_MAP.normal;
    el.style.width    = sizeProps.width;
    el.style.height   = sizeProps.height;
    el.style.zIndex   = String(this.options.zIndex);
    el.style.position = 'absolute';

    // Reset all position edges before applying the chosen position
    el.style.top       = '';
    el.style.bottom    = '';
    el.style.left      = '';
    el.style.right     = '';
    el.style.transform = '';

    const posProps = POSITION_MAP[this.options.position] || POSITION_MAP['top-right'];
    for (const [prop, value] of Object.entries(posProps)) {
      el.style[prop] = value;
    }

    // Start invisible when animation is enabled; show() triggers the reveal
    if (this.options.animation !== 'none') {
      el.style.opacity    = '0';
      el.style.transition = 'opacity 0.5s ease';
    } else {
      el.style.opacity = '0.9';
    }
  }
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { LogoBanner };
}
