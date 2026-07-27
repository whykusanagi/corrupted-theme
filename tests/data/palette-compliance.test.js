// tests/data/palette-compliance.test.js
// Guards CORRUPTED_THEME_SPEC.md "Color Palette" against drift.
//
// The spec has said white-is-stable since v1.1 (2026-01-15), but the change
// only reached the palette table — the pattern descriptions, the data file
// and the components kept treating cyan as the settled state until 0.3.2.
// These tests exist so that never silently reverts.
import { strict as assert } from 'node:assert';
import { test } from 'node:test';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import colors from '../../src/data/colors.json' with { type: 'json' };

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..', '..');
const read = p => readFileSync(join(ROOT, p), 'utf8');

test('palette carries every colour the spec defines', () => {
  assert.deepEqual(colors.palette, {
    white:    '#ffffff',
    black:    '#000000',
    magenta:  '#ff00ff',
    purple:   '#8b5cf6',
    magenta2: '#d94f90',
    red:      '#ff0000',
    cyan:     '#00ffff',
    green:    '#00ff00',
  });
});

test('theme colours are magenta, violet and white', () => {
  assert.deepEqual(colors.themeColors, ['magenta', 'purple', 'white']);
});

test('cyan and red are accents, and carry no state meaning', () => {
  assert.deepEqual(colors.accents, ['cyan', 'red']);
  // Accents are a legibility tool. If either ever acquires a semanticUse
  // role, the two-tier model has collapsed back into the old confusion.
  for (const role of Object.keys(colors.semanticUse)) {
    const c = colors.semanticUse[role];
    assert.ok(!colors.accents.includes(c),
      `semanticUse.${role} is '${c}', but accents must not carry state`);
  }
});

test('semanticUse matches the spec usage guidelines', () => {
  assert.equal(colors.semanticUse.decoded, 'white', 'stable/decoded text is white, not cyan');
  assert.equal(colors.semanticUse.corruption, 'magenta', 'magenta is the primary corruption colour');
  assert.equal(colors.semanticUse.corrupting, 'magenta2', 'playful/SFW corruption is magenta2');
  assert.equal(colors.semanticUse.intimate, 'purple');
  assert.equal(colors.semanticUse.system, 'green');
  assert.equal(colors.semanticUse.void, 'black');
});

test('inlined data module is regenerated from colors.json', async () => {
  const { default: inlined } = await import('../../src/data/colors.data.js');
  assert.deepEqual(inlined.palette, colors.palette);
  assert.deepEqual(inlined.themeColors, colors.themeColors);
  assert.deepEqual(inlined.accents, colors.accents);
  assert.deepEqual(inlined.semanticUse, colors.semanticUse);
});

test('Pattern 4 settles to white, not cyan', () => {
  const src = read('src/lib/glitch-stagger-grid.js');
  const ramp = src.match(/const RAMP = \{[^}]*\}/)[0];
  assert.match(ramp, /settled:\s*'#ffffff'/);
  assert.ok(!/settled:\s*'#00ffff'/.test(ramp), 'settled state must not be cyan');
});

test('no component declares cyan as its default text colour', () => {
  for (const f of ['src/lib/animation-blocks.js', 'src/lib/_blocks-anime.js']) {
    const src = read(f);
    assert.ok(
      !/options\.color\s*\|\|\s*'#00ffff'/.test(src),
      `${f}: default text colour must be white, not cyan`
    );
  }
});

test('decode output renders revealed text in white', () => {
  const src = read('src/lib/_blocks-advanced.js');
  assert.ok(
    !/color:\s*#00ffff;">\$\{escapeHtml\(revealed\)/.test(src),
    'revealed (decoded) text must not be cyan'
  );
  assert.ok(
    !/=\s*'#00ffff';\s*\/\/\s*Cyan\s*-\s*stable/.test(src),
    'no colour may be declared "stable" and be cyan'
  );
});

test('cyan survives where the spec allows it — accents and RGB channels', () => {
  // Chromatic aberration pairs cyan with red; removing it would break the effect.
  const crt = read('src/lib/crt-effects.js');
  assert.match(crt, /\.chromatic-aberration::after\s*\{\s*color:\s*#00ffff/);
  // Opt-in cyan variants stay opt-in.
  assert.match(read('src/css/stream-overlays.css'), /\.corrupted-ghost-cyan/);
});
