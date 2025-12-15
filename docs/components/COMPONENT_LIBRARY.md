# Celeste Brand System - Component Library

**Version**: 1.0.0
**Last Updated**: 2025-12-13
**Status**: 🟠 **HIGH PRIORITY DOCUMENT**

---

## Overview

This document provides a complete inventory of all Celeste design system components across both platforms:
- **Web Components** (40+ from corrupted-theme npm package)
- **CLI Patterns** (6 core TUI patterns)
- **Cross-platform mapping** showing equivalents

---

## Component Philosophy

### Design Principles

1. **Glassmorphism First** - All containers use frosted glass effects
2. **Corruption Aesthetic** - Translation-failure text mixed throughout
3. **Terminal-Native Adaptation** - CLI patterns mirror web components
4. **Semantic Hierarchy** - Components named by purpose, not appearance
5. **Accessibility Built-In** - WCAG AA compliance, keyboard navigation

### Component Categories

| Category | Web Count | CLI Count | Purpose |
|----------|-----------|-----------|---------|
| **Containers** | 8 | 2 | Cards, panels, sections |
| **Interactive** | 12 | 1 | Buttons, inputs, dropdowns |
| **Data Display** | 15 | 3 | Tables, badges, progress bars |
| **Navigation** | 6 | 0 | Navbar, breadcrumbs, tabs |
| **Feedback** | 5 | 2 | Alerts, loaders, notifications |
| **Extensions** | 10 | 0 | Gallery, countdown, social links |

**Total**: 56 web components, 8 CLI patterns

---

## Cross-Platform Component Mapping

### Core Equivalents

| npm Component | CLI Pattern | Purpose | Shared Attributes |
|---------------|-------------|---------|-------------------|
| `.glass-card` | Dashboard section | Primary container | Pink borders, glass bg, padding |
| `.glass-button` | Menu option highlight | Interactive element | Pink accent, hover glow |
| `.progress-bar` | `████▓▒░░` | Progress indicator | Filled/empty ratio, visual feedback |
| `.spinner` | `⟨ processing... ⟩` | Loading state | Corruption text, animation |
| `.badge` | Status emoji (🟢🟡🔴) | Status indicator | Color-coded semantic states |
| `.alert` | Error/success messages | User feedback | Color + icon + message |
| `.table` | Formatted data rows | Data display | Aligned columns, headers |
| `.api-endpoint` | CLI command help | API/command docs | Method + path + description |

### Platform-Specific Components

**Web Only** (no CLI equivalent):
- Gallery with lightbox
- Social links container
- Countdown widget
- NSFW blur overlay
- Dropdown menus
- Modal dialogs
- Tabs navigation
- Form validation states

**CLI Only** (no web equivalent):
- Terminal status line
- Skill execution animation
- Session persistence UI
- Typing simulation effect

---

## Web Component Inventory

### 1. Glass Components (Core)

#### `.glass-card`

**Purpose**: Primary container for content sections
**File**: `src/css/glassmorphism.css`
**Variants**: None (base only)

**Anatomy**:
```css
.glass-card {
  background: rgba(20, 12, 40, 0.7);
  backdrop-filter: blur(15px);
  border: 1px solid rgba(217, 79, 144, 0.3);
  border-radius: 12px;
  padding: var(--spacing-lg);
  box-shadow: 0 4px 16px rgba(217, 79, 144, 0.25);
}
```

**Usage**:
```html
<div class="glass-card">
  <h2>Section Title</h2>
  <p>Content goes here...</p>
</div>
```

**When to use**:
- Dashboard sections
- Content panels
- Feature showcases
- Modal content areas

**When NOT to use**:
- Page backgrounds (too heavy)
- Nested 3+ levels deep (performance)
- Over images without dark overlay

---

#### `.glass-input`

**Purpose**: Form inputs with glass effect
**File**: `src/css/glassmorphism.css`
**Variants**: None

**Anatomy**:
```css
.glass-input {
  background: rgba(20, 12, 40, 0.6);
  backdrop-filter: blur(5px);
  border: 1px solid rgba(217, 79, 144, 0.3);
  color: var(--color-text-primary);
  padding: var(--spacing-sm) var(--spacing-md);
}
```

