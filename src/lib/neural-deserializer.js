// Neural Deserializer Transition - ENHANCED
// Dense character spheres + pixelated glitch structures + corruption themes + abyssal cables
// Features: 3D character sphere, layered depth, dramatic corruption bursts, observation network
// Theme: observation — all who fall are seen

import { CRTEffects } from './crt-effects.js';
import { AbyssalCableSystem } from './abyssal-cables.js';
import { TitleDecoder } from './animation-blocks.js';
import {
    getRandomPhrase,
    getRandomCharacter,
    generateHex,
    getRandomCodeBlock,
    getRandomHeader,
    KATAKANA,
    HIRAGANA,
    BLOCK_CHARS
} from '../core/terminal-vocab.js';

export class NeuralDeserializer {
    constructor(container) {
        this.container = container;
        this.canvas = null;
        this.ctx = null;
        this.animationFrame = null;
        this.crtEffects = new CRTEffects(container);
        this.cableSystem = null; // Initialized in setupCanvas
        this.titleDecoder = null; // Title decoding effect (initialized during play)
        this.isPlaying = false;
        this.columns = [];
        this.codeBlocks = [];
        this.glitchStructures = [];
        this.sphereParticles = [];
        this.observationCables = [];
        this.sphereCables = [];
        this.ritualCircles = [];
    }

