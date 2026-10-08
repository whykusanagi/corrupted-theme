# Clean 0.3.4 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Fix every known defect on a shipped surface so 0.3.4 can publish clean.

**Architecture:** Nine independent tasks against the existing tree — two consumer-facing code fixes in `src/`, two generated-surface changes in `scripts/`, one new example page, two one-line content corrections, repository hygiene, and the publish sequence. Nothing here introduces a module, a dependency or a build step; every task adds its own guard to the suite that is this project's release gate.

**Tech Stack:** Plain ES modules, plain CSS, `node --test` (no framework, no fixtures), PostCSS for the bundle, `gh` for GitHub surfaces, `s3cmd` via `scripts/publish-to-cdn.sh` for the CDN.

**Spec:** [`docs/specs/RELEASE_0_3_4_CLEAN.md`](RELEASE_0_3_4_CLEAN.md)

> **Plan location note.** The writing-plans default is `docs/superpowers/plans/`. This repo keeps design documents in `docs/specs/` (tracked, excluded from the npm tarball by `.npmignore`) and `docs/planning/` is gitignored, so a plan placed there could not be reviewed. The plan therefore sits beside its spec.

## Global Constraints

- **Node 22.22.3+ to build** (`cssnano` 9 floor). `engines` stays `>=18`, which constrains consumers, who never run the build.
- **No new dependencies.** Not for any task in this plan.
- **Every class in `editorial.css` is `ct-`-prefixed**; a state is an `is-*`/`has-*` modifier scoped to a `ct-` element.
- **Colour comes from tokens only.** The sole exception is the twelve standard rank literals inside the `RANK-SCALE-LITERALS` block in `src/css/editorial.css`. No literal hex, `rgb()`, `hsl()` or bare colour keyword anywhere else in that sheet.
- **`--text-muted` is forbidden in `editorial.css`** — it measures 3.7–4.2:1 on these surfaces.
- **Text contrast floor is 4.5:1** against the surface actually painted, including any ancestor `opacity`.
- **Infinite motion only under `@media (prefers-reduced-motion: no-preference)`.**
- **`dist/llms.txt` stays under 32KB.** The 16KB figure in earlier docs was never measured: the file was already 24.5KB before this release touched it, because no test asserted it. See the ledger note on Task 3.
- **Public surfaces name no internal repository** and use no harvest verb. The term list is the `TERMS` line in `scripts/audit-provenance.sh`; it is not repeated here, since this repository is public. `celeste-cli` is kept — it is a documented consumer, not a source.
- **CI does not run `npm test`.** The suite is a pre-publish local gate. Green CI ≠ tests ran.
- **Commits are small and on a branch.** Never commit to `main`; never `npm version` (see Task 9, step 6).

## Review Focus

Five things the spec implies, that a task's own happy-path tests would miss, and that would bite a real caller. Each has a test in the task that owns the code.

1. **`fitTitle` with a title at or under the ellipsis budget, or empty.** A naive clip emits a lone `…` or throws on `slice(0, -1)`. Expected: an empty title returns empty, a short title is returned untouched at full size. — Task 2.
2. **`DecryptReveal.stop()` after the animation already finished, and `stop()` twice.** The record is deleted ~50ms after the duration, so settling must tolerate an empty map and must not resurrect text on an element the caller has since reused. Expected: no throw, no write. — Task 1.
3. **`describeStylesheet` on a sheet with no classes.** `variables.css` is `:root` tokens only and `theme.css` is nothing but `@import`s. Expected: empty arrays and an empty knob map, not a crash and not a missing key. — Task 3.
4. **The hero-stat guard on a fresh clone, before `dist/manifest.json` exists.** `pretest` generates it, but a bare `node --test tests/data/...` does not. Expected: a named assertion failure that says to run `npm run manifest:generate`, not a `JSON.parse` stack trace. — Task 4.
5. **The lipsync example with no microphone permission.** `getUserMedia` rejects on deny, on a non-secure origin, and in a browser with no input device. Expected: the page says so in its own UI and the demo still animates from a synthetic source; no unhandled rejection in the console. — Task 5.

---

### Task 1: `DecryptReveal` settles to readable text

**Files:**
- Modify: `src/core/decrypt-reveal.js:59-90` (`_decode`), `:179-187` (`stop`), `:200-207` (`cleanup`)
- Test: `tests/core/decrypt-reveal.test.js`

**Interfaces:**
- Consumes: nothing from other tasks.
- Produces: `_decode()` returns `{ cleanup: Function, isAnimating: Function, settle: Function }` — one added member, `settle(): void`, which writes `finalText` to the element. `stop()`, `cleanup(id)` and `destroy()` keep their existing signatures and return types.

- [ ] **Step 1: Write the failing tests**

