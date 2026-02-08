# Changelog

All notable changes to the Corrupted Theme project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Planned
- [ ] CDN distribution via jsDelivr
- [ ] Figma design system (components library)
- [ ] Storybook integration for component showcase

---

## [0.1.7] - 2026-02-07

### Security
- **XSS hardening in celeste-widget.js** - `addMessage()` now uses `textContent` via safe DOM construction instead of `innerHTML` interpolation
- **HTML injection fix in countdown-widget.js** - `config.popup.message` now rendered with `textContent` instead of `innerHTML`
- **XSS hardening in components.js** - `showToast()` rebuilt with safe DOM methods (`createElement`/`textContent`) instead of `innerHTML` template

### Added
- **Lifecycle utilities** - New `TimerRegistry` and `EventTracker` classes (`src/core/`) for consistent timer/listener cleanup across all components
- **Modal JS** - `ModalManager` with open/close, overlay click-to-close, Escape key, body scroll lock, and `modal:open`/`modal:close` custom events
- **Dropdown JS** - `DropdownManager` with toggle behavior and click-outside-to-close
- **Tab JS** - `TabManager` with panel switching via `data-ct-target` attributes
- **Collapse auto-init** - Existing `toggleCollapse()` wired to `data-ct-toggle="collapse"` data attributes
- **Carousel component** - New `src/lib/carousel.js` with autoplay, prev/next controls, dot indicators, touch/swipe, keyboard navigation, and pause on hover. CSS added to `components.css`
- **Unified auto-init** - All interactive components auto-initialize via `data-ct-*` attributes on DOMContentLoaded
- **`destroyComponents()`** - Tears down all component managers (modal, dropdown, tab, toast) at once
- **`destroyAllAutoCorruption()`** - Stops all active character corruption intervals
- **Multi-gallery example** - `examples/basic/multi-gallery.html` demonstrates two independent galleries
- **Interactive components example** - `examples/interactive-components.html` demonstrates Modal, Dropdown, Tabs, Collapse, Accordion, Carousel, and Toast
- **`"./carousel"` package export** - Carousel available via `@whykusanagi/corrupted-theme/carousel`

### Fixed
- **Memory leak: celeste-widget.js** - Added `destroy()` method, tracked all event listeners, popstate handler now calls `updateContext()` instead of re-initializing
- **Memory leak: gallery.js** - Refactored from singleton to `Gallery` class with per-instance `EventTracker` and `TimerRegistry`. Each instance gets a unique lightbox. `destroy()` removes all listeners and DOM
- **Memory leak: corruption-loading.js** - All `setTimeout`/`setInterval` calls tracked; added `cancelLoading()` to stop mid-animation
- **Memory leak: corrupted-text.js** - Tracked `_startDelayId`, `_animateTimeoutId`, `_corruptTimeoutId`; added `destroy()` method
- **Memory leak: components.js** - Toast auto-dismiss timeout stored on element, cleared on early dismiss; added `destroy()` to `ToastManager`
- **Memory leak: character-corruption.js** - Replaced unreliable `dataset` string storage with `WeakMap` for interval ID tracking
- **Memory leak: countdown-widget.js** - Popup `setTimeout` calls tracked in state, cleared in `destroyCountdown()`

### Changed
- **Dev dependency updates** - Updated `cssnano` ^6 to ^7, `postcss-cli` ^10 to ^11
- **Node.js engine requirement** - Bumped minimum from >=14.0.0 to >=18.0.0
- **Gallery multi-instance** - `initGallery()` now returns a `Gallery` instance; backward-compatible `destroyGallery()` still works for default instance
- **COMPONENTS_REFERENCE.md** - Updated Interactive Components section with `data-ct-*` usage, added Carousel and Lifecycle Management sections

---

## [0.1.6] - 2026-01-16

### Changed
- **Package Cleanup** - Removed internal documentation from NPM package
  - Created `docs/planning/` directory for internal planning documents
  - Moved `COMPONENT_INTEGRATION_PLAN.md` to `docs/planning/`
  - Moved `CONTENT_CLASSIFICATION_NORMALIZATION.md` to `docs/planning/`
  - Moved `TERMINOLOGY_CLARIFICATION.md` to `docs/planning/`
  - Updated `.npmignore` to exclude `docs/planning/` directory
  - Added `CORRUPTED_THEME_SPEC.md` and `CORRUPTION_BUFFER_IMPLEMENTATIONS.md` to `.npmignore`
  - No functional changes - purely package cleanup
  - **Note:** v0.1.5 contained internal planning docs and should not be used. Please upgrade to 0.1.6.

