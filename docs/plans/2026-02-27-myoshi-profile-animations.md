# Myoshi Profile — Ambient Animation Layer Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add always-on ambient @keyframes animations to the existing myoshi.co custom profile CSS/HTML.

**Architecture:** Pure CSS append — no HTML structural changes, no JS. Eight @keyframes target existing `.ct-*` class selectors already in the profile. All animations use GPU-safe properties (transform, opacity, filter, box-shadow). The complete block is appended after the existing CSS in myoshi's profile CSS editor.

**Tech Stack:** CSS @keyframes, myoshi.co profile custom CSS/HTML fields (PostCSS-scoped)

**Constraint:** This is copy-paste into myoshi.co's profile editor — no build system, no tests in the traditional sense. Verification = visual check in myoshi's preview pane.

---

## Key technical decisions

**Why `filter: drop-shadow()` for card glow instead of `box-shadow`?**
`.ct-card` has `box-shadow: ... !important` — CSS animations cannot override `!important` author styles. `filter: drop-shadow()` has no existing `!important` on the card, so the animation controls it freely.

**Why opacity-only on `.ct-glitch::before/after` (not transform)?**
The existing `.ct-glitch:hover::before/after` rules use `transform` for the hover intensification. Animating `transform` in keyframes at the same time creates a conflict. Animating only `opacity` lets the hover `transform` work cleanly via `transition`.

**Why `::before` pseudo for scanlines instead of animating `background-position` directly?**
`.ct-card` sets `background: ... !important` which implicitly sets `background-position: 0 0 !important` via shorthand. The `::before` pseudo has its own independent background, unaffected by the parent's `!important`.

**Why negative `animation-delay` for card stagger?**
Negative delays start the animation mid-cycle immediately on load — no waiting for each card's first pulse.

---

## Task 1: Keyframes block

**File:** myoshi.co → Profile Settings → Custom CSS (append at end)

**Step 1: Append the complete @keyframes block**

Paste this at the very end of the custom CSS field, after all existing rules:

```css
/* ═══════════════════════════════════════════
   AMBIENT ANIMATION LAYER — 2026-02-27
   @keyframes supported via myoshi PostCSS
   Pure CSS — no JS — GPU-safe only
   ═══════════════════════════════════════════ */

/* ── KEYFRAMES ── */

@keyframes ct-glow-breathe {
  0%, 100% { filter: drop-shadow(0 0 4px rgba(217,79,144,0.08)); }
  50%       { filter: drop-shadow(0 0 18px rgba(217,79,144,0.35)); }
}

@keyframes ct-scanline-drift {
  0%   { background-position: 0 0; }
  100% { background-position: 0 -60px; }
}

@keyframes ct-rgb-breathe {
  0%, 100% { opacity: 0.8; }
  50%       { opacity: 0.15; }
}

@keyframes ct-label-flicker {
  0%, 100% { opacity: 1; }
  15%       { opacity: 0.45; }
  17%       { opacity: 1; }
  65%       { opacity: 0.65; }
  68%       { opacity: 1; }
}

@keyframes ct-jp-fade {
  0%, 100% { opacity: 1; }
  50%       { opacity: 0.25; }
}

@keyframes ct-status-pulse {
  0%, 100% { box-shadow: 0 0 2px rgba(0,204,85,0.2); }
  50%       { box-shadow: 0 0 10px rgba(0,204,85,0.7); }
}

@keyframes ct-bar-shimmer {
  0%   { transform: translateX(-300%); }
  100% { transform: translateX(500%); }
}

@keyframes ct-logo-glow {
  0%, 100% { filter: drop-shadow(0 0 8px rgba(217,79,144,0.45)); }
  50%       { filter: drop-shadow(0 0 22px rgba(217,79,144,0.9)); }
}
```

**Step 2: Save and open preview** — no visual change yet (keyframes declared but not applied).

---

## Task 2: Card glow breathe

**Step 1: Append card animation rules**

```css
/* ── CARD GLOW BREATHE (staggered) ── */

.ct-card {
  animation: ct-glow-breathe 4s ease-in-out infinite;
}
/* Negative delays start mid-cycle immediately — no waiting on load */
.ct-card:nth-child(1) { animation-delay: 0s; }
.ct-card:nth-child(2) { animation-delay: -1.3s; }
.ct-card:nth-child(3) { animation-delay: -2.6s; }
.ct-card:nth-child(4) { animation-delay: -0.7s; }

.ct-card-dim {
  animation: ct-glow-breathe 4s ease-in-out infinite;
  animation-delay: -1.9s;
}
```

**Step 2: Verify**
- All four `.ct-card` elements and the `.ct-card-dim` CTA section should pulse with a pink glow
- Cards should pulse at different phase offsets (not in sync)
- Fallback if nth-child doesn't work due to DOM wrapping: add `style="animation-delay: -1.3s"` directly to each card `<div>` in the custom HTML

