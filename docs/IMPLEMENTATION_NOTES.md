# Implementation Notes

Rules that exist because something broke. Each entry records the incident,
the root cause, the rule that prevents it, and the CI guard that enforces
the rule. Read this before integrating the package or editing the demo
site. The LLM surface (`dist/llms.txt`) carries the consumer-facing
versions of these rules.

---

## 1. Script loading: `src/` files are ES modules

**Incident (2026-07-05, 0.3.0 review).** The owner found
`/examples/advanced/particles-bg` dead in the browser:

```
corrupted-particles.js:5 Uncaught SyntaxError: Cannot use import statement outside a module
particles-bg:252 Uncaught ReferenceError: CorruptedParticles is not defined
```

A full 32-page console sweep found one more page
(`showcase-complete.html`, loading `corruption-loading.js`) with the same
failure.

**Root cause.** Both files became ES modules in 0.2.x when they started
importing the canonical data layer (`phrases.data.js`). Two 0.1.x-era
pages still loaded them with classic `<script src>` tags. A classic script
cannot contain `import`, so the file throws at parse time and the page's
inline code then fails on the missing global. The pages had drifted from
the modules they consume.

**The rule.** Every file under `src/` is an ES module. Load it one of two
ways, never a third:

| Way | How |
|---|---|
| Module script | `<script type="module">import { X } from '…/src/lib/x.js'</script>` |
| Browser global | `<script src="…/dist/x.global.js">` (IIFE builds only; list + SRI in CHANGELOG.md) |

A classic `<script src>` pointing at anything in `src/` is always a bug.
Symptom to recognize: `Cannot use import statement outside a module`
followed by a `ReferenceError` for the class you expected.

**Guard.** `tests/data/example-pages.test.js` scans every site page and
fails CI when a classic script tag loads a file containing top-level
`import`/`export`, or when any script `src` points at a missing file.

## 2. Site navbar: defined once, never hand-edited

**Incident (2026-07-05, 0.3.0 review).** The owner found the menu on `/`
differed from `/examples/`, and the six new demo pages had no navbar at
all.

**Root cause.** Twenty-plus pages each carried a hand-copied navbar.
Every past edit used find-and-replace across whichever pages a regex
matched, so each edit wave created a new variant. Copy-paste was the drift
mechanism itself.

**The rule.** The menu is defined once: the `NAV` structure in
`scripts/sync-nav.js`. To change the menu, edit `NAV` and run
`npm run nav:sync`, which stamps the identical navbar into every page with
per-page relative hrefs and active states. Never edit a navbar inside a
page file, and never add a page without adding it to `NAV` when it should
be reachable.

**Guard.** `tests/data/nav-sync.test.js` byte-compares every page's navbar
against the canonical render on every CI run. A hand-edit or a missed sync
fails the build.

## 3. Release promotion: one What's-New surface

**Incident (2026-07-05, 0.3.0 review).** After adding 0.3.0 sections next
to the existing 0.2.0 ones, the owner pointed out the duplication: stacked
version-New sections accumulate forever and bury the current release.

**The rule.** Only the current release gets promotional surfaces (landing
cards, quick-links, the showcase section, the nav anchor). When a release
ships, replace the previous release's promotional content instead of
adding alongside it. Demo pages from older releases keep their pages and
stay reachable through the Examples dropdown and the Animation Gallery.

**Guard.** Procedural: `docs/governance/RELEASE_CONTENT_CHECKLIST.md`
section B. No automated check; the checklist row is the control.

## 4. Version numbers are only half a release

**Incident (2026-07-05, 0.3.0 release prep).** Version-string sync
completed cleanly while the README, demo site, and CDN docs still
described 0.2.x, and the CDN publish script did not upload the `src/`
module tree that the new manifest URLs pointed at.

**The rule.** Run both halves:
`docs/governance/VERSION_REFERENCES.md` for version strings, then
`docs/governance/RELEASE_CONTENT_CHECKLIST.md` for content, artifacts, and
downstream notifications. New file extensions need MIME entries in both
`scripts/publish-to-cdn.sh` and `cdn-worker/index.js`.

**Guard.** The two checklists cross-link each other; the exports-resolve
CI step catches broken export paths; SRI verification at publish catches
missing artifacts.

---

**Last Updated**: 2026-07-05
**Maintained By**: whykusanagi
