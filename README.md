# Corrupted Theme

A production-ready glassmorphic design system for cinematic, cyberpunk-inspired applications. Built as a drop-in CSS framework with JS enhancements, Docker showcase, and npm distribution standards on par with Meta/Google/Netflix internal libraries.

**🔗 Live Examples:** **[corrupted.whykusanagi.xyz](https://corrupted.whykusanagi.xyz/)** — every demo in `examples/` served on Cloudflare Workers. Start at the [Examples Index](https://corrupted.whykusanagi.xyz/examples/) or jump straight to [Buffer Corruption](https://corrupted.whykusanagi.xyz/examples/basic/typing-animation) (with 18+ toggle), [Character Corruption](https://corrupted.whykusanagi.xyz/examples/basic/corrupted-text), [GLSL Vortex](https://corrupted.whykusanagi.xyz/examples/advanced/glsl-vortex), or [Particle Background](https://corrupted.whykusanagi.xyz/examples/advanced/particles-bg).

## Table of Contents
1. [Overview](#overview)
2. [Installation](#installation)
3. [CDN Distribution](#cdn-distribution)
4. [Project Architecture](#project-architecture)
5. [Container Layout (0.2.0 Breaking Change)](#container-layout-020-breaking-change)
6. [Canonical Data (JSON Source of Truth)](#canonical-data-json-source-of-truth)
7. [NSFW Option Canonicalization](#nsfw-option-canonicalization)
8. [Base Layout & Background](#base-layout--background)
9. [CSS & JS Imports](#css--js-imports)
10. [Component Quick Reference](#component-quick-reference)
11. [Interactive Components](#interactive-components)
12. [Animations & Experience Layer](#animations--experience-layer)
13. [Lifecycle Management](#lifecycle-management)
14. [Nikke Utilities](#nikke-utilities)
15. [Extension Components](#extension-components)
16. [Customization & Tokens](#customization--tokens)
17. [Coding Standards](#coding-standards)
18. [Development Workflow](#development-workflow)
19. [Testing & QA Expectations](#testing--qa-expectations)
20. [Support](#support)
21. [Celeste Widget Integration](#celeste-widget-integration-optional)
22. [License](#license)

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

### CDN
```html
<!-- Pinned version (recommended for production) -->
<link rel="stylesheet"
      href="https://cdn.nikkers.cc/corrupted-theme/@0.2.1/dist/theme.min.css">

<!-- Floating @latest (use only for sites you control and update together) -->
<link rel="stylesheet"
      href="https://cdn.whykusanagi.xyz/corrupted-theme/@latest/dist/theme.min.css">
```

Use `cdn.nikkers.cc` for sites under `nikkers.cc`, and `cdn.whykusanagi.xyz` for sites under `whykusanagi.xyz` — same-origin loads skip CORS and need no extra CSP entries. See [CDN Distribution](#cdn-distribution) and [docs/CDN_CONSUMPTION.md](docs/CDN_CONSUMPTION.md) for full guidance.

### Manual Copy
Copy `src/css` into your project (or use `dist/theme.min.css`) and import it locally.

## CDN Distribution

corrupted-theme is served from a Cloudflare R2 bucket bound to two domains:

- **`cdn.whykusanagi.xyz`** — for sites under `whykusanagi.xyz`
- **`cdn.nikkers.cc`** — for sites under `nikkers.cc`

Both domains serve the same content. Use the domain that matches your site's root to keep the load same-origin, which avoids CORS preflights and simplifies CSP policy.

**Pinned version** (production-safe — breaking changes never auto-propagate):
```html
<link rel="stylesheet"
      href="https://cdn.nikkers.cc/corrupted-theme/@0.2.1/dist/theme.min.css">
<script type="module"
        src="https://cdn.nikkers.cc/corrupted-theme/@0.2.1/dist/corrupted-text.min.js"></script>
```

**Floating `@latest`** (first-party sites that publish together — updates within ~5 minutes):
```html
<link rel="stylesheet"
      href="https://cdn.whykusanagi.xyz/corrupted-theme/@latest/dist/theme.min.css">
```

For production hardening, add SRI hashes (published in `CHANGELOG.md` for each release; regenerate with `npm run generate-sri`). See [docs/CDN_CONSUMPTION.md](docs/CDN_CONSUMPTION.md) for the same-origin rule, CSP guidance, CORS allowlist, and JSON data fetching.

## Project Architecture
```
.
├── src/
│   ├── css/
│   │   ├── variables.css              # design tokens
│   │   ├── typography.css             # font stack + hierarchy
│   │   ├── glassmorphism.css          # glass utilities (dark/subtle/gradient + modifiers)
│   │   ├── animations.css             # motion + corruption keyframes (.glitch-word etc.)
│   │   ├── components.css             # UI primitives + layouts (incl. carousel)
│   │   ├── utilities.css              # spacing, flex, layout utilities
│   │   ├── toast.css                  # Toast notification styles (0.2.0)
│   │   ├── seamless-background.css    # multi-layer parallax tiled background (0.2.0)
│   │   └── theme.css                  # entry point (imports all modules)
│   ├── data/                          # canonical JSON source of truth (0.2.0)
│   │   ├── phrases.json               # SFW+NSFW phrases, 6 context pools × 3 languages
│   │   ├── charsets.json              # katakana / hiragana / kanji / symbols / blocks
│   │   ├── colors.json                # 6-hex palette + semantic-use map
│   │   └── schemas/                   # AJV schemas for each JSON file
│   ├── core/
│   │   ├── timer-registry.js          # lifecycle: tracked setTimeout/setInterval/rAF
│   │   ├── event-tracker.js           # lifecycle: tracked addEventListener
│   │   ├── corruption-charsets.js     # CorruptionCharsets registry (0.2.0)
│   │   ├── decrypt-reveal.js          # DecryptReveal fixed-length decryption (0.2.0)
│   │   ├── websocket-manager.js       # WebSocketManager auto-reconnect (0.2.0)
│   │   ├── random-utils.js            # randomPick / randomInt / shuffle … (0.2.0)
│   │   ├── time-utils.js              # formatTime / timeAgo / formatDuration … (0.2.0)
│   │   ├── clipboard-helpers.js       # copyWithFeedback (0.2.0)
│   │   └── url-state.js               # serializeFormToParams / buildShareUrl (0.2.0)
│   └── lib/
│       ├── animation-blocks.js        # 10 block classes: TitleDecoder, ProgressBar … (0.2.0)
│       ├── carousel.js                # carousel/slideshow with autoplay + swipe
│       ├── celeste-proxy.js           # Celeste CLI proxy integration
│       ├── celeste-widget.js          # Celeste chat widget
│       ├── character-corruption.js    # auto-corruption for individual characters
│       ├── clock-widget.js            # multi-timezone cycling clock (0.2.0)
│       ├── components.js              # modal, dropdown, tabs, collapse, accordion, toast
│       ├── corrupted-particles-background.js # auto-injector background particles (0.2.0)
│       ├── corrupted-particles.js     # Canvas 2D floating phrase particle background
│       ├── corrupted-text.js          # multi-language glitch animation
│       ├── corrupted-vortex.js        # WebGL raymarched spiral vortex shader
│       ├── corruption-loading.js      # cinematic loading curtain
│       ├── countdown-widget.js        # event countdown with shapes
│       ├── crt-effects.js             # CRT post-processing layer (0.2.0)
│       ├── event-bar.js               # scrolling event-ticker banner (0.2.0)
│       ├── gallery.js                 # gallery grid with filtering + lightbox
│       ├── lightbox.js                # standalone lightbox (extracted 0.2.0)
│       ├── logo-banner.js             # animated logo/title banner (0.2.0)
│       ├── nsfw-reveal.js             # age-gate click-to-reveal overlay (0.2.0)
│       ├── png-export.js              # exportElementAsPng (html2canvas peer dep, 0.2.0)
│       └── toast.js                   # Toast singleton (0.2.0)
├── dist/
│   ├── theme.min.css                  # postcss + cssnano build output
│   └── timer-registry.global.js       # UMD build for IIFE contexts (0.2.0)
├── cdn-worker/                        # Cloudflare Worker for @latest CDN routing (0.2.0)
├── examples/
│   ├── showcase-complete.html         # full design system demo
│   ├── interactive-components.html    # modal, dropdown, tabs, carousel demo
│   ├── basic/
│   │   ├── corrupted-text.html        # CorruptedText demo
│   │   ├── multi-gallery.html         # multi-instance gallery demo
│   │   └── typing-animation.html      # TypingAnimation demo (with NSFW toggle)
│   └── advanced/
│       ├── glsl-vortex.html           # CorruptedVortex WebGL demo
│       └── particles-bg.html          # CorruptedParticles demo
├── scripts/static-server.js           # ESM static server (Docker)
└── docs/
    ├── COMPONENTS_REFERENCE.md        # exhaustive component snippets (28+ entries)
    ├── CDN_CONSUMPTION.md             # CDN setup, same-origin rule, SRI, CSP
    ├── CROSS_LANGUAGE_CONTRACT.md     # phrases/charsets JSON schema + Go embed guide
    ├── MIGRATION_CONTAINER_0.2.0.md   # .container breaking change migration guide
    └── governance/                    # versioning, design governance, contribution guides
```

**npm scripts**
- `npm run build` – compiles `dist/theme.min.css`
- `npm run watch` – rebuilds on change (dev use)
- `npm run dev:static` – serves `/examples` (port 8000)
- `npm run dev:proxy` – Celeste proxy (port 5000)
- `npm run validate-data` – AJV schema validation for `src/data/*.json` (0.2.0)
- `npm run generate-sri` – generate SRI hashes for CDN consumers (0.2.0)
- `npm run publish-cdn` – upload `dist/` + `src/data/` to R2, bump `@latest` pointer (0.2.0)

## Container Layout (0.2.0 Breaking Change)

> **Breaking change.** The `.container` class is now structural-only in 0.2.0 — it applies `max-width`, `margin-inline: auto`, and horizontal padding, but **no grid layout**. Sites that previously relied on the implicit grid behavior must add a modifier class.

```css
/* 0.2.0 — base is structural only */
.container { max-width: 1200px; margin-inline: auto; padding-inline: 1rem; }

/* Opt-in modifiers */
.container--grid-2col   { display: grid; grid-template-columns: 1fr 1fr; gap: 2rem; }
.container--grid-3col   { display: grid; grid-template-columns: repeat(3,1fr); gap: 2rem; }
.container--with-bg     { background: var(--glass); border: 1px solid var(--border); border-radius: var(--radius-2xl); backdrop-filter: blur(15px); }
.container--fullscreen  { max-width: none; min-height: 100vh; }
.container--centered    { display: flex; flex-direction: column; align-items: center; justify-content: center; }
```

**Migration:** If you were forcing a 2-column grid, add `container--grid-2col`. If you had workaround rules that `unset`-ed `.container`, remove them — the base no longer fights downstream layouts. Pin to `^0.1.9` in the meantime if you cannot migrate yet.

See [docs/MIGRATION_CONTAINER_0.2.0.md](docs/MIGRATION_CONTAINER_0.2.0.md) for the full guide.

## Canonical Data (JSON Source of Truth)

0.2.0 introduces a `src/data/` layer that all internal corruption modules (and downstream Go consumers via `go:embed`) read from instead of maintaining inline arrays:

| File | Contents |
|------|----------|
| `src/data/phrases.json` | SFW + NSFW phrases across 6 context pools (`data`, `system`, `status`, `void`, `memory`, `glitch`) × 3 languages |
| `src/data/charsets.json` | katakana, hiragana, kanji, symbols, blocks |
| `src/data/colors.json` | 6-hex palette + semantic-use map |

The context-aware phrase API:

```js
import { getPhraseByContext } from '@whykusanagi/corrupted-theme/corruption-phrases';

// Pick a phrase from a specific context pool
const phrase = getPhraseByContext('system', false);        // SFW system pool
const nsfw   = getPhraseByContext('void',   true);         // NSFW void pool

// Or consume the JSON directly
import phrases from '@whykusanagi/corrupted-theme/data/phrases.json' with { type: 'json' };
const pool = phrases.sfw.japanese.status;
```

Each file has a `schemaVersion` field. Additive changes (new pool, new charset) bump the minor version; breaking changes bump the major version. Run `npm run validate-data` to verify the JSON against AJV schemas before publishing.

See [docs/CROSS_LANGUAGE_CONTRACT.md](docs/CROSS_LANGUAGE_CONTRACT.md) for the Go `go:embed` integration guide and stability guarantees.

## NSFW Option Canonicalization

**0.2.0 canonicalizes the NSFW option name to `nsfw` across all components.** The previous per-component names are deprecated aliases that emit a one-time `console.warn` and will be removed in 0.3.x.

| Component | Old (deprecated) | New (canonical) |
|-----------|-----------------|-----------------|
| `CorruptedParticles` | `includeLewd` | `nsfw` |
| `animation-blocks` | `lewdMode` | `nsfw` |
| `TypingAnimation` | `nsfw` | `nsfw` (unchanged) |
| `DecryptReveal` | — | — |

```js
// Correct — all components now use the same option name
new CorruptedParticles(canvas, { nsfw: false });   // was: { includeLewd: false }
new TitleDecoder(el, { nsfw: false });             // was: { lewdMode: false }
```

**All defaults are `nsfw: false`.** Opt-in to NSFW content only in 18+ or explicit-consent contexts.

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
@import '@whykusanagi/corrupted-theme/variables';          /* 1. Foundation tokens */
@import '@whykusanagi/corrupted-theme/typography';         /* 2. Font styles */
@import '@whykusanagi/corrupted-theme/glassmorphism';      /* 3. Glass effects */
@import '@whykusanagi/corrupted-theme/animations';         /* 4. Keyframes - MUST come before components */
@import '@whykusanagi/corrupted-theme/components';         /* 5. UI components - MUST come after animations */
@import '@whykusanagi/corrupted-theme/utilities';          /* 6. Utility classes */
/* 0.2.0 additions (opt-in) */
@import '@whykusanagi/corrupted-theme/toast-css';          /* Toast notification styles */
@import '@whykusanagi/corrupted-theme/seamless-background';/* Parallax tiled background */
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

```js
// Interactive components (modal, dropdown, tabs, collapse, accordion, toast)
import { initComponents, destroyComponents, showToast, toast }
  from '@whykusanagi/corrupted-theme/components-js';

// Carousel (separate module)
import { initCarousel } from '@whykusanagi/corrupted-theme/carousel';

// Corruption effects
import { initCorruptedText } from '@whykusanagi/corrupted-theme/corrupted-text';
import { initGallery, destroyGallery } from '@whykusanagi/corrupted-theme/gallery';
import { initCountdown } from '@whykusanagi/corrupted-theme/countdown';

// 0.2.0 — Drift reconvergence (canonical corruption layer)
import { CorruptionCharsets }  from '@whykusanagi/corrupted-theme/corruption-charsets';
import { DecryptReveal, decodeText }
                               from '@whykusanagi/corrupted-theme/decrypt-reveal';
import { CRTEffects, applyCRTGlow } from '@whykusanagi/corrupted-theme/crt-effects';
import { TitleDecoder, ProgressBar, ScanlineSweep, TerminalBoot, GlitchPulse,
         ASCIIBorder, SystemDiagnostic, LoadingBarMulti, DataTransmission, TerminalPrompt,
         playParallel, playSequence, playStaggered }
                               from '@whykusanagi/corrupted-theme/animation-blocks';
import CorruptedParticlesBackground
                               from '@whykusanagi/corrupted-theme/corrupted-particles-background';

// 0.2.0 — Widgets
import { Toast }               from '@whykusanagi/corrupted-theme/toast';
import { ClockWidget }         from '@whykusanagi/corrupted-theme/clock-widget';
import { EventBar }            from '@whykusanagi/corrupted-theme/event-bar';
import { LogoBanner }          from '@whykusanagi/corrupted-theme/logo-banner';
import { Lightbox }            from '@whykusanagi/corrupted-theme/lightbox';
import { NsfwReveal }          from '@whykusanagi/corrupted-theme/nsfw-reveal';
import { exportElementAsPng }  from '@whykusanagi/corrupted-theme/png-export';
import { WebSocketManager }    from '@whykusanagi/corrupted-theme/websocket-manager';

// 0.2.0 — Core utilities
import { randomPick, randomInt, shuffle }  from '@whykusanagi/corrupted-theme/random-utils';
import { formatTime12h, timeAgo }         from '@whykusanagi/corrupted-theme/time-utils';
import { copyWithFeedback }               from '@whykusanagi/corrupted-theme/clipboard-helpers';
import { buildShareUrl, applyParamsToForm } from '@whykusanagi/corrupted-theme/url-state';
```

Components auto-initialize on `DOMContentLoaded` when imported. For manual control:

```js
initComponents();    // scan DOM for data-ct-* attributes
destroyComponents(); // tear down all managers and tracked listeners
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

**Zero-JS (data attributes):**
```html
<div class="dropdown">
  <button class="dropdown-toggle" data-ct-toggle="dropdown">Menu</button>
  <div class="dropdown-menu">
    <a class="dropdown-item">Action</a>
    <a class="dropdown-item">Settings</a>
    <div class="dropdown-divider"></div>
    <a class="dropdown-item">Logout</a>
  </div>
</div>
```

**Manual JS (legacy):**
```html
<div class="dropdown">
  <button class="dropdown-toggle" onclick="toggleDropdown(this)">Menu</button>
  <div class="dropdown-menu">
    <a class="dropdown-item">Action</a>
  </div>
</div>
```
```js
function toggleDropdown(button) {
  const menu = button.nextElementSibling;
  const open = menu.classList.contains('active');
  document.querySelectorAll('.dropdown-menu').forEach(m => m.classList.remove('active'));
  document.querySelectorAll('.dropdown-toggle').forEach(b => b.classList.remove('active'));
  if (!open) { menu.classList.add('active'); button.classList.add('active'); }
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

<script type="module" src="@whykusanagi/corrupted-theme/src/lib/corrupted-text.js"></script>
```

**Pattern 2: Phrase Flickering (Buffer Corruption)**
```html
<!-- Typing animation with SFW phrase buffer corruption -->
<div class="typing-output" id="typing1"></div>

<script type="module">
import { TypingAnimation } from '@whykusanagi/corrupted-theme/typing-animation';

const typing = new TypingAnimation(document.getElementById('typing1'), {
    duration: 2000,            // 2s total typing pass
    bufferEnabled: true,       // always-on phrase buffer (default)
    bufferFlickerSpeed: 100,   // 100ms between buffer phrase swaps
    nsfw: false                // SFW mode (default)
});

typing.start('Neural corruption detected... System Online');
</script>
```

**⚠️ Content Classification:**
- **SFW Mode (Default)**: Cute, playful, atmospheric phrases - safe for all audiences
- **NSFW Mode (Opt-in)**: Explicit 18+ content - requires `{ nsfw: true }` flag

See `examples/basic/typing-animation.html` — it has a toggle switch at the top to opt into NSFW phrases (checkbox resets each page load per the explicit-opt-in spec).

### Drift Reconvergence — Canonical Corruption Layer (0.2.0)

#### CorruptionCharsets

Named charset registry backed by `src/data/charsets.json`.

```js
import { CorruptionCharsets } from '@whykusanagi/corrupted-theme/corruption-charsets';

CorruptionCharsets.katakana;  // primary corruption glyphs
CorruptionCharsets.standard;  // katakana + symbols (matrix-style)
CorruptionCharsets.soft;      // hiragana only (gentle degradation)
CorruptionCharsets.intense;   // kanji + blocks (heavy data-loss)
CorruptionCharsets.all;       // union of every set
```

See [COMPONENTS_REFERENCE.md](docs/COMPONENTS_REFERENCE.md#corruptioncharsets) for all sets.

#### DecryptReveal

Fixed-length decryption animation. The target string is shown at its final length from frame 1 (scrambled with charset characters), then progressively resolves left-to-right to the target text.

**Distinct from TypingAnimation** — TypingAnimation grows the string over time (streaming/typed reveal with phrase-buffer flicker in the not-yet-revealed tail). DecryptReveal keeps the string at final length and scrambles unrevealed positions.

```js
import { DecryptReveal, decodeText } from '@whykusanagi/corrupted-theme/decrypt-reveal';

const dr = new DecryptReveal({ charset: CorruptionCharsets.standard });

dr.decode(el, 'SYSTEM READY', { duration: 2000 });
dr.decode(el, 'アクセス許可', { duration: 3000, charset: CorruptionCharsets.kanji });
dr.stop();    // cancel all
dr.destroy(); // full teardown

// One-shot helper (no instance needed) — returns a cancel function
const cancel = decodeText(el, 'NEURAL CORE ONLINE', { duration: 1500 });
```

See [COMPONENTS_REFERENCE.md](docs/COMPONENTS_REFERENCE.md#decryptreveal) for full method table.

#### CRTEffects

CRT post-processing layer — scanlines, vignette, chromatic aberration, RGB split, screen shake.

```js
import { CRTEffects } from '@whykusanagi/corrupted-theme/crt-effects';

const crt = new CRTEffects(containerEl, { scanlines: true, vignette: true, flicker: false });
crt.start();
crt.screenShake(containerEl, 300, 5); // duration ms, intensity px
crt.destroy();
```

See [COMPONENTS_REFERENCE.md](docs/COMPONENTS_REFERENCE.md#crteffects) for the full options table.

#### animation-blocks (10 classes)

Composable animation blocks that return Promises. Mix with `playParallel` / `playSequence` / `playStaggered`.

```js
import {
  TitleDecoder, ProgressBar, ScanlineSweep, TerminalBoot, GlitchPulse,
  ASCIIBorder, SystemDiagnostic, LoadingBarMulti, DataTransmission, TerminalPrompt,
  playSequence,
} from '@whykusanagi/corrupted-theme/animation-blocks';

await playSequence([
  new TitleDecoder(el, { text: 'CORRUPTED STREAM', nsfw: false }),
  new ProgressBar(el,   { label: 'Loading...', duration: 2000 }),
  new TerminalBoot(el,  { lines: ['Initializing...', 'Ready.'] }),
]);
```

> `lewdMode` is a deprecated alias for `nsfw` — use `nsfw: true` in new code.

See [COMPONENTS_REFERENCE.md](docs/COMPONENTS_REFERENCE.md#animation-blocks) for all 10 class descriptions.

#### CorruptedParticlesBackground

Auto-injecting background particles (DPR=1 performance mode, sits behind blur layers).

```js
import CorruptedParticlesBackground from '@whykusanagi/corrupted-theme/corrupted-particles-background';

const bg = new CorruptedParticlesBackground({ nsfw: false, count: 25 });
// automatically inserts a fixed canvas before .glass-backdrop
bg.destroy();
```

See [COMPONENTS_REFERENCE.md](docs/COMPONENTS_REFERENCE.md#corruptedparticlesbackground).

### Widgets (0.2.0)

#### Toast

Singleton notification helper. Auto-mounts its own DOM container on first use.

```js
import { Toast } from '@whykusanagi/corrupted-theme/toast';

Toast.show('Saved');
Toast.success('Submitted!', { duration: 3000 });
Toast.error('Upload failed');
Toast.info('Loading…');
```

Import `@whykusanagi/corrupted-theme/toast-css` alongside (or include in your `theme.css` build). See [COMPONENTS_REFERENCE.md](docs/COMPONENTS_REFERENCE.md#toast).

#### ClockWidget

Cycling multi-timezone clock using `Intl.DateTimeFormat` for DST correctness.

```js
import { ClockWidget } from '@whykusanagi/corrupted-theme/clock-widget';

const widget = new ClockWidget(document.getElementById('clock'), {
  timezones: ['America/Los_Angeles', 'Europe/London'],
  cycleMs: 10000,
  format: '12h',
});
widget.start();
widget.destroy();
```

See [COMPONENTS_REFERENCE.md](docs/COMPONENTS_REFERENCE.md#clockwidget).

#### EventBar

Scrolling event-ticker banner with label + content + optional icon. Supports live `update()`.

```js
import { EventBar } from '@whykusanagi/corrupted-theme/event-bar';

const eb = new EventBar(document.getElementById('events'), {
  items: [{ label: 'Latest Follow', content: '@user1', icon: '★' }],
});
eb.update([{ label: 'Latest Tip', content: '$10.00', icon: '✦' }]);
eb.destroy();
```

See [COMPONENTS_REFERENCE.md](docs/COMPONENTS_REFERENCE.md#eventbar).

#### LogoBanner

Animated logo/title banner with five position presets and reveal animation.

```js
import { LogoBanner } from '@whykusanagi/corrupted-theme/logo-banner';

const banner = new LogoBanner(el, {
  src: '/assets/logo.png', subtitle: 'LIVE', position: 'top-right', animation: 'fade',
});
banner.show();
banner.update({ position: 'center' });
banner.destroy();
```

See [COMPONENTS_REFERENCE.md](docs/COMPONENTS_REFERENCE.md#logobanner).

#### Lightbox (standalone)

Extracted from `gallery.js` as its own module. Keyboard (Escape/arrows) + touch-swipe. `gallery.js` re-exports it for backward compat.

```js
import { Lightbox } from '@whykusanagi/corrupted-theme/lightbox';

const lb = new Lightbox(null, { onOpen: (img, i) => {}, onClose: () => {} });
lb.setImages([{ src: 'a.jpg', alt: 'A', caption: 'Caption' }]);
lb.open(0);
lb.destroy();
```

See [COMPONENTS_REFERENCE.md](docs/COMPONENTS_REFERENCE.md#lightbox-standalone).

#### PhraseCycle

Discrete phrase-state cycling. Replaces the entire element's text with phrase A, then phrase B, etc., at a fixed interval, then settles on `finalText`. Optional `loop: true` cycles forever without settling.

**Distinct from TypingAnimation and DecryptReveal:** TypingAnimation grows the string character-by-character (streaming/typed — string length increases over time). DecryptReveal shows the string at final length scrambled with charset characters and resolves left-to-right (char-level). PhraseCycle replaces the *entire element text* each tick — string length may vary between phrases.

Use for: loading screens (`Initializing... → Connecting... → Ready.`), boot sequences, "decrypting" preambles before a result is shown, glitch transitions between named states.

```js
import { PhraseCycle } from '@whykusanagi/corrupted-theme/phrase-cycle';

// Settling cycle: one pass then display finalText
const cycle = new PhraseCycle(element, {
  phrases:   ['Initializing...', 'Connecting...', 'Authenticating...'],
  interval:  400,       // ms between phrase swaps (default: 200)
  finalText: 'Ready.',  // text written after cycle ends; null = leave last phrase
});
cycle.start();

// Looping: cycle forever with no settle
const spinner = new PhraseCycle(element, {
  phrases:  ['Loading.', 'Loading..', 'Loading...'],
  interval: 300,
  loop:     true,
});
spinner.start();
spinner.stop();    // pause; last phrase stays visible; reusable
spinner.destroy(); // teardown + release element reference
```

See [COMPONENTS_REFERENCE.md](docs/COMPONENTS_REFERENCE.md#phrasecycle) and the [live demo](examples/advanced/phrase-cycle.html).

#### NsfwReveal

Age-gate blur overlay with click-to-reveal. Session persistence handled by the caller.

```js
import { NsfwReveal } from '@whykusanagi/corrupted-theme/nsfw-reveal';

const nr = new NsfwReveal(document.getElementById('img'), {
  warning: 'NSFW — click to reveal',
  blurPx: 20,
});
nr.reveal();   // programmatic reveal
nr.destroy();  // restore original state
```

See [COMPONENTS_REFERENCE.md](docs/COMPONENTS_REFERENCE.md#nsfwreveal).

#### PngExport

Capture a DOM element as PNG and trigger a download. Requires optional peer dep `html2canvas`.

```js
import { exportElementAsPng } from '@whykusanagi/corrupted-theme/png-export';

await exportElementAsPng(document.getElementById('card'), {
  filename: 'my-card.png',
  scale: 2,
});
```

Install the peer dep only when using: `npm install html2canvas`. See [COMPONENTS_REFERENCE.md](docs/COMPONENTS_REFERENCE.md#pngexport).

#### WebSocketManager

Auto-reconnect WebSocket wrapper with exponential backoff (capped 30s), event-ID dedup, ACK support, and visibility-aware pause/resume.

```js
import { WebSocketManager } from '@whykusanagi/corrupted-theme/websocket-manager';

const ws = new WebSocketManager({ url: 'wss://your-server/ws', autoConnect: false });
ws.on((msg) => console.log(msg));
ws.connect();
ws.destroy();
```

See [COMPONENTS_REFERENCE.md](docs/COMPONENTS_REFERENCE.md#websocketmanager) for all options.

### Core Utilities (0.2.0)

All utility modules are pure functions with no DOM dependency — safe in Node.js and SSR contexts.

#### random-utils
```js
import { randomPick, randomInt, randomFloat, randomVariance, shuffle, randomSample }
  from '@whykusanagi/corrupted-theme/random-utils';

randomPick(['a', 'b', 'c']);       // random element
randomVariance(50, 0.2);           // 50 ± 20%
shuffle([1, 2, 3]);                // Fisher-Yates in-place
randomSample([1,2,3,4], 2);        // 2 elements without replacement
```

#### time-utils
```js
import { formatTime12h, formatDate, timeAgo, formatDuration }
  from '@whykusanagi/corrupted-theme/time-utils';

formatTime12h();                   // "02:32 PM"
timeAgo(new Date(Date.now() - 3e5)); // "5m ago"
formatDuration(3661);              // "1h 1m 1s"  (input: seconds)
```

#### clipboard-helpers
```js
import { copyWithFeedback } from '@whykusanagi/corrupted-theme/clipboard-helpers';

await copyWithFeedback(btn, 'text to copy', { successLabel: 'COPIED!', durationMs: 1200 });
// Button label briefly becomes "COPIED!" then reverts. Returns Promise<boolean>.
```

#### url-state
```js
import { buildShareUrl, applyParamsToForm } from '@whykusanagi/corrupted-theme/url-state';

const url = buildShareUrl(form, 'https://example.com/embed');
// → "https://example.com/embed?username=alice&dark=1"
applyParamsToForm(form, new URLSearchParams(window.location.search));
```

### CSS Utilities (0.2.0)

**`.scrollbar-corrupted`** — styled scrollbar (Firefox + WebKit) matching the theme accent colors. Apply to any scrollable container:

```html
<div class="scrollbar-corrupted" style="overflow-y: auto; max-height: 400px;">…</div>
```

**`seamless-background.css`** — multi-layer parallax tiled background. Import the CSS module, add `.seamless-bg-host` to a parent, and set the `--seamless-background-image` variable:

```html
<body class="seamless-bg-host" style="--seamless-background-image: url('/tile.png');">
  <div class="seamless-background seamless-background-mid"></div>
  <!-- content -->
</body>
```

See [COMPONENTS_REFERENCE.md](docs/COMPONENTS_REFERENCE.md#seamless-backgroundcss) for the full modifier class list.

## Interactive Components

v0.1.8 adds JS-driven interactive components that self-initialize via `data-ct-*` attributes. Import the components module and everything wires up automatically on `DOMContentLoaded`.

```html
<script type="module">
  import '@whykusanagi/corrupted-theme/components-js';
  import { initCarousel } from '@whykusanagi/corrupted-theme/carousel';
</script>
```

### Modal

```html
<button class="btn" data-ct-toggle="modal" data-ct-target="#my-modal">Open</button>

<div class="modal-overlay" id="my-modal">
  <div class="modal">
    <div class="modal-header">
      <h3 class="modal-title">Title</h3>
      <button class="modal-close">&times;</button>
    </div>
    <div class="modal-body"><p>Content here.</p></div>
    <div class="modal-footer">
      <button class="btn secondary" data-ct-toggle="modal" data-ct-target="#my-modal">Cancel</button>
      <button class="btn" data-ct-toggle="modal" data-ct-target="#my-modal">Confirm</button>
    </div>
  </div>
</div>
```

Closes via X button, overlay click, or Escape key. Dispatches `modal:open` / `modal:close` custom events.

### Tabs

```html
<div class="tabs">
  <button class="tab active" data-ct-target="#panel-1">Tab 1</button>
  <button class="tab" data-ct-target="#panel-2">Tab 2</button>
</div>
<div class="tab-content active" id="panel-1">Panel 1 content</div>
<div class="tab-content" id="panel-2">Panel 2 content</div>
```

### Collapse

```html
<button class="btn" data-ct-toggle="collapse" data-ct-target="#details">Toggle</button>
<div class="collapse" id="details">
  <p>Collapsible content.</p>
</div>
```

### Carousel

```html
<div class="carousel" data-ct-autoplay data-ct-interval="4000">
  <div class="carousel-inner">
    <div class="carousel-slide active">Slide 1</div>
    <div class="carousel-slide">Slide 2</div>
    <div class="carousel-slide">Slide 3</div>
  </div>
</div>
```

Features: autoplay, prev/next controls, dot indicators, touch/swipe, keyboard navigation (ArrowLeft/Right). Import separately:

```js
import { initCarousel } from '@whykusanagi/corrupted-theme/carousel';
```

### Accordion

```html
<div class="accordion">
  <div class="accordion-item active">
    <div class="accordion-header">Question 1</div>
    <div class="accordion-body"><p>Answer 1</p></div>
  </div>
  <div class="accordion-item">
    <div class="accordion-header">Question 2</div>
    <div class="accordion-body"><p>Answer 2</p></div>
  </div>
</div>
```

### Toast Notifications

```js
import { toast } from '@whykusanagi/corrupted-theme/components-js';

toast.success('Operation completed.');
toast.warning('Check your input.');
toast.error('Something went wrong.');
toast.info('FYI: update available.');
```

See `examples/interactive-components.html` for a live demo of all interactive components.

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

All JS corruption components follow the same lifecycle: `new Class(element, options)` with `start()`, `stop()`, `destroy()` methods. Full API details are in [COMPONENTS_REFERENCE.md](docs/COMPONENTS_REFERENCE.md#javascript-corruption-components).

**CorruptedText** - Pattern 1: Character-Level Corruption
- Visual glitch effect using random characters (Katakana, Hiragana, symbols)
- Always SFW (no phrases, just character-level noise)
- Cycles through multi-language variants
- Class: `.corrupted-multilang`
- Demo: `examples/basic/corrupted-text.html`

```js
import { initCorruptedText } from '@whykusanagi/corrupted-theme/corrupted-text';

// Auto-init all .corrupted-multilang elements
initCorruptedText();

// Or manual:
const ct = new CorruptedText(element, {
  duration: 3000,    // total animation duration (ms)
  cycleDelay: 100,   // delay between corruption steps (ms)
  startDelay: 0,     // initial delay before animation
  loop: true,        // loop or settle on final text
  finalText: null    // text to settle on (null = english variant)
});
ct.start();          // begin animation
ct.stop();           // pause
ct.restart();        // reset to first variant
ct.settle('Hello');  // stop and settle to specific text
ct.destroy();        // full teardown
```

**TypingAnimation** - Pattern 2: Phrase Flickering (Buffer Corruption)
- Simulates neural network decoding corrupted data buffer
- Phrases flicker through before revealing final text
- SFW mode (default): Cute, playful, atmospheric phrases
- NSFW mode (opt-in): Explicit 18+ content with `{ nsfw: true }`
- Color: Magenta (#d94f90) for SFW, Purple (#8b5cf6) for NSFW
- Demo: `examples/basic/typing-animation.html`

```js
import { TypingAnimation } from '@whykusanagi/corrupted-theme/typing-animation';

const typing = new TypingAnimation(element, {
  duration: 2000,             // 2s total typing pass
  bufferEnabled: true,        // always-on phrase buffer (default)
  bufferFlickerSpeed: 100,    // ms between buffer phrase swaps
  nsfw: false,                // enable 18+ phrase mode
});
typing.start('Neural corruption detected...');
typing.stop();
typing.settle('READY');       // skip remaining type-out, write final text
```

**CorruptedParticles** - Canvas 2D Floating Phrase Background
- Floating Japanese phrase particles across three depth layers
- Mouse hover repel, click burst (6 particles), connection lines between nearby particles
- SFW/NSFW phrase modes via `nsfw` toggle (`includeLewd` is a deprecated alias)
- Demo: `examples/advanced/particles-bg.html`

```js
import CorruptedParticles from '@whykusanagi/corrupted-theme/corrupted-particles';

const particles = new CorruptedParticles(canvas, {
  count: 60,         // number of particles
  speed: 1.0,        // global speed multiplier
  lineDistance: 150, // max distance for connection lines (px)
  nsfw: false        // enable 18+ phrases (default: off)
});
// auto-starts on construction
particles.stop();    // pause animation
particles.start();   // resume
particles.destroy(); // full teardown
```

**CorruptedVortex** - WebGL Raymarched Spiral Vortex
- WebGL1 raymarched black hole accretion disk shader
- Quasar mode (hue: null) cycles yellow-to-magenta by depth
- Fixed hue mode locks to a single color
- Throttled to ~30fps for GPU efficiency
- Demo: `examples/advanced/glsl-vortex.html`

```js
import CorruptedVortex from '@whykusanagi/corrupted-theme/corrupted-vortex';

const vortex = new CorruptedVortex(canvas, {
  speed: 1.0,          // animation speed multiplier
  intensity: 1.0,      // brightness/glow intensity
  rotationRate: 1.0,   // rotation speed of spiral
  hue: null            // null = quasar multi-color, 0-1 = fixed hue
});
// auto-starts on construction
vortex.stop();
vortex.start();
vortex.destroy();
```

**Character Corruption** - Auto-Corruption for Individual Characters
- Replaces English characters with Japanese (Katakana, Hiragana, Kanji)
- Configurable intensity levels from `NONE` (0) to `MAX_READABLE` (0.45)
- Auto-corruption via `.auto-corrupt` class with `data-text`, `data-intensity`, `data-interval` attributes
- Includes phrase libraries (technical UI + personality/demon phrases)

```js
import {
  corruptTextJapanese,
  initAutoCorruption,
  stopAutoCorruption,
  destroyAllAutoCorruption,
  createCorruptedElement,
  getRandomPhrase,
  INTENSITY
} from '@whykusanagi/corrupted-theme/character-corruption';

// Corrupt a string at medium intensity
corruptTextJapanese('Hello World', INTENSITY.MEDIUM); // → "Heアロo ワoケld"

// Auto-init all .auto-corrupt elements on page
initAutoCorruption();

// Create a new auto-corrupting element
const el = createCorruptedElement('System Online', {
  intensity: 0.35,
  interval: 2000,
  className: 'status-text',
  tag: 'span'
});

// Get a random phrase from the library
getRandomPhrase('loading');              // → "initializing neural link..."
getRandomPhrase('personality', 'japanese'); // → "データ破損検出..."

// Cleanup
stopAutoCorruption(element);    // stop one element
destroyAllAutoCorruption();     // stop all
```

**Corruption Loading Screen** - Cinematic Loading Curtain
- Full-screen dramatic loading animation
- Module: `src/lib/corruption-loading.js`

**Corruption Phrases Library**
- Normalized SFW/NSFW phrase sets
- Separate exports for each mode
- Helper functions for random phrase selection
- Module: `src/core/corruption-phrases.js`

## Lifecycle Management

All JS components follow a consistent init/destroy pattern to prevent memory leaks in SPAs and dynamic UIs.

### Destroying Components

```js
import { destroyComponents } from '@whykusanagi/corrupted-theme/components-js';
import { destroyGallery } from '@whykusanagi/corrupted-theme/gallery';

// Tear down all interactive components (modal, dropdown, tabs, accordion, toast)
destroyComponents();

// Destroy default gallery instance
destroyGallery();
```

### Multi-Instance Gallery

```js
import { initGallery } from '@whykusanagi/corrupted-theme/gallery';

const g1 = initGallery('#gallery-1', { enableLightbox: true });
const g2 = initGallery('#gallery-2', { enableLightbox: true });

// Each instance has independent filters, lightbox, and state
g1.destroy();  // only tears down gallery-1
```

See `examples/basic/multi-gallery.html` for a working multi-instance demo.

### Core Utilities

The `src/core/` directory provides lifecycle primitives used by all components:

- **TimerRegistry** (`timer-registry.js`) — wraps `setTimeout`, `setInterval`, and `requestAnimationFrame` with bulk `clearAll()`
- **EventTracker** (`event-tracker.js`) — wraps `addEventListener` with bulk `removeAll()`

These ensure no orphaned timers or listeners remain after `destroy()`.

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

Responsive gallery grid with filtering, lightbox, and NSFW content support. Supports multiple independent instances on the same page.

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
import { initGallery, destroyGallery } from '@whykusanagi/corrupted-theme/gallery';

const gallery = initGallery('#my-gallery', {
  enableLightbox: true,
  enableNsfw: true,
  filterAnimation: true
});

gallery.filter('photos');     // Filter by category
gallery.openLightbox(0);      // Open first image
gallery.destroy();            // Clean up (removes lightbox, listeners, timers)
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
npm install           # install dependencies
npm run build         # compile CSS bundle
npm run watch         # dev rebuild loop
npm run dev:static    # serve /examples on :8000
npm run dev:proxy     # optional Celeste proxy on :5000
npm run validate-data # AJV schema validation for src/data/*.json
npm run generate-sri  # generate SRI hashes for CDN consumers
npm run publish-cdn   # upload dist/ + src/data/ to R2, bump @latest pointer

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