---

## Task 3: Scanline drift

**Step 1: Append scanline rules**

```css
/* ── SCANLINE DRIFT ── */

.ct-scan {
  position: relative;
  overflow: hidden;
}
.ct-scan::before {
  content: '';
  position: absolute;
  inset: 0;
  background-image: repeating-linear-gradient(
    0deg,
    transparent 0px, transparent 2px,
    rgba(217,79,144,0.06) 2px, rgba(217,79,144,0.06) 3px
  );
  background-size: 100% 60px;
  animation: ct-scanline-drift 8s linear infinite;
  pointer-events: none;
  z-index: 2;
}
```

**Step 2: Verify**
- The dossier card (the one with `.ct-scan`) should show scanlines slowly drifting upward
- Scanlines should be very subtle (6% opacity) — barely perceptible, more atmospheric than obvious
- If scanlines appear but don't move: `background-position` animation may need `background-position-y` instead — try replacing `background-position: 0 -60px` with `background-position-y: -60px`

---

## Task 4: Glitch RGB breathe

**Step 1: Append glitch rules**

```css
/* ── GLITCH RGB BREATHE ── */

.ct-glitch::before {
  animation: ct-rgb-breathe 5s ease-in-out infinite;
}
.ct-glitch::after {
  animation: ct-rgb-breathe 5s ease-in-out infinite;
  animation-delay: -2.5s; /* phase-offset — channels breathe out of sync */
}
/* Hover pauses animation — existing hover transforms take full control */
.ct-glitch:hover::before,
.ct-glitch:hover::after {
  animation-play-state: paused;
}
```

**Step 2: Verify**
- The `whykusanagi` name and the collab header should show the pink/dark pink aberration channels slowly fading in and out
- The two channels (::before and ::after) should be out of phase with each other
- On hover, aberration should snap to the larger offset (existing behavior) — animation pauses, hover transform takes over

---

## Task 5: Label flicker + JP fade + Status pulse

**Step 1: Append these three rules**

```css
/* ── LABEL FLICKER ── */

.ct-label {
  animation: ct-label-flicker 7s ease-in-out infinite;
}

/* ── JP TEXT FADE ── */

.ct-jp {
  animation: ct-jp-fade 3s ease-in-out infinite;
}

/* ── STATUS PULSE ── */

.ct-status-active {
  animation: ct-status-pulse 2s ease-in-out infinite;
}
```

**Step 2: Verify**
- All `// DOSSIER :: FILE_RETRIEVED`, `// stream.log`, `// art.output`, `// tools.deployed` labels should flicker subtly (twice per 7s cycle, irregular)
- The `░▒▓` JP decorative chars in the CTA section should slowly pulse between full and near-invisible opacity
- The `ACTIVE` and `ONLINE` status badges should glow green in a slow heartbeat

---

## Task 6: Bar shimmer + Logo glow

**Step 1: Append these rules**

```css
/* ── BAR SHIMMER ── */

.ct-bar-fill {
  position: relative;
  overflow: hidden;
}
.ct-bar-fill::after {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 35%;
  height: 100%;
  background: linear-gradient(
    90deg,
    transparent 0%,
    rgba(255,255,255,0.4) 50%,
    transparent 100%
  );
  animation: ct-bar-shimmer 3s linear infinite;
}

/* ── LOGO GLOW ── */

.ct-logo {
  animation: ct-logo-glow 5s ease-in-out infinite;
}
```

**Step 2: Verify**
- The CHAOS INDEX progress bar should have a white highlight sweep across it every 3s
- The `idol-sig.png` logo should pulse from its base glow to a stronger pink glow every 5s

---

## Task 7: Accessibility block

**Step 1: Append at the very end (must be last rule in the CSS)**

```css
/* ── ACCESSIBILITY ── */

@media (prefers-reduced-motion: reduce) {
  .ct-card,
  .ct-card-dim,
  .ct-scan::before,
  .ct-glitch::before,
  .ct-glitch::after,
  .ct-label,
  .ct-jp,
  .ct-status-active,
  .ct-bar-fill::after,
  .ct-logo {
    animation: none;
  }
}
```

**Step 2: Verify (optional)**
- In browser DevTools → Rendering → enable "Emulate CSS prefers-reduced-motion: reduce"
- All animations should stop; profile remains fully styled and readable

---

## Complete animation block (single paste)

If you prefer to paste everything at once rather than task-by-task, here is the complete block to append at the end of your existing custom CSS:

