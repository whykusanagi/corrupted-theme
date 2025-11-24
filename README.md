# Corrupted Theme

A dark, glassmorphic design system with pink/purple accents. Perfect for creating modern, visually striking web applications with a distinctive cyberpunk aesthetic.

## Features

✨ **Glassmorphism Design** - Frosted glass effects with backdrop blur
🌙 **Dark Mode First** - Optimized for dark interfaces
💎 **Pink/Purple Accents** - Distinctive color palette
📱 **Fully Responsive** - Mobile-first design
⚡ **CSS Variables** - Easily customizable
🎨 **Comprehensive Components** - Pre-styled UI elements
✅ **Accessibility Ready** - WCAG compliance
🎭 **Animation Library** - Smooth transitions and effects

## Quick Start

### via GitHub Packages

First, configure your `.npmrc` to authenticate with GitHub Packages:

```bash
# Create ~/.npmrc (in your home directory) with:
//npm.pkg.github.com/:_authToken=YOUR_GITHUB_TOKEN
```

Then install:

```bash
npm install @whykusanagi/corrupted-theme
```

**Note:** You'll need a GitHub personal access token with `read:packages` permission. [Create one here](https://github.com/settings/tokens/new) (select `read:packages` scope).

Then import in your CSS:

```css
@import '@whykusanagi/corrupted-theme';
```

Or import specific modules:

```css
@import '@whykusanagi/corrupted-theme/variables';
@import '@whykusanagi/corrupted-theme/components';
```

### via CDN (when deployed)

```html
<link rel="stylesheet" href="https://s3.whykusanagi.xyz/corrupted-theme/theme.css">
```

### via GitHub Raw CDN

```html
<link rel="stylesheet" href="https://raw.githubusercontent.com/whykusanagi/corrupted-theme/main/src/css/theme.css">
```

### Copy & Customize

Copy the `src/css` folder to your project and import locally:

```css
@import './css/theme.css';
```

## File Structure

```
src/css/
├── variables.css       # CSS variables (colors, spacing, z-index)
├── typography.css      # Font hierarchy and text styles
├── glassmorphism.css   # Glass effect utilities
├── animations.css      # Keyframes and transitions
├── components.css      # Reusable UI components
├── utilities.css       # Utility classes
└── theme.css           # Main entry point (imports all above)
```

## CSS Variables

All colors and design tokens are exposed as CSS variables for easy customization:

```css
:root {
  /* Colors */
  --accent: #d94f90;
  --accent-light: #e86ca8;
  --accent-dark: #b61b70;

  /* Backgrounds */
  --bg: #0a0a0a;
  --bg-secondary: #0f0f1a;
  --glass: rgba(20, 12, 40, 0.7);
  --glass-light: rgba(28, 18, 48, 0.5);

  /* Text */
  --text: #f5f1f8;
  --text-secondary: #b8afc8;
  --text-muted: #7a7085;
}
```

### Customize

Override variables in your own CSS:

```css
:root {
  --accent: #your-custom-color;
  --text: #your-text-color;
}
```

## Components

### Buttons

```html
<button class="btn">Primary Button</button>
<button class="btn secondary">Secondary Button</button>
<button class="btn sm">Small Button</button>
<button class="btn lg block">Full Width Large</button>
```

### Cards

```html
<div class="card">
  <h3>Card Title</h3>
  <p>Card content goes here</p>
</div>

<div class="card lg">
  <h3>Large Card</h3>
  <p>With more padding</p>
</div>
```

### Glass Effects

```html
<div class="frosted-card">
  <h3>Glassmorphism Card</h3>
  <p>With backdrop blur effect</p>
</div>

<div class="glass-container">
  Any content with glass effect
</div>
```

### Badges

```html
<span class="badge">Default</span>
<span class="badge primary">Primary</span>
<span class="badge success">Success</span>
<span class="badge warning">Warning</span>
<span class="badge error">Error</span>
```

### Utilities

```html
<div class="flex-center gap-md">
  <button class="btn">Button 1</button>
  <button class="btn secondary">Button 2</button>
</div>

<div class="max-w-4xl mx-auto p-xl">
  <h2 class="text-center mb-lg">Centered Content</h2>
  <p class="text-secondary">Secondary text color</p>
</div>
```

## Animations

Available animation classes:

```html
<div class="fade-in">Fades in</div>
<div class="slide-in">Slides in from bottom</div>
<div class="slide-in-left">Slides in from left</div>
<div class="scale-in">Scales in</div>
<div class="glitch-word" data-text="Glitch">Glitch</div>
<div class="float">Floats up and down</div>
```

## Customization

### Change Primary Accent Color

```css
:root {
  --accent: #your-pink;
  --accent-light: #your-pink-light;
  --accent-dark: #your-pink-dark;
}
```

### Create Custom Component

```css
.my-card {
  @extend .card;
  background: var(--glass-light);
  border-color: var(--border-light);
}
```

Or use the utility classes:

```html
<div class="glass p-xl rounded-xl shadow-lg">
  Custom container
</div>
```

## Browser Support

- Chrome/Edge 76+
- Firefox 55+
- Safari 9+
- Mobile browsers (iOS 13+, Android 10+)

**Note:** CSS Variables and `backdrop-filter` require modern browser support. Older browsers will see graceful fallbacks.

## Accessibility

- WCAG AA color contrast ratios
- Semantic HTML structure
- Focus states for keyboard navigation
- Reduced motion support (`prefers-reduced-motion`)

## License

MIT © whykusanagi

## Contributing

Contributions are welcome! Please follow these guidelines:

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test in multiple browsers
5. Submit a pull request

## Support

For issues, feature requests, or questions:
- GitHub Issues: [corrupted-theme/issues](https://github.com/whykusanagi/corrupted-theme/issues)
- Email: contact@whykusanagi.xyz

## Celeste Widget Integration

This package includes the Celeste AI chat widget with secure backend proxy authentication.

**See [docs/CELESTE_WIDGET.md](./docs/CELESTE_WIDGET.md) for complete setup, configuration, deployment, and troubleshooting.**

Quick links:
- [Quick Start](./docs/CELESTE_WIDGET.md#quick-start)
- [Configuration](./docs/CELESTE_WIDGET.md#configuration)
- [Docker Deployment](./docs/CELESTE_WIDGET.md#deployment)
- [Security](./docs/CELESTE_WIDGET.md#security)
- [Troubleshooting](./docs/CELESTE_WIDGET.md#troubleshooting)

### Quick Start

```bash
# Docker
docker build -t my-theme:latest .
docker run -d \
  -p 8000:8000 \
  -e CELESTE_AGENT_KEY="your-key" \
  -e CELESTE_AGENT_ID="your-id" \
  -e CELESTE_AGENT_BASE_URL="https://api-url" \
  my-theme:latest
```

### Local Development

```bash
# Terminal 1: Start proxy (5000)
CELESTE_AGENT_KEY="..." node scripts/celeste-proxy-server.js

# Terminal 2: Start static server (8000)
npm run dev:static
```

The widget automatically detects the proxy URL and integrates seamlessly. See [CELESTE_WIDGET_SETUP.md](./docs/CELESTE_WIDGET_SETUP.md) for full details.

## Related Projects

- [whykusanagi.xyz](https://whykusanagi.xyz) - Portfolio site using this theme
- [celesteCLI](https://github.com/whykusanagi/celesteCLI) - AI assistant that works with this theme

---

Made with 💎 by [whykusanagi](https://whykusanagi.xyz)
