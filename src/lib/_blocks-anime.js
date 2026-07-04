/**
 * Animation blocks — anime.js-study subset (absorbed 0.3.0).
 *
 * All 10 classes from the canonical celeste-tts-bot
 * obs/transitions/anime-blocks.js + anime-blocks-extended.js:
 * ParticleGrid, HeartPulse, ShatterGrid, WaveRipple, SpiralVortex,
 * CircularProgress, RadialBurst, DataStream, HexagonGrid, CorruptionWave.
 *
 * Import from './animation-blocks.js' (re-exported there) — this file is an
 * internal implementation module.
 *
 * @module lib/_blocks-anime
 * @license MIT
 */
/**
 * ANIME.JS-INSPIRED BUILDING BLOCKS
 * ==================================
 * Additional animation components using anime.js patterns
 * Adapted for corrupted theme aesthetic
 *
 * Patterns from: anime.js stagger grids, SVG morphing, particle systems
 */

// ═══════════════════════════════════════════════════════════════
// BLOCK 6: PARTICLE GRID
// Staggered dot grid animation (anime.js stagger pattern)
// ═══════════════════════════════════════════════════════════════

export class ParticleGrid {
    constructor(container, options = {}) {
        this.container = container;
        this.options = {
            duration: options.duration || 2000,
            rows: options.rows || 8,
            cols: options.cols || 12,
            color: options.color || '#00ffff',
            particleSize: options.particleSize || 8,
            staggerFrom: options.staggerFrom || 'center', // 'center', 'edges', 'random'
            animationType: options.animationType || 'scale', // 'scale', 'rotate', 'explode'
            ...options
        };

        this.element = null;
        this.particles = [];
        this.animationFrames = [];
    }

    async play() {
        return new Promise((resolve) => {
            // Create grid container
            this.element = document.createElement('div');
            this.element.style.cssText = `
                position: absolute;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                display: grid;
                grid-template-columns: repeat(${this.options.cols}, ${this.options.particleSize * 2}px);
                grid-template-rows: repeat(${this.options.rows}, ${this.options.particleSize * 2}px);
                gap: ${this.options.particleSize}px;
                z-index: 100;
            `;
            this.container.appendChild(this.element);

            // Create particles
            const totalParticles = this.options.rows * this.options.cols;
            for (let i = 0; i < totalParticles; i++) {
                const particle = document.createElement('div');
                particle.style.cssText = `
                    width: ${this.options.particleSize}px;
                    height: ${this.options.particleSize}px;
                    background: ${this.options.color};
                    box-shadow: 0 0 10px ${this.options.color};
                    opacity: 0;
                    transform: scale(0);
                `;
                this.element.appendChild(particle);
                this.particles.push(particle);
            }

            // Calculate delays using anime.js-style stagger
            const delays = this.calculateStaggerDelays();
            const startTime = Date.now();

            // Animate each particle
            this.particles.forEach((particle, index) => {
                setTimeout(() => {
                    this.animateParticle(particle, index);
                }, delays[index]);
            });

            // Resolve after all animations complete
            setTimeout(() => {
                resolve();
            }, Math.max(...delays) + 500);
        });
    }

    calculateStaggerDelays() {
        const delays = [];
        const staggerDelay = this.options.duration / (this.options.rows + this.options.cols);

        for (let row = 0; row < this.options.rows; row++) {
            for (let col = 0; col < this.options.cols; col++) {
                const index = row * this.options.cols + col;
                let delay = 0;

                switch (this.options.staggerFrom) {
                    case 'center':
                        // Emanate from center (anime.js pattern)
                        const centerRow = this.options.rows / 2;
                        const centerCol = this.options.cols / 2;
                        const distFromCenter = Math.sqrt(
                            Math.pow(row - centerRow, 2) + Math.pow(col - centerCol, 2)
                        );
                        delay = distFromCenter * staggerDelay;
                        break;

                    case 'edges':
                        // Start from edges, converge to center
                        const distFromEdge = Math.min(
                            row, this.options.rows - row - 1,
                            col, this.options.cols - col - 1
                        );
                        delay = (Math.max(this.options.rows, this.options.cols) - distFromEdge) * staggerDelay;
                        break;

                    case 'random':
                        delay = Math.random() * this.options.duration * 0.8;
                        break;

                    default: // 'sequential'
                        delay = index * staggerDelay;
                }

                delays.push(delay);
            }
        }

        return delays;
    }

    animateParticle(particle, index) {
        const duration = 400;
        const startTime = Date.now();

        const animate = () => {
            const elapsed = Date.now() - startTime;
            const progress = Math.min(elapsed / duration, 1);
            const eased = this.easeOutExpo(progress);

            switch (this.options.animationType) {
                case 'scale':
                    particle.style.opacity = eased;
                    particle.style.transform = `scale(${eased})`;
                    break;

                case 'rotate':
                    particle.style.opacity = eased;
                    particle.style.transform = `scale(${eased}) rotate(${eased * 360}deg)`;
                    break;

                case 'explode':
                    const angle = (index / this.particles.length) * Math.PI * 2;
                    const distance = (1 - eased) * 100;
                    const x = Math.cos(angle) * distance;
                    const y = Math.sin(angle) * distance;
                    particle.style.opacity = eased;
                    particle.style.transform = `translate(${x}px, ${y}px) scale(${eased})`;
                    break;
            }

            if (progress < 1) {
                requestAnimationFrame(animate);
            }
        };

        animate();
    }

