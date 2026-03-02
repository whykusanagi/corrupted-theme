# Version References - Update Checklist

**Purpose**: Canonical list of every file containing a version number. Update all of these when releasing a new version.

**Current Version**: 0.1.8

---

## Files That MUST Be Updated on Every Release

| # | File | Location(s) | What to change |
|---|------|-------------|----------------|
| 1 | `package.json` | line 3 | `"version": "0.1.8"` |
| 2 | `package-lock.json` | lines 3 and 9 | `"version": "0.1.8"` (both occurrences) |
| 3 | `CHANGELOG.md` | top of file | Add new `## [0.1.X] - YYYY-MM-DD` section |
| 4 | `README.md` | search for old ver | Any install/usage examples with pinned version |
| 5 | `index.html` *(root)* | lines 476, 725 | Hero badge `v0.1.X` and footer `Corrupted Theme v0.1.X` |
| 6 | `examples/index.html` | lines 496, 779 | Hero badge and footer |
| 7 | `examples/showcase-complete.html` | lines 1700, 1923 | Footer + toast `Welcome to Corrupted Theme v0.1.X!` |
| 8 | `examples/showcase.html` | line 468 | Footer |
| 9 | `examples/button.html` | line 444 | Footer |
| 10 | `examples/card.html` | line 687 | Footer |
| 11 | `examples/form.html` | line 556 | Footer |
| 12 | `examples/layout.html` | line 517 | Footer |
| 13 | `examples/nikke-team-builder.html` | line 569 | Footer |

## Files That SHOULD Be Updated (docs/governance)

| # | File | Location(s) | What to change |
|---|------|-------------|----------------|
| 14 | `docs/governance/VERSION_REFERENCES.md` *(this file)* | line 5 | `**Current Version**: X.Y.Z` |
| 15 | `docs/governance/VERSION_MANAGEMENT.md` | lines 107, 444 | `Current Celeste version: X.Y.Z` |
| 16 | `docs/platforms/NPM_PACKAGE.md` | lines 34, 83, 667, 675–676 (table), 695, 853 | CDN link, install example, semver example, version table (add new row at top), footer |

---

## What to Leave Alone

- **`CHANGELOG.md`** historical entries (0.1.7, 0.1.6, etc.) — these are release history, never change them
- **`docs/governance/DESIGN_SYSTEM_GOVERNANCE.md`** — uses version numbers as abstract examples in tables/diagrams, not live references
- **`docs/planning/*.md`** — archived planning docs with old version references, leave as historical record
- **`docs/platforms/NPM_PACKAGE.md`** version history table rows other than the current one
- **HTML comments** like `<!-- NEW v0.1.4 -->` in showcase pages — these record when a feature was added

---

## One-Command Version Bump

```bash
NEW=0.1.9
OLD=0.1.8

# 1. Core package files (auto-syncs both package.json and package-lock.json)
npm version patch --no-git-tag-version   # or minor / major

# 2. All HTML example footers + badges
find . -name "*.html" ! -path "*/node_modules/*" \
  -exec sed -i '' "s/v${OLD}/v${NEW}/g" {} +

# 3. Docs
sed -i '' "s/${OLD}/${NEW}/g" \
  docs/governance/VERSION_REFERENCES.md \
  docs/governance/VERSION_MANAGEMENT.md \
  docs/platforms/NPM_PACKAGE.md

# 4. Add 0.1.9 row to NPM_PACKAGE.md version table manually

# 5. Verify nothing left
grep -rn "${OLD}" . --include="*.html" --include="*.md" --include="*.json" \
  | grep -v node_modules | grep -v ".git" | grep -v CHANGELOG.md
```

---

## Verify Current State

```bash
# Quick check — should only show 0.1.8 in live files, old versions only in CHANGELOG
grep -rn "0\.1\.[0-9]" . --include="*.html" --include="*.json" \
  | grep -v node_modules | grep -v ".git"
```

---

**Last Updated**: 2026-03-01
**Maintained By**: whykusanagi
