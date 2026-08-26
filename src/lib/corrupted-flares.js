/**
 * CorruptedFlares — geometric micro-VFX flares that decay on their own clock,
 * for compositing over video, artwork or a transparent overlay layer.
 *
 * 25 short flare loops — sparkles, rings, reticles, bursts — plus a 5×5
 * showcase board. Shapes work in the anime flare-light vocabulary; colour and
 * motion belong to the theme: cyan + red appear only as chromatic fringes,
 * and timing snaps and stutters instead of smoothing cleanly.
 *
 * Colour is a state signal, not decoration (Core Tenet 4). Each cell is
 * coloured by its OWN corruption age — violet at the corruption event,
 * magenta mid-decay, white once settled — so the board reads chaos → order
 * per cell rather than cycling hues on a shared clock. After `loops` cycles
 * cells hold a static white mark and the animation stops, which is the
 * readable endpoint Core Tenet 2 requires.
 *
 * ## Which API to use
 *
 * `CorruptedFlares.draw()` / `drawAt()` are the primary surface — single
 * flares composited onto a canvas you own, over video, artwork or a
 * transparent OBS layer. They paint no background and restore the context.
 * The `CorruptedFlares` class is the 5×5 board: a showcase format, and the
 * right choice only when you actually want a grid. Pass `plate: false` to
 * make that board transparent too.
 *
 * @example VFX pass over artwork — the common case
 *   import { CorruptedFlares } from '@whykusanagi/corrupted-theme/corrupted-flares';
 *   ctx.save();
 *   ctx.translate(x, y);
 *   CorruptedFlares.draw(ctx, 'glitchStar', 0.4, { size: 80 });
 *   ctx.restore();
 *
 * @example Frame-locked for offline capture
 *   import { createFrameClock } from '@whykusanagi/corrupted-theme/canvas-seek';
 *   const clock = createFrameClock({ fps: 30, seed: 42 });
 *   clock.seek(frameIdx);
 *   CorruptedFlares.drawAt(ctx, 'starBurst', clock, { size: 80, ramp: true });
 *
 * @example Transparent board for an overlay
 *   const flares = new CorruptedFlares(stage, { seed: 42, plate: false });
 *   flares.start();
 *   const png = await flares.toPNG({ scale: 2 });
 *
 * @module lib/corrupted-flares
 * @version 0.3.3
 * @author whykusanagi
 * @license MIT
 *
 * @see CORRUPTED_THEME_SPEC.md — Pattern 6: Ambient Mark Decay
 * @composes CorruptionCharsets — glyphFlash recipe
 * @composes createFrameClock — canvas-seek, for deterministic frame export
 */

import { CorruptionCharsets } from '../core/corruption-charsets.js';
import { seededRandom } from '../core/random-utils.js';

/* ── Palette ────────────────────────────────────────────────────────────── */

/**
 * Corruption-age ramp, shared with Pattern 4's reference implementation
 * (`GlitchStaggerGrid`). Colour encodes how far a cell is through its own
 * decay — violet at the corruption event, magenta mid-decay, white once
 * settled. It is NOT a decorative hue cycle: Core Tenet 4 makes colour a
 * state signal, so it must be driven by each cell's own clock.
 */
const RAMP = { wavefront: '#8b5cf6', mid: '#ff00ff', settled: '#ffffff' };
const FRINGE = '#00ffff';
const ALARM = '#ff0000';
const CELL_BG = '#0a0a0a';

/**
 * Where in its loop a settled cell is frozen. `pulse()` peaks at 0.5, so the
 * pulse-driven recipes hold their fully-formed shape rather than a fading one.
 */
const SETTLE_T = 0.5;

/* ── Easing / timing ────────────────────────────────────────────────────── */

function clamp01(t) {
  return t < 0 ? 0 : t > 1 ? 1 : t;
}

function easeOutCubic(t) {
  const u = 1 - clamp01(t);
  return 1 - u * u * u;
}

/** Spec glitchSnap feel — hard arrival with overshoot. */
function easeOutBack(t) {
  const c1 = 1.70158;
  const c3 = c1 + 1;
  const u = clamp01(t) - 1;
  return 1 + c3 * u * u * u + c1 * u * u;
}

function pulse(t) {
  return Math.sin(clamp01(t) * Math.PI);
}

/** Spec accessibility floor: no flicker frame may be shorter than this. */
const FLICKER_FLOOR_MS = 100;

/**
 * Quantized terminal motion — stutter instead of smooth fade.
 *
 * `steps` is an upper bound, not a promise. A fast `loopMs` (or a `speed`
 * above 1) would otherwise push a 12-step stutter to ~23ms per frame, well
 * under the spec's 100ms photosensitivity limit. The floor is enforced here
 * rather than left to whoever picks the options.
 *
 * @param {number} t - Loop progress 0..1
 * @param {number} [steps=8] - Desired quantization
 * @param {number} [loopMs=Infinity] - Effective duration of one loop
 */
function snap(t, steps = 8, loopMs = Infinity) {
  const safe = Math.max(1, Math.floor(loopMs / FLICKER_FLOOR_MS));
  const s = Math.min(steps, safe);
  return Math.floor(clamp01(t) * s) / s;
}

function lerp(a, b, t) {
  return a + (b - a) * t;
}

/**
 * Colour for a cell at loop position `t` — violet → magenta → white.
 * Chaos → order, once per loop, per cell.
 * @param {number} t - This cell's own loop progress, 0..1
 * @param {{wavefront: string, mid: string, settled: string}} ramp
 * @returns {string} hex colour
 */
