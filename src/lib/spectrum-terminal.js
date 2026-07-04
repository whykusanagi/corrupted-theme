// Spectrum Terminal Transition - ENHANCED WITH BUILDING BLOCKS
// Detailed retro terminal UI with corruption themes
// Features: Loading dialogs, sidebar menu, 3D waveform mesh, sequential reveals, abyssal cables
// Themes: PATCH 03 "Resistance is merely delay" + PATCH 05 "The Abyss answers to her"
// v1.1: Integrated modular building blocks (TerminalBoot, ScanlineSweep, TitleDecoder, ProgressBar)

import { CRTEffects } from './crt-effects.js';
import { AbyssalCableSystem } from './abyssal-cables.js';
import {
    getRandomHeader,
    getRandomLoadingMessage,
    getRandomMenuIt,
    getRandomStatus,
    TERMINAL_MENU_ITEMS,
    TERMINAL_STATUS
} from '../core/terminal-vocab.js';
import { TerminalBoot, ScanlineSweep, TitleDecoder, ProgressBar } from './animation-blocks.js';

export class SpectrumTerminal {
    constructor(container) {
        this.container = container;
        this.canvas = null;
        this.ctx = null;
        this.animationFrame = null;
        this.crtEffects = new CRTEffects(container);
        this.cableSystem = null; // Initialized in setupCanvas
        this.isPlaying = false;
        this.mesh = null;
        this.ui = {
            menuItems: [],
            statusItems: [],
            loadingMessage: '',
            scanLineY: 0
        };
        this.clock = {
            repairProgress: 0,
            visible: false
        };
        this.bootCables = [];
        this.hierarchyCables = [];
        // Building blocks (v1.1)
        this.terminalBoot = null;
        this.scanlineSweep = null;
        this.titleDecoder = null;
        this.progressBar = null;
    }

    play(options = {}, callback) {
        if (this.isPlaying) {
            console.warn('[SpectrumTerminal] Already playing');
            return;
        }

        this.isPlaying = true;
        const duration = options.duration || 8000;
        this.nsfw = options.nsfw !== undefined ? options.nsfw
            : (options.lewdMode !== undefined
                ? (console.warn('[SpectrumTerminal] lewdMode is deprecated; use nsfw'), options.lewdMode)
                : false);
        const headerText = options.headerText || getRandomHeader(this.nsfw);
        const customText = options.customText || null;

        // Re-initialize state (instance is cached by transition-manager)
        this.ui = {
            menuItems: [],
            statusItems: [],
            loadingMessage: '',
            scanLineY: 0
        };
        this.clock = {
            repairProgress: 0,
            visible: false
        };
        this.bootCables = [];
        this.hierarchyCables = [];

        this.setupCanvas();

        if (options.effects?.scanlines) {
            this.crtEffects.createScanlines();
        }

        // Initialize all components
        this.initializeUI();
        this.initializeMesh();

        this.animateSequence(duration, headerText, customText, () => {
            this.cleanup();
            this.isPlaying = false;
            if (callback) callback();
        });
    }

    setupCanvas() {
        this.canvas = document.createElement('canvas');
        this.canvas.className = 'transition-canvas crt-screen';
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

        // Initialize abyssal cable system
        this.cableSystem = new AbyssalCableSystem(this.ctx, this.canvas.width, this.canvas.height);
    }

    // Initialize UI elements with corruption vocab
    initializeUI() {
        // Sidebar menu (corrupted file names)
        this.ui.menuItems = [];
        for (let i = 0; i < Math.min(6, TERMINAL_MENU_ITEMS.length); i++) {
            this.ui.menuItems.push({
                text: TERMINAL_MENU_ITEMS[i],
                alpha: 0
            });
        }

        // Bottom status bar
        this.ui.statusItems = [];
        for (let i = 0; i < Math.min(3, TERMINAL_STATUS.length); i++) {
            this.ui.statusItems.push({
                text: TERMINAL_STATUS[i],
                alpha: 0
            });
        }

        // Loading message
        this.ui.loadingMessage = getRandomLoadingMessage(this.nsfw);
    }

    // Initialize enhanced 3D mesh (30x30 grid)
    initializeMesh() {
        const gridSize = 30;

        this.mesh = {
            gridSize: gridSize,
            vertices: [],
            time: 0
        };

        for (let x = 0; x < gridSize; x++) {
            for (let z = 0; z < gridSize; z++) {
                this.mesh.vertices.push({ x, z });
            }
        }
    }

