// tests/data/color-sweep.test.js — repo-wide colour guard.
//
// palette-compliance.test.js checks the colour DATA and six named files. It
// cannot see a new hex added anywhere else, which is how a parallel status
// palette, cyan-as-settled-text in five demo pages, and eleven one-off darks
// all shipped. This sweeps every css/js/html source and fails on any colour
// that is not the palette, a declared surface token, or a listed exception.
import { strict as assert } from 'node:assert';
import { test } from 'node:test';
import { readFileSync, readdirSync, statSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const colors = JSON.parse(readFileSync(path.join(ROOT, 'src/data/colors.json'), 'utf8'));

/**
 * Colours that are allowed to exist outside the palette, each with the reason
 * it cannot simply be remapped. Anything not here and not in colors.json is a
 * failure — add a deliberate entry rather than widening the matcher.
 */
const ALLOWED = {
  // Third-party brand colours. A brand's hex is theirs; recolouring a Discord
  // or Twitch mark makes the link unrecognisable and misrepresents them.
  '#9146ff': 'Twitch brand',
  '#5865f2': 'Discord brand',
  '#1da1f2': 'Twitter brand',
  '#833ab4': 'Instagram brand gradient',
  '#fd1d1d': 'Instagram brand gradient',
  '#cc0000': 'YouTube brand',
  '#333333': 'GitHub brand',
  '#24292e': 'GitHub brand (dark)',
  '#0d8bd9': 'Twitter brand (hover)',
  '#4752c4': 'Discord brand (hover)',
  '#6441a5': 'Twitch brand (legacy purple)',
  '#fcb045': 'Instagram brand gradient',
  '#3653a1': 'Facebook brand (hover)',

  // NIKKE rarity/tier colours. colors.json scopes `elementalColors` to the
  // five elements and leaves tier palettes downstream — these are the tier
  // layer, kept as a compatibility surface for the same reason.
  '#c41e3a': 'NIKKE tier: SSR',
  '#15803d': 'NIKKE tier: R',

  // Component artwork. Like the mandala tints, these are a component's own
  // identity rather than corruption state — remapping them changes shipped
  // visuals for existing callers.
  '#8b1a59': 'CelesteWidget gradient stop',
  '#fdf3f8': 'CelesteWidget light text on its own gradient',
  '#2d1b4e': 'CelesteWidget gradient stop',
  '#1a0f2e': 'CelesteWidget gradient stop',
  '#e8e4f0': 'MicroGfx paper stock (light polarity)',
  '#efe9f2': 'MicroGfx paper stock (light polarity)',
  '#1a1430': 'MicroGfx paper stock (dark polarity)',

  // Decorative gradient stops in demo pages. They stand in for arbitrary
  // artwork the theme does not control (a thumbnail, a stream background),
  // so they are deliberately off-palette.
  '#3a1a4a': 'demo: stand-in artwork gradient',
  '#12203a': 'demo: stand-in artwork gradient',
  '#0a0a1a': 'demo: stand-in artwork gradient',
  '#1a001a': 'demo: stand-in artwork gradient',
  '#2d1f3d': 'demo: stand-in artwork gradient',
  '#1a1a2e': 'demo: stand-in artwork gradient',
  '#3d2f4d': 'demo: stand-in artwork gradient',
  '#2a1a3e': 'demo: stand-in artwork gradient',
  '#4c2967': 'demo: stand-in artwork border',

  // examples/button.html demonstrates overriding --accent for your own brand.
  // The override has to read as obviously NOT the theme for the demo to make
  // its point, so an off-palette colour is the content, not a violation.
  '#3b82f6': 'demo: "override for your brand" example',
  '#60a5fa': 'demo: "override for your brand" example',
  '#1e40af': 'demo: "override for your brand" example',

  // Declared component identity — corrupted-mandala.js documents these as its
  // own artwork tints, overridable via options.colors.
  '#ff82d9': 'CorruptedMandala artwork tint (documented, overridable)',
  '#b08aff': 'CorruptedMandala artwork tint (documented, overridable)',
  '#7ef0ff': 'CorruptedMandala artwork tint (documented, overridable)',
  '#3a1828': 'CorruptedMandala artwork tint (documented, overridable)',

  // Code syntax highlighting (Material Palenight). Syntax colours are a
  // separate legibility system, not corruption state.
  '#c792ea': 'syntax: keyword',
  '#c3e88d': 'syntax: string',
  '#f78c6c': 'syntax: number',
  '#82aaff': 'syntax: function',

  // Public API defaults. Changing an exported default colour is a breaking
  // change under CLAUDE.md §12, so these are frozen until a major bump.
  '#ff8c00': 'AnimationBlocks/_blocks-advanced default option colour (API surface)',
  '#ff69b4': '_blocks-anime heart default + celeste-widget gradient (API surface)',

  // Surfaced when this sweep learned to read rgb()/rgba(). Everything else in
  // that batch was remapped onto the palette; these two are deliberate.
  '#281e14': 'glassmorphism .glass-container-gradient — a declared warm amber variant, component artwork like the mandala tints',
  '#3c2d1e': 'glassmorphism .glass-container-gradient — a declared warm amber variant, component artwork like the mandala tints',
  '#eab308': 'CharacterFlowParticles glowColors.yellow — a named public option value with no palette counterpart; renaming or remapping it would lie about the key or break callers (CLAUDE.md §12)',
};

/** Chrome tokens declared in variables.css are sanctioned by definition. */
function chromeTokens() {
  const src = stripComments(readFileSync(path.join(ROOT, 'src/css/variables.css'), 'utf8'));
  const out = new Set([...src.matchAll(/--[a-z0-9-]+:\s*(#[0-9a-fA-F]{3,8})\s*;/g)]
    .map((m) => expand(m[1])));
  // Glass and overlay tokens are declared as rgba(), so a hex-only read of this
  // file missed them and reported every use of --glass as an unknown colour.
  for (const m of src.matchAll(/--[a-z0-9-]+:\s*(rgba?\([^)]*\))/g)) {
    const hex = rgbToHex(m[1]);
    if (hex) out.add(hex);
  }
  return out;
}

/**
 * `rgba(34, 197, 94, .15)` is the same colour as `#22c55e`, and the sweep used
 * to see only the second form. That is how the status remap shipped with its
 * `color` on the palette and its `background` still on the element hex it was
 * supposed to leave behind. Alpha is dropped: a tint of a legal colour is legal.
 */
function rgbToHex(str) {
  const m = /rgba?\(\s*(\d{1,3})\s*,\s*(\d{1,3})\s*,\s*(\d{1,3})/.exec(str);
  if (!m) return null;
  const [r, g, b] = m.slice(1).map(Number);
  if ([r, g, b].some((v) => v > 255)) return null;
  return '#' + [r, g, b].map((v) => v.toString(16).padStart(2, '0')).join('');
}

/**
 * Comments discuss colours — this file's own note listing the one-off darks it
 * replaced would otherwise report itself as six violations. Only live code
 * counts.
 */
function stripComments(src) {
  return src
    .replace(/\/\*[\s\S]*?\*\//g, ' ')   // CSS + JS block
    .replace(/^\s*\/\/.*$/gm, ' ')       // JS line
    .replace(/<!--[\s\S]*?-->/g, ' ');   // HTML
}

function expand(hex) {
  let h = hex.toLowerCase();
  if (h.length === 4) h = '#' + [...h.slice(1)].map((c) => c + c).join('');
  if (h.length === 9) h = h.slice(0, 7);   // alpha variants share a base colour
  return h;
}

function sources() {
  const out = [];
  (function walk(dir) {
    let entries;
    try { entries = readdirSync(path.join(ROOT, dir)); } catch { return; }
    for (const e of entries) {
      const rel = path.join(dir, e);
      if (statSync(path.join(ROOT, rel)).isDirectory()) { walk(rel); continue; }
      if (/\.(css|js|html)$/.test(e) && !e.includes('.min.')) out.push(rel);
    }
  })('src');
  (function walk(dir) {
    let entries;
    try { entries = readdirSync(path.join(ROOT, dir)); } catch { return; }
    for (const e of entries) {
      const rel = path.join(dir, e);
      if (statSync(path.join(ROOT, rel)).isDirectory()) { walk(rel); continue; }
      if (/\.html$/.test(e)) out.push(rel);
    }
  })('examples');
  return out;
}

/**
 * Files that own the NIKKE element system. Element hexes are legal HERE and
 * nowhere else.
 *
 * Allowing them everywhere is what let `.badge.error` be fire and
 * `.badge.success` be wind: the guard saw a known colour and passed. Spec rule
 * 1 says theme chrome never borrows an element hex, so the guard has to be able
 * to tell a badge from a border. Scope is that distinction.
 *
 * Matches a whole final path segment, never a substring: the previous form
 * `/(^|\/)(nikke-|colors\.(json|data\.js))|nikke-team-builder\.html$/` bound its
 * alternation loosely, so only the last branch carried the `$` and a file merely
 * *ending* in `nikke-team-builder.html` would have been granted element-colour
 * rights. Flagged by CodeQL as `js/regex/missing-regexp-anchor`. Anchoring the
 * segment also made that third branch redundant — `nikke-team-builder.html` is
 * already a `nikke-*` file.
 */
const ELEMENT_OWNERS = /(?:^|\/)(?:nikke-[^/]*|colors\.(?:json|data\.js))$/;

test('no colour outside the palette, surfaces or the exceptions list', () => {
  const base = [
    ...Object.values(colors.palette).map(expand),
    ...Object.values(colors.surfaces).map(expand),
    ...Object.keys(ALLOWED).map(expand),
    ...chromeTokens(),
  ];
  const elements = Object.values(colors.elementalColors).map(expand);
  const legalFor = (rel) => new Set(ELEMENT_OWNERS.test(rel) ? [...base, ...elements] : base);
  const offenders = new Map();
  for (const rel of sources()) {
    const legal = legalFor(rel);
    const src = stripComments(readFileSync(path.join(ROOT, rel), 'utf8'));
    const found = [];
    for (const m of src.matchAll(/#[0-9a-fA-F]{3,8}\b/g)) {
      if ([4, 7, 9].includes(m[0].length)) found.push(expand(m[0]));
    }
    for (const m of src.matchAll(/rgba?\([^)]*\)/g)) {
      const hex = rgbToHex(m[0]);
      if (hex) found.push(hex);
    }
    for (const hex of found) {
      if (legal.has(hex)) continue;
      if (!offenders.has(hex)) offenders.set(hex, new Set());
      offenders.get(hex).add(rel);
    }
  }
  const report = [...offenders.entries()]
    .map(([hex, files]) => `${hex} in ${[...files].slice(0, 3).join(', ')}`);
  assert.deepEqual(report, [],
    'unrecognised colours — map to the palette, add a surface token, or justify in ALLOWED '
    + '(an element hex outside the NIKKE files is theme chrome borrowing game data: spec rule 1)');
});

test('accents carry no state meaning in semanticUse', () => {
  for (const accent of colors.accents) {
    assert.ok(!Object.values(colors.semanticUse).includes(accent),
      `${accent} is an accent and must not appear in semanticUse`);
  }
});

test('elemental colours are documented and disjoint from the palette', () => {
  assert.ok(colors.elementalNotes && colors.elementalNotes.length > 80,
    'elementalColors must carry a note explaining they are game data, not theme colours');
  const palette = new Set(Object.values(colors.palette).map(expand));
  for (const [name, hex] of Object.entries(colors.elementalColors)) {
    assert.ok(!palette.has(expand(hex)),
      `element ${name} (${hex}) collides with a palette colour`);
  }
});

test('every elemental colour is exposed as a --nikke-element-* custom property', () => {
  const css = readFileSync(path.join(ROOT, 'src/css/nikke-utilities.css'), 'utf8');
  for (const [name, hex] of Object.entries(colors.elementalColors)) {
    const re = new RegExp(`--nikke-element-${name}:\\s*${hex}\\s*;`, 'i');
    assert.match(css, re, `--nikke-element-${name} must be ${hex} to match colors.json`);
  }
});

test('surface tokens match the CSS custom properties that mirror them', () => {
  const css = readFileSync(path.join(ROOT, 'src/css/variables.css'), 'utf8');
  const pairs = [['bg', '--bg'], ['bgSecondary', '--bg-secondary'],
    ['surface', '--surface'], ['surfaceElevated', '--surface-elevated'], ['checker', '--checker']];
  for (const [key, prop] of pairs) {
    const m = css.match(new RegExp(`${prop}:\\s*(#[0-9a-fA-F]{3,8})\\s*;`));
    assert.ok(m, `${prop} missing from variables.css`);
    assert.equal(expand(m[1]), expand(colors.surfaces[key]),
      `${prop} drifted from colors.json surfaces.${key}`);
  }
});

/**
 * Semantic status colours, as actually shipped in components.css. Docs that
 * name these must agree.
 *
 * The palette correction changed the CSS and left the documentation behind:
 * ACCESSIBILITY.md taught `--success: #10b981`, COLOR_SYSTEM.md taught
 * `#2ed573`, STYLE_GUIDE.md taught `#22c55e` — three different wrong greens,
 * none of them what ships, all of them in files that go out with the npm
 * package. This sweep never looked at `docs/`, so nothing caught it.
 *
 * Deliberately narrow: brand docs legitimately show illustrative palettes and
 * example swatches, and policing every hex in prose would be noise. What is
 * NOT negotiable is a doc stating a different value for a token the package
 * actually defines.
 */
const SHIPPED_STATUS = {
  success: '#00ff00',
  warning: '#d94f90',
  error: '#ff0000',
  info: '#8b5cf6',
};

test('docs do not contradict the shipped semantic status colours', () => {
  const docs = [];
  (function walk(dir) {
    for (const e of readdirSync(path.join(ROOT, dir))) {
      const rel = path.join(dir, e);
      if (statSync(path.join(ROOT, rel)).isDirectory()) {
        if (e !== 'planning') walk(rel);   // planning/ is archived, untracked
        continue;
      }
      if (e.endsWith('.md')) docs.push(rel);
    }
  })('docs');

  const wrong = [];
  for (const rel of docs) {
    const src = readFileSync(path.join(ROOT, rel), 'utf8');
    for (const [name, hex] of Object.entries(SHIPPED_STATUS)) {
      // `--success: #xxxxxx` — a token declaration claiming a value
      for (const m of src.matchAll(new RegExp(`--${name}:\\s*(#[0-9a-fA-F]{6})`, 'g'))) {
        if (expand(m[1]) !== hex) wrong.push(`${rel}: --${name} documented as ${m[1]}, ships as ${hex}`);
      }
      // `#### Success (\`#xxxxxx\`)` / `**Success**: Green (\`#xxxxxx\`)`
      const label = name[0].toUpperCase() + name.slice(1);
      for (const m of src.matchAll(new RegExp(`\\*\\*${label}\\*\\*[^\\n]*?\`(#[0-9a-fA-F]{6})\``, 'g'))) {
        if (expand(m[1]) !== hex) wrong.push(`${rel}: ${label} documented as ${m[1]}, ships as ${hex}`);
      }
      for (const m of src.matchAll(new RegExp(`#+ ${label} \\(\`(#[0-9a-fA-F]{6})\`\\)`, 'g'))) {
        if (expand(m[1]) !== hex) wrong.push(`${rel}: ${label} heading documented as ${m[1]}, ships as ${hex}`);
      }
    }
  }
  assert.deepEqual([...new Set(wrong)], [],
    'shipped docs teach a status colour the package does not use — a reader '
    + 'following them gets the wrong hex');
});

test('every shipped status colour actually exists in components.css', () => {
  const css = stripComments(readFileSync(path.join(ROOT, 'src/css/components.css'), 'utf8'));
  for (const [name, hex] of Object.entries(SHIPPED_STATUS)) {
    // `.badge.info` was missing entirely while `.alert.info` existed, so a
    // four-state status row had no info variant to reach for.
    assert.match(css, new RegExp(`\\.badge\\.${name}\\s*\\{[^}]*color:\\s*${hex}`, 'i'),
      `.badge.${name} must exist and use ${hex}`);
  }
});

test('toast status colours match the badge family', () => {
  // toast.css had success on CYAN and info on MAGENTA2. Cyan is an accent and
  // never a state signal, and magenta2 is `.badge.warning` — so the same colour
  // meant "warning" on a badge and "info" on a toast. Neither was catchable by
  // the hex sweep above: both colours are perfectly legal, they were just in
  // the wrong ROLE. Legality is not the same as correctness.
  //
  // Only the three variants the Toast API actually exposes — success, error,
  // info. There is no warning() method, so there is no warning variant.
  const toast = stripComments(readFileSync(path.join(ROOT, 'src/css/toast.css'), 'utf8'));
  for (const state of ['success', 'error', 'info']) {
    const rule = new RegExp(`\\.corrupted-toast--${state}\\s*\\{([^}]*)\\}`).exec(toast);
    assert.ok(rule, `.corrupted-toast--${state} must exist`);
    const hex = /#[0-9a-fA-F]{6}/.exec(rule[1]);
    assert.ok(hex, `.corrupted-toast--${state} must carry a literal fallback colour`);
    assert.equal(expand(hex[0]), SHIPPED_STATUS[state],
      `toast ${state} is ${hex[0]} but .badge.${state} is ${SHIPPED_STATUS[state]} — `
      + 'one meaning, one colour, across every component that signals it');
  }
});