Add to `tests/core/decrypt-reveal.test.js`:

```js
test('stop() leaves the element on its final text, not on scrambled glyphs', () => {
  // The manager stops itself when the tab hides. Dropping the animation there
  // left whatever glyphs were last written on screen, so a decode interrupted
  // by a background tab never completed and never resumed — blog headings on
  // the consuming site read as missing. Spec Core Tenet 2: readable endpoints.
  const m = new DecryptReveal();
  const el = { textContent: '' };
  m.decode(el, 'SIGNAL DECAY', { duration: 2000 });
  m.stop();
  assert.equal(el.textContent, 'SIGNAL DECAY');
  m.destroy();
});

test('cleanup(id) settles the one animation it cancels', () => {
  const m = new DecryptReveal();
  const a = { textContent: '' };
  const b = { textContent: '' };
  const idA = m.decode(a, 'ALPHA', { duration: 2000 });
  m.decode(b, 'BETA', { duration: 2000 });
  m.cleanup(idA);
  assert.equal(a.textContent, 'ALPHA');
  assert.equal(b.textContent, '', 'the other animation is untouched');
  m.stop();
  m.destroy();
});

test('stop() is safe with nothing running, and safe twice', () => {
  // Review Focus 2: the record is deleted ~50ms after the duration, so by the
  // time a hidden tab fires, the map may be empty; and a caller may reuse the
  // element, which must not be written to a second time.
  const m = new DecryptReveal();
  const el = { textContent: '' };
  m.decode(el, 'ONCE', { duration: 2000 });
  m.stop();
  el.textContent = 'reused by the caller';
  assert.doesNotThrow(() => m.stop());
  assert.equal(el.textContent, 'reused by the caller');
  m.destroy();
});

test('destroy() settles too', () => {
  const m = new DecryptReveal();
  const el = { textContent: '' };
  m.decode(el, 'TERMINAL', { duration: 2000 });
  m.destroy();
  assert.equal(el.textContent, 'TERMINAL');
});
```

- [ ] **Step 2: Run them and watch them fail**

Run: `node --test tests/core/decrypt-reveal.test.js`
Expected: FAIL — `stop() leaves the element on its final text` reports `'' !== 'SIGNAL DECAY'`. The last two may pass already; they are regression cover for step 3.

- [ ] **Step 3: Add `settle` to the decode handle**

In `src/core/decrypt-reveal.js`, replace the return of `_decode` (currently at `:86-89`):

```js
  return {
    cleanup:     () => { timers.clearInterval(id); done = true; },
    isAnimating: () => !done,
    /** Write the finished text. Teardown calls this so an interrupted decode
     *  never leaves the element unreadable (spec Core Tenet 2). */
    settle:      () => { element.textContent = finalText; },
  };
```

Update the JSDoc `@returns` on `_decode` to `{{ cleanup: Function, isAnimating: Function, settle: Function }}`, and the `@type` on `_animations` at `:125` to match.

- [ ] **Step 4: Settle in `stop()` and in `cleanup(id)`**

Replace `stop()`:

```js
  stop() {
    for (const [, anim] of this._animations) {
      anim.handle.settle();
      anim.handle.cleanup();
    }
    this._animations.clear();
    this._timers.clearAll();
  }
```

and the body of `cleanup(id)`:

```js
    anim.handle.settle();
    anim.handle.cleanup();
    this._animations.delete(id);
```

Update the doc comment above `stop()` — it currently promises the opposite:

```js
  /**
   * Cancel all active animations and clear their timers. Each element is left
   * showing its finished text: a decode interrupted by the tab hiding would
   * otherwise stay frozen on scrambled glyphs, and never resume, because
   * start() is deliberately a no-op.
   * Called automatically when document.hidden becomes true.
   */
```

- [ ] **Step 5: Run the suite**

Run: `npm test`
Expected: PASS, 436 tests (432 + 4).

- [ ] **Step 6: Mutation-check the guard**

Remove `anim.handle.settle();` from `stop()`, run `node --test tests/core/decrypt-reveal.test.js`, confirm two failures, then restore it.

- [ ] **Step 7: Commit**

```bash
git add src/core/decrypt-reveal.js tests/core/decrypt-reveal.test.js
git commit -m "fix(decrypt-reveal): stop() leaves readable text, not scrambled glyphs"
```

---

### Task 2: `MicroGfx` fits a title to its card

**Files:**
- Modify: `src/lib/micro-gfx.js:417-433` (`drawText`)
- Test: `tests/lib/micro-gfx.test.js`

**Interfaces:**
- Consumes: nothing.
- Produces: `export function fitTitle(title: string, available: number, opts?: { max?: number, min?: number, advance?: number }): { size: number, text: string }`. `drawText` is unchanged in signature and stays module-private.

