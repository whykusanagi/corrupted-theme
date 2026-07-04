// Grid Corruption Transition
// Combines GridOverlay + RectangularWipe + CircularDotsIndicator
// Use case: System corruption, malware detection, security breach

import {
    GridOverlay,
    RectangularWipe,
    CircularDotsIndicator
} from '../animation-blocks.js';

export class GridCorruption {
    constructor(container) {
        this.container = container;
        this.blocks = [];
    }

    play(options, onComplete) {
        const duration = options.duration || 6500; // Increased from 4500 to 6500
        const nsfw = options.nsfw !== undefined ? options.nsfw : (options.lewdMode !== undefined ? (console.warn("lewdMode is deprecated; use nsfw"), options.lewdMode) : false);
        // Use corrupted theme colors: cyan (stable), purple (lewd)
        const color = nsfw ? '#8b5cf6' : '#8b5cf6';
        const holdTime = 2000; // Hold final state

        console.log('[GridCorruption] Starting transition');

        // Phase 1: Grid overlay (0-6500ms) - full duration
        const gridBlock = new GridOverlay(this.container, {
            gridSize: 40,
            color: color,
            opacity: 0.4,
            duration: duration,
            style: 'square',
            animate: true
        });
        gridBlock.play();
        this.blocks.push(gridBlock);

        // Phase 2: Circular dots indicator (500-3500ms)
        setTimeout(() => {
            const dotsBlock = new CircularDotsIndicator(this.container, {
                dotCount: 4,
                color: color,
                size: 16,
                spacing: 200,
                duration: 3000
            });
            dotsBlock.play();
            this.blocks.push(dotsBlock);
        }, 500);

        // Phase 3: Rectangular wipe (2000-4000ms)
        setTimeout(() => {
            const wipeBlock = new RectangularWipe(this.container, {
                duration: 2000,
                barCount: 12,
                color: color,
                direction: 'vertical',
                reverse: false
            });
            wipeBlock.play();
            this.blocks.push(wipeBlock);
        }, 2000);

        // Phase 4: Second wipe in opposite direction (3000-4500ms) + hold (4500-6500ms)
        setTimeout(() => {
            const wipeBlock2 = new RectangularWipe(this.container, {
                duration: 1500,
                barCount: 8,
                color: nsfw ? '#d94f90' : '#ff0000', // Magenta (high-energy) or red (critical)
                direction: 'horizontal',
                reverse: true
            });
            wipeBlock2.play();
            this.blocks.push(wipeBlock2);
        }, 3000);

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
