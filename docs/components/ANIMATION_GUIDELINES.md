# Animation Guidelines

> **Celeste Brand System** | Component Documentation
> **Document**: Animation Guidelines
> **Version**: 1.0.0
> **Last Updated**: 2025-12-13

---

## Table of Contents

1. [Overview](#overview)
2. [Core Principles](#core-principles)
3. [Timing System](#timing-system)
4. [Easing Functions](#easing-functions)
5. [Animation Types](#animation-types)
6. [Corruption Animations](#corruption-animations)
7. [CLI Terminal Animations](#cli-terminal-animations)
8. [Performance Guidelines](#performance-guidelines)
9. [Accessibility](#accessibility)
10. [Implementation Examples](#implementation-examples)

---

## Overview

Animation brings the Celeste brand to life while maintaining the **translation-failure corruption aesthetic**. All animations must balance premium polish with glitching imperfection, creating an authentic corrupted AI experience.

### Animation Philosophy

- **Purposeful**: Every animation serves a functional or branding purpose
- **Performant**: 60fps minimum, GPU-accelerated when possible
- **Accessible**: Respects `prefers-reduced-motion` user preference
- **Corrupted**: Subtle glitches enhance brand identity without disrupting UX
- **Consistent**: Same timing/easing across platforms (web + CLI)

---

## Core Principles

### 1. Speed Hierarchy

Animations must feel **fast but not rushed**, with three distinct speed tiers:

| Tier | Duration | Use Case | Example |
|------|----------|----------|---------|
| **Micro** | 150ms | Immediate feedback | Button hover, focus ring appearance |
| **Standard** | 300ms | Primary transitions | Card expansion, modal open/close |
| **Slow** | 500ms | Complex changes | Page transitions, layout shifts |

### 2. Natural Motion

- **Ease-in-out** is the default easing (feels natural)
- **Avoid linear** easing (feels robotic except for loaders)
- **Custom curves** for brand-specific animations (corruption glitch, bounce)

### 3. Layered Timing

When animating multiple properties, **stagger timing** to create depth:

```css
/* Good: Staggered properties feel polished */
.card {
  transition:
    transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1),      /* Bounce first */
    box-shadow 0.3s ease-out 0.05s,                        /* Shadow follows */
    border-color 0.3s ease-out 0.1s;                       /* Border last */
}

/* Bad: Simultaneous properties feel flat */
.card {
  transition: all 0.3s ease;  /* Don't use 'all' */
}
```

### 4. Directional Consistency

- **Entrances**: Fade in + slide from direction of origin (300ms)
- **Exits**: Fade out + slide toward destination (200ms, 33% faster)
- **Exits are faster** than entrances (user already made decision)

---

## Timing System

### Duration Scale

All durations are based on **multiples of 50ms** for consistency:

```css
/* CSS Custom Properties */
:root {
  /* Micro-interactions */
  --duration-instant:  100ms;  /* Hover color changes */
  --duration-fast:     150ms;  /* Focus indicators, tooltips */
  --duration-quick:    200ms;  /* Dropdown open, badge appear */

  /* Standard transitions */
  --duration-normal:   300ms;  /* Modal open, card expand */
  --duration-moderate: 400ms;  /* Sidebar slide, toast enter */

  /* Complex transitions */
  --duration-slow:     500ms;  /* Page transitions */
  --duration-slower:   700ms;  /* Full layout shifts */
  --duration-slowest: 1000ms;  /* Loading screens only */
}
```

### When to Use Each Duration

#### 100ms (Instant)
- Color changes on hover
- Background tint changes
- Icon color shifts

#### 150ms (Fast) ⭐ Default for micro-interactions
- Button hover states
- Focus ring appearance
- Small scale changes (1.0 → 1.05)
- Border color changes

#### 200ms (Quick)
- Dropdown menu open
- Tooltip appearance
- Badge/chip animations
- Small element exits

#### 300ms (Normal) ⭐ Default for standard transitions
- Modal/dialog open
- Card expansion
- Accordion open/close
- Tab switching
- Form field validation feedback

#### 400ms (Moderate)
- Sidebar slide in/out
- Toast notification enter
- Complex hover effects (multiple properties)
- Menu navigation transitions

#### 500ms (Slow)
- Page route transitions
- Full-screen overlay enter
- Large layout shifts
- Dashboard section transitions

#### 700ms+ (Slower)
- **Use sparingly** - Reserved for:
  - Initial page load animations
  - Loading screen transitions
  - Full application state changes

---

## Easing Functions

### Standard Easing Curves

```css
:root {
  /* Default easing (natural motion) */
  --ease-default:     ease;                              /* Browser default */
  --ease-in-out:      cubic-bezier(0.42, 0, 0.58, 1);   /* Symmetric */

  /* Directional easing */
  --ease-in:          cubic-bezier(0.42, 0, 1, 1);      /* Starts slow */
  --ease-out:         cubic-bezier(0, 0, 0.58, 1);      /* Ends slow */

  /* Custom easing (brand-specific) */
  --ease-bounce:      cubic-bezier(0.34, 1.56, 0.64, 1); /* Overshoot bounce */
  --ease-snappy:      cubic-bezier(0.16, 1, 0.3, 1);     /* Fast start, smooth end */
  --ease-glitch:      cubic-bezier(0.68, -0.55, 0.27, 1.55); /* Corrupted motion */
  --ease-smooth:      cubic-bezier(0.25, 0.1, 0.25, 1);  /* Material Design */
}
```

### Easing Selection Guide

| Easing | Use Case | Visual Effect |
|--------|----------|---------------|
| `ease` | **Default** - Most transitions | Natural acceleration/deceleration |
| `ease-in-out` | Symmetric motion | Smooth start and end |
| `ease-out` | **Recommended for entrances** | Elements settle into place |
| `ease-in` | **Recommended for exits** | Elements accelerate away |
| `cubic-bezier(0.34, 1.56, 0.64, 1)` | **Bounce effect** (brand signature) | Playful overshoot (buttons, cards) |
| `cubic-bezier(0.68, -0.55, 0.27, 1.55)` | **Glitch effect** (corruption) | Erratic, corrupted motion |
| `linear` | Loading spinners, progress bars | Constant speed (no acceleration) |

### When to Use Custom Easing

**Bounce (`--ease-bounce`)** - Signature Celeste animation:
- Button clicks (scale 1.0 → 0.98 → 1.0)
- Card hover interactions
- Badge/chip appearances
- Success state confirmations

**Glitch (`--ease-glitch`)** - Corruption aesthetic:
- Text scramble/corruption effects
- Error state transitions
- Eye flicker animations
- Translation-failure text changes

---

## Animation Types

### 1. Transitions (Default)

Use CSS `transition` for simple state changes:

```css
.btn {
  /* Properties to animate | duration | easing | delay */
  transition:
    background-color 0.15s ease-out,
    border-color 0.15s ease-out,
    transform 0.15s cubic-bezier(0.34, 1.56, 0.64, 1),
    box-shadow 0.2s ease-out 0.05s;  /* Delayed shadow */
}

.btn:hover {
  background-color: var(--color-accent-light);
  border-color: rgba(217, 79, 144, 0.5);
  transform: scale(1.05);
  box-shadow: 0 0 20px rgba(217, 79, 144, 0.4);
}
```

### 2. Keyframe Animations

Use `@keyframes` for complex, looping, or multi-step animations:

```css
/* Spinner (loading indicator) */
@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.spinner {
  animation: spin 1s linear infinite;  /* Linear for constant rotation */
}

/* Pulse (attention-grabbing) */
@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}

.loading-badge {
  animation: pulse 1.5s ease-in-out infinite;
}

/* Bounce in (entrance animation) */
@keyframes bounceIn {
  0% {
    opacity: 0;
    transform: scale(0.3) translateY(-20px);
  }
  50% {
    transform: scale(1.05);  /* Overshoot */
  }
  70% {
    transform: scale(0.95);  /* Settle */
  }
  100% {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
}

.card-enter {
  animation: bounceIn 0.5s cubic-bezier(0.34, 1.56, 0.64, 1);
}
```

### 3. Transform Animations

**CRITICAL**: Only animate GPU-accelerated properties for 60fps performance:

✅ **Animate these** (GPU-accelerated):
- `transform: translate()` - Move elements
- `transform: scale()` - Size changes
- `transform: rotate()` - Rotation
- `opacity` - Fade in/out

❌ **Never animate these** (CPU-bound, causes reflow):
- `width`, `height` - Use `scale()` instead
- `top`, `left`, `margin` - Use `translate()` instead
- `padding` - Pre-render different states
- `background-position` - Use `transform` on pseudo-element

```css
/* Good: GPU-accelerated */
.card {
  transition: transform 0.3s ease-out;
}
.card:hover {
  transform: scale(1.02) translateY(-4px);
}

/* Bad: Causes reflow */
.card {
  transition: width 0.3s ease-out, margin-top 0.3s ease-out;
}
.card:hover {
  width: 320px;
  margin-top: -4px;
}
```

---

## Corruption Animations

### Philosophy

Corruption animations are the **signature Celeste brand element**. They must:
- Be **subtle** (25-40% intensity) to maintain readability
- **Enhance, not disrupt** the user experience
- Follow the **translation-failure aesthetic** (character-level mixing, NOT leet speak)

### Intensity Guidelines

| Intensity | Corruption % | Use Case |
|-----------|--------------|----------|
| **Minimal** | 15-20% | Body text, critical information |
| **Low** | 25-30% | Headers, non-critical labels |
| **Medium** | 35-40% | Decorative text, brand elements |
| **High** | 45-50% | Easter eggs, loading screens |
| **Extreme** | 50%+ | ⚠️ **Never use** - unreadable |

### Text Corruption Animation

Character-level corruption with Japanese character mixing:

```css
@keyframes textCorrupt {
  0%, 100% {
    opacity: 1;
  }
  10% {
    opacity: 0.8;
    transform: translateX(1px);
  }
  20% {
    opacity: 1;
    transform: translateX(-1px);
  }
  30% {
    opacity: 0.9;
    transform: translateX(0);
  }
}

.corrupted-text {
  animation: textCorrupt 3s ease-in-out infinite;
  /* JavaScript handles character replacement */
}
```

**JavaScript Implementation** (character-level mixing):

```javascript
function corruptText(text, intensity = 0.3) {
  const japaneseChars = ['ア', 'イ', 'ウ', '使', '統', '計', 'ー', 'ル'];

  return text.split('').map((char, i) => {
    if (Math.random() < intensity && /[a-zA-Z]/.test(char)) {
      return japaneseChars[Math.floor(Math.random() * japaneseChars.length)];
    }
    return char;
  }).join('');
}

// Example: "USAGE ANALYTICS" → "US使AGE ANア統LYTICS" (30% corruption)
```

### Flicker Animation (Eyes)

The signature "eye flicker" animation from CLI dashboard:

```css
@keyframes flicker {
  0%, 100% { opacity: 1; }
  45% { opacity: 1; }
  50% { opacity: 0.3; }   /* Brief blink */
  55% { opacity: 1; }
  60% { opacity: 0.5; }   /* Double blink */
  65% { opacity: 1; }
}

.eye-icon {
  animation: flicker 4s ease-in-out infinite;
  animation-delay: calc(var(--flicker-seed) * 1s);  /* Randomize timing */
}
```

### Glitch Effect (Advanced)

Multi-layer glitch effect for error states or brand moments:

```css
@keyframes glitch {
  0% {
    transform: translate(0);
    opacity: 1;
  }
  20% {
    transform: translate(-2px, 2px);
    opacity: 0.8;
  }
  40% {
    transform: translate(2px, -2px);
    opacity: 0.9;
  }
  60% {
    transform: translate(-1px, -1px);
    opacity: 0.85;
  }
  80% {
    transform: translate(1px, 1px);
    opacity: 0.95;
  }
  100% {
    transform: translate(0);
    opacity: 1;
  }
}

.glitch-text {
  position: relative;
  animation: glitch 0.3s cubic-bezier(0.68, -0.55, 0.27, 1.55);
}

/* Optional: RGB split effect */
.glitch-text::before,
.glitch-text::after {
  content: attr(data-text);
  position: absolute;
  top: 0;
  left: 0;
  opacity: 0.8;
}

.glitch-text::before {
  animation: glitch 0.3s cubic-bezier(0.68, -0.55, 0.27, 1.55);
  color: #d94f90;  /* Pink channel */
  z-index: -1;
}

.glitch-text::after {
  animation: glitch 0.3s cubic-bezier(0.68, -0.55, 0.27, 1.55) 0.05s;
  color: #8b5cf6;  /* Purple channel */
  z-index: -2;
}
```

### Loading Spinner (Corrupted)

```css
@keyframes spinCorrupt {
  0% { transform: rotate(0deg); }
  25% { transform: rotate(90deg) scale(1.1); }   /* Stutter */
  26% { transform: rotate(85deg) scale(1.0); }   /* Correction */
  50% { transform: rotate(180deg); }
  75% { transform: rotate(270deg) scale(0.9); }  /* Stutter */
  76% { transform: rotate(275deg) scale(1.0); }  /* Correction */
  100% { transform: rotate(360deg); }
}

.spinner-corrupted {
  animation: spinCorrupt 1.2s cubic-bezier(0.68, -0.55, 0.27, 1.55) infinite;
}
```

---

## CLI Terminal Animations

### Terminal Constraints

- **Refresh Rate**: Most terminals refresh at 60Hz (16.67ms per frame)
- **Character-Based**: Can't use sub-character positioning
- **Color Limitations**: 256-color palette (not full RGB)
- **No Blur/Shadow**: CSS effects unavailable

### Animation Techniques

#### 1. Frame-Based Animation (Spinner)

```go
// Rotating spinner frames
var spinnerFrames = []string{"⠋", "⠙", "⠹", "⠸", "⠼", "⠴", "⠦", "⠧", "⠇", "⠏"}

func (m Model) Update(msg tea.Msg) (tea.Model, tea.Cmd) {
    switch msg := msg.(type) {
    case tickMsg:
        m.spinnerFrame = (m.spinnerFrame + 1) % len(spinnerFrames)
        return m, tick(150 * time.Millisecond)  // 150ms per frame
    }
}
```

#### 2. Progress Bar Animation

```go
// Block character progress (smooth with unicode)
var progressChars = []string{"█", "▓", "▒", "░"}

func renderProgress(percent float64) string {
    filled := int(percent * 40)  // 40 char width
    bar := strings.Repeat("█", filled)
    bar += strings.Repeat("░", 40-filled)
    return bar
}
```

#### 3. Text Fade (ANSI Color Gradients)

```go
// Fade text by reducing color intensity
var fadeColors = []string{
    "\033[38;5;205m",  // Full pink (100%)
    "\033[38;5;204m",  // Lighter (80%)
    "\033[38;5;203m",  // Lighter (60%)
    "\033[38;5;202m",  // Lighter (40%)
    "\033[38;5;201m",  // Lighter (20%)
}

func fadeText(text string, frame int) string {
    color := fadeColors[frame % len(fadeColors)]
    return color + text + "\033[0m"
}
```

#### 4. Corruption Intensity Animation

```go
// Gradually increase corruption intensity
func animateCorruption(text string, tick int) string {
    intensity := 0.15 + (float64(tick % 100) / 100.0 * 0.25)  // 15-40%
    return CorruptTextJapanese(text, intensity)
}
```

### CLI Animation Timing

Match web timing where possible for cross-platform consistency:

| Animation | Web | CLI | Implementation |
|-----------|-----|-----|----------------|
| **Spinner** | 150ms/frame | 150ms/frame | Frame-based rotation |
| **Progress bar** | 300ms/update | 300ms/update | Block character fill |
| **Text fade** | 150ms transition | 150ms/step | ANSI color change |
| **Corruption flicker** | 3s cycle | 3s cycle | Character replacement |

---

## Performance Guidelines

### Rule 1: Animate Only GPU Properties

✅ **Safe** (60fps on all devices):
- `transform` (translate, rotate, scale)
- `opacity`

⚠️ **Caution** (may drop frames on mobile):
- `backdrop-filter` (blur) - use sparingly
- `box-shadow` - pre-render or use pseudo-elements

❌ **Never** (causes jank):
- `width`, `height`, `top`, `left`, `margin`, `padding`
- `background-position` (use transform on ::before instead)

### Rule 2: Limit Concurrent Animations

- **Maximum 3-5 animated elements** visible at once
- **Pause animations** for off-screen elements (`Intersection Observer`)
- **Reduce motion** on low-powered devices

```javascript
// Pause animations for off-screen elements
const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.style.animationPlayState = 'running';
    } else {
      entry.target.style.animationPlayState = 'paused';
    }
  });
});

document.querySelectorAll('.animated').forEach(el => observer.observe(el));
```

### Rule 3: Use `will-change` Sparingly

```css
/* Good: Apply will-change only during animation */
.card:hover {
  will-change: transform;  /* Browser optimizes during hover */
}

.card {
  will-change: auto;  /* Remove optimization when done */
}

/* Bad: Always on (wastes memory) */
.card {
  will-change: transform, opacity, box-shadow;  /* Too many properties */
}
```

---

## Accessibility

### 1. Respect `prefers-reduced-motion`

**CRITICAL**: All animations must respect user preference:

```css
/* Default: Full animations */
.card {
  transition: transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
}

/* Reduced motion: Instant transitions */
@media (prefers-reduced-motion: reduce) {
  .card {
    transition: transform 0.01s linear;  /* Near-instant */
  }

  /* Disable decorative animations entirely */
  .corrupted-text,
  .flicker,
  .glitch-effect {
    animation: none;
  }
}
```

### 2. Never Animate Critical Content

- **Error messages**: Appear instantly (no delay/animation)
- **Form validation**: Immediate feedback (<100ms)
- **Focus indicators**: Instant appearance (accessibility requirement)
- **Loading states**: Show within 100ms (perceived performance)

### 3. Provide Skip Options

For long animations (>1s), provide skip button:

```html
<div class="loading-screen">
  <div class="animation">...</div>
  <button class="skip-btn">Skip animation</button>
</div>
```

---

## Implementation Examples

### Example 1: Animated Button (Complete)

```css
.btn {
  /* Base styles */
  background: rgba(217, 79, 144, 0.2);
  border: 1px solid rgba(217, 79, 144, 0.3);
  color: #ffffff;
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  cursor: pointer;

  /* Animations */
  transition:
    background-color 0.15s ease-out,
    border-color 0.15s ease-out,
    transform 0.15s cubic-bezier(0.34, 1.56, 0.64, 1),
    box-shadow 0.2s ease-out 0.05s;
}

.btn:hover {
  background: rgba(217, 79, 144, 0.3);
  border-color: rgba(217, 79, 144, 0.5);
  transform: scale(1.05);
  box-shadow: 0 0 20px rgba(217, 79, 144, 0.4);
}

.btn:active {
  transform: scale(0.98);
  transition-duration: 0.1s;  /* Faster on click */
}

/* Accessibility */
@media (prefers-reduced-motion: reduce) {
  .btn {
    transition: background-color 0.01s linear, border-color 0.01s linear;
  }
}
```

### Example 2: Modal Enter/Exit

```css
/* Modal backdrop */
.modal-backdrop {
  opacity: 0;
  animation: fadeIn 0.3s ease-out forwards;
}

@keyframes fadeIn {
  to { opacity: 1; }
}

/* Modal content */
.modal {
  opacity: 0;
  transform: scale(0.9) translateY(-20px);
  animation: modalEnter 0.4s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
}

@keyframes modalEnter {
  to {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
}

/* Exit animation (triggered by JS class) */
.modal.exiting {
  animation: modalExit 0.2s ease-in forwards;
}

@keyframes modalExit {
  to {
    opacity: 0;
    transform: scale(0.95) translateY(10px);
  }
}
```

### Example 3: Corrupted Loading Spinner (CLI + Web)

**Web**:
```css
.spinner-corrupted {
  width: 40px;
  height: 40px;
  border: 3px solid rgba(217, 79, 144, 0.2);
  border-top-color: #d94f90;
  border-radius: 50%;
  animation: spinCorrupt 1.2s cubic-bezier(0.68, -0.55, 0.27, 1.55) infinite;
}

@keyframes spinCorrupt {
  0% { transform: rotate(0deg); }
  25% { transform: rotate(90deg) scale(1.1); }
  26% { transform: rotate(85deg); }
  50% { transform: rotate(180deg); }
  75% { transform: rotate(270deg) scale(0.9); }
  76% { transform: rotate(275deg); }
  100% { transform: rotate(360deg); }
}
```

**CLI (Go)**:
```go
var spinnerFrames = []string{
    "⠋", "⠙", "⠹", "⠸", "⠼", "⠴", "⠦", "⠧", "⠇", "⠏",
}

func (m Model) View() string {
    frame := spinnerFrames[m.tick % len(spinnerFrames)]
    color := lipgloss.Color("#d94f90")

    // Add random stutter (corruption)
    if m.tick % 4 == 0 && rand.Float64() < 0.15 {
        frame = spinnerFrames[(m.tick-1) % len(spinnerFrames)]  // Repeat frame
    }

    return lipgloss.NewStyle().Foreground(color).Render(frame)
}
```

---

## Anti-Patterns

### ❌ Don't: Use `transition: all`

```css
/* Bad: Animates everything (slow, unintentional animations) */
.card {
  transition: all 0.3s ease;
}

/* Good: Specify properties explicitly */
.card {
  transition: transform 0.3s ease, opacity 0.3s ease;
}
```

### ❌ Don't: Animate Layout Properties

```css
/* Bad: Causes reflow */
.card:hover {
  width: 320px;
  margin-top: -10px;
}

/* Good: Use transform */
.card:hover {
  transform: scale(1.1) translateY(-10px);
}
```

### ❌ Don't: Over-Animate

```css
/* Bad: Too many concurrent animations (overwhelming) */
.card {
  animation: pulse 1s infinite, shake 0.5s infinite, glow 2s infinite;
}

/* Good: One primary animation */
.card {
  animation: pulse 2s ease-in-out infinite;
}
```

### ❌ Don't: Ignore Reduced Motion

```css
/* Bad: Forces animation on all users */
.element {
  animation: spin 1s infinite;  /* Can cause nausea */
}

/* Good: Respects user preference */
@media (prefers-reduced-motion: no-preference) {
  .element {
    animation: spin 1s infinite;
  }
}
```

---

## Quick Reference

### Animation Decision Tree

```
Need animation?
├─ Immediate feedback (<100ms)? → Use transition with 100-150ms
├─ State change? → Use transition with 150-300ms
├─ Complex multi-step? → Use @keyframes
├─ Loading indicator? → Use linear animation (constant speed)
├─ Decorative/branding? → Use cubic-bezier with reduced-motion fallback
└─ Layout change? → Use transform (never width/height/margin)
```

### Common Durations Cheat Sheet

```css
/* Copy-paste ready */
--fast:    150ms;  /* Hover, focus */
--normal:  300ms;  /* Modal, card */
--slow:    500ms;  /* Page transition */
```

### Common Easings Cheat Sheet

```css
/* Copy-paste ready */
--ease-default:  ease;                              /* General use */
--ease-bounce:   cubic-bezier(0.34, 1.56, 0.64, 1); /* Buttons, cards */
--ease-glitch:   cubic-bezier(0.68, -0.55, 0.27, 1.55); /* Corruption */
```

---

## Related Documentation

- [INTERACTIVE_STATES.md](./INTERACTIVE_STATES.md) - State-specific animation timings
- [GLASSMORPHISM.md](./GLASSMORPHISM.md) - Performance notes for backdrop-filter
- [COLOR_SYSTEM.md](../brand/COLOR_SYSTEM.md) - Color values for animations
- [TYPOGRAPHY.md](../brand/TYPOGRAPHY.md) - Text animation considerations
- [TRANSLATION_FAILURE_AESTHETIC.md](../brand/TRANSLATION_FAILURE_AESTHETIC.md) - Corruption guidelines

---

**Last Updated**: 2025-12-13
**Version**: 1.0.0
**Maintainer**: Celeste Brand System
**Status**: ✅ Phase 2 Complete
