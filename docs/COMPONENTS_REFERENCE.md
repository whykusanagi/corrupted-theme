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

## Related Documentation

- [README.md](../README.md) - Main documentation and quick start guide
- [Variables Reference](#customization) - CSS variables for customization (see Customization section above)
- [Nikke Components](#nikke-components) - Game-specific components (see section above)

---

**Last Updated:** 2026-02-07
**Version:** 2.0
**Status:** Complete and Production Ready