**States**:
- `:focus` - Border brightens to 70% opacity, pink glow
- `:hover` - Border brightens to 50% opacity
- `:disabled` - 30% opacity, no interaction

**Usage**:
```html
<input type="text" class="glass-input" placeholder="Enter text...">
<textarea class="glass-input" rows="4"></textarea>
```

---

#### `.glass-button`

**Purpose**: Primary CTA buttons
**File**: `src/css/glassmorphism.css`
**Variants**: None (use `.btn` for variants)

**Anatomy**:
```css
.glass-button {
  background: rgba(217, 79, 144, 0.1);
  backdrop-filter: blur(5px);
  border: 1px solid rgba(217, 79, 144, 0.3);
  color: var(--color-accent-primary);
  padding: var(--spacing-sm) var(--spacing-lg);
  transition: all 0.3s ease;
}
```

**States**:
- `:hover` - Background opacity 20%, border 50%, glow shadow
- `:active` - Background darker pink, scale(0.98)
- `:disabled` - 30% opacity, cursor not-allowed

---

#### `.glass-code`

**Purpose**: Code blocks with glass effect
**File**: `src/css/glassmorphism.css`
**Variants**: None

**Usage**:
```html
<pre class="glass-code"><code>function example() {
  return "Hello, World!";
}</code></pre>
```

---

### 2. Standard Components

#### Buttons

**File**: `src/css/components.css`
**Base Class**: `.btn`

**Variants**:
- `.btn` - Primary filled button (pink background)
- `.btn-secondary` - Secondary outlined button
- `.btn-ghost` - Transparent with border only

**Sizes**:
- `.btn-sm` - Small (padding: 0.25rem 0.75rem)
- `.btn` (default) - Medium (padding: 0.5rem 1.5rem)
- `.btn-lg` - Large (padding: 0.75rem 2rem)

**Anatomy**:
```css
.btn {
  background: var(--color-accent-primary);
  color: white;
  border: none;
  padding: var(--spacing-sm) var(--spacing-lg);
  border-radius: var(--radius-md);
  cursor: pointer;
  transition: var(--transition);
}
```

**States**:
- `:hover` - Lighter pink, shadow glow
- `:active` - Darker pink, scale(0.98)
- `:focus-visible` - Outline 2px pink
- `:disabled` - 50% opacity, no pointer

**Usage**:
```html
<button class="btn">Primary Action</button>
<button class="btn btn-secondary">Secondary</button>
<button class="btn btn-ghost btn-sm">Cancel</button>
```

**Best Practices**:
- Use primary for main CTA (1 per section)
- Secondary for alternative actions
- Ghost for tertiary/cancel actions
- Always include hover states
- Provide disabled state when async loading

---

#### Cards

**File**: `src/css/components.css`
**Base Class**: `.card`

**Variants**:
- `.card` - Standard card
- `.card-sm` - Compact card (less padding)
- `.card-lg` - Spacious card (more padding)

**Anatomy**:
```css
.card {
  background: var(--color-background-secondary);
  border: 1px solid var(--color-border-primary);
  border-radius: var(--radius-lg);
  padding: var(--spacing-lg);
  transition: var(--transition);
}
```

**Optional Elements**:
- `.card-header` - Card title section
- `.card-body` - Main content area
- `.card-footer` - Actions/metadata

**States**:
- `:hover` - Border brightens, subtle lift (translateY(-2px))

**Usage**:
```html
<div class="card">
  <div class="card-header">
    <h3>Card Title</h3>
  </div>
  <div class="card-body">
    <p>Card content...</p>
  </div>
  <div class="card-footer">
    <button class="btn btn-sm">Action</button>
  </div>
</div>
```

**When to use**:
- Content grouping
- Feature highlights
- Team member profiles
- Product listings

**When NOT to use**:
- For every paragraph (over-carding)
- Nested cards (use `.glass-card` for nesting)

---

#### Badges

**File**: `src/css/components.css`
**Base Class**: `.badge`

**Variants** (semantic colors):
- `.badge` - Default (purple)
- `.badge-success` - Green
- `.badge-warning` - Yellow/orange
- `.badge-error` - Red
- `.badge-info` - Cyan

