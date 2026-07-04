// tests/core/time-utils.test.js
import { strict as assert } from 'node:assert';
import { test } from 'node:test';
import { formatTime24h, formatTime12h, formatDate, formatDateTime, timeAgo, formatDuration, parseTimestamp, seekAnimations } from '../../src/core/time-utils.js';

test('formatTime24h produces HH:MM', () => {
  const d = new Date(2026, 4, 16, 14, 30);
  const out = formatTime24h(d);
  assert.match(out, /^\d{2}:\d{2}/);
});

test('formatTime24h produces 24-hour values (14 not 2)', () => {
  const d = new Date(2026, 4, 16, 14, 30);
  const out = formatTime24h(d);
  assert.ok(out.startsWith('14:') || out.includes('14'));
});

test('formatTime12h includes AM/PM', () => {
  const d = new Date(2026, 4, 16, 14, 30);
  const out = formatTime12h(d);
  assert.match(out, /AM|PM/);
});

test('formatDate returns a non-empty string', () => {
  const d = new Date(2026, 4, 16);
  const out = formatDate(d);
  assert.equal(typeof out, 'string');
  assert.ok(out.length > 0);
});

test('formatDate includes year 2026', () => {
  const d = new Date(2026, 4, 16);
  const out = formatDate(d);
  assert.ok(out.includes('2026'));
});

test('formatDateTime combines date and time', () => {
  const d = new Date(2026, 4, 16, 14, 30);
  const out = formatDateTime(d);
  assert.equal(typeof out, 'string');
  assert.ok(out.includes('2026'));
});

// formatDuration takes seconds (not milliseconds) — matches source
test('formatDuration(60) returns "1m" or similar', () => {
  const out = formatDuration(60);
  assert.equal(typeof out, 'string');
  assert.ok(out.includes('m'));
});

test('formatDuration(3661) includes hours, minutes, seconds', () => {
  const out = formatDuration(3661);
  assert.ok(out.includes('h'));
  assert.ok(out.includes('m'));
  assert.ok(out.includes('s'));
});

test('formatDuration(0) returns "0s"', () => {
  assert.equal(formatDuration(0), '0s');
});

test('formatDuration(3600) returns "1h"', () => {
  assert.equal(formatDuration(3600), '1h');
});

test('timeAgo returns a string', () => {
  const out = timeAgo(new Date(Date.now() - 5000));
  assert.equal(typeof out, 'string');
  assert.ok(out.includes('s ago'));
});

test('timeAgo for 2 minutes ago includes m', () => {
  const out = timeAgo(new Date(Date.now() - 120000));
  assert.ok(out.includes('m ago'));
});

test('parseTimestamp parses ISO string to Date', () => {
  const d = parseTimestamp('2026-05-16T14:30:00.000Z');
  assert.ok(d instanceof Date);
  assert.equal(d.getUTCFullYear(), 2026);
});

// --- seekAnimations — 0.3.0 ---

test('seekAnimations pauses and phase-locks every animated element', () => {
  const els = [{ style: {} }, { style: {} }];
  const root = { querySelectorAll: (sel) => (sel === '*' ? els : []) };
  seekAnimations(root, 2.5);
  for (const el of els) {
    assert.equal(el.style.animationPlayState, 'paused');
    assert.equal(el.style.animationDelay, '-2.5s');
  }
});

test('seekAnimations tolerates empty roots and rejects negative time', () => {
  assert.doesNotThrow(() => seekAnimations({ querySelectorAll: () => [] }, 0));
  assert.throws(() => seekAnimations({ querySelectorAll: () => [] }, -1), /seekAnimations/);
});
