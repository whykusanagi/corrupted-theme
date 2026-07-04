// Glitch Cascade Transition
// Combines ChromaticAberrationGlitch + RectangularWipe + TypingTextReveal
// Use case: Aggressive/combat events, error states, system corruption

import {
    ChromaticAberrationGlitch,
    RectangularWipe,
    TypingTextReveal
} from '../animation-blocks.js';

export class GlitchCascade {
    constructor(container) {
        this.container = container;
        this.blocks = [];
    }

    play(options, onComplete) {
        const duration = options.duration || 6000; // Increased from 4000 to 6000
        const nsfw = options.nsfw !== undefined ? options.nsfw : (options.lewdMode !== undefined ? (console.warn("lewdMode is deprecated; use nsfw"), options.lewdMode) : false);
        const text = options.text || 'SYSTEM CORRUPTION DETECTED';
        const eventName = options.eventName || 'EVENT'; // Use event name from config
        const textDisplayTime = 1500; // Time to display text
        const textHoldTime = 2500;    // Hold time after text completes (CRITICAL)

        console.log('[GlitchCascade] Starting transition');

        // Phase 1: Chromatic aberration glitch (0-1000ms)
        const glitchBlock = new ChromaticAberrationGlitch(this.container, {
            text: nsfw ? 'CORRUPTION' : eventName, // Use event name instead of 'GLITCH'
            duration: 1000,
            fontSize: '72px',
            splitDistance: 8,
            color: '#ff0000' // Red for critical state
        });
        glitchBlock.play();
        this.blocks.push(glitchBlock);

        // Phase 2: Rectangular wipe (1000-2500ms)
        setTimeout(() => {
            const wipeBlock = new RectangularWipe(this.container, {
                duration: 1500,
                barCount: 8,
                color: '#ffffff', // Cyan for stable
                direction: 'horizontal',
                reverse: false
            });
            wipeBlock.play();
            this.blocks.push(wipeBlock);
        }, 1000);

        // Phase 3: Typing text reveal (2500-4000ms) + hold (4000-6500ms)
        setTimeout(() => {
            const typingBlock = new TypingTextReveal(this.container, {
                text: text,
                duration: textDisplayTime,
                color: '#ffffff', // Cyan for stable decoded text
                fontSize: '48px',
                glitchIntensity: 0.3,
                useCorruption: true, // Enable corrupted typing effect
                nsfw: nsfw
            });
            typingBlock.play();
            this.blocks.push(typingBlock);
        }, 2500);

        // Cleanup after full duration (text display + hold time)
        setTimeout(() => {
            this.cleanup();
            if (onComplete) onComplete();
        }, duration);
    }

    stop() {
        this.cleanup();
    }

    cleanup() {
        // Destroy all building blocks
        this.blocks.forEach(block => {
            if (block && block.destroy) {
                block.destroy();
            }
        });
        this.blocks = [];
    }
}
