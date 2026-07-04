/**
 * DATA TRANSFER TRANSITION
 * ========================
 * File/data transmission with loading bars
 * Inspired by example3.mov loading bar aesthetic
 *
 * Visual: Multiple loading bars fill → Data packets transmit → Complete message
 * Duration: 3-5 seconds
 * Theme: Multi-color loading (orange/cyan/purple/green)
 * Best for: Loading states, data processing, file operations
 */

import { CRTEffects } from '../crt-effects.js';
import { LoadingBarMulti, DataTransmission } from '../animation-blocks.js';
import { CircularProgress } from '../animation-blocks.js';

export class DataTransfer {
    constructor(container) {
        this.container = container;
        this.canvas = null;
        this.ctx = null;
        this.crtEffects = new CRTEffects(container);
        this.isPlaying = false;

        // Building blocks
        this.loadingBars = null;
        this.dataTransmission = null;
        this.circularProgress = null;
    }

    play(options = {}, callback) {
        if (this.isPlaying) {
            console.warn('[DataTransfer] Already playing');
            return;
        }

        this.isPlaying = true;
        const duration = options.duration || 4000;
        const customText = options.customText || null;
        this.nsfw = options.nsfw !== undefined ? options.nsfw : (options.lewdMode !== undefined ? (console.warn("lewdMode is deprecated; use nsfw"), options.lewdMode) : false);

        this.setupCanvas();

        if (options.effects?.scanlines) {
            this.crtEffects.createScanlines();
        }

        this.animateSequence(duration, customText, () => {
            this.cleanup();
            this.isPlaying = false;
            if (callback) callback();
        });
    }

    setupCanvas() {
        this.canvas = document.createElement('canvas');
        this.canvas.className = 'transition-canvas';
        this.canvas.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            z-index: 50;
            background: #000;
        `;

        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
        this.ctx = this.canvas.getContext('2d');
        this.container.appendChild(this.canvas);
    }

    async animateSequence(duration, customText, callback) {
        console.log('[DataTransfer] Starting data transfer');

        // 3-phase transfer sequence
        const phase1Duration = duration * 0.6;  // 60% - Loading bars
        const phase2Duration = duration * 0.3;  // 30% - Data transmission
        const phase3Duration = duration * 0.1;  // 10% - Complete indicator

        try {
            // Phase 1: Multiple loading bars fill (with circular progress)
            const loadingBarOptions = {
                duration: phase1Duration,
                width: 500,
                height: 24,
                position: 'center',
                showPercentage: true,
                glitchEffect: true
            };

            // Only override default bars if customText provided
            if (customText) {
                loadingBarOptions.bars = [
                    { label: customText.toUpperCase().substring(0, 20), speed: 1.0, color: '#d94f90' },
                    { label: 'DATA PROCESSING', speed: 0.9, color: '#8b5cf6' },
                    { label: 'VALIDATION', speed: 1.1, color: '#d94f90' }
                ];
            }

            // Start loading bars and circular progress in parallel
            this.loadingBars = new LoadingBarMulti(this.container, loadingBarOptions);

            this.circularProgress = new CircularProgress(this.container, {
                duration: phase1Duration,
                radius: 50,
                color: '#8b5cf6',
                glitchColor: '#d94f90',
                position: 'top-right',
                showPercentage: true,
                glitchIntensity: 0.2
            });

            // Run in parallel
            await Promise.all([
                this.loadingBars.play(),
                this.circularProgress.play()
            ]);

            // Phase 2: Data transmission packets
            this.dataTransmission = new DataTransmission(this.container, {
                duration: phase2Duration,
                color: '#d94f90',
                direction: 'horizontal',
                packetCount: 25,
                packetSize: 6,
                showDataRate: true
            });
            await this.dataTransmission.play();

            // Phase 3: Brief hold for "complete" state
            await new Promise(resolve => setTimeout(resolve, phase3Duration));

            console.log('[DataTransfer] Transfer complete');
            callback();

        } catch (error) {
            console.error('[DataTransfer] Error during sequence:', error);
            callback();
        }
    }

    stop() {
        console.log('[DataTransfer] Stopping');
        if (this.loadingBars) this.loadingBars.destroy();
        if (this.dataTransmission) this.dataTransmission.destroy();
        if (this.circularProgress) this.circularProgress.destroy();
        this.cleanup();
        this.isPlaying = false;
    }

    cleanup() {
        if (this.canvas) {
            this.canvas.remove();
            this.canvas = null;
            this.ctx = null;
        }

        if (this.loadingBars) {
            this.loadingBars.destroy();
            this.loadingBars = null;
        }
        if (this.dataTransmission) {
            this.dataTransmission.destroy();
            this.dataTransmission = null;
        }
        if (this.circularProgress) {
            this.circularProgress.destroy();
            this.circularProgress = null;
        }

        this.crtEffects.cleanup();
    }
}
