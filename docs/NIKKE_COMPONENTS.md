# Nikke Game-Specific Components

This documentation covers optional Nikke-specific utilities available in the Corrupted Theme. These components are designed for applications that feature Nikke game mechanics like elements, unit management, and team composition.

## Quick Start

```html
<!-- Import the nikke utilities -->
<link rel="stylesheet" href="path/to/corrupted-theme/src/css/nikke-utilities.css">
```

Or in npm:

```javascript
import '@whykusanagi/corrupted-theme/nikke-utilities';
```

## Nikke Element System

Nikke features five core elements with specific color associations:

| Element | Color | Hex Code | Use Case |
|---------|-------|----------|----------|
| **Water** | Blue | `#0066cc` | Boss weakness, unit type |
| **Wind** | Green | `#22c55e` | Boss weakness, unit type |
| **Iron** | Yellow/Orange | `#f59e0b` | Boss weakness, unit type |
| **Electric** | Purple | `#a855f7` | Boss weakness, unit type |
| **Fire** | Red | `#ef4444` | Boss weakness, unit type |

These colors are consistent across all element displays to help users quickly identify element types.

---

## Element Badges & Pills

### Basic Element Badge

Display elements with a consistent, recognizable style:

```html
<!-- Outlined badge (default) -->
<span class="element-badge element-water">Water</span>
<span class="element-badge element-wind">Wind</span>
<span class="element-badge element-iron">Iron</span>
<span class="element-badge element-electric">Electric</span>
<span class="element-badge element-fire">Fire</span>

<!-- Solid badge (prominent) -->
<span class="element-badge solid element-water">Water</span>
<span class="element-badge solid element-wind">Wind</span>
<span class="element-badge solid element-iron">Iron</span>
<span class="element-badge solid element-electric">Electric</span>
<span class="element-badge solid element-fire">Fire</span>

<!-- Outline only (subtle) -->
<span class="element-badge outline element-water">Water</span>
<span class="element-badge outline element-wind">Wind</span>
<span class="element-badge outline element-iron">Iron</span>
<span class="element-badge outline element-electric">Electric</span>
<span class="element-badge outline element-fire">Fire</span>
```

### Element Pills (Interactive Selection)

Use pills when users need to select or filter by element:

```html
<div class="element-pills">
  <button class="element-pill water">Water</button>
  <button class="element-pill wind">Wind</button>
  <button class="element-pill iron">Iron</button>
  <button class="element-pill electric">Electric</button>
  <button class="element-pill fire">Fire</button>
</div>
```

**Active State:**
```html
<div class="element-pills">
  <button class="element-pill water active">Water</button>
  <button class="element-pill wind">Wind</button>
  <!-- ... -->
</div>
```

### Use Cases

**Boss Weakness Display:**
```html
<!-- Show what element a boss is weak to -->
<div>
  <h4>Boss: Phantom Gloom</h4>
  <p>Weakness: <span class="element-badge solid element-fire">Fire</span></p>
</div>
```

**Unit Element Type:**
```html
<!-- Display a unit's element type -->
<div class="card">
  <h5>Scarlet Priest Abe</h5>
  <p>Element: <span class="element-badge element-electric">Electric</span></p>
</div>
```

**Element Filter:**
```html
<!-- Let users filter units/bosses by element -->
<div>
  <label>Filter by Element:</label>
  <div class="element-pills">
    <button class="element-pill water" onclick="filterByElement('water')">Water</button>
    <button class="element-pill wind" onclick="filterByElement('wind')">Wind</button>
    <button class="element-pill iron" onclick="filterByElement('iron')">Iron</button>
    <button class="element-pill electric" onclick="filterByElement('electric')">Electric</button>
    <button class="element-pill fire" onclick="filterByElement('fire')">Fire</button>
  </div>
</div>
```

---

## Team Position Cards

Display and manage a 5-unit team composition using position cards.

### Basic Team Grid

