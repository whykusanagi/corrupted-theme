# Customization Guide

Learn how to customize the Corrupted Theme to match your brand.

## Quick Customizations

### Change Accent Color

Replace the pink accent with your brand color:

```css
:root {
  --accent: #your-color;
  --accent-light: #your-color-light;
  --accent-dark: #your-color-dark;
}
```

**Example: Blue theme**
```css
:root {
  --accent: #3b82f6;
  --accent-light: #60a5fa;
  --accent-dark: #1e40af;
  --gradient-accent: linear-gradient(135deg, #3b82f6 0%, #1e40af 100%);
}
```

### Change Background Colors

```css
:root {
  --bg: #your-bg-color;
  --bg-secondary: #your-secondary-bg;
  --glass: rgba(your, custom, rgba, 0.7);
  --glass-light: rgba(your, custom, rgba, 0.5);
}
```

### Change Text Colors

```css
:root {
  --text: #your-text-color;
  --text-secondary: #your-secondary-text;
  --text-muted: #your-muted-text;
}
```

## Spacing Customization

Override spacing variables:

```css
:root {
  --spacing-xs: 0.2rem;    /* Instead of 0.25rem */
  --spacing-sm: 0.4rem;    /* Instead of 0.5rem */
  --spacing-md: 0.8rem;    /* Instead of 1rem */
  --spacing-lg: 1.2rem;    /* Instead of 1.5rem */
  --spacing-xl: 1.6rem;    /* Instead of 2rem */
  --spacing-2xl: 2.4rem;   /* Instead of 3rem */
}
```

## Border Radius Customization

Change how rounded everything is:

```css
:root {
  --radius-sm: 2px;        /* Sharp corners */
  --radius-md: 4px;
  --radius-lg: 8px;
  --radius-xl: 12px;
  --radius-2xl: 16px;      /* Softer */
}
```

## Transition Speed

Adjust animation speeds globally:

```css
:root {
  --transition-fast: 0.1s ease;    /* Snappier */
  --transition-normal: 0.2s ease;  /* Faster */
  --transition-slow: 0.8s ease;    /* Slower */
}
```

## Complete Theme Override

Create an alternate theme for different sections:

```css
/* Dark theme (default) */
:root {
  --bg: #0a0a0a;
  --text: #f5f1f8;
  --accent: #d94f90;
}

/* Light theme */
@media (prefers-color-scheme: light) {
  :root {
    --bg: #ffffff;
    --text: #1a1a1a;
    --accent: #c41e3a;
    --glass: rgba(240, 240, 250, 0.7);
    --border: #e0e0e0;
  }
}

/* Brand colors for specific section */
.brand-section {
  --accent: #your-brand-color;
  --gradient-accent: linear-gradient(135deg, #your-brand-color 0%, #your-dark-brand 100%);
}
```

## Using Partial Imports

Don't need everything? Import only what you use:

```css
/* Get variables only */
@import './src/css/variables.css';

/* Get typography only */
@import './src/css/typography.css';

/* Get just glass effects */
@import './src/css/glassmorphism.css';

/* Get components but not animations */
@import './src/css/components.css';
```

## Creating Custom Components

### Method 1: Extend Existing Classes

```css
.my-special-card {
  @extend .card;
  background: var(--glass-light);
  border: 2px solid var(--accent);
  box-shadow: none;
}
```

### Method 2: Use Utility Classes

```html
<div class="glass p-xl rounded-xl shadow-lg flex-center gap-md">
  <img src="icon.svg" alt="">
  <div>
    <h3>Custom Component</h3>
    <p class="text-secondary">Built with utilities</p>
  </div>
</div>
```

### Method 3: New CSS with Variables

```css
.my-button {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 1rem 2rem;
  background: var(--gradient-accent);
  color: var(--text);
  border: 1px solid var(--border);
  border-radius: var(--radius-lg);
  cursor: pointer;
  transition: all var(--transition-normal) var(--transition-easing);
}

.my-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 24px var(--accent-dark);
}
```

## Typography Customization

### Change Font Family

```css
body {
  font-family: 'Your Font Name', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
}
```

### Adjust Heading Sizes

```css
h1 {
  font-size: 3rem;  /* Instead of 2.5rem */
  font-weight: 800; /* Instead of 700 */
}

h2 {
  font-size: 2.25rem;  /* Instead of 2rem */
}
```

### Change Line Heights