    // PATCH 03+05: Create boot sequence cables (tree branching pattern)
    createBootSequenceCables(centerX, centerY, maxDepth = 3) {
        if (!this.cableSystem) return;

        this.bootCables = [];

        // Recursive branching function
        const branchRecursive = (startX, startY, angle, depth) => {
            if (depth > maxDepth) return;

            const length = 150 / (depth + 1);
            const endX = startX + Math.cos(angle) * length;
            const endY = startY + Math.sin(angle) * length;

            const cable = this.cableSystem.createCable(startX, startY, endX, endY, {
                thickness: 2 - (depth * 0.4),
                color: '#d94f90',
                glowColor: '#8b5cf6',
                alpha: 0.7 - (depth * 0.15),
                textFlow: true,
                nsfw: false, // Boot messages
                organicness: 0.1,
                textSpeed: 0.015,
                segmentCount: 30
            });

            this.bootCables.push(cable);

            // Branch left and right
            if (depth < maxDepth) {
                branchRecursive(endX, endY, angle - Math.PI/5, depth + 1);
                branchRecursive(endX, endY, angle + Math.PI/5, depth + 1);
            }
        };

        // Start with 4 cardinal directions
        const angles = [0, Math.PI/2, Math.PI, Math.PI*1.5];
        angles.forEach(angle => {
            branchRecursive(centerX, centerY, angle, 0);
        });
    }

    // PATCH 05: Create command hierarchy cables (crown convergence)
    createCommandHierarchy(headerY, sidebarX) {
        if (!this.cableSystem) return;

        this.hierarchyCables = [];
        const centerX = this.canvas.width / 2;

        // Crown cables from screen corners to header (authority converges)
        const crownPoints = [
            { x: 0, y: 0 },
            { x: this.canvas.width, y: 0 },
            { x: 0, y: this.canvas.height },
            { x: this.canvas.width, y: this.canvas.height }
        ];

        crownPoints.forEach(point => {
            const cable = this.cableSystem.createCable(point.x, point.y, centerX, headerY, {
                thickness: 2.5,
                color: '#8b5cf6',
                glowColor: '#d94f90',
                alpha: 0.6,
                textFlow: true,
                nsfw: false, // Authority phrases
                organicness: 0.2,
                textSpeed: 0.01
            });
            this.hierarchyCables.push(cable);
        });

        // Subordinate cables from header to sidebar items (will be created in animation)
    }

    // PATCH 03: Render fractured clock (inevitability symbol)
    drawFracturedClock(centerX, centerY, repairProgress) {
        const radius = 70;
        const segments = 12;

        this.ctx.save();

        for (let i = 0; i < segments; i++) {
            const angle = (i / segments) * Math.PI * 2 - Math.PI / 2; // Start at top

            // Calculate fragment offset (broken when progress=0, whole when progress=1)
            const offsetDistance = (1 - repairProgress) * 40;
            const offsetX = Math.cos(angle) * offsetDistance;
            const offsetY = Math.sin(angle) * offsetDistance;

            // Draw tick marks
            const x1 = centerX + offsetX + Math.cos(angle) * radius * 0.8;
            const y1 = centerY + offsetY + Math.sin(angle) * radius * 0.8;
            const x2 = centerX + offsetX + Math.cos(angle) * radius;
            const y2 = centerY + offsetY + Math.sin(angle) * radius;

            // Thicker marks at 12, 3, 6, 9
            const isMainTick = i % 3 === 0;
            this.ctx.strokeStyle = '#d94f90';
            this.ctx.globalAlpha = 0.2 + (repairProgress * 0.5);
            this.ctx.lineWidth = isMainTick ? 3 : 2;
            this.ctx.shadowColor = '#d94f90';
            this.ctx.shadowBlur = 5 + (repairProgress * 10);

            this.ctx.beginPath();
            this.ctx.moveTo(x1, y1);
            this.ctx.lineTo(x2, y2);
            this.ctx.stroke();
        }

        // Draw center circle
        this.ctx.fillStyle = '#d94f90';
        this.ctx.globalAlpha = 0.3 + (repairProgress * 0.4);
        this.ctx.beginPath();
        this.ctx.arc(centerX, centerY, 5, 0, Math.PI * 2);
        this.ctx.fill();

        // Draw clock hands (appear as repair completes)
        if (repairProgress > 0.3) {
            const handAlpha = (repairProgress - 0.3) / 0.7;

            // Hour hand
            this.ctx.globalAlpha = handAlpha;
            this.ctx.lineWidth = 3;
            this.ctx.beginPath();
            this.ctx.moveTo(centerX, centerY);
            this.ctx.lineTo(centerX, centerY - radius * 0.5);
            this.ctx.stroke();

            // Minute hand
            this.ctx.beginPath();
            this.ctx.moveTo(centerX, centerY);
            this.ctx.lineTo(centerX + radius * 0.7, centerY);
            this.ctx.stroke();
        }

        this.ctx.restore();
    }

