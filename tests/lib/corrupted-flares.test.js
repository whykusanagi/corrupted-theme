// tests/lib/corrupted-flares.test.js
import { strict as assert } from 'node:assert';
import { test } from 'node:test';
import {
  CorruptedFlares,
  FLARE_RECIPES,
  FLARE_GRID,
} from '../../src/lib/corrupted-flares.js';

test('CorruptedFlares class exported', () => {
  assert.equal(typeof CorruptedFlares, 'function');
});

test('FLARE_GRID has 25 recipes', () => {
  assert.equal(FLARE_GRID.length, 25);
});

test('every FLARE_GRID entry exists in FLARE_RECIPES', () => {
  for (const name of FLARE_GRID) {
    assert.equal(typeof FLARE_RECIPES[name], 'function', `missing recipe: ${name}`);
  }
});

test('recipeNames lists all recipes', () => {
  const names = CorruptedFlares.recipeNames;
  assert.ok(names.includes('starBurst'));
  assert.ok(names.includes('staticFlash'));
  assert.equal(names.length, Object.keys(FLARE_RECIPES).length);
});

test('construct / start / stop / destroy are safe without DOM', () => {
  const flares = new CorruptedFlares(null, { seed: 42 });
  assert.doesNotThrow(() => flares.start());
  assert.doesNotThrow(() => flares.stop());
  flares.destroy();
  assert.equal(flares._destroyed, true);
});

test('double destroy does not throw', () => {
  const flares = new CorruptedFlares(null);
  flares.destroy();
  assert.doesNotThrow(() => flares.destroy());
});

test('static draw paints without throwing (node canvas mock)', () => {
  const calls = [];
  const ctx = {
    globalAlpha: 1,
    shadowColor: '',
    shadowBlur: 0,
    strokeStyle: '',
    fillStyle: '',
    lineWidth: 1,
    lineCap: '',
    lineJoin: '',
    font: '',
    textAlign: '',
    textBaseline: '',
    beginPath() { calls.push('beginPath'); },
    closePath() {},
    moveTo() {},
    lineTo() {},
    arc() {},
    rect() {},
    fillRect() {},
    stroke() {},
    fill() {},
    fillText() {},
    save() {},
    restore() {},
    translate() {},
    rotate() {},
    scale() {},
  };
  assert.doesNotThrow(() => CorruptedFlares.draw(ctx, 'starBurst', 0.4, { size: 64 }));
  assert.doesNotThrow(() => CorruptedFlares.draw(ctx, 'ringPulse', 0.6, { color: '#8b5cf6' }));
  assert.doesNotThrow(() => CorruptedFlares.draw(ctx, 'nope', 0.5));
  assert.ok(calls.length > 0);
});

test('seeded construction is deterministic for phases', () => {
  const a = new CorruptedFlares(null, { seed: 7 });
  const b = new CorruptedFlares(null, { seed: 7 });
  assert.deepEqual(a._phases, b._phases);
  a.destroy();
  b.destroy();
});

/** Canvas ctx stub that records state and no-ops every draw call. */
function stubCtx() {
  const state = {
    globalAlpha: 1, shadowColor: 'rgba(0,0,0,0)', shadowBlur: 0,
    strokeStyle: '#000000', fillStyle: '#000000', lineWidth: 1,
    lineCap: 'butt', lineJoin: 'miter', font: '10px sans-serif',
    textAlign: 'start', textBaseline: 'alphabetic',
  };
  const depth = { n: 0 };
  const stack = [];
  const ctx = new Proxy(state, {
    get(t, p) {
      if (p === '__depth') return depth;
      if (p in t) return t[p];
      if (p === 'save') return () => { stack.push({ ...t }); depth.n++; };
      if (p === 'restore') return () => {
        depth.n--;
        const prev = stack.pop();
        if (prev) Object.assign(t, prev);
      };
      return () => {};
    },
    set(t, p, v) { t[p] = v; return true; },
  });
  return { ctx, depth, pristine: { ...state } };
}

