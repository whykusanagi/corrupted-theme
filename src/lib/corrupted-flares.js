/**
 * CorruptedFlares — anime-style micro VFX grid, corrupted-theme palette.
 *
 * A 5×5 board of short geometric flare loops (sparkles, rings, reticles,
 * bursts). Shapes borrow the NopiA "flare light" vocabulary; colour and
 * motion belong to the theme: magenta / violet / white carry identity,
 * cyan + red appear only as chromatic fringes, timing snaps and stutters
 * instead of smoothing cleanly.
 *
 * @example Grid showcase
 *   import { CorruptedFlares } from '@whykusanagi/corrupted-theme/corrupted-flares';
 *   const flares = new CorruptedFlares(stage, { seed: 42 });
 *   flares.start();
 *
 * @example Single recipe on your own canvas
 *   CorruptedFlares.draw(ctx, 'starBurst', t, { size: 96, color: '#ff00ff' });
 *
 * @module lib/corrupted-flares
 * @version 0.3.2
 * @author whykusanagi
 * @license MIT
 *
 * @see CORRUPTED_THEME_SPEC.md — Color Palette, Glitch Animations
 * @composes CorruptionCharsets — glyphFlash recipe
 */

import { CorruptionCharsets } from '../core/corruption-charsets.js';
import { seededRandom } from '../core/random-utils.js';

/* ── Palette ────────────────────────────────────────────────────────────── */

/** Theme colours cycle the whole board (like the reference pack's hue shifts). */
const THEME_CYCLE = ['#ff00ff', '#8b5cf6', '#d94f90', '#ffffff', '#ff00ff', '#8b5cf6'];
const FRINGE = '#00ffff';
const ALARM = '#ff0000';
const CELL_BG = '#0a0a0a';

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

/** Quantized terminal motion — stutter instead of smooth fade. */
function snap(t, steps = 8) {
  return Math.floor(clamp01(t) * steps) / steps;
}

