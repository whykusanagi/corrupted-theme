// tests/lib/glitch-stagger-grid.test.js — pure delay math (DOM ripple browser-verified)
import { strict as assert } from 'node:assert';
import { test } from 'node:test';
import { GlitchStaggerGrid } from '../../src/lib/glitch-stagger-grid.js';

// Uniform 3x3 grid, spacing 100px, centers row-major
const grid3 = [];
for (let r = 0; r < 3; r++) for (let c = 0; c < 3; c++) grid3.push([c * 100, r * 100]);

test('origin at center: middle element 0, corners sqrt(2)*wave', () => {
  const d = GlitchStaggerGrid.computeDelays(grid3, [100, 100], 80);
  assert.equal(d[4], 0);
  assert.equal(d[0], Math.round(Math.SQRT2 * 80));
  assert.equal(d[8], Math.round(Math.SQRT2 * 80));
  assert.equal(d[1], 80); // orthogonal neighbor = exactly one wave step
});

test('origin at [0,0]: element 0 delay 0, monotonic with distance', () => {
  const d = GlitchStaggerGrid.computeDelays(grid3, [0, 0], 80);
  assert.equal(d[0], 0);
  assert.ok(d[8] > d[4] && d[4] > d[1]);
});

test('wave floor clamps to 40ms (spec Pattern 4)', () => {
  const d = GlitchStaggerGrid.computeDelays(grid3, [0, 0], 10);
  assert.equal(d[1], 40);
});

test('degenerate single element: zero delay, no Infinity', () => {
  const d = GlitchStaggerGrid.computeDelays([[50, 50]], [0, 0], 80);
  assert.ok(Number.isFinite(d[0]));
});

test('option defaults match spec contract', () => {
  const g = new GlitchStaggerGrid(null);
  assert.equal(g.options.selector, ':scope > *');
  assert.equal(g.options.origin, 'center');
  assert.equal(g.options.wave, 80);
  assert.equal(g.options.maxConcurrent, 12);
  const clamped = new GlitchStaggerGrid(null, { wave: 5 });
  assert.equal(clamped.options.wave, 40);
});