**Anatomy**:
```css
.badge {
  display: inline-block;
  padding: 0.25rem 0.5rem;
  font-size: 0.75rem;
  font-weight: 600;
  border-radius: var(--radius-sm);
  background: var(--color-secondary-purple);
  color: white;
}
```

**Usage**:
```html
<span class="badge">New</span>
<span class="badge badge-success">Active</span>
<span class="badge badge-warning">Pending</span>
<span class="badge badge-error">Error</span>
```

**Best Practices**:
- Use semantic variants (success/warning/error) for status
- Keep text short (1-2 words)
- Don't overuse (max 1-2 per item)

---

#### Alerts

**File**: `src/css/components.css`
**Base Class**: `.alert`

**Variants**:
- `.alert` - Default info alert (purple)
- `.alert-success` - Green
- `.alert-warning` - Yellow/orange
- `.alert-error` - Red

**Anatomy**:
```css
.alert {
  padding: var(--spacing-md);
  border-left: 4px solid var(--color-secondary-purple);
  border-radius: var(--radius-md);
  background: rgba(139, 92, 246, 0.1);
}
```

**Usage**:
```html
<div class="alert alert-success">
  <strong>Success!</strong> Your changes have been saved.
</div>
```

**Best Practices**:
- Use appropriate semantic variant
- Include icon for visual reinforcement
- Provide actionable next steps
- Make dismissible for non-critical alerts

---

#### Tables

**File**: `src/css/components.css`
**Base Class**: `.table`

**Variants**:
- `.table` - Standard table
- `.table-striped` - Alternating row colors

**Anatomy**:
```css
.table {
  width: 100%;
  border-collapse: collapse;
}

.table th {
  background: rgba(217, 79, 144, 0.1);
  padding: var(--spacing-sm);
  text-align: left;
  font-weight: 600;
}

.table td {
  padding: var(--spacing-sm);
  border-bottom: 1px solid var(--color-border-primary);
}
```

**Usage**:
```html
<table class="table table-striped">
  <thead>
    <tr>
      <th>Name</th>
      <th>Status</th>
      <th>Actions</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>Item 1</td>
      <td><span class="badge badge-success">Active</span></td>
      <td><button class="btn btn-sm">Edit</button></td>
    </tr>
  </tbody>
</table>
```

**Best Practices**:
- Use `.table-striped` for long tables (improves scannability)
- Keep columns to 3-6 (responsive concern)
- Consider horizontal scroll on mobile

---

### 3. Data Display Components

#### API Endpoint Display

**File**: `src/css/components.css`
**Classes**: `.api-endpoint`, `.api-method`, `.api-path`

**Purpose**: Document API routes with method badges

**Anatomy**:
```css
.api-endpoint {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  padding: var(--spacing-sm);
  background: rgba(20, 12, 40, 0.5);
  border-radius: var(--radius-md);
}

.api-method {
  padding: 0.25rem 0.5rem;
  border-radius: var(--radius-sm);
  font-weight: 600;
  font-size: 0.75rem;
}

.api-method.get { background: #22c55e; color: white; }
.api-method.post { background: #3b82f6; color: white; }
.api-method.put { background: #f59e0b; color: white; }
.api-method.delete { background: #ef4444; color: white; }
```

**Usage**:
```html
<div class="api-endpoint">
  <span class="api-method get">GET</span>
  <code class="api-path">/api/v1/users/:id</code>
</div>
```

---

#### API Parameters

**File**: `src/css/components.css`
**Classes**: `.api-param`, `.api-param-name`, `.api-param-type`, `.api-param-description`

**Purpose**: Document API request/response parameters

**Usage**:
```html
<div class="api-param">
  <code class="api-param-name">userId</code>
  <span class="api-param-type">string</span>
  <p class="api-param-description">Unique identifier for the user</p>
</div>
```

---

#### Progress Bar

**File**: `src/css/components.css`
**Base Class**: `.progress-bar`

**Anatomy**:
```css
.progress-bar {
  width: 100%;
  height: 8px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: var(--radius-sm);
  overflow: hidden;
}

.progress-bar-fill {
  height: 100%;
  background: linear-gradient(90deg, var(--color-accent-primary), var(--color-secondary-purple));
  transition: width 0.3s ease;
}
```