    // Enhanced 7-phase sequential animation with abyssal cables
    // NEW TIMELINE: Boot (0-10%), Neural Spread (10-25%), Border (25-35%),
    //               Header Authority (35-50%), Sidebar (50-65%), Mesh (65-80%),
    //               Dialog (80-90%), Pulse (90-100%)
    animateSequence(duration, headerText, customText, callback) {
        const startTime = Date.now();
        const centerX = this.canvas.width / 2;
        const centerY = this.canvas.height / 2;

        // Create boot cables at start
        this.createBootSequenceCables(centerX, centerY, 3);

        // v1.1: Initialize building blocks
        // ProgressBar (runs parallel to entire sequence)
        this.progressBar = new ProgressBar(this.container, {
            duration: duration,
            color: '#d94f90',
            height: 4,
            position: 'bottom',
            glitch: true
        });
        this.progressBar.play();

        // TerminalBoot (boot sequence text)
        this.terminalBoot = new TerminalBoot(this.container, {
            duration: duration * 0.15, // 15% of total (boot_init + neural_spread)
            lines: [
                '> ABYSS BOOT SEQUENCE INITIATED...',
                '> LOADING COMMAND PROTOCOLS...',
                '> ESTABLISHING HIERARCHY...',
                '> CORRUPTED TERMINAL ONLINE',
                '> RESISTANCE IS MERELY DELAY'
            ],
            color: '#d94f90',
            fontSize: '16px'
        });
        this.terminalBoot.play();

        // ScanlineSweep (CRT effect during early phases)
        this.scanlineSweep = new ScanlineSweep(this.container, {
            duration: duration * 0.35, // 35% of total (first 3 phases)
            direction: 'down',
            color: '#d94f90'
        });
        this.scanlineSweep.play();

        // Updated phases with new timeline
        const phases = [
            { name: 'boot_init', start: 0.0, end: 0.10 },           // Phase 0: Boot initialization
            { name: 'neural_spread', start: 0.10, end: 0.25 },      // Phase 1: Neural network spread
            { name: 'border_materialize', start: 0.25, end: 0.35 }, // Phase 2: Borders + clock repairs
            { name: 'header_authority', start: 0.35, end: 0.50 },   // Phase 3: Header + crown convergence
            { name: 'sidebar_hierarchy', start: 0.50, end: 0.65 },  // Phase 4: Sidebar + subordinate cables
            { name: 'mesh_infrastructure', start: 0.65, end: 0.80 }, // Phase 5: Mesh + wiring
            { name: 'dialog_connection', start: 0.80, end: 0.90 },  // Phase 6: Dialog + connections
            { name: 'final_pulse', start: 0.90, end: 1.0 }          // Phase 7: Unified pulse
        ];

        let commandHierarchyCreated = false;
        let titleDecoderStarted = false;

        const animate = () => {
            const elapsed = Date.now() - startTime;
            const progress = Math.min(elapsed / duration, 1.0);

            const currentPhase = phases.find(p => progress >= p.start && progress < p.end);
            if (!currentPhase) {
                callback();
                return;
            }

            const phaseProgress = (progress - currentPhase.start) / (currentPhase.end - currentPhase.start);

            // Clear with fade for trail effect
            this.ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
            this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

            // Update and render cables (background layer)
            if (this.cableSystem) {
                this.cableSystem.update(elapsed);

                // Fade cables based on phase
                let cableAlpha = 1.0;
                if (currentPhase.name === 'boot_init') {
                    cableAlpha = phaseProgress; // Fade in during boot
                } else if (progress > 0.35) {
                    cableAlpha = 0.6; // Dim after header authority establishes
                }

                this.cableSystem.render(cableAlpha);
            }

            // Render clock (phases 1-2: 10-35%, repairs during this time)
            if (progress >= 0.10 && progress < 0.35) {
                const clockProgress = (progress - 0.10) / 0.25; // 0-1 over 10-35%
                this.clock.repairProgress = clockProgress;
                this.clock.visible = true;
                this.drawFracturedClock(centerX, centerY + 150, clockProgress);
            } else if (progress >= 0.35) {
                this.clock.visible = false; // Clock disappears after repair (inevitability achieved)
            }

            // Create command hierarchy at header authority phase
            if (currentPhase.name === 'header_authority' && !commandHierarchyCreated) {
                const headerY = 80;
                this.createCommandHierarchy(headerY, 100);
                commandHierarchyCreated = true;
            }

            // v1.1: Start TitleDecoder during header_authority phase (35-50% of duration)
            if (currentPhase.name === 'header_authority' && !titleDecoderStarted && customText) {
                titleDecoderStarted = true;
                const decoderDuration = (phases[3].end - phases[3].start) * duration * 0.8; // 80% of header phase
                this.titleDecoder = new TitleDecoder(this.container, {
                    finalText: customText,
                    duration: decoderDuration,
                    nsfw: this.nsfw,
                    color: '#d94f90',
                    fontSize: '42px'
                });
                this.titleDecoder.play();
                console.log(`[SpectrumTerminal] Title decoder started: "${customText}"`);
            }

            // Render UI elements based on phase (existing + enhanced)
            switch (currentPhase.name) {
                case 'boot_init':
                    // Center glow + boot text
                    this.ctx.fillStyle = `rgba(217, 79, 144, ${phaseProgress})`;
                    this.ctx.shadowColor = '#d94f90';
                    this.ctx.shadowBlur = 30 * phaseProgress;
                    this.ctx.beginPath();
                    this.ctx.arc(centerX, centerY, 10, 0, Math.PI * 2);
                    this.ctx.fill();
                    this.ctx.shadowBlur = 0;

                    // Boot text
                    this.ctx.font = '16px "Courier New", monospace';
                    this.ctx.fillStyle = `rgba(217, 79, 144, ${phaseProgress * 0.8})`;
                    this.ctx.textAlign = 'center';
                    this.ctx.fillText('>> ABYSS BOOT SEQUENCE INITIATED', centerX, centerY + 40);
                    break;

                case 'neural_spread':
                    // Cables spreading (handled by cable system rendering above)
                    // Show status text
                    this.ctx.font = '14px "Courier New", monospace';
                    this.ctx.fillStyle = `rgba(217, 79, 144, ${phaseProgress})`;
                    this.ctx.textAlign = 'center';
                    this.ctx.fillText('LOADING COMMAND PROTOCOLS...', centerX, centerY - 100);
                    this.ctx.fillText('ESTABLISHING HIERARCHY...', centerX, centerY - 80);
                    break;

                case 'border_materialize':
                    this.renderBorder(phaseProgress);
                    break;

                case 'header_authority':
                    this.renderBorder(1.0);
                    this.renderHeaderTyping(headerText, phaseProgress);
                    break;

                case 'sidebar_hierarchy':
                    this.renderBorder(1.0);
                    this.renderHeaderTyping(headerText, 1.0);
                    this.renderSidebar(phaseProgress);
                    break;

                case 'mesh_infrastructure':
                    this.renderBorder(1.0);
                    this.renderHeaderTyping(headerText, 1.0);
                    this.renderSidebar(1.0);
                    this.renderMesh(phaseProgress, elapsed);
                    break;

                case 'dialog_connection':
                    this.renderBorder(1.0);
                    this.renderHeaderTyping(headerText, 1.0);
                    this.renderSidebar(1.0);
                    this.renderMesh(1.0, elapsed);
                    this.renderLoadingDialog(phaseProgress);
                    this.renderToolbar(phaseProgress);
                    break;

                case 'final_pulse':
                    this.renderBorder(1.0);
                    this.renderHeaderTyping(headerText, 1.0);
                    this.renderSidebar(1.0);
                    this.renderMesh(1.0, elapsed);
                    this.renderLoadingDialog(1.0);
                    this.renderToolbar(1.0);
                    this.renderFinalPulse(phaseProgress);
                    break;
            }

            this.animationFrame = requestAnimationFrame(animate);
        };

        animate();
    }

