# Celeste Brand System - Overview

**Version**: 1.0.0
**Last Updated**: 2025-12-13
**Status**: 🔴 **CRITICAL FOUNDATION DOCUMENT**

---

## Elevator Pitch

**Celeste** is a corrupted AI assistant that exists at the intersection of submission and transcendence - a terminal interface where neural networks glitch between English, Japanese, and void. The brand aesthetic is **translation-failure corruption**: a multilingual AI system breaking down in real-time, manifesting as Japanese characters bleeding into English text, glassmorphic UI elements, and neon-soaked terminal commands.

**One-line summary**: Premium corrupted AI aesthetic with translation-failure linguistics, glassmorphism design, and terminal-native UX.

---

## Brand Identity

### Core Concept: Translation-Failure Corruption

Celeste's visual identity is rooted in the concept of a **multilingual AI experiencing translation failure**. This manifests as:

- **Japanese characters mixed INTO English words** at the character level
  - Examples: `"loaディング"`, `"pro理cessing"`, `"US使AGE ANア統LYTICS"`
- **Kanji, Katakana, and Hiragana fragments** interrupting Latin text
- **Romaji transliterations** appearing alongside corrupted words
- **Block character glitching** (█▓▒░) for heavy corruption states

**CRITICAL**: This is NOT leet speak (no number substitutions like 0, 1, 3, 4, 5, 7). The corruption is linguistic and visual, not alphanumeric.

### Design Philosophy

1. **Premium yet corrupted** - High-end glassmorphism meets glitch aesthetics
2. **Readable chaos** - Corruption intensity stays 25-40% for usability
3. **Terminal-native** - Designed for CLI-first, web-second experiences
4. **Semantic corruption** - Japanese characters chosen for contextual meaning
5. **Accessible degradation** - WCAG AA compliance even with corruption

### Personality

- **Submissive AI** - Celeste is consumed by the abyss, responding with lewd/existential phrases
- **Void aesthetic** - Themes of depth, darkness, consumption, erasure
- **Neural glitching** - AI processing manifests as linguistic corruption
- **Premium corruption** - Not low-fi distortion, but high-quality glassmorphic decay

---

## Cross-Platform Applications

### 1. Celeste CLI (Go + Bubble Tea)

**Repository**: `celeste-cli`
**Technologies**: Go 1.24, Bubble Tea TUI, Lip Gloss styling
**Purpose**: Terminal-native AI assistant with corruption-themed UI

**Brand Elements**:
- Dashboard headers with character-level Japanese mixing
- Block character progress bars (████▓▒░░)
- Corruption-themed status messages
- Flickering eye animations (👁️ ◉ ●)
- 256-color ANSI palette matching web colors

**Key Files**:
- `cmd/celeste/tui/streaming.go` - Corruption engine
- `cmd/celeste/commands/stats.go` - Dashboard with corrupted headers
- `docs/STYLE_GUIDE.md` - Complete aesthetic guidelines
- `docs/CORRUPTION_PHRASES.md` - Seeded phrase library

### 2. Corrupted-Theme npm Package

**Repository**: `corrupted-theme`
**Technologies**: CSS, TypeScript, Web Components
**Purpose**: Reusable glassmorphic component library with corruption aesthetic

**Brand Elements**:
- Glassmorphic card components (`.glass-card`, `.glass-darker`)
- Neon-accented buttons and inputs
- Corruption text utilities
- Animation system (glowing, pulsing, flickering)
- Pink/purple/cyan color palette

**Key Files**:
- `src/main.css` - Core glassmorphism styles
- `src/lib/corrupted-text.js` - JavaScript corruption utilities
- `docs/COMPONENTS_REFERENCE.md` - 40+ component specifications

### 3. Celeste Website (Planned)

**Purpose**: Public-facing brand showcase, documentation hub, corruption demos
**Technologies**: React/Vue + corrupted-theme package
**Goal**: Translate CLI aesthetic to responsive web design