```html
<div class="team-position-cards">
  <div class="position-card">
    <div class="position-header">
      <span class="position-number">1</span>
      <span class="position-label">Front Left</span>
    </div>
    <div class="position-content">
      <div class="unit-display">
        <div class="unit-name">Scarlet Priest Abe</div>
      </div>
    </div>
  </div>

  <div class="position-card">
    <div class="position-header">
      <span class="position-number">2</span>
      <span class="position-label">Front Middle</span>
    </div>
    <div class="position-content">
      <div class="unit-display">
        <div class="unit-name">Soldier A Rapi</div>
      </div>
    </div>
  </div>

  <div class="position-card">
    <div class="position-header">
      <span class="position-number">3</span>
      <span class="position-label">Front Right</span>
    </div>
    <div class="position-content">
      <div class="unit-display">
        <div class="unit-name">Trap Lyudmila</div>
      </div>
    </div>
  </div>

  <div class="position-card">
    <div class="position-header">
      <span class="position-number">4</span>
      <span class="position-label">Back Left</span>
    </div>
    <div class="position-content">
      <div class="unit-display">
        <div class="unit-name">Fortress Maid Dolla</div>
      </div>
    </div>
  </div>

  <div class="position-card">
    <div class="position-header">
      <span class="position-number">5</span>
      <span class="position-label">Back Right</span>
    </div>
    <div class="position-content">
      <div class="unit-display">
        <div class="unit-name">Eggplant Helm</div>
      </div>
    </div>
  </div>
</div>
```

### Empty Position Cards

```html
<div class="position-card">
  <div class="position-header">
    <span class="position-number">1</span>
    <span class="position-label">Front Left</span>
  </div>
  <div class="position-content">
    <div class="unit-display">
      <div class="empty-slot">Empty Slot</div>
    </div>
  </div>
</div>
```

### Filled State (Unit Assigned)

```html
<!-- Add .filled class when a unit is in the slot -->
<div class="position-card filled">
  <div class="position-header">
    <span class="position-number">1</span>
    <span class="position-label">Front Left</span>
  </div>
  <div class="position-content">
    <div class="unit-display">
      <div class="unit-name">Scarlet Priest Abe</div>
    </div>
    <button class="remove-unit" onclick="removeUnit(1)" aria-label="Remove unit">×</button>
  </div>
</div>
```

### Selected State (Interactive)

```html
<!-- Add .selected class when user is interacting with this position -->
<div class="position-card selected">
  <div class="position-header">
    <span class="position-number">1</span>
    <span class="position-label">Front Left</span>
  </div>
  <div class="position-content">
    <div class="unit-display">
      <div class="unit-name">Scarlet Priest Abe</div>
    </div>
  </div>
</div>
```

---

## Unit Selection Buttons

Pill-style buttons for selecting units in lists.

### Basic Unit Buttons

```html
<div class="available-units">
  <button class="unit-btn">Scarlet Priest Abe</button>
  <button class="unit-btn">Soldier A Rapi</button>
  <button class="unit-btn">Trap Lyudmila</button>
  <button class="unit-btn">Fortress Maid Dolla</button>
  <button class="unit-btn">Eggplant Helm</button>
  <button class="unit-btn">Sniper Rapunzel</button>
</div>
```

### With Selection State

```html
<div class="available-units">
  <button class="unit-btn">Scarlet Priest Abe</button>
  <button class="unit-btn selected">Soldier A Rapi</button>
  <button class="unit-btn">Trap Lyudmila</button>
  <button class="unit-btn selected">Fortress Maid Dolla</button>
  <button class="unit-btn">Eggplant Helm</button>
</div>
```

### Disabled Units

```html
<div class="available-units">
  <button class="unit-btn">Scarlet Priest Abe</button>
  <button class="unit-btn" disabled>Soldier A Rapi (Already Selected)</button>
  <button class="unit-btn">Trap Lyudmila</button>
</div>
```

---

## Drag & Drop Feedback

Styling for drag-and-drop team composition builders.

### Dragging State

```html
<!-- Applied while user is dragging a unit -->
<div class="team-unit dragging">
  <div class="unit-name">Scarlet Priest Abe</div>
</div>
```

### Drop Zone

```html
<!-- Drop target for dragging units -->
<div class="drop-zone">
  <p>Drag units here to add them</p>
</div>

<!-- Drop zone with content -->
<div class="drop-zone has-units">
  <div class="team-unit">Scarlet Priest Abe</div>
</div>

<!-- Drop zone ready to receive -->
<div class="drop-zone drag-over">
  <p>Release to add unit</p>
</div>
```

---

## Complete Example: Team Builder

Here's a complete example combining multiple elements:

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Nikke Team Builder</title>
  <link rel="stylesheet" href="path/to/corrupted-theme/src/css/theme.css">
  <link rel="stylesheet" href="path/to/corrupted-theme/src/css/nikke-utilities.css">
