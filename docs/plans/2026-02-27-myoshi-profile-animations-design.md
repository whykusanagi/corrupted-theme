# Design: Myoshi.co Profile — Ambient Animation Layer

**Date**: 2026-02-27
**Status**: Approved
**Scope**: Copy-paste CSS for myoshi.co custom profile field (not an NPM package change)
**Trigger**: myoshi.co CSS engine rewrite — @keyframes now fully supported via PostCSS

---

## Context

The user's myoshi.co profile uses a custom `.ct-*` class system defined entirely in the
platform's custom CSS field. Previously, @keyframes were broken by the platform's old
regex-based scoping. The platform now uses PostCSS and scopes all CSS to the profile
container automatically.

This design adds an ambient, always-on animation layer to the existing classes.
No HTML changes. No JS. No NPM package changes.

---

## Requirements

- **Style**: Ambient / always-on (looping, not triggered)
- **JS**: None — pure CSS @keyframes only
- **Performance**: GPU-safe only (transform + opacity, no layout properties)
- **Accessibility**: `prefers-reduced-motion` block disables all animations
- **Platform constraints**: blur() capped at 50px, z-index capped at 10000, position:fixed → absolute

---

## Keyframes

| Name | Target | Duration | Effect |
|---|---|---|---|
| `ct-glow-breathe` | `.ct-card`, `.ct-card-dim`, `.ct-cta-contact` | 4s ease-in-out infinite | Box-shadow glow dims → brightens |
| `ct-scanline-drift` | `.ct-scan::before` | 8s linear infinite | Background-position-y scrolls upward |
| `ct-rgb-drift` | `.ct-glitch::before`, `::after` | 6s ease-in-out infinite | Chromatic aberration offsets oscillate |
| `ct-label-flicker` | `.ct-label` | 7s ease-in-out infinite | Opacity irregular dip (noise simulation) |
| `ct-jp-fade` | `.ct-jp` | 3s ease-in-out infinite | Opacity 0.5 → 0.2 → 0.5 (buffering) |
| `ct-status-pulse` | `.ct-status-active` | 2s ease-in-out infinite | Opacity heartbeat pulse |
| `ct-bar-shimmer` | `.ct-bar-fill::after` | 3s linear infinite | Translucent highlight sweeps left → right |
| `ct-logo-glow` | `.ct-logo` | 5s ease-in-out infinite | Drop-shadow filter breathes |

---

## Stagger Strategy

Card glow breathe uses `animation-delay` to desync cards so they don't pulse in unison:

| Element | Delay |
|---|---|
| `.ct-card:nth-child(1)` | 0s |
| `.ct-card:nth-child(2)` | 1.3s |
| `.ct-card:nth-child(3)` | 2.6s |
| `.ct-card:nth-child(4)` | 0.7s |
| `.ct-card-dim` | 1.9s |

---

## Existing CSS preserved

- `.ct-glitch` hover states (transform shifts on `::before`/`::after`) — kept, layer on top of drift animation
- All existing `.ct-card`, `.ct-scan`, etc. styles — untouched, only `animation:` property added
- No selectors removed or renamed

---

## Accessibility

```css
@media (prefers-reduced-motion: reduce) {
  /* disable all animation properties on affected classes */
}
```

---

## Out of scope

- Character-level JS text corruption (platform may not support inline scripts)
- Card entrance animations (render-timing risk on myoshi.co)
- NPM package changes
