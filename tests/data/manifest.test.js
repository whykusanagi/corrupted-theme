// tests/data/manifest.test.js — agent-surface generator shape checks
import { strict as assert } from 'node:assert';
import { test } from 'node:test';
import { parseModule, buildManifest, renderLlmsTxt } from '../../scripts/generate-manifest.js';

test('parseModule extracts description, classes, options, composes', () => {
  const src = `/**
 * Widget — does a thing.
 *
 * Longer prose.
 * @version 1.2.3
 * @composes Other — pairs nicely
 */
export class Widget {
  /**
   * @param {number} [options.speed=5] - How fast
   * @param {boolean} [options.nsfw=false] - Opt-in
   */
}`;
  const p = parseModule(src);
  assert.equal(p.description, 'Widget — does a thing.');
  assert.equal(p.version, '1.2.3');
  assert.deepEqual(p.classes, ['Widget']);
  assert.equal(p.composes[0].target, 'Other');
  assert.equal(p.options.find(o => o.name === 'speed').default, '5');
  assert.equal(p.options.find(o => o.name === 'nsfw').default, 'false');
});

test('buildManifest covers every package export with resolvable targets', () => {
  const m = buildManifest();
  const pkg = JSON.parse(JSON.stringify(m)); // serializable
  assert.ok(pkg);
  assert.ok(m.exports.length >= 60, `expected >=60 exports, got ${m.exports.length}`);
  for (const e of m.exports) {
    assert.ok(e.export && e.path && e.type && e.cdnUrl && e.npmImport, `incomplete entry: ${e.export}`);
  }
  // Every 0.3.0 headline component present with a class and options
  for (const key of ['./scroll-decode', './corrupted-timeline', './glitch-stagger-grid', './corrupted-mandala', './stream-ticker']) {
    const e = m.exports.find(x => x.export === key);
    assert.ok(e?.classes?.length, `${key} missing classes`);
    assert.ok(e?.description, `${key} missing description`);
  }
  // NSFW convention documented
  assert.match(m.conventions.nsfw, /opt-in/);
});

test('llms.txt stays dense and lists every export', () => {
  const m = buildManifest();
  const txt = renderLlmsTxt(m);

  // The point of this gate is that the agent surface fits comfortably in an
  // LLM context AND that nobody writes a bloated module header (descriptions
  // are generated from them). A single frozen byte count conflated the two:
  // it was set when the catalog was smaller and then failed at 63 exports for
  // purely additive growth, which is not the regression worth catching.
  //
  // So: a generous absolute ceiling, plus a per-export density cap that
  // actually catches bloat regardless of catalog size.
  assert.ok(txt.length < 24576, `llms.txt too large for an LLM context: ${txt.length}`);
  const perExport = Math.round(txt.length / m.exports.length);
  assert.ok(perExport < 320, `llms.txt averages ${perExport} bytes/export — trim module headers`);

  for (const e of m.exports) assert.ok(txt.includes(e.export), `missing ${e.export}`);
  assert.match(txt, /browser-only/); // corrupted-text flag surfaces
});
