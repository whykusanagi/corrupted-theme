// tests/lib/corrupted-globe.test.js — pure-logic tests (no DOM)
import { strict as assert } from 'node:assert';
import { test } from 'node:test';
import { CorruptedGlobe } from '../../src/lib/corrupted-globe.js';

/** Build a globe with no canvas and a known projection frame. */
function stubGlobe(options = {}) {
  const g = new CorruptedGlobe(null, { tilt: 0, ...options });
  g._cssW = 400;
  g._cssH = 400;
  g._R = 100;
  return g;
}

test('defaults', () => {
  const g = new CorruptedGlobe(null);
  assert.deepEqual(g.options.origin, { lat: 0, lon: 0 });
  assert.equal(g.options.spin, 0.0009);
  assert.equal(g.options.radius, 0.42);
  assert.equal(g.options.arc.duration, 1400);
  assert.equal(g.options.arc.impactRing, true);
  assert.deepEqual(g.options.graticule, { parallels: 30, meridians: 30 });
  assert.equal(g.options.interactive.drag, true);
  assert.deepEqual(g.arcs, []);
});

test('graticule: false disables, partial object merges over defaults', () => {
  assert.equal(new CorruptedGlobe(null, { graticule: false }).options.graticule, false);
  assert.deepEqual(
    new CorruptedGlobe(null, { graticule: { parallels: 15 } }).options.graticule,
    { parallels: 15, meridians: 30 }
  );
});

test('invalid origin falls back to 0,0 rather than producing NaN geometry', () => {
  const g = new CorruptedGlobe(null, { origin: { lat: 'x', lon: 12 } });
  assert.deepEqual(g.options.origin, { lat: 0, lon: 0 });
});

test('setPoints drops invalid coordinates and warns (never silently)', () => {
  const warnings = [];
  const realWarn = console.warn;
  console.warn = m => warnings.push(m);
  try {
    const g = new CorruptedGlobe(null, {
      points: [
        { lat: 10, lon: 20 },
        { lat: 91, lon: 0 },        // lat out of range
        { lat: 0, lon: 181 },       // lon out of range
        { lat: NaN, lon: 0 },       // non-finite
        null,
      ],
    });
    assert.equal(g.points.length, 1);
    assert.deepEqual(g.points[0], { lat: 10, lon: 20 });
    assert.equal(warnings.length, 1);
    assert.match(warnings[0], /dropped 4 point\(s\)/);
  } finally {
    console.warn = realWarn;
  }
});

test('rampColor buckets weight across the palette, clamping at 1', () => {
  const g = new CorruptedGlobe(null);
  const [low, mid, high] = g.options.palette.ramp;
  assert.equal(g.rampColor(0), low);
  assert.equal(g.rampColor(0.5), mid);
  assert.equal(g.rampColor(0.9), high);
  assert.equal(g.rampColor(1), high, 'weight 1 must not index past the ramp');
});

test('fire() defaults `to` to origin, clamps weight, rejects bad `from`', () => {
  const g = new CorruptedGlobe(null, { origin: { lat: 37, lon: -122 } });

  g.fire({ lat: 51, lon: 0 }, { weight: 0.9 });
  assert.equal(g.arcs.length, 1);
  assert.deepEqual(g.arcs[0].to, { lat: 37, lon: -122 });
  assert.equal(g.arcs[0].t, 0);

  g.fire({ lat: 51, lon: 0 }, { weight: 5 });
  assert.equal(g.arcs[1].width, 0.6 + 1 * 2.6, 'weight clamps to 1');

  g.fire({ lat: 999, lon: 0 });
  assert.equal(g.arcs.length, 2, 'invalid `from` is rejected');
});

test('fire() honours an explicit `to` and colour override', () => {
  const g = new CorruptedGlobe(null);
  g.fire({ lat: 0, lon: 0 }, { to: { lat: 10, lon: 10 }, color: '#abcdef' });
  assert.deepEqual(g.arcs[0].to, { lat: 10, lon: 10 });
  assert.equal(g.arcs[0].color, '#abcdef');
});

test('the arc queue is bounded while the render loop is stopped', () => {
  // Arcs only expire inside the draw loop, and the IntersectionObserver stops
  // that loop when the globe scrolls out of view. Unbounded, a caller firing
  // on a timer queues forever and then animates the whole backlog at once.
  const g = new CorruptedGlobe(null, { maxArcs: 50 });
  for (let i = 0; i < 5000; i++) g.fire({ lat: 51, lon: 0 });
  assert.equal(g.arcs.length, 50, 'queue is capped');
});

