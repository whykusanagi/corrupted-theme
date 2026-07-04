/**
 * AFFECTION BURST TRANSITION
 * ===========================
 * Theme: Love, hearts, affection (heart, kiss, licky triggers)
 * Style: Soft, pulsing, warm colors
 * Duration: 3-4 seconds (quick, frequent events)
 *
 * Composition: HeartPulse + WaveRipple + TitleDecoder
 */

import { TitleDecoder } from '../animation-blocks.js';
import { HeartPulse, WaveRipple } from '../animation-blocks.js';
import { CRTEffects } from '../crt-effects.js';

export class AffectionBurst {
    constructor(container) {
        this.container = container;
        this.isPlaying = false;
        this.crtEffects = new CRTEffects(container);
        this.components = [];
    }

    play(options = {}, callback) {
        if (this.isPlaying) {
            console.warn('[AffectionBurst] Already playing');
            return;
        }

        this.isPlaying = true;
        const duration = options.duration || 3500;
        const customText = options.customText || '';

        this.animateSequence(duration, customText, () => {
            this.cleanup();
            this.isPlaying = false;
            if (callback) callback();
        });
    }

    async animateSequence(duration, customText, callback) {
        try {
            // Soft scanlines
            this.crtEffects.createScanlines();

            const phaseA_Duration = duration * 0.4; // 40% - Heart pulse
            const phaseB_Duration = duration * 0.4; // 40% - Waves
            const phaseC_Duration = duration * 0.2; // 20% - Title

            // Phase A: Heart pulse with ripples (parallel)
            const heartPulse = new HeartPulse(this.container, {
                duration: phaseA_Duration,
                color: '#d94f90',
                size: 120,
                pulses: 2,
                particles: 16
            });

            const initialRipple = new WaveRipple(this.container, {
                duration: phaseA_Duration,
                waves: 3,
                color: '#d94f90',
                maxRadius: 400
            });

            this.components.push(heartPulse, initialRipple);

            await Promise.all([
                heartPulse.play(),
                initialRipple.play()
            ]);

            // Phase B: Secondary wave
            const secondRipple = new WaveRipple(this.container, {
                duration: phaseB_Duration,
                waves: 4,
                color: '#d94f90',
                maxRadius: 500
            });

            this.components.push(secondRipple);
            await secondRipple.play();

            // Phase C: Title decode
            if (customText) {
                const titleDecoder = new TitleDecoder(this.container, {
                    finalText: customText,
                    duration: phaseC_Duration,
                    color: '#d94f90',
                    fontSize: '36px'
                });

                this.components.push(titleDecoder);
                await titleDecoder.play();
            }

            callback();
        } catch (error) {
            console.error('[AffectionBurst] Animation error:', error);
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
