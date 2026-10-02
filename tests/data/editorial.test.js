// tests/data/editorial.test.js — guards for src/css/editorial.css (#76).
//
// These primitives were promoted because four consumers had each re-derived
// them and drifted. The guards below pin the decisions that make one shared
// copy safe to ship in the global bundle: prefixed names, token-only colour,
// motion that respects reduced-motion, labels that pass AA, and a demo page
// that exercises every class so the documented markup cannot rot.
import { strict as assert } from 'node:assert';
import { test } from 'node:test';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const read = (p) => readFileSync(path.join(ROOT, p), 'utf8');

const css = read('src/css/editorial.css');
const code = css.replace(/\/\*[\s\S]*?\*\//g, '');
const RANK_HEXES = new Set([
  '#ef4444', '#fca5a5',
  '#f97316', '#fdba74',
  '#eab308', '#fde047',
  '#22c55e', '#86efac',
  '#3b82f6', '#93c5fd',
  '#6b7280', '#cbd5e1',
]);

/** Class names used in selectors (declaration bodies stripped first). */
function selectorClasses(source) {
  const selectors = source.replace(/\{[^{}]*\}/g, '{}');
  return new Set([...selectors.matchAll(/\.([a-zA-Z][\w-]*)/g)].map((m) => m[1]));
}

const classes = selectorClasses(code);

function topLevelRules(source) {
  const rules = [];
  let depth = 0;
  let start = 0;
  for (let i = 0; i < source.length; i += 1) {
    const ch = source[i];
    if (ch === '{') {
      if (depth === 0) {
        const prelude = source.slice(start, i).trim();
        const close = findRuleEnd(source, i);
        if (prelude && !prelude.startsWith('@')) {
          rules.push({
            selector: prelude.replace(/\s+/g, ' '),
            body: source.slice(i + 1, close),
          });
        }
      }
      depth += 1;
    } else if (ch === '}') {
      depth -= 1;
      if (depth === 0) start = i + 1;
    }
  }
  return rules;
}

function findRuleEnd(source, open) {
  let depth = 0;
  for (let i = open; i < source.length; i += 1) {
    if (source[i] === '{') depth += 1;
    if (source[i] === '}') {
      depth -= 1;
      if (depth === 0) return i;
    }
  }
  throw new Error(`unterminated CSS rule starting at ${open}`);
}

function normalizeDeclarations(body) {
  const declarations = body
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .split(';')
    .map((decl) => decl.replace(/\s+/g, ' ').trim())
    .filter(Boolean)
    .sort();
  return declarations.join(';');
}

/**
 * A rule that defines a component *shape*: every selector in its list is a
 * class, or a class with a state on it. Anything with a descendant, a child,
 * a pseudo or an attribute is styling a part or a case, not declaring a shape.
 *
 * Only shapes are compared for duplication. The failure this guards against is
 * a re-introduced variant — §3 merged .ct-tile, .ct-stat and .ct-cell, which
 * were three names for one card. Comparing every rule instead would flag
 * `.ct-body a` against `.ct-delta.is-up` for both being the light accent, and
 * the only way to satisfy it is to group rules that have nothing to do with
 * each other, which is worse CSS than the duplication it removes.
 */
function isShapeRule(selector) {
  return selector.split(',').every((part) => /^\.[\w-]+(\.[\w-]+)*$/.test(part.trim()));
}

function ruleBodyForSelector(selector) {
  const rule = topLevelRules(code)
    .find((r) => r.selector.split(',').map((part) => part.trim()).includes(selector));
  assert.ok(rule, `${selector} is not declared`);
  return rule.body;
}

test('every class is ct- prefixed, or an is-*/has-* state on a ct- element', () => {
  // The sheet ships in the global bundle: a bare .tile or .spark would style
  // any consumer element that happens to share the name.
  const bad = [...classes].filter((c) => !c.startsWith('ct-') && !c.startsWith('is-') && !c.startsWith('has-'));
  assert.deepEqual(bad, []);
  // Scoped by the whole selector rather than the compound it sits on: an
  // ancestor is scope enough, so `.ct-table tr.is-self` is safe and the markup
  // contract stays `tr.is-self` instead of a filler class on every row.
  const selectors = [...code.matchAll(/([^{}]+)\{[^{}]*\}/g)].flatMap(([, sel]) => sel.split(','));
  for (const state of [...classes].filter((c) => c.startsWith('is-') || c.startsWith('has-'))) {
    const uses = selectors.filter((sel) => new RegExp(`\\.${state}\\b`).test(sel));
    assert.ok(uses.length > 0, `.${state} appears in no selector`);
    for (const u of uses) assert.match(u, /\.ct-/, `.${state} must be scoped to a ct- element: ${u.trim()}`);
  }
});

test('keyframes are ct- prefixed', () => {
  for (const [, name] of code.matchAll(/@keyframes\s+([\w-]+)/g)) {
    assert.ok(name.startsWith('ct-'), `@keyframes ${name}`);
  }
});

test('no two component shapes carry the same declaration block', () => {
  // Spec §9.2. Media-query rules are skipped by topLevelRules: two of those
  // saying `grid-template-columns: 1fr` is the responsive pattern, not a
  // duplicate.
  const seen = new Map();
  for (const rule of topLevelRules(css)) {
    if (!isShapeRule(rule.selector)) continue;
    const body = normalizeDeclarations(rule.body);
    if (!body) continue;
    assert.ok(!seen.has(body),
      `duplicate shape: ${seen.get(body)} and ${rule.selector} — merge them, `
      + 'or give one a reason to differ');
    seen.set(body, rule.selector);
  }
});

test('colour comes from tokens only — no literal hex, rgb() or hsl()', () => {
  // Every literal in the ported rules equalled an existing token; keeping them
  // as tokens is what lets a consumer who overrides --accent get consistent
  // chrome, and it keeps color-sweep's ALLOWED list untouched. The sole
  // exception is the standard rank scale: those off-palette literals are data
  // values, quarantined in one marked block so the sweep can scope them.
  const block = css.match(/\/\*\s*RANK-SCALE-LITERALS:START[\s\S]*?\*\/([\s\S]*?)\/\*\s*RANK-SCALE-LITERALS:END\s*\*\//);
  assert.ok(block, 'rank-scale literal block must stay explicitly marked');
  const rest = css.replace(block[0], '').replace(/\/\*[\s\S]*?\*\//g, '');
  const illegal = rest.match(/#[0-9a-fA-F]{3,8}\b|\brgba?\(|\bhsla?\(/g) ?? [];
  assert.deepEqual(illegal, []);
  const rankCode = block[1].replace(/\/\*[\s\S]*?\*\//g, '');
  assert.deepEqual(rankCode.match(/\brgba?\(|\bhsla?\(/g) ?? [], []);
  assert.deepEqual(new Set((rankCode.match(/#[0-9a-fA-F]{6}\b/g) ?? []).map((h) => h.toLowerCase())), RANK_HEXES);
});

test('no --text-muted: it is under 4.5:1 on every surface these blocks use', () => {
  assert.doesNotMatch(code, /--text-muted/);
});

test('callout tones stay on the palette; accents never become a status', () => {
  const tone = (cls) => code.match(new RegExp(`\\.${cls}\\s*\\{\\s*--ct-tone:\\s*([^;]+);`))?.[1].trim();
  assert.equal(tone('ct-key'), 'var(--accent)');
  assert.equal(tone('ct-info'), 'var(--corrupted-purple)', 'info is violet, not cyan');
  assert.equal(tone('ct-warn'), 'var(--corrupted-red)');
  assert.doesNotMatch(code.match(/\.ct-(?:key|info|warn)\s*\{[^}]+\}/g).join('\n'),
    /--corrupted-cyan|--corrupted-green/, 'cyan/green carry no callout meaning here');
  // Green is a system callback and never appears here. Cyan is legal in exactly
  // one place: as one END of the corrupted rank ramp, which spec §5 sanctions as
  // a compositional use of an accent — not as a state anywhere else in the sheet.
  assert.doesNotMatch(code, /--corrupted-green/, 'green is a system callback, not an editorial colour');
  const outsideRanks = code.replace(/\.ct-ranks-corrupted\s*\{[^}]*\}/, '');
  assert.doesNotMatch(outsideRanks, /--corrupted-cyan/, 'cyan is legal only in the corrupted rank ramp');
});

test('.ct-rank reads rank colours from --ct-rank-* only', () => {
  const withoutScale = code.replace(/:root\s*\{[^}]*--ct-rank-0:[^}]*\}/, '');
  const rules = [...withoutScale.matchAll(/[^{}]*\.ct-rank[^{}]*\{([^}]*)\}/g)];
  assert.ok(rules.length >= 7, 'expected base .ct-rank plus data-rank rules');
  for (const [, body] of rules) {
    assert.doesNotMatch(body, /#[0-9a-fA-F]{3,8}\b|\brgba?\(|\bhsla?\(/);
    for (const decl of body.match(/(?:color|background|border):[^;]+;/g) ?? []) {
      assert.match(decl, /--ct-rank-/, decl);
    }
  }
});

test('a rank badge outranks the badge default', () => {
  // The first cut put the badge's outline look behind
  // `.ct-badge:not(.is-solid):not(.is-dashed)` — three classes — and the rank
  // colours on a bare `.ct-rank`. The chain won, so every rank badge rendered
  // with an accent border and no fill while the source looked correct. Both
  // halves of the fix are pinned here.
  assert.doesNotMatch(code, /\.ct-badge:not\(/, 'the badge default must not sit behind a :not() chain');
  const paint = code.match(/([^{}]*\.ct-rank[^{}]*)\{[^}]*background:[^}]*\}/);
  assert.ok(paint, 'no rule paints .ct-rank');
  assert.match(paint[1], /\.ct-badge\.ct-rank/, 'the rank paint rule must carry .ct-badge');
});

test('every animation runs only under prefers-reduced-motion: no-preference', () => {
  const guarded = code.match(/@media\s*\(prefers-reduced-motion:\s*no-preference\)\s*\{([\s\S]*?\})\s*\}/g) ?? [];
  const inside = guarded.join('\n');
  const all = code.match(/\banimation\s*:[^;]+;/g) ?? [];
  assert.ok(all.length > 0, 'expected the kicker pulse');
  for (const a of all) assert.ok(inside.includes(a), `unguarded: ${a}`);
});

test('gradient title has a forced-colors fallback', () => {
  assert.match(code, /@media\s*\(forced-colors:\s*active\)\s*\{\s*\.ct-title\s*\{[^}]*-webkit-text-fill-color:\s*CanvasText/);
});

test('an empty spark bar is declared after, and at least as specific as, the dimmed-bar rule', () => {
  // The yap port had these the other way round, so an empty bar never read as
  // empty. Equal specificity means source order decides.
  const dim = code.indexOf('.ct-spark-bar:not(:last-child)');
  const empty = code.indexOf('.ct-spark .ct-spark-bar.is-empty');
  assert.ok(dim > -1 && empty > dim);
});

test('.ct-cols collapses to one column only inside a media query', () => {
  // The yap port shipped the mobile rule bare, so columns never sat side by
  // side at any width.
  const bare = code.replace(/@media[^{]*\{(?:[^{}]*\{[^{}]*\})*[^{}]*\}/g, '');
  assert.doesNotMatch(bare, /\.ct-cols\s*\{[^}]*grid-template-columns:\s*1fr\s*;/);
});

test('--font-mono is declared, so its existing var() fallbacks stop firing', () => {
  assert.match(read('src/css/variables.css'), /--font-mono:\s*[^;]*monospace;/);
});

test('bundled in theme.css and exported on its own', () => {
  assert.match(read('src/css/theme.css'), /@import '\.\/editorial\.css';/);
  const pkg = JSON.parse(read('package.json'));
  assert.equal(pkg.exports['./editorial'], './src/css/editorial.css');
});

test('the demo page uses every class, and only classes that exist', () => {
  const html = read('examples/editorial.html');
  const used = new Set();
  for (const [, list] of html.matchAll(/class="([^"]*)"/g)) {
    // State classes count only on an element that also carries a ct- class —
    // the same scoping the CSS guard enforces, and the page's own navbar ships
    // a `has-submenu` that this sheet knows nothing about.
    const names = list.split(/\s+/);
    const onCt = names.some((c) => c.startsWith('ct-'));
    for (const c of names) {
      if (c.startsWith('ct-') || (onCt && (c.startsWith('is-') || c.startsWith('has-')))) used.add(c);
    }
  }
  const unknown = [...used].filter((c) => !classes.has(c));
  const unused = [...classes].filter((c) => !used.has(c));
  assert.deepEqual(unknown, [], 'demo uses classes the module does not define');
  assert.deepEqual(unused, [], 'module defines classes the demo never shows');
});

test('the reference doc shows markup for every component family', () => {
  const doc = read('docs/COMPONENTS_REFERENCE.md');
  const section = doc.slice(doc.indexOf('## Editorial'));
  assert.ok(section.length > 0 && doc.includes('## Editorial'));
  for (const root of ['ct-article', 'ct-section-h', 'ct-table', 'ct-callout', 'ct-cols', 'ct-grid',
    'ct-card', 'ct-quote', 'ct-spark', 'ct-awards', 'ct-media',
    'ct-entity-head', 'ct-attrs']) {
    assert.match(section, new RegExp(`class="${root}[ "]`), `no markup example for .${root}`);
  }
});

test('quote attribution resets the global page-footer styles it would inherit', () => {
  // theme.css styles every <footer> as a page footer (border-top, padding).
  // The documented markup puts the attribution in a <footer>, so without a
  // reset a divider and an inset appear inside every quote.
  assert.match(read('src/css/theme.css'), /\nfooter\s*\{[^}]*border-top/);
  const attr = code.match(/\.ct-quote-attr\s*\{([^}]*)\}/)[1];
  assert.match(attr, /padding:\s*0;/);
  assert.match(attr, /border-top:\s*0;/);
});

test('names that cannot break on spaces still wrap inside cards and award rows', () => {
  // An entity card next to a fixed-size avatar overflowed a 375px screen
  // with a long handle: min-width:0 lets the box shrink, but the word itself
  // needs permission to break.
  for (const sel of ['.ct-card-title', '.ct-award-winner']) {
    const body = ruleBodyForSelector(sel);
    assert.match(body, /overflow-wrap:\s*anywhere/, sel);
  }
  assert.match(ruleBodyForSelector('.ct-entity-id'), /min-width:\s*0;/);
});

test('every ct- class in the reference doc examples exists in the module', () => {
  // The demo is checked both ways above; the docs are what a consumer copies
  // from, so a class that only exists in prose is a silent no-op for them.
  const doc = read('docs/COMPONENTS_REFERENCE.md');
  const section = doc.slice(doc.indexOf('## Editorial'), doc.indexOf('\n## ', doc.indexOf('## Editorial') + 5));
  const used = new Set();
  for (const [, list] of section.matchAll(/class="([^"]*)"/g)) {
    // State classes count only on an element that also carries a ct- class —
    // the same scoping the CSS guard enforces, and the page's own navbar ships
    // a `has-submenu` that this sheet knows nothing about.
    const names = list.split(/\s+/);
    const onCt = names.some((c) => c.startsWith('ct-'));
    for (const c of names) {
      if (c.startsWith('ct-') || (onCt && (c.startsWith('is-') || c.startsWith('has-')))) used.add(c);
    }
  }
  assert.ok(used.size > 20, `parsed only ${used.size} classes — extractor drifted?`);
  assert.deepEqual([...used].filter((c) => !classes.has(c)), []);
});

test('decorative glyphs are hidden from assistive tech in the demo and the docs', () => {
  // Spec §6.4: the section number, the // marker and the kicker dot are
  // decoration. Announced, they read as "zero one slash slash" before a title.
  const doc = read('docs/COMPONENTS_REFERENCE.md');
  const sources = [read('examples/editorial.html'), doc.slice(doc.indexOf('## Editorial'))];
  for (const src of sources) {
    for (const cls of ['ct-section-n', 'ct-slash', 'ct-kicker-dot']) {
      const tags = src.match(new RegExp(`<span class="${cls}"[^>]*>`, 'g')) ?? [];
      for (const t of tags) assert.match(t, /aria-hidden="true"/, t);
    }
  }
});
