// tests/lib/blocks-advanced-0.3.1.test.js
// 0.3.1 completed the anime-blocks-advanced.js absorption: the remaining 8
// canonical classes + CharacterFlowParticles (promoted from a downstream-only
// copy). These are browser-only canvas/DOM visual classes, so we shim a minimal
// window/document to exercise the construct-time contract (NSFW opt-in default,
// deprecated aliases, site-DOM decoupling) without a full DOM.
import { strict as assert } from 'node:assert';
import { test } from 'node:test';

// Minimal browser shim: several constructors read window.innerWidth at build
// time (same pattern as the already-shipped WaveformOscilloscope).
globalThis.window = globalThis.window || {
  innerWidth: 1920, innerHeight: 1080,
  addEventListener() {}, removeEventListener() {},
};

import {
  FloatingCardStack, ImageGallerySlideshow, DataVisualizationDashboard,
  SegmentedProgressBar, ModuleLoadingList, TacticalTerrainMap, OminousTemple,
  CorruptedTextOverlay, CharacterFlowParticles,
} from '../../src/lib/animation-blocks.js';

const NEW_CLASSES = {
  FloatingCardStack, ImageGallerySlideshow, DataVisualizationDashboard,
  SegmentedProgressBar, ModuleLoadingList, TacticalTerrainMap, OminousTemple,
  CorruptedTextOverlay, CharacterFlowParticles,
};

// Classes that carried inline NSFW pools upstream and must now default to SFW.
const NSFW_CLASSES = [
  FloatingCardStack, DataVisualizationDashboard, ModuleLoadingList,
  TacticalTerrainMap, OminousTemple, CorruptedTextOverlay, CharacterFlowParticles,
];

// A container stub good enough for constructors (CharacterFlowParticles requires
// a truthy container; others ignore it until play()).
const stubContainer = () => ({ appendChild() {}, offsetWidth: 1920, offsetHeight: 1080 });

test('all 9 newly-absorbed classes are exported from the animation-blocks barrel', () => {
  for (const [name, Cls] of Object.entries(NEW_CLASSES)) {
    assert.equal(typeof Cls, 'function', `${name} is not exported as a class`);
  }
});

test('every de-themed class defaults nsfw:false (opt-in NSFW contract)', () => {
  for (const Cls of NSFW_CLASSES) {
    const inst = new Cls(stubContainer(), {});
    assert.equal(inst.nsfw, false, `${Cls.name} must default nsfw:false`);
  }
});

test('nsfw:true is respected when explicitly opted in', () => {
  for (const Cls of NSFW_CLASSES) {
    const inst = new Cls(stubContainer(), { nsfw: true });
    assert.equal(inst.nsfw, true, `${Cls.name} should honor nsfw:true`);
  }
});

test('deprecated lewdMode/includeLewd aliases warn and map to nsfw', () => {
  for (const Cls of NSFW_CLASSES) {
    for (const alias of ['lewdMode', 'includeLewd']) {
      const warned = [];
      const orig = console.warn;
      console.warn = (...a) => warned.push(a.join(' '));
      try {
        const inst = new Cls(stubContainer(), { [alias]: true });
        assert.equal(inst.nsfw, true, `${Cls.name}: ${alias}:true should set nsfw`);
        assert.ok(
          warned.some((w) => w.includes('deprecated')),
          `${Cls.name}: ${alias} should emit a deprecation warning`,
        );
      } finally {
        console.warn = orig;
      }
    }
  }
});

test('CorruptedTextOverlay: intensity/lewdIntensity controls count, default medium', () => {
  assert.equal(new CorruptedTextOverlay(stubContainer(), {}).intensity, 'medium');
  assert.equal(new CorruptedTextOverlay(stubContainer(), { intensity: 'high' }).intensity, 'high');
  assert.equal(
    new CorruptedTextOverlay(stubContainer(), { lewdIntensity: 'low' }).intensity, 'low',
    'deprecated lewdIntensity should still set intensity',
  );
});

test('CorruptedTextOverlay: default kanji set drops suggestive glyphs', () => {
  const inst = new CorruptedTextOverlay(stubContainer(), {});
  for (const bad of ['淫', '禁', '欲']) {
    assert.ok(!inst.kanjiSymbols.includes(bad), `default kanji must not include ${bad}`);
  }
  const custom = new CorruptedTextOverlay(stubContainer(), { kanjiSymbols: ['々'] });
  assert.deepEqual(custom.kanjiSymbols, ['々'], 'kanjiSymbols option should override');
});

test('CharacterFlowParticles: decoupled from site DOM — requires container, accepts target option', () => {
  assert.throws(() => new CharacterFlowParticles(null, {}), /container element required/);
  const inst = new CharacterFlowParticles(stubContainer(), { target: '#anything' });
  assert.equal(inst.target, '#anything', 'target selector should be stored, not hardcoded');
  assert.equal(inst.nsfw, false, 'CharacterFlowParticles defaults nsfw:false');
});