    easeOutExpo(t) {
        return t === 1 ? 1 : 1 - Math.pow(2, -10 * t);
    }

    destroy() {
        if (this.element && this.element.parentNode) {
            this.element.parentNode.removeChild(this.element);
        }
        this.particles = [];
    }
}

// ═══════════════════════════════════════════════════════════════
// BLOCK 7: HEART PULSE
// Pulsing heart/shapes with particle burst (love/affection themes)
// ═══════════════════════════════════════════════════════════════

export class HeartPulse {
    constructor(container, options = {}) {
        this.container = container;
        this.options = {
            duration: options.duration || 3000,
            color: options.color || '#ff69b4', // Pink for hearts
            size: options.size || 100,
            pulses: options.pulses || 3,
            particles: options.particles || 12,
            ...options
        };

        this.element = null;
        this.particleElements = [];
        this.animationFrame = null;
    }

    async play() {
        return new Promise((resolve) => {
            // Create heart emoji/shape
            this.element = document.createElement('div');
            this.element.textContent = '💜'; // theme purple heart
            this.element.style.cssText = `
                position: absolute;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%) scale(0);
                font-size: ${this.options.size}px;
                text-shadow: 0 0 20px ${this.options.color};
                z-index: 100;
            `;
            this.container.appendChild(this.element);

            // Create particle ring
            for (let i = 0; i < this.options.particles; i++) {
                const particle = document.createElement('div');
                particle.textContent = '♥';
                particle.style.cssText = `
                    position: absolute;
                    top: 50%;
                    left: 50%;
                    transform: translate(-50%, -50%) scale(0);
                    font-size: 20px;
                    color: ${this.options.color};
                    opacity: 0;
                    z-index: 99;
                `;
                this.container.appendChild(particle);
                this.particleElements.push(particle);
            }

            const startTime = Date.now();
            let pulseCount = 0;

            const animate = () => {
                const elapsed = Date.now() - startTime;
                const progress = elapsed / this.options.duration;

                if (progress < 1) {
                    // Pulse animation
                    const pulseProgress = (elapsed % (this.options.duration / this.options.pulses)) /
                                        (this.options.duration / this.options.pulses);
                    const scale = 1 + Math.sin(pulseProgress * Math.PI) * 0.3;
                    this.element.style.transform = `translate(-50%, -50%) scale(${scale})`;

                    // Particle burst on each pulse
                    if (pulseProgress < 0.1 && Math.floor(elapsed / (this.options.duration / this.options.pulses)) > pulseCount) {
                        pulseCount++;
                        this.burstParticles();
                    }

                    // Animate particles
                    this.particleElements.forEach((particle, index) => {
                        const angle = (index / this.options.particles) * Math.PI * 2;
                        const distance = progress * 200;
                        const x = Math.cos(angle) * distance;
                        const y = Math.sin(angle) * distance;
                        const opacity = Math.max(0, 1 - progress);
                        particle.style.transform = `translate(calc(-50% + ${x}px), calc(-50% + ${y}px)) scale(${1 - progress})`;
                        particle.style.opacity = opacity;
                    });

                    this.animationFrame = requestAnimationFrame(animate);
                } else {
                    resolve();
                }
            };

            // Fade in heart
            let fadeProgress = 0;
            const fadeIn = () => {
                fadeProgress += 0.05;
                if (fadeProgress < 1) {
                    this.element.style.transform = `translate(-50%, -50%) scale(${fadeProgress})`;
                    requestAnimationFrame(fadeIn);
                } else {
                    animate();
                }
            };
            fadeIn();
        });
    }

    burstParticles() {
        this.particleElements.forEach((particle) => {
            particle.style.opacity = '1';
            particle.style.transform = 'translate(-50%, -50%) scale(1)';
        });
    }

    destroy() {
        if (this.animationFrame) {
            cancelAnimationFrame(this.animationFrame);
        }
        if (this.element && this.element.parentNode) {
            this.element.parentNode.removeChild(this.element);
        }
        this.particleElements.forEach(p => p.parentNode && p.parentNode.removeChild(p));
        this.particleElements = [];
    }
}

// ═══════════════════════════════════════════════════════════════
// BLOCK 8: SHATTER GRID
// Grid fragmentation effect (aggressive/combat themes)
// ═══════════════════════════════════════════════════════════════

export class ShatterGrid {
    constructor(container, options = {}) {
        this.container = container;
        this.options = {
            duration: options.duration || 2000,
            gridSize: options.gridSize || 16, // NxN grid
            color: options.color || '#ff0000',
            intensity: options.intensity || 1.0,
            ...options
        };

        this.element = null;
        this.shards = [];
        this.animationFrame = null;
    }

