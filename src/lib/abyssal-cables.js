// Abyssal Cables - Tentacle/Cable System for Neural Corruption Transitions
// Implements occult-cyber theme: cables as extensions of reach, observation networks, command infrastructure
//
// Inspired by patch themes:
// - extensions of reach — cables that grasp
// - observation networks — cables watching the fallen
// - command infrastructure — cables carrying orders from the deep

import {
    NSFW_PHRASES,
    SFW_PHRASES,
    KATAKANA,
    HIRAGANA
} from '../core/terminal-vocab.js';

export class AbyssalCableSystem {
    constructor(ctx, width, height) {
        this.ctx = ctx;
        this.width = width;
        this.height = height;
        this.cables = [];
        this.textParticles = [];
    }

    // Create a cable between two points with organic curve
    createCable(startX, startY, endX, endY, options = {}) {
        const cable = {
            id: Math.random().toString(36),
            start: { x: startX, y: startY },
            end: { x: endX, y: endY },
            controlPoints: this.generateControlPoints(startX, startY, endX, endY, options),
            thickness: options.thickness || 2,
            color: options.color || '#00ffff',
            glowColor: options.glowColor || '#8b5cf6',
            alpha: options.alpha !== undefined ? options.alpha : 1.0,
            textFlow: options.textFlow !== undefined ? options.textFlow : true,
            nsfw: options.nsfw !== undefined ? options.nsfw : false,
            animationPhase: Math.random() * Math.PI * 2, // For pulsing
            textSpeed: options.textSpeed || 0.02, // How fast text moves along cable
            segmentCount: options.segmentCount || 50, // Bezier curve resolution
            organicness: options.organicness || 0.3 // How much the cable curves
        };

        // Pre-calculate curve points for text positioning
        cable.curvePoints = this.calculateBezierPoints(cable);

        // Initialize text particles on this cable
        if (cable.textFlow) {
            this.initializeTextParticles(cable);
        }

        this.cables.push(cable);
        return cable;
    }

    // Generate organic control points for Bezier curve
    generateControlPoints(startX, startY, endX, endY, options) {
        const midX = (startX + endX) / 2;
        const midY = (startY + endY) / 2;
        const distance = Math.sqrt(Math.pow(endX - startX, 2) + Math.pow(endY - startY, 2));

        // Perpendicular offset for organic curve
        const angle = Math.atan2(endY - startY, endX - startX);
        const perpAngle = angle + Math.PI / 2;

        const organicness = options.organicness || 0.3;
        const offset1 = distance * organicness * (Math.random() - 0.5);
        const offset2 = distance * organicness * (Math.random() - 0.5);

        return [
            {
                x: startX + Math.cos(angle) * distance * 0.25 + Math.cos(perpAngle) * offset1,
                y: startY + Math.sin(angle) * distance * 0.25 + Math.sin(perpAngle) * offset1
            },
            {
                x: endX - Math.cos(angle) * distance * 0.25 + Math.cos(perpAngle) * offset2,
                y: endY - Math.sin(angle) * distance * 0.25 + Math.sin(perpAngle) * offset2
            }
        ];
    }

    // Calculate points along Bezier curve
    calculateBezierPoints(cable) {
        const points = [];
        const segments = cable.segmentCount;

        for (let i = 0; i <= segments; i++) {
            const t = i / segments;
            const point = this.cubicBezier(
                cable.start,
                cable.controlPoints[0],
                cable.controlPoints[1],
                cable.end,
                t
            );
            points.push(point);
        }

        return points;
    }

    // Cubic Bezier curve calculation
    cubicBezier(p0, p1, p2, p3, t) {
        const u = 1 - t;
        const tt = t * t;
        const uu = u * u;
        const uuu = uu * u;
        const ttt = tt * t;

        return {
            x: uuu * p0.x + 3 * uu * t * p1.x + 3 * u * tt * p2.x + ttt * p3.x,
            y: uuu * p0.y + 3 * uu * t * p1.y + 3 * u * tt * p2.y + ttt * p3.y
        };
    }

    // Initialize text particles flowing along cable
    initializeTextParticles(cable) {
        const particleCount = Math.floor(cable.curvePoints.length / 10); // One particle every 10 segments

        for (let i = 0; i < particleCount; i++) {
            this.textParticles.push({
                cableId: cable.id,
                position: Math.random(), // 0-1 along curve
                text: this.getRandomCorruptionChar(cable.nsfw),
                size: 12 + Math.random() * 6,
                alpha: 0.5 + Math.random() * 0.5,
                color: cable.color,
                changeInterval: 50 + Math.random() * 100, // ms between char changes
                lastChange: Date.now()
            });
        }
    }

    // Get random corruption character
    getRandomCorruptionChar(nsfw) {
        const phrases = nsfw ? NSFW_PHRASES : SFW_PHRASES;
        const chars = [...KATAKANA, ...HIRAGANA, ...phrases.join('').split('')];
        return chars[Math.floor(Math.random() * chars.length)];
    }