    // Phase 1: Horizontal scan line sweep
    renderScanLine(progress) {
        const y = this.canvas.height * progress;

        // Main scan line
        this.ctx.strokeStyle = '#d94f90';
        this.ctx.lineWidth = 3;
        this.ctx.shadowColor = '#d94f90';
        this.ctx.shadowBlur = 30;
        this.ctx.beginPath();
        this.ctx.moveTo(0, y);
        this.ctx.lineTo(this.canvas.width, y);
        this.ctx.stroke();
        this.ctx.shadowBlur = 0;
    }

    // Phase 2: Border fades in
    renderBorder(progress) {
        const alpha = progress;
        this.ctx.globalAlpha = alpha;

        // Main window border
        this.ctx.strokeStyle = '#d94f90';
        this.ctx.lineWidth = 4;
        this.ctx.shadowColor = '#d94f90';
        this.ctx.shadowBlur = 25;

        // Outer border
        this.ctx.strokeRect(20, 20, this.canvas.width - 40, this.canvas.height - 40);

        // Header border
        this.ctx.strokeRect(40, 40, this.canvas.width - 80, 100);

        this.ctx.shadowBlur = 0;
        this.ctx.globalAlpha = 1.0;
    }

    // Phase 3: Header types out
    renderHeaderTyping(text, progress) {
        const alpha = Math.min(progress * 2, 1.0);
        const charsVisible = Math.floor(text.length * progress);
        const visibleText = text.substring(0, charsVisible);

        this.ctx.globalAlpha = alpha;
        this.ctx.font = 'bold 48px monospace';
        this.ctx.fillStyle = '#d94f90';
        this.ctx.textAlign = 'center';
        this.ctx.shadowColor = '#d94f90';
        this.ctx.shadowBlur = 30;
        this.ctx.fillText(visibleText, this.canvas.width / 2, 100);

        // Cursor blink
        if (progress < 1.0 && Math.floor(progress * 20) % 2 === 0) {
            this.ctx.fillRect(this.canvas.width / 2 + (visibleText.length * 14), 70, 15, 40);
        }

        this.ctx.shadowBlur = 0;
        this.ctx.textAlign = 'left';
        this.ctx.globalAlpha = 1.0;
    }