function rampColor(t, ramp) {
  const u = clamp01(t);
  return u < 0.5
    ? mixHex(ramp.wavefront, ramp.mid, easeOutCubic(u / 0.5))
    : mixHex(ramp.mid, ramp.settled, easeOutCubic((u - 0.5) / 0.5));
}

/* ── Drawing primitives ─────────────────────────────────────────────────── */

function setStroke(ctx, color, width, alpha = 1) {
  ctx.globalAlpha = alpha;
  ctx.strokeStyle = color;
  ctx.lineWidth = width;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
}

function setFill(ctx, color, alpha = 1) {
  ctx.globalAlpha = alpha;
  ctx.fillStyle = color;
}

function glow(ctx, color, blur) {
  ctx.shadowColor = color;
  ctx.shadowBlur = blur;
}

function clearGlow(ctx) {
  ctx.shadowColor = 'transparent';
  ctx.shadowBlur = 0;
}

/** Four-point sparkle (concave diamond). */
function pathStar(ctx, r, inset = 0.38) {
  const pts = 4;
  ctx.beginPath();
  for (let i = 0; i < pts * 2; i++) {
    const a = (i / (pts * 2)) * Math.PI * 2 - Math.PI / 2;
    const rad = i % 2 === 0 ? r : r * inset;
    const x = Math.cos(a) * rad;
    const y = Math.sin(a) * rad;
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.closePath();
}

function strokeCircle(ctx, r) {
  ctx.beginPath();
  ctx.arc(0, 0, r, 0, Math.PI * 2);
  ctx.stroke();
}

function fillCircle(ctx, r) {
  ctx.beginPath();
  ctx.arc(0, 0, r, 0, Math.PI * 2);
  ctx.fill();
}

function strokeArc(ctx, r, a0, a1) {
  ctx.beginPath();
  ctx.arc(0, 0, r, a0, a1);
  ctx.stroke();
}

function dashedRing(ctx, r, dashes, rot) {
  const step = (Math.PI * 2) / dashes;
  ctx.save();
  ctx.rotate(rot);
  for (let i = 0; i < dashes; i++) {
    if (i % 2 === 0) strokeArc(ctx, r, i * step, i * step + step * 0.55);
  }
  ctx.restore();
}

function crosshair(ctx, r, arm = 0.35) {
  ctx.beginPath();
  ctx.moveTo(-r, 0); ctx.lineTo(-r * arm, 0);
  ctx.moveTo(r * arm, 0); ctx.lineTo(r, 0);
  ctx.moveTo(0, -r); ctx.lineTo(0, -r * arm);
  ctx.moveTo(0, r * arm); ctx.lineTo(0, r);
  ctx.stroke();
}

function drawX(ctx, r) {
  ctx.beginPath();
  ctx.moveTo(-r, -r); ctx.lineTo(r, r);
  ctx.moveTo(r, -r); ctx.lineTo(-r, r);
  ctx.stroke();
}

/**
 * Draw once in theme colour, then faint cyan/red offsets — chromatic
 * aberration without leaving the theme's accent rules.
 */
function withChromatic(ctx, color, intensity, draw) {
  if (intensity > 0.01) {
    ctx.save();
    ctx.translate(-intensity, intensity * 0.4);
    draw(ALARM, 0.35);
    ctx.restore();
    ctx.save();
    ctx.translate(intensity, -intensity * 0.4);
    draw(FRINGE, 0.35);
    ctx.restore();
  }
  draw(color, 1);
}

/* ── Recipes (25) ───────────────────────────────────────────────────────── */

/**
 * Each recipe draws at the origin; `r` is usable radius; `t` is loop 0..1.
 * @typedef {(ctx: CanvasRenderingContext2D, t: number, r: number, color: string, opts: object) => void} FlareRecipe
 */

/** @type {Record<string, FlareRecipe>} */
export const FLARE_RECIPES = {
  starBurst(ctx, t, r, color) {
    const s = easeOutBack(pulse(t));
    const a = pulse(t);
    withChromatic(ctx, color, 1.5 * a, (c, alpha) => {
      glow(ctx, c, 12 * a);
      setFill(ctx, c, alpha * a);
      pathStar(ctx, r * 0.55 * s);
      ctx.fill();
      clearGlow(ctx);
    });
  },

  ringPulse(ctx, t, r, color) {
    const s = easeOutCubic(t);
    const a = 1 - t;
    glow(ctx, color, 10 * a);
    setStroke(ctx, color, 2.5, a);
    strokeCircle(ctx, r * 0.15 + r * 0.7 * s);
    clearGlow(ctx);
    if (t < 0.35) {
      setFill(ctx, color, pulse(t / 0.35) * 0.9);
      fillCircle(ctx, r * 0.08);
    }
  },

  reticleSpin(ctx, t, r, color) {
    const a = 0.55 + 0.45 * pulse((t * 2) % 1);
    setStroke(ctx, color, 1.5, a);
    glow(ctx, color, 8);
    strokeCircle(ctx, r * 0.55);
    crosshair(ctx, r * 0.7, 0.4);
    dashedRing(ctx, r * 0.72, 16, t * Math.PI * 2);
    setFill(ctx, color, a);
    fillCircle(ctx, r * 0.06);
    clearGlow(ctx);
  },

  glitchStar(ctx, t, r, color, opts) {
    const st = snap(t, 10, opts.loopMs);
    const jitter = (st % 0.3) > 0.15 ? 1 : 0;
    const a = pulse(t);
    ctx.save();
    ctx.translate(jitter * 2.5, -jitter * 1.5);
    ctx.rotate(jitter * 0.12);
    withChromatic(ctx, color, 2.2 * jitter, (c, alpha) => {
      glow(ctx, c, 14 * a);
      setFill(ctx, c, alpha * a);
      pathStar(ctx, r * 0.5 * (0.7 + 0.3 * a), 0.28);
      ctx.fill();
      clearGlow(ctx);
    });
    ctx.restore();
  },

  dualRing(ctx, t, r, color) {
    const t2 = (t + 0.45) % 1;
    [[t, 1], [t2, 0.55]].forEach(([tt, mul]) => {
      const a = 1 - tt;
      setStroke(ctx, color, 2 * mul, a * mul);
      glow(ctx, color, 8 * a);
      strokeCircle(ctx, r * 0.1 + r * 0.75 * easeOutCubic(tt));
    });
    clearGlow(ctx);
  },

  xPop(ctx, t, r, color) {
    const s = easeOutBack(Math.min(1, t * 1.4));
    const a = t < 0.7 ? 1 : 1 - (t - 0.7) / 0.3;
    withChromatic(ctx, color, 1.8 * pulse(t), (c, alpha) => {
      glow(ctx, c, 10);
      setStroke(ctx, c, 3.5, alpha * a);
      ctx.save();
      ctx.scale(s, s);
      drawX(ctx, r * 0.38);
      ctx.restore();
      clearGlow(ctx);
    });
  },

  sparkCross(ctx, t, r, color) {
    const a = pulse(t);
    const len = r * 0.75 * easeOutCubic(a);
    glow(ctx, color, 12 * a);
    setStroke(ctx, color, lerp(3.5, 1, t), a);
    ctx.beginPath();
    ctx.moveTo(-len, 0); ctx.lineTo(len, 0);
    ctx.moveTo(0, -len); ctx.lineTo(0, len);
    ctx.stroke();
    setFill(ctx, '#ffffff', a * 0.85);
    fillCircle(ctx, r * 0.07 * a);
    clearGlow(ctx);
  },

  brokenArc(ctx, t, r, color, opts) {
    const drawn = snap(easeOutCubic(t), 12, opts.loopMs);
    const a = t < 0.75 ? 1 : 1 - (t - 0.75) / 0.25;
    const start = -Math.PI * 0.85;
    glow(ctx, color, 8);
    setStroke(ctx, color, 2.2, a);
    strokeArc(ctx, r * 0.55, start, start + drawn * Math.PI * 1.55);
    // Missing segment — corruption hole
    setStroke(ctx, color, 1, a * 0.25);
    strokeArc(ctx, r * 0.55, start + Math.PI * 1.55, start + Math.PI * 1.85);
    clearGlow(ctx);
  },

  diamondPulse(ctx, t, r, color) {
    const s = 0.35 + 0.65 * pulse(t);
    const a = 0.4 + 0.6 * pulse(t);
    glow(ctx, color, 10 * a);
    setFill(ctx, color, a);
    ctx.save();
    ctx.rotate(Math.PI / 4);
    ctx.beginPath();
    const d = r * 0.42 * s;
    ctx.rect(-d, -d, d * 2, d * 2);
    ctx.fill();
    ctx.restore();
    clearGlow(ctx);
  },

  orbitDots(ctx, t, r, color) {
    const n = 5;
    glow(ctx, color, 8);
    for (let i = 0; i < n; i++) {
      const a = t * Math.PI * 2 + (i / n) * Math.PI * 2;
      const rad = r * 0.45;
      setFill(ctx, color, 0.5 + 0.5 * Math.sin(t * Math.PI * 2 + i));
      ctx.beginPath();
      ctx.arc(Math.cos(a) * rad, Math.sin(a) * rad, r * 0.07, 0, Math.PI * 2);
      ctx.fill();
    }
    setStroke(ctx, color, 1, 0.35);
    strokeCircle(ctx, r * 0.45);
    clearGlow(ctx);
  },

  dashedRingSpin(ctx, t, r, color) {
    const a = 0.6 + 0.4 * pulse((t * 2) % 1);
    glow(ctx, color, 8);
    setStroke(ctx, color, 2, a);
    dashedRing(ctx, r * 0.55, 20, t * Math.PI * 2);
    setFill(ctx, color, a * 0.9);
    pathStar(ctx, r * 0.18);
    ctx.fill();
    clearGlow(ctx);
  },

  voidHole(ctx, t, r, color) {
    // Ring collapses to a black hole, then blooms
    const phase = t < 0.45 ? t / 0.45 : (t - 0.45) / 0.55;
    if (t < 0.45) {
      const s = 1 - easeOutCubic(phase);
      setStroke(ctx, color, 3, 1);
      glow(ctx, color, 10);
      strokeCircle(ctx, r * 0.15 + r * 0.55 * s);
      setFill(ctx, '#000000', 0.9);
      fillCircle(ctx, r * 0.12 * (1 - s * 0.5));
    } else {
      const a = 1 - phase;
      withChromatic(ctx, color, 2 * a, (c, alpha) => {
        glow(ctx, c, 14 * a);
        setFill(ctx, c, alpha * a);
        pathStar(ctx, r * 0.5 * easeOutBack(phase));
        ctx.fill();
        clearGlow(ctx);
      });
    }
  },

  chromaticBurst(ctx, t, r, color) {
    const s = easeOutCubic(t);
    const a = 1 - t;
    const offsets = [
      [color, 0, 0, 1],
      [FRINGE, 2.5, -1.5, 0.45],
      [ALARM, -2.5, 1.5, 0.45],
    ];
    for (const [c, ox, oy, mul] of offsets) {
      ctx.save();
      ctx.translate(ox * a, oy * a);
      setStroke(ctx, c, 2, a * mul);
      glow(ctx, c, 10 * a);
      strokeCircle(ctx, r * 0.2 + r * 0.65 * s);
      ctx.restore();
    }
    clearGlow(ctx);
  },

  glyphFlash(ctx, t, r, color, opts) {
    const pool = CorruptionCharsets.katakana;
    const ch = pool[Math.floor((opts.index * 7 + 3) % pool.length)];
    const a = pulse(t);
    const st = snap(t, 6, opts.loopMs);
    glow(ctx, color, 14 * a);
    setFill(ctx, color, a);
    ctx.font = `bold ${Math.round(r * 0.9)}px "Courier New", monospace`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.save();
    ctx.translate(st > 0.5 ? 1.5 : 0, 0);
    ctx.fillText(ch, 0, 0);
    ctx.restore();
    clearGlow(ctx);
  },

  scanSlash(ctx, t, r, color) {
    const p = easeOutCubic(t);
    const a = pulse(t);
    glow(ctx, color, 10);
    setStroke(ctx, color, 2.5, a);
    const x0 = -r * 0.7;
    const y0 = r * 0.55;
    const x1 = lerp(x0, r * 0.7, p);
    const y1 = lerp(y0, -r * 0.55, p);
    ctx.beginPath();
    ctx.moveTo(x0, y0);
    ctx.lineTo(x1, y1);
    ctx.stroke();
    // Trail shards
    setStroke(ctx, color, 1, a * 0.4);
    for (let i = 0; i < 4; i++) {
      const u = p - i * 0.08;
      if (u < 0) continue;
      const sx = lerp(x0, r * 0.7, u);
      const sy = lerp(y0, -r * 0.55, u);
      ctx.beginPath();
      ctx.moveTo(sx, sy - 4);
      ctx.lineTo(sx, sy + 4);
      ctx.stroke();
    }
    clearGlow(ctx);
  },

  pixelShatter(ctx, t, r, color) {
    const a = 1 - easeOutCubic(t);
    const n = 8;
    glow(ctx, color, 6);
    for (let i = 0; i < n; i++) {
      const ang = (i / n) * Math.PI * 2 + 0.2;
      const dist = r * 0.15 + r * 0.55 * easeOutCubic(t);
      const size = r * 0.12 * a;
      setFill(ctx, color, a * (0.5 + (i % 2) * 0.5));
      ctx.save();
      ctx.translate(Math.cos(ang) * dist, Math.sin(ang) * dist);
      ctx.rotate(t * 2 + i);
      ctx.fillRect(-size / 2, -size / 2, size, size);
      ctx.restore();
    }
    clearGlow(ctx);
  },

  targetLock(ctx, t, r, color) {
    const s = 1 - 0.45 * easeOutCubic(Math.min(1, t * 1.2));
    const a = t < 0.85 ? 1 : 1 - (t - 0.85) / 0.15;
    glow(ctx, color, 8);
    setStroke(ctx, color, 2, a);
    strokeCircle(ctx, r * 0.65 * s);
    crosshair(ctx, r * 0.8 * s, 0.5);
    setStroke(ctx, color, 1.5, a * 0.7);
    dashedRing(ctx, r * 0.4 * s, 12, -t * Math.PI);
    if (t > 0.55) {
      setFill(ctx, color, pulse((t - 0.55) / 0.45) * a);
      fillCircle(ctx, r * 0.08);
    }
    clearGlow(ctx);
  },

  sparkleField(ctx, t, r, color) {
    const seeds = [0.12, 0.37, 0.58, 0.71, 0.89];
    const offsets = [
      [0.35, -0.25], [-0.4, 0.15], [0.15, 0.4], [-0.25, -0.4], [0.45, 0.3],
    ];
    for (let i = 0; i < seeds.length; i++) {
      const local = (t + seeds[i]) % 1;
      const a = pulse(local);
      const [ox, oy] = offsets[i];
      ctx.save();
      ctx.translate(ox * r, oy * r);
      glow(ctx, color, 8 * a);
      setFill(ctx, color, a);
      pathStar(ctx, r * 0.18 * (0.5 + 0.5 * a), 0.35);
      ctx.fill();
      ctx.restore();
    }
    clearGlow(ctx);
  },

  hexCorrupt(ctx, t, r, color) {
    const a = 0.5 + 0.5 * pulse(t);
    const rot = t * Math.PI / 3;
    glow(ctx, color, 8);
    setStroke(ctx, color, 2, a);
    ctx.save();
    ctx.rotate(rot);
    ctx.beginPath();
    for (let i = 0; i < 6; i++) {
      const ang = (i / 6) * Math.PI * 2;
      const rad = r * 0.5 * (i === 2 ? 0.72 : 1); // one crushed vertex
      const x = Math.cos(ang) * rad;
      const y = Math.sin(ang) * rad;
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.closePath();
    ctx.stroke();
    ctx.restore();
    setFill(ctx, color, a * 0.8);
    fillCircle(ctx, r * 0.07);
    clearGlow(ctx);
  },

  signalLost(ctx, t, r, color, opts) {
    const a = pulse(t);
    const st = snap(t, 8, opts.loopMs);
    glow(ctx, color, 10);
    setStroke(ctx, color, 2, a);
    strokeCircle(ctx, r * 0.5);
    setStroke(ctx, color, 3, a * (st > 0.4 ? 1 : 0.3));
    drawX(ctx, r * 0.28);
    // Flicker label ticks
    setStroke(ctx, ALARM, 1, a * 0.5 * (st > 0.5 ? 1 : 0));
    crosshair(ctx, r * 0.72, 0.7);
    clearGlow(ctx);
  },

  bloomDot(ctx, t, r, color) {
    const a = pulse(t);
    const s = easeOutCubic(a);
    glow(ctx, color, 22 * a);
    setFill(ctx, color, a * 0.35);
    fillCircle(ctx, r * 0.55 * s);
    setFill(ctx, color, a * 0.85);
    fillCircle(ctx, r * 0.18 * s);
    setFill(ctx, '#ffffff', a * 0.9);
    fillCircle(ctx, r * 0.07 * s);
    clearGlow(ctx);
  },

  /**
   * Barcode ticks with segments dropping out — the instrument-panel register
   * MicroGfx works in, degraded. Replaced `gearNotch`, which read as
   * mechanical/steampunk rather than data corruption.
   */
  dataStrip(ctx, t, r, color, opts) {
    const n = 9;
    const a = pulse(t);
    const st = snap(t, 8, opts.loopMs);
    const shift = Math.round(st * 8);
    glow(ctx, color, 8 * a);
    for (let i = 0; i < n; i++) {
      // Deterministic dropout that marches with the stutter — corruption holes,
      // not noise. Same seed and frame always lose the same ticks.
      if (((i * 7 + shift * 3) % 5) === 0) continue;
      const x = ((i / (n - 1)) - 0.5) * r * 1.5;
      const h = r * (0.22 + 0.5 * (((i * 13) % 5) / 4));
      setStroke(ctx, color, 2.5, a);
      ctx.beginPath();
      ctx.moveTo(x, -h);
      ctx.lineTo(x, h);
      ctx.stroke();
    }
    // Baseline rule, the readout it would sit on
    setStroke(ctx, color, 1, a * 0.4);
    ctx.beginPath();
    ctx.moveTo(-r * 0.78, r * 0.72);
    ctx.lineTo(r * 0.78, r * 0.72);
    ctx.stroke();
    clearGlow(ctx);
  },

  shardBurst(ctx, t, r, color) {
    const a = 1 - easeOutCubic(t);
    const n = 6;
    glow(ctx, color, 8 * a);
    for (let i = 0; i < n; i++) {
      const ang = (i / n) * Math.PI * 2 - Math.PI / 2;
      const dist = r * 0.55 * easeOutCubic(t);
      ctx.save();
      ctx.rotate(ang);
      ctx.translate(dist, 0);
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(r * 0.28 * a, -r * 0.08);
      ctx.lineTo(r * 0.28 * a, r * 0.08);
      ctx.closePath();
      setFill(ctx, color, a * 0.85);
      ctx.fill();
      ctx.restore();
    }
    clearGlow(ctx);
  },

  rippleDecay(ctx, t, r, color) {
    for (let i = 0; i < 3; i++) {
      const tt = (t + i * 0.22) % 1;
      const a = (1 - tt) * (1 - i * 0.2);
      setStroke(ctx, color, 1.5, a);
      glow(ctx, color, 6 * a);
      strokeCircle(ctx, r * 0.12 + r * 0.7 * easeOutCubic(tt));
    }
    clearGlow(ctx);
  },

  staticFlash(ctx, t, r, color, opts) {
    const a = pulse(t);
    // Noise speckles early, star settles late
    if (t < 0.45) {
      const rng = opts.rng;
      setFill(ctx, color, a * 0.7);
      for (let i = 0; i < 18; i++) {
        const x = (rng() - 0.5) * r * 1.4;
        const y = (rng() - 0.5) * r * 1.4;
        ctx.fillRect(x, y, 1.5, 1.5);
      }
    }
    const s = easeOutBack(Math.max(0, (t - 0.2) / 0.8));
    withChromatic(ctx, color, 1.5 * a, (c, alpha) => {
      glow(ctx, c, 12 * a);
      setFill(ctx, c, alpha * a * Math.min(1, t * 2));
      pathStar(ctx, r * 0.45 * s);
      ctx.fill();
      clearGlow(ctx);
    });
  },
};

/** Canonical board order — 25 recipes, one per cell. */
export const FLARE_GRID = [
  'starBurst', 'ringPulse', 'reticleSpin', 'glitchStar', 'dualRing',
  'xPop', 'sparkCross', 'brokenArc', 'diamondPulse', 'orbitDots',
  'dashedRingSpin', 'voidHole', 'chromaticBurst', 'glyphFlash', 'scanSlash',
  'pixelShatter', 'targetLock', 'sparkleField', 'hexCorrupt', 'signalLost',
  'bloomDot', 'dataStrip', 'shardBurst', 'rippleDecay', 'staticFlash',
];

/* ── Class ──────────────────────────────────────────────────────────────── */

/**
 * @class CorruptedFlares
 * @param {Element|null} container - Mount point for the canvas grid
 * @param {object} [options={}]
 * @param {number} [options.cols=5]
 * @param {number} [options.rows=5]
 * @param {number} [options.cellSize=112] - CSS px per cell
 * @param {number} [options.gap=10]
 * @param {number} [options.loopMs=1400] - Duration of one recipe loop
 * @param {number} [options.loops=3] - Corruption cycles before a cell settles
 *   to a static, readable white mark. `Infinity` keeps the board corrupting
 *   forever — decorative, but it never reaches the readable end state Core
 *   Tenet 2 requires, so prefer a finite count for content surfaces.
 * @param {number} [options.speed=1]
 * @param {number|null} [options.seed=null]
 * @param {string[]} [options.recipes] - Override grid recipe list
 * @param {{wavefront: string, mid: string, settled: string}} [options.ramp] -
 *   Override the corruption-age colour ramp
 * @param {boolean} [options.rounded=true] - Round cell corners via clip
 * @param {boolean} [options.plate=true] - Draw the dark cell tile and its
 *   border. Set `false` for a fully transparent board you can composite over
 *   video, artwork or an OBS scene — this also drops the per-cell clip, so
 *   glow bleeds between cells the way an overlay should.
 * @param {() => void} [options.onSettled] - Fired once the whole board settles
 */
export class CorruptedFlares {
  constructor(container, options = {}) {
    this.container = container;
    this.options = {
      cols: options.cols ?? 5,
      rows: options.rows ?? 5,
      cellSize: options.cellSize ?? 112,
      gap: options.gap ?? 10,
      loopMs: options.loopMs ?? 1400,
      loops: options.loops ?? 3,
      speed: options.speed ?? 1,
      seed: options.seed ?? null,
      recipes: options.recipes ?? FLARE_GRID.slice(),
      ramp: { ...RAMP, ...(options.ramp ?? {}) },
      rounded: options.rounded !== false,
      plate: options.plate !== false,
      onSettled: options.onSettled ?? null,
    };
    this._rng = this.options.seed === null ? Math.random : seededRandom(this.options.seed);
    this._phases = [];
    this._canvas = null;
    this._ctx = null;
    this._raf = null;
    this._running = false;
    this._destroyed = false;
    this._settled = false;
    this._forceSettled = false;
    this._startTs = 0;
    this._dpr = 1;
    // Board clock, in ms. Survives stop()/start() so pausing resumes in place
    // instead of rewinding. Seeded off zero because most recipes are empty at
    // t=0 — the first painted frame should already have something in it.
    this._elapsed = this.options.loopMs * 0.28;

    const n = this.options.cols * this.options.rows;
    for (let i = 0; i < n; i++) {
      this._phases.push(this._rng());
    }

    if (container) this._mount();
  }

  /* ── Public API ──────────────────────────────────────────────────────── */

  /** Start the live loop. Idempotent. @returns {this} */
  start() {
    if (this._destroyed || this._running || !this._canvas) return this;
    if (this._prefersReducedMotion()) {
      // Static fallback IS the settled end state — readable white, no motion.
      this.settle();
      return this;
    }
    this._running = true;
    // Anchor the wall clock behind us by however far the board already ran, so
    // the first rAF frame continues from _elapsed rather than snapping to 0.
    this._startTs = performance.now() - this._elapsed;
    // Paint immediately so the first frame is visible before rAF (headless /
    // first-paint screenshots, paused-tab restores, etc.).
    this._paint(this._elapsed);
    const tick = (now) => {
      if (!this._running) return;
      this._elapsed = now - this._startTs;
      // Once every cell has decayed to white there is nothing left to animate.
      // Holding a static frame at 60fps is the definition of wasted battery.
      if (this._paint(this._elapsed)) {
        this._running = false;
        this._raf = null;
        this._settled = true;
        this.options.onSettled?.();
        return;
      }
      this._raf = requestAnimationFrame(tick);
    };
    this._raf = requestAnimationFrame(tick);
    return this;
  }

  /**
   * Jump straight to the settled end state: every cell white and static.
   * This is the readable endpoint Core Tenet 2 requires, and the static
   * fallback the accessibility guidance asks for.
   * @returns {this}
   */
  settle() {
    if (this._destroyed || !this._canvas) return this;
    this.stop();
    // Forced rather than clock-derived, so this also works for loops:Infinity.
    this._forceSettled = true;
    this._paint(this._elapsed);
    this._forceSettled = false;
    this._settled = true;
    return this;
  }

  /** True once the board has reached its settled, readable end state. */
  get isSettled() {
    return this._settled;
  }

  /** True while the animation loop is running. */
  get isRunning() {
    return this._running;
  }

  /**
   * Rewind to the corruption event and run again.
   * @returns {this}
   */
  restart() {
    if (this._destroyed) return this;
    this.stop();
    this._elapsed = 0;
    this._settled = false;
    return this.start();
  }

  /**
   * Deterministic frame for video export.
   * @param {number} frameIdx
   * @param {number} [fps=60]
   */
  renderFrame(frameIdx, fps = 60) {
    if (this._destroyed || !this._canvas) return;
    // Elapsed wall-clock only. `speed` is applied once, inside _paint — the
    // same place the live loop applies it, so export and playback agree.
    this._paint((frameIdx / fps) * 1000);
  }

  /**
   * Render the frame a `createFrameClock` is sitting on. Lets an offline
   * exporter drive the board off the same clock as everything else in the
   * composition, so a scrubbed preview and a captured frame agree.
   *
   * @example
   *   import { createFrameClock } from '@whykusanagi/corrupted-theme/canvas-seek';
   *   const clock = createFrameClock({ fps: 30, seed: 42 });
   *   clock.seek(120);
   *   flares.renderAt(clock);
   *
   * @param {{frame: number, fps: number}} clock
   */
  renderAt(clock) {
    if (!clock) return;
    this.renderFrame(clock.frame, clock.fps);
  }

  /**
   * Export the current frame as a PNG blob. Transparent wherever nothing was
   * drawn when `plate: false`, so the result composites directly.
   *
   * @param {object} [opts]
   * @param {number} [opts.scale=1] - Multiplier on the board's CSS size
   * @returns {Promise<Blob>}
   */
  toPNG(opts = {}) {
    if (this._destroyed || !this._canvas) {
      return Promise.reject(new Error('CorruptedFlares: nothing to export'));
    }
    const scale = Number.isFinite(opts.scale) && opts.scale > 0 ? opts.scale : 1;
    // Re-paint at the requested resolution rather than upscaling the live
    // canvas — vector output stays crisp at any export size.
    const out = document.createElement('canvas');
    out.width = Math.round(this._cssW * scale);
    out.height = Math.round(this._cssH * scale);
    const octx = out.getContext('2d');
    const liveCtx = this._ctx;
    const liveDpr = this._dpr;
    this._ctx = octx;
    this._dpr = scale;
    try {
      this._paint(this._elapsed);
    } finally {
      this._ctx = liveCtx;
      this._dpr = liveDpr;
    }
    return new Promise((resolve, reject) => {
      out.toBlob(
        (blob) => (blob ? resolve(blob) : reject(new Error('CorruptedFlares: toBlob failed'))),
        'image/png',
      );
    });
  }

  /** Stop the loop; leaves last frame visible. */
  stop() {
    this._running = false;
    if (this._raf !== null) {
      cancelAnimationFrame(this._raf);
      this._raf = null;
    }
  }

  /** Stop and remove the canvas. Not reusable. */
  destroy() {
    if (this._destroyed) return;
    this.stop();
    if (this._canvas && this._canvas.parentNode) {
      this._canvas.parentNode.removeChild(this._canvas);
    }
    this._canvas = null;
    this._ctx = null;
    this.container = null;
    this._destroyed = true;
  }

  /**
   * Draw one recipe into an existing context, origin at the current transform
   * (translate first to place it). **This is the API for compositing** — it
   * touches nothing but the pixels it draws, leaves the context exactly as it
   * found it, and never paints a background, so the result drops straight onto
   * video, artwork or a transparent OBS layer.
   *
   * @example Scatter a VFX pass over a thumbnail
   *   for (const [name, x, y, t] of marks) {
   *     ctx.save();
   *     ctx.translate(x, y);
   *     CorruptedFlares.draw(ctx, name, t, { size: 70, color: '#ff00ff' });
   *     ctx.restore();
   *   }
   *
   * @param {CanvasRenderingContext2D} ctx
   * @param {string} name - Recipe key in FLARE_RECIPES
   * @param {number} t - Loop progress 0..1
   * @param {object} [opts]
   * @param {number} [opts.size=96]
   * @param {string} [opts.color='#ff00ff'] - Or `rampColorAt(t)` for a
   *   corruption-age tint matching the grid
   * @param {number} [opts.index=0]
   * @param {() => number} [opts.rng]
   * @param {number} [opts.loopMs=1400] - Real loop duration, so the flicker
   *   floor is measured against your playback rate rather than assumed
   */
  static draw(ctx, name, t, opts = {}) {
    const recipe = FLARE_RECIPES[name];
    if (!recipe) return;
    const size = opts.size ?? 96;
    const color = opts.color ?? '#ff00ff';
    const r = size * 0.42;
    // Recipes set fill/stroke/shadow, and glyphFlash sets font + text
    // alignment. This is the caller's context, so hand it back untouched.
    ctx.save();
    try {
      recipe(ctx, clamp01(t), r, color, {
        index: opts.index ?? 0,
        rng: opts.rng ?? Math.random,
        // Defaults to the component's own loop length so a caller driving this
        // from their own rAF still gets flicker frames above the 100ms floor.
        loopMs: opts.loopMs ?? 1400,
      });
    } finally {
      ctx.restore();
    }
  }

  /**
   * Frame-locked `draw()` for offline export. Derives loop position from the
   * clock's playback time and takes its randomness from `clock.rngFor`, so a
   * given frame index always produces identical pixels — which is what a
   * frame-cached capture pipeline needs to skip re-rendering unchanged frames.
   *
   * @example Deterministic VFX pass in a headless capture
   *   const clock = createFrameClock({ fps: 30, seed: 42 });
   *   clock.seek(frameIdx);
   *   CorruptedFlares.drawAt(ctx, 'glitchStar', clock, { size: 80, loopMs: 1400 });
   *
   * @param {CanvasRenderingContext2D} ctx
   * @param {string} name
   * @param {{frame: number, time: number, rngFor: Function}} clock
   * @param {object} [opts] - As `draw()`, plus:
   * @param {number} [opts.loopMs=1400] - Duration of one flare loop
   * @param {number} [opts.offsetMs=0] - Shift this flare's phase
   * @param {boolean} [opts.ramp=false] - Tint by corruption age instead of
   *   `opts.color`
   */
  static drawAt(ctx, name, clock, opts = {}) {
    if (!clock) return;
    const loopMs = opts.loopMs ?? 1400;
    const t = ((((clock.time + (opts.offsetMs ?? 0)) % loopMs) + loopMs) % loopMs) / loopMs;
    CorruptedFlares.draw(ctx, name, t, {
      ...opts,
      loopMs,
      color: opts.ramp ? rampColor(t, RAMP) : opts.color,
      rng: clock.rngFor ? clock.rngFor(clock.frame, name) : opts.rng,
    });
  }

  /**
   * Colour for a corruption age, for callers compositing single flares who
   * want the grid's violet → magenta → white ramp.
   * @param {number} t - Loop progress 0..1
   * @returns {string} hex colour
   */
  static rampColorAt(t) {
    return rampColor(t, RAMP);
  }

  /** Recipe names in board order (or custom options.recipes). */
  static get recipeNames() {
    return Object.keys(FLARE_RECIPES);
  }

  /* ── Internals ───────────────────────────────────────────────────────── */

  _mount() {
    const { cols, rows, cellSize, gap } = this.options;
    const cssW = cols * cellSize + (cols - 1) * gap;
    const cssH = rows * cellSize + (rows - 1) * gap;
    this._dpr = typeof window !== 'undefined' ? Math.min(window.devicePixelRatio || 1, 2) : 1;

    const canvas = document.createElement('canvas');
    canvas.className = 'corrupted-flares';
    canvas.width = Math.round(cssW * this._dpr);
    canvas.height = Math.round(cssH * this._dpr);
    canvas.style.width = `${cssW}px`;
    canvas.style.height = `${cssH}px`;
    canvas.style.display = 'block';
    canvas.setAttribute('role', 'img');
    canvas.setAttribute('aria-label', 'Corrupted flare effect grid');

    this.container.appendChild(canvas);
    this._canvas = canvas;
    this._ctx = canvas.getContext('2d');
    this._cssW = cssW;
    this._cssH = cssH;
  }

  /**
   * How far cell `i` is through its own corruption, in loops.
   * Whole part = completed cycles, fraction = position in the current one.
   */
  _cellCycles(i, ms) {
    const { loopMs, speed } = this.options;
    return ((ms * speed) / loopMs) + (this._phases[i] ?? 0);
  }

  /**
   * Paint the board.
   * @param {number} ms - Board clock
   * @returns {boolean} true once every cell has settled
   */
  _paint(ms) {
    const ctx = this._ctx;
    if (!ctx) return false;
    const {
      cols, rows, cellSize, gap, recipes, rounded, plate, loops, ramp, loopMs, speed,
    } = this.options;
    const dpr = this._dpr;
    let allSettled = true;
    // What one loop actually takes on screen — `speed` shortens it, and the
    // flicker floor has to be measured against the real duration.
    const effLoopMs = loopMs / (speed || 1);

    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, this._cssW, this._cssH);

    const radius = rounded ? Math.max(6, cellSize * 0.08) : 0;

    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        const i = row * cols + col;
        const x = col * (cellSize + gap);
        const y = row * (cellSize + gap);

        // Cell plate. Skipped entirely for overlay use — an opaque tile cannot
        // be composited over video or an OBS scene, and the clip that goes with
        // it would cut the glow at the cell edge.
        ctx.save();
        if (plate) {
          roundRect(ctx, x, y, cellSize, cellSize, radius);
          ctx.fillStyle = CELL_BG;
          ctx.fill();
          ctx.strokeStyle = 'rgba(255,0,255,0.32)';
          ctx.lineWidth = 1;
          ctx.stroke();
          ctx.clip();
        }

        // Recipe. Colour comes from THIS cell's corruption age, not a board
        // clock — a settled cell must not read white while its neighbour is
        // mid-burst, and vice versa (Core Tenet 4).
        const name = recipes[i % recipes.length];
        const recipe = FLARE_RECIPES[name];
        const cycles = this._cellCycles(i, ms);
        const settled = this._forceSettled || cycles >= loops;
        const t = settled ? SETTLE_T : cycles % 1;
        const color = settled ? ramp.settled : rampColor(t, ramp);
        if (!settled) allSettled = false;

        ctx.save();
        ctx.translate(x + cellSize / 2, y + cellSize / 2);
        if (recipe) {
          // staticFlash is the only recipe that draws from rng. Re-seed it per
          // frame bucket so its speckles hold for a few frames and stay
          // reproducible for a given (seed, frame) — everything else is pure.
          const rng = name === 'staticFlash'
            ? seededRandom(((((this.options.seed ?? 1) + 1) * 7919 + i * 104729 + Math.floor(t * 20)) >>> 0) || 1)
            : Math.random;
          recipe(ctx, t, cellSize * 0.42, color, { index: i, rng, loopMs: effLoopMs });
        }
        ctx.restore();
        ctx.restore();

        ctx.globalAlpha = 1;
        clearGlow(ctx);
      }
    }
    return allSettled;
  }

  _prefersReducedMotion() {
    return typeof matchMedia !== 'undefined'
      && matchMedia('(prefers-reduced-motion: reduce)').matches;
  }
}