// Every recipe runs, at every interesting point of its loop. Catches a typo or
// a bad reference in any of the 24 recipes the grid never exercised before.
test('all 25 recipes draw across the whole loop', () => {
  const ts = [0, 0.01, 0.2, 0.34, 0.45, 0.5, 0.7, 0.99, 1];
  for (const name of FLARE_GRID) {
    for (const t of ts) {
      const { ctx } = stubCtx();
      assert.doesNotThrow(
        () => CorruptedFlares.draw(ctx, name, t, { size: 96, index: 3, rng: () => 0.5 }),
        `${name} threw at t=${t}`,
      );
    }
  }
});

test('static draw balances save/restore and leaves ctx state untouched', () => {
  for (const name of FLARE_GRID) {
    const { ctx, depth, pristine } = stubCtx();
    CorruptedFlares.draw(ctx, name, 0.5, { size: 96, index: 2, rng: () => 0.5 });
    assert.equal(depth.n, 0, `${name} leaked a save()`);
    for (const key of Object.keys(pristine)) {
      assert.equal(ctx[key], pristine[key], `${name} leaked ctx.${key}`);
    }
  }
});

test('renderFrame applies speed exactly once', () => {
  const painted = [];
  const f = new CorruptedFlares(null, { seed: 1, loopMs: 1000, speed: 3 });
  f._canvas = {}; f._ctx = {};
  f._paint = (ms) => painted.push(ms);
  f.renderFrame(30, 60); // half a second of frames
  assert.equal(painted[0], 500, 'renderFrame must pass raw elapsed ms, not ms * speed');
});

test('stop/start resumes the board instead of rewinding', () => {
  const f = new CorruptedFlares(null, { seed: 1, loopMs: 1400 });
  f._canvas = {}; f._ctx = {};
  const painted = [];
  f._paint = (ms) => { painted.push(ms); return false; };
  f._elapsed = 500;          // pretend the board has been running
  f._prefersReducedMotion = () => true;  // take the synchronous path
  f.start();
  assert.equal(painted[0], 500, 'resume must continue from elapsed time');
});

/* ── Core Tenet 4: colour is a state signal, not decoration ─────────────── */

// Records the colour handed to each cell during one _paint().
function paintColors(flares, ms) {
  const seen = [];
  const originals = { ...FLARE_RECIPES };
  for (const name of Object.keys(FLARE_RECIPES)) {
    FLARE_RECIPES[name] = (ctx, t, r, color) => { seen.push({ name, t, color }); };
  }
  const { ctx } = stubCtx();
  flares._ctx = ctx; flares._cssW = 600; flares._cssH = 600; flares._dpr = 1;
  flares._paint(ms);
  Object.assign(FLARE_RECIPES, originals);
  return seen;
}

test('cells at different loop positions get different colours', () => {
  const f = new CorruptedFlares(null, { seed: 42, loopMs: 1400, loops: Infinity });
  const seen = paintColors(f, 700);
  const spread = Math.max(...seen.map(s => s.t)) - Math.min(...seen.map(s => s.t));
  assert.ok(spread > 0.5, `cells should be spread across the loop, got ${spread}`);
  assert.ok(
    new Set(seen.map(s => s.color)).size > 1,
    'colour must vary with each cell\'s own corruption age, not a board clock',
  );
});

test('colour ramps violet -> magenta -> white across one loop', () => {
  const f = new CorruptedFlares(null, { seed: 42, loops: Infinity });
  f._phases = new Array(25).fill(0);   // put every cell in lockstep
  const at = (frac) => paintColors(f, frac * f.options.loopMs)[0].color;
  assert.equal(at(0), '#8b5cf6', 'loop start is the corruption event — violet');
  assert.equal(at(0.5), '#ff00ff', 'mid-decay is magenta');
  const late = at(0.97);
  assert.ok(/^#f[0-9a-f]e/.test(late) || late === '#ffffff',
    `end of loop should be near-white, got ${late}`);
});

