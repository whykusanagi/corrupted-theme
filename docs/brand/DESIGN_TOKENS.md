# Celeste Brand System - Design Tokens

**Version**: 1.0.0
**Last Updated**: 2025-12-13
**Token Format**: W3C Design Tokens Community Group (DTCG)
**Status**: 🔴 **CRITICAL FOUNDATION DOCUMENT**

---

## What Are Design Tokens?

Design tokens are **platform-agnostic design decisions** stored in a structured format (JSON) that can be transformed into platform-specific code (CSS, Go constants, Swift, Kotlin, etc.).

**Benefits**:
- ✅ **Single source of truth** for all design values
- ✅ **Cross-platform consistency** (CLI, web, mobile)
- ✅ **Programmatic updates** (change JSON → regenerate all platforms)
- ✅ **Version control** (track design changes in Git)
- ✅ **Tooling support** (Figma, Style Dictionary, Theo)

**Celeste's Implementation**:
- **Master file**: `design-tokens.json` (W3C DTCG format)
- **Generated files**:
  - `tokens.css` (CSS custom properties for web)
  - `tokens.go` (Go constants for CLI)
  - `tokens.ts` (TypeScript types for npm package)

---

## Token Format: W3C DTCG Standard

Celeste uses the **W3C Design Tokens Community Group** format for future-proof compatibility.

**Format structure**:
```json
{
  "$schema": "https://tr.designtokens.org/format/",
  "tokenGroup": {
    "tokenName": {
      "$value": "actual-value",
      "$type": "token-type",
      "$description": "Human-readable explanation"
    }
  }
}
```

**Why W3C DTCG?**
- Industry standard (adopted by Adobe, Figma, Microsoft)
- Future-proof (official specification in progress)
- Tool support (Design Tokens Studio, Theo, Style Dictionary)
- Human-readable JSON (easy to review in PRs)

---

## Token Naming Conventions

### Semantic vs Component Tokens

**Semantic tokens** (intent-based):
```
color.accent.primary
color.surface.glass
typography.size.heading-1
spacing.scale.medium
```

**Component tokens** (usage-based):
```
button.background.primary
card.border.default
input.text.placeholder
header.padding.vertical
```

### Naming Pattern

```
{category}.{subcategory}.{variant}.{state}
```

**Examples**:
```
color.accent.primary.default    // Base accent color
color.accent.primary.hover      // Hover state
color.accent.primary.active     // Active state
color.accent.primary.disabled   // Disabled state

spacing.scale.xs                // Extra small (4px)
spacing.scale.md                // Medium (16px)
spacing.scale.xl                // Extra large (32px)

animation.timing.fast           // 150ms
animation.timing.normal         // 300ms
animation.easing.default        // ease-in-out
```

---

## Color Tokens

### Accent Colors (Celeste Pink)

```json
{
  "color": {
    "accent": {
      "primary": {
        "$value": "#d94f90",
        "$type": "color",
        "$description": "Celeste Pink - primary brand accent"
      },
      "light": {
        "$value": "#e86ca8",
        "$type": "color",
        "$description": "Hover state for pink accent"
      },
      "dark": {
        "$value": "#b61b70",
        "$type": "color",
        "$description": "Active state for pink accent"
      }
    }
  }
}
```

**Generated CSS**:
```css
:root {
  --color-accent-primary: #d94f90;
  --color-accent-light: #e86ca8;
  --color-accent-dark: #b61b70;
}
```

**Generated Go**:
```go
const (
    ColorAccentPrimary = "#d94f90"
    ColorAccentLight   = "#e86ca8"
    ColorAccentDark    = "#b61b70"
)
```

### Secondary Colors

```json
{
  "color": {
    "secondary": {
      "purple": {
        "$value": "#8b5cf6",
        "$type": "color",
        "$description": "Purple Neon - secondary accent"
      },
      "cyan": {
        "$value": "#00d4ff",
        "$type": "color",
        "$description": "Cyan Glow - tertiary accent"
      },
      "red": {
        "$value": "#ff4757",
        "$type": "color",
        "$description": "Error/danger state"
      },
      "green": {
        "$value": "#2ed573",
        "$type": "color",
        "$description": "Success state"
      },
      "yellow": {
        "$value": "#ffa502",
        "$type": "color",
        "$description": "Warning state"
      }
    }
  }
}
```

### Glass Surface Colors

