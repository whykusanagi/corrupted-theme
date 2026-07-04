// tests/lib/corrupted-timeline.test.js — scheduler semantics with mock timers
import { strict as assert } from 'node:assert';
import { test } from 'node:test';
import { CorruptedTimeline } from '../../src/lib/corrupted-timeline.js';
import { EASINGS, STAGGER } from '../../src/core/corruption-easings.js';

// Fake item following the (cb) contract; records start order and completes
// after `duration` mocked ms.
// Note: nested timers under node mock-timers resolve against the end-of-tick
// clock, so ticks below are generous. stop() cancels the internal timer like
// real blocks do.
const makeItem = (log, name, duration = 100) => {
  let id = null;
  return {
    play(cb) { log.push(`start:${name}`); id = setTimeout(() => { log.push(`end:${name}`); cb(); }, duration); },
    stop() { clearTimeout(id); },
  };
};

test('relative "+=0" chains strictly after previous completion', (t) => {
  t.mock.timers.enable({ apis: ['setTimeout'] });
  const log = [];
  new CorruptedTimeline()
    .add(makeItem(log, 'a', 100))
    .add(makeItem(log, 'b', 100), '+=0')
    .play();
  t.mock.timers.tick(50);
  assert.deepEqual(log, ['start:a']);
  t.mock.timers.tick(200);
  assert.deepEqual(log, ['start:a', 'end:a', 'start:b']);
  t.mock.timers.tick(400);
  assert.ok(log.includes('end:b'));
});

test('absolute offsets schedule in time order regardless of add order', (t) => {
  t.mock.timers.enable({ apis: ['setTimeout'] });
  const log = [];
  new CorruptedTimeline()
    .add(makeItem(log, 'late', 10), 500)
    .add(makeItem(log, 'early', 10), 100)
    .play();
  t.mock.timers.tick(150);
  assert.deepEqual(log.filter(l => l.startsWith('start')), ['start:early']);
  t.mock.timers.tick(400);
  assert.deepEqual(log.filter(l => l.startsWith('start')), ['start:early', 'start:late']);
});

test('label offset resolves to the labeled entry completion', (t) => {
  t.mock.timers.enable({ apis: ['setTimeout'] });
  const log = [];
  new CorruptedTimeline()
    .add(makeItem(log, 'a', 200))
    .label('mark')
    .add(makeItem(log, 'b', 50), '+=0')
    .add(makeItem(log, 'c', 10), 'mark')   // fires when a ends, parallel to b
    .play();
  t.mock.timers.tick(10);   // fire schedulers (nested timers land post-tick)
  t.mock.timers.tick(300);  // a ends (200ms)
  t.mock.timers.tick(300);  // waiters released
  assert.ok(log.includes('start:b') && log.includes('start:c'));
});

test('onComplete fires exactly once after all entries', (t) => {
  t.mock.timers.enable({ apis: ['setTimeout'] });
  const log = [];
  let completions = 0;
  new CorruptedTimeline({ onComplete: () => completions++ })
    .add(makeItem(log, 'a', 50))
    .add(makeItem(log, 'b', 50), '+=25')
    .play();
  // split ticks: nested timers land after each tick target
  for (let i = 0; i < 6; i++) t.mock.timers.tick(100);
  assert.equal(completions, 1);
});

test('seek skips absolute entries before position', (t) => {
  t.mock.timers.enable({ apis: ['setTimeout'] });
  const log = [];
  const tl = new CorruptedTimeline()
    .add(makeItem(log, 'a', 10), 100)
    .add(makeItem(log, 'b', 10), 1000);
  tl.seek(500);
  t.mock.timers.tick(600);
  assert.ok(!log.includes('start:a'), 'a skipped');
  assert.ok(log.includes('start:b'), 'b plays at 1000-500');
});

test('destroy cancels pending starts (no callbacks after)', (t) => {
  t.mock.timers.enable({ apis: ['setTimeout'] });
  const log = [];
  const tl = new CorruptedTimeline()
    .add(makeItem(log, 'a', 100))
    .add(makeItem(log, 'b', 100), '+=0')
    .play();
  t.mock.timers.tick(50);
  tl.destroy();
  t.mock.timers.tick(2000);
  assert.deepEqual(log, ['start:a']);
});

test('promise-style play() (animation-blocks contract) completes the chain', async (t) => {
  const log = [];
  const promiseItem = {
    play() { log.push('start:p'); return Promise.resolve().then(() => log.push('end:p')); },
    stop() {},
  };
  await new Promise((resolve) => {
    new CorruptedTimeline({ onComplete: resolve })
      .add(promiseItem)
      .play();
  });
  assert.deepEqual(log, ['start:p', 'end:p']);
});

test('EASINGS + STAGGER presets', () => {
  assert.match(EASINGS.glitchSnap, /^cubic-bezier/);
  assert.match(EASINGS.terminalStep, /^steps/);
  // 3x3 grid: center element 4 → 0 delay; corner 0 → sqrt(2)*wave
  assert.equal(STAGGER.rippleFromCenter(4, 9, 3, 80), 0);
  assert.equal(STAGGER.rippleFromCenter(0, 9, 3, 80), Math.round(Math.SQRT2 * 80));
  assert.equal(STAGGER.rippleFrom(0, 3, [0, 0], 80), 0);
  // wave floor clamps to 40 (spec Pattern 4)
  assert.equal(STAGGER.rippleFrom(1, 3, [0, 0], 10), 40);
});
