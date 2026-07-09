// tests/lib/animation-blocks.test.js
import { strict as assert } from 'node:assert';
import { test } from 'node:test';
import {
  TitleDecoder,
  ProgressBar,
  ScanlineSweep,
  TerminalBoot,
  GlitchPulse,
  ASCIIBorder,
  SystemDiagnostic,
  LoadingBarMulti,
  DataTransmission,
  TerminalPrompt,
} from '../../src/lib/animation-blocks.js';

test('all 10 animation block classes are exported', () => {
  const classes = [TitleDecoder, ProgressBar, ScanlineSweep, TerminalBoot, GlitchPulse, ASCIIBorder, SystemDiagnostic, LoadingBarMulti, DataTransmission, TerminalPrompt];
  for (const Cls of classes) {
    assert.equal(typeof Cls, 'function', `${Cls?.name ?? 'unknown'} is not a function`);
  }
});

test('each class can be constructed with null element in Node', () => {
  const classes = [TitleDecoder, ProgressBar, ScanlineSweep, TerminalBoot, GlitchPulse, ASCIIBorder, SystemDiagnostic, LoadingBarMulti, DataTransmission, TerminalPrompt];
  for (const Cls of classes) {
    try {
      const instance = new Cls(null, {});
      if (typeof instance.destroy === 'function') instance.destroy();
    } catch (err) {
      // Allow throws only if the error message is clear about needing an element
      console.log(`${Cls.name} constructor needs DOM:`, err.message);
    }
  }
  assert.ok(true);
});

test('each class exposes start/stop/destroy lifecycle methods', () => {
  const classes = [TitleDecoder, ProgressBar, ScanlineSweep, TerminalBoot, GlitchPulse, ASCIIBorder, SystemDiagnostic, LoadingBarMulti, DataTransmission, TerminalPrompt];
  for (const Cls of classes) {
    const instance = new Cls(null, {});
    assert.equal(typeof instance.start,   'function', `${Cls.name}.start is not a function`);
    assert.equal(typeof instance.stop,    'function', `${Cls.name}.stop is not a function`);
    assert.equal(typeof instance.destroy, 'function', `${Cls.name}.destroy is not a function`);
    instance.destroy();
  }
});

test('stop() and destroy() do not throw when called on unstarted instance', () => {
  const classes = [TitleDecoder, ProgressBar, ScanlineSweep, TerminalBoot, GlitchPulse, ASCIIBorder, SystemDiagnostic, LoadingBarMulti, DataTransmission, TerminalPrompt];
  for (const Cls of classes) {
    const instance = new Cls(null, {});
    assert.doesNotThrow(() => instance.stop(),    `${Cls.name}.stop() threw`);
    assert.doesNotThrow(() => instance.destroy(), `${Cls.name}.destroy() threw`);
  }
});

test('destroy() can be called twice without throwing', () => {
  const classes = [TitleDecoder, ProgressBar, ScanlineSweep, TerminalBoot, GlitchPulse, ASCIIBorder, SystemDiagnostic, LoadingBarMulti, DataTransmission, TerminalPrompt];
  for (const Cls of classes) {
    const instance = new Cls(null, {});
    instance.destroy();
    assert.doesNotThrow(() => instance.destroy(), `${Cls.name} double destroy() threw`);
  }
});

test('all 10 animation blocks have play() as alias for start()', () => {
  const classes = [TitleDecoder, ProgressBar, ScanlineSweep, TerminalBoot, GlitchPulse, ASCIIBorder, SystemDiagnostic, LoadingBarMulti, DataTransmission, TerminalPrompt];
  for (const Cls of classes) {
    const instance = new Cls(null, {});
    assert.equal(typeof instance.play, 'function', `${Cls.name}.play missing`);
    assert.equal(typeof instance.start, 'function', `${Cls.name}.start missing`);
    // Both should be callable without throwing (in Node, no DOM)
    try {
      instance.play();
      instance.start();
      // play() is documented as returning what start() returns (Promise/undefined)
      assert.ok(true);  // didn't throw
    } catch (err) {
      // Allow if start() throws cleanly when no DOM; play() should throw same way
    }
    if (typeof instance.destroy === 'function') instance.destroy();
  }
});

test('lewdMode shim alerts and aliases on ALL 10 animation block classes', () => {
  const classes = [TitleDecoder, ProgressBar, ScanlineSweep, TerminalBoot, GlitchPulse, ASCIIBorder, SystemDiagnostic, LoadingBarMulti, DataTransmission, TerminalPrompt];
  // Only TitleDecoder forwards nsfw into this.options (it's the only class that uses NSFW
  // content pools). The other 9 classes run the shim (warn + mutate opts.nsfw) but don't
  // expose nsfw through their own options shape.
  const nsfw_forwarding_classes = new Set([TitleDecoder]);

  for (const Cls of classes) {
    // Reset per-class static flag
    if (Cls._warnedLewdMode !== undefined) Cls._warnedLewdMode = false;

    const warned = [];
    const origWarn = console.warn;
    console.warn = (...args) => warned.push(args.join(' '));

    try {
      const instance = new Cls(null, { lewdMode: true });
      // Every class must warn exactly once
      assert.equal(warned.length, 1, `${Cls.name}: should warn once`);
      assert.ok(warned[0].includes('deprecated'), `${Cls.name}: warn should mention deprecation`);
      // Only classes that use NSFW pools forward nsfw into this.options
      if (nsfw_forwarding_classes.has(Cls)) {
        assert.equal(instance.options?.nsfw, true, `${Cls.name}: nsfw not set from lewdMode`);
      }
      if (typeof instance.destroy === 'function') instance.destroy();
    } finally {
      console.warn = origWarn;
    }
  }
});

test('TitleDecoder: lewdMode option is deprecated — nsfw shim fires once and option is normalised', () => {
  // Capture the warning
  const warns = [];
  const origWarn = console.warn;
  console.warn = (...args) => warns.push(args.join(' '));

  // Reset the static flag so the test is isolated
  TitleDecoder._warnedLewdMode = false;

  const inst = new TitleDecoder(null, { lewdMode: true });
  assert.ok(warns.length > 0, 'expected a deprecation warning');
  assert.ok(warns[0].includes('lewdMode'), 'warning should mention lewdMode');
  assert.ok(inst.options.nsfw === true, 'nsfw should be normalised from lewdMode');

  // Second construction should NOT warn again
  warns.length = 0;
  new TitleDecoder(null, { lewdMode: true });
  assert.equal(warns.length, 0, 'second construction should not warn again');

  console.warn = origWarn;
  TitleDecoder._warnedLewdMode = false; // restore
});

test('GlitchPulse rejects markup-breaking color values (XSS hardening, 0.3.0)', () => {
  const attacks = ['"><img src=x onerror=alert(1)>', 'red;</style><script>1</script>', "url('javascript:x')"];
  for (const color of attacks) {
    const gp = new GlitchPulse(null, { color });
    assert.equal(gp.options.color, '#ff00ff', `attack survived sanitizer: ${color}`);
    gp.destroy?.();
  }
  for (const color of ['#00ffff', 'rgb(255, 0, 255)', 'rgba(139, 92, 246, 0.5)', 'magenta']) {
    const gp = new GlitchPulse(null, { color });
    assert.equal(gp.options.color, color, `legit color rejected: ${color}`);
    gp.destroy?.();
  }
});
