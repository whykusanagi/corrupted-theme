# Nikke Elements - Quick Reference

Fast lookup for Nikke game elements and their styling in Corrupted Theme.

## Element Colors

| Element | Color | Hex | Variable | Usage |
|---------|-------|-----|----------|-------|
| **Water** | 🟦 Blue | `#0066cc` | `--nikke-element-water` | Boss weakness, unit type |
| **Wind** | 🟩 Green | `#22c55e` | `--nikke-element-wind` | Boss weakness, unit type |
| **Iron** | 🟨 Orange | `#f59e0b` | `--nikke-element-iron` | Boss weakness, unit type |
| **Electric** | 🟪 Purple | `#a855f7` | `--nikke-element-electric` | Boss weakness, unit type |
| **Fire** | 🟥 Red | `#ef4444` | `--nikke-element-fire` | Boss weakness, unit type |

---

## Common Patterns

### Display Boss Weakness
```html
<span class="element-badge solid element-fire">Fire</span>
```

### Display Unit Element Type
```html
<span class="element-badge element-electric">Electric</span>
```

### Interactive Selection
```html
<button class="element-pill water">Water</button>
<button class="element-pill fire active">Fire</button>
```

### Subtle Badge
```html
<span class="element-badge outline element-iron">Iron</span>
```

---

## Component Classes

### Badges
- `.element-badge` - Base badge
- `.element-badge.solid` - Prominent display
- `.element-badge.outline` - Subtle display
- `.element-water` / `.element-wind` / `.element-iron` / `.element-electric` / `.element-fire`

### Pills (Buttons)
- `.element-pill` - Base pill
- `.element-pill.active` - Selected state
- `.element-water` / `.element-wind` / `.element-iron` / `.element-electric` / `.element-fire`

### Team Composition
- `.team-position-cards` - Grid container (5 units)
- `.position-card` - Individual card
- `.position-card.filled` - Unit assigned
- `.position-card.selected` - Highlighted
- `.position-header` - Title bar
- `.position-number` - Position indicator
- `.unit-name` - Unit display
- `.remove-unit` - Delete button

### Unit Selection
- `.available-units` - List container
- `.unit-btn` - Selection button
- `.unit-btn.selected` - Selected state

---

## Quick Copy-Paste Examples

### All Elements as Badges
```html
<span class="element-badge element-water">Water</span>
<span class="element-badge element-wind">Wind</span>
<span class="element-badge element-iron">Iron</span>
<span class="element-badge element-electric">Electric</span>
<span class="element-badge element-fire">Fire</span>
```

### All Elements as Pills
```html
<div class="element-pills">
  <button class="element-pill water">Water</button>
  <button class="element-pill wind">Wind</button>
  <button class="element-pill iron">Iron</button>
  <button class="element-pill electric">Electric</button>
  <button class="element-pill fire">Fire</button>
</div>
```

### Team Grid (Empty)
```html
<div class="team-position-cards">
  <div class="position-card">
    <div class="position-header">
      <span class="position-number">1</span>
      <span class="position-label">Front Left</span>
    </div>
    <div class="position-content">
      <div class="empty-slot">Empty Slot</div>
    </div>
  </div>
  <!-- Repeat for positions 2-5 -->
</div>
```

### Team Grid (Filled)
```html
<div class="team-position-cards">
  <div class="position-card filled">
    <div class="position-header">
      <span class="position-number">1</span>
      <span class="position-label">Front Left</span>
    </div>
    <div class="position-content">
      <div class="unit-name">Unit Name</div>
      <button class="remove-unit">×</button>
    </div>
  </div>
</div>
```

---

## CSS Variables

Override element colors globally:

```css
:root {
  --nikke-element-water: #0066cc;
  --nikke-element-wind: #22c55e;
  --nikke-element-iron: #f59e0b;
  --nikke-element-electric: #a855f7;
  --nikke-element-fire: #ef4444;
}
```

---

## States

### Badge States
- Outlined (default): Colored border, light background
- Solid: Colored background, white text
- Outline: Transparent background, colored border

### Pill States
- Normal: Outlined style
- Hover: Light background fill
- Active: Solid background, white text

### Card States
- Empty: Gray border, empty text
- Filled: Green border, unit name displayed
- Selected: Pink border, highlighted

---

## Real-World Examples

### Boss Info Card
```html
<div class="card">
  <h3>Phantom Gloom</h3>
  <p>
    Weakness:
    <span class="element-badge solid element-fire">Fire</span>
  </p>
</div>
```

### Unit Listing
```html
<div class="unit-card">
  <h5>Scarlet Priest Abe</h5>
  <span class="element-badge element-electric">Electric</span>
  <p>Fire Damage Dealer</p>
</div>
```

### Team Builder
```html
<div class="element-pills">
  <button class="element-pill fire active">Select by Fire weakness</button>
</div>

<div class="available-units">
  <button class="unit-btn">Soldier A Rapi</button>
  <button class="unit-btn selected">Scarlet Priest Abe</button>
</div>

<div class="team-position-cards">
  <!-- Team grid here -->
</div>
```

---

## Live Example

See `/examples/nikke-team-builder.html` for a complete working implementation.

---

## For More Details

- Full documentation: `docs/NIKKE_COMPONENTS.md`
- CSS implementation: `src/css/nikke-utilities.css`
- Live example: `examples/nikke-team-builder.html`
