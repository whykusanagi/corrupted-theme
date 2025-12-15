# Celeste Brand System - Typography

**Version**: 1.0.0
**Last Updated**: 2025-12-13
**Status**: 🔴 **CRITICAL FOUNDATION DOCUMENT**

---

## Overview

Celeste's typography system balances **technical clarity** with **corrupted aesthetics**:
- **System fonts** for cross-platform consistency
- **Japanese character support** (Kanji, Katakana, Hiragana)
- **Monospace defaults** for CLI terminal
- **Responsive scale** (mobile to desktop)
- **Semantic hierarchy** (H1-H6, body, labels)

---

## Font Families

### Base (Web/UI)

**Stack**:
```css
font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto,
             'Helvetica Neue', Arial, sans-serif;
```

**Rationale**:
- **System-native performance** (no web font loading)
- **Cross-platform consistency** (macOS, Windows, Android)
- **Excellent Unicode support** (including Japanese)
- **High readability** at small sizes

**Token**: `--font-family-base`

### Japanese Support

**Stack**:
```css
font-family: 'Hiragino Sans', 'Yu Gothic', 'Meiryo',
             'MS PGothic', sans-serif;
```

**Fallback Chain**:
1. **Hiragino Sans** (macOS default, excellent rendering)
2. **Yu Gothic** (Windows 10+, modern)
3. **Meiryo** (Windows 7-10, readable)
4. **MS PGothic** (Legacy Windows, last resort)
5. **sans-serif** (System fallback)

**Token**: `--font-family-japanese`

**Combined Stack** (for mixed English/Japanese):
```css
font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto,
             'Hiragino Sans', 'Yu Gothic', 'Meiryo',
             'Helvetica Neue', Arial, sans-serif;
```

### Monospace (CLI/Code)

**Stack**:
```css
font-family: 'SF Mono', 'Monaco', 'Consolas',
             'Liberation Mono', monospace;
```

**Rationale**:
- **SF Mono** (macOS default, best terminal font)
- **Monaco** (macOS legacy)
- **Consolas** (Windows default)
- **Liberation Mono** (Linux fallback)
- **monospace** (System fallback)

**Token**: `--font-family-monospace`

**CLI Usage**: Terminal automatically uses system monospace font
- No font-family specification needed in Go/Bubble Tea
- UTF-8 must be enabled for Japanese character rendering

---

## Font Size Scale

### Responsive Typography (Web)

Using **rem units** (1rem = 16px base) for scalability.

| Token | Size (rem) | Size (px) | Use Case |
|-------|------------|-----------|----------|
| `font-size-xs` | 0.75rem | 12px | Captions, timestamps, metadata |
| `font-size-sm` | 0.875rem | 14px | Small labels, secondary text |
| `font-size-base` | 1rem | 16px | Body text (default) |
| `font-size-lg` | 1.125rem | 18px | Large body text, subheadings |
| `font-size-xl` | 1.25rem | 20px | H6, small headers |
| `font-size-2xl` | 1.5rem | 24px | H5 |
| `font-size-3xl` | 1.875rem | 30px | H4 |
| `font-size-4xl` | 2.25rem | 36px | H3 |
| `font-size-5xl` | 3rem | 48px | H2 |
| `font-size-6xl` | 3.75rem | 60px | H1, hero text |

**Responsive Scaling**:
```css
/* Mobile (320px-640px) */
html { font-size: 14px; }  /* Base = 14px */

/* Tablet (641px-1024px) */
@media (min-width: 641px) {
  html { font-size: 15px; }  /* Base = 15px */
}

/* Desktop (1025px+) */
@media (min-width: 1025px) {
  html { font-size: 16px; }  /* Base = 16px */
}
```

This ensures text scales proportionally across breakpoints.

### Fixed Typography (CLI)

Terminal font size is **controlled by terminal emulator**, not the application.

**Typical defaults**:
- **macOS Terminal.app**: 12pt Monaco
- **iTerm2**: 12pt SF Mono
- **Windows Terminal**: 12pt Consolas
- **VS Code Terminal**: 14pt Monaco

**Celeste CLI font size strategy**:
- Use terminal's default size
- Scale with relative units (line count, not px)
- Assume 80-120 character terminal width

---

## Font Weight Hierarchy

| Token | Weight | Numeric | Use Case |
|-------|--------|---------|----------|
| `font-weight-normal` | normal | 400 | Body text, default |
| `font-weight-medium` | medium | 500 | Slight emphasis, labels |
| `font-weight-semibold` | semibold | 600 | Section headers, buttons |
| `font-weight-bold` | bold | 700 | Strong emphasis, H3-H6 |
| `font-weight-black` | black | 900 | Hero text, H1-H2, dashboard titles |

