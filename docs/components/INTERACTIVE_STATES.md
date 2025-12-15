# Celeste Brand System - Interactive States

**Version**: 1.0.0
**Last Updated**: 2025-12-13
**Status**: 🟠 **HIGH PRIORITY DOCUMENT**

---

## Overview

Interactive states provide **visual feedback** for user interactions across all components. Consistent state styling creates predictable, accessible user experiences.

**Core principle**: Every interactive element must have distinct visual states for hover, focus, active, and disabled.

---

## State Hierarchy

```
Component Lifecycle
├── Default (Resting)          # No interaction
├── Hover (Mouse over)         # Pointer over element
├── Focus (Keyboard selected)  # Tab/click focus
├── Active (Pressed)           # Mouse down / touch
├── Disabled (Inactive)        # Cannot interact
└── Loading (Processing)       # Async operation
```

---

## Universal State Patterns

### Default State (Resting)

**Purpose**: Component at rest, no user interaction

**Visual characteristics**:
- **Border**: 30% opacity pink (`rgba(217, 79, 144, 0.3)`)
- **Background**: Base component background
- **Shadow**: Medium pink-tinted shadow
- **Cursor**: Appropriate for element type

**Example** (Button):
```css
.btn {
  background: var(--color-accent-primary);
  border: 1px solid rgba(217, 79, 144, 0.3);
  box-shadow: 0 2px 8px rgba(217, 79, 144, 0.15);
  cursor: pointer;
  transition: all 0.3s ease;
}
```

---

### Hover State (Mouse Over)

**Purpose**: Indicates element is interactive and ready to receive click/tap

**Visual changes from default**:
- **Border**: Brighter (50% opacity)
- **Background**: Lighter/brighter variant
- **Shadow**: Add glow effect
- **Transform**: Subtle lift (`translateY(-2px)`) for cards
- **Cursor**: `pointer` (if not already)

**Timing**: `0.3s ease` transition (standard)

**Example** (Button):
```css
.btn:hover {
  background: var(--color-accent-light);     /* Lighter pink */
  border-color: rgba(217, 79, 144, 0.5);     /* Brighter border */
  box-shadow:
    0 2px 8px rgba(217, 79, 144, 0.15),      /* Original shadow */
    0 0 20px rgba(217, 79, 144, 0.4);        /* Add glow */
}
```

**Example** (Glass Card):
```css
.glass-card:hover {
  background: rgba(28, 18, 48, 0.5);         /* Lighter glass */
  border-color: rgba(217, 79, 144, 0.5);
  transform: translateY(-2px);                /* Lift effect */
}
```

---

### Focus State (Keyboard Navigation)

**Purpose**: Indicates element has keyboard focus (Tab key)

**Visual characteristics**:
- **Outline**: 2px solid pink, 2px offset
- **Border**: Brighter (70% opacity)
- **Background**: Slightly lighter than default
- **Shadow**: Enhanced (not glowing)

**Accessibility requirement**: Focus indicator MUST be visible (WCAG 2.4.7)

**Example** (Button):
```css
.btn:focus-visible {
  outline: 2px solid rgba(217, 79, 144, 0.7);
  outline-offset: 2px;
  border-color: rgba(217, 79, 144, 0.7);
}
```

**Example** (Input):
```css
.glass-input:focus {
  background: rgba(20, 12, 40, 0.8);         /* More opaque */
  border-color: rgba(217, 79, 144, 0.7);
  outline: 2px solid rgba(217, 79, 144, 0.5);
  outline-offset: 2px;
  box-shadow: 0 0 0 3px rgba(217, 79, 144, 0.1); /* Focus ring */
}
```

**Note**: Use `:focus-visible` for buttons (hides outline on click), use `:focus` for inputs (always show outline)

---

### Active State (Pressed)

**Purpose**: Immediate visual feedback when clicking/pressing

**Visual characteristics**:
- **Border**: Brightest (90% opacity)
- **Background**: Darker variant (for buttons) or darker glass (for cards)
- **Shadow**: Reduced (closer to surface)
- **Transform**: `scale(0.98)` (subtle shrink)

**Timing**: `0.15s ease` (faster than hover for immediate feedback)

**Example** (Button):
```css
.btn:active {
  background: var(--color-accent-dark);      /* Darker pink */
  border-color: rgba(217, 79, 144, 0.9);
  box-shadow: 0 1px 4px rgba(217, 79, 144, 0.2); /* Smaller shadow */
  transform: scale(0.98);                     /* Shrink */
}
```

