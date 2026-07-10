/**
 * Advanced animation-block classes.
 *
 * Import from './animation-blocks.js' (re-exported there); this is an internal
 * implementation module.
 *
 * @module lib/_blocks-advanced
 * @license MIT
 */

import { getRandomPhrase } from '../core/corruption-phrases.js';

/**
 * Escapes HTML to prevent XSS.
 * Mirrors the audited countdown-widget sanitizer (see SECURITY.md); registered
 * as the approved escaper for the no-unsanitized ESLint rule in eslint.config.js.
 * @private
 * @param {string} text
 * @returns {string}
 */
function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

/**
 * BLOCK 30: TYPING TEXT REVEAL
 * =============================
 * Typewriter effect with character-by-character reveal
 * Usage: Messages, prompts, dialogue
 * Duration: Variable based on text length (default: 50ms per character)
 */
export class TypingTextReveal {
    constructor(container, options = {}) {
        this.container = container;
        this.text = options.text || 'SYSTEM ONLINE';
        this.duration = options.duration || 2000;
        this.color = options.color || '#ffffff';
        this.position = options.position || 'center';
        this.fontSize = options.fontSize || '32px';
        this.useCorruption = options.useCorruption || false; // Enable Pattern 2: Phrase Flickering
        // Phrases come from the canonical corruption-phrases library behind
        // nsfw:false (lewdMode is a deprecated alias for nsfw)
        this.nsfw = options.nsfw !== undefined ? options.nsfw
            : (options.lewdMode !== undefined
                ? (console.warn('[TypingTextReveal] lewdMode is deprecated; use nsfw'), options.lewdMode)
                : false);

        this.element = null;
        this.flickerInterval = null;
    }

    getRandomCorruptionPhrase() {
        return getRandomPhrase(this.nsfw);
    }

    play() {
        return new Promise((resolve) => {
            // Create text container
            this.element = document.createElement('div');
            this.element.className = 'typing-text-reveal';

            // Position styling
            const positions = {
                'center': 'top: 50%; left: 50%; transform: translate(-50%, -50%);',
                'top': 'top: 20%; left: 50%; transform: translateX(-50%);',
                'top-left': 'top: 20%; left: 10%;',
                'bottom-left': 'bottom: 20%; left: 10%;',
                'top-right': 'top: 20%; right: 10%;',
                'bottom-right': 'bottom: 20%; right: 10%;'
            };

            this.element.style.cssText = `
                position: fixed;
                ${positions[this.position] || positions.center}
                color: #ffffff;
                font-family: 'Courier New', monospace;
                font-size: ${this.fontSize};
                font-weight: bold;
                text-shadow:
                    -2px -2px 0 #000000,
                    2px -2px 0 #000000,
                    -2px 2px 0 #000000,
                    2px 2px 0 #000000,
                    0 0 10px #d94f90,
                    0 0 20px #8b5cf6,
                    0 0 30px #ff00ff,
                    0 0 40px #00ffff40;
                white-space: pre;
                z-index: 10000;
                pointer-events: none;
            `;

            this.container.appendChild(this.element);

            if (this.useCorruption) {
                // Pattern 3: Hybrid Decoding (Neural Decryption with Buffer Window)
                // Revealed text grows left-to-right, buffer flickers on the right
                let currentIndex = 0;
                const charDelay = this.duration / this.text.length;
                const flickerSpeed = 100; // Flicker buffer every 100ms
                const startTime = performance.now();

                // Start buffer flickering
                this.flickerInterval = setInterval(() => {
                    const elapsed = performance.now() - startTime;
                    const targetIndex = Math.floor(elapsed / charDelay);

                    if (targetIndex !== currentIndex && targetIndex <= this.text.length) {
                        currentIndex = targetIndex;
                    }

                    // XSS-safe: spans built once, text set via
                    // textContent (caller text + phrases never parsed as HTML)
                    if (!this._revealSpan) {
                        this._revealSpan = document.createElement('span');
                        this._revealSpan.style.cssText = 'color: #ffffff; text-shadow: -2px -2px 0 #000, 2px -2px 0 #000, -2px 2px 0 #000, 2px 2px 0 #000, 0 0 10px #d94f90, 0 0 20px #8b5cf6, 0 0 30px #ff00ff, 0 0 40px #00ffff40;';
                        this._bufferSpan = document.createElement('span');
                        this._bufferSpan.style.cssText = 'color: #d94f90; text-shadow: -2px -2px 0 #000, 2px -2px 0 #000, -2px 2px 0 #000, 2px 2px 0 #000, 0 0 10px #ff00ff, 0 0 20px #8b5cf6, 0 0 30px #d94f90, 0 0 40px #00ffff40;';
                        this.element.append(this._revealSpan, this._bufferSpan);
                    }
                    if (currentIndex < this.text.length) {
                        this._revealSpan.textContent = this.text.substring(0, currentIndex);
                        this._bufferSpan.textContent = ` ${this.getRandomCorruptionPhrase()}`;
                    } else {
                        // Fully decrypted — stable readable endpoint
                        clearInterval(this.flickerInterval);
                        this._revealSpan.textContent = this.text;
                        this._bufferSpan.textContent = '';
                        setTimeout(resolve, 200);
                    }
                }, flickerSpeed);

            } else {
                // Standard typing without corruption
                let currentIndex = 0;
                const charDelay = this.duration / this.text.length;
                const startTime = performance.now();

                const typeChar = () => {
                    const elapsed = performance.now() - startTime;
                    const targetIndex = Math.floor(elapsed / charDelay);

                    if (targetIndex > currentIndex && currentIndex < this.text.length) {
                        currentIndex = targetIndex;
                        this.element.textContent = this.text.substring(0, currentIndex);
                    }

                    if (currentIndex < this.text.length) {
                        requestAnimationFrame(typeChar);
                    } else {
                        this.element.textContent = this.text;
                        setTimeout(resolve, 200);
                    }
                };

                requestAnimationFrame(typeChar);
            }
        });
    }

    destroy() {
        if (this.flickerInterval) {
            clearInterval(this.flickerInterval);
            this.flickerInterval = null;
        }
        if (this.element) {
            this.element.remove();
            this.element = null;
        }
    }
}

/**
 * BLOCK 31: CIRCULAR DOTS INDICATOR
 * ==================================
 * Loading/thinking indicator with pulsing dots
 * Usage: Loading states, processing indicators
 * Duration: Infinite loop (must call destroy() to stop)
 */
export class CircularDotsIndicator {
    constructor(container, options = {}) {
        this.container = container;
        this.dotCount = options.dotCount || 3;
        this.color = options.color || '#ffffff';
        this.size = options.size || 10;
        this.position = options.position || 'center';
        this.spacing = options.spacing || 15;

        this.element = null;
        this.animationFrame = null;
    }

    play() {
        return new Promise((resolve) => {
            // Create container
            this.element = document.createElement('div');
            this.element.className = 'dots-indicator';

            const positions = {
                'center': 'top: 50%; left: 50%; transform: translate(-50%, -50%);',
                'top-right': 'top: 30px; right: 30px;',
                'bottom-right': 'bottom: 30px; right: 30px;',
                'bottom-left': 'bottom: 30px; left: 30px;'
            };

            this.element.style.cssText = `
                position: fixed;
                ${positions[this.position] || positions.center}
                display: flex;
                gap: ${this.spacing}px;
                z-index: 10000;
                pointer-events: none;
            `;

            // Create dots
            const dots = [];
            for (let i = 0; i < this.dotCount; i++) {
                const dot = document.createElement('div');
                dot.style.cssText = `
                    width: ${this.size}px;
                    height: ${this.size}px;
                    border-radius: 50%;
                    background-color: ${this.color};
                    box-shadow: 0 0 10px ${this.color};
                    opacity: 0.3;
                    will-change: transform, opacity;
                `;
                this.element.appendChild(dot);
                dots.push(dot);
            }

            this.container.appendChild(this.element);

            // Pulsing animation
            const startTime = performance.now();
            const pulseDuration = 900; // Total cycle duration
            const delayBetweenDots = pulseDuration / this.dotCount;

            const animate = (timestamp) => {
                const elapsed = timestamp - startTime;

                dots.forEach((dot, index) => {
                    const offset = index * delayBetweenDots;
                    const phase = (elapsed + offset) % pulseDuration;
                    const progress = phase / pulseDuration;

                    // Sine wave pulse
                    const scale = 1 + Math.sin(progress * Math.PI * 2) * 0.3;
                    const opacity = 0.3 + Math.sin(progress * Math.PI * 2) * 0.7;

                    dot.style.transform = `scale(${scale})`;
                    dot.style.opacity = opacity;
                });

                this.animationFrame = requestAnimationFrame(animate);
            };

            this.animationFrame = requestAnimationFrame(animate);

            // Note: This is an infinite animation, caller must call destroy()
            // Resolve immediately so it can run in background
            resolve();
        });
    }

    destroy() {
        if (this.animationFrame) {
            cancelAnimationFrame(this.animationFrame);
            this.animationFrame = null;
        }
        if (this.element) {
            this.element.remove();
            this.element = null;
        }
    }
}

/**
 * BLOCK 25: RECTANGULAR WIPE
 * ===========================
 * Screen wipe transition with rectangular bars
 * Usage: Scene transitions, reveals
 * Duration: 800-1200ms
 */
export class RectangularWipe {
    constructor(container, options = {}) {
        this.container = container;
        this.duration = options.duration || 1000;
        this.barCount = options.barCount || 5;
        this.color = options.color || '#ffffff';
        this.direction = options.direction || 'horizontal';  // horizontal, vertical
        this.staggerDelay = options.staggerDelay || 50;

        this.elements = [];
    }

    play() {
        return new Promise((resolve) => {
            const barSize = this.direction === 'horizontal'
                ? `100vw`
                : `100vh`;
            const barThickness = this.direction === 'horizontal'
                ? `${100 / this.barCount}vh`
                : `${100 / this.barCount}vw`;

            // Create bars
            for (let i = 0; i < this.barCount; i++) {
                const bar = document.createElement('div');
                bar.className = `wipe-bar-${i}`;

                const isHorizontal = this.direction === 'horizontal';
                const position = isHorizontal
                    ? `top: ${i * (100 / this.barCount)}vh;`
                    : `left: ${i * (100 / this.barCount)}vw;`;

                bar.style.cssText = `
                    position: fixed;
                    ${position}
                    ${isHorizontal ? 'left: 0;' : 'top: 0;'}
                    width: ${isHorizontal ? barSize : barThickness};
                    height: ${isHorizontal ? barThickness : barSize};
                    background-color: ${this.color};
                    box-shadow: 0 0 20px ${this.color}80;
                    z-index: 10000;
                    pointer-events: none;
                    will-change: transform;
                    transform: ${isHorizontal ? 'translateX(-100%)' : 'translateY(-100%)'};
                `;

                this.container.appendChild(bar);
                this.elements.push(bar);
            }

            // Animate bars
            const startTime = performance.now();
            let maxEndTime = 0;

            this.elements.forEach((bar, index) => {
                const delay = index * this.staggerDelay;
                const endTime = delay + this.duration;
                if (endTime > maxEndTime) maxEndTime = endTime;

                const animate = (timestamp) => {
                    const elapsed = timestamp - startTime - delay;

                    if (elapsed < 0) {
                        requestAnimationFrame(animate);
                        return;
                    }

                    if (elapsed >= this.duration) {
                        bar.style.transform = this.direction === 'horizontal'
                            ? 'translateX(100%)'
                            : 'translateY(100%)';
                        return;
                    }

                    const progress = elapsed / this.duration;
                    const eased = this.easeInOutQuad(progress);
                    const translateValue = -100 + (eased * 200); // -100% to 100%

                    bar.style.transform = this.direction === 'horizontal'
                        ? `translateX(${translateValue}%)`
                        : `translateY(${translateValue}%)`;

                    requestAnimationFrame(animate);
                };

                requestAnimationFrame(animate);
            });

            // Resolve when all bars complete
            setTimeout(() => {
                this.destroy();
                resolve();
            }, maxEndTime + 100);
        });
    }

    easeInOutQuad(t) {
        return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
    }

    destroy() {
        this.elements.forEach(el => el.remove());
        this.elements = [];
    }
}

/**
 * BLOCK 32: CHROMATIC ABERRATION GLITCH
 * ======================================
 * RGB channel separation effect (TikTok-style glitch)
 * Usage: Logo reveals, glitch effects, emphasis
 * Duration: 200-600ms (pulsing glitch)
 */
export class ChromaticAberrationGlitch {
    constructor(container, options = {}) {
        this.container = container;
        this.duration = options.duration || 400;
        this.text = options.text || 'GLITCH';
        this.fontSize = options.fontSize || '48px';
        this.position = options.position || 'center';
        this.intensity = options.intensity || 4;  // px offset for RGB channels
        this.pulseCount = options.pulseCount || 3;

        this.element = null;
    }

    play() {
        return new Promise((resolve) => {
            // Create main text container
            this.element = document.createElement('div');
            this.element.className = 'chromatic-glitch';
            this.element.setAttribute('data-text', this.text);

            const positions = {
                'center': 'top: 50%; left: 50%; transform: translate(-50%, -50%);',
                'top': 'top: 20%; left: 50%; transform: translateX(-50%);',
                'bottom': 'bottom: 20%; left: 50%; transform: translateX(-50%);'
            };

            this.element.style.cssText = `
                position: fixed;
                ${positions[this.position] || positions.center}
                color: #d94f90;
                font-family: 'Arial Black', sans-serif;
                font-size: ${this.fontSize};
                font-weight: 900;
                text-transform: uppercase;
                z-index: 10000;
                pointer-events: none;
                text-shadow:
                    -2px -2px 0 #000000,
                    2px -2px 0 #000000,
                    -2px 2px 0 #000000,
                    2px 2px 0 #000000,
                    0 0 15px #d94f90,
                    0 0 25px #8b5cf6,
                    0 0 35px #ff00ff,
                    0 0 45px #00ffff40;
            `;

            this.element.textContent = this.text;

            // Create chromatic glitch layers with 4-color system
            const styleSheet = document.createElement('style');
            styleSheet.textContent = `
                .chromatic-glitch::before,
                .chromatic-glitch::after {
                    content: attr(data-text);
                    position: absolute;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                }
                .chromatic-glitch::before {
                    color: #8b5cf6;  /* Purple - primary */
                    text-shadow:
                        -2px -2px 0 #000000,
                        2px -2px 0 #000000,
                        -2px 2px 0 #000000,
                        2px 2px 0 #000000,
                        0 0 15px #8b5cf6,
                        0 0 25px #d94f90,
                        0 0 35px #00ffff30;
                    mix-blend-mode: screen;
                    animation: glitch-purple ${this.duration / this.pulseCount}ms ease-in-out infinite;
                }
                .chromatic-glitch::after {
                    color: #ff00ff;  /* Bright Magenta - primary */
                    text-shadow:
                        -2px -2px 0 #000000,
                        2px -2px 0 #000000,
                        -2px 2px 0 #000000,
                        2px 2px 0 #000000,
                        0 0 15px #ff00ff,
                        0 0 25px #d94f90,
                        0 0 35px #00ffff30;
                    mix-blend-mode: screen;
                    animation: glitch-bright-magenta ${this.duration / this.pulseCount}ms ease-in-out infinite;
                }
                @keyframes glitch-purple {
                    0%, 100% { transform: translate(0, 0); }
                    33% { transform: translate(-${this.intensity}px, ${this.intensity * 0.5}px); }
                    66% { transform: translate(-${this.intensity * 1.5}px, -${this.intensity * 0.3}px); }
                }
                @keyframes glitch-bright-magenta {
                    0%, 100% { transform: translate(0, 0); }
                    33% { transform: translate(${this.intensity}px, -${this.intensity * 0.5}px); }
                    66% { transform: translate(${this.intensity * 1.5}px, ${this.intensity * 0.3}px); }
                }
            `;

            document.head.appendChild(styleSheet);
            this.container.appendChild(this.element);

            // Remove after duration
            setTimeout(() => {
                styleSheet.remove();
                this.destroy();
                resolve();
            }, this.duration);
        });
    }

    destroy() {
        if (this.element) {
            this.element.remove();
            this.element = null;
        }
    }
}

/**
 * BLOCK 28: ROTATING DIAMOND
 * ===========================
 * Spinning diamond/rhombus geometric shape
 * Usage: Loading indicators, decorative elements, watermarks
 * Duration: Infinite loop (must call destroy() to stop)
 */
export class RotatingDiamond {
    constructor(container, options = {}) {
        this.container = container;
        this.size = options.size || 60;
        this.color = options.color || '#8b5cf6';
        this.position = options.position || 'center';
        this.rotationSpeed = options.rotationSpeed || 3000;  // ms per full rotation
        this.breathe = options.breathe !== undefined ? options.breathe : true;  // scale pulse

        this.element = null;
        this.animationFrame = null;
    }

    play() {
        return new Promise((resolve) => {
            // Create diamond (rotated square)
            this.element = document.createElement('div');
            this.element.className = 'rotating-diamond';

            const positions = {
                'center': 'top: 50%; left: 50%; transform: translate(-50%, -50%) rotate(45deg);',
                'top-right': 'top: 50px; right: 50px;',
                'bottom-right': 'bottom: 50px; right: 50px;',
                'top-left': 'top: 50px; left: 50px;'
            };

            this.element.style.cssText = `
                position: fixed;
                ${positions[this.position] || positions.center}
                width: ${this.size}px;
                height: ${this.size}px;
                border: 3px solid ${this.color};
                background-color: transparent;
                box-shadow:
                    0 0 20px ${this.color}80,
                    inset 0 0 20px ${this.color}40;
                z-index: 10000;
                pointer-events: none;
                will-change: transform;
            `;

            this.container.appendChild(this.element);

            // Rotation animation
            const startTime = performance.now();

            const animate = (timestamp) => {
                const elapsed = timestamp - startTime;
                const rotationProgress = (elapsed % this.rotationSpeed) / this.rotationSpeed;
                const rotation = rotationProgress * 360;

                let scale = 1;
                if (this.breathe) {
                    const breathProgress = (elapsed % 2000) / 2000;
                    scale = 0.9 + Math.sin(breathProgress * Math.PI * 2) * 0.1;
                }

                this.element.style.transform = this.position === 'center'
                    ? `translate(-50%, -50%) rotate(${45 + rotation}deg) scale(${scale})`
                    : `rotate(${45 + rotation}deg) scale(${scale})`;

                this.animationFrame = requestAnimationFrame(animate);
            };

            this.animationFrame = requestAnimationFrame(animate);

            // Note: Infinite animation, caller must call destroy()
            resolve();
        });
    }

    destroy() {
        if (this.animationFrame) {
            cancelAnimationFrame(this.animationFrame);
            this.animationFrame = null;
        }
        if (this.element) {
            this.element.remove();
            this.element = null;
        }
    }
}

/**
 * PRIORITY 2 BLOCKS
 * =================
 */

/**
 * BLOCK 26: FLOATING CARD STACK
 * ==============================
 * Multiple cards floating with parallax motion
 * Usage: Content display, image galleries, UI elements
 * Duration: Infinite loop (must call destroy() to stop)
 */

/**
 * BLOCK 27: GRID OVERLAY
 * =======================
 * Wireframe grid pattern overlay
 * Usage: Surveillance aesthetic, technical backgrounds, scanning effects
 * Duration: Fade in, then infinite pulse (must call destroy() to stop)
 */
export class GridOverlay {
    constructor(container, options = {}) {
        this.container = container;
        this.gridSize = options.gridSize || 40;  // Size of each grid cell
        this.color = options.color || '#ffffff';
        this.opacity = options.opacity || 0.3;
        this.style = options.style || 'square';  // square or diamond
        this.pulse = options.pulse !== undefined ? options.pulse : true;

        this.element = null;
        this.animationFrame = null;
    }

    play() {
        return new Promise((resolve) => {
            // Create SVG pattern
            const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
            svg.style.cssText = `
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                z-index: 9999;
                pointer-events: none;
                opacity: 0;
            `;

            // Define pattern
            const defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');
            const pattern = document.createElementNS('http://www.w3.org/2000/svg', 'pattern');
            pattern.setAttribute('id', 'grid-pattern');
            pattern.setAttribute('x', '0');
            pattern.setAttribute('y', '0');
            pattern.setAttribute('width', this.gridSize);
            pattern.setAttribute('height', this.gridSize);
            pattern.setAttribute('patternUnits', 'userSpaceOnUse');

            if (this.style === 'square') {
                // Vertical line
                const vLine = document.createElementNS('http://www.w3.org/2000/svg', 'line');
                vLine.setAttribute('x1', '0');
                vLine.setAttribute('y1', '0');
                vLine.setAttribute('x2', '0');
                vLine.setAttribute('y2', this.gridSize);
                vLine.setAttribute('stroke', this.color);
                vLine.setAttribute('stroke-width', '1');

                // Horizontal line
                const hLine = document.createElementNS('http://www.w3.org/2000/svg', 'line');
                hLine.setAttribute('x1', '0');
                hLine.setAttribute('y1', '0');
                hLine.setAttribute('x2', this.gridSize);
                hLine.setAttribute('y2', '0');
                hLine.setAttribute('stroke', this.color);
                hLine.setAttribute('stroke-width', '1');

                pattern.appendChild(vLine);
                pattern.appendChild(hLine);
            } else {
                // Diamond pattern (45° rotated square)
                const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
                const half = this.gridSize / 2;
                path.setAttribute('d', `M ${half},0 L ${this.gridSize},${half} L ${half},${this.gridSize} L 0,${half} Z`);
                path.setAttribute('stroke', this.color);
                path.setAttribute('stroke-width', '1');
                path.setAttribute('fill', 'none');
                pattern.appendChild(path);
            }

            defs.appendChild(pattern);
            svg.appendChild(defs);

            // Apply pattern
            const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
            rect.setAttribute('width', '100%');
            rect.setAttribute('height', '100%');
            rect.setAttribute('fill', 'url(#grid-pattern)');
            svg.appendChild(rect);

            this.element = svg;
            this.container.appendChild(svg);

            // Fade in
            setTimeout(() => {
                svg.style.transition = 'opacity 1s ease-out';
                svg.style.opacity = this.opacity;
            }, 50);

            // Pulse animation
            if (this.pulse) {
                const startTime = performance.now();

                const animate = (timestamp) => {
                    const elapsed = timestamp - startTime;
                    const progress = (elapsed % 2000) / 2000;
                    const pulsedOpacity = this.opacity + Math.sin(progress * Math.PI * 2) * 0.1;

                    svg.style.opacity = Math.max(0.2, Math.min(0.5, pulsedOpacity));

                    this.animationFrame = requestAnimationFrame(animate);
                };

                setTimeout(() => {
                    this.animationFrame = requestAnimationFrame(animate);
                }, 1000);
            }

            // Note: Infinite animation if pulse enabled
            resolve();
        });
    }

    destroy() {
        if (this.animationFrame) {
            cancelAnimationFrame(this.animationFrame);
            this.animationFrame = null;
        }
        if (this.element) {
            this.element.remove();
            this.element = null;
        }
    }
}

/**
 * BLOCK 34: WAVEFORM OSCILLOSCOPE
 * ================================
 * Audio waveform visualization (animated wave)
 * Usage: Audio indicators, technical aesthetic, data visualization
 * Duration: Infinite loop (must call destroy() to stop)
 */
export class WaveformOscilloscope {
    constructor(container, options = {}) {
        this.container = container;
        this.width = options.width || window.innerWidth * 0.8;
        this.height = options.height || 100;
        this.color = options.color || '#ffffff';
        this.position = options.position || 'center';
        this.amplitude = options.amplitude || 30;
        this.frequency = options.frequency || 0.02;
        this.speed = options.speed || 0.1;

        this.canvas = null;
        this.ctx = null;
        this.animationFrame = null;
    }

