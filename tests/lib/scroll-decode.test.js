// tests/lib/scroll-decode.test.js — option + pure-helper logic (DOM lifecycle browser-verified)
import { strict as assert } from 'node:assert';
import { test } from 'node:test';
import { ScrollDecode } from '../../src/lib/scroll-decode.js';
import { seededRandom } from '../../src/core/random-utils.js';
import { CorruptionCharsets } from '../../src/core/corruption-charsets.js';

const el = () => ({ textContent: 'ABYSS ONLINE' });

test('defaults: threshold 0.1, rearm/progress off, duration 2000', () => {
  const s = new ScrollDecode(el());
  assert.equal(s.options.threshold, 0.1);
  assert.equal(s.options.rearm, false);
  assert.equal(s.options.progress, false);
  assert.equal(s.options.duration, 2000);
  assert.equal(s.options.charset, CorruptionCharsets.standard);
});

test('scramble: p=1 returns target verbatim; p=0 preserves only spaces', () => {
  const text = 'AB CD';
  assert.equal(ScrollDecode.scramble(text, 1, 'X'), text);
  const noisy = ScrollDecode.scramble(text, 0, 'X', seededRandom(1));
  assert.equal(noisy, 'XX XX');
  assert.equal(noisy.length, text.length);
});

test('scramble is deterministic with an injected rng and clamps progress', () => {
  const cs = CorruptionCharsets.standard;
  assert.equal(
    ScrollDecode.scramble('SIGNAL', 0.5, cs, seededRandom(9)),
    ScrollDecode.scramble('SIGNAL', 0.5, cs, seededRandom(9))
  );
  assert.equal(ScrollDecode.scramble('SIGNAL', 7, cs), 'SIGNAL');   // clamp high
  const low = ScrollDecode.scramble('SIGNAL', -3, cs, seededRandom(2));
  assert.equal(low.length, 6);                                       // clamp low
  assert.notEqual(low, 'SIGNAL');
});

test('viewportProgress: 0 below viewport, 1 fully traversed, monotonic', () => {
  const vh = 1000;
  const rect = (top) => ({ top, height: 100 });
  assert.equal(ScrollDecode.viewportProgress(rect(1000), vh), 0);
  assert.equal(ScrollDecode.viewportProgress(rect(-1000), vh), 1);
  const a = ScrollDecode.viewportProgress(rect(800), vh);
  const b = ScrollDecode.viewportProgress(rect(400), vh);
  assert.ok(b > a && a > 0 && b < 1);
});

test('captures target text at construction', () => {
  const s = new ScrollDecode(el());
  assert.equal(s._text, 'ABYSS ONLINE');
});
