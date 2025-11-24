# CSS Variables Reference

Complete reference of all CSS custom properties in the Corrupted Theme.

## Quick Reference

All variables are defined in `src/css/variables.css` and available globally via `:root`.

```css
:root {
  /* Colors */
  --accent: #d94f90;
  --bg: #0a0a0a;
  --text: #f5f1f8;
  /* ... and more (see below) */
}
```

Use them anywhere in your CSS:

```css
.my-button {
  background: var(--accent);
  color: var(--text);
  padding: var(--spacing-md);
  border-radius: var(--radius-lg);
}
```

## Color Variables

### Accent Colors

Primary brand color used for interactive elements and highlights.

```css
--accent: #d94f90              /* Main accent color */
--accent-light: #e86ca8        /* Lighter variant for hover */
--accent-dark: #b61b70         /* Darker variant for active/pressed */
```

**Usage:**
```css
button {
  background: var(--accent);
}
button:hover {
  background: var(--accent-light);
}
button:active {
  background: var(--accent-dark);
}
```

### Background Colors

Base colors for page and container backgrounds.

```css
--bg: #0a0a0a                  /* Main page background */
--bg-secondary: #0f0f1a         /* Alternative background color */
```

**Usage:**
```css
body {
  background: var(--bg);
}
.sidebar {
  background: var(--bg-secondary);
}
```

### Text Colors

Font colors optimized for readability on dark backgrounds.

```css
--text: #f5f1f8                /* Primary text (AAA contrast) */
--text-secondary: #b8afc8      /* Secondary text (AA contrast) */
--text-muted: #7a7085          /* Muted text for subtle content */
```

**Usage:**
```css
h1, p {
  color: var(--text);
}
.subtitle {
  color: var(--text-secondary);
}
.disabled {
  color: var(--text-muted);
}
```

### Glass Effect Colors

Semi-transparent colors for frosted glass effects.

```css
--glass: rgba(20, 12, 40, 0.7)           /* Main glass background */
--glass-light: rgba(28, 18, 48, 0.5)     /* Lighter glass variant */
```

**Usage:**
```css
.glass-card {
  background: var(--glass);
  backdrop-filter: blur(15px);
}
.glass-overlay {
  background: var(--glass-light);
  backdrop-filter: blur(10px);
}
```

### Border Colors

Colors for borders and dividers.

```css
--border: #3a2555               /* Default border color */
--border-light: #5a4575         /* Lighter border for emphasis */
```

**Usage:**
```css
.card {
  border: 1px solid var(--border);
}
.card:hover {
  border-color: var(--border-light);
}
```

### Gradient Colors

Pre-defined gradients for visual interest.

```css
--gradient-accent: linear-gradient(135deg, #d94f90 0%, #b61b70 100%);
--gradient-purple: linear-gradient(135deg, #8b5cf6 0%, #d94f90 100%);
```

**Usage:**
```css
button {
  background: var(--gradient-accent);
}
h1 {
  background: var(--gradient-purple);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}
```

### Semantic Colors

Colors with specific meanings for user feedback.

```css
--color-success: #10b981        /* Green - success/valid */
--color-warning: #f59e0b        /* Amber - warning/caution */
--color-error: #ef4444          /* Red - error/invalid */
--color-info: #3b82f6           /* Blue - information/neutral */
```

**Usage:**
```css
.alert-success {
  color: var(--color-success);
  background: rgba(16, 185, 129, 0.1);
  border-color: var(--color-success);
}
```

## Spacing Variables

Consistent spacing scale following a 0.5rem (8px) base unit.

```css
--spacing-xs: 0.25rem;          /* 4px */
--spacing-sm: 0.5rem;           /* 8px */
--spacing-md: 1rem;             /* 16px */
--spacing-lg: 1.5rem;           /* 24px */
--spacing-xl: 2rem;             /* 32px */
--spacing-2xl: 3rem;            /* 48px */
```

**Usage:**
```css
button {
  padding: var(--spacing-sm) var(--spacing-md);
  margin: var(--spacing-md);
}
.container {
  padding: var(--spacing-lg);
  gap: var(--spacing-md);
}
```

**Spacing Scale Guide:**