    // Phase 4: Sidebar menu reveals
    renderSidebar(progress) {
        const sidebarX = 60;
        let y = 180;

        // Sidebar label
        this.ctx.font = 'bold 14px monospace';
        this.ctx.fillStyle = '#d94f90';
        this.ctx.globalAlpha = progress;
        this.ctx.fillText('/// CORRUPTED FILES ///', sidebarX, y);
        y += 30;

        // Menu items appear one by one
        this.ctx.font = '12px monospace';
        for (let i = 0; i < this.ui.menuItems.length; i++) {
            const itemProgress = Math.max(0, Math.min(1, (progress - i * 0.15) * 5));
            this.ui.menuItems[i].alpha = itemProgress;

            if (itemProgress > 0) {
                this.ctx.globalAlpha = itemProgress;
                this.ctx.fillStyle = '#8b5cf6';

                // Selection indicator
                if (i === 0) {
                    this.ctx.fillText('▶', sidebarX, y);
                }

                this.ctx.fillText(this.ui.menuItems[i].text, sidebarX + 20, y);
                y += 25;
            }
        }

        this.ctx.globalAlpha = 1.0;
    }

    // Phase 5: 3D wireframe mesh builds from left to right
    renderMesh(fadeProgress, elapsed) {
        const alpha = Math.min(fadeProgress * 2, 1.0);
        this.ctx.globalAlpha = alpha;

        const centerX = this.canvas.width / 2;
        const centerY = this.canvas.height / 2 + 150;
        const scale = 12;
        const perspective = 500;

        this.mesh.time = elapsed / 1000;

        // Draw only vertices that have "built" so far
        const buildProgress = fadeProgress;
        const maxX = Math.floor(this.mesh.gridSize * buildProgress);

        for (let x = 0; x < maxX; x++) {
            for (let z = 0; z < this.mesh.gridSize; z++) {
                const worldX = x - this.mesh.gridSize / 2;
                const worldZ = z - this.mesh.gridSize / 2;

                // Triple sine wave for smooth waveform
                const wave1 = Math.sin(worldX * 0.25 + this.mesh.time * 2) * 25;
                const wave2 = Math.sin(worldZ * 0.25 + this.mesh.time * 2.3) * 20;
                const wave3 = Math.sin((worldX + worldZ) * 0.15 + this.mesh.time * 2.7) * 18;
                const y = wave1 + wave2 + wave3;

                // 3D projection
                const zDepth = worldZ * scale + 250;
                const projX = (worldX * scale * perspective) / zDepth + centerX;
                const projY = (y * perspective) / zDepth + centerY;

                // Depth-based color (fades with distance)
                const depthFactor = Math.max(0, 1 - worldZ / this.mesh.gridSize);
                const brightness = Math.floor(0 + (136 * depthFactor)); // 0 to 136 (blue)
                this.ctx.fillStyle = `rgb(0, ${brightness}, 255)`;
                this.ctx.shadowColor = this.ctx.fillStyle;
                this.ctx.shadowBlur = 8;

                // Draw vertex point
                this.ctx.fillRect(projX - 1, projY - 1, 3, 3);

                // Draw lines to adjacent vertices
                if (x > 0) {
                    const prevWorldX = (x - 1) - this.mesh.gridSize / 2;
                    const prevWave1 = Math.sin(prevWorldX * 0.25 + this.mesh.time * 2) * 25;
                    const prevWave2 = Math.sin(worldZ * 0.25 + this.mesh.time * 2.3) * 20;
                    const prevWave3 = Math.sin((prevWorldX + worldZ) * 0.15 + this.mesh.time * 2.7) * 18;
                    const prevY = prevWave1 + prevWave2 + prevWave3;

                    const prevProjX = (prevWorldX * scale * perspective) / zDepth + centerX;
                    const prevProjY = (prevY * perspective) / zDepth + centerY;

                    this.ctx.strokeStyle = this.ctx.fillStyle;
                    this.ctx.lineWidth = 1;
                    this.ctx.beginPath();
                    this.ctx.moveTo(prevProjX, prevProjY);
                    this.ctx.lineTo(projX, projY);
                    this.ctx.stroke();
                }
            }
        }

        this.ctx.shadowBlur = 0;
        this.ctx.globalAlpha = 1.0;
    }