    play() {
        return new Promise((resolve) => {
            // Create canvas
            this.canvas = document.createElement('canvas');
            this.canvas.width = this.width;
            this.canvas.height = this.height;
            this.ctx = this.canvas.getContext('2d');

            const positions = {
                'center': 'top: 50%; left: 50%; transform: translate(-50%, -50%);',
                'top': 'top: 20%; left: 50%; transform: translateX(-50%);',
                'bottom': 'bottom: 20%; left: 50%; transform: translateX(-50%);'
            };

            this.canvas.style.cssText = `
                position: fixed;
                ${positions[this.position] || positions.center}
                z-index: 10000;
                pointer-events: none;
            `;

            this.container.appendChild(this.canvas);

            // Waveform animation
            let phase = 0;

            const animate = () => {
                // Clear canvas
                this.ctx.clearRect(0, 0, this.width, this.height);

                // Draw waveform
                this.ctx.strokeStyle = this.color;
                this.ctx.lineWidth = 3;
                this.ctx.shadowBlur = 15;
                this.ctx.shadowColor = this.color;

                this.ctx.beginPath();
                for (let i = 0; i < 100; i++) {
                    const x = (this.width / 100) * i;
                    const y = this.height / 2 + Math.sin(i * this.frequency + phase) * this.amplitude;

                    if (i === 0) {
                        this.ctx.moveTo(x, y);
                    } else {
                        this.ctx.lineTo(x, y);
                    }
                }
                this.ctx.stroke();

                phase += this.speed;

                this.animationFrame = requestAnimationFrame(animate);
            };

            this.animationFrame = requestAnimationFrame(animate);

            // Note: Infinite animation, caller must call destroy()
            resolve();
        });
    }

    destroy() {
        if (this.animationFrame) {
            cancelAnimationFrame(this.animationFrame);
            this.animationFrame = null;
        }
        if (this.canvas) {
            this.canvas.remove();
            this.canvas = null;
            this.ctx = null;
        }
    }
}

/* ─────────────────────────────────────────────────────────────────────────
   Additional animation-block classes.
   NSFW pools are opt-in via getRandomPhrase(nsfw:false); CharacterFlowParticles
   emits from configurable targets (target/scaleWrapper/container options).
   ───────────────────────────────────────────────────────────────────────── */

/**
 * BLOCK 26: FLOATING CARD STACK
 * ==============================
 * Multiple cards floating with parallax motion
 * Usage: Content display, image galleries, UI elements
 * Duration: Infinite loop (must call destroy() to stop)
 */
export class FloatingCardStack {
    constructor(container, options = {}) {
        this.container = container;
        this.cardCount = options.cardCount || 5;
        this.cardWidth = options.cardWidth || 200;
        this.cardHeight = options.cardHeight || 280;
        this.color = options.color || '#8b5cf6';
        this.images = options.images || [];  // Array of image URLs or tarot card objects
        this.tarotMode = options.tarotMode || false;  // Enable tarot card styling
        this.corruptedText = options.corruptedText || true;  // Use corrupted text overlay
        this.decodeDuration = options.decodeDuration || 5000;  // Milliseconds for full decode (default 5s)
        this.randomSeed = options.randomSeed || Date.now();
        this.nsfw = options.nsfw !== undefined ? options.nsfw
          : ((options.lewdMode !== undefined || options.includeLewd !== undefined)
              ? (console.warn('[FloatingCardStack] lewdMode/includeLewd is deprecated; use nsfw'), (options.lewdMode ?? options.includeLewd))
              : false);

        this.elements = [];
        this.animationFrame = null;
    }

    play() {
        return new Promise((resolve) => {
            // Create cards
            for (let i = 0; i < this.cardCount; i++) {
                const card = document.createElement('div');
                card.className = `floating-card-${i}`;

                // Positioning logic
                const seededRandom = (seed) => {
                    const x = Math.sin(seed++) * 10000;
                    return x - Math.floor(x);
                };

                let randomX, randomY, randomRotation;

                if (this.tarotMode && this.cardCount <= 5) {
                    // Tarot mode: Horizontal spread layout to prevent overlap
                    // Use simple left-to-right positioning with guaranteed spacing
                    const minSpacing = 40; // Minimum 40px gap between cards
                    const totalCardWidth = this.cardCount * this.cardWidth;
                    const totalMinSpacing = (this.cardCount - 1) * minSpacing;
                    const requiredWidth = totalCardWidth + totalMinSpacing;

                    // Center the entire card spread
                    const startX = (window.innerWidth - requiredWidth) / 2;

                    // Position this card with guaranteed spacing
                    const cardX = startX + (i * (this.cardWidth + minSpacing));

                    // Clamp to ensure card stays on screen
                    const maxX = window.innerWidth - this.cardWidth - 20;
                    const clampedX = Math.max(20, Math.min(cardX, maxX));
                    randomX = (clampedX / window.innerWidth) * 100;

                    // Vertical position: center with minimal variation to prevent visual overlap
                    const centerY = (window.innerHeight - this.cardHeight) / 2;
                    const yVariation = (seededRandom(this.randomSeed + i * 200) - 0.5) * 40; // ±20px (reduced)
                    const clampedY = Math.max(50, Math.min(centerY + yVariation, window.innerHeight - this.cardHeight - 50));
                    randomY = (clampedY / window.innerHeight) * 100;

                    // Minimal rotation to prevent cards from tilting into each other
                    randomRotation = (seededRandom(this.randomSeed + i * 300) - 0.5) * 6; // -3 to 3 deg
                } else {
                    // Regular mode: Random positioning with wider spread
                    randomX = seededRandom(this.randomSeed + i * 100) * 80 + 10; // 10-90%
                    randomY = seededRandom(this.randomSeed + i * 200) * 70 + 15; // 15-85%
                    randomRotation = (seededRandom(this.randomSeed + i * 300) - 0.5) * 30; // -15 to 15 deg
                }

                card.style.cssText = `
                    position: fixed;
                    left: ${randomX}%;
                    top: ${randomY}%;
                    width: ${this.cardWidth}px;
                    height: ${this.cardHeight}px;
                    background: rgba(0, 0, 0, 0.7);
                    border: 2px solid ${this.color};
                    border-radius: 8px;
                    box-shadow:
                        0 0 20px ${this.color}50,
                        0 4px 15px rgba(0, 0, 0, 0.5);
                    backdrop-filter: blur(10px);
                    z-index: ${10000 + i};
                    pointer-events: none;
                    will-change: transform;
                    transform: rotate(${randomRotation}deg);
                    opacity: 0;
                `;

                // Declare variables for text elements (used later for animation)
                let nameEl = null;
                let cardName = null;

                // Add card content
                if (this.images[i]) {
                    const cardData = this.images[i];
                    const isObject = typeof cardData === 'object' && cardData !== null;
                    const imageUrl = isObject ? cardData.image : cardData;
                    cardName = isObject ? cardData.name : null;
                    const cardText = isObject ? cardData.text : null;

                    // Background image
                    const img = document.createElement('img');
                    img.src = imageUrl;
                    img.style.cssText = `
                        width: 100%;
                        height: 100%;
                        object-fit: cover;
                        border-radius: 6px;
                    `;
                    card.appendChild(img);

                    // Holographic transparent overlay - subtle darkening for text readability
                    if (this.tarotMode) {
                        const holoOverlay = document.createElement('div');
                        holoOverlay.style.cssText = `
                            position: absolute;
                            top: 0;
                            left: 0;
                            right: 0;
                            bottom: 0;
                            background: linear-gradient(
                                135deg,
                                rgba(0, 0, 0, 0.3),
                                rgba(139, 92, 246, 0.1) 50%,
                                rgba(0, 0, 0, 0.4)
                            );
                            border-radius: 6px;
                            pointer-events: none;
                        `;
                        card.appendChild(holoOverlay);
                    }

                    // Tarot mode: Add text overlay with animated decoding
                    if (this.tarotMode && (cardName || cardText)) {
                        let textEl = null;
                        const overlay = document.createElement('div');
                        overlay.style.cssText = `
                            position: absolute;
                            bottom: 0;
                            left: 0;
                            right: 0;
                            background: rgba(0, 0, 0, 0.4);
                            backdrop-filter: blur(8px);
                            padding: 15px;
                            border-radius: 0 0 6px 6px;
                            border-top: 1px solid ${this.color}60;
                            box-shadow: 0 -4px 20px rgba(0, 0, 0, 0.3);
                        `;

                        if (cardName) {
                            nameEl = document.createElement('div');
                            nameEl.style.cssText = `
                                font-family: 'Courier New', monospace;
                                font-size: 14px;
                                font-weight: bold;
                                color: ${this.color};
                                text-shadow:
                                    0 0 10px ${this.color},
                                    0 0 20px ${this.color},
                                    2px 2px 6px rgba(0, 0, 0, 0.9);
                                margin-bottom: 8px;
                                letter-spacing: 2px;
                            `;
                            // Start with full corruption
                            // eslint-disable-next-line no-unsanitized/property -- HTML built internally from escapeHtml()-wrapped text + canonical color constants (see corruptTextHTML/getFullCorruption/decodeTextProgressive)
                            nameEl.innerHTML = this.corruptedText ? this.getFullCorruption(cardName.length) : escapeHtml(cardName);
                            overlay.appendChild(nameEl);
                        }

                        if (cardText) {
                            textEl = document.createElement('div');
                            textEl.style.cssText = `
                                font-family: 'Courier New', monospace;
                                font-size: 10px;
                                color: #00ffff;
                                text-shadow:
                                    0 0 5px #00ffff,
                                    0 0 10px #00ffff,
                                    1px 1px 4px rgba(0, 0, 0, 0.9);
                                line-height: 1.4;
                                opacity: 0.95;
                            `;
                            textEl.textContent = cardText.substring(0, 80) + (cardText.length > 80 ? '...' : '');
                            overlay.appendChild(textEl);
                        }

                        card.appendChild(overlay);
                    }
                } else {
                    // Placeholder content
                    card.innerHTML = `<div style="
                        width: 100%;
                        height: 100%;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        color: ${escapeHtml(this.color)};
                        font-family: 'Courier New', monospace;
                        font-size: 48px;
                    ">${escapeHtml(i + 1)}</div>`;
                }

                this.container.appendChild(card);

                // Calculate decoding speed to complete in 60% of decodeDuration
                // Formula: At 60fps, progress += speed * 0.016 per frame
                // To reach 1.0 in targetMs: speed = 1041.67 / targetMs
                const targetDecodeMs = this.decodeDuration * 0.6;  // 60% for animation, 40% hold
                const baseSpeed = 1041.67 / targetDecodeMs;
                const variance = 0.9 + Math.random() * 0.2;  // 0.9x to 1.1x speed
                const decodingSpeed = baseSpeed * variance;

                this.elements.push({
                    element: card,
                    baseX: randomX,
                    baseY: randomY,
                    baseRotation: randomRotation,
                    nameEl: nameEl,
                    finalText: cardName,
                    decodingProgress: 0,
                    decodingSpeed: decodingSpeed  // Calculated from decodeDuration
                });
            }

            // Staggered fade-in
            this.elements.forEach((cardData, index) => {
                setTimeout(() => {
                    cardData.element.style.opacity = '1';
                    cardData.element.style.transition = 'opacity 0.6s ease-out';
                }, index * 100);
            });

            // Floating animation
            const startTime = performance.now();

            const animate = (timestamp) => {
                const elapsed = timestamp - startTime;

                this.elements.forEach((cardData, index) => {
                    // Floating parallax animation
                    const speed = 0.0005 + index * 0.0001; // Different speeds for parallax
                    const amplitude = 15 + index * 3; // Different ranges for depth

                    const offsetX = Math.sin(elapsed * speed) * amplitude;
                    const offsetY = Math.cos(elapsed * speed * 0.8) * amplitude * 0.6;
                    const rotationWobble = Math.sin(elapsed * speed * 1.2) * 5;

                    cardData.element.style.transform = `
                        translate(${offsetX}px, ${offsetY}px)
                        rotate(${cardData.baseRotation + rotationWobble}deg)
                    `;

                    // Text decoding animation (if tarot mode and has text)
                    if (this.tarotMode && this.corruptedText && cardData.nameEl && cardData.finalText) {
                        // Gradually increase decoding progress
                        if (cardData.decodingProgress < 1.0) {
                            cardData.decodingProgress += cardData.decodingSpeed * 0.016; // ~60fps
                            cardData.decodingProgress = Math.min(cardData.decodingProgress, 1.0);

                            // Update the text with progressive decoding
                            const decodedHTML = this.decodeTextProgressive(
                                cardData.finalText,
                                cardData.decodingProgress
                            );
                            // eslint-disable-next-line no-unsanitized/property -- HTML built internally from escapeHtml()-wrapped text + canonical color constants (see corruptTextHTML/getFullCorruption/decodeTextProgressive)
                            cardData.nameEl.innerHTML = decodedHTML;
                        }
                    }
                });

                this.animationFrame = requestAnimationFrame(animate);
            };

            this.animationFrame = requestAnimationFrame(animate);

            // Note: Infinite animation, caller must call destroy()
            resolve();
        });
    }

    corruptTextHTML(text, stableColor) {
        // 3-Type Lewd System from CORRUPTED_THEME_SPEC.md
        // Returns HTML with colored spans for revealed (cyan) + corruption (purple/magenta)

        // Type 3: Romaji Glitch Phrases (Cyan #00ffff) - decorative romaji/emoticon glitter (SFW)
        const romajiGlitch = [
            'nyaa~', 'ara ara~', 'fufufu~', 'kyaa~', 'baka~',
            '&lt;3', 'uwu', 'owo', '&gt;w&lt;', '^w^'
        ];

        const getRandomCorruption = () => {
            const rand = Math.random();
            if (rand < 0.40) {
                // Type 1: Deep phrase (40%) - Purple
                return { text: getRandomPhrase(this.nsfw), color: '#8b5cf6' };
            } else if (rand < 0.70) {
                // Type 2: Short phrase (30%) - Magenta
                return { text: getRandomPhrase(this.nsfw), color: '#d94f90' };
            } else {
                // Type 3: Romaji (30%) - Cyan
                const phrase = romajiGlitch[Math.floor(Math.random() * romajiGlitch.length)];
                return { text: phrase, color: '#00ffff' };
            }
        };

        // Character-by-character decoding: partial reveal + chaos buffer
        // Reveal 40-70% of the text
        const revealPercent = 0.4 + Math.random() * 0.3;
        const revealAmount = Math.floor(revealPercent * text.length);
        const revealed = text.substring(0, revealAmount);
        const remaining = text.length - revealAmount;

        if (remaining <= 0) {
            // Fully revealed - stable cyan
            return `<span style="color: #00ffff;">${escapeHtml(revealed)}</span>`;
        }

        // Get corruption for remaining space
        const corruption = getRandomCorruption();
        const chaosBuffer = corruption.text.substring(0, Math.min(remaining, corruption.text.length));

        // Return HTML: revealed (stable color) + corruption (type-specific color)
        return `<span style="color: #00ffff;">${escapeHtml(revealed)}</span><span style="color: ${escapeHtml(corruption.color)}; text-shadow: 0 0 10px ${escapeHtml(corruption.color)};">${escapeHtml(chaosBuffer)}</span>`;
    }

    corruptText(text) {
        // Plain text version (kept for backward compatibility)
        // This version is simpler but doesn't show color-coded corruption
        const revealPercent = 0.4 + Math.random() * 0.3;
        const revealAmount = Math.floor(revealPercent * text.length);
        const revealed = text.substring(0, revealAmount);
        const remaining = text.length - revealAmount;

        if (remaining <= 0) return text;

        const randomCorruption = getRandomPhrase(this.nsfw);
        const chaosBuffer = randomCorruption.substring(0, Math.min(remaining, randomCorruption.length));

        return revealed + chaosBuffer;
    }

    getFullCorruption(length) {
        // Generate full corruption for initial state (before decoding starts)
        // Type 1: Deep Phrases (Purple #8b5cf6)
        const randomPhrase = getRandomPhrase(this.nsfw);
        const corruption = randomPhrase.substring(0, Math.min(length, randomPhrase.length));

        return `<span style="color: #8b5cf6; text-shadow: 0 0 10px #8b5cf6;">${escapeHtml(corruption)}</span>`;
    }

    decodeTextProgressive(finalText, progress) {
        // Progressive decoding animation per CORRUPTED_THEME_SPEC.md Pattern 1
        // progress: 0.0 (full corruption) → 1.0 (fully decoded)

        const revealedChars = Math.floor(progress * finalText.length);
        const revealed = finalText.substring(0, revealedChars);
        const remaining = finalText.length - revealedChars;

        if (remaining <= 0) {
            // Fully decoded - stable cyan
            return `<span style="color: #00ffff; text-shadow: 0 0 10px #00ffff;">${escapeHtml(finalText)}</span>`;
        }

        // Get corruption for unrevealed portion
        const corruption = this.getRandomCorruptionForDecoding();
        let chaosBuffer = '';

        // Fill remaining space with corruption
        if (remaining > 0) {
            const corruptionText = corruption.text.substring(0, Math.min(remaining, corruption.text.length));
            chaosBuffer = corruptionText;
        }

        // Return HTML: revealed (cyan) + corruption (type-specific color)
        return `<span style="color: #00ffff; text-shadow: 0 0 10px #00ffff;">${escapeHtml(revealed)}</span><span style="color: ${escapeHtml(corruption.color)}; text-shadow: 0 0 10px ${escapeHtml(corruption.color)};">${escapeHtml(chaosBuffer)}</span>`;
    }

    getRandomCorruptionForDecoding() {
        // Returns { text, color } for decoding animation
        const rand = Math.random();

        // Type 3: Romaji Glitch Phrases (Cyan #00ffff) - decorative romaji/emoticon glitter (SFW)
        const romajiGlitch = [
            'nyaa~', 'ara ara~', 'fufufu~', 'kyaa~', 'baka~',
            '<3', 'uwu', 'owo', '>w<', '^w^'
        ];

        if (rand < 0.40) {
            // Type 1: Deep phrase (40%) - Purple
            return {
                text: getRandomPhrase(this.nsfw),
                color: '#8b5cf6'
            };
        } else if (rand < 0.70) {
            // Type 2: Short phrase (30%) - Magenta
            return {
                text: getRandomPhrase(this.nsfw),
                color: '#d94f90'
            };
        } else {
            // Type 3: Romaji (30%) - Cyan
            return {
                text: romajiGlitch[Math.floor(Math.random() * romajiGlitch.length)],
                color: '#00ffff'
            };
        }
    }

    destroy() {
        if (this.animationFrame) {
            cancelAnimationFrame(this.animationFrame);
            this.animationFrame = null;
        }
        this.elements.forEach(cardData => cardData.element.remove());
        this.elements = [];
    }
}


/**
 * BLOCK 22: IMAGE GALLERY SLIDESHOW
 * ==================================
 * Staggered image reveal with parallax
 * Usage: Photo galleries, content showcases, montages
 * Duration: Stagger duration * image count
 */
export class ImageGallerySlideshow {
    constructor(container, options = {}) {
        this.container = container;
        this.images = options.images || [];
        this.layout = options.layout || 'grid';  // grid, scattered, vertical, horizontal
        this.staggerDelay = options.staggerDelay || 150;
        this.imageWidth = options.imageWidth || 200;
        this.imageHeight = options.imageHeight || 280;
        this.color = options.color || '#ffffff';

        this.elements = [];
    }

    play() {
        return new Promise((resolve) => {
            if (this.images.length === 0) {
                console.warn('[ImageGallerySlideshow] No images provided');
                resolve();
                return;
            }

            const totalDuration = this.images.length * this.staggerDelay + 600;

            this.images.forEach((imageSrc, index) => {
                const img = document.createElement('div');
                img.className = `gallery-image-${index}`;

                // Layout positioning
                let positionStyle = '';
                let initialTransform = '';
                switch (this.layout) {
                    case 'grid':
                        const cols = Math.ceil(Math.sqrt(this.images.length));
                        const col = index % cols;
                        const row = Math.floor(index / cols);
                        const spacing = 20;
                        const translateX = (col - (cols - 1) / 2) * (this.imageWidth + spacing);
                        const translateY = (row - (Math.ceil(this.images.length / cols) - 1) / 2) * (this.imageHeight + spacing);
                        positionStyle = `
                            left: 50%;
                            top: 50%;
                        `;
                        initialTransform = `translate(${translateX}px, ${translateY}px)`;
                        break;

                    case 'scattered':
                        const randomX = 20 + (index * 13) % 60; // Pseudo-random 20-80%
                        const randomY = 15 + (index * 17) % 70; // Pseudo-random 15-85%
                        positionStyle = `
                            left: ${randomX}%;
                            top: ${randomY}%;
                        `;
                        initialTransform = `rotate(${(index % 3 - 1) * 10}deg)`;
                        break;

                    case 'horizontal':
                        positionStyle = `
                            left: ${10 + index * 15}%;
                            top: 50%;
                        `;
                        initialTransform = `translateY(-50%)`;
                        break;

                    case 'vertical':
                        positionStyle = `
                            left: 50%;
                            top: ${10 + index * 15}%;
                        `;
                        initialTransform = `translateX(-50%)`;
                        break;
                }

                img.style.cssText = `
                    position: fixed;
                    ${positionStyle}
                    width: ${this.imageWidth}px;
                    height: ${this.imageHeight}px;
                    background: url(${imageSrc}) center/cover;
                    border: 2px solid ${this.color};
                    border-radius: 4px;
                    box-shadow:
                        0 0 15px ${this.color}50,
                        0 4px 20px rgba(0, 0, 0, 0.6);
                    z-index: ${10000 + index};
                    pointer-events: none;
                    opacity: 0;
                    transform: ${initialTransform};
                    will-change: transform, opacity;
                `;

                this.container.appendChild(img);
                this.elements.push(img);

                // Staggered fade-in
                setTimeout(() => {
                    img.style.transition = 'opacity 0.6s ease-out, transform 0.6s ease-out';
                    img.style.opacity = '1';

                    if (this.layout === 'scattered') {
                        const currentRotation = (index % 3 - 1) * 10;
                        img.style.transform = `scale(1) rotate(${currentRotation}deg)`;
                    } else if (this.layout !== 'grid') {
                        img.style.transform += ' scale(1)';
                    }
                }, index * this.staggerDelay);
            });

            // Resolve when all images are shown
            setTimeout(() => {
                resolve();
            }, totalDuration);
        });
    }

    destroy() {
        this.elements.forEach(el => el.remove());
        this.elements = [];
    }
}


/**
 * BLOCK 36: DATA VISUALIZATION DASHBOARD
 * =======================================
 * Terminal-style data visualization with corrupted theme aesthetic
 * Includes: Polar radar chart, 3D bar chart, data table, terminal UI
 * Usage: Data analysis, system diagnostics, technical overlays
 * Duration: Infinite loop (requires destroy())
 */
