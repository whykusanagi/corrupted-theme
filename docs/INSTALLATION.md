# Installation Guide

## Quick Start

Choose the installation method that best suits your project:

### Option 1: npm (Recommended)

```bash
npm install @whykusanagi/corrupted-theme
```

Then import in your HTML:

```html
<link rel="stylesheet" href="node_modules/@whykusanagi/corrupted-theme/src/css/theme.css">
```

Or in your CSS/SCSS:

```css
@import '@whykusanagi/corrupted-theme';
```

Or import individual modules:

```css
@import '@whykusanagi/corrupted-theme/variables';
@import '@whykusanagi/corrupted-theme/typography';
@import '@whykusanagi/corrupted-theme/glassmorphism';
/* ... import only what you need */
```

### Option 2: CDN (Coming Soon)

```html
<!-- Full theme -->
<link rel="stylesheet" href="https://cdn.whykusanagi.xyz/corrupted-theme@latest/src/css/theme.css">

<!-- Or individual modules -->
<link rel="stylesheet" href="https://cdn.whykusanagi.xyz/corrupted-theme@latest/src/css/variables.css">
<link rel="stylesheet" href="https://cdn.whykusanagi.xyz/corrupted-theme@latest/src/css/components.css">
```

### Option 3: Local Copy

1. Download the `corrupted-theme` folder
2. Copy to your project:
   ```
   your-project/
   ├── styles/
   │   └── corrupted-theme/
   └── index.html
   ```
3. Link in your HTML:
   ```html
   <link rel="stylesheet" href="styles/corrupted-theme/src/css/theme.css">
   ```

### Option 4: Git Submodule

```bash
git submodule add https://github.com/whykusanagi/corrupted-theme.git assets/css/corrupted-theme
```

Then link:

```html
<link rel="stylesheet" href="assets/css/corrupted-theme/src/css/theme.css">
```

## Setup & Configuration

### Basic HTML Setup

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>My App</title>

  <!-- Load theme -->
  <link rel="stylesheet" href="path/to/corrupted-theme/src/css/theme.css">

  <!-- Optional: Font Awesome for icons -->
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.2/css/all.min.css">
</head>
<body>
  <div class="container-md">
    <h1>Welcome to Corrupted Theme</h1>
    <button class="btn">Click me</button>
  </div>
</body>
</html>
```

### CSS Preprocessing (Optional)

If you're using PostCSS or SASS, you can extend the theme:

```scss
// Import the theme
@import 'path/to/corrupted-theme/src/css/theme.css';

// Override variables for your brand
:root {
  --accent: #your-color;
  --accent-light: #your-light;
  --accent-dark: #your-dark;
}

// Add custom components
.my-component {
  background: var(--glass);
  border-radius: var(--radius-lg);
  padding: var(--spacing-md);
  // ... your styles
}
```

## File Structure

After installation, you'll have access to:

```
corrupted-theme/
├── src/
│   └── css/
│       ├── variables.css          # CSS custom properties
│       ├── typography.css         # Font hierarchy & text styles
│       ├── glassmorphism.css      # Glass effects & frosted design
│       ├── animations.css         # Keyframes & animation utilities
│       ├── components.css         # Pre-styled UI components
│       ├── utilities.css          # Utility classes
│       └── theme.css              # Master stylesheet (imports all)
├── docs/
│   ├── COLOR_PALETTE.md           # Color system reference
│   ├── COMPONENTS.md              # Component library
│   ├── CUSTOMIZATION.md           # Theming guide
│   ├── INSTALLATION.md            # This file
│   ├── ACCESSIBILITY.md           # WCAG compliance
│   ├── BROWSER_SUPPORT.md         # Compatibility info
│   ├── VARIABLES_REFERENCE.md     # Complete variable list
│   ├── TYPOGRAPHY.md              # Font system
│   └── ANIMATIONS.md              # Animation patterns
├── examples/
│   ├── index.html                 # Component showcase
│   ├── button.html                # Button demo
│   ├── card.html                  # Card variations
│   ├── form.html                  # Form elements
│   └── layout.html                # Layout patterns
├── package.json
├── README.md
├── CHANGELOG.md
└── LICENSE
```

## Partial Imports

The modular structure allows you to import only what you need:

### Variables Only (Tree-shakeable)

```html
<!-- Get CSS variables without any styles -->
<link rel="stylesheet" href="path/to/corrupted-theme/src/css/variables.css">
```

Use the variables in your custom CSS:

```css
.my-button {
  background: var(--accent);
  padding: var(--spacing-md) var(--spacing-lg);
  border-radius: var(--radius-md);
  color: var(--text);
}
```

### Components Only

```html
<!-- Get pre-styled components -->
<link rel="stylesheet" href="path/to/corrupted-theme/src/css/variables.css">
<link rel="stylesheet" href="path/to/corrupted-theme/src/css/typography.css">
<link rel="stylesheet" href="path/to/corrupted-theme/src/css/components.css">
```

### No Animations

```html
<!-- Import everything except animations -->
<link rel="stylesheet" href="path/to/corrupted-theme/src/css/variables.css">
<link rel="stylesheet" href="path/to/corrupted-theme/src/css/typography.css">
<link rel="stylesheet" href="path/to/corrupted-theme/src/css/glassmorphism.css">
<link rel="stylesheet" href="path/to/corrupted-theme/src/css/components.css">
<link rel="stylesheet" href="path/to/corrupted-theme/src/css/utilities.css">
```

## Browser Support

| Browser | Version | Support |
|---------|---------|---------|
| Chrome | 76+ | Full ✅ |
| Firefox | 55+ | Full ✅ |
| Safari | 9+ | Full ✅ |
| Edge | 79+ | Full ✅ |
| Opera | 63+ | Full ✅ |
| Internet Explorer | Any | None ❌ |

See [BROWSER_SUPPORT.md](./BROWSER_SUPPORT.md) for detailed feature compatibility.

## Verify Installation

Create a simple test file to verify the theme is loaded:

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Corrupted Theme Test</title>
  <link rel="stylesheet" href="path/to/corrupted-theme/src/css/theme.css">
</head>
<body style="background: var(--bg); color: var(--text); padding: var(--spacing-lg); font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;">
  <h1>Corrupted Theme is Loaded!</h1>
  <p>If you can see this text in light purple on a very dark background, the theme is working correctly.</p>

  <div style="margin-top: var(--spacing-lg); display: flex; gap: var(--spacing-md); flex-wrap: wrap;">
    <button class="btn">Primary Button</button>
    <button class="btn btn-secondary">Secondary Button</button>
    <button class="btn btn-ghost">Ghost Button</button>
  </div>

  <div class="card" style="margin-top: var(--spacing-lg); max-width: 400px;">
    <h2>Test Card</h2>
    <p>This is a card component with the glass effect applied.</p>
  </div>
</body>
</html>
```

