# Component Integration Plan - celeste-tts-bot → corrupted-theme

**Branch:** `feature/component-integration`
**Status:** Planning
**Date:** 2026-01-15

---

## Overview

This document outlines the plan to integrate reusable corruption components from `celeste-tts-bot` into the `corrupted-theme` NPM package. These components will be production-ready, well-documented, and include comprehensive examples.

---

## Component Inventory

### ✅ High-Priority Components (Immediate Integration)

#### 1. **corrupted-text.js** - Multi-Language Corruption Animation
**Location:** `~/Development/celeste-tts-bot/obs/corrupted-text.js`
**Size:** 194 lines
**Status:** Production-ready

**Features:**
- Cycles through Japanese (hiragana/katakana/kanji), romaji, and English
- Character-by-character corruption effect
- Configurable duration, cycle delay, and loop behavior
- Data attribute-based initialization
- Auto-initialization for elements with `.corrupted-multilang` class

**Integration Tasks:**
- [ ] Port to `src/corrupted-text.js`
- [ ] Add JSDoc comments
- [ ] Create example: `examples/corrupted-text.html`
- [ ] Document in README

**Value Proposition:**
- Core feature for corrupted theme aesthetic
- Easy drop-in usage with data attributes
- Matches CORRUPTED_THEME_SPEC.md patterns

---

#### 2. **typing-animation.js** - Simulated Typing with Corruption Buffer
**Location:** `~/Development/celeste-tts-bot/obs/typing-animation.js`
**Size:** 164 lines
**Status:** Production-ready

**Features:**
- Simulates terminal-style typing effect
- Random corruption glitches at cursor position
- Configurable typing speed and glitch probability
- Uses phrases from CORRUPTION_BUFFER_IMPLEMENTATIONS.md
- Color-coded corruption types (purple, magenta, cyan, red)

**Integration Tasks:**
- [ ] Port to `src/typing-animation.js`
- [ ] Separate lewd/SFW phrase sets (opt-in config)
- [ ] Add JSDoc comments
- [ ] Create example: `examples/typing-animation.html`
- [ ] Document in README

**Value Proposition:**
- Implements celeste-cli SimulatedTyping in browser
- Perfect for loading states and terminal UIs
- Directly implements spec corruption patterns

---

#### 3. **corruption-phrases.js** - Phrase & Character Set Library
**Location:** `~/Development/celeste-tts-bot/obs/transitions/corruption-phrases.js`
**Size:** 258 lines
**Status:** Production-ready

**Features:**
- Lewd and SFW phrase collections
- Katakana, Hiragana, Block chars, Symbols
- Helper functions: `getRandomPhrase()`, `generateKatakana()`, etc.
- Terminal UI elements (menu items, status messages, headers)
- Code block generators

**Integration Tasks:**
- [ ] Port to `src/corruption-phrases.js`
- [ ] Ensure SFW is default export
- [ ] Add content warning documentation
- [ ] Create example: `examples/corruption-phrases.html`
- [ ] Document phrase system in README

**Value Proposition:**
- Canonical phrase library matching spec
- Reduces code duplication across projects
- Easy to extend with new phrases

---

### ⚠️ Medium-Priority Components (Evaluate for v0.2.0)

#### 4. **animations.css** - Keyframe Animation Library
**Location:** `~/Development/celeste-tts-bot/obs/animations.css`
**Size:** ~12KB

**Features:**
- Fade, slide, scale animations
- Glitch shift animations
- Cyberpunk-themed transitions
- Utility classes (`.fade-in`, `.slide-in-left`, etc.)

**Integration Tasks:**
- [ ] Extract corruption-specific animations
- [ ] Port to `src/animations.css`
- [ ] Remove OBS-specific animations
- [ ] Create animation showcase example
- [ ] Document in style guide

**Concerns:**
- Some animations may be OBS-specific
- Need to review for general use
- Consider CSS variable integration

---

#### 5. **components.css** - Glass Morphism Components
**Location:** `~/Development/celeste-tts-bot/obs/components.css`
**Size:** ~43KB

**Features:**
- Glass morphism cards
- Cyberpunk-themed buttons
- Badges and pills
- Consistent with corrupted-theme color palette

**Integration Tasks:**
- [ ] Extract reusable components
- [ ] Port to `src/components.css`
- [ ] Remove stream-specific styles
- [ ] Create component showcase example
- [ ] Document in style guide

**Concerns:**
- Large file size - needs modularization
- Some components may be too specific
- Consider splitting into multiple files

---

### 🔍 Low-Priority / Evaluation Needed