**Decision applied:** spec Q1 — shrink to a floor, then ellipsise. If the owner chooses wrapping instead, this task is rewritten: `drawText` emits two `<text>` elements and every downstream y-offset in the card moves.

- [ ] **Step 1: Write the failing tests**

Add to `tests/lib/micro-gfx.test.js` (it already imports from `../../src/lib/micro-gfx.js`; add `fitTitle` to that import):

```js
/* ── Title fitting ──────────────────────────────────────────────────────── */

const CARD_AVAILABLE = 1200 - (Math.round(Math.min(1200, 630) * 0.045) + 22) * 2;

test('a title that fits is untouched at full size', () => {
  const fit = fitTitle('Corrupted Theme 0.3.4', CARD_AVAILABLE);
  assert.equal(fit.text, 'Corrupted Theme 0.3.4');
  assert.equal(fit.size, 44, 'existing cards must render byte-identically');
});

test('a long title shrinks until it fits inside the rail', () => {
  // 56 characters at font-size 44 ran through the frame rail and off the card.
  const title = 'Corrupted Theme 0.3.0: One Home for the Glitch Libraries';
  const fit = fitTitle(title, CARD_AVAILABLE);
  assert.ok(fit.size < 44, `expected a smaller size, got ${fit.size}`);
  assert.ok(fit.text.length * fit.size * 0.6 <= CARD_AVAILABLE,
    `${fit.text.length} chars at ${fit.size}px overflows ${CARD_AVAILABLE}px`);
});

test('a title too long even at the floor is cut on a word boundary', () => {
  const title = 'Corrupted Theme ships one editorial vocabulary for every blog and data page across every consuming site';
  const fit = fitTitle(title, CARD_AVAILABLE);
  assert.ok(fit.text.endsWith('…'), fit.text);
  assert.ok(!/\s…$/.test(fit.text), 'no space before the ellipsis');
  assert.ok(fit.text.length * fit.size * 0.6 <= CARD_AVAILABLE, fit.text);
  assert.ok(title.startsWith(fit.text.slice(0, -1)), 'the kept prefix is verbatim');
});

test('an empty or tiny title is handled without a lone ellipsis', () => {
  // Review Focus 1.
  assert.deepEqual(fitTitle('', CARD_AVAILABLE), { size: 44, text: '' });
  assert.deepEqual(fitTitle('X', CARD_AVAILABLE), { size: 44, text: 'X' });
  const narrow = fitTitle('Some title', 40);
  assert.ok(narrow.text.length >= 2, `refused to emit a bare ellipsis: ${narrow.text}`);
});
```

- [ ] **Step 2: Run them and watch them fail**

Run: `node --test tests/lib/micro-gfx.test.js`
Expected: FAIL — `SyntaxError: The requested module does not provide an export named 'fitTitle'`.

- [ ] **Step 3: Implement `fitTitle`**

In `src/lib/micro-gfx.js`, directly above `drawText`:

```js
/**
 * Fit a title to the width available inside the frame rails.
 *
 * The face is monospace, so width is `chars × size × advance` and no DOM
 * measurement is needed — which matters because the same call has to produce
 * the same card headless, in a browser, and inside a frame-locked render.
 * Shrinks first so the whole title survives; clips on a word boundary only
 * when the floor is still too narrow.
 *
 * @param {string} title
 * @param {number} available  - px between the rails
 * @param {object} [opts]
 * @param {number} [opts.max=44]      - starting font-size
 * @param {number} [opts.min=28]      - floor; below this the card reads as a caption
 * @param {number} [opts.advance=0.6] - monospace advance as a fraction of size
 * @returns {{ size: number, text: string }}
 */
export function fitTitle(title, available, opts = {}) {
  const { max = 44, min = 28, advance = 0.6 } = opts;
  const width = (chars, size) => chars * size * advance;

  for (let size = max; size >= min; size -= 2) {
    if (width(title.length, size) <= available) return { size, text: title };
  }

  const budget = Math.max(2, Math.floor(available / (min * advance)));
  const cut = title.slice(0, budget - 1);
  const atSpace = cut.lastIndexOf(' ');
  const kept = atSpace > budget * 0.5 ? cut.slice(0, atSpace) : cut.trimEnd();
  return { size: min, text: `${kept}…` };
}
```

- [ ] **Step 4: Use it in `drawText`**

Replace the `if (text.title)` block at `:428-433`:

```js
  if (text.title) {
    const fit = fitTitle(text.title, w - m * 2);
    el('text', {
      x: m, y: m + 62, 'font-family': MONO, 'font-size': fit.size,
      'font-weight': 'bold', fill: theme.ink,
    }, parent, fit.text);
  }
```