---

## [0.1.5] - 2026-01-15

### Fixed
- **Corruption Example Styling** - Aligned all three corruption examples with theme.css design system
  - examples/basic/corrupted-text.html - Now uses CSS variables and glassmorphism
  - examples/basic/typing-animation.html - Consistent button and component styling
  - examples/advanced/nsfw-corruption.html - Proper navbar and design system integration
- **Documentation Links** - Fixed broken markdown links across all 12 HTML example files
  - Updated "Docs" navigation to point to showcase-complete.html instead of .md files
  - Ensures all documentation is accessible in browser

### Changed
- **Corruption Examples** - Replaced custom inline styles with theme.css design system
  - Now uses CSS variables (--accent, --bg, --glass, --spacing-*, etc.)
  - Added proper navbar component matching other examples
  - Applied consistent .example-group sections with glassmorphism
  - Added Font Awesome icons throughout
  - All corruption functionality and interactivity preserved

---

## [0.1.4] - 2025-12-15

### Fixed
- **Navigation Consistency** - Moved index.html to root, fixed all navigation paths
- **Asset Loading** - Corrected CSS and documentation paths for root-level index

### Added
- **Complete Corruption Phrase Library** - Added 67 official phrases to character-corruption.js
  - 30 technical phrases (6 categories: loading, processing, analyzing, corrupting, watching, void)
  - 30 personality phrases (English, Japanese, Romaji)
  - `getRandomPhrase()` helper function
- **Animation Utilities Showcase** - Added comprehensive examples for all 21+ animation classes
- **VERSION_REFERENCES.md** - Complete version tracking documentation for future releases

### Changed
- **npm Package** - Excluded 7 internal docs from npm release (IMPLEMENTATION_VALIDATION, FUTURE_WORK, CAPABILITIES, PERSONALITY, ROUTING, LLM_PROVIDERS, CLI_IMPLEMENTATION)
- **Documentation** - Extended CORRUPTION_PHRASES.md with Celeste demon/succubus personality phrases

### Documentation
- Added 33 governance, brand, component, and platform documentation files
- All version references updated consistently across project

---

## [0.1.3] - 2025-12-15

### Added

#### Character-Level Corruption System (`src/lib/character-corruption.js`)
**NEW: CLI Brand Parity** - Matches Celeste CLI's translation-failure aesthetic

- `corruptTextJapanese(text, intensity)` - Character-level Japanese mixing
  - Mixes Japanese characters INTO English (e.g., "USAGE ANALYTICS" → "US使AGE ANア統LYTICS")
  - Semantic character selection (Katakana 50%, Kanji 25%, Hiragana 10%, insertions 15%)
  - Intensity constants: `INTENSITY.MINIMAL` (15%), `INTENSITY.LOW` (25%), `INTENSITY.MEDIUM` (35%), `INTENSITY.HIGH` (45%)
  - Maximum 45% intensity for accessibility (WCAG AA compliance)
- `corruptTextSemantic(text, context, intensity)` - Context-aware corruption (future enhancement)
- `initAutoCorruption()` - Auto-corrupt elements with `.auto-corrupt` class
- `createCorruptedElement(text, options)` - Programmatically create corrupted elements
- `stopAutoCorruption(element)`, `restartAutoCorruption(element)` - Control helpers

**Use Cases:**
- Dashboard titles and headers (recommended: 35% intensity)
- Section labels and navigation
- UI text matching CLI branding
- Randomizes on interval to show dynamic corruption

#### Bootstrap-Equivalent Components (680+ lines added to `components.css`)
**GOAL: 1:1 Bootstrap Parity** - Build sites without writing custom CSS

**Accordion/Collapse:**
- `.accordion`, `.accordion-item` - Collapsible panels with glassmorphism
- `.accordion-header`, `.accordion-body` - Header/content areas
- `.collapse`, `.collapse.show` - Standalone collapsible utility
- Auto +/− indicators on active state

**Toast Notifications:**
- `.toast-container` - Fixed position container (bottom-right)
- `.toast` with variants: `.success`, `.warning`, `.error`, `.info`
- `.toast-header`, `.toast-body`, `.toast-close` - Toast structure
- Slide-in/slide-out animations (300ms)
- Auto-dismiss support
- JavaScript API for programmatic toasts

