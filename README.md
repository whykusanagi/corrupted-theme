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
9. [Extension Components](#extension-components)
10. [Customization & Tokens](#customization--tokens)
11. [Coding Standards](#coding-standards)
12. [Development Workflow](#development-workflow)
13. [Testing & QA Expectations](#testing--qa-expectations)
14. [Support](#support)
15. [Celeste Widget Integration](#celeste-widget-integration-optional)
16. [License](#license)

<div align="center" style="margin: 2rem 0;">

![Corrupted Theme - Glassmorphic Design System](https://s3.whykusanagi.xyz/art/cyber_sailor_moon_trans.png)

</div>

## Overview
- **Glassmorphism-first** visual language with layered depth, gradients, and scanlines.
- **Systemized tokens** (`src/css/variables.css`) for colors, typography, spacing, motion, and elevation.
- **Bootstrap-scale coverage** of components (navigation, forms, data display, API docs, Nikke-specific UI).
- **Buffer corruption effects** with SFW/NSFW phrase modes (Pattern 1 & 2 from spec).
- **WCAG AA** compliance, motion safety, and keyboard support baked in.
- **Dockerized showcase** at `examples/showcase-complete.html` for instant QA.

### Content Warnings

This package includes two corruption animation modes:

**SFW Mode (Default)**
- Playful anime-style expressions
- Cute/teasing phrases
- Atmospheric corruption themes
- Safe for professional and public projects

**NSFW Mode (Opt-in Required)**
- ⚠️ **18+ Content Warning**
- Explicit intimate/sexual phrases
- Loss of control themes
- **NOT suitable for:**
  - Professional/corporate projects
  - Public streams without 18+ rating
  - Educational contexts
  - All-ages content

**All examples and default behavior use SFW mode.** NSFW requires explicit `{ nsfw: true }` configuration.

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

### Static Background
```html
<body>
  <div class="glass-backdrop"></div>
  <main class="app-shell"><!-- your glass UI --></main>
</body>
```

### Video Background
```html
<body>
  <video class="background-media" autoplay muted loop playsinline>
    <source src="/media/corruption-loop.mp4" type="video/mp4" />
  </video>
  <div class="glass-backdrop"></div>
  <main class="app-shell"><!-- your glass UI --></main>
</body>
```

### Required CSS
```css
html, body { min-height: 100vh; background: var(--bg); margin: 0; }
.background-media { position: fixed; inset: 0; object-fit: cover; z-index: var(--z-negative); }
.glass-backdrop { position: fixed; inset: 0; background: linear-gradient(180deg, rgba(5,0,16,.85), rgba(10,10,10,.9)); z-index: var(--z-background); }
.app-shell { position: relative; z-index: var(--z-elevated); padding: clamp(1.5rem, 3vw, 3rem); backdrop-filter: blur(0); }
```

### Video Backgrounds with Navigation

When using video backgrounds, place the navbar **outside** `.app-shell` for proper z-index stacking:

```html
<body>
  <!-- Background layer -->
  <video class="background-media" autoplay muted loop playsinline>
    <source src="/media/corruption-loop.mp4" type="video/mp4" />
  </video>
  <div class="glass-backdrop"></div>
  
  <!-- Navigation MUST be outside app-shell for proper stacking -->
  <nav class="navbar">
    <div class="navbar-content">
      <a class="navbar-logo" href="/">Brand</a>
      <ul class="navbar-links">
        <li><a href="#home" class="active">Home</a></li>
        <li><a href="#about">About</a></li>
        <li><a href="#contact">Contact</a></li>
      </ul>
    </div>
  </nav>
  
  <!-- Main content -->
  <main class="app-shell">
    <!-- your glass UI components -->
  </main>
</body>
```

### Z-Index Hierarchy

The theme uses a systematic z-index scale defined in `variables.css`:

| Token | Value | Purpose |
|-------|-------|---------|
| `--z-negative` | `-2` | Background media (video/image) |
| `--z-background` | `-1` | Glass backdrop overlay |
| `--z-base` | `0` | Default stacking |
| `--z-elevated` | `1` | App shell and content |
| `--z-navbar` | `1000` | Navigation (always above content) |
| `--z-modal` | `1000` | Modals and overlays |

> **Important:** The navbar uses `z-index: 1000` to ensure it always appears above all content, including video backgrounds and elevated containers.

## CSS & JS Imports

### Method 1: Single File Import (Recommended)

The simplest approach — import everything in one line:

```html
<!-- HTML -->
<link rel="stylesheet" href="node_modules/@whykusanagi/corrupted-theme/dist/theme.min.css">
```

```css
/* CSS */
@import '@whykusanagi/corrupted-theme';
```

✅ **Recommended for most projects.** Includes all styles in the correct order automatically.

### Method 2: Modular Imports (Advanced)

Import only the modules you need for smaller bundle sizes. 

> ⚠️ **CRITICAL: Import order matters!** Modules have dependencies that require specific ordering.

#### CSS @import Syntax
```css
/* Correct order (matches theme.css structure) */
@import '@whykusanagi/corrupted-theme/variables';     /* 1. Foundation tokens */
@import '@whykusanagi/corrupted-theme/typography';    /* 2. Font styles */
@import '@whykusanagi/corrupted-theme/glassmorphism'; /* 3. Glass effects */
@import '@whykusanagi/corrupted-theme/animations';    /* 4. Keyframes - MUST come before components */
@import '@whykusanagi/corrupted-theme/components';    /* 5. UI components - MUST come after animations */
@import '@whykusanagi/corrupted-theme/utilities';     /* 6. Utility classes */
```

#### HTML Link Tags
```html
<!-- Correct order (matches theme.css structure) -->
<link rel="stylesheet" href="node_modules/@whykusanagi/corrupted-theme/src/css/variables.css">
<link rel="stylesheet" href="node_modules/@whykusanagi/corrupted-theme/src/css/typography.css">
<link rel="stylesheet" href="node_modules/@whykusanagi/corrupted-theme/src/css/glassmorphism.css">
<link rel="stylesheet" href="node_modules/@whykusanagi/corrupted-theme/src/css/animations.css">    <!-- MUST come before components -->
<link rel="stylesheet" href="node_modules/@whykusanagi/corrupted-theme/src/css/components.css">    <!-- MUST come after animations -->
<link rel="stylesheet" href="node_modules/@whykusanagi/corrupted-theme/src/css/utilities.css">
```

#### Why Order Matters
- `components.css` uses animation keyframes defined in `animations.css`
- If `components.css` loads before `animations.css`, spinner and loading animations won't work
- Always verify order by checking `src/css/theme.css` (shows canonical import structure)

### JavaScript Imports

```html
<!-- HTML -->
<script type="module" src="@whykusanagi/corrupted-theme/src/lib/corrupted-text.js"></script>
<script type="module" src="@whykusanagi/corrupted-theme/src/lib/corruption-loading.js"></script>
```

```js
// ES Modules
import { initCorruptedText } from '@whykusanagi/corrupted-theme/src/lib/corrupted-text.js';
import { showCorruptionLoading } from '@whykusanagi/corrupted-theme/src/lib/corruption-loading.js';

document.addEventListener('DOMContentLoaded', () => {
  initCorruptedText();                       // Initialize glitch text effects
  // showCorruptionLoading({ force: true }); // Force loader outside 72h cadence
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

### Corrupted Text & Buffer Corruption

**Pattern 1: Character-Level Corruption (Visual Glitch)**
```html
<!-- Multi-language cycling with character-level glitch -->
<span class="corrupted-multilang"
      data-english="Hello World"
      data-romaji="konnichiwa"
      data-hiragana="こんにちは"
      data-katakana="コンニチハ"
      data-kanji="今日は">
</span>

<script type="module" src="@whykusanagi/corrupted-theme/src/core/corrupted-text.js"></script>
```

**Pattern 2: Phrase Flickering (Buffer Corruption)**
```html
<!-- Typing animation with SFW phrase buffer corruption -->
<div class="typing-output" id="typing1"></div>

<script type="module">
import { TypingAnimation } from '@whykusanagi/corrupted-theme/src/core/typing-animation.js';

const typing = new TypingAnimation(document.getElementById('typing1'), {
    typingSpeed: 40,      // chars/sec
    glitchChance: 0.08,   // 8% buffer corruption
    nsfw: false           // SFW mode (default)
});

typing.start('Neural corruption detected... System Online');
</script>
```

**⚠️ Content Classification:**
- **SFW Mode (Default)**: Cute, playful, atmospheric phrases - safe for all audiences
- **NSFW Mode (Opt-in)**: Explicit 18+ content - requires `{ nsfw: true }` flag

See `examples/basic/` for SFW examples and `examples/advanced/nsfw-corruption.html` for NSFW demo.

## Animations & Experience Layer

### Standard CSS Animations
Class | Behavior
--- | ---
`.fade-in`, `.fade-up`, `.slide-in-left/right`, `.scale-in` | Standard entrance motions synchronized to `var(--transition)`
`.glitch-word`, `.glitch-kanji` | Fragmented glitch with horizontal scanlines + JP overlays
`.corrupted-text`, `.corrupted-strong` | Brute-force corruption effect for headings and pills
`.scanlines`, `.tear`, `.data-corrupt` | Utility effects inspired by whykusanagi.xyz hero
`.spinner`, `.loading-bar`, `.progress-bar` | Loading indicators with shimmer + accent variants

### JavaScript Corruption Components

**CorruptedText** - Pattern 1: Character-Level Corruption
- Visual glitch effect using random characters (Katakana, Hiragana, symbols)
- Always SFW (no phrases, just character-level noise)
- Cycles through multi-language variants
- Class: `.corrupted-multilang`

**TypingAnimation** - Pattern 2: Phrase Flickering (Buffer Corruption)
- Simulates neural network decoding corrupted data buffer
- Phrases flicker through before revealing final text
- SFW mode (default): Cute, playful, atmospheric phrases
- NSFW mode (opt-in): Explicit 18+ content with `{ nsfw: true }`
- Color: Magenta (#d94f90) for SFW, Purple (#8b5cf6) for NSFW

**Corruption Phrases Library**
- Normalized SFW/NSFW phrase sets
- Separate exports for each mode
- Helper functions for random phrase selection
- Module: `src/core/corruption-phrases.js`

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

## Extension Components

Production-tested components from whykusanagi.xyz for galleries, social links, countdowns, and more. All extension styles are included in `theme.css` or can be imported separately via `extensions.css`.

### Gallery System

Responsive gallery grid with filtering, lightbox, and NSFW content support.

```html
<div class="filter-bar">
  <button class="filter-btn active" data-filter="all">All</button>
  <button class="filter-btn" data-filter="photos">Photos</button>
</div>

<div class="gallery-container" id="my-gallery">
  <div class="gallery-item" data-tags="photos">
    <img src="image.jpg" alt="Description">
    <div class="gallery-caption">Caption text</div>
  </div>
</div>
```

```javascript
import { initGallery } from '@whykusanagi/corrupted-theme/gallery';

const gallery = initGallery('#my-gallery', {
  enableLightbox: true,
  enableNsfw: true,
  filterAnimation: true
});

gallery.filter('photos');     // Filter by category
gallery.openLightbox(0);      // Open first image
```

### Social Links List

Link-in-bio style layout with branded platform colors.

```html
<div class="social-links-container">
  <img src="avatar.jpg" class="profile-avatar">
  <h1 class="profile-name">@username</h1>
  <p class="profile-bio">Your bio here</p>
  <div class="link-list">
    <a href="#" class="link-item twitter"><i class="fab fa-twitter"></i> Twitter</a>
    <a href="#" class="link-item github"><i class="fab fa-github"></i> GitHub</a>
  </div>
</div>
```

### Countdown Widget

Event countdown with configurable shapes (diamond, circle, heart, star, hexagon, octagon).

```javascript
import { initCountdown } from '@whykusanagi/corrupted-theme/countdown';

initCountdown({
  config: {
    title: 'Launch Countdown',
    eventDate: '2025-04-01T00:00:00-07:00',
    completedMessage: 'Now Live!',
    character: {
      image: 'character.png',
      background: { type: 'diamond' }
    }
  }
});
```

### NSFW Content Blur

Click-to-reveal overlay for sensitive content.

```html
<div class="gallery-item nsfw-content" data-warning="18+ Click to View">
  <img src="sensitive-image.jpg" alt="Description">
</div>
```

See `examples/extensions-showcase.html` for interactive demos and `docs/COMPONENTS_REFERENCE.md` for complete API documentation.

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

## Celeste Widget Integration (Secure Proxy)
The theme ships with an optional Celeste AI widget that **never exposes credentials to the browser**. It relies on the hardened proxy bundle located in `celeste_widget_pack/`.

### Environment Variables (required)
| Variable | Purpose |
|----------|---------|
| `CELESTE_AGENT_KEY` | Bearer token for the Celeste API |
| `CELESTE_AGENT_ID` | Agent identifier (UUID) |
| `CELESTE_AGENT_BASE_URL` | API endpoint root |

> Store these via your platform’s secret manager (Vault, Doppler, AWS Secrets Manager, etc.). Never commit them or inject them into client-side code.

### Docker Workflow
```bash
docker build -t corrupted-theme:latest .

docker run -d \
  -p 8000:8000 \            # static showcase
  -p 5001:5000 \            # exposes proxy externally
  -e CELESTE_AGENT_KEY="$CELESTE_AGENT_KEY" \
  -e CELESTE_AGENT_ID="$CELESTE_AGENT_ID" \
  -e CELESTE_AGENT_BASE_URL="https://api.your-domain.com" \
  corrupted-theme:latest

# Visit http://localhost:8000 (UI) and http://localhost:5001/api/health (proxy)
```

### Local Development (split processes)
```bash
# Terminal 1 – proxy server (port defaults to 5000 inside container)
CELESTE_AGENT_KEY="..." \
CELESTE_AGENT_ID="..." \
CELESTE_AGENT_BASE_URL="..." \
PROXY_PORT=5000 node scripts/celeste-proxy-server.js

# Terminal 2 – static showcase
STATIC_PORT=8000 node scripts/static-server.js
```

### Security Guarantees
- Browser never receives `CELESTE_*` variables (verified via DevTools/HTML scans)
- All outbound API calls originate from the proxy (`/api/chat`, `/api/health`)
- Health endpoint surfaces status without leaking secrets
- Ready for Cloudflare Worker / Pages deployment (see secure pack doc)

For the full hardening guide—including architecture diagrams, Cloudflare steps, and troubleshooting—see `celeste_widget_pack/docs/CELESTE_WIDGET_SECURE_SETUP.md`.

## License
MIT © whykusanagi

---
Made with 💎 by [whykusanagi](https://whykusanagi.xyz)