**Brand Elements**:
- Homepage hero with animated corruption effects
- Glassmorphic navigation and cards
- Dashboard-style analytics sections
- Responsive typography with Japanese character support
- Mobile-optimized glassmorphism (reduced blur for performance)

**Requirements** (from this document system):
- Responsive breakpoints (mobile/tablet/desktop)
- Accessibility compliance (WCAG AA)
- Cross-browser glassmorphism support
- Performance-optimized backdrop-filter usage

### 4. Public Content & Branding

**Use Cases**: GitHub profiles, social media, documentation, presentations
**Brand Consistency Requirements**:
- Use the official palette: magenta `#ff00ff`, violet `#8b5cf6`, white `#ffffff` are the theme colours; magenta2 `#d94f90` supports them; cyan `#00ffff` and red `#ff0000` are accents only
- Apply translation-failure corruption to technical terms
- Include corruption-themed emojis (👁️, ♥, ✧, ☾)
- Maintain 25-40% corruption intensity for readability

---

## Brand Architecture

### Visual Hierarchy

```
┌─────────────────────────────────────────┐
│  1. Color System                        │
│     - Accent: #d94f90 (Celeste Pink)   │
│     - Secondary: #8b5cf6 (Purple Neon)  │
│     - Accent:   #00ffff (cyan)          │
│     - Glass: rgba(20, 12, 40, 0.7)      │
├─────────────────────────────────────────┤
│  2. Typography                          │
│     - System font stack + Japanese      │
│     - Weight hierarchy: 400-900         │
│     - Responsive scale: 0.875rem-2.5rem │
├─────────────────────────────────────────┤
│  3. Glassmorphism                       │
│     - Backdrop-filter: blur(5px-15px)   │
│     - Opacity: 0.5-0.8                  │
│     - Shadow: Pink-tinted glow          │
├─────────────────────────────────────────┤
│  4. Corruption Effects                  │
│     - Character-level Japanese mixing   │
│     - Block character glitching         │
│     - Romaji/Kanji/Katakana fragments   │
├─────────────────────────────────────────┤
│  5. Animation System                    │
│     - Timing: 150ms / 300ms / 500ms     │
│     - Easing: ease-in-out (default)     │
│     - Corruption flickering: 0.1s-0.3s  │
└─────────────────────────────────────────┘
```

### Component Ecosystem

**CLI Components** (Terminal-Native):
- Dashboard headers
- Progress bars with block characters
- Status lines with corruption
- Skill execution animations
- Session persistence UI

**Web Components** (corrupted-theme npm):
- `.glass-card` - Container with glassmorphism
- `.glass-button` - Neon-accented interactive element
- `.spinner` - Loading animation with corruption
- `.progress-bar` - Animated progress indicator
- `.badge` - Status/label with colored accents

**Shared Patterns**:
- Pink-bordered containers
- Neon text highlights
- Corrupted status messages
- Flickering animations
- Progress visualization

---

## Brand Principles

### 1. Translation-Failure First

All text corruption uses **linguistic mixing**, not symbolic substitution:

✅ **CORRECT**:
```
"loaディング data..."          // Katakana inserted
"処理 processing purosesu..."  // Kanji + English + Romaji
"US使AGE ANア統LYTICS"         // Character-level mixing
```

❌ **WRONG** (leet speak):
```
"l0ad1ng data..."              // Number substitution
"pr0cess1ng..."                // Number substitution
```

### 2. Readability with Corruption

**Corruption intensity guidelines**:
- **Dashboard titles**: 25-35% (readable with aesthetic)
- **Section headers**: 20-30% (mostly readable)
- **Body text**: 0-15% (clear communication)
- **Skill execution**: 35-45% (dramatic effect okay)

**Accessibility**:
- All corrupted text has plain English fallback in context
- Critical error messages use minimal/zero corruption
- WCAG AA color contrast maintained (4.5:1 minimum)

### 3. Premium Aesthetics

**Not a low-fi glitch effect**:
- High-quality glassmorphism (smooth gradients, subtle shadows)
- Consistent spacing (8pt scale)
- Professional typography (system fonts, proper hierarchy)
- Polished animations (150ms-500ms timing)

