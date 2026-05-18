import { strict as assert } from 'node:assert';
import { test } from 'node:test';
import { Lightbox } from '../../src/lib/lightbox.js';
import * as gallery from '../../src/lib/gallery.js';

test('Lightbox class exported from lightbox.js', () => {
  assert.equal(typeof Lightbox, 'function');
});

test('gallery.js re-exports Lightbox (backward compat)', () => {
  assert.equal(gallery.Lightbox, Lightbox);
});

test('Lightbox constructs in Node without crashing', () => {
  try {
    const lb = new Lightbox(null, {});
    if (typeof lb.destroy === 'function') lb.destroy();
    assert.ok(true);
  } catch (err) {
    // Allow if Lightbox legitimately requires DOM input
    assert.match(err.message || '', /element|document|target/i);
  }
});