| Variable | Size | Use Case |
|----------|------|----------|
| --spacing-xs | 4px | Tiny gaps, subtle spacing |
| --spacing-sm | 8px | Small padding, compact layouts |
| --spacing-md | 16px | Normal padding, standard gaps |
| --spacing-lg | 24px | Large padding, section spacing |
| --spacing-xl | 32px | Extra large spacing |
| --spacing-2xl | 48px | Massive spacing, major sections |

## Border Radius Variables

Consistent border radius scale for rounded corners.

```css
--radius-sm: 2px;               /* Minimal rounding */
--radius-md: 4px;               /* Small rounding */
--radius-lg: 8px;               /* Standard rounding */
--radius-xl: 12px;              /* Large rounding */
--radius-2xl: 16px;             /* Extra large rounding */
```

**Usage:**
```css
button {
  border-radius: var(--radius-lg);
}
.card {
  border-radius: var(--radius-xl);
}
input {
  border-radius: var(--radius-md);
}
```

**Rounding Scale Guide:**

| Variable | Radius | Use Case |
|----------|--------|----------|
| --radius-sm | 2px | Sharp corners, subtle rounding |
| --radius-md | 4px | Inputs, form elements |
| --radius-lg | 8px | Buttons, badges, tags |
| --radius-xl | 12px | Cards, containers |
| --radius-2xl | 16px | Large cards, hero sections |

## Transition Variables

Animation timing and easing functions.

```css
--transition-fast: 0.1s ease;           /* Snappy transitions (100ms) */
--transition-normal: 0.2s ease;         /* Normal transitions (200ms) */
--transition-slow: 0.8s ease;           /* Slow transitions (800ms) */
--transition-easing: cubic-bezier(0.4, 0, 0.2, 1);  /* Custom easing */
```

**Usage:**
```css
button {
  transition: all var(--transition-normal);
}
button:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(217, 79, 144, 0.4);
}

.fade-element {
  transition: opacity var(--transition-slow);
}
```

**Transition Timing Guide:**

| Variable | Duration | Use Case |
|----------|----------|----------|
| --transition-fast | 100ms | Micro-interactions, quick feedback |
| --transition-normal | 200ms | Standard state changes |
| --transition-slow | 800ms | Smooth animations, entrance effects |

## Z-Index Variables

Consistent layering system for controlling stacking context.

```css
--z-negative: -1;               /* Below page content */
--z-0: 0;                       /* Default stacking */
--z-1: 1;                       /* Content layer */
--z-10: 10;                     /* Floating elements */
--z-dropdown: 100;              /* Dropdowns, popovers */
--z-sticky: 200;                /* Sticky headers, footers */
--z-modal: 300;                 /* Modal overlays */
--z-toast: 400;                 /* Toast notifications */
--z-tooltip: 500;               /* Tooltips (topmost) */
```

**Usage:**
```css
.header {
  z-index: var(--z-sticky);     /* Above most content */
}
.modal {
  z-index: var(--z-modal);      /* High stacking */
}
.tooltip {
  z-index: var(--z-tooltip);    /* Highest priority */
}
```

**Z-Index Scale Guide:**

| Variable | Value | Use Case |
|----------|-------|----------|
| --z-negative | -1 | Background elements |
| --z-0 | 0 | Default stacking |
| --z-1 | 1 | Content on top of backgrounds |
| --z-10 | 10 | Floating cards, badges |
| --z-dropdown | 100 | Dropdowns, popovers |
| --z-sticky | 200 | Sticky headers, fixed navbars |
| --z-modal | 300 | Modal overlays, dialogs |
| --z-toast | 400 | Toast notifications |
| --z-tooltip | 500 | Tooltips (always on top) |

## Shadow Variables

Pre-defined box-shadow values for depth.

```css
--shadow-sm: 0 2px 4px rgba(0, 0, 0, 0.1);
--shadow-md: 0 4px 12px rgba(0, 0, 0, 0.15);
--shadow-lg: 0 8px 24px rgba(0, 0, 0, 0.2);
--shadow-xl: 0 16px 48px rgba(0, 0, 0, 0.3);
```

**Usage:**
```css
.card {
  box-shadow: var(--shadow-md);
}
.card:hover {
  box-shadow: var(--shadow-lg);
}
.modal {
  box-shadow: var(--shadow-xl);
}
```

## Font Variables