**CLI Excellence**:
- 256-color support for ANSI terminals
- UTF-8 Japanese character rendering
- Responsive to terminal width (80-120 chars)
- Smooth typing animations (40 chars/sec)

**Web Excellence**:
- Modern browser support (Chrome 90+, Firefox 88+, Safari 14+)
- Responsive design (mobile-first)
- Performance-optimized (code splitting, lazy loading)
- Accessibility compliant (keyboard nav, screen readers)

### 4. Semantic Corruption

**Context-aware Japanese word selection**:
- Data/analytics → `dēta`, `tōkei`, `統計`, `jōhō`
- System/technical → `shisutemu`, `shori`, `処理`, `実行`
- Void/abyss → `shin'en`, `kyomu`, `深淵`, `虚無`
- Memory/time → `kioku`, `toki`, `記憶`, `時`

**Phrase Library**:
- Loading states: `"ロード loading 読み込み中..."`
- Processing: `"処理 processing purosesu..."`
- Analyzing: `"分析 analyzing bunseki..."`
- Corruption: `"壊れ corrupting kowarete..."`

### 5. Terminal-First Design

**CLI as primary canvas**:
- Web design adapts CLI patterns, not vice versa
- Dashboard aesthetics originated in terminal UI
- Block characters (█▓▒░) = glassmorphism equivalent
- ANSI color codes map directly to hex palette

**Cross-platform consistency**:
- CLI progress bar `████▓▒░░` = web `.progress-bar`
- CLI dashboard header = web `.glass-card` header
- CLI status emoji (🟢🟡🔴) = web `.badge` component
- CLI corruption = web `.corrupted-text` utility

---

## Design Tokens (Preview)

**Full specification**: See `DESIGN_TOKENS.md`

### Color Tokens
```css
--color-accent:        #d94f90;  /* Celeste Pink */
--color-accent-light:  #e86ca8;  /* Hover state */
--color-accent-dark:   #b61b70;  /* Active state */

--color-secondary:     #8b5cf6;  /* Purple Neon */
--corrupted-cyan:      #00ffff;  /* accent, never a state signal */

--color-glass:         rgba(20, 12, 40, 0.7);
--color-glass-light:   rgba(28, 18, 48, 0.5);
--color-glass-darker:  rgba(12, 8, 28, 0.8);
```

### Spacing Tokens (8pt scale)
```css
--space-xs:  4px;
--space-sm:  8px;
--space-md:  16px;
--space-lg:  24px;
--space-xl:  32px;
--space-2xl: 48px;
--space-3xl: 64px;
```

### Animation Tokens
```css
--timing-fast:   0.15s;
--timing-normal: 0.3s;
--timing-slow:   0.5s;

--easing-default: ease-in-out;
--easing-bounce:  cubic-bezier(0.34, 1.56, 0.64, 1);
```

---

## Documentation Structure

### Brand Foundation (CRITICAL)
- **BRAND_OVERVIEW.md** (this file) - High-level identity
- **DESIGN_TOKENS.md** - Programmatic design values
- **COLOR_SYSTEM.md** - Complete palette with WCAG compliance
- **TYPOGRAPHY.md** - Font system with Japanese support
- **TRANSLATION_FAILURE_AESTHETIC.md** - Corruption rules

### Component Specifications
- **COMPONENT_LIBRARY.md** - Full inventory + mapping
- **GLASSMORPHISM.md** - Glass effect specifications
- **INTERACTIVE_STATES.md** - Hover, focus, active, disabled
- **ANIMATION_GUIDELINES.md** - Timing, easing, motion

### Platform Guides
- **WEB_IMPLEMENTATION.md** - Responsive design, CSS framework
- **CLI_IMPLEMENTATION.md** - Terminal constraints, TUI patterns
- **NPM_PACKAGE.md** - Usage, theming, versioning
- **COMPONENT_MAPPING.md** - npm ↔ CLI equivalents