**Button Groups:**
- `.btn-group` - Horizontal button clusters (no gaps, merged borders)
- `.btn-group-vertical` - Vertical button stacks
- `.btn-toolbar` - Toolbar layout with proper spacing
- `.btn.active` state for grouped buttons

**Input Groups:**
- `.input-group` - Combined input + button/text addons
- `.input-group-text` - Prepend/append text labels
- `.input-group-prepend`, `.input-group-append` - Positioning helpers
- Seamless border merging with glassmorphism

**Form Enhancements:**
- `.form-check`, `.form-check-input`, `.form-check-label` - Custom checkboxes/radios
  - Styled with accent gradient on :checked
  - ✓ checkmark and ● radio indicators
- `.form-switch`, `.form-switch-input`, `.form-switch-label` - Toggle switches
  - Animated slide transition (150ms)
  - Accent gradient when active
- `.form-range` - Custom range slider with accent styling
- `.form-select` - Styled select dropdown with custom arrow
- `.form-floating` - Material Design-style floating labels
- `.form-file`, `.form-file-label` - Custom file upload button

**Utility Classes:**
- `.btn-close` - Standardized close button (× symbol)
- `.visually-hidden` - Screen reader only content (WCAG)
- `.text-truncate` - Overflow ellipsis
- `.ratio`, `.ratio-1x1`, `.ratio-4x3`, `.ratio-16x9`, `.ratio-21x9` - Aspect ratio containers

#### Component JavaScript Helpers (`src/lib/components.js`)
Interactive functionality for new components:

- `initAccordions()` - Auto-initialize all accordions (click to toggle)
- `toggleCollapse(element)`, `showCollapse(element)`, `hideCollapse(element)` - Collapse controls
- `showToast(options)` - Display toast notifications programmatically
- `toast.success(message, title, duration)` - Convenience method
- `toast.warning(message, title, duration)` - Convenience method
- `toast.error(message, title, duration)` - Convenience method
- `toast.info(message, title, duration)` - Convenience method
- `toast.dismiss(toastEl, callback)`, `toast.dismissAll()` - Dismissal methods
- Auto-initialization on DOMContentLoaded

#### Package Exports
```javascript
'@whykusanagi/corrupted-theme/character-corruption'  // character-corruption.js
'@whykusanagi/corrupted-theme/components-js'         // components.js
```

### Changed

**Component Coverage:** Now 95%+ Bootstrap parity (up from 62%)
- 40+ existing components (v0.1.2)
- 25+ new components added (v0.1.3)
- **Total: 65+ components** - True 1:1 Bootstrap equivalent

**Philosophy:** "Build sites without writing custom CSS"
- All common UI patterns available as classes
- No need for bespoke styles in most cases
- Matches Bootstrap's utility-first approach

### Documentation

#### Branding Standards Integration
- Character-level corruption matches `docs/brand/TRANSLATION_FAILURE_AESTHETIC.md`
- Implements CLI's `CorruptTextJapanese()` function in JavaScript
- Dual corruption systems:
  - **`corrupted-text.js`** (existing) - Multilingual cycling for loading animations
  - **`character-corruption.js`** (new) - Character-level mixing for UI text
- Non-breaking: Both systems coexist for different use cases

#### Usage Guidelines
- Corruption intensity levels documented (15%, 25%, 35%, 45%)
- Anti-patterns explicitly banned (leet speak, over-corruption, word replacement)
- Accessibility compliance maintained (WCAG AA contrast, max 45% intensity)
- Responsive considerations for new form components

### Performance

- Form components use CSS-only where possible (no JS required)
- Accordion animations use `max-height` transitions (GPU-accelerated)
- Toast system reuses single container (no DOM thrashing)
- Auto-corruption uses `requestAnimationFrame` for smooth updates

### Browser Support

- All new components tested in Chrome 90+, Firefox 88+, Safari 14+
- Custom form controls use `appearance: none` with fallbacks
- Range slider styled for both WebKit and Firefox
- Aspect ratio containers use modern `aspect-ratio` property with padding fallback

---

## [0.1.2] - 2025-11-26

### Added

#### Extension Components (`src/css/extensions.css`)
Production-tested components from whykusanagi.xyz, now part of the core package:

- **Gallery System**
  - `.gallery-container` - Responsive grid layout with variants (compact, large)
  - `.gallery-item` - Image cards with aspect ratio options (square, portrait, landscape)
  - `.filter-bar` and `.filter-btn` - Category filtering with animated transitions
  - `gallery.js` - JavaScript module for filtering, lightbox, and NSFW handling

- **Lightbox Component**
  - `.lightbox` - Fullscreen image viewer overlay
  - `.lightbox-image`, `.lightbox-close`, `.lightbox-prev`, `.lightbox-next`
  - `.lightbox-caption`, `.lightbox-counter`
  - Keyboard navigation (Arrow keys, Escape)
  - Touch gesture support for mobile

- **NSFW Content Blur**
  - `.nsfw-content` - Click-to-reveal blur overlay
  - Custom warning text via `data-warning` attribute
  - `.revealed` state for toggling visibility
  - Auto-reveal in lightbox mode

- **Social Links List**
  - `.social-links-container` - Link-in-bio layout
  - `.profile-avatar` - Circular avatar with glow (sm, default, lg sizes)
  - `.profile-name`, `.profile-bio` - Profile text components
  - `.link-list`, `.link-item` - Styled link buttons
  - Platform-specific hover colors (twitter, instagram, youtube, github, discord, twitch)

- **Countdown Widget**
  - `.countdown-container`, `.shape-container` - Event countdown layout
  - Shape variants: diamond, circle, heart, star, hexagon, octagon
  - `.countdown-box`, `.countdown-timer` - Timer display
  - `.countdown-popup` - Animated popup messages
  - `.countdown-character`, `.countdown-overlay-wrapper` - Image support
  - `countdown-widget.js` - JavaScript module with JSON config support

#### New JavaScript Modules (`src/lib/`)
- `gallery.js` - Gallery system with filtering, lightbox, and NSFW handling
- `countdown-widget.js` - Countdown widget with JSON configuration

#### New Package Exports
```javascript
'@whykusanagi/corrupted-theme/extensions' // extensions.css
'@whykusanagi/corrupted-theme/gallery'    // gallery.js
'@whykusanagi/corrupted-theme/countdown'  // countdown-widget.js
```

#### Example Pages
- `examples/extensions-showcase.html` - Interactive demo for all extension components
- `examples/index.html` - Central landing hub for the design system with categorized navigation
- `examples/assets/celeste-avatar.png` - Local avatar image for demos

#### Design System Architecture
- **Central Landing Hub** (`examples/index.html`)
  - Hero section with quick install instructions
  - Categorized cards linking to Core Components, Extensions, Glass Components, API Docs, Nikke, Animations
  - Quick links for common component pages
  - Professional Netflix/Meta-level information architecture

- **Global Navigation System**
  - Consistent navigation bar across all 9 example pages
  - Home, Components (dropdown), Extensions (dropdown), Examples (dropdown), Docs links
  - Section anchors in dropdowns for quick navigation
  - Proper active state highlighting

### Fixed

#### Chrome White Background Flash
- **Added:** `background-color: var(--bg)` to both `html` and `body` in `typography.css`
- **Why:** Chrome browsers showed white flash before CSS variables loaded
- **Impact:** Consistent dark background across all browsers immediately on load

#### Navigation Consistency
- **Updated:** All 9 example pages now have identical global navigation
- **Why:** Some pages (button.html, card.html, form.html, layout.html) had minimal "Back" links only
- **Impact:** Users can navigate the entire design system from any page

#### Dead Links Fixed
- **Fixed:** "Customization" links pointed to non-existent `CUSTOMIZATION.md`
- **Changed to:** `COMPONENTS_REFERENCE.md#customization`
- **Fixed:** Backgrounds section link added to Components dropdown

#### Image Hotlinking
- **Removed:** All Unsplash hotlinks (9 instances)
- **Replaced with:** Local `assets/celeste-avatar.png` and `placehold.co` placeholders
- **Why:** External hotlinks may break, cause CORS issues, or violate terms
- **Impact:** All demo images load reliably in any environment

### Changed

#### Documentation Updates
- **README.md** - Added "Extension Components" section with usage examples
- **COMPONENTS_REFERENCE.md** - Added full documentation for all extension components
- Updated table of contents in both files

#### CSS Architecture
- `theme.css` now imports `extensions.css` automatically
- Cleaned up duplicate NSFW styles (now in extensions.css only)
- Added explicit background color to `html` element for faster paint