function lerp(a, b, t) {
  return a + (b - a) * t;
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

  glitchStar(ctx, t, r, color) {
    const st = snap(t, 10);
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

  brokenArc(ctx, t, r, color) {
    const drawn = snap(easeOutCubic(t), 12);
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
    const st = snap(t, 6);
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

  signalLost(ctx, t, r, color) {
    const a = pulse(t);
    const st = snap(t, 8);
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

  gearNotch(ctx, t, r, color) {
    const a = 0.65 + 0.35 * pulse((t * 2) % 1);
    const teeth = 10;
    glow(ctx, color, 8);
    setStroke(ctx, color, 2, a);
    ctx.save();
    ctx.rotate(t * Math.PI * 2);
    ctx.beginPath();
    for (let i = 0; i < teeth; i++) {
      const a0 = (i / teeth) * Math.PI * 2;
      const a1 = ((i + 0.45) / teeth) * Math.PI * 2;
      const outer = r * 0.55;
      const inner = r * 0.42;
      ctx.lineTo(Math.cos(a0) * outer, Math.sin(a0) * outer);
      ctx.lineTo(Math.cos(a1) * outer, Math.sin(a1) * outer);
      ctx.lineTo(Math.cos(a1) * inner, Math.sin(a1) * inner);
      const a2 = ((i + 1) / teeth) * Math.PI * 2;
      ctx.lineTo(Math.cos(a2) * inner, Math.sin(a2) * inner);
    }
    ctx.closePath();
    ctx.stroke();
    ctx.restore();
    setFill(ctx, color, a);
    pathStar(ctx, r * 0.2, 0.4);
    ctx.fill();
    clearGlow(ctx);
  },

  shardBurst(ctx, t, r, color) {
    const a = 1 - easeOutCubic(t);
    const n = 6;
    glow(ctx, color, 8 * a);
    for (let i = 0; i < n; i++) {
      const ang = (i / n) * Math.PI * 2 - Math.PI / 2;
      const dist = r * 0.55 * easeOutCubic(t);
      setStroke(ctx, color, 2, a);
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
  'bloomDot', 'gearNotch', 'shardBurst', 'rippleDecay', 'staticFlash',
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
 * @param {number} [options.colorCycleMs=4800] - Whole-board palette shift
 * @param {number} [options.speed=1]
 * @param {number|null} [options.seed=null]
 * @param {string[]} [options.recipes] - Override grid recipe list
 * @param {string[]} [options.palette] - Override colour cycle
 * @param {boolean} [options.rounded=true] - Round cell corners via clip
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
      colorCycleMs: options.colorCycleMs ?? 4800,
      speed: options.speed ?? 1,
      seed: options.seed ?? null,
      recipes: options.recipes ?? FLARE_GRID.slice(),
      palette: options.palette ?? THEME_CYCLE.slice(),
      rounded: options.rounded !== false,
    };
    this._rng = this.options.seed === null ? Math.random : seededRandom(this.options.seed);
    this._cellRng = [];
    this._phases = [];
    this._canvas = null;
    this._ctx = null;
    this._raf = null;
    this._running = false;
    this._destroyed = false;
    this._startTs = 0;
    this._dpr = 1;

    const n = this.options.cols * this.options.rows;
    for (let i = 0; i < n; i++) {
      this._phases.push(this._rng());
      // Per-cell seeded stream for staticFlash etc.
      const cellSeed = ((this.options.seed ?? 1) * 997 + i * 131) >>> 0;
      this._cellRng.push(seededRandom(cellSeed || 1));
    }

    if (container) this._mount();
  }

  /* ── Public API ──────────────────────────────────────────────────────── */

  /** Start the live loop. Idempotent. @returns {this} */
  start() {
    if (this._destroyed || this._running || !this._canvas) return this;
    if (this._prefersReducedMotion()) {
      this.renderFrame(Math.round(this.options.loopMs * 0.35 / (1000 / 60)), 60);
      return this;
    }
    this._running = true;
    this._startTs = performance.now();
    // Paint immediately so the first frame is visible before rAF (headless /
    // first-paint screenshots, paused-tab restores, etc.).
    this._paint(this.options.loopMs * 0.28);
    const tick = (now) => {
      if (!this._running) return;
      this._paint(now - this._startTs);
      this._raf = requestAnimationFrame(tick);
    };
    this._raf = requestAnimationFrame(tick);
    return this;
  }

  /**
   * Deterministic frame for video export.
   * @param {number} frameIdx
   * @param {number} [fps=60]
   */
  renderFrame(frameIdx, fps = 60) {
    if (this._destroyed || !this._canvas) return;
    const ms = (frameIdx / fps) * 1000 * this.options.speed;
    this._paint(ms);
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
   * Draw one recipe into an existing context (origin at center).
   * @param {CanvasRenderingContext2D} ctx
   * @param {string} name - Recipe key in FLARE_RECIPES
   * @param {number} t - Loop progress 0..1
   * @param {object} [opts]
   * @param {number} [opts.size=96]
   * @param {string} [opts.color='#ff00ff']
   * @param {number} [opts.index=0]
   * @param {() => number} [opts.rng]
   */
  static draw(ctx, name, t, opts = {}) {
    const recipe = FLARE_RECIPES[name];
    if (!recipe) return;
    const size = opts.size ?? 96;
    const color = opts.color ?? '#ff00ff';
    const r = size * 0.42;
    recipe(ctx, clamp01(t), r, color, {
      index: opts.index ?? 0,
      rng: opts.rng ?? Math.random,
    });
    ctx.globalAlpha = 1;
    clearGlow(ctx);
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

  _paletteColor(ms) {
    const { palette, colorCycleMs, speed } = this.options;
    const u = ((ms * speed) / colorCycleMs) % palette.length;
    const i = Math.floor(u);
    const f = u - i;
    // Hold most of the cycle, quick blend — board "snaps" colour like the pack
    const blend = f < 0.82 ? 0 : (f - 0.82) / 0.18;
    const a = palette[i];
    const b = palette[(i + 1) % palette.length];
    return blend <= 0 ? a : mixHex(a, b, easeOutCubic(blend));
  }

  _paint(ms) {
    const ctx = this._ctx;
    if (!ctx) return;
    const { cols, rows, cellSize, gap, loopMs, recipes, speed, rounded } = this.options;
    const dpr = this._dpr;
    const color = this._paletteColor(ms);

    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, this._cssW, this._cssH);

    const radius = rounded ? Math.max(6, cellSize * 0.08) : 0;

    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        const i = row * cols + col;
        const x = col * (cellSize + gap);
        const y = row * (cellSize + gap);

        // Cell plate
        ctx.save();
        roundRect(ctx, x, y, cellSize, cellSize, radius);
        ctx.fillStyle = CELL_BG;
        ctx.fill();
        ctx.strokeStyle = 'rgba(255,0,255,0.32)';
        ctx.lineWidth = 1;
        ctx.stroke();
        ctx.clip();

        // Recipe
        const name = recipes[i % recipes.length];
        const recipe = FLARE_RECIPES[name];
        const phase = this._phases[i] ?? 0;
        const t = (((ms * speed) / loopMs) + phase) % 1;

        ctx.save();
        ctx.translate(x + cellSize / 2, y + cellSize / 2);
        if (recipe) {
          // Reset per-cell rng stream each frame from phase for stability
          const rng = this._cellRng[i] ?? Math.random;
          // Rewind by re-seeding from index+frame bucket so staticFlash is stable
          const frameBucket = Math.floor(t * 20);
          const frameRng = seededRandom((((this.options.seed ?? 1) + 1) * 7919 + i * 104729 + frameBucket) >>> 0 || 1);
          recipe(ctx, t, cellSize * 0.42, color, { index: i, rng: name === 'staticFlash' ? frameRng : rng });
        }
        ctx.restore();
        ctx.restore();

        ctx.globalAlpha = 1;
        clearGlow(ctx);
      }
    }
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