**Usage Guidelines**:
- **Normal (400)**: All body text, paragraphs, descriptions
- **Medium (500)**: Input labels, navigation links, breadcrumbs
- **Semibold (600)**: Section headers, card titles, button text
- **Bold (700)**: Main headings (H3-H6), emphasis within text
- **Black (900)**: Hero headings (H1-H2), dashboard headers

**Japanese Text Weights**:
- Japanese fonts often have **limited weight options**
- Stick to 400 (normal) and 700 (bold) for maximum compatibility
- Avoid 900 (black) for Japanese-only text

---

## Line Height (Leading)

| Token | Value | Use Case |
|-------|-------|----------|
| `line-height-tight` | 1.2 | Headers (H1-H6), tight spacing |
| `line-height-normal` | 1.5 | Body text (default), optimal readability |
| `line-height-relaxed` | 1.8 | Long-form content, documentation |

**Guidelines**:
- **Headers**: Use `1.2` to maintain visual density
- **Body text**: Use `1.5` for comfortable reading
- **Long-form**: Use `1.8` for reduced eye strain

**CLI Line Height**:
- Terminal line height is **fixed** (typically 1.2-1.4)
- Not customizable in Go/Bubble Tea
- Design for 1-2 line spacing between sections

---

## Letter Spacing (Tracking)

| Token | Value | Use Case |
|-------|-------|----------|
| `letter-spacing-tighter` | -0.05em | Large headers (H1-H2) |
| `letter-spacing-tight` | -0.025em | Medium headers (H3-H4) |
| `letter-spacing-normal` | 0 | Body text (default) |
| `letter-spacing-wide` | 0.025em | Buttons, labels (all caps) |
| `letter-spacing-wider` | 0.05em | Emphasized all caps text |

**Guidelines**:
- **Large headers**: Tighten slightly (-0.05em) for visual balance
- **Body text**: No adjustment (0)
- **All caps**: Increase spacing (0.025em) for legibility
- **Japanese text**: No letter-spacing (always use 0)

---

## Typography Patterns

### Heading System

#### H1 (Hero)

```css
h1, .text-h1 {
  font-size: var(--font-size-6xl);      /* 60px / 3.75rem */
  font-weight: var(--font-weight-black); /* 900 */
  line-height: var(--line-height-tight); /* 1.2 */
  letter-spacing: var(--letter-spacing-tighter); /* -0.05em */
  color: var(--color-text-primary);      /* #ffffff */
}
```

**Use case**: Page hero, landing page title

#### H2 (Section Title)

```css
h2, .text-h2 {
  font-size: var(--font-size-5xl);      /* 48px / 3rem */
  font-weight: var(--font-weight-black); /* 900 */
  line-height: var(--line-height-tight); /* 1.2 */
  letter-spacing: var(--letter-spacing-tighter); /* -0.05em */
  color: var(--color-accent-primary);    /* #d94f90 */
}
```

**Use case**: Dashboard title, main section headers

#### H3 (Subsection Title)

```css
h3, .text-h3 {
  font-size: var(--font-size-4xl);      /* 36px / 2.25rem */
  font-weight: var(--font-weight-bold); /* 700 */
  line-height: var(--line-height-tight); /* 1.2 */
  letter-spacing: var(--letter-spacing-tight); /* -0.025em */
  color: var(--color-text-primary);      /* #ffffff */
}
```

**Use case**: Card titles, modal headers

#### H4-H6 (Smaller Headers)

```css
h4, .text-h4 {
  font-size: var(--font-size-3xl);      /* 30px / 1.875rem */
  font-weight: var(--font-weight-bold); /* 700 */
  line-height: var(--line-height-normal); /* 1.5 */
  color: var(--color-text-primary);
}

h5, .text-h5 {
  font-size: var(--font-size-2xl);      /* 24px / 1.5rem */
  font-weight: var(--font-weight-semibold); /* 600 */
  line-height: var(--line-height-normal);
  color: var(--color-text-primary);
}

h6, .text-h6 {
  font-size: var(--font-size-xl);       /* 20px / 1.25rem */
  font-weight: var(--font-weight-semibold); /* 600 */
  line-height: var(--line-height-normal);
  color: var(--color-text-secondary);    /* 70% opacity */
}
```

### Body Text

#### Default Body

