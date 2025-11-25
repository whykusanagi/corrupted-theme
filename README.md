# Corrupted Theme

A production-ready glassmorphic design system for cinematic, cyberpunk-inspired applications. Built as a drop-in CSS framework with JS enhancements, Docker showcase, and npm distribution standards on par with Meta/Google/Netflix internal libraries.

## Table of Contents
1. [Overview](#overview)
2. [Installation](#installation)
3. [Project Architecture](#project-architecture)
4. [Base Layout & Background](#base-layout--background)
5. [CSS & JS Imports](#css--js-imports)
6. [Component Quick Reference](#component-quick-reference)
7. [Animations & Experience Layer](#animations--experience-layer)
8. [Nikke Utilities](#nikke-utilities)
9. [Customization & Tokens](#customization--tokens)
10. [Coding Standards](#coding-standards)
11. [Development Workflow](#development-workflow)
12. [Testing & QA Expectations](#testing--qa-expectations)
13. [Support](#support)
14. [Celeste Widget Integration](#celeste-widget-integration-optional)
15. [License](#license)

## Overview
- **Glassmorphism-first** visual language with layered depth, gradients, and scanlines.
- **Systemized tokens** (`src/css/variables.css`) for colors, typography, spacing, motion, and elevation.
- **Bootstrap-scale coverage** of components (navigation, forms, data display, API docs, Nikke-specific UI).
- **First-visit cinematic experiences** via `corrupted-text.js` and `corruption-loading.js`.
- **WCAG AA** compliance, motion safety, and keyboard support baked in.
- **Dockerized showcase** at `examples/showcase-complete.html` for instant QA.

## Installation
### npm (public registry)
```bash
npm install @whykusanagi/corrupted-theme
```
```css
@import '@whykusanagi/corrupted-theme';
/* or scoped imports */
@import '@whykusanagi/corrupted-theme/variables';
@import '@whykusanagi/corrupted-theme/components';
```
> Tip: make sure you are logged in with `npm login` if the package is private. No `.npmrc` token is needed for the public release.

### CDN (when mirrored)
```html
<link rel="stylesheet" href="https://s3.whykusanagi.xyz/corrupted-theme/theme.css">
```

### Manual Copy
Copy `src/css` into your project (or use `dist/theme.min.css`) and import it locally.

## Project Architecture
```
.
├── src/
│   ├── css/
│   │   ├── variables.css        # design tokens
│   │   ├── typography.css       # font stack + hierarchy
│   │   ├── glassmorphism.css    # shared glass utilities
│   │   ├── animations.css       # motion + corruption keyframes
│   │   ├── components.css       # UI primitives + layouts
│   │   ├── utilities.css        # spacing, flex, layout utilities
│   │   └── theme.css            # entry point (imports all modules)
│   └── lib/
│       ├── corrupted-text.js    # multi-language glitch animation
│       └── corruption-loading.js# cinematic loading curtain
├── dist/theme.min.css            # postcss + cssnano build output
├── examples/showcase-complete.html
├── scripts/static-server.js      # ESM static server (Docker)
└── docs/COMPONENTS_REFERENCE.md  # exhaustive snippets
```

**npm scripts**
- `npm run build` – compiles `dist/theme.min.css`
- `npm run watch` – rebuilds on change (dev use)
- `npm run dev:static` – serves `/examples` (port 8000)
- `npm run dev:proxy` – Celeste proxy (port 5000)

## Base Layout & Background
```html
<body>
  <video class="background-media" autoplay muted loop playsinline>
    <source src="/media/corruption-loop.mp4" type="video/mp4" />
  </video>
  <div class="glass-backdrop"></div>
  <main class="app-shell"><!-- your glass UI --></main>
</body>
```
```css
html, body { min-height: 100vh; background: var(--bg); margin: 0; }
.background-media { position: fixed; inset: 0; object-fit: cover; z-index: -2; }
.glass-backdrop { position: fixed; inset: 0; background: linear-gradient(180deg, rgba(5,0,16,.85), rgba(10,10,10,.9)); z-index: -1; }
.app-shell { position: relative; z-index: 1; padding: clamp(1.5rem, 3vw, 3rem); backdrop-filter: blur(0); }
```
Use `.app-shell` as the only stacking context above the backdrop so containers never block the video/image layer.

## CSS & JS Imports
```html
<link rel="stylesheet" href="@whykusanagi/corrupted-theme/dist/theme.min.css">
<script type="module" src="@whykusanagi/corrupted-theme/src/lib/corrupted-text.js"></script>
<script type="module" src="@whykusanagi/corrupted-theme/src/lib/corruption-loading.js"></script>
```
```js
import { initCorruptedText } from '@whykusanagi/corrupted-theme/src/lib/corrupted-text.js';
import { showCorruptionLoading } from '@whykusanagi/corrupted-theme/src/lib/corruption-loading.js';

document.addEventListener('DOMContentLoaded', () => {
  initCorruptedText();                      // re-init if you stream new DOM
  // showCorruptionLoading({ force: true }); // force-run outside 72h cadence
});
```

## Component Quick Reference
The snippets below mirror the canonical showcase. For the full catalog (tabs, modals, tables, API docs, Nikke cards, etc.) keep `docs/COMPONENTS_REFERENCE.md` open beside this README.

### Glass Kit
```html
<div class="glass-card p-xl">
  <h3>Glass Card</h3>
  <p>Enhanced glass depth layer.</p>
  <input class="glass-input" placeholder="glass input" />
  <button class="glass-button">Primary Action</button>
  <pre class="glass-code">const example = 'Hello';</pre>
</div>
```

### Buttons & Utilities
```html
<div class="flex-center gap-md">
  <button class="btn">Primary</button>
  <button class="btn secondary">Secondary</button>
  <button class="btn ghost">Ghost</button>
  <button class="btn sm">Compact</button>
  <button class="btn lg block">Full Width</button>
</div>
```

### Forms
```html
<form class="glass-card p-xl">
  <label>Name</label>
  <input type="text" class="glass-input" required>
  <label>Message</label>
  <textarea class="glass-input" rows="3"></textarea>
  <button class="glass-button">Send</button>
</form>
```

### Navigation
```html
<nav class="navbar">
  <div class="navbar-content">
    <a class="navbar-logo" href="/">whyku</a>
    <ul class="navbar-links">
      <li><a href="#glass" class="active">Glass</a></li>
      <li><a href="#components">Components</a></li>
      <li class="has-submenu">
        <a href="#products">Products <i class="fas fa-chevron-down"></i></a>
        <div class="submenu">
          <a href="#one">Product 1</a>
          <a href="#two">Product 2</a>
        </div>
      </li>
    </ul>
  </div>
</nav>
<button class="navbar-toggle" onclick="toggleNavbar(this)">
  <span class="icon"><span></span><span></span><span></span></span>
</button>
<ul class="navbar-links"><!-- mobile nav --></ul>
```
```js
function toggleNavbar(button) {
  const menu = document.querySelector('.navbar-links');
  menu.classList.toggle('active');
  button.classList.toggle('active');
}
```

### Dropdown
```html
<div class="dropdown">
  <button class="dropdown-toggle" onclick="toggleDropdown(this)">Menu <i class="fas fa-chevron-down"></i></button>
  <div class="dropdown-menu">
    <a class="dropdown-item">Action</a>
    <a class="dropdown-item">Settings</a>
    <div class="dropdown-divider"></div>
    <a class="dropdown-item">Logout</a>
  </div>
</div>
```
```js
function toggleDropdown(button) {
  const menu = button.nextElementSibling;
  const open = menu.classList.contains('active');
  document.querySelectorAll('.dropdown-menu').forEach(m => m.classList.remove('active'));
  document.querySelectorAll('.dropdown-toggle').forEach(b => b.classList.remove('active'));
  if (!open) {
    menu.classList.add('active');
    button.classList.add('active');
  }
}
document.addEventListener('click', e => {
  if (!e.target.closest('.dropdown')) {
    document.querySelectorAll('.dropdown-menu').forEach(m => m.classList.remove('active'));
    document.querySelectorAll('.dropdown-toggle').forEach(b => b.classList.remove('active'));
  }
});
```

### Data & API
```html
<table class="table table-striped">
  <thead><tr><th>Name</th><th>Email</th><th>Status</th></tr></thead>
  <tbody>
    <tr><td>Eve</td><td>eve@demo.com</td><td><span class="badge success">Active</span></td></tr>
    <tr><td>Dan</td><td>dan@demo.com</td><td><span class="badge warning">Pending</span></td></tr>
  </tbody>
</table>

<div class="api-endpoint">
  <div class="flex items-center gap-md">
    <span class="api-method get">GET</span>
    <code class="api-path">/api/v1/units</code>
  </div>
  <p class="api-description">Retrieve a list of units.</p>
  <div class="api-param">
    <span class="api-param-name">element</span>
    <span class="api-param-type">string</span>
    <span class="api-param-required">optional</span>
    <p class="api-param-description">Filter by element type.</p>
  </div>
  <div class="api-response">
    <div class="api-response-title">200 OK</div>
    <pre class="api-response-code">{"data": []}</pre>
  </div>
</div>
```

### Corrupted Text & Loader
```html
<span class="corrupted-text" data-text="CORRUPTED">CORRUPTED</span>
<span class="glitch-kanji">
  <span class="glitch-word" data-text="CORRUPTED TEXT">CORRUPTED TEXT</span>
</span>
```
```html
<video class="background-media" autoplay muted loop playsinline>
  <source src="/media/corruption-loop.mp4" type="video/mp4" />
</video>
<script type="module" src="@whykusanagi/corrupted-theme/src/lib/corruption-loading.js"></script>
<script>
showCorruptionLoading();                // auto once every 72h
// showCorruptionLoading({ force: true });
</script>
```
Japanese overlay text is sourced from the lewd phrase array inside `examples/showcase-complete.html`; supply your own by updating the data attribute or reusing the script snippet.

## Animations & Experience Layer
Class | Behavior
--- | ---
`.fade-in`, `.fade-up`, `.slide-in-left/right`, `.scale-in` | Standard entrance motions synchronized to `var(--transition)`
`.glitch-word`, `.glitch-kanji` | Fragmented glitch with horizontal scanlines + JP overlays
`.corrupted-text`, `.corrupted-strong` | Brute-force corruption effect for headings and pills
`.scanlines`, `.tear`, `.data-corrupt` | Utility effects inspired by whykusanagi.xyz hero
`.spinner`, `.loading-bar`, `.progress-bar` | Loading indicators with shimmer + accent variants
`.corruption-loading` (JS) | Full-screen loader with 72h replay timer
`.corrupted-multilang` (JS) | First-visit Japanese/English/Romaji cycling text

## Nikke Utilities
```html
<div class="element-pills">
  <button class="element-pill water">Water</button>
  <button class="element-pill wind active">Wind</button>
  <button class="element-pill iron">Iron</button>
  <button class="element-pill electric">Electric</button>
  <button class="element-pill fire">Fire</button>
</div>
<div class="team-position-cards">
  <div class="position-card filled">
    <div class="position-header">
      <span class="position-number">1</span>
      <span class="position-label">Front Left</span>
    </div>
    <div class="position-content">
      <div class="unit-display">
        <div class="unit-name">Scarlet Priest Abe</div>
      </div>
      <button class="remove-unit" aria-label="Remove unit">×</button>
    </div>
  </div>
</div>
```
All Nikke-specific helpers live alongside the main utilities (`src/css/nikke-utilities.css`) and observe the same token set, so there are no visual disconnects between game-specific and general UI.

## Customization & Tokens
Override only the tokens you need. The defaults intentionally mirror the showcase.
```css
:root {
  --accent: #ff5fb0;
  --accent-light: #ff8cd0;
  --accent-dark: #c71c7d;
  --glass: rgba(15, 10, 25, 0.65);
  --glass-light: rgba(24, 14, 42, 0.45);
  --glass-darker: rgba(10, 5, 20, 0.65);
  --text: #f4e9ff;
  --text-secondary: #b8afc8;
  --transition-normal: 0.3s ease;
  --transition-fast: 0.15s ease;
}
```
Utilities (`src/css/utilities.css`) provide spacing (`.p-xl`, `.gap-md`), layout (`.flex`, `.grid`), and elevation helpers so you rarely write bespoke CSS.

## Coding Standards
These guidelines keep contributions aligned with enterprise frameworks:
- **CSS architecture**: component classes are flat (`.btn.secondary`), tokens live in `variables.css`, and utilities never override component styles.
- **Naming**: prefer descriptive nouns (e.g., `.api-endpoint`, `.glass-card`) and suffix modifiers with dot notation (`.btn.secondary`). Avoid chained hyphen variants unless the base class does not apply (`.badge-method`).
- **JavaScript**: all helper scripts are ES modules, side-effect-free, and expose initialization functions. Never mutate global scope outside a guarded `DOMContentLoaded` block.
- **Accessibility**: every interactive component includes focus styles, ARIA labels where relevant, and respects `prefers-reduced-motion` fallbacks.
- **Performance**: animations use `transform`/`opacity`, heavy filters are scoped to small elements, and layout thrashers are avoided.
- **Documentation**: README + `docs/COMPONENTS_REFERENCE.md` are the single sources of truth. Additions must include runnable snippets and token usage notes.
- **Versioning**: update `CHANGELOG.md` with semantic sections (`Added`, `Changed`, `Fixed`) before publishing.

## Development Workflow
```bash
npm install          # install dependencies
npm run build        # compile CSS bundle
npm run watch        # dev rebuild loop
npm run dev:static   # serve /examples on :8000
npm run dev:proxy    # optional Celeste proxy on :5000

# Docker showcase
docker build -t corrupted-theme:latest .
docker run -d -p 8000:8000 --name corrupted-theme corrupted-theme:latest
```
- The Docker container automatically serves `examples/showcase-complete.html`.
- Provide `CELESTE_*` env vars to exercise the widget proxy inside the same container.

## Testing & QA Expectations
- **Visual regression**: validate against `examples/showcase-complete.html` in latest Chrome, Firefox, Safari, and a mobile viewport.
- **Accessibility**: run `tab` sweeps, screen reader spot checks, and `prefers-reduced-motion` toggles.
- **Performance**: Lighthouse performance budget ≥ 90, no long-running animations on background threads.
- **Animation review**: ensure the first-visit corrupted text + loader remain opt-in via JS flags for SPA integrations.

## Support
- GitHub Issues: [corrupted-theme/issues](https://github.com/whykusanagi/corrupted-theme/issues)
- Email: contact@whykusanagi.xyz

## Celeste Widget Integration (Optional)
```bash
# Build + run showcase with widget + proxy
docker build -t corrupted-theme:latest .
docker run -d \
  -p 8000:8000 \
  -e CELESTE_AGENT_KEY="your-key" \
  -e CELESTE_AGENT_ID="your-id" \
  -e CELESTE_AGENT_BASE_URL="https://api.yourdomain.com" \
  corrupted-theme:latest

# Local split setup
CELESTE_AGENT_KEY="..." node scripts/celeste-proxy-server.js   # port 5000
npm run dev:static                                             # port 8000
```
Environment variables are the only requirement; the widget auto-detects the proxy URL exposed by `scripts/celeste-proxy-server.js`.

## License
MIT © whykusanagi

---
Made with 💎 by [whykusanagi](https://whykusanagi.xyz)
