# Spec: A clean 0.3.4

**Status:** Draft, awaiting review — decisions in §7 before the work starts
**Target:** 0.3.4. Merged to `main` (`33ecb72`), deployed to the demo site, **not
published** to npm or either CDN zone
**Supersedes nothing.** Extends the release gates in
`docs/governance/RELEASE_CONTENT_CHECKLIST.md`

---

## 1. Goal

0.3.4 publishes with **no known defect on a shipped surface**, where a shipped
surface is anything a consumer can reach: the npm tarball, the CDN objects, the
demo site, the GitHub releases page, and the documentation those point at.

Everything known today is either fixed here (§4) or deferred with a stated
reason (§6). Nothing stays on a list unread.

## 2. Why now rather than 0.3.5

0.3.4 is merged and live on the demo site but has not been published. This is
the last point where fixing a defect costs nothing: no consumer has pinned the
version, no CDN object needs re-purging, and no migration note is owed. Four of
the eight items below are visible to a consumer on the day they install it, and
two of them (A, G) are visible today to anyone reading the repository.

## 3. Inventory

| # | Item | Shipped surface it damages | Verdict | Size |
|---|---|---|---|---|
| A | `DecryptReveal.stop()` leaves headings on scrambled glyphs | npm + CDN: every consumer running it on visible content | **in** | S |
| B | `MicroGfx` clips card titles past ~41 characters | npm + CDN: every generated og:image | **in** | M |
| C | The agent surface says nothing about CSS exports | CDN `manifest.json` / `llms.txt` | **in** | M |
| D | `lipsync` ships with no example page | demo site; checklist row 11, open since 0.3.2 | **in** | S |
| E | The landing page's hero stats are false | demo site, above the fold | **in** | S |
| F | `examples/.env.example` carries a real-looking UUID | npm tarball | **in** | XS |
| G | The v0.3.0 release notes name internal private repos | GitHub releases page, public since July | **in** | XS |
| H | Five merged remote branches, six stale local ones | repository hygiene | **in** | XS |
| I | The publish sequence itself | everything | **in** | M |
| — | Fold the site's countdown-widget fork back in | — | **defer**, §6 | L |
| — | `terminal-vocab.js` cross-language `TODO` | — | **defer**, §6 | — |

## 4. The work

### A. `DecryptReveal.stop()` must leave readable text

`src/core/decrypt-reveal.js`. The manager's `visibilitychange` handler calls
`stop()` when the tab hides and `start()` when it returns; `start()` is a
deliberate no-op. `stop()` clears each animation's timers and drops the record,
leaving the element showing whatever glyphs were last written. A decode
interrupted by the tab going hidden therefore never completes and never
resumes.