    play(options = {}, callback) {
        if (this.isPlaying) {
            console.warn('[NeuralDeserializer] Already playing');
            return;
        }

        this.isPlaying = true;
        const duration = options.duration || 8000;
        // Default is nsfw:false (opt in with nsfw:true)
        const nsfw = options.nsfw !== undefined ? options.nsfw
            : (options.lewdMode !== undefined
                ? (console.warn('[NeuralDeserializer] lewdMode is deprecated; use nsfw'), options.lewdMode)
                : false);
        const customText = options.customText || '';

        this.setupCanvas();

        if (options.effects?.scanlines) {
            this.crtEffects.createScanlines();
        }

        // Initialize all systems
        this.initializeColumns();
        this.initializeGlitchStructures();
        this.initializeCharacterSphere();

        this.nsfw = nsfw;
        this.animateSequence(duration, nsfw, customText, () => {
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

    // Initialize DENSE Matrix columns (2x more than before)
    initializeColumns() {
        const fontSize = 10; // Smaller font for density
        const columns = Math.floor(this.canvas.width / fontSize);

        this.columns = [];
        for (let i = 0; i < columns; i++) {
            this.columns.push({
                x: i * fontSize,
                y: Math.random() * this.canvas.height * -1, // Start above screen
                speed: 1 + Math.random() * 4,
                chars: [],
                layer: Math.random() < 0.5 ? 'background' : 'foreground' // Depth
            });
        }
    }

    // Initialize pixelated glitch structures
    initializeGlitchStructures() {
        this.glitchStructures = [];
        const count = 8;

        for (let i = 0; i < count; i++) {
            this.glitchStructures.push({
                x: Math.random() * this.canvas.width,
                y: Math.random() * this.canvas.height,
                width: 40 + Math.random() * 80,
                height: 40 + Math.random() * 80,
                rotation: Math.random() * Math.PI * 2,
                rotationSpeed: (Math.random() - 0.5) * 0.05,
                alpha: 0,
                blocks: this.generatePixelBlocks(20)
            });
        }
    }

    // Generate pixel blocks for glitch structures
    generatePixelBlocks(count) {
        const blocks = [];
        for (let i = 0; i < count; i++) {
            blocks.push({
                x: (Math.random() - 0.5) * 2,
                y: (Math.random() - 0.5) * 2,
                size: 4 + Math.random() * 8,
                char: Math.random() < 0.5 ?
                    BLOCK_CHARS[Math.floor(Math.random() * BLOCK_CHARS.length)] :
                    getRandomCharacter()
            });
        }
        return blocks;
    }

    // Initialize dense 3D character sphere (Ghost in the Shell style)
    initializeCharacterSphere() {
        this.sphereParticles = [];
        const radius = 150;
        const latitudes = 20;
        const longitudes = 30;

        for (let lat = 0; lat < latitudes; lat++) {
            for (let lon = 0; lon < longitudes; lon++) {
                const theta = (lat / latitudes) * Math.PI;
                const phi = (lon / longitudes) * Math.PI * 2;

                const x = radius * Math.sin(theta) * Math.cos(phi);
                const y = radius * Math.cos(theta);
                const z = radius * Math.sin(theta) * Math.sin(phi);

                this.sphereParticles.push({
                    x: x,
                    y: y,
                    z: z,
                    baseX: x,
                    baseY: y,
                    baseZ: z,
                    char: Math.random() < 0.7 ? getRandomCharacter() :
                          KATAKANA[Math.floor(Math.random() * KATAKANA.length)],
                    alpha: 0,
                    scale: 0.5 + Math.random() * 0.5
                });
            }
        }
    }

    // PATCH 02: Create observation cables converging from screen edges (witness protocol)
    createObservationCables(centerX, centerY, nsfw) {
        if (!this.cableSystem) return;

        this.observationCables = [];

        // Edge points for observation cables (scanning from all sides)
        const edgePoints = [
            // Top edge
            { x: centerX * 0.3, y: 0 }, { x: centerX, y: 0 }, { x: centerX * 1.7, y: 0 },
            // Bottom edge
            { x: centerX * 0.3, y: this.canvas.height }, { x: centerX, y: this.canvas.height }, { x: centerX * 1.7, y: this.canvas.height },
            // Left edge
            { x: 0, y: centerY * 0.5 }, { x: 0, y: centerY }, { x: 0, y: centerY * 1.5 },
            // Right edge
            { x: this.canvas.width, y: centerY * 0.5 }, { x: this.canvas.width, y: centerY }, { x: this.canvas.width, y: centerY * 1.5 }
        ];

        edgePoints.forEach(point => {
            const cable = this.cableSystem.createCable(point.x, point.y, centerX, centerY, {
                thickness: 0.8,
                color: '#00ffff',
                glowColor: '#00ffff',
                alpha: 0.4,
                textFlow: true,
                nsfw: false, // Scan messages only
                organicness: 0.15,
                textSpeed: 0.025,
                segmentCount: 40
            });
            this.observationCables.push(cable);
        });
    }

    // PATCH 02: Create ritual circle rings (scan radii underlayer)
    createRitualCircles(centerX, centerY, nsfw) {
        if (!this.cableSystem) return;

        this.ritualCircles = [];
        const radii = [100, 180, 260, 340];
        const segmentCount = 48; // Segments per circle

        radii.forEach((radius, ringIndex) => {
            for (let i = 0; i < segmentCount; i++) {
                const angle1 = (i / segmentCount) * Math.PI * 2;
                const angle2 = ((i + 1) / segmentCount) * Math.PI * 2;

                const x1 = centerX + Math.cos(angle1) * radius;
                const y1 = centerY + Math.sin(angle1) * radius;
                const x2 = centerX + Math.cos(angle2) * radius;
                const y2 = centerY + Math.sin(angle2) * radius;

                const cable = this.cableSystem.createCable(x1, y1, x2, y2, {
                    thickness: 0.5,
                    color: '#00ffff',
                    glowColor: '#8b5cf6',
                    alpha: 0.15 - (ringIndex * 0.02),
                    textFlow: true,
                    nsfw: nsfw,
                    organicness: 0.05,
                    textSpeed: 0.008 * (ringIndex + 1), // Outer rings move faster
                    segmentCount: 20
                });
                this.ritualCircles.push(cable);
            }
        });
    }

    // PATCH 02: Connect sphere particles to Matrix rain columns (observation web)
    connectSphereToRain(centerX, centerY, nsfw) {
        if (!this.cableSystem) return;

        this.sphereCables = [];

        // Get visible sphere particles (front-facing)
        const visibleParticles = this.sphereParticles
            .filter(p => p.z > -50 && p.alpha > 0.5) // Only connect visible particles
            .slice(0, 30); // Limit to 30 connections

        // Get Matrix column positions
        const columnPositions = this.columns
            .filter((col, i) => i % 3 === 0) // Every 3rd column
            .slice(0, 30)
            .map(col => ({ x: col.x, y: col.chars[0]?.y || 0 }));

        // Connect sphere particles to columns
        visibleParticles.forEach((particle, i) => {
            if (i >= columnPositions.length) return;

            const targetCol = columnPositions[i];
            const particleX = centerX + particle.x;
            const particleY = centerY + particle.y;

            const cable = this.cableSystem.createCable(
                particleX, particleY,
                targetCol.x, targetCol.y,
                {
                    thickness: 1,
                    color: '#8b5cf6',
                    glowColor: '#d94f90',
                    alpha: 0.5,
                    textFlow: true,
                    nsfw: nsfw,
                    organicness: 0.3,
                    textSpeed: 0.02,
                    segmentCount: 35
                }
            );
            this.sphereCables.push(cable);
        });
    }

    // Enhanced animation sequence with multiple layers and abyssal cables
    animateSequence(duration, nsfw, customText, callback) {
        const startTime = Date.now();
        const centerX = this.canvas.width / 2;
        const centerY = this.canvas.height / 2;

        // Create cables at start (PATCH 02: observation network)
        this.createObservationCables(centerX, centerY, nsfw);
        this.createRitualCircles(centerX, centerY, nsfw);

        // Extended phases for more dramatic pacing
        const phases = [
            { name: 'matrix_rain_buildup', start: 0.0, end: 0.20 },
            { name: 'glitch_structures_form', start: 0.20, end: 0.35 },
            { name: 'character_sphere_assemble', start: 0.35, end: 0.55 },
            { name: 'corruption_burst', start: 0.55, end: 0.70 },
            { name: 'terminal_header', start: 0.70, end: 0.85 },
            { name: 'code_blocks_dissolve', start: 0.85, end: 1.0 }
        ];

        let lastPhraseTime = 0;
        let currentPhrase = '';
        let phraseAlpha = 0;
        let sphereRotation = 0;
        let screenShake = { x: 0, y: 0 };
        let sphereConnectionsCreated = false;
        let titleDecoderStarted = false;

        const animate = () => {
            const elapsed = Date.now() - startTime;
            const progress = Math.min(elapsed / duration, 1.0);

            const currentPhase = phases.find(p => progress >= p.start && progress < p.end);
            if (!currentPhase) {
                callback();
                return;
            }

            const phaseProgress = (progress - currentPhase.start) / (currentPhase.end - currentPhase.start);

            // Screen shake during corruption burst
            if (currentPhase.name === 'corruption_burst') {
                screenShake.x = (Math.random() - 0.5) * 10 * phaseProgress;
                screenShake.y = (Math.random() - 0.5) * 10 * phaseProgress;
            } else {
                screenShake.x *= 0.9;
                screenShake.y *= 0.9;
            }

            // Apply screen shake
            this.ctx.save();
            this.ctx.translate(screenShake.x, screenShake.y);

            // Draw layered background with fade
            this.ctx.fillStyle = 'rgba(0, 0, 0, 0.15)';
            this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

            // Update and render abyssal cables (background layer)
            if (this.cableSystem) {
                this.cableSystem.update(elapsed);

                // Fade cables based on phase
                let cableAlpha = 1.0;
                if (currentPhase.name === 'matrix_rain_buildup') {
                    cableAlpha = progress * 5; // Fade in during buildup
                } else if (currentPhase.name === 'terminal_header' || currentPhase.name === 'code_blocks_dissolve') {
                    cableAlpha = 1.0 - phaseProgress * 0.5; // Fade out at end
                }

                this.cableSystem.render(Math.min(cableAlpha, 1.0));
            }

            // Create sphere connection cables when sphere assembles
            if (currentPhase.name === 'character_sphere_assemble' && phaseProgress > 0.5 && !sphereConnectionsCreated) {
                this.connectSphereToRain(centerX, centerY, nsfw);
                sphereConnectionsCreated = true;
            }

            // Start title decoder when entering terminal_header phase
            if (currentPhase.name === 'terminal_header' && !titleDecoderStarted && customText) {
                titleDecoderStarted = true;
                const decoderDuration = (phases[4].end - phases[4].start) * duration * 0.8; // 80% of phase duration
                this.titleDecoder = new TitleDecoder(this.container, {
                    finalText: customText,
                    duration: decoderDuration,
                    nsfw: nsfw,
                    color: '#00ffff',
                    fontSize: '42px'
                });
                this.titleDecoder.play(); // Fire and forget - runs independently
            }

            // Render layers based on phase
            switch (currentPhase.name) {
                case 'matrix_rain_buildup':
                    this.renderLayeredMatrixRain(progress);
                    break;

                case 'glitch_structures_form':
                    this.renderLayeredMatrixRain(progress);
                    this.renderGlitchStructures(phaseProgress);
                    break;

                case 'character_sphere_assemble':
                    this.renderLayeredMatrixRain(progress * 0.5); // Fade out rain
                    this.renderGlitchStructures(1.0 - phaseProgress); // Fade out structures
                    this.renderCharacterSphere(phaseProgress, sphereRotation, centerX, centerY);
                    sphereRotation += 0.02;
                    break;

                case 'corruption_burst':
                    this.renderCharacterSphere(1.0, sphereRotation, centerX, centerY);
                    sphereRotation += 0.03;

                    // Rapid phrase flickering
                    if (elapsed - lastPhraseTime > 100) {
                        currentPhrase = getRandomPhrase(nsfw);
                        lastPhraseTime = elapsed;
                        phraseAlpha = 1.0;

                        // Flash frame
                        if (Math.random() < 0.2) {
                            this.ctx.fillStyle = `rgba(255, 0, 255, 0.3)`;
                            this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
                        }
                    }
                    phraseAlpha *= 0.9;
                    this.renderCorruptionPhrase(currentPhrase, phraseAlpha, phaseProgress);
                    break;

                case 'terminal_header':
                    this.renderCharacterSphere(1.0 - phaseProgress, sphereRotation, centerX, centerY);
                    sphereRotation += 0.02;
                    this.renderTerminalHeader(customText || getRandomHeader(nsfw), phaseProgress);
                    break;

                case 'code_blocks_dissolve':
                    this.renderCodeBlocks(elapsed, phaseProgress);
                    this.renderPixelExplosion(phaseProgress, centerX, centerY);
                    break;
            }

            // Apply chromatic aberration during dramatic moments
            if ((currentPhase.name === 'corruption_burst' || currentPhase.name === 'glitch_structures_form')
                && Math.random() < 0.15) {
                const intensity = 3 + Math.random() * 5;
                this.crtEffects.applyChromaticAberration(this.canvas, intensity);
            }

            this.ctx.restore();

            this.animationFrame = requestAnimationFrame(animate);
        };

        animate();
    }

    // Render Matrix rain with layered depth
    renderLayeredMatrixRain(intensity) {
        this.ctx.font = '10px monospace';

        for (let col of this.columns) {
            // Layer-based rendering
            const isBackground = col.layer === 'background';
            const layerAlpha = isBackground ? 0.4 : 1.0;

            // Add new character at top
            if (Math.random() < 0.15 * intensity) {
                col.chars.unshift({
                    char: getRandomCharacter(true),
                    y: col.y,
                    alpha: 1.0 * layerAlpha
                });
            }

            // Move column
            col.y += col.speed;
            if (col.y > this.canvas.height) {
                col.y = -100;
            }

            // Update and render characters
            for (let i = 0; i < col.chars.length; i++) {
                const char = col.chars[i];
                char.y += col.speed;
                char.alpha *= 0.95;

                // Color gradient: cyan → magenta
                const colorProgress = (char.y / this.canvas.height);
                const r = Math.floor(0 + (255 * colorProgress));
                const g = Math.floor(255 * (1 - colorProgress));
                const b = 255;

                const brightness = i === 0 ? 1.0 : 0.6;
                this.ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${char.alpha * brightness})`;

                // Add glow to head
                if (i === 0) {
                    this.ctx.shadowColor = `rgba(${r}, ${g}, ${b}, 0.8)`;
                    this.ctx.shadowBlur = 10;
                }

                this.ctx.fillText(char.char, col.x, char.y);
                this.ctx.shadowBlur = 0;

                if (char.y > this.canvas.height || char.alpha < 0.1) {
                    col.chars.splice(i, 1);
                    i--;
                }
            }
        }
    }

    // Render pixelated glitch structures
    renderGlitchStructures(intensity) {
        for (let struct of this.glitchStructures) {
            struct.alpha = intensity;
            struct.rotation += struct.rotationSpeed;

            this.ctx.save();
            this.ctx.translate(struct.x, struct.y);
            this.ctx.rotate(struct.rotation);
            this.ctx.globalAlpha = struct.alpha;

            // Draw pixel blocks
            for (let block of struct.blocks) {
                const x = block.x * struct.width;
                const y = block.y * struct.height;

                // Magenta glow
                this.ctx.fillStyle = '#d94f90';
                this.ctx.shadowColor = '#d94f90';
                this.ctx.shadowBlur = 15;
                this.ctx.font = `${block.size}px monospace`;
                this.ctx.fillText(block.char, x, y);
            }

            this.ctx.restore();
        }

        this.ctx.globalAlpha = 1.0;
        this.ctx.shadowBlur = 0;
    }

    // Render dense 3D character sphere (key feature!)
    renderCharacterSphere(intensity, rotation, centerX, centerY) {
        this.ctx.font = '8px monospace';

        // Sort particles by Z depth for proper 3D rendering
        const sorted = [...this.sphereParticles].sort((a, b) => a.z - b.z);

        for (let p of sorted) {
            // Rotate particle
            const rotatedX = p.baseX * Math.cos(rotation) - p.baseZ * Math.sin(rotation);
            const rotatedZ = p.baseX * Math.sin(rotation) + p.baseZ * Math.cos(rotation);

            // Project to 2D
            const scale = 300 / (300 + rotatedZ); // Perspective
            const x = centerX + rotatedX * scale;
            const y = centerY + p.baseY * scale;

            // Fade in based on intensity
            p.alpha = Math.min(1.0, intensity * 1.5);

            // Depth-based color (closer = brighter)
            const depthFactor = (rotatedZ + 150) / 300; // 0 to 1
            const r = Math.floor(0 + (139 * depthFactor)); // Cyan to purple
            const g = Math.floor(255 * (1 - depthFactor));
            const b = Math.floor(255 - (9 * (1 - depthFactor)));

            this.ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${p.alpha})`;
            this.ctx.shadowColor = this.ctx.fillStyle;
            this.ctx.shadowBlur = 8;

            const size = 6 * scale * p.scale;
            this.ctx.font = `${Math.max(6, size)}px monospace`;
            this.ctx.fillText(p.char, x, y);
        }

        this.ctx.shadowBlur = 0;
    }

    // Render corruption phrases with dramatic effect
    renderCorruptionPhrase(text, alpha, progress) {
        this.ctx.font = 'bold 42px monospace';
        this.ctx.fillStyle = '#8b5cf6';
        this.ctx.globalAlpha = alpha;
        this.ctx.textAlign = 'center';
        this.ctx.shadowColor = '#8b5cf6';
        this.ctx.shadowBlur = 40 * alpha;

        // Pulsing scale
        const scale = 1 + Math.sin(progress * Math.PI * 8) * 0.1;
        this.ctx.save();
        this.ctx.translate(this.canvas.width / 2, this.canvas.height / 2);
        this.ctx.scale(scale, scale);

        const lines = text.split('\n');
        lines.forEach((line, i) => {
            const y = (i - lines.length / 2) * 50;
            this.ctx.fillText(line, 0, y);
        });

        this.ctx.restore();
        this.ctx.globalAlpha = 1.0;
        this.ctx.shadowBlur = 0;
        this.ctx.textAlign = 'left';
    }

    // Render terminal header with the corruption theme
    renderTerminalHeader(headerText, progress) {
        const alpha = Math.min(1.0, progress * 2);

        // Draw border with glow
        this.ctx.strokeStyle = `rgba(0, 255, 255, ${alpha})`;
        this.ctx.lineWidth = 3;
        this.ctx.shadowColor = '#00ffff';
        this.ctx.shadowBlur = 20;
        this.ctx.strokeRect(50, 50, this.canvas.width - 100, 120);
        this.ctx.shadowBlur = 0;

        // Draw header text
        this.ctx.font = 'bold 40px monospace';
        this.ctx.fillStyle = `rgba(0, 255, 255, ${alpha})`;
        this.ctx.textAlign = 'center';
        this.ctx.shadowColor = '#00ffff';
        this.ctx.shadowBlur = 30;
        this.ctx.fillText(headerText, this.canvas.width / 2, 120);

        this.ctx.shadowBlur = 0;
        this.ctx.textAlign = 'left';
    }

    // Render terminal code blocks with terminal-vocab messages
    renderCodeBlocks(elapsed, phaseProgress) {
        // Add new code block
        if (this.codeBlocks.length < 8 && Math.random() < 0.08) {
            this.codeBlocks.push({
                text: getRandomCodeBlock(this.nsfw),
                x: 50 + Math.random() * (this.canvas.width - 400),
                y: 200 + Math.random() * (this.canvas.height - 300),
                alpha: 1.0,
                age: 0
            });
        }

        this.ctx.font = '16px monospace';

        for (let i = 0; i < this.codeBlocks.length; i++) {
            const block = this.codeBlocks[i];
            block.age += 16;
            block.alpha = Math.max(0, (1 - phaseProgress) * (1 - block.age / 2000));

            // Color based on content (corruption palette)
            let color = '#00ff00';
            if (block.text.includes('ERROR') || block.text.includes('CRITICAL')) {
                color = '#ff0000';
            } else if (block.text.includes('WARN')) {
                color = '#ffaa00';
            } else if (block.text.includes('💜') || block.text.includes('pleasure') || block.text.includes('lewd')) {
                color = '#8b5cf6'; // Purple for lewd content
            }

            this.ctx.fillStyle = color;
            this.ctx.globalAlpha = block.alpha;
            this.ctx.shadowColor = color;
            this.ctx.shadowBlur = 10;
            this.ctx.fillText(block.text, block.x, block.y);

            if (block.alpha <= 0) {
                this.codeBlocks.splice(i, 1);
                i--;
            }
        }

        this.ctx.globalAlpha = 1.0;
        this.ctx.shadowBlur = 0;
    }

    // Render pixel explosion effect at end
    renderPixelExplosion(progress, centerX, centerY) {
        const particles = 100;
        const radius = 300 * progress;

        this.ctx.fillStyle = '#d94f90';
        for (let i = 0; i < particles * progress; i++) {
            const angle = (i / particles) * Math.PI * 2;
            const distance = radius * (0.5 + Math.random() * 0.5);
            const x = centerX + Math.cos(angle) * distance;
            const y = centerY + Math.sin(angle) * distance;
            const size = 2 + Math.random() * 4;

            this.ctx.globalAlpha = 1 - progress;
            this.ctx.fillRect(x - size / 2, y - size / 2, size, size);
        }

        this.ctx.globalAlpha = 1.0;
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

        if (this.titleDecoder) {
            this.titleDecoder.destroy();
            this.titleDecoder = null;
        }

        this.columns = [];
        this.codeBlocks = [];
        this.glitchStructures = [];
        this.sphereParticles = [];
        this.observationCables = [];
        this.sphereCables = [];
        this.ritualCircles = [];

        // Clear abyssal cables
        if (this.cableSystem) {
            this.cableSystem.clear();
        }

        this.crtEffects.cleanup();
    }
}
