// Radial Glitch Transition
// Combines RotatingDiamond + ChromaticAberrationGlitch + RadialBurst
// Use case: Explosive events, dramatic reveals, boss defeats

import {
    RotatingDiamond,
    ChromaticAberrationGlitch
} from '../animation-blocks.js';
import { RadialBurst } from '../animation-blocks.js';

export class RadialGlitch {
    constructor(container) {
        this.container = container;
        this.blocks = [];
    }

    play(options, onComplete) {
        const duration = options.duration || 6000; // Increased from 4000 to 6000
        const nsfw = options.nsfw !== undefined ? options.nsfw : (options.lewdMode !== undefined ? (console.warn("lewdMode is deprecated; use nsfw"), options.lewdMode) : false);
        // Use corrupted theme colors: cyan (stable), purple (lewd)
        const color = nsfw ? '#8b5cf6' : '#d94f90';
        const holdTime = 2000; // Hold final state

        console.log('[RadialGlitch] Starting transition');

        // Phase 1: Radial burst (0-2000ms)
        const burstBlock = new RadialBurst(this.container, {
            particleCount: 24,
            color: color,
            speed: 5,
            duration: 2000
        });
        burstBlock.play();
        this.blocks.push(burstBlock);

        // Phase 2: Rotating diamond (500-3500ms) - overlaps with burst
        setTimeout(() => {
            const diamondBlock = new RotatingDiamond(this.container, {
                size: 80,
                color: color,
                position: 'center',
                rotationSpeed: 4,
                pulseEffect: true,
                duration: 3000
            });
            diamondBlock.play();
            this.blocks.push(diamondBlock);
        }, 500);

        // Phase 3: Chromatic glitch wave 1 (1500-2000ms)
        setTimeout(() => {
            const glitch1 = new ChromaticAberrationGlitch(this.container, {
                text: nsfw ? '⚠' : '✦',
                duration: 500,
                fontSize: '96px',
                splitDistance: 10,
                color: '#ff0000' // Red for critical state
            });
            glitch1.play();
            this.blocks.push(glitch1);
        }, 1500);

        // Phase 4: Second radial burst (2500-4000ms)
        setTimeout(() => {
            const burst2 = new RadialBurst(this.container, {
                particleCount: 32,
                color: nsfw ? '#d94f90' : '#d94f90', // Magenta (high-energy) or cyan
                speed: 6,
                duration: 1500
            });
            burst2.play();
            this.blocks.push(burst2);
        }, 2500);

        // Phase 5: Final chromatic glitch (3500-4000ms) + hold (4000-6000ms)
        setTimeout(() => {
            const glitch2 = new ChromaticAberrationGlitch(this.container, {
                text: nsfw ? '✧' : '❖',
                duration: 500,
                fontSize: '128px',
                splitDistance: 15,
                color: color
            });
            glitch2.play();
            this.blocks.push(glitch2);
        }, 3500);

        // Cleanup after full duration (animation + hold time)
        setTimeout(() => {
            this.cleanup();
            if (onComplete) onComplete();
        }, duration);
    }

    stop() {
        this.cleanup();
    }

    cleanup() {
        this.blocks.forEach(block => {
            if (block && block.destroy) {
                block.destroy();
            }
        });
        this.blocks = [];
    }
}
