// tests/lib/corrupted-graph.test.js — pure-logic tests (no DOM)
import { strict as assert } from 'node:assert';
import { test } from 'node:test';
import { readFileSync } from 'node:fs';
import { CorruptedGraph } from '../../src/lib/corrupted-graph.js';

/** Silence + capture console.warn for one call. */
function captureWarnings(fn) {
  const out = [];
  const real = console.warn;
  console.warn = m => out.push(String(m));
  try { return { result: fn(), warnings: out }; }
  finally { console.warn = real; }
}

const ring = n => ({
  nodes: Array.from({ length: n }, (_, i) => ({ id: `n${i}` })),
  edges: Array.from({ length: n }, (_, i) => ({ source: `n${i}`, target: `n${(i + 1) % n}` })),
});

test('defaults', () => {
  const g = new CorruptedGraph(null);
  assert.equal(g.options.layout, 'force');
  assert.equal(g.options.nodeShape, 'glyph');
  assert.equal(g.options.edgeStyle, 'cable');
  assert.equal(g.options.maxNodes, 2000);
  assert.equal(g.options.maxEdges, 8000);
  assert.equal(g.options.force.linkDistance, 40);
  assert.deepEqual(g.nodes, []);
});

test('edges resolve by id and by numeric index', () => {
  const g = new CorruptedGraph(null, {
    nodes: [{ id: 'a' }, { id: 'b' }, { id: 'c' }],
    edges: [{ source: 'a', target: 'b' }, { source: 1, target: 2 }],
  });
  assert.equal(g.edges.length, 2);
  assert.deepEqual([g.edges[0].a, g.edges[0].b], [0, 1]);
  assert.deepEqual([g.edges[1].a, g.edges[1].b], [1, 2]);
});

test('edge arrays [source, target] are accepted', () => {
  const g = new CorruptedGraph(null, { nodes: [{ id: 'a' }, { id: 'b' }], edges: [['a', 'b']] });
  assert.equal(g.edges.length, 1);
});

test('unresolvable and self-referencing edges are dropped with a counted warning', () => {
  const { result: g, warnings } = captureWarnings(() => new CorruptedGraph(null, {
    nodes: [{ id: 'a' }, { id: 'b' }],
    edges: [
      { source: 'a', target: 'b' },
      { source: 'a', target: 'ghost' },   // unknown target
      { source: 'a', target: 'a' },       // self-loop
      { source: 99, target: 0 },          // index out of range
      null,
    ],
  }));
  assert.equal(g.edges.length, 1);
  assert.ok(warnings.some(w => /dropped 4 edge\(s\)/.test(w)), warnings.join(' | '));
});

test('a bad edge index can never reach the draw loop (S5 regression)', () => {
  const g = new CorruptedGraph(null, {
    nodes: [{ id: 'a' }, { id: 'b' }],
    edges: [{ source: 0, target: 5 }],
  });
  // Every surviving endpoint must index a real node — the draw loop does no
  // validation of its own, so an out-of-range index would throw mid-rAF.
  for (const e of g.edges) {
    assert.ok(g.nodes[e.a], 'edge source resolves');
    assert.ok(g.nodes[e.b], 'edge target resolves');
  }
});

test('nodes without an id are dropped with a warning', () => {
  const { result: g, warnings } = captureWarnings(() =>
    new CorruptedGraph(null, { nodes: [{ id: 'a' }, {}, null, { id: 0 }] }));
  assert.equal(g.nodes.length, 2, 'id 0 is valid, missing/null are not');
  assert.ok(warnings.some(w => /dropped 2 node\(s\) with no id/.test(w)));
});

test('maxNodes truncates loudly, never silently (S4)', () => {
  const { result: g, warnings } = captureWarnings(() =>
    new CorruptedGraph(null, { ...ring(50), maxNodes: 10 }));
  assert.equal(g.nodes.length, 10);
  assert.ok(warnings.some(w => /exceeds maxNodes=10; dropped 40/.test(w)), warnings.join(' | '));
});

test('maxEdges truncates loudly', () => {
  const { result: g, warnings } = captureWarnings(() =>
    new CorruptedGraph(null, { ...ring(30), maxEdges: 5 }));
  assert.equal(g.edges.length, 5);
  assert.ok(warnings.some(w => /maxEdges=5/.test(w)), warnings.join(' | '));
});

