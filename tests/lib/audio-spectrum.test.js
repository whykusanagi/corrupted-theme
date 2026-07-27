// tests/lib/audio-spectrum.test.js — construction, option handling and the
// privacy/footgun invariants. Rendering and the audio graph need a browser.
import { strict as assert } from 'node:assert';
import { test } from 'node:test';
import { readFileSync } from 'node:fs';
import { AudioSpectrum } from '../../src/lib/audio-spectrum.js';

const SRC = readFileSync(new URL('../../src/lib/audio-spectrum.js', import.meta.url), 'utf8');
const CODE = SRC.replace(/\/\*[\s\S]*?\*\//g, '').replace(/^\s*\/\/.*$/gm, '');

test('defaults', () => {
  const s = new AudioSpectrum(null);
  assert.equal(s.options.fftSize, 256);
  assert.equal(s.options.bands, 48);
  assert.equal(s.options.smoothing, 0.8);
  assert.equal(s.options.style, 'bars');
  assert.equal(s.options.reconnectDestination, true);
  assert.deepEqual(s.levels, { bass: 0, mid: 0, treble: 0, rms: 0 });
});

test('fftSize is coerced to a power of two in the range AnalyserNode accepts', () => {
  // AnalyserNode throws on anything else, and the failure is opaque.
  const of = v => new AudioSpectrum(null, { fftSize: v }).options.fftSize;
  assert.equal(of(1000), 1024, 'rounds to the nearest power of two');
  assert.equal(of(2048), 2048, 'exact powers pass through');
  assert.equal(of(1), 32, 'clamps up to the minimum');
  assert.equal(of(999999), 32768, 'clamps down to the maximum');
  assert.equal(of(NaN), 256, 'non-finite falls back to the default');
  for (const v of [1, 33, 100, 5000, 1e9]) {
    const n = of(v);
    assert.ok(Number.isInteger(Math.log2(n)), `${v} -> ${n} is a power of two`);
  }
});

test('bands and smoothing are clamped to sane ranges', () => {
  assert.equal(new AudioSpectrum(null, { bands: 0 }).options.bands, 4);
  assert.equal(new AudioSpectrum(null, { bands: 9999 }).options.bands, 256);
  assert.equal(new AudioSpectrum(null, { smoothing: -3 }).options.smoothing, 0);
  assert.equal(new AudioSpectrum(null, { smoothing: 9 }).options.smoothing, 1);
});

test('an empty palette falls back rather than producing undefined fills', () => {
  assert.deepEqual(new AudioSpectrum(null, { palette: [] }).options.palette,
    ['#ffffff', '#d94f90', '#ff00ff']);
  assert.deepEqual(new AudioSpectrum(null, { palette: ['#abcdef'] }).options.palette, ['#abcdef']);
});

test('bandRanges merge over the defaults', () => {
  const s = new AudioSpectrum(null, { bandRanges: { bass: [0, 0.2] } });
  assert.deepEqual(s.options.bandRanges.bass, [0, 0.2]);
  assert.deepEqual(s.options.bandRanges.treble, [0.4, 1], 'untouched ranges survive');
});

test('start/stop/destroy are safe with no canvas and no audio', () => {
  const s = new AudioSpectrum(null);
  assert.doesNotThrow(() => { s.start(); s.stop(); s.destroy(); s.destroy(); });
  assert.equal(s.canvas, null);
  assert.equal(s.ctx, null);
});

test('setSource is chainable and clears the previous node', () => {
  const s = new AudioSpectrum(null);
  assert.equal(s.setSource(null), s);
  assert.equal(s.options.source, null);
});

/* ── invariants that must hold in the source itself ─────────────────────── */

test('S8 privacy: the component never opens a microphone itself', () => {
  assert.ok(!/getUserMedia/.test(CODE),
    'obtaining a MediaStream must stay the caller\'s explicit decision');
  assert.ok(!/getDisplayMedia/.test(CODE));
});

test('S9: a media element stays audible, and a stream is not echoed back', () => {
  // createMediaElementSource reroutes the element's output; without a
  // reconnect the audio goes silent and reads as "the component broke it".
  assert.match(CODE, /reconnectDestination: options\.reconnectDestination \?\? true/);
  assert.match(CODE, /this\._analyser\.connect\(ac\.destination\)/);
  // Reconnecting a live mic to destination would feed it straight back out.
  const guard = CODE.match(/if \(this\.options\.reconnectDestination[\s\S]*?\n\s*\}/)[0];
  assert.match(guard, /!\(typeof MediaStream !== 'undefined' && src instanceof MediaStream\)/,
    'streams must be excluded from the destination reconnect');
});

test('an AudioNode source joins its own context instead of a new one', () => {
  // Nodes cannot be connected across AudioContexts. Creating our own and then
  // connecting the caller's node throws InvalidAccessError on the first
  // connect — found in the browser with a real oscillator graph.
  assert.match(CODE, /this\._audioCtx = src\.context;\s*\n\s*this\._ownsContext = false;/);
  // The source type must be decided BEFORE any context is constructed.
  const fn = CODE.match(/_ensureGraph\(\) \{[\s\S]*?\n  \}/)[0];
  assert.ok(fn.indexOf('const isNode =') < fn.indexOf('new Ctx()'),
    'source type is resolved before a context is created');
});

test('the AudioContext is only closed when this instance created it', () => {
  // Closing a context the caller owns would kill their whole audio graph.
  assert.match(CODE, /this\._ownsContext = true/);
  assert.match(CODE, /if \(this\._ownsContext && this\._audioCtx\)/);
});

test('cyan marks only the peak band; the bars use theme colours', () => {
  assert.match(CODE, /const DEFAULT_PALETTE = \['#ffffff', '#d94f90', '#ff00ff'\]/);
  assert.match(CODE, /const PEAK = '#00ffff'/);
  assert.ok(!/DEFAULT_PALETTE = \[[^\]]*00ffff/.test(CODE),
    'the accent must not appear in the ramp itself');
});