#### Example Page Updates
- All example pages updated with consistent global navigation
- `showcase-complete.html` - Added `id="backgrounds"` anchor and dropdown link
- `index.html` - Transformed into design system landing hub
- Layouts page added to Examples dropdown across all pages

### Files Added
- `src/css/extensions.css`
- `src/lib/gallery.js`
- `src/lib/countdown-widget.js`
- `examples/extensions-showcase.html`
- `examples/assets/celeste-avatar.png`

---

## [0.1.1] - 2025-11-26

### Fixed

#### Navbar Z-Index Issue
- **Changed:** `--z-navbar` from `500` to `1000` in `variables.css`
- **Why:** Navbar was appearing behind content when using video backgrounds with `.app-shell` structure
- **Impact:** Navbar now always renders above all content layers

#### Navbar Styles Not Available with Modular Imports
- **Moved:** All navbar styles (`nav.navbar`, `.navbar-content`, `.navbar-logo`, `.navbar-links`) from `theme.css` to `components.css`
- **Why:** When using modular imports (as documented), navbar styles were missing because they only existed in `theme.css`
- **Impact:** Navbar now works correctly with both single-file and modular import methods

### Changed

#### Documentation Improvements
- **Added:** "Video Backgrounds with Navigation" section to README
  - Proper navbar placement outside `.app-shell` for z-index stacking
  - Complete z-index hierarchy table with all tokens
  - HTML structure example for video backgrounds with navigation

- **Added:** "HTML Import Methods" section to README
  - Method 1: Single file import (recommended)
  - Method 2: Modular imports with correct dependency order
  - CSS `@import` syntax examples
  - HTML `<link>` tag syntax examples
  - Explanation of why import order matters

#### CSS Architecture
- Navbar responsive styles consolidated in `components.css`
- Removed duplicate navbar styles from `theme.css`
- Z-index values now use CSS custom properties consistently (`var(--z-negative)`, `var(--z-background)`, etc.)

### Files Modified
- `src/css/variables.css` - Z-index value change
- `src/css/components.css` - Added navbar base styles and responsive styles
- `src/css/theme.css` - Removed navbar styles (now imported via components.css)
- `README.md` - Enhanced documentation

---

## [0.1.0] - 2025-11-23

### Added

#### CSS Modular Architecture
- `src/css/variables.css` - Foundation with 50+ CSS custom properties
  - Color system (accent, background, text, glass, borders, gradients)
  - Spacing scale (6 levels from 4px to 48px)
  - Border radius scale (5 levels)
  - Transition timing (fast, normal, slow)
  - Z-index layering system
  - Font variables and typography scale
  - Shadow system

- `src/css/typography.css` - Complete font hierarchy
  - Heading styles (h1-h6) with responsive sizing
  - Body text and paragraph styles
  - Links with hover effects
  - Code blocks and pre-formatted text
  - Blockquotes and emphasis styles
  - Text utilities (text colors, sizing, weights)
  - Line clamping utilities
  - Responsive breakpoints (1200px, 1024px, 768px)

- `src/css/glassmorphism.css` - Frosted glass effects
  - `.glass` and `.glass-container` components
  - `.frosted-card` with complete styling
  - Backdrop-filter blur effects
  - Opacity variants (30%-80%)
  - Glass shadows with accent colors
  - Specialized glass components (glass-btn, glass-navbar, glass-modal, glass-overlay)
  - Blur utility classes (blur-sm through blur-2xl)

- `src/css/animations.css` - Motion and animation system
  - Keyframe animations (fadeIn, slideIn, slideInLeft/Right, scaleIn, glitchShift, pulse, breathe, float, shimmer)
  - Animation utility classes with duration/delay options
  - Fast, normal, and slow animation variants
  - `prefers-reduced-motion` support for accessibility
  - Hover lift effects (.lift, .lift-sm, .lift-lg)
  - Animation-specific cursor utilities

- `src/css/components.css` - Pre-styled UI components
  - Button system (.btn) with variants:
    - Secondary, ghost, sm, lg, block, disabled
    - Icon support with proper spacing
  - Card system (.card) with sizes (sm, lg)
  - Badge system (.badge) with semantic colors
  - Form elements (input, textarea, select) with focus states
  - Navigation components (navbar with active states)
  - Alert boxes with semantic colors (success, warning, error, info)
  - Link styling with animated underlines
  - Tag and badge components
  - Code block styling
  - Divider component