#### 6. **Transition Components** (20+ files in `transitions/`)
**Location:** `~/Development/celeste-tts-bot/obs/transitions/`

**Notable Files:**
- `grid-corruption.js` - Grid-based corruption effect
- `neural-deserializer.js` - Terminal deserialization animation
- `terminal-blocks.js` - Animated terminal blocks
- `anime-blocks-advanced.js` - Complex block animations
- `spectrum-terminal.js` - Spectrum analyzer + terminal

**Integration Decision:**
- **Defer to v0.3.0+** - These are complex, OBS-specific transitions
- Consider creating a separate `@whykusanagi/corrupted-transitions` package
- Document in FUTURE_WORK.md

---

## Package Structure (After Integration)

```
corrupted-theme/
├── src/
│   ├── core/
│   │   ├── corrupted-text.js          # Multi-language corruption
│   │   ├── typing-animation.js        # Typing with corruption buffer
│   │   └── corruption-phrases.js      # Phrase & character library
│   ├── styles/
│   │   ├── animations.css             # Keyframe animations
│   │   ├── components.css             # Glass morphism components
│   │   └── variables.css              # CSS custom properties
│   └── index.js                       # Main entry point
├── examples/
│   ├── basic/
│   │   ├── corrupted-text.html        # Basic corruption example
│   │   ├── typing-animation.html      # Typing effect demo
│   │   └── corruption-phrases.html    # Phrase library demo
│   ├── advanced/
│   │   ├── countdown.html             # Countdown with corruption
│   │   ├── decoding.html              # Character-by-character decoding
│   │   ├── hybrid.html                # Hybrid corruption patterns
│   │   └── terminal.html              # Terminal UI example
│   └── showcase/
│       ├── animations.html            # Animation showcase
│       ├── components.html            # Component showcase
│       └── full-demo.html             # Full corruption demo
├── docs/
│   ├── API.md                         # API reference
│   ├── EXAMPLES.md                    # Example usage guide
│   ├── CUSTOMIZATION.md               # Customization guide
│   └── CONTENT_WARNINGS.md            # Lewd content guidelines
├── CORRUPTED_THEME_SPEC.md            # Visual specification
├── CORRUPTION_BUFFER_IMPLEMENTATIONS.md
└── README.md
```

---

## Integration Checklist

### Phase 1: Core Components (This PR)
- [ ] Port `corrupted-text.js` → `src/core/corrupted-text.js`
- [ ] Port `typing-animation.js` → `src/core/typing-animation.js`
- [ ] Port `corruption-phrases.js` → `src/core/corruption-phrases.js`
- [ ] Create `src/index.js` with exports
- [ ] Add JSDoc comments to all functions
- [ ] Ensure SFW defaults (lewd content opt-in)

### Phase 2: Examples
- [ ] Create `examples/basic/corrupted-text.html`
- [ ] Create `examples/basic/typing-animation.html`
- [ ] Create `examples/basic/corruption-phrases.html`
- [ ] Create `examples/advanced/countdown.html`
- [ ] Create `examples/advanced/decoding.html`
- [ ] Create `examples/advanced/terminal.html`
- [ ] Create `examples/showcase/full-demo.html`

### Phase 3: Styles (Optional for v0.2.0)
- [ ] Extract corruption-specific animations from `animations.css`
- [ ] Port to `src/styles/animations.css`
- [ ] Extract glass morphism components from `components.css`
- [ ] Port to `src/styles/components.css`
- [ ] Create `src/styles/variables.css` with CSS custom properties
- [ ] Create `examples/showcase/animations.html`
- [ ] Create `examples/showcase/components.html`

### Phase 4: Documentation
- [ ] Update README.md with new components
- [ ] Create `docs/API.md` (full API reference)
- [ ] Create `docs/EXAMPLES.md` (usage guide)
- [ ] Create `docs/CUSTOMIZATION.md` (theming guide)
- [ ] Create `docs/CONTENT_WARNINGS.md` (lewd content policy)
- [ ] Update CHANGELOG.md

### Phase 5: Build & Publish
- [ ] Update `package.json` version (0.1.4 → 0.2.0)
- [ ] Update version references in README
- [ ] Run `npm run build` (if build step exists)
- [ ] Test all examples in clean environment
- [ ] Verify no lewd content in defaults
- [ ] Run `npm pack` and inspect tarball
- [ ] Update git tags
- [ ] Publish to NPM

---

## Implementation Guidelines (From CLAUDE.md)

