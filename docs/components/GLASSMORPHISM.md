# Celeste Brand System - Glassmorphism

**Version**: 0.3.1
**Last Updated**: 2026-07-09
**Status**: 🟠 **HIGH PRIORITY DOCUMENT**

---

## Overview

Glassmorphism is the **signature visual effect** of Celeste's brand identity. It creates depth, hierarchy, and premium feel through frosted glass surfaces with blur, transparency, and subtle borders.

**Key principle**: "See through, but not clearly" - content behind glass is visible but blurred, creating layered depth.

---

## Core Glassmorphism Properties

All glass effects combine these four properties:

1. **Semi-transparent background** (`rgba()` with opacity)
2. **Backdrop blur** (`backdrop-filter: blur()`)
3. **Border** (subtle, often pink-tinted)
4. **Shadow** (pink-tinted glow)

### Anatomy

```css
.glass-element {
  /* 1. Semi-transparent background */
  background: rgba(20, 12, 40, 0.7);

  /* 2. Backdrop blur */
  backdrop-filter: blur(15px);
  -webkit-backdrop-filter: blur(15px); /* Safari support */

  /* 3. Subtle border */
  border: 1px solid rgba(217, 79, 144, 0.3);

  /* 4. Pink-tinted shadow */
  box-shadow: 0 4px 16px rgba(217, 79, 144, 0.25);

  /* Bonus: Rounded corners */
  border-radius: 12px;
}
```

---

## Three Depth Layers

Celeste uses **three depth layers** for visual hierarchy:

### Layer 1: Glass Default (Standard Depth)

**Use for**: Main content cards, dashboard sections, primary UI elements

```css
.glass-card {
  background: rgba(20, 12, 40, 0.7);      /* 70% opacity */
  backdrop-filter: blur(15px);             /* Medium blur */
  border: 1px solid rgba(217, 79, 144, 0.3);
  box-shadow: 0 4px 16px rgba(217, 79, 144, 0.25);
}
```

**Properties**:
- **Opacity**: 70% (0.7)
- **Blur**: 15px (medium)
- **Border opacity**: 30% (0.3)
- **Shadow**: Medium (0 4px 16px)

**Visual effect**: Solid enough to read content, blurred enough to see background

---

### Layer 2: Glass Light (Subtle Depth)

**Use for**: Hover states, nested elements, secondary cards

```css
.glass-card:hover,
.glass-light {
  background: rgba(28, 18, 48, 0.5);      /* 50% opacity */
  backdrop-filter: blur(10px);             /* Light blur */
  border: 1px solid rgba(217, 79, 144, 0.5);
  box-shadow: 0 2px 8px rgba(217, 79, 144, 0.15);
}
```

**Properties**:
- **Opacity**: 50% (0.5)
- **Blur**: 10px (light)
- **Border opacity**: 50% (0.5) - brighter on hover
- **Shadow**: Small (0 2px 8px)

**Visual effect**: More transparent, lighter feel, background more visible

---

### Layer 3: Glass Darker (Elevated Depth)

**Use for**: Modals, dropdowns, elevated panels, focus states

```css
.glass-card:active,
.glass-darker {
  background: rgba(12, 8, 28, 0.8);       /* 80% opacity */
  backdrop-filter: blur(20px);             /* Heavy blur */
  border: 1px solid rgba(217, 79, 144, 0.7);
  box-shadow: 0 8px 32px rgba(217, 79, 144, 0.35);
}
```

**Properties**:
- **Opacity**: 80% (0.8)
- **Blur**: 20px (heavy)
- **Border opacity**: 70% (0.7)
- **Shadow**: Large (0 8px 32px)

**Visual effect**: Darker, more solid, elevated above other content

---

## Blur Levels Specification

### Blur Scale

| Level | Blur Amount | Use Case | Performance Impact |
|-------|-------------|----------|-------------------|
| **None** | `0px` | Disabled glass (fallback) | ✅ None |
| **Subtle** | `2px` | Micro-interactions | ✅ Low |
| **Light** | `5px` | Form inputs, buttons | ✅ Low |
| **Medium** | `10px` | Secondary cards, hover | ⚠️ Medium |
| **Standard** | `15px` | Primary cards (default) | ⚠️ Medium |
| **Heavy** | `20px` | Modals, elevated elements | ❌ High |
| **Extreme** | `30px` | Hero sections only | ❌ Very High |

**Performance Note**: Each `backdrop-filter` triggers a separate blur pass. Limit to 1-2 visible glass elements per viewport for optimal performance.

### Browser Support

```css
/* Always include both prefixes */
.glass {
  backdrop-filter: blur(15px);         /* Standard */
  -webkit-backdrop-filter: blur(15px); /* Safari 9+ */
}
```