test('the cap drops the OLDEST arc, so the newest are the ones shown', () => {
  const g = new CorruptedGlobe(null, { maxArcs: 3 });
  for (const lat of [10, 20, 30, 40, 50]) g.fire({ lat, lon: 0 });
  assert.deepEqual(g.arcs.map(a => a.from.lat), [30, 40, 50]);
});

test('maxArcs defaults sensibly and cannot be zero', () => {
  assert.equal(new CorruptedGlobe(null).options.maxArcs, 200);
  assert.equal(new CorruptedGlobe(null, { maxArcs: 0 }).options.maxArcs, 1);
  assert.equal(new CorruptedGlobe(null, { maxArcs: -5 }).options.maxArcs, 1);
});

test('greatCircle: endpoints exact, equator midpoint is the true midpoint', () => {
  const near = (a, b, eps = 1e-9) => assert.ok(Math.abs(a - b) < eps, `${a} !== ${b}`);

  const [lat0, lon0] = CorruptedGlobe.greatCircle(0, 0, 0, 90, 0);
  near(lat0, 0); near(lon0, 0);

  const [lat1, lon1] = CorruptedGlobe.greatCircle(0, 0, 0, 90, 1);
  near(lat1, 0); near(lon1, 90);

  const [latM, lonM] = CorruptedGlobe.greatCircle(0, 0, 0, 90, 0.5);
  near(latM, 0, 1e-9);
  near(lonM, 45, 1e-9);
});

test('greatCircle: a great circle bulges poleward of the naive lat average', () => {
  // Two points at 60N, 120 degrees apart. The great-circle midpoint sits
  // NORTH of 60N — that poleward bulge is the whole point of slerping
  // instead of lerping lat/lon.
  const [lat] = CorruptedGlobe.greatCircle(60, -60, 60, 60, 0.5);
  assert.ok(lat > 60, `expected poleward bulge, got ${lat}`);
});

test('greatCircle: coincident endpoints return the start, not NaN', () => {
  const [lat, lon] = CorruptedGlobe.greatCircle(45, 10, 45, 10, 0.5);
  assert.equal(lat, 45);
  assert.equal(lon, 10);
});

test('proj: centre of the visible face maps to canvas centre', () => {
  const g = stubGlobe();
  const p = g.proj(0, 0);
  assert.equal(p.x, 200);
  assert.equal(p.y, 200);
  assert.equal(p.vis, true);
});

test('proj: a point on the far side is hidden', () => {
  const g = stubGlobe();
  assert.equal(g.proj(0, 180).vis, false);
});

test('proj: the limb itself stays visible (hypot >= 1 branch)', () => {
  const g = stubGlobe();
  assert.equal(g.proj(0, 90).vis, true);
});

test('proj: lifting an arc past the limb keeps it visible — the two-part vis rule', () => {
  // This is the subtle clause. A point just past the limb is behind the
  // sphere (z < 0) AND inside the silhouette, so it is hidden at the
  // surface. Lift it and it moves outside the silhouette, so it must
  // become visible again. Simplifying vis to `z > 0` breaks arcs at the edge.
  const g = stubGlobe();
  const surface = g.proj(0, 100);
  const lifted  = g.proj(0, 100, 1.2);
  assert.equal(surface.vis, false, 'at the surface it is occluded');
  assert.equal(lifted.vis, true, 'lifted off the surface it clears the limb');
  assert.ok(lifted.z < 0, 'still behind the sphere — visibility is not just depth');
});

test('proj: rotation moves the visible face', () => {
  const g = stubGlobe();
  assert.equal(g.proj(0, 180).vis, false);
  g.rot = Math.PI;
  assert.equal(g.proj(0, 180).vis, true, 'half a turn brings the far side to front');
});

test('reducedMotion: explicit boolean overrides the media query', () => {
  assert.equal(new CorruptedGlobe(null, { reducedMotion: true })._prefersReducedMotion(), true);
  assert.equal(new CorruptedGlobe(null, { reducedMotion: false })._prefersReducedMotion(), false);
});

test('reducedMotion "auto" is safe with no matchMedia (node/SSR)', () => {
  const g = new CorruptedGlobe(null, { reducedMotion: 'auto' });
  assert.equal(g._prefersReducedMotion(), false);
});

test('destroy() is idempotent and releases references', () => {
  const g = new CorruptedGlobe(null);
  g.fire({ lat: 1, lon: 1 });
  g.destroy();
  g.destroy();
  assert.equal(g.canvas, null);
  assert.equal(g.ctx, null);
  assert.deepEqual(g.arcs, []);
  assert.equal(g.fire({ lat: 2, lon: 2 }).arcs.length, 0, 'fire() is inert after destroy');
});