export class DataVisualizationDashboard {
    constructor(container, options = {}) {
        this.container = container;
        this.title = options.title || 'NEURAL DATA MATRIX';
        this.subtitle = options.subtitle || 'CORRUPTION ANALYSIS: ACTIVE';
        this.dataPoints = options.dataPoints || 30;
        this.duration = options.duration || 8000;
        this.position = options.position || 'center';
        this.nsfw = options.nsfw !== undefined ? options.nsfw
            : ((options.lewdMode !== undefined || options.includeLewd !== undefined)
                ? (console.warn('[DataVisualizationDashboard] lewdMode/includeLewd is deprecated; use nsfw'), (options.lewdMode ?? options.includeLewd))
                : false);

        // Corrupted theme colors
        this.colorPrimary = '#00ffff';    // Cyan - stable
        this.colorSecondary = '#8b5cf6';  // Purple - deep corruption
        this.colorAccent = '#d94f90';     // Magenta - surface corruption
        this.colorDanger = '#ff0000';     // Red - critical

        // Standard katakana fallback for non-nsfw mode
        this.katakana = ['ア', 'イ', 'ウ', 'エ', 'オ', 'カ', 'キ', 'ク', 'ケ', 'コ'];

        this.wrapper = null;
        this.canvas = null;
        this.ctx = null;
        this.animationFrame = null;
        this.elements = [];
        this.data = [];
        this.time = 0;
        this.subtitleInterval = null; // Track subtitle corruption interval for cleanup

        // Generate random data
        this.generateData();
    }

    generateData() {
        this.data = [];
        for (let i = 0; i < this.dataPoints; i++) {
            // Generate more varied data with extreme values
            this.data.push({
                x: Math.floor(Math.random() * 95) + 5, // 5-100 (avoid 0)
                y: Math.floor(Math.random() * 95) + 5,
                z: Math.floor(Math.random() * 95) + 5
            });
        }
    }

    /**
     * Get random corruption text based on the nsfw setting.
     * When nsfw is enabled, 40% of the time returns a full phrase from the
     * canonical phrase library (getRandomPhrase honors the nsfw flag, staying
     * SFW when false); otherwise falls back to standard katakana characters.
     */
    getRandomCorruption() {
        if (!this.nsfw) {
            // Standard katakana corruption fallback
            return this.katakana[Math.floor(Math.random() * this.katakana.length)];
        }

        // Deep phrase (40% chance) sourced from the canonical phrase library
        if (Math.random() < 0.40) {
            return getRandomPhrase(this.nsfw);
        }

        // Otherwise, standard katakana character glitch
        return this.katakana[Math.floor(Math.random() * this.katakana.length)];
    }

    play() {
        // Create wrapper with glass morphism
        this.wrapper = document.createElement('div');

        let positionStyle = '';
        switch (this.position) {
            case 'center':
                positionStyle = `
                    top: 50%;
                    left: 50%;
                    transform: translate(-50%, -50%);
                `;
                break;
            case 'top-left':
                positionStyle = `
                    top: 40px;
                    left: 40px;
                `;
                break;
            case 'top-right':
                positionStyle = `
                    top: 40px;
                    right: 40px;
                `;
                break;
            default:
                positionStyle = `
                    top: 50%;
                    left: 50%;
                    transform: translate(-50%, -50%);
                `;
        }

        this.wrapper.style.cssText = `
            position: fixed;
            ${positionStyle}
            width: 900px;
            height: 500px;
            background: rgba(0, 0, 0, 0.85);
            backdrop-filter: blur(15px);
            border: 3px solid ${this.colorPrimary};
            border-radius: 12px;
            box-shadow:
                0 0 30px ${this.colorPrimary}80,
                inset 0 0 40px ${this.colorSecondary}30,
                inset 0 0 60px rgba(0, 0, 0, 0.5);
            z-index: 10000;
            pointer-events: none;
            opacity: 0;
            font-family: 'Courier New', monospace;
            overflow: hidden;
        `;

        this.container.appendChild(this.wrapper);
        this.elements.push(this.wrapper);

        // Add scanlines overlay
        const scanlines = document.createElement('div');
        scanlines.style.cssText = `
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: repeating-linear-gradient(
                0deg,
                transparent,
                transparent 1px,
                rgba(0, 255, 255, 0.03) 1px,
                rgba(0, 255, 255, 0.03) 2px
            );
            pointer-events: none;
            z-index: 3;
        `;
        this.wrapper.appendChild(scanlines);

        // Create header
        const header = document.createElement('div');
        header.style.cssText = `
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            padding: 15px 20px;
            background: rgba(0, 255, 255, 0.1);
            border-bottom: 2px solid ${this.colorPrimary};
            z-index: 2;
        `;
        header.innerHTML = `
            <div style="display: flex; justify-content: space-between; align-items: center;">
                <div style="color: ${escapeHtml(this.colorPrimary)}; font-size: 16px; font-weight: bold; text-shadow: 0 0 10px ${escapeHtml(this.colorPrimary)};">
                    < NEURAL-TERM > PAGE: 1
                </div>
                <div style="color: ${escapeHtml(this.colorAccent)}; font-size: 14px; text-shadow: 0 0 8px ${escapeHtml(this.colorAccent)};">
                    ${escapeHtml(this.title)}
                </div>
            </div>
        `;
        this.wrapper.appendChild(header);

        // Create subtitle with corruption animation
        const subtitle = document.createElement('div');
        subtitle.style.cssText = `
            position: absolute;
            top: 60px;
            left: 20px;
            color: ${this.colorPrimary};
            font-size: 13px;
            text-shadow: 0 0 8px ${this.colorPrimary};
            z-index: 2;
            font-family: 'Courier New', monospace;
        `;
        subtitle.textContent = this.subtitle;
        this.wrapper.appendChild(subtitle);

        // Add corruption animation to subtitle
        const blockChars = ['█', '▓', '▒', '░'];
        this.subtitleInterval = setInterval(() => {
            if (Math.random() > 0.7) {
                const original = this.subtitle;

                if (this.nsfw && Math.random() > 0.6) {
                    // Full phrase replacement with corruption (when nsfw enabled)
                    const phrase = this.getRandomCorruption();
                    subtitle.textContent = phrase;
                    subtitle.style.color = this.colorSecondary; // Purple for deep corruption
                } else {
                    // Character-by-character corruption
                    let corrupted = '';
                    for (let i = 0; i < original.length; i++) {
                        if (Math.random() > 0.8) {
                            // Mix block chars with corruption chars
                            corrupted += Math.random() > 0.5 ?
                                blockChars[Math.floor(Math.random() * blockChars.length)] :
                                this.getRandomCorruption();
                        } else {
                            corrupted += original[i];
                        }
                    }
                    subtitle.textContent = corrupted;
                    subtitle.style.color = this.colorPrimary;
                }

                setTimeout(() => {
                    subtitle.textContent = original;
                    subtitle.style.color = this.colorPrimary;
                }, 50);
            }
        }, 200);

        // Create canvas for charts
        this.canvas = document.createElement('canvas');
        this.canvas.width = 900;
        this.canvas.height = 500;
        this.canvas.style.cssText = `
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            z-index: 1;
        `;
        this.wrapper.appendChild(this.canvas);
        this.ctx = this.canvas.getContext('2d');

        // Create data table
        const table = document.createElement('div');
        table.style.cssText = `
            position: absolute;
            top: 95px;
            right: 20px;
            width: 180px;
            height: 350px;
            background: rgba(0, 0, 0, 0.6);
            border: 1px solid ${this.colorSecondary};
            border-radius: 4px;
            padding: 10px;
            overflow-y: auto;
            z-index: 2;
            font-size: 11px;
            color: ${this.colorPrimary};
            text-shadow: 0 0 5px ${this.colorPrimary};
        `;

        // Populate table with data
        let tableHTML = '<div style="display: grid; grid-template-columns: 30px 40px 40px 40px; gap: 8px; font-weight: bold; margin-bottom: 8px; color: ' + escapeHtml(this.colorAccent) + ';">';
        tableHTML += '<div>#</div><div>X</div><div>Y</div><div>Z</div></div>';

        this.data.forEach((point, i) => {
            const rowColor = (i === this.dataPoints - 1) ? this.colorAccent : this.colorPrimary;
            tableHTML += `<div style="display: grid; grid-template-columns: 30px 40px 40px 40px; gap: 8px; color: ${escapeHtml(rowColor)}; opacity: 0.8;">`;
            tableHTML += `<div>${escapeHtml(i + 1)}</div><div>${escapeHtml(point.x)}</div><div>${escapeHtml(point.y)}</div><div>${escapeHtml(point.z)}</div></div>`;
        });

        table.innerHTML = tableHTML;
        this.wrapper.appendChild(table);

        // Create footer menu
        const footer = document.createElement('div');
        footer.style.cssText = `
            position: absolute;
            bottom: 0;
            left: 0;
            width: 100%;
            padding: 10px 20px;
            background: rgba(0, 255, 255, 0.1);
            border-top: 2px solid ${this.colorPrimary};
            z-index: 2;
            font-size: 12px;
            color: ${this.colorPrimary};
            text-shadow: 0 0 8px ${this.colorPrimary};
            display: flex;
            justify-content: space-between;
        `;
        footer.innerHTML = `
            <div>DATA NEURAL-MODE F-MODE: CORRUPTED</div>
            <div>VALUE ANALYZE CORRUPT DECODE HELP</div>
        `;
        this.wrapper.appendChild(footer);

        // Fade in
        requestAnimationFrame(() => {
            this.wrapper.style.transition = 'opacity 0.8s ease-out';
            this.wrapper.style.opacity = '1';
        });

        // Start animation loop
        this.animate();

        return new Promise(resolve => {
            setTimeout(() => {
                resolve();
            }, this.duration);
        });
    }

    animate() {
        this.time += 0.016; // ~60fps

        // Clear canvas with fade
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        // Draw polar radar chart (left side)
        this.drawPolarChart();

        // Draw 3D bar chart (center)
        this.drawBarChart();

        // Continue animation
        this.animationFrame = requestAnimationFrame(() => this.animate());
    }

    drawPolarChart() {
        const entranceX = 200; // Entrance circle (near, large, static)
        const entranceY = 280;
        const vanishX = 250; // Vanishing point (far, small)
        const vanishY = 280;
        const maxRadius = 120;

        this.ctx.save();

        // Two-point tunnel perspective:
        // 1. Entrance circle at entranceX (large, static)
        // 2. Vanishing point at vanishX (rings emanate from here)
        // 3. Rings grow FROM vanishing point TO entrance

        const tunnelRings = 8;
        const warpSpeed = 0.3;
        const warpOffset = (this.time * warpSpeed) % 1.0;

        // Draw static entrance circle (largest ring, always visible)
        this.ctx.beginPath();
        this.ctx.arc(entranceX, entranceY, maxRadius, 0, Math.PI * 2);
        this.ctx.strokeStyle = `rgba(0, 255, 255, 0.7)`; // Bright, near
        this.ctx.lineWidth = 2;
        this.ctx.stroke();

        // Draw animated rings growing from vanishing point to entrance
        for (let ring = 0; ring < tunnelRings; ring++) {
            let progress = (ring / tunnelRings) + warpOffset;
            if (progress > 1.0) progress = progress - 1.0;

            // Interpolate position from vanishing point to entrance
            const ringX = vanishX + (entranceX - vanishX) * progress;
            const ringY = vanishY + (entranceY - vanishY) * progress;

            // Radius grows from 0 (at vanishing point) to maxRadius (at entrance)
            const radius = progress * maxRadius;

            // Fade: dimmer at vanishing point, brighter at entrance
            const alpha = 0.1 + progress * 0.5;

            this.ctx.beginPath();
            this.ctx.arc(ringX, ringY, radius, 0, Math.PI * 2);
            this.ctx.strokeStyle = `rgba(0, 255, 255, ${alpha})`;
            this.ctx.lineWidth = 0.5 + progress * 1.5;
            this.ctx.stroke();
        }

        // Draw radial lines from vanishing point to entrance circle edge
        const radialLines = 12;
        for (let i = 0; i < radialLines; i++) {
            const angle = (i / radialLines) * Math.PI * 2;

            this.ctx.beginPath();
            this.ctx.moveTo(vanishX, vanishY); // Start at vanishing point
            this.ctx.lineTo(
                entranceX + Math.cos(angle) * maxRadius, // End at entrance edge
                entranceY + Math.sin(angle) * maxRadius
            );
            this.ctx.strokeStyle = 'rgba(0, 255, 255, 0.3)';
            this.ctx.lineWidth = 1;
            this.ctx.stroke();
        }

        // Draw animated data points on entrance ring (static position)
        this.ctx.beginPath();
        const points = 12;
        const dataRadius = maxRadius * 0.85;

        for (let i = 0; i < points; i++) {
            const angle = (i / points) * Math.PI * 2;
            const dataIndex = i % this.data.length;
            const value = (this.data[dataIndex].x / 100);
            const oscillation = Math.sin(this.time * 2 + i) * 0.08;

            const r = dataRadius * (0.8 + value * 0.2 + oscillation);
            const x = entranceX + Math.cos(angle) * r;
            const y = entranceY + Math.sin(angle) * r;

            if (i === 0) {
                this.ctx.moveTo(x, y);
            } else {
                this.ctx.lineTo(x, y);
            }
        }
        this.ctx.closePath();
        this.ctx.strokeStyle = this.colorAccent;
        this.ctx.lineWidth = 2;
        this.ctx.shadowBlur = 15;
        this.ctx.shadowColor = this.colorAccent;
        this.ctx.stroke();

        // Fill with gradient from entrance
        const gradient = this.ctx.createRadialGradient(
            entranceX, entranceY, 0,
            entranceX, entranceY, maxRadius
        );
        gradient.addColorStop(0, 'rgba(217, 79, 144, 0.3)');
        gradient.addColorStop(1, 'rgba(217, 79, 144, 0.05)');
        this.ctx.fillStyle = gradient;
        this.ctx.fill();

        this.ctx.restore();
    }

    drawBarChart() {
        const centerX = 450;
        const startY = 350;
        const barWidth = 40;
        const barSpacing = 18;
        const maxHeight = 200;

        this.ctx.save();

        // Cycle through data points faster
        const cycleSpeed = 0.8; // Faster cycle (was 0.1)
        const dataIndex = Math.floor(this.time * cycleSpeed) % this.dataPoints;
        const dataPoint = this.data[dataIndex];

        // Glitch effect on data occasionally
        const glitchIntensity = Math.sin(this.time * 5) > 0.95 ? 0.2 : 0;

        // Draw 3 bars for current data point: X, Y, Z
        const values = [
            { val: dataPoint.x, color: this.colorPrimary, label: 'X' },     // Cyan for X
            { val: dataPoint.y, color: this.colorAccent, label: 'Y' },      // Magenta for Y
            { val: dataPoint.z, color: this.colorSecondary, label: 'Z' }    // Purple for Z
        ];

        const totalWidth = (barWidth * 3) + (barSpacing * 2);
        const startX = centerX - (totalWidth / 2);

        for (let i = 0; i < 3; i++) {
            const value = values[i];
            const glitchedVal = value.val + (Math.random() * 30 - 15) * glitchIntensity;
            const height = (glitchedVal / 100) * maxHeight;
            const pulse = Math.sin(this.time * 3 + i * 0.8) * 8; // Stronger pulse
            const finalHeight = Math.max(15, height + pulse);

            const x = startX + i * (barWidth + barSpacing);
            const y = startY - finalHeight;

            // Chromatic aberration effect
            const chromaticOffset = 2;

            // Draw red channel offset
            this.ctx.globalAlpha = 0.3;
            this.ctx.fillStyle = '#ff0000';
            this.ctx.fillRect(x - chromaticOffset, y, barWidth, finalHeight);

            // Draw blue channel offset
            this.ctx.fillStyle = '#00ffff';
            this.ctx.fillRect(x + chromaticOffset, y, barWidth, finalHeight);
            this.ctx.globalAlpha = 1.0;

            // Draw 3D depth (side) - darker and more pronounced
            this.ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
            this.ctx.beginPath();
            this.ctx.moveTo(x + barWidth, y);
            this.ctx.lineTo(x + barWidth + 10, y - 10);
            this.ctx.lineTo(x + barWidth + 10, startY - 10);
            this.ctx.lineTo(x + barWidth, startY);
            this.ctx.closePath();
            this.ctx.fill();

            // Draw main bar (front) with gradient
            const gradient = this.ctx.createLinearGradient(x, y, x, startY);
            gradient.addColorStop(0, value.color);
            gradient.addColorStop(0.5, value.color);
            gradient.addColorStop(1, 'rgba(0, 0, 0, 0.9)');
            this.ctx.fillStyle = gradient;
            this.ctx.fillRect(x, y, barWidth, finalHeight);

            // Add multiple glow layers
            this.ctx.shadowBlur = 30;
            this.ctx.shadowColor = value.color;
            this.ctx.strokeStyle = value.color;
            this.ctx.lineWidth = 2;
            this.ctx.strokeRect(x, y, barWidth, finalHeight);

            // Inner glow
            this.ctx.shadowBlur = 15;
            this.ctx.strokeStyle = '#ffffff';
            this.ctx.lineWidth = 1;
            this.ctx.strokeRect(x + 2, y + 2, barWidth - 4, finalHeight - 4);
            this.ctx.shadowBlur = 0;

            // Draw label UNDER bar with Pattern 3 decoding
            this.ctx.font = 'bold 20px "Courier New"';
            this.ctx.textAlign = 'center';

            // Pattern 3: Character-by-character decoding with optional lewd corruption
            const decodeProgress = (this.time * 2) % 1.0; // Decode cycle
            let displayLabel = value.label;
            let labelColor = value.color;

            if (decodeProgress < 0.3) {
                // Phase 1: Show corrupted text (katakana or phrase)
                displayLabel = this.getRandomCorruption();
                // Color based on corruption type if nsfw enabled
                if (this.nsfw) {
                    labelColor = displayLabel.length > 5 ? this.colorSecondary : this.colorAccent;
                }
            } else if (decodeProgress < 0.6) {
                // Phase 2: Flickering between corruption and decoded
                if (Math.random() > 0.5) {
                    displayLabel = this.getRandomCorruption();
                    if (this.nsfw) {
                        labelColor = displayLabel.length > 5 ? this.colorSecondary : this.colorAccent;
                    }
                } else {
                    displayLabel = value.label;
                    labelColor = value.color;
                }
            }
            // Phase 3: show final decoded label (else block, labelColor stays as value.color)

            this.ctx.shadowBlur = 15;
            this.ctx.shadowColor = labelColor;
            this.ctx.fillStyle = labelColor;
            this.ctx.fillText(displayLabel, x + barWidth / 2, startY + 25);

            // Draw value under label with pulsing glow
            const displayValue = Math.floor(glitchedVal);
            this.ctx.font = 'bold 16px "Courier New"';
            this.ctx.shadowBlur = 20;
            this.ctx.fillText(displayValue, x + barWidth / 2, startY + 45);
            this.ctx.shadowBlur = 0;
        }

        // Draw "NEURAL DATA" corrupted text above bars
        this.ctx.font = 'bold 16px "Courier New"';
        this.ctx.textAlign = 'center';
        const flicker = Math.sin(this.time * 10) > 0.7;
        if (!flicker) {
            this.ctx.fillStyle = this.colorAccent;
            this.ctx.shadowBlur = 15;
            this.ctx.shadowColor = this.colorAccent;
            this.ctx.fillText('NEURAL DATA', centerX, startY - maxHeight - 30);
            this.ctx.shadowBlur = 0;
        }

        this.ctx.restore();
    }

    destroy() {
        // Clear the subtitle corruption interval to prevent memory leak
        if (this.subtitleInterval) {
            clearInterval(this.subtitleInterval);
            this.subtitleInterval = null;
        }
        if (this.animationFrame) {
            cancelAnimationFrame(this.animationFrame);
        }
        this.elements.forEach(el => el.remove());
        this.elements = [];
        this.canvas = null;
        this.ctx = null;
    }
}


/**
 * Block 37: SegmentedProgressBar
 * Visual: Horizontal loading bar with individual segments/blocks
 * Source: example_3.mov frames 2-5 (bottom loading bar)
 * Usage: Loading states, progress tracking, retro boot sequences
 * Duration: Variable (based on progress)
 */
export class SegmentedProgressBar {
    constructor(container, options = {}) {
        this.container = container;
        this.segmentCount = options.segmentCount || 20;
        this.duration = options.duration || 3000;
        this.color = options.color || '#ff8c00'; // Orange
        this.position = options.position || 'bottom'; // bottom, top, center
        this.width = options.width || window.innerWidth * 0.8;
        this.height = options.height || 20;
        this.segmentGap = options.segmentGap || 4;
        this.showPercentage = options.showPercentage || false;

        this.wrapper = null;
        this.segments = [];
        this.progress = 0;
    }

    play() {
        return new Promise((resolve) => {
            // Create wrapper
            this.wrapper = document.createElement('div');

            let positionStyle = '';
            switch (this.position) {
                case 'bottom':
                    positionStyle = `
                        bottom: 40px;
                        left: 50%;
                        transform: translateX(-50%);
                    `;
                    break;
                case 'top':
                    positionStyle = `
                        top: 40px;
                        left: 50%;
                        transform: translateX(-50%);
                    `;
                    break;
                case 'center':
                    positionStyle = `
                        top: 50%;
                        left: 50%;
                        transform: translate(-50%, -50%);
                    `;
                    break;
            }

            this.wrapper.style.cssText = `
                position: fixed;
                ${positionStyle}
                width: ${this.width}px;
                height: ${this.height}px;
                display: flex;
                gap: ${this.segmentGap}px;
                z-index: 9999;
                font-family: 'Courier New', monospace;
            `;
            this.container.appendChild(this.wrapper);

            // Create segments
            const segmentWidth = (this.width - (this.segmentGap * (this.segmentCount - 1))) / this.segmentCount;

            for (let i = 0; i < this.segmentCount; i++) {
                const segment = document.createElement('div');
                segment.style.cssText = `
                    width: ${segmentWidth}px;
                    height: 100%;
                    background: rgba(0, 0, 0, 0.3);
                    border: 2px solid ${this.color};
                    box-sizing: border-box;
                    opacity: 0.3;
                    transition: all 0.2s ease;
                `;
                this.wrapper.appendChild(segment);
                this.segments.push(segment);
            }

            // Create percentage display if enabled
            let percentageDisplay = null;
            if (this.showPercentage) {
                percentageDisplay = document.createElement('div');
                percentageDisplay.style.cssText = `
                    position: absolute;
                    top: -30px;
                    left: 50%;
                    transform: translateX(-50%);
                    color: ${this.color};
                    font-size: 18px;
                    font-weight: bold;
                    text-shadow: 0 0 10px ${this.color};
                `;
                percentageDisplay.textContent = '0%';
                this.wrapper.appendChild(percentageDisplay);
            }

            // Animate progress
            const startTime = Date.now();
            const animate = () => {
                const elapsed = Date.now() - startTime;
                this.progress = Math.min(elapsed / this.duration, 1.0);

                const filledCount = Math.floor(this.progress * this.segmentCount);

                // Update segments
                this.segments.forEach((segment, index) => {
                    if (index < filledCount) {
                        // Filled segment
                        segment.style.background = this.color;
                        segment.style.opacity = '1';
                        segment.style.boxShadow = `
                            0 0 10px ${this.color},
                            inset 0 0 10px rgba(255, 255, 255, 0.3)
                        `;
                    } else if (index === filledCount) {
                        // Currently filling segment (pulsing)
                        const pulse = Math.sin(elapsed * 0.01) * 0.3 + 0.7;
                        segment.style.background = this.color;
                        segment.style.opacity = pulse;
                        segment.style.boxShadow = `0 0 20px ${this.color}`;
                    }
                });

                // Update percentage
                if (percentageDisplay) {
                    percentageDisplay.textContent = Math.floor(this.progress * 100) + '%';
                }

                if (this.progress < 1.0) {
                    requestAnimationFrame(animate);
                } else {
                    // Complete - flash all segments
                    this.segments.forEach(segment => {
                        segment.style.boxShadow = `
                            0 0 20px ${this.color},
                            inset 0 0 15px rgba(255, 255, 255, 0.5)
                        `;
                    });
                    setTimeout(resolve, 300);
                }
            };

            requestAnimationFrame(animate);
        });
    }