**Usage**:
```html
<div class="progress-bar">
  <div class="progress-bar-fill" style="width: 65%;"></div>
</div>
```

---

### 4. Navigation Components

#### Navbar

**File**: `src/css/components.css`
**Base Class**: `.navbar`

**Features**:
- Mobile responsive with toggle
- Submenu support
- Fixed positioning
- Glassmorphic background

**Anatomy**:
```css
.navbar {
  position: fixed;
  top: 0;
  width: 100%;
  background: rgba(20, 12, 40, 0.9);
  backdrop-filter: blur(15px);
  border-bottom: 1px solid rgba(217, 79, 144, 0.3);
  z-index: var(--z-navbar);
}
```

**Elements**:
- `.navbar-brand` - Logo/site name
- `.navbar-menu` - Navigation links container
- `.navbar-item` - Individual nav link
- `.navbar-toggle` - Mobile hamburger button

**Usage**:
```html
<nav class="navbar">
  <div class="navbar-brand">Celeste</div>
  <ul class="navbar-menu">
    <li class="navbar-item"><a href="/">Home</a></li>
    <li class="navbar-item"><a href="/about">About</a></li>
  </ul>
  <button class="navbar-toggle">☰</button>
</nav>
```

---

#### Dropdown

**File**: `src/css/components.css`
**Base Class**: `.dropdown`

**Features**:
- Click-to-open menu
- Auto-close on outside click
- Keyboard navigation

**Elements**:
- `.dropdown` - Container
- `.dropdown-toggle` - Button to open
- `.dropdown-menu` - Menu content (hidden by default)
- `.dropdown-item` - Menu option

**Usage**:
```html
<div class="dropdown">
  <button class="dropdown-toggle">Options ▼</button>
  <div class="dropdown-menu">
    <a href="#" class="dropdown-item">Edit</a>
    <a href="#" class="dropdown-item">Delete</a>
  </div>
</div>
```

---

### 5. Animation & Feedback Components

#### Spinner

**File**: `src/css/animations.css`
**Base Class**: `.spinner`

**Purpose**: Loading indicator

**Anatomy**:
```css
.spinner {
  width: 40px;
  height: 40px;
  border: 4px solid rgba(217, 79, 144, 0.2);
  border-top: 4px solid var(--color-accent-primary);
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}
```

**Usage**:
```html
<div class="spinner"></div>
```

---

#### Loading Bar

**File**: `src/css/animations.css`
**Base Class**: `.loading-bar`

**Purpose**: Indeterminate progress indicator

**Usage**:
```html
<div class="loading-bar"></div>
```

---

### 6. Extension Components

#### Gallery

**File**: `src/css/extensions.css`, `src/lib/gallery.js`
**Base Class**: `.gallery-container`

**Features**:
- Responsive grid layout
- Filtering by category
- Lightbox viewer
- NSFW blur overlay
- Lazy loading support

**Elements**:
- `.gallery-container` - Main wrapper
- `.filter-bar` - Category filters
- `.filter-btn` - Individual filter button
- `.gallery-item` - Individual image
- `.lightbox` - Full-screen image viewer

**Usage**:
```html
<div class="gallery-container" data-gallery>
  <div class="filter-bar">
    <button class="filter-btn active" data-filter="all">All</button>
    <button class="filter-btn" data-filter="art">Art</button>
  </div>
  <div class="gallery-item" data-category="art">
    <img src="image.jpg" alt="Artwork">
  </div>
</div>

<script type="module">
import { initGallery } from './lib/gallery.js';
initGallery({ filtering: true, lightbox: true });
</script>
```

---

#### Countdown Widget

**File**: `src/css/extensions.css`, `src/lib/countdown-widget.js`
**Base Class**: `.countdown-container`

**Features**:
- Event countdown timer
- Shape variants (diamond, circle, heart, star, hexagon, octagon)
- Character image backgrounds
- Completion message

**Usage**:
```html
<div class="countdown-container"
     data-countdown
     data-event-date="2025-12-25T00:00:00"
     data-shape="heart">
</div>

<script type="module">
import { initCountdown } from './lib/countdown-widget.js';
initCountdown();
</script>
```