    async play() {
        return new Promise((resolve) => {
            const containerWidth = window.innerWidth;
            const containerHeight = window.innerHeight;
            const shardWidth = containerWidth / this.options.gridSize;
            const shardHeight = containerHeight / this.options.gridSize;

            // Create grid overlay
            this.element = document.createElement('div');
            this.element.style.cssText = `
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                z-index: 100;
            `;
            this.container.appendChild(this.element);

            // Create shards
            for (let row = 0; row < this.options.gridSize; row++) {
                for (let col = 0; col < this.options.gridSize; col++) {
                    const shard = document.createElement('div');
                    shard.style.cssText = `
                        position: absolute;
                        left: ${col * shardWidth}px;
                        top: ${row * shardHeight}px;
                        width: ${shardWidth}px;
                        height: ${shardHeight}px;
                        background: ${this.options.color};
                        opacity: 0;
                        border: 1px solid rgba(0, 255, 255, 0.3);
                    `;

                    // Random velocity for each shard
                    shard.dataset.vx = (Math.random() - 0.5) * this.options.intensity * 500;
                    shard.dataset.vy = (Math.random() - 0.5) * this.options.intensity * 500;
                    shard.dataset.rotation = (Math.random() - 0.5) * this.options.intensity * 720;
                    shard.dataset.delay = Math.sqrt(Math.pow(row - this.options.gridSize/2, 2) +
                                                    Math.pow(col - this.options.gridSize/2, 2)) * 30;

                    this.element.appendChild(shard);
                    this.shards.push(shard);
                }
            }

            const startTime = Date.now();

            const animate = () => {
                const elapsed = Date.now() - startTime;
                const progress = elapsed / this.options.duration;

                if (progress < 1) {
                    this.shards.forEach((shard) => {
                        const delay = parseFloat(shard.dataset.delay);
                        const shardProgress = Math.max(0, (elapsed - delay) / this.options.duration);

                        if (shardProgress > 0) {
                            const eased = this.easeOutCubic(shardProgress);
                            const vx = parseFloat(shard.dataset.vx);
                            const vy = parseFloat(shard.dataset.vy);
                            const rotation = parseFloat(shard.dataset.rotation);

                            shard.style.transform = `translate(${vx * eased}px, ${vy * eased}px) rotate(${rotation * eased}deg)`;
                            shard.style.opacity = Math.max(0, 0.5 - shardProgress * 0.5);
                        }
                    });

                    this.animationFrame = requestAnimationFrame(animate);
                } else {
                    resolve();
                }
            };

            animate();
        });
    }

    easeOutCubic(t) {
        return 1 - Math.pow(1 - t, 3);
    }

    destroy() {
        if (this.animationFrame) {
            cancelAnimationFrame(this.animationFrame);
        }
        if (this.element && this.element.parentNode) {
            this.element.parentNode.removeChild(this.element);
        }
        this.shards = [];
    }
}

// ═══════════════════════════════════════════════════════════════
// BLOCK 9: WAVE RIPPLE
// Concentric wave ripple effect (gentle/social themes)
// ═══════════════════════════════════════════════════════════════

export class WaveRipple {
    constructor(container, options = {}) {
        this.container = container;
        this.options = {
            duration: options.duration || 2500,
            waves: options.waves || 5,
            color: options.color || '#00ffff',
            maxRadius: options.maxRadius || 500,
            ...options
        };

        this.element = null;
        this.waveElements = [];
        this.animationFrame = null;
    }

    async play() {
        return new Promise((resolve) => {
            // Create wave container
            this.element = document.createElement('div');
            this.element.style.cssText = `
                position: fixed;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                z-index: 100;
                pointer-events: none;
            `;
            this.container.appendChild(this.element);

            // Create wave rings
            for (let i = 0; i < this.options.waves; i++) {
                const wave = document.createElement('div');
                wave.style.cssText = `
                    position: absolute;
                    top: 50%;
                    left: 50%;
                    transform: translate(-50%, -50%);
                    border: 3px solid ${this.options.color};
                    border-radius: 50%;
                    box-shadow: 0 0 20px ${this.options.color};
                    width: 0;
                    height: 0;
                    opacity: 0;
                `;
                this.element.appendChild(wave);
                this.waveElements.push(wave);
            }

            const startTime = Date.now();
            const waveDelay = this.options.duration / (this.options.waves * 2);

            const animate = () => {
                const elapsed = Date.now() - startTime;
                const progress = elapsed / this.options.duration;

                if (progress < 1) {
                    this.waveElements.forEach((wave, index) => {
                        const waveStartTime = index * waveDelay;
                        const waveProgress = Math.max(0, (elapsed - waveStartTime) / this.options.duration);

                        if (waveProgress > 0 && waveProgress < 1) {
                            const eased = this.easeOutQuad(waveProgress);
                            const size = this.options.maxRadius * eased;
                            const opacity = Math.max(0, 1 - waveProgress);

                            wave.style.width = `${size}px`;
                            wave.style.height = `${size}px`;
                            wave.style.opacity = opacity;
                        }
                    });

                    this.animationFrame = requestAnimationFrame(animate);
                } else {
                    resolve();
                }
            };

            animate();
        });
    }

    easeOutQuad(t) {
        return t * (2 - t);
    }

    destroy() {
        if (this.animationFrame) {
            cancelAnimationFrame(this.animationFrame);
        }
        if (this.element && this.element.parentNode) {
            this.element.parentNode.removeChild(this.element);
        }
        this.waveElements = [];
    }
}

// ═══════════════════════════════════════════════════════════════
// BLOCK 10: SPIRAL VORTEX
// Spiraling particles (gaming/chaos themes)
// ═══════════════════════════════════════════════════════════════