/* ── Helpers ────────────────────────────────────────────────────────────── */

function roundRect(ctx, x, y, w, h, r) {
  const rr = Math.min(r, w / 2, h / 2);
  ctx.beginPath();
  if (rr <= 0) {
    ctx.rect(x, y, w, h);
    return;
  }
  ctx.moveTo(x + rr, y);
  ctx.arcTo(x + w, y, x + w, y + h, rr);
  ctx.arcTo(x + w, y + h, x, y + h, rr);
  ctx.arcTo(x, y + h, x, y, rr);
  ctx.arcTo(x, y, x + w, y, rr);
  ctx.closePath();
}

function hexToRgb(hex) {
  const h = hex.replace('#', '');
  const n = h.length === 3
    ? parseInt(h[0] + h[0] + h[1] + h[1] + h[2] + h[2], 16)
    : parseInt(h, 16);
  return { r: (n >> 16) & 255, g: (n >> 8) & 255, b: n & 255 };
}

function mixHex(a, b, t) {
  const A = hexToRgb(a);
  const B = hexToRgb(b);
  const r = Math.round(lerp(A.r, B.r, t));
  const g = Math.round(lerp(A.g, B.g, t));
  const bl = Math.round(lerp(A.b, B.b, t));
  return `#${((1 << 24) + (r << 16) + (g << 8) + bl).toString(16).slice(1)}`;
}