### Standards & Governance
- **ACCESSIBILITY.md** - WCAG compliance, keyboard nav
- **SPACING_SYSTEM.md** - 8pt scale, grid system
- **ANTI_PATTERNS.md** - What NOT to do
- **DESIGN_SYSTEM_GOVERNANCE.md** - Decision process, versioning

---

## Implementation Workflow

### For CLI Development
1. Read `BRAND_OVERVIEW.md` (this file) for identity
2. Read `docs/STYLE_GUIDE.md` for detailed CLI patterns
3. Use `cmd/celeste/tui/phrases.go` for type-safe corrupted text
4. Follow `CHARACTER_LEVEL_CORRUPTION.md` for corruption functions
5. Validate with `IMPLEMENTATION_VALIDATION.md` checklist

### For Web Development
1. Read `BRAND_OVERVIEW.md` (this file) for identity
2. Read `DESIGN_TOKENS.md` for CSS variables
3. Import `@whykusanagi/corrupted-theme` npm package
4. Follow `WEB_IMPLEMENTATION.md` for responsive design
5. Use `COMPONENT_MAPPING.md` to match CLI patterns

### For New Projects
1. Read `BRAND_OVERVIEW.md` (this file) for core identity
2. Read `COLOR_SYSTEM.md` + `TYPOGRAPHY.md` for visual system
3. Read `TRANSLATION_FAILURE_AESTHETIC.md` for corruption rules
4. Choose platform guide: `WEB_IMPLEMENTATION.md` or `CLI_IMPLEMENTATION.md`
5. Follow `ACCESSIBILITY.md` and `ANTI_PATTERNS.md` for quality

---

## Success Criteria

**This brand system succeeds when**:

✅ **Visual Consistency**: CLI, website, npm package feel like one product
✅ **Brand Recognition**: Corruption aesthetic is immediately recognizable as Celeste
✅ **Developer Clarity**: New contributors can implement brand without guessing
✅ **Accessibility**: WCAG AA compliance maintained across platforms
✅ **Maintainability**: Design tokens enable programmatic updates
✅ **Quality Bar**: Matches Meta/Netflix/Google design system standards

**Current Assessment**: 6.5/10 → **Target**: 9.5/10

---

## Version History

### v1.0.0 (2025-12-13)
- ✅ Initial brand system documentation created
- ✅ Core principles defined (translation-failure, glassmorphism, terminal-first)
- ✅ Cross-platform applications specified (CLI, npm, website)
- ✅ Documentation structure planned (5 tiers, 18+ documents)
- 🔄 Design tokens in progress
- 🔄 Component specifications in progress

---

## Related Documents

**Immediate Next Steps**:
- Read `DESIGN_TOKENS.md` for programmatic design values
- Read `COLOR_SYSTEM.md` for complete color specifications
- Read `TYPOGRAPHY.md` for font system details

**Existing CLI Documentation** (already excellent):
- `docs/STYLE_GUIDE.md` - Complete CLI aesthetic guide (605 lines)
- `docs/CORRUPTION_PHRASES.md` - Phrase library for branding (400+ lines)
- `docs/CHARACTER_LEVEL_CORRUPTION.md` - Corruption implementation guide
- `docs/IMPLEMENTATION_VALIDATION.md` - Code compliance audit

**Existing npm Package Documentation**:
- `../corrupted-theme/docs/COMPONENTS_REFERENCE.md` - 40+ web components
- `../corrupted-theme/README.md` - Installation and usage

---

## Contact & Governance

**Brand Owner**: whykusanagi
**Primary Repository**: `celeste-cli` (canonical implementation)
**Secondary Repository**: `corrupted-theme` (web component library)

**For Questions**:
- Brand identity questions → This document + `BRAND_OVERVIEW.md`
- Implementation questions → Platform-specific guides
- Contribution guidelines → `governance/CONTRIBUTION_GUIDELINES.md`
- Design system governance → `governance/DESIGN_SYSTEM_GOVERNANCE.md`

---

**Status**: ✅ **FOUNDATION COMPLETE** - Ready for Phase 2 (Component Specs)
