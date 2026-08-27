# Colour System

**Package**: `@whykusanagi/corrupted-theme` 0.3.3
**Last Updated**: 2026-08-26
**WCAG Compliance**: AA for body text. Not every colour reaches AAA — see the compliance matrix.

> **Sources of truth.** The palette, surfaces and element colours come from
> **`src/data/colors.json`**, which ships with the npm package and is the
> machine-readable original; see [`docs/CROSS_LANGUAGE_CONTRACT.md`](../CROSS_LANGUAGE_CONTRACT.md)
> for its schema. Everything else on this page — glass, gradients, shadows,
> borders — is defined in **`src/css/variables.css`**. Where this document and
> those two disagree, they win.
>
> This page previously documented a separate palette that shipped nowhere:
> a `#0a0612`/`#140c28` background ramp, a `#00d4ff` cyan used as a status
> signal, and `#2ed573`/`#ffa502`/`#ff4757` semantic states. It also certified
> that its values matched `colors.json` exactly, which was not true. Corrected
> 2026-08-26 and now checked by `tests/data/contrast-claims.test.js` and
> `tests/data/color-sweep.test.js`.

---

## Overview

The palette is built for corruption aesthetics, in two tiers:

- **Theme colours — magenta, violet, white.** These are the aesthetic and they
  encode corruption state. A composition should read as on-theme using only
  these three.
- **Accents — cyan and red.** A compositional and typographic tool: highlight
  something, or lift text off a dark ground. **Never a state signal.**

Supporting the theme tier: magenta2 (high-energy), black (void), green (a rare
matrix callback). Backgrounds sit outside both tiers — they carry no state.

- **Glassmorphic surfaces** (semi-transparent with blur)
- **WCAG AA for body text** (4.5:1 minimum), AAA where white, cyan or green is used

---

## Primary Palette

### Accent Color: Celeste Pink

The signature brand color - used for primary actions, highlights, and corruption effects.

| Token Name | Hex Value | RGB | HSL | Use Case |
|------------|-----------|-----|-----|----------|
| `accent-primary` | `#d94f90` | `217, 79, 144` | `332°, 65%, 58%` | Default state, borders, icons |
| `accent-light` | `#e86ca8` | `232, 108, 168` | `331°, 72%, 67%` | Hover state, highlights |
| `accent-dark` | `#b61b70` | `182, 27, 112` | `327°, 74%, 41%` | Active/pressed state |

**WCAG Contrast Ratios**:
- ✅ `#d94f90` on `#0a0a0a` (`--bg`): **5.2:1** (AA — not AAA)
- ✅ `#d94f90` on `#12121a` (`--surface`): **5.0:1** (AA)
- ✅ White text on `#d94f90`: **3.8:1** (AA for large text only)

**CSS Usage**:
```css
.glass-card {
  border: 1px solid var(--color-accent-primary);
}

.glass-card:hover {
  border-color: var(--color-accent-light);
  box-shadow: 0 0 20px rgba(217, 79, 144, 0.4);
}

.glass-button:active {
  background: var(--color-accent-dark);
}
```

**Go Usage**:
```go
style := lipgloss.NewStyle().
    Foreground(lipgloss.Color("#d94f90")).
    Border(lipgloss.RoundedBorder()).
    BorderForeground(lipgloss.Color("#d94f90"))
```

---

### Secondary Colors

#### Purple Neon (`#8b5cf6`)

Used for secondary emphasis, section headers, and corruption phrases.

| Token Name | Hex Value | RGB | HSL | Use Case |
|------------|-----------|-----|-----|----------|
| `--corrupted-purple` | `#8b5cf6` | `139, 92, 246` | `258°, 90%, 66%` | Headers, emphasis, deep corruption |

There are no `-light` / `-dark` violet variants. The package declares one
violet; earlier revisions of this page listed `#a78bfa` and `#7c3aed` as hover
and active states, and neither exists in `colors.json` or `variables.css`. For
interactive states, vary opacity or use `--accent-light` / `--accent-dark`,
which are real.

