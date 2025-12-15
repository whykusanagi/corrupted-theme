# NPM Package Guide

> **Celeste Brand System** | Platform Documentation
> **Document**: @whykusanagi/corrupted-theme NPM Package
> **Version**: 1.0.0
> **Last Updated**: 2025-12-13

---

## Table of Contents

1. [Overview](#overview)
2. [Installation](#installation)
3. [Import Methods](#import-methods)
4. [Package Structure](#package-structure)
5. [Design Tokens](#design-tokens)
6. [Theming & Customization](#theming--customization)
7. [Framework Integration](#framework-integration)
8. [Build Configuration](#build-configuration)
9. [Version Management](#version-management)
10. [Migration Guide](#migration-guide)

---

## Overview

**@whykusanagi/corrupted-theme** is the official CSS framework for the Celeste brand system, providing a complete implementation of the translation-failure corruption aesthetic with glassmorphism design.

### Package Information

```json
{
  "name": "@whykusanagi/corrupted-theme",
  "version": "0.1.2",
  "description": "Premium corrupted AI aesthetic with glassmorphism and translation-failure linguistics",
  "author": "Kusanagi <you@example.com>",
  "license": "MIT",
  "repository": {
    "type": "git",
    "url": "https://github.com/whykusanagi/corrupted-theme"
  }
}
```

### Features

- ✅ **4,692 lines** of production-ready CSS
- ✅ **9 modular files** for selective imports
- ✅ **56 components** covering all common UI patterns
- ✅ **Design tokens** as CSS custom properties
- ✅ **Responsive design** (mobile-first, 3 breakpoints)
- ✅ **WCAG AA accessible** (tested contrast ratios)
- ✅ **Framework agnostic** (React, Vue, Svelte, vanilla)
- ✅ **8.2KB gzipped** (full theme)
- ✅ **Zero dependencies** (pure CSS)

---

## Installation

### NPM

```bash
npm install @whykusanagi/corrupted-theme
```

### Yarn

```bash
yarn add @whykusanagi/corrupted-theme
```

### PNPM

```bash
pnpm add @whykusanagi/corrupted-theme
```

### CDN (Unpkg)

```html
<!-- Full theme (8.2KB gzipped) -->
<link rel="stylesheet" href="https://unpkg.com/@whykusanagi/corrupted-theme@0.1.2/dist/theme.css">
```

### Local Development

For local development or contributing:

```bash
# Clone repository
git clone https://github.com/whykusanagi/corrupted-theme.git
cd corrupted-theme

# Install dependencies
npm install

# Build CSS
npm run build

# Watch mode (development)
npm run dev

# Link for local testing
npm link

# In your project
npm link @whykusanagi/corrupted-theme
```

---

## Import Methods

### Method 1: Full Theme (Simplest)

Import the complete pre-bundled theme (includes all modules):

```javascript
// React/Next.js
import '@whykusanagi/corrupted-theme/dist/theme.css';

// Vue
import '@whykusanagi/corrupted-theme/dist/theme.css';

// Vanilla HTML
<link rel="stylesheet" href="node_modules/@whykusanagi/corrupted-theme/dist/theme.css">
```

**Size**: 8.2KB gzipped
**Best for**: Quick prototyping, small projects, simple sites

---

### Method 2: Modular Imports (Optimized)

Import only the modules you need for smaller bundle size:

```javascript
// Import in specific order (CRITICAL - see Import Order below)
import '@whykusanagi/corrupted-theme/src/css/variables.css';  // Required first
import '@whykusanagi/corrupted-theme/src/css/base.css';       // Resets
import '@whykusanagi/corrupted-theme/src/css/glass.css';      // Glassmorphism
import '@whykusanagi/corrupted-theme/src/css/components.css'; // UI components
```

**Size**: 2.1KB - 8.2KB (depending on modules)
**Best for**: Production apps, tree-shaking, performance optimization

---

### Method 3: Direct Source (Advanced)

Import raw CSS for custom builds with PostCSS:

```javascript
// Import source files (requires PostCSS setup)
import '@whykusanagi/corrupted-theme/src/css/variables.css';
import '@whykusanagi/corrupted-theme/src/css/components.css';

// PostCSS will process:
// - CSS nesting
// - Custom properties
// - Autoprefixer
// - Minification
```

**Best for**: Custom build pipelines, advanced optimization, hybrid frameworks

---

## Package Structure

### File Organization

```
@whykusanagi/corrupted-theme/
├── dist/                          # Compiled output (use in production)
│   ├── theme.css                  # Full bundle (8.2KB gzipped)
│   └── theme.min.css              # Minified (7.8KB gzipped)
├── src/
│   └── css/                       # Source files (modular imports)
│       ├── variables.css          # Design tokens (73 lines)
│       ├── base.css               # Resets, typography (210 lines)
│       ├── animations.css         # Keyframe animations (180 lines)
│       ├── glass.css              # Glassmorphism effects (140 lines)
│       ├── layout.css             # Grid, flexbox utilities (95 lines)
│       ├── components.css         # UI components (2,800 lines)
│       ├── interactive.css        # Hover/focus states (480 lines)
│       ├── utilities.css          # Helper classes (320 lines)
│       └── theme.css              # Main entry (imports all)
├── tokens/                        # Design tokens (future)
│   ├── design-tokens.json         # W3C DTCG format (planned)
│   ├── tokens.css                 # Generated CSS variables (planned)
│   └── tokens.ts                  # TypeScript types (planned)
├── examples/                      # Usage examples
│   ├── vanilla/                   # Plain HTML/CSS/JS
│   ├── react/                     # React examples
│   └── vue/                       # Vue examples
├── docs/                          # Package documentation
│   ├── COMPONENTS_REFERENCE.md    # Component API docs
│   └── MIGRATION.md               # Upgrade guides
├── package.json
└── README.md
```

### Import Order (CRITICAL)

CSS files **must** be imported in this order to ensure proper cascading:

```javascript
// 1. Variables (ALWAYS FIRST)
import '@whykusanagi/corrupted-theme/src/css/variables.css';

// 2. Base (resets, defaults)
import '@whykusanagi/corrupted-theme/src/css/base.css';

// 3. Animations (used by components)
import '@whykusanagi/corrupted-theme/src/css/animations.css';

// 4. Glass effects (backdrop-filter setup)
import '@whykusanagi/corrupted-theme/src/css/glass.css';

// 5. Layout (grid, containers)
import '@whykusanagi/corrupted-theme/src/css/layout.css';

// 6. Components (UI elements)
import '@whykusanagi/corrupted-theme/src/css/components.css';

// 7. Interactive states (hover, focus)
import '@whykusanagi/corrupted-theme/src/css/interactive.css';

// 8. Utilities (last to override)
import '@whykusanagi/corrupted-theme/src/css/utilities.css';
```

**Why order matters**:
- Variables must load before any styles that reference them
- Base styles must apply before components
- Utilities must override component defaults

---

## Design Tokens

### CSS Custom Properties

All design tokens are exposed as CSS custom properties in `variables.css`:

```css
:root {
  /* Colors */
  --color-accent: #d94f90;
  --color-accent-light: #e86ca8;
  --color-accent-dark: #b61b70;
  --color-secondary-purple: #8b5cf6;
  --color-secondary-cyan: #00d4ff;

  /* Backgrounds */
  --color-bg-dark: #0a0612;
  --color-bg-medium: #140c28;
  --color-bg-light: #1c1230;

  /* Glass effects */
  --glass-bg: rgba(20, 12, 40, 0.7);
  --glass-bg-light: rgba(28, 18, 48, 0.5);
  --glass-bg-darker: rgba(10, 6, 18, 0.8);
  --glass-blur: 15px;
  --glass-blur-light: 10px;
  --glass-blur-heavy: 20px;

  /* Spacing (8pt scale) */
  --spacing-xs: 0.25rem;   /* 4px */
  --spacing-sm: 0.5rem;    /* 8px */
  --spacing-md: 1rem;      /* 16px */
  --spacing-lg: 1.5rem;    /* 24px */
  --spacing-xl: 2rem;      /* 32px */
  --spacing-2xl: 3rem;     /* 48px */

  /* Typography */
  --font-family-base: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto,
                      'Hiragino Sans', 'Yu Gothic', sans-serif;
  --font-size-xs: 0.75rem;     /* 12px */
  --font-size-sm: 0.875rem;    /* 14px */
  --font-size-base: 1rem;      /* 16px */
  --font-size-lg: 1.125rem;    /* 18px */
  --font-size-xl: 1.25rem;     /* 20px */
  --font-size-2xl: 1.5rem;     /* 24px */
  --font-size-3xl: 2rem;       /* 32px */
  --font-size-4xl: 2.5rem;     /* 40px */
  --font-size-5xl: 3.75rem;    /* 60px */

  /* Border radius */
  --radius-sm: 4px;
  --radius-md: 8px;
  --radius-lg: 12px;
  --radius-xl: 16px;
  --radius-full: 9999px;

  /* Shadows */
  --shadow-sm: 0 1px 2px rgba(217, 79, 144, 0.1);
  --shadow-md: 0 4px 8px rgba(217, 79, 144, 0.15);
  --shadow-lg: 0 8px 16px rgba(217, 79, 144, 0.2);
  --shadow-xl: 0 12px 24px rgba(217, 79, 144, 0.25);

  /* Transitions */
  --transition-fast: 0.15s ease;
  --transition-normal: 0.3s ease;
  --transition-slow: 0.5s ease;

  /* Z-index scale */
  --z-dropdown: 1000;
  --z-modal: 1050;
  --z-popover: 1100;
  --z-tooltip: 1200;
}
```

### Using Design Tokens

```css
/* Reference tokens in your custom CSS */
.custom-card {
  background: var(--glass-bg);
  backdrop-filter: blur(var(--glass-blur));
  border: 1px solid var(--color-accent);
  border-radius: var(--radius-lg);
  padding: var(--spacing-xl);
  box-shadow: var(--shadow-lg);
  transition: transform var(--transition-fast);
}

.custom-card:hover {
  transform: translateY(-4px);
  box-shadow: var(--shadow-xl);
}
```

### Programmatic Access (JavaScript)

```javascript
// Read design tokens in JavaScript
const styles = getComputedStyle(document.documentElement);

const accentColor = styles.getPropertyValue('--color-accent');  // "#d94f90"
const spacingMd = styles.getPropertyValue('--spacing-md');      // "1rem"
const transitionFast = styles.getPropertyValue('--transition-fast'); // "0.15s ease"

console.log(`Accent color: ${accentColor}`);

// Modify tokens at runtime (theming)
document.documentElement.style.setProperty('--color-accent', '#8b5cf6');  // Change to purple
```

---

## Theming & Customization

### Override Default Tokens

Create a custom theme by overriding CSS variables:

```css
/* custom-theme.css */
:root {
  /* Change primary color from pink to purple */
  --color-accent: #8b5cf6;
  --color-accent-light: #a78bfa;
  --color-accent-dark: #7c3aed;

  /* Adjust glass opacity */
  --glass-bg: rgba(20, 12, 40, 0.85);  /* More opaque */

  /* Larger border radius */
  --radius-md: 12px;
  --radius-lg: 16px;

  /* Faster animations */
  --transition-normal: 0.2s ease;
}
```

```javascript
// Import order: theme THEN custom overrides
import '@whykusanagi/corrupted-theme/dist/theme.css';
import './custom-theme.css';  // Overrides
```

### Dark/Light Mode Toggle

```css
/* Light mode overrides */
[data-theme="light"] {
  --color-bg-dark: #f5f5f5;
  --color-bg-medium: #e5e5e5;
  --color-text-primary: #000000;
  --glass-bg: rgba(255, 255, 255, 0.7);
}

/* Dark mode (default) */
[data-theme="dark"] {
  /* Uses root defaults */
}
```

```javascript
// Toggle theme
function toggleTheme() {
  const current = document.documentElement.getAttribute('data-theme');
  const next = current === 'dark' ? 'light' : 'dark';
  document.documentElement.setAttribute('data-theme', next);
  localStorage.setProperty('theme', next);
}

// Persist theme
const savedTheme = localStorage.getItem('theme') || 'dark';
document.documentElement.setAttribute('data-theme', savedTheme);
```

### Component-Level Customization

```css
/* Override specific components */
.glass-card {
  /* Default theme provides base styles */

  /* Add custom properties */
  --card-padding: var(--spacing-2xl);  /* Larger padding */
  --card-radius: var(--radius-xl);     /* More rounded */

  padding: var(--card-padding);
  border-radius: var(--card-radius);
}

/* Custom card variant */
.glass-card-compact {
  --card-padding: var(--spacing-sm);  /* Compact version */
}
```

---

## Framework Integration

### React + TypeScript

```typescript
// App.tsx
import '@whykusanagi/corrupted-theme/dist/theme.css';
import { useState } from 'react';

// Optional: Type-safe design tokens
type DesignToken =
  | '--color-accent'
  | '--spacing-md'
  | '--transition-fast';

function getToken(token: DesignToken): string {
  return getComputedStyle(document.documentElement).getPropertyValue(token);
}

function App() {
  const [count, setCount] = useState(0);

  return (
    <div className="container">
      <div className="glass-card">
        <h1 className="corrupted-text">US使R 統NTERFACE</h1>
        <p>Count: {count}</p>
        <button className="btn btn-primary" onClick={() => setCount(count + 1)}>
          Increment
        </button>
      </div>
    </div>
  );
}

export default App;
```

### Vue 3 + Vite

```vue
<!-- App.vue -->
<script setup lang="ts">
import { ref } from 'vue';
import '@whykusanagi/corrupted-theme/dist/theme.css';

const count = ref(0);
</script>

<template>
  <div class="container">
    <div class="glass-card">
      <h1 class="corrupted-text">US使R 統NTERFACE</h1>
      <p>Count: {{ count }}</p>
      <button class="btn btn-primary" @click="count++">
        Increment
      </button>
    </div>
  </div>
</template>
```

### Next.js (App Router)

```typescript
// app/layout.tsx
import '@whykusanagi/corrupted-theme/dist/theme.css';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Celeste App',
  description: 'Premium corrupted AI aesthetic',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
```

### Svelte

```svelte
<!-- App.svelte -->
<script lang="ts">
  import '@whykusanagi/corrupted-theme/dist/theme.css';
  let count = 0;
</script>

<div class="container">
  <div class="glass-card">
    <h1 class="corrupted-text">US使R 統NTERFACE</h1>
    <p>Count: {count}</p>
    <button class="btn btn-primary" on:click={() => count++}>
      Increment
    </button>
  </div>
</div>
```

---

## Build Configuration

### Vite

```javascript
// vite.config.js
import { defineConfig } from 'vite';

export default defineConfig({
  css: {
    devSourcemap: true,  // Enable CSS source maps
  },
  build: {
    cssCodeSplit: true,  // Split CSS by route
    rollupOptions: {
      output: {
        assetFileNames: (assetInfo) => {
          // Hash CSS files for caching
          if (assetInfo.name.endsWith('.css')) {
            return 'assets/[name].[hash].css';
          }
          return 'assets/[name].[hash][extname]';
        },
      },
    },
  },
});
```

### Webpack

```javascript
// webpack.config.js
module.exports = {
  module: {
    rules: [
      {
        test: /\.css$/,
        use: [
          'style-loader',
          'css-loader',
          {
            loader: 'postcss-loader',
            options: {
              postcssOptions: {
                plugins: [
                  'autoprefixer',
                  'cssnano',  // Minification
                ],
              },
            },
          },
        ],
      },
    ],
  },
};
```

### PostCSS

```javascript
// postcss.config.js
module.exports = {
  plugins: {
    'postcss-import': {},              // Resolve @import
    'postcss-nesting': {},             // CSS nesting support
    'autoprefixer': {},                // Vendor prefixes
    'cssnano': {                       // Minification
      preset: ['default', {
        discardComments: {
          removeAll: true,
        },
      }],
    },
  },
};
```

### Tailwind CSS Integration (Optional)

```javascript
// tailwind.config.js
module.exports = {
  content: ['./src/**/*.{html,js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        // Import Celeste colors
        accent: {
          DEFAULT: '#d94f90',
          light: '#e86ca8',
          dark: '#b61b70',
        },
      },
      fontFamily: {
        sans: ['-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'Hiragino Sans', 'Yu Gothic'],
      },
    },
  },
  plugins: [],
};
```

---

## Version Management

### Semantic Versioning

The package follows [Semantic Versioning 2.0.0](https://semver.org/):

```
MAJOR.MINOR.PATCH

Example: 0.1.2
         │ │ └─ Patch: Bug fixes (backward compatible)
         │ └─── Minor: New features (backward compatible)
         └───── Major: Breaking changes
```

### Version History

| Version | Date | Changes | Migration |
|---------|------|---------|-----------|
| **0.1.2** | 2025-12-10 | Current stable release | N/A |
| 0.1.1 | 2025-11-15 | Added interactive states | None required |
| 0.1.0 | 2025-10-01 | Initial public release | N/A |

### Upgrade Strategy

```bash
# Check current version
npm list @whykusanagi/corrupted-theme

# Update to latest patch (safest)
npm update @whykusanagi/corrupted-theme

# Update to latest minor version
npm install @whykusanagi/corrupted-theme@^0.2.0

# Update to specific version
npm install @whykusanagi/corrupted-theme@0.1.2

# Update to latest (including major - may have breaking changes)
npm install @whykusanagi/corrupted-theme@latest
```

### Breaking Change Policy

**Major version changes** may include:
- Renamed CSS classes (e.g., `.card` → `.glass-card`)
- Removed components (deprecated >1 version ago)
- Changed design token names
- Modified default values (colors, spacing, etc.)
- Dropped browser support

**Migration guides** are provided in `docs/MIGRATION.md` for each major version.

---

## Migration Guide

### From v0.1.x to v0.2.x (Future)

**Planned breaking changes**:
1. Design tokens moved to external JSON file
2. CSS custom property names standardized (e.g., `--accent` → `--color-accent`)
3. Component naming conventions updated

```css
/* Before (v0.1.x) */
.card {
  background: var(--glass-bg);
}

/* After (v0.2.x) */
.glass-card {  /* Renamed for clarity */
  background: var(--color-bg-glass);  /* Standardized naming */
}
```

**Automated migration**:
```bash
# Install migration tool (future)
npm install -g @whykusanagi/theme-migrate

# Run migration
theme-migrate upgrade 0.1.x 0.2.x ./src
```

### From Custom CSS to Corrupted Theme

**Step 1**: Install package
```bash
npm install @whykusanagi/corrupted-theme
```

**Step 2**: Replace custom styles incrementally
```html
<!-- Before -->
<style>
  .my-card {
    background: rgba(20, 12, 40, 0.7);
    backdrop-filter: blur(15px);
    border-radius: 8px;
    padding: 2rem;
  }
</style>
<div class="my-card">Content</div>

<!-- After -->
<link rel="stylesheet" href="node_modules/@whykusanagi/corrupted-theme/dist/theme.css">
<div class="glass-card">Content</div>  <!-- Use built-in component -->
```

**Step 3**: Migrate colors to design tokens
```css
/* Before */
.custom-element {
  color: #d94f90;
  background: #0a0612;
}

/* After */
.custom-element {
  color: var(--color-accent);
  background: var(--color-bg-dark);
}
```

---

## Troubleshooting

### Issue: Styles Not Applying

**Problem**: Components don't render correctly

**Solutions**:
1. Check import order (variables.css must be first)
2. Ensure CSS is actually imported (check browser DevTools)
3. Verify no CSS conflicts with other frameworks

```javascript
// ✅ Correct order
import '@whykusanagi/corrupted-theme/src/css/variables.css';
import '@whykusanagi/corrupted-theme/src/css/components.css';

// ❌ Wrong order
import '@whykusanagi/corrupted-theme/src/css/components.css';
import '@whykusanagi/corrupted-theme/src/css/variables.css';  // Too late!
```

### Issue: Large Bundle Size

**Problem**: CSS bundle is too large

**Solutions**:
1. Use modular imports instead of full theme
2. Enable CSS tree-shaking in build config
3. Remove unused utility classes

```javascript
// Before: 8.2KB (full theme)
import '@whykusanagi/corrupted-theme/dist/theme.css';

// After: ~3KB (only what you need)
import '@whykusanagi/corrupted-theme/src/css/variables.css';
import '@whykusanagi/corrupted-theme/src/css/glass.css';
import '@whykusanagi/corrupted-theme/src/css/components.css';
```

### Issue: Backdrop-Filter Not Working

**Problem**: Glass effect appears solid

**Solution**: Add vendor prefix for Safari

```css
/* Package already includes this, but if using custom CSS: */
.glass-card {
  backdrop-filter: blur(15px);           /* Standard */
  -webkit-backdrop-filter: blur(15px);   /* Safari */
}
```

---

## Related Documentation

- [WEB_IMPLEMENTATION.md](./WEB_IMPLEMENTATION.md) - Complete web platform guide
- [COMPONENT_MAPPING.md](./COMPONENT_MAPPING.md) - Component reference
- [DESIGN_TOKENS.md](../brand/DESIGN_TOKENS.md) - Token specifications
- [COMPONENT_LIBRARY.md](../components/COMPONENT_LIBRARY.md) - All available components

---

**Last Updated**: 2025-12-13
**Version**: 1.0.0
**Package Version**: 0.1.2
**Maintainer**: Celeste Brand System
**Status**: ✅ Production Ready
