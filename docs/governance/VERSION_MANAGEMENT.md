# Version Management

> **Celeste Brand System** | Governance Documentation
> **Document**: Semantic Versioning and Release Strategy
> **Version**: 1.0.0
> **Last Updated**: 2025-12-13

---

## Table of Contents

1. [Overview](#overview)
2. [Semantic Versioning](#semantic-versioning)
3. [Version Lifecycle](#version-lifecycle)
4. [Changelog Format](#changelog-format)
5. [Git Tagging Strategy](#git-tagging-strategy)
6. [Release Workflow](#release-workflow)
7. [Support Policy](#support-policy)

---

## Overview

Celeste follows [Semantic Versioning 2.0.0](https://semver.org/) for predictable versioning across all packages (CLI, npm, documentation).

### Versioning Goals

- **Predictable**: Users know what to expect from version numbers
- **Backward Compatible**: Minimize breaking changes
- **Transparent**: Clear changelog for every release
- **Coordinated**: CLI and npm versions stay in sync
- **Professional**: Enterprise-grade version management

---

## Semantic Versioning

### Version Format

```
MAJOR.MINOR.PATCH[-PRERELEASE][+BUILD]

Example: 1.2.3-beta.1+20250113
         │ │ │  │         └─ Build metadata (optional)
         │ │ │  └─────────── Prerelease identifier (optional)
         │ │ └────────────── Patch version
         │ └──────────────── Minor version
         └────────────────── Major version
```

### Version Increment Rules

#### MAJOR (x.0.0) - Breaking Changes

Increment when you make **incompatible API changes**:

- Renamed CSS classes (`.card` → `.glass-card`)
- Removed components
- Changed design token names (`--accent` → `--color-accent`)
- Modified component behavior
- Dropped browser/terminal support
- Changed CLI command structure

**Example**: `0.1.2` → `1.0.0`

#### MINOR (0.x.0) - New Features

Increment when you add **backward-compatible functionality**:

- New components (`.glass-panel`)
- New design tokens (`--spacing-3xl`)
- New utilities (`.text-center`)
- New CLI commands (`celeste export`)
- New examples
- Major documentation additions

**Example**: `1.2.3` → `1.3.0`

#### PATCH (0.0.x) - Bug Fixes

Increment when you make **backward-compatible bug fixes**:

- Fix incorrect styles
- Fix broken animations
- Fix accessibility issues
- Fix CLI bugs
- Documentation fixes
- Performance improvements (no API change)

**Example**: `1.3.4` → `1.3.5`

---

## Version Lifecycle

### Pre-1.0.0 (Development)

```
0.1.0 → 0.2.0 → 0.3.0 → ... → 1.0.0
```

- **Status**: Development/Beta
- **Breaking changes**: Allowed in minor versions (0.x.0)
- **Public API**: Not stable yet
- **Use case**: Early adopters, experimentation

**Current Celeste version**: `0.1.2` (pre-1.0.0)

### Post-1.0.0 (Stable)

```
1.0.0 → 1.1.0 → 1.2.0 → 2.0.0
```

- **Status**: Production-ready
- **Breaking changes**: Only in major versions (x.0.0)
- **Public API**: Stable, backward compatible
- **Use case**: Production deployments

### Version States

| State | Example | Description |
|-------|---------|-------------|
| **Development** | `0.1.0-alpha.1` | Internal testing |
| **Beta** | `0.2.0-beta.1` | Community testing |
| **Release Candidate** | `1.0.0-rc.1` | Production validation |
| **Stable** | `1.0.0` | Production-ready |
| **LTS** | `1.0.0` (tagged) | Long-term support |
| **Deprecated** | `0.x.x` | No longer maintained |
| **End of Life** | `<0.1.0` | Unsupported |

---

## Changelog Format

### Structure

Celeste uses [Keep a Changelog](https://keepachangelog.com/) format:

```markdown
# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- New `.glass-panel` component for full-page layouts

### Changed
- Improved glass effect performance (30% faster)

### Deprecated
- `.card` component (use `.glass-card` instead)

### Removed
- Nothing

### Fixed
- Focus indicator now visible on all buttons
- Corruption animation no longer triggers on reduced-motion

### Security
- Nothing

## [0.2.0] - 2025-01-15

### Added
- Responsive spacing utilities
- CLI `--no-corruption` flag
- Dark mode support

### Changed
- Updated color contrast for WCAG AAA compliance

### Fixed
- Glass effect now works in Safari
- Japanese characters render correctly in Windows Terminal

## [0.1.2] - 2025-12-10

Initial stable release.
```

### Change Categories

| Category | Description | Example |
|----------|-------------|---------|
| **Added** | New features | New component, new token |
| **Changed** | Changes to existing features | Performance improvement, API update |
| **Deprecated** | Soon-to-be removed features | Old component marked deprecated |
| **Removed** | Removed features | Deleted deprecated component |
| **Fixed** | Bug fixes | Accessibility fix, visual bug |
| **Security** | Security fixes | XSS vulnerability patched |

---

## Git Tagging Strategy

### Tag Format

```bash
# Stable releases
v1.0.0
v1.2.3

# Prerelease versions
v1.0.0-alpha.1
v1.0.0-beta.2
v1.0.0-rc.1

# Package-specific tags (if needed)
cli-v1.0.0          # Celeste CLI
theme-v1.0.0        # corrupted-theme npm package
docs-v1.0.0         # Documentation version
```

### Creating Tags

```bash
# Create annotated tag (preferred)
git tag -a v1.0.0 -m "Release v1.0.0: Stable production release

Added:
- New glass-panel component
- Responsive utilities

Changed:
- Improved performance

See CHANGELOG.md for full details"

# Push tag to remote
git push origin v1.0.0

# Create GitHub release from tag
gh release create v1.0.0 \
  --title "Celeste v1.0.0" \
  --notes-file RELEASE_NOTES.md
```

### Tag Conventions

- **Annotated tags only**: Include release notes
- **Immutable**: Never delete/rewrite published tags
- **GPG signed**: Sign tags for security (optional)

```bash
# GPG-signed tag
git tag -s v1.0.0 -m "Release v1.0.0"

# Verify signature
git tag -v v1.0.0
```

---

## Release Workflow

### 1. Prepare Release

```bash
# Update version in package.json
npm version minor  # 0.1.2 → 0.2.0

# Update CHANGELOG.md
# Move [Unreleased] changes to [0.2.0] section

# Update version in documentation
# Search for "version: 0.1.2" and replace with "0.2.0"

# Commit version bump
git add .
git commit -m "chore: bump version to 0.2.0"
```

### 2. Build & Test

```bash
# Build packages
npm run build

# Run tests
npm test

# Visual regression tests
npm run test:visual

# Accessibility audit
npm run test:a11y

# Bundle size check
npm run check:bundle
```

### 3. Create Release

```bash
# Create Git tag
git tag -a v0.2.0 -m "Release v0.2.0"

# Push to remote
git push origin main --tags

# Publish npm package
cd corrupted-theme
npm publish --access public

# Create GitHub release
gh release create v0.2.0 \
  --title "Celeste v0.2.0" \
  --notes "$(cat RELEASE_NOTES.md)"
```

### 4. Announce Release

- Update documentation site
- Post to GitHub Discussions
- Tweet release announcement (if applicable)
- Update README badges

---

## Support Policy

### Support Tiers

| Version | Status | Support Level | End Date |
|---------|--------|---------------|----------|
| **1.x.x** | Current | Full support | N/A |
| **0.3.x** | Previous | Security fixes | +6 months |
| **0.2.x** | Old | None | EOL |
| **0.1.x** | Legacy | None | EOL |

### Support Levels

#### Full Support

- Bug fixes
- Security patches
- Feature additions
- Documentation updates
- Community support

#### Security Fixes Only

- Critical security patches
- No new features
- No bug fixes (unless security-related)
- Limited community support

#### End of Life (EOL)

- No updates
- No support
- Upgrade recommended

### Upgrade Policy

**Recommendation**: Always use the latest stable version.

**Minimum supported version**: Current major version only.

**Example** (when on v2.0.0):
- ✅ **Supported**: v2.0.0 and later
- ⚠️ **Security only**: v1.x.x (6 months)
- ❌ **EOL**: v0.x.x

---

## Cross-Package Versioning

### CLI + npm Package Sync

Celeste CLI and corrupted-theme npm package use **synchronized versioning**:

```
celeste-cli@1.0.0         ✅ Compatible with corrupted-theme@1.0.0
celeste-cli@1.0.0         ⚠️ May work with corrupted-theme@0.9.0 (degraded)
celeste-cli@1.0.0         ❌ Incompatible with corrupted-theme@2.0.0
```

**Rule**: Major versions must match for full compatibility.

### Documentation Versioning

Documentation is versioned alongside packages:

```
docs/
├── v1/          # Docs for v1.x.x
│   ├── brand/
│   ├── components/
│   └── ...
└── v2/          # Docs for v2.x.x (future)
    ├── brand/
    ├── components/
    └── ...
```

---

## Version Checking

### CLI Version Check

```bash
# Check current version
celeste version
# Output: v1.0.0

# Check for updates
celeste update --check
# Output: New version available: v1.1.0
```

### npm Package Version

```bash
# Check installed version
npm list @whykusanagi/corrupted-theme
# Output: @whykusanagi/corrupted-theme@1.0.0

# Check latest version
npm view @whykusanagi/corrupted-theme version
# Output: 1.1.0
```

---

## Related Documentation

- [DESIGN_SYSTEM_GOVERNANCE.md](./DESIGN_SYSTEM_GOVERNANCE.md) - Governance process
- [CONTRIBUTION_GUIDELINES.md](./CONTRIBUTION_GUIDELINES.md) - Contributing guide
- [NPM_PACKAGE.md](../platforms/NPM_PACKAGE.md) - Package management

---

**Last Updated**: 2025-12-13
**Version**: 1.0.0
**Current Celeste Version**: 0.1.2
**Versioning Spec**: Semantic Versioning 2.0.0
**Maintainer**: Celeste Brand System
**Status**: ✅ Active Policy