```json
{
  "color": {
    "surface": {
      "glass": {
        "default": {
          "$value": "rgba(20, 12, 40, 0.7)",
          "$type": "color",
          "$description": "Default glassmorphism background"
        },
        "light": {
          "$value": "rgba(28, 18, 48, 0.5)",
          "$type": "color",
          "$description": "Lighter glass for hover/nested elements"
        },
        "darker": {
          "$value": "rgba(12, 8, 28, 0.8)",
          "$type": "color",
          "$description": "Darker glass for elevated elements"
        }
      }
    }
  }
}
```

### Background Colors

```json
{
  "color": {
    "background": {
      "primary": {
        "$value": "#0a0612",
        "$type": "color",
        "$description": "Page background (deep purple-black)"
      },
      "secondary": {
        "$value": "#140c28",
        "$type": "color",
        "$description": "Card/section background"
      }
    }
  }
}
```

### Text Colors

```json
{
  "color": {
    "text": {
      "primary": {
        "$value": "#ffffff",
        "$type": "color",
        "$description": "Primary text (high contrast)"
      },
      "secondary": {
        "$value": "rgba(255, 255, 255, 0.7)",
        "$type": "color",
        "$description": "Secondary text (medium contrast)"
      },
      "tertiary": {
        "$value": "rgba(255, 255, 255, 0.5)",
        "$type": "color",
        "$description": "Tertiary text (low contrast, placeholders)"
      },
      "disabled": {
        "$value": "rgba(255, 255, 255, 0.3)",
        "$type": "color",
        "$description": "Disabled text"
      }
    }
  }
}
```

### Corruption Colors (for corrupted text)

```json
{
  "color": {
    "corruption": {
      "magenta": {
        "$value": "#d94f90",
        "$type": "color",
        "$description": "Japanese glitches (ニャー, かわいい)"
      },
      "purple": {
        "$value": "#c084fc",
        "$type": "color",
        "$description": "Full Japanese phrases (壊れちゃう...)"
      },
      "cyan": {
        "$value": "#00d4ff",
        "$type": "color",
        "$description": "Romaji phrases (nyaa~, ara ara~)"
      },
      "red": {
        "$value": "#ff4757",
        "$type": "color",
        "$description": "English lewd phrases, block chars"
      }
    }
  }
}
```

---

## Typography Tokens

### Font Families

```json
{
  "typography": {
    "font-family": {
      "base": {
        "$value": "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
        "$type": "fontFamily",
        "$description": "System font stack for Latin text"
      },
      "japanese": {
        "$value": "'Hiragino Sans', 'Yu Gothic', 'Meiryo', 'MS PGothic', sans-serif",
        "$type": "fontFamily",
        "$description": "Japanese character support"
      },
      "monospace": {
        "$value": "'SF Mono', 'Monaco', 'Consolas', 'Liberation Mono', monospace",
        "$type": "fontFamily",
        "$description": "Terminal/code font (CLI default)"
      }
    }
  }
}
```

### Font Sizes (Responsive Scale)

```json
{
  "typography": {
    "font-size": {
      "xs": {
        "$value": "0.75rem",
        "$type": "dimension",
        "$description": "12px - Labels, captions"
      },
      "sm": {
        "$value": "0.875rem",
        "$type": "dimension",
        "$description": "14px - Small text"
      },
      "base": {
        "$value": "1rem",
        "$type": "dimension",
        "$description": "16px - Body text (default)"
      },
      "lg": {
        "$value": "1.125rem",
        "$type": "dimension",
        "$description": "18px - Large body text"
      },
      "xl": {
        "$value": "1.25rem",
        "$type": "dimension",
        "$description": "20px - H6"
      },
      "2xl": {
        "$value": "1.5rem",
        "$type": "dimension",
        "$description": "24px - H5"
      },
      "3xl": {
        "$value": "1.875rem",
        "$type": "dimension",
        "$description": "30px - H4"
      },
      "4xl": {
        "$value": "2.25rem",
        "$type": "dimension",
        "$description": "36px - H3"
      },
      "5xl": {
        "$value": "3rem",
        "$type": "dimension",
        "$description": "48px - H2"
      },
      "6xl": {
        "$value": "3.75rem",
        "$type": "dimension",
        "$description": "60px - H1"
      }
    }
  }
}
```

### Font Weights