**WCAG Contrast Ratios**:
- ✅ `#8b5cf6` on `#0a0a0a` (`--bg`): **4.7:1** (AA)
- ✅ White text on `#8b5cf6`: **4.2:1** (AA for large text only)

**Usage**:
- Dashboard section headers
- Romaji/Japanese phrase colors
- Glassmorphic overlay tints
- Progress bar filled sections

#### Cyan (`#00ffff`) — accent

An **accent**: a compositional and typographic tool for lifting something off a
dark ground. It is not a state signal, and it is not the stable-text colour —
white is. Cyan appeared in that role by mistake and propagated; see the 1.2
entry in the spec's version history.

| Token Name | Hex Value | RGB | HSL | Use Case |
|------------|-----------|-----|-----|----------|
| `--corrupted-cyan` | `#00ffff` | `0, 255, 255` | `180°, 100%, 50%` | Highlight, separation, RGB-split fringes |

Legitimate uses: the cyan channel of a chromatic-aberration pair (it works
*because* the other channel is `#ff0000`), glass borders and glows, the opt-in
`.corrupted-ghost-cyan` and `.glass-container-cyan` variants, and structural
grid chrome. Illegitimate: anything that means "info", "active", "processing"
or "success". No `-light` / `-dark` variants exist.

**WCAG Contrast Ratios**:
- ✅ `#00ffff` on `#0a0a0a` (`--bg`): **15.8:1** (AAA)
- ✅ `#00ffff` on `#12121a` (`--surface`): **15.0:1** (AAA)
- ✅ Black text on `#00ffff`: **16.7:1** (AAA)

**Usage**:
- Hyperlinks
- Info messages
- Corruption text highlights (cyan category)
- Status indicators (active/processing)

---

### Semantic State Colors

#### Success (`#00ff00`)

| Hex Value | RGB | HSL | Contrast on Dark |
|-----------|-----|-----|------------------|
| `#00ff00` | `0, 255, 0` | `120°, 100%, 50%` | **14.4:1** (AAA) |

**Usage**: Success messages, completed states, checkmarks (🟢)

#### Warning (`#d94f90`)

| Hex Value | RGB | HSL | Contrast on Dark |
|-----------|-----|-----|------------------|
| `#d94f90` | `217, 79, 144` | `332°, 64%, 58%` | **5.2:1** (AA) |

**Usage**: Warning messages, caution states, attention needed (🟡)

#### Error (`#ff0000`)

| Hex Value | RGB | HSL | Contrast on Dark |
|-----------|-----|-----|------------------|
| `#ff0000` | `255, 0, 0` | `0°, 100%, 50%` | **5.0:1** (AA) |

**Usage**: Error messages, danger states, critical alerts (🔴)

---

## Background Colors

### Base Backgrounds

**Backgrounds are not palette colours.** They carry no corruption state; they
are the ground the palette sits on. One ramp, four steps plus a checker, all
declared in `variables.css` and mirrored in `colors.json` under `surfaces`.
Reach for a step rather than inventing a new dark — pages inventing their own
is how eleven one-off darks accumulated before the ramp existed.

| Token | Hex Value | RGB | HSL | Use |
|-------|-----------|-----|-----|-----|
| `--bg` | `#0a0a0a` | `10, 10, 10` | `0°, 0%, 4%` | Page/body ground, terminal background |
| `--bg-secondary` | `#0f0f1a` | `15, 15, 26` | `240°, 27%, 8%` | Section ground |
| `--surface` | `#12121a` | `18, 18, 26` | `240°, 18%, 9%` | Panel or card sitting on the ground |
| `--surface-elevated` | `#1a1a24` | `26, 26, 36` | `240°, 16%, 12%` | Raised: hover, active tile, popover |
| `--checker` | `#17171f` | `23, 23, 31` | `240°, 15%, 11%` | Transparency checkerboard square |