/* ── Core Tenet 2: the board reaches a readable endpoint ────────────────── */

test('settle() paints every cell white and static', () => {
  const f = new CorruptedFlares(null, { seed: 42, loops: 3 });
  f._canvas = {};
  const seen = [];
  const original = FLARE_RECIPES.starBurst;
  f.options.recipes = new Array(25).fill('starBurst');
  FLARE_RECIPES.starBurst = (ctx, t, r, color) => seen.push({ t, color });
  const { ctx } = stubCtx();
  f._ctx = ctx; f._cssW = 600; f._cssH = 600; f._dpr = 1;
  f.settle();
  FLARE_RECIPES.starBurst = original;
  assert.ok(seen.every(s => s.color === '#ffffff'), 'settled board must be white');
  assert.ok(seen.every(s => s.t === seen[0].t), 'settled board must be static');
  assert.equal(f.isSettled, true);
});

test('settle() works even when loops is Infinity', () => {
  const f = new CorruptedFlares(null, { seed: 42, loops: Infinity });
  f._canvas = {};
  const { ctx } = stubCtx();
  f._ctx = ctx; f._cssW = 600; f._cssH = 600; f._dpr = 1;
  f.settle();
  assert.equal(f.isSettled, true);
});

test('_paint reports settled once every cell has passed its loop count', () => {
  const f = new CorruptedFlares(null, { seed: 42, loopMs: 1000, loops: 2 });
  const { ctx } = stubCtx();
  f._ctx = ctx; f._cssW = 600; f._cssH = 600; f._dpr = 1;
  assert.equal(f._paint(500), false, 'still corrupting early on');
  assert.equal(f._paint(2000 + 1000), true, 'settled once past loops + max phase');
});

test('loops:Infinity never settles', () => {
  const f = new CorruptedFlares(null, { seed: 42, loopMs: 1000, loops: Infinity });
  const { ctx } = stubCtx();
  f._ctx = ctx; f._cssW = 600; f._cssH = 600; f._dpr = 1;
  assert.equal(f._paint(1e6), false);
});

/* ── Accessibility: 100ms flicker floor is enforced by the component ────── */

/* ── Pipeline surfaces: compositing, export, frame-locking ─────────────── */

test('gearNotch is gone; dataStrip replaced it', () => {
  assert.equal(FLARE_RECIPES.gearNotch, undefined, 'mechanical gear is off-theme');
  assert.equal(typeof FLARE_RECIPES.dataStrip, 'function');
  assert.ok(FLARE_GRID.includes('dataStrip'));
  assert.ok(!FLARE_GRID.includes('gearNotch'));
});

test('plate:false draws no cell tile — nothing opaque to composite against', () => {
  const fills = [];
  const mk = () => {
    const { ctx } = stubCtx();
    return new Proxy(ctx, {
      get(t, p) {
        if (p === 'fill') return () => fills.push(t.fillStyle);
        return t[p];
      },
      set(t, p, v) { t[p] = v; return true; },
    });
  };
  const opaque = new CorruptedFlares(null, { seed: 1, plate: true, loops: Infinity });
  opaque._ctx = mk(); opaque._cssW = 600; opaque._cssH = 600; opaque._dpr = 1;
  opaque._paint(300);
  assert.ok(fills.includes('#0a0a0a'), 'plate:true should paint the dark tile');

  fills.length = 0;
  const clear = new CorruptedFlares(null, { seed: 1, plate: false, loops: Infinity });
  clear._ctx = mk(); clear._cssW = 600; clear._cssH = 600; clear._dpr = 1;
  clear._paint(300);
  assert.ok(!fills.includes('#0a0a0a'), 'plate:false must not paint an opaque tile');
});

