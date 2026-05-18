import { strict as assert } from 'node:assert';
import { test } from 'node:test';
import { LogoBanner } from '../../src/lib/logo-banner.js';

test('LogoBanner class exported', () => {
  assert.equal(typeof LogoBanner, 'function');
});

test('LogoBanner constructs in Node without crashing', () => {
  const l = new LogoBanner(null, { src: '/logo.png', subtitle: 'test' });
  l.destroy();
  assert.equal(l._destroyed, true);
});

test('LogoBanner has show/hide/update/destroy methods', () => {
  const l = new LogoBanner(null);
  assert.equal(typeof l.show, 'function');
  assert.equal(typeof l.hide, 'function');
  assert.equal(typeof l.update, 'function');
  assert.equal(typeof l.destroy, 'function');
  l.destroy();
});

test('LogoBanner.destroy() is idempotent', () => {
  const l = new LogoBanner(null);
  l.destroy();
  l.destroy(); // should not throw
  assert.ok(true);
});

test('LogoBanner applies default options', () => {
  const l = new LogoBanner(null);
  assert.equal(l.options.src, '');
  assert.equal(l.options.subtitle, '');
  assert.equal(l.options.size, 'normal');
  assert.equal(l.options.animation, 'fade');
  assert.equal(l.options.position, 'top-right');
  assert.equal(l.options.showSubtitle, true);
  l.destroy();
});

test('LogoBanner accepts custom options', () => {
  const l = new LogoBanner(null, {
    src: '/brand.svg',
    subtitle: 'v2',
    size: 'large',
    animation: 'slide',
    position: 'top-left',
    showSubtitle: false,
  });
  assert.equal(l.options.src, '/brand.svg');
  assert.equal(l.options.subtitle, 'v2');
  assert.equal(l.options.size, 'large');
  assert.equal(l.options.animation, 'slide');
  assert.equal(l.options.position, 'top-left');
  assert.equal(l.options.showSubtitle, false);
  l.destroy();
});

test('LogoBanner.update() merges options', () => {
  const l = new LogoBanner(null, { src: '/logo.png' });
  l.update({ subtitle: 'new' });
  assert.equal(l.options.src, '/logo.png');
  assert.equal(l.options.subtitle, 'new');
  l.destroy();
});

test('LogoBanner.update() does not throw after destroy', () => {
  const l = new LogoBanner(null);
  l.destroy();
  l.update({ subtitle: 'x' }); // should be a no-op
  assert.ok(true);
});

test('LogoBanner.show() does not throw in Node (no DOM)', () => {
  const l = new LogoBanner(null);
  l.show();
  l.destroy();
  assert.ok(true);
});

test('LogoBanner.hide() does not throw in Node (no DOM)', () => {
  const l = new LogoBanner(null);
  l.hide();
  l.destroy();
  assert.ok(true);
});