```css
body, p, .text-base {
  font-size: var(--font-size-base);      /* 16px / 1rem */
  font-weight: var(--font-weight-normal); /* 400 */
  line-height: var(--line-height-normal); /* 1.5 */
  color: var(--color-text-primary);       /* #ffffff */
}
```

#### Small Text

```css
.text-sm {
  font-size: var(--font-size-sm);        /* 14px / 0.875rem */
  font-weight: var(--font-weight-normal); /* 400 */
  line-height: var(--line-height-normal); /* 1.5 */
  color: var(--color-text-secondary);     /* 70% opacity */
}
```

#### Captions/Metadata

```css
.text-xs {
  font-size: var(--font-size-xs);        /* 12px / 0.75rem */
  font-weight: var(--font-weight-normal); /* 400 */
  line-height: var(--line-height-normal); /* 1.5 */
  color: var(--color-text-tertiary);      /* 50% opacity */
}
```

### Labels & Inputs

```css
label, .text-label {
  font-size: var(--font-size-sm);        /* 14px */
  font-weight: var(--font-weight-medium); /* 500 */
  line-height: var(--line-height-normal);
  color: var(--color-text-primary);
  letter-spacing: var(--letter-spacing-normal);
}
```

### Buttons

```css
button, .btn {
  font-size: var(--font-size-base);      /* 16px */
  font-weight: var(--font-weight-semibold); /* 600 */
  line-height: var(--line-height-tight);  /* 1.2 */
  letter-spacing: var(--letter-spacing-wide); /* 0.025em */
  text-transform: none;  /* Preserve original case */
}
```

---

## Japanese Typography

### Kanji/Kana Rendering

**Font Stack for Mixed Text**:
```css
body {
  font-family:
    -apple-system, BlinkMacSystemFont,
    'Hiragino Sans', 'Yu Gothic',
    'Segoe UI', Roboto, sans-serif;
}
```

**Line Height Considerations**:
- Japanese characters have **larger vertical height** than Latin
- Use `line-height: 1.8` for Japanese-heavy text
- Default `1.5` is acceptable for mixed English/Japanese

**Font Weight Limitations**:
- Many Japanese fonts only support **400 (normal)** and **700 (bold)**
- Avoid using 500, 600, 900 for Japanese-only text
- System will fall back to closest available weight

### Corruption Text Styling

```css
.corrupted-text {
  font-size: inherit;        /* Match surrounding text */
  font-weight: inherit;      /* Match surrounding weight */
  color: var(--color-corruption-magenta); /* Pink for Katakana */
}

.corrupted-text.kanji {
  color: var(--color-corruption-purple);  /* Purple for Kanji */
  font-weight: 700;           /* Make Kanji bold for emphasis */
}

.corrupted-text.romaji {
  color: var(--color-corruption-cyan);    /* Cyan for Romaji */
  font-style: italic;         /* Optional: italicize Romaji */
}
```

---

## CLI (Terminal) Typography

### Terminal Font Constraints

**Font Family**:
- **Not customizable** by application
- User sets terminal font (SF Mono, Consolas, etc.)
- Celeste CLI works with any monospace font

**Font Size**:
- **Not customizable** by application
- User sets terminal font size (10pt-16pt typical)
- Design for 12pt-14pt as baseline

**UTF-8 Encoding**:
- **REQUIRED** for Japanese characters
- Set in terminal preferences: `export LANG=en_US.UTF-8`
- Celeste CLI validates encoding on startup

### Terminal Text Hierarchy

**Dashboard Headers** (use ANSI bold + color):
```go
style := lipgloss.NewStyle().
    Bold(true).
    Foreground(lipgloss.Color("#d94f90"))
```

**Section Headers** (uppercase + block characters):
```
█ LIFETIME CORRUPTION:
```

**Body Text** (default terminal style):
```go
style := lipgloss.NewStyle().
    Foreground(lipgloss.Color("#ffffff"))
```

**Metadata** (dimmed/gray):
```go
style := lipgloss.NewStyle().
    Foreground(lipgloss.Color("240"))  // ANSI gray
```

---

## Responsive Typography

### Mobile (320px-640px)

```css
@media (max-width: 640px) {
  html {
    font-size: 14px;  /* Base = 14px */
  }

  h1 { font-size: 2rem; }    /* 28px instead of 60px */
  h2 { font-size: 1.5rem; }  /* 21px instead of 48px */
  h3 { font-size: 1.25rem; } /* 17.5px instead of 36px */

  body {
    line-height: 1.6;  /* Slightly more spacing for mobile */
  }
}
```

### Tablet (641px-1024px)

