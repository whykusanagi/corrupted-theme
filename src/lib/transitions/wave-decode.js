// Wave Decode Transition
// Combines WaveformOscilloscope + TypingTextReveal + CircularDotsIndicator
// Use case: Audio/streaming events, music triggers, voice-activated events

import {
    WaveformOscilloscope,
    TypingTextReveal,
    CircularDotsIndicator
} from '../animation-blocks.js';

export class WaveDecode {
    constructor(container) {
        this.container = container;
        this.blocks = [];
    }

    play(options, onComplete) {
        const duration = options.duration || 7500; // Increased from 5000 to 7500
        const nsfw = options.nsfw !== undefined ? options.nsfw : (options.lewdMode !== undefined ? (console.warn("lewdMode is deprecated; use nsfw"), options.lewdMode) : false);
        const text = options.text || 'AUDIO TRANSMISSION';
        // Use corrupted theme colors: magenta (primary), purple (lewd)
        const textColor = '#ffffff'; // White for readable text
        const waveColor = nsfw ? '#8b5cf6' : '#d94f90'; // Purple or magenta for waveform
        const textDisplayTime = 2000;
        const textHoldTime = 2500; // Hold text after completion

        console.log('[WaveDecode] Starting transition');

        // Phase 1: Circular dots indicator (0-7500ms) - full duration
        const dotsBlock = new CircularDotsIndicator(this.container, {
            dotCount: 3,
            color: waveColor,
            size: 12,
            spacing: 150,
            duration: duration
        });
        dotsBlock.play();
        this.blocks.push(dotsBlock);

        // Phase 2: Waveform oscilloscope (1000-4000ms) - magenta with black outline
        setTimeout(() => {
            const waveBlock = new WaveformOscilloscope(this.container, {
                width: window.innerWidth * 0.8,
                height: 150,
                color: waveColor,
                amplitude: 40,
                frequency: 2,
                speed: 3,
                duration: 3000
            });
            waveBlock.play();
            this.blocks.push(waveBlock);
        }, 1000);

        // Phase 3: Typing text reveal (3000-5000ms) + hold (5000-7500ms)
        setTimeout(() => {
            const typingBlock = new TypingTextReveal(this.container, {
                text: text,
                duration: textDisplayTime,
                color: textColor, // White for readable text
                fontSize: '42px',
                glitchIntensity: 0.2,
                useCorruption: true, // Enable corrupted typing effect
                nsfw: nsfw
            });
            typingBlock.play();
            this.blocks.push(typingBlock);
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
