/**
 * Audio amplitude envelope — RMS → smoothing → clamped 0..1 target.
 *
 * Pure functions: no DOM, no Web Audio, no renderer. Given a time-domain
 * buffer they produce a stable 0..1 signal you can drive anything with — a
 * mouth-open weight, a glow radius, a scale, a corruption intensity. Mouth
 * movement is the canonical use and the reason for the naming, but nothing
 * here knows about mouths.
 *
 * Pairs with `AudioSpectrum`, whose `.levels` exposes the same shape of
 * signal from a real AnalyserNode.
 *
 * @example Drive a corruption intensity from an analyser
 *   import { rms, smoothRms, mouthTarget, approach } from
 *     '@whykusanagi/corrupted-theme/lipsync';
 *   let smoothed = 0, weight = 0;
 *   function frame(buffer) {
 *     smoothed = smoothRms(smoothed, rms(buffer));
 *     weight = approach(weight, mouthTarget(smoothed));
 *   }
 *
 * @module core/lipsync
 * @version 0.3.2
 * @author whykusanagi
 * @license MIT
 *
 * Algorithm derived from aituber-onair (MIT) —
 * https://github.com/shinshin86/aituber-onair
 * (templates/vrm/src/hooks/useAudioLipsync.ts)
 */

/** Tuned for TTS speech, which is quieter than music. */
export const LIPSYNC = Object.freeze({
  SMOOTH_FACTOR: 0.5, // exponential smoothing of raw RMS (0 = none, →1 = frozen)
  RMS_CEILING: 0.06,  // RMS amplitude treated as fully open
  INTERP: 0.35,       // per-frame approach toward the target
});

/**
 * Root-mean-square amplitude of a time-domain buffer.
 * @param {Float32Array|number[]} buffer
 * @returns {number} roughly 0..1
 */
export function rms(buffer) {
  if (!buffer || buffer.length === 0) return 0;
  let sumSq = 0;
  for (let i = 0; i < buffer.length; i++) sumSq += buffer[i] * buffer[i];
  return Math.sqrt(sumSq / buffer.length);
}

/**
 * Exponential moving average of the raw RMS.
 * @param {number} prevSmoothed
 * @param {number} rawRms
 * @param {number} [factor=0.5] - higher holds the previous value longer
 */
export function smoothRms(prevSmoothed, rawRms, factor = LIPSYNC.SMOOTH_FACTOR) {
  return prevSmoothed * factor + rawRms * (1 - factor);
}

/**
 * Map a smoothed RMS onto a clamped 0..1 target.
 * @param {number} smoothed
 * @param {number} [ceiling=0.06] - amplitude treated as fully open
 */
export function mouthTarget(smoothed, ceiling = LIPSYNC.RMS_CEILING) {
  if (ceiling <= 0) return 0;
  return Math.min(Math.max(smoothed / ceiling, 0), 1);
}

/**
 * One step of linear interpolation from `current` toward `target`.
 *
 * ponytail: fixed step per call, so the approach rate follows frame rate
 * rather than wall-clock. That matches the upstream this came from and is
 * fine at a steady 60fps; if you need it frame-rate independent, scale
 * `step` by `dt / 16.7` at the call site.
 *
 * @param {number} current
 * @param {number} target
 * @param {number} [step=0.35]
 */
export function approach(current, target, step = LIPSYNC.INTERP) {
  return current + (target - current) * step;
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { LIPSYNC, rms, smoothRms, mouthTarget, approach };
}