Earlier revisions of this page documented a separate two-step ramp — "Deep
Void" `#0a0612` and "Dark Surface" `#140c28`. Neither ships.

---

### Glassmorphic Surface Colors

#### Default Glass (`rgba(20, 12, 40, 0.7)`)

Standard glassmorphism with 70% opacity.

| Token Name | RGBA Value | Hex Base | Opacity |
|------------|------------|----------|---------|
| `--glass` | `rgba(20, 12, 40, 0.7)` | `#140c28` | 70% |

**CSS Properties**:
```css
.glass-card {
  background: rgba(20, 12, 40, 0.7);
  backdrop-filter: blur(5px);
  -webkit-backdrop-filter: blur(5px);
  border: 1px solid rgba(217, 79, 144, 0.3);
  box-shadow: 0 4px 16px rgba(217, 79, 144, 0.25);
}
```

**WCAG Compliance**:
- When used with white text: **Contrast depends on background behind glass**
- Recommended: use on the surface ramp only (`--bg` `#0a0a0a` through `--surface-elevated` `#1a1a24`)
- Always test with actual content behind the glass

#### Light Glass (`rgba(28, 18, 48, 0.5)`)

Lighter glassmorphism for hover states and nested elements.

| Token Name | RGBA Value | Hex Base | Opacity |
|------------|------------|----------|---------|
| `--glass-light` | `rgba(28, 18, 48, 0.5)` | `#1c1230` | 50% |

**Usage**:
- Hover state for glass cards
- Nested glass elements (card within card)
- Subtle overlays

#### Darker Glass (`rgba(10, 5, 20, 0.6)`)

Darker glassmorphism for elevated/modal elements.

| Token Name | RGBA Value | Hex Base | Opacity |
|------------|------------|----------|---------|
| `--glass-darker` | `rgba(10, 5, 20, 0.6)` | `#0a0514` | 60% |

**Usage**:
- Modals and dialogs
- Dropdown menus
- Elevated panels
- Focus/active states

---

## Text Colors

### Primary Text

| Token Name | Value | Opacity | Contrast on `#0a0a0a` |
|------------|-------|---------|----------------------|
| `text-primary` | `#ffffff` | 100% | **19.8:1** (AAA) |
| `text-secondary` | `rgba(255, 255, 255, 0.7)` | 70% | **9.8:1** (AAA) |
| `text-tertiary` | `rgba(255, 255, 255, 0.5)` | 50% | **10.5:1** (AAA) |
| `text-disabled` | `rgba(255, 255, 255, 0.3)` | 30% | **6.3:1** (AA) |

**Usage Guidelines**:
- **Primary** (`#ffffff`): Headlines, primary body text, important labels
- **Secondary** (70% opacity): Subheadings, secondary text, descriptions
- **Tertiary** (50% opacity): Placeholders, hints, metadata
- **Disabled** (30% opacity): Disabled button text, inactive states

**WCAG Compliance**: All text colors meet AA (4.5:1) minimum on dark backgrounds

---

## Corruption Text Colors

Used for the translation-failure corruption aesthetic in Japanese/Romaji text.

Corruption is carried by the theme colours — magenta, violet, magenta2 — and
resolves to white. **Accents are not corruption colours.** Earlier revisions
assigned cyan to Romaji and red to lewd phrases, which gave both accents a
semantic role the palette explicitly withholds from them.

| Token | Hex Value | Use Case |
|-------|-----------|----------|
| `--corrupted-magenta` | `#ff00ff` | Primary corruption — Japanese glitches (ニャー, かわいい) |
| `--corrupted-purple` | `#8b5cf6` | Deep/intimate corruption — full Japanese phrases (壊れちゃう...) |
| `--corrupted-magenta2` | `#d94f90` | High-energy / playful corruption — Romaji (nyaa~, ara ara~) |
| `--corrupted-white` | `#ffffff` | Settled, decoded, final readable state |

Cyan and red appear in corrupted text only as **chromatic fringes** — the two
channels of an RGB split — never as the identity of a phrase.

