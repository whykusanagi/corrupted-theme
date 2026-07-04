/**
 * PARTICLE CASCADE TRANSITION
 * ============================
 * Theme: Playful, social, gaming (wink, goon, booba, behemoth, tarot)
 * Style: Staggered grid particles, cascading effect
 * Duration: 3-4 seconds
 *
 * Composition: ParticleGrid + SpiralVortex + TitleDecoder
 */

import { TitleDecoder, ProgressBar } from '../animation-blocks.js';
import { ParticleGrid, SpiralVortex } from '../animation-blocks.js';
import { CRTEffects } from '../crt-effects.js';

export class ParticleCascade {
    constructor(container) {
        this.container = container;
        this.isPlaying = false;
        this.crtEffects = new CRTEffects(container);
        this.components = [];
    }

    play(options = {}, callback) {
        if (this.isPlaying) {
            console.warn('[ParticleCascade] Already playing');
            return;
        }

        this.isPlaying = true;
        const duration = options.duration || 3500;
        const customText = options.customText || '';
        const nsfw = options.nsfw !== undefined ? options.nsfw : (options.lewdMode !== undefined ? (console.warn("lewdMode is deprecated; use nsfw"), options.lewdMode) : false);

        this.animateSequence(duration, customText, nsfw, () => {
            this.cleanup();
            this.isPlaying = false;
            if (callback) callback();
        });
    }

    async animateSequence(duration, customText, nsfw, callback) {
        try {
            // Light scanlines
            this.crtEffects.createScanlines();

            // Color selection based on mode
            const primaryColor = nsfw ? '#8b5cf6' : '#d94f90'; // Purple (lewd) or magenta (non-lewd)
            const secondaryColor = nsfw ? '#d94f90' : '#8b5cf6'; // Magenta (lewd) or purple (non-lewd)

            const phaseA_Duration = duration * 0.4; // 40% - Particle grid
            const phaseB_Duration = duration * 0.3; // 30% - Spiral vortex
            const phaseC_Duration = duration * 0.3; // 30% - Title + progress

            // Phase A: Particle grid stagger from center
            const particleGrid = new ParticleGrid(this.container, {
                duration: phaseA_Duration,
                rows: 8,
                cols: 14,
                color: primaryColor,
                particleSize: 6,
                staggerFrom: 'center',
                animationType: 'scale'
            });

            this.components.push(particleGrid);
            await particleGrid.play();

            // Phase B: Spiral vortex overlay
            const spiral = new SpiralVortex(this.container, {
                duration: phaseB_Duration,
                particles: 40,
                color: secondaryColor,
                direction: 'inward'
            });

            this.components.push(spiral);
            await spiral.play();

            // Phase C: Title decode + progress bar (parallel)
            const titlePromise = customText ? (async () => {
                const titleDecoder = new TitleDecoder(this.container, {
                    finalText: customText,
                    duration: phaseC_Duration * 0.8,
                    color: primaryColor,
                    fontSize: '42px'
                });
                this.components.push(titleDecoder);
                await titleDecoder.play();
            })() : Promise.resolve();

            const progressBar = new ProgressBar(this.container, {
                duration: phaseC_Duration,
                color: primaryColor,
                height: 3,
                position: 'bottom',
                glitch: true
            });

            this.components.push(progressBar);

            await Promise.all([titlePromise, progressBar.play()]);

            callback();
        } catch (error) {
            console.error('[ParticleCascade] Animation error:', error);
            callback();
        }
    }

    stop() {
        this.isPlaying = false;
        this.cleanup();
    }

    cleanup() {
        this.components.forEach(component => {
            if (component && component.destroy) {
                component.destroy();
            }
        });
        this.components = [];
        this.crtEffects.cleanup();
    }
}