```json
{
  "typography": {
    "font-weight": {
      "normal": {
        "$value": "400",
        "$type": "fontWeight",
        "$description": "Regular text"
      },
      "medium": {
        "$value": "500",
        "$type": "fontWeight",
        "$description": "Slightly emphasized"
      },
      "semibold": {
        "$value": "600",
        "$type": "fontWeight",
        "$description": "Headers, labels"
      },
      "bold": {
        "$value": "700",
        "$type": "fontWeight",
        "$description": "Strong emphasis"
      },
      "black": {
        "$value": "900",
        "$type": "fontWeight",
        "$description": "Extra bold (dashboard headers)"
      }
    }
  }
}
```

### Line Heights

```json
{
  "typography": {
    "line-height": {
      "tight": {
        "$value": "1.2",
        "$type": "number",
        "$description": "Headers, tight spacing"
      },
      "normal": {
        "$value": "1.5",
        "$type": "number",
        "$description": "Body text (default)"
      },
      "relaxed": {
        "$value": "1.8",
        "$type": "number",
        "$description": "Long-form content"
      }
    }
  }
}
```

---

## Spacing Tokens (8pt Scale)

```json
{
  "spacing": {
    "scale": {
      "0": {
        "$value": "0",
        "$type": "dimension",
        "$description": "No spacing"
      },
      "xs": {
        "$value": "4px",
        "$type": "dimension",
        "$description": "Extra small (0.25rem)"
      },
      "sm": {
        "$value": "8px",
        "$type": "dimension",
        "$description": "Small (0.5rem)"
      },
      "md": {
        "$value": "16px",
        "$type": "dimension",
        "$description": "Medium (1rem) - base unit"
      },
      "lg": {
        "$value": "24px",
        "$type": "dimension",
        "$description": "Large (1.5rem)"
      },
      "xl": {
        "$value": "32px",
        "$type": "dimension",
        "$description": "Extra large (2rem)"
      },
      "2xl": {
        "$value": "48px",
        "$type": "dimension",
        "$description": "2X large (3rem)"
      },
      "3xl": {
        "$value": "64px",
        "$type": "dimension",
        "$description": "3X large (4rem)"
      }
    }
  }
}
```

---

## Animation Tokens

### Timing (Duration)

```json
{
  "animation": {
    "timing": {
      "instant": {
        "$value": "0s",
        "$type": "duration",
        "$description": "No transition"
      },
      "fast": {
        "$value": "0.15s",
        "$type": "duration",
        "$description": "Micro-interactions (hover, focus)"
      },
      "normal": {
        "$value": "0.3s",
        "$type": "duration",
        "$description": "Standard transitions (default)"
      },
      "slow": {
        "$value": "0.5s",
        "$type": "duration",
        "$description": "Page transitions, large animations"
      },
      "slower": {
        "$value": "1s",
        "$type": "duration",
        "$description": "Loading states, progress"
      }
    }
  }
}
```

### Easing (Timing Functions)

```json
{
  "animation": {
    "easing": {
      "default": {
        "$value": "ease-in-out",
        "$type": "cubicBezier",
        "$description": "Default easing (smooth start and end)"
      },
      "in": {
        "$value": "ease-in",
        "$type": "cubicBezier",
        "$description": "Acceleration (slow start)"
      },
      "out": {
        "$value": "ease-out",
        "$type": "cubicBezier",
        "$description": "Deceleration (slow end)"
      },
      "linear": {
        "$value": "linear",
        "$type": "cubicBezier",
        "$description": "No easing (constant speed)"
      },
      "bounce": {
        "$value": "cubic-bezier(0.34, 1.56, 0.64, 1)",
        "$type": "cubicBezier",
        "$description": "Bouncy effect (overshoots then settles)"
      }
    }
  }
}
```

---

## Shadow Tokens

### Glass Shadows (Pink-Tinted)

```json
{
  "shadow": {
    "glass": {
      "sm": {
        "$value": "0 2px 8px rgba(217, 79, 144, 0.15)",
        "$type": "shadow",
        "$description": "Small shadow (subtle glow)"
      },
      "md": {
        "$value": "0 4px 16px rgba(217, 79, 144, 0.25)",
        "$type": "shadow",
        "$description": "Medium shadow (default)"
      },
      "lg": {
        "$value": "0 8px 32px rgba(217, 79, 144, 0.35)",
        "$type": "shadow",
        "$description": "Large shadow (elevated elements)"
      },
      "xl": {
        "$value": "0 16px 64px rgba(217, 79, 144, 0.45)",
        "$type": "shadow",
        "$description": "Extra large shadow (modals)"
      }
    }
  }
}
```

