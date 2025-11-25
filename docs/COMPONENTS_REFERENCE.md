# Corrupted Theme - Complete Component Reference

This document provides a comprehensive reference for all components available in the Corrupted Theme. Every example mirrors the styles in `src/css` (no pseudocode), uses real class names, and is ready for copy/paste into production builds or AI-driven scaffolding.

**Usage guidelines**
- Keep `.glass-*`, `.btn`, `.badge`, `.api-*`, `.nikke-*` classes intact—do not rename components when integrating.
- Modifier classes follow dot-notation in CSS (e.g., `.btn.secondary`), so the HTML must include both class names (`class="btn secondary"`).
- JavaScript helpers are optional; the base CSS degrades gracefully when you omit scripts or run with `prefers-reduced-motion: reduce`.

## Table of Contents

1. [Glass Components](#glass-components)
2. [Standard Components](#standard-components)
3. [Interactive Components](#interactive-components)
4. [Data Display](#data-display)
5. [Navigation](#navigation)
6. [API Documentation](#api-documentation)
7. [Nikke Components](#nikke-components)
8. [Background & Images](#background--images)

---

## Glass Components

Reusable glass components perfect for API documentation, dashboards, and modern web applications.

### Glass Card

Primary container component with enhanced glass effect.

```html
<div class="glass-card" style="padding: 1.5rem;">
  <h3>Card Title</h3>
  <p>Card content goes here</p>
</div>
```

**Features:**
- Backdrop blur effect
- Dual shadow system (outer + inset)
- Hover state with lifted effect
- Smooth transitions

### Glass Input

Form input fields with glass styling.

```html
<input type="text" class="glass-input" placeholder="Enter text...">
<textarea class="glass-input"></textarea>
<select class="glass-input">
  <option>Option 1</option>
</select>
```

**Features:**
- Lighter glass effect for better visibility
- Accent color focus state
- Works with input, textarea, and select elements

### Glass Button

Action buttons with gradient and glass blur.

```html
<button class="glass-button">Click Me</button>
<a href="#" class="glass-button">Link Button</a>
<button class="glass-button" disabled>Disabled</button>
```

**Features:**
- Gradient background
- Lift animation on hover
- Accent color border
- Glass blur effect

### Glass Code

Code block display component.

```html
<pre class="glass-code">const example = "Hello, World!";</pre>
<code class="glass-code">inline code</code>
```

**Features:**
- Monospace font
- Darker glass background
- Horizontal scroll for long code

---

## Standard Components

### Cards

```html
<div class="card">
  <h3>Card Title</h3>
  <p>Card content</p>
</div>

<div class="card sm">Small Card</div>
<div class="card lg">Large Card</div>
```

### Buttons

```html
<button class="btn">Primary</button>
<button class="btn secondary">Secondary</button>
<button class="btn ghost">Ghost</button>
<button class="btn sm">Small</button>
<button class="btn lg">Large</button>
<button class="btn" disabled>Disabled</button>
```

### Badges

```html
<span class="badge">Default</span>
<span class="badge primary">Primary</span>
<span class="badge success">Success</span>
<span class="badge warning">Warning</span>
<span class="badge error">Error</span>

<!-- API Method Badges -->
<span class="badge badge-method">API</span>
<span class="badge badge-get">GET</span>
<span class="badge badge-post">POST</span>
```

### Alerts

```html
<div class="alert alert-success">Success message</div>
<div class="alert alert-info">Info message</div>
<div class="alert alert-warning">Warning message</div>
<div class="alert alert-error">Error message</div>
```

### Links

```html
<a href="#" class="link">Link with underline animation</a>
```

---

## Interactive Components

### Modals

```html
<!-- Trigger Button -->
<button class="btn" onclick="openModal('my-modal')">Open Modal</button>

<!-- Modal -->
<div class="modal-overlay" id="my-modal">
  <div class="modal">
    <div class="modal-header">
      <h3 class="modal-title">Modal Title</h3>
      <button class="modal-close" onclick="closeModal('my-modal')">&times;</button>
    </div>
    <div class="modal-body">
      <p>Modal content goes here</p>
    </div>
    <div class="modal-footer">
      <button class="btn secondary" onclick="closeModal('my-modal')">Cancel</button>
      <button class="btn" onclick="closeModal('my-modal')">Confirm</button>
    </div>
  </div>
</div>
```

**JavaScript:**
```javascript
function openModal(id) {
  document.getElementById(id).classList.add('active');
  document.body.style.overflow = 'hidden';
}

function closeModal(id) {
  document.getElementById(id).classList.remove('active');
  document.body.style.overflow = '';
}
```

### Tooltips

```html
<span class="tooltip">
  Hover me
  <span class="tooltip-content top">Tooltip text</span>
</span>

<!-- Positions: top, bottom, left, right -->
<span class="tooltip-content bottom">Bottom tooltip</span>
<span class="tooltip-content left">Left tooltip</span>
<span class="tooltip-content right">Right tooltip</span>
```

### Dropdowns

```html
<div class="dropdown">
  <button class="dropdown-toggle" onclick="toggleDropdown(this)">
    Dropdown <i class="fas fa-chevron-down"></i>
  </button>
  <div class="dropdown-menu">
    <a href="#" class="dropdown-item">Action 1</a>
    <a href="#" class="dropdown-item">Action 2</a>
    <div class="dropdown-divider"></div>
    <a href="#" class="dropdown-item">Separated Action</a>
  </div>
</div>
```

### Tabs

```html
<div class="tabs">
  <button class="tab active" onclick="switchTab(this, 'tab-1')">Tab 1</button>
  <button class="tab" onclick="switchTab(this, 'tab-2')">Tab 2</button>
</div>

<div id="tab-1" class="tab-content active">Tab 1 content</div>
<div id="tab-2" class="tab-content">Tab 2 content</div>
```

---

## Data Display

### Loading & Progress

**Spinners:**
```html
<div class="spinner sm"></div>
<div class="spinner"></div>
<div class="spinner lg"></div>
```

**Loading Bar:**
```html
<div class="loading-bar">
  <div class="loading-bar-fill"></div>
</div>
```

**Progress Bars:**
```html
<div class="progress">
  <div class="progress-bar" style="width: 50%;">50%</div>
</div>

<div class="progress-bar success" style="width: 75%;">75%</div>
<div class="progress-bar warning" style="width: 60%;">60%</div>
<div class="progress-bar error" style="width: 30%;">30%</div>
```

### Tables

```html
<table class="table">
  <thead>
    <tr>
      <th>Name</th>
      <th>Email</th>
      <th>Role</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>John Doe</td>
      <td>john@example.com</td>
      <td>Admin</td>
    </tr>
  </tbody>
</table>

<!-- Striped Table -->
<table class="table table-striped">
  <!-- ... -->
</table>
```

### List Groups

```html
<div class="list-group">
  <div class="list-group-item">Item 1</div>
  <div class="list-group-item active">Active Item</div>
  <div class="list-group-item disabled">Disabled Item</div>
</div>
```

---

## Navigation

### Navbar (Desktop)

```html
<nav class="navbar">
  <div class="navbar-content">
    <a href="/" class="navbar-logo">
      <i class="fas fa-palette"></i> Corrupted Theme
    </a>
    <ul class="navbar-links">
      <li><a href="#glass" class="active"><i class="fas fa-cube"></i> Glass</a></li>
      <li><a href="#components"><i class="fas fa-shapes"></i> Components</a></li>
      <li><a href="#navigation"><i class="fas fa-bars"></i> Navigation</a></li>
    </ul>
  </div>
</nav>
```

### Navbar with Submenu

```html
<ul class="navbar-links">
  <li><a href="#home">Home</a></li>
  <li class="has-submenu">
    <a href="#products">
      <i class="fas fa-folder"></i> Products
      <i class="fas fa-chevron-down"></i>
    </a>
    <div class="submenu">
      <a href="#item-1"><i class="fas fa-box"></i> Product 1</a>
      <a href="#item-2"><i class="fas fa-box"></i> Product 2</a>
      <a href="#item-3"><i class="fas fa-box"></i> Product 3</a>
    </div>
  </li>
  <li><a href="#about">About</a></li>
</ul>
```

### Mobile Navbar Toggle

```html
<button class="navbar-toggle" onclick="toggleNavbar(this)">
  <span class="icon">
    <span></span>
    <span></span>
    <span></span>
  </span>
</button>

<ul class="navbar-links">
  <!-- links -->
</ul>
```

```html
<script>
function toggleNavbar(button) {
  const menu = document.querySelector('.navbar-links');
  menu.classList.toggle('active');
  button.classList.toggle('active');
}
</script>
```

### Pagination

```html
<nav class="pagination">
  <ul class="page-item">
    <a href="#" class="page-link"><i class="fas fa-chevron-left"></i></a>
  </ul>
  <ul class="page-item">
    <a href="#" class="page-link">1</a>
  </ul>
  <ul class="page-item active">
    <a href="#" class="page-link">2</a>
  </ul>
  <ul class="page-item">
    <a href="#" class="page-link"><i class="fas fa-chevron-right"></i></a>
  </ul>
</nav>
```

### Breadcrumbs

```html
<nav class="breadcrumb">
  <div class="breadcrumb-item">
    <a href="#">Home</a>
  </div>
  <div class="breadcrumb-item">
    <a href="#">Category</a>
  </div>
  <div class="breadcrumb-item active">
    Current Page
  </div>
</nav>
```

---

## API Documentation

Complete API documentation components for building readable API docs.

### API Endpoint

```html
<div class="api-endpoint">
  <div style="display: flex; align-items: center; margin-bottom: 1rem;">
    <span class="api-method get">GET</span>
    <code class="api-path">/api/v1/units</code>
  </div>
  <p class="api-description">
    Retrieve a list of all available units.
  </p>
  
  <div class="api-params">
    <h4 style="color: var(--accent);">Query Parameters</h4>
    <div class="api-param">
      <span class="api-param-name">element</span>
      <span class="api-param-type">string</span>
      <span class="api-param-required">optional</span>
      <p class="api-param-description">Filter by element type</p>
    </div>
  </div>
  
  <div class="api-response">
    <div class="api-response-title">Response (200 OK)</div>
    <pre class="api-response-code">{
  "data": [...]
}</pre>
  </div>
</div>
```

**API Method Badges:**
- `.api-method.get` - GET requests (blue)
- `.api-method.post` - POST requests (green)
- `.api-method.put` - PUT requests (yellow)
- `.api-method.delete` - DELETE requests (red)
- `.api-method.patch` - PATCH requests (purple)

---

## Nikke Components

Game-specific components for Nikke applications. See [NIKKE_COMPONENTS.md](./NIKKE_COMPONENTS.md) for complete documentation.

### Element Badges

```html
<span class="element-badge element-water">Water</span>
<span class="element-badge element-wind">Wind</span>
<span class="element-badge element-iron">Iron</span>
<span class="element-badge element-electric">Electric</span>
<span class="element-badge element-fire">Fire</span>

<!-- Solid variant -->
<span class="element-badge solid element-fire">Fire</span>

<!-- Outline variant -->
<span class="element-badge outline element-water">Water</span>
```

### Element Pills

```html
<div class="element-pills">
  <button class="element-pill water">Water</button>
  <button class="element-pill wind active">Wind</button>
  <button class="element-pill iron">Iron</button>
  <button class="element-pill electric">Electric</button>
  <button class="element-pill fire">Fire</button>
</div>
```

### Team Position Cards

```html
<div class="team-position-cards">
  <div class="position-card filled">
    <div class="position-header">
      <span class="position-number">1</span>
      <span class="position-label">Front Left</span>
    </div>
    <div class="position-content">
      <div class="unit-display">
        <div class="unit-name">Scarlet Priest Abe</div>
      </div>
      <button class="remove-unit" aria-label="Remove unit">×</button>
    </div>
  </div>
  <!-- Repeat for positions 2-5 -->
</div>
```

**States:**
- `.position-card` - Empty slot
- `.position-card.filled` - Unit assigned
- `.position-card.selected` - Currently selected

### Unit Selection

```html
<div class="available-units">
  <button class="unit-btn">Scarlet Priest Abe</button>
  <button class="unit-btn selected">Soldier A Rapi</button>
  <button class="unit-btn" disabled>Disabled Unit</button>
</div>
```

---

## Background & Images

### Background Image with Overlay

```html
<div class="bg-image" style="background-image: url('image.jpg'); min-height: 400px;">
  <div class="glass-card" style="padding: 2rem;">
    <h3>Content Over Image</h3>
    <p>This content is displayed over a background image with automatic overlay.</p>
  </div>
</div>
```

### Background Overlay Utilities

```html
<!-- Light overlay -->
<div class="bg-overlay bg-overlay-light" style="background-image: url('image.jpg');">
  <h3>Content with light overlay</h3>
</div>

<!-- Dark overlay -->
<div class="bg-overlay bg-overlay-dark" style="background-image: url('image.jpg');">
  <h3>Content with dark overlay</h3>
</div>
```

---

## Component Combinations

### Complete Form Example

```html
<div class="glass-card" style="padding: 2rem;">
  <h2>Contact Form</h2>
  <form>
    <label for="name">Name</label>
    <input type="text" id="name" class="glass-input" required>
    
    <label for="email">Email</label>
    <input type="email" id="email" class="glass-input" required>
    
    <label for="message">Message</label>
    <textarea id="message" class="glass-input" rows="4"></textarea>
    
    <button type="submit" class="glass-button">Submit</button>
  </form>
</div>
```

### Dashboard Card Example

```html
<div class="card">
  <div class="flex-between mb-md">
    <h3>Statistics</h3>
    <span class="badge success">Active</span>
  </div>
  <div class="progress">
    <div class="progress-bar" style="width: 75%;">75%</div>
  </div>
  <div class="flex-between mt-md">
    <span class="text-secondary">Progress</span>
    <button class="btn sm">View Details</button>
  </div>
</div>
```

### API Documentation Page

```html
<div class="api-endpoint">
  <div style="display: flex; align-items: center;">
    <span class="api-method get">GET</span>
    <code class="api-path">/api/v1/endpoint</code>
  </div>
  <p class="api-description">Endpoint description</p>
  <!-- Parameters and response -->
</div>
```

---

## Responsive Design

All components are fully responsive and adapt to different screen sizes:

- **Desktop (1024px+)**: Full layout with all features
- **Tablet (768px-1023px)**: Adjusted spacing and grid columns
- **Mobile (<768px)**: Stacked layouts, simplified navigation

---

## Browser Support

- Chrome/Edge 76+
- Firefox 55+
- Safari 9+
- Mobile browsers (iOS 13+, Android 10+)

**Note:** CSS Variables and `backdrop-filter` require modern browser support. Older browsers will see graceful fallbacks.

---

## Accessibility

All components follow accessibility best practices:

- Semantic HTML elements
- ARIA labels where needed
- Keyboard navigation support
- Focus indicators
- WCAG AA color contrast ratios
- Reduced motion support

---

## Customization

All components use CSS variables for easy customization. See [VARIABLES_REFERENCE.md](./VARIABLES_REFERENCE.md) for complete variable list.

```css
:root {
  --accent: #your-color;
  --glass: rgba(20, 12, 40, 0.7);
  --text: #your-text-color;
}
```

---

## Related Documentation

- [VARIABLES_REFERENCE.md](./VARIABLES_REFERENCE.md) - Complete CSS variables reference
- [NIKKE_COMPONENTS.md](./NIKKE_COMPONENTS.md) - Nikke-specific components
- [CUSTOMIZATION.md](./CUSTOMIZATION.md) - Customization guide
- [ACCESSIBILITY.md](./ACCESSIBILITY.md) - Accessibility standards

---

**Last Updated:** 2025-11-24  
**Version:** 1.0  
**Status:** Complete and Production Ready