**Fallback for old browsers**:
```css
@supports not (backdrop-filter: blur(15px)) {
  .glass {
    background: rgba(20, 12, 40, 0.95); /* More opaque */
  }
}
```

**Browser support**:
- ✅ Chrome 76+ (2019)
- ✅ Safari 9+ (2015)
- ✅ Firefox 103+ (2022)
- ✅ Edge 79+ (2020)
- ❌ IE 11 (use fallback)

---

## Opacity Scale

### Background Opacity

| Opacity | Value | Use Case | Visual Effect |
|---------|-------|----------|---------------|
| **Very Light** | `0.3` | Overlays, tooltips | Very transparent |
| **Light** | `0.5` | Hover states, nested cards | Transparent |
| **Medium** | `0.6` | Form inputs, buttons | Balanced |
| **Standard** | `0.7` | Main cards (default) | Readable |
| **Heavy** | `0.8` | Modals, elevated elements | Mostly opaque |
| **Very Heavy** | `0.9` | Navigation bars | Almost solid |

**Formula**:
```
Opacity = 0.5 + (depth_level * 0.1)

- Light: 0.5 (50%)
- Standard: 0.7 (70%)
- Darker: 0.8 (80%)
```

---

## Shadow System (Pink-Tinted)

All shadows use **pink-tinted glow** for brand consistency.

### Shadow Scale

```css
/* Small shadow - Buttons, inputs */
box-shadow: 0 2px 8px rgba(217, 79, 144, 0.15);

/* Medium shadow - Cards (default) */
box-shadow: 0 4px 16px rgba(217, 79, 144, 0.25);

/* Large shadow - Elevated cards */
box-shadow: 0 8px 32px rgba(217, 79, 144, 0.35);

/* Extra large shadow - Modals */
box-shadow: 0 16px 64px rgba(217, 79, 144, 0.45);
```

**Shadow anatomy**:
- **X offset**: Always `0` (centered)
- **Y offset**: Increases with depth (2px → 4px → 8px → 16px)
- **Blur radius**: 4× the Y offset (8px → 16px → 32px → 64px)
- **Color**: Pink (`#d94f90`) with opacity (0.15 → 0.25 → 0.35 → 0.45)

### Glow Effect (Interactive)

On hover, add **additional glow** to shadows:

```css
.glass-card {
  box-shadow: 0 4px 16px rgba(217, 79, 144, 0.25);
  transition: box-shadow 0.3s ease;
}

.glass-card:hover {
  box-shadow:
    0 4px 16px rgba(217, 79, 144, 0.25),  /* Original shadow */
    0 0 20px rgba(217, 79, 144, 0.4);      /* Additional glow */
}
```

**Glow properties**:
- **X/Y offset**: `0 0` (radiates from center)
- **Blur radius**: 20px (soft glow)
- **Opacity**: 40% (0.4) - brighter than base shadow

---

## Border Integration

### Border Opacity Scale

Borders always use **pink accent color** (`#d94f90`) with varying opacity:

| State | Opacity | Border Color | Use Case |
|-------|---------|--------------|----------|
| **Default** | 30% (0.3) | `rgba(217, 79, 144, 0.3)` | Resting state |
| **Hover** | 50% (0.5) | `rgba(217, 79, 144, 0.5)` | Mouse over |
| **Focus** | 70% (0.7) | `rgba(217, 79, 144, 0.7)` | Keyboard focus |
| **Active** | 90% (0.9) | `rgba(217, 79, 144, 0.9)` | Pressed/selected |

**Width**: Always `1px` (except focus outline which is `2px`)

### Border Radius

```css
/* Small - Buttons, badges */
border-radius: 4px;

/* Medium - Cards, inputs (default) */
border-radius: 8px;

/* Large - Modals, panels */
border-radius: 12px;

/* Extra large - Hero sections */
border-radius: 16px;

/* Pills - Fully rounded */
border-radius: 9999px;
```

---

## Performance Optimization

### Best Practices

✅ **DO**:
- Limit to 1-2 glass elements per viewport
- Use `will-change: transform` for animated glass
- Test on mid-range devices (not just high-end)
- Provide non-blur fallback for older browsers

❌ **DON'T**:
- Nest glass effects 3+ levels deep
- Animate `backdrop-filter` value (expensive)
- Use on entire page backgrounds
- Combine with heavy transforms/animations

### Optimization Techniques

**1. Reduce blur for animations**:
```css
.glass-card {
  backdrop-filter: blur(15px);
  transition: transform 0.3s ease; /* Transform is cheap */
}

/* DON'T animate blur */
.glass-card:hover {
  backdrop-filter: blur(20px); /* ❌ Expensive re-calculation */
}

/* DO animate transform instead */
.glass-card:hover {
  transform: translateY(-2px); /* ✅ GPU-accelerated */
}
```