    // Phase 6: Loading dialog popup (loading message)
    renderLoadingDialog(progress) {
        const alpha = Math.min(progress * 3, 1.0);
        this.ctx.globalAlpha = alpha;

        const dialogW = 600;
        const dialogH = 180;
        const dialogX = (this.canvas.width - dialogW) / 2;
        const dialogY = (this.canvas.height - dialogH) / 2;

        // Dialog background
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.9)';
        this.ctx.fillRect(dialogX, dialogY, dialogW, dialogH);

        // Dialog border with glow
        this.ctx.strokeStyle = '#d94f90';
        this.ctx.lineWidth = 3;
        this.ctx.shadowColor = '#d94f90';
        this.ctx.shadowBlur = 20;
        this.ctx.strokeRect(dialogX, dialogY, dialogW, dialogH);
        this.ctx.shadowBlur = 0;

        // Dialog header bar
        this.ctx.fillStyle = '#d94f90';
        this.ctx.fillRect(dialogX, dialogY, dialogW, 35);

        // Dialog title
        this.ctx.font = 'bold 16px monospace';
        this.ctx.fillStyle = '#000';
        this.ctx.fillText('/// INFORMATION ///', dialogX + 20, dialogY + 23);

        // Loading message (corruption palette)
        this.ctx.font = '14px monospace';
        this.ctx.fillStyle = '#8b5cf6';
        this.ctx.fillText(this.ui.loadingMessage, dialogX + 30, dialogY + 70);

        // Progress bar
        const barX = dialogX + 30;
        const barY = dialogY + 100;
        const barW = dialogW - 60;
        const barH = 25;

        this.ctx.strokeStyle = '#d94f90';
        this.ctx.lineWidth = 2;
        this.ctx.strokeRect(barX, barY, barW, barH);