---

#### Social Links

**File**: `src/css/extensions.css`
**Base Class**: `.social-links-container`

**Features**:
- Profile avatar
- Bio text
- Styled link list
- Icon support

**Elements**:
- `.social-links-container` - Main wrapper
- `.profile-avatar` - Avatar image
- `.profile-bio` - Bio text
- `.link-list` - Links container
- `.link-item` - Individual link

**Usage**:
```html
<div class="social-links-container">
  <img src="avatar.png" alt="Profile" class="profile-avatar">
  <p class="profile-bio">Digital artist & VTuber</p>
  <div class="link-list">
    <a href="#" class="link-item">Twitter</a>
    <a href="#" class="link-item">YouTube</a>
  </div>
</div>
```

---

#### NSFW Content Overlay

**File**: `src/css/extensions.css`
**Base Class**: `.nsfw-content`

**Purpose**: Blur NSFW images with click-to-reveal

**Anatomy**:
```css
.nsfw-content {
  position: relative;
  cursor: pointer;
}

.nsfw-content::before {
  content: "NSFW - Click to view";
  position: absolute;
  inset: 0;
  backdrop-filter: blur(20px);
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 0, 0.7);
}

.nsfw-content.revealed::before {
  display: none;
}
```

**Usage**:
```html
<div class="nsfw-content">
  <img src="nsfw-image.jpg" alt="NSFW content">
</div>
```

---

### 7. Nikke Game-Specific Components

#### Element System

**File**: `src/css/nikke-utilities.css`
**Classes**: `.element-water`, `.element-wind`, `.element-iron`, `.element-electric`, `.element-fire`

**Purpose**: Game element badges with semantic colors

**Element Colors**:
- Water: `#0066cc` (Blue)
- Wind: `#22c55e` (Green)
- Iron: `#f59e0b` (Yellow/Orange)
- Electric: `#a855f7` (Purple)
- Fire: `#ef4444` (Red)

**Usage**:
```html
<span class="element-badge element-water">Water</span>
<span class="element-badge element-fire solid">Fire</span>
```

---

#### Team Builder

**File**: `src/css/nikke-utilities.css`
**Classes**: `.team-position-cards`, `.position-card`, `.unit-display`

**Purpose**: Game-specific team composition UI

**Features**:
- 5 position slots
- Unit portraits
- Element indicators
- Skill preview

**Usage**:
```html
<div class="team-position-cards">
  <div class="position-card">
    <div class="position-header">Position 1</div>
    <div class="unit-display">
      <img src="unit.png" alt="Unit">
      <span class="element-badge element-fire">Fire</span>
    </div>
  </div>
</div>
```

---

## CLI Pattern Inventory

### 1. Dashboard Section

**Purpose**: Equivalent to `.glass-card` on web
**Implementation**: Block characters + lipgloss styling
**File**: `cmd/celeste/commands/stats.go`

**Pattern**:
```
▓▒░ ═══════════════════════════════════════ ░▒▓
           👁️  US使AGE ANア統LYTICS  👁️
     ⟨ tōkei dēta wo... fuhai sasete iru... ⟩
▓▒░ ═══════════════════════════════════════ ░▒▓

█ LIFETIME CORRUPTION:
  ▓ Total Sessions:     42
  ▓ Total Messages:     1,337
  ▓ Total Tokens:       2.5M
```

**Code**:
```go
style := lipgloss.NewStyle().
    Border(lipgloss.RoundedBorder()).
    BorderForeground(lipgloss.Color("#d94f90")).
    Padding(1, 2)
```

---

### 2. Progress Bar (Block Characters)

**Purpose**: Equivalent to `.progress-bar` on web
**Implementation**: Block character fill (`█▓▒░`)
**File**: `cmd/celeste/commands/stats.go`

**Pattern**:
```
████████▓▒░░░░░░░░░░  40%
```

**Code**:
```go
func renderProgressBar(filled, total, width int) string {
    filledWidth := (filled * width) / total
    bar := strings.Repeat("█", filledWidth)
    bar += strings.Repeat("░", width-filledWidth)
    return bar
}
```

---

