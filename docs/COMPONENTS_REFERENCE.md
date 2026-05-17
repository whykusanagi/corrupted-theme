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
   - [Modals](#modals) | [Tooltips](#tooltips) | [Dropdowns](#dropdowns) | [Tabs](#tabs) | [Collapse](#collapse) | [Carousel](#carousel)
4. [Lifecycle Management](#lifecycle-management)
5. [Data Display](#data-display)
6. [Navigation](#navigation)
7. [API Documentation](#api-documentation)
8. [Nikke Components](#nikke-components)
9. [Background & Images](#background--images)
10. [Extension Components](#extension-components)
    - [Gallery System](#gallery-system)
    - [Lightbox](#lightbox)
    - [NSFW Content Blur](#nsfw-content-blur)
    - [Social Links List](#social-links-list)
    - [Countdown Widget](#countdown-widget)
11. [JavaScript Corruption Components](#javascript-corruption-components)
    - [CorruptedText](#corruptedtext) | [CorruptedParticles](#corruptedparticles) | [CorruptedVortex](#corruptedvortex) | [Character Corruption](#character-corruption) | [Corruption Loading Screen](#corruption-loading-screen)

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

All interactive components support **data-attribute initialization** via `data-ct-*` attributes and **programmatic control** via JS imports. Import the components module:

```javascript
import { openModal, closeModal, destroyComponents } from '@whykusanagi/corrupted-theme/components-js';
```

### Modals

```html
<!-- Trigger via data attribute -->
<button class="btn" data-ct-toggle="modal" data-ct-target="#my-modal">Open Modal</button>

<!-- Modal overlay -->
<div class="modal-overlay" id="my-modal">
  <div class="modal">
    <div class="modal-header">
      <h3 class="modal-title">Modal Title</h3>
      <button class="modal-close">&times;</button>
    </div>
    <div class="modal-body">
      <p>Modal content goes here</p>
    </div>
    <div class="modal-footer">
      <button class="btn secondary" data-ct-toggle="modal" data-ct-target="#my-modal">Cancel</button>
      <button class="btn">Confirm</button>
    </div>
  </div>
</div>
```

**Features:**
- Close button (`.modal-close`) auto-wired
- Click overlay background to close
- Escape key closes active modals
- Body scroll lock while open
- Custom events: `modal:open`, `modal:close`

**Programmatic API:**
```javascript
openModal('#my-modal');
closeModal('#my-modal');
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
  <button class="dropdown-toggle" data-ct-toggle="dropdown">
    Dropdown
  </button>
  <div class="dropdown-menu">
    <a href="#" class="dropdown-item">Action 1</a>
    <a href="#" class="dropdown-item">Action 2</a>
    <div class="dropdown-divider"></div>
    <a href="#" class="dropdown-item">Separated Action</a>
  </div>
</div>
```

**Features:**
- Click toggle to open/close
- Click outside to close
- Multiple dropdowns don't conflict

### Tabs

```html
<div class="tabs">
  <button class="tab active" data-ct-target="#panel-1">Tab 1</button>
  <button class="tab" data-ct-target="#panel-2">Tab 2</button>
</div>

<div id="panel-1" class="tab-content active">Tab 1 content</div>
<div id="panel-2" class="tab-content">Tab 2 content</div>
```

### Collapse

```html
<button class="btn" data-ct-toggle="collapse" data-ct-target="#details">
  Toggle Details
</button>
<div class="collapse" id="details">
  <p>Collapsible content here.</p>
</div>
```

### Carousel

```html
<div class="carousel" data-ct-autoplay data-ct-interval="5000">
  <div class="carousel-inner">
    <div class="carousel-slide active">
      <img src="slide1.jpg" alt="Slide 1">
    </div>
    <div class="carousel-slide">
      <img src="slide2.jpg" alt="Slide 2">
    </div>
    <div class="carousel-slide">
      <img src="slide3.jpg" alt="Slide 3">
    </div>
  </div>
</div>
```

**Programmatic API:**
```javascript
import { initCarousel } from '@whykusanagi/corrupted-theme/carousel';

const carousel = initCarousel('.carousel', {
  autoplay: true,
  interval: 5000,
  indicators: true,
  controls: true,
  keyboard: true,
  touch: true,
  pauseOnHover: true
});

carousel.next();
carousel.prev();
carousel.goTo(2);
carousel.destroy();
```

**Features:**
- Autoplay with pause on hover
- Prev/next controls (glassmorphic)
- Dot indicators
- Touch/swipe support
- Keyboard navigation (arrow keys)

---

## Lifecycle Management

All JS-driven components support proper initialization and teardown.

### Init / Destroy Pattern

```javascript
import { initGallery, destroyGallery } from '@whykusanagi/corrupted-theme/gallery';
import { initCarousel, destroyCarousel } from '@whykusanagi/corrupted-theme/carousel';
import { destroyComponents } from '@whykusanagi/corrupted-theme/components-js';

// Components auto-initialize on DOMContentLoaded when data-ct-* attributes
// are present. For manual control:
const gallery = initGallery('#my-gallery');
const carousel = initCarousel('.my-carousel', { autoplay: true });

// Tear down individual components
gallery.destroy();
carousel.destroy();

// Or tear down all component managers at once
destroyComponents();
```

### Multi-Instance Support

Gallery and Carousel support multiple independent instances on the same page:

```javascript
const gallery1 = initGallery('#gallery-1');
const gallery2 = initGallery('#gallery-2');
// Each has independent filters, lightbox, and state

gallery1.destroy(); // Only destroys gallery1
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

Game-specific components for Nikke applications.

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

All components use CSS variables for easy customization. See `src/css/variables.css` for the complete variable list.

```css
:root {
  --accent: #your-color;
  --glass: rgba(20, 12, 40, 0.7);
  --text: #your-text-color;
}
```

---

## Extension Components

Production-tested components from whykusanagi.xyz for galleries, social links, countdowns, and more. Import via `extensions.css` (included in `theme.css`) or individually.

### Gallery System

Responsive gallery grid with filtering and lightbox integration.

**Filter Bar:**
```html
<div class="filter-bar">
  <button class="filter-btn active" data-filter="all">All</button>
  <button class="filter-btn" data-filter="photos">Photos</button>
  <button class="filter-btn" data-filter="art">Art</button>
</div>
```

**Gallery Container:**
```html
<div class="gallery-container" id="my-gallery">
  <div class="gallery-item" data-tags="photos">
    <img src="image.jpg" alt="Description">
    <div class="gallery-caption">
      <div class="title">Image Title</div>
      <div class="meta">Category • Date</div>
    </div>
  </div>
</div>
```

**Variants:**
- `.gallery-container.compact` - Smaller grid items (200px min)
- `.gallery-container.large` - Larger grid items (350px min)
- `.gallery-item.square` - 1:1 aspect ratio
- `.gallery-item.portrait` - 3:4 aspect ratio
- `.gallery-item.landscape` - 16:9 aspect ratio
- `.filter-bar.left` - Left-aligned filters
- `.filter-bar.right` - Right-aligned filters

**JavaScript Integration:**
```javascript
import { initGallery } from '@whykusanagi/corrupted-theme/gallery';

const gallery = initGallery('#my-gallery', {
  filterBarSelector: '.filter-bar .filter-btn',
  enableLightbox: true,
  enableNsfw: true,
  filterAnimation: true,
  onFilter: (filter) => console.log('Filtered:', filter)
});

// Manual filter
gallery.filter('photos');
```

---

### Lightbox

Fullscreen image viewer with keyboard navigation and touch gestures.

```html
<!-- Lightbox is auto-created by gallery.js -->
<!-- Manual creation (if needed): -->
<div class="lightbox" id="my-lightbox">
  <button class="lightbox-close">&times;</button>
  <button class="lightbox-prev"><i class="fas fa-chevron-left"></i></button>
  <img class="lightbox-image" src="" alt="">
  <button class="lightbox-next"><i class="fas fa-chevron-right"></i></button>
  <div class="lightbox-caption"></div>
  <div class="lightbox-counter"></div>
</div>
```

**Features:**
- Keyboard navigation (Arrow keys, Escape)
- Touch swipe gestures on mobile
- Click outside to close
- Image counter display
- Automatic caption display

**JavaScript API:**
```javascript
const gallery = initGallery('#gallery');

// Open specific image
gallery.openLightbox(0);

// Close lightbox
gallery.closeLightbox();
```

---

### NSFW Content Blur

Content warning overlay with click-to-reveal functionality.

```html
<!-- Default warning text -->
<div class="gallery-item nsfw-content">
  <img src="sensitive-image.jpg" alt="Description">
</div>

<!-- Custom warning text -->
<div class="gallery-item nsfw-content" data-warning="Sensitive Content">
  <img src="image.jpg" alt="Description">
</div>
```

**States:**
- Default: Blurred with "18+ Click to View" overlay
- `.revealed`: Blur removed, overlay hidden

**JavaScript API:**
```javascript
const gallery = initGallery('#gallery', {
  enableNsfw: true,
  nsfwWarning: 'Click to View',
  onNsfwReveal: (element) => console.log('Revealed:', element)
});

// Manual reveal
gallery.revealNsfw(element);
```

---

### Social Links List

Link-in-bio style layout for social profiles.

```html
<div class="social-links-container">
  <img src="avatar.jpg" alt="Profile" class="profile-avatar">
  <h1 class="profile-name">@username</h1>
  <p class="profile-bio">Your bio text here.</p>
  
  <div class="link-list">
    <!-- Platform-specific hover colors -->
    <a href="#" class="link-item twitter">
      <i class="fab fa-twitter"></i> Twitter
    </a>
    <a href="#" class="link-item instagram">
      <i class="fab fa-instagram"></i> Instagram
    </a>
    <a href="#" class="link-item youtube">
      <i class="fab fa-youtube"></i> YouTube
    </a>
    <a href="#" class="link-item github">
      <i class="fab fa-github"></i> GitHub
    </a>
    <a href="#" class="link-item discord">
      <i class="fab fa-discord"></i> Discord
    </a>
    <a href="#" class="link-item twitch">
      <i class="fab fa-twitch"></i> Twitch
    </a>
    <!-- Default accent color -->
    <a href="#" class="link-item">
      <i class="fas fa-globe"></i> Website
    </a>
  </div>
</div>
```

**Avatar Sizes:**
- `.profile-avatar.sm` - 100px diameter
- `.profile-avatar` - 140px diameter (default)
- `.profile-avatar.lg` - 180px diameter

**Platform Classes:**
Each platform class applies branded hover colors:
- `.twitter` - Twitter blue
- `.instagram` - Instagram gradient
- `.youtube` - YouTube red
- `.github` - GitHub dark
- `.discord` - Discord purple
- `.twitch` - Twitch purple

---

### Countdown Widget

Event countdown with configurable shapes and animations.

**HTML Container:**
```html
<div id="countdown-widget"></div>
```

**JavaScript Initialization:**
```javascript
import { initCountdown } from '@whykusanagi/corrupted-theme/countdown';

// Inline configuration
initCountdown({
  config: {
    title: 'Product Launch',
    eventDate: '2025-04-01T00:00:00-07:00',
    completedMessage: 'Now Available!',
    character: {
      image: 'character.png',
      rotation: 0,
      background: {
        type: 'diamond',
        color: 'radial-gradient(circle, rgba(54, 83, 161, 0.6), rgba(217, 79, 144, 0.6))',
        borderColor: '#4c2967'
      },
      overlay: {
        image: 'overlay.png',
        position: 'behind',
        animation: 'float'
      }
    },
    popup: {
      message: '<strong>Pre-order now!</strong>',
      frequency: 15000,
      duration: 5000
    }
  }
});

// Or load from JSON via URL parameter
// Access: page.html?event=kirara loads /data/countdown/kirara.json
initCountdown();
```

**Shape Types:**
- `diamond` - Rotated square (default)
- `circle` - Round container
- `heart` - Heart shape
- `star` - 5-point star
- `hexagon` - 6-sided polygon
- `octagon` - 8-sided polygon

**Configuration Schema:**
```javascript
{
  title: string,              // Display title
  eventDate: string,          // ISO 8601 date
  completedMessage: string,   // Message when countdown ends
  character: {
    image: string,            // Image URL
    rotation: number,         // Degrees (0-360)
    objectPosition: string,   // CSS object-position
    background: {
      type: string,           // Shape type
      color: string,          // CSS background
      borderColor: string     // Hex color
    },
    overlay: {
      image: string,          // Overlay image URL
      position: 'behind'|'front',
      animation: 'float'|null,
      rotation: number
    }
  },
  popup: {
    message: string,          // HTML content
    frequency: number,        // Ms between popups
    duration: number,         // Ms popup visible
    colors: {
      bg: string,
      border: string,
      text: string
    }
  }
}
```

**CSS Classes:**
- `.countdown-container` - Main wrapper (600×600px)
- `.shape-container` - Shape wrapper (375×375px)
- `.shape-container.diamond|circle|heart|star|hexagon|octagon`
- `.countdown-box` - Timer display
- `.countdown-popup` - Popup message
- `.countdown-character` - Character image
- `.countdown-overlay-wrapper` - Overlay container

---

## JavaScript Corruption Components

Full API reference for all JavaScript corruption modules. All canvas-based components (CorruptedParticles, CorruptedVortex) auto-start on construction and use `ResizeObserver` + `IntersectionObserver` for responsive sizing and visibility-based lifecycle.

### CorruptedText

Multi-language glitch animation that cycles through character variants with corruption effects.

**Source:** `src/lib/corrupted-text.js`
**Demo:** `examples/basic/corrupted-text.html`
**Import:** `@whykusanagi/corrupted-theme/corrupted-text`

```js
const ct = new CorruptedText(element, options);
```

**Constructor Options:**

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `duration` | number | `3000` | Total animation duration (ms) |
| `cycleDelay` | number | `100` | Delay between character corruption steps (ms) |
| `startDelay` | number | `0` | Initial delay before animation starts (ms) |
| `loop` | boolean | `true` | Loop animation or settle on final text |
| `finalText` | string\|null | `null` | Text to settle on when not looping (null = english variant) |

**Data Attributes** (read from element):

| Attribute | Description |
|-----------|-------------|
| `data-english` | English text (defaults to `element.textContent`) |
| `data-romaji` | Romaji (romanized Japanese) |
| `data-hiragana` | Hiragana text |
| `data-katakana` | Katakana text |
| `data-kanji` | Kanji text |

**Methods:**

| Method | Description |
|--------|-------------|
| `start()` | Begin animation (no-op if already running) |
| `stop()` | Pause animation and clear all timers |
| `animate()` | Cycle to next text variant with corruption effect |
| `corruptToText(targetText, callback)` | Corrupt display to target text over 20 steps |
| `restart()` | Reset to first variant and restart animation |
| `settle(finalText)` | Stop and settle to final text with corruption transition |
| `destroy()` | Cleanup and remove element reference |

**Auto-Initialization:**

```js
import { initCorruptedText } from '@whykusanagi/corrupted-theme/corrupted-text';
initCorruptedText(); // inits all .corrupted-multilang elements
```

Also auto-called on `DOMContentLoaded`.

---

### CorruptedParticles

Canvas 2D floating Japanese phrase background with three depth layers, mouse interaction, and connection lines.

**Source:** `src/lib/corrupted-particles.js`
**Demo:** `examples/advanced/particles-bg.html`
**Import:** `@whykusanagi/corrupted-theme/corrupted-particles`

```js
const particles = new CorruptedParticles(canvas, options);
```

**Constructor Options:**

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `count` | number | `60` | Number of particles to render |
| `speed` | number | `1.0` | Global speed multiplier for particle movement |
| `lineDistance` | number | `150` | Max distance between particles for connection lines (px) |
| `includeLewd` | boolean | `false` | Enable 18+ phrase mode (logs console warning) |

> **Deprecated option:** `includeLewd` is a deprecated alias for `nsfw`. It is forwarded automatically with a one-time console warning. Removed in 0.3.0 — migrate to `nsfw: true` instead.

**Methods:**

| Method | Description |
|--------|-------------|
| `init()` | Initialize animation system, event listeners, observers (called automatically) |
| `start()` | Begin animation loop via `requestAnimationFrame` |
| `stop()` | Pause animation (preserves state) |
| `destroy()` | Full teardown: remove listeners, clear particles, disconnect observers |

**Properties:**

| Property | Type | Description |
|----------|------|-------------|
| `canvas` | HTMLCanvasElement | Reference to canvas element |
| `ctx` | CanvasRenderingContext2D | Canvas rendering context |
| `particles` | Array | Currently active particle objects |
| `mouse` | Object | `{x, y}` cursor position (updated on mousemove) |

**Behaviors:**
- Hover: particles repel from cursor
- Click: burst of 6 particles at click location
- Three depth layers with different speeds and opacity
- Auto-starts/stops based on viewport intersection
- Adjusts particle count for mobile viewports

---

### CorruptedVortex

WebGL1 raymarched black hole accretion disk shader with corona and depth-driven color cycling.

**Source:** `src/lib/corrupted-vortex.js`
**Demo:** `examples/advanced/glsl-vortex.html`
**Import:** `@whykusanagi/corrupted-theme/corrupted-vortex`

```js
const vortex = new CorruptedVortex(canvas, options);
```

**Constructor Options:**

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `speed` | number | `1.0` | Animation speed multiplier |
| `intensity` | number | `1.0` | Brightness/glow intensity multiplier |
| `rotationRate` | number | `1.0` | Rotation speed of vortex spiral |
| `hue` | number\|null | `null` | `null` = quasar mode (depth-driven yellow→magenta), `0-1` = fixed hue |

**Methods:**

| Method | Description |
|--------|-------------|
| `init()` | Initialize WebGL context, compile shaders, set up buffer (called automatically) |
| `start()` | Begin render loop (throttled to ~30fps) |
| `stop()` | Pause rendering |
| `destroy()` | Delete GL program/buffer, disconnect observers |

**Properties:**

| Property | Type | Description |
|----------|------|-------------|
| `canvas` | HTMLCanvasElement | Reference to canvas element |
| `gl` | WebGLRenderingContext\|null | WebGL context (null if unsupported) |
| `program` | WebGLProgram | Compiled shader program |
| `options` | Object | Configuration (can be modified at runtime) |

**Notes:**
- Renders at half-resolution for GPU efficiency
- DPR capped at 2.0
- Falls back gracefully if WebGL unavailable

---

### Character Corruption

Auto-corruption module for replacing English characters with Japanese characters at configurable intensity levels.

**Source:** `src/lib/character-corruption.js`
**Import:** `@whykusanagi/corrupted-theme/character-corruption`

**Intensity Constants:**

| Constant | Value | Use Case |
|----------|-------|----------|
| `INTENSITY.NONE` | `0.0` | No corruption |
| `INTENSITY.MINIMAL` | `0.15` | Subtle effect |
| `INTENSITY.LOW` | `0.25` | Section headers |
| `INTENSITY.MEDIUM` | `0.35` | Dashboards (recommended) |
| `INTENSITY.HIGH` | `0.45` | Maximum readable |
| `INTENSITY.MAX_READABLE` | `0.45` | Alias for HIGH |

**Functions:**

| Function | Description |
|----------|-------------|
| `corruptTextJapanese(text, intensity?)` | Replace English chars with Japanese (50% Katakana, 25% Kanji, 15% Keep+Insert, 10% Hiragana). Default intensity: `0.3` |
| `corruptTextSemantic(text, context?, intensity?)` | Context-aware corruption (currently falls back to `corruptTextJapanese`) |
| `initAutoCorruption()` | Init all `.auto-corrupt` elements. Reads `data-text`, `data-intensity`, `data-interval`. Auto-called on `DOMContentLoaded` |
| `stopAutoCorruption(element)` | Stop re-corruption interval for a specific element |
| `restartAutoCorruption(element)` | Stop and restart corruption cycle for element |
| `destroyAllAutoCorruption()` | Stop all active corruption intervals |
| `createCorruptedElement(text, options?)` | Create new element with auto-corruption. Options: `intensity`, `interval`, `className`, `tag` |
| `getRandomPhrase(category, subcategory?)` | Random phrase from library. Categories: `loading`, `processing`, `analyzing`, `corrupting`, `watching`, `void`. Personality subcategories: `english`, `japanese`, `romaji` |

**Exported Objects:**

| Object | Description |
|--------|-------------|
| `CORRUPTION_PHRASES` | Technical UI phrases grouped by category |
| `PERSONALITY_PHRASES` | Personality/demon phrases in English, Japanese, Romaji |

---

### Corruption Loading Screen

Full-screen cinematic loading curtain with dramatic corruption animation.

**Source:** `src/lib/corruption-loading.js`

---

## Related Documentation

- [README.md](../README.md) - Main documentation and quick start guide
- [Variables Reference](#customization) - CSS variables for customization (see Customization section above)
- [Nikke Components](#nikke-components) - Game-specific components (see section above)

---

## CorruptionCharsets

**Module:** `@whykusanagi/corrupted-theme/corruption-charsets`
**Source:** `src/core/corruption-charsets.js`
**Type:** Static registry (plain object with getters)
**Since:** 0.2.0

Named registry over the canonical `src/data/charsets.json`. All getters read through to that JSON so updates to the data file are reflected automatically. Provides five named sets plus four computed convenience sets.

```js
import { CorruptionCharsets } from '@whykusanagi/corrupted-theme/corruption-charsets';

// Named sets (maps directly to charsets.json)
CorruptionCharsets.katakana;  // Full-width Katakana glyphs (primary corruption)
CorruptionCharsets.hiragana;  // Hiragana glyphs (softer corruption)
CorruptionCharsets.kanji;     // Kanji set (deep/heavy corruption, 0.2.0+)
CorruptionCharsets.symbols;   // Decorative symbols (★☆♥ etc.)
CorruptionCharsets.blocks;    // Block-drawing characters (█▓▒░ etc.)

// Computed convenience sets
CorruptionCharsets.standard;  // katakana + symbols  (matrix-style glitch)
CorruptionCharsets.soft;      // hiragana            (gentle / intimate degradation)
CorruptionCharsets.intense;   // kanji + blocks      (heavy data-loss look)
CorruptionCharsets.all;       // union of every set
```

**Available sets:** `katakana`, `hiragana`, `kanji`, `symbols`, `blocks`, `standard`, `soft`, `intense`, `all`.

All getters return a `string` — index directly with `Math.random()` or pass as `charset` to `CorruptionManager` / animation block options.

---

## CorruptionManager

**Module:** `@whykusanagi/corrupted-theme/corruption-manager`
**Source:** `src/core/corruption-manager.js`
**Since:** 0.2.0

Unified lifecycle runner for all three canonical corruption patterns defined in `CORRUPTED_THEME_SPEC.md`. Tracks every active timer via `TimerRegistry` so a single `stop()` / `destroy()` call cleans up everything. Auto-stops when `document.hidden` becomes `true` (Visibility API).

```js
import {
  CorruptionManager,
  decodeText,
  phraseFlicker,
  hybridDecode,
} from '@whykusanagi/corrupted-theme/corruption-manager';

const mgr = new CorruptionManager({ nsfw: false, charset: CorruptionCharsets.standard });

// Pattern 1 — character-by-character decode
const id1 = mgr.decode(el, 'SYSTEM READY', { duration: 2000 });

// Pattern 2 — phrase flickering
const id2 = mgr.flicker(el, ['アイウエオ', 'LOADING...', '██████'], { duration: 3000, finalText: '' });

// Pattern 3 — hybrid (flicker phase → decode phase)
const id3 = mgr.hybrid(el, ['CORRUPTION DETECTED'], 'SIGNAL RESTORED', { duration: 4000 });

mgr.cleanup(id1);   // cancel one animation early
mgr.stop();         // cancel all animations (Visibility API auto-calls this)
mgr.start();        // resume hook (intentional no-op — re-queue animations explicitly)
mgr.destroy();      // full teardown; instance not reusable after this
```

**Constructor Options:**

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `nsfw` | boolean | `false` | Include NSFW phrase pools when auto-generating default phrase lists |
| `charset` | string | `CorruptionCharsets.standard` | Default charset for decode/hybrid; overridable per call |

**Methods:**

| Method | Returns | Description |
|--------|---------|-------------|
| `decode(element, content, opts?)` | `number` | Start Pattern 1. `opts`: `duration` (ms), `charset` |
| `flicker(element, phrases, opts?)` | `number` | Start Pattern 2. `opts`: `duration`, `flickerInterval`, `finalText`, `nsfw` |
| `hybrid(element, phrases, content, opts?)` | `number` | Start Pattern 3. `opts`: `duration`, `charset`, `flickerInterval`, `nsfw` |
| `cleanup(id)` | `void` | Cancel one animation by its return ID |
| `stop()` | `void` | Cancel all active animations; element text preserved as-is |
| `start()` | `void` | No-op resume hook; re-queue animations explicitly |
| `destroy()` | `void` | stop() + remove Visibility listener + mark destroyed |
| `getActiveCount()` | `number` | Number of tracked animations (may include finished ones not yet auto-removed) |
| `isAnimating(id)` | `boolean` | Whether animation `id` is still running |
| `cleanupAll()` | `void` | **Deprecated** — alias for `stop()`. Removed in 0.3.x |

**Standalone one-shot exports** (no manager instance needed — each returns a cleanup `Function`):

| Export | Signature |
|--------|-----------|
| `decodeText` | `(element, finalText, opts?) → Function` |
| `phraseFlicker` | `(element, phrases, finalText, opts?) → Function` |
| `hybridDecode` | `(element, flickerPhrases, finalText, opts?) → Function` |

---

## CRTEffects

**Module:** `@whykusanagi/corrupted-theme/crt-effects`
**Source:** `src/lib/crt-effects.js`
**Since:** 0.2.0

CRT post-processing layer — scanlines, vignette, chromatic aberration, opacity flicker, pixel distortion, phosphor trail, RGB split animation, and screen shake. Ported from `celeste-tts-bot/obs/transitions/crt-effects.js`.

```js
import { CRTEffects, applyCRTGlow, injectCRTStyles } from '@whykusanagi/corrupted-theme/crt-effects';

const crt = new CRTEffects(containerEl, {
  autoStart:         false,
  scanlines:         true,
  vignette:          true,
  vignetteIntensity: 0.3,
  flicker:           false,
  flickerIntensity:  0.05,
  flickerFrequency:  100,
});

crt.start();    // attach overlay nodes; begin flicker if enabled
crt.stop();     // pause flicker; overlays remain
crt.destroy();  // full teardown: remove overlays, reset styles, mark destroyed

// Effect primitives (callable on the instance directly):
crt.createScanlines();
crt.applyChromaticAberration(el, intensity);  // default intensity: 2 (px offset)
crt.startFlicker(el, intensity, frequency);   // default: 0.05, 100ms
crt.stopFlicker(el);
crt.applyPixelDistortion(canvas);             // glitch-slice horizontal rows
crt.applyCRTGlow(el, color, intensity);       // phosphor glow via drop-shadow filter
crt.addPhosphorTrail(canvas, color);          // semi-transparent fill overlay
crt.applyVignette(el, intensity);             // radial-gradient overlay node
crt.animateRGBSplit(el, duration);            // rAF-driven RGB split (default 200ms)
crt.screenShake(el, duration, intensity);     // transform-shake (default 300ms, 5px)
crt.cleanup();                                // alias for destroy() — upstream compat
```

**Constructor Options:**

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `autoStart` | boolean | `false` | Call `start()` on construction |
| `scanlines` | boolean | `true` | Attach scanline overlay div |
| `vignette` | boolean | `true` | Attach vignette overlay div |
| `vignetteIntensity` | number | `0.3` | Vignette opacity at edges (0–1) |
| `flicker` | boolean | `false` | Enable opacity flicker loop |
| `flickerIntensity` | number | `0.05` | Max opacity reduction per flicker tick |
| `flickerFrequency` | number | `100` | Base interval in ms between flicker ticks |

**Standalone exports:**

| Export | Description |
|--------|-------------|
| `applyCRTGlow(el, color?, intensity?)` | Apply phosphor glow to any element without a CRTEffects instance. Default color: `#d94f90`, intensity: `20` |
| `injectCRTStyles()` | Inject `.crt-screen`, `.crt-phosphor-glow`, `.crt-text`, `.chromatic-aberration` rules. Called automatically by `start()` |

**CSS classes injected by `injectCRTStyles()`:**

| Class | Description |
|-------|-------------|
| `.crt-screen` | `position: relative; overflow: hidden; background: #000` |
| `.crt-phosphor-glow` | Multi-layer drop-shadow glow using spec colors |
| `.crt-text` | Monospace font + phosphor text-shadow + letter-spacing |
| `.chromatic-aberration` | CSS `::before`/`::after` pseudo red/cyan split (requires `data-text` attribute) |

---

## Animation Blocks

**Module:** `@whykusanagi/corrupted-theme/animation-blocks`
**Source:** `src/lib/animation-blocks.js`
**Since:** 0.2.0

Ten modular animation components that compose into full transition scenes. All classes share the same API contract:

```js
import {
  TitleDecoder, ProgressBar, ScanlineSweep, TerminalBoot, GlitchPulse,
  ASCIIBorder, SystemDiagnostic, LoadingBarMulti, DataTransmission, TerminalPrompt,
  playParallel, playSequence, playStaggered,
} from '@whykusanagi/corrupted-theme/animation-blocks';

const block = new ClassName(containerElement, options);
await block.start();   // returns Promise<void> that resolves when animation completes
block.play();          // alias for start() — backward compat with celeste-tts-bot
block.stop();          // cancel in-progress animation; leaves DOM in place
block.destroy();       // cancel + remove all DOM nodes created by this block
```

> **Note on `lewdMode`:** The `lewdMode` option is a deprecated alias for `nsfw`. It is forwarded with a one-time `console.warn` per class. Removed in 0.3.0 — use `nsfw: true` instead.

**Composition helpers:**

| Helper | Description |
|--------|-------------|
| `playParallel(blocks)` | Run all blocks concurrently; calls `destroy()` on each when all finish |
| `playSequence(blocks)` | Run blocks one after another; calls `destroy()` on each as it finishes |
| `playStaggered(blocks, staggerDelay?)` | Start each block `staggerDelay` ms after the previous (default: 200ms) |

### TitleDecoder

Character-by-character decode from corruption to readable text. Implements Canonical Pattern 1 (`CORRUPTED_THEME_SPEC.md §5.1`).

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `finalText` | string | `'SYSTEM READY'` | Target text to decode to |
| `duration` | number | `2000` | Animation duration in ms |
| `nsfw` | boolean | `false` | Use `CorruptionCharsets.all` instead of `standard` for the chaos buffer |
| `color` | string | `'#00ffff'` | Text and glow color |
| `fontSize` | string | `'48px'` | CSS font-size |

### ProgressBar

Horizontal loading bar with glitch flicker effect. Fills left-to-right over `duration`.

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `duration` | number | `2000` | Fill duration in ms |
| `color` | string | `'#00ffff'` | Bar and glow color |
| `height` | number | `4` | Bar height in px |
| `position` | string | `'bottom'` | `'top'` or `'bottom'` of container |
| `glitch` | boolean | `true` | Random magenta glow burst |

### ScanlineSweep

CRT-style horizontal scan line that sweeps top-to-bottom for `sweeps` passes over `duration`.

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `duration` | number | `1500` | Total animation duration in ms |
| `color` | string | `'#00ffff'` | Scan line color |
| `sweeps` | number | `2` | Number of vertical passes |

### TerminalBoot

Typewriter-style terminal boot log — reveals lines sequentially with a blinking cursor.

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `duration` | number | `3000` | Total duration in ms |
| `lines` | string[] | `['> INITIALIZING...', ...]` | Boot log lines |
| `color` | string | `'#00ffff'` | Text and glow color |
| `fontSize` | string | `'16px'` | CSS font-size |

### GlitchPulse

Full-screen corruption pulse — semi-transparent horizontal glitch bars flash at random positions.

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `duration` | number | `1000` | Pulse duration in ms |
| `intensity` | number | `0.5` | Max bar opacity |
| `color` | string | `'#ff00ff'` | Bar fill color |

### ASCIIBorder

Terminal-style box border built from Unicode box-drawing characters. Supports four border styles and three draw orders.

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `duration` | number | `1500` | Draw animation duration in ms |
| `color` | string | `'#ff8c00'` | Border and glow color |
| `style` | string | `'double'` | `'single'`, `'double'`, `'heavy'`, `'rounded'` |
| `padding` | number | `20` | Inset from container edges in px |
| `drawOrder` | string | `'clockwise'` | `'clockwise'`, `'simultaneous'`, `'corners-first'` |

**Static property:** `ASCIIBorder.CHARS` — object mapping style name → `{ h, v, tl, tr, br, bl }` character sets.

### SystemDiagnostic

Scrolling diagnostic log that fades in lines one at a time with an optional blinking cursor.

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `duration` | number | `3000` | Total duration in ms |
| `lines` | string[] | `['> INITIALIZING NEURAL CORE...', ...]` | Log lines |
| `color` | string | `'#00ff00'` | Text and glow color |
| `position` | string | `'left'` | `'left'`, `'right'`, `'center'` |
| `fontSize` | string | `'16px'` | CSS font-size |
| `scrollSpeed` | number | `1.0` | Line reveal speed multiplier (0.5 = slow, 2.0 = fast) |
| `showCursor` | boolean | `true` | Show blinking block cursor on active line |

### LoadingBarMulti

Multiple labelled loading bars with individual speeds, scanline shimmer, and optional glitch stutter.

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `duration` | number | `3000` | Base duration in ms |
| `bars` | Array | `[{ label, speed, color }, ...]` | Bar configs; defaults to 4 bars (NEURAL CORE, MEMORY BANKS, CORRUPTION MODULE, REALITY MATRIX) |
| `width` | number | `400` | Bar width in px |
| `height` | number | `20` | Bar height in px |
| `position` | string | `'center'` | `'center'`, `'top'`, `'bottom'` |
| `showPercentage` | boolean | `true` | Show `XX%` label inside each bar |
| `glitchEffect` | boolean | `true` | Random opacity flicker stutter |

Each bar config: `{ label: string, speed: number, color: string }` — `speed` multiplies base progress (e.g. `1.2` = finishes 20% faster than base).

### DataTransmission

Streaming data-packet animation — light pulses traverse the container horizontally or vertically with a live data-rate counter.

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `duration` | number | `2500` | Animation duration in ms |
| `color` | string | `'#00ffff'` | Packet and glow color |
| `direction` | string | `'horizontal'` | `'horizontal'` or `'vertical'` |
| `packetCount` | number | `20` | Number of simultaneous packets |
| `packetSize` | number | `6` | Packet cross-axis size in px |
| `showDataRate` | boolean | `true` | Display live `DATA RATE: X KB/s` counter |

### TerminalPrompt

Character-by-character typewriter of command strings with a blinking block cursor. Renders in a styled terminal-box overlay.

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `duration` | number | `2000` | Safety cap in ms (animation driven by `typingSpeed`) |
| `commands` | string[] | `['celeste@abyss:~$ sudo init neural_core', ...]` | Lines to type |
| `color` | string | `'#00ff00'` | Text and glow color |
| `position` | string | `'bottom-left'` | `'bottom-left'`, `'top-left'`, `'center'` |
| `fontSize` | string | `'16px'` | CSS font-size |
| `typingSpeed` | number | `50` | Ms per character |

---

## CorruptedParticlesBackground

**Module:** `@whykusanagi/corrupted-theme/corrupted-particles-background`
**Source:** `src/lib/corrupted-particles-background.js`
**Since:** 0.2.0

Auto-injects a `CorruptedParticles` canvas as a fixed full-viewport background layer behind a target element. Handles `DOMContentLoaded` timing, forces DPR=1 on the background canvas (the canvas sits behind `backdrop-filter: blur()` so retina resolution is invisible but costly), and pauses rendering on `document.hidden`.

```js
import { CorruptedParticlesBackground } from '@whykusanagi/corrupted-theme/corrupted-particles-background';

const bg = new CorruptedParticlesBackground({
  targetSelector: '.glass-backdrop',  // canvas inserted as sibling immediately before this element
  nsfw:           false,
  count:          25,
  speed:          0.5,
  lineDistance:   100,
  canvasId:       'particles-bg',
});

bg.start();    // resume after stop()
bg.stop();     // pause rendering (canvas stays in DOM)
bg.destroy();  // stop + remove canvas + remove listeners; instance not reusable
```

**Constructor Options:**

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `targetSelector` | string | `'.glass-backdrop'` | CSS selector for the element the canvas is inserted before |
| `nsfw` | boolean | `false` | Enable NSFW phrase mode (forwarded to CorruptedParticles) |
| `count` | number | `25` | Particle count (lower than `CorruptedParticles` default because the canvas sits behind blur) |
| `speed` | number | `0.5` | Particle speed multiplier |
| `lineDistance` | number | `100` | Max connection line distance in px |
| `canvasId` | string | `'particles-bg'` | `id` attribute on the injected `<canvas>` |

**Behavior notes:**
- Canvas is `position: fixed; inset: 0; z-index: 0` — it sits below page content but above most backgrounds.
- `window.devicePixelRatio` is temporarily shadowed to `1` during `CorruptedParticles` construction and immediately restored so other components (vortex, main canvas) use the real DPR.
- Constructor is safe to call before `DOMContentLoaded` — initialization is deferred automatically.
- Node.js / SSR: constructor is a no-op when `document` is undefined.

---

**Last Updated:** 2026-05-17
**Version:** 2.2
**Status:** Complete and Production Ready

