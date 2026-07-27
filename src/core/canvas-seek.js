/**
 * Frame-deterministic canvas rendering.
 *
 * `seekAnimations` (core/time-utils) frame-locks CSS animations. Canvas has no
 * equivalent, which is what blocks offline export: a canvas effect driven by
 * `Math.random()` renders differently every pass, so you cannot capture frame
 * 400 without replaying frames 0-399 and hoping.
 *
 * A frame clock fixes that. `rngFor(frame, key)` derives its randomness from
 * (seed, frame, key), so any frame renders byte-identically in isolation —
 * live playback and headless capture share one code path.
 *
 * Also provides the reveal → hold → dissolve envelope. The package's decode
 * primitives only run chaos → order and stop; `createDissolve` adds the tail
 * where settled glyphs re-corrupt and fade back out.
 *
 * @example Deterministic capture
 *   import { createFrameClock } from '@whykusanagi/corrupted-theme/canvas-seek';
 *   const clock = createFrameClock({ fps: 30, seed: 1234 });
 *   clock.seek(400);
 *   const rng = clock.rngAt('particles');   // same values every time
 *
 * @module core/canvas-seek
 * @version 0.3.2
 * @author whykusanagi
 * @license MIT
 *
 * @see docs/RENDER_TO_VIDEO.md — export recipe
 * @composes seekAnimations — the CSS-side equivalent in core/time-utils
 */

import { seededRandom } from './random-utils.js';

/** FNV-1a over the tuple, so nearby frames don't produce correlated streams. */
function hashFrame(seed, frame, key) {
  let h = 2166136261 ^ (seed >>> 0);
  const s = `${frame}:${key}`;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

/**
 * A seekable frame counter with per-frame deterministic randomness.
 *
 * @param {object} [options={}]
 * @param {number} [options.fps=30]
 * @param {number} [options.seed=0]
 * @returns {{
 *   fps:number, frame:number, time:number,
 *   seek:(frame:number)=>number, advance:(dtMs:number)=>number, reset:()=>void,
 *   rngAt:(key?:string)=>()=>number, rngFor:(frame:number,key?:string)=>()=>number,
 *   frameAt:(timeMs:number)=>number
 * }}
 */
export function createFrameClock(options = {}) {
  const fps = Number.isFinite(options.fps) && options.fps > 0 ? options.fps : 30;
  const seed = Number.isFinite(options.seed) ? options.seed >>> 0 : 0;
  let frame = 0;
  // Elapsed milliseconds is the source of truth and the frame is derived from
  // it. Subtracting a float frame-length in a loop stalls on exact boundaries:
  // at 30fps, three steps of 1000/30 sum to 100.00000000000001, so 100ms of
  // input yields 2 frames instead of 3.
  let elapsed = 0;

  return {
    fps,
    get frame() { return frame; },
    /** Playback position in milliseconds. */
    get time() { return (frame * 1000) / fps; },

    /** Jump to a frame. Negative values clamp to 0. */
    seek(n) {
      frame = Math.max(0, Math.floor(Number.isFinite(n) ? n : 0));
      elapsed = (frame * 1000) / fps;
      return frame;
    },

    /** Advance by wall-clock milliseconds. Sub-frame remainder is never lost. */
    advance(dtMs) {
      if (!Number.isFinite(dtMs) || dtMs <= 0) return frame;
      elapsed += dtMs;
      frame = Math.floor((elapsed * fps) / 1000);
      return frame;
    },

    reset() { frame = 0; elapsed = 0; },

    /** Frame index for a playback time, without moving the clock. */
    frameAt(timeMs) {
      return Math.max(0, Math.floor(((Number.isFinite(timeMs) ? timeMs : 0) * fps) / 1000));
    },

    /** Deterministic PRNG for the current frame. */
    rngAt(key = '') { return seededRandom(hashFrame(seed, frame, key)); },

    /** Deterministic PRNG for any frame — no need to seek there first. */
    rngFor(n, key = '') {
      return seededRandom(hashFrame(seed, Math.max(0, Math.floor(n) || 0), key));
    },
  };
}

/**
 * Reveal → hold → dissolve envelope.
 *
 * Chaos → order → back to chaos. `revealed` rises 0→1 as text decodes, holds
 * at 1, then falls 1→0 as settled glyphs re-corrupt and fade out. Feed
 * `revealed` to a decode primitive as its progress and the whole arc follows.
 *
 * @param {object} [options={}]
 * @param {number} [options.revealMs=800]
 * @param {number} [options.holdMs=1200]
 * @param {number} [options.dissolveMs=800]
 * @returns {{total:number, at:(tMs:number)=>{phase:'reveal'|'hold'|'dissolve'|'gone', progress:number, revealed:number}}}
 *   `at(tMs)` reports the envelope at an elapsed time. `phase` is one of
 *   `reveal`, `hold`, `dissolve`, `gone`. `progress` is 0..1 WITHIN the current
 *   phase. `revealed` is 0..1 across the whole envelope and is the value you
 *   drive a decode with: it rises 0→1 during reveal, stays 1 through hold,
 *   falls 1→0 during dissolve, and is 0 once gone. Multiply it by a string
 *   length to get how many characters should currently be readable.
 */
export function createDissolve(options = {}) {
  const revealMs = Math.max(0, options.revealMs ?? 800);
  const holdMs = Math.max(0, options.holdMs ?? 1200);
  const dissolveMs = Math.max(0, options.dissolveMs ?? 800);
  const total = revealMs + holdMs + dissolveMs;

  return {
    total,
    /**
     * @param {number} tMs - elapsed milliseconds since the envelope started
     * @returns {{phase:'reveal'|'hold'|'dissolve'|'gone', progress:number, revealed:number}}
     */
    at(tMs) {
      const t = Number.isFinite(tMs) && tMs > 0 ? tMs : 0;
      if (t < revealMs) {
        const p = revealMs === 0 ? 1 : t / revealMs;
        return { phase: 'reveal', progress: p, revealed: p };
      }
      if (t < revealMs + holdMs) {
        const p = holdMs === 0 ? 1 : (t - revealMs) / holdMs;
        return { phase: 'hold', progress: p, revealed: 1 };
      }
      if (t < total) {
        const p = dissolveMs === 0 ? 1 : (t - revealMs - holdMs) / dissolveMs;
        return { phase: 'dissolve', progress: p, revealed: 1 - p };
      }
      return { phase: 'gone', progress: 1, revealed: 0 };
    },
  };
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { createFrameClock, createDissolve };
}
