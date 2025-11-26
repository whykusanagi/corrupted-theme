# Changelog

All notable changes to the Corrupted Theme project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Planned
- [ ] CDN distribution via jsDelivr
- [ ] Figma design system (components library)
- [ ] Storybook integration for component showcase
- [ ] SCSS/SASS version for advanced customization
- [ ] CSS-in-JS library bindings (Styled Components, Emotion)
- [ ] Dark mode + light mode theme switcher example
- [ ] Animation performance improvements
- [ ] Web font optimization
- [ ] Additional color palette presets
- [ ] Tailwind CSS integration guide

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