Typography-related variables.

```css
--font-family-base: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
--font-size-base: 1rem;         /* 16px */
--font-weight-normal: 400;
--font-weight-semibold: 600;
--font-weight-bold: 700;
--line-height-tight: 1.2;
--line-height-normal: 1.6;
--line-height-loose: 2;
```

**Usage:**
```css
body {
  font-family: var(--font-family-base);
  font-size: var(--font-size-base);
  line-height: var(--line-height-normal);
}
h1 {
  font-weight: var(--font-weight-bold);
  line-height: var(--line-height-tight);
}
```

## Creating Custom Variables

Extend the theme with your own variables:

### In HTML (Global Override)

```html
<style>
  :root {
    /* Add custom variables */
    --my-color: #ff6b9d;
    --my-spacing: 2.5rem;
    --my-animation-duration: 0.5s;
  }
</style>
<link rel="stylesheet" href="path/to/theme.css">
```

### In CSS Files

```css
:root {
  --custom-primary: #3b82f6;
  --custom-secondary: #8b5cf6;
}
```

### Component-Specific Variables

```css
.my-component {
  --component-bg: var(--glass);
  --component-color: var(--text);
  --component-padding: var(--spacing-lg);

  background: var(--component-bg);
  color: var(--component-color);
  padding: var(--component-padding);
}
```

## Variable Inheritance

Variables can reference other variables:

```css
:root {
  /* Base hue */
  --primary-hue: 320deg;
  --primary-saturation: 65%;
  --primary-lightness: 48%;

  /* Computed colors */
  --accent: hsl(var(--primary-hue), var(--primary-saturation), var(--primary-lightness));
  --accent-light: hsl(var(--primary-hue), var(--primary-saturation), 58%);
  --accent-dark: hsl(var(--primary-hue), var(--primary-saturation), 38%);
}
```

**Advantages:**
- Change one variable to update all related values
- Create consistent color systems
- Reduce duplication

## Responsive Variables

Some projects implement responsive spacing variables:

```css
:root {
  /* Mobile-first */
  --spacing-md: 1rem;
  --font-size-h1: 1.75rem;
}

@media (min-width: 768px) {
  :root {
    /* Tablet and up */
    --spacing-md: 1.5rem;
    --font-size-h1: 2.5rem;
  }
}

@media (min-width: 1024px) {
  :root {
    /* Desktop and up */
    --spacing-md: 2rem;
    --font-size-h1: 3rem;
  }
}
```

## Variable Fallbacks

Always provide fallbacks for older browsers:

```css
.button {
  background: var(--accent, #d94f90);  /* Fallback if variable not supported */
  padding: var(--spacing-md, 1rem);   /* Fallback if variable not defined */
}
```

## Browser Support

CSS custom properties (CSS variables) are supported in:

- Chrome 49+
- Firefox 31+
- Safari 9.1+
- Edge 15+
- Opera 36+
- iOS Safari 9.3+
- Android Browser 62+

**No support:** Internet Explorer

## Performance Notes

CSS variables have minimal performance impact:

- **Rendering:** No slower than regular CSS values
- **Specificity:** Variables don't affect specificity
- **Cascade:** Variables respect normal CSS cascade
- **Inheritance:** Variables inherit to child elements
- **JavaScript:** Can be accessed and modified via JS

```javascript
// Read variable
const accentColor = getComputedStyle(document.documentElement)
  .getPropertyValue('--accent')
  .trim(); // '#d94f90'

// Write variable
document.documentElement.style.setProperty('--accent', '#3b82f6');

// Reset variable
document.documentElement.style.removeProperty('--accent');
```

## Migration from Hardcoded Values

If migrating existing CSS to use variables:

**Before:**
```css
button {
  background: #d94f90;
  padding: 1rem 1.5rem;
  border-radius: 8px;
  color: #f5f1f8;
}
```

**After:**
```css
button {
  background: var(--accent);
  padding: var(--spacing-md) var(--spacing-lg);
  border-radius: var(--radius-lg);
  color: var(--text);
}
```

**Benefits:**
- Consistent theming
- Easy customization
- Reduced code duplication
- Better maintenance

---

See [CUSTOMIZATION.md](./CUSTOMIZATION.md) for examples of customizing variables for your brand.