## Troubleshooting

### Theme not loading

- **Check path:** Ensure the path to `theme.css` is correct relative to your HTML file
- **Check file permissions:** Make sure CSS files are readable
- **Browser console:** Check for 404 errors in the Network tab
- **CSS variables not working:** Verify your browser supports CSS custom properties (all modern browsers do)

### Styles not applying

- **CSS specificity:** Custom CSS may override theme styles. Use the class names as-is or increase specificity
- **Missing variables:** If using only individual modules, ensure you imported `variables.css` first
- **Cache:** Hard refresh your browser (Ctrl+Shift+R or Cmd+Shift+R)

### Glass effect not showing blur

- **Browser support:** Ensure `backdrop-filter` is supported in your target browsers
- **Performance:** Some browsers disable blur on low-performance devices
- **Fallback:** The theme includes fallback colors for browsers without backdrop-filter support

### Animations not running

- **prefers-reduced-motion:** User's system settings may disable animations. This is intentional for accessibility
- **Performance:** Very old devices may disable CSS animations
- **Hardware acceleration:** Check if CSS animations are GPU-accelerated in your browser

## Customization

After installation, customize the theme by overriding CSS variables:

```html
<style>
  :root {
    /* Override accent color */
    --accent: #3b82f6;
    --accent-light: #60a5fa;
    --accent-dark: #1e40af;

    /* Override spacing */
    --spacing-md: 1.25rem;
    --spacing-lg: 2rem;

    /* Override border radius */
    --radius-md: 8px;
  }
</style>

<link rel="stylesheet" href="path/to/corrupted-theme/src/css/theme.css">
```

See [CUSTOMIZATION.md](./CUSTOMIZATION.md) for extensive customization examples.

## Framework Integration

### React

```jsx
import '@whykusanagi/corrupted-theme/src/css/theme.css';

export function App() {
  return (
    <div className="container-md">
      <button className="btn">Click me</button>
    </div>
  );
}
```

### Vue

```vue
<template>
  <div class="container-md">
    <button class="btn">Click me</button>
  </div>
</template>

<script setup>
import '@whykusanagi/corrupted-theme/src/css/theme.css';
</script>
```

### Next.js

In `pages/_app.js`:

```jsx
import '@whykusanagi/corrupted-theme/src/css/theme.css';

export default function App({ Component, pageProps }) {
  return <Component {...pageProps} />;
}
```

### Svelte

In `src/app.svelte`:

```svelte
<script>
  import '@whykusanagi/corrupted-theme/src/css/theme.css';
</script>

<main class="container-md">
  <button class="btn">Click me</button>
</main>
```

## Next Steps

1. **Explore components:** Check out [COMPONENTS.md](./COMPONENTS.md) to see what's available
2. **Customize colors:** Use [COLOR_PALETTE.md](./COLOR_PALETTE.md) to adjust the theme to your brand
3. **Learn utilities:** Review [UTILITIES.md](./UTILITIES.md) for rapid layout building
4. **Check accessibility:** See [ACCESSIBILITY.md](./ACCESSIBILITY.md) for WCAG compliance details
5. **View examples:** Explore the `examples/` folder for working demos

## Support & Resources

- **GitHub Issues:** [Report bugs or request features](https://github.com/whykusanagi/corrupted-theme/issues)
- **Documentation:** All docs are in the `docs/` folder
- **License:** MIT (see LICENSE file)

---

**Happy theming!** 🎨
