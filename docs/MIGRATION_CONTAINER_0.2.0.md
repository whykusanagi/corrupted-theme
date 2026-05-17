# Container Migration Guide — 0.2.0

The `.container` class changed in 0.2.0 from an implicit-grid layout
primitive to a **structural-only** primitive. Opinionated layouts are now
opt-in via modifier classes.

## What changed

### Before (0.1.x — orphan rule)

The 0.1.x package had responsive overrides for `.container` that referenced
a grid layout, but the base grid rule was scattered across consumer sites
(or absent entirely, leaving the overrides dead). Downstream sites
worked around this by `unset`ting the override or stripping the rule.

### After (0.2.0)

```css
/* Base: structural only */
.container {
  width: 100%;
  max-width: var(--container-max-width, 1200px);
  margin-inline: auto;
  padding-inline: var(--container-padding-x, 1rem);
}

/* Opinionated layouts: opt-in */
.container--grid-2col { display: grid; grid-template-columns: 1fr 1fr; gap: 2rem; }
.container--grid-3col { display: grid; grid-template-columns: repeat(3, 1fr); gap: 2rem; }
.container--transparent { background: transparent; }
.container--with-bg { background: var(--glass); border: 1px solid var(--border); border-radius: var(--radius-2xl); backdrop-filter: blur(15px); }
.container--fullscreen { max-width: none; min-height: 100vh; }
.container--centered { display: flex; flex-direction: column; align-items: center; justify-content: center; }
```

## Migration

### If you currently use `.container` and want a 2-col grid layout:

```html
<!-- before -->
<div class="container">...</div>

<!-- after -->
<div class="container container--grid-2col">...</div>
```

### If you currently `unset` or override `.container` to remove the grid (nikke, site):

You no longer need the workaround. The base `.container` doesn't apply any grid. Remove the `unset` rules.

```css
/* DELETE these workarounds */
.container { all: unset; }              /* nikke render-helpers.ts:633 */
.container { grid-template-columns: unset; }  /* updates.ts:32 */
```

### If you want the previous `.content`-style appearance (glass + border + blur):

```html
<!-- before — relied on .container implying glass appearance via responsive cascade -->
<div class="container">...</div>

<!-- after — explicit -->
<div class="container container--with-bg">...</div>
```

### Customizing max-width / padding:

```css
:root {
  --container-max-width: 1400px;   /* default: 1200px */
  --container-padding-x: 2rem;     /* default: 1rem */
}
```

## FAQ

**Q: Do I have to update existing code?**
A: If you were already fighting `.container` (e.g., the way nikke and site did) — yes, remove the workarounds. If you were using `.container` with `display: grid` declared elsewhere — no change needed; your grid rules still win cascade.

**Q: Why was this changed?**
A: Two downstream sites (nikke, whykusanagi.xyz/site) were actively `unset`ting or stripping the `.container` rule to render their own backgrounds and layouts. The package's job is to bootstrap web building, not fight downstream sites for control. The audit (2026-05-16) confirmed the change.

**Q: Is this a breaking change?**
A: Yes. Pre-1.0 makes it permissible. CSS-side deprecation shims aren't feasible. Pin to `^0.1.9` if you can't migrate yet.
