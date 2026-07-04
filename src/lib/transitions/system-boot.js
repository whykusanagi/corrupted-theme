/**
 * SYSTEM BOOT TRANSITION
 * ======================
 * Full terminal boot sequence transition
 * Inspired by example3.mov terminal aesthetic
 *
 * Visual: ASCII border draws → System diagnostics scroll → Terminal prompt types
 * Duration: 4-6 seconds
 * Theme: Classic terminal (green/orange/cyan)
 * Best for: System initializations, major state changes, raid events
 */

import { CRTEffects } from '../crt-effects.js';
import { ASCIIBorder, SystemDiagnostic, TerminalPrompt } from '../animation-blocks.js';

export class SystemBoot {
    constructor(container) {
        this.container = container;
        this.canvas = null;
        this.ctx = null;
        this.crtEffects = new CRTEffects(container);
        this.isPlaying = false;

        // Building blocks
        this.asciiBorder = null;
        this.systemDiagnostic = null;
        this.terminalPrompt = null;
    }

    play(options = {}, callback) {
        if (this.isPlaying) {
            console.warn('[SystemBoot] Already playing');
            return;
        }

        this.isPlaying = true;
        const duration = options.duration || 5000;
        const customText = options.customText || null;
        this.nsfw = options.nsfw !== undefined ? options.nsfw : (options.lewdMode !== undefined ? (console.warn("lewdMode is deprecated; use nsfw"), options.lewdMode) : false);

        // Setup canvas for any additional effects
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
        console.log('[SystemBoot] Starting boot sequence');

        // 3-phase boot sequence
        const phase1Duration = duration * 0.3;  // 30% - Border draws
        const phase2Duration = duration * 0.5;  // 50% - Diagnostics scroll
        const phase3Duration = duration * 0.2;  // 20% - Terminal prompt

        try {
            // Phase 1: ASCII Border materializes
            this.asciiBorder = new ASCIIBorder(this.container, {
                duration: phase1Duration,
                color: '#d94f90',  // Magenta
                style: 'double',
                drawOrder: 'clockwise'
            });
            await this.asciiBorder.play();

            // Phase 2: System Diagnostics scroll (parallel with border remaining)
            const diagnosticOptions = {
                duration: phase2Duration,
                color: '#8b5cf6',  // Purple
                position: 'left',
                scrollSpeed: 1.0
            };

            // Only override default lines if customText provided
            if (customText) {
                diagnosticOptions.lines = [
                    '> SYSTEM BOOT INITIATED...',
                    '> LOADING NEURAL PROTOCOLS...',
                    '> ESTABLISHING MATRIX CONNECTION...',
                    `> ${customText}`,
                    '> CORRUPTION LEVEL: 89%',
                    '> ALL SYSTEMS OPERATIONAL'
                ];
            }

            this.systemDiagnostic = new SystemDiagnostic(this.container, diagnosticOptions);
            await this.systemDiagnostic.play();

            // Phase 3: Terminal prompt (optional, for dramatic effect)
            this.terminalPrompt = new TerminalPrompt(this.container, {
                duration: phase3Duration,
                commands: [
                    'system@abyss:~$ init --complete',
                    '> Boot sequence complete.',
                    '> System ready for operation.'
                ],
                color: '#d94f90',  // Magenta
                position: 'bottom-left',
                typingSpeed: 40
            });
            await this.terminalPrompt.play();

            console.log('[SystemBoot] Boot sequence complete');
            callback();

        } catch (error) {
            console.error('[SystemBoot] Error during sequence:', error);
            callback();
        }
    }

    stop() {
        console.log('[SystemBoot] Stopping');
        if (this.asciiBorder) this.asciiBorder.destroy();
        if (this.systemDiagnostic) this.systemDiagnostic.destroy();
        if (this.terminalPrompt) this.terminalPrompt.destroy();
        this.cleanup();
        this.isPlaying = false;
    }

    cleanup() {
        if (this.canvas) {
            this.canvas.remove();
            this.canvas = null;
            this.ctx = null;
        }

        if (this.asciiBorder) {
            this.asciiBorder.destroy();
            this.asciiBorder = null;
        }
        if (this.systemDiagnostic) {
            this.systemDiagnostic.destroy();
            this.systemDiagnostic = null;
        }
        if (this.terminalPrompt) {
            this.terminalPrompt.destroy();
            this.terminalPrompt = null;
        }

        this.crtEffects.cleanup();
    }
}
