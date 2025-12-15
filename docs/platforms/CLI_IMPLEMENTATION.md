# CLI Implementation Guide

> **Celeste Brand System** | Platform Documentation
> **Document**: CLI (Terminal) Implementation Guide
> **Version**: 1.0.0
> **Last Updated**: 2025-12-13

---

## Table of Contents

1. [Overview](#overview)
2. [Terminal Constraints](#terminal-constraints)
3. [Tech Stack](#tech-stack)
4. [Color System](#color-system)
5. [Typography & Characters](#typography--characters)
6. [TUI Patterns](#tui-patterns)
7. [Animation Techniques](#animation-techniques)
8. [Corruption Implementation](#corruption-implementation)
9. [Layout Strategies](#layout-strategies)
10. [Performance Optimization](#performance-optimization)
11. [Testing](#testing)

---

## Overview

The Celeste CLI brings the **translation-failure corruption aesthetic** to terminal interfaces using the Bubble Tea TUI framework. Unlike web implementations, CLI must work within strict terminal constraints while maintaining the same premium glassmorphism feel.

### CLI Philosophy

- **Terminal-Native**: Embrace terminal limitations, don't fight them
- **Performance First**: 60fps rendering even on remote connections
- **Keyboard-Driven**: All interactions via keyboard (no mouse required)
- **Readable Corruption**: 25-40% intensity maximum for terminal text
- **Cross-Platform**: Works on macOS, Linux, Windows (PowerShell/WSL)

### Quick Reference

```go
// Celeste CLI structure
celeste/
├── cmd/celeste/
│   ├── main.go              // Entry point
│   ├── commands/            // Command definitions
│   │   ├── commands.go      // Command registry
│   │   ├── stats.go         // /stats dashboard
│   │   └── ...
│   ├── tui/                 // Bubble Tea UI
│   │   ├── app.go           // Main TUI model
│   │   ├── chat.go          // Chat interface
│   │   └── ...
│   └── config/              // Session, settings
│       └── session.go       // Session management
└── docs/                    // This documentation
```

---

## Terminal Constraints

### Physical Limitations

| Constraint | Typical Value | Impact |
|------------|---------------|--------|
| **Width** | 80-120 chars | Content must fit within window |
| **Height** | 24-40 lines | Vertical scrolling needed for long content |
| **Refresh Rate** | 60Hz (16.67ms) | Maximum animation frame rate |
| **Color Depth** | 256 colors (8-bit) | Limited color palette |
| **Font** | Monospace only | Fixed-width character grid |
| **Resolution** | Character-level | No sub-pixel positioning |

### Terminal Compatibility

```go
// Detect terminal capabilities
import "github.com/muesli/termenv"

func DetectTerminal() {
    output := termenv.DefaultOutput()

    // Check color support
    profile := output.ColorProfile()
    // Returns: termenv.Ascii, termenv.ANSI, termenv.ANSI256, termenv.TrueColor

    // Check terminal features
    hasMouse := termenv.HasMouseSupport()
    hasAltScreen := termenv.HasAltScreen()
    hasDarkBackground := termenv.HasDarkBackground()
}
```

### Safe Width Guidelines

```go
// Recommended content widths
const (
    MinWidth     = 80   // Minimum supported terminal width
    SafeWidth    = 100  // Safe width for most terminals
    MaxWidth     = 120  // Maximum before line wrapping
    ContentWidth = 96   // Content area (padding for borders)
)

// Responsive layout
func GetContentWidth() int {
    width, _, _ := term.GetSize(int(os.Stdout.Fd()))

    switch {
    case width < MinWidth:
        return width - 4  // Minimal padding
    case width < SafeWidth:
        return width - 8  // Moderate padding
    default:
        return min(ContentWidth, width-12)  // Full padding
    }
}
```

---

## Tech Stack

### Core Dependencies

```go
// go.mod
module github.com/whykusanagi/celeste-cli

go 1.22

require (
    github.com/charmbracelet/bubbletea v1.3.10    // TUI framework
    github.com/charmbracelet/lipgloss v1.0.0      // Styling
    github.com/muesli/termenv v0.15.2             // Terminal detection
)
```

### Bubble Tea Basics

```go
// Minimal Bubble Tea app
package main

import (
    "fmt"
    tea "github.com/charmbracelet/bubbletea"
)

// Model holds application state
type Model struct {
    tick int
}

// Init returns initial command
func (m Model) Init() tea.Cmd {
    return nil
}

// Update handles messages and updates state
func (m Model) Update(msg tea.Msg) (tea.Model, tea.Cmd) {
    switch msg := msg.(type) {
    case tea.KeyMsg:
        if msg.String() == "q" {
            return m, tea.Quit
        }
    }
    return m, nil
}

// View renders the UI
func (m Model) View() string {
    return "Press 'q' to quit"
}

func main() {
    p := tea.NewProgram(Model{})
    if _, err := p.Run(); err != nil {
        fmt.Printf("Error: %v", err)
    }
}
```

### Lip Gloss Styling

```go
import "github.com/charmbracelet/lipgloss"

// Define reusable styles
var (
    accentColor = lipgloss.Color("#d94f90")
    bgColor     = lipgloss.Color("#0a0612")

    titleStyle = lipgloss.NewStyle().
        Foreground(accentColor).
        Bold(true).
        Padding(0, 1)

    boxStyle = lipgloss.NewStyle().
        Border(lipgloss.RoundedBorder()).
        BorderForeground(accentColor).
        Padding(1, 2)
)

// Apply styles
func RenderTitle(text string) string {
    return titleStyle.Render(text)
}

func RenderBox(content string) string {
    return boxStyle.Render(content)
}
```

---

## Color System

### ANSI Color Palette

Celeste uses **256-color ANSI palette** for maximum terminal compatibility:

```go
// Primary colors (Lip Gloss format)
var Colors = struct {
    // Brand colors
    Accent       lipgloss.Color  // #d94f90 (pink)
    AccentLight  lipgloss.Color  // #e86ca8 (light pink)
    AccentDark   lipgloss.Color  // #b61b70 (dark pink)

    SecondaryPurple lipgloss.Color  // #8b5cf6 (purple)
    SecondaryCyan   lipgloss.Color  // #00d4ff (cyan)

    // Background colors
    BgDark      lipgloss.Color  // #0a0612 (dark purple-black)
    BgMedium    lipgloss.Color  // #140c28 (medium purple)
    BgLight     lipgloss.Color  // #1c1230 (light purple)

    // Text colors
    TextPrimary   lipgloss.Color  // #ffffff (white)
    TextSecondary lipgloss.Color  // #a0a0a0 (gray)
    TextMuted     lipgloss.Color  // #606060 (dark gray)

    // Status colors
    Success lipgloss.Color  // #10b981 (green)
    Warning lipgloss.Color  // #f59e0b (orange)
    Error   lipgloss.Color  // #ef4444 (red)
    Info    lipgloss.Color  // #3b82f6 (blue)
}{
    Accent:       lipgloss.Color("#d94f90"),
    AccentLight:  lipgloss.Color("#e86ca8"),
    AccentDark:   lipgloss.Color("#b61b70"),

    SecondaryPurple: lipgloss.Color("#8b5cf6"),
    SecondaryCyan:   lipgloss.Color("#00d4ff"),

    BgDark:   lipgloss.Color("#0a0612"),
    BgMedium: lipgloss.Color("#140c28"),
    BgLight:  lipgloss.Color("#1c1230"),

    TextPrimary:   lipgloss.Color("#ffffff"),
    TextSecondary: lipgloss.Color("#a0a0a0"),
    TextMuted:     lipgloss.Color("#606060"),

    Success: lipgloss.Color("#10b981"),
    Warning: lipgloss.Color("#f59e0b"),
    Error:   lipgloss.Color("#ef4444"),
    Info:    lipgloss.Color("#3b82f6"),
}
```

### Color Application

```go
// Apply colors to styles
var (
    headerStyle = lipgloss.NewStyle().
        Foreground(Colors.Accent).
        Background(Colors.BgDark).
        Bold(true).
        Padding(0, 2)

    successStyle = lipgloss.NewStyle().
        Foreground(Colors.Success).
        Bold(true)

    errorStyle = lipgloss.NewStyle().
        Foreground(Colors.Error).
        Bold(true)
)

// Usage
fmt.Println(headerStyle.Render("US使AGE STAT統ISTICS"))
fmt.Println(successStyle.Render("✓ Success"))
fmt.Println(errorStyle.Render("✗ Error"))
```

### Gradient Effects (Terminal-Safe)

```go
// Simulate gradient with ANSI color steps
func RenderGradient(text string, startColor, endColor lipgloss.Color) string {
    // For short text, use start color only
    if len(text) < 10 {
        return lipgloss.NewStyle().Foreground(startColor).Render(text)
    }

    // For longer text, alternate colors to simulate gradient
    var result strings.Builder
    for i, char := range text {
        ratio := float64(i) / float64(len(text))
        if ratio < 0.5 {
            result.WriteString(lipgloss.NewStyle().Foreground(startColor).Render(string(char)))
        } else {
            result.WriteString(lipgloss.NewStyle().Foreground(endColor).Render(string(char)))
        }
    }
    return result.String()
}
```

---

## Typography & Characters

### Unicode Block Characters

Block characters create visual weight and simulate glassmorphism:

```go
// Border characters (box drawing)
const (
    BorderTopLeft     = "╭"
    BorderTopRight    = "╮"
    BorderBottomLeft  = "╰"
    BorderBottomRight = "╯"
    BorderHorizontal  = "─"
    BorderVertical    = "│"
    BorderTJunctionDown  = "┬"
    BorderTJunctionUp    = "┴"
    BorderTJunctionRight = "├"
    BorderTJunctionLeft  = "┤"
    BorderCross       = "┼"
)

// Block characters (shading)
const (
    BlockFull    = "█"  // 100% filled
    BlockHeavy   = "▓"  // 75% filled
    BlockMedium  = "▒"  // 50% filled
    BlockLight   = "░"  // 25% filled
)

// Progress bar example
func RenderProgressBar(percent float64, width int) string {
    filled := int(percent * float64(width))
    bar := strings.Repeat(BlockFull, filled)
    bar += strings.Repeat(BlockLight, width-filled)
    return bar
}

// Output: "████████▓▓▒▒░░░░"
```

### Japanese Character Support

```go
// Ensure UTF-8 encoding
import "unicode/utf8"

// Japanese character sets for corruption
var (
    Katakana = []rune{'ア', 'イ', 'ウ', 'エ', 'オ', 'カ', 'キ', 'ク', 'ケ', 'コ', 'サ', 'シ', 'ス', 'セ', 'ソ', 'タ', 'チ', 'ツ', 'テ', 'ト', 'ナ', 'ニ', 'ヌ', 'ネ', 'ノ', 'ハ', 'ヒ', 'フ', 'ヘ', 'ホ', 'マ', 'ミ', 'ム', 'メ', 'モ', 'ヤ', 'ユ', 'ヨ', 'ラ', 'リ', 'ル', 'レ', 'ロ', 'ワ', 'ヲ', 'ン', 'ー'}

    Hiragana = []rune{'あ', 'い', 'う', 'え', 'お', 'か', 'き', 'く', 'け', 'こ', 'さ', 'し', 'す', 'せ', 'そ', 'た', 'ち', 'つ', 'て', 'と', 'な', 'に', 'ぬ', 'ね', 'の', 'は', 'ひ', 'ふ', 'へ', 'ほ', 'ま', 'み', 'む', 'め', 'も', 'や', 'ゆ', 'よ', 'ら', 'り', 'る', 'れ', 'ろ', 'わ', 'を', 'ん'}

    Kanji = []rune{'使', '用', '統', '計', '理', '管', '埋', '設', '定', '化', '変', '換', '状', '態', '処', '期', '待'}
)

// Character width detection (CJK characters are typically 2 cells wide)
func DisplayWidth(s string) int {
    width := 0
    for _, r := range s {
        width += runewidth.RuneWidth(r)
    }
    return width
}
```

### Text Alignment

```go
import "github.com/muesli/reflow/padding"

// Center text within width
func CenterText(text string, width int) string {
    textWidth := DisplayWidth(text)
    if textWidth >= width {
        return text
    }

    leftPad := (width - textWidth) / 2
    return padding.String(text, uint(width)).Padding(uint(leftPad), 0)
}

// Right-align text
func RightAlign(text string, width int) string {
    textWidth := DisplayWidth(text)
    if textWidth >= width {
        return text
    }

    leftPad := width - textWidth
    return strings.Repeat(" ", leftPad) + text
}
```

---

## TUI Patterns

### Dashboard Header

```go
// /stats dashboard header pattern
func RenderDashboardHeader(title string) string {
    corruptedTitle := CorruptTextJapanese(title, 0.3)

    header := lipgloss.NewStyle().
        Foreground(Colors.Accent).
        Bold(true).
        Padding(1, 2).
        Border(lipgloss.RoundedBorder()).
        BorderForeground(Colors.AccentLight).
        Render(corruptedTitle)

    return header
}

// Output:
// ╭──────────────────────╮
// │  US使AGE STAT統ISTICS  │
// ╰──────────────────────╯
```

### Status Line

```go
// Bottom status line with indicators
func RenderStatusLine(width int) string {
    left := lipgloss.NewStyle().
        Foreground(Colors.TextSecondary).
        Render("Press 'q' to quit")

    right := lipgloss.NewStyle().
        Foreground(Colors.Accent).
        Render("Celeste CLI v1.0.0")

    // Calculate spacing
    gap := width - DisplayWidth(left) - DisplayWidth(right)
    if gap < 0 {
        gap = 0
    }

    return left + strings.Repeat(" ", gap) + right
}
```

### Progress Indicators

```go
// Block character progress bar
func RenderProgress(label string, percent float64, width int) string {
    barWidth := width - DisplayWidth(label) - 10  // Space for label + percentage

    filled := int(percent * float64(barWidth))
    bar := strings.Repeat(BlockFull, filled)
    bar += strings.Repeat(BlockLight, barWidth-filled)

    percentText := fmt.Sprintf("%3.0f%%", percent*100)

    return fmt.Sprintf("%s [%s] %s",
        lipgloss.NewStyle().Foreground(Colors.TextPrimary).Render(label),
        lipgloss.NewStyle().Foreground(Colors.Accent).Render(bar),
        lipgloss.NewStyle().Foreground(Colors.TextSecondary).Render(percentText),
    )
}

// Output: "Loading [████████░░░░] 67%"
```

### Spinner Animation

```go
// Frame-based spinner
type Spinner struct {
    frames []string
    index  int
}

func NewSpinner() *Spinner {
    return &Spinner{
        frames: []string{"⠋", "⠙", "⠹", "⠸", "⠼", "⠴", "⠦", "⠧", "⠇", "⠏"},
        index:  0,
    }
}

func (s *Spinner) Next() string {
    frame := s.frames[s.index]
    s.index = (s.index + 1) % len(s.frames)

    return lipgloss.NewStyle().
        Foreground(Colors.Accent).
        Render(frame)
}

// Update every 150ms
func tickCmd() tea.Cmd {
    return tea.Tick(150*time.Millisecond, func(t time.Time) tea.Msg {
        return tickMsg(t)
    })
}
```

### Table Rendering

```go
// Simple table with borders
func RenderTable(headers []string, rows [][]string) string {
    // Calculate column widths
    widths := make([]int, len(headers))
    for i, header := range headers {
        widths[i] = DisplayWidth(header)
    }
    for _, row := range rows {
        for i, cell := range row {
            if w := DisplayWidth(cell); w > widths[i] {
                widths[i] = w
            }
        }
    }

    var result strings.Builder

    // Top border
    result.WriteString(BorderTopLeft)
    for i, width := range widths {
        result.WriteString(strings.Repeat(BorderHorizontal, width+2))
        if i < len(widths)-1 {
            result.WriteString(BorderTJunctionDown)
        }
    }
    result.WriteString(BorderTopRight + "\n")

    // Headers
    result.WriteString(BorderVertical + " ")
    for i, header := range headers {
        result.WriteString(lipgloss.NewStyle().
            Foreground(Colors.Accent).
            Bold(true).
            Width(widths[i]).
            Render(header))
        result.WriteString(" " + BorderVertical + " ")
    }
    result.WriteString("\n")

    // Middle border
    result.WriteString(BorderTJunctionRight)
    for i, width := range widths {
        result.WriteString(strings.Repeat(BorderHorizontal, width+2))
        if i < len(widths)-1 {
            result.WriteString(BorderCross)
        }
    }
    result.WriteString(BorderTJunctionLeft + "\n")

    // Rows
    for _, row := range rows {
        result.WriteString(BorderVertical + " ")
        for i, cell := range row {
            result.WriteString(lipgloss.NewStyle().
                Foreground(Colors.TextPrimary).
                Width(widths[i]).
                Render(cell))
            result.WriteString(" " + BorderVertical + " ")
        }
        result.WriteString("\n")
    }

    // Bottom border
    result.WriteString(BorderBottomLeft)
    for i, width := range widths {
        result.WriteString(strings.Repeat(BorderHorizontal, width+2))
        if i < len(widths)-1 {
            result.WriteString(BorderTJunctionUp)
        }
    }
    result.WriteString(BorderBottomRight + "\n")

    return result.String()
}
```

---

## Animation Techniques

### Frame-Based Animation

```go
// Ticker for animations (matches web 150ms/300ms timing)
type tickMsg time.Time

func tick(d time.Duration) tea.Cmd {
    return tea.Tick(d, func(t time.Time) tea.Msg {
        return tickMsg(t)
    })
}

// In Update()
func (m Model) Update(msg tea.Msg) (tea.Model, tea.Cmd) {
    switch msg := msg.(type) {
    case tickMsg:
        m.frame++
        return m, tick(150 * time.Millisecond)  // Match web timing
    }
    return m, nil
}
```

### Flicker Animation (Eyes)

```go
// Eye flicker (signature Celeste animation)
type Eye struct {
    open     bool
    nextBlink int
    frame    int
}

func (e *Eye) Update() {
    e.frame++

    if e.frame >= e.nextBlink {
        e.open = !e.open

        if e.open {
            // Next blink in 2-6 seconds (random)
            e.nextBlink = e.frame + rand.Intn(30) + 10
        } else {
            // Blink duration: 150-300ms (1-2 frames at 150ms)
            e.nextBlink = e.frame + rand.Intn(2) + 1
        }
    }
}

func (e *Eye) Render() string {
    icon := "👁"
    if !e.open {
        icon = "━"  // Closed eye
    }

    style := lipgloss.NewStyle().Foreground(Colors.Accent)

    // Add opacity effect by dimming color when blinking
    if !e.open {
        style = style.Foreground(Colors.TextMuted)
    }

    return style.Render(icon)
}
```

### Text Corruption Animation

```go
// Gradually corrupt text over time
func AnimateCorruption(text string, frame int, maxIntensity float64) string {
    // Sine wave intensity (0 → maxIntensity → 0)
    intensity := maxIntensity * math.Sin(float64(frame)*0.1)
    if intensity < 0 {
        intensity = 0
    }

    return CorruptTextJapanese(text, intensity)
}

// In Update()
func (m Model) Update(msg tea.Msg) (tea.Model, tea.Cmd) {
    switch msg := msg.(type) {
    case tickMsg:
        m.frame++
        m.title = AnimateCorruption("USAGE STATISTICS", m.frame, 0.35)
        return m, tick(300 * time.Millisecond)  // Slow animation
    }
    return m, nil
}
```

---

## Corruption Implementation

### Character-Level Corruption

```go
// Core corruption function (character-level mixing)
func CorruptTextJapanese(text string, intensity float64) string {
    if intensity <= 0 {
        return text
    }

    // Combine all Japanese character sets
    allChars := append(append(Katakana, Hiragana...), Kanji...)

    runes := []rune(text)
    for i, r := range runes {
        // Only corrupt letters (preserve spaces, punctuation)
        if !unicode.IsLetter(r) {
            continue
        }

        // Random chance based on intensity
        if rand.Float64() < intensity {
            runes[i] = allChars[rand.Intn(len(allChars))]
        }
    }

    return string(runes)
}

// Usage
title := CorruptTextJapanese("USER MANAGEMENT", 0.3)
// Output: "US使R MA埋AGE統ENT" (30% corrupted)
```

### Intensity Guidelines (CLI)

```go
// Recommended intensity levels for CLI
const (
    IntensityNone     = 0.0    // No corruption
    IntensityMinimal  = 0.15   // Decorative only (status line)
    IntensityLow      = 0.25   // Dashboard headers
    IntensityMedium   = 0.35   // Brand elements
    IntensityHigh     = 0.45   // Loading screens (max readable)
    IntensityExtreme  = 0.60   // ⚠️ Unreadable - never use
)

// Usage
func RenderHeader(text string) string {
    return CorruptTextJapanese(text, IntensityLow)  // 25% corruption
}
```

### Anti-Patterns (CLI-Specific)

```go
// ❌ DON'T: Over-corrupt interactive elements
input := CorruptTextJapanese("Enter your name:", 0.5)  // TOO HIGH - unreadable

// ✅ DO: Keep prompts readable
input := "Enter your name:"  // No corruption for critical UI

// ❌ DON'T: Corrupt every text element
title := CorruptTextJapanese("Dashboard", 0.3)
label1 := CorruptTextJapanese("Users", 0.3)
label2 := CorruptTextJapanese("Active", 0.3)
// Too much corruption = visual noise

// ✅ DO: Selective corruption
title := CorruptTextJapanese("Dashboard", 0.3)  // Header only
label1 := "Users"   // Plain labels
label2 := "Active"  // Plain labels
```

---

## Layout Strategies

### Responsive Terminal Layout

```go
// Adjust layout based on terminal size
func (m Model) View() string {
    width, height, _ := term.GetSize(int(os.Stdout.Fd()))

    // Narrow terminal (<80 chars)
    if width < 80 {
        return m.renderCompactView(width, height)
    }

    // Standard terminal (80-120 chars)
    if width < 120 {
        return m.renderStandardView(width, height)
    }

    // Wide terminal (120+ chars)
    return m.renderWideView(width, height)
}

func (m Model) renderCompactView(w, h int) string {
    // Stack elements vertically
    return lipgloss.JoinVertical(
        lipgloss.Left,
        m.renderHeader(),
        m.renderStats(),
        m.renderFooter(),
    )
}

func (m Model) renderWideView(w, h int) string {
    // Horizontal layout with columns
    leftColumn := m.renderStats()
    rightColumn := m.renderActivity()

    return lipgloss.JoinHorizontal(
        lipgloss.Top,
        leftColumn,
        rightColumn,
    )
}
```

### Vertical Scrolling

```go
import "github.com/charmbracelet/bubbles/viewport"

type Model struct {
    viewport viewport.Model
    content  string
}

func (m Model) Init() tea.Cmd {
    return nil
}

func (m Model) Update(msg tea.Msg) (tea.Model, tea.Cmd) {
    switch msg := msg.(type) {
    case tea.WindowSizeMsg:
        m.viewport.Width = msg.Width
        m.viewport.Height = msg.Height - 4  // Reserve space for header/footer
        m.viewport.SetContent(m.content)
    }

    var cmd tea.Cmd
    m.viewport, cmd = m.viewport.Update(msg)
    return m, cmd
}

func (m Model) View() string {
    return lipgloss.JoinVertical(
        lipgloss.Left,
        m.renderHeader(),
        m.viewport.View(),
        m.renderFooter(),
    )
}
```

---

## Performance Optimization

### Minimize Redraws

```go
// Cache rendered elements that don't change
type Model struct {
    headerCache string
    footerCache string
    dirty       bool
}

func (m Model) View() string {
    // Rebuild cache only when dirty
    if m.dirty {
        m.headerCache = m.renderHeader()
        m.footerCache = m.renderFooter()
        m.dirty = false
    }

    // Always render dynamic content
    body := m.renderBody()

    return lipgloss.JoinVertical(
        lipgloss.Left,
        m.headerCache,
        body,
        m.footerCache,
    )
}
```

### Batch Updates

```go
// Batch updates to reduce message passing
type Model struct {
    pendingUpdates []Update
    lastRender     time.Time
}

const renderInterval = 16 * time.Millisecond  // 60fps

func (m Model) Update(msg tea.Msg) (tea.Model, tea.Cmd) {
    // Accumulate updates
    m.pendingUpdates = append(m.pendingUpdates, msg)

    // Render at 60fps maximum
    if time.Since(m.lastRender) < renderInterval {
        return m, nil  // Skip render
    }

    // Process all pending updates
    for _, update := range m.pendingUpdates {
        m.applyUpdate(update)
    }
    m.pendingUpdates = nil
    m.lastRender = time.Now()

    return m, nil
}
```

### Efficient String Building

```go
// ❌ Slow: String concatenation
func renderList(items []string) string {
    result := ""
    for _, item := range items {
        result += "• " + item + "\n"
    }
    return result
}

// ✅ Fast: strings.Builder
func renderList(items []string) string {
    var b strings.Builder
    b.Grow(len(items) * 50)  // Pre-allocate capacity

    for _, item := range items {
        b.WriteString("• ")
        b.WriteString(item)
        b.WriteRune('\n')
    }
    return b.String()
}
```

---

## Testing

### Unit Tests

```go
// Test corruption intensity
func TestCorruptionIntensity(t *testing.T) {
    text := "HELLO WORLD"
    intensity := 0.3

    corrupted := CorruptTextJapanese(text, intensity)

    // Count corrupted characters
    differences := 0
    for i, r := range text {
        if corrupted[i] != byte(r) {
            differences++
        }
    }

    actualIntensity := float64(differences) / float64(len(text))

    // Allow ±10% variance (randomness)
    if actualIntensity < 0.2 || actualIntensity > 0.4 {
        t.Errorf("Expected ~30%% corruption, got %.1f%%", actualIntensity*100)
    }
}
```

### Terminal Output Testing

```go
// Use golden files for visual regression testing
func TestDashboardRender(t *testing.T) {
    m := Model{
        stats: Stats{Users: 1234, Active: 567},
    }

    output := m.View()

    // Strip ANSI codes for comparison
    plainOutput := stripAnsi(output)

    // Compare with golden file
    golden, _ := os.ReadFile("testdata/dashboard.golden")
    if plainOutput != string(golden) {
        t.Errorf("Output mismatch. Run `make golden` to update.")
    }
}

func stripAnsi(s string) string {
    re := regexp.MustCompile(`\x1b\[[0-9;]*m`)
    return re.ReplaceAllString(s, "")
}
```

---

## Related Documentation

- [WEB_IMPLEMENTATION.md](./WEB_IMPLEMENTATION.md) - Web platform comparison
- [COMPONENT_MAPPING.md](./COMPONENT_MAPPING.md) - CLI ↔ Web equivalents
- [ANIMATION_GUIDELINES.md](../components/ANIMATION_GUIDELINES.md) - Animation timing reference
- [COLOR_SYSTEM.md](../brand/COLOR_SYSTEM.md) - Color specifications
- [TRANSLATION_FAILURE_AESTHETIC.md](../brand/TRANSLATION_FAILURE_AESTHETIC.md) - Corruption rules

---

**Last Updated**: 2025-12-13
**Version**: 1.0.0
**Maintainer**: Celeste Brand System
**Status**: ✅ Ready for Production