---

## Border Tokens

```json
{
  "border": {
    "width": {
      "thin": {
        "$value": "1px",
        "$type": "dimension",
        "$description": "Thin border (default)"
      },
      "medium": {
        "$value": "2px",
        "$type": "dimension",
        "$description": "Medium border (emphasis)"
      },
      "thick": {
        "$value": "4px",
        "$type": "dimension",
        "$description": "Thick border (strong emphasis)"
      }
    },
    "radius": {
      "none": {
        "$value": "0",
        "$type": "dimension",
        "$description": "No rounding"
      },
      "sm": {
        "$value": "4px",
        "$type": "dimension",
        "$description": "Small radius (buttons)"
      },
      "md": {
        "$value": "8px",
        "$type": "dimension",
        "$description": "Medium radius (cards, default)"
      },
      "lg": {
        "$value": "16px",
        "$type": "dimension",
        "$description": "Large radius (modals)"
      },
      "full": {
        "$value": "9999px",
        "$type": "dimension",
        "$description": "Fully rounded (pills, avatars)"
      }
    }
  }
}
```

---

## Opacity Tokens

```json
{
  "opacity": {
    "transparent": {
      "$value": "0",
      "$type": "number",
      "$description": "Fully transparent"
    },
    "low": {
      "$value": "0.3",
      "$type": "number",
      "$description": "Disabled elements"
    },
    "medium": {
      "$value": "0.5",
      "$type": "number",
      "$description": "Glass-light surfaces"
    },
    "high": {
      "$value": "0.7",
      "$type": "number",
      "$description": "Glass surfaces (default)"
    },
    "higher": {
      "$value": "0.8",
      "$type": "number",
      "$description": "Glass-darker surfaces"
    },
    "opaque": {
      "$value": "1",
      "$type": "number",
      "$description": "Fully opaque"
    }
  }
}
```

---

## Blur Tokens (Glassmorphism)

```json
{
  "blur": {
    "none": {
      "$value": "0",
      "$type": "dimension",
      "$description": "No blur"
    },
    "sm": {
      "$value": "2px",
      "$type": "dimension",
      "$description": "Subtle blur"
    },
    "md": {
      "$value": "5px",
      "$type": "dimension",
      "$description": "Medium blur (default glass)"
    },
    "lg": {
      "$value": "10px",
      "$type": "dimension",
      "$description": "Large blur"
    },
    "xl": {
      "$value": "15px",
      "$type": "dimension",
      "$description": "Extra large blur (elevated glass)"
    }
  }
}
```

---

## Z-Index Tokens

```json
{
  "z-index": {
    "base": {
      "$value": "0",
      "$type": "number",
      "$description": "Base layer"
    },
    "dropdown": {
      "$value": "1000",
      "$type": "number",
      "$description": "Dropdowns, tooltips"
    },
    "sticky": {
      "$value": "1100",
      "$type": "number",
      "$description": "Sticky headers"
    },
    "modal": {
      "$value": "1300",
      "$type": "number",
      "$description": "Modals, dialogs"
    },
    "toast": {
      "$value": "1500",
      "$type": "number",
      "$description": "Notifications, toasts"
    }
  }
}
```

---

## Platform-Specific Output

### CSS Custom Properties

**Generated from JSON**: `tokens.css`

```css
:root {
  /* Colors */
  --color-accent-primary: #d94f90;
  --color-accent-light: #e86ca8;
  --color-accent-dark: #b61b70;

  /* Typography */
  --font-family-base: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  --font-size-base: 1rem;
  --font-weight-bold: 700;
  --line-height-normal: 1.5;

  /* Spacing */
  --space-xs: 4px;
  --space-sm: 8px;
  --space-md: 16px;
  --space-lg: 24px;
  --space-xl: 32px;

  /* Animation */
  --timing-fast: 0.15s;
  --timing-normal: 0.3s;
  --easing-default: ease-in-out;

  /* Shadows */
  --shadow-glass-md: 0 4px 16px rgba(217, 79, 144, 0.25);

  /* Blur */
  --blur-md: 5px;
}
```

