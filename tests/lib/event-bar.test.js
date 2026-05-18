import { strict as assert } from 'node:assert';
import { test } from 'node:test';
import { EventBar } from '../../src/lib/event-bar.js';

test('EventBar class exported', () => {
  assert.equal(typeof EventBar, 'function');
});

test('EventBar constructs in Node without crashing', () => {
  const e = new EventBar(null, { items: [] });
  e.destroy();
  assert.equal(e._destroyed, true);
});

test('EventBar has destroy and update methods', () => {
  const e = new EventBar(null);
  assert.equal(typeof e.destroy, 'function');
  assert.equal(typeof e.update, 'function');
  e.destroy();
});

test('EventBar.update() does not throw after destroy', () => {
  const e = new EventBar(null);
  e.destroy();
  e.update([{ label: 'X', content: 'Y' }]); // should be a no-op
  assert.ok(true);
});

test('EventBar.destroy() is idempotent', () => {
  const e = new EventBar(null);
  e.destroy();
  e.destroy(); // should not throw
  assert.ok(true);
});

test('EventBar applies default empty items', () => {
  const e = new EventBar(null);
  assert.deepEqual(e.options.items, []);
  e.destroy();
});

test('EventBar stores provided items in options', () => {
  const items = [
    { label: 'Latest Follow', content: '@user1', icon: '★' },
    { label: 'Last Sub', content: '@user2', icon: '♥' },
  ];
  const e = new EventBar(null, { items });
  assert.deepEqual(e.options.items, items);
  e.destroy();
});

test('EventBar.update() replaces items', () => {
  const e = new EventBar(null, { items: [{ label: 'A', content: 'B' }] });
  const newItems = [{ label: 'C', content: 'D', icon: '○' }];
  e.update(newItems);
  assert.deepEqual(e.options.items, newItems);
  e.destroy();
});

test('EventBar.update() with null resets to empty array', () => {
  const e = new EventBar(null, { items: [{ label: 'A', content: 'B' }] });
  e.update(null);
  assert.deepEqual(e.options.items, []);
  e.destroy();
});