</head>
<body>
  <div class="container-md">
    <h1>Team Builder</h1>

    <!-- Filter by Element -->
    <section class="mb-4">
      <h2>Filter by Boss Weakness</h2>
      <div class="element-pills">
        <button class="element-pill water" onclick="filterByElement('water')">Water</button>
        <button class="element-pill wind" onclick="filterByElement('wind')">Wind</button>
        <button class="element-pill iron" onclick="filterByElement('iron')">Iron</button>
        <button class="element-pill electric" onclick="filterByElement('electric')">Electric</button>
        <button class="element-pill fire" onclick="filterByElement('fire')">Fire</button>
      </div>
    </section>

    <!-- Available Units -->
    <section class="mb-4">
      <h2>Select Units</h2>
      <div class="available-units">
        <button class="unit-btn" onclick="selectUnit(this)">Scarlet Priest Abe</button>
        <button class="unit-btn" onclick="selectUnit(this)">Soldier A Rapi</button>
        <button class="unit-btn" onclick="selectUnit(this)">Trap Lyudmila</button>
        <button class="unit-btn" onclick="selectUnit(this)">Fortress Maid Dolla</button>
        <button class="unit-btn" onclick="selectUnit(this)">Eggplant Helm</button>
      </div>
    </section>

    <!-- Team Composition -->
    <section class="mb-4">
      <h2>Your Team</h2>
      <div class="team-position-cards">
        <div class="position-card">
          <div class="position-header">
            <span class="position-number">1</span>
            <span class="position-label">Front Left</span>
          </div>
          <div class="position-content">
            <div class="unit-display">
              <div class="empty-slot">Empty Slot</div>
            </div>
          </div>
        </div>
        <!-- Repeat for positions 2-5 -->
      </div>
    </section>

    <!-- Boss Info -->
    <section class="mb-4">
      <h2>Boss Info</h2>
      <div class="card">
        <h3>Phantom Gloom</h3>
        <p>Weakness: <span class="element-badge solid element-fire">Fire</span></p>
      </div>
    </section>
  </div>

  <script>
    function filterByElement(element) {
      // Filter units by selected element
    }

    function selectUnit(button) {
      button.classList.toggle('selected');
    }
  </script>
</body>
</html>
```

---

## CSS Variables Reference

The Nikke utilities use the following CSS variables:

```css
/* Element Colors */
--nikke-element-water: #0066cc;
--nikke-element-wind: #22c55e;
--nikke-element-iron: #f59e0b;
--nikke-element-electric: #a855f7;
--nikke-element-fire: #ef4444;

/* Element Backgrounds */
--nikke-element-water-bg: rgba(0, 102, 204, 0.15);
--nikke-element-wind-bg: rgba(34, 197, 94, 0.15);
--nikke-element-iron-bg: rgba(245, 158, 11, 0.15);
--nikke-element-electric-bg: rgba(168, 85, 247, 0.15);
--nikke-element-fire-bg: rgba(239, 68, 68, 0.15);
```

### Customizing Colors

Override element colors for your brand:

```html
<style>
  :root {
    /* Change element colors */
    --nikke-element-fire: #ff1744;
    --nikke-element-water: #0055bb;
    --nikke-element-electric: #7c3aed;
  }
</style>
<link rel="stylesheet" href="path/to/corrupted-theme/src/css/nikke-utilities.css">
```

---

## Responsive Behavior

All components are fully responsive:

- **Desktop (1024px+):** 5-column team grid
- **Tablet (768px-1023px):** 4-column team grid
- **Mobile (480px-767px):** 3-column team grid
- **Small Mobile (<480px):** 2-column team grid, full-width pills

---

## Accessibility

All components follow accessibility best practices:

- Semantic HTML elements
- ARIA labels for icon buttons
- Keyboard navigation support
- Focus indicators
- Clear color contrast
- No color-only information

---

## Browser Support

All Nikke utilities work in modern browsers that support:
- CSS Grid
- CSS Flexbox
- CSS Variables
- Backdrop-filter (with fallbacks)

Tested in:
- Chrome 76+
- Firefox 55+
- Safari 9.1+
- Edge 79+

---

## Need Help?

Refer to the main documentation:
- [COLOR_PALETTE.md](./COLOR_PALETTE.md) - Complete color system
- [CUSTOMIZATION.md](./CUSTOMIZATION.md) - Customization guide
- [ACCESSIBILITY.md](./ACCESSIBILITY.md) - Accessibility standards
- [INSTALLATION.md](./INSTALLATION.md) - Installation methods