    // Update cable animations (pulsing, text movement)
    update(deltaTime) {
        const now = Date.now();

        // Update text particles
        for (const particle of this.textParticles) {
            // Move along cable
            particle.position += this.getCableById(particle.cableId)?.textSpeed || 0.02;
            if (particle.position > 1) {
                particle.position = 0; // Loop back to start
            }

            // Change character periodically
            if (now - particle.lastChange > particle.changeInterval) {
                const cable = this.getCableById(particle.cableId);
                particle.text = this.getRandomCorruptionChar(cable?.nsfw || false);
                particle.lastChange = now;
            }
        }

        // Update cable animation phases (for pulsing glow)
        for (const cable of this.cables) {
            cable.animationPhase += 0.05;
        }
    }

    // Get cable by ID
    getCableById(id) {
        return this.cables.find(c => c.id === id);
    }

    // Render all cables and text particles
    render(progress = 1.0) {
        this.ctx.save();

        // Render cables first (background layer)
        for (const cable of this.cables) {
            this.renderCable(cable, progress);
        }

        // Render text particles on top
        for (const particle of this.textParticles) {
            this.renderTextParticle(particle, progress);
        }

        this.ctx.restore();
    }

    // Render individual cable with glow
    renderCable(cable, progress) {
        const alpha = cable.alpha * progress;
        if (alpha <= 0) return;

        const pulseFactor = 0.5 + 0.5 * Math.sin(cable.animationPhase);

        // Draw glow layers (outer to inner)
        for (let i = 3; i >= 0; i--) {
            const glowSize = cable.thickness + i * 4;
            const glowAlpha = alpha * 0.3 * (1 - i / 3) * pulseFactor;

            this.ctx.strokeStyle = cable.glowColor;
            this.ctx.globalAlpha = glowAlpha;
            this.ctx.lineWidth = glowSize;
            this.ctx.lineCap = 'round';
            this.ctx.lineJoin = 'round';

            this.drawCurvePath(cable);
            this.ctx.stroke();
        }

        // Draw main cable
        this.ctx.strokeStyle = cable.color;
        this.ctx.globalAlpha = alpha;
        this.ctx.lineWidth = cable.thickness;
        this.ctx.shadowColor = cable.color;
        this.ctx.shadowBlur = 10;

        this.drawCurvePath(cable);
        this.ctx.stroke();

        this.ctx.shadowBlur = 0;
    }

    // Draw Bezier curve path
    drawCurvePath(cable) {
        this.ctx.beginPath();
        this.ctx.moveTo(cable.start.x, cable.start.y);
        this.ctx.bezierCurveTo(
            cable.controlPoints[0].x, cable.controlPoints[0].y,
            cable.controlPoints[1].x, cable.controlPoints[1].y,
            cable.end.x, cable.end.y
        );
    }

    // Render text particle along cable
    renderTextParticle(particle, progress) {
        const cable = this.getCableById(particle.cableId);
        if (!cable) return;

        const alpha = particle.alpha * progress;
        if (alpha <= 0) return;

        // Get position on curve
        const index = Math.floor(particle.position * (cable.curvePoints.length - 1));
        const point = cable.curvePoints[index];
        if (!point) return;

        // Calculate tangent for text rotation
        const nextIndex = Math.min(index + 1, cable.curvePoints.length - 1);
        const nextPoint = cable.curvePoints[nextIndex];
        const angle = Math.atan2(nextPoint.y - point.y, nextPoint.x - point.x);

        this.ctx.save();
        this.ctx.translate(point.x, point.y);
        this.ctx.rotate(angle);

        // Draw text with glow
        this.ctx.font = `${particle.size}px "Courier New", monospace`;
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'middle';
        this.ctx.fillStyle = particle.color;
        this.ctx.globalAlpha = alpha;
        this.ctx.shadowColor = particle.color;
        this.ctx.shadowBlur = 5;

        this.ctx.fillText(particle.text, 0, 0);

        this.ctx.restore();
    }

    // Create cables connecting array of points (e.g., particle system)
    connectPoints(points, options = {}) {
        const connectionCount = options.connectionCount || Math.min(points.length, 10);
        const cables = [];

        for (let i = 0; i < connectionCount; i++) {
            const point1 = points[Math.floor(Math.random() * points.length)];
            const point2 = points[Math.floor(Math.random() * points.length)];

            if (point1 !== point2) {
                cables.push(this.createCable(
                    point1.x, point1.y,
                    point2.x, point2.y,
                    options
                ));
            }
        }

        return cables;
    }

    // Create radial cables emanating from center point (like tentacles)
    createRadialCables(centerX, centerY, count, radius, options = {}) {
        const cables = [];
        const angleStep = (Math.PI * 2) / count;

        for (let i = 0; i < count; i++) {
            const angle = i * angleStep + (Math.random() - 0.5) * 0.3;
            const distance = radius * (0.7 + Math.random() * 0.3);
            const endX = centerX + Math.cos(angle) * distance;
            const endY = centerY + Math.sin(angle) * distance;

            cables.push(this.createCable(
                centerX, centerY,
                endX, endY,
                {
                    ...options,
                    organicness: 0.4 + Math.random() * 0.3 // More organic tentacle movement
                }
            ));
        }

        return cables;
    }

    // Clear all cables and particles
    clear() {
        this.cables = [];
        this.textParticles = [];
    }

    // Remove specific cable
    removeCable(cableId) {
        this.cables = this.cables.filter(c => c.id !== cableId);
        this.textParticles = this.textParticles.filter(p => p.cableId !== cableId);
    }
}