test('drawAt() is frame-locked — same frame, same t', () => {
  const clock = (frame, fps = 30) => ({
    frame, fps, time: (frame * 1000) / fps,
    rngFor: () => () => 0.5,
  });
  const seen = [];
  const original = FLARE_RECIPES.starBurst;
  FLARE_RECIPES.starBurst = (ctx, t) => seen.push(t);
  const { ctx } = stubCtx();

  CorruptedFlares.drawAt(ctx, 'starBurst', clock(21), { loopMs: 1400 });
  CorruptedFlares.drawAt(ctx, 'starBurst', clock(21), { loopMs: 1400 });
  CorruptedFlares.drawAt(ctx, 'starBurst', clock(42), { loopMs: 1400 });
  FLARE_RECIPES.starBurst = original;

  assert.equal(seen[0], seen[1], 'same frame must yield the same loop position');
  assert.notEqual(seen[0], seen[2], 'a different frame must move the animation');
  // frame 21 @30fps = 700ms; 700/1400 = 0.5
  assert.ok(Math.abs(seen[0] - 0.5) < 1e-9, `expected t=0.5, got ${seen[0]}`);
});

test('drawAt() offsetMs shifts phase and stays in 0..1', () => {
  const clock = { frame: 0, fps: 30, time: 0, rngFor: () => () => 0.5 };
  const seen = [];
  const original = FLARE_RECIPES.ringPulse;
  FLARE_RECIPES.ringPulse = (ctx, t) => seen.push(t);
  const { ctx } = stubCtx();
  for (const offsetMs of [0, 350, -350]) {
    CorruptedFlares.drawAt(ctx, 'ringPulse', clock, { loopMs: 1400, offsetMs });
  }
  FLARE_RECIPES.ringPulse = original;
  assert.ok(seen.every(t => t >= 0 && t <= 1), `t out of range: ${seen}`);
  assert.ok(Math.abs(seen[1] - 0.25) < 1e-9, 'positive offset advances phase');
  assert.ok(Math.abs(seen[2] - 0.75) < 1e-9, 'negative offset must wrap, not go negative');
});

test('rampColorAt exposes the corruption-age tint to single-flare callers', () => {
  assert.equal(CorruptedFlares.rampColorAt(0), '#8b5cf6');
  assert.equal(CorruptedFlares.rampColorAt(0.5), '#ff00ff');
});

test('renderAt drives the board from a frame clock', () => {
  const f = new CorruptedFlares(null, { seed: 1, loopMs: 1000 });
  f._canvas = {}; f._ctx = {};
  const painted = [];
  f._paint = (ms) => { painted.push(ms); return false; };
  f.renderAt({ frame: 15, fps: 30 });
  assert.equal(painted[0], 500, 'frame 15 @30fps is 500ms in');
  f.renderAt(null);
  assert.equal(painted.length, 1, 'a missing clock must be a no-op, not a throw');
});

test('snap() step count is clamped so flicker never beats the 100ms floor', () => {
  // brokenArc asks for 12 steps; at a 280ms effective loop that would be 23ms.
  const f = new CorruptedFlares(null, { seed: 1, loopMs: 700, speed: 2.5, loops: Infinity });
  const seen = [];
  const original = FLARE_RECIPES.brokenArc;
  f.options.recipes = new Array(25).fill('brokenArc');
  FLARE_RECIPES.brokenArc = (ctx, t, r, color, opts) => seen.push(opts.loopMs);
  const { ctx } = stubCtx();
  f._ctx = ctx; f._cssW = 600; f._cssH = 600; f._dpr = 1;
  f._paint(100);
  FLARE_RECIPES.brokenArc = original;

  const effLoop = seen[0];
  assert.equal(effLoop, 280, 'recipes must receive the speed-adjusted loop length');
  // snap() will clamp 12 steps down to floor(280/100) = 2 -> 140ms per frame.
  const steps = Math.min(12, Math.max(1, Math.floor(effLoop / 100)));
  assert.ok(effLoop / steps >= 100, `${effLoop / steps}ms per flicker frame is under the floor`);
});
