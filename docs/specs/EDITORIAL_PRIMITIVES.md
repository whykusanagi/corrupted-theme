# Spec: Editorial & data-page primitives

**Status:** Draft, awaiting decisions D1–D6
**Tracks:** [#76](https://github.com/whykusanagi/corrupted-theme/issues/76)
**Target:** next feature release after 0.3.3
**Module:** `src/css/editorial.css` → export `./editorial`

---

## 1. Summary

Promote the long-form article and data-page primitives into the theme, so they
stop being re-derived in every consuming project. The goal is the one #76
states: after this ships, the alias block in `stream-blog`'s `yap.css` and the
inline `contentBlockStyles()` in `nikke` can both be deleted, and content
written for one site renders the same on the other.

This is a **harvest, not a redesign**. Every rule starts from an existing
implementation. It changes only where that implementation breaks a theme rule
(palette, motion, naming) or where the copies have drifted and one has to win.

## 2. Sources inspected

| Source | Revision | What it contributes |
|---|---|---|
| `nikke/src/lib/content-blocks.ts` | `f0a89bf` | `.ct-*` block CSS (**canonical**) and the renderer, which serves as the de-facto markup contract |
| `nikke/src/pages/updates.ts` | `f0a89bf` | `.upd-*` article header (lines 29–60) |
| `stream-blog/public/assets/yap.css` | `5fed404` | A second `.ct-*`/`.upd-*` port, plus the `.tile`/`.spark`/`.award-*` port from `recap.css` |
| `nikke-analysis/recap/recap.css` | — | **Not inspected.** Not reachable from this session, so the data-display rules come from the `yap.css` port. Check it against the original before the implementation PR (see Q4). |

## 3. Findings

These were verified against the sources above. Several go beyond the inventory
in #76.

### 3.1 Drift between the two `.ct-*` copies

| Rule | nikke (canonical) | yap port | Effect on yap |
|---|---|---|---|
| `.ct-cols` | `repeat(var(--ct-cols,2), …)`, collapses to `1fr` under 720px | Adds an **unconditional** `.ct-cols { grid-template-columns: 1fr }` at the end of the section | **Bug:** columns never sit side by side, at any width |
| Measure opt-outs | `.ct-stat-row`, `.ct-cols`, `.ct-grid`, `.ct-attrs` get `max-width: none` inside `.ct-body` | Only `.ct-section-h`, `.ct-figure`, `.ct-table` | Grids and stat rows are clamped to the 47rem prose measure |
| Mobile type | `@media (max-width:720px)` shrinks `.ct-section-t` to 1.35rem | Missing | Section titles overflow on phones |
| Reduced motion | `.ct-callout::after` scanline removed | Missing | — |
| `.ct-media`/`.ct-attrs`/`.ct-entity` | Present | Deliberately skipped | Content that uses them renders bare |

### 3.2 The data-display drift that #76 names

`.spark` is `height: 44px` in `recap.css` and `72px` in `yap.css`. Neither is
wrong; the height belongs to the page, so this spec turns it into a custom
property (`--ct-spark-h`) instead of choosing one.

### 3.3 Palette violations the ports would carry in

`tests/data/color-sweep.test.js` and `palette-compliance.test.js` would reject
or contradict the following if they were moved over as-is:

| Where | Value | Rule it breaks |
|---|---|---|
| `.ct-warn { --ct-tone: #e0a106 }` | Raw amber | Not in the palette or in `ALLOWED`, so **color-sweep fails** |
| `.ct-info { --ct-tone: var(--cyan) }` | Cyan as an "info" state | Core Tenet 4: accents "carry no state meaning" |
| `.tile .d { color: var(--up) }` → `--corrupted-green` | Green as "went up" | Green is `semanticUse.system`, a "rare matrix/system callback", not a data direction |
| `.upd-h1` gradient `#f5f1f8`, `#e86ca8`; `::after` `#b61b70` | Literal hex | These are `--text`, `--accent-light` and `--accent-dark`, so they pass the sweep but ignore re-theming |
| `rgba(217,79,144,…)` throughout | Literal accent | Same as above. It is the existing theme idiom, so this is a consistency choice, not a failure (see D4) |

### 3.4 Latent bug in the theme itself

`--font-mono` is referenced 6 times in `src/css/components.css` as
`var(--font-mono, 'Courier New', monospace)`, but it is **never declared**, so
every one of those falls back. Meanwhile, consumers each define their own
(`--mono` and `--upd-mono` in nikke/yap). Declaring the token fixes both
problems (D3).

### 3.5 Weight

Measured by minifying the full candidate set (nikke `.ct-*`, the `.upd-*`
header and the yap data-display rules) with the repo's own postcss config:

| | Minified | Gzipped |
|---|---|---|
| `dist/theme.min.css` today | 80,448 B | 15,069 B |
| Candidate `editorial.css` | 10,978 B | 2,811 B |
| **Delta if bundled** | **+13.6%** | **+18.7%** |

The v1 scope in §5 is smaller than the candidate set (entity/media/attrs are
deferred), so this is an upper bound.

## 4. Decisions

Each decision has a recommendation. The ones marked **needs sign-off** change
public API or consumer markup.

### D1. Delivery: bundled into `theme.css` and exported on its own (recommended)

Follow the `toast.css` pattern. `theme.css` does `@import './editorial.css'`,
and `package.json` also exports `./editorial` for consumers who import modules
one at a time.

*Why not opt-in only (the `nikke-utilities.css` pattern):* the CDN's only
built stylesheet is `dist/theme.min.css`. `src/css/*` is uploaded as well, but
unminified and depending on `variables.css`. The consumers that motivated #76
are the ones that **vendor one pinned artifact** because of the CDN's CORS
policy. An opt-in file makes them vendor and pin a second one, and that pinning
drift is the same failure mode #76 is trying to remove. +2.8 KB gzipped is the
price.

*Alternative if the weight is refused:* build a second artifact,
`dist/editorial.min.css`, via a `build:editorial` script, so it is still one
minified, versioned file.

### D2. Naming: prefix everything `ct-` (recommended, **needs sign-off**)

The `.ct-*` names stay as they are. The others are renamed:

- `.tile`, `.tiles`, `.spark`, `.award-row` are generic, unprefixed names. Once
  they are in a **global** theme stylesheet, any consumer element that happens
  to be called `.tile` picks up these styles. Their child classes (`.k`, `.v`,
  `.d`, `.b`) are even more generic.
- `.upd-*` is named after a page ("updates"). `content-blocks.ts` already sets
  the rule this breaks: *"Nothing in this file may reference a page-specific
  class."*

| Current | New | Notes |
|---|---|---|
| `.upd-wrap` | `.ct-article` | |
| `.upd-header` | `.ct-masthead` | |
| `.upd-kicker` / `.dot` | `.ct-kicker` / `.ct-kicker-dot` | |
| `.upd-h1` | `.ct-title` | |
| `.upd-sub` | `.ct-dek` | "Dek" is the editorial term for a subhead |
| `.upd-datestamp` | `.ct-dateline` | |
| `.tiles` / `.tile` | `.ct-tiles` / `.ct-tile` | |
| `.tile .k` `.v` `.d` | `.ct-tile-label` `.ct-tile-value` `.ct-tile-delta` | |
| `.tile .d.mut` | `.ct-tile-delta` (neutral is now the default) | See D4 |
| `.spark-wrap` `.spark-cap` | `.ct-spark-wrap` `.ct-spark-cap` | |
| `.spark` / `.spark .b` | `.ct-spark` / `.ct-spark-bar` | |
| `.spark .b.empty` / `.spark.flat` | `.ct-spark-bar.is-empty` / `.ct-spark.is-flat` | |
| `.spark-x` | `.ct-spark-axis` | |
| `.awards-list` / `.award-row` | `.ct-awards` / `.ct-award` | |
| `.award-cat` `-winner` `-detail` `-stat` | `.ct-award-cat` `-winner` `-detail` `-stat` | |

No compatibility alias layer. Aliasing would mean duplicating every selector,
and there are only three consumers, each with one place that emits the markup
(§8). A mapping table plus a scripted find/replace is cheaper than a
deprecation cycle.

*If the renames are refused:* ship the names unchanged, but scope the generic
ones under a container (`.ct-body .tile`) so they cannot leak.

### D3. Tokens: theme tokens only, plus one new shared token

- **Add `--font-mono`** to `variables.css`:
  `ui-monospace, 'JetBrains Mono', Menlo, Monaco, 'Courier New', monospace`.
  This fixes §3.4 and replaces `--mono` and `--upd-mono`.
- There are **no other new global tokens.** The recap palette maps onto what
  exists, which makes the yap alias block deletable:

  | Consumer alias | Theme token |
  |---|---|
  | `--surface-2` | `--surface-elevated` |
  | `--line` | `--border` |
  | `--faint` | `--text-muted` |
  | `--muted` | `--text-secondary` |
  | `--up` | *(none, see D4)* |
  | `--upd-pink` | `--accent-light` |
  | `--upd-radius-card` | `--radius-xl` (16px) |
  | `--cyan` | *(removed with `.ct-info` cyan, see D4)* |

- **Component-scoped knobs**, all prefixed `--ct-` and all with defaults:
  `--ct-measure` (47rem), `--ct-measure-wide` (62rem), `--ct-cols` (2),
  `--ct-grid-min` (260px), `--ct-spark-h` (72px), `--ct-tone` (`--accent`).

### D4. Palette compliance (recommended, **needs sign-off** on tones)

- **Callout tones.** The tone only colours a 1px corner tick, a 4% scanline
  and the title text. The *word* in the title carries the meaning, so the tone
  is emphasis rather than state.
  - `.ct-key` → `var(--accent)` (unchanged)
  - `.ct-info` → `var(--corrupted-purple)` (violet), replacing cyan
  - `.ct-warn` → `var(--corrupted-red)`, replacing `#e0a106`. The spec already
    says "red for alarm" for status styling, and red is an accent (legibility),
    so it takes no `semanticUse` role. The palette test is unaffected.
- **Tile delta.** `.ct-tile-delta` is `--text-secondary` by default, and the
  direction is carried by the text (`▲ 12%`, `+3`), not by colour. Two
  modifiers are optional and neither is required for meaning:
  `.is-up` → `--accent-light`, `.is-down` → `--text-muted`. **Not green:** it
  is reserved for system.
- **Literal colours become tokens.** Every hex in the ported rules becomes the
  token it already equals (§3.3). Translucent accent fills use
  `color-mix(in srgb, var(--accent) N%, transparent)` rather than
  `rgba(217,79,144,N)`, so a consumer who overrides `--accent` gets consistent
  chrome. `color-mix()` is new to theme `src/` (it is already used by the yap
  port), so this raises the browser floor to Chromium 111, Safari 16.2 and
  Firefox 113. The spec's Browser Compatibility section should list it. *If
  that floor is refused:* keep the `rgba()` idiom that the rest of the theme
  uses.
- `.ct-spark-bar` stays accent at full strength for the last bar and a 42%
  mix for the others, which is the port's existing encoding.

### D5. Motion

- `.ct-kicker-dot` pulses forever (`updpulse`, 2s). Keep it, since a "live"
  dot is Tenet 3 used as intended, but only under
  `@media (prefers-reduced-motion: no-preference)`. Rename the keyframes to
  `ct-pulse` so they cannot collide with consumer keyframes.
- Keep the reduced-motion guard on the callout scanline.
- `.ct-section-t` and `.ct-h3` carry `decode-on-scroll` in nikke's markup.
  That class hooks into the theme's **own** `scroll-decode.js`. Document it as
  optional progressive enhancement: the CSS must not depend on it, and without
  JS the heading is plain text.

### D6. Scope

**In v1:**

- Article frame: `.ct-article`, `.ct-masthead`, `.ct-kicker`, `.ct-title`,
  `.ct-dek`, `.ct-dateline`
- Prose: `.ct-body`, `.ct-p`, `.ct-hi`, `.ct-list`, `.ct-section-h`/`-n`/`-t`,
  `.ct-h3`, `.ct-quote` (+`-text`, `-attr`)
- Blocks: `.ct-table` (+`-scroll`), `.ct-figure`, `.ct-callout` (+`-title`,
  `.ct-slash`, tones), `.ct-cols`/`.ct-col`, `.ct-grid`/`.ct-cell`
  (+`-eyebrow`, `-title`), `.ct-badges`/`.ct-badge`, `.ct-stat-row`/`.ct-stat`
  (+`-value`, `-label`, `-sub`)
- Data display: `.ct-tiles`/`.ct-tile`, `.ct-spark*`, `.ct-awards`/`.ct-award*`

**Deferred:**

- `.ct-media`, `.ct-attrs`, `.ct-entity`: generic in their CSS, but so far only
  used for NIKKE unit cards, and yap skipped them on purpose. Promote them when
  a second consumer needs them (Q2).
- The rest of `updates.ts` (`.upd-card`, `-banner`, `-timeline`, `-devlog`,
  `-patchcard` …): page-specific.
- `yap-*` (`.yap-nav`, `.yap-stats`, `.yap-video`) and `.dd-cards`:
  site-specific. `.yap-stats` overlaps with `.ct-stat-row` and should migrate
  to it.
- `{ tier: … }` inline spans (`.tier-badge`): NIKKE rarity, which the spec
  keeps downstream.
- The TypeScript renderer. The theme ships CSS and documents markup. Porting
  `renderContentBlocks()` to a theme JS module is a separate proposal (Q3).

## 5. Component contract

For each component: the markup it expects, the knobs it exposes, and its
responsive behaviour. These are the **documented** forms. Markup outside them
is unsupported.

### 5.1 Article frame

```html
<article class="ct-article">
  <header class="ct-masthead">
    <div class="ct-kicker"><span class="ct-kicker-dot" aria-hidden="true"></span>Patch notes</div>
    <h1 class="ct-title">Season recap</h1>
    <p class="ct-dek">One-line standfirst.</p>
    <time class="ct-dateline" datetime="2026-09-24">2026.09.24</time>
  </header>
  <div class="ct-body">…</div>
</article>
```

- `.ct-title` is gradient text (`--text` → `--accent-light` → `--accent`). It
  **must** have a `@media (forced-colors: active)` fallback that restores
  `-webkit-text-fill-color: CanvasText`, or the title disappears in Windows
  High Contrast.
- `.ct-masthead::after` is the 200×3px accent rule.
- ≤640px: `.ct-article` padding drops from `2.5rem 0 5rem` to `1.5rem 0 3rem`.

### 5.2 Prose body and measure

- Direct children of `.ct-body` are clamped to `--ct-measure` and centred.
- `.ct-table` widens to `--ct-measure-wide`. `.ct-figure`, `.ct-section-h`,
  `.ct-stat-row`, `.ct-cols`, `.ct-grid`, `.ct-tiles`, `.ct-spark-wrap` and
  `.ct-awards` go full width. This is the nikke opt-out list (§3.1) plus the
  data-display blocks.
- **Numbered section heading.** The number sits in a sibling span, **outside**
  the `<h2>`, so the heading's accessible name is the title alone. A bare
  `<h2>` inside `.ct-body` is left unstyled. #76 asks for this to be
  documented explicitly.

  ```html
  <div class="ct-section-h">
    <span class="ct-section-n" aria-hidden="true">01</span>
    <h2 class="ct-section-t">Heading</h2>
  </div>
  ```

  The number span is optional. `aria-hidden` is a new addition: in nikke's
  markup it is announced.
- ≤720px: the `.ct-section-h` gap drops to .8rem, `.ct-section-t` to 1.35rem,
  and `.ct-cols` to one column.

### 5.3 Blocks

- **Table:** `<figure class="ct-table"><div class="ct-table-scroll" tabindex="0" role="region" aria-label="…"><table>…</table></div><figcaption>…</figcaption></figure>`.
  The scroll region needs `tabindex` and a label so keyboard users can scroll
  it. This is new; nikke omits it. Header cells should carry `scope="col"`.
  Alignment is per-cell `text-align`; nikke does this with inline style.
- **Callout:** `<aside class="ct-callout ct-info|ct-warn|ct-key"><div class="ct-callout-title"><span class="ct-slash" aria-hidden="true">//</span> Title</div><p>…</p></aside>`.
  Tone modifiers set `--ct-tone`, and a consumer may set it directly. House
  style: corner ticks, **never a left rail** (the note in `content-blocks.ts`
  carries over into the module header).
- **Columns:** `<div class="ct-cols" style="--ct-cols:3"><div class="ct-col">…</div>…</div>`.
- **Grid:** `<div class="ct-grid" style="--ct-grid-min:220px"><div class="ct-cell"><div class="ct-cell-eyebrow">…</div><h4 class="ct-cell-title">…</h4>…</div></div>`.
- **Stat row:** `.ct-stat-row > .ct-stat > .ct-stat-value + .ct-stat-label [+ .ct-stat-sub]`.
  A loose `.ct-stat` outside a row is unsupported. nikke's renderer always
  wraps a run of stats, and the docs must say so.
- **Quote:** `<blockquote class="ct-quote"><div class="ct-quote-text">…</div><footer class="ct-quote-attr">— Name</footer></blockquote>`.

### 5.4 Data display

- **Tiles:** `.ct-tiles > .ct-tile > .ct-tile-label + .ct-tile-value [+ .ct-tile-delta]`.
  Two columns, one column at ≤560px. Values use `font-variant-numeric:
  tabular-nums` (new; `.ct-stat-value` already has it).
- **Sparkline bars:**

  ```html
  <figure class="ct-spark-wrap">
    <figcaption class="ct-spark-cap" id="s1">Viewers per stream</figcaption>
    <div class="ct-spark" role="img" aria-labelledby="s1" aria-describedby="s1-data">
      <span class="ct-spark-bar" style="--v:.42"></span>
      <span class="ct-spark-bar is-empty" style="--v:0"></span>
      <span class="ct-spark-bar" style="--v:1"></span>
    </div>
    <div class="ct-spark-axis"><span>Jul</span><span>Sep</span></div>
    <p id="s1-data" class="visually-hidden">…values as text…</p>
  </figure>
  ```

  - **Change from the ports:** bar height comes from a unitless `--v` (0–1)
    via `height: calc(var(--v) * 100%)`, not from inline `height: N%`. It is
    the same data, but a custom property can be set from JS
    (`el.style.setProperty`) without writing a CSS declaration string, and a
    consumer can transition it. The authored form is still an inline `style`
    attribute, so a strict CSP needs `style-src-attr 'unsafe-inline'`, or a
    CSSOM write as above. `docs/CDN_CONSUMPTION.md` should say so.
  - The last bar is full accent and the others are a 42% mix. `.is-flat`
    makes every bar the mix colour. `.is-empty` gives a 2px minimum and the
    border colour.
  - The chart is `role="img"` with a text alternative. The divs themselves
    carry no data for assistive tech.
- **Awards:** `.ct-awards > .ct-award > .ct-award-cat + .ct-award-winner + .ct-award-detail + .ct-award-stat`.
  This is a two-column grid with the stat spanning rows 2–3. At ≤560px it
  becomes one column and the stat moves under the detail. `.ct-award-winner`
  keeps `overflow-wrap: anywhere` for long handles.

## 6. Accessibility requirements

These are testable. Each one gets an assertion in §7.

1. Every text/background pair that the module introduces must meet the ratio
   it claims, following the practice in `tests/data/contrast-claims.test.js`.
   Specifically: `--text-muted` on `--glass` for `.ct-stat-label`,
   `.ct-tile-label` and `.ct-spark-axis` at .6–.8rem. If it fails 4.5:1, those
   labels move to `--text-secondary`.
2. Every infinite animation is inside `prefers-reduced-motion: no-preference`.
3. Gradient text has a `forced-colors` fallback.
4. Decorative glyphs (`//`, `“`, the section number, the kicker dot) are
   CSS-generated or `aria-hidden`.

## 7. Implementation plan

### PR A: module and guards (the theme)

| File | Change |
|---|---|
| `src/css/variables.css` | Declare `--font-mono` |
| `src/css/editorial.css` | **New.** JSDoc header (the manifest reads it for description and `@example`), the §5 rules, and the house-style notes carried over from `content-blocks.ts` |
| `src/css/theme.css` | `@import './editorial.css'` after `extensions.css` |
| `package.json` | `"./editorial": "./src/css/editorial.css"` |
| `tests/data/editorial.test.js` | **New.** (a) Every selector in the module is `ct-`-prefixed, or a documented child/state class. (b) No bare `#hex`/`rgb()` outside `var()` fallbacks. (c) Every `animation` sits under a reduced-motion guard. (d) A `forced-colors` block exists for `.ct-title`. (e) Every class used in the docs' HTML examples exists in the module, and vice versa. (f) `theme.css` imports it |
| `tests/data/contrast-claims.test.js` | Add the §6.1 pairs |
| `CORRUPTED_THEME_SPEC.md` | Browser Compatibility adds `color-mix()` (if D4 is accepted) and a Version History line |
| `CHANGELOG.md` | `Added` entry |

`color-sweep.test.js` needs **no** new `ALLOWED` entries. If it does, a
literal was missed.

### PR B: documentation and demo

- `examples/editorial.html`: one page that uses every component in §5, with
  real-looking content. It gets its nav entry via `npm run nav:sync` and
  `RELEASE_DEMOS`.
- `docs/COMPONENTS_REFERENCE.md`: an "Editorial" section written by hand,
  since the generated block covers exports only. Markup, not just class lists,
  as #76 asks.
- `README.md`: a table-of-contents entry.

### Validation before either PR merges

`npm run build && npm run lint:security && npm run manifest:generate && npm test`.
`dist/theme.min.css` grows by at most the §3.5 upper bound, and a manual pass
over `examples/editorial.html` at 375px and 1280px, with reduced motion on and
off.

## 8. Downstream migration (after release)

Each consumer bumps its vendored theme or its CDN pin, then deletes its copy:

| Repo | Delete | Rename in |
|---|---|---|
| `nikke` | `contentBlockStyles()` (and where it is called); `.upd-wrap/-header/-kicker/-h1/-sub/-datestamp` + `--upd-mono` in `updates.ts` | The markup strings in `content-blocks.ts` and `updates.ts` |
| `stream-blog` | Everything in `yap.css` from "page frame" through "Award rows", plus both `:root` alias blocks | Post templates, and the spark generator (`scripts/stream-recap.mjs`), which moves from `height:%` to `--v` |
| `nikke-analysis` | The matching blocks in `recap/recap.css` and its palette | The recap page markup |

The acceptance test is #76's: **the alias block in `yap.css` no longer
exists**, and a post authored for either site renders identically on the
other.

## 9. Open questions

- **Q1.** Do you accept the D2 renames and the D4 tone changes? Both change
  what consumers see or write, so they are yours to call.
- **Q2.** Should `.ct-media`/`.ct-attrs`/`.ct-entity` come in now for parity
  with nikke, or wait for a second consumer?
- **Q3.** Should the renderer (`renderContentBlocks`) become a theme JS module?
  If so, it gives a data contract (JSON blocks → HTML) for the Go/Python sides
  under `docs/CROSS_LANGUAGE_CONTRACT.md`. That is out of scope here, but it
  would make "content authored for one site pastes into the other" literal.
- **Q4.** Before PR A, check the `.tile`/`.spark`/`.award-*` rules against the
  original `nikke-analysis/recap/recap.css`. This spec only saw the `yap.css`
  port.
- **Q5.** Should this ship as 0.3.4 or 0.4.0? It is additive with no removals,
  so 0.3.x matches how 0.3.3 shipped `corrupted-flares`.
