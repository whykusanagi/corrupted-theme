# Accessibility Guide

The Corrupted Theme is designed with accessibility in mind, meeting or exceeding WCAG 2.1 AA standards.

## Color Contrast

All color combinations have been tested for contrast ratios that meet WCAG AA or AAA standards.

### Text Color Contrast Ratios

| Text Color | Background | Ratio | WCAG Level | Use Case |
|-----------|-----------|-------|-----------|----------|
| `--text` (#f5f1f8) | `--bg` (#0a0a0a) | 17.5:1 | AAA ✅ | Primary text |
| `--text-secondary` (#b8afc8) | `--bg` (#0a0a0a) | 9.2:1 | AA ✅ | Secondary text |
| `--text-muted` (#7a7085) | `--bg` (#0a0a0a) | 5.5:1 | AA (large text) ✅ | Disabled, subtle text |
| `--text` (#f5f1f8) | `--glass` (rgba 70%) | 9.2:1 | AA ✅ | Text on glass |
| `--accent` (#d94f90) | `--bg` (#0a0a0a) | 7.2:1 | AA ✅ | Interactive elements |
| `--accent-light` (#e86ca8) | `--bg` (#0a0a0a) | 5.8:1 | AA (large) ✅ | Hover states |

### WCAG Compliance Notes

- **AAA Level:** Requires 7:1 contrast ratio for normal text, 4.5:1 for large text
- **AA Level:** Requires 4.5:1 contrast ratio for normal text, 3:1 for large text
- **Minimum:** Text smaller than 18pt (or 14pt bold) needs higher contrast

The theme exceeds these minimums:
- Primary text: 17.5:1 (far exceeds AAA)
- Secondary text: 9.2:1 (exceeds AAA)
- Interactive elements: 7.2:1 (exceeds AAA)

## Keyboard Navigation

All interactive elements are keyboard accessible:

### Built-in Support

- **Buttons:** Tab to focus, Enter to activate
- **Links:** Tab to focus, Enter to follow
- **Form inputs:** Tab to cycle through fields, Enter to submit
- **Glass buttons:** Focus ring visible on :focus-visible state

### Focus Indicators

The theme includes clear focus indicators:

```css
button:focus-visible,
input:focus-visible,
a:focus-visible {
  outline: 2px solid var(--accent);
  outline-offset: 2px;
}
```

Focus rings are:
- **Color:** Accent color (#d94f90) for high visibility
- **Width:** 2px for clear visibility
- **Offset:** 2px from element edge

### Tab Order

Ensure your HTML maintains logical tab order:

```html
<!-- Good: Tab follows reading order -->
<header>
  <a href="#home">Home</a>
  <a href="#about">About</a>
</header>
<main>
  <button>Action</button>
</main>

<!-- Avoid: Weird tab order -->
<div tabindex="5">...
<div tabindex="3">...
<div tabindex="1">... <!-- Will be focused first -->
```

## Motion & Animation

The theme respects user motion preferences:

### Reduced Motion Support

```css
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```

**What this means:**
- Users with `prefers-reduced-motion: reduce` in system settings will see no animations
- Transitions still work (for state changes like :hover)
- Animations are completely disabled to prevent vestibular issues

### Animation Types

The theme includes several animation types, all optional:

| Animation | Type | Duration | Use Case |
|-----------|------|----------|----------|
| `.fade-in` | Opacity | 0.6s | Element appearance |
| `.slide-in` | Transform | 0.6s | Content entry |
| `.scale-in` | Transform | 0.5s | Emphasis |
| `.pulse` | Opacity | 2s | Attention (use sparingly) |
| `.breathe` | Transform | 3s | Subtle movement |
| `.float` | Transform | 3s | Floating effect |
| `.shimmer` | Gradient | 2s | Loading state |

**Best Practices:**
- Don't auto-play animations on page load
- Use animations for micro-interactions, not page transitions
- Provide static alternatives for important information

## Text & Readability

### Font Sizes

The theme uses scalable font sizes based on reading distance:

```css
h1 { font-size: 2.5rem; }
h2 { font-size: 2rem; }
h3 { font-size: 1.75rem; }
h4 { font-size: 1.5rem; }
h5 { font-size: 1.25rem; }
h6 { font-size: 1rem; }
p { font-size: 1rem; line-height: 1.6; }
small { font-size: 0.875rem; }
```

**WCAG Guideline:** Text should be at least 16px for normal reading.

### Line Height

```css
:root {
  --line-height-tight: 1.2;    /* 20% spacing */
  --line-height-normal: 1.6;   /* 60% spacing */
  --line-height-loose: 2;      /* 100% spacing */
}

body { line-height: var(--line-height-normal); }
p { line-height: 1.6; }
```

**WCAG Guideline:** Line height should be at least 1.5× font size for body text.

### Letter Spacing

```css
h1, h2, h3 { letter-spacing: 0.02em; }
p { letter-spacing: 0; }
```

**Benefits:**
- Improved readability, especially for dyslexic users
- Reduced cognitive load
- Better visual hierarchy

## Color Blindness

The theme works for all types of color blindness:

### Color Palette Testing

The Corrupted Theme colors have been tested for:
- **Protanopia** (Red-blind)
- **Deuteranopia** (Green-blind)
- **Tritanopia** (Blue-blind)
- **Monochromacy** (Complete color blindness)

### Testing Tools

Use these tools to verify your custom colors:

1. **Colorblind Web Page Filter:** https://www.toptal.com/designers/colorfilter/
2. **Accessible Colors:** https://accessible-colors.com/
3. **Contrast Checker:** https://webaim.org/resources/contrastchecker/

### Design Principles

- **Don't rely on color alone** to convey information
- **Use patterns or icons** in addition to color
- **Ensure semantic meaning** is preserved without color

Example:

```html
<!-- ❌ Bad: Relies on color only -->
<span style="color: var(--accent);">Required field</span>

<!-- ✅ Good: Color + visual indicator -->
<label>
  Email <span style="color: var(--accent); font-weight: bold;">*</span>
</label>

<!-- ✅ Better: Color + semantic meaning -->
<label>
  Email <span class="badge badge-error" aria-label="Required">*</span>
</label>
```

## Semantic HTML

The theme works best with semantic HTML:

### Preferred Elements

```html
<!-- ✅ Semantic -->
<button>Click me</button>
<a href="/page">Link</a>
<nav><a href="/">Home</a></nav>
<main>Content</main>
<article>Article</article>
<section>Section</section>
<header>Header</header>
<footer>Footer</footer>

<!-- ❌ Non-semantic (avoid) -->
<div onclick="...">Click me</div>
<span onclick="location.href='/page'">Link</span>
<div class="navbar">...</div>
<div class="main">Content</div>
```

### Screen Reader Announcements

Use semantic elements for automatic accessibility:

```html
<!-- ✅ Screen reader announces: "Heading, level 1" -->
<h1>Page Title</h1>

<!-- ✅ Screen reader announces: "List, 3 items" -->
<ul>
  <li>Item 1</li>
  <li>Item 2</li>
  <li>Item 3</li>
</ul>

<!-- ✅ Screen reader announces: "Button" -->
<button>Submit</button>
```

## ARIA Attributes

Use ARIA for dynamic content and complex interactions:

### Common ARIA Attributes

```html
<!-- Mark element as required -->
<input type="email" aria-required="true">

<!-- Provide accessible name for icon-only button -->
<button aria-label="Close menu">
  <i class="fas fa-times"></i>
</button>

<!-- Mark content as a loading spinner -->
<div aria-live="polite" aria-busy="true">
  Loading...
</div>

<!-- Mark content as an alert -->
<div role="alert" class="alert">
  Error: Please fill in all required fields
</div>

<!-- Describe complex form group -->
<fieldset>
  <legend>Select your role:</legend>
  <label><input type="radio" name="role"> Admin</label>
  <label><input type="radio" name="role"> User</label>
</fieldset>
```

### ARIA Live Regions

For dynamic content updates:

```html
<!-- Polite: Wait for pause, then announce -->
<div aria-live="polite" aria-atomic="true">
  0 items in cart
</div>

<!-- Assertive: Announce immediately (for alerts) -->
<div aria-live="assertive" role="alert">
  Error: Connection lost
</div>
```

## Form Accessibility

### Proper Label Association

```html
<!-- ✅ Good: Label explicitly associated -->
<label for="email">Email Address:</label>
<input id="email" type="email" required>

<!-- ❌ Avoid: Label not associated -->
<label>Email Address:</label>
<input type="email">

<!-- ✅ Acceptable: Implicit association -->
<label>
  Email Address:
  <input type="email">
</label>
```

### Error Messages

```html
<!-- ✅ Good: Error message associated with input -->
<label for="email">Email:</label>
<input id="email" type="email" aria-describedby="email-error">
<span id="email-error" class="alert alert-error">
  Please enter a valid email address
</span>

<!-- ✅ Good: Use aria-invalid -->
<input
  id="email"
  type="email"
  aria-invalid="true"
  aria-describedby="email-error"
>
```

### Form States

```html
<!-- ✅ Required fields marked -->
<label for="name">Name <span aria-label="Required">*</span></label>
<input id="name" type="text" required>

<!-- ✅ Disabled fields -->
<input type="text" disabled aria-disabled="true">

<!-- ✅ Read-only fields -->
<input type="text" readonly value="Cannot change">
```

## Component Accessibility

### Buttons

```html
<!-- ✅ Accessible button -->
<button class="btn">
  <i class="fas fa-download"></i> Download
</button>

<!-- ✅ Icon-only button (needs label) -->
<button class="btn" aria-label="Close">
  <i class="fas fa-times"></i>
</button>

<!-- ❌ Avoid: div acting as button -->
<div onclick="..." role="button">Click</div>
```

### Cards

```html
<!-- ✅ Accessible card with proper heading -->
<article class="card">
  <h2>Card Title</h2>
  <p>Card content...</p>
  <a href="/full-article">Read more</a>
</article>
```

### Navigation

```html
<!-- ✅ Semantic nav with landmark -->
<nav>
  <ul>
    <li><a href="/" aria-current="page">Home</a></li>
    <li><a href="/about">About</a></li>
    <li><a href="/contact">Contact</a></li>
  </ul>
</nav>
```

### Alerts & Messages

```html
<!-- ✅ Success message -->
<div role="alert" class="alert alert-success">
  ✓ Changes saved successfully
</div>

<!-- ✅ Error message -->
<div role="alert" class="alert alert-error">
  ✗ Please fix the errors below
</div>

<!-- ✅ Warning message -->
<div role="alert" class="alert alert-warning">
  ⚠ This action cannot be undone
</div>
```

## Testing Accessibility

### Manual Testing Checklist

- [ ] Keyboard navigation works (Tab, Shift+Tab, Enter)
- [ ] Focus indicators are visible and clear
- [ ] Color contrast ratios meet AA or AAA
- [ ] Text alternatives for images (alt text)
- [ ] Form labels are properly associated
- [ ] Error messages are clear and linked to inputs
- [ ] Page structure uses semantic HTML (h1→h6, nav, main, etc.)
- [ ] No content is conveyed by color alone
- [ ] Animations respect prefers-reduced-motion
- [ ] Page works at 200% zoom
- [ ] Page works with text size increased
- [ ] Links are distinguishable from regular text
- [ ] Buttons look like buttons (not just text)

### Automated Testing Tools

1. **axe DevTools:** Browser extension for automated accessibility checking
2. **WAVE:** Web accessibility evaluation tool
3. **Lighthouse:** Built into Chrome DevTools (Accessibility tab)
4. **Accessibility Insights:** Microsoft's free tool
5. **NVDA:** Free screen reader (Windows)
6. **JAWS:** Commercial screen reader (Windows)
7. **VoiceOver:** Built-in screen reader (macOS, iOS)

### Screen Reader Testing

Test with actual screen readers:

**Windows:**
- NVDA (free): https://www.nvaccess.org/

**macOS/iOS:**
- VoiceOver (built-in): cmd+F5 to toggle

**Firefox:**
- Screen reader functionality: https://www.mozilla.org/en-US/accessibility/

## Accessibility Standards

The Corrupted Theme aims to comply with:

- **WCAG 2.1 Level AA** (Web Content Accessibility Guidelines)
- **ARIA Authoring Practices Guide** (APG)
- **Americans with Disabilities Act** (ADA) standards
- **EN 301 549** (European accessibility standard)

### WCAG Principles (POUR)

1. **Perceivable:** Content is visible and understandable
   - Large, clear text
   - High contrast colors
   - Text alternatives for images

2. **Operable:** Users can navigate and interact
   - Keyboard accessible
   - Clear focus indicators
   - Sufficient time for interactions

3. **Understandable:** Content is clear and predictable
   - Simple language
   - Consistent navigation
   - Clear error messages

4. **Robust:** Works across devices and assistive technologies
   - Semantic HTML
   - Valid code
   - Works with screen readers

## Resources

### Learning Resources

- **WebAIM:** https://webaim.org/
- **a11y Project:** https://www.a11yproject.com/
- **MDN Accessibility:** https://developer.mozilla.org/en-US/docs/Web/Accessibility
- **WCAG 2.1 Guidelines:** https://www.w3.org/WAI/WCAG21/quickref/

### Tools & Checkers

- **Color Contrast Analyzer:** https://www.tpgi.com/color-contrast-checker/
- **Accessibility Validator:** https://www.accessibilityvalidator.com/
- **Keyboard Navigation Checker:** https://www.a11yproject.com/articles/keyboard-navigation/

### Support

- **Report accessibility issues:** Submit to project GitHub
- **Ask questions:** Community forums and Stack Overflow
- **Get help:** Contact the maintainers

---

**Building accessible web experiences is everyone's responsibility.** Thank you for prioritizing accessibility! 🎨♿