Observed on whykusanagi.xyz: opening a blog post in a background tab
(cmd-click) froze its `<h1>` on scramble, so the post read as missing. The site
shipped a workaround in its own code (site PR #22); the defect is here.

This also contradicts the package's own invariant — spec Core Tenet 2,
"readable endpoints: final state must be readable".

**Change.** Record each animation's `finalText` in the `_animations` record.
`stop()` (and `destroy()`) writes it to `element.textContent` before clearing.
Keep `start()` a no-op: settling is simpler than resuming, and it satisfies the
invariant whether or not the tab ever comes back. See Q2.

**Acceptance.**
- A new test drives a decode, calls `stop()` mid-flight and asserts the element
  holds `finalText`, not scrambled glyphs.
- A second test asserts the same for `destroy()`.
- Browser: start a decode, hide the tab, return — the heading is readable.
- CHANGELOG records it as a fix with the consumer-visible behaviour change.

### B. `MicroGfx` must not cut a title mid-word

`src/lib/micro-gfx.js:420-433`. `drawText` emits the title as a single SVG
`<text>` at a fixed `font-size: 44` with no wrap, shrink or ellipsis. On the
1200px card the frame rail sits at x=1172; a 56-character title runs straight
through it and off the edge. Practical fit is ~41 characters, and 5 of 23 real
blog titles fit. The site works around it by truncating titles to 41 characters
with an ellipsis before building the URL.

**Change.** Fit the title to the available width inside `drawText`: measure by
character budget (the face is monospace, so width is `chars × 0.6 × size`),
shrink the font size toward a floor, then ellipsise only if the floor is still
too narrow. Deterministic — same input, same output, which `canvas-seek` and
the render-to-video recipe depend on. See Q1.

**Acceptance.**
- A test renders a 56-character title and asserts the `<text>` element's
  computed right edge stays inside the rail, and that the string is not cut
  mid-word.
- A test asserts a short title is untouched: same font size as today, so
  existing cards are byte-identical.
- The site's own truncation can then be removed; a CelesteOps note says so.

### C. The agent surface must describe CSS exports

`dist/manifest.json` and `dist/llms.txt` describe `./editorial` as
`[css]` and nothing more — no classes, no custom properties, no markup
contract. 0.3.4's headline feature is ~90 CSS classes that are invisible to the
surface built for agents to read, and the consuming sites' migration will be
done partly by agents reading it. Both blind agents in the 0.3.4 E5 run
reported this independently.

**Change.** `scripts/generate-manifest.js` parses JSDoc from JS modules; give it
a CSS path. For each CSS export emit: the classes it defines, the `is-*`/`has-*`
modifiers scoped to each, the `--ct-*`-style custom properties it reads with
their defaults, and the module header's one-line description. `llms.txt` gets a
dense line per CSS export rather than the full inventory, to stay inside its
16KB budget. See Q3.

**Acceptance.**
- `dist/manifest.json`'s `./editorial` entry lists `.ct-card`, `.ct-rank`,
  `--ct-grid-min` and `--ct-measure`, with defaults.
- `dist/llms.txt` stays under 16KB (existing budget test).
- A test asserts every class the manifest claims for a CSS export is defined in
  that sheet, so the surface cannot drift from the file it describes.
- The §3 class names removed in 0.3.4 (`ct-tile`, `ct-stat`, `ct-cell`) appear
  nowhere in either artifact.

### D. `lipsync` ships an example page

Checklist row 11 — every component ships a standalone, commented, spec-linked
example. `./lipsync` (`src/core/lipsync.js`) shipped in 0.3.2 and is only
exercised inside `examples/audio-spectrum.html`.

**Change.** `examples/lipsync.html`, following the house pattern: self-contained,
inline comments explaining the choices, a link to the relevant spec section. Add
it to `NAV` in `scripts/sync-nav.js`, run `npm run nav:sync`, and add the card
and quick-link entries to `index.html` and `examples/index.html`.

**Acceptance.** The page loads with zero console errors; `npm test` passes the
nav byte-compare; the page is reachable from both index pages.

### E. The landing page's hero stats must be true

`index.html:537-548` claims **50+ Components** and **100+ CSS Variables**. The
manifest reports 68 exports (54 JS, 14 CSS); the stylesheets declare 80 custom
properties, 54 of them in `variables.css`. One number is stale low, the other is
simply wrong, and both sit above the fold on the demo site.

**Change.** State the real figures, and pin them: a test reads
`dist/manifest.json` and `src/css/variables.css` and fails when the hero
disagrees. A claim that cannot rot is worth more than a claim that happens to
be right today — this is the same reasoning as `version-consistency.test.js`.

**Acceptance.** The hero matches the generated artifacts; the test fails if
either drifts.

### F. `examples/.env.example` carries no real-looking value

It ships in the npm tarball. Its placeholders are obviously fake
(`your-agent-id-uuid`, `your-api-key-token`) except one comment showing a
realistic UUID (`c7bfa746-e7f8-11ef-bf8f-4e013e2ddde4`). Scanners are clean, so
this is presentation rather than a leak, but a public example should not teach a
shape that looks copied from somewhere real.

**Change.** Replace it with an obviously-synthetic value
(`00000000-0000-4000-8000-000000000000`).

### G. The v0.3.0 release notes stop naming internal repos

The published v0.3.0 release is titled *"absorbed glitch libraries,
orchestration components, agent surface"* and its body names
`celeste-tts-bot obs/transitions`, the site's `thumbnail-generator` and
`youtube_poop`. The CHANGELOG was scrubbed for the E4 provenance gate at the
time; the release was not, and it has been public since July. v0.2.1 and v0.2.0
read clean on inspection but get the same grep before this closes.

**Change.** Rewrite the v0.3.0 title and body to describe what the release does
— the same content the scrubbed CHANGELOG section already carries. The release
*tag* and its date do not change. Owner approval first: it is published content.
See Q4.

**Acceptance.** `gh release view v0.3.0` contains none of the E4 terms, and the
E4 grep is extended to cover release bodies so the next one is checked
automatically.

### H. Branch hygiene

Five remote branches are fully merged into `main`
(`claude/epic-lamport-c6ei94`, `claude/sweet-jemison-dd3893`,
`cursor/corrupted-flares`, `docs/0.3.3-sri`, `fix/palette-correctness`) and six
local branches are stale, including `release/0.3.4` (now merged through #81) and
`feature/0.3.2-generative-components` (upstream gone). Delete them.

### I. The publish sequence

In order, from a clean tree on `main`:

1. Re-run the security gate — `code-scanning`, `dependabot` and
   `secret-scanning` **alerts** APIs, not the check status. A green CodeQL check
   is not "0 alerts".
2. Set the CHANGELOG's `## [0.3.4]` date to the actual publish day.
3. `npm run build && npm run build:umd && npm run manifest:generate`.
4. `npm test`, `npm run lint:security`, `npm pack --dry-run` — tarball carries
   no `.env`, no tests, no internal specs (`docs/specs/**` included).
5. `npm publish --access public`.
6. **`git tag -a v0.3.4` by hand.** Never `npm version`: the bump already
   happened inside the PR, and this is exactly how 0.3.2 reached npm untagged
   and unreleased for a month.
7. `npm run publish-cdn`, then verify **both** zones (`cdn.whykusanagi.xyz`
   *and* `cdn.nikkers.cc`) with cache-busted `curl -I`, and bump `@latest`.
8. `npm run generate-sri`; paste the table into the 0.3.4 CHANGELOG section.
9. Create the GitHub Release from the tag, with the scrubbed CHANGELOG excerpt.
10. Verify the live demo site: version badge, new links, zero console errors.
11. Un-gate the downstream CelesteOps tickets and comment on the consumer
    repositories.

## 5. Verification

| Gate | How |
|---|---|
| Suite | `npm test` green, including each new guard from A, B, C and E |
| New guards bite | Each is mutation-checked: reintroduce the defect, watch it fail, restore |
| Browser | `lipsync.html` and the two index pages: zero console errors; `DecryptReveal` settles after a hide/show cycle |
| Tarball | `npm pack --dry-run`: no secrets, no dev files, no internal specs |
| Agent surface | `llms.txt` under 16KB; no removed class name anywhere in it |
| Public surfaces | E4 grep over `README`, `CHANGELOG`, shipped docs, `dist/manifest.json`, `dist/llms.txt` **and release bodies** |

## 6. Deferred, with reasons

- **Fold the site's countdown-widget fork back in** (CelesteOps `686aa0e1`).
  This is an absorption, not a defect: ~193 changed lines, a theme-preset data
  contract to design, and an injectable asset resolver to agree on. It belongs
  in its own release with its own spec. 0.3.4 is a patch and is already large.
- **`src/core/terminal-vocab.js:8` `TODO(cross-language contract)`** — a note
  about where terminal pools could live if the Go and Python sides ever share
  them. Not a defect; it depends on `docs/CROSS_LANGUAGE_CONTRACT.md`, which
  does not exist yet.
- **Generalising the `@version` header guard.** 0.3.3 pinned
  `corrupted-flares.js`'s `@version` to the release; 0.3.4 deleted that test
  because flares did not change and the pin would now fail wrongly. What is lost
  is coverage for a module that *does* change in a release. The honest guard is
  "any `src/**/*.js` modified since the last tag carries the current
  `@version`", which needs git state inside a test. See Q5.

## 7. Decisions for the owner

- **Q1 — `MicroGfx` long titles: shrink, wrap, or both?** *Recommend shrink to a
  floor, then ellipsise.* It keeps the one-line poster composition that the
  cards are built around; wrapping to two lines changes the layout of every
  card that uses it and pushes the serial line down.
- **Q2 — `DecryptReveal`: settle on `stop()`, or resume on `visible`?**
  *Recommend settle.* It is the smaller change, it holds whether or not the tab
  returns, and it matches the "never leave content unreadable" invariant. The
  cost is that a background-tab decode is skipped rather than played late.
- **Q3 — How much of the CSS inventory goes in `llms.txt`?** *Recommend a dense
  line per CSS export in `llms.txt` and the full inventory in `manifest.json`.*
  The budget is 16KB and the editorial sheet alone has ~90 classes.
- **Q4 — Rewrite the v0.3.0 release notes?** *Recommend yes, body and title,
  tag and date untouched.* The alternative is leaving a public page that names
  three private repositories. I will draft the replacement for approval before
  anything is sent.
- **Q5 — Generalise the `@version` guard now or leave it?** *Recommend leave
  it* and record it; it needs git state in a test, which no other guard here
  does.

## 8. Order of work

1. G's draft text and Q1–Q5 answered (nothing else blocks on them).
2. A, then B — the two consumer-facing code defects, each with its guard.
3. C, then E — the two generated/pinned surfaces, since E's test reads C's output.
4. D, F, H — the example page, the placeholder, the branches.
5. G once approved.
6. I, the publish sequence, last and in one sitting.