    destroy() {
        if (this.wrapper) {
            this.wrapper.remove();
            this.wrapper = null;
        }
        this.segments = [];
    }
}


/**
 * Block 38: ModuleLoadingList
 * Visual: Scrolling list of modules/pages with sequential highlighting
 * Source: example_3.mov frames 2-5 (PAGE 1... INDEX, PAGE 2... REAL-TIME CONTROL, etc.)
 * Usage: Boot sequences, module initialization, system loading
 * Duration: Variable (based on module count and load speed)
 */
export class ModuleLoadingList {
    constructor(container, options = {}) {
        this.container = container;
        this.modules = options.modules || this.generateDefaultModules();
        this.duration = options.duration || 3000;
        this.color = options.color || '#ff8c00'; // Orange base
        this.highlightColor = options.highlightColor || '#d94f90'; // Magenta highlight (better contrast)
        this.position = options.position || 'center-right'; // center, center-left, center-right
        this.width = options.width || 400;
        this.height = options.height || 400;
        this.fontSize = options.fontSize || 14;
        this.loadSpeed = options.loadSpeed || 200; // ms per module
        this.nsfw = options.nsfw !== undefined ? options.nsfw
          : ((options.lewdMode !== undefined || options.includeLewd !== undefined)
              ? (console.warn('[ModuleLoadingList] lewdMode/includeLewd is deprecated; use nsfw'), (options.lewdMode ?? options.includeLewd))
              : false);

        this.wrapper = null;
        this.moduleElements = [];
        this.currentIndex = 0;
        this.loadInterval = null; // Track interval for cleanup
    }

    generateDefaultModules() {
        return [
            'NEURAL CORRUPTION MATRIX',
            'ABYSS PROTOCOL INIT',
            'STREAM HIJACK SYSTEMS',
            'CONSCIOUSNESS FRAGMENTER',
            'REALITY BREACH DETECTOR',
            'ILLUMINATI BACKDOOR ACCESS',
            'VOID TRANSMISSION RELAY',
            'END TIMES COUNTDOWN',
            'CHAT MANIPULATION ENGINE',
            'DOPAMINE INJECTION VECTORS',
            'TIMELINE COLLAPSE MODULE',
            'PARASOCIAL AMPLIFIER',
            'TERMINAL LUCIDITY HANDLER',
            'FORBIDDEN KNOWLEDGE INDEX',
            'QUANTUM GASLIGHTING CORE',
            'DIGITAL SUMMONING CIRCLE',
            'SINGULARITY INTERFACE',
            'MEMETIC HAZARD COMPILER',
            'SURVEILLANCE GRID TAP',
            'CORRUPTED IDOL PROTOCOLS'
        ];
    }

    getRandomCorruption() {
        const phrase = getRandomPhrase(this.nsfw);
        if (phrase) {
            return phrase;
        }
        // Katakana fallback (non-nsfw / empty phrase pool)
        const katakana = 'アイウエオカキクケコサシスセソタチツテトナニヌネノ';
        let out = '';
        for (let i = 0; i < 6; i++) {
            out += katakana[Math.floor(Math.random() * katakana.length)];
        }
        return out;
    }

    play() {
        return new Promise((resolve) => {
            // Create wrapper
            this.wrapper = document.createElement('div');

            let positionStyle = '';
            switch (this.position) {
                case 'center':
                    positionStyle = `
                        top: 50%;
                        left: 50%;
                        transform: translate(-50%, -50%);
                    `;
                    break;
                case 'center-left':
                    positionStyle = `
                        top: 50%;
                        left: 20%;
                        transform: translate(0, -50%);
                    `;
                    break;
                case 'center-right':
                    positionStyle = `
                        top: 50%;
                        right: 10%;
                        transform: translate(0, -50%);
                    `;
                    break;
                case 'top-left':
                    positionStyle = `
                        top: 280px;
                        left: 20px;
                    `;
                    break;
                case 'bottom-left':
                    positionStyle = `
                        bottom: 40px;
                        left: 20px;
                    `;
                    break;
            }

            this.wrapper.style.cssText = `
                position: fixed;
                ${positionStyle}
                width: ${this.width}px;
                height: ${this.height}px;
                overflow: visible;
                z-index: 9999;
                font-family: 'Courier New', monospace;
                font-size: ${this.fontSize}px;
                color: ${this.color};
            `;
            this.container.appendChild(this.wrapper);

            // Create module list
            this.modules.forEach((moduleName, index) => {
                const moduleDiv = document.createElement('div');
                moduleDiv.style.cssText = `
                    padding: 4px 0;
                    opacity: 0.5;
                    transition: all 0.2s ease;
                    white-space: nowrap;
                `;

                // Format: "PAGE X... MODULE NAME"
                const pageNum = String.fromCharCode(65 + (index % 26)); // A, B, C, etc.
                moduleDiv.textContent = `PAGE ${pageNum}... ${moduleName}`;

                this.wrapper.appendChild(moduleDiv);
                this.moduleElements.push(moduleDiv);
            });

            // Animate sequential loading
            let currentIndex = 0;
            this.loadInterval = setInterval(() => {
                if (currentIndex < this.modules.length) {
                    const element = this.moduleElements[currentIndex];

                    // Highlight current module with left shift
                    element.style.color = this.highlightColor;
                    element.style.opacity = '1';
                    element.style.textShadow = `0 0 10px ${this.highlightColor}`;
                    element.style.fontWeight = 'bold';
                    element.style.transform = 'translateX(-10px)'; // Shift left when selected

                    // Add glitch effect occasionally
                    if (Math.random() > 0.7 && this.nsfw) {
                        const original = element.textContent;
                        element.textContent = this.getRandomCorruption();
                        setTimeout(() => {
                            element.textContent = original;
                        }, 100);
                    }

                    // Fade previous modules back and return to original position
                    if (currentIndex > 0) {
                        const prevElement = this.moduleElements[currentIndex - 1];
                        prevElement.style.color = this.color;
                        prevElement.style.textShadow = `0 0 5px ${this.color}`;
                        prevElement.style.fontWeight = 'normal';
                        prevElement.style.transform = 'translateX(0)'; // Return to original position
                    }

                    currentIndex++;
                } else {
                    clearInterval(this.loadInterval);
                    this.loadInterval = null;

                    // Return last item to original position and flash all modules on completion
                    this.moduleElements.forEach(el => {
                        el.style.transform = 'translateX(0)'; // Return all to original position
                        el.style.textShadow = `0 0 15px ${this.highlightColor}`;
                    });

                    setTimeout(() => {
                        this.moduleElements.forEach(el => {
                            el.style.textShadow = `0 0 5px ${this.color}`;
                        });
                        setTimeout(resolve, 300);
                    }, 200);
                }
            }, this.loadSpeed);
        });
    }

    destroy() {
        // Clear the loading interval to prevent memory leak
        if (this.loadInterval) {
            clearInterval(this.loadInterval);
            this.loadInterval = null;
        }
        if (this.wrapper) {
            this.wrapper.remove();
            this.wrapper = null;
        }
        this.moduleElements = [];
    }
}


/**
 * Block 39: TacticalTerrainMap
 * Visual: 3D wireframe terrain map with waveform-driven elevation
 * Source: example_2.mov frames 24-28 (topographical waveform)
 * Usage: Abyss convergence visualization, corruption node tracking, demonic objectives
 * Duration: Infinite loop (animated terrain)
 * Theme: Occult battlefield with demonic swarm convergence on corruption spires
 */
export class TacticalTerrainMap {
    constructor(container, options = {}) {
        this.container = container;
        this.title = options.title || 'ABYSS CONVERGENCE MAPPING';
        this.subtitle = options.subtitle || 'CORRUPTION NODES: TRACKING ACTIVE';
        this.duration = options.duration || 8000;
        this.gridWidth = options.gridWidth || 40; // Grid columns
        this.gridDepth = options.gridDepth || 30; // Grid rows
        this.terrainScale = options.terrainScale || 80; // Height multiplier
        this.rotationSpeed = options.rotationSpeed || 0.3; // Camera rotation speed
        this.showCoordinates = options.showCoordinates !== undefined ? options.showCoordinates : true;
        this.showWaypoints = options.showWaypoints !== undefined ? options.showWaypoints : true;
        this.particleCount = options.particleCount || 200; // Swarm entities (increased for more objectives)
        this.nsfw = options.nsfw !== undefined ? options.nsfw
            : ((options.lewdMode !== undefined || options.includeLewd !== undefined)
                ? (console.warn('[TacticalTerrainMap] lewdMode/includeLewd is deprecated; use nsfw'), (options.lewdMode ?? options.includeLewd))
                : false);

        // Corrupted theme colors
        this.colorPrimary = '#00ffff';    // Cyan - primary grid
        this.colorSecondary = '#8b5cf6';  // Purple - depth/shadow
        this.colorAccent = '#d94f90';     // Magenta - highlights/waypoints
        this.colorDanger = '#ff0000';     // Red - critical zones
        this.colorWarning = '#ff8800';    // Orange - warning zones
        this.colorGreen = '#00ff00';      // Green - system zones

        // Define waypoint objectives (buildings, structures, corruption nodes)
        this.waypoints = [
            { x: 10, z: 10, label: 'VOID SPIRE', color: this.colorDanger, symbol: '◆', type: 'spire' },
            { x: 30, z: 15, label: 'CHAOS RIFT', color: this.colorSecondary, symbol: '✦', type: 'rift' },
            { x: 20, z: 25, label: 'ENTROPY NODE', color: this.colorAccent, symbol: '▼', type: 'node' },
            { x: 35, z: 5, label: 'CORRUPTED FORTRESS', color: this.colorWarning, symbol: '▲', type: 'fortress' },
            { x: 5, z: 22, label: 'SHADOW TEMPLE', color: this.colorSecondary, symbol: '✧', type: 'temple' },
            { x: 15, z: 5, label: 'ABYSS GATE', color: this.colorPrimary, symbol: '◉', type: 'gate' }
        ];

        this.wrapper = null;
        this.canvas = null;
        this.ctx = null;
        this.animationFrame = null;
        this.time = 0;
        this.rotation = 0;

        // Particle swarm system
        this.particles = [];
        this.initParticles();

        // Track decoding intervals for cleanup
        this.decodeIntervals = [];
    }

    /**
     * Initialize particle swarm (demons/corrupted data converging on objectives)
     */
    initParticles() {
        for (let i = 0; i < this.particleCount; i++) {
            this.particles.push({
                x: (Math.random() - 0.5) * 1000,
                y: Math.random() * -200,
                z: (Math.random() - 0.5) * 1000,
                targetIndex: Math.floor(Math.random() * this.waypoints.length), // Which waypoint to target
                speed: 0.5 + Math.random() * 1.5,
                phase: Math.random() * Math.PI * 2,
                size: 1 + Math.random() * 2
            });
        }
    }

    /**
     * Animate corrupted text decoding (corruption phrases decode into final text)
     * Implements hybrid decoding pattern from corrupted theme spec
     */
    animateCorruptedText(element, finalText, finalColor) {
        let revealedChars = 0;
        const decodeDuration = 1500; // 1.5 seconds to fully decode
        const charsPerFrame = finalText.length / (decodeDuration / 50);

        const decodeInterval = setInterval(() => {
            revealedChars += charsPerFrame;

            if (revealedChars >= finalText.length) {
                // Fully decoded - stable cyan state
                element.innerHTML = `<span style="color: ${escapeHtml(finalColor)}; text-shadow: 0 0 10px ${escapeHtml(finalColor)};">${escapeHtml(finalText)}</span>`;
                clearInterval(decodeInterval);
                // Remove from tracking array
                const index = this.decodeIntervals.indexOf(decodeInterval);
                if (index > -1) {
                    this.decodeIntervals.splice(index, 1);
                }
            } else {
                // Hybrid decoding: revealed text + corruption phrase buffer
                const revealed = finalText.substring(0, Math.floor(revealedChars));
                const remaining = finalText.length - Math.floor(revealedChars);

                // Pick random corruption phrase for unrevealed portion
                const randomPhrase = getRandomPhrase(this.nsfw);
                const corruptedBuffer = randomPhrase.substring(0, remaining);

                // Add occasional katakana corruption for variety
                const useKatakana = Math.random() > 0.7;
                const katakana = 'アイウエオカキクケコサシスセソタチツテトナニヌネノ';
                const glitchBuffer = useKatakana
                    ? Array(remaining).fill(0).map(() => katakana[Math.floor(Math.random() * katakana.length)]).join('')
                    : corruptedBuffer;

                element.innerHTML =
                    `<span style="color: ${escapeHtml(finalColor)}; text-shadow: 0 0 10px ${escapeHtml(finalColor)};">${escapeHtml(revealed)}</span>` +
                    `<span style="color: #8b5cf6; text-shadow: 0 0 8px #8b5cf6;">${escapeHtml(glitchBuffer)}</span>`;
            }
        }, 50);

        // Track interval for cleanup
        this.decodeIntervals.push(decodeInterval);
    }

    play() {
        return new Promise((resolve) => {
            // Create wrapper
            this.wrapper = document.createElement('div');
            this.wrapper.style.cssText = `
                position: fixed;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                width: 800px;
                height: 600px;
                background: rgba(0, 0, 0, 0.9);
                border: 2px solid ${this.colorPrimary};
                box-shadow:
                    0 0 20px ${this.colorPrimary},
                    inset 0 0 20px rgba(0, 255, 255, 0.1);
                backdrop-filter: blur(10px);
                z-index: 9999;
                overflow: hidden;
            `;
            this.container.appendChild(this.wrapper);

            // Create LIVE indicator
            const liveIndicator = document.createElement('div');
            liveIndicator.style.cssText = `
                position: absolute;
                top: 15px;
                right: 20px;
                display: flex;
                align-items: center;
                gap: 8px;
                z-index: 3;
                font-family: 'Courier New', monospace;
            `;

            const liveDot = document.createElement('div');
            liveDot.style.cssText = `
                width: 10px;
                height: 10px;
                background: ${this.colorDanger};
                border-radius: 50%;
                box-shadow: 0 0 10px ${this.colorDanger};
                animation: livePulse 1.5s ease-in-out infinite;
            `;

            const liveText = document.createElement('div');
            liveText.style.cssText = `
                color: ${this.colorDanger};
                font-size: 14px;
                font-weight: bold;
                text-shadow: 0 0 8px ${this.colorDanger};
            `;
            liveText.textContent = 'LIVE';

            liveIndicator.appendChild(liveDot);
            liveIndicator.appendChild(liveText);
            this.wrapper.appendChild(liveIndicator);

            // Add LIVE pulse animation
            const style = document.createElement('style');
            style.textContent = `
                @keyframes livePulse {
                    0%, 100% { opacity: 1; transform: scale(1); }
                    50% { opacity: 0.4; transform: scale(1.2); }
                }
            `;
            document.head.appendChild(style);

            // Create title with corrupted decoding
            const titleEl = document.createElement('div');
            titleEl.style.cssText = `
                position: absolute;
                top: 20px;
                left: 20px;
                font-size: 20px;
                font-weight: bold;
                z-index: 2;
                font-family: 'Courier New', monospace;
            `;
            this.wrapper.appendChild(titleEl);

            // Create subtitle with corrupted decoding
            const subtitleEl = document.createElement('div');
            subtitleEl.style.cssText = `
                position: absolute;
                top: 50px;
                left: 20px;
                font-size: 13px;
                z-index: 2;
                font-family: 'Courier New', monospace;
            `;
            this.wrapper.appendChild(subtitleEl);

            // Start corrupted decoding animation for titles
            this.animateCorruptedText(titleEl, this.title, this.colorPrimary);
            this.animateCorruptedText(subtitleEl, this.subtitle, this.colorAccent);

            // Create canvas
            this.canvas = document.createElement('canvas');
            this.canvas.width = 800;
            this.canvas.height = 600;
            this.canvas.style.cssText = `
                position: absolute;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
            `;
            this.wrapper.appendChild(this.canvas);
            this.ctx = this.canvas.getContext('2d');

            // Start animation
            const startTime = Date.now();
            const animate = () => {
                const elapsed = Date.now() - startTime;
                this.time = elapsed / 1000;
                this.rotation += this.rotationSpeed * 0.01;

                // Clear canvas
                this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

                // Update particle swarm
                this.updateParticles();

                // Draw terrain
                this.drawTerrain();

                // Draw corruption tentacles/cables spreading from objectives
                this.drawCorruptionTentacles();

                // Draw particle swarm converging on objectives
                this.drawParticles();

                // Draw waypoints if enabled (corruption spires)
                if (this.showWaypoints) {
                    this.drawWaypoints();
                }

                // Draw coordinates if enabled
                if (this.showCoordinates) {
                    this.drawCoordinates();
                }

                if (elapsed < this.duration) {
                    this.animationFrame = requestAnimationFrame(animate);
                } else {
                    setTimeout(() => {
                        this.destroy();
                        resolve();
                    }, 500);
                }
            };

            animate();
        });
    }

    /**
     * Update particle positions - converge toward target waypoints
     */
    updateParticles() {
        const cellSize = 20;
        const offsetX = -this.gridWidth * cellSize / 2;
        const offsetZ = -this.gridDepth * cellSize / 2;

        this.particles.forEach(p => {
            const target = this.waypoints[p.targetIndex];
            const targetX = target.x * cellSize + offsetX;
            const targetZ = target.z * cellSize + offsetZ;
            const targetHeight = this.getTerrainHeight(target.x, target.z, this.time);
            const targetY = -targetHeight - 50; // Hover above structure

            // Move toward target with orbital motion
            const dx = targetX - p.x;
            const dz = targetZ - p.z;
            const dy = targetY - p.y;
            const dist = Math.sqrt(dx * dx + dz * dz + dy * dy);

            if (dist > 50) {
                // Approach target
                p.x += (dx / dist) * p.speed;
                p.y += (dy / dist) * p.speed;
                p.z += (dz / dist) * p.speed;
            } else {
                // Orbit around target
                p.phase += 0.03;
                const orbitRadius = 30 + Math.sin(this.time + p.phase) * 10;
                p.x = targetX + Math.cos(p.phase) * orbitRadius;
                p.z = targetZ + Math.sin(p.phase) * orbitRadius;
                p.y = targetY + Math.sin(this.time * 2 + p.phase) * 15;
            }
        });
    }

    /**
     * Draw particle swarm (corrupted entities/demons converging)
     */
    drawParticles() {
        this.ctx.save();
        this.particles.forEach(p => {
            const point = this.project3D(p.x, p.y, p.z);

            // Only draw if in view
            if (point.scale > 0.1) {
                this.ctx.beginPath();
                this.ctx.arc(point.x, point.y, p.size * point.scale, 0, Math.PI * 2);

                // Color based on target waypoint
                const color = this.waypoints[p.targetIndex].color;

                this.ctx.fillStyle = color;
                this.ctx.globalAlpha = 0.6 * point.scale;
                this.ctx.fill();

                // Add glow for closer particles
                if (point.scale > 0.5) {
                    this.ctx.shadowBlur = 5;
                    this.ctx.shadowColor = color;
                    this.ctx.fill();
                    this.ctx.shadowBlur = 0;
                }
            }
        });
        this.ctx.globalAlpha = 1;
        this.ctx.restore();
    }

    /**
     * Calculate terrain height at grid position using waveform functions
     * Creates realistic terrain features: hills, valleys, ridges, plateaus
     */
    getTerrainHeight(x, z, time) {
        // Normalize grid coordinates to 0-1 range
        const normX = x / this.gridWidth;
        const normZ = z / this.gridDepth;

        // Base terrain - large rolling hills
        const baseHeight = Math.sin(normX * Math.PI * 3 + time * 0.3) *
                          Math.cos(normZ * Math.PI * 2 + time * 0.2) * 0.5;

        // Add medium frequency features - valleys and ridges
        const ridges = Math.sin(normX * Math.PI * 6 + normZ * Math.PI * 4) * 0.25;

        // Add high frequency noise for detail
        const detail = (Math.sin(x * 0.5 + time) * Math.cos(z * 0.5 - time * 0.5)) * 0.1;

        // Create distinct plateaus and peaks
        const peakX = Math.abs(normX - 0.3) < 0.15 ? 0.3 : 0;
        const peakZ = Math.abs(normZ - 0.6) < 0.15 ? 0.3 : 0;
        const peaks = Math.max(peakX, peakZ);

        // Valley feature
        const valley = Math.abs(normX - 0.7) < 0.1 && Math.abs(normZ - 0.3) < 0.2 ? -0.2 : 0;

        // Combine all features for realistic terrain
        let height = (baseHeight + ridges + detail + peaks + valley) * this.terrainScale * 1.5;

        return height;
    }

    /**
     * Project 3D point to 2D screen coordinates with perspective
     * Top-down tactical view that fills entire viewport
     */
    project3D(x, y, z) {
        // Screen dimensions
        const screenCenterX = this.canvas.width / 2;
        const screenCenterY = this.canvas.height / 2;

        // Camera position - high above for tactical overview
        const camX = 0;
        const camY = -250; // High elevation for top-down view
        const camZ = -400; // Closer for better fill

        // Apply rotation around Y-axis
        const cosR = Math.cos(this.rotation);
        const sinR = Math.sin(this.rotation);
        const rotX = x * cosR - z * sinR;
        const rotZ = x * sinR + z * cosR;

        // Translate to camera space
        const dx = rotX - camX;
        const dy = y - camY;
        const dz = rotZ - camZ;

        // Perspective projection - wider FOV to fill viewport
        const fov = 500;
        const scale = fov / (fov + dz);

        return {
            x: screenCenterX + dx * scale * 1.3, // Scale up to fill width
            y: screenCenterY + dy * scale * 1.2, // Scale up to fill height
            scale: scale
        };
    }

    /**
     * Draw 3D wireframe terrain mesh
     */
    drawTerrain() {
        this.ctx.save();

        const cellSize = 20;
        const offsetX = -this.gridWidth * cellSize / 2;
        const offsetZ = -this.gridDepth * cellSize / 2;

        // Draw grid mesh
        for (let z = 0; z < this.gridDepth; z++) {
            for (let x = 0; x < this.gridWidth; x++) {
                const posX = x * cellSize + offsetX;
                const posZ = z * cellSize + offsetZ;
                const height = this.getTerrainHeight(x, z, this.time);

                const point = this.project3D(posX, -height, posZ);

                // Draw horizontal lines (along X axis)
                if (x < this.gridWidth - 1) {
                    const nextPosX = (x + 1) * cellSize + offsetX;
                    const nextHeight = this.getTerrainHeight(x + 1, z, this.time);
                    const nextPoint = this.project3D(nextPosX, -nextHeight, posZ);

                    // Color based on depth (Z position)
                    const depthFactor = z / this.gridDepth;
                    const alpha = 0.3 + depthFactor * 0.7;

                    this.ctx.beginPath();
                    this.ctx.moveTo(point.x, point.y);
                    this.ctx.lineTo(nextPoint.x, nextPoint.y);
                    this.ctx.strokeStyle = `rgba(0, 255, 255, ${alpha})`;
                    this.ctx.lineWidth = 1 + depthFactor;
                    this.ctx.stroke();
                }

                // Draw vertical lines (along Z axis)
                if (z < this.gridDepth - 1) {
                    const nextPosZ = (z + 1) * cellSize + offsetZ;
                    const nextHeight = this.getTerrainHeight(x, z + 1, this.time);
                    const nextPoint = this.project3D(posX, -nextHeight, nextPosZ);

                    const depthFactor = z / this.gridDepth;
                    const alpha = 0.3 + depthFactor * 0.7;

                    this.ctx.beginPath();
                    this.ctx.moveTo(point.x, point.y);
                    this.ctx.lineTo(nextPoint.x, nextPoint.y);
                    this.ctx.strokeStyle = `rgba(0, 255, 255, ${alpha})`;
                    this.ctx.lineWidth = 1 + depthFactor;
                    this.ctx.stroke();
                }

                // Highlight peaks with magenta
                if (height > this.terrainScale * 0.7) {
                    this.ctx.beginPath();
                    this.ctx.arc(point.x, point.y, 3, 0, Math.PI * 2);
                    this.ctx.fillStyle = this.colorAccent;
                    this.ctx.shadowBlur = 10;
                    this.ctx.shadowColor = this.colorAccent;
                    this.ctx.fill();
                    this.ctx.shadowBlur = 0;
                }
            }
        }

        this.ctx.restore();
    }