export class SpiralVortex {
    constructor(container, options = {}) {
        this.container = container;
        this.options = {
            duration: options.duration || 3000,
            particles: options.particles || 60,
            color: options.color || '#d94f90',
            direction: options.direction || 'inward', // 'inward' or 'outward'
            ...options
        };

        this.element = null;
        this.particleElements = [];
        this.animationFrame = null;
    }

    async play() {
        return new Promise((resolve) => {
            // Create particle container
            this.element = document.createElement('div');
            this.element.style.cssText = `
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                z-index: 100;
                pointer-events: none;
            `;
            this.container.appendChild(this.element);

            // Create spiral particles
            for (let i = 0; i < this.options.particles; i++) {
                const particle = document.createElement('div');
                particle.style.cssText = `
                    position: absolute;
                    width: 4px;
                    height: 4px;
                    background: ${this.options.color};
                    box-shadow: 0 0 10px ${this.options.color};
                    border-radius: 50%;
                    opacity: 0;
                `;
                this.element.appendChild(particle);
                this.particleElements.push({
                    el: particle,
                    angle: (i / this.options.particles) * Math.PI * 4, // Multiple rotations
                    delay: (i / this.options.particles) * this.options.duration * 0.5
                });
            }

            const startTime = Date.now();
            const centerX = window.innerWidth / 2;
            const centerY = window.innerHeight / 2;

            const animate = () => {
                const elapsed = Date.now() - startTime;
                const progress = elapsed / this.options.duration;

                if (progress < 1) {
                    this.particleElements.forEach(({el, angle, delay}) => {
                        const particleProgress = Math.max(0, Math.min(1, (elapsed - delay) / this.options.duration));

                        if (particleProgress > 0) {
                            const eased = this.easeInOutCubic(particleProgress);
                            const currentAngle = angle + (particleProgress * Math.PI * 6);

                            let radius;
                            if (this.options.direction === 'inward') {
                                radius = 400 * (1 - eased);
                            } else {
                                radius = 400 * eased;
                            }

                            const x = centerX + Math.cos(currentAngle) * radius;
                            const y = centerY + Math.sin(currentAngle) * radius;

                            el.style.left = `${x}px`;
                            el.style.top = `${y}px`;
                            el.style.opacity = Math.sin(particleProgress * Math.PI);
                        }
                    });

                    this.animationFrame = requestAnimationFrame(animate);
                } else {
                    resolve();
                }
            };

            animate();
        });
    }

    easeInOutCubic(t) {
        return t < 0.5
            ? 4 * t * t * t
            : 1 - Math.pow(-2 * t + 2, 3) / 2;
    }

    destroy() {
        if (this.animationFrame) {
            cancelAnimationFrame(this.animationFrame);
        }
        if (this.element && this.element.parentNode) {
            this.element.parentNode.removeChild(this.element);
        }
        this.particleElements = [];
    }
}

// Export all new blocks
export {
    // Original blocks from animation-blocks.js should be imported separately
};

/**
 * EXTENDED ANIME.JS-INSPIRED BUILDING BLOCKS
 * ===========================================
 * Additional high-performance animation components optimized for 60fps
 * Using transform/opacity only (GPU-accelerated)
 *
 * Research sources:
 * - https://animejs.com/documentation/utilities/stagger/
 * - https://animejs.com/documentation/svg/
 * - https://tympanus.net/codrops/2019/02/13/grid-reveal-effects-with-anime-js/
 * - https://blog.pixelfreestudio.com/how-to-use-anime-js-for-complex-web-animations/
 *
 * Performance optimizations:
 * - Hardware acceleration: transform, opacity only (no width/height/margin)
 * - will-change hints for GPU compositing
 * - RequestAnimationFrame for smooth 60fps
 * - Minimal DOM manipulation
 *
 * New Blocks:
 * - CircularProgress: SVG circular loading indicator
 * - RadialBurst: Particles burst from center (optimized stagger)
 * - DataStream: Vertical corruption data lines
 * - HexagonGrid: Honeycomb pattern with stagger reveal
 * - CorruptionWave: Horizontal wave propagation
 * - PathFollower: SVG path-following animation
 */

// ═══════════════════════════════════════════════════════════════
// BLOCK 11: CIRCULAR PROGRESS
// SVG-based circular loading indicator (corrupted theme)
// Hardware accelerated with strokeDashoffset animation
// ═══════════════════════════════════════════════════════════════

export class CircularProgress {
    constructor(container, options = {}) {
        this.container = container;
        this.options = {
            duration: options.duration || 3000,
            radius: options.radius || 60,
            strokeWidth: options.strokeWidth || 8,
            color: options.color || '#00ffff',
            glitchColor: options.glitchColor || '#8b5cf6',
            position: options.position || 'center', // 'center', 'top-right', 'bottom-left'
            showPercentage: options.showPercentage !== undefined ? options.showPercentage : true,
            glitchIntensity: options.glitchIntensity || 0.15, // 0-1, corruption effect strength
            ...options
        };

        this.element = null;
        this.svg = null;
        this.circle = null;
        this.percentText = null;
        this.animationFrame = null;
    }