test('degree is counted from surviving edges', () => {
  const g = new CorruptedGraph(null, {
    nodes: [{ id: 'hub' }, { id: 'a' }, { id: 'b' }, { id: 'c' }],
    edges: [{ source: 'hub', target: 'a' }, { source: 'hub', target: 'b' }, { source: 'hub', target: 'c' }],
  });
  assert.equal(g.nodes.find(n => n.id === 'hub').degree, 3);
  assert.equal(g.nodes.find(n => n.id === 'a').degree, 1);
});

test('force layout settles every node into [0,1] on both axes', () => {
  const g = new CorruptedGraph(null, ring(24));
  for (const n of g.nodes) {
    assert.ok(Number.isFinite(n.x) && Number.isFinite(n.y), `${n.id} has finite position`);
    assert.ok(n.x >= 0 && n.x <= 1, `${n.id}.x in range: ${n.x}`);
    assert.ok(n.y >= 0 && n.y <= 1, `${n.id}.y in range: ${n.y}`);
  }
});

test('force layout is deterministic — same input, same positions', () => {
  const a = new CorruptedGraph(null, ring(16));
  const b = new CorruptedGraph(null, ring(16));
  assert.deepEqual(a.nodes.map(n => [n.x, n.y]), b.nodes.map(n => [n.x, n.y]));
});

test('force layout separates connected nodes rather than collapsing them', () => {
  const g = new CorruptedGraph(null, ring(12));
  const dists = [];
  for (let i = 0; i < g.nodes.length; i++) {
    for (let j = i + 1; j < g.nodes.length; j++) {
      dists.push(Math.hypot(g.nodes[i].x - g.nodes[j].x, g.nodes[i].y - g.nodes[j].y));
    }
  }
  assert.ok(Math.min(...dists) > 0.001, 'no two nodes land on the same point');
  assert.ok(Math.max(...dists) > 0.5, 'the graph actually spreads across the frame');
});

test('bipartite layout puts leftTypes in one column and the rest in the other', () => {
  const g = new CorruptedGraph(null, {
    layout: 'bipartite',
    bipartite: { leftTypes: ['account'], gap: 0.6 },
    nodes: [
      { id: 'u1', type: 'account' }, { id: 'u2', type: 'account' },
      { id: 'ip1', type: 'ip' }, { id: 'ip2', type: 'ip' }, { id: 'ip3', type: 'ip' },
    ],
    edges: [{ source: 'u1', target: 'ip1' }, { source: 'u2', target: 'ip1' }],
  });
  const left = g.nodes.filter(n => n.type === 'account');
  const right = g.nodes.filter(n => n.type === 'ip');
  assert.ok(left.every(n => n.x === 0.2), 'left column at 0.5 - gap/2');
  assert.ok(right.every(n => n.x === 0.8), 'right column at 0.5 + gap/2');
  assert.ok(right.every(n => n.y >= 0 && n.y <= 1));
});

test('bipartite sorts each column by degree, hubs first', () => {
  const g = new CorruptedGraph(null, {
    layout: 'bipartite',
    bipartite: { leftTypes: ['a'] },
    nodes: [{ id: 'lonely', type: 'a' }, { id: 'hub', type: 'a' }, { id: 'x', type: 'b' }, { id: 'y', type: 'b' }],
    edges: [{ source: 'hub', target: 'x' }, { source: 'hub', target: 'y' }],
  });
  const left = g.nodes.filter(n => n.type === 'a').sort((p, q) => p.y - q.y);
  assert.equal(left[0].id, 'hub', 'highest degree sorts to the top of the column');
});

test('a single-node column is centred rather than dividing by zero', () => {
  const g = new CorruptedGraph(null, {
    layout: 'bipartite',
    bipartite: { leftTypes: ['solo'] },
    nodes: [{ id: 'only', type: 'solo' }, { id: 'x', type: 'other' }],
  });
  const solo = g.nodes.find(n => n.id === 'only');
  assert.equal(solo.y, 0.5);
  assert.ok(Number.isFinite(solo.y));
});

test('layout: fixed honours supplied coordinates, normalised', () => {
  const g = new CorruptedGraph(null, {
    layout: 'fixed',
    nodes: [{ id: 'a', x: 10, y: 100 }, { id: 'b', x: 30, y: 300 }],
  });
  assert.deepEqual([g.nodes[0].x, g.nodes[0].y], [0, 0]);
  assert.deepEqual([g.nodes[1].x, g.nodes[1].y], [1, 1]);
});