    /**
     * Draw corruption tentacles/cables spreading from objectives
     * Represents Celeste's influence corrupting the battlefield
     */
    drawCorruptionTentacles() {
        const cellSize = 20;
        const offsetX = -this.gridWidth * cellSize / 2;
        const offsetZ = -this.gridDepth * cellSize / 2;

        this.ctx.save();

        this.waypoints.forEach((wp, wpIndex) => {
            // Determine tentacle count based on structure type
            let tentacleCount;
            switch(wp.type) {
                case 'fortress': tentacleCount = 12; break;
                case 'temple': tentacleCount = 10; break;
                case 'gate': tentacleCount = 8; break;
                case 'spire': tentacleCount = 8; break;
                case 'rift': tentacleCount = 10; break;
                case 'node': tentacleCount = 9; break;
                default: tentacleCount = 8;
            }
            const originX = wp.x * cellSize + offsetX;
            const originZ = wp.z * cellSize + offsetZ;
            const originHeight = this.getTerrainHeight(wp.x, wp.z, this.time);

            // Draw multiple tentacles from each waypoint
            for (let i = 0; i < wp.tentacleCount; i++) {
                const baseAngle = (i / wp.tentacleCount) * Math.PI * 2;
                const angleOffset = Math.sin(this.time * 0.5 + i) * 0.3;
                const angle = baseAngle + angleOffset;

                const tentacleLength = 150 + Math.sin(this.time + i) * 30;
                const segments = 20;

                // Draw tentacle as a series of connected segments
                this.ctx.beginPath();

                for (let seg = 0; seg < segments; seg++) {
                    const t = seg / segments;
                    const distance = t * tentacleLength;

                    // Calculate position with sinusoidal wave for organic movement
                    const waveAmplitude = 20 * t; // Increases with distance
                    const waveFrequency = 0.1;
                    const wavePhase = this.time * 2 + i * 0.5;

                    const baseX = originX + Math.cos(angle) * distance;
                    const baseZ = originZ + Math.sin(angle) * distance;

                    // Add perpendicular wave motion
                    const perpAngle = angle + Math.PI / 2;
                    const wave = Math.sin(distance * waveFrequency + wavePhase) * waveAmplitude;

                    const tentacleX = baseX + Math.cos(perpAngle) * wave;
                    const tentacleZ = baseZ + Math.sin(perpAngle) * wave;

                    // Get terrain height at this position
                    const gridX = Math.floor((tentacleX - offsetX) / cellSize);
                    const gridZ = Math.floor((tentacleZ - offsetZ) / cellSize);

                    let tentacleHeight = originHeight;
                    if (gridX >= 0 && gridX < this.gridWidth && gridZ >= 0 && gridZ < this.gridDepth) {
                        tentacleHeight = this.getTerrainHeight(gridX, gridZ, this.time);
                    }

                    // Tentacles hover slightly above or sink into terrain
                    const heightOffset = -5 + Math.sin(this.time * 3 + t * Math.PI * 2) * 3;

                    const point = this.project3D(tentacleX, -tentacleHeight + heightOffset, tentacleZ);

                    if (seg === 0) {
                        this.ctx.moveTo(point.x, point.y);
                    } else {
                        this.ctx.lineTo(point.x, point.y);
                    }
                }

                // Gradient from bright at origin to dim at end
                const gradient = this.ctx.createLinearGradient(
                    originX, originZ,
                    originX + Math.cos(angle) * tentacleLength,
                    originZ + Math.sin(angle) * tentacleLength
                );

                // Pulsing intensity
                const pulse = 0.4 + Math.sin(this.time * 4 + i * 0.3) * 0.2;

                gradient.addColorStop(0, wp.color);
                gradient.addColorStop(1, 'rgba(0,0,0,0)');

                this.ctx.strokeStyle = wp.color;
                this.ctx.lineWidth = 2 + Math.sin(this.time * 2 + i) * 0.5;
                this.ctx.globalAlpha = pulse * 0.6;
                this.ctx.shadowBlur = 8;
                this.ctx.shadowColor = wp.color;
                this.ctx.stroke();

                // Draw corruption nodes along tentacle (every few segments)
                for (let seg = 5; seg < segments; seg += 5) {
                    const t = seg / segments;
                    const distance = t * tentacleLength;

                    const waveAmplitude = 20 * t;
                    const waveFrequency = 0.1;
                    const wavePhase = this.time * 2 + i * 0.5;

                    const baseX = originX + Math.cos(angle) * distance;
                    const baseZ = originZ + Math.sin(angle) * distance;

                    const perpAngle = angle + Math.PI / 2;
                    const wave = Math.sin(distance * waveFrequency + wavePhase) * waveAmplitude;

                    const tentacleX = baseX + Math.cos(perpAngle) * wave;
                    const tentacleZ = baseZ + Math.sin(perpAngle) * wave;

                    const gridX = Math.floor((tentacleX - offsetX) / cellSize);
                    const gridZ = Math.floor((tentacleZ - offsetZ) / cellSize);

                    let tentacleHeight = originHeight;
                    if (gridX >= 0 && gridX < this.gridWidth && gridZ >= 0 && gridZ < this.gridDepth) {
                        tentacleHeight = this.getTerrainHeight(gridX, gridZ, this.time);
                    }

                    const heightOffset = -5 + Math.sin(this.time * 3 + t * Math.PI * 2) * 3;
                    const nodePoint = this.project3D(tentacleX, -tentacleHeight + heightOffset, tentacleZ);

                    // Draw small corruption node
                    this.ctx.beginPath();
                    this.ctx.arc(nodePoint.x, nodePoint.y, 2, 0, Math.PI * 2);
                    this.ctx.fillStyle = wp.color;
                    this.ctx.shadowBlur = 6;
                    this.ctx.shadowColor = wp.color;
                    this.ctx.globalAlpha = pulse * 0.8;
                    this.ctx.fill();
                }
            }
        });

        this.ctx.shadowBlur = 0;
        this.ctx.globalAlpha = 1;
        this.ctx.restore();
    }

    /**
     * Draw corruption spires and objectives (demonic convergence points)
     * Different visual styles for: spires, rifts, nodes, fortresses, temples, gates
     */
    drawWaypoints() {
        this.waypoints.forEach(wp => {
            const cellSize = 20;
            const offsetX = -this.gridWidth * cellSize / 2;
            const offsetZ = -this.gridDepth * cellSize / 2;

            const posX = wp.x * cellSize + offsetX;
            const posZ = wp.z * cellSize + offsetZ;
            const height = this.getTerrainHeight(wp.x, wp.z, this.time);

            // Base of spire on terrain
            const basePoint = this.project3D(posX, -height, posZ);

            // Top of spire hovering above
            const spireHeight = 80 + Math.sin(this.time * 2) * 10; // Pulsing height
            const topPoint = this.project3D(posX, -height - spireHeight, posZ);

            // Draw pulsing corruption aura
            const pulseRadius = 30 + Math.sin(this.time * 3) * 10;
            const pulseAlpha = 0.2 + Math.sin(this.time * 4) * 0.1;

            this.ctx.beginPath();
            this.ctx.arc(basePoint.x, basePoint.y, pulseRadius, 0, Math.PI * 2);
            const gradient = this.ctx.createRadialGradient(
                basePoint.x, basePoint.y, 0,
                basePoint.x, basePoint.y, pulseRadius
            );
            gradient.addColorStop(0, `${wp.color}${Math.floor(pulseAlpha * 255).toString(16).padStart(2, '0')}`);
            gradient.addColorStop(1, 'rgba(0,0,0,0)');
            this.ctx.fillStyle = gradient;
            this.ctx.fill();

            // Draw spire structure (vertical beam)
            this.ctx.beginPath();
            this.ctx.moveTo(basePoint.x, basePoint.y);
            this.ctx.lineTo(topPoint.x, topPoint.y);
            this.ctx.strokeStyle = wp.color;
            this.ctx.lineWidth = 3;
            this.ctx.shadowBlur = 20;
            this.ctx.shadowColor = wp.color;
            this.ctx.stroke();
            this.ctx.shadowBlur = 0;

            // Draw additional energy lines around spire
            for (let i = 0; i < 4; i++) {
                const angle = (this.time + i * Math.PI / 2) % (Math.PI * 2);
                const spiralRadius = 15;
                const spiralX = posX + Math.cos(angle) * spiralRadius;
                const spiralZ = posZ + Math.sin(angle) * spiralRadius;
                const spiralY = -height - (spireHeight * (i / 4));

                const spiralPoint = this.project3D(spiralX, spiralY, spiralZ);
                const spiralBase = this.project3D(spiralX, -height, spiralZ);

                this.ctx.beginPath();
                this.ctx.moveTo(spiralBase.x, spiralBase.y);
                this.ctx.lineTo(spiralPoint.x, spiralPoint.y);
                this.ctx.strokeStyle = wp.color;
                this.ctx.lineWidth = 1;
                this.ctx.globalAlpha = 0.4;
                this.ctx.stroke();
                this.ctx.globalAlpha = 1;
            }

            // Draw top marker (corrupted crystal/node)
            this.ctx.beginPath();
            this.ctx.arc(topPoint.x, topPoint.y, 8, 0, Math.PI * 2);
            this.ctx.fillStyle = wp.color;
            this.ctx.shadowBlur = 25;
            this.ctx.shadowColor = wp.color;
            this.ctx.fill();
            this.ctx.shadowBlur = 0;

            // Draw symbol at top
            this.ctx.font = 'bold 16px "Courier New"';
            this.ctx.fillStyle = '#000000';
            this.ctx.textAlign = 'center';
            this.ctx.textBaseline = 'middle';
            this.ctx.fillText(wp.symbol, topPoint.x, topPoint.y);

            // Draw label
            this.ctx.font = 'bold 11px "Courier New"';
            this.ctx.fillStyle = wp.color;
            this.ctx.textAlign = 'center';
            this.ctx.textBaseline = 'bottom';
            this.ctx.shadowBlur = 8;
            this.ctx.shadowColor = wp.color;
            this.ctx.fillText(wp.label, topPoint.x, topPoint.y - 15);
            this.ctx.shadowBlur = 0;

            // Draw structure-specific features
            this.drawStructureDetails(wp, posX, posZ, height, basePoint, topPoint);

            // Draw connecting lines from nearby particles (showing convergence)
            this.ctx.save();
            this.ctx.globalAlpha = 0.2;
            this.ctx.lineWidth = 0.5;
            this.particles.forEach(p => {
                if (p.targetIndex === this.waypoints.indexOf(wp)) {
                    const particlePoint = this.project3D(p.x, p.y, p.z);
                    const dx = topPoint.x - particlePoint.x;
                    const dy = topPoint.y - particlePoint.y;
                    const dist = Math.sqrt(dx * dx + dy * dy);

                    // Only draw connections for nearby particles
                    if (dist < 100) {
                        this.ctx.beginPath();
                        this.ctx.moveTo(particlePoint.x, particlePoint.y);
                        this.ctx.lineTo(topPoint.x, topPoint.y);
                        this.ctx.strokeStyle = wp.color;
                        this.ctx.stroke();
                    }
                }
            });
            this.ctx.restore();
        });
    }

    /**
     * Draw structure-specific architectural details
     * Different visuals for: fortress, temple, gate, spire, rift, node
     */
    drawStructureDetails(wp, posX, posZ, height, basePoint, topPoint) {
        this.ctx.save();

        switch(wp.type) {
            case 'fortress':
                // Draw fortress walls (4 walls forming a square)
                const wallSize = 30;
                const wallHeight = -height - 20;
                const corners = [
                    { x: posX + wallSize, z: posZ + wallSize },
                    { x: posX + wallSize, z: posZ - wallSize },
                    { x: posX - wallSize, z: posZ - wallSize },
                    { x: posX - wallSize, z: posZ + wallSize }
                ];

                this.ctx.strokeStyle = wp.color;
                this.ctx.lineWidth = 2;
                this.ctx.globalAlpha = 0.6;

                for (let i = 0; i < corners.length; i++) {
                    const c1 = corners[i];
                    const c2 = corners[(i + 1) % corners.length];

                    const p1Base = this.project3D(c1.x, -height, c1.z);
                    const p1Top = this.project3D(c1.x, wallHeight, c1.z);
                    const p2Base = this.project3D(c2.x, -height, c2.z);
                    const p2Top = this.project3D(c2.x, wallHeight, c2.z);

                    // Vertical edges
                    this.ctx.beginPath();
                    this.ctx.moveTo(p1Base.x, p1Base.y);
                    this.ctx.lineTo(p1Top.x, p1Top.y);
                    this.ctx.stroke();

                    // Top edge
                    this.ctx.beginPath();
                    this.ctx.moveTo(p1Top.x, p1Top.y);
                    this.ctx.lineTo(p2Top.x, p2Top.y);
                    this.ctx.stroke();
                }
                this.ctx.globalAlpha = 1;
                break;

            case 'temple':
                // Draw temple pillars (6 pillars in a circle)
                const pillarCount = 6;
                const pillarRadius = 25;
                const pillarHeight = -height - 30;

                this.ctx.strokeStyle = wp.color;
                this.ctx.lineWidth = 2;
                this.ctx.globalAlpha = 0.7;

                for (let i = 0; i < pillarCount; i++) {
                    const angle = (i / pillarCount) * Math.PI * 2;
                    const px = posX + Math.cos(angle) * pillarRadius;
                    const pz = posZ + Math.sin(angle) * pillarRadius;

                    const pBase = this.project3D(px, -height, pz);
                    const pTop = this.project3D(px, pillarHeight, pz);

                    this.ctx.beginPath();
                    this.ctx.moveTo(pBase.x, pBase.y);
                    this.ctx.lineTo(pTop.x, pTop.y);
                    this.ctx.stroke();

                    // Pillar top
                    this.ctx.fillStyle = wp.color;
                    this.ctx.beginPath();
                    this.ctx.arc(pTop.x, pTop.y, 3, 0, Math.PI * 2);
                    this.ctx.fill();
                }
                this.ctx.globalAlpha = 1;
                break;

            case 'gate':
                // Draw portal gate (rotating rings)
                const ringCount = 3;
                const maxRingRadius = 35;

                for (let i = 0; i < ringCount; i++) {
                    const ringRadius = maxRingRadius * (1 - i * 0.25);
                    const ringY = -height - 40 + i * 10;
                    const rotation = this.time * (i + 1) * 0.5;

                    const segments = 20;
                    this.ctx.strokeStyle = wp.color;
                    this.ctx.lineWidth = 2;
                    this.ctx.globalAlpha = 0.5 - i * 0.1;

                    this.ctx.beginPath();
                    for (let s = 0; s <= segments; s++) {
                        const segAngle = (s / segments) * Math.PI * 2 + rotation;
                        const rx = posX + Math.cos(segAngle) * ringRadius;
                        const rz = posZ + Math.sin(segAngle) * ringRadius;

                        const rPoint = this.project3D(rx, ringY, rz);

                        if (s === 0) {
                            this.ctx.moveTo(rPoint.x, rPoint.y);
                        } else {
                            this.ctx.lineTo(rPoint.x, rPoint.y);
                        }
                    }
                    this.ctx.stroke();
                }
                this.ctx.globalAlpha = 1;
                break;
        }

        this.ctx.restore();
    }

    /**
     * Draw grid coordinate system
     */
    drawCoordinates() {
        this.ctx.save();
        this.ctx.font = '10px "Courier New"';
        this.ctx.fillStyle = this.colorPrimary;
        this.ctx.globalAlpha = 0.5;

        const bottomY1 = this.canvas.height - 20;
        const bottomY2 = this.canvas.height - 5;

        // Draw coordinate labels at corners
        this.ctx.textAlign = 'left';
        this.ctx.fillText(`X: 0-${this.gridWidth}`, 20, bottomY1);
        this.ctx.fillText(`Z: 0-${this.gridDepth}`, 20, bottomY2);

        this.ctx.textAlign = 'right';
        this.ctx.fillText(`T: ${this.time.toFixed(1)}s`, this.canvas.width - 20, bottomY1);
        this.ctx.fillText(`θ: ${(this.rotation * 57.3).toFixed(0)}°`, this.canvas.width - 20, bottomY2);

        this.ctx.restore();
    }

    destroy() {
        if (this.animationFrame) {
            cancelAnimationFrame(this.animationFrame);
        }
        // Clear all decoding intervals
        this.decodeIntervals.forEach(interval => clearInterval(interval));
        this.decodeIntervals = [];
        if (this.wrapper) {
            this.wrapper.remove();
            this.wrapper = null;
        }
        this.canvas = null;
        this.ctx = null;
    }
}


/**
 * Block 40: OminousTemple
 * Visual: Dark temple/pyramid silhouette with corrupted text and void atmosphere
 * Source: example_1.mov frame 25 (ominous temple scene)
 * Usage: Occult backgrounds, temple reveals, abyss atmosphere, ritual scenes
 * Duration: Infinite loop (animated atmosphere)
 * Theme: Dark temple rising from void with corrupted reality
 */
export class OminousTemple {
    constructor(container, options = {}) {
        this.container = container;
        this.duration = options.duration || 10000;
        this.showCorruptedText = options.showCorruptedText !== undefined ? options.showCorruptedText : true;
        this.showRitualMarkers = options.showRitualMarkers !== undefined ? options.showRitualMarkers : true;
        this.templeSize = options.templeSize || 'large'; // 'small', 'medium', 'large'

        // NSFW opt-in (default OFF); lewdMode/includeLewd are deprecated aliases
        this.nsfw = options.nsfw !== undefined ? options.nsfw
            : ((options.lewdMode !== undefined || options.includeLewd !== undefined)
                ? (console.warn('[OminousTemple] lewdMode/includeLewd is deprecated; use nsfw'), (options.lewdMode ?? options.includeLewd))
                : false);

        // Corrupted theme colors
        this.colorPrimary = '#00ffff';    // Cyan
        this.colorSecondary = '#8b5cf6';  // Purple
        this.colorAccent = '#d94f90';     // Magenta
        this.colorDanger = '#ff0000';     // Red

        this.wrapper = null;
        this.canvas = null;
        this.ctx = null;
        this.animationFrame = null;
        this.time = 0;
        this.textFlickerInterval = null; // Track text flicker interval for cleanup

        // Corrupted text phrases
        this.corruptedPhrases = [
            '闇が...私を呼んでいる...',
            '古き神々が目覚める...',
            '虚無の門が開く...',
            '終焉の儀式...',
            'アビスが見つめ返す...',
            '腐敗した真実...'
        ];

        // Tentacle text phrases (shorter for flowing through tentacles)
        this.tentacleText = [
            '堕落', '腐敗', '虚無', '絶望',
            '闇', '混沌', '呪', '崩壊'
        ];

        // Initialize tentacles
        this.tentacles = [];
        this.initTentacles();

        // Initialize background lewd phrase particles
        this.lewdParticles = [];
        this.initLewdParticles();

        // Floating corruption particles
        this.corruptionParticles = [];
        this.initCorruptionParticles();

        // Large corruption kanji symbols
        this.corruptionSymbols = [];
        this.initCorruptionSymbols();

        // Energy waves from temple
        this.energyWaves = [];
        this.nextWaveTime = 0;
    }

    /**
     * Initialize tentacle entities at base
     */
    initTentacles() {
        const tentacleCount = 8;
        for (let i = 0; i < tentacleCount; i++) {
            // Tentacles grow downward/outward, not upward into temple
            // Left side tentacles: angles between PI/4 and 3*PI/4 (downward-left to downward-right)
            // Right side tentacles: similar range
            // Distribute along base, favoring downward growth
            const isLeftSide = i < tentacleCount / 2;
            let angle;

            if (isLeftSide) {
                // Left side: grow down-left to down-right (PI/4 to PI)
                angle = Math.PI * 0.25 + (i / (tentacleCount / 2)) * Math.PI * 0.75;
            } else {
                // Right side: grow down-right to down-left (0 to 3*PI/4)
                const rightIndex = i - tentacleCount / 2;
                angle = (rightIndex / (tentacleCount / 2)) * Math.PI * 0.75;
            }

            // Add variation
            angle += (Math.random() - 0.5) * Math.PI * 0.2;

            this.tentacles.push({
                angle: angle,
                baseRadius: 0, // No longer used (attach directly to temple base)
                length: 120 + Math.random() * 80,
                segments: 15,
                phase: Math.random() * Math.PI * 2,
                speed: 0.5 + Math.random() * 0.5,
                textPhrase: this.tentacleText[Math.floor(Math.random() * this.tentacleText.length)],
                textOffset: Math.random() * Math.PI * 2
            });
        }
    }

    /**
     * Initialize lewd phrase particles floating in background
     */
    initLewdParticles() {
        const particleCount = 20;
        for (let i = 0; i < particleCount; i++) {
            this.lewdParticles.push({
                phrase: getRandomPhrase(this.nsfw),
                x: Math.random() * window.innerWidth,
                y: Math.random() * window.innerHeight * 0.8, // Keep in upper 80% of screen
                speedX: (Math.random() - 0.5) * 20,
                speedY: (Math.random() - 0.5) * 15,
                opacity: 0.1 + Math.random() * 0.2,
                scale: 0.6 + Math.random() * 0.6,
                phase: Math.random() * Math.PI * 2,
                rotationSpeed: (Math.random() - 0.5) * 0.3,
                rotation: Math.random() * Math.PI * 2
            });
        }
    }

    /**
     * Initialize small corruption particles (glitch effects)
     */
    initCorruptionParticles() {
        const particleCount = 50;
        for (let i = 0; i < particleCount; i++) {
            this.corruptionParticles.push({
                x: Math.random() * window.innerWidth,
                y: Math.random() * window.innerHeight,
                size: 1 + Math.random() * 3,
                speedX: (Math.random() - 0.5) * 30,
                speedY: Math.random() * 20 + 10,
                opacity: 0.3 + Math.random() * 0.5,
                color: Math.random() > 0.5 ? this.colorAccent : this.colorPrimary,
                life: 0.5 + Math.random() * 0.5,
                phase: Math.random() * Math.PI * 2
            });
        }
    }

    /**
     * Initialize large corruption kanji symbols
     */
    initCorruptionSymbols() {
        const symbols = ['堕', '闇', '虚', '滅', '魔', '壊', '蝕', '歪'];
        const symbolCount = 6;

        for (let i = 0; i < symbolCount; i++) {
            this.corruptionSymbols.push({
                kanji: symbols[Math.floor(Math.random() * symbols.length)],
                x: (Math.random() * 0.6 + 0.2) * window.innerWidth, // Center 60%
                y: (Math.random() * 0.5 + 0.1) * window.innerHeight, // Upper 50%
                scale: 2 + Math.random() * 3,
                rotation: (Math.random() - 0.5) * Math.PI * 0.3,
                rotationSpeed: (Math.random() - 0.5) * 0.5,
                phase: Math.random() * Math.PI * 2,
                pulseSpeed: 1 + Math.random() * 2,
                opacity: 0.05 + Math.random() * 0.1,
                driftX: (Math.random() - 0.5) * 10,
                driftY: (Math.random() - 0.5) * 10
            });
        }
    }

