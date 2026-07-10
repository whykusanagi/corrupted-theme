/**
 * Composite transitions barrel — 12 thin scene transitions composed from
 * animation-blocks building blocks. Added in 0.3.0.
 *
 * Shared contract: new X(container); x.play(options, onComplete); x.stop().
 * NSFW vocabulary opt-in via options.nsfw (default false).
 *
 * @module lib/transitions
 * @license MIT
 */
export { GlitchCascade } from './glitch-cascade.js';
export { RadialGlitch } from './radial-glitch.js';
export { GridCorruption } from './grid-corruption.js';
export { TerminalMatrix } from './terminal-matrix.js';
export { WaveDecode } from './wave-decode.js';
export { DiamondMorph } from './diamond-morph.js';
export { AffectionBurst } from './affection-burst.js';
export { CombatShatter } from './combat-shatter.js';
export { ParticleCascade } from './particle-cascade.js';
export { SystemBoot } from './system-boot.js';
export { DataTransfer } from './data-transfer.js';
export { DiagnosticScan } from './diagnostic-scan.js';