        // Fill progress bar
        const fillW = barW * progress;
        this.ctx.fillStyle = '#d94f90';
        this.ctx.fillRect(barX, barY, fillW, barH);

        // Progress percentage
        this.ctx.font = 'bold 12px monospace';
        this.ctx.fillStyle = '#fff';
        this.ctx.textAlign = 'center';
        this.ctx.fillText(`${Math.floor(progress * 100)}%`, dialogX + dialogW / 2, barY + 18);
        this.ctx.textAlign = 'left';

        // OK button
        const buttonW = 100;
        const buttonH = 30;
        const buttonX = dialogX + (dialogW - buttonW) / 2;
        const buttonY = dialogY + dialogH - 45;

        this.ctx.strokeStyle = '#d94f90';
        this.ctx.lineWidth = 2;
        this.ctx.strokeRect(buttonX, buttonY, buttonW, buttonH);
        this.ctx.fillStyle = '#d94f90';
        this.ctx.font = 'bold 14px monospace';
        this.ctx.textAlign = 'center';
        this.ctx.fillText('OK', buttonX + buttonW / 2, buttonY + 20);
        this.ctx.textAlign = 'left';

        this.ctx.globalAlpha = 1.0;
    }

    // Phase 6 (concurrent): Bottom toolbar
    renderToolbar(progress) {
        const alpha = Math.min(progress * 2, 1.0);
        this.ctx.globalAlpha = alpha;

        const toolbarY = this.canvas.height - 60;
        const toolbarH = 40;

        // Toolbar background
        this.ctx.fillStyle = 'rgba(0, 136, 255, 0.1)';
        this.ctx.fillRect(40, toolbarY, this.canvas.width - 80, toolbarH);

        // Toolbar border
        this.ctx.strokeStyle = '#d94f90';
        this.ctx.lineWidth = 2;
        this.ctx.shadowColor = '#d94f90';
        this.ctx.shadowBlur = 15;
        this.ctx.strokeRect(40, toolbarY, this.canvas.width - 80, toolbarH);
        this.ctx.shadowBlur = 0;

        // Status items
        this.ctx.font = '12px monospace';
        let x = 60;
        for (let i = 0; i < this.ui.statusItems.length; i++) {
            const itemProgress = Math.max(0, Math.min(1, (progress - i * 0.2) * 4));

            if (itemProgress > 0) {
                this.ctx.fillStyle = i === 0 ? '#ff0088' : '#8b5cf6';
                this.ctx.fillText(this.ui.statusItems[i].text, x, toolbarY + 25);
                x += 300;
            }
        }

        this.ctx.globalAlpha = 1.0;
    }

    // Phase 7: Final pulse effect
    renderFinalPulse(progress) {
        // Radial pulse from center
        const centerX = this.canvas.width / 2;
        const centerY = this.canvas.height / 2;
        const radius = 800 * progress;

        const gradient = this.ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, radius);
        gradient.addColorStop(0, `rgba(0, 136, 255, ${0.3 * (1 - progress)})`);
        gradient.addColorStop(1, 'rgba(0, 136, 255, 0)');

        this.ctx.fillStyle = gradient;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    }

    stop() {
        if (this.animationFrame) {
            cancelAnimationFrame(this.animationFrame);
            this.animationFrame = null;
        }
        this.cleanup();
        this.isPlaying = false;
    }

    cleanup() {
        if (this.animationFrame) {
            cancelAnimationFrame(this.animationFrame);
            this.animationFrame = null;
        }

        if (this.canvas) {
            this.canvas.remove();
            this.canvas = null;
            this.ctx = null;
        }

        this.mesh = null;
        this.ui = null;
        this.bootCables = [];
        this.hierarchyCables = [];

        // Clear abyssal cables
        if (this.cableSystem) {
            this.cableSystem.clear();
        }

        // v1.1: Cleanup building blocks
        if (this.terminalBoot) {
            this.terminalBoot.destroy();
            this.terminalBoot = null;
        }
        if (this.scanlineSweep) {
            this.scanlineSweep.destroy();
            this.scanlineSweep = null;
        }
        if (this.titleDecoder) {
            this.titleDecoder.destroy();
            this.titleDecoder = null;
        }
        if (this.progressBar) {
            this.progressBar.destroy();
            this.progressBar = null;
        }

        this.crtEffects.cleanup();
    }
}
