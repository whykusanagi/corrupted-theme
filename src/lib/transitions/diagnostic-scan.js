/**
 * DIAGNOSTIC SCAN TRANSITION
 * ==========================
 * System scanning/analysis transition
 * Combines system diagnostics with data streams and scanning effects
 *
 * Visual: Data streams flow → Diagnostics scroll → Hexagon grid scan → Complete
 * Duration: 3-5 seconds
 * Theme: Analysis/scanning (cyan/green with purple corruption)
 * Best for: System checks, analysis operations, corruption detection
 */

import { CRTEffects } from '../crt-effects.js';
import { SystemDiagnostic, ASCIIBorder } from '../animation-blocks.js';
import { DataStream, HexagonGrid, CorruptionWave } from '../animation-blocks.js';

export class DiagnosticScan {
    constructor(container) {
        this.container = container;
        this.background = null;
        this.crtEffects = new CRTEffects(container);
        this.isPlaying = false;

        // Building blocks
        this.asciiBorder = null;
        this.dataStream = null;
        this.systemDiagnostic = null;
        this.hexagonGrid = null;
        this.corruptionWave = null;
    }

    play(options = {}, callback) {
        if (this.isPlaying) {
            console.warn('[DiagnosticScan] Already playing');
            return;
        }

        this.isPlaying = true;
        const duration = options.duration || 4500;
        const customText = options.customText || null;
        this.nsfw = options.nsfw !== undefined ? options.nsfw : (options.lewdMode !== undefined ? (console.warn("lewdMode is deprecated; use nsfw"), options.lewdMode) : false);

        this.setupBackground();

        if (options.effects?.scanlines) {
            this.crtEffects.createScanlines();
        }

        this.animateSequence(duration, customText, () => {
            this.cleanup();
            this.isPlaying = false;
            if (callback) callback();
        });
    }

    setupBackground() {
        this.background = document.createElement('div');
        this.background.className = 'transition-background';
        this.background.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            z-index: 50;
            background: #000;
            pointer-events: none;
        `;
        this.container.appendChild(this.background);
    }

    async animateSequence(duration, customText, callback) {
        console.log('[DiagnosticScan] Starting diagnostic scan');

        // 4-phase scan sequence
        const phase1Duration = duration * 0.20;  // 20% - Border + Data streams
        const phase2Duration = duration * 0.30;  // 30% - Diagnostics scroll
        const phase3Duration = duration * 0.35;  // 35% - Hexagon scan
        const phase4Duration = duration * 0.15;  // 15% - Corruption wave

        try {
            // Phase 1: ASCII Border + Background data streams (parallel)
            this.asciiBorder = new ASCIIBorder(this.container, {
                duration: phase1Duration,
                color: '#d94f90',
                style: 'single',
                drawOrder: 'simultaneous'
            });

            this.dataStream = new DataStream(this.container, {
                duration: phase1Duration,
                streamCount: 10,
                color: 'rgba(217, 79, 144, 0.3)',  // Subtle magenta background
                glitchColor: 'rgba(139, 92, 246, 0.3)',
                speed: 0.8
            });

            await Promise.all([
                this.asciiBorder.play(),
                this.dataStream.play()
            ]);

            // Phase 2: System Diagnostics (analysis messages)
            const diagnosticLines = customText ? [
                '> INITIATING DIAGNOSTIC SCAN...',
                '> ANALYZING NEURAL PATHWAYS...',
                '> CORRUPTION DETECTION ACTIVE...',
                `> ${customText}`,
                '> SCAN PROGRESS: 67%',
                '> ANOMALIES DETECTED: 3',
                '> STABILIZING SYSTEMS...'
            ] : [
                '> INITIATING DIAGNOSTIC SCAN...',
                '> ANALYZING NEURAL PATHWAYS...',
                '> CORRUPTION DETECTION ACTIVE...',
                '> MEMORY INTEGRITY: COMPROMISED',
                '> SCAN PROGRESS: 67%',
                '> ANOMALIES DETECTED: 3',
                '> STABILIZING SYSTEMS...'
            ];

            this.systemDiagnostic = new SystemDiagnostic(this.container, {
                duration: phase2Duration,
                lines: diagnosticLines,
                color: '#8b5cf6',
                position: 'left',
                scrollSpeed: 1.2
            });
            await this.systemDiagnostic.play();

            // Phase 3: Hexagon Grid scan (visual scanning effect)
            this.hexagonGrid = new HexagonGrid(this.container, {
                duration: phase3Duration,
                rows: 5,
                cols: 7,
                hexSize: 45,
                color: this.nsfw ? '#8b5cf6' : '#d94f90',
                staggerFrom: 'center',
                fillStyle: 'stroke'
            });
            await this.hexagonGrid.play();

            // Phase 4: Corruption wave (scan complete effect)
            this.corruptionWave = new CorruptionWave(this.container, {
                duration: phase4Duration,
                waveCount: 25,
                color: this.nsfw ? '#d94f90' : '#8b5cf6',
                direction: 'down',
                intensity: 1.5
            });
            await this.corruptionWave.play();

            console.log('[DiagnosticScan] Scan complete');
            callback();

        } catch (error) {
            console.error('[DiagnosticScan] Error during sequence:', error);
            callback();
        }
    }

    stop() {
        console.log('[DiagnosticScan] Stopping');
        if (this.asciiBorder) this.asciiBorder.destroy();
        if (this.dataStream) this.dataStream.destroy();
        if (this.systemDiagnostic) this.systemDiagnostic.destroy();
        if (this.hexagonGrid) this.hexagonGrid.destroy();
        if (this.corruptionWave) this.corruptionWave.destroy();
        this.cleanup();
        this.isPlaying = false;
    }

    cleanup() {
        if (this.background) {
            this.background.remove();
            this.background = null;
        }

        if (this.asciiBorder) {
            this.asciiBorder.destroy();
            this.asciiBorder = null;
        }
        if (this.dataStream) {
            this.dataStream.destroy();
            this.dataStream = null;
        }
        if (this.systemDiagnostic) {
            this.systemDiagnostic.destroy();
            this.systemDiagnostic = null;
        }
        if (this.hexagonGrid) {
            this.hexagonGrid.destroy();
            this.hexagonGrid = null;
        }
        if (this.corruptionWave) {
            this.corruptionWave.destroy();
            this.corruptionWave = null;
        }

        this.crtEffects.cleanup();
    }
}
