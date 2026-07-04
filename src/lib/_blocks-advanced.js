/**
 * Animation blocks — advanced subset (absorbed 0.3.0).
 *
 * The 7 classes the composite transitions need, extracted from the canonical
 * celeste-tts-bot obs/transitions/anime-blocks-advanced.js (15 classes, 193k).
 * The 8 unused classes (FloatingCardStack, ImageGallerySlideshow,
 * DataVisualizationDashboard, SegmentedProgressBar, ModuleLoadingList,
 * TacticalTerrainMap, OminousTemple, CorruptedTextOverlay) were deliberately
 * NOT absorbed — no consumer needs them (0.3.0 inventory); absorb on demand.
 *
 * Import from './animation-blocks.js' (re-exported there) — this file is an
 * internal implementation module.
 *
 * @module lib/_blocks-advanced
 * @license MIT
 */

import { getRandomPhrase } from '../core/corruption-phrases.js';
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
        // De-themed on absorption: inline phrase pools removed; canonical
        // corruption-phrases behind nsfw:false (lewdMode = deprecated alias)
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

                    // XSS-safe on absorption: spans built once, text set via
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

/**
 * BLOCK 22: IMAGE GALLERY SLIDESHOW
 * ==================================
 * Staggered image reveal with parallax
 * Usage: Photo galleries, content showcases, montages
 * Duration: Stagger duration * image count
 */