**Implementation**:
```go
// celeste-cli, terminal renderer
var (
    corruptMagenta  = lipgloss.NewStyle().Foreground(lipgloss.Color("#ff00ff"))
    corruptPurple   = lipgloss.NewStyle().Foreground(lipgloss.Color("#8b5cf6"))
    corruptMagenta2 = lipgloss.NewStyle().Foreground(lipgloss.Color("#d94f90"))
    settled         = lipgloss.NewStyle().Foreground(lipgloss.Color("#ffffff"))
)
```

**CSS Implementation**:
```css
.corrupted-text.magenta  { color: var(--corrupted-magenta); }
.corrupted-text.purple   { color: var(--corrupted-purple); }
.corrupted-text.magenta2 { color: var(--corrupted-magenta2); }
.corrupted-text.settled  { color: var(--corrupted-white); }
```

---

## Border Colors

### Default Borders

| Token Name | Value | Use Case |
|------------|-------|----------|
| `border-default` | `rgba(217, 79, 144, 0.3)` | Default glass card borders |
| `border-hover` | `rgba(217, 79, 144, 0.5)` | Hover state borders |
| `border-focus` | `rgba(217, 79, 144, 0.7)` | Focus/active state borders |
| `border-subtle` | `rgba(255, 255, 255, 0.1)` | Dividers, subtle separators |

**Usage**:
```css
.glass-card {
  border: 1px solid var(--color-border-default);
}

.glass-card:hover {
  border-color: var(--color-border-hover);
}

.glass-button:focus {
  outline: 2px solid var(--color-border-focus);
  outline-offset: 2px;
}
```

---

## Shadow Colors

All shadows use pink-tinted glow for consistency with accent color.

### Shadow Specifications

| Token Name | Value | Use Case |
|------------|-------|----------|
| `shadow-glass-sm` | `0 2px 8px rgba(217, 79, 144, 0.15)` | Small cards, buttons |
| `shadow-glass-md` | `0 4px 16px rgba(217, 79, 144, 0.25)` | Default cards |
| `shadow-glass-lg` | `0 8px 32px rgba(217, 79, 144, 0.35)` | Elevated cards |
| `shadow-glass-xl` | `0 16px 64px rgba(217, 79, 144, 0.45)` | Modals, dialogs |

**Glow Effect** (hover enhancement):
```css
.glass-card:hover {
  box-shadow:
    0 4px 16px rgba(217, 79, 144, 0.25),
    0 0 20px rgba(217, 79, 144, 0.4);  /* Additional glow */
}
```

---

## Gradient Colors

### Background Gradients

#### Void Gradient (Page Background)

```css
background: linear-gradient(
  180deg,
  #0a0a0a 0%,    /* --bg, page ground */
  #0f0f1a 50%,   /* --bg-secondary */
  #12121a 100%   /* --surface */
);
```

#### Glass Gradient (Overlay)

```css
background: linear-gradient(
  135deg,
  rgba(217, 79, 144, 0.1) 0%,   /* Pink tint */
  rgba(139, 92, 246, 0.1) 100%  /* Purple tint */
);
```

---

## Color Usage Guidelines

### Interactive States

| State | Primary Color | Border | Shadow |
|-------|--------------|--------|--------|
| **Default** | `accent-primary` | 30% opacity | `shadow-glass-md` |
| **Hover** | `accent-light` | 50% opacity | `shadow-glass-md` + glow |
| **Active** | `accent-dark` | 70% opacity | `shadow-glass-sm` |
| **Focus** | `accent-primary` | 70% opacity | `shadow-glass-md` + outline |
| **Disabled** | `text-disabled` | 10% opacity | None |