- `src/css/utilities.css` - Utility-first classes
  - Spacing utilities (margin, padding - all 6 scale levels)
  - Display utilities (block, flex, grid, hidden)
  - Text utilities (alignment, sizing, weight, color, casing)
  - Sizing utilities (width, height, max-width, container sizes)
  - Position utilities (relative, absolute, fixed, sticky, inset)
  - Border utilities (all sides, colors)
  - Responsive utilities with mobile breakpoint (768px)
  - Opacity and background utilities
  - Overflow and text-clipping utilities

- `src/css/theme.css` - Master stylesheet
  - Imports all module files in order
  - Responsive grid system (.grid, .grid-2, .grid-3, .grid-4)
  - Section and container layouts
  - Additional responsive components
  - Responsive breakpoints management

#### Package Configuration
- `package.json` - npm package metadata
  - Named entry point and conditional exports for modular imports
  - Build scripts for PostCSS minification
  - Project metadata (name, version, keywords, author)
  - Files array specifying what gets published

- `README.md` - Main package documentation
  - Feature highlights
  - Quick start for multiple installation methods
  - File structure explanation
  - CSS variable overview with examples
  - Component examples and usage
  - Browser support matrix
  - Accessibility notes
  - Links to detailed documentation

#### Documentation Suite

- `docs/COLOR_PALETTE.md` - Complete color system reference (570+ lines)
  - Primary accent colors with hex/RGB values
  - Background colors and semantics
  - Text colors with WCAG contrast ratios
  - Glass morphism colors with opacity
  - Border colors
  - Gradient definitions
  - Semantic colors (success, warning, error, info)
  - Color combination table with contrast data
  - Customization examples
  - Dark mode/light mode setup
  - Opacity levels guide
  - Hex color quick reference

- `docs/COMPONENTS.md` - Full component library (600+ lines)
  - Button component variations with examples
  - Card component with sizes and glass variants
  - Badge system with semantic colors
  - Form elements (input, textarea, select, labels)
  - Navigation navbar with active states
  - Typography examples (h1-h6, emphasis, colors)
  - Alert boxes with all semantic variants
  - Link component with animations
  - Code blocks and syntax highlighting
  - Glass effect variations
  - Grid layouts (2, 3, 4 column)
  - Animation examples (fade, slide, scale, glitch, float, pulse)
  - Accessibility notes for each component

- `docs/CUSTOMIZATION.md` - Extensive customization guide (700+ lines)
  - Quick customization examples (accent colors, backgrounds, text)
  - Spacing and border-radius customization
  - Transition speed adjustment
  - Complete theme overrides
  - Partial imports for tree-shaking
  - Custom component creation methods
  - Typography customization (fonts, sizes, line heights)
  - Shadow customization with depth levels
  - Glass effect customization (blur, opacity, variants)
  - Animation customization and disabling
  - Dark mode + light mode setup
  - Semantic color system
  - Variable inheritance patterns
  - Testing checklist for customizations

- `docs/INSTALLATION.md` - Installation and setup guide
  - Four installation methods (npm, CDN, local, git submodule)
  - Basic HTML setup with complete example
  - CSS preprocessing setup (PostCSS, SASS)
  - File structure reference
  - Partial import examples
  - Browser support matrix
  - Verification test file
  - Troubleshooting section
  - Framework integration (React, Vue, Next.js, Svelte)
  - Next steps and resource links

- `docs/ACCESSIBILITY.md` - WCAG compliance guide (800+ lines)
  - Color contrast ratios and WCAG levels
  - Keyboard navigation support
  - Focus indicator documentation
  - Motion and animation accessibility
  - Text readability standards
  - Color blindness support and testing
  - Semantic HTML best practices
  - ARIA attributes guide
  - Form accessibility
  - Component accessibility patterns
  - Testing checklist
  - Automated testing tools
  - Screen reader testing guidance
  - WCAG principles (POUR)
  - Learning resources and tools

- `docs/VARIABLES_REFERENCE.md` - Complete CSS variables reference
  - Color variables (accent, background, text, glass, borders, gradients)
  - Spacing scale documentation
  - Border radius scale
  - Transition timing variables
  - Z-index layering system
  - Shadow variables
  - Font variables
  - Creating custom variables
  - Variable inheritance patterns
  - Responsive variables example
  - Browser support for CSS variables
  - Performance notes
  - JavaScript API for accessing variables
  - Migration guide from hardcoded values