**Usage in CSS**:
```css
.glass-card {
  background: var(--color-surface-glass-default);
  border: 1px solid var(--color-accent-primary);
  border-radius: var(--border-radius-md);
  box-shadow: var(--shadow-glass-md);
  backdrop-filter: blur(var(--blur-md));
  padding: var(--space-lg);
  transition: all var(--timing-normal) var(--easing-default);
}

.glass-card:hover {
  border-color: var(--color-accent-light);
}
```

### Go Constants

**Generated from JSON**: `cmd/celeste/config/tokens.go`

```go
package config

const (
    // Colors
    ColorAccentPrimary = "#d94f90"
    ColorAccentLight   = "#e86ca8"
    ColorAccentDark    = "#b61b70"

    ColorSecondaryPurple = "#8b5cf6"
    ColorSecondaryCyan   = "#00d4ff"

    // Spacing (for terminal, use character counts)
    SpacingXS = 1 // 1 space
    SpacingSM = 2 // 2 spaces
    SpacingMD = 4 // 4 spaces
    SpacingLG = 6 // 6 spaces

    // Animation timing (milliseconds)
    TimingFast   = 150
    TimingNormal = 300
    TimingSlow   = 500
)
```

**Usage in Go**:
```go
import (
    "github.com/charmbracelet/lipgloss"
    "github.com/whykusanagi/celesteCLI/cmd/celeste/config"
)

style := lipgloss.NewStyle().
    Foreground(lipgloss.Color(config.ColorAccentPrimary)).
    Padding(0, config.SpacingMD)
```

### TypeScript Types

**Generated from JSON**: `src/tokens/tokens.ts`

```typescript
export const tokens = {
  color: {
    accent: {
      primary: '#d94f90',
      light: '#e86ca8',
      dark: '#b61b70',
    },
    secondary: {
      purple: '#8b5cf6',
      cyan: '#00d4ff',
    },
  },
  spacing: {
    xs: '4px',
    sm: '8px',
    md: '16px',
    lg: '24px',
    xl: '32px',
  },
  animation: {
    timing: {
      fast: '0.15s',
      normal: '0.3s',
      slow: '0.5s',
    },
    easing: {
      default: 'ease-in-out',
      bounce: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
    },
  },
} as const;

export type Tokens = typeof tokens;
```

---

## Token Management Workflow

### 1. Update Master JSON
Edit `design-tokens.json` (W3C DTCG format)

### 2. Generate Platform Files
Run token generation script:
```bash
# Using Style Dictionary
npm run tokens:build

# Or manually
node scripts/generate-tokens.js
```

### 3. Review Generated Files
- `tokens.css` (web)
- `tokens.go` (CLI)
- `tokens.ts` (npm package)

### 4. Commit to Git
```bash
git add design-tokens.json tokens.css tokens.go tokens.ts
git commit -m "chore: update design tokens"
```

### 5. Publish Updates
- npm package: Bump version, publish to npm
- CLI: Tag release, rebuild Go binary

---

## Version Management

**Semantic Versioning for Design Tokens**:

- **MAJOR** (1.0.0 → 2.0.0): Breaking changes
  - Color palette changes (hex values)
  - Token renames (--color-primary → --color-accent)
  - Removal of tokens
- **MINOR** (1.0.0 → 1.1.0): Additive changes
  - New tokens added
  - New token groups
- **PATCH** (1.0.0 → 1.0.1): Non-breaking fixes
  - Documentation updates
  - Small value adjustments (shadows, blur)

---

## Tooling Integration

### Figma (Design Tokens Studio Plugin)

1. Install **Design Tokens Studio** plugin
2. Import `design-tokens.json`
3. Sync tokens to Figma variables
4. Design using token names (--color-accent-primary)

### Style Dictionary (Build Tool)

```javascript
// style-dictionary.config.js
module.exports = {
  source: ['design-tokens.json'],
  platforms: {
    css: {
      transformGroup: 'css',
      buildPath: 'src/',
      files: [{ destination: 'tokens.css', format: 'css/variables' }]
    },
    js: {
      transformGroup: 'js',
      buildPath: 'src/',
      files: [{ destination: 'tokens.ts', format: 'javascript/es6' }]
    }
  }
};
```

---

## Related Documents

- **BRAND_OVERVIEW.md** - High-level brand identity
- **COLOR_SYSTEM.md** - Complete color specifications with WCAG
- **TYPOGRAPHY.md** - Font system details
- **SPACING_SYSTEM.md** - 8pt scale application guidelines

---

**Status**: ✅ **FOUNDATION COMPLETE** - Tokens defined, ready for generation