### 3. Status Emoji

**Purpose**: Equivalent to `.badge` on web
**Implementation**: Emoji indicators
**File**: `cmd/celeste/commands/stats.go`

**Pattern**:
```
🟢 Active
🟡 Warning
🔴 Critical
```

**Mapping**:
- 🟢 = `.badge-success`
- 🟡 = `.badge-warning`
- 🔴 = `.badge-error`
- ◉ = `.badge` (info/default)

---

### 4. Corruption Text

**Purpose**: In-line translation-failure text
**Implementation**: `CorruptTextJapanese()` function
**File**: `cmd/celeste/tui/streaming.go`

**Pattern**:
```
"loaディング..."
"pro理cessing..."
"US使AGE ANア統LYTICS"
```

**Code**:
```go
title := tui.CorruptTextJapanese("USAGE ANALYTICS", 0.35)
```

---

### 5. Loading Spinner

**Purpose**: Equivalent to `.spinner` on web
**Implementation**: Rotating characters + corruption
**File**: `cmd/celeste/tui/streaming.go`

**Pattern**:
```
⟨ 処理 processing purosesu... ⟩
```

**Animation**: Cycles through corruption phrases

---

### 6. Skill Execution

**Purpose**: Heavy glitching effect (unique to CLI)
**Implementation**: `CorruptText()` with block characters
**File**: `cmd/celeste/tui/streaming.go`

**Pattern**:
```
tar▓█_r▒ad░ng
```

**Code**:
```go
skillName := tui.CorruptText("tarot_reading", 0.40)
```

---

## Component Usage Guidelines

### When to Use Glass Components

**✅ Use `.glass-card` when:**
- Creating content sections
- Building dashboard panels
- Wrapping feature descriptions
- Modal content areas

**❌ Don't use `.glass-card` when:**
- Nesting 3+ levels deep (performance issue)
- Over light backgrounds (low contrast)
- For small UI elements (use `.card` instead)

### When to Use Standard vs Glass

| Scenario | Use Standard | Use Glass |
|----------|-------------|-----------|
| Dashboard sections | `.card` | `.glass-card` ✅ |
| Buttons | `.btn` ✅ | `.glass-button` |
| Form inputs | `<input>` | `.glass-input` ✅ |
| Code blocks | `<pre>` | `.glass-code` ✅ |
| Navigation | `.navbar` ✅ | N/A |

**Rule of Thumb**: Use glass for hero sections and primary focus areas. Use standard for secondary UI.

---

## Component Anatomy Reference

### Standard Component Structure

All components follow this pattern:

```
Component
├── Base Class (.component)
├── Variants (.component-variant)
├── Sizes (.component-sm, .component-lg)
├── States (:hover, :focus, :active, :disabled)
└── Optional Elements (.component-header, .component-body)
```

**Example** (Button):
```
.btn                      # Base
├── .btn-secondary       # Variant
├── .btn-ghost           # Variant
├── .btn-sm              # Size
├── .btn-lg              # Size
├── :hover               # State
├── :focus-visible       # State
└── :disabled            # State
```

---

## Anti-Patterns

### ❌ Don't Do This

**Over-nesting glass effects**:
```html
<!-- BAD: 3 levels of backdrop-filter = performance killer -->
<div class="glass-card">
  <div class="glass-card">
    <div class="glass-card">
      Content
    </div>
  </div>
</div>
```

**Mixing semantic colors incorrectly**:
```html
<!-- BAD: Success button for destructive action -->
<button class="btn badge-success">Delete Account</button>
```

**Using CLI patterns on web**:
```html
<!-- BAD: Block characters don't render well in browsers -->
<div>████▓▒░░░░░░░░░░</div>
```

---

## Related Documents

- **GLASSMORPHISM.md** - Detailed glass effect specifications
- **INTERACTIVE_STATES.md** - Hover, focus, active patterns
- **ANIMATION_GUIDELINES.md** - Motion and timing
- **COLOR_SYSTEM.md** - Semantic color usage
- **COMPONENT_MAPPING.md** - Cross-platform equivalents (Platform tier)

---

**Status**: ✅ **COMPONENT LIBRARY COMPLETE** - Ready for implementation