**2. Use `will-change` for known animations**:
```css
.glass-card-animated {
  backdrop-filter: blur(15px);
  will-change: transform; /* Hint to browser */
}
```

**3. Debounce scroll effects**:
```javascript
// Bad: Update glass on every scroll frame
window.addEventListener('scroll', () => {
  updateGlassEffect(); // ❌ 60fps × expensive blur = lag
});

// Good: Throttle updates
let ticking = false;
window.addEventListener('scroll', () => {
  if (!ticking) {
    window.requestAnimationFrame(() => {
      updateGlassEffect(); // ✅ Once per frame
      ticking = false;
    });
    ticking = true;
  }
});
```

---

## 0.2.0 Container Variants

The T12 glassmorphism CSS merge added standalone container classes and color modifier classes in `src/css/glassmorphism.css`. These compose with the existing depth layers.

### Standalone Container Classes

| Class | Opacity | Blur | Use Case |
|-------|---------|------|----------|
| `.glass-container` | 85% | 15px | Default container (replaces ad-hoc glass inline styles) |
| `.glass-container-dark` | 92% | 20px | Modals, dropdowns, elevated panels |
| `.glass-container-subtle` | 60% | 8px | Low-key background sections |
| `.glass-container-gradient` | 80% + gradient | 15px | Hero sections with branded gradient overlay |
| `.glass-container-animated` | 80% | 15px | Animated shimmer; adds border glow pulse |

All variants include the `@supports not (backdrop-filter)` fallback automatically — no extra code needed.

### Color Modifier Classes

Compose with any container class to tint the border and shadow:

```html
<!-- Cyan-tinted glass card -->
<div class="glass-container glass-container-cyan">...</div>

<!-- Purple-tinted elevated panel -->
<div class="glass-container-dark glass-container-purple">...</div>

<!-- Magenta accent (default brand) -->
<div class="glass-container glass-container-magenta">...</div>
```

| Modifier | Border Color | Shadow Tint |
|----------|-------------|-------------|
| `.glass-container-cyan` | `#00ffff` | cyan glow |
| `.glass-container-purple` | `#8b5cf6` | purple glow |
| `.glass-container-magenta` | `#d94f90` | magenta glow (default accent) |

### `@supports` Fallback

All new classes include an automatic `@supports not (backdrop-filter: blur(1px))` block that upgrades the background opacity to 0.95 so content remains readable on browsers without blur support.

---

## CLI Equivalent (Block Characters)

Since terminals don't support `backdrop-filter`, the CLI achieves glassmorphism through **block characters and color gradients**.

### Block Character Scale

```
█ - Solid (filled)
▓ - Dark (75% fill)
▒ - Medium (50% fill)
░ - Light (25% fill)
  - Empty (transparent)
```

### Dashboard Border Pattern

```
▓▒░ ═══════════════════════════════════════ ░▒▓
           👁️  US使AGE ANア統LYTICS  👁️
     ⟨ tōkei dēta wo... fuhai sasete iru... ⟩
▓▒░ ═══════════════════════════════════════ ░▒▓
```

**Explanation**:
- `▓▒░` - Gradient from dark to light (simulates glass edge fade)
- `═` - Double line border (simulates border)
- Content area uses ANSI colors for pink accent

### Progress Bar Glassmorphism

```
████████▓▒░░░░░░░░░░  40%
```

- `█` - Filled (solid pink foreground)
- `▓` - Transition zone (gradient)
- `▒` - Partial fill
- `░` - Empty (gray background)

**Implementation**:
```go
func renderProgressBar(filled, total, width int) string {
    filledWidth := (filled * width) / total

    bar := ""
    for i := 0; i < width; i++ {
        if i < filledWidth - 2 {
            bar += "█"  // Solid
        } else if i < filledWidth {
            bar += "▓"  // Transition
        } else if i < filledWidth + 1 {
            bar += "▒"  // Edge
        } else {
            bar += "░"  // Empty
        }
    }
    return bar
}
```

---

## Accessibility Considerations

### WCAG Compliance

**Text on glass surfaces must meet WCAG AA (4.5:1 contrast)**:

✅ **Good** (passes):
```css
.glass-card {
  background: rgba(20, 12, 40, 0.7); /* Dark enough */
  color: #ffffff;                     /* White text */
}
/* Contrast: 21:1 on dark background behind glass ✓ */
```

❌ **Bad** (fails):
```css
.glass-card {
  background: rgba(255, 255, 255, 0.3); /* Too light */
  color: #888888;                        /* Gray text */
}
/* Contrast: Variable, often <4.5:1 ✗ */
```

**Testing**: Always test with actual content behind glass (images, gradients, etc.)

