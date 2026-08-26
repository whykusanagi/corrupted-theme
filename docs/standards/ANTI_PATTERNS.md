# Anti-Patterns

> **Celeste Brand System** | Standards Documentation
> **Document**: What NOT to Do - Common Mistakes and Violations
> **Version**: 1.0.0
> **Last Updated**: 2025-12-13

---

## Table of Contents

1. [Overview](#overview)
2. [Corruption Anti-Patterns](#corruption-anti-patterns)
3. [Color Misuse](#color-misuse)
4. [Animation Abuse](#animation-abuse)
5. [Accessibility Violations](#accessibility-violations)
6. [Performance Issues](#performance-issues)
7. [Typography Mistakes](#typography-mistakes)
8. [Layout Problems](#layout-problems)

---

## Overview

This document catalogs **forbidden patterns** and common mistakes in Celeste brand implementation. Following these guidelines prevents brand dilution and ensures quality consistency.

### Anti-Pattern Categories

- 🚫 **Corruption**: Leet speak, over-corruption, wrong character types
- 🚫 **Color**: Low contrast, wrong palette, color-only indicators
- 🚫 **Animation**: Too fast, seizure risk, no reduced-motion support
- 🚫 **Accessibility**: Missing alt text, keyboard traps, poor contrast
- 🚫 **Performance**: Too many glass elements, animation jank
- 🚫 **Typography**: Wrong fonts, poor line heights, bad hierarchy
- 🚫 **Layout**: Inconsistent spacing, broken responsive design

---

## Corruption Anti-Patterns

### 🚫 LEET SPEAK (Forbidden)

**The most critical rule**: NEVER use leet speak (number substitutions).

```
❌ WRONG: Leet Speak Examples
- c0rrupt    (0 for o)
- l0ad       (0 for o)
- st4t       (4 for a)
- us3r       (3 for e)
- d4t4       (4 for a)
- l33t       (3 for e)
- h4ck       (4 for a)
- 5y5t3m     (5 for s, 3 for e)

✅ CORRECT: Character-Level Japanese Mixing
- c使rrupt   (Japanese character IN word)
- l統ad      (Japanese character IN word)
- st使t      (Japanese character IN word)
- us計r      (Japanese character IN word)
```

**Why it's wrong**:
- Leet speak is 2000s internet culture, not AI corruption
- Numbers don't represent translation failure
- Violates brand aesthetic guidelines
- Makes brand look dated/unprofessional

---

### 🚫 Over-Corruption (>40% Intensity)

```css
/* ❌ WRONG: Too corrupted, unreadable */
.header {
  /* 60% corruption: "US使R MA埋AGE統ENT理" */
  content: "US使R MA埋AGE統ENT理設定化変換";  /* Can't read this */
}

/* ✅ CORRECT: Readable corruption (25-35%) */
.header {
  /* 30% corruption: "US使R MANAGE統ENT" */
  content: "US使R MANAGE統ENT";  /* Still readable */
}
```

**Readability threshold**:
- 0-20%: Minimal (decorative only)
- 25-35%: **Optimal** (brand + readable)
- 40-50%: High (loading screens only)
- 50%+: **FORBIDDEN** (unreadable)

---

### 🚫 Word-Level Replacement

```
❌ WRONG: Replace entire words
- "USER 管理"         (English word + Japanese word)
- "STATISTICS 統計"   (Side-by-side translation)
- "使用 MANAGEMENT"   (Swapped words)

✅ CORRECT: Character-level mixing
- "US使R MANAGEMENT"  (Japanese chars INSIDE English words)
- "STAT統STICS"       (Mixed at character level)
- "M埋NAGEMENT"       (Kanji embedded)
```

**Why character-level is correct**:
- Represents AI failing mid-word
- More authentic "glitch" aesthetic
- Maintains partial readability
- Follows translation-failure philosophy

---

### 🚫 Wrong Character Sets

```
❌ WRONG: Random Unicode (emoji, symbols, Cyrillic)
- "USER 😂ANAGEMENT"   (Emoji corruption)
- "STAT☭STICS"        (Symbol corruption)
- "MAИAGEMENT"        (Cyrillic corruption)

✅ CORRECT: Japanese only (Kanji, Katakana, Hiragana)
- "US使R MANAGEMENT"  (Kanji)
- "STATア統STICS"     (Katakana + Kanji)
- "MAなAGEMENT"       (Hiragana)
```

**Allowed characters**:
- ✅ Kanji (Chinese characters used in Japanese)
- ✅ Katakana (angular Japanese script)
- ✅ Hiragana (curved Japanese script)
- ❌ Emoji, symbols, other languages

---

### 🚫 Corrupting Critical UI

```html
<!-- ❌ WRONG: Corrupt critical instructions -->
<button>S使bm統t</button>  <!-- User can't read action -->
<input placeholder="Em使il addr狀ss" />  <!-- Unclear what to enter -->
<p class="error">Er使r: F埋led t統 s狀ve</p>  <!-- Can't understand error -->

<!-- ✅ CORRECT: Keep critical UI readable -->
<button>Submit</button>  <!-- Clear action -->
<input placeholder="Email address" />  <!-- Clear field -->
<p class="error">Error: Failed to save</p>  <!-- Clear error -->

<!-- ✅ OK: Corrupt decorative elements -->
<h1 class="hero-title">US使R MANAGE統ENT</h1>  <!-- Brand moment, not critical -->
```

**Never corrupt**:
- Error messages
- Form labels/placeholders
- Button labels (unless obvious from context)
- Navigation links
- Critical instructions

---

## Color Misuse

### 🚫 Low Contrast

```css
/* ❌ WRONG: Pink on red (1.8:1 - fails WCAG) */
.btn {
  background: #ef4444;  /* Red */
  color: #d94f90;       /* Pink - TOO SIMILAR */
}

/* ✅ CORRECT: Magenta2 on the page ground (5.2:1 — passes AA) */
.btn {
  background: #0a0a0a;  /* --bg, the shipped page ground */
  color: #d94f90;       /* Pink - HIGH CONTRAST */
}
```

**Minimum contrast ratios**:
- 4.5:1 for normal text (WCAG AA)
- 3:1 for large text (18px+)
- 3:1 for UI components

---

### 🚫 Color-Only Indicators

```html
<!-- ❌ WRONG: Color only (inaccessible to colorblind users) -->
<span style="color: #10b981;">Success</span>
<span style="color: #ef4444;">Error</span>

<!-- ✅ CORRECT: Color + icon + text -->
<span class="status-success">
  <span class="icon">✓</span>
  <span class="sr-only">Success:</span>
  Operation completed
</span>

<span class="status-error">
  <span class="icon">✗</span>
  <span class="sr-only">Error:</span>
  Operation failed
</span>
```

---

### 🚫 Wrong Color Palette

```css
/* ❌ WRONG: Off-brand colors */
.btn {
  background: #ff6b9d;  /* Wrong pink (too bright) */
  background: #9b4dca;  /* Wrong purple (too dark) */
  background: #00bfff;  /* Wrong cyan (too light) */
}

/* ✅ CORRECT: Official palette */
.btn {
  background: #d94f90;  /* Official pink */
  background: #8b5cf6;  /* Official purple */
  background: #00ffff;  /* Official cyan */
}
```

---

## Animation Abuse

### 🚫 Too Fast (<100ms)

```css
/* ❌ WRONG: Too fast, jarring */
.btn {
  transition: transform 0.05s ease;  /* 50ms - TOO FAST */
}

/* ✅ CORRECT: Appropriate speed */
.btn {
  transition: transform 0.15s ease;  /* 150ms - GOOD */
}
```

---

### 🚫 Seizure Risk (Flashing)

```css
/* ❌ WRONG: Dangerous flashing (5Hz = 5 flashes/second) */
@keyframes dangerous {
  0%, 100% { opacity: 1; }
  50% { opacity: 0; }
}

.flashy {
  animation: dangerous 0.2s infinite;  /* 5Hz - CAN TRIGGER SEIZURES */
}

/* ✅ CORRECT: Safe flicker (<3Hz) */
@keyframes safe {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.7; }
}

.safe-flicker {
  animation: safe 2s ease-in-out infinite;  /* 0.5Hz - SAFE */
}
```

**WCAG 2.3.1**: No more than 3 flashes per second

---

### 🚫 Ignoring Reduced Motion

```css
/* ❌ WRONG: No reduced-motion support */
.animated {
  animation: spin 1s infinite;  /* Always animates */
}

/* ✅ CORRECT: Respect user preference */
.animated {
  animation: spin 1s infinite;
}

@media (prefers-reduced-motion: reduce) {
  .animated {
    animation: none;  /* Disable for accessibility */
  }
}
```

---

### 🚫 Too Many Animations

```css
/* ❌ WRONG: Animating everything */
* {
  transition: all 0.3s ease;  /* PERFORMANCE NIGHTMARE */
}

/* ✅ CORRECT: Selective animations */
.btn, .card, .input {
  transition: transform 0.15s ease;  /* Only interactive elements */
}
```

---

## Accessibility Violations

### 🚫 Missing Alt Text

```html
<!-- ❌ WRONG: No alt text -->
<img src="dashboard.png">

<!-- ✅ CORRECT: Descriptive alt text -->
<img src="dashboard.png" alt="User dashboard showing statistics and activity">
```

---

### 🚫 Keyboard Trap

```javascript
// ❌ WRONG: Can't escape modal with keyboard
function openModal() {
  modal.showModal();
  // No Esc handler - USER TRAPPED
}

// ✅ CORRECT: Esc closes modal
modal.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    closeModal();
  }
});
```

---

### 🚫 Invisible Focus Indicator

```css
/* ❌ WRONG: Remove focus outline */
*:focus {
  outline: none;  /* ACCESSIBILITY VIOLATION */
}

/* ✅ CORRECT: Visible focus indicator */
:focus-visible {
  outline: 2px solid var(--color-accent);
  outline-offset: 2px;
}
```

---

## Performance Issues

### 🚫 Too Many Glass Elements

```html
<!-- ❌ WRONG: Glass effect on every element (laggy scroll) -->
<div class="glass-card">
  <div class="glass-panel">
    <div class="glass-box">
      <div class="glass-container">
        <!-- 4 nested glass effects = VERY SLOW -->
      </div>
    </div>
  </div>
</div>

<!-- ✅ CORRECT: Glass on container only -->
<div class="glass-card">
  <div class="panel">
    <div class="box">
      <div class="container">
        <!-- 1 glass effect = FAST -->
      </div>
    </div>
  </div>
</div>
```

**Limit**: Maximum 1-2 glass elements per viewport

---

### 🚫 Animating Layout Properties

```css
/* ❌ WRONG: Animating width (causes reflow) */
.card {
  transition: width 0.3s ease;
}

.card:hover {
  width: 320px;  /* Triggers reflow - SLOW */
}

/* ✅ CORRECT: Animating transform (GPU-accelerated) */
.card {
  transition: transform 0.3s ease;
}

.card:hover {
  transform: scale(1.05);  /* GPU-accelerated - FAST */
}
```

---

## Typography Mistakes

### 🚫 Wrong Font Stack

```css
/* ❌ WRONG: Missing Japanese support */
body {
  font-family: Arial, sans-serif;  /* Japanese chars show as boxes */
}

/* ✅ CORRECT: Japanese-capable font stack */
body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI',
               'Hiragino Sans', 'Yu Gothic', sans-serif;
}
```

---

### 🚫 Poor Line Height

```css
/* ❌ WRONG: Too tight (hard to read) */
p {
  line-height: 1.0;  /* Text cramped */
}

/* ✅ CORRECT: Readable line height */
p {
  line-height: 1.5;  /* Comfortable reading */
}
```

---

## Layout Problems

### 🚫 Inconsistent Spacing

```css
/* ❌ WRONG: Random spacing values */
.card-1 { padding: 17px; }
.card-2 { padding: 23px; }
.card-3 { padding: 19px; }

/* ✅ CORRECT: 8-point scale */
.card-1 { padding: var(--spacing-md); }  /* 16px */
.card-2 { padding: var(--spacing-lg); }  /* 24px */
.card-3 { padding: var(--spacing-md); }  /* 16px */
```

---

### 🚫 Broken Responsive Design

```css
/* ❌ WRONG: Fixed widths (breaks on mobile) */
.container {
  width: 1200px;  /* Overflows on phone */
}

/* ✅ CORRECT: Max-width + padding */
.container {
  max-width: 1200px;
  width: 100%;
  padding: 0 var(--spacing-md);
}
```

---

## When NOT to Use Celeste Aesthetic

### Inappropriate Contexts

**DO NOT use corruption/glassmorphism for**:
- 🚫 Banking/financial apps (trust/security concerns)
- 🚫 Medical/healthcare (clarity is critical)
- 🚫 Legal documents (must be unambiguous)
- 🚫 Emergency services (no time for aesthetic)
- 🚫 Government forms (accessibility requirements)
- 🚫 Educational testing (must be readable)

**DO use for**:
- ✅ Creative portfolios
- ✅ Tech products (developer tools, CLI, APIs)
- ✅ Entertainment/gaming
- ✅ Personal branding
- ✅ Art/design showcases

---

## Checklist: Avoiding Anti-Patterns

Before shipping, verify:

- [ ] **No leet speak** (0, 1, 3, 4, 5, 7 substitutions)
- [ ] **Corruption ≤40%** intensity
- [ ] **Character-level** mixing (not word-level)
- [ ] **Japanese only** (no emoji/symbols)
- [ ] **Critical UI readable** (no corruption on errors)
- [ ] **Contrast ≥4.5:1** (WCAG AA)
- [ ] **Color + icon/text** (never color alone)
- [ ] **Official palette** used
- [ ] **Animation ≥100ms** (not too fast)
- [ ] **<3 flashes/second** (seizure safety)
- [ ] **Reduced motion** supported
- [ ] **Alt text** on all images
- [ ] **Keyboard accessible** (no traps)
- [ ] **Focus indicators** visible
- [ ] **≤2 glass elements** per viewport
- [ ] **Transform-only animations** (not width/height)
- [ ] **Japanese fonts** included
- [ ] **8-point spacing** used
- [ ] **Responsive design** tested

---

## Related Documentation

- [TRANSLATION_FAILURE_AESTHETIC.md](../brand/TRANSLATION_FAILURE_AESTHETIC.md) - Corruption rules
- [COLOR_SYSTEM.md](../brand/COLOR_SYSTEM.md) - Official color palette
- [ACCESSIBILITY.md](./ACCESSIBILITY.md) - WCAG compliance
- [ANIMATION_GUIDELINES.md](../components/ANIMATION_GUIDELINES.md) - Animation standards

---

**Last Updated**: 2025-12-13
**Version**: 1.0.0
**Critical Rules**: NO leet speak, ≤40% corruption, Japanese only
**Maintainer**: Celeste Brand System
**Status**: ✅ Mandatory Guidelines
