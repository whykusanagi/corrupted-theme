# Release Content Checklist

**Purpose**: Everything beyond version numbers that you update when a
release adds or changes components. Version-string locations live in
[VERSION_REFERENCES.md](VERSION_REFERENCES.md); run that first, then this
file. We wrote this checklist during the 0.3.0 release after version sync
alone left the README, demo site, and CDN docs describing 0.2.x.

**Deploy model reminder**: `corrupted.whykusanagi.xyz` auto-deploys `main` on
every merge (the "Workers Builds: corrupted-theme" check). Merging content
updates IS updating the demo site: verify live after merge.

---

## A. Documents (repo)

| # | File | Update |
|---|---|---|
| 1 | `README.md` | "What's New in X.Y.Z" table; component quick-reference; CDN examples; architecture tree if layout changed |
| 2 | `CHANGELOG.md` | Full release section (Added/Changed/Internal); SRI table appended after CDN publish |
| 3 | `docs/COMPONENTS_REFERENCE.md` | Auto-block refreshes via `npm run manifest:generate`; hand-authored deep-dive sections for major components |
| 4 | `docs/CDN_CONSUMPTION.md` | New dist objects (globals, manifest, llms.txt), new consumption patterns |
| 5 | `docs/platforms/NPM_PACKAGE.md` | Version-history table row (watch the sed-mangle noted in VERSION_REFERENCES step 4); exports/structure sections |
| 6 | `CORRUPTED_THEME_SPEC.md` | New corruption patterns land BEFORE their components (repo rule §7) |
| 7 | Migration guide in `docs/` | Only if breaking changes (repo rule §12) |

## B. Demo site (auto-deployed from main)

| # | File | Update |
|---|---|---|
| 8 | `index.html` (root landing) | Category card for the new release; "X.Y.Z Examples" quick-links section |
| 8b | Site navbar | Owned by `scripts/sync-nav.js` (single canonical definition, identical on every page). Add new pages to `NAV`, run `npm run nav:sync`; the nav-sync test fails CI on drift or hand-edits |
| 9 | `examples/index.html` | Same two updates (card + quick-links) |
| 10 | `examples/animations.html` | One DEMOS entry per new animation example page |
| 11 | Per-component example page | Every new component ships one (repo rule §15): standalone, commented, spec-linked |
| 12 | After merge | Verify live: version badge, new links resolve on `corrupted.whykusanagi.xyz` (the host redirects `.html` to extensionless paths) |

## C. CDN artifacts (at `npm run publish-cdn`)

| # | Artifact | Check |
|---|---|---|
| 13 | `dist/theme.min.css` + UMD globals | Built fresh (`npm run build && npm run build:umd`) |
| 14 | `dist/manifest.json` + `dist/llms.txt` | Regenerated (`npm run manifest:generate`); version stamp matches release |
| 15 | `src/{css,lib,core,data}` module tree | Published (0.3.0+; manifest cdnUrls point here) |
| 16 | MIME coverage | A new file extension needs entries in both `scripts/publish-to-cdn.sh` (`content_type_for()`) and `cdn-worker/index.js` (`CONTENT_TYPES`) |
| 17 | SRI | Run `npm run generate-sri` and paste the table into the CHANGELOG release section |
| 18 | Verify | Cache-busted `curl -I` on `cdn.whykusanagi.xyz` AND `cdn.nikkers.cc`: 200 + correct content-type for one file of each new type |

## D. Downstream (after publish)

| # | Where | Update |
|---|---|---|
| 19 | CelesteOps realignment tasks | Un-gate consumer tickets (they're written "act after X.Y.Z ships") |
| 20 | GitHub issues on consumer repos | Comment that the release is live + link CHANGELOG |
| 21 | nikke / site dep bumps | Note new version + SRI hashes on their upgrade tasks |
| 22 | GitHub Release | Create from tag with CHANGELOG excerpt (repo §11 post-publish) |

---

**Last Updated**: 2026-07-05
**Maintained By**: whykusanagi