#### License & Metadata
- `LICENSE` - MIT license for open-source distribution
- `.gitignore` entry - Prevents theme folder pollution (corrupted-theme/ is in repo root .gitignore)

### Features

#### Design System Foundation
- **Complete Color System:** 50+ color values with WCAG AA/AAA contrast compliance
- **Spacing Scale:** Consistent 6-level spacing system (4px to 48px)
- **Typography:** Full font hierarchy with responsive sizing
- **Border Radius:** 5-level rounding scale for consistency
- **Shadows:** 4-level shadow system for depth
- **Z-Index:** Organized layering system (9 levels: -1 to 500)

#### Component Library
- **Buttons:** Multiple variants (primary, secondary, ghost) and sizes (sm, lg)
- **Cards:** Base card with size variants and glass effect
- **Forms:** Styled inputs, textareas, selects with focus states
- **Navigation:** Navbar with active link indicators
- **Alerts:** Semantic alert boxes (success, warning, error, info)
- **Badges:** Color-coded badges for tagging and labeling
- **Typography:** Complete heading and text styles

#### Effects & Animations
- **Glassmorphism:** Frosted glass effects with backdrop-filter blur
- **Animations:** 10+ keyframe animations with variants
- **Transitions:** Smooth state changes with timing utilities
- **Accessibility:** Respects prefers-reduced-motion for motion sensitivity

#### Utilities
- **Spacing:** Margin and padding utilities for all spacing levels
- **Sizing:** Width, height, and max-width utilities
- **Display:** Flex, grid, and display mode utilities
- **Typography:** Text color, size, weight, and alignment utilities
- **Positioning:** Relative, absolute, fixed, sticky utilities
- **Responsive:** Mobile-first responsive design (768px breakpoint)

#### Documentation
- **60+ documentation pages** covering every aspect of the theme
- **Code examples** for every component and utility
- **Installation guides** for multiple methods
- **Accessibility guide** with WCAG 2.1 AA compliance
- **Customization guide** for theme adaptation
- **Complete variable reference** for CSS custom properties
- **Color palette guide** with contrast ratios and WCAG levels

### Browser Support
- Chrome 76+
- Firefox 55+
- Safari 9.1+
- Edge 79+
- Opera 63+
- iOS Safari 10.3+
- Android Browser 62+

### Accessibility
- WCAG 2.1 Level AA compliant (exceeds in many areas)
- Color contrast ratios documented and tested
- Keyboard navigation support
- Screen reader compatible semantic HTML
- Animation prefers-reduced-motion support
- Clear focus indicators
- Semantic component structure

### Version Information
- **Package Name:** @whykusanagi/corrupted-theme
- **Version:** 0.1.0 (Initial Release)
- **License:** MIT
- **Status:** Stable for use, ready for feedback

---

## Versioning Strategy

This project follows [Semantic Versioning](https://semver.org/):

- **MAJOR** version for incompatible API changes
- **MINOR** version for backwards-compatible new features
- **PATCH** version for backwards-compatible bug fixes

### Pre-release Versions
- Alpha: `0.1.0-alpha.1` - Early development, expect breaking changes
- Beta: `0.1.0-beta.1` - Feature complete, testing phase
- Release Candidate: `0.1.0-rc.1` - Ready for release, final testing

---

## Future Releases

### Roadmap

**v0.2.0** (Planned)
- Extended component library (tables, modals, dropdowns, tooltips)
- Additional color palette presets (blue, green, monochrome)
- Storybook integration for interactive component showcase
- Performance optimizations

**v0.3.0** (Planned)
- Figma design system (components library)
- SCSS/SASS version for advanced customization
- CSS-in-JS library bindings
- Dark mode + light mode automatic theme switcher

**v1.0.0** (Planned)
- Official stable release
- Full API stability guarantee
- CDN distribution
- Complete migration guides

---

## Contributing

See CONTRIBUTING.md (coming soon) for guidelines on:
- Reporting bugs
- Requesting features
- Submitting pull requests
- Code style standards
- Testing requirements

---

## Support

- **GitHub Issues:** Report bugs and feature requests
- **Discussions:** Ask questions and share ideas
- **Documentation:** Check docs/ folder for detailed guides
- **Email:** Contact maintainers for support

---

**Last Updated:** 2025-11-23
**Maintained By:** whykusanagi
**Repository:** https://github.com/whykusanagi/corrupted-theme (coming soon)
