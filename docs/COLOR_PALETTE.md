# Color Palette Guide

## Overview

The Corrupted Theme uses a carefully designed color palette optimized for dark interfaces with distinctive pink/purple accents.

## Primary Colors

### Accent Pink
The main brand color used for interactive elements and highlights.

| Color | Hex | RGB | Use Case |
|-------|-----|-----|----------|
| **Accent** | `#d94f90` | `217, 79, 144` | Buttons, links, active states |
| **Accent Light** | `#e86ca8` | `232, 108, 168` | Hover states, highlights |
| **Accent Dark** | `#b61b70` | `182, 27, 112` | Pressed states, depth |

### CSS Variable Usage
```css
--accent: #d94f90;
--accent-light: #e86ca8;
--accent-dark: #b61b70;
```

### Example
```html
<button style="background: var(--accent)">Primary Button</button>
<a style="color: var(--accent-light)">Link on Hover</a>
```

## Background Colors

The background palette creates the dark, atmospheric aesthetic:

| Color | Hex | RGB | Use Case |
|-------|-----|-----|----------|
| **Dark Base** | `#0a0a0a` | `10, 10, 10` | Page background |
| **Secondary** | `#0f0f1a` | `15, 15, 26` | Alternative backgrounds |

### CSS Variables
```css
--bg: #0a0a0a;
--bg-secondary: #0f0f1a;
```

## Text Colors

Carefully chosen for readability on dark backgrounds:

| Color | Hex | RGB | Contrast | Use Case |
|-------|-----|-----|----------|----------|
| **Primary** | `#f5f1f8` | `245, 241, 248` | 17.5:1 | Main text |
| **Secondary** | `#b8afc8` | `184, 175, 200` | 9.2:1 | Supporting text |
| **Muted** | `#7a7085` | `122, 112, 133` | 5.5:1 | Disabled, subtle |

### CSS Variables
```css
--text: #f5f1f8;
--text-secondary: #b8afc8;
--text-muted: #7a7085;
```

### WCAG Compliance
- **Primary**: AAA compliant (17.5:1 contrast ratio)
- **Secondary**: AA compliant (9.2:1 contrast ratio)
- **Muted**: AA compliant for large text

## Glass Morphism Colors

Semi-transparent backgrounds for the glass effect:

| Variable | Color | Opacity | Use Case |
|----------|-------|---------|----------|
| **Glass** | `rgba(20, 12, 40, 0.7)` | 70% | Cards, containers |
| **Glass Light** | `rgba(28, 18, 48, 0.5)` | 50% | Lighter containers |

### CSS Variables
```css
--glass: rgba(20, 12, 40, 0.7);
--glass-light: rgba(28, 18, 48, 0.5);
```

## Border Colors

For creating depth and hierarchy:

| Color | Hex | RGB | Use Case |
|-------|-----|-----|----------|
| **Primary Border** | `#3a2555` | `58, 37, 85` | Default borders |
| **Light Border** | `#5a4575` | `90, 69, 117` | Emphasis, hover |

### CSS Variables
```css
--border: #3a2555;
--border-light: #5a4575;
```

## Gradients

Pre-defined gradients for visual interest:

### Accent Gradient
```css
--gradient-accent: linear-gradient(135deg, #d94f90 0%, #b61b70 100%);
```
Used for button backgrounds and gradient text effects.

### Purple Gradient
```css
--gradient-purple: linear-gradient(135deg, #8b5cf6 0%, #d94f90 100%);
```
Alternative gradient for secondary elements.

## Semantic Color Usage

### Success (Green)
```css
color: #22c55e;
background: rgba(34, 197, 94, 0.15);
border-color: rgba(34, 197, 94, 0.3);
```

### Warning (Amber)
```css
color: #eab308;
background: rgba(234, 179, 8, 0.15);
border-color: rgba(234, 179, 8, 0.3);
```

### Error (Red)
```css
color: #ef4444;
background: rgba(239, 68, 68, 0.15);
border-color: rgba(239, 68, 68, 0.3);
```

### Info (Blue)
```css
color: #3b82f6;
background: rgba(59, 130, 246, 0.15);
border-color: rgba(59, 130, 246, 0.3);
```

## Color Combinations

### Recommended Text/Background Pairs

| Text Color | Background | Contrast | WCAG |
|-----------|-----------|----------|------|
| `--text` | `--bg` | 17.5:1 | AAA ✓ |
| `--text-secondary` | `--glass` | 9.2:1 | AA ✓ |
| `--text-muted` | `--glass` | 5.5:1 | AA (large) ✓ |
| `--accent` | `--bg` | 7.2:1 | AA ✓ |

## Customization

### Override All Accent Colors

```css
:root {
  /* Change from pink to blue */
  --accent: #3b82f6;
  --accent-light: #60a5fa;
  --accent-dark: #1e40af;

  /* Update gradients */
  --gradient-accent: linear-gradient(135deg, #3b82f6 0%, #1e40af 100%);
}
```

### Override Text Colors

```css
:root {
  /* Increase contrast for accessibility */
  --text: #ffffff;
  --text-secondary: #e0e0e0;
  --text-muted: #808080;
}
```

### Override Background

```css
:root {
  /* Switch to slightly lighter dark theme */
  --bg: #0f0f0f;
  --bg-secondary: #1a1a2e;
  --glass: rgba(30, 30, 50, 0.7);
  --glass-light: rgba(40, 40, 60, 0.5);
}
```

## Opacity Levels

Used throughout the theme for layering:

| Level | Opacity | Use Case |
|-------|---------|----------|
| Subtle | 5-10% | Barely visible tints |
| Light | 15-25% | Subtle backgrounds |
| Medium | 50-70% | Glass effects |
| Dark | 80-95% | Overlays, modals |
| Solid | 100% | Full color |

## Dark Mode & Light Mode

Currently, the theme is optimized for dark mode. To create a light mode variant:

```css
/* Light mode override */
@media (prefers-color-scheme: light) {
  :root {
    --bg: #ffffff;
    --bg-secondary: #f5f5f5;
    --text: #1a1a1a;
    --text-secondary: #4a4a4a;
    --glass: rgba(240, 240, 250, 0.7);
    --border: #e0e0e0;
    --border-light: #d0d0d0;
  }
}
```

## Accessibility Notes

- All text colors meet WCAG AA standards minimum
- Primary text meets AAA standards
- Use semantic colors (success, warning, error) instead of relying solely on color
- Test color combinations for colorblind accessibility (deuteranopia, protanopia, tritanopia)

## Color Hex Reference

Quick copy-paste reference:

```
Primary Accent:    #d94f90
Accent Light:      #e86ca8
Accent Dark:       #b61b70
Dark Base:         #0a0a0a
Secondary BG:      #0f0f1a
Primary Text:      #f5f1f8
Secondary Text:    #b8afc8
Muted Text:        #7a7085
Primary Border:    #3a2555
Light Border:      #5a4575
```

---

Need to customize? See [CUSTOMIZATION.md](./CUSTOMIZATION.md) for advanced theming options.