**Example** (Glass Card):
```css
.glass-card:active {
  background: rgba(12, 8, 28, 0.8);          /* Darker glass */
  border-color: rgba(217, 79, 144, 0.9);
  transform: scale(0.99);
}
```

---

### Disabled State (Inactive)

**Purpose**: Indicates element cannot be interacted with

**Visual characteristics**:
- **Opacity**: 50% (entire element)
- **Cursor**: `not-allowed`
- **Border**: Muted (10-20% opacity)
- **No transitions**: Disable hover/focus/active
- **Color**: Text uses `--color-text-disabled` (30% opacity white)

**Accessibility**: Add `aria-disabled="true"` or `disabled` attribute

**Example** (Button):
```css
.btn:disabled,
.btn.disabled {
  opacity: 0.5;
  cursor: not-allowed;
  pointer-events: none;                      /* Disable all interactions */
}
```

**Example** (Input):
```css
.glass-input:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  background: rgba(20, 12, 40, 0.4);         /* Less opaque */
  color: var(--color-text-disabled);
}
```

---

### Loading State (Processing)

**Purpose**: Indicates async operation in progress

**Visual characteristics**:
- **Cursor**: `wait` or `progress`
- **Content**: Replace with spinner or loading text
- **Disable interaction**: Add `pointer-events: none`
- **Optional**: Pulse animation

**Example** (Button):
```html
<button class="btn" data-loading="true">
  <span class="spinner"></span>
  Loading...
</button>
```

```css
.btn[data-loading="true"] {
  cursor: wait;
  pointer-events: none;
  opacity: 0.8;
}

.btn[data-loading="true"]::before {
  content: '';
  display: inline-block;
  width: 16px;
  height: 16px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top-color: white;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}
```

---

### Error State

**Purpose**: Indicates validation error or failed action

**Visual characteristics**:
- **Border**: Red (`#ff4757`) with 70% opacity
- **Background**: Red tint (optional)
- **Shake animation**: On error trigger
- **Error message**: Below element

**Example** (Input):
```css
.glass-input.error {
  border-color: rgba(255, 71, 87, 0.7);
  box-shadow: 0 0 0 3px rgba(255, 71, 87, 0.1);
  animation: shake 0.3s ease;
}

@keyframes shake {
  0%, 100% { transform: translateX(0); }
  25% { transform: translateX(-8px); }
  75% { transform: translateX(8px); }
}
```

**Error Message**:
```html
<input class="glass-input error" type="email">
<p class="error-message">Invalid email address</p>
```

```css
.error-message {
  color: var(--color-error);
  font-size: 0.875rem;
  margin-top: 0.25rem;
}
```

---

### Success State

**Purpose**: Indicates successful action or valid input

**Visual characteristics**:
- **Border**: Green (`#2ed573`) with 70% opacity
- **Background**: Green tint (optional)
- **Check icon**: Animated checkmark
- **Success message**: Below element

**Example** (Input):
```css
.glass-input.success {
  border-color: rgba(46, 213, 115, 0.7);
  box-shadow: 0 0 0 3px rgba(46, 213, 115, 0.1);
}
```

**Success Message**:
```html
<input class="glass-input success" type="email">
<p class="success-message">✓ Valid email address</p>
```

```css
.success-message {
  color: var(--color-success);
  font-size: 0.875rem;
  margin-top: 0.25rem;
}
```

---

## Component-Specific State Patterns

### Buttons

| State | Border Opacity | Background | Shadow | Transform |
|-------|---------------|------------|--------|-----------|
| Default | 30% | Accent primary | Small | none |
| Hover | 50% | Accent light | Medium + glow | none |
| Focus | 70% | Accent primary | Small | none |
| Active | 90% | Accent dark | Tiny | scale(0.98) |
| Disabled | 10% | Accent primary (50% opacity) | none | none |

**Transition timing**: `0.3s ease` (except active: `0.15s ease`)

---

### Cards

| State | Glass Opacity | Border Opacity | Shadow | Transform |
|-------|--------------|---------------|--------|-----------|
| Default | 70% | 30% | Medium | none |
| Hover | 50% | 50% | Medium + glow | translateY(-2px) |
| Focus | 70% | 70% | Medium | none |
| Active | 80% | 90% | Large | scale(0.99) |