```css
@media (min-width: 641px) and (max-width: 1024px) {
  html {
    font-size: 15px;  /* Base = 15px */
  }

  h1 { font-size: 3rem; }    /* 45px */
  h2 { font-size: 2.5rem; }  /* 37.5px */
  h3 { font-size: 2rem; }    /* 30px */
}
```

### Desktop (1025px+)

```css
@media (min-width: 1025px) {
  html {
    font-size: 16px;  /* Base = 16px (default) */
  }

  /* Use default font-size-* tokens */
}
```

---

## Accessibility

### Font Size Minimum

**WCAG Success Criterion 1.4.4** (Resize Text):
- Text must be resizable up to **200%** without loss of content
- Use `rem` or `em` units (NOT fixed `px`)
- Celeste complies: All sizes use `rem` units

### Contrast Requirements

See `COLOR_SYSTEM.md` for full contrast specifications.

**Summary**:
- ✅ White text on `#0a0612`: **21:1** (AAA)
- ✅ All accent colors on dark bg: **>4.5:1** (AA minimum)

### Line Length

**Optimal readability**: 45-75 characters per line

**Implementation**:
```css
.content-block {
  max-width: 65ch;  /* ~65 characters */
  margin: 0 auto;
}
```

### Font Smoothing (Web)

```css
body {
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-rendering: optimizeLegibility;
}
```

---

## CSS Implementation

### Complete Typography System

```css
:root {
  /* Font Families */
  --font-family-base: -apple-system, BlinkMacSystemFont, 'Segoe UI',
                      Roboto, 'Hiragino Sans', 'Yu Gothic',
                      'Helvetica Neue', Arial, sans-serif;
  --font-family-japanese: 'Hiragino Sans', 'Yu Gothic', 'Meiryo',
                          'MS PGothic', sans-serif;
  --font-family-monospace: 'SF Mono', 'Monaco', 'Consolas',
                           'Liberation Mono', monospace;

  /* Font Sizes */
  --font-size-xs: 0.75rem;
  --font-size-sm: 0.875rem;
  --font-size-base: 1rem;
  --font-size-lg: 1.125rem;
  --font-size-xl: 1.25rem;
  --font-size-2xl: 1.5rem;
  --font-size-3xl: 1.875rem;
  --font-size-4xl: 2.25rem;
  --font-size-5xl: 3rem;
  --font-size-6xl: 3.75rem;

  /* Font Weights */
  --font-weight-normal: 400;
  --font-weight-medium: 500;
  --font-weight-semibold: 600;
  --font-weight-bold: 700;
  --font-weight-black: 900;

  /* Line Heights */
  --line-height-tight: 1.2;
  --line-height-normal: 1.5;
  --line-height-relaxed: 1.8;

  /* Letter Spacing */
  --letter-spacing-tighter: -0.05em;
  --letter-spacing-tight: -0.025em;
  --letter-spacing-normal: 0;
  --letter-spacing-wide: 0.025em;
  --letter-spacing-wider: 0.05em;
}

/* Base Styles */
body {
  font-family: var(--font-family-base);
  font-size: var(--font-size-base);
  font-weight: var(--font-weight-normal);
  line-height: var(--line-height-normal);
  color: var(--color-text-primary);
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

/* Headings */
h1 {
  font-size: var(--font-size-6xl);
  font-weight: var(--font-weight-black);
  line-height: var(--line-height-tight);
  letter-spacing: var(--letter-spacing-tighter);
  color: var(--color-text-primary);
}

h2 {
  font-size: var(--font-size-5xl);
  font-weight: var(--font-weight-black);
  line-height: var(--line-height-tight);
  letter-spacing: var(--letter-spacing-tighter);
  color: var(--color-accent-primary);
}

h3 {
  font-size: var(--font-size-4xl);
  font-weight: var(--font-weight-bold);
  line-height: var(--line-height-tight);
  letter-spacing: var(--letter-spacing-tight);
  color: var(--color-text-primary);
}

/* Body */
p {
  font-size: var(--font-size-base);
  font-weight: var(--font-weight-normal);
  line-height: var(--line-height-normal);
  color: var(--color-text-primary);
}

/* Code/Monospace */
code, pre {
  font-family: var(--font-family-monospace);
  font-size: 0.9em;
}
```

---

## Related Documents

- **BRAND_OVERVIEW.md** - High-level brand identity
- **DESIGN_TOKENS.md** - Complete token system
- **COLOR_SYSTEM.md** - Color palette with WCAG compliance
- **ACCESSIBILITY.md** - Complete accessibility guidelines

---

**Status**: ✅ **TYPOGRAPHY SYSTEM COMPLETE** - Ready for implementation
