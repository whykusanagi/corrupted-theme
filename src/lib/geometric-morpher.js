// Geometric Morpher Transition - ENHANCED WITH BUILDING BLOCKS
// EVA-style geometric morphing with particles, bloom, and occult geometry
// Features: Particle systems, layered glow, sacred geometry, corruption effects, abyssal cables
// v1.1: Integrated modular building blocks (ProgressBar, TitleDecoder)

import { CRTEffects } from './crt-effects.js';
import { getRandomPhrase, NSFW_PHRASES, SFW_PHRASES, KATAKANA, HIRAGANA } from '../core/terminal-vocab.js';
import { AbyssalCableSystem } from './abyssal-cables.js';
import { ProgressBar, TitleDecoder } from './animation-blocks.js';

export class GeometricMorpher {
    constructor(container) {
        this.container = container;
        this.canvas = null;
        this.ctx = null;
        this.animationFrame = null;
        this.crtEffects = new CRTEffects(container);
        this.cableSystem = null; // Initialized in setupCanvas when dimensions are known
        this.isPlaying = false;
        this.particles = [];
        this.fragments = [];
        this.nuclearStrikes = [];
        this.signalLostMarkers = [];
        this.screenShake = { x: 0, y: 0 };
        this.earthImage = null;
        this.earthImageLoaded = false;
        // Building blocks (v1.1)
        this.progressBar = null;
        this.titleDecoder = null;
    }

    // Main play method
    play(options = {}, callback) {
        if (this.isPlaying) {
            console.warn('[GeometricMorpher] Already playing');
            return;
        }

        this.isPlaying = true;
        const duration = options.duration || 8000;
        const color = options.color || '#d94f90';
        const finalShape = options.finalShape || 'sphere';
        this.nsfw = options.nsfw !== undefined ? options.nsfw
            : (options.lewdMode !== undefined
                ? (console.warn('[GeometricMorpher] lewdMode is deprecated; use nsfw'), options.lewdMode)
                : false);
        const customText = options.customText || null;

        this.setupCanvas();

        if (options.effects?.scanlines) {
            this.crtEffects.createScanlines();
        }

        this.animateSequence(duration, color, finalShape, customText, () => {
            this.cleanup();
            this.isPlaying = false;
            if (callback) callback();
        });
    }