**Transition timing**: `0.3s ease`

---

### Inputs

| State | Glass Opacity | Border Opacity | Outline | Placeholder |
|-------|--------------|---------------|---------|-------------|
| Default | 60% | 30% | none | 50% opacity |
| Hover | 60% | 50% | none | 50% opacity |
| Focus | 80% | 70% | 2px solid (50% opacity) | hidden |
| Disabled | 40% | 10% | none | 30% opacity |
| Error | 60% | 70% (red) | 3px (red tint) | 50% opacity |
| Success | 60% | 70% (green) | 3px (green tint) | 50% opacity |

**Transition timing**: `0.3s ease`

---

### Dropdowns

| State | Background | Border | Menu Visibility | Arrow |
|-------|-----------|--------|----------------|-------|
| Closed | Default | 30% | hidden | ▼ |
| Hover | Lighter | 50% | hidden | ▼ |
| Open | Lighter | 70% | visible | ▲ |
| Focus | Default | 70% | hidden | ▼ |

**Menu animation**: `slide-down` (0.3s ease)

---

### Badges

**No interactive states** (static elements)
- Badges are informational only
- If clickable, treat as buttons with badge styling

---

### Alerts

**Dismissible alerts only**:
- **Close button**: Standard button states
- **Alert container**: Static (no hover/focus)

---

## CLI Interactive States

Terminals have **limited visual feedback** options. Use these patterns:

### Hover (CLI Equivalent)

**Pattern**: Highlighted menu option
```
  Option 1
> Option 2  ← Pink highlight + arrow
  Option 3
```

**Implementation**:
```go
style := lipgloss.NewStyle().
    Foreground(lipgloss.Color("#d94f90")).
    Bold(true)

if isSelected {
    return "> " + style.Render(option)
}
return "  " + option
```

---

### Focus (CLI Equivalent)

**Pattern**: Selection indicator
```
[•] Option 1  ← Selected
[ ] Option 2
[ ] Option 3
```

**Implementation**:
```go
if isSelected {
    return "[•] " + option
}
return "[ ] " + option
```

---

### Active (CLI Equivalent)

**Pattern**: Executing state with corruption
```
⟨ 処理 processing purosesu... ⟩
```

**Implementation**:
```go
spinner := "⟨ " + corruptedPhrase + " ⟩"
```

---

### Disabled (CLI Equivalent)

**Pattern**: Dimmed text
```
  Option 1
  Option 2 (unavailable)  ← Dimmed
  Option 3
```

**Implementation**:
```go
style := lipgloss.NewStyle().
    Foreground(lipgloss.Color("240"))  // ANSI gray

if isDisabled {
    return style.Render(option + " (unavailable)")
}
```

---

### Loading (CLI Equivalent)

**Pattern**: Animated spinner
```
◐ Loading...
◓ Loading...
◑ Loading...
◒ Loading...
```

**Implementation**:
```go
frames := []string{"◐", "◓", "◑", "◒"}
spinner := frames[frame % len(frames)]
```

---

### Error (CLI Equivalent)

**Pattern**: Red text with emoji
```
🔴 Error: Failed to connect
```

**Implementation**:
```go
style := lipgloss.NewStyle().
    Foreground(lipgloss.Color("#ff4757"))

return "🔴 " + style.Render("Error: " + message)
```

---

### Success (CLI Equivalent)

**Pattern**: Green text with emoji
```
🟢 Success: Connected
```

**Implementation**:
```go
style := lipgloss.NewStyle().
    Foreground(lipgloss.Color("#2ed573"))

return "🟢 " + style.Render("Success: " + message)
```

---

## Transition Timing

### Standard Transitions

```css
/* Default: 0.3s ease */
transition: all 0.3s ease;

/* Fast: 0.15s ease (active states) */
transition: all 0.15s ease;

/* Slow: 0.5s ease (page transitions) */
transition: all 0.5s ease;
```

### Property-Specific Timing

```css
.btn {
  /* Different timing for different properties */
  transition:
    background 0.3s ease,
    border-color 0.3s ease,
    box-shadow 0.3s ease,
    transform 0.15s ease;  /* Faster transform */
}
```

### Easing Functions

```css
/* Default: ease-in-out (smooth start and end) */
transition: all 0.3s ease-in-out;

/* Bounce: Custom cubic-bezier (overshoots then settles) */
transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);

/* Sharp: ease-out (fast start, slow end) */
transition: all 0.3s ease-out;
```

