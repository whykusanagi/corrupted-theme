/**
 * COMBAT SHATTER TRANSITION
 * ==========================
 * Theme: Combat, aggression, destruction (gun, backseating triggers)
 * Style: Aggressive, fragmented, red/sharp
 * Duration: 2-3 seconds (quick, impactful)
 *
 * Composition: ShatterGrid + GlitchPulse + TitleDecoder
 */

import { TitleDecoder, GlitchPulse } from '../animation-blocks.js';
import { ShatterGrid } from '../animation-blocks.js';
import { CRTEffects } from '../crt-effects.js';

export class CombatShatter {
    constructor(container) {
        this.container = container;
        this.isPlaying = false;
        this.crtEffects = new CRTEffects(container);
        this.components = [];
    }

    play(options = {}, callback) {
        if (this.isPlaying) {
            console.warn('[CombatShatter] Already playing');
            return;
        }

        this.isPlaying = true;
        const duration = options.duration || 2500;
        const customText = options.customText || '';

        this.animateSequence(duration, customText, () => {
            this.cleanup();
            this.isPlaying = false;
            if (callback) callback();
        });
    }

    async animateSequence(duration, customText, callback) {
        try {
            // Heavy scanlines and chromatic aberration
            this.crtEffects.createScanlines();

            const phaseA_Duration = duration * 0.2; // 20% - Initial glitch
            const phaseB_Duration = duration * 0.5; // 50% - Shatter
            const phaseC_Duration = duration * 0.3; // 30% - Title

            // Phase A: Glitch pulse intro
            const initialGlitch = new GlitchPulse(this.container, {
                duration: phaseA_Duration,
                intensity: 0.8,
                color: '#d94f90'
            });

            this.components.push(initialGlitch);
            await initialGlitch.play();

            // Phase B: Shatter grid explosion
            const shatter = new ShatterGrid(this.container, {
                duration: phaseB_Duration,
                gridSize: 12,
                color: '#d94f90',
                intensity: 1.5
            });

            this.components.push(shatter);
            await shatter.play();

            // Phase C: Title with aggressive style
            if (customText) {
                const titleDecoder = new TitleDecoder(this.container, {
                    finalText: customText,
                    duration: phaseC_Duration,
                    color: '#d94f90',
                    fontSize: '48px'
                });

                this.components.push(titleDecoder);
                await titleDecoder.play();
            }

            callback();
        } catch (error) {
            console.error('[CombatShatter] Animation error:', error);
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
