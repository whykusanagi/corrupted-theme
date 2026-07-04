// Terminal Matrix Transition
// Combines TypingTextReveal + DataStream + CircularDotsIndicator
// Use case: Hacking events, Matrix-style effects, code compilation

import {
    TypingTextReveal,
    CircularDotsIndicator
} from '../animation-blocks.js';
import { DataStream } from '../animation-blocks.js';

export class TerminalMatrix {
    constructor(container) {
        this.container = container;
        this.blocks = [];
    }

    play(options, onComplete) {
        const duration = options.duration || 8500; // Increased from 6000 to 8500
        const nsfw = options.nsfw !== undefined ? options.nsfw : (options.lewdMode !== undefined ? (console.warn("lewdMode is deprecated; use nsfw"), options.lewdMode) : false);
        const text = options.text || 'ACCESS GRANTED';
        // Use corrupted theme colors: purple for corruption, magenta for stable
        const color = nsfw ? '#8b5cf6' : '#d94f90'; // Purple (lewd) or magenta (stable)
        const accentColor = '#d94f90'; // Magenta for high-energy accents
        const textDisplayTime = 2000;
        const textHoldTime = 2500; // Hold final text after completion

        console.log('[TerminalMatrix] Starting transition');

        // Phase 1: Data stream (0-8500ms) - full duration background
        const streamBlock = new DataStream(this.container, {
            streamCount: 20,
            color: color,
            speed: 3,
            duration: duration
        });
        streamBlock.play();
        this.blocks.push(streamBlock);

        // Phase 2: Circular dots indicator (1000-5000ms)
        setTimeout(() => {
            const dotsBlock = new CircularDotsIndicator(this.container, {
                dotCount: 3,
                color: color,
                size: 10,
                spacing: 120,
                duration: 4000
            });
            dotsBlock.play();
            this.blocks.push(dotsBlock);
        }, 1000);

        // Phase 3: First typing text (2000-3500ms)
        setTimeout(() => {
            const typing1 = new TypingTextReveal(this.container, {
                text: nsfw ? 'CORRUPTION PROTOCOL INITIATED...' : 'SYSTEM ACCESS...',
                duration: 1500,
                color: color,
                fontSize: '32px',
                glitchIntensity: 0.4,
                position: 'top',
                useCorruption: true, // Enable corrupted typing effect
                nsfw: nsfw
            });
            typing1.play();
            this.blocks.push(typing1);
        }, 2000);

        // Phase 4: Second typing text (4000-6000ms) + hold (6000-8500ms)
        setTimeout(() => {
            const typing2 = new TypingTextReveal(this.container, {
                text: text,
                duration: textDisplayTime,
                color: '#ffffff', // Cyan for stable decoded text
                fontSize: '52px',
                glitchIntensity: 0.2,
                position: 'center',
                useCorruption: true, // Enable corrupted typing effect
                nsfw: nsfw
            });
            typing2.play();
            this.blocks.push(typing2);
        }, 4000);

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