    async play() {
        return new Promise((resolve) => {
            const { radius, strokeWidth, color, glitchColor, position, showPercentage } = this.options;
            const size = (radius + strokeWidth) * 2;
            const circumference = 2 * Math.PI * radius;

            // Create SVG container
            const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
            svg.setAttribute('width', size);
            svg.setAttribute('height', size);
            svg.style.cssText = this.getPositionStyles(position, size);
            svg.style.filter = 'drop-shadow(0 0 10px ' + color + ')';

            // Background circle (dim)
            const bgCircle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
            bgCircle.setAttribute('cx', size / 2);
            bgCircle.setAttribute('cy', size / 2);
            bgCircle.setAttribute('r', radius);
            bgCircle.setAttribute('fill', 'none');
            bgCircle.setAttribute('stroke', color);
            bgCircle.setAttribute('stroke-width', strokeWidth);
            bgCircle.setAttribute('opacity', '0.2');
            svg.appendChild(bgCircle);

            // Progress circle
            this.circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
            this.circle.setAttribute('cx', size / 2);
            this.circle.setAttribute('cy', size / 2);
            this.circle.setAttribute('r', radius);
            this.circle.setAttribute('fill', 'none');
            this.circle.setAttribute('stroke', color);
            this.circle.setAttribute('stroke-width', strokeWidth);
            this.circle.setAttribute('stroke-linecap', 'round');
            this.circle.setAttribute('stroke-dasharray', circumference);
            this.circle.setAttribute('stroke-dashoffset', circumference);
            this.circle.setAttribute('transform', `rotate(-90 ${size / 2} ${size / 2})`);
            this.circle.style.transition = 'stroke 0.3s ease'; // Smooth color transitions
            svg.appendChild(this.circle);

            // Percentage text (optional)
            if (showPercentage) {
                this.percentText = document.createElement('div');
                this.percentText.style.cssText = `
                    position: absolute;
                    top: 50%;
                    left: 50%;
                    transform: translate(-50%, -50%);
                    font-family: 'Courier New', monospace;
                    font-size: ${radius * 0.4}px;
                    color: ${color};
                    font-weight: bold;
                    text-shadow: 0 0 10px ${color};
                    pointer-events: none;
                `;
                this.percentText.textContent = '0%';
            }

            // Wrapper for positioning
            this.element = document.createElement('div');
            this.element.style.cssText = 'position: relative;';
            this.element.appendChild(svg);
            if (this.percentText) {
                this.element.appendChild(this.percentText);
            }
            this.container.appendChild(this.element);

            this.svg = svg;

            // Animate progress
            const startTime = Date.now();
            const animate = () => {
                const elapsed = Date.now() - startTime;
                const progress = Math.min(elapsed / this.options.duration, 1.0);

                // Update stroke-dashoffset (GPU-accelerated)
                const offset = circumference - (progress * circumference);
                this.circle.setAttribute('stroke-dashoffset', offset);

                // Update percentage
                if (this.percentText) {
                    const percent = Math.floor(progress * 100);
                    this.percentText.textContent = `${percent}%`;
                }

                // Add corruption glitch effect
                if (Math.random() < this.options.glitchIntensity) {
                    this.circle.setAttribute('stroke', glitchColor);
                    setTimeout(() => {
                        this.circle.setAttribute('stroke', color);
                    }, 50);
                }

                if (progress < 1.0) {
                    this.animationFrame = requestAnimationFrame(animate);
                } else {
                    setTimeout(resolve, 100);
                }
            };

            animate();
        });
    }

    getPositionStyles(position, size) {
        const positions = {
            'center': `
                position: absolute;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                z-index: 100;
            `,
            'top-right': `
                position: absolute;
                top: 20px;
                right: 20px;
                z-index: 100;
            `,
            'bottom-left': `
                position: absolute;
                bottom: 20px;
                left: 20px;
                z-index: 100;
            `,
            'top-left': `
                position: absolute;
                top: 20px;
                left: 20px;
                z-index: 100;
            `,
            'bottom-right': `
                position: absolute;
                bottom: 20px;
                right: 20px;
                z-index: 100;
            `
        };
        return positions[position] || positions['center'];
    }

    destroy() {
        if (this.animationFrame) {
            cancelAnimationFrame(this.animationFrame);
        }
        if (this.element) {
            this.element.remove();
        }
    }
}

// ═══════════════════════════════════════════════════════════════
// BLOCK 12: RADIAL BURST
// Particles burst from center with anime.js-style stagger
// Optimized: transform/opacity only, GPU-accelerated
// ═══════════════════════════════════════════════════════════════

export class RadialBurst {
    constructor(container, options = {}) {
        this.container = container;
        this.options = {
            duration: options.duration || 2000,
            particleCount: options.particleCount || 40,
            color: options.color || '#00ffff',
            particleSize: options.particleSize || 6,
            maxDistance: options.maxDistance || 300,
            easing: options.easing || 'easeOutExpo', // easeOutExpo, easeOutCubic, linear
            rotationSpeed: options.rotationSpeed || 360, // degrees
            ...options
        };

        this.element = null;
        this.particles = [];
        this.animationFrames = [];
    }

