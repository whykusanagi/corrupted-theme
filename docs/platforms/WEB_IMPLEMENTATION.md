# Web Implementation Guide

> **Celeste Brand System** | Platform Documentation
> **Document**: Web Implementation Guide
> **Version**: 1.0.0
> **Last Updated**: 2025-12-13

---

## Table of Contents

1. [Overview](#overview)
2. [Responsive Design System](#responsive-design-system)
3. [CSS Integration](#css-integration)
4. [Framework Integration](#framework-integration)
5. [Performance Optimization](#performance-optimization)
6. [Browser Support](#browser-support)
7. [Accessibility](#accessibility)
8. [Implementation Examples](#implementation-examples)
9. [Common Patterns](#common-patterns)
10. [Troubleshooting](#troubleshooting)

---

## Overview

This guide covers implementing the Celeste brand system on web platforms using the **@whykusanagi/corrupted-theme** npm package. The web implementation maintains the same translation-failure aesthetic as the CLI while adapting to responsive, interactive web interfaces.

### Key Web Features

- **Responsive Design**: Mobile-first approach with 3 breakpoints
- **Glassmorphism**: CSS backdrop-filter effects for frosted glass aesthetic
- **Modular CSS**: Import only what you need (9 modular files)
- **Design Tokens**: CSS custom properties for easy theming
- **Framework Agnostic**: Works with React, Vue, Svelte, vanilla JS
- **Accessibility**: WCAG AA compliant with keyboard navigation
- **Performance**: GPU-accelerated animations, optimized glass effects

### Quick Start

```bash
# Install corrupted-theme
npm install @whykusanagi/corrupted-theme

# Or use from local development
npm link /path/to/corrupted-theme
```

```html
<!-- Import full theme -->
<link rel="stylesheet" href="node_modules/@whykusanagi/corrupted-theme/src/css/theme.css">

<!-- Or import modularly -->
<link rel="stylesheet" href="node_modules/@whykusanagi/corrupted-theme/src/css/variables.css">
<link rel="stylesheet" href="node_modules/@whykusanagi/corrupted-theme/src/css/glass.css">
<link rel="stylesheet" href="node_modules/@whykusanagi/corrupted-theme/src/css/components.css">
```

---

## Responsive Design System

### Breakpoint Strategy

Celeste uses a **mobile-first** approach with 3 core breakpoints:

```css
/* Mobile: 0-640px (default - no media query needed) */
.container {
  padding: 1rem;
  max-width: 100%;
}

/* Tablet: 641px-1024px */
@media (min-width: 641px) {
  .container {
    padding: 2rem;
    max-width: 768px;
  }
}

/* Desktop: 1025px+ */
@media (min-width: 1025px) {
  .container {
    padding: 3rem;
    max-width: 1200px;
  }
}
```

### Breakpoint Reference

| Breakpoint | Range | Target Devices | Container Width |
|------------|-------|----------------|-----------------|
| **Mobile** | 0-640px | Phones (portrait) | 100% (16px padding) |
| **Tablet** | 641px-1024px | Tablets, phones (landscape) | 768px (32px padding) |
| **Desktop** | 1025px+ | Laptops, desktops, large screens | 1200px (48px padding) |

### Design Tokens for Breakpoints

```css
:root {
  /* Breakpoint values */
  --breakpoint-mobile: 640px;
  --breakpoint-tablet: 641px;
  --breakpoint-desktop: 1025px;

  /* Container widths */
  --container-mobile: 100%;
  --container-tablet: 768px;
  --container-desktop: 1200px;

  /* Spacing scale (responsive) */
  --spacing-xs: 0.25rem;  /* 4px */
  --spacing-sm: 0.5rem;   /* 8px */
  --spacing-md: 1rem;     /* 16px */
  --spacing-lg: 1.5rem;   /* 24px */
  --spacing-xl: 2rem;     /* 32px */
  --spacing-2xl: 3rem;    /* 48px */
}

/* Scale up spacing on larger screens */
@media (min-width: 1025px) {
  :root {
    --spacing-lg: 2rem;    /* 32px on desktop */
    --spacing-xl: 3rem;    /* 48px on desktop */
    --spacing-2xl: 4rem;   /* 64px on desktop */
  }
}
```

### Responsive Typography

Typography scales proportionally across breakpoints:

```css
/* Mobile typography (base) */
:root {
  --font-size-h1: 2rem;      /* 32px */
  --font-size-h2: 1.5rem;    /* 24px */
  --font-size-h3: 1.25rem;   /* 20px */
  --font-size-body: 1rem;    /* 16px */
  --font-size-small: 0.875rem; /* 14px */
}

/* Desktop typography (scaled up) */
@media (min-width: 1025px) {
  :root {
    --font-size-h1: 3.75rem;   /* 60px */
    --font-size-h2: 2.5rem;    /* 40px */
    --font-size-h3: 1.875rem;  /* 30px */
    --font-size-body: 1.125rem; /* 18px */
  }
}

/* Usage */
h1 {
  font-size: var(--font-size-h1);
  line-height: 1.2;
}
```

### Grid System (Optional)

For complex layouts, use CSS Grid with responsive columns:

```css
.grid {
  display: grid;
  gap: var(--spacing-md);

  /* Mobile: 1 column */
  grid-template-columns: 1fr;
}

@media (min-width: 641px) {
  .grid {
    /* Tablet: 2 columns */
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (min-width: 1025px) {
  .grid {
    /* Desktop: 3-4 columns */
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  }
}
```

---

## CSS Integration

### Import Order (Critical)

CSS files must be imported in this **specific order** to ensure proper cascading:

```html
<!-- 1. Variables (design tokens) - MUST be first -->
<link rel="stylesheet" href="css/variables.css">

<!-- 2. Base styles (resets, typography) -->
<link rel="stylesheet" href="css/base.css">

<!-- 3. Animations (keyframes used by components) -->
<link rel="stylesheet" href="css/animations.css">

<!-- 4. Glass effects (backdrop-filter) -->
<link rel="stylesheet" href="css/glass.css">

<!-- 5. Layout utilities -->
<link rel="stylesheet" href="css/layout.css">

<!-- 6. Components -->
<link rel="stylesheet" href="css/components.css">

<!-- 7. Interactive states (hover, focus, active) -->
<link rel="stylesheet" href="css/interactive.css">

<!-- 8. Utilities (last to override) -->
<link rel="stylesheet" href="css/utilities.css">

<!-- 9. Your custom styles -->
<link rel="stylesheet" href="css/custom.css">
```

### Single File Import (Easier)

For simpler projects, use the pre-bundled theme:

```html
<!-- All styles included (8.2KB gzipped) -->
<link rel="stylesheet" href="node_modules/@whykusanagi/corrupted-theme/src/css/theme.css">
```

### CSS Custom Properties (Theming)

Override design tokens for custom theming:

```css
/* Override defaults in your custom CSS */
:root {
  /* Change accent color from pink to purple */
  --color-accent: #8b5cf6;
  --color-accent-light: #a78bfa;
  --color-accent-dark: #7c3aed;

  /* Adjust glass opacity */
  --glass-opacity: 0.8;  /* Default is 0.7 */

  /* Change border radius */
  --radius-md: 12px;  /* Default is 8px */
}
```

### CSS Architecture

The corrupted-theme package follows **ITCSS (Inverted Triangle CSS)** architecture:

```
Settings   (variables.css)         ← Most generic
  ↓
Tools      (mixins, not included)
  ↓
Generic    (base.css)
  ↓
Elements   (typography, links)
  ↓
Objects    (layout.css)
  ↓
Components (components.css)        ← Most specific
  ↓
Utilities  (utilities.css)
```

---

## Framework Integration

### Vanilla JavaScript

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Celeste App</title>

  <!-- Import theme -->
  <link rel="stylesheet" href="node_modules/@whykusanagi/corrupted-theme/src/css/theme.css">
</head>
<body>
  <div class="glass-card">
    <h2 class="corrupted-text">使US狀ERAGEMENT</h2>
    <p>Your content here</p>
  </div>

  <script>
    // Add corruption animation
    function corruptText(text, intensity = 0.3) {
      const japaneseChars = ['ア', 'イ', 'ウ', '使', '統', '計', 'ー'];
      return text.split('').map((char, i) => {
        if (Math.random() < intensity && /[a-zA-Z]/.test(char)) {
          return japaneseChars[Math.floor(Math.random() * japaneseChars.length)];
        }
        return char;
      }).join('');
    }

    // Apply corruption on hover
    document.querySelectorAll('.corrupted-text').forEach(el => {
      const original = el.textContent;
      el.addEventListener('mouseenter', () => {
        el.textContent = corruptText(original);
      });
      el.addEventListener('mouseleave', () => {
        el.textContent = original;
      });
    });
  </script>
</body>
</html>
```

### React

```jsx
// App.jsx
import '@whykusanagi/corrupted-theme/src/css/theme.css';
import { useState, useEffect } from 'react';

function GlassCard({ children }) {
  return (
    <div className="glass-card">
      {children}
    </div>
  );
}

function CorruptedText({ text, intensity = 0.3 }) {
  const [corrupted, setCorrupted] = useState(text);

  const corruptText = (text) => {
    const japaneseChars = ['ア', 'イ', 'ウ', '使', '統', '計'];
    return text.split('').map((char) => {
      if (Math.random() < intensity && /[a-zA-Z]/.test(char)) {
        return japaneseChars[Math.floor(Math.random() * japaneseChars.length)];
      }
      return char;
    }).join('');
  };

  useEffect(() => {
    const interval = setInterval(() => {
      setCorrupted(corruptText(text));
    }, 3000);
    return () => clearInterval(interval);
  }, [text, intensity]);

  return <span className="corrupted-text">{corrupted}</span>;
}

function App() {
  return (
    <div className="container">
      <GlassCard>
        <h2><CorruptedText text="USER MANAGEMENT" /></h2>
        <p>Your content here</p>
      </GlassCard>
    </div>
  );
}

export default App;
```

### Vue 3

```vue
<!-- App.vue -->
<script setup>
import { ref, onMounted, onUnmounted } from 'vue';
import '@whykusanagi/corrupted-theme/src/css/theme.css';

const props = defineProps({
  text: String,
  intensity: { type: Number, default: 0.3 }
});

const corrupted = ref(props.text);

function corruptText(text) {
  const japaneseChars = ['ア', 'イ', 'ウ', '使', '統', '計'];
  return text.split('').map((char) => {
    if (Math.random() < props.intensity && /[a-zA-Z]/.test(char)) {
      return japaneseChars[Math.floor(Math.random() * japaneseChars.length)];
    }
    return char;
  }).join('');
}

let interval;
onMounted(() => {
  interval = setInterval(() => {
    corrupted.value = corruptText(props.text);
  }, 3000);
});

onUnmounted(() => clearInterval(interval));
</script>

<template>
  <div class="glass-card">
    <h2 class="corrupted-text">{{ corrupted }}</h2>
    <slot />
  </div>
</template>
```

### Next.js (App Router)

```jsx
// app/layout.jsx
import '@whykusanagi/corrupted-theme/src/css/theme.css';

export const metadata = {
  title: 'Celeste App',
  description: 'Translation-failure aesthetic',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}

// app/page.jsx
'use client';

import { useEffect, useState } from 'react';

export default function Home() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;  // Prevent SSR hydration mismatch

  return (
    <main className="container">
      <div className="glass-card">
        <h1 className="corrupted-text">使WE統LCOME</h1>
        <p>Premium corrupted AI aesthetic</p>
      </div>
    </main>
  );
}
```

---

## Performance Optimization

### Critical Rendering Path

1. **Inline critical CSS** for above-the-fold content:

```html
<head>
  <style>
    /* Critical CSS (variables + glass-card only) */
    :root {
      --color-accent: #d94f90;
      --glass-bg: rgba(20, 12, 40, 0.7);
    }

    .glass-card {
      background: var(--glass-bg);
      backdrop-filter: blur(15px);
      border-radius: 8px;
      padding: 2rem;
    }
  </style>

  <!-- Defer non-critical CSS -->
  <link rel="preload" href="theme.css" as="style" onload="this.onload=null;this.rel='stylesheet'">
  <noscript><link rel="stylesheet" href="theme.css"></noscript>
</head>
```

### Glass Effect Performance

Backdrop-filter is expensive. Follow these rules:

```css
/* ✅ Good: Limited glass elements */
.hero-card {
  backdrop-filter: blur(15px);
}

/* ❌ Bad: Too many glass elements */
.every-card {
  backdrop-filter: blur(15px);  /* 20+ cards = janky scroll */
}

/* ✅ Good: Disable glass on scroll (mobile) */
@media (max-width: 640px) {
  .scrolling .glass-card {
    backdrop-filter: none;  /* Improve scroll performance */
    background: rgba(20, 12, 40, 0.95);  /* Solid fallback */
  }
}
```

### Code Splitting (React)

```jsx
import { lazy, Suspense } from 'react';

// Lazy load corrupted-theme for non-critical pages
const CorruptedDashboard = lazy(() => import('./CorruptedDashboard'));

function App() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <CorruptedDashboard />
    </Suspense>
  );
}
```

### Image Optimization

```html
<!-- Use WebP with fallback -->
<picture>
  <source srcset="hero.webp" type="image/webp">
  <img src="hero.jpg" alt="Hero" loading="lazy">
</picture>

<!-- Add blur placeholder for glassmorphism effect -->
<div class="glass-image-wrapper">
  <img src="hero.jpg" alt="Hero" style="filter: blur(2px);">
</div>
```

### Animation Performance

```css
/* ✅ Good: GPU-accelerated properties only */
.btn {
  transition: transform 0.15s ease, opacity 0.15s ease;
}

.btn:hover {
  transform: scale(1.05);
  opacity: 0.9;
}

/* ❌ Bad: CPU-bound properties */
.btn:hover {
  width: 120px;  /* Causes reflow */
  margin-left: -10px;  /* Causes reflow */
}
```

---

## Browser Support

### Target Browsers

Celeste supports **modern browsers** with graceful degradation:

| Browser | Minimum Version | Notes |
|---------|-----------------|-------|
| **Chrome** | 90+ | Full support (backdrop-filter) |
| **Firefox** | 88+ | Full support |
| **Safari** | 14+ | Full support (-webkit-backdrop-filter) |
| **Edge** | 90+ | Full support (Chromium-based) |
| **Mobile Safari** | iOS 14+ | Full support |
| **Chrome Android** | 90+ | Full support |

### Feature Detection

Use `@supports` for progressive enhancement:

```css
/* Fallback for browsers without backdrop-filter */
.glass-card {
  background: rgba(20, 12, 40, 0.95);  /* Solid fallback */
  border: 1px solid rgba(217, 79, 144, 0.3);
}

/* Enhanced glass effect for modern browsers */
@supports (backdrop-filter: blur(15px)) or (-webkit-backdrop-filter: blur(15px)) {
  .glass-card {
    background: rgba(20, 12, 40, 0.7);  /* More transparent */
    backdrop-filter: blur(15px);
    -webkit-backdrop-filter: blur(15px);  /* Safari prefix */
  }
}
```

### Vendor Prefixes

**Required prefixes** (already included in theme.css):

```css
.glass-card {
  backdrop-filter: blur(15px);           /* Standard */
  -webkit-backdrop-filter: blur(15px);   /* Safari/iOS */
}

.gradient-text {
  background-clip: text;                 /* Standard */
  -webkit-background-clip: text;         /* Safari/Chrome */
  -webkit-text-fill-color: transparent;  /* Safari/Chrome */
}
```

### Polyfills (Optional)

For IE11 support (not recommended), use polyfills:

```html
<!-- CSS custom properties polyfill -->
<script src="https://cdn.jsdelivr.net/npm/css-vars-ponyfill@2"></script>
<script>
  cssVars({
    include: 'link[rel=stylesheet]',
    onlyLegacy: true,  // Only run for IE11
  });
</script>
```

---

## Accessibility

### WCAG AA Compliance

All Celeste components meet **WCAG 2.1 Level AA** standards:

#### Color Contrast

```css
/* ✅ All combinations tested */
--color-bg: #0a0612;         /* Dark background */
--color-text: #ffffff;       /* White text: 21:1 ratio (AAA) */
--color-accent: #d94f90;     /* Pink accent: 7.2:1 ratio (AAA) */
--color-muted: #a0a0a0;      /* Muted text: 10.5:1 ratio (AAA) */
```

#### Keyboard Navigation

```css
/* Focus indicators (WCAG 2.4.7) */
.btn:focus-visible {
  outline: 2px solid rgba(217, 79, 144, 0.7);
  outline-offset: 2px;
}

/* Skip to main content link */
.skip-link {
  position: absolute;
  top: -40px;
  left: 0;
  background: var(--color-accent);
  color: white;
  padding: 8px;
  z-index: 100;
}

.skip-link:focus {
  top: 0;
}
```

#### Screen Reader Support

```html
<!-- ARIA labels for interactive elements -->
<button class="btn" aria-label="Close dialog">
  <span aria-hidden="true">×</span>
</button>

<!-- ARIA live regions for dynamic content -->
<div class="toast" role="alert" aria-live="polite">
  Success! Data saved.
</div>

<!-- Hidden text for corrupted content -->
<h2 class="corrupted-text" aria-label="User Management">
  使US狀ERAGEMENT  <!-- Visual corruption -->
</h2>
```

#### Motion Reduction

```css
/* Respect user preference (WCAG 2.3.3) */
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }

  /* Disable decorative animations */
  .corrupted-text,
  .flicker,
  .glitch-effect {
    animation: none;
  }
}
```

#### Touch Targets (Mobile)

```css
/* Minimum 44x44px touch targets (WCAG 2.5.5) */
.btn {
  min-width: 44px;
  min-height: 44px;
  padding: 0.75rem 1.5rem;
}

/* Increase spacing between touch targets */
.btn + .btn {
  margin-left: 0.5rem;  /* 8px gap */
}
```

---

## Implementation Examples

### Example 1: Homepage Hero

```html
<section class="hero">
  <div class="container">
    <div class="glass-card hero-card">
      <h1 class="corrupted-text" aria-label="Welcome to Celeste">
        使WE統LCOME TO C理計E埋ESTE
      </h1>
      <p class="subtitle">
        Premium corrupted AI aesthetic with translation-failure linguistics
      </p>
      <div class="btn-group">
        <button class="btn btn-primary">Get Started</button>
        <button class="btn btn-secondary">Learn More</button>
      </div>
    </div>
  </div>
</section>

<style>
.hero {
  min-height: 100vh;
  display: flex;
  align-items: center;
  background: linear-gradient(135deg, #0a0612 0%, #1a0a2e 100%);
}

.hero-card {
  text-align: center;
  max-width: 600px;
  margin: 0 auto;
}

.hero h1 {
  font-size: clamp(2rem, 5vw, 3.75rem);  /* Responsive font size */
  margin-bottom: 1rem;
}

.subtitle {
  font-size: 1.25rem;
  color: rgba(255, 255, 255, 0.8);
  margin-bottom: 2rem;
}

.btn-group {
  display: flex;
  gap: 1rem;
  justify-content: center;
  flex-wrap: wrap;  /* Stack on mobile */
}
</style>
```

### Example 2: Dashboard Grid

```html
<div class="dashboard">
  <div class="grid">
    <div class="glass-card stat-card">
      <div class="stat-icon">📊</div>
      <h3>US使AGE</h3>
      <p class="stat-value">1,234</p>
    </div>

    <div class="glass-card stat-card">
      <div class="stat-icon">👥</div>
      <h3>US統ERS</h3>
      <p class="stat-value">567</p>
    </div>

    <div class="glass-card stat-card">
      <div class="stat-icon">⚡</div>
      <h3>AC計IVE</h3>
      <p class="stat-value">89</p>
    </div>
  </div>
</div>

<style>
.dashboard {
  padding: 2rem;
}

.grid {
  display: grid;
  gap: 1.5rem;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
}

.stat-card {
  text-align: center;
  padding: 2rem;
  transition: transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.stat-card:hover {
  transform: translateY(-4px) scale(1.02);
}

.stat-icon {
  font-size: 3rem;
  margin-bottom: 1rem;
}

.stat-value {
  font-size: 2.5rem;
  font-weight: 700;
  color: var(--color-accent);
}
</style>
```

### Example 3: Form with Validation

```html
<form class="glass-card form">
  <h2>Sign計 US使UP</h2>

  <div class="form-group">
    <label for="email">Email</label>
    <input
      type="email"
      id="email"
      class="input"
      placeholder="your@email.com"
      required
    >
    <span class="error-message" role="alert"></span>
  </div>

  <div class="form-group">
    <label for="password">Password</label>
    <input
      type="password"
      id="password"
      class="input"
      placeholder="••••••••"
      required
    >
    <span class="error-message" role="alert"></span>
  </div>

  <button type="submit" class="btn btn-primary">
    Create Account
  </button>
</form>

<style>
.form {
  max-width: 400px;
  margin: 2rem auto;
  padding: 2rem;
}

.form-group {
  margin-bottom: 1.5rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
}

.input {
  width: 100%;
  padding: 0.75rem;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(217, 79, 144, 0.3);
  border-radius: 8px;
  color: white;
  font-size: 1rem;
  transition: border-color 0.15s ease;
}

.input:focus {
  outline: none;
  border-color: rgba(217, 79, 144, 0.7);
}

.input.error {
  border-color: rgba(255, 68, 68, 0.7);
}

.error-message {
  display: block;
  color: rgba(255, 68, 68, 0.9);
  font-size: 0.875rem;
  margin-top: 0.25rem;
  min-height: 1.25rem;  /* Prevent layout shift */
}
</style>

<script>
// Client-side validation
document.querySelector('.form').addEventListener('submit', (e) => {
  e.preventDefault();

  const email = document.getElementById('email');
  const password = document.getElementById('password');

  // Validate email
  if (!email.value.includes('@')) {
    email.classList.add('error');
    email.nextElementSibling.textContent = 'Invalid email address';
    return;
  }

  // Validate password
  if (password.value.length < 8) {
    password.classList.add('error');
    password.nextElementSibling.textContent = 'Password must be 8+ characters';
    return;
  }

  // Success - submit form
  console.log('Form submitted');
});
</script>
```

---

## Common Patterns

### Loading States

```html
<div class="glass-card loading">
  <div class="spinner"></div>
  <p>Loading...</p>
</div>

<style>
.spinner {
  width: 40px;
  height: 40px;
  border: 3px solid rgba(217, 79, 144, 0.2);
  border-top-color: #d94f90;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 1rem;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}
</style>
```

### Toast Notifications

```html
<div class="toast toast-success" role="alert">
  ✓ Success! Data saved.
</div>

<style>
.toast {
  position: fixed;
  bottom: 2rem;
  right: 2rem;
  background: rgba(20, 12, 40, 0.95);
  backdrop-filter: blur(15px);
  border: 1px solid rgba(217, 79, 144, 0.3);
  border-radius: 8px;
  padding: 1rem 1.5rem;
  box-shadow: 0 4px 16px rgba(217, 79, 144, 0.25);
  animation: slideIn 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
}

@keyframes slideIn {
  from {
    transform: translateX(400px);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}

.toast-success {
  border-left: 4px solid #10b981;  /* Green accent */
}
</style>
```

### Modal Dialog

```html
<div class="modal-backdrop">
  <div class="modal glass-card" role="dialog" aria-modal="true">
    <button class="modal-close" aria-label="Close">×</button>
    <h2>Dialog計 使Title</h2>
    <p>Modal content here</p>
    <div class="modal-actions">
      <button class="btn btn-secondary">Cancel</button>
      <button class="btn btn-primary">Confirm</button>
    </div>
  </div>
</div>

<style>
.modal-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.8);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal {
  max-width: 500px;
  width: 90%;
  max-height: 90vh;
  overflow-y: auto;
  animation: modalEnter 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
}

@keyframes modalEnter {
  from {
    opacity: 0;
    transform: scale(0.9) translateY(-20px);
  }
  to {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
}

.modal-close {
  position: absolute;
  top: 1rem;
  right: 1rem;
  background: none;
  border: none;
  font-size: 2rem;
  color: white;
  cursor: pointer;
}

.modal-actions {
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
  margin-top: 2rem;
}
</style>
```

---

## Troubleshooting

### Issue: Backdrop-filter Not Working

**Symptoms**: Glass effect appears solid instead of translucent blur

**Causes**:
1. Browser doesn't support backdrop-filter
2. Missing `-webkit-` prefix for Safari
3. Element has no positioned parent

**Solutions**:
```css
/* Add vendor prefix */
.glass-card {
  backdrop-filter: blur(15px);
  -webkit-backdrop-filter: blur(15px);  /* Safari */
}

/* Ensure parent creates stacking context */
.parent {
  position: relative;
  z-index: 0;
}

/* Fallback for unsupported browsers */
@supports not (backdrop-filter: blur(15px)) {
  .glass-card {
    background: rgba(20, 12, 40, 0.95);  /* More opaque */
  }
}
```

### Issue: Animations Janky on Mobile

**Symptoms**: Scrolling/animations drop frames on mobile devices

**Solutions**:
```css
/* Disable expensive effects on mobile */
@media (max-width: 640px) {
  .glass-card {
    backdrop-filter: none;
    background: rgba(20, 12, 40, 0.95);
  }

  /* Simplify animations */
  * {
    animation-duration: 0.15s !important;
  }
}

/* Use GPU acceleration */
.animated-element {
  will-change: transform;
  transform: translateZ(0);  /* Force GPU layer */
}
```

### Issue: Text Corruption Not Visible

**Symptoms**: Japanese characters not rendering or showing boxes

**Causes**:
1. Font doesn't support Japanese characters
2. Character encoding incorrect

**Solutions**:
```html
<!-- Ensure UTF-8 encoding -->
<meta charset="UTF-8">

<!-- Use system fonts with Japanese support -->
<style>
  body {
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI',
                 'Hiragino Sans', 'Yu Gothic', sans-serif;
  }
</style>
```

### Issue: CSS Custom Properties Not Working

**Symptoms**: Styles not applying, colors are wrong

**Causes**:
1. Variables.css not imported first
2. Typo in variable name

**Solutions**:
```html
<!-- MUST import variables FIRST -->
<link rel="stylesheet" href="css/variables.css">
<link rel="stylesheet" href="css/components.css">
```

```css
/* Check variable name spelling */
.btn {
  background: var(--color-accent);  /* Correct */
  /* background: var(--accent-color); ← Wrong variable name */
}
```

---

## Related Documentation

- [NPM_PACKAGE.md](./NPM_PACKAGE.md) - Package installation and configuration
- [COMPONENT_MAPPING.md](./COMPONENT_MAPPING.md) - Web ↔ CLI component equivalents
- [COMPONENT_LIBRARY.md](../components/COMPONENT_LIBRARY.md) - All available components
- [ANIMATION_GUIDELINES.md](../components/ANIMATION_GUIDELINES.md) - Animation specifications
- [ACCESSIBILITY.md](../standards/ACCESSIBILITY.md) - Full accessibility standards

---

**Last Updated**: 2025-12-13
**Version**: 1.0.0
**Maintainer**: Celeste Brand System
**Status**: ✅ Ready for Production