```css
/* ═══════════════════════════════════════════
   AMBIENT ANIMATION LAYER — 2026-02-27
   @keyframes supported via myoshi PostCSS
   Pure CSS — no JS — GPU-safe only
   ═══════════════════════════════════════════ */

@keyframes ct-glow-breathe {
  0%, 100% { filter: drop-shadow(0 0 4px rgba(217,79,144,0.08)); }
  50%       { filter: drop-shadow(0 0 18px rgba(217,79,144,0.35)); }
}
@keyframes ct-scanline-drift {
  0%   { background-position: 0 0; }
  100% { background-position: 0 -60px; }
}
@keyframes ct-rgb-breathe {
  0%, 100% { opacity: 0.8; }
  50%       { opacity: 0.15; }
}
@keyframes ct-label-flicker {
  0%, 100% { opacity: 1; }
  15%       { opacity: 0.45; }
  17%       { opacity: 1; }
  65%       { opacity: 0.65; }
  68%       { opacity: 1; }
}
@keyframes ct-jp-fade {
  0%, 100% { opacity: 1; }
  50%       { opacity: 0.25; }
}
@keyframes ct-status-pulse {
  0%, 100% { box-shadow: 0 0 2px rgba(0,204,85,0.2); }
  50%       { box-shadow: 0 0 10px rgba(0,204,85,0.7); }
}
@keyframes ct-bar-shimmer {
  0%   { transform: translateX(-300%); }
  100% { transform: translateX(500%); }
}
@keyframes ct-logo-glow {
  0%, 100% { filter: drop-shadow(0 0 8px rgba(217,79,144,0.45)); }
  50%       { filter: drop-shadow(0 0 22px rgba(217,79,144,0.9)); }
}

.ct-card {
  animation: ct-glow-breathe 4s ease-in-out infinite;
}
.ct-card:nth-child(1) { animation-delay: 0s; }
.ct-card:nth-child(2) { animation-delay: -1.3s; }
.ct-card:nth-child(3) { animation-delay: -2.6s; }
.ct-card:nth-child(4) { animation-delay: -0.7s; }
.ct-card-dim {
  animation: ct-glow-breathe 4s ease-in-out infinite;
  animation-delay: -1.9s;
}

.ct-scan {
  position: relative;
  overflow: hidden;
}
.ct-scan::before {
  content: '';
  position: absolute;
  inset: 0;
  background-image: repeating-linear-gradient(
    0deg,
    transparent 0px, transparent 2px,
    rgba(217,79,144,0.06) 2px, rgba(217,79,144,0.06) 3px
  );
  background-size: 100% 60px;
  animation: ct-scanline-drift 8s linear infinite;
  pointer-events: none;
  z-index: 2;
}

.ct-glitch::before {
  animation: ct-rgb-breathe 5s ease-in-out infinite;
}
.ct-glitch::after {
  animation: ct-rgb-breathe 5s ease-in-out infinite;
  animation-delay: -2.5s;
}
.ct-glitch:hover::before,
.ct-glitch:hover::after {
  animation-play-state: paused;
}

.ct-label {
  animation: ct-label-flicker 7s ease-in-out infinite;
}
.ct-jp {
  animation: ct-jp-fade 3s ease-in-out infinite;
}
.ct-status-active {
  animation: ct-status-pulse 2s ease-in-out infinite;
}

.ct-bar-fill {
  position: relative;
  overflow: hidden;
}
.ct-bar-fill::after {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 35%;
  height: 100%;
  background: linear-gradient(
    90deg,
    transparent 0%,
    rgba(255,255,255,0.4) 50%,
    transparent 100%
  );
  animation: ct-bar-shimmer 3s linear infinite;
}

.ct-logo {
  animation: ct-logo-glow 5s ease-in-out infinite;
}

@media (prefers-reduced-motion: reduce) {
  .ct-card,
  .ct-card-dim,
  .ct-scan::before,
  .ct-glitch::before,
  .ct-glitch::after,
  .ct-label,
  .ct-jp,
  .ct-status-active,
  .ct-bar-fill::after,
  .ct-logo {
    animation: none;
  }
}
```

---

## Troubleshooting

| Symptom | Likely cause | Fix |
|---|---|---|
| Cards all pulse in sync | `nth-child` selectors not matching | Add `style="animation-delay: -Xs"` inline to each `.ct-card` div in HTML |
| Scanlines visible but not moving | `background-position` blocked by `!important` | Switch to `background-position-y: -60px` in the keyframe |
| Glitch channels don't fade | `::before`/`::after` `opacity` blocked | Confirm the scoped selectors are reaching the pseudo-elements in preview |
| Bar shimmer clipped too aggressively | `overflow: hidden` on 4px bar | Adjust shimmer width from `35%` to `50%` |
| Logo animation resets on hover | No issue — `ct-logo-glow` runs continuously | Expected behavior |