    async play() {
        return new Promise((resolve) => {
            // Create container
            this.element = document.createElement('div');
            this.element.style.cssText = `
                position: absolute;
                top: 50%;
                left: 50%;
                width: 0;
                height: 0;
                z-index: 100;
            `;
            this.container.appendChild(this.element);

            // Create particles in circle pattern
            const angleStep = (Math.PI * 2) / this.options.particleCount;
            for (let i = 0; i < this.options.particleCount; i++) {
                const angle = i * angleStep;
                const particle = document.createElement('div');
                particle.style.cssText = `
                    position: absolute;
                    width: ${this.options.particleSize}px;
                    height: ${this.options.particleSize}px;
                    background: ${this.options.color};
                    border-radius: 50%;
                    box-shadow: 0 0 10px ${this.options.color};
                    transform: translate(-50%, -50%) scale(0) rotate(0deg);
                    will-change: transform, opacity;
                    opacity: 0;
                `;
                this.element.appendChild(particle);
                this.particles.push({ element: particle, angle: angle, index: i });
            }

            // Animate with stagger
            const startTime = Date.now();
            const staggerDelay = this.options.duration * 0.6 / this.options.particleCount;

            const animate = () => {
                const elapsed = Date.now() - startTime;
                let allComplete = true;

                this.particles.forEach((particle, index) => {
                    const particleStart = index * staggerDelay;
                    const particleElapsed = Math.max(0, elapsed - particleStart);
                    const particleProgress = Math.min(particleElapsed / (this.options.duration - particleStart), 1.0);

                    if (particleProgress < 1.0) {
                        allComplete = false;
                    }

                    // Apply easing
                    const easedProgress = this.applyEasing(particleProgress, this.options.easing);

                    // Calculate position (radial outward)
                    const distance = easedProgress * this.options.maxDistance;
                    const x = Math.cos(particle.angle) * distance;
                    const y = Math.sin(particle.angle) * distance;

                    // Calculate rotation
                    const rotation = easedProgress * this.options.rotationSpeed;

                    // Calculate scale and opacity
                    const scale = easedProgress < 0.2 ? easedProgress * 5 : 1.0; // Quick scale-in
                    const opacity = easedProgress < 0.8 ? 1.0 : (1.0 - (easedProgress - 0.8) * 5); // Fade out at end

                    // Apply transform (GPU-accelerated)
                    particle.element.style.transform = `translate(${x}px, ${y}px) translate(-50%, -50%) scale(${scale}) rotate(${rotation}deg)`;
                    particle.element.style.opacity = opacity;
                });

                if (!allComplete) {
                    this.animationFrames.push(requestAnimationFrame(animate));
                } else {
                    setTimeout(resolve, 100);
                }
            };

            animate();
        });
    }

    applyEasing(t, easingName) {
        switch (easingName) {
            case 'easeOutExpo':
                return t === 1 ? 1 : 1 - Math.pow(2, -10 * t);
            case 'easeOutCubic':
                return 1 - Math.pow(1 - t, 3);
            case 'easeInOutCubic':
                return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
            default:
                return t; // linear
        }
    }

    destroy() {
        this.animationFrames.forEach(frame => cancelAnimationFrame(frame));
        if (this.element) {
            this.element.remove();
        }
    }
}

// ═══════════════════════════════════════════════════════════════
// BLOCK 13: DATA STREAM
// Vertical corruption data lines (Matrix-style optimized)
// Uses transform only for GPU acceleration
// ═══════════════════════════════════════════════════════════════

export class DataStream {
    constructor(container, options = {}) {
        this.container = container;
        this.options = {
            duration: options.duration || 3000,
            streamCount: options.streamCount || 12,
            color: options.color || '#d94f90', // Magenta default
            glitchColor: options.glitchColor || '#8b5cf6',
            charactersPerStream: options.charactersPerStream || 20,
            speed: options.speed || 1.0, // 0.5 = slow, 2.0 = fast
            ...options
        };

        this.element = null;
        this.streams = [];
        this.animationFrame = null;
    }

    static CHARS = '01アイウエオカキクケコサシスセソタチツテト█▓▒░';

    async play() {
        return new Promise((resolve) => {
            // Create container
            this.element = document.createElement('div');
            this.element.style.cssText = `
                position: absolute;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                z-index: 99;
                pointer-events: none;
                overflow: hidden;
            `;
            this.container.appendChild(this.element);

            // Create streams
            const streamWidth = 100 / this.options.streamCount;
            for (let i = 0; i < this.options.streamCount; i++) {
                const stream = document.createElement('div');
                stream.style.cssText = `
                    position: absolute;
                    top: -100%;
                    left: ${i * streamWidth + streamWidth / 2}%;
                    font-family: 'Courier New', monospace;
                    font-size: 16px;
                    font-weight: bold;
                    color: ${this.options.color};
                    text-shadow:
                        -1px -1px 0 #000000,
                        1px -1px 0 #000000,
                        -1px 1px 0 #000000,
                        1px 1px 0 #000000,
                        0 0 8px ${this.options.color},
                        0 0 15px #8b5cf6,
                        0 0 25px #ff00ff40;
                    line-height: 1.2;
                    white-space: pre;
                    will-change: transform;
                    transform: translateX(-50%);
                `;

                // Generate random characters
                let text = '';
                for (let j = 0; j < this.options.charactersPerStream; j++) {
                    text += DataStream.CHARS[Math.floor(Math.random() * DataStream.CHARS.length)] + '\n';
                }
                stream.textContent = text;

                this.element.appendChild(stream);
                this.streams.push({
                    element: stream,
                    speed: 0.8 + Math.random() * 0.4, // Vary speed slightly
                    startDelay: Math.random() * 500 // Stagger start times
                });
            }

            // Animate streams
            const startTime = Date.now();
            const animate = () => {
                const elapsed = Date.now() - startTime;
                const progress = Math.min(elapsed / this.options.duration, 1.0);

                this.streams.forEach((stream) => {
                    const streamElapsed = Math.max(0, elapsed - stream.startDelay);
                    const streamProgress = streamElapsed / this.options.duration;

                    // Move down (use transform for GPU acceleration)
                    const yPos = -100 + (streamProgress * 200) * stream.speed * this.options.speed;
                    stream.element.style.transform = `translateX(-50%) translateY(${yPos}%)`;

                    // Add occasional color glitch
                    if (Math.random() < 0.01) {
                        stream.element.style.color = this.options.glitchColor;
                        setTimeout(() => {
                            stream.element.style.color = this.options.color;
                        }, 50);
                    }
                });

                if (progress < 1.0) {
                    this.animationFrame = requestAnimationFrame(animate);
                } else {
                    setTimeout(resolve, 100);
                }
            };

            animate();
        });
    }

