// tests/data/contrast-claims.test.js — every stated contrast ratio must be true.
//
// The docs asserted WCAG ratios that did not hold. `ACCESSIBILITY.md` claimed
// `#d94f90` was 7.2:1 (AAA) when it is 5.2:1 (AA), and stated the correct
// figure for that identical pair nine lines later. Two files claimed *universal*
// AAA compliance the palette does not achieve, and one documented white at 30%
// opacity as 6.3:1 AA when it is 2.6:1 — a real failure, published as a pass.
//
// A wrong colour in a doc is a cosmetic bug. A wrong contrast ratio is someone
// making a compliance decision on a number we invented, so this is the one
// colour guard that checks arithmetic rather than membership.
//
// Ratios are WCAG 2.1 relative luminance, against `--bg` (#0a0a0a) unless the
// claim names its own background.
import { strict as assert } from 'node:assert';
import { test } from 'node:test';
import { readFileSync, readdirSync, statSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const PAGE_GROUND = '#0a0a0a';
const TOLERANCE = 0.15;          // docs round to one decimal

/* ── WCAG 2.1 math ─────────────────────────────────────────────────────── */

function channels(hex) {
  let h = hex.replace('#', '');
  if (h.length === 3) h = [...h].map((c) => c + c).join('');
  return [0, 2, 4].map((i) => parseInt(h.slice(i, i + 2), 16));
}

function luminance(hex) {
  const [r, g, b] = channels(hex).map((v) => {
    const c = v / 255;
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

function ratio(a, b) {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
}

/** Composite `fg` at `alpha` over an opaque `bg`. */
function over(fg, bg, alpha) {
  const f = channels(fg); const b = channels(bg);
  const mix = f.map((v, i) => Math.round(v * alpha + b[i] * (1 - alpha)));
  return '#' + mix.map((v) => v.toString(16).padStart(2, '0')).join('');
}

/* ── claim extraction ──────────────────────────────────────────────────── */

const HEX = /#[0-9a-fA-F]{6}/g;
/** A stated ratio, e.g. `**5.2:1**` or `5.2:1 ratio`. */
const RATIO = /(\d+(?:\.\d+)?)\s*:\s*1/;
/** Thresholds and checklists state a requirement, not a measurement. */
const IS_REQUIREMENT = /minimum|requirement|for text|for UI|\[ \]|>\s*\d|至少/i;

function docs() {
  const out = [];
  (function walk(dir) {
    for (const e of readdirSync(path.join(ROOT, dir))) {
      const rel = path.join(dir, e);
      if (statSync(path.join(ROOT, rel)).isDirectory()) {
        if (e !== 'planning') walk(rel);
        continue;
      }
      if (e.endsWith('.md')) out.push(rel);
    }
  })('docs');
  return out;
}

/**
 * Every reading a line could plausibly be asserting. A claim passes if ANY
 * reading matches — deliberately permissive, because the alternative is
 * failing the build over prose the parser simply misread.
 */
function candidates(line) {
  const hexes = [...line.matchAll(HEX)].map((m) => m[0].toLowerCase());
  const out = [];
  for (const h of hexes) out.push(ratio(h, PAGE_GROUND));
  // "White text on `#hex`" / "Black text on `#hex`"
  if (/white/i.test(line)) for (const h of hexes) out.push(ratio('#ffffff', h));
  if (/black/i.test(line)) for (const h of hexes) out.push(ratio('#000000', h));
  // "`#fg` on `#bg`"
  if (hexes.length >= 2) {
    out.push(ratio(hexes[0], hexes[1]));
    out.push(ratio(hexes[1], hexes[0]));
  }
  // "White text (70%) on …" — composite first, then measure
  const pct = /\((\d{1,3})\s*%\)/.exec(line);
  if (pct) {
    const a = Number(pct[1]) / 100;
    const grounds = hexes.length ? hexes : [PAGE_GROUND];
    for (const g of grounds) out.push(ratio(over('#ffffff', g, a), g));
  }
  return out;
}

test('every contrast ratio stated in the docs is arithmetically true', () => {
  const wrong = [];
  let checked = 0;

  for (const rel of docs()) {
    const lines = readFileSync(path.join(ROOT, rel), 'utf8').split('\n');
    lines.forEach((line, idx) => {
      const m = RATIO.exec(line);
      if (!m || IS_REQUIREMENT.test(line)) return;
      if (!HEX.test(line) && !/white|black/i.test(line)) return;
      HEX.lastIndex = 0;
      if (![...line.matchAll(HEX)].length) return;

      const claimed = Number(m[1]);
      checked += 1;
      const options = candidates(line);
      if (!options.some((r) => Math.abs(r - claimed) <= TOLERANCE)) {
        const best = options.length
          ? options.reduce((a, b) => (Math.abs(a - claimed) < Math.abs(b - claimed) ? a : b))
          : NaN;
        wrong.push(`${rel}:${idx + 1} claims ${claimed}:1, closest real value is `
          + `${Number.isNaN(best) ? 'unparseable' : best.toFixed(1)}:1 — ${line.trim().slice(0, 72)}`);
      }
    });
  }

  // A parser that stops matching would otherwise pass by checking nothing.
  assert.ok(checked >= 25,
    `only ${checked} contrast claims parsed — the extractor has probably drifted; `
    + 'a guard that checks nothing passes silently');

  assert.deepEqual(wrong, [],
    'a stated ratio does not match the arithmetic — someone will make an '
    + 'accessibility decision on this number');
});

test('docs do not claim blanket AAA compliance the palette cannot meet', () => {
  // Magenta2 is 5.2:1 and violet 4.7:1 against --bg. Both are AA. Any sweeping
  // "all combinations are AAA" line is false by construction.
  const offenders = [];
  for (const rel of docs()) {
    const src = readFileSync(path.join(ROOT, rel), 'utf8');
    for (const m of src.matchAll(/^.*\ball (?:celeste )?colou?r combinations?[^\n]*AAA[^\n]*$/gim)) {
      offenders.push(`${rel}: ${m[0].trim().slice(0, 90)}`);
    }
    for (const m of src.matchAll(/✅\s*All pass(?:es)?\s*AAA/gi)) {
      offenders.push(`${rel}: ${m[0]}`);
    }
  }
  assert.deepEqual(offenders, [],
    'magenta2 (5.2:1) and violet (4.7:1) are AA against --bg, so no document '
    + 'may claim every combination reaches AAA');
});

test('every --corrupted-* token referenced is defined in variables.css', () => {
  // 87 references, zero definitions: each var() call fell through to a literal
  // fallback, so the indirection did nothing and overriding a token was a no-op.
  const vars = readFileSync(path.join(ROOT, 'src/css/variables.css'), 'utf8');
  const defined = new Set([...vars.matchAll(/^\s*(--corrupted-[a-z0-9]+)\s*:/gm)].map((m) => m[1]));

  const referenced = new Set();
  (function walk(dir) {
    for (const e of readdirSync(path.join(ROOT, dir))) {
      const rel = path.join(dir, e);
      if (statSync(path.join(ROOT, rel)).isDirectory()) { walk(rel); continue; }
      if (!/\.(css|js)$/.test(e) || e.includes('.min.')) continue;
      const src = readFileSync(path.join(ROOT, rel), 'utf8')
        .replace(/\/\*[\s\S]*?\*\//g, ' ');          // prose mentions tokens too
      for (const m of src.matchAll(/var\(\s*(--corrupted-[a-z0-9]+)/g)) referenced.add(m[1]);
    }
  })('src');

  assert.ok(referenced.size >= 5, `only ${referenced.size} tokens referenced — extractor drifted`);
  assert.deepEqual([...referenced].filter((t) => !defined.has(t)).sort(), [],
    'referenced but never defined — the var() falls through to its literal '
    + 'fallback and the token cannot be overridden');
});

test('each --corrupted-* fallback still equals its token definition', () => {
  // Defining the tokens was only safe because all 64 fallback sites already
  // matched. If someone edits one side, the two silently diverge and the
  // rendered colour depends on whether variables.css happens to be loaded.
  const vars = readFileSync(path.join(ROOT, 'src/css/variables.css'), 'utf8');
  const defined = Object.fromEntries(
    [...vars.matchAll(/^\s*(--corrupted-[a-z0-9]+)\s*:\s*(#[0-9a-fA-F]{3,8})\s*;/gm)]
      .map((m) => [m[1], m[2].toLowerCase()]),
  );

  const drift = [];
  let pairs = 0;
  // examples/ too: those pages ship in the tarball and carry most of the
  // fallback sites, so drift there is just as visible to a consumer.
  for (const root of ['src', 'examples']) {
    (function walk(dir) {
      for (const e of readdirSync(path.join(ROOT, dir))) {
        const rel = path.join(dir, e);
        if (statSync(path.join(ROOT, rel)).isDirectory()) { walk(rel); continue; }
        if (!/\.(css|js|html)$/.test(e) || e.includes('.min.')) continue;
        const src = readFileSync(path.join(ROOT, rel), 'utf8');
        for (const m of src.matchAll(/var\(\s*(--corrupted-[a-z0-9]+)\s*,\s*(#[0-9a-fA-F]{3,8})\s*\)/g)) {
          pairs += 1;
          let fb = m[2].toLowerCase();
          if (fb.length === 4) fb = '#' + [...fb.slice(1)].map((c) => c + c).join('');
          if (defined[m[1]] && defined[m[1]] !== fb) {
            drift.push(`${rel}: var(${m[1]}, ${m[2]}) but ${m[1]} is ${defined[m[1]]}`);
          }
        }
      }
    })(root);
  }

  assert.ok(pairs >= 40, `only ${pairs} fallback pairs found — extractor drifted`);
  assert.deepEqual([...new Set(drift)], [], 'a fallback disagrees with its token');
});
