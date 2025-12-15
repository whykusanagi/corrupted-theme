# Contribution Guidelines

> **Celeste Brand System** | Governance Documentation
> **Document**: How to Contribute to the Celeste Brand System
> **Version**: 1.0.0
> **Last Updated**: 2025-12-13

---

## Table of Contents

1. [Overview](#overview)
2. [Getting Started](#getting-started)
3. [Contribution Types](#contribution-types)
4. [Development Workflow](#development-workflow)
5. [Code Standards](#code-standards)
6. [Testing Requirements](#testing-requirements)
7. [Documentation Requirements](#documentation-requirements)
8. [Pull Request Process](#pull-request-process)

---

## Overview

We welcome contributions to the Celeste brand system! Whether you're fixing bugs, adding features, or improving documentation, this guide will help you contribute effectively.

### What We're Looking For

- ✅ Bug fixes (accessibility, visual, performance)
- ✅ New components (following brand guidelines)
- ✅ Documentation improvements
- ✅ Accessibility enhancements
- ✅ Performance optimizations
- ✅ Test coverage improvements
- ✅ Examples and use cases

### What We're NOT Looking For

- ❌ Breaking changes without RFC
- ❌ Leet speak or off-brand aesthetics
- ❌ Components without documentation
- ❌ Untested code
- ❌ Accessibility regressions
- ❌ Large refactors without discussion

---

## Getting Started

### Prerequisites

- **Node.js**: v18+ (for npm package development)
- **Go**: v1.22+ (for CLI development)
- **Git**: v2.30+
- **Code Editor**: VS Code recommended (extensions below)

### Recommended VS Code Extensions

```json
{
  "recommendations": [
    "stylelint.vscode-stylelint",        // CSS linting
    "dbaeumer.vscode-eslint",            // JavaScript linting
    "golang.go",                         // Go development
    "editorconfig.editorconfig",         // Code formatting
    "streetsidesoftware.code-spell-checker" // Spell checking
  ]
}
```

### Fork & Clone

```bash
# Fork repository on GitHub, then clone your fork
git clone https://github.com/YOUR_USERNAME/celeste-cli.git
cd celeste-cli

# Add upstream remote
git remote add upstream https://github.com/whykusanagi/celeste-cli.git

# Verify remotes
git remote -v
# origin    https://github.com/YOUR_USERNAME/celeste-cli.git (fetch)
# upstream  https://github.com/whykusanagi/celeste-cli.git (fetch)
```

### Install Dependencies

```bash
# Install CLI dependencies
go mod download

# Install npm package dependencies (if contributing to corrupted-theme)
cd ../corrupted-theme
npm install
```

---

## Contribution Types

### 1. Bug Fixes

**Process**:
1. Open issue describing bug
2. Get confirmation it's a bug
3. Fix in fork
4. Submit PR with tests

**PR Title Format**: `fix: [Brief description]`

**Example**: `fix: focus indicator now visible on all buttons`

---

### 2. New Components

**Process**:
1. Open RFC discussion
2. Get maintainer approval
3. Implement component
4. Write documentation
5. Create examples
6. Submit PR

**PR Title Format**: `feat: add [component name]`

**Example**: `feat: add glass-panel component`

**Requirements**:
- Follows brand guidelines (glassmorphism, corruption aesthetic)
- Accessible (WCAG AA)
- Responsive (mobile-first)
- Documented (usage, props, examples)
- Tested (visual regression, accessibility)
- Cross-platform (CLI equivalent if applicable)

---

### 3. Documentation

**Process**:
1. Identify documentation gap
2. Write/update docs
3. Submit PR

**PR Title Format**: `docs: [Brief description]`

**Example**: `docs: add animation timing examples`

**Requirements**:
- Clear, concise writing
- Code examples included
- Links to related docs
- Follows markdown style guide

---

### 4. Performance Improvements

**Process**:
1. Benchmark current performance
2. Implement optimization
3. Benchmark new performance
4. Submit PR with metrics

**PR Title Format**: `perf: [Brief description]`

**Example**: `perf: reduce glass effect GPU usage by 30%`

**Requirements**:
- Before/after benchmarks
- No visual regressions
- No accessibility regressions

---

## Development Workflow

### 1. Create Feature Branch

```bash
# Update main branch
git checkout main
git pull upstream main

# Create feature branch
git checkout -b feature/glass-panel-component

# Naming conventions:
# - feature/[name]    (new features)
# - fix/[name]        (bug fixes)
# - docs/[name]       (documentation)
# - perf/[name]       (performance)
# - refactor/[name]   (code refactoring)
```

### 2. Make Changes

```bash
# Edit files
vim src/css/components.css

# Test changes locally
npm run dev    # Watch mode
npm run build  # Production build
npm test       # Run tests
```

### 3. Commit Changes

```bash
# Stage changes
git add src/css/components.css

# Commit with conventional commit message
git commit -m "feat: add glass-panel component

- Full-page glassmorphism container
- Responsive padding
- WCAG AA accessible
- Includes CLI equivalent

Closes #123"
```

#### Commit Message Format

```
<type>(<scope>): <subject>

<body>

<footer>
```

**Types**:
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation only
- `style`: Formatting (no code change)
- `refactor`: Code refactoring
- `perf`: Performance improvement
- `test`: Adding tests
- `chore`: Maintenance

**Examples**:
```
feat(components): add glass-panel component
fix(a11y): improve focus indicator visibility
docs(brand): add color contrast examples
perf(glass): optimize backdrop-filter rendering
```

### 4. Push to Fork

```bash
# Push feature branch to your fork
git push origin feature/glass-panel-component
```

### 5. Create Pull Request

1. Go to GitHub
2. Click "New Pull Request"
3. Select your fork → your branch
4. Fill out PR template
5. Submit

---

## Code Standards

### CSS Standards

```css
/* ✅ CORRECT: BEM naming, proper formatting */
.glass-panel {
  background: var(--glass-bg);
  backdrop-filter: blur(var(--glass-blur));
  border-radius: var(--radius-lg);
  padding: var(--spacing-xl);
}

.glass-panel--compact {
  padding: var(--spacing-md);
}

.glass-panel__header {
  margin-bottom: var(--spacing-lg);
}

/* ❌ WRONG: Inline styles, magic numbers */
.panel {
  background: rgba(20,12,40,0.7);  /* Use design tokens */
  border-radius: 8px;              /* Use --radius-md */
  padding: 32px;                   /* Use --spacing-xl */
}
```

### JavaScript Standards

```javascript
// ✅ CORRECT: ESLint compliant, proper formatting
function corruptText(text, intensity = 0.3) {
  const japaneseChars = ['ア', 'イ', 'ウ', '使', '統', '計'];

  return text.split('').map((char, i) => {
    if (Math.random() < intensity && /[a-zA-Z]/.test(char)) {
      return japaneseChars[Math.floor(Math.random() * japaneseChars.length)];
    }
    return char;
  }).join('');
}

// ❌ WRONG: No comments, poor formatting
function corrupt(t,i){
  return t.split('').map((c)=>{if(Math.random()<i)return '使';return c;}).join('');
}
```

### Go Standards

```go
// ✅ CORRECT: gofmt formatted, proper comments
// CorruptTextJapanese corrupts English text with Japanese characters
// at the specified intensity level (0.0-1.0).
func CorruptTextJapanese(text string, intensity float64) string {
    if intensity <= 0 {
        return text
    }

    japaneseChars := []rune{'ア', 'イ', 'ウ', '使', '統', '計'}
    runes := []rune(text)

    for i, r := range runes {
        if !unicode.IsLetter(r) {
            continue
        }

        if rand.Float64() < intensity {
            runes[i] = japaneseChars[rand.Intn(len(japaneseChars))]
        }
    }

    return string(runes)
}
```

---

## Testing Requirements

### Visual Regression Tests

```bash
# Capture baseline screenshots
npm run test:visual:baseline

# Run visual regression tests
npm run test:visual

# Review differences
npm run test:visual:review
```

### Accessibility Tests

```bash
# Run automated a11y tests
npm run test:a11y

# Test with screen reader (manual)
# - NVDA (Windows)
# - VoiceOver (macOS)
```

### Cross-Browser Tests

Required browsers:
- ✅ Chrome (latest)
- ✅ Firefox (latest)
- ✅ Safari (latest)
- ✅ Edge (latest)

### CLI Tests

```bash
# Run Go tests
go test ./...

# Test on different terminals
# - macOS Terminal.app
# - iTerm2
# - Windows Terminal
# - VSCode integrated terminal
```

---

## Documentation Requirements

### Component Documentation

Every new component requires:

1. **README section** with:
   - Purpose
   - Usage example
   - Props/options
   - Accessibility notes

2. **Code example**:
```html
<!-- Usage -->
<div class="glass-panel">
  <h2>Panel Title</h2>
  <p>Content here</p>
</div>
```

3. **CLI equivalent**:
```go
// CLI usage
style := lipgloss.NewStyle().
    Border(lipgloss.RoundedBorder()).
    Padding(2, 4)
```

4. **Screenshot** (for visual components)

### Documentation Style Guide

- Use **present tense** ("Add" not "Added")
- Use **imperative mood** ("Move cursor" not "Moves cursor")
- Be **concise** (no fluff)
- Include **examples**
- Link to **related docs**

---

## Pull Request Process

### PR Template

```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix (non-breaking)
- [ ] New feature (non-breaking)
- [ ] Breaking change
- [ ] Documentation update

## Checklist
- [ ] Code follows style guidelines
- [ ] Self-reviewed code
- [ ] Commented complex code
- [ ] Documentation updated
- [ ] No new warnings
- [ ] Tests added
- [ ] All tests passing
- [ ] Visual regression tested
- [ ] Accessibility tested
- [ ] Cross-browser tested

## Screenshots (if applicable)
Before/after screenshots

## Related Issues
Closes #123
```

### Review Process

1. **Automated Checks** (must pass):
   - Linting (ESLint, Stylelint, golangci-lint)
   - Tests (unit, visual regression, a11y)
   - Build (successful compilation)

2. **Code Review** (1+ approvals required):
   - Maintainer reviews code
   - Provides feedback
   - Requests changes if needed

3. **Revisions**:
   - Address review comments
   - Push updates to same branch
   - Re-request review

4. **Approval**:
   - Maintainer approves PR
   - PR merged to main
   - Contributor credited in changelog

### PR Etiquette

- ✅ Keep PRs focused (one feature/fix per PR)
- ✅ Respond to reviews promptly
- ✅ Be respectful and professional
- ✅ Accept constructive feedback
- ❌ Don't force-push after review starts
- ❌ Don't argue with maintainers
- ❌ Don't submit massive PRs (>500 lines)

---

## Code of Conduct

### Our Pledge

We are committed to providing a welcoming and inclusive experience for everyone, regardless of:
- Age, body size, disability, ethnicity, gender identity
- Level of experience, nationality, personal appearance
- Race, religion, sexual identity and orientation

### Expected Behavior

- ✅ Be respectful and considerate
- ✅ Accept constructive criticism gracefully
- ✅ Focus on what's best for the community
- ✅ Show empathy towards others

### Unacceptable Behavior

- ❌ Harassment, trolling, or insulting comments
- ❌ Personal or political attacks
- ❌ Publishing others' private information
- ❌ Conduct that could be considered inappropriate

### Enforcement

Violations may result in:
1. Warning
2. Temporary ban
3. Permanent ban

Report violations to: [maintainer email]

---

## Getting Help

### Resources

- 📖 **Documentation**: https://celeste-docs.com
- 💬 **GitHub Discussions**: Ask questions, propose features
- 🐛 **GitHub Issues**: Report bugs
- 📧 **Email**: [maintainer email]

### FAQ

**Q: How do I propose a new component?**
A: Open an RFC in GitHub Discussions first.

**Q: My PR failed CI checks. What do I do?**
A: Check the error logs, fix issues, push updates.

**Q: How long do PR reviews take?**
A: 1-5 business days depending on complexity.

**Q: Can I contribute if I'm a beginner?**
A: Yes! Look for "good first issue" labels.

---

## Recognition

Contributors are credited in:
- 📜 CHANGELOG.md
- 👥 CONTRIBUTORS.md
- 🏆 GitHub releases
- 🌟 README.md (major contributions)

---

## Related Documentation

- [DESIGN_SYSTEM_GOVERNANCE.md](./DESIGN_SYSTEM_GOVERNANCE.md) - Decision process
- [VERSION_MANAGEMENT.md](./VERSION_MANAGEMENT.md) - Versioning policy
- [BRAND_OVERVIEW.md](../brand/BRAND_OVERVIEW.md) - Brand guidelines

---

**Last Updated**: 2025-12-13
**Version**: 1.0.0
**Maintainer**: Celeste Brand System
**Status**: ✅ Active Guidelines

---

**Thank you for contributing to Celeste!** 🎉
