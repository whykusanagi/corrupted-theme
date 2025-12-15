# Component Mapping Guide

> **Celeste Brand System** | Platform Documentation
> **Document**: Cross-Platform Component Mapping
> **Version**: 1.0.0
> **Last Updated**: 2025-12-13

---

## Table of Contents

1. [Overview](#overview)
2. [Complete Mapping Table](#complete-mapping-table)
3. [Container Components](#container-components)
4. [Interactive Components](#interactive-components)
5. [Data Display Components](#data-display-components)
6. [Feedback Components](#feedback-components)
7. [Implementation Comparison](#implementation-comparison)
8. [When to Diverge](#when-to-diverge)

---

## Overview

This document maps **web components** (from @whykusanagi/corrupted-theme) to their **CLI equivalents** (from celeste-cli), showing how the same visual language translates across platforms.

### Mapping Philosophy

- **Visual Consistency**: Same brand aesthetic across platforms
- **Platform-Appropriate**: Respect each platform's constraints
- **Functional Equivalence**: Same purpose, different implementation
- **Shared Attributes**: Same colors, spacing ratios, corruption intensity

### Legend

| Symbol | Meaning |
|--------|---------|
| ✅ | 1:1 equivalent (same visual + function) |
| 🔄 | Adapted (same purpose, different implementation) |
| 🌐 | Web-only (no CLI equivalent) |
| 💻 | CLI-only (no web equivalent) |
| ⚠️ | Partial match (limited similarity) |

---

## Complete Mapping Table

| npm Component | CLI Pattern | Match | Shared Attributes | Notes |
|---------------|-------------|-------|-------------------|-------|
| **Containers** |
| `.glass-card` | Dashboard section with borders | ✅ | Pink borders, glass bg, padding | Perfect 1:1 match |
| `.glass-panel` | Full-screen TUI view | ✅ | Background blur simulation | Uses block chars |
| `.container` | Terminal width container (80-120 chars) | ✅ | Max-width, centered | Responsive width |
| `.section` | Vertical section spacing | ✅ | 2-3 line gaps | Line-based spacing |
| `.box` | `lipgloss.Border()` box | ✅ | Rounded borders, padding | Unicode box chars |
| `.modal` | Alt-screen buffer | 🔄 | Full-screen overlay | Different UX pattern |
| `.sidebar` | N/A | 🌐 | N/A | Web-only (no CLI sidebar) |
| `.drawer` | N/A | 🌐 | N/A | Web-only (slide-out panels) |
| **Interactive** |
| `.btn` | Highlighted option with arrow | ✅ | Accent color, hover state | `[•] OPTION` pattern |
| `.btn-primary` | Primary action indicator | ✅ | Pink/bold text | Most prominent |
| `.btn-secondary` | Secondary option | ✅ | Muted color | Less prominent |
| `.input` | Text input field | ✅ | Border, padding | `textinput` component |
| `.textarea` | Multi-line input | ✅ | Scrollable content | `textarea` component |
| `.select` | Arrow-key selection list | ✅ | Highlighted option | `list` component |
| `.checkbox` | `[x]` / `[ ]` indicator | ✅ | Square brackets | Literal checkbox chars |
| `.radio` | `(•)` / `( )` indicator | ✅ | Round brackets | Literal radio chars |
| `.toggle` | `[ON/OFF]` text | 🔄 | Bold state indicator | Text-based toggle |
| `.slider` | Progress bar with handle | 🔄 | Block character bar | `████▓▒░░` pattern |
| `.dropdown` | Vertical list | ✅ | Arrow navigation | Same UX pattern |
| `.tooltip` | Status line message | 🔄 | Bottom-aligned text | No hover in terminal |
| **Data Display** |
| `.badge` | Emoji status indicator | ✅ | 🟢🟡🔴 color-coded | Same colors |
| `.pill` | `[TAG]` bracket notation | 🔄 | Brackets + color | Text-based |
| `.tag` | Same as `.pill` | 🔄 | Brackets + color | Identical to pill |
| `.progress-bar` | `████▓▒░░` block chars | ✅ | Fill/empty ratio | Perfect match |
| `.progress-circle` | Percentage text | 🔄 | `67%` display | No circles in terminal |
| `.table` | Box-drawing table | ✅ | Unicode borders | `├─┼─┤` pattern |
| `.stat-card` | Dashboard stat block | ✅ | Label + large number | Identical layout |
| `.list` | Bullet list | ✅ | `•` or `[•]` markers | Same bullets |
| `.icon` | Emoji or Unicode symbol | ✅ | Same emoji set | Limited icon set |
| `.avatar` | Initials or emoji | 🔄 | First letter or emoji | No images |
| `.image` | N/A | 🌐 | N/A | No images in terminal |
| `.code-block` | Syntax-highlighted text | ✅ | Same colors | ANSI color codes |
| `.kbd` | `<key>` notation | ✅ | Same format | `<Ctrl+C>` |
| `.divider` | `───────────` horizontal line | ✅ | Full-width line | Unicode chars |
| `.spinner` | `⠋⠙⠹⠸⠼⠴⠦⠧⠇⠏` animation | ✅ | 150ms frame rate | Same timing |
| **Navigation** |
| `.navbar` | N/A | 🌐 | N/A | Web-only (persistent header) |
| `.breadcrumb` | Status line path | 🔄 | `/path/to/current` | Bottom status |
| `.tabs` | Mode indicator | 🔄 | `[CHAT] [STATS]` | Text-based tabs |
| `.pagination` | Page numbers | ✅ | `Page 2 of 10` | Same format |
| `.stepper` | Progress steps | 🔄 | `1 → 2 → 3` | Arrow notation |
| `.menu` | Vertical option list | ✅ | Arrow navigation | Same pattern |
| **Feedback** |
| `.alert` | Banner message | ✅ | Colored border + icon | Same layout |
| `.toast` | Temporary message | 🔄 | Bottom status line | Different position |
| `.notification` | Badge count | ✅ | `[3]` number indicator | Same format |
| `.loading` | Spinner + text | ✅ | Same spinner | Identical animation |
| `.skeleton` | `░░░░░` placeholder | 🔄 | Light block chars | Text-based |
| **Extensions** |
| `.accordion` | Collapsible section | 🔄 | `▼ Expanded` / `▶ Collapsed` | Arrow indicators |
| `.carousel` | N/A | 🌐 | N/A | Web-only (image slider) |
| `.lightbox` | N/A | 🌐 | N/A | Web-only (image viewer) |
| `.popover` | Inline message | 🔄 | Indented text | No floating UI |
| `.calendar` | N/A | 🌐 | N/A | Web-only (date picker) |
| `.chart` | ASCII bar chart | 🔄 | `▇▇▅▃` bars | Text-based visualization |
| `.timeline` | Vertical list with markers | 🔄 | `│─┬─┴` connectors | Unicode chars |
| `.rating` | Star count text | 🔄 | `★★★★☆ 4/5` | Star chars |
| `.video` | N/A | 🌐 | N/A | Web-only (video player) |
| `.audio` | N/A | 🌐 | N/A | Web-only (audio player) |

**Summary**:
- ✅ **30 components** with 1:1 equivalents (53%)
- 🔄 **18 components** adapted for platform (32%)
- 🌐 **8 components** web-only (14%)
- 💻 **0 components** CLI-only (CLI uses web equivalents)

---

## Container Components

### Glass Card

**Purpose**: Primary content container with glassmorphism effect

#### Web (`.glass-card`)
```html
<div class="glass-card">
  <h2>US使AGE STAT統ISTICS</h2>
  <p>Content here</p>
</div>
```

```css
.glass-card {
  background: rgba(20, 12, 40, 0.7);
  backdrop-filter: blur(15px);
  border: 1px solid rgba(217, 79, 144, 0.3);
  border-radius: 8px;
  padding: 2rem;
  box-shadow: 0 4px 16px rgba(217, 79, 144, 0.25);
}
```

#### CLI (Dashboard Section)
```go
// Equivalent using Lip Gloss
style := lipgloss.NewStyle().
    Border(lipgloss.RoundedBorder()).
    BorderForeground(lipgloss.Color("#d94f90")).
    Padding(1, 2).
    Render("US使AGE STAT統ISTICS\n\nContent here")

// Output:
// ╭────────────────────────╮
// │  US使AGE STAT統ISTICS   │
// │                        │
// │  Content here          │
// ╰────────────────────────╯
```

**Shared Attributes**:
- Pink border (`#d94f90`)
- Internal padding (2rem / 2 chars)
- Rounded corners (border-radius / unicode rounded borders)

---

## Interactive Components

### Button

**Purpose**: Primary action trigger

#### Web (`.btn`)
```html
<button class="btn btn-primary">
  Confirm
</button>
```

```css
.btn-primary {
  background: rgba(217, 79, 144, 0.2);
  border: 1px solid rgba(217, 79, 144, 0.3);
  color: #ffffff;
  padding: 0.75rem 1.5rem;
  transition: transform 0.15s ease;
}

.btn-primary:hover {
  background: rgba(217, 79, 144, 0.3);
  transform: scale(1.05);
}
```

#### CLI (Selection Indicator)
```go
// Highlighted option with arrow
func RenderOption(label string, selected bool) string {
    if selected {
        return lipgloss.NewStyle().
            Foreground(lipgloss.Color("#d94f90")).
            Bold(true).
            Render("[•] " + label)  // Pink + bullet
    }
    return lipgloss.NewStyle().
        Foreground(lipgloss.Color("#606060")).
        Render("[ ] " + label)  // Gray + empty bracket
}

// Output:
// [•] Confirm    ← Selected (pink, bold)
// [ ] Cancel     ← Not selected (gray)
```

**Shared Attributes**:
- Accent color for selected state (`#d94f90`)
- Bold text for emphasis
- Visual indicator (border / bracket)

---

## Data Display Components

### Progress Bar

**Purpose**: Show completion percentage

#### Web (`.progress-bar`)
```html
<div class="progress-bar" data-percent="67">
  <div class="progress-fill" style="width: 67%"></div>
</div>
<span class="progress-label">67%</span>
```

```css
.progress-bar {
  width: 100%;
  height: 8px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 4px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #d94f90, #8b5cf6);
  transition: width 0.3s ease;
}
```

#### CLI (Block Characters)
```go
// Block character progress bar
func RenderProgress(percent float64, width int) string {
    filled := int(percent * float64(width))
    bar := strings.Repeat("█", filled)       // Full blocks
    bar += strings.Repeat("░", width-filled) // Empty blocks

    return lipgloss.NewStyle().
        Foreground(lipgloss.Color("#d94f90")).
        Render(fmt.Sprintf("[%s] %.0f%%", bar, percent*100))
}

// Output: [████████░░░░] 67%
```

**Shared Attributes**:
- Fill/empty visual ratio
- Accent color gradient (`#d94f90` → `#8b5cf6`)
- Percentage label
- 300ms update timing

---

## Feedback Components

### Alert

**Purpose**: Show important messages with severity levels

#### Web (`.alert`)
```html
<div class="alert alert-success">
  ✓ Successfully saved data
</div>
```

```css
.alert {
  background: rgba(20, 12, 40, 0.9);
  border-left: 4px solid;
  padding: 1rem;
  border-radius: 4px;
}

.alert-success {
  border-color: #10b981;  /* Green */
}

.alert-error {
  border-color: #ef4444;  /* Red */
}
```

#### CLI (Banner Message)
```go
// Alert banner with colored border
func RenderAlert(message string, severity string) string {
    var color lipgloss.Color

    switch severity {
    case "success":
        color = lipgloss.Color("#10b981")  // Green
    case "error":
        color = lipgloss.Color("#ef4444")  // Red
    case "warning":
        color = lipgloss.Color("#f59e0b")  // Orange
    default:
        color = lipgloss.Color("#3b82f6")  // Blue
    }

    return lipgloss.NewStyle().
        BorderStyle(lipgloss.RoundedBorder()).
        BorderForeground(color).
        BorderLeft(true).
        Padding(0, 2).
        Render(message)
}

// Output:
// │ ✓ Successfully saved data
```

**Shared Attributes**:
- Colored left border indicating severity
- Same color palette (green/red/orange/blue)
- Padding around message
- Icon prefix (✓ ✗ ⚠ ℹ)

---

## Implementation Comparison

### Side-by-Side: Stat Card

#### Web Implementation
```html
<div class="glass-card stat-card">
  <div class="stat-icon">📊</div>
  <h3>US使AGE</h3>
  <p class="stat-value">1,234</p>
  <p class="stat-change">+12.5%</p>
</div>
```

```css
.stat-card {
  text-align: center;
  padding: 2rem;
}

.stat-icon {
  font-size: 3rem;
  margin-bottom: 1rem;
}

.stat-value {
  font-size: 2.5rem;
  font-weight: 700;
  color: #d94f90;
}

.stat-change {
  color: #10b981;  /* Green for positive */
  font-size: 0.875rem;
}
```

#### CLI Implementation
```go
func RenderStatCard(label string, value int, change float64) string {
    icon := "📊"
    corruptedLabel := CorruptTextJapanese(label, 0.3)

    valueStr := lipgloss.NewStyle().
        Foreground(lipgloss.Color("#d94f90")).
        Bold(true).
        Render(fmt.Sprintf("%d", value))

    changeColor := lipgloss.Color("#10b981")  // Green
    if change < 0 {
        changeColor = lipgloss.Color("#ef4444")  // Red
    }

    changeStr := lipgloss.NewStyle().
        Foreground(changeColor).
        Render(fmt.Sprintf("%+.1f%%", change))

    content := fmt.Sprintf(
        "%s\n\n%s\n%s\n%s",
        icon,
        corruptedLabel,
        valueStr,
        changeStr,
    )

    return lipgloss.NewStyle().
        Border(lipgloss.RoundedBorder()).
        BorderForeground(lipgloss.Color("#d94f90")).
        Padding(1, 2).
        Align(lipgloss.Center).
        Width(24).
        Render(content)
}

// Output:
// ╭──────────────────────╮
// │         📊           │
// │                      │
// │       US使AGE        │
// │       1,234          │
// │      +12.5%          │
// ╰──────────────────────╯
```

**Analysis**:
- ✅ **Identical layout**: Icon, label, value, change
- ✅ **Same colors**: Pink value, green/red change
- ✅ **Same corruption**: 30% intensity on label
- ✅ **Same spacing**: Center-aligned, padded
- 🔄 **Different size units**: rem (web) vs char count (CLI)

---

## When to Diverge

### Platform-Specific Constraints

#### Web: Hover States
```css
/* Web supports hover (mouse input) */
.btn:hover {
  transform: scale(1.05);
  box-shadow: 0 0 20px rgba(217, 79, 144, 0.4);
}
```

```go
// CLI: No hover, use selection indicator instead
func RenderButton(label string, selected bool) string {
    if selected {
        return "[•] " + label  // Selection indicator
    }
    return "[ ] " + label
}
```

#### CLI: Keyboard-Only Navigation
```go
// CLI uses keyboard shortcuts (no mouse)
const (
    KeyUp    = "↑"
    KeyDown  = "↓"
    KeyEnter = "⏎"
    KeyQuit  = "q"
)

// Web uses full event system
document.addEventListener('click', handler);
document.addEventListener('keydown', handler);
```

### Performance Constraints

#### Web: Animation-Heavy
```css
/* Web can handle complex animations */
@keyframes glitch {
  0%, 100% { transform: translate(0); }
  20% { transform: translate(-2px, 2px); }
  40% { transform: translate(2px, -2px); }
}

.glitch {
  animation: glitch 0.3s cubic-bezier(0.68, -0.55, 0.27, 1.55);
}
```

```go
// CLI: Limited to frame-based animations
func (m Model) Update(msg tea.Msg) (tea.Model, tea.Cmd) {
    case tickMsg:
        m.frame++
        // Update every 150ms (terminal refresh constraint)
        return m, tick(150 * time.Millisecond)
}
```

### Visual Capabilities

#### Web: Backdrop-Filter
```css
/* Web: True glassmorphism with backdrop-filter */
.glass-card {
  background: rgba(20, 12, 40, 0.7);
  backdrop-filter: blur(15px);
}
```

```go
// CLI: Simulate with block characters
func RenderGlass() string {
    // Use block chars to simulate blur
    return strings.Repeat("░", width)  // Light block pattern
}
```

---

## Decision Tree: When to Use Each Component

```
Need a container?
├─ Web: Use .glass-card (true glassmorphism)
└─ CLI: Use lipgloss.Border() with rounded corners

Need a button?
├─ Web: Use .btn with hover states
└─ CLI: Use [•] selection indicator

Need a progress bar?
├─ Web: Use .progress-bar with smooth animation
└─ CLI: Use ████▓▒░░ block characters (same visual)

Need an alert?
├─ Web: Use .alert with colored border
└─ CLI: Use banner with colored border (identical)

Need navigation?
├─ Web: Use .navbar (persistent header)
└─ CLI: Use status line (bottom, non-persistent)
```

---

## Component Equivalence Matrix

| Feature | Web Support | CLI Support | Implementation Difference |
|---------|-------------|-------------|---------------------------|
| **Glassmorphism** | ✅ Native (backdrop-filter) | 🔄 Simulated (block chars) | Visual approximation |
| **Hover States** | ✅ Native (CSS :hover) | ❌ Not available | Use selection instead |
| **Smooth Animations** | ✅ 60fps CSS animations | ✅ 60fps frame-based | Same timing, different method |
| **Color Gradients** | ✅ Native (linear-gradient) | 🔄 Simulated (color steps) | Close approximation |
| **Images** | ✅ Full support | ❌ Not available | Use emoji/icons instead |
| **Mouse Input** | ✅ Full support | ⚠️ Limited (if enabled) | Keyboard-first design |
| **Keyboard Nav** | ✅ Supported | ✅ Primary input | Identical UX |
| **Screen Readers** | ✅ ARIA support | ⚠️ Limited | Text-based is accessible |
| **Responsive Design** | ✅ Media queries | ✅ Terminal size detection | Same breakpoint logic |
| **Typography** | ✅ Full control | ⚠️ Monospace only | Fixed-width constraint |

---

## Related Documentation

- [COMPONENT_LIBRARY.md](../components/COMPONENT_LIBRARY.md) - Complete component inventory
- [WEB_IMPLEMENTATION.md](./WEB_IMPLEMENTATION.md) - Web-specific implementation
- [CLI_IMPLEMENTATION.md](./CLI_IMPLEMENTATION.md) - CLI-specific implementation
- [NPM_PACKAGE.md](./NPM_PACKAGE.md) - Package usage guide

---

**Last Updated**: 2025-12-13
**Version**: 1.0.0
**Maintainer**: Celeste Brand System
**Status**: ✅ Complete Cross-Platform Reference
