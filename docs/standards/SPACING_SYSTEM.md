# Spacing System

> **Celeste Brand System** | Standards Documentation
> **Document**: 8-Point Spacing Scale and Layout Guidelines
> **Version**: 1.0.0
> **Last Updated**: 2025-12-13

---

## Table of Contents

1. [Overview](#overview)
2. [8-Point Scale](#8-point-scale)
3. [Padding & Margin](#padding--margin)
4. [Vertical Rhythm](#vertical-rhythm)
5. [Grid System](#grid-system)
6. [Responsive Spacing](#responsive-spacing)
7. [CLI Spacing](#cli-spacing)
8. [Component Spacing](#component-spacing)

---

## Overview

Celeste uses an **8-point spacing scale** for consistent, harmonious layouts across all platforms. This mathematical approach creates visual rhythm and makes designs easier to implement.

### Spacing Philosophy

- **Predictable**: All spacing values are multiples of 4px or 8px
- **Scalable**: Spacing scales proportionally on larger screens
- **Consistent**: Same ratios across web and CLI
- **Accessible**: Sufficient touch target spacing (44px minimum)
- **Harmonious**: Visual rhythm through mathematical relationships

### Base Unit

```
Base Unit = 8px (0.5rem)
```

All spacing values derive from this base, ensuring visual consistency.

---

## 8-Point Scale

### Scale Definition

```css
:root {
  /* 8-point spacing scale */
  --spacing-0:   0;          /* 0px - No spacing */
  --spacing-xs:  0.25rem;    /* 4px - Minimal gap */
  --spacing-sm:  0.5rem;     /* 8px - Small gap */
  --spacing-md:  1rem;       /* 16px - Medium gap (base) */
  --spacing-lg:  1.5rem;     /* 24px - Large gap */
  --spacing-xl:  2rem;       /* 32px - Extra large */
  --spacing-2xl: 3rem;       /* 48px - Double extra large */
  --spacing-3xl: 4rem;       /* 64px - Triple extra large */
  --spacing-4xl: 6rem;       /* 96px - Section spacing */
  --spacing-5xl: 8rem;       /* 128px - Page spacing */
}
```

### Visual Reference

```
0px   │
4px   │■
8px   │■■
16px  │■■■■
24px  │■■■■■■
32px  │■■■■■■■■
48px  │■■■■■■■■■■■■
64px  │■■■■■■■■■■■■■■■■
96px  │■■■■■■■■■■■■■■■■■■■■■■■■
128px │■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■
```

### Usage Guidelines

| Size | Value | Use Case |
|------|-------|----------|
| **xs** | 4px | Icon-text gap, badge padding |
| **sm** | 8px | Button padding, list item gaps |
| **md** | 16px | Card padding, section spacing |
| **lg** | 24px | Container padding (mobile) |
| **xl** | 32px | Container padding (desktop) |
| **2xl** | 48px | Section spacing |
| **3xl** | 64px | Hero spacing |
| **4xl** | 96px | Page section spacing |
| **5xl** | 128px | Landing page sections |

---

## Padding & Margin

### Component Padding

```css
/* Button padding */
.btn {
  padding: var(--spacing-sm) var(--spacing-md);  /* 8px 16px */
}

.btn-large {
  padding: var(--spacing-md) var(--spacing-xl);  /* 16px 32px */
}

/* Card padding */
.glass-card {
  padding: var(--spacing-xl);  /* 32px all sides */
}

.glass-card-compact {
  padding: var(--spacing-md);  /* 16px all sides */
}

/* Input padding */
.input {
  padding: var(--spacing-sm) var(--spacing-md);  /* 8px 16px */
}
```

### Margin Relationships

```css
/* Stack elements vertically */
.section {
  margin-bottom: var(--spacing-2xl);  /* 48px between sections */
}

.section > * + * {
  margin-top: var(--spacing-lg);  /* 24px between elements */
}

/* Horizontal spacing (button groups) */
.btn + .btn {
  margin-left: var(--spacing-sm);  /* 8px gap */
}
```

### Container Padding

```css
/* Page container */
.container {
  padding: 0 var(--spacing-md);  /* 16px horizontal padding */
  max-width: 1200px;
  margin: 0 auto;
}

/* Responsive container padding */
@media (min-width: 641px) {
  .container {
    padding: 0 var(--spacing-xl);  /* 32px on tablet */
  }
}

@media (min-width: 1025px) {
  .container {
    padding: 0 var(--spacing-2xl);  /* 48px on desktop */
  }
}
```

---

## Vertical Rhythm

### Line Height Relationships

Typography line heights should maintain 8px rhythm:

```css
:root {
  /* Base line height: 24px (16px × 1.5) */
  --line-height-tight:  1.2;   /* 19.2px ≈ 20px */
  --line-height-normal: 1.5;   /* 24px ✓ (16px base) */
  --line-height-relaxed: 1.75; /* 28px ≈ 32px */
  --line-height-loose:  2;     /* 32px ✓ */
}

/* Body text */
body {
  font-size: 1rem;              /* 16px */
  line-height: var(--line-height-normal);  /* 24px - maintains rhythm */
}

/* Headings */
h1 {
  font-size: 3.75rem;           /* 60px */
  line-height: 1.2;             /* 72px (60 × 1.2) - 8px multiple ✓ */
  margin-bottom: var(--spacing-xl);  /* 32px */
}

h2 {
  font-size: 2.5rem;            /* 40px */
  line-height: 1.2;             /* 48px (40 × 1.2) - 8px multiple ✓ */
  margin-bottom: var(--spacing-lg);  /* 24px */
}
```

### Vertical Spacing Stack

```css
/* Consistent vertical spacing between elements */
.content > * + * {
  margin-top: var(--spacing-lg);  /* 24px default gap */
}

.content > h2 + * {
  margin-top: var(--spacing-md);  /* 16px after heading */
}

.content > p + p {
  margin-top: var(--spacing-md);  /* 16px between paragraphs */
}

/* Section spacing */
.section {
  padding-top: var(--spacing-4xl);     /* 96px */
  padding-bottom: var(--spacing-4xl);  /* 96px */
}
```

---

## Grid System

### 12-Column Grid (Optional)

```css
.grid {
  display: grid;
  gap: var(--spacing-md);  /* 16px gutter */
  grid-template-columns: repeat(12, 1fr);
}

/* Span utilities */
.col-1  { grid-column: span 1; }
.col-2  { grid-column: span 2; }
.col-3  { grid-column: span 3; }
.col-4  { grid-column: span 4; }
.col-6  { grid-column: span 6; }
.col-12 { grid-column: span 12; }

/* Responsive columns */
@media (max-width: 640px) {
  .col-1, .col-2, .col-3, .col-4, .col-6 {
    grid-column: span 12;  /* Full width on mobile */
  }
}
```

### Flexbox Spacing

```css
/* Equal spacing between flex items */
.flex-row {
  display: flex;
  gap: var(--spacing-md);  /* 16px gap (modern) */
}

/* Legacy browsers (no gap support) */
.flex-row-legacy {
  display: flex;
  margin: 0 calc(var(--spacing-md) * -0.5);  /* Negative margin trick */
}

.flex-row-legacy > * {
  margin: 0 calc(var(--spacing-md) * 0.5);  /* Restore spacing */
}
```

---

## Responsive Spacing

### Mobile-First Scaling

```css
/* Mobile: Compact spacing */
:root {
  --spacing-page:    var(--spacing-xl);   /* 32px */
  --spacing-section: var(--spacing-2xl);  /* 48px */
  --spacing-card:    var(--spacing-md);   /* 16px */
}

/* Tablet: Moderate spacing */
@media (min-width: 641px) {
  :root {
    --spacing-page:    var(--spacing-2xl);  /* 48px */
    --spacing-section: var(--spacing-3xl);  /* 64px */
    --spacing-card:    var(--spacing-lg);   /* 24px */
  }
}

/* Desktop: Generous spacing */
@media (min-width: 1025px) {
  :root {
    --spacing-page:    var(--spacing-3xl);  /* 64px */
    --spacing-section: var(--spacing-4xl);  /* 96px */
    --spacing-card:    var(--spacing-xl);   /* 32px */
  }
}

/* Usage */
.page {
  padding: var(--spacing-page);  /* Scales automatically */
}
```

### Viewport-Based Spacing (Advanced)

```css
/* Scale spacing with viewport width */
.hero {
  padding: clamp(
    var(--spacing-2xl),          /* Minimum: 48px */
    8vw,                         /* Preferred: 8% of viewport */
    var(--spacing-5xl)           /* Maximum: 128px */
  );
}
```

---

## CLI Spacing

### Line-Based Spacing

Terminal spacing uses **line counts** instead of pixels:

```go
// Vertical spacing (newlines)
const (
    SpacingNone   = 0  // No gap
    SpacingTight  = 1  // 1 line gap
    SpacingNormal = 2  // 2 line gap (default)
    SpacingLoose  = 3  // 3 line gap
    SpacingWide   = 5  // 5 line gap (sections)
)

// Horizontal spacing (characters)
const (
    PaddingNone   = 0  // No padding
    PaddingTight  = 1  // 1 char padding
    PaddingNormal = 2  // 2 char padding (default)
    PaddingWide   = 4  // 4 char padding
)
```

### CLI Spacing Examples

```go
// Vertical spacing between sections
func RenderSections(section1, section2 string) string {
    gap := strings.Repeat("\n", SpacingNormal)  // 2 newlines
    return section1 + gap + section2
}

// Horizontal padding (lipgloss)
style := lipgloss.NewStyle().
    Padding(1, 2)  // 1 line vertical, 2 chars horizontal
```

### CLI-to-Web Mapping

| CLI Spacing | Web Equivalent | Use Case |
|-------------|----------------|----------|
| 1 line | 16px (`--spacing-md`) | Between list items |
| 2 lines | 32px (`--spacing-xl`) | Between sections |
| 3 lines | 48px (`--spacing-2xl`) | Between major sections |
| 5 lines | 96px (`--spacing-4xl`) | Between pages |
| 1 char | 8px (`--spacing-sm`) | Compact padding |
| 2 chars | 16px (`--spacing-md`) | Normal padding |
| 4 chars | 32px (`--spacing-xl`) | Wide padding |

---

## Component Spacing

### Button Spacing

```css
/* Button internal spacing */
.btn {
  padding: var(--spacing-sm) var(--spacing-md);  /* 8px 16px */
  gap: var(--spacing-xs);  /* 4px between icon + text */
}

/* Button group spacing */
.btn-group {
  display: flex;
  gap: var(--spacing-sm);  /* 8px between buttons */
}

/* Stacked buttons (mobile) */
@media (max-width: 640px) {
  .btn-group {
    flex-direction: column;
    gap: var(--spacing-sm);  /* 8px vertical gap */
  }

  .btn {
    width: 100%;  /* Full width on mobile */
  }
}
```

### Card Spacing

```css
/* Card internal spacing */
.glass-card {
  padding: var(--spacing-xl);  /* 32px all sides */
}

.glass-card > * + * {
  margin-top: var(--spacing-md);  /* 16px between children */
}

/* Card grid spacing */
.card-grid {
  display: grid;
  gap: var(--spacing-lg);  /* 24px gutter */
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
}
```

### Form Spacing

```css
/* Form field spacing */
.form-group {
  margin-bottom: var(--spacing-lg);  /* 24px between fields */
}

.form-group label {
  display: block;
  margin-bottom: var(--spacing-xs);  /* 4px label-input gap */
}

/* Input internal spacing */
.input {
  padding: var(--spacing-sm) var(--spacing-md);  /* 8px 16px */
}

/* Form actions */
.form-actions {
  margin-top: var(--spacing-xl);  /* 32px above buttons */
  display: flex;
  gap: var(--spacing-sm);  /* 8px between buttons */
}
```

### Navigation Spacing

```css
/* Navbar spacing */
.navbar {
  padding: var(--spacing-md) var(--spacing-xl);  /* 16px 32px */
}

.navbar-links {
  display: flex;
  gap: var(--spacing-lg);  /* 24px between links */
}

/* Breadcrumb spacing */
.breadcrumb {
  display: flex;
  gap: var(--spacing-xs);  /* 4px around separator */
}
```

---

## Quick Reference

### Spacing Cheat Sheet

```css
/* Copy-paste ready spacing utilities */

/* Padding utilities */
.p-0  { padding: 0; }
.p-xs { padding: var(--spacing-xs); }
.p-sm { padding: var(--spacing-sm); }
.p-md { padding: var(--spacing-md); }
.p-lg { padding: var(--spacing-lg); }
.p-xl { padding: var(--spacing-xl); }

/* Margin utilities */
.m-0  { margin: 0; }
.m-xs { margin: var(--spacing-xs); }
.m-sm { margin: var(--spacing-sm); }
.m-md { margin: var(--spacing-md); }
.m-lg { margin: var(--spacing-lg); }
.m-xl { margin: var(--spacing-xl); }

/* Gap utilities (flexbox/grid) */
.gap-xs { gap: var(--spacing-xs); }
.gap-sm { gap: var(--spacing-sm); }
.gap-md { gap: var(--spacing-md); }
.gap-lg { gap: var(--spacing-lg); }
.gap-xl { gap: var(--spacing-xl); }
```

### Common Patterns

```css
/* Stack pattern (consistent vertical spacing) */
.stack > * + * {
  margin-top: var(--spacing-md);
}

/* Cluster pattern (horizontal spacing with wrapping) */
.cluster {
  display: flex;
  flex-wrap: wrap;
  gap: var(--spacing-sm);
}

/* Center pattern (centered content with side padding) */
.center {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 var(--spacing-xl);
}
```

---

## Related Documentation

- [DESIGN_TOKENS.md](../brand/DESIGN_TOKENS.md) - Spacing token specifications
- [TYPOGRAPHY.md](../brand/TYPOGRAPHY.md) - Line height and vertical rhythm
- [WEB_IMPLEMENTATION.md](../platforms/WEB_IMPLEMENTATION.md) - Responsive spacing examples
- [CLI_IMPLEMENTATION.md](../platforms/CLI_IMPLEMENTATION.md) - Terminal spacing patterns

---

**Last Updated**: 2025-12-13
**Version**: 1.0.0
**Base Unit**: 8px
**Maintainer**: Celeste Brand System
**Status**: ✅ Production Ready