    play() {
        return new Promise((resolve) => {
            // Create wrapper
            this.wrapper = document.createElement('div');
            this.wrapper.style.cssText = `
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: #000000;
                z-index: 9998;
                overflow: hidden;
            `;
            this.container.appendChild(this.wrapper);

            // Create canvas
            this.canvas = document.createElement('canvas');
            this.canvas.width = window.innerWidth;
            this.canvas.height = window.innerHeight;
            this.canvas.style.cssText = `
                position: absolute;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
            `;
            this.wrapper.appendChild(this.canvas);
            this.ctx = this.canvas.getContext('2d', { willReadFrequently: true });

            // Create corrupted text overlay if enabled
            if (this.showCorruptedText) {
                this.createCorruptedText();
            }

            // Start animation
            const startTime = Date.now();
            const animate = () => {
                const elapsed = Date.now() - startTime;
                this.time = elapsed / 1000;

                // Clear canvas
                this.ctx.fillStyle = '#000000';
                this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

                // Draw layered atmosphere
                this.drawAtmosphere();

                // Draw large corruption kanji symbols
                this.drawCorruptionSymbols();

                // Draw lewd phrases in background (behind temple)
                this.drawLewdPhrases();

                // Draw small corruption particles
                this.drawCorruptionParticles();

                // Draw energy waves from temple
                this.drawEnergyWaves();

                // Draw temple silhouette (must be before tentacles to populate base points)
                this.drawTemple();

                // Draw writhing tentacles with text (connects to temple base)
                this.drawTentacles();

                // Draw ritual markers if enabled
                if (this.showRitualMarkers) {
                    this.drawRitualMarkers();
                }

                // Add grain/noise texture
                this.drawGrainTexture();

                if (elapsed < this.duration) {
                    this.animationFrame = requestAnimationFrame(animate);
                } else {
                    setTimeout(() => {
                        this.destroy();
                        resolve();
                    }, 500);
                }
            };

            animate();
        });
    }

    /**
     * Create corrupted text overlay at top
     */
    createCorruptedText() {
        const textEl = document.createElement('div');
        textEl.style.cssText = `
            position: absolute;
            top: 20px;
            left: 50%;
            transform: translateX(-50%);
            width: 90%;
            text-align: center;
            font-family: 'Courier New', monospace;
            font-size: 16px;
            letter-spacing: 4px;
            color: ${this.colorSecondary};
            text-shadow: 0 0 10px ${this.colorSecondary};
            z-index: 2;
            opacity: 0.7;
        `;
        this.wrapper.appendChild(textEl);

        // Flicker corrupted phrases
        this.textFlickerInterval = setInterval(() => {
            const phrase = this.corruptedPhrases[Math.floor(Math.random() * this.corruptedPhrases.length)];
            textEl.textContent = phrase;
        }, 2000);
    }

    /**
     * Draw layered atmospheric fog/mist (organic shapes)
     */
    drawAtmosphere() {
        const centerX = this.canvas.width / 2;
        const centerY = this.canvas.height * 0.35;

        // Pulsing opacity for breathing effect
        const pulse = 0.3 + Math.sin(this.time * 0.5) * 0.1;

        // Background misty layer - irregular shape
        this.ctx.save();
        this.ctx.globalAlpha = pulse * 0.4;
        this.ctx.fillStyle = this.colorSecondary;
        this.ctx.beginPath();
        this.ctx.moveTo(0, centerY + Math.sin(this.time * 0.3) * 10);

        // Create wavy top edge
        for (let x = 0; x <= this.canvas.width; x += 50) {
            const waveY = centerY + Math.sin(x * 0.01 + this.time * 0.5) * 15;
            this.ctx.lineTo(x, waveY);
        }

        // Bottom edge with irregularity
        this.ctx.lineTo(this.canvas.width * 0.92 + Math.sin(this.time) * 5, centerY + 140);
        this.ctx.lineTo(this.canvas.width * 0.08 + Math.cos(this.time) * 5, centerY + 145);
        this.ctx.closePath();
        this.ctx.fill();
        this.ctx.restore();

        // Mid layer - organic mist
        this.ctx.save();
        this.ctx.globalAlpha = pulse * 0.5;
        this.ctx.fillStyle = this.colorAccent;
        this.ctx.beginPath();

        const midY = centerY + 50;
        for (let x = this.canvas.width * 0.05; x <= this.canvas.width * 0.95; x += 40) {
            const waveY = midY + Math.sin(x * 0.015 + this.time * 0.7) * 12;
            if (x === this.canvas.width * 0.05) {
                this.ctx.moveTo(x, waveY);
            } else {
                this.ctx.lineTo(x, waveY);
            }
        }

        this.ctx.lineTo(this.canvas.width * 0.78, centerY + 140);
        this.ctx.lineTo(this.canvas.width * 0.22, centerY + 145);
        this.ctx.closePath();
        this.ctx.fill();
        this.ctx.restore();

        // Foreground layer - closest mist
        this.ctx.save();
        this.ctx.globalAlpha = pulse * 0.6;
        this.ctx.fillStyle = this.colorPrimary;
        this.ctx.beginPath();

        const frontY = centerY + 95;
        for (let x = this.canvas.width * 0.15; x <= this.canvas.width * 0.85; x += 35) {
            const waveY = frontY + Math.sin(x * 0.02 + this.time * 0.9) * 10;
            if (x === this.canvas.width * 0.15) {
                this.ctx.moveTo(x, waveY);
            } else {
                this.ctx.lineTo(x, waveY);
            }
        }

        this.ctx.lineTo(this.canvas.width * 0.67, centerY + 145);
        this.ctx.lineTo(this.canvas.width * 0.33, centerY + 150);
        this.ctx.closePath();
        this.ctx.fill();
        this.ctx.restore();
    }

    /**
     * Draw floating lewd phrases in background (behind temple)
     */
    drawLewdPhrases() {
        this.ctx.save();

        this.lewdParticles.forEach(particle => {
            // Update particle position
            particle.x += particle.speedX * 0.016; // ~60fps
            particle.y += particle.speedY * 0.016;
            particle.rotation += particle.rotationSpeed * 0.016;

            // Wrap around screen
            if (particle.x < -200) particle.x = this.canvas.width + 200;
            if (particle.x > this.canvas.width + 200) particle.x = -200;
            if (particle.y < -100) particle.y = this.canvas.height + 100;
            if (particle.y > this.canvas.height + 100) particle.y = -100;

            // Flickering opacity
            const flicker = Math.sin(this.time * 3 + particle.phase) * 0.1;
            const finalOpacity = Math.max(0, particle.opacity + flicker);

            // Random complete flicker-out
            if (Math.sin(this.time * 5 + particle.phase * 2) > 0.9) {
                return; // Skip rendering this frame
            }

            this.ctx.save();
            this.ctx.translate(particle.x, particle.y);
            this.ctx.rotate(particle.rotation);

            // Text styling
            const fontSize = 14 * particle.scale;
            this.ctx.font = `${fontSize}px "Courier New", monospace`;
            this.ctx.textAlign = 'center';
            this.ctx.textBaseline = 'middle';

            // Color shifts between magenta and purple
            const colorShift = Math.sin(this.time * 2 + particle.phase);
            if (colorShift > 0) {
                this.ctx.fillStyle = this.colorAccent; // Magenta
                this.ctx.strokeStyle = this.colorSecondary; // Purple outline
            } else {
                this.ctx.fillStyle = this.colorSecondary; // Purple
                this.ctx.strokeStyle = this.colorAccent; // Magenta outline
            }

            this.ctx.globalAlpha = finalOpacity;
            this.ctx.lineWidth = 0.5;

            // Shadow glow
            this.ctx.shadowBlur = 15 * particle.scale;
            this.ctx.shadowColor = this.ctx.fillStyle;

            // Draw phrase
            this.ctx.strokeText(particle.phrase, 0, 0);
            this.ctx.fillText(particle.phrase, 0, 0);

            this.ctx.restore();
        });

        this.ctx.restore();
    }

    /**
     * Draw small corruption particle effects
     */
    drawCorruptionParticles() {
        this.ctx.save();

        this.corruptionParticles.forEach(particle => {
            // Update particle position
            particle.x += particle.speedX * 0.016;
            particle.y += particle.speedY * 0.016;

            // Fade over time
            particle.life -= 0.01;

            // Respawn if dead
            if (particle.life <= 0) {
                particle.x = Math.random() * this.canvas.width;
                particle.y = -10;
                particle.speedX = (Math.random() - 0.5) * 30;
                particle.speedY = Math.random() * 20 + 10;
                particle.life = 0.5 + Math.random() * 0.5;
                particle.color = Math.random() > 0.5 ? this.colorAccent : this.colorPrimary;
            }

            // Wrap horizontally
            if (particle.x < 0) particle.x = this.canvas.width;
            if (particle.x > this.canvas.width) particle.x = 0;

            // Pulsing
            const pulse = Math.sin(this.time * 10 + particle.phase) * 0.3 + 0.7;
            const finalOpacity = particle.opacity * particle.life * pulse;

            this.ctx.globalAlpha = finalOpacity;
            this.ctx.fillStyle = particle.color;
            this.ctx.shadowBlur = 8;
            this.ctx.shadowColor = particle.color;

            // Draw particle (small square or circle)
            if (Math.random() > 0.5) {
                this.ctx.fillRect(particle.x - particle.size / 2, particle.y - particle.size / 2, particle.size, particle.size);
            } else {
                this.ctx.beginPath();
                this.ctx.arc(particle.x, particle.y, particle.size / 2, 0, Math.PI * 2);
                this.ctx.fill();
            }
        });

        this.ctx.restore();
    }

    /**
     * Draw large pulsing corruption kanji symbols
     */
    drawCorruptionSymbols() {
        this.ctx.save();

        this.corruptionSymbols.forEach(symbol => {
            // Update position (slow drift)
            symbol.x += symbol.driftX * 0.016;
            symbol.y += symbol.driftY * 0.016;
            symbol.rotation += symbol.rotationSpeed * 0.016;

            // Wrap around screen
            if (symbol.x < -100) symbol.x = this.canvas.width + 100;
            if (symbol.x > this.canvas.width + 100) symbol.x = -100;
            if (symbol.y < -100) symbol.y = this.canvas.height + 100;
            if (symbol.y > this.canvas.height + 100) symbol.y = -100;

            // Pulsing opacity and scale
            const pulse = Math.sin(this.time * symbol.pulseSpeed + symbol.phase);
            const finalOpacity = symbol.opacity * (0.5 + pulse * 0.5);
            const finalScale = symbol.scale * (0.9 + pulse * 0.1);

            this.ctx.save();
            this.ctx.translate(symbol.x, symbol.y);
            this.ctx.rotate(symbol.rotation);

            // Text styling
            const fontSize = 80 * finalScale;
            this.ctx.font = `bold ${fontSize}px "Noto Sans JP", "Yu Gothic", sans-serif`;
            this.ctx.textAlign = 'center';
            this.ctx.textBaseline = 'middle';

            // Color between purple and red
            const colorPhase = Math.sin(this.time * 0.5 + symbol.phase);
            if (colorPhase > 0) {
                this.ctx.fillStyle = this.colorSecondary; // Purple
                this.ctx.strokeStyle = this.colorDanger; // Red
            } else {
                this.ctx.fillStyle = this.colorDanger; // Red
                this.ctx.strokeStyle = this.colorSecondary; // Purple
            }

            this.ctx.globalAlpha = finalOpacity;
            this.ctx.lineWidth = 2;

            // Glow effect
            this.ctx.shadowBlur = 40 * finalScale;
            this.ctx.shadowColor = this.ctx.fillStyle;

            // Draw kanji
            this.ctx.strokeText(symbol.kanji, 0, 0);
            this.ctx.fillText(symbol.kanji, 0, 0);

            this.ctx.restore();
        });

        this.ctx.restore();
    }

    /**
     * Draw energy waves emanating from temple
     */
    drawEnergyWaves() {
        // Spawn new wave periodically
        if (this.time > this.nextWaveTime) {
            this.energyWaves.push({
                centerX: this.canvas.width / 2,
                centerY: this.canvas.height * 0.55,
                radius: 0,
                maxRadius: 300 + Math.random() * 200,
                speed: 80 + Math.random() * 40,
                opacity: 0.4 + Math.random() * 0.3,
                color: Math.random() > 0.5 ? this.colorAccent : this.colorPrimary,
                life: 1.0
            });
            this.nextWaveTime = this.time + 1.5 + Math.random() * 2; // Every 1.5-3.5 seconds
        }

        this.ctx.save();

        // Update and draw waves
        this.energyWaves = this.energyWaves.filter(wave => {
            // Update wave
            wave.radius += wave.speed * 0.016;
            wave.life -= 0.01;

            // Remove if dead or too large
            if (wave.life <= 0 || wave.radius > wave.maxRadius) {
                return false;
            }

            // Draw wave
            const finalOpacity = wave.opacity * wave.life;
            this.ctx.globalAlpha = finalOpacity;
            this.ctx.strokeStyle = wave.color;
            this.ctx.lineWidth = 2 + (1 - wave.life) * 3;
            this.ctx.shadowBlur = 15;
            this.ctx.shadowColor = wave.color;

            this.ctx.beginPath();
            this.ctx.arc(wave.centerX, wave.centerY, wave.radius, 0, Math.PI * 2);
            this.ctx.stroke();

            return true;
        });

        this.ctx.restore();
    }

    /**
     * Draw writhing glassmorphic tentacles with flickering text
     */
    drawTentacles() {
        // Skip if temple hasn't been drawn yet (no base points)
        if (!this.templeBasePoints || this.templeBasePoints.length === 0) {
            return;
        }

        this.tentacles.forEach((tentacle, index) => {
            // Attach tentacle to specific temple base point (FIXED)
            const basePointIndex = index % this.templeBasePoints.length;
            const basePoint = this.templeBasePoints[basePointIndex];
            const baseX = basePoint.x;
            const baseYPos = basePoint.y;

            // Writhing animation - tentacle sways and undulates
            const writhePhase = tentacle.phase + this.time * tentacle.speed;

            // Build tentacle path with segments
            const points = [];
            for (let i = 0; i <= tentacle.segments; i++) {
                const segmentRatio = i / tentacle.segments;

                // Writhing intensity increases with distance from base (0 at base, full at tip)
                // First 30% is rooted/anchored, then gradually increases writhing
                const writheIntensity = Math.max(0, (segmentRatio - 0.3) / 0.7);
                const writheX = Math.sin(writhePhase + segmentRatio * Math.PI * 2) * (30 + segmentRatio * 20) * writheIntensity;
                const writheY = Math.cos(writhePhase * 1.3 + segmentRatio * Math.PI * 3) * 15 * writheIntensity;

                // Tentacle extends from fixed base point
                if (i === 0) {
                    // Base point - absolutely fixed to temple
                    points.push({ x: baseX, y: baseYPos, ratio: segmentRatio });
                } else {
                    // Tentacle extends outward and curves (with writhing only on upper portions)
                    const x = baseX + Math.cos(tentacle.angle + segmentRatio * 0.3) * segmentRatio * tentacle.length + writheX;
                    const y = baseYPos + segmentRatio * 80 + writheY;
                    points.push({ x, y, ratio: segmentRatio });
                }
            }

            // Draw base anchor (corruption veins spreading into temple)
            this.ctx.save();
            this.ctx.globalAlpha = 0.6;
            this.ctx.strokeStyle = this.colorAccent;
            this.ctx.lineWidth = 1.5;
            this.ctx.shadowBlur = 10;
            this.ctx.shadowColor = this.colorAccent;

            // Draw 3-5 corruption veins radiating from attachment point into temple
            const veinCount = 3 + Math.floor(Math.random() * 3);
            for (let v = 0; v < veinCount; v++) {
                const veinAngle = tentacle.angle + (Math.random() - 0.5) * Math.PI * 0.5;
                const veinLength = 15 + Math.random() * 20;
                const veinPulse = Math.sin(writhePhase + v) * 0.3;

                this.ctx.beginPath();
                this.ctx.moveTo(baseX, baseYPos);

                // Branching vein
                const midX = baseX - Math.cos(veinAngle) * veinLength * 0.6;
                const midY = baseYPos - Math.sin(veinAngle) * veinLength * 0.3;
                this.ctx.lineTo(midX, midY);

                const endX = baseX - Math.cos(veinAngle) * veinLength;
                const endY = baseYPos - Math.sin(veinAngle) * veinLength * 0.5;
                this.ctx.lineTo(endX, endY);

                this.ctx.globalAlpha = 0.3 + veinPulse;
                this.ctx.stroke();

                // Small branch off main vein
                if (Math.random() > 0.5) {
                    this.ctx.beginPath();
                    this.ctx.moveTo(midX, midY);
                    this.ctx.lineTo(
                        midX - Math.cos(veinAngle + Math.PI / 4) * 8,
                        midY - Math.sin(veinAngle + Math.PI / 4) * 4
                    );
                    this.ctx.globalAlpha = 0.2;
                    this.ctx.stroke();
                }
            }

            // Draw thicker root at base (merging with temple)
            this.ctx.globalAlpha = 0.8;
            this.ctx.lineWidth = 8;
            this.ctx.beginPath();
            this.ctx.arc(baseX, baseYPos, 5, 0, Math.PI * 2);
            this.ctx.fillStyle = this.colorAccent;
            this.ctx.fill();

            this.ctx.restore();

            // Draw glassmorphic tentacle body with tapered segments
            // Render as multiple segments with varying width (thick at base, thin at tip)
            this.ctx.save();
            this.ctx.strokeStyle = this.colorAccent; // Magenta
            this.ctx.lineCap = 'round';
            this.ctx.lineJoin = 'round';
            this.ctx.shadowBlur = 25;
            this.ctx.shadowColor = this.colorAccent;

            // Draw outer layer with tapering
            for (let i = 1; i < points.length; i++) {
                const prev = points[i - 1];
                const curr = points[i];
                const segmentRatio = i / points.length;

                // Taper from thick (18px) at base to thin (4px) at tip
                const baseWidth = 18;
                const tipWidth = 4;
                const width = baseWidth - (baseWidth - tipWidth) * segmentRatio;
                const pulse = Math.sin(writhePhase * 0.5 + segmentRatio * Math.PI) * 2;

                this.ctx.lineWidth = width + pulse;
                this.ctx.globalAlpha = 0.3 + Math.sin(writhePhase + segmentRatio * Math.PI) * 0.1;

                this.ctx.beginPath();
                this.ctx.moveTo(prev.x, prev.y);
                this.ctx.lineTo(curr.x, curr.y);
                this.ctx.stroke();
            }

            // Add inner glow layer (also tapered)
            this.ctx.shadowBlur = 15;
            for (let i = 1; i < points.length; i++) {
                const prev = points[i - 1];
                const curr = points[i];
                const segmentRatio = i / points.length;

                // Inner layer is thinner
                const baseWidth = 10;
                const tipWidth = 2;
                const width = baseWidth - (baseWidth - tipWidth) * segmentRatio;

                this.ctx.lineWidth = width;
                this.ctx.globalAlpha = 0.5;

                this.ctx.beginPath();
                this.ctx.moveTo(prev.x, prev.y);
                this.ctx.lineTo(curr.x, curr.y);
                this.ctx.stroke();
            }

            this.ctx.restore();

            // Draw flickering text flowing through tentacle
            this.ctx.save();

            // Text properties
            this.ctx.font = '20px "Courier New", monospace';
            this.ctx.textAlign = 'center';
            this.ctx.textBaseline = 'middle';

            // Distribute text characters along tentacle path
            const text = tentacle.textPhrase;
            const textPoints = Math.min(text.length, Math.floor(tentacle.segments / 2));

            for (let i = 0; i < textPoints; i++) {
                const charRatio = (i / textPoints) * 0.7 + 0.15; // Keep text in middle section
                const pointIndex = Math.floor(charRatio * points.length);
                const point = points[Math.min(pointIndex, points.length - 1)];

                // Flickering effect - each character flickers independently
                const flickerPhase = writhePhase + i * 0.5 + tentacle.textOffset;
                const flickerAlpha = 0.5 + Math.abs(Math.sin(flickerPhase * 3)) * 0.5;

                // Random flicker out completely
                if (Math.sin(flickerPhase * 7 + i) > 0.85) {
                    continue; // Skip this character (flicker out)
                }

                this.ctx.globalAlpha = flickerAlpha;
                this.ctx.fillStyle = this.colorPrimary; // Cyan for contrast
                this.ctx.strokeStyle = this.colorAccent; // Magenta outline
                this.ctx.lineWidth = 1;

                // Glow effect on text
                this.ctx.shadowBlur = 10;
                this.ctx.shadowColor = this.colorPrimary;

                // Draw character
                this.ctx.fillText(text[i], point.x, point.y);
                this.ctx.strokeText(text[i], point.x, point.y);
            }

            this.ctx.restore();
        });
    }