    destroy() {
        if (this.animationFrame) {
            cancelAnimationFrame(this.animationFrame);
        }
        if (this.element) {
            this.element.remove();
        }
    }
}

// ═══════════════════════════════════════════════════════════════
// BLOCK 14: HEXAGON GRID
// Honeycomb pattern with staggered reveal (optimized)
// Uses scale/opacity for GPU acceleration
// ═══════════════════════════════════════════════════════════════

export class HexagonGrid {
    constructor(container, options = {}) {
        this.container = container;
        this.options = {
            duration: options.duration || 2500,
            rows: options.rows || 6,
            cols: options.cols || 8,
            hexSize: options.hexSize || 40,
            color: options.color || '#00ffff',
            staggerFrom: options.staggerFrom || 'center', // 'center', 'top', 'random'
            fillStyle: options.fillStyle || 'stroke', // 'stroke', 'fill', 'both'
            ...options
        };

        this.element = null;
        this.hexagons = [];
        this.animationFrames = [];
    }

    async play() {
        return new Promise((resolve) => {
            // Create grid container
            this.element = document.createElement('div');
            this.element.style.cssText = `
                position: absolute;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                z-index: 100;
            `;
            this.container.appendChild(this.element);

            // Create hexagons
            const hexWidth = this.options.hexSize * Math.sqrt(3);
            const hexHeight = this.options.hexSize * 2;
            const vertSpacing = hexHeight * 0.75;
            const centerRow = this.options.rows / 2;
            const centerCol = this.options.cols / 2;

            for (let row = 0; row < this.options.rows; row++) {
                for (let col = 0; col < this.options.cols; col++) {
                    const x = col * hexWidth + (row % 2) * (hexWidth / 2);
                    const y = row * vertSpacing;

                    const hex = this.createHexagonSVG(x, y);
                    this.element.appendChild(hex);

                    // Calculate stagger delay based on distance from source
                    let delay = 0;
                    if (this.options.staggerFrom === 'center') {
                        const distFromCenter = Math.sqrt(
                            Math.pow(row - centerRow, 2) + Math.pow(col - centerCol, 2)
                        );
                        delay = distFromCenter * 80;
                    } else if (this.options.staggerFrom === 'top') {
                        delay = row * 100;
                    } else if (this.options.staggerFrom === 'random') {
                        delay = Math.random() * 1000;
                    }

                    this.hexagons.push({ element: hex, delay: delay });
                }
            }

            // Animate hexagons
            const startTime = Date.now();
            const animate = () => {
                const elapsed = Date.now() - startTime;
                let allComplete = true;

                this.hexagons.forEach((hex) => {
                    const hexElapsed = Math.max(0, elapsed - hex.delay);
                    const hexProgress = Math.min(hexElapsed / (this.options.duration * 0.5), 1.0);

                    if (hexProgress < 1.0) {
                        allComplete = false;
                    }

                    // Ease out cubic
                    const easedProgress = 1 - Math.pow(1 - hexProgress, 3);

                    // Scale and opacity (GPU-accelerated)
                    hex.element.style.transform = `translate(-50%, -50%) scale(${easedProgress})`;
                    hex.element.style.opacity = easedProgress;
                });

                if (!allComplete || elapsed < this.options.duration) {
                    this.animationFrames.push(requestAnimationFrame(animate));
                } else {
                    setTimeout(resolve, 100);
                }
            };

            animate();
        });
    }

    createHexagonSVG(x, y) {
        const size = this.options.hexSize;
        const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        svg.setAttribute('width', size * 2);
        svg.setAttribute('height', size * 2);
        svg.style.cssText = `
            position: absolute;
            left: ${x}px;
            top: ${y}px;
            transform: translate(-50%, -50%) scale(0);
            will-change: transform, opacity;
            opacity: 0;
        `;

        // Create hexagon path
        const points = [];
        for (let i = 0; i < 6; i++) {
            const angle = (Math.PI / 3) * i - Math.PI / 2;
            const px = size + Math.cos(angle) * size;
            const py = size + Math.sin(angle) * size;
            points.push(`${px},${py}`);
        }

        const hexagon = document.createElementNS('http://www.w3.org/2000/svg', 'polygon');
        hexagon.setAttribute('points', points.join(' '));

        if (this.options.fillStyle === 'stroke' || this.options.fillStyle === 'both') {
            hexagon.setAttribute('stroke', this.options.color);
            hexagon.setAttribute('stroke-width', '2');
            hexagon.style.filter = `drop-shadow(0 0 5px ${this.options.color})`;
        }
        if (this.options.fillStyle === 'fill' || this.options.fillStyle === 'both') {
            hexagon.setAttribute('fill', this.options.color);
            hexagon.setAttribute('fill-opacity', '0.2');
        }
        if (this.options.fillStyle === 'stroke') {
            hexagon.setAttribute('fill', 'none');
        }

        svg.appendChild(hexagon);
        return svg;
    }