### Enterprise Benchmark
Every component must include:
1. **Architecture notes**: JSDoc with purpose, usage, and behavior
2. **Test evidence**: Example HTML files demonstrating usage
3. **Developer experience**: Lint-clean, clear API, documented edge cases

### Research Before Invention
- [x] Searched celeste-tts-bot for existing components ✅
- [x] Referenced CORRUPTED_THEME_SPEC.md for patterns ✅
- [x] Referenced CORRUPTION_BUFFER_IMPLEMENTATIONS.md for phrases ✅

### Content Warning Compliance
- **Default:** SFW mode (no lewd phrases)
- **Opt-in:** `{ includeLewd: true }` configuration
- **Documentation:** Clear warnings in README and examples
- **Examples:** SFW examples by default, lewd examples clearly labeled

---

## Breaking Changes Assessment

### No Breaking Changes (Minor Version Bump: 0.1.4 → 0.2.0)
- All new components are **additive**
- No existing APIs are changed
- Existing examples still work
- Backwards compatible

### Semantic Version: 0.2.0
- **Minor version bump** (new features, no breaking changes)
- **Changelog:** "Added corrupted-text, typing-animation, corruption-phrases components"

---

## Testing Plan

### Manual Testing
1. **Component Functionality**
   - [ ] Test `CorruptedText` with all language combinations
   - [ ] Test `TypingAnimation` with different speeds
   - [ ] Test `corruption-phrases` helper functions
   - [ ] Test auto-initialization on DOM ready
   - [ ] Test manual initialization

2. **Browser Compatibility**
   - [ ] Chrome (latest)
   - [ ] Firefox (latest)
   - [ ] Safari (latest)
   - [ ] Edge (latest)

3. **Content Warning Compliance**
   - [ ] Verify SFW mode is default
   - [ ] Verify lewd mode requires opt-in
   - [ ] Verify examples are clearly labeled

4. **Accessibility**
   - [ ] Flicker speed < 100ms per frame
   - [ ] ARIA labels on examples
   - [ ] Screen reader friendly final states

### Performance Testing
- [ ] Corruption cycles < 5ms per update
- [ ] Full animation < 100ms total CPU time
- [ ] Memory usage < 1MB
- [ ] No memory leaks on restart/settle

---

## Risk Assessment

### Low Risk ✅
- Components are well-tested in celeste-tts-bot
- Spec compliance is high
- No dependencies beyond browser APIs

### Medium Risk ⚠️
- Lewd content default must be SFW (verify in code review)
- Performance budget needs validation
- Example quality must be production-grade

### High Risk ❌
- None identified

---

## Open Questions

1. **Build System:** Do we need a build step, or ship raw JS/CSS?
   - **Decision:** Ship raw ES6 modules for now (v0.2.0), add build step in v0.3.0

2. **CSS Variables:** Should components.css use CSS custom properties?
   - **Decision:** Yes, create variables.css with theme tokens

3. **NPM Package Size:** What's acceptable package size?
   - **Decision:** Aim for < 500KB (uncompressed), warn if > 1MB

4. **TypeScript Support:** Should we add .d.ts files?
   - **Decision:** Defer to v0.3.0, add in response to user feedback

---

## Success Criteria

### Must Have (v0.2.0)
- ✅ Core 3 components ported and working
- ✅ 5+ example HTML files
- ✅ SFW defaults enforced
- ✅ README updated with usage guide
- ✅ API documentation complete

### Nice to Have (v0.2.0)
- ⚠️ Styles ported (animations.css, components.css)
- ⚠️ Advanced examples (countdown, terminal)
- ⚠️ Mermaid diagrams in docs

### Future (v0.3.0+)
- Build system (Rollup/Vite)
- TypeScript definitions
- Automated testing
- Transition components package

---

## Timeline Estimate

**Phase 1-2 (Core + Examples):** 4-6 hours
**Phase 3 (Styles):** 2-3 hours (optional)
**Phase 4 (Docs):** 2-3 hours
**Phase 5 (Publish):** 1 hour

**Total:** 9-13 hours (or 6-10 hours without styles)

---

## References

- **Spec:** `CORRUPTED_THEME_SPEC.md`
- **Implementation Guide:** `CORRUPTION_BUFFER_IMPLEMENTATIONS.md`
- **Source Components:** `~/Development/celeste-tts-bot/obs/`
- **CLAUDE.md Guidelines:** Sections 6, 7, 11, 12

---

**Next Steps:**
1. Review this plan
2. Get user approval
3. Begin Phase 1: Port core components
4. Iterate through phases

**Status:** ⏸️ Awaiting user approval