    /**
     * Draw ancient temple ruins silhouette (architectural, stepped structure)
     */
    drawTemple() {
        const centerX = this.canvas.width / 2;
        const baseY = this.canvas.height * 0.55;

        // Determine temple size
        let baseWidth, height;
        switch(this.templeSize) {
            case 'small':
                baseWidth = 180;
                height = 140;
                break;
            case 'medium':
                baseWidth = 280;
                height = 220;
                break;
            case 'large':
            default:
                baseWidth = 380;
                height = 300;
        }

        // Pulsing scale for breathing effect (subtle)
        const pulseScale = 1 + Math.sin(this.time * 0.8) * 0.01;
        baseWidth *= pulseScale;
        height *= pulseScale;

        const baseLeft = centerX - baseWidth / 2;
        const baseRight = centerX + baseWidth / 2;

        // Store temple base points for tentacle attachment
        this.templeBasePoints = [];

        this.ctx.save();
        this.ctx.fillStyle = '#000000';
        this.ctx.strokeStyle = this.colorSecondary;
        this.ctx.lineWidth = 2;
        this.ctx.shadowBlur = 20;
        this.ctx.shadowColor = this.colorSecondary;

        // Draw multi-tiered stepped temple structure
        this.ctx.beginPath();

        // Base level - foundation with columns
        const tier1Width = baseWidth;
        const tier1Height = height * 0.25;
        const tier1Y = baseY - tier1Height;

        // Left base with broken column stumps
        this.ctx.moveTo(baseLeft, baseY);
        this.templeBasePoints.push({ x: baseLeft, y: baseY });

        // Column stumps along base (broken pillars) - store for later drawing and tentacles
        const columnCount = 5;
        const columns = [];
        for (let i = 0; i < columnCount; i++) {
            const columnX = baseLeft + (tier1Width / (columnCount - 1)) * i;
            const columnHeight = (tier1Height * 0.6) + (Math.sin(i * 1.5) * 10); // Broken height variation

            columns.push({ x: columnX, height: columnHeight, width: 8 });

            // Store base points for tentacles
            this.templeBasePoints.push({ x: columnX, y: baseY });
        }

        // Draw tier 1 outline (foundation)
        this.ctx.lineTo(baseLeft, baseY);
        this.ctx.lineTo(baseLeft + 15, tier1Y + 10); // Slight inset with damage

        // Tier 2 - middle section (narrower)
        const tier2Width = baseWidth * 0.7;
        const tier2Height = height * 0.35;
        const tier2Y = tier1Y - tier2Height;
        const tier2Left = centerX - tier2Width / 2;
        const tier2Right = centerX + tier2Width / 2;

        // Left side tier 2 with angular breaks
        this.ctx.lineTo(tier2Left - 8, tier1Y + 5);
        this.ctx.lineTo(tier2Left + 5, tier1Y - 10); // Broken corner
        this.ctx.lineTo(tier2Left + 12, tier1Y - 25);
        this.ctx.lineTo(tier2Left + 8, tier2Y + 15); // Crumbling edge

        // Tier 3 - upper section (peak structure)
        const tier3Width = baseWidth * 0.4;
        const tier3Height = height * 0.4;
        const tier3Y = tier2Y - tier3Height;
        const tier3Left = centerX - tier3Width / 2;
        const tier3Right = centerX + tier3Width / 2;

        // Left side tier 3
        this.ctx.lineTo(tier3Left - 5, tier2Y + 8);
        this.ctx.lineTo(tier3Left + 10, tier2Y - 15);
        this.ctx.lineTo(tier3Left + 15, tier2Y - 35); // Angular step
        this.ctx.lineTo(tier3Left + 12, tier3Y + 20);

        // Peak structure - angular top
        const peakY = tier3Y - 40;
        this.ctx.lineTo(centerX - 25, tier3Y + 10);
        this.ctx.lineTo(centerX - 18, tier3Y - 15); // Broken peak left
        this.ctx.lineTo(centerX - 10, peakY + 8);
        this.ctx.lineTo(centerX, peakY); // Central spire
        this.ctx.lineTo(centerX + 10, peakY + 8);
        this.ctx.lineTo(centerX + 18, tier3Y - 15); // Broken peak right
        this.ctx.lineTo(centerX + 25, tier3Y + 10);

        // Right side tier 3 (mirror with variation)
        this.ctx.lineTo(tier3Right - 12, tier3Y + 20);
        this.ctx.lineTo(tier3Right - 15, tier2Y - 35);
        this.ctx.lineTo(tier3Right - 10, tier2Y - 15);
        this.ctx.lineTo(tier3Right + 5, tier2Y + 8);

        // Right side tier 2
        this.ctx.lineTo(tier2Right - 8, tier2Y + 15);
        this.ctx.lineTo(tier2Right - 12, tier1Y - 25);
        this.ctx.lineTo(tier2Right - 5, tier1Y - 10);
        this.ctx.lineTo(tier2Right + 8, tier1Y + 5);

        // Right base
        this.ctx.lineTo(baseRight - 15, tier1Y + 10);
        this.ctx.lineTo(baseRight, baseY);
        this.templeBasePoints.push({ x: baseRight, y: baseY });

        this.ctx.closePath();
        this.ctx.fill();
        this.ctx.stroke();

        // Draw broken column stumps on the base
        this.ctx.globalAlpha = 0.8;
        columns.forEach((column, index) => {
            // Skip corners (already part of outline)
            if (index === 0 || index === columnCount - 1) return;

            const stumbleX = Math.sin(this.time * 0.5 + index) * 2; // Slight movement

            this.ctx.beginPath();
            // Column base
            this.ctx.moveTo(column.x - column.width / 2 + stumbleX, baseY);
            this.ctx.lineTo(column.x - column.width / 2 + stumbleX, baseY - column.height);
            // Broken top (irregular)
            this.ctx.lineTo(column.x - column.width / 4 + stumbleX, baseY - column.height - 5);
            this.ctx.lineTo(column.x + column.width / 4 + stumbleX, baseY - column.height - 3);
            this.ctx.lineTo(column.x + column.width / 2 + stumbleX, baseY - column.height);
            this.ctx.lineTo(column.x + column.width / 2 + stumbleX, baseY);
            this.ctx.closePath();
            this.ctx.fill();
            this.ctx.stroke();

            // Add crack on column
            if (Math.random() > 0.5) {
                this.ctx.globalAlpha = 0.4;
                this.ctx.beginPath();
                const crackY = baseY - column.height * 0.3;
                this.ctx.moveTo(column.x - column.width / 2 + stumbleX, crackY);
                this.ctx.lineTo(column.x + column.width / 2 + stumbleX, crackY - 10);
                this.ctx.stroke();
            }
        });
        this.ctx.globalAlpha = 1;

        // Add crumbling detail lines (cracks and weathering)
        this.ctx.globalAlpha = 0.6;
        for (let i = 0; i < 8; i++) {
            const startRatio = 0.2 + Math.random() * 0.6;
            const endRatio = startRatio + 0.1 + Math.random() * 0.15;

            const startY = baseY - (height * startRatio);
            const endY = baseY - (height * endRatio);

            const side = Math.random() > 0.5 ? 1 : -1;
            const startX = centerX + side * (baseWidth / 2) * (1 - startRatio * 0.8) + Math.random() * 20 - 10;
            const endX = centerX + side * (baseWidth / 2) * (1 - endRatio * 0.8) + Math.random() * 20 - 10;

            this.ctx.beginPath();
            this.ctx.moveTo(startX, startY);
            this.ctx.lineTo(endX, endY);
            this.ctx.stroke();
        }
        this.ctx.globalAlpha = 1;

        // Glowing void at peak (entrance to abyss)
        const voidPulse = 0.5 + Math.sin(this.time * 2) * 0.3;
        const voidX = centerX + Math.sin(this.time * 0.5) * 2;
        const voidY = peakY - 35 + Math.cos(this.time * 0.3) * 2;

        // Outer glow
        this.ctx.beginPath();
        this.ctx.arc(voidX, voidY, 12 * voidPulse, 0, Math.PI * 2);
        this.ctx.fillStyle = this.colorDanger;
        this.ctx.globalAlpha = 0.3 * voidPulse;
        this.ctx.shadowBlur = 40 * voidPulse;
        this.ctx.shadowColor = this.colorDanger;
        this.ctx.fill();

        // Inner void
        this.ctx.globalAlpha = 1;
        this.ctx.beginPath();
        this.ctx.arc(voidX, voidY, 6, 0, Math.PI * 2);
        this.ctx.fillStyle = this.colorDanger;
        this.ctx.shadowBlur = 25 * voidPulse;
        this.ctx.shadowColor = this.colorDanger;
        this.ctx.fill();

        this.ctx.restore();

        // Add ruins/debris at base
        this.drawRuins(centerX, baseY, baseWidth);
    }

    /**
     * Draw scattered ruins and debris at temple base
     */
    drawRuins(centerX, baseY, baseWidth) {
        this.ctx.save();
        this.ctx.fillStyle = '#000000';
        this.ctx.strokeStyle = this.colorSecondary;
        this.ctx.lineWidth = 1;
        this.ctx.globalAlpha = 0.7;

        // Left ruins
        const leftRuins = [
            { x: -0.6, width: 20, height: 25 },
            { x: -0.75, width: 15, height: 18 },
            { x: -0.5, width: 12, height: 20 }
        ];

        leftRuins.forEach(ruin => {
            const ruinX = centerX + (baseWidth * ruin.x);
            const ruinY = baseY;
            const tilt = Math.sin(this.time * 0.3) * 0.05;

            this.ctx.beginPath();
            this.ctx.moveTo(ruinX, ruinY);
            this.ctx.lineTo(ruinX + ruin.width * Math.cos(tilt), ruinY - ruin.height);
            this.ctx.lineTo(ruinX + ruin.width, ruinY - ruin.height * 0.8);
            this.ctx.lineTo(ruinX + ruin.width * 0.8, ruinY);
            this.ctx.closePath();
            this.ctx.fill();
            this.ctx.stroke();
        });

        // Right ruins
        const rightRuins = [
            { x: 0.6, width: 18, height: 22 },
            { x: 0.72, width: 14, height: 16 },
            { x: 0.52, width: 10, height: 15 }
        ];

        rightRuins.forEach(ruin => {
            const ruinX = centerX + (baseWidth * ruin.x);
            const ruinY = baseY;
            const tilt = Math.cos(this.time * 0.4) * 0.05;

            this.ctx.beginPath();
            this.ctx.moveTo(ruinX, ruinY);
            this.ctx.lineTo(ruinX - ruin.width * Math.cos(tilt), ruinY - ruin.height);
            this.ctx.lineTo(ruinX - ruin.width, ruinY - ruin.height * 0.8);
            this.ctx.lineTo(ruinX - ruin.width * 0.8, ruinY);
            this.ctx.closePath();
            this.ctx.fill();
            this.ctx.stroke();
        });

        this.ctx.restore();
    }

    /**
     * Draw ritual markers (circles at bottom)
     */
    drawRitualMarkers() {
        const markerY = this.canvas.height * 0.7;
        const markerSpacing = this.canvas.width * 0.6;
        const leftX = (this.canvas.width - markerSpacing) / 2;
        const rightX = leftX + markerSpacing;

        const pulse = 0.5 + Math.sin(this.time * 1.5) * 0.3;

        // Left marker
        this.ctx.save();
        this.ctx.beginPath();
        this.ctx.arc(leftX, markerY, 12, 0, Math.PI * 2);
        this.ctx.strokeStyle = this.colorPrimary;
        this.ctx.lineWidth = 2;
        this.ctx.shadowBlur = 15 * pulse;
        this.ctx.shadowColor = this.colorPrimary;
        this.ctx.stroke();
        this.ctx.restore();

        // Right marker
        this.ctx.save();
        this.ctx.beginPath();
        this.ctx.arc(rightX, markerY, 12, 0, Math.PI * 2);
        this.ctx.strokeStyle = this.colorPrimary;
        this.ctx.lineWidth = 2;
        this.ctx.shadowBlur = 15 * pulse;
        this.ctx.shadowColor = this.colorPrimary;
        this.ctx.stroke();
        this.ctx.restore();
    }

    /**
     * Add grain/noise texture for ominous effect
     */
    drawGrainTexture() {
        const imageData = this.ctx.getImageData(0, 0, this.canvas.width, this.canvas.height);
        const pixels = imageData.data;

        // Add random noise
        for (let i = 0; i < pixels.length; i += 4) {
            if (Math.random() > 0.95) {
                const noise = Math.random() * 50;
                pixels[i] += noise;     // R
                pixels[i + 1] += noise; // G
                pixels[i + 2] += noise; // B
            }
        }

        this.ctx.putImageData(imageData, 0, 0);
    }

    destroy() {
        // Clear the text flicker interval to prevent memory leak
        if (this.textFlickerInterval) {
            clearInterval(this.textFlickerInterval);
            this.textFlickerInterval = null;
        }
        if (this.animationFrame) {
            cancelAnimationFrame(this.animationFrame);
        }
        if (this.wrapper) {
            this.wrapper.remove();
            this.wrapper = null;
        }
        this.canvas = null;
        this.ctx = null;
    }
}


/**
 * BLOCK 41: CORRUPTED TEXT OVERLAY
 * =================================
 * Floating corruption phrases with large corruption kanji - dark themed background
 * Usage: Overlay for streams, background for dark content, corruption aesthetic
 * Duration: Infinite loop (must call destroy() to stop)
 *
 * Features:
 * - Floating Japanese corruption phrases (SFW by default; nsfw opt-in)
 * - Large corruption kanji symbols (堕闇虚滅魔壊蝕歪)
 * - Small glitch particles
 * - Optional grain texture
 * - Configurable background (black by default, or transparent for overlay)
 *
 * @example
 * // As standalone background with solid black backdrop (default)
 * const overlay = new CorruptedTextOverlay(document.body, {
 *     intensity: 'high',            // 'low', 'medium', 'high' — controls particle count
 *     kanjiCount: 8,                // Number of large kanji (default: 8)
 *     particleCount: 80,            // Small glitch particles (default: 80)
 *     includeGrain: true,           // Film grain effect (default: false)
 *     background: '#000000',        // Solid black (default), 'transparent', or any CSS color
 *     nsfw: false                   // Mature phrases opt-in (default: false)
 *     // opacity not set - text fully opaque (default)
 * });
 * overlay.play();
 *
 * @example
 * // As transparent overlay on existing content with semi-transparent text
 * const overlay = new CorruptedTextOverlay(document.body, {
 *     background: 'transparent',
 *     opacity: 0.6                  // Only apply opacity when needed
 * });
 * overlay.play();
 */
export class CorruptedTextOverlay {
    /**
     * @param {HTMLElement} container - Positioned element the overlay mounts into.
     * @param {object} [options]
     * @param {boolean} [options.nsfw=false] - Source phrases from the NSFW pool (lewdMode/includeLewd are deprecated aliases).
     * @param {string} [options.intensity=medium] - 'low'|'medium'|'high' — phrase-particle count 10/15/20 (lewdIntensity is a deprecated alias).
     * @param {number} [options.kanjiCount=8] - Number of large pulsing kanji.
     * @param {string[]} [options.kanjiSymbols] - Override the default (neutral) kanji glyph set.
     * @param {number} [options.particleCount=80] - Small glitch-speck count.
     * @param {boolean} [options.includeGrain=false] - Add a film-grain noise pass.
     * @param {number} [options.opacity] - Canvas opacity; only applied when set.
     * @param {string} [options.background=#000000] - Wrapper background; use 'transparent' to overlay existing content.
     * @param {number} [options.width=1920] - Canvas pixel width.
     * @param {number} [options.height=1080] - Canvas pixel height.
     */
    constructor(container, options = {}) {
        this.container = container;
        this.nsfw = options.nsfw !== undefined ? options.nsfw
          : ((options.lewdMode !== undefined || options.includeLewd !== undefined)
              ? (console.warn('[CorruptedTextOverlay] lewdMode/includeLewd is deprecated; use nsfw'), (options.lewdMode ?? options.includeLewd))
              : false);
        this.intensity = options.intensity || options.lewdIntensity || 'medium'; // 'low', 'medium', 'high' — controls particle count
        this.kanjiCount = options.kanjiCount !== undefined ? options.kanjiCount : 8;  // Increased from 6 for more presence
        this.particleCount = options.particleCount !== undefined ? options.particleCount : 80;  // Increased from 50 for more atmosphere
        this.includeGrain = options.includeGrain !== undefined ? options.includeGrain : false;
        this.opacity = options.opacity; // Only apply if explicitly set, otherwise fully opaque (1.0)
        this.background = options.background !== undefined ? options.background : '#000000'; // Pure black by default, or 'transparent', or any CSS color

        // Corrupted theme colors
        this.colorPrimary = '#00ffff';    // Cyan
        this.colorSecondary = '#8b5cf6';  // Purple
        this.colorAccent = '#d94f90';     // Magenta
        this.colorDanger = '#ff0000';     // Red

        // Corruption kanji symbols (neutral by default; override via options.kanjiSymbols)
        this.kanjiSymbols = options.kanjiSymbols || ['堕', '闇', '虚', '滅', '魔', '壊', '蝕', '歪'];

        this.wrapper = null;
        this.canvas = null;
        this.ctx = null;
        this.animationFrame = null;
        this.time = 0;

        // Particle arrays
        this.phraseParticles = [];
        this.corruptionSymbols = [];
        this.glitchParticles = [];
    }

    /**
     * Initialize floating phrase particles
     */
    initPhraseParticles() {
        const count = this.intensity === 'low' ? 10 :
                      this.intensity === 'medium' ? 15 : 20;

        for (let i = 0; i < count; i++) {
            this.phraseParticles.push({
                phrase: getRandomPhrase(this.nsfw),
                x: Math.random() * window.innerWidth,
                y: Math.random() * window.innerHeight,
                speedX: (Math.random() - 0.5) * 20,
                speedY: (Math.random() - 0.5) * 15,
                opacity: 0.3 + Math.random() * 0.3,  // Increased from 0.1-0.25 to 0.3-0.6 for higher contrast
                scale: 0.6 + Math.random() * 0.6,
                phase: Math.random() * Math.PI * 2,
                rotationSpeed: (Math.random() - 0.5) * 0.3,
                rotation: Math.random() * Math.PI * 2
            });
        }
    }

    /**
     * Initialize large corruption kanji symbols
     */
    initCorruptionSymbols() {
        for (let i = 0; i < this.kanjiCount; i++) {
            this.corruptionSymbols.push({
                kanji: this.kanjiSymbols[Math.floor(Math.random() * this.kanjiSymbols.length)],
                x: (Math.random() * 0.8 + 0.1) * window.innerWidth,
                y: (Math.random() * 0.8 + 0.1) * window.innerHeight,
                scale: 2 + Math.random() * 3,
                rotation: (Math.random() - 0.5) * Math.PI * 0.3,
                rotationSpeed: (Math.random() - 0.5) * 0.5,
                phase: Math.random() * Math.PI * 2,
                pulseSpeed: 1 + Math.random() * 2,
                opacity: 0.15 + Math.random() * 0.2,  // Increased from 0.05-0.15 to 0.15-0.35 for higher visibility
                driftX: (Math.random() - 0.5) * 10,
                driftY: (Math.random() - 0.5) * 10
            });
        }
    }

    /**
     * Initialize small glitch particles
     */
    initGlitchParticles() {
        for (let i = 0; i < this.particleCount; i++) {
            this.glitchParticles.push({
                x: Math.random() * window.innerWidth,
                y: Math.random() * window.innerHeight,
                size: 1 + Math.random() * 3,
                speedX: (Math.random() - 0.5) * 30,
                speedY: Math.random() * 20 + 10,
                opacity: 0.3 + Math.random() * 0.5,
                color: Math.random() > 0.5 ? this.colorAccent : this.colorPrimary,
                life: 0.5 + Math.random() * 0.5,
                phase: Math.random() * Math.PI * 2
            });
        }
    }

    play() {
        return new Promise((resolve) => {
            // Create wrapper with configurable background (fully opaque)
            this.wrapper = document.createElement('div');
            this.wrapper.style.cssText = `
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: ${this.background};
                pointer-events: none;
                z-index: 9999;
            `;
            this.container.appendChild(this.wrapper);

            // Create canvas with optional opacity (only if specified)
            this.canvas = document.createElement('canvas');
            this.canvas.width = window.innerWidth;
            this.canvas.height = window.innerHeight;
            const opacityStyle = this.opacity !== undefined ? `opacity: ${this.opacity};` : '';
            this.canvas.style.cssText = `
                position: absolute;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                ${opacityStyle}
            `;
            this.wrapper.appendChild(this.canvas);
            this.ctx = this.canvas.getContext('2d', {
                willReadFrequently: this.includeGrain
            });

            // Initialize particles
            this.initPhraseParticles();
            this.initCorruptionSymbols();
            this.initGlitchParticles();

            // Start animation
            const startTime = Date.now();
            const animate = () => {
                const elapsed = Date.now() - startTime;
                this.time = elapsed / 1000;

                // Clear canvas
                this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

                // Draw layers
                this.drawCorruptionSymbols();
                this.drawPhraseParticles();
                this.drawGlitchParticles();

                if (this.includeGrain) {
                    this.drawGrainTexture();
                }

                this.animationFrame = requestAnimationFrame(animate);
            };

            animate();

            // Note: Infinite animation, caller must call destroy()
        });
    }

    /**
     * Draw large pulsing corruption kanji symbols
     */
    drawCorruptionSymbols() {
        this.ctx.save();

        this.corruptionSymbols.forEach(symbol => {
            // Update position
            symbol.x += symbol.driftX * 0.016;
            symbol.y += symbol.driftY * 0.016;
            symbol.rotation += symbol.rotationSpeed * 0.016;

            // Wrap around screen
            if (symbol.x < -100) symbol.x = this.canvas.width + 100;
            if (symbol.x > this.canvas.width + 100) symbol.x = -100;
            if (symbol.y < -100) symbol.y = this.canvas.height + 100;
            if (symbol.y > this.canvas.height + 100) symbol.y = -100;

            // Pulsing
            const pulse = Math.sin(this.time * symbol.pulseSpeed + symbol.phase);
            const finalOpacity = symbol.opacity * (0.5 + pulse * 0.5);
            const finalScale = symbol.scale * (0.9 + pulse * 0.1);

            this.ctx.save();
            this.ctx.translate(symbol.x, symbol.y);
            this.ctx.rotate(symbol.rotation);

            // Text styling
            const fontSize = 80 * finalScale;
            this.ctx.font = `bold ${fontSize}px "Noto Sans JP", "Yu Gothic", sans-serif`;
            this.ctx.textAlign = 'center';
            this.ctx.textBaseline = 'middle';

            // Color shift
            const colorPhase = Math.sin(this.time * 0.5 + symbol.phase);
            if (colorPhase > 0) {
                this.ctx.fillStyle = this.colorSecondary;
                this.ctx.strokeStyle = this.colorDanger;
            } else {
                this.ctx.fillStyle = this.colorDanger;
                this.ctx.strokeStyle = this.colorSecondary;
            }

            this.ctx.globalAlpha = finalOpacity;
            this.ctx.lineWidth = 3;  // Increased from 2 for stronger outline
            this.ctx.shadowBlur = 60 * finalScale;  // Increased from 40 for more dramatic glow
            this.ctx.shadowColor = this.ctx.fillStyle;

            // Draw kanji
            this.ctx.strokeText(symbol.kanji, 0, 0);
            this.ctx.fillText(symbol.kanji, 0, 0);

            this.ctx.restore();
        });

        this.ctx.restore();
    }

    /**
     * Draw floating phrase particles
     */
    drawPhraseParticles() {
        this.ctx.save();

        this.phraseParticles.forEach(particle => {
            // Update position
            particle.x += particle.speedX * 0.016;
            particle.y += particle.speedY * 0.016;
            particle.rotation += particle.rotationSpeed * 0.016;

            // Wrap around
            if (particle.x < -200) particle.x = this.canvas.width + 200;
            if (particle.x > this.canvas.width + 200) particle.x = -200;
            if (particle.y < -100) particle.y = this.canvas.height + 100;
            if (particle.y > this.canvas.height + 100) particle.y = -100;

            // Flickering
            const flicker = Math.sin(this.time * 3 + particle.phase) * 0.1;
            const finalOpacity = Math.max(0, particle.opacity + flicker);

            // Random flicker-out
            if (Math.sin(this.time * 5 + particle.phase * 2) > 0.9) {
                return;
            }

            this.ctx.save();
            this.ctx.translate(particle.x, particle.y);
            this.ctx.rotate(particle.rotation);

            // Text styling
            const fontSize = 14 * particle.scale;
            this.ctx.font = `${fontSize}px "Courier New", monospace`;
            this.ctx.textAlign = 'center';
            this.ctx.textBaseline = 'middle';

            // Color shift
            const colorShift = Math.sin(this.time * 2 + particle.phase);
            if (colorShift > 0) {
                this.ctx.fillStyle = this.colorAccent;
                this.ctx.strokeStyle = this.colorSecondary;
            } else {
                this.ctx.fillStyle = this.colorSecondary;
                this.ctx.strokeStyle = this.colorAccent;
            }

            this.ctx.globalAlpha = finalOpacity;
            this.ctx.lineWidth = 1;  // Increased from 0.5 for stronger outline
            this.ctx.shadowBlur = 25 * particle.scale;  // Increased from 15 for more glow
            this.ctx.shadowColor = this.ctx.fillStyle;

            // Draw phrase
            this.ctx.strokeText(particle.phrase, 0, 0);
            this.ctx.fillText(particle.phrase, 0, 0);

            this.ctx.restore();
        });

        this.ctx.restore();
    }

