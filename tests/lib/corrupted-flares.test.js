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