    destroy() {
        this.animationFrames.forEach(frame => cancelAnimationFrame(frame));
        if (this.element) {
            this.element.remove();
        }
    }
}

// ═══════════════════════════════════════════════════════════════
// BLOCK 15: CORRUPTION WAVE
// Horizontal wave propagation with glitch effect
// Optimized: opacity/transform only
// ═══════════════════════════════════════════════════════════════

export class CorruptionWave {
    constructor(container, options = {}) {
        this.container = container;
        this.options = {
            duration: options.duration || 2000,
            waveCount: options.waveCount || 30,
            color: options.color || '#8b5cf6',
            height: options.height || 4,
            direction: options.direction || 'down', // 'down', 'up', 'left', 'right'
            intensity: options.intensity || 1.0, // 0.5 = subtle, 2.0 = intense
            ...options
        };

        this.element = null;
        this.waves = [];
        this.animationFrame = null;
    }

    async play() {
        return new Promise((resolve) => {
            // Create container
            this.element = document.createElement('div');
            this.element.style.cssText = `
                position: absolute;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                z-index: 101;
                pointer-events: none;
            `;
            this.container.appendChild(this.element);

            // Create waves based on direction
            const isVertical = this.options.direction === 'down' || this.options.direction === 'up';
            const waveSpacing = 100 / this.options.waveCount;

            for (let i = 0; i < this.options.waveCount; i++) {
                const wave = document.createElement('div');
                const position = i * waveSpacing;

                if (isVertical) {
                    wave.style.cssText = `
                        position: absolute;
                        top: ${position}%;
                        left: 0;
                        width: 100%;
                        height: ${this.options.height}px;
                        background: ${this.options.color};
                        box-shadow: 0 0 20px ${this.options.color};
                        will-change: opacity, transform;
                        opacity: 0;
                    `;
                } else {
                    wave.style.cssText = `
                        position: absolute;
                        left: ${position}%;
                        top: 0;
                        width: ${this.options.height}px;
                        height: 100%;
                        background: ${this.options.color};
                        box-shadow: 0 0 20px ${this.options.color};
                        will-change: opacity, transform;
                        opacity: 0;
                    `;
                }

                this.element.appendChild(wave);
                this.waves.push({ element: wave, index: i });
            }

            // Animate wave propagation
            const startTime = Date.now();
            const animate = () => {
                const elapsed = Date.now() - startTime;
                const progress = Math.min(elapsed / this.options.duration, 1.0);

                this.waves.forEach((wave, index) => {
                    // Stagger based on wave position
                    const waveStart = (index / this.options.waveCount) * 0.3; // First 30% for stagger
                    const waveProgress = Math.max(0, Math.min((progress - waveStart) / 0.7, 1.0));

                    // Pulse opacity (fade in, bright, fade out)
                    let opacity;
                    if (waveProgress < 0.3) {
                        opacity = waveProgress / 0.3;
                    } else if (waveProgress < 0.7) {
                        opacity = 1.0;
                    } else {
                        opacity = 1.0 - (waveProgress - 0.7) / 0.3;
                    }
                    opacity *= this.options.intensity;

                    wave.element.style.opacity = opacity;

                    // Add slight scale pulse
                    const scale = 1.0 + Math.sin(waveProgress * Math.PI) * 0.2;
                    if (isVertical) {
                        wave.element.style.transform = `scaleY(${scale})`;
                    } else {
                        wave.element.style.transform = `scaleX(${scale})`;
                    }
                });

                if (progress < 1.0) {
                    this.animationFrame = requestAnimationFrame(animate);
                } else {
                    setTimeout(resolve, 100);
                }
            };

            animate();
        });
    }

    destroy() {
        if (this.animationFrame) {
            cancelAnimationFrame(this.animationFrame);
        }
        if (this.element) {
            this.element.remove();
        }
    }
}

// ═══════════════════════════════════════════════════════════════
// Helper: Composition functions (from animation-blocks.js)
// ═══════════════════════════════════════════════════════════════

export async function playParallel(blocks) {
    await Promise.all(blocks.map(block => block.play()));
    blocks.forEach(block => block.destroy());
}

export async function playSequence(blocks) {
    for (const block of blocks) {
        await block.play();
        block.destroy();
    }
}

export async function playStaggered(blocks, staggerDelay = 200) {
    const promises = blocks.map((block, index) => {
        return new Promise(resolve => {
            setTimeout(async () => {
                await block.play();
                block.destroy();
                resolve();
            }, index * staggerDelay);
        });
    });
    await Promise.all(promises);
}