test('node type colours come from the theme palette, never the cyan accent', () => {
  const g = new CorruptedGraph(null, {
    nodes: [{ id: 'a', type: 't1' }, { id: 'b', type: 't2' }, { id: 'c', type: 't3' }, { id: 'd', type: 't4' }],
  });
  const used = [...g._typeColor.values()];
  assert.ok(!used.includes('#00ffff'), 'cyan is a highlight accent, not a node colour');
  for (const c of used) assert.ok(['#ffffff', '#ff00ff', '#8b5cf6', '#d94f90'].includes(c), c);
});

test('explicit nodeColors override the palette rotation', () => {
  const g = new CorruptedGraph(null, {
    nodeColors: { ip: '#123456' },
    nodes: [{ id: 'a', type: 'ip' }],
  });
  assert.equal(g._typeColor.get('ip'), '#123456');
});

test('glyphs are stable for a given id across instances', () => {
  const a = new CorruptedGraph(null, { nodes: [{ id: 'stable-id' }] });
  const b = new CorruptedGraph(null, { nodes: [{ id: 'stable-id' }] });
  assert.equal(a.nodes[0].glyph, b.nodes[0].glyph);
  assert.equal(typeof a.nodes[0].glyph, 'string');
  assert.equal(a.nodes[0].glyph.length, 1);
});

test('search() dims non-matches; empty query clears the filter', () => {
  const g = new CorruptedGraph(null, {
    nodes: [{ id: 'alpha', type: 'x' }, { id: 'beta', type: 'y' }],
  });
  g.search('alph');
  assert.equal(g._visible(g.nodes[0]), true);
  assert.equal(g._visible(g.nodes[1]), false);
  g.search('');
  assert.ok(g.nodes.every(n => g._visible(n)), 'cleared filter shows everything');
});

test('search matches on type as well as id', () => {
  const g = new CorruptedGraph(null, { nodes: [{ id: 'n1', type: 'account' }] });
  g.search('account');
  assert.equal(g._visible(g.nodes[0]), true);
});

test('setFilter accepts a predicate and null clears it', () => {
  const g = new CorruptedGraph(null, { nodes: [{ id: 'a' }, { id: 'b' }] });
  g.setFilter(n => n.id === 'a');
  assert.equal(g._visible(g.nodes[1]), false);
  g.setFilter(null);
  assert.equal(g._visible(g.nodes[1]), true);
});

test('setData replaces rather than appends', () => {
  const g = new CorruptedGraph(null, ring(8));
  g.setData(ring(3));
  assert.equal(g.nodes.length, 3);
  assert.equal(g.edges.length, 3);
});

test('an empty graph is safe to construct and lay out', () => {
  const g = new CorruptedGraph(null, { nodes: [], edges: [] });
  assert.deepEqual(g.nodes, []);
  assert.doesNotThrow(() => g.layout());
});

test('destroy() is idempotent and releases references', () => {
  const g = new CorruptedGraph(null, ring(5));
  g.destroy();
  g.destroy();
  assert.deepEqual(g.nodes, []);
  assert.deepEqual(g.edges, []);
  assert.equal(g.ctx, null);
});

test('setPointerCapture failure cannot abort the pointerdown handler', () => {
  // setPointerCapture throws NotFoundError for an id the browser no longer
  // considers active. Uncaught, that aborts pointerdown and silently breaks
  // dragging — found in the browser, guarded here.
  const src = readFileSync(new URL('../../src/lib/corrupted-graph.js', import.meta.url), 'utf8');
  assert.match(src, /try\s*\{\s*el\.setPointerCapture/, 'capture must be wrapped in try/catch');

  const globe = readFileSync(new URL('../../src/lib/corrupted-globe.js', import.meta.url), 'utf8');
  assert.match(globe, /try\s*\{\s*this\.canvas\.setPointerCapture/, 'globe has the same guard');
});

test('the component builds no HTML — onSelect receives raw data (S6)', () => {
  // Untrusted node metadata must never become markup inside the component.
  const src = readFileSync(new URL('../../src/lib/corrupted-graph.js', import.meta.url), 'utf8');
  assert.ok(!/innerHTML/.test(src), 'no innerHTML anywhere in the module');
  assert.ok(!/document\.createElement/.test(src), 'the graph renders to canvas only');
});