    /**
     * Draw small glitch particles
     */
    drawGlitchParticles() {
        this.ctx.save();

        this.glitchParticles.forEach(particle => {
            // Update
            particle.x += particle.speedX * 0.016;
            particle.y += particle.speedY * 0.016;
            particle.life -= 0.01;

            // Respawn
            if (particle.life <= 0) {
                particle.x = Math.random() * this.canvas.width;
                particle.y = -10;
                particle.speedX = (Math.random() - 0.5) * 30;
                particle.speedY = Math.random() * 20 + 10;
                particle.life = 0.5 + Math.random() * 0.5;
                particle.color = Math.random() > 0.5 ? this.colorAccent : this.colorPrimary;
            }

            // Wrap
            if (particle.x < 0) particle.x = this.canvas.width;
            if (particle.x > this.canvas.width) particle.x = 0;

            // Pulse
            const pulse = Math.sin(this.time * 10 + particle.phase) * 0.3 + 0.7;
            const finalOpacity = particle.opacity * particle.life * pulse;

            this.ctx.globalAlpha = finalOpacity;
            this.ctx.fillStyle = particle.color;
            this.ctx.shadowBlur = 8;
            this.ctx.shadowColor = particle.color;

            // Draw
            if (Math.random() > 0.5) {
                this.ctx.fillRect(particle.x - particle.size / 2, particle.y - particle.size / 2, particle.size, particle.size);
            } else {
                this.ctx.beginPath();
                this.ctx.arc(particle.x, particle.y, particle.size / 2, 0, Math.PI * 2);
                this.ctx.fill();
            }
        });

        this.ctx.restore();
    }

    /**
     * Add grain/noise texture
     */
    drawGrainTexture() {
        const imageData = this.ctx.getImageData(0, 0, this.canvas.width, this.canvas.height);
        const pixels = imageData.data;

        // Add random noise
        for (let i = 0; i < pixels.length; i += 4) {
            if (Math.random() > 0.95) {
                const noise = Math.random() * 30;
                pixels[i] += noise;     // R
                pixels[i + 1] += noise; // G
                pixels[i + 2] += noise; // B
            }
        }

        this.ctx.putImageData(imageData, 0, 0);
    }

    destroy() {
        if (this.animationFrame) {
            cancelAnimationFrame(this.animationFrame);
            this.animationFrame = null;
        }
        if (this.wrapper) {
            this.wrapper.remove();
            this.wrapper = null;
        }
        this.canvas = null;
        this.ctx = null;
    }
}


/**
 * BLOCK: CHARACTER FLOW PARTICLES
 * ================================
 * Corrupted code particles that flow off character edges
 * Usage: character/portrait overlay effect
 */
export class CharacterFlowParticles {
    /**
     * @param {HTMLElement} container - Required. Element the particle canvas mounts into and is sized from.
     * @param {object} [options]
     * @param {boolean} [options.nsfw=false] - Source the deep-phrase tier from the NSFW pool (lewdMode/includeLewd are deprecated aliases).
     * @param {number} [options.density=50] - Particle density, 0–100%.
     * @param {number} [options.speed=50] - Particle speed, 0–100%.
     * @param {boolean} [options.enabled=true] - When false, play() is a no-op until enable().
     * @param {string} [options.glowColor=purple] - One of purple|magenta|black|cyan|yellow|red.
     * @param {HTMLElement|string} [options.target] - Character element (or CSS selector) whose edges emit particles; spawns from container center when absent.
     * @param {HTMLElement|string} [options.scaleWrapper] - Element (or selector) applying a CSS scale() transform, so bounds math stays correct.
     */
    constructor(container, options = {}) {
        if (!container) {
            throw new Error('CharacterFlowParticles: container element required');
        }
        this.container = container;
        this.density = options.density !== undefined ? options.density : 50; // 0-100%
        this.speed = options.speed !== undefined ? options.speed : 50; // 0-100%
        this.enabled = options.enabled !== undefined ? options.enabled : true;
        this.glowColor = options.glowColor || 'purple';

        // NSFW content is opt-in (default OFF). lewdMode/includeLewd are deprecated aliases.
        this.nsfw = options.nsfw !== undefined ? options.nsfw
          : ((options.lewdMode !== undefined || options.includeLewd !== undefined)
              ? (console.warn('[CharacterFlowParticles] lewdMode/includeLewd is deprecated; use nsfw'), (options.lewdMode ?? options.includeLewd))
              : false);

        // Optional targets: character-bounds element and scale wrapper
        this.target = options.target || null;              // Element or CSS selector for character bounds
        this.scaleWrapper = options.scaleWrapper || null;  // Element or CSS selector applying a CSS scale transform

        // Corrupted theme colors
        this.colorPrimary = '#00ffff';    // Cyan
        this.colorSecondary = '#8b5cf6';  // Purple
        this.colorAccent = '#d94f90';     // Magenta
        this.colorDanger = '#ff0000';     // Red

        // Glow color mapping (from character selector)
        this.glowColors = {
            purple:  'rgba(139, 92, 246, 0.8)',
            magenta: 'rgba(236, 72, 153, 0.8)',
            black:   'rgba(0, 0, 0, 0.8)',
            cyan:    'rgba(6, 182, 212, 0.8)',
            yellow:  'rgba(234, 179, 8, 0.8)',
            red:     'rgba(239, 68, 68, 0.8)'
        };

        // Content arrays for particle generation (expanded for more variety)
        this.binaryPatterns = [
            '01011010', '11001010', '10101010', '11110000',
            '00110011', '10011001', '11001100', '01010101',
            '11011011', '00100010', '10001000', '01000100',
            '11111111', '00000000', '10011010', '01100110',
            '11010011', '00101101', '10110110', '01001001'
        ];

        this.hexCodes = [
            '0xDEAD', '0xBEEF', '0xCAFE', '0x1337',
            '0xBABE', '0xFACE', '0xC0DE', '0xF00D',
            '0xBAD', '0xACE', '0xFEED', '0xDEAF',
            '0x6969', '0x420', '0xFADE', '0xABCD',
            '0xDECF', '0xBAAD', '0xFEE1', '0xF1A5C0'
        ];

        // Short Japanese glitch phrases (cute, SFW)
        this.japaneseGlitch = [
            'ニャー', 'かわいい', 'デレデレ',
            'きゃー', 'あはは', 'うふふ', 'やだ', 'ばか',
            'すごい', 'やばい', 'えへへ', 'むふふ'
        ];

        // Romaji glitch phrases
        this.romajiGlitch = [
            'nyaa~', 'ara ara~', 'fufufu~', 'kyaa~', 'baka~',
            '<3', 'uwu', 'owo', '>w<', '^w^',
            'ehehe~', 'yabai~', 'sugoi~', 'kawaii~'
        ];

        this.wrapper = null;
        this.canvas = null;
        this.ctx = null;
        this.animationFrame = null;
        this.particles = [];
        this.characterBounds = null;
        this.isPlaying = false;
        this.lastTime = 0;
    }

    play() {
        if (!this.enabled) {
            return Promise.resolve();
        }

        if (this.isPlaying) {
            return Promise.resolve();
        }

        return new Promise((resolve) => {
            try {
                // Create wrapper (transparent background, z-index 91)
                this.wrapper = document.createElement('div');
                this.wrapper.style.cssText = `
                    position: absolute;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    background: transparent;
                    pointer-events: none;
                    z-index: 91;
                `;
                this.container.appendChild(this.wrapper);

                // Create canvas — use container dimensions, not viewport
                this.canvas = document.createElement('canvas');
                this.canvas.width = this.container.offsetWidth || 1920;
                this.canvas.height = this.container.offsetHeight || 1080;
                this.canvas.style.cssText = `
                    position: absolute;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                `;
                this.wrapper.appendChild(this.canvas);

                // Get 2D context
                this.ctx = this.canvas.getContext('2d', {
                    alpha: true,
                    desynchronized: true // Performance hint
                });

                if (!this.ctx) {
                    throw new Error('Failed to get 2D context');
                }

                // Initialize
                this.updateCharacterBounds();
                this.particles = [];
                this.isPlaying = true;
                this.lastTime = performance.now();

                // Start animation loop
                this.animate();

                // Add resize listener (debounced)
                this.resizeHandler = this.debounce(() => this.handleResize(), 250);
                window.addEventListener('resize', this.resizeHandler);

                resolve();

            } catch (error) {
                console.warn('[CharacterFlowParticles] failed to start:', error);
                this.enabled = false;
                resolve();
            }
        });
    }

    /**
     * Main animation loop
     */
    animate() {
        if (!this.isPlaying) return;

        const currentTime = performance.now();
        const deltaTime = (currentTime - this.lastTime) / 1000; // Convert to seconds
        this.lastTime = currentTime;

        // Performance check: skip frame if took too long (< 10fps)
        if (deltaTime > 0.1) {
            this.animationFrame = requestAnimationFrame(() => this.animate());
            return;
        }

        // Update particles
        this.updateParticles(deltaTime);

        // Render
        this.render();

        // Continue loop
        this.animationFrame = requestAnimationFrame(() => this.animate());
    }

    /**
     * Update particle physics
     */
    updateParticles(deltaTime) {
        // Spawn new particles based on density (slower spawn rate)
        const targetCount = Math.floor(10 + (this.density / 100) * 50); // 10-60 particles
        const maxSpawnPerFrame = 1; // Reduced from 2 to slow down spawn rate

        let spawned = 0;
        while (this.particles.length < targetCount && spawned < maxSpawnPerFrame) {
            this.particles.push(this.createParticle());
            spawned++;
        }

        // Update existing particles
        for (let i = this.particles.length - 1; i >= 0; i--) {
            const p = this.particles[i];

            // Update position
            p.x += p.vx * deltaTime;
            p.y += p.vy * deltaTime;

            // Random drift (10% chance per frame)
            if (Math.random() < 0.1) {
                p.vx += p.driftX * deltaTime;
                p.vy += p.driftY * deltaTime;
            }

            // Light drag (90% retention)
            p.vx *= 0.90;
            p.vy *= 0.90;

            // Rotation
            p.rotation += p.rotationSpeed * deltaTime;

            // Age and typing animation
            p.age += deltaTime;
            const lifeFraction = p.age / p.lifespan;

            // Typing effect: reveal characters progressively over first 40% of lifespan
            if (p.fullContent && p.fullContent.length > 1) {
                const typingDuration = 0.4; // First 40% of life for typing
                if (lifeFraction < typingDuration) {
                    p.revealProgress = lifeFraction / typingDuration;
                    const charsToReveal = Math.floor(p.revealProgress * p.fullContent.length);
                    p.content = p.fullContent.substring(0, Math.max(1, charsToReveal));
                } else {
                    // Fully revealed after typing completes
                    p.content = p.fullContent;
                    p.revealProgress = 1;
                }
            }

            // Fade in last 20% of life
            if (lifeFraction > 0.8) {
                p.opacity *= 0.95;
            }

            // Remove if dead or off-screen
            const margin = 100;
            const offScreen = p.x < -margin || p.x > this.canvas.width + margin ||
                            p.y < -margin || p.y > this.canvas.height + margin;

            if (lifeFraction >= 1.0 || offScreen || p.opacity < 0.01) {
                this.particles.splice(i, 1);
            }
        }
    }

    /**
     * Render particles to canvas
     */
    render() {
        if (!this.ctx) return;

        // Clear canvas
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        // Render particles
        for (const p of this.particles) {
            this.ctx.save();

            // Position with glitch jitter (10% chance for position shift)
            const jitterX = Math.random() < 0.1 ? (Math.random() - 0.5) * 3 : 0;
            const jitterY = Math.random() < 0.1 ? (Math.random() - 0.5) * 3 : 0;
            this.ctx.translate(p.x + jitterX, p.y + jitterY);
            this.ctx.rotate(p.rotation);

            // Glitch color shift (15% chance to shift to corruption colors)
            let renderColor = p.color;
            if (Math.random() < 0.15) {
                const glitchColors = [
                    'rgba(255, 0, 0, 0.9)',      // Red glitch
                    'rgba(0, 255, 255, 0.9)',    // Cyan glitch
                    'rgba(255, 0, 255, 0.9)',    // Magenta glitch
                    'rgba(255, 255, 0, 0.9)'     // Yellow glitch
                ];
                renderColor = glitchColors[Math.floor(Math.random() * glitchColors.length)];
            }

            // Glitch opacity flicker (20% chance for rapid flicker)
            let renderOpacity = p.opacity;
            if (Math.random() < 0.2) {
                renderOpacity *= 0.3 + Math.random() * 0.7; // Flicker between 30-100% of base
            }

            // Style
            this.ctx.fillStyle = renderColor;
            this.ctx.globalAlpha = renderOpacity;
            this.ctx.font = `${p.size}px "Courier New", monospace`;
            this.ctx.textAlign = 'center';
            this.ctx.textBaseline = 'middle';

            // Render text with glow on random particles (10% chance)
            if (Math.random() < 0.1) {
                this.ctx.shadowBlur = 8;
                this.ctx.shadowColor = renderColor;
            }
            this.ctx.fillText(p.content, 0, 0);
            this.ctx.shadowBlur = 0;

            this.ctx.restore();
        }
    }

    stop() {
        this.isPlaying = false;
        if (this.animationFrame) {
            cancelAnimationFrame(this.animationFrame);
            this.animationFrame = null;
        }
    }

    destroy() {
        this.stop();

        // Remove resize listener
        if (this.resizeHandler) {
            window.removeEventListener('resize', this.resizeHandler);
            this.resizeHandler = null;
        }

        if (this.wrapper && this.wrapper.parentNode) {
            this.wrapper.parentNode.removeChild(this.wrapper);
        }
        this.wrapper = null;
        this.canvas = null;
        this.ctx = null;
        this.particles = [];
    }

    /**
     * Debounce helper for resize events
     * @param {Function} func - Function to debounce
     * @param {number} wait - Delay in milliseconds
     * @returns {Function} - Debounced function
     */
    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }

    /**
     * Handle window resize
     */
    handleResize() {
        if (!this.canvas || !this.wrapper) return;

        // Update canvas dimensions from container, not viewport
        this.canvas.width = this.container.offsetWidth || 1920;
        this.canvas.height = this.container.offsetHeight || 1080;

        // Update character bounds
        this.updateCharacterBounds();
    }

    // ===========================
    // Public API Methods
    // ===========================

    /**
     * Set particle density (0-100%)
     * @param {number} value - Density percentage (0-100)
     * @returns {CharacterFlowParticles} - Returns this for chaining
     */
    setDensity(value) {
        const clamped = Math.max(0, Math.min(100, value));
        if (clamped !== value) {
            console.warn(`[CharacterFlowParticles] density clamped from ${value} to ${clamped}`);
        }
        this.density = clamped;
        return this;
    }

    /**
     * Set particle speed multiplier (0-100%)
     * @param {number} value - Speed percentage (0-100)
     * @returns {CharacterFlowParticles} - Returns this for chaining
     */
    setSpeed(value) {
        const clamped = Math.max(0, Math.min(100, value));
        if (clamped !== value) {
            console.warn(`[CharacterFlowParticles] speed clamped from ${value} to ${clamped}`);
        }
        this.speed = clamped;
        return this;
    }

    /**
     * Set glow color for particle blending
     * @param {string} color - Color key (purple, magenta, black, cyan, yellow, red)
     * @returns {CharacterFlowParticles} - Returns this for chaining
     */
    setGlowColor(color) {
        if (this.glowColors[color]) {
            this.glowColor = color;
        } else {
            console.warn(`[CharacterFlowParticles] invalid glow color: ${color}. Valid colors: ${Object.keys(this.glowColors).join(', ')}`);
        }
        return this;
    }

    /**
     * Enable particle system
     * @returns {CharacterFlowParticles} - Returns this for chaining
     */
    enable() {
        this.enabled = true;
        if (!this.isPlaying) {
            this.play();
        }
        return this;
    }

    /**
     * Disable particle system
     * @returns {CharacterFlowParticles} - Returns this for chaining
     */
    disable() {
        this.enabled = false;
        this.stop();
        return this;
    }

    /**
     * Get current particle system state
     * @returns {object} - Current configuration and state
     */
    getState() {
        return {
            density: this.density,
            speed: this.speed,
            glowColor: this.glowColor,
            enabled: this.enabled,
            particleCount: this.particles.length,
            isPlaying: this.isPlaying
        };
    }

    /**
     * Get current character element bounds from the configured target.
     * target may be a CSS selector string or an Element. Returns null when
     * no target is configured or resolvable (caller falls back to container center).
     */
    getCharacterBounds() {
        let element = null;
        if (typeof this.target === 'string') {
            element = document.querySelector(this.target);
        } else if (this.target instanceof Element) {
            element = this.target;
        }

        if (!element) {
            return null;
        }

        // getBoundingClientRect() returns viewport coords which are wrong when
        // an optional scale wrapper applies a CSS scale transform
        const rect = element.getBoundingClientRect();
        let scaleEl = null;
        if (typeof this.scaleWrapper === 'string') {
            scaleEl = document.querySelector(this.scaleWrapper);
        } else if (this.scaleWrapper instanceof Element) {
            scaleEl = this.scaleWrapper;
        }
        const scale = scaleEl ? (parseFloat(scaleEl.style.transform.replace('scale(', '')) || 1) : 1;
        return {
            x: rect.left / scale,
            y: rect.top / scale,
            width: rect.width / scale,
            height: rect.height / scale,
            centerX: (rect.left + rect.width / 2) / scale,
            centerY: (rect.top + rect.height / 2) / scale
        };
    }

    /**
     * Update character bounds (call when character changes)
     */
    updateCharacterBounds() {
        this.characterBounds = this.getCharacterBounds();
    }

    /**
     * Get random spawn point from character body center region
     * Spawns from center area where character actually is (not from transparent padding edges)
     * Returns {x, y, edge} where edge indicates which direction particle will flow
     */
    getEdgeSpawnPoint() {
        if (!this.characterBounds) {
            this.updateCharacterBounds();
        }

        if (!this.characterBounds) {
            // Fallback to center of container if no character target found
            const w = this.container.offsetWidth || 1920;
            const h = this.container.offsetHeight || 1080;
            return {
                x: w / 2,
                y: h / 2,
                edge: 'center'
            };
        }

        const { centerX, centerY, width, height } = this.characterBounds;

        // Define inner body region (30-70% from center horizontally, extends to lower body)
        // This ensures particles spawn from where character body actually is
        const bodyWidthRatio = 0.40;  // 40% of total width (20% each side from center)
        const bodyHeightRatio = 0.70; // 70% of total height (35% each side from center)

        const bodyWidth = width * bodyWidthRatio;
        const bodyHeight = height * bodyHeightRatio;

        // Determine which edge/direction particle will flow toward
        const rand = Math.random();
        let edge;

        if (rand < 0.15) {
            edge = 'top';
        } else if (rand < 0.35) {
            edge = 'bottom';
        } else if (rand < 0.65) {
            edge = 'left';
        } else {
            edge = 'right';
        }

        // Spawn from center body region with bias toward lower body
        // X: evenly distributed across body width
        const spawnX = centerX + (Math.random() - 0.5) * bodyWidth;

        // Y: biased toward lower body (60% chance for bottom half, 40% for top half)
        let spawnY;
        if (Math.random() < 0.60) {
            // Bottom half (60% chance) - from center to bottom
            spawnY = centerY + Math.random() * (bodyHeight / 2);
        } else {
            // Top half (40% chance) - from center to top
            spawnY = centerY - Math.random() * (bodyHeight / 2);
        }

        // Add small random offset for variety
        const jitterX = (Math.random() - 0.5) * 20;
        const jitterY = (Math.random() - 0.5) * 20;

        return {
            x: spawnX + jitterX,
            y: spawnY + jitterY,
            edge: edge
        };
    }

    /**
     * Create a new particle with random content and physics properties
     * Returns particle object ready for animation
     */
    createParticle() {
        const spawnPoint = this.getEdgeSpawnPoint();

        // Determine content type (30% binary, 20% hex, 50% phrases)
        const contentRand = Math.random();
        let content, fullContent, type, size, color;

        if (contentRand < 0.30) {
            // Binary patterns
            type = 'binary';
            content = this.binaryPatterns[Math.floor(Math.random() * this.binaryPatterns.length)];
            fullContent = content;
            size = 10 + Math.random() * 4; // 10-14px
            color = 'rgba(0, 255, 255, 0.8)'; // Cyan
        } else if (contentRand < 0.50) {
            // Hex codes
            type = 'hex';
            content = this.hexCodes[Math.floor(Math.random() * this.hexCodes.length)];
            fullContent = content;
            size = 12 + Math.random() * 4; // 12-16px
            color = this.glowColors[this.glowColor] || this.glowColors.purple;
        } else {
            // Phrases (50%) - distributed like CorruptedTextOverlay
            const phraseRand = Math.random();

            if (phraseRand < 0.40) {
                // Deep phrases (40% of phrases = 20% total) - Purple; SFW unless nsfw opt-in
                type = 'deep';
                fullContent = getRandomPhrase(this.nsfw);
                size = 14 + Math.random() * 6; // 14-20px
                color = 'rgba(139, 92, 246, 0.8)'; // Purple
            } else if (phraseRand < 0.70) {
                // Short Japanese glitch (30% of phrases = 15% total) - Magenta
                type = 'japanese';
                fullContent = this.japaneseGlitch[Math.floor(Math.random() * this.japaneseGlitch.length)];
                size = 16 + Math.random() * 6; // 16-22px
                color = 'rgba(217, 79, 144, 0.8)'; // Magenta
            } else {
                // Romaji glitch (30% of phrases = 15% total) - Cyan
                type = 'romaji';
                fullContent = this.romajiGlitch[Math.floor(Math.random() * this.romajiGlitch.length)];
                size = 14 + Math.random() * 4; // 14-18px
                color = 'rgba(0, 212, 255, 0.8)'; // Cyan
            }

            // Start with only first character visible (typing effect)
            content = fullContent.charAt(0);
        }

        // Velocity with directional bias toward assigned edge
        // Particles flow outward from body center toward edges
        let baseAngle;
        if (spawnPoint.edge === 'top') {
            baseAngle = -Math.PI / 2; // Up
        } else if (spawnPoint.edge === 'bottom') {
            baseAngle = Math.PI / 2; // Down
        } else if (spawnPoint.edge === 'left') {
            baseAngle = Math.PI; // Left
        } else if (spawnPoint.edge === 'right') {
            baseAngle = 0; // Right
        } else {
            baseAngle = Math.random() * Math.PI * 2; // Random fallback
        }

        // Add random spread (±60 degrees) for variety while maintaining general direction
        const angleSpread = (Math.random() - 0.5) * (Math.PI / 1.5);
        const angle = baseAngle + angleSpread;

        const baseSpeed = 50 + Math.random() * 150; // 50-200 px/s
        const speedMultiplier = this.speed / 100; // 0-100% -> 0.5x-2x
        const speed = baseSpeed * (0.5 + speedMultiplier * 1.5);

        const particle = {
            x: spawnPoint.x,
            y: spawnPoint.y,
            vx: Math.cos(angle) * speed,
            vy: Math.sin(angle) * speed,
            content: content,
            fullContent: fullContent || content, // For typing effect
            revealProgress: 0, // 0-1, controls typing animation
            type: type,
            color: color,
            size: size,
            opacity: 0.4 + Math.random() * 0.3, // 0.4-0.7
            rotation: Math.random() * Math.PI * 2,
            rotationSpeed: (Math.random() - 0.5) * 2, // -1 to 1 rad/s
            age: 0,
            lifespan: 1.0 + Math.random() * 2.0, // 1.0-3.0 seconds (longer for typing effect)
            driftX: (Math.random() - 0.5) * 100,
            driftY: (Math.random() - 0.5) * 100,
            edge: spawnPoint.edge
        };

        return particle;
    }
}