### Reduced Motion

Respect `prefers-reduced-motion`:

```css
@media (prefers-reduced-motion: reduce) {
  .glass-card {
    backdrop-filter: none;              /* Disable blur */
    background: rgba(20, 12, 40, 0.95); /* More opaque */
    transition: none;                   /* No animation */
  }
}
```

**Why**: Blur animations can cause vestibular issues for some users.

---

## Common Patterns

### Pattern 1: Card Hover Effect

```css
.glass-card {
  background: rgba(20, 12, 40, 0.7);
  backdrop-filter: blur(15px);
  border: 1px solid rgba(217, 79, 144, 0.3);
  box-shadow: 0 4px 16px rgba(217, 79, 144, 0.25);
  transition: all 0.3s ease;
}

.glass-card:hover {
  background: rgba(28, 18, 48, 0.5);      /* Lighter */
  border-color: rgba(217, 79, 144, 0.5);  /* Brighter */
  box-shadow:
    0 4px 16px rgba(217, 79, 144, 0.25),
    0 0 20px rgba(217, 79, 144, 0.4);      /* Add glow */
  transform: translateY(-2px);             /* Subtle lift */
}
```

---

### Pattern 2: Button Glass Effect

```css
.glass-button {
  background: rgba(217, 79, 144, 0.1);
  backdrop-filter: blur(5px);
  border: 1px solid rgba(217, 79, 144, 0.3);
  color: var(--color-accent-primary);
  padding: 0.5rem 1.5rem;
  transition: all 0.3s ease;
}

.glass-button:hover {
  background: rgba(217, 79, 144, 0.2);
  border-color: rgba(217, 79, 144, 0.5);
  box-shadow: 0 0 20px rgba(217, 79, 144, 0.4);
}

.glass-button:active {
  background: rgba(182, 27, 112, 0.3); /* Darker pink */
  transform: scale(0.98);
}
```

---

### Pattern 3: Input with Glass

```css
.glass-input {
  background: rgba(20, 12, 40, 0.6);
  backdrop-filter: blur(5px);
  border: 1px solid rgba(217, 79, 144, 0.3);
  color: white;
  padding: 0.5rem 1rem;
  transition: all 0.3s ease;
}

.glass-input:focus {
  background: rgba(20, 12, 40, 0.8);      /* More opaque */
  border-color: rgba(217, 79, 144, 0.7);  /* Brighter */
  outline: 2px solid rgba(217, 79, 144, 0.5);
  outline-offset: 2px;
}

.glass-input::placeholder {
  color: rgba(255, 255, 255, 0.5);
}
```

---

### Pattern 4: Modal Overlay

```css
/* Semi-transparent backdrop */
.modal-overlay {
  background: rgba(0, 0, 0, 0.8);
  backdrop-filter: blur(10px);
}

/* Elevated glass modal */
.modal-content {
  background: rgba(12, 8, 28, 0.9);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(217, 79, 144, 0.7);
  box-shadow: 0 16px 64px rgba(217, 79, 144, 0.45);
  border-radius: 16px;
}
```

---

## Design Token Reference

From `DESIGN_TOKENS.md`:

```json
{
  "color": {
    "surface": {
      "glass": {
        "default": {
          "$value": "rgba(20, 12, 40, 0.7)",
          "$description": "Standard glassmorphism background"
        },
        "light": {
          "$value": "rgba(28, 18, 48, 0.5)",
          "$description": "Light glass for hover/nested"
        },
        "darker": {
          "$value": "rgba(12, 8, 28, 0.8)",
          "$description": "Dark glass for modals"
        }
      }
    }
  },
  "blur": {
    "sm": { "$value": "2px" },
    "md": { "$value": "5px" },
    "lg": { "$value": "10px" },
    "xl": { "$value": "15px" },
    "2xl": { "$value": "20px" }
  },
  "shadow": {
    "glass": {
      "sm": { "$value": "0 2px 8px rgba(217, 79, 144, 0.15)" },
      "md": { "$value": "0 4px 16px rgba(217, 79, 144, 0.25)" },
      "lg": { "$value": "0 8px 32px rgba(217, 79, 144, 0.35)" },
      "xl": { "$value": "0 16px 64px rgba(217, 79, 144, 0.45)" }
    }
  }
}
```

---

## Related Documents

- **COLOR_SYSTEM.md** - Pink accent color specifications
- **COMPONENT_LIBRARY.md** - Glass component usage
- **INTERACTIVE_STATES.md** - Hover, focus, active states
- **ANIMATION_GUIDELINES.md** - Transition timing for glass effects

---

**Status**: ✅ **GLASSMORPHISM COMPLETE** - Updated for 0.2.0 (new container variants + color modifiers)
