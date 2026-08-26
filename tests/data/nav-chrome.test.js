// tests/data/nav-chrome.test.js — the navbar is chrome, and pages may not restyle it.
//
// nav-sync.test.js already byte-compares the navbar MARKUP on every page. That
// is only half of "unified navigation": the bar lives inside <body>, so a page's
// own body rules still reach it. Three bugs shipped through that gap —
//
//   - `body { font-family: 'Courier New' }` on 10 of 40 pages, so the nav
//     changed font as you moved around the site;
//   - `body { display: grid; place-items: center }` on glitch-stagger-grid,
//     which made the bar a centred grid item and left the fixed control rail
//     sitting to its left instead of below it;
//   - `body { line-height: 1.6 }` on five pages, which made the bar 66.6px
//     there and 68.2px everywhere else — two different navbars.
//
// So this file guards the STYLING half. Markup sync + style isolation together
// are what "unified" actually means.
import { strict as assert } from 'node:assert';
import { test } from 'node:test';
import { readFileSync, readdirSync, statSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');

/**
 * Properties a page may NOT put on html/body/*, because they make the navbar a
 * layout child and no amount of self-defence on `nav.navbar` fully recovers
 * from that — a multi-column body grid places the bar in a cell.
 *
 * Inherited typography (`font-family`, `line-height`, `letter-spacing`,
 * `text-transform`, `text-align`) is deliberately NOT banned: pages legitimately
 * set their own, and `nav.navbar` re-declares each one. That re-declaration is
 * the actual contract, and the third test below is what holds it.
 */
const FORBIDDEN_ON_BODY = [
  ['display:grid/flex', /display\s*:\s*(grid|flex)/],
  ['place-items', /place-items\s*:/],
];

/**
 * Inheritable properties `nav.navbar` must re-declare. Each one, left to
 * inherit, changes the bar's rendered box: line-height alone made it 66.6px on
 * five pages and 68.2px on the other thirty-five.
 */
const MUST_REDECLARE = ['font-family', 'line-height', 'font-size', 'letter-spacing',
  'text-transform', 'text-align', 'min-height', 'width', 'box-sizing',
  'justify-self', 'align-self', 'flex'];

/** Pages may not guess the chrome's height — `--navbar-h` is the contract. */
const MAGIC_OFFSET = /(?:top|margin-top|padding-top)\s*:\s*(6[5-9]|7\d|8\d|9\d|1[0-2]\d)px/g;

function pages() {
  const out = [];
  (function walk(dir) {
    for (const e of readdirSync(path.join(ROOT, dir))) {
      const rel = path.join(dir, e);
      if (statSync(path.join(ROOT, rel)).isDirectory()) { walk(rel); continue; }
      if (e.endsWith('.html')) out.push(rel);
    }
  })('examples');
  out.push('index.html');
  return out;
}

/** Only the page's own <style> blocks — the theme's CSS is not a page's doing. */
function pageStyles(src) {
  return [...src.matchAll(/<style[^>]*>([\s\S]*?)<\/style>/g)].map((m) => m[1]).join('\n');
}

/** Declarations on html / body / * — the selectors whose values reach the navbar. */
function bodyBlocks(css) {
  const out = [];
  for (const m of css.matchAll(/([^{}]+)\{([^{}]*)\}/g)) {
    const sel = m[1].trim().split('\n').pop().trim().toLowerCase();
    const parts = sel.split(',').map((s) => s.trim());
    if (parts.some((p) => p === 'body' || p === 'html' || p === '*')) out.push(m[2]);
  }
  return out.join(';');
}

test('no page declares a property on body that restyles the navbar', () => {
  const offenders = [];
  for (const rel of pages()) {
    const decls = bodyBlocks(pageStyles(readFileSync(path.join(ROOT, rel), 'utf8')));
    for (const [name, re] of FORBIDDEN_ON_BODY) {
      if (re.test(decls)) offenders.push(`${rel}: body { ${name} }`);
    }
  }
  assert.deepEqual(offenders, [],
    'these reach nav.navbar and change its size or position — scope them to a '
    + 'wrapper element instead of declaring them on body');
});

test('no page hardcodes the navbar height — use var(--navbar-h)', () => {
  const offenders = [];
  for (const rel of pages()) {
    const css = pageStyles(readFileSync(path.join(ROOT, rel), 'utf8'));
    for (const m of css.matchAll(MAGIC_OFFSET)) offenders.push(`${rel}: ${m[0]}`);
  }
  assert.deepEqual(offenders, [],
    'offsets in the navbar-height range must be calc(var(--navbar-h) + Npx); '
    + 'six pages used a flat 88px against a bar that was really 66.6px or 68.2px');
});

test('--navbar-h is declared, and nav.navbar pins itself to it', () => {
  const vars = readFileSync(path.join(ROOT, 'src/css/variables.css'), 'utf8');
  assert.match(vars, /--navbar-h:\s*\d+px/, '--navbar-h must be declared in variables.css');

  const components = readFileSync(path.join(ROOT, 'src/css/components.css'), 'utf8');
  const rule = /\nnav\.navbar\s*\{([^}]*)\}/.exec(components);
  assert.ok(rule, 'nav.navbar rule not found');
  for (const prop of MUST_REDECLARE) {
    assert.match(rule[1], new RegExp(`${prop}\\s*:`),
      `nav.navbar must re-declare ${prop} so a page's body cannot dictate it`);
  }
});

test('every page carries the navbar and loads the theme stylesheet', () => {
  const missing = [];
  for (const rel of pages()) {
    const src = readFileSync(path.join(ROOT, rel), 'utf8');
    if (!src.includes('class="navbar"')) missing.push(`${rel}: no navbar`);
    if (!/theme(\.min)?\.css/.test(src)) missing.push(`${rel}: no theme stylesheet`);
  }
  assert.deepEqual(missing, []);
});
