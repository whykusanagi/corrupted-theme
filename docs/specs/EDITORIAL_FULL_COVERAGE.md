# Spec: Editorial full coverage — one vocabulary for every blog and data page

**Status:** Theme side implemented — see §11. The cross-site gate (§9.6–§9.8)
is still open, and so is the release itself.
**Extends:** [`EDITORIAL_PRIMITIVES.md`](EDITORIAL_PRIMITIVES.md) (#76)
**Target:** 0.3.4 (not yet published; this spec grows its scope)
**Module:** `src/css/editorial.css` → export `./editorial`

---

## 1. Goal

Every blog and data page across the consuming sites renders from **one**
vocabulary in this theme. Sites ship markup and data, never CSS of their own
for post content. When a site's styling differs from the theme's, the theme
wins.

Success is measurable (§9): an audit of every class used inside post content
on every consuming site finds **zero** classes that the theme does not define.

### 1.1 Rules this spec applies

1. **Shapes, not subjects.** The theme defines generic shapes (a card, a
   framed portrait, a ranked badge, a meter row). No class is named after, or
   built for, one game, character or site. A NIKKE character portrait is a
   `.ct-avatar`; a union ladder is a `.ct-table`.
2. **Data fills the shape.** Colours that come from content — an element
   colour, a team colour — reach the theme as a custom property on the element
   (`style="--ct-tone:#3b82f6"`). The theme never hardcodes a subject's colours.
3. **One way per thing.** Where two shapes do the same job they merge, even
   inside this theme. Variation is expressed through documented settings
   (custom properties) and modifiers (`.is-*`, `.has-*`), not sibling classes.
4. **Site chrome is out of scope.** Top navigation, OBS/stream-capture modes
   and page shells are not post content and stay with each site.

## 2. What was audited

Every class used inside post content, collected from rendered pages on
2026-09-24:

| Page type | Pages | Distinct content classes | Not covered by the theme |
|---|---|---|---|
| Patch notes and deep dives (plus both index pages) | 33 | 116 | ~60 (`upd-*`, `dd-*`, tier badges) |
| Season recap (data dashboard) | 1 | 114 | ~100 |
| Stream blog (posts plus index) | 5 | 43 | 8 |

Content root: the article wrapper on the patch-notes pages, the whole
document on the recap, and `<main>`/`<article>` on the stream blog.

## 3. Consolidating the theme's own shapes (breaking, pre-publish)

The #76 implementation added several card and label shapes that do the same
job. They are unreleased, so they merge now, at no migration cost:

| Unreleased (remove) | Becomes |
|---|---|
| `.ct-tile`, `.ct-tiles` | `.ct-card` in a `.ct-grid` |
| `.ct-tile-label`, `.ct-stat-label`, `.ct-spark-cap`, `.ct-cell-eyebrow` | `.ct-label` |
| `.ct-tile-value`, `.ct-stat-value` | `.ct-value` |
| `.ct-tile-delta` (+ `.is-up`) | `.ct-delta` (+ `.is-up`; no `.is-down`, §11) |
| `.ct-stat-sub` | `.ct-detail` |
| `.ct-stat`, `.ct-stat-row` | `.ct-card` in a `.ct-grid` |
| `.ct-cell`, `.ct-cell-title` | `.ct-card.has-tick`, `.ct-card-title` |
| `.ct-media-portrait` | `.ct-avatar` |

`.ct-grid` keeps `--ct-grid-min` as the one control for how many cards fit
per row. It replaces both the tile grid and the stat row.

## 4. Primitive catalogue

Everything below lives in `editorial.css` and is `ct-`-prefixed. **Settings**
are the only intended controls; anything else is fixed.

### 4.1 Page frame (exists; small additions)

| Class | Purpose | Settings |
|---|---|---|
| `.ct-article`, `.ct-body` | Page frame and prose measure | `--ct-measure`, `--ct-measure-wide` |
| `.ct-masthead` + `.ct-kicker`, `.ct-kicker-dot`, `.ct-title`, `.ct-dek`, `.ct-dateline` | Article header | — |
| **new** `.ct-masthead-aside` | Right-aligned mono facts block beside the title (the recap's "32 members / 10 seasons") | — |
| **new** `.ct-byline` | Author and date line; also the sign-off at the end of an appended log | — |
| **new** `.ct-divider` | Section break carrying a centred label (`data-label="DEVELOPER LOG"`) | label text from `data-label` |

A glitch glyph beside a title uses the theme's existing `.glitch-word`.

### 4.2 Sections and labels

| Class | Purpose | Settings |
|---|---|---|
| `.ct-section-h`, `.ct-section-n`, `.ct-section-t` (exist) | Numbered section header | — |
| **new** `.ct-section-meta` | Right-aligned mono count or context in a section header ("Us vs region") | — |
| **new** `.ct-label` | The one small mono uppercase label, used by cards, charts, legends and captions | — |
| `.ct-h3`, `.ct-p`, `.ct-list`, `.ct-hi`, `.ct-slash` (exist) | Prose | — |
| `.ct-list` gains `.is-grid`, `.is-numbered` | Chip grid (track lists, unit rosters); counted items | `--ct-grid-min` |

### 4.3 Cards

```html
<div class="ct-grid" style="--ct-grid-min:220px">
  <div class="ct-card">
    <div class="ct-label">Peak viewers</div>
    <div class="ct-value">3,410</div>
    <div class="ct-delta is-up">▲ 12% on last season</div>
    <p class="ct-detail">Week 11, raid night.</p>
  </div>
</div>
```

| Class | Purpose | Settings |
|---|---|---|
| **new** `.ct-card` | The one card surface | `--ct-tone` (tick and accent colour); `.has-tick` (corner tick); `.is-raised` (lighter surface); `.is-muted` (dimmed, such as a departed member) |
| **new** `.ct-card-title` | Card heading | — |
| **new** `.ct-card-corner` | Absolutely positioned top-right mono marker (a rank number) | — |
| **new** `.ct-value` | Headline figure: mono and tabular | `--ct-value-size` (default `1.5rem`) |
| **new** `.ct-delta` | Change against a baseline. The direction is written in the text; colour only reinforces it | `.is-up` → `--accent-light`. No `.is-down`: see §11. Never green. |
| **new** `.ct-detail` | Supporting sentence | — |
| `.ct-entity` (exists) | Card whose header is an avatar plus a name | — |

### 4.4 Portraits, badges, ranks

| Class | Purpose | Settings |
|---|---|---|
| **new** `.ct-avatar` | Framed image: character portraits, faces, item icons | `--ct-avatar-size` (default `64px`); `--ct-tone` (frame colour, usually from data); `.is-round` |
| `.ct-badge` (exists) | Small pill label | `--ct-tone`; `.is-solid`, `.is-outline`, `.is-dashed` |
| **new** `.ct-rank` | A badge whose colour comes from a rank step: tier lists, grades, rarity, any ordered scale | `data-rank="0"` … `"5"` (0 = best); map from §5 |

### 4.5 Data display

| Class | Purpose | Settings |
|---|---|---|
| `.ct-spark`, `.ct-spark-bar`, `.ct-spark-axis` (exist) | Bar sparkline | `--ct-spark-h`; `--v` per bar; `.is-flat`; `.is-empty` |
| **new** `.ct-meter` | One horizontal bar that fills to a value | `--v` (0–1); `--ct-tone` |
| **new** `.ct-rows` / `.ct-row` | Dense ruled rows: lead, text (ellipsised), trailing figure. Can hold badges, ranks and meters | `--ct-row-cols` (grid tracks); `.is-self` (your own row) |
| **new** `.ct-kv` | Inline mono key and value (a countdown, "kills 12", "sync 660") | `--ct-tone` for the value |
| `.ct-attrs` / `.ct-attr` (exist) | Labelled values with optional icons | — |
| `.ct-table` (exists) gains `.is-compact`, `td.ct-num`, `tr.is-self` | Ranking ladders, archives | — |
| `.ct-awards` / `.ct-award*` (exist) | Award ledger | — |
| **new** `.ct-chart` + `.ct-chart-cap` | Frame for an inline SVG or canvas chart, with scanline texture | — |
| **new** `.ct-legend` + `.ct-legend-item` | Swatch legend for a chart, or a two-column "how to read this" key | `--ct-tone` per swatch; `.is-key` (definition layout) |

### 4.6 Blocks and layout

| Class | Purpose | Settings |
|---|---|---|
| `.ct-callout` (exists) gains `.ct-callout-icon`, `.ct-callout-aside` | Notice, narrative aside, maintenance banner with a time window. The title is optional | `--ct-tone` via `.ct-key`, `.ct-info`, `.ct-warn` |
| `.ct-quote` (exists) | Pull quote; also the no-JS fallback for embedded posts (the embed's own class stays in the markup as its script hook) | — |
| `.ct-figure`, `.ct-media` (exist) | Images with captions | — |
| **new** `.ct-gallery` | Grid of linked images. There is no lightbox: images link to their full size | `--ct-grid-min` |
| `.ct-cols` (exists) | Side-by-side columns | `--ct-cols` (count) or **new** `--ct-cols-tracks` (explicit ratios, such as `1.55fr 1fr`) |
| `.ct-grid` (exists) | Responsive auto-fill grid | `--ct-grid-min` |

### 4.7 Post index and post chrome

| Class | Purpose |
|---|---|
| **new** `.ct-post-list` / `.ct-post-card` (+ `.ct-post-date`, `.ct-post-title`, `.ct-post-excerpt`) | Listing of posts on an index page |
| **new** `.ct-post-nav` | Back to the index, plus previous and next, above or below a post |
| **new** `.ct-post-foot` | End-of-post footer line |

An archive list is a `.ct-table`.

## 5. Rank scale

One primitive, `.ct-rank[data-rank="0…5"]`, with two colour maps. The map is
the only setting: it's chosen by a class on any ancestor.

| Step | **Standard** (default) edge / ink | **Corrupted** (`.ct-ranks-corrupted`) edge |
|---|---|---|
| 0 | `#ef4444` / `#fca5a5` | `--corrupted-red` `#ff0000` |
| 1 | `#f97316` / `#fdba74` | `--corrupted-magenta` `#ff00ff` |
| 2 | `#eab308` / `#fde047` | `--accent` `#d94f90` |
| 3 | `#22c55e` / `#86efac` | `--corrupted-purple` `#8b5cf6` |
| 4 | `#3b82f6` / `#93c5fd` | `--corrupted-cyan` `#00ffff` |
| 5 | `#6b7280` / `#cbd5e1` | `--text-secondary` `#b8afc8` (was `--text-muted`: §11) |

- Each step is exposed as `--ct-rank-N` (edge) and `--ct-rank-N-ink` (text).
  The background is always the edge at 15%. For the corrupted map, the ink is
  `color-mix(in srgb, edge 55%, white)`.
- **Standard** keeps the familiar tier-list rainbow, so a tier list reads as a
  tier list on any site.
- **Corrupted** runs hot to cold through the theme palette. Red and cyan are
  used as the two ends of a scale, which is a compositional use of accents,
  not a corruption-state signal.
- The standard map is off-palette by design. `CORRUPTED_THEME_SPEC.md` gains a
  sanctioned **rank-scale exception** (like the element colours): these twelve
  hexes — six edges and the six inks beside them — are legal only in the
  rank-scale block of `editorial.css`, and `tests/data/color-sweep.test.js`
  allowlists them there and nowhere else. Its docs half scopes them to this
  file, which is the only shipped doc that names them.

## 6. Removed or kept out of the theme

| Item | Decision |
|---|---|
| Image lightbox | **Dropped.** Gallery images link to their full size. |
| Tier-badge, rarity and grade classes named for one game | Replaced by `.ct-rank` and `.ct-badge`. The site maps its values to rank steps in data. |
| Element colours | Stay as data: the site passes `--ct-tone`. |
| Top nav, OBS/capture mode, page shell | Site chrome, out of scope (§1.1 rule 4). |

## 7. Accessibility and motion

- Every text colour meets WCAG AA on its surface at its size. Small labels use
  `--text-secondary`, as #76 established. Rank inks are checked against the
  15% edge background.
- Direction is always carried in text (`▲`, `+`), never by colour alone.
- `.ct-kicker-dot` pulse and chart scanlines stay behind `prefers-reduced-motion`.
- `.ct-rows` with ellipsised text keep the full value in `title`. The site
  supplies it; the markup contract says so.
- `.ct-divider`'s label is decorative, and ARIA cannot sit on a pseudo-element,
  so the markup carries `aria-hidden="true"` on the divider itself;
  a real heading follows it.

## 8. Migration contract (per page type)

Each site bumps to 0.3.4, **deletes every local rule for post content**, and
rewrites markup to the catalogue. Class names in the sites' current markup map
as follows (full per-class table in the implementation plan):

| Page type | Current family | Target |
|---|---|---|
| Patch notes | `upd-wrap/header/kicker/h1/sub/datestamp` | §4.1 frame |
| | `upd-section(-h/-n/-t)`, `upd-dev-sec(-h/-mk/-t)` | `.ct-section-h/n/t` |
| | `upd-card`, `upd-ev-head`, `upd-portrait`, `upd-ev-name`, `upd-flavor` | `.ct-entity` + `.ct-avatar` + `.ct-card-title` + `.ct-detail` |
| | `upd-stats` / `upd-stat(-l/-v)` | `.ct-attrs` / `.ct-attr` |
| | `upd-rar.ssr/.sr`, `tier-badge tier-tN`, `upd-costume` | `.ct-rank[data-rank]`, `.ct-badge` |
| | `upd-banner` (+ `.icon`, `.win`) | `.ct-callout.ct-warn` + `-icon` + `-aside` |
| | `upd-narrative`, `upd-dev-hl`, `upd-dev-intro` | `.ct-callout` |
| | `upd-duration` (`.lbl`/`.cd`), `upd-menu` | `.ct-kv` |
| | `upd-grid(.cols3)`, `upd-timeline`, `upd-tl-col` | `.ct-grid`, `.ct-cols` |
| | `upd-list`, `upd-tracks`/`upd-track`, `upd-tl-item` | `.ct-list(.is-grid/.is-numbered)`, `.ct-rows` |
| | `upd-devlog`, `upd-dev-byline/-sig/-title` | `.ct-divider`, `.ct-byline`, `.ct-title` |
| | `upd-dev-gallery`, `upd-lb` | `.ct-gallery`; lightbox removed |
| | `upd-archive-t`, `dd-cards`/`dd-card*` | `.ct-table`, `.ct-post-list`/`.ct-post-card` |
| Season recap | `wrap`, `mast`, `eyebrow`, `sub`, `brandmark`, `glitch` | `.ct-article`, `.ct-masthead`, `.ct-kicker`, `.ct-dek`, `.ct-masthead-aside`, `.glitch-word` |
| | `shead`/`cnt`, `sect-h`, `rh`, `aff-h`, `sotu-tag`, `howto-h` | `.ct-section-h` + `.ct-section-meta`, `.ct-label` |
| | `tiles`/`tile`, `sotu-card`, `metabar`/`mb-stat(s)`, `m` (+ `m-top/-name/-figs/-dmg/-sync`, `rank`, `departed`) | `.ct-grid` + `.ct-card` (+ `.ct-card-title`, `.ct-value`, `.ct-kv`, `.ct-card-corner`, `.is-muted`) |
| | `sotu`, `union`, `sotu-left/right` | `.ct-cols` with `--ct-cols-tracks` |
| | `sotu-chart`, `u-chart`, `sotu-cap`, `sotu-xlab`, `legend`, `howto`/`it`/`howto-src` | `.ct-chart`, `.ct-chart-cap`, `.ct-legend(.is-key)` |
| | `ladder` (`lr`, `num`, `me`) | `.ct-table.is-compact` (`ct-num`, `is-self`) |
| | `delta(.up/.down)` | `.ct-delta` |
| | `whale.*`, `perf`/`eff.*`/`mock`/`nomock`, `lane`, `el`, `aff-g.*`, `units` | `.ct-badge` (tones from data; `.is-dashed`), `.ct-rank` for grades, `.ct-list.is-grid` |
| | `aff-r` (+ `aff-ico/-el/-bar/-body/-name/-ol`), `run`/`h`/`tm`/`dm`/`lp`/`sac` | `.ct-rows`/`.ct-row` + `.ct-avatar` + `.ct-meter` + `.ct-badge` |
| | `mono`, `num` | `.ct-value` / `td.ct-num`; no bare utility class |
| | `spark*`, `award*` | existing `.ct-spark*`, `.ct-award*` |
| Stream blog | `yap-nav`, `yap-foot` | `.ct-post-nav`, `.ct-post-foot` |
| | `dd-cards`/`dd-card*` | `.ct-post-list`/`.ct-post-card` |
| | `twitter-tweet` | `.ct-quote` (the embed's class stays as a script hook, with no CSS) |
| | tiles/spark/awards/`ct-*` | per #76 §8.1, then §3 above |

## 9. Acceptance and guards

**Theme (this repo):**
1. `examples/editorial.html` exercises every class and setting in §4 and §5.
   `tests/data/editorial.test.js` already enforces "every class the module
   defines appears in the demo", and extends to the new ones.
2. New test: no two rules in `editorial.css` share an identical declaration
   block, which catches a re-introduced variant.
3. `color-sweep`: the rank-scale hexes are legal only inside the rank block.
4. Contrast test: every rank ink against its 15% background, and every label
   and detail token, at AA.
5. The §3 removals are gone from the CSS, the docs, the manifest and `llms.txt`.

**Across the sites (the release gate for this scope):**
6. The coverage audit (kept locally in `docs/planning/editorial-coverage/`),
   re-run against every migrated page, reports **zero** uncovered content
   classes on each site. Script hooks (`decode-on-scroll`, `auto-corrupt`,
   embed classes) are allowlisted by name.
7. Each site adds a test that fails if its own stylesheets define a rule
   whose selector contains a `ct-` class. The theme is the only place those
   are styled.
8. A visual pass of each page type at 1280px and 375px, with no horizontal scroll.

## 10. Release

- **Version:** 0.3.4 stays a patch. Nothing published is removed; §3 only
  touches unpublished classes.
- **Order:** theme PR, then publish (with human confirmation), then site
  migrations, each pinning `0.3.4`.
- The #76 spec's §8.1 mapping gets updated for §3 (tile, stat and cell names
  change).

## 11. Implementation record

Built on this branch as three commits — §3 consolidation, then §4 and §5, then
the §9 guards and the generated surfaces. Suite: 425 → 427 tests, all green.

Where the build departed from this spec, and why:

- **`.ct-delta.is-down` is dropped.** §4.3 mapped it to `--text-muted`, which
  `tests/data/editorial.test.js` forbids in this sheet by name: it measures
  3.7–4.2:1 on these surfaces, under AA at label sizes. Down is also the
  neutral default, so the rule would have duplicated the base. Direction stays
  in the text (`▼`, `−`), as #76 already had it.
- **Corrupted rank step 5 is `--text-secondary`**, for the same reason. It is a
  border and a 15% fill rather than text, but the guard is a flat ban on the
  token and a flat ban is worth more than this one step.
- **The self row stays `tr.is-self`**, scoped by `.ct-table`, rather than
  gaining a filler class to satisfy the state-scoping guard. The guard now
  reads the whole selector instead of the compound the state sits on: an
  ancestor is scope enough, and the markup contract should not pay for a
  regex.
- **Cyan and green are now guarded separately.** §5 needs cyan as one end of
  the corrupted ramp, so the blanket ban became: green nowhere in the sheet,
  cyan in exactly one rule (`.ct-ranks-corrupted`). The callout tones are still
  pinned individually.
- **The twelve standard-map literals** sit in one block marked
  `RANK-SCALE-LITERALS`, and three guards key off it: the sheet carries no
  literal outside it, that block carries exactly those twelve, and no other
  file may carry them (`color-sweep`'s scoped owner, the same mechanism the
  element colours use). `CORRUPTED_THEME_SPEC.md` records the exception.
- **`.ct-rank` composes with `.ct-badge`** rather than restating the badge box:
  `class="ct-badge ct-rank" data-rank="2"`.

**What review caught after the first pass** (two external reviewers, plus a
browser pass):

- `.ct-rank` painted nothing but its ink. The badge's outline look sat behind
  `.ct-badge:not(.is-solid):not(.is-dashed)`, three classes, and outranked the
  scale. Only visible in a browser; the source read correctly.
- `.ct-card.is-muted` at `opacity: .58` composited its own text to 3.77:1.
  Now `.7` (4.84–5.00:1), and the contrast guard measures the dimmed surface
  instead of the undimmed one it was reading before.
- `.ct-rows`' documented four-track recipe needs ~308px of fixed track, so it
  overflowed a 320px phone and squeezed the title to an ellipsis at 375px.
  Rows reflow below 560px.
- The chart's scanline was not cleared under `prefers-reduced-motion`, though
  the identical callout one was, and §7 promised both.
- `.ct-divider`'s label was announced while §7 claimed it was hidden — ARIA
  cannot sit on a pseudo-element, so the divider element carries it.
- The ink mixes said the keyword `white`, which no hex matcher sees and which
  a consumer's `--corrupted-white` could not override. They use the token now,
  and the token-only guard reads keywords.
- The docs half of the colour sweep had been widened globally while the CSS
  half was scoped. Both are scoped now.

**Weight.** `dist/theme.min.css` goes from 80,416 B to 100,326 B minified,
15,080 B to 18,743 B gzipped: **+3.6 KB gzipped**, past the +2.8 KB that #76
§3.5 estimated for its own narrower scope. The trade is stated in §1 — a site
that adopts this deletes its post-content stylesheet outright, and the recap
page alone was carrying about a hundred classes of its own.

**§9.8, the two-width visual pass: done.** The browser extension could not
resize the window, so the demo was loaded into a same-origin iframe at 375px
and 320px — media queries evaluate against the iframe's viewport, so the
layout is the real one. At both widths the page has no horizontal scroll and
nothing overflows except the table, which scrolls inside `.ct-table-scroll` by
design. It also showed what the numbers did not: a meter in the middle of a
`.ct-row` was squeezed to a sliver between the title and the figure, so below
560px a middle child now takes its own line.

Still open from §9: the cross-site coverage audit (§9.6), each site's own
`ct-`-rule test (§9.7), and a re-run of the zero-context docs validation now
that the vocabulary has roughly doubled.