- [ ] **Step 5: Run the tests**

Run: `node --test tests/lib/micro-gfx.test.js`
Expected: PASS.

- [ ] **Step 6: Confirm short titles still render identically**

Run:

```bash
node -e "
const { fitTitle } = await import('./src/lib/micro-gfx.js');
for (const t of ['Corrupted Theme 0.3.4', 'Season 3 Recap', 'MicroGfx'])
  console.log(JSON.stringify(fitTitle(t, 1092)));
" --input-type=module
```

Expected: every line reports `"size":44` and the title unchanged.

- [ ] **Step 7: Run the suite and commit**

```bash
npm test
git add src/lib/micro-gfx.js tests/lib/micro-gfx.test.js
git commit -m "fix(micro-gfx): fit a long card title instead of running it off the card"
```

- [ ] **Step 8: Leave the downstream note**

Add a CelesteOps comment on task `df453ca8-24fb-4f1b-b7e3-eac261c247ce` saying the site's 41-character truncation in `site/scripts` and `blog/*.html` og:image URLs can be removed once 0.3.4 publishes.

---

### Task 3: The agent surface describes CSS exports

**Files:**
- Modify: `scripts/generate-manifest.js:356-416` (`buildManifest`), `:454` (the llms.txt export loop)
- Test: `tests/data/documented-defaults.test.js` (it already imports `dist/manifest.json`), or a new `tests/data/agent-surface-css.test.js` if that file is already long

**Interfaces:**
- Consumes: nothing.
- Produces: `export function describeStylesheet(source: string): { description?: string, classes: string[], modifiers: string[], knobs: Record<string, string|null> }`, and a manifest entry for every `type: 'css'` export carrying those four keys.

**Decision applied:** spec Q3 — the full inventory in `manifest.json`, a dense one-line summary in `llms.txt`.

- [ ] **Step 1: Write the failing tests**

```js
import { describeStylesheet } from '../../scripts/generate-manifest.js';

test('a stylesheet entry describes what it defines and what it reads', () => {
  const manifest = JSON.parse(readFileSync(path.join(ROOT, 'dist/manifest.json'), 'utf8'));
  const editorial = manifest.exports.find((e) => e.export === './editorial');
  assert.ok(editorial, './editorial is not in the manifest');
  for (const cls of ['ct-card', 'ct-rank', 'ct-label', 'ct-spark']) {
    assert.ok(editorial.classes.includes(cls), `manifest omits .${cls}`);
  }
  for (const mod of ['is-raised', 'has-tick']) {
    assert.ok(editorial.modifiers.includes(mod), `manifest omits .${mod}`);
  }
  assert.equal(editorial.knobs['--ct-grid-min'], '260px');
  assert.equal(editorial.knobs['--ct-measure'], '47rem');
});

test('every class the manifest claims for a stylesheet is defined in it', () => {
  // The surface must not drift from the file it describes.
  const manifest = JSON.parse(readFileSync(path.join(ROOT, 'dist/manifest.json'), 'utf8'));
  for (const e of manifest.exports.filter((x) => x.type === 'css')) {
    const src = readFileSync(path.join(ROOT, e.path), 'utf8');
    for (const cls of e.classes) {
      assert.ok(new RegExp(`\\.${cls}\\b`).test(src), `${e.export} claims .${cls}`);
    }
  }
});

test('a stylesheet with no classes describes itself without crashing', () => {
  // Review Focus 3: variables.css is :root tokens only; theme.css is @imports.
  for (const rel of ['src/css/variables.css', 'src/css/theme.css']) {
    const out = describeStylesheet(readFileSync(path.join(ROOT, rel), 'utf8'));
    assert.ok(Array.isArray(out.classes), rel);
    assert.ok(Array.isArray(out.modifiers), rel);
    assert.equal(typeof out.knobs, 'object', rel);
  }
  const empty = describeStylesheet('');
  assert.deepEqual(empty.classes, []);
  assert.deepEqual(empty.modifiers, []);
  assert.deepEqual(empty.knobs, {});
});

test('the removed 0.3.4 class names appear nowhere in the agent surface', () => {
  const surface = readFileSync(path.join(ROOT, 'dist/manifest.json'), 'utf8')
    + readFileSync(path.join(ROOT, 'dist/llms.txt'), 'utf8');
  for (const gone of ['ct-tile', 'ct-stat', 'ct-cell', 'ct-spark-cap', 'ct-media-portrait']) {
    assert.ok(!new RegExp(`${gone}\\b`).test(surface), `${gone} survives in the agent surface`);
  }
});
```

- [ ] **Step 2: Run them and watch them fail**

Run: `npm run manifest:generate && node --test tests/data/agent-surface-css.test.js`
Expected: FAIL — `./editorial` has no `classes` key.