```css
:root {
  /* Add custom line height variable */
  --line-height-tight: 1.2;
  --line-height-normal: 1.5;
  --line-height-loose: 2;
}

body {
  line-height: var(--line-height-normal);
}
```

## Shadow Customization

Create custom shadow levels:

```css
:root {
  --shadow-sm: 0 2px 4px rgba(0, 0, 0, 0.1);
  --shadow-md: 0 4px 12px rgba(0, 0, 0, 0.15);
  --shadow-lg: 0 8px 24px rgba(0, 0, 0, 0.2);
  --shadow-xl: 0 16px 48px rgba(0, 0, 0, 0.3);
}

.card {
  box-shadow: var(--shadow-md);
}

.card:hover {
  box-shadow: var(--shadow-lg);
}
```

## Glass Effect Customization

### Change Blur Amount

```css
.frosted-card {
  backdrop-filter: blur(25px); /* Stronger blur */
}
```

### Change Glass Opacity

```css
:root {
  --glass: rgba(20, 12, 40, 0.85); /* More opaque */
  --glass-light: rgba(28, 18, 48, 0.7); /* More visible */
}
```

### Create Frosted Glass Variants

```css
.glass-strong {
  background: rgba(20, 12, 40, 0.95);
  backdrop-filter: blur(30px);
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.glass-subtle {
  background: rgba(20, 12, 40, 0.3);
  backdrop-filter: blur(5px);
  border: 1px solid rgba(255, 255, 255, 0.05);
}
```

## Animation Customization

### Disable Animations

For users who prefer reduced motion:

```css
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```

### Create Custom Animation

```css
@keyframes myCustomSlide {
  from {
    transform: translateX(-100px);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}

.my-animated-element {
  animation: myCustomSlide 0.6s ease-out;
}
```

## Dark Mode + Light Mode Setup

Create both themes automatically:

```css
/* Default dark theme */
:root {
  --bg: #0a0a0a;
  --text: #f5f1f8;
  --accent: #d94f90;
  --glass: rgba(20, 12, 40, 0.7);
}

/* Light mode override */
@media (prefers-color-scheme: light) {
  :root {
    --bg: #f8f8f8;
    --text: #1a1a1a;
    --accent: #c41e3a;
    --glass: rgba(240, 240, 250, 0.9);
    --border: #e0e0e0;
    --border-light: #d0d0d0;
  }
}

/* Manual toggle class */
body.light-mode {
  --bg: #f8f8f8;
  --text: #1a1a1a;
  --accent: #c41e3a;
  --glass: rgba(240, 240, 250, 0.9);
}
```

## Semantic Colors

Add your own semantic color system:

```css
:root {
  /* Semantic colors */
  --color-success: #10b981;
  --color-warning: #f59e0b;
  --color-error: #ef4444;
  --color-info: #3b82f6;

  /* Semantic backgrounds */
  --bg-success: rgba(16, 185, 129, 0.1);
  --bg-warning: rgba(245, 158, 11, 0.1);
  --bg-error: rgba(239, 68, 68, 0.1);
  --bg-info: rgba(59, 130, 246, 0.1);
}

.alert-success {
  color: var(--color-success);
  background: var(--bg-success);
  border-left: 4px solid var(--color-success);
}
```

## Variable Inheritance

Use variables inside variables:

```css
:root {
  /* Base colors */
  --primary-hue: 320deg;
  --primary-saturation: 65%;
  --primary-lightness: 48%;

  /* Computed colors */
  --accent: hsl(var(--primary-hue), var(--primary-saturation), var(--primary-lightness));
  --accent-light: hsl(var(--primary-hue), var(--primary-saturation), 58%);
  --accent-dark: hsl(var(--primary-hue), var(--primary-saturation), 38%);
}
```

## Testing Your Customizations

### Checklist

- [ ] Text contrast ratios meet WCAG AA (4.5:1 minimum)
- [ ] Buttons and interactive elements are clearly visible
- [ ] Hover states are distinct
- [ ] Animations perform smoothly (60fps)
- [ ] Mobile responsive at 320px, 768px, 1024px
- [ ] Dark mode and light mode (if using) both look good
- [ ] Glass effects don't become too transparent/opaque

---

For more advanced theming, see [COLOR_PALETTE.md](./COLOR_PALETTE.md)

Need help? Check [README.md](../README.md) or file an issue on GitHub.
