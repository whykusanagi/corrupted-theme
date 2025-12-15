# Version References - Update Checklist

**Purpose**: Complete list of all files containing version numbers that must be updated when releasing a new version.

**Current Version**: 0.1.4

---

## Critical Files (MUST UPDATE)

### 1. package.json
**Location**: `/package.json`
**Line**: 3
```json
"version": "0.1.4"
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
- Line 1135: "NEW v0.1.4" badge (keep for current release, change to version number after)
- Line 1317: "NEW v0.1.4" badge (keep for current release, change to version number after)
- Line 1697: Footer version `v0.1.X`
- Line 1835: Comment `<!-- NEW v0.1.4: ... -->`
- Line 1922: Toast message `Welcome to Corrupted Theme v0.1.X!`

### 8. Other Example Pages
**Location**: `/examples/*.html`
**Files**: showcase.html, form.html, layout.html, card.html, button.html, nikke-team-builder.html

All have footer version references like:
```html
<p>... • Corrupted Theme v0.1.0</p>
```

**Update these to current version** (currently showing v0.1.0, should be v0.1.4)

---

## Version Bump Procedure

When releasing a new version (e.g., 0.1.4 → 0.1.4):

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
#    - Change "NEW v0.1.4" badges to just version number
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
# Usage: ./scripts/bump-version.sh 0.1.4

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
"v0.1.4"
"v0\.1\.3"

# Version without v prefix
"0.1.4"
"0\.1\.3"

# NPM package version
"@whykusanagi/corrupted-theme@0.1.4"

# NEW badge references
"NEW v0.1.4"
"NEW in v0.1.4"
```

---

## Current Version Discrepancies (As of 2025-12-15)

**Files showing OLD versions that need updating:**

1. `/examples/showcase.html` - Shows v0.1.0 (should be v0.1.4)
2. `/examples/form.html` - Shows v0.1.0 (should be v0.1.4)
3. `/examples/layout.html` - Shows v0.1.0 (should be v0.1.4)
4. `/examples/card.html` - Shows v0.1.0 (should be v0.1.4)
5. `/examples/button.html` - Shows v0.1.0 (should be v0.1.4)
6. `/examples/nikke-team-builder.html` - Shows v0.1.0 (should be v0.1.4)
7. `/examples/showcase-complete.html` footer - Shows v0.1.0 (should be v0.1.4)
8. `/examples/index.html` - Shows v0.1.2 (should be v0.1.4)
9. `/docs/platforms/NPM_PACKAGE.md` - Shows v0.1.2 (should be v0.1.4)
10. `/docs/governance/VERSION_MANAGEMENT.md` - Shows v0.1.2 (should be v0.1.4)

**Action Required**: Update all example footers and documentation to v0.1.4

---

## Next Version Release Checklist

When preparing v0.1.4 (or next version):

- [ ] Update `package.json` version
- [ ] Add CHANGELOG.md entry with release date
- [ ] Update NPM_PACKAGE.md (6 locations)
- [ ] Update VERSION_MANAGEMENT.md (3 locations)
- [ ] Update index.html hero and footer
- [ ] Update showcase-complete.html (5 locations)
- [ ] Update all example page footers (6 files)
- [ ] Run version search to verify no old references remain
- [ ] Build and test Docker container
- [ ] Git tag release: `git tag v0.1.4`
- [ ] Publish to npm: `npm publish`

---

**Last Updated**: 2025-12-15
**Maintained By**: whykusanagi team