- [ ] **Step 3: Implement `describeStylesheet`**

In `scripts/generate-manifest.js`, above `buildManifest`:

```js
/**
 * Describe a stylesheet for the agent surface: the classes it defines, the
 * state modifiers scoped to them, and the custom properties it reads with
 * their fallbacks. A CSS export used to reach the surface as its path and
 * nothing else, which left a release whose headline was ~90 classes invisible
 * to the agents the surface exists for.
 *
 * @param {string} source
 * @returns {{ description?: string, classes: string[], modifiers: string[], knobs: Record<string, string|null> }}
 */
export function describeStylesheet(source) {
  const header = /\/\*\*([\s\S]*?)\*\//.exec(source)?.[1] ?? '';
  const description = header
    .split('\n').map((l) => l.replace(/^\s*\*\s?/, '').trim()).find(Boolean);

  const code = source.replace(/\/\*[\s\S]*?\*\//g, '');
  const selectors = code.replace(/\{[^{}]*\}/g, '{}');
  const names = [...new Set([...selectors.matchAll(/\.([a-zA-Z][\w-]*)/g)].map((m) => m[1]))].sort();

  const knobs = {};
  for (const [, name, fallback] of code.matchAll(/var\(\s*(--[\w-]+)\s*(?:,\s*([^)]+))?\)/g)) {
    const value = fallback ? fallback.trim() : null;
    if (!(name in knobs) || (value && knobs[name] === null)) knobs[name] = value;
  }

  return {
    description,
    classes: names.filter((n) => !n.startsWith('is-') && !n.startsWith('has-')),
    modifiers: names.filter((n) => n.startsWith('is-') || n.startsWith('has-')),
    knobs,
  };
}
```

- [ ] **Step 4: Call it from `buildManifest`**

Immediately after the existing `if (type === 'js') { … }` block (ends `:414`), add:

```js
    if (type === 'css') {
      Object.assign(entry, describeStylesheet(readFileSync(path.join(ROOT, target), 'utf8')));
    }
```

- [ ] **Step 5: Give `llms.txt` a dense line per stylesheet**

At the top of the `for (const e of manifest.exports) {` loop at `:454`:

```js
    if (e.type === 'css') {
      const knobs = Object.keys(e.knobs ?? {}).filter((k) => k.startsWith('--ct-'));
      lines.push(`- ${e.export} [css] → ${e.cdnUrl}. ${e.description ?? ''} `
        + `${e.classes?.length ?? 0} classes, ${e.modifiers?.length ?? 0} modifiers`
        + `${knobs.length ? `; knobs: ${knobs.join(' ')}` : ''}. `
        + 'Full class list in manifest.json; markup contract in docs/COMPONENTS_REFERENCE.md.');
      continue;
    }
```

- [ ] **Step 6: Regenerate and check the budget**

```bash
npm run manifest:generate
wc -c dist/llms.txt          # must stay under 32768
node -e "const m=require('./dist/manifest.json');const e=m.exports.find(x=>x.export==='./editorial');console.log(e.classes.length,'classes',e.modifiers.length,'modifiers',Object.keys(e.knobs).length,'knobs')"
```

Expected: `llms.txt` under 32KB; `./editorial` reports roughly 90 classes, a handful of modifiers, and its knobs.

- [ ] **Step 7: Run the suite and commit**

```bash
npm test
git add scripts/generate-manifest.js tests/data/agent-surface-css.test.js
git commit -m "feat(manifest): describe CSS exports on the agent surface"
```

---

### Task 4: The landing page states true numbers

**Files:**
- Modify: `index.html:535-552`
- Test: `tests/data/version-consistency.test.js` (same family: claims that must stay true)

**Interfaces:**
- Consumes: `dist/manifest.json` from Task 3's regeneration. The counts themselves predate Task 3, so this task can run first if needed.
- Produces: nothing other tasks use.

**Definitions, so the numbers mean something:** *Components* = JS exports in the manifest (CSS sheets are not components). *CSS Variables* = distinct custom properties declared across `src/css/*.css`.

- [ ] **Step 1: Measure**

```bash
node -e "const m=require('./dist/manifest.json');console.log('js exports:', m.exports.filter(e=>e.type!=='css'&&e.type!=='data').length)"
grep -rhoE '^\s*--[a-z0-9-]+:' src/css/*.css | sort -u | wc -l
```

Record both numbers; at the time of writing they are 54 and 80.

- [ ] **Step 2: Write the failing test**

In `tests/data/version-consistency.test.js`:

```js
test('the landing page hero states numbers that are actually true', () => {
  // It claimed "50+ Components" and "100+ CSS Variables": one stale low, one
  // simply wrong, both above the fold on the demo site. A claim that cannot
  // rot beats a claim that happens to be right today.
  const manifestPath = path.join(ROOT, 'dist/manifest.json');
  assert.ok(existsSync(manifestPath),
    'dist/manifest.json is missing — run `npm run manifest:generate`');   // Review Focus 4
  const manifest = JSON.parse(readFileSync(manifestPath, 'utf8'));
  const components = manifest.exports.filter((e) => e.type === 'js').length;
  const tokens = new Set(
    readdirSync(path.join(ROOT, 'src/css'))
      .filter((f) => f.endsWith('.css'))
      .flatMap((f) => [...readFileSync(path.join(ROOT, 'src/css', f), 'utf8')
        .matchAll(/^\s*(--[a-z0-9-]+):/gm)].map((m) => m[1])),
  ).size;

  const html = readFileSync(path.join(ROOT, 'index.html'), 'utf8');
  const stat = (label) => {
    const re = new RegExp(`<span class="stat-value">([^<]+)</span>\\s*<span class="stat-label">${label}</span>`);
    const m = re.exec(html);
    assert.ok(m, `no hero stat labelled ${label}`);
    return m[1].trim();
  };
  assert.equal(stat('Components'), String(components));
  assert.equal(stat('CSS Variables'), String(tokens));
});
```

Add `existsSync` and `readdirSync` to the `node:fs` import at the top of that file if they are not already there.

- [ ] **Step 3: Run it and watch it fail**

Run: `node --test tests/data/version-consistency.test.js`
Expected: FAIL — `'50+' !== '54'`.

- [ ] **Step 4: Correct the hero**

In `index.html`, set the two stat values to the measured numbers (`54` and `80` at the time of writing — use what step 1 printed).

- [ ] **Step 5: Check the two neighbouring claims by hand**

`5 Extension Modules` and `A11y / WCAG AA` sit in the same bar and are not generated. Count the extension modules in `examples/extensions-showcase.html`; if the figure disagrees, correct it. Leave the WCAG claim alone — the contrast guards back it.

- [ ] **Step 6: Run the suite and commit**

```bash
npm test
git add index.html tests/data/version-consistency.test.js
git commit -m "fix(site): the hero stats state the real numbers, and a test keeps them true"
```

---

### Task 5: `lipsync` ships an example page

**Files:**
- Create: `examples/lipsync.html`
- Modify: `scripts/sync-nav.js` (`NAV`), `index.html`, `examples/index.html`
- Test: covered by the existing `tests/data/nav-sync.test.js` byte-compare; add nothing new

**Interfaces:**
- Consumes: `./lipsync` → `{ LIPSYNC, rms, smoothRms, mouthTarget, approach }` from `src/core/lipsync.js`. `rms(buffer) → number`, `smoothRms(prev, raw, factor?) → number`, `mouthTarget(smoothed, ceiling?) → number`, `approach(current, target, step?) → number`.
- Produces: one page; no API.

- [ ] **Step 1: Build the page**

`examples/lipsync.html`, following `examples/audio-spectrum.html` for structure and `examples/editorial.html` for commentary density. It must:

- link `../src/css/theme.css`, carry the canonical navbar (Task 5 step 2 stamps it), and a footer reading `Corrupted Theme v0.3.4`;
- show a mouth-weight meter driven by `rms → smoothRms → mouthTarget → approach`, which is the documented chain in the module's own `@example`;
- offer two sources: **microphone** via `getUserMedia`, and **synthetic**, a generated tone the page drives when there is no microphone;
- **start on synthetic** so the page animates before any permission prompt, and surface a line of copy when `getUserMedia` rejects — Review Focus 5. The rejection path must be caught, not left to the console;
- use `.ct-callout.ct-info` for the explanation block and `.ct-meter` for the weight bar, since both now ship;
- state in a comment why the smoothing exists (`LIPSYNC.SMOOTH_FACTOR`) and what `RMS_CEILING` normalises against.

- [ ] **Step 2: Put it in the nav and the indexes**

In `scripts/sync-nav.js`, add `examples/lipsync.html` to `NAV` under the group that holds `audio-spectrum.html`, then:

```bash
npm run nav:sync
```

Add a card and a release quick-link entry to `index.html` and `examples/index.html`, matching the entries added for `examples/editorial.html`.

- [ ] **Step 3: Verify in a browser**

```bash
npm run dev:static
```

Load `http://localhost:8000/examples/lipsync.html`. Expected: the meter animates from the synthetic source on load; **deny** the microphone prompt and confirm the page says so and keeps animating; zero console errors.

- [ ] **Step 4: Run the suite and commit**

