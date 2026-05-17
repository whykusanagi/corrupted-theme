// tests/lib/crt-effects.test.js
import { strict as assert } from 'node:assert';
import { test } from 'node:test';
import { CRTEffects, applyCRTGlow } from '../../src/lib/crt-effects.js';

test('CRTEffects class exported', () => {
  assert.equal(typeof CRTEffects, 'function');
});

test('applyCRTGlow exported as function', () => {
  assert.equal(typeof applyCRTGlow, 'function');
});

test('CRTEffects can be constructed and destroyed in Node', () => {
  const e = new CRTEffects(null);
  e.destroy();
  assert.equal(e._destroyed, true);
});

test('CRTEffects exposes start/stop/destroy lifecycle methods', () => {
  const instance = new CRTEffects(null);
  assert.equal(typeof instance.start, 'function');
  assert.equal(typeof instance.stop, 'function');
  assert.equal(typeof instance.destroy, 'function');
});

test('CRTEffects.start() is a no-op without a DOM element', () => {
  const instance = new CRTEffects(null);
  assert.doesNotThrow(() => instance.start());
  instance.destroy();
});

test('CRTEffects.stop() does not throw', () => {
  const instance = new CRTEffects(null);
  assert.doesNotThrow(() => instance.stop());
  instance.destroy();
});

test('CRTEffects.destroy() marks instance as destroyed', () => {
  const instance = new CRTEffects(null);
  instance.destroy();
  assert.equal(instance._destroyed, true);
});

test('CRTEffects double destroy() does not throw', () => {
  const instance = new CRTEffects(null);
  instance.destroy();
  assert.doesNotThrow(() => instance.destroy());
});

test('applyCRTGlow() accepts element, optional color and intensity args', () => {
  // In Node there's no DOM — pass a mock object with a writable style property
  const fakeEl = { style: {} };
  assert.doesNotThrow(() => applyCRTGlow(fakeEl));
  assert.doesNotThrow(() => applyCRTGlow(fakeEl, '#d94f90', 20));
  assert.ok(fakeEl.style.filter, 'filter should be set on the element');
});

test('CRTEffects.applyChromaticAberration() sets filter on element', () => {
  const instance = new CRTEffects(null);
  const styleObj = { cssText: '', filter: '' };
  styleObj.setProperty = function(name, value) {
    this[name] = value;
  };
  const fakeEl = { style: styleObj };
  assert.doesNotThrow(() => instance.applyChromaticAberration(fakeEl, 3));
  assert.ok(fakeEl.style.filter, 'filter should be set by chromatic aberration');
  instance.destroy();
});