**Example Implementation**:
```css
.glass-button {
  background: rgba(217, 79, 144, 0.1);
  border: 1px solid rgba(217, 79, 144, 0.3);
  color: var(--color-accent-primary);
  box-shadow: var(--shadow-glass-md);
  transition: all 0.3s ease-in-out;
}

.glass-button:hover {
  background: rgba(217, 79, 144, 0.2);
  border-color: rgba(217, 79, 144, 0.5);
  color: var(--color-accent-light);
  box-shadow:
    var(--shadow-glass-md),
    0 0 20px rgba(217, 79, 144, 0.4);
}

.glass-button:active {
  background: rgba(182, 27, 112, 0.3);
  border-color: rgba(182, 27, 112, 0.7);
  color: var(--color-accent-dark);
  box-shadow: var(--shadow-glass-sm);
}

.glass-button:focus-visible {
  outline: 2px solid rgba(217, 79, 144, 0.7);
  outline-offset: 2px;
}

.glass-button:disabled {
  background: rgba(255, 255, 255, 0.05);
  border-color: rgba(255, 255, 255, 0.1);
  color: var(--color-text-disabled);
  box-shadow: none;
  cursor: not-allowed;
}
```

---

## WCAG Accessibility Compliance

### Contrast Ratio Requirements

**WCAG Level AA** (Celeste's Minimum):
- **Normal text** (16px+): 4.5:1 minimum
- **Large text** (24px+ or 19px+ bold): 3:1 minimum
- **UI components**: 3:1 minimum

**WCAG Level AAA** (Aspirational):
- **Normal text**: 7:1 minimum
- **Large text**: 4.5:1 minimum

### Celeste's Compliance Matrix

| Combination | Contrast Ratio | WCAG Level | Status |
|-------------|----------------|------------|--------|
| White on `#0a0a0a` | 19.8:1 | AAA | ✅ |
| `#d94f90` magenta2 on `#0a0a0a` | 5.2:1 | AA | ✅ |
| `#8b5cf6` violet on `#0a0a0a` | 4.7:1 | AA | ✅ |
| `#00ffff` cyan on `#0a0a0a` | 15.8:1 | AAA | ✅ |
| `#ff0000` red on `#0a0a0a` | 5.0:1 | AA | ✅ |
| `#00ff00` green on `#0a0a0a` | 14.4:1 | AAA | ✅ |
| White text (70%) on `#0a0a0a` | 9.8:1 | AAA | ✅ |
| White text (50%) on `#0a0a0a` | 5.3:1 | AA | ✅ |
| White text (30%) on `#0a0a0a` | 2.6:1 | **fails** | ❌ do not use for text |

**All primary combinations meet WCAG AA minimum (4.5:1)**

### Testing Tools

- **WebAIM Contrast Checker**: https://webaim.org/resources/contrastchecker/
- **Chrome DevTools**: Lighthouse accessibility audit
- **axe DevTools**: Browser extension for WCAG testing
- **Color Oracle**: Colorblind simulator

---

## CLI (Terminal) Color Mapping

### ANSI 256-Color Codes

Nearest xterm-256 code for each theme colour, by squared RGB distance. Five of
the seven land exactly; magenta2 and violet are the only ones the 256-colour
cube cannot hit.

| Theme Colour | Hex | Closest ANSI Code | Hex Approximation |
|--------------|-----|-------------------|-------------------|
| White — settled | `#ffffff` | 231 | `#ffffff` (exact) |
| Magenta — primary corruption | `#ff00ff` | 201 | `#ff00ff` (exact) |
| Violet — deep corruption | `#8b5cf6` | 99 | `#875fff` |
| Magenta2 — high-energy | `#d94f90` | 168 | `#d75f87` |
| Green — system | `#00ff00` | 46 | `#00ff00` (exact) |
| Cyan — accent | `#00ffff` | 51 | `#00ffff` (exact) |
| Red — accent / alarm | `#ff0000` | 196 | `#ff0000` (exact) |

Lip Gloss takes a truecolor hex directly and downgrades it for weaker
terminals, so prefer the real hex and let it do the approximation.

**Usage in Go (Lip Gloss)**:
```go
// True color (24-bit) - preferred
style := lipgloss.NewStyle().Foreground(lipgloss.Color("#d94f90"))

// ANSI 256 fallback
style := lipgloss.NewStyle().Foreground(lipgloss.Color("168"))
```

**Lip Gloss automatically degrades** to 256-color or 16-color based on terminal support.

---

## Dark Mode (Default) vs Light Mode

**Celeste is dark mode only** - no light mode variant planned.

**Reasoning**:
- Glassmorphism requires dark backgrounds for proper blur effect
- Brand identity is "void/abyss" themed (darkness is core)
- Terminal interfaces are traditionally dark
- Neon colors require dark backgrounds for proper visibility

**If light mode is needed in future**:
- Invert background values (light purple instead of dark)
- Reduce accent saturation (avoid neon on light)
- Maintain WCAG contrast ratios
- Test glassmorphism carefully (may need opacity adjustments)

---

## Color Palette Export Formats

### CSS Custom Properties

```css
:root {
  /* Accent Colors */
  --color-accent-primary: #d94f90;
  --color-accent-light: #e86ca8;
  --color-accent-dark: #b61b70;

  /* Corruption palette — theme colours carry state */
  --corrupted-white: #ffffff;
  --corrupted-magenta: #ff00ff;
  --corrupted-purple: #8b5cf6;
  --corrupted-magenta2: #d94f90;
  --corrupted-black: #000000;
  --corrupted-green: #00ff00;

  /* Accents — compositional only, never a state signal */
  --corrupted-cyan: #00ffff;
  --corrupted-red: #ff0000;

  /* Backgrounds — one ramp, four steps plus a checker */
  --bg: #0a0a0a;
  --bg-secondary: #0f0f1a;
  --surface: #12121a;
  --surface-elevated: #1a1a24;
  --checker: #17171f;

  /* Glass Surfaces */
  --glass: rgba(20, 12, 40, 0.7);
  --glass-light: rgba(28, 18, 48, 0.5);
  --glass-darker: rgba(10, 5, 20, 0.6);

  /* Text */
  --text: #f5f1f8;
  --text-secondary: #b8afc8;

  /* Semantic States — from the palette, not a parallel status set */
  --success: #00ff00;
  --warning: #d94f90;
  --error: #ff0000;
  --info: #8b5cf6;
}
```

### Go Constants

```go
package config

const (
    // Accent Colors
    ColorAccentPrimary = "#d94f90"
    ColorAccentLight   = "#e86ca8"
    ColorAccentDark    = "#b61b70"

    // Theme colours — these carry corruption state
    ColorWhite    = "#ffffff"
    ColorMagenta  = "#ff00ff"
    ColorPurple   = "#8b5cf6"
    ColorMagenta2 = "#d94f90"
    ColorBlack    = "#000000"
    ColorGreen    = "#00ff00"

    // Accents — compositional only, never a state signal
    ColorCyan = "#00ffff"
    ColorRed  = "#ff0000"

    // Semantic states, drawn from the palette above
    ColorSuccess = "#00ff00"
    ColorWarning = "#d94f90"
    ColorError   = "#ff0000"
    ColorInfo    = "#8b5cf6"

    // Backgrounds — the surface ramp
    ColorBg           = "#0a0a0a"
    ColorBgSecondary  = "#0f0f1a"
    ColorSurface      = "#12121a"
    ColorSurfaceRaised = "#1a1a24"
)
```

### JSON (Design Tokens)

See `DESIGN_TOKENS.md` for complete W3C DTCG format.

---

## Related Documents

- **BRAND_OVERVIEW.md** - High-level brand identity
- **DESIGN_TOKENS.md** - Programmatic token system
- **TYPOGRAPHY.md** - Font system with Japanese support
- **GLASSMORPHISM.md** - Glass effect specifications
- **ACCESSIBILITY.md** - Complete WCAG compliance guide

---

**Status**: ✅ **COLOR SYSTEM COMPLETE** - All colors specified with WCAG compliance (0.2.0: canonical JSON source at src/data/colors.json)