```bash
npm test     # nav-sync byte-compare must pass
git add examples/lipsync.html scripts/sync-nav.js index.html examples/index.html
git commit -m "docs(examples): lipsync ships the example page the checklist asks for"
```

---

### Task 6: `.env.example` carries no real-looking value

**Files:**
- Modify: `examples/.env.example:16`

- [ ] **Step 1: Replace the UUID**

```bash
sed -i '' 's/c7bfa746-e7f8-11ef-bf8f-4e013e2ddde4/00000000-0000-4000-8000-000000000000/' examples/.env.example
grep -nE '[0-9a-f]{8}-[0-9a-f]{4}' examples/.env.example
```

Expected: the only match is the synthetic UUID.

- [ ] **Step 2: Confirm the rest of the file is obviously fake**

Read it end to end. Every value should read as a placeholder (`your-agent-id-uuid`, `your-api-key-token`). Anything that looks copied from a real system gets the same treatment.

- [ ] **Step 3: Commit**

```bash
git add examples/.env.example
git commit -m "chore(examples): the env template teaches a synthetic UUID"
```

---

### Task 7: The v0.3.0 release notes stop naming internal repositories

**Files:**
- Create: `scripts/audit-provenance.sh`
- Modify: `package.json` (`scripts.audit:provenance`), `docs/governance/RELEASE_CONTENT_CHECKLIST.md` (E4 row)
- External: the v0.3.0 GitHub release body and title

**Decision applied:** spec Q4 — rewrite body and title, leave the tag and date. **Owner approval before the `gh release edit` runs.**

- [ ] **Step 1: Write the audit script**

`scripts/audit-provenance.sh`:

```bash
#!/usr/bin/env bash
# Release gate E4 — public surfaces name no internal repository and use no
# harvest verb. Covers the published GitHub releases too: the CHANGELOG was
# scrubbed for 0.3.0 and the release notes were not, and nobody noticed for
# three months because the grep only ever ran over files.
set -uo pipefail

TERMS='<the term list — see scripts/audit-provenance.sh>'
status=0

echo "== files =="
if grep -rnEI "$TERMS" README.md CHANGELOG.md docs examples src dist/manifest.json dist/llms.txt \
     --exclude-dir=governance --exclude-dir=planning --exclude-dir=specs 2>/dev/null; then
  status=1
fi

echo "== published releases =="
for tag in $(gh release list --limit 20 --json tagName --jq '.[].tagName'); do
  if gh release view "$tag" --json name,body --jq '"\(.name)\n\(.body)"' | grep -nEI "$TERMS"; then
    echo "  ^ in release $tag"
    status=1
  fi
done

[ "$status" -eq 0 ] && echo "clean" || echo "E4 FAILED"
exit "$status"
```

```bash
chmod +x scripts/audit-provenance.sh
```

Add to `package.json` scripts, beside `audit:colors`:

```json
    "audit:provenance": "bash scripts/audit-provenance.sh",
```

- [ ] **Step 2: Run it and read the failure**

Run: `npm run audit:provenance`
Expected: FAIL, naming the v0.3.0 release. `docs/specs`, `docs/governance` and `docs/planning` are excluded because they are internal and never shipped.

- [ ] **Step 3: Draft the replacement notes**

Title: `v0.3.0 — orchestration, overlay components and the agent surface`

Body: the 0.3.0 section of `CHANGELOG.md` verbatim — it was already scrubbed — plus the existing release's links. **Show the owner the draft and wait.** The text goes out under their account on a page that has been public since July.

- [ ] **Step 4: Apply, once approved**

```bash
gh release edit v0.3.0 --title "<approved title>" --notes-file /tmp/v0.3.0-notes.md
npm run audit:provenance
```

Expected: `clean`.

- [ ] **Step 5: Wire it into the checklist and commit**

In `docs/governance/RELEASE_CONTENT_CHECKLIST.md`, row 39 (E4), replace the hand-written grep with `npm run audit:provenance`, and note that it covers published release bodies.

```bash
git add scripts/audit-provenance.sh package.json docs/governance/RELEASE_CONTENT_CHECKLIST.md
git commit -m "chore(release): E4 greps the published releases, not just the files"
```

---

### Task 8: Branch hygiene

**Files:** none.

- [ ] **Step 1: Confirm each branch is fully merged**

```bash
git fetch --prune
git branch -r --merged origin/main | grep -v 'origin/main$'
```

Expected: `claude/epic-lamport-c6ei94`, `claude/sweet-jemison-dd3893`, `cursor/corrupted-flares`, `docs/0.3.3-sri`, `fix/palette-correctness`. Anything else that appears gets checked before it is deleted.

- [ ] **Step 2: Delete the merged remotes**

```bash
for b in claude/epic-lamport-c6ei94 claude/sweet-jemison-dd3893 cursor/corrupted-flares docs/0.3.3-sri fix/palette-correctness; do
  git push origin --delete "$b"
done
```

