# Component Library

Complete reference for all available components in the Corrupted Theme.

## Buttons

### Basic Button
```html
<button class="btn">Primary Button</button>
```

### Button Variants

**Secondary Button**
```html
<button class="btn secondary">Secondary Button</button>
```

**Ghost Button** (outline style)
```html
<button class="btn ghost">Ghost Button</button>
```

### Button Sizes

```html
<button class="btn sm">Small</button>
<button class="btn">Medium (default)</button>
<button class="btn lg">Large</button>
```

### Full Width Button

```html
<button class="btn block">Full Width Button</button>
<button class="btn lg block">Large Full Width</button>
```

### With Icons

```html
<button class="btn">
  <i class="fas fa-download"></i>
  Download
</button>
```

### Disabled State

```html
<button class="btn" disabled>Disabled Button</button>
```

## Cards

### Basic Card

```html
<div class="card">
  <h3>Card Title</h3>
  <p>Card content goes here</p>
  <button class="btn">Action</button>
</div>
```

### Card Sizes

```html
<div class="card sm">Small Card</div>
<div class="card">Regular Card</div>
<div class="card lg">Large Card</div>
```

### Glass Card (Glassmorphism Effect)

```html
<div class="frosted-card">
  <h3>Frosted Glass Card</h3>
  <p>With backdrop blur effect</p>
</div>
```

### Card with Hover

Cards automatically lift on hover with shadow effect:

```html
<div class="card">
  <h3>Hover Me</h3>
  <p>I'll lift up with a shadow</p>
</div>
```

## Badges

### Badge Styles

```html
<span class="badge">Default Badge</span>
<span class="badge primary">Primary Badge</span>
<span class="badge secondary">Secondary Badge</span>
<span class="badge success">Success Badge</span>
<span class="badge warning">Warning Badge</span>
<span class="badge error">Error Badge</span>
```

### Badge Usage

```html
<div class="card">
  <h3>
    Post Title
    <span class="badge primary">Featured</span>
  </h3>
</div>
```

## Forms & Inputs

### Text Input

```html
<input type="text" placeholder="Enter text...">
```

### Textarea

```html
<textarea placeholder="Enter your message..."></textarea>
```

### Select Dropdown

```html
<select>
  <option>Select an option</option>
  <option>Option 1</option>
  <option>Option 2</option>
</select>
```

### Form Group

```html
<div class="mb-lg">
  <label>Email Address</label>
  <input type="email" placeholder="you@example.com">
</div>
```

### Focused State

Inputs automatically show accent color border on focus:

```html
<input type="text" placeholder="Click to focus...">
```

## Navigation

### Navbar

```html
<nav class="navbar">
  <div class="navbar-content">
    <a href="/" class="navbar-logo">
      <i class="fas fa-home"></i>
      Logo
    </a>
    <div class="navbar-links">
      <a href="/">Home</a>
      <a href="/about" class="active">About</a>
      <a href="/contact">Contact</a>
    </div>
  </div>
</nav>
```

### Active Link

Links with `.active` class show the accent color:

```html
<a href="/page" class="active">Active Link</a>
```

## Typography

### Heading Hierarchy

```html
<h1>Heading Level 1</h1>
<h2>Heading Level 2</h2>
<h3>Heading Level 3</h3>
<h4>Heading Level 4</h4>
<h5>Heading Level 5</h5>
<h6>Heading Level 6</h6>
```

### Text Emphasis

```html
<p>Normal text</p>
<p><strong>Bold text</strong></p>
<p><em>Italic text</em></p>
<p><small>Small text</small></p>
<p><mark>Highlighted text</mark></p>
```

### Text Colors

```html
<p class="text-primary">Primary text</p>
<p class="text-secondary">Secondary text</p>
<p class="text-muted">Muted text</p>
<p class="text-accent">Accent text</p>
```

## Alerts

### Alert Styles

```html
<div class="alert">Default alert message</div>
<div class="alert success">Success alert</div>
<div class="alert warning">Warning alert</div>
<div class="alert error">Error alert</div>
<div class="alert info">Info alert</div>
```

## Links

### Styled Link

```html
<a href="#" class="link">Styled Link with Underline</a>
```

The link shows an animated underline on hover.

## Code & Pre-formatted

### Inline Code

```html
<p>Use the <code>btn</code> class for buttons.</p>
```

### Code Block

```html
<pre><code>
function hello() {
  console.log("Hello, world!");
}
</code></pre>
```

## Glass Effects

### Glass Container

```html
<div class="glass p-xl rounded-xl">
  Glass effect container
</div>
```

### Glass Buttons

```html
<button class="glass-btn">Glass Button</button>
```

### Shadow Variants

```html
<div class="glass glass-shadow-sm">Small shadow</div>
<div class="glass glass-shadow">Medium shadow</div>
<div class="glass glass-shadow-lg">Large shadow</div>
<div class="glass glass-shadow-xl">Extra large shadow</div>
```

## Dividers

### Horizontal Divider

```html
<div class="divider"></div>

<div class="divider sm"></div>
<div class="divider lg"></div>
```

## Grid Layouts

### 2-Column Grid

```html
<div class="grid-2">
  <div class="card">Card 1</div>
  <div class="card">Card 2</div>
</div>
```

### 3-Column Grid

```html
<div class="grid-3">
  <div class="card">Card 1</div>
  <div class="card">Card 2</div>
  <div class="card">Card 3</div>
</div>
```

### 4-Column Grid

```html
<div class="grid-4">
  <div class="card">Card 1</div>
  <div class="card">Card 2</div>
  <div class="card">Card 3</div>
  <div class="card">Card 4</div>
</div>
```

Grids automatically stack on mobile devices.

## Animations

### Fade In

```html
<div class="fade-in">Fades in on load</div>
<div class="fade-in-slow">Slower fade</div>
<div class="fade-in-fast">Faster fade</div>
```

### Slide In

```html
<div class="slide-in">Slides in from bottom</div>
<div class="slide-in-left">Slides in from left</div>
<div class="slide-in-right">Slides in from right</div>
```

### Scale In

```html
<div class="scale-in">Scales in from center</div>
```

### Glitch Effect

```html
<span class="glitch-word" data-text="Glitch">Glitch</span>
```

Add `data-text` attribute with the same text for the effect to work.

### Float Animation

```html
<div class="float">Floats up and down</div>
```

### Pulse & Breathe

```html
<div class="pulse">Pulsing opacity</div>
<div class="breathe">Breathing animation</div>
```

## Accessibility

All components include:
- ✓ Proper semantic HTML
- ✓ WCAG AA color contrast
- ✓ Focus states for keyboard navigation
- ✓ Reduced motion support

Example:

```html
<button class="btn" aria-label="Download file">
  <i class="fas fa-download"></i>
  Download
</button>
```

## Responsive Design

Most components are responsive out of the box. Cards and grids stack on mobile:

```html
<!-- Desktop: 3 columns, Mobile: 1 column -->
<div class="grid-3">
  <div class="card">Card 1</div>
  <div class="card">Card 2</div>
  <div class="card">Card 3</div>
</div>
```

---

For utility classes and spacing, see [UTILITIES.md](./UTILITIES.md)

For animations, see [ANIMATIONS.md](./ANIMATIONS.md)

For customization options, see [CUSTOMIZATION.md](./CUSTOMIZATION.md)
