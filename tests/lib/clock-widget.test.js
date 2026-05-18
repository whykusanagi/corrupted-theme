import { strict as assert } from 'node:assert';
import { test } from 'node:test';
import { ClockWidget } from '../../src/lib/clock-widget.js';

test('ClockWidget exported as class', () => {
  assert.equal(typeof ClockWidget, 'function');
});

test('ClockWidget constructs without crashing in Node', () => {
  const w = new ClockWidget(null, { timezones: ['UTC'], cycleMs: 1000 });
  if (typeof w.destroy === 'function') w.destroy();
  assert.ok(true);
});

test('ClockWidget has start/stop/destroy methods', () => {
  const w = new ClockWidget(null);
  assert.equal(typeof w.start, 'function');
  assert.equal(typeof w.stop, 'function');
  assert.equal(typeof w.destroy, 'function');
  w.destroy();
});

test('ClockWidget.destroy() is idempotent', () => {
  const w = new ClockWidget(null);
  w.destroy();
  w.destroy(); // should not throw
  assert.ok(true);
});

test('ClockWidget sets _destroyed=true after destroy()', () => {
  const w = new ClockWidget(null);
  w.destroy();
  assert.equal(w._destroyed, true);
});

test('ClockWidget.stop() does not throw when not started', () => {
  const w = new ClockWidget(null);
  w.stop();
  w.destroy();
  assert.ok(true);
});

test('ClockWidget applies default options', () => {
  const w = new ClockWidget(null);
  assert.deepEqual(w.options.timezones, ['America/Los_Angeles']);
  assert.equal(w.options.cycleMs, 10000);
  assert.equal(w.options.format, '12h');
  assert.equal(w.options.showDate, true);
  w.destroy();
});

test('ClockWidget accepts custom options', () => {
  const w = new ClockWidget(null, {
    timezones: ['UTC', 'America/New_York'],
    cycleMs: 3000,
    format: '24h',
    showDate: false,
  });
  assert.deepEqual(w.options.timezones, ['UTC', 'America/New_York']);
  assert.equal(w.options.cycleMs, 3000);
  assert.equal(w.options.format, '24h');
  assert.equal(w.options.showDate, false);
  w.destroy();
});

test('ClockWidget start() does not throw in Node (no DOM)', () => {
  const w = new ClockWidget(null);
  w.start();
  w.destroy();
  assert.ok(true);
});