- [ ] **Step 3: Delete the stale locals**

```bash
git branch -d claude/sweet-jemison-dd3893 cursor/corrupted-flares docs/0.3.3-sri fix/palette-correctness release/0.3.4
git branch -D feature/0.3.2-generative-components   # upstream is gone
git branch -vv
```

Expected: `main`, plus whatever branch this plan is being executed on.

---

### Task 9: Publish 0.3.4

Run in one sitting, from a clean tree on `main`, after Tasks 1–8 have merged.

- [ ] **Step 1: Re-run the security gate**

```bash
for ep in code-scanning dependabot secret-scanning; do
  printf '%s: ' "$ep"
  gh api "repos/whykusanagi/corrupted-theme/$ep/alerts?state=open" --jq 'length'
done
```

Expected: `0`, `0`, `0`. **A green CodeQL check is not the same thing** — query the alerts API. Any non-zero stops the release.

- [ ] **Step 2: Set the real publish date**

In `CHANGELOG.md`, set the `## [0.3.4] - …` heading to today. Commit as `chore(release): 0.3.4 publish date`.

- [ ] **Step 3: Build every generated surface from a clean tree**

```bash
npm run build && npm run build:umd && npm run manifest:generate
npm run audit:provenance
npm run lint:security
npm test
npm pack --dry-run | grep -iE '\.env$|\.test\.js|CORRUPTED_THEME_SPEC|CORRUPTION_BUFFER|governance|planning|docs/specs'
```

Expected: all green; the last command prints nothing.

- [ ] **Step 4: Publish to npm**

```bash
npm publish --access public
npm view @whykusanagi/corrupted-theme version
```

Expected: `0.3.4`.

- [ ] **Step 5: Tag by hand**

```bash
git tag -a v0.3.4 -m "v0.3.4 — one editorial vocabulary for every blog and data page"
git push origin v0.3.4
```

**Never `npm version`.** The version was bumped inside the release PR, so `npm version` would bump past it — which is exactly how 0.3.2 reached npm with no tag and no release and went unnoticed for a month.

- [ ] **Step 6: Publish to both CDN zones**

```bash
npm run publish-cdn
for host in cdn.whykusanagi.xyz cdn.nikkers.cc; do
  curl -sI "https://$host/corrupted-theme/@0.3.4/dist/theme.min.css?cb=$(date +%s)" | head -3
  curl -sI "https://$host/corrupted-theme/@latest/dist/theme.min.css?cb=$(date +%s)" | head -3
done
```

Expected: `200` and `content-type: text/css` on all four. Updated paths stay edge-cached until purged — purge both zones, not one.

- [ ] **Step 7: SRI into the CHANGELOG**

```bash
npm run generate-sri
```

Paste the table into the 0.3.4 section, commit, push.

- [ ] **Step 8: GitHub Release**

```bash
gh release create v0.3.4 --title "v0.3.4 — one editorial vocabulary for every blog and data page" --notes-file /tmp/v0.3.4-notes.md
npm run audit:provenance
```

- [ ] **Step 9: Verify the live demo site**

Load `corrupted.whykusanagi.xyz`: version badge reads 0.3.4, the editorial and lipsync links resolve, zero console errors.

- [ ] **Step 10: Un-gate downstream**

Mark CelesteOps `1392ad1c` done with the published version and the SRI hashes; comment the release on the consumer tickets (`686aa0e1`, `aa087307`, `df453ca8`); note on `df453ca8` that the site's title truncation can now come out.

---

## Self-Review

**Spec coverage.** §4 A→Task 1, B→Task 2, C→Task 3, D→Task 5, E→Task 4, F→Task 6, G→Task 7, H→Task 8, I→Task 9. §5's verification rows are folded into the task that produces each artifact. §6's deferrals carry no task by design. §7's Q1, Q3 and Q4 are applied as stated decisions in Tasks 2, 3 and 7; Q2's recommendation is implemented in Task 1; Q5 is a deferral and has no task.

**Placeholders.** None: every code step carries the code, every test step carries the test, and every command is runnable as written.

**Type consistency.** `settle()` is named identically in Task 1's steps 3 and 4. `fitTitle(title, available, opts)` returns `{ size, text }` in both the implementation and all four tests. `describeStylesheet(source)` returns the same four keys in its implementation, its manifest call site, its llms.txt consumer and its tests.

**Review Focus coverage.** 1 → Task 2 step 1, fourth test. 2 → Task 1 step 1, third test. 3 → Task 3 step 1, third test. 4 → Task 4 step 2, the `existsSync` assertion. 5 → Task 5 steps 1 and 3, the denied-permission path.