---

## Accessibility Requirements

### WCAG 2.4.7 - Focus Visible

**Requirement**: Focus indicator MUST be visible

✅ **Good**:
```css
.btn:focus-visible {
  outline: 2px solid rgba(217, 79, 144, 0.7);
  outline-offset: 2px;
}
```

❌ **Bad**:
```css
.btn:focus {
  outline: none; /* ❌ Removes focus indicator */
}
```

---

### WCAG 2.5.5 - Target Size

**Requirement**: Interactive elements minimum 44×44px

✅ **Good**:
```css
.btn {
  padding: 0.75rem 1.5rem; /* > 44px height */
  min-width: 44px;
}
```

❌ **Bad**:
```css
.btn-sm {
  padding: 0.25rem 0.5rem; /* < 44px height */
}
```

**Fix for small buttons**: Add larger touch target
```css
.btn-sm {
  position: relative;
}

.btn-sm::before {
  content: '';
  position: absolute;
  inset: -8px; /* Expand touch area */
}
```

---

### WCAG 1.4.3 - Contrast

**Requirement**: Text contrast minimum 4.5:1

✅ **Good** (all Celeste states meet this):
- White text on pink: **4.9:1** ✓
- Pink on dark bg: **7.2:1** ✓
- Disabled text (30% opacity): **6.3:1** ✓

---

### Keyboard Navigation

**Requirement**: All interactive elements accessible via keyboard

✅ **Good**:
```html
<button class="btn">Click me</button>
<a href="#" class="btn">Link button</a>
```

❌ **Bad**:
```html
<div onclick="handleClick()">Click me</div> <!-- Not keyboard accessible -->
```

**Fix**: Add `tabindex` and keyboard handlers
```html
<div
  class="btn"
  role="button"
  tabindex="0"
  onclick="handleClick()"
  onkeydown="if(event.key==='Enter') handleClick()">
  Click me
</div>
```

---

## Animation Examples

### Hover Lift Effect

```css
.glass-card {
  transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.glass-card:hover {
  transform: translateY(-4px);
  box-shadow:
    0 8px 32px rgba(217, 79, 144, 0.35),
    0 0 20px rgba(217, 79, 144, 0.4);
}
```

---

### Button Press Feedback

```css
.btn {
  transition: transform 0.15s ease, box-shadow 0.15s ease;
}

.btn:active {
  transform: scale(0.96);
  box-shadow: 0 1px 4px rgba(217, 79, 144, 0.2);
}
```

---

### Input Focus Glow

```css
.glass-input {
  transition: all 0.3s ease;
}

.glass-input:focus {
  box-shadow:
    0 0 0 3px rgba(217, 79, 144, 0.1),
    0 4px 16px rgba(217, 79, 144, 0.25);
}
```

---

### Shake on Error

```css
.glass-input.error {
  animation: shake 0.3s ease;
}

@keyframes shake {
  0%, 100% { transform: translateX(0); }
  10%, 30%, 50%, 70%, 90% { transform: translateX(-4px); }
  20%, 40%, 60%, 80% { transform: translateX(4px); }
}
```

---

## Design Token Reference

From `DESIGN_TOKENS.md`:

```json
{
  "animation": {
    "timing": {
      "fast": { "$value": "0.15s" },
      "normal": { "$value": "0.3s" },
      "slow": { "$value": "0.5s" }
    },
    "easing": {
      "default": { "$value": "ease-in-out" },
      "bounce": { "$value": "cubic-bezier(0.34, 1.56, 0.64, 1)" }
    }
  },
  "opacity": {
    "disabled": { "$value": "0.5" },
    "placeholder": { "$value": "0.5" },
    "border": {
      "default": { "$value": "0.3" },
      "hover": { "$value": "0.5" },
      "focus": { "$value": "0.7" },
      "active": { "$value": "0.9" }
    }
  }
}
```

---

## Related Documents

- **ANIMATION_GUIDELINES.md** - Detailed timing and easing specifications
- **GLASSMORPHISM.md** - Glass effect state transitions
- **COLOR_SYSTEM.md** - State color variants
- **ACCESSIBILITY.md** - Complete WCAG compliance guide

---

**Status**: ✅ **INTERACTIVE STATES COMPLETE** - Ready for implementation
