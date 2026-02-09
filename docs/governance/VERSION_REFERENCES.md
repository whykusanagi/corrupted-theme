# Version References - Update Checklist

**Purpose**: Complete list of all files containing version numbers that must be updated when releasing a new version.

**Current Version**: 0.1.7

---

## Critical Files (MUST UPDATE)

### 1. package.json
**Location**: `/package.json`
**Line**: 3
```json
"version": "0.1.7"
```

### 2. CHANGELOG.md
**Location**: `/CHANGELOG.md`
**Lines**: 24 (header), 116-117 (references)
- Add new version header: `## [0.1.X] - YYYY-MM-DD`
- Update component counts if applicable
- List all changes under new version

---

## Documentation Files (SHOULD UPDATE)

### 3. NPM_PACKAGE.md
**Location**: `/docs/platforms/NPM_PACKAGE.md`
**Lines to update**:
- Line 34: Example package.json version
- Line 83: CDN link with version (`@whykusanagi/corrupted-theme@0.1.X`)
- Line 667: Version example
- Line 677: Version history table (current stable release)
- Line 694: Install command example
- Line 852: Package version footer

### 4. VERSION_MANAGEMENT.md
**Location**: `/docs/governance/VERSION_MANAGEMENT.md`
**Lines to update**:
- Line 107: Current Celeste version
- Line 183: Example changelog header
- Line 444: Current Celeste version footer

### 5. DESIGN_SYSTEM_GOVERNANCE.md
**Location**: `/docs/governance/DESIGN_SYSTEM_GOVERNANCE.md`
**Lines**: 223-224, 305
- Version increment examples in tables
- Update "current" version reference

---

## Example/Showcase Files (SHOULD UPDATE)

### 6. index.html (Main Landing)
**Location**: `/examples/index.html`
**Lines to update**:
- Line 476: Hero version badge `v0.1.X — Production Ready`
- Line 725: Footer version `Corrupted Theme v0.1.X`

### 7. showcase-complete.html
**Location**: `/examples/showcase-complete.html`
**Lines to update**:
- Line 1135: "NEW v0.1.7" badge (keep for current release, change to version number after)
- Line 1317: "NEW v0.1.7" badge (keep for current release, change to version number after)
- Line 1697: Footer version `v0.1.X`
- Line 1835: Comment `<!-- NEW v0.1.7: ... -->`
- Line 1922: Toast message `Welcome to Corrupted Theme v0.1.X!`

### 8. Other Example Pages
**Location**: `/examples/*.html`
**Files**: showcase.html, form.html, layout.html, card.html, button.html, nikke-team-builder.html

All have footer version references like:
```html
<p>... • Corrupted Theme v0.1.0</p>
```

**Update these to current version** (updated to v0.1.7 as of 2026-02-09)

---

## Version Bump Procedure

When releasing a new version (e.g., 0.1.7 → 0.1.7):

### Step 1: Core Files
```bash
# 1. Update package.json
npm version patch  # or minor, or major

# 2. Update CHANGELOG.md
# - Add new version header
# - List all changes
```

### Step 2: Documentation
```bash
# 3. Update NPM_PACKAGE.md
#    - Search and replace version numbers
#    - Update version history table

# 4. Update VERSION_MANAGEMENT.md
#    - Update "Current Celeste version"

# 5. Update DESIGN_SYSTEM_GOVERNANCE.md
#    - Update version examples if needed
```

### Step 3: Examples
```bash
# 6. Update index.html
#    - Hero badge
#    - Footer

# 7. Update showcase-complete.html
#    - Change "NEW v0.1.7" badges to just version number
#    - Update footer
#    - Update toast message

# 8. Update all other example pages
#    - Bulk find/replace footer versions
```

### Step 4: Search & Verify
```bash
# Search for old version references
grep -rn "v0\.1\.[0-9]" . --include="*.html" --include="*.md" --include="*.json"

# Verify package.json
cat package.json | grep version

# Verify CHANGELOG.md has new entry
head -30 CHANGELOG.md
```

---

## Automated Version Bump Script (Future)

Create `/scripts/bump-version.sh`:

```bash
#!/bin/bash
# Usage: ./scripts/bump-version.sh 0.1.7

NEW_VERSION=$1
OLD_VERSION=$(node -p "require('./package.json').version")

echo "Bumping version: $OLD_VERSION → $NEW_VERSION"

# Update package.json
npm version $NEW_VERSION --no-git-tag-version

# Update all HTML files
find examples -name "*.html" -exec sed -i '' "s/v$OLD_VERSION/v$NEW_VERSION/g" {} +

# Update documentation
find docs -name "*.md" -exec sed -i '' "s/$OLD_VERSION/$NEW_VERSION/g" {} +

echo "✓ Version bumped to $NEW_VERSION"
echo "⚠ Don't forget to update CHANGELOG.md manually!"
```

---

## Version Number Patterns to Search For

When updating, search for these patterns:

```bash
# Version with v prefix
"v0.1.7"
"v0\.1\.3"

# Version without v prefix
"0.1.7"
"0\.1\.3"

# NPM package version
"@whykusanagi/corrupted-theme@0.1.7"

# NEW badge references
"NEW v0.1.7"
"NEW in v0.1.7"
```

---

## Current Version Discrepancies (As of 2026-02-09)

**All version references have been synchronized to v0.1.7.**

No outstanding discrepancies. All example footers, documentation files, and package files
are consistent.

### Note: package-lock.json

`package-lock.json` is listed in `.gitignore` and is not tracked by git. This is
intentional — npm recommends not committing lockfiles for library packages (only for
applications). CLAUDE.md section 5 references syncing `package-lock.json`, but since
it's local-only, version sync is handled automatically by `npm version` and does not
require manual updates.

---

## Next Version Release Checklist

When preparing the next version:

- [ ] Update `package.json` version
- [ ] Add CHANGELOG.md entry with release date
- [ ] Update NPM_PACKAGE.md (6 locations)
- [ ] Update VERSION_MANAGEMENT.md (3 locations)
- [ ] Update index.html hero and footer
- [ ] Update showcase-complete.html (footer, toast, badges)
- [ ] Update all example page footers (8 files)
- [ ] Run version search to verify no old references remain
- [ ] Build and test Docker container
- [ ] Git tag release
- [ ] Publish to npm: `npm publish`

---

**Last Updated**: 2026-02-09
**Maintained By**: whykusanagi team
