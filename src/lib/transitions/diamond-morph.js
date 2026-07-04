// Diamond Morph Transition
// Combines RotatingDiamond + GridOverlay + ChromaticAberrationGlitch
// Use case: Mystical/magical events, gacha pulls, special unlocks

import {
    RotatingDiamond,
    GridOverlay,
    ChromaticAberrationGlitch
} from '../animation-blocks.js';

export class DiamondMorph {
    constructor(container) {
        this.container = container;
        this.blocks = [];
    }

    play(options, onComplete) {
        const duration = options.duration || 7000; // Increased from 5000 to 7000
        const nsfw = options.nsfw !== undefined ? options.nsfw : (options.lewdMode !== undefined ? (console.warn("lewdMode is deprecated; use nsfw"), options.lewdMode) : false);
        // Use corrupted theme colors: cyan (stable), purple (lewd/intimate)
        const color = nsfw ? '#8b5cf6' : '#d94f90';
        const holdTime = 2000; // Hold final state for 2 seconds

        console.log('[DiamondMorph] Starting transition');

        // Phase 1: Grid overlay appears (0-7000ms) - full duration
        const gridBlock = new GridOverlay(this.container, {
            gridSize: 50,
            color: color,
            opacity: 0.3,
            duration: duration,
            style: 'diagonal'
        });
        gridBlock.play();
        this.blocks.push(gridBlock);

        // Phase 2: Rotating diamond (500-4000ms) - overlaps with grid
        setTimeout(() => {
            const diamondBlock = new RotatingDiamond(this.container, {
                size: 100,
                color: color,
                position: 'center',
                rotationSpeed: 2,
                pulseEffect: true,
                duration: 3500
            });
            diamondBlock.play();
            this.blocks.push(diamondBlock);
        }, 500);

        // Phase 3: Chromatic glitch burst (3500-4500ms) + hold (4500-7000ms)
        setTimeout(() => {
            const glitchBlock = new ChromaticAberrationGlitch(this.container, {
                text: nsfw ? '✧' : '◈',
                duration: 1000,
                fontSize: '128px',
                splitDistance: 12,
                color: color
            });
            glitchBlock.play();
            this.blocks.push(glitchBlock);
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
        // Destroy all building blocks
        this.blocks.forEach(block => {
            if (block && block.destroy) {
                block.destroy();
            }
        });
        this.blocks = [];
    }
}