    setupCanvas() {
        this.canvas = document.createElement('canvas');
        this.canvas.className = 'transition-canvas';
        this.canvas.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            z-index: 50;
            background: #000;
        `;

        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
        this.ctx = this.canvas.getContext('2d');
        this.container.appendChild(this.canvas);

        // Initialize abyssal cable system
        this.cableSystem = new AbyssalCableSystem(this.ctx, this.canvas.width, this.canvas.height);
    }

    // Enhanced animation sequence with particles and layered effects
    animateSequence(duration, color, finalShape, customText, callback) {
        const startTime = Date.now();
        const centerX = this.canvas.width / 2;
        const centerY = this.canvas.height / 2;

        // Extended sequence with occult geometry ending in apocalyptic globe
        const sequence = [
            { shape: 'circle', start: 0.0, end: 0.12, rotation: 0, occult: false },
            { shape: 'pentagram', start: 0.12, end: 0.24, rotation: 0, occult: true },
            { shape: 'hexagon', start: 0.24, end: 0.36, rotation: 30, occult: false },
            { shape: 'triangleGrid', start: 0.36, end: 0.48, rotation: 0, occult: true },
            { shape: 'metatronsCube', start: 0.48, end: 0.60, rotation: 45, occult: true },
            { shape: 'globe', start: 0.60, end: 1.0, rotation: 0, occult: false } // Extended for nuclear strikes
        ];

        // Initialize particle system
        this.initParticles(centerX, centerY, 150);

        // Initialize nuclear strike system
        this.initNuclearStrikes(centerX, centerY);

        // v1.1: Initialize ProgressBar (runs parallel to entire sequence)
        this.progressBar = new ProgressBar(this.container, {
            duration: duration,
            color: color,
            height: 4,
            position: 'bottom',
            glitch: true
        });
        this.progressBar.play();

        // Track if title decoder has been started
        let titleDecoderStarted = false;

        const animate = () => {
            const elapsed = Date.now() - startTime;
            const progress = Math.min(elapsed / duration, 1.0);

            // Draw layered background
            this.drawLayeredBackground(Math.min(progress, 0.99)); // Keep background stable

            // Update and draw particles
            this.updateParticles(centerX, centerY, progress);

            // Update and render abyssal cables (behind particles)
            if (this.cableSystem) {
                this.cableSystem.update(elapsed);
                this.cableSystem.render(Math.min(progress, 1.0));
            }

            this.drawParticles();

            // Find current shape - if past 100%, stay on globe for decode completion + final hold
            let current = sequence.find(s => progress >= s.start && progress < s.end);
            if (!current && progress >= sequence[sequence.length - 1].start) {
                // Past 100% but keep rendering final shape (globe) until decodes finish + final hold
                current = sequence[sequence.length - 1];

                // Check if all decodes are complete
                const allDecodesComplete = this.nuclearStrikes.every(s =>
                    !s.triggered || s.decodeProgress >= 1.0
                );

                if (allDecodesComplete && progress >= 1.0) {
                    // Start final hold timer if not already started
                    if (this.finalHoldStartTime === null) {
                        this.finalHoldStartTime = Date.now();
                        console.log('📡 All decodes complete - holding final scene for 2 seconds');
                    }

                    // Check if final hold is complete
                    const holdElapsed = Date.now() - this.finalHoldStartTime;
                    if (holdElapsed >= this.finalHoldDuration) {
                        callback();
                        return;
                    }
                }
            } else if (!current) {
                callback();
                return;
            }

            const shapeProgress = Math.min((progress - current.start) / (current.end - current.start), 1.0);

            // v1.1: Start TitleDecoder during globe phase (60-100% of duration)
            if (current.shape === 'globe' && !titleDecoderStarted && customText) {
                titleDecoderStarted = true;
                const decoderDuration = (current.end - current.start) * duration * 0.8; // 80% of globe phase
                this.titleDecoder = new TitleDecoder(this.container, {
                    finalText: customText,
                    duration: decoderDuration,
                    nsfw: this.nsfw,
                    color: color,
                    fontSize: '38px'
                });
                this.titleDecoder.play();
                console.log(`[GeometricMorpher] Title decoder started: "${customText}"`);
            }

            // Calculate dynamic size with pulse
            // Globe gets much larger for dramatic finale
            const baseSize = current.shape === 'globe' ? 300 : 150;
            const pulse = 1 + Math.sin(progress * Math.PI * 6) * 0.15;
            const size = baseSize * pulse * (0.5 + shapeProgress * 0.5); // Build from 50% to 100%

            // Rotation
            const rotation = current.rotation + (progress * 720); // Two full rotations

            // Color interpolation: cyan → purple → magenta → red
            const colorValue = this.getProgressiveColor(progress);

            // Draw shape with layered glow (bloom effect)
            this.drawShapeWithBloom(current.shape, centerX, centerY, size, rotation, colorValue, shapeProgress, progress);

            // Add corruption/glitch at transitions
            if (shapeProgress < 0.1 || shapeProgress > 0.9) {
                this.drawCorruptionEffect(centerX, centerY, size, shapeProgress);
            }

            // Continue animation
            this.animationFrame = requestAnimationFrame(animate);
        };

        animate();
    }

    // Layered background with radial gradients
    drawLayeredBackground(progress) {
        // Deep space black base
        this.ctx.fillStyle = '#000';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        // Animated radial gradient
        const centerX = this.canvas.width / 2;
        const centerY = this.canvas.height / 2;

        // Outer glow (purple corruption aura)
        const outerGradient = this.ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, this.canvas.height * 0.7);
        outerGradient.addColorStop(0, `rgba(139, 92, 246, ${0.1 * progress})`); // Purple
        outerGradient.addColorStop(0.5, `rgba(217, 79, 144, ${0.05 * progress})`); // Magenta
        outerGradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
        this.ctx.fillStyle = outerGradient;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        // Inner glow (cyan core)
        const innerGradient = this.ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, 300);
        innerGradient.addColorStop(0, `rgba(0, 255, 255, ${0.15 * progress})`); // Cyan
        innerGradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
        this.ctx.fillStyle = innerGradient;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    }

    // Progressive color shifts
    getProgressiveColor(progress) {
        if (progress < 0.33) {
            // Magenta → Purple
            return this.interpolateColor('#d94f90', '#8b5cf6', progress * 3);
        } else if (progress < 0.66) {
            // Purple → Bright Magenta
            return this.interpolateColor('#8b5cf6', '#ff00ff', (progress - 0.33) * 3);
        } else {
            // Bright Magenta → Magenta (loop)
            return this.interpolateColor('#ff00ff', '#d94f90', (progress - 0.66) * 3);
        }
    }

    // Particle system initialization
    initParticles(centerX, centerY, count) {
        this.particles = [];
        for (let i = 0; i < count; i++) {
            const angle = (i / count) * Math.PI * 2;
            const distance = 200 + Math.random() * 100;
            this.particles.push({
                angle: angle,
                distance: distance,
                baseDistance: distance,
                speed: 0.01 + Math.random() * 0.02,
                size: 1 + Math.random() * 2,
                alpha: 0.3 + Math.random() * 0.7,
                phase: Math.random() * Math.PI * 2
            });
        }

        // Create abyssal cables connecting particles (PATCH 01: "Nothing is beyond her reach")
        this.createParticleCables(centerX, centerY);
    }

    // Create cables connecting orbiting particles and radiating from center
    createParticleCables(centerX, centerY) {
        if (!this.cableSystem) return;

        // Clear any existing cables
        this.cableSystem.clear();

        // Create radial tentacles from center (8 tentacles reaching outward)
        this.cableSystem.createRadialCables(centerX, centerY, 8, 400, {
            thickness: 1.5,
            color: '#d94f90',
            glowColor: '#8b5cf6',
            alpha: 0.6,
            textFlow: true,
            nsfw: this.nsfw,
            organicness: 0.5,
            textSpeed: 0.01
        });

        // Get particle positions for connecting cables
        const particlePoints = this.particles.map(p => ({
            x: centerX + Math.cos(p.angle) * p.distance,
            y: centerY + Math.sin(p.angle) * p.distance
        }));

        // Connect random particles with cables (creates web-like structure)
        this.cableSystem.connectPoints(particlePoints, {
            connectionCount: 15,
            thickness: 1,
            color: '#8b5cf6',
            glowColor: '#d94f90',
            alpha: 0.4,
            textFlow: true,
            nsfw: this.nsfw,
            organicness: 0.2,
            textSpeed: 0.02
        });
    }

    // Update particle positions (orbit and breathe)
    updateParticles(centerX, centerY, progress) {
        this.particles.forEach(p => {
            p.angle += p.speed;
            // Breathing effect
            const breathe = Math.sin(progress * Math.PI * 3 + p.phase) * 30;
            p.distance = p.baseDistance + breathe;
        });
    }

    // Draw particles
    drawParticles() {
        const centerX = this.canvas.width / 2;
        const centerY = this.canvas.height / 2;

        this.particles.forEach(p => {
            const x = centerX + Math.cos(p.angle) * p.distance;
            const y = centerY + Math.sin(p.angle) * p.distance;

            this.ctx.fillStyle = `rgba(0, 255, 255, ${p.alpha})`;
            this.ctx.beginPath();
            this.ctx.arc(x, y, p.size, 0, Math.PI * 2);
            this.ctx.fill();
        });
    }

    // Draw shape with multiple glow layers (bloom effect)
    drawShapeWithBloom(shapeType, x, y, size, rotation, color, shapeProgress, globalProgress) {
        // Special case: Globe handles its own rendering (no bloom, has screen shake)
        if (shapeType === 'globe') {
            this.drawGlobeWithStrikes(x, y, size, shapeProgress, globalProgress);
            return;
        }

        // Draw 3 layers with increasing blur for bloom
        const layers = [
            { blur: 40, alpha: 0.3, lineWidth: 4 },
            { blur: 20, alpha: 0.5, lineWidth: 3 },
            { blur: 10, alpha: 0.8, lineWidth: 2 },
            { blur: 0, alpha: 1.0, lineWidth: 2 }
        ];

        layers.forEach(layer => {
            this.ctx.save();
            this.ctx.translate(x, y);
            this.ctx.rotate((rotation * Math.PI) / 180);

            this.ctx.strokeStyle = color;
            this.ctx.lineWidth = layer.lineWidth;
            this.ctx.shadowColor = color;
            this.ctx.shadowBlur = layer.blur;
            this.ctx.globalAlpha = layer.alpha;

            this.drawShapeGeometry(shapeType, size, shapeProgress);

            this.ctx.restore();
        });
    }

    // Draw specific geometry
    drawShapeGeometry(shapeType, size, progress) {
        switch (shapeType) {
            case 'circle':
                this.drawCircle(size);
                break;
            case 'pentagram':
                this.drawPentagram(size, progress);
                break;
            case 'hexagon':
                this.drawHexagon(size);
                break;
            case 'triangleGrid':
                this.drawTriangleGrid(size, progress);
                break;
            case 'metatronsCube':
                this.drawMetatronsCube(size, progress);
                break;
            // Note: 'globe' case is handled specially in drawShapeWithBloom
        }
    }

    // Shape drawing methods
    drawCircle(size) {
        this.ctx.beginPath();
        this.ctx.arc(0, 0, size, 0, Math.PI * 2);
        this.ctx.stroke();

        // Inner circle for depth
        this.ctx.beginPath();
        this.ctx.arc(0, 0, size * 0.7, 0, Math.PI * 2);
        this.ctx.stroke();
    }

    drawPentagram(size, progress) {
        // Five-pointed star (occult symbol)
        const points = 5;
        const outerRadius = size;
        const innerRadius = size * 0.382; // Golden ratio

        this.ctx.beginPath();
        for (let i = 0; i < points * 2; i++) {
            const angle = (Math.PI * 2 * i) / (points * 2) - Math.PI / 2;
            const radius = i % 2 === 0 ? outerRadius : innerRadius;
            const x = Math.cos(angle) * radius;
            const y = Math.sin(angle) * radius;

            if (i === 0) {
                this.ctx.moveTo(x, y);
            } else {
                this.ctx.lineTo(x, y);
            }
        }
        this.ctx.closePath();
        this.ctx.stroke();

        // Inner circle
        this.ctx.beginPath();
        this.ctx.arc(0, 0, innerRadius, 0, Math.PI * 2);
        this.ctx.stroke();
    }

    drawHexagon(size) {
        this.ctx.beginPath();
        for (let i = 0; i < 6; i++) {
            const angle = (Math.PI / 3) * i;
            const x = Math.cos(angle) * size;
            const y = Math.sin(angle) * size;
            if (i === 0) {
                this.ctx.moveTo(x, y);
            } else {
                this.ctx.lineTo(x, y);
            }
        }
        this.ctx.closePath();
        this.ctx.stroke();

        // Inner hexagon
        this.ctx.beginPath();
        for (let i = 0; i < 6; i++) {
            const angle = (Math.PI / 3) * i;
            const x = Math.cos(angle) * size * 0.6;
            const y = Math.sin(angle) * size * 0.6;
            if (i === 0) {
                this.ctx.moveTo(x, y);
            } else {
                this.ctx.lineTo(x, y);
            }
        }
        this.ctx.closePath();
        this.ctx.stroke();
    }

    drawTriangleGrid(size, progress) {
        // Sacred geometry: interlocking triangles (Star of David base)
        // Upward triangle
        this.ctx.beginPath();
        for (let i = 0; i < 3; i++) {
            const angle = (Math.PI * 2 / 3) * i - Math.PI / 2;
            const x = Math.cos(angle) * size;
            const y = Math.sin(angle) * size;
            if (i === 0) {
                this.ctx.moveTo(x, y);
            } else {
                this.ctx.lineTo(x, y);
            }
        }
        this.ctx.closePath();
        this.ctx.stroke();

        // Downward triangle (Star of David)
        this.ctx.beginPath();
        for (let i = 0; i < 3; i++) {
            const angle = (Math.PI * 2 / 3) * i + Math.PI / 2;
            const x = Math.cos(angle) * size;
            const y = Math.sin(angle) * size;
            if (i === 0) {
                this.ctx.moveTo(x, y);
            } else {
                this.ctx.lineTo(x, y);
            }
        }
        this.ctx.closePath();
        this.ctx.stroke();

        // Inner triangles with progressive reveal
        if (progress > 0.3) {
            const innerSize = size * 0.5;
            this.ctx.beginPath();
            for (let i = 0; i < 3; i++) {
                const angle = (Math.PI * 2 / 3) * i - Math.PI / 2;
                const x = Math.cos(angle) * innerSize;
                const y = Math.sin(angle) * innerSize;
                if (i === 0) {
                    this.ctx.moveTo(x, y);
                } else {
                    this.ctx.lineTo(x, y);
                }
            }
            this.ctx.closePath();
            this.ctx.stroke();
        }
    }

    drawMetatronsCube(size, progress) {
        // Sacred geometry: Metatron's Cube (13 circles + connecting lines)
        const positions = [
            { x: 0, y: 0 }, // Center
            // Inner hexagon
            { x: Math.cos(0) * size * 0.4, y: Math.sin(0) * size * 0.4 },
            { x: Math.cos(Math.PI / 3) * size * 0.4, y: Math.sin(Math.PI / 3) * size * 0.4 },
            { x: Math.cos(2 * Math.PI / 3) * size * 0.4, y: Math.sin(2 * Math.PI / 3) * size * 0.4 },
            { x: Math.cos(Math.PI) * size * 0.4, y: Math.sin(Math.PI) * size * 0.4 },
            { x: Math.cos(4 * Math.PI / 3) * size * 0.4, y: Math.sin(4 * Math.PI / 3) * size * 0.4 },
            { x: Math.cos(5 * Math.PI / 3) * size * 0.4, y: Math.sin(5 * Math.PI / 3) * size * 0.4 },
            // Outer hexagon
            { x: Math.cos(0) * size, y: Math.sin(0) * size },
            { x: Math.cos(Math.PI / 3) * size, y: Math.sin(Math.PI / 3) * size },
            { x: Math.cos(2 * Math.PI / 3) * size, y: Math.sin(2 * Math.PI / 3) * size },
            { x: Math.cos(Math.PI) * size, y: Math.sin(Math.PI) * size },
            { x: Math.cos(4 * Math.PI / 3) * size, y: Math.sin(4 * Math.PI / 3) * size },
            { x: Math.cos(5 * Math.PI / 3) * size, y: Math.sin(5 * Math.PI / 3) * size }
        ];

        // Draw connecting lines (progressively revealed)
        const maxLines = positions.length;
        const linesToDraw = Math.floor(maxLines * progress);

        for (let i = 0; i < linesToDraw; i++) {
            for (let j = i + 1; j < positions.length; j++) {
                this.ctx.beginPath();
                this.ctx.moveTo(positions[i].x, positions[i].y);
                this.ctx.lineTo(positions[j].x, positions[j].y);
                this.ctx.stroke();
            }
        }

        // Draw circles at each position
        positions.forEach((pos, i) => {
            if (i / positions.length < progress) {
                this.ctx.beginPath();
                this.ctx.arc(pos.x, pos.y, 10, 0, Math.PI * 2);
                this.ctx.stroke();
            }
        });
    }

    drawSphereWireframe(size, progress) {
        // Enhanced 3D sphere with more detail
        const latLines = 12;
        const lonLines = 16;

        // Latitude lines
        for (let i = 0; i < latLines; i++) {
            const lat = (i / latLines) * Math.PI;
            const radius = Math.sin(lat) * size;
            const yOffset = Math.cos(lat) * size - size / 2;

            this.ctx.beginPath();
            this.ctx.arc(0, yOffset, radius, 0, Math.PI * 2);
            this.ctx.stroke();
        }

        // Longitude lines with rotation
        for (let i = 0; i < lonLines; i++) {
            const angle = (i / lonLines) * Math.PI * 2;
            const rotation = angle + progress * Math.PI * 4; // Faster rotation

            this.ctx.save();
            this.ctx.rotate(rotation);
            this.ctx.beginPath();
            this.ctx.ellipse(0, 0, size * 0.3, size, 0, 0, Math.PI * 2);
            this.ctx.stroke();
            this.ctx.restore();
        }
    }

    // ═══════════════════════════════════════════════════════════════
    // NUCLEAR GLOBE SYSTEM - Apocalyptic finale
    // ═══════════════════════════════════════════════════════════════

    initNuclearStrikes(centerX, centerY) {
        // Define strike points across the globe (lat/lon coordinates)
        // All trigger together for parallel effect - maximum devastation
        const strikeTime = 0.65; // All strikes start at 65% progress (leaves 2.1s for 2s decode)

        this.nuclearStrikes = [
            { lat: 40.7,  lon: -74.0, name: 'New York', triggered: false, triggerTime: strikeTime, decodeProgress: 0, startTime: 0 },
            { lat: 51.5,  lon: -0.1,  name: 'London', triggered: false, triggerTime: strikeTime, decodeProgress: 0, startTime: 0 },
            { lat: 35.7,  lon: 139.7, name: 'Tokyo', triggered: false, triggerTime: strikeTime, decodeProgress: 0, startTime: 0 },
            { lat: 55.8,  lon: 37.6,  name: 'Moscow', triggered: false, triggerTime: strikeTime, decodeProgress: 0, startTime: 0 },
            { lat: -33.9, lon: 151.2, name: 'Sydney', triggered: false, triggerTime: strikeTime, decodeProgress: 0, startTime: 0 },
            { lat: 19.4,  lon: -99.1, name: 'Mexico City', triggered: false, triggerTime: strikeTime, decodeProgress: 0, startTime: 0 },
            { lat: -23.5, lon: -46.6, name: 'São Paulo', triggered: false, triggerTime: strikeTime, decodeProgress: 0, startTime: 0 },
            { lat: 30.0,  lon: 31.2,  name: 'Cairo', triggered: false, triggerTime: strikeTime, decodeProgress: 0, startTime: 0 },
            { lat: 1.3,   lon: 103.8, name: 'Singapore', triggered: false, triggerTime: strikeTime, decodeProgress: 0, startTime: 0 },
            { lat: 28.6,  lon: 77.2,  name: 'New Delhi', triggered: false, triggerTime: strikeTime, decodeProgress: 0, startTime: 0 }
        ];

        this.signalLostMarkers = []; // Red hexagons marking lost cities
        this.decodeDuration = 2000; // 2 seconds per decode animation
        this.phraseFlickerDuration = 1000; // 1 second of phrase flickering
        this.charDecodeDuration = 1000; // 1 second of character decode
        this.finalHoldDuration = 2000; // 2 seconds to hold final scene
        this.finalHoldStartTime = null; // When final hold started
        this.centerX = centerX;
        this.centerY = centerY;
    }

    drawGlobeWithStrikes(centerX, centerY, size, shapeProgress, globalProgress) {
        // Save context for transformations
        this.ctx.save();
        this.ctx.translate(centerX + this.screenShake.x, centerY + this.screenShake.y);

        const rotation = globalProgress * Math.PI * 2; // One full rotation

        // Draw spherical Earth with continents
        this.drawSphericalEarth(size, rotation, shapeProgress);

        // Update and trigger nuclear strikes based on progress
        this.updateNuclearStrikes(size, rotation, globalProgress);

        this.ctx.restore();

        // Draw signal lost markers (red hexagons) - drawn after restore so they stay fixed on globe
        this.drawSignalLostMarkers(size, rotation);

        // Draw corrupted decode text overlays - drawn last, on top of everything
        this.drawCorruptedDecodeText();
    }

    drawSphericalEarth(size, rotation, progress) {
        // Draw base sphere with gradient
        const gradient = this.ctx.createRadialGradient(0, 0, 0, 0, 0, size);
        gradient.addColorStop(0, `rgba(0, 100, 150, ${0.3 * progress})`);
        gradient.addColorStop(0.7, `rgba(0, 50, 100, ${0.2 * progress})`);
        gradient.addColorStop(1, `rgba(0, 0, 0, 0)`);

        this.ctx.fillStyle = gradient;
        this.ctx.beginPath();
        this.ctx.arc(0, 0, size, 0, Math.PI * 2);
        this.ctx.fill();

        // Draw cyan glow outline
        this.ctx.strokeStyle = `rgba(0, 255, 255, ${0.6 * progress})`;
        this.ctx.lineWidth = 3;
        this.ctx.shadowColor = 'rgba(0, 255, 255, 0.8)';
        this.ctx.shadowBlur = 20;
        this.ctx.beginPath();
        this.ctx.arc(0, 0, size, 0, Math.PI * 2);
        this.ctx.stroke();

        // Draw rotating grid lines for sphere effect
        this.ctx.shadowBlur = 0;
        this.drawGlobeGrid(size, rotation, progress);

        // Draw continents with proper spherical projection
        if (progress > 0.1) {
            this.drawSphericalContinents(size, rotation, progress);
        }
    }

    drawGlobeGrid(size, rotation, progress) {
        const opacity = 0.2 * progress;
        this.ctx.strokeStyle = `rgba(0, 255, 255, ${opacity})`;
        this.ctx.lineWidth = 1;

        // Latitude lines (horizontal circles)
        for (let lat = -75; lat <= 75; lat += 15) {
            const latRad = (lat * Math.PI) / 180;
            const radius = Math.abs(Math.cos(latRad) * size);
            const yOffset = Math.sin(latRad) * size;

            this.ctx.beginPath();
            this.ctx.arc(0, -yOffset, radius, 0, Math.PI * 2);
            this.ctx.stroke();
        }

        // Longitude lines (vertical ellipses) - rotate with globe
        for (let lon = 0; lon < 360; lon += 30) {
            const angle = (lon * Math.PI / 180) + rotation;
            const z = Math.sin(angle);

            // Only draw front-facing lines (z > 0 means facing viewer)
            if (z > 0) {
                this.ctx.save();
                // Draw meridian line as arc
                this.ctx.beginPath();
                this.ctx.ellipse(0, 0, size * Math.abs(z), size, 0, 0, Math.PI * 2);
                this.ctx.stroke();
                this.ctx.restore();
            }
        }
    }

    drawSphericalContinents(size, rotation, progress) {
        // Use a simpler approach: draw continent shapes that wrap around the sphere
        // using transformed canvas and clipping

        this.ctx.save();

        // Clip to sphere
        this.ctx.beginPath();
        this.ctx.arc(0, 0, size, 0, Math.PI * 2);
        this.ctx.clip();

        // Set continent style
        this.ctx.strokeStyle = `rgba(0, 255, 255, ${0.8 * progress})`;
        this.ctx.fillStyle = `rgba(0, 255, 255, ${0.15 * progress})`;
        this.ctx.lineWidth = 3;

        // Draw each continent with proper spherical mapping
        this.drawContinentMercator(size, rotation, progress);

        this.ctx.restore();
    }

    drawContinentMercator(size, rotation, progress) {
        // Draw continents using Mercator-like projection
        // This creates recognizable shapes that wrap around the sphere

        const drawWrappedPath = (coords) => {
            this.ctx.beginPath();
            let firstPoint = true;

            for (const coord of coords) {
                const { x, y, visible } = this.latLonToScreenSpherical(coord.lat, coord.lon, size, rotation);

                if (visible) {
                    if (firstPoint) {
                        this.ctx.moveTo(x, y);
                        firstPoint = false;
                    } else {
                        this.ctx.lineTo(x, y);
                    }
                }
            }

            this.ctx.closePath();
            this.ctx.fill();
            this.ctx.stroke();
        };

        // Simplified continent shapes for better visibility
        const continents = this.getSimplifiedContinents();

        for (const continent of continents) {
            drawWrappedPath(continent);
        }
    }

    latLonToScreenSpherical(lat, lon, radius, rotation) {
        // Improved spherical projection with proper visibility
        const latRad = (lat * Math.PI) / 180;
        const lonRad = ((lon + rotation * 57.2958) * Math.PI) / 180;

        // 3D sphere position
        const x = radius * Math.cos(latRad) * Math.cos(lonRad);
        const z = radius * Math.cos(latRad) * Math.sin(lonRad);
        const y = -radius * Math.sin(latRad); // Negative for correct orientation

        // Visibility check with proper threshold
        const visible = z > -radius * 0.1;

        return { x, y, visible, z };
    }

    getSimplifiedContinents() {
        // Return highly simplified continent shapes for clear visibility
        return [
            // North America
            [
                { lat: 70, lon: -100 }, { lat: 60, lon: -130 }, { lat: 45, lon: -125 },
                { lat: 30, lon: -115 }, { lat: 20, lon: -95 }, { lat: 25, lon: -80 },
                { lat: 40, lon: -75 }, { lat: 50, lon: -60 }, { lat: 65, lon: -70 }
            ],
            // Eurasia
            [
                { lat: 70, lon: 30 }, { lat: 70, lon: 140 }, { lat: 50, lon: 145 },
                { lat: 35, lon: 130 }, { lat: 20, lon: 110 }, { lat: 10, lon: 100 },
                { lat: 20, lon: 70 }, { lat: 35, lon: 50 }, { lat: 50, lon: 20 }, { lat: 65, lon: 20 }
            ],
            // Africa
            [
                { lat: 35, lon: 0 }, { lat: 30, lon: 35 }, { lat: 10, lon: 45 },
                { lat: -35, lon: 30 }, { lat: -30, lon: 20 }, { lat: 0, lon: 10 }, { lat: 15, lon: -10 }
            ],
            // South America
            [
                { lat: 10, lon: -75 }, { lat: -10, lon: -80 }, { lat: -35, lon: -70 },
                { lat: -55, lon: -65 }, { lat: -25, lon: -45 }, { lat: 0, lon: -50 }
            ],
            // Australia
            [
                { lat: -10, lon: 130 }, { lat: -25, lon: 145 }, { lat: -38, lon: 145 },
                { lat: -35, lon: 120 }, { lat: -15, lon: 125 }
            ]
        ];
    }


    updateNuclearStrikes(size, rotation, globalProgress) {
        const now = Date.now();

        // Check if any strikes should be triggered (all trigger simultaneously)
        for (const strike of this.nuclearStrikes) {
            if (!strike.triggered && globalProgress >= strike.triggerTime) {
                strike.triggered = true;
                strike.startTime = now;

                // Add permanent marker for this city
                this.signalLostMarkers.push({
                    lat: strike.lat,
                    lon: strike.lon,
                    name: strike.name
                });

                console.log(`📡 Signal lost: ${strike.name}`);
            }

            // Update decode progress for active strikes
            if (strike.triggered && strike.decodeProgress < 1.0) {
                const elapsed = now - strike.startTime;
                strike.decodeProgress = Math.min(elapsed / this.decodeDuration, 1.0);
            }
        }
    }

    drawSignalLostMarkers(size, rotation) {
        // Draw red hexagons at all lost city locations
        this.ctx.save();
        this.ctx.translate(this.centerX, this.centerY);

        for (const marker of this.signalLostMarkers) {
            const pos = this.latLonToScreenSpherical(marker.lat, marker.lon, size, rotation);
            if (!pos.visible) continue;

            // Draw red hexagon marker
            this.drawHexagonMarker(pos.x, pos.y, 12, '#ff00ff');
        }

        this.ctx.restore();
    }

    drawHexagonMarker(x, y, size, color) {
        this.ctx.save();
        this.ctx.translate(x, y);

        // Filled hexagon
        this.ctx.fillStyle = color;
        this.ctx.globalAlpha = 0.7;
        this.ctx.beginPath();
        for (let i = 0; i < 6; i++) {
            const angle = (Math.PI / 3) * i;
            const px = Math.cos(angle) * size;
            const py = Math.sin(angle) * size;
            if (i === 0) {
                this.ctx.moveTo(px, py);
            } else {
                this.ctx.lineTo(px, py);
            }
        }
        this.ctx.closePath();
        this.ctx.fill();

        // Hexagon outline with glow
        this.ctx.strokeStyle = color;
        this.ctx.lineWidth = 2;
        this.ctx.globalAlpha = 1.0;
        this.ctx.shadowColor = color;
        this.ctx.shadowBlur = 8;
        this.ctx.stroke();

        this.ctx.restore();
    }

    drawCorruptedDecodeText() {
        // Draw corrupted/decoding text for all active strikes
        this.ctx.save();
        this.ctx.font = 'bold 20px monospace'; // Larger, bold font for readability
        this.ctx.textAlign = 'left';
        this.ctx.textBaseline = 'top';

        let yOffset = 40; // Start below top of screen
        const xOffset = 40;
        const lineHeight = 30; // Increased line spacing

        for (const strike of this.nuclearStrikes) {
            if (!strike.triggered || strike.decodeProgress === 0) continue;

            // Generate corrupted text that decodes to "[City] SIGNAL LOST"
            const finalText = `[${strike.name.toUpperCase()}] SIGNAL LOST`;
            const displayText = this.generateCorruptedText(finalText, strike.decodeProgress);

            // Color shifts from corruption (magenta/purple) to final (red)
            const colorProgress = strike.decodeProgress;
            const r = Math.floor(139 + (255 - 139) * colorProgress); // purple → red
            const g = Math.floor(92 * (1 - colorProgress));           // purple → red
            const b = Math.floor(246 * (1 - colorProgress));          // purple → red

            this.ctx.fillStyle = `rgb(${r}, ${g}, ${b})`;
            this.ctx.shadowColor = this.ctx.fillStyle;
            this.ctx.shadowBlur = 10;
            this.ctx.fillText(displayText, xOffset, yOffset);

            yOffset += lineHeight;
        }

        this.ctx.restore();
    }

    generateCorruptedText(finalText, progress) {
        // Two-phase decode system (matching neural-deserializer.js pattern)
        // Phase 1 (0-50%): Rapid lewd phrase flickering
        // Phase 2 (50-100%): Character-by-character decode to final text

        const phrases = this.nsfw ? NSFW_PHRASES : SFW_PHRASES;

        if (progress < 0.5) {
            // Phase 1: Flicker through complete lewd phrases (100ms per change)
            const phraseIndex = Math.floor((progress * 10)) % phrases.length;
            return phrases[phraseIndex];
        } else {
            // Phase 2: Character-by-character decode
            const decodeProgress = (progress - 0.5) * 2; // 0-1 range for phase 2

            // Character sets for corruption
            const corruptChars = [...KATAKANA, ...HIRAGANA, '0', '1', '█', '▓', '░'];

            let result = '';
            for (let i = 0; i < finalText.length; i++) {
                const charProgress = Math.max(0, Math.min(1, decodeProgress - (i / finalText.length) * 0.3));

                if (charProgress > 0.8) {
                    // Fully revealed
                    result += finalText[i];
                } else if (charProgress > 0.4) {
                    // Flickering between corruption and real
                    if (Math.random() < charProgress) {
                        result += finalText[i];
                    } else {
                        result += corruptChars[Math.floor(Math.random() * corruptChars.length)];
                    }
                } else {
                    // Full corruption
                    result += corruptChars[Math.floor(Math.random() * corruptChars.length)];
                }
            }

            return result;
        }
    }

    // Corruption/glitch effect at shape transitions
    drawCorruptionEffect(centerX, centerY, size, progress) {
        const fragmentCount = 20;

        for (let i = 0; i < fragmentCount; i++) {
            const angle = (i / fragmentCount) * Math.PI * 2;
            const distance = size + Math.random() * 50;
            const x = centerX + Math.cos(angle) * distance;
            const y = centerY + Math.sin(angle) * distance;

            this.ctx.fillStyle = `rgba(255, 0, 255, ${0.3 * Math.random()})`;
            this.ctx.fillRect(x - 2, y - 2, 4, 4);
        }
    }

    // Color interpolation
    interpolateColor(color1, color2, factor) {
        const c1 = this.hexToRgb(color1);
        const c2 = this.hexToRgb(color2);

        const r = Math.round(c1.r + (c2.r - c1.r) * factor);
        const g = Math.round(c1.g + (c2.g - c1.g) * factor);
        const b = Math.round(c1.b + (c2.b - c1.b) * factor);

        return `rgb(${r}, ${g}, ${b})`;
    }

    hexToRgb(hex) {
        const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result ? {
            r: parseInt(result[1], 16),
            g: parseInt(result[2], 16),
            b: parseInt(result[3], 16)
        } : { r: 0, g: 255, b: 255 };
    }

    stop() {
        if (this.animationFrame) {
            cancelAnimationFrame(this.animationFrame);
            this.animationFrame = null;
        }
        this.cleanup();
        this.isPlaying = false;
    }

    cleanup() {
        if (this.animationFrame) {
            cancelAnimationFrame(this.animationFrame);
            this.animationFrame = null;
        }

        if (this.canvas) {
            this.canvas.remove();
            this.canvas = null;
            this.ctx = null;
        }

        this.particles = [];
        this.fragments = [];
        this.nuclearStrikes = [];
        this.signalLostMarkers = [];
        this.screenShake = { x: 0, y: 0 };
        this.finalHoldStartTime = null;

        // Clear abyssal cables
        if (this.cableSystem) {
            this.cableSystem.clear();
        }

        // v1.1: Cleanup building blocks
        if (this.progressBar) {
            this.progressBar.destroy();
            this.progressBar = null;
        }
        if (this.titleDecoder) {
            this.titleDecoder.destroy();
            this.titleDecoder = null;
        }

        this.crtEffects.cleanup();
    }
}
