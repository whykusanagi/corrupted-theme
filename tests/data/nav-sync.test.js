// tests/data/nav-sync.test.js — the nav is byte-identical (per-page hrefs
// aside) on every site page; drift fails CI instead of shipping.
import { strict as assert } from 'node:assert';
import { test } from 'node:test';
import { readFileSync, existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { navPages, renderNav, NAV, RELEASE_DEMOS } from '../../scripts/sync-nav.js';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');

function extractNav(source) {
  const start = source.indexOf('<nav class="navbar">');
  if (start === -1) return null;
  const end = source.indexOf('</nav>', start);
  return source.slice(start, end + '</nav>'.length);
}

test('every site page carries the canonical nav for its location', () => {
  const pages = navPages();
  assert.ok(pages.length >= 25, `expected 25+ pages, got ${pages.length}`);
  for (const page of pages) {
    const actual = extractNav(readFileSync(path.join(ROOT, page), 'utf8'));
    assert.ok(actual, `${page}: no navbar found`);
    assert.equal(actual, renderNav(page), `${page}: nav drifted — run npm run nav:sync`);
  }
});

/** Every nav target, parents and submenu entries alike. */
function navTargets() {
  return NAV.flatMap((e) => [e, ...(e.submenu ?? [])]).map((e) => e.target);
}

test('nav surfaces the current release\'s demos', () => {
  const targets = navTargets();
  for (const page of RELEASE_DEMOS.pages) {
    assert.ok(targets.includes(page),
      `nav missing ${page} — it is listed in RELEASE_DEMOS (${RELEASE_DEMOS.version})`);
  }
});

test('RELEASE_DEMOS points at pages that exist', () => {
  for (const page of RELEASE_DEMOS.pages) {
    assert.ok(existsSync(path.join(ROOT, page)),
      `RELEASE_DEMOS lists ${page}, which is not on disk — stale after a rename?`);
  }
});

// The old version of this test hardcoded one release's demos forever, so the
// menu could only grow. Checking that every link resolves catches the failure
// that actually matters — a nav entry pointing at a page that moved or went
// away — without freezing which demos are featured.
test('every nav target resolves to a real page or an external URL', () => {
  for (const target of navTargets()) {
    if (/^https?:/.test(target)) continue;
    const file = target.split('#')[0];
    assert.ok(existsSync(path.join(ROOT, file)), `nav points at missing page: ${file}`);
  }
});

// The navbar lives inside <body> on every demo page, so anything a page
// declares on `body` reaches the site chrome. Two shipped that way: a page
// font-family (10 of 40 pages rendered the nav in Courier New) and
// `display: grid; place-items: center` (centred the bar mid-page). The
// component CSS now re-declares font, width and self-alignment to block
// those, but body padding still insets the bar and cannot be defended
// against generically — so it is caught here instead.
test('no page puts padding on <body>, which would inset the navbar', () => {
  const offenders = [];
  for (const page of navPages()) {
    const src = readFileSync(path.join(ROOT, page), 'utf8');
    for (const block of src.match(/<style>[\s\S]*?<\/style>/g) ?? []) {
      const rule = block.match(/\bbody\s*(?:,[^{]*)?\{([^}]*)\}/);
      if (!rule) continue;
      const padding = rule[1].match(/(?:^|;)\s*padding\s*:\s*([^;]+)/);
      if (padding && !/^0(px|rem|em)?$/.test(padding[1].trim())) {
        offenders.push(`${page} → padding: ${padding[1].trim()}`);
      }
    }
  }
  assert.deepEqual(offenders, [],
    'move page padding to a content wrapper — body padding pushes the navbar off the viewport edge');
});

test('no submenu is long enough to become a wall', () => {
  // 29 entries under Examples is what prompted the reorganisation; cap it so
  // the next few releases cannot quietly rebuild the same problem.
  const LIMIT = 10;
  for (const entry of NAV) {
    if (!entry.submenu) continue;
    assert.ok(entry.submenu.length <= LIMIT,
      `${entry.label} has ${entry.submenu.length} entries (limit ${LIMIT}) — regroup or move some to the gallery`);
  }
});

test('nav labels are identical across pages (structure never varies)', () => {
  const labels = (html) => [...html.matchAll(/<\/i> ([^<]+)</g)].map((m) => m[1].trim());
  const reference = labels(renderNav('index.html'));
  for (const page of navPages()) {
    assert.deepEqual(labels(renderNav(page)), reference, `${page}: label set differs`);
  }
});
