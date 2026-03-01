# CorruptedParticles — Design Document

**Date:** 2026-02-28
**Branch:** feature/myoshi-profile-animation-layer
**Status:** Approved — ready for implementation
**Version bump:** 0.1.7 → 0.1.8 (new feature, minor bump)

---

## Overview

Add `src/lib/corrupted-particles.js` — a reusable Canvas 2D background component that renders floating corrupted Japanese phrases connected by dim glowing lines, with hover repel and click burst interactions. Inspired by the tsparticles ParticlesBackground pattern, but built from scratch with no external dependencies and themed to the corrupted-theme aesthetic.

Includes an opt-in lewd variant (`includeLewd: true`) with purple-tinted intimate phrases from the canonical NSFW phrase buffer in `CORRUPTED_THEME_SPEC.md`. Default is always SFW.

---

## File Layout

```
src/lib/corrupted-particles.js         ← new component
examples/advanced/particles-bg.html    ← demo page
```

`examples/index.html` — add nav link and quick-link.

---

## Architecture

### Class: `CorruptedParticles`

```
constructor(canvas, options)
  init()            — build particle pool, attach event listeners + observers, start loop
  start()           — begin rAF loop
  stop()            — cancel rAF
  destroy()         — release canvas context, remove listeners, disconnect observers
  _resize()         — recompute canvas dimensions, rebuild particle pool
  _render(ts)       — physics step + draw frame
  _spawnBurst(x,y)  — spawn 6 near-layer particles at (x, y) on click
```

### Observers / Listeners

| Observer/Listener | Behavior |
|---|---|
| `ResizeObserver` on canvas | calls `_resize()` |
| `IntersectionObserver` on canvas | `stop()` when hidden, `start()` when visible |
| `mousemove` on canvas | track cursor position for repel |
| `click` on canvas | call `_spawnBurst(x, y)` |

### Mounting

```html
<canvas id="particles-bg"
        style="position:fixed;inset:0;width:100%;height:100%;z-index:0;pointer-events:auto;">
</canvas>
<script src="src/lib/corrupted-particles.js"></script>
<script>
  new CorruptedParticles(document.getElementById('particles-bg'));
</script>
```

---

## Depth Layer System

Each particle is assigned a depth layer at spawn. Layers create parallax depth — near particles are bold and fast, far particles are dim and slow.

| Layer | % of total | Font size | Speed (px/frame) | Opacity | Lines |
|---|---|---|---|---|---|
| Far | 30% | 9–11px | 0.2–0.4 | 0.15–0.25 | barely visible |
| Mid | 50% | 12–15px | 0.4–0.8 | 0.35–0.55 | dim cyan |
| Near | 20% | 16–20px | 0.8–1.4 | 0.6–0.8 | bright cyan |

**Particle count:**
- Desktop: `count` option (default 60)
- Mobile (`window.innerWidth < 768`): `Math.floor(count / 2)` (default 30)

---

## Particle Physics

### Motion
- Each particle has a fixed `vx`, `vy` velocity assigned at spawn (random direction within layer speed range × `options.speed`)
- Moves `x += vx`, `y += vy` each frame
- Wraps at canvas edges (exits right → re-enters left, etc.)

### Hover Repel
- Track cursor as `{cx, cy}` via `mousemove`
- Each frame: for particles within 120px of cursor, add a velocity nudge:
  ```
  dx = particle.x - cx
  dy = particle.y - cy
  dist = sqrt(dx*dx + dy*dy)
  if dist < 120:
    strength = (1 - dist/120) * 0.8
    particle.vx += dx/dist * strength
    particle.vy += dy/dist * strength
  ```
- Cap velocity at `baseSpeed * 3` to prevent escape
- Apply damping: `particle.vx *= 0.95`, `particle.vy *= 0.95` each frame so particles return to natural drift

### Click Burst
- On click at `(x, y)`: call `_spawnBurst(x, y)` which adds 6 near-layer particles
- New particles spawn with random outward velocities (near-layer speed range × 2 for initial burst)
- They enter the normal pool and participate in lines/repel immediately
- No max particle cap — burst particles fade in over 300ms via opacity lerp

### Phrase Flickering
- Each particle has `flickerTimer: random(2000, 8000)` ms countdown
- On expiry: set `flickering = true`, drop opacity to ~0.05 for 100ms, restore, reset timer with new random interval
- Mimics the spec's "phrase flickering" instability pattern

---

## Connection Lines

- Each frame: check all pairs of particles in the same or adjacent layers
- If `distance < options.lineDistance (150px)`: draw a line
- Line opacity = `(1 - distance / lineDistance) * 0.3`
- Line color: `rgba(0, 255, 255, opacity)` (cyan) for SFW; `rgba(139, 92, 246, opacity)` for lines between lewd particles
- Skip far↔near pairs (too much visual noise across depths)

---

## Content System

### SFW Phrase Pool (default)

Drawn from `CORRUPTION_PHRASES.md` and `CORRUPTED_THEME_SPEC.md`:

```
"壊れ corrupting"       "ロード loading"         "処理中"
"接続 connecting"       "分析 analyzing"         "待機 waiting"
"実行 executing"        "深淵 abyss"             "監視中"
"cor壊rupting"          "読み込み yomikomi"      "データ data"
"解析 kaiseki"          "壊れている"              "エラー error"
```

Color: `--corrupted-cyan` (#00ffff) at layer opacity.

### Lewd Mode (`includeLewd: true`)

**Default: `false`. Never enable in production without explicit user opt-in.**

Adds NSFW phrases from the canonical buffer in `CORRUPTED_THEME_SPEC.md`:

```
"壊れちゃう...ああ..."       "ずっと...してほしい... ♥"
"変態"                       "えっち"
"好きにして...お願い..."      "Moral subroutines: DISABLED"
"壊れている kowarete-iru"     "Pleasure protocols..."
```

- Lewd particles color: `--corrupted-purple` (#8b5cf6)
- Lewd particles speed: ×0.7 (30% slower, more lingering)
- Lewd particles make up ~25% of pool when enabled
- Console note on enable: `"CorruptedParticles: lewd mode enabled — 18+ content only"`

---

## Public API

### Constructor options

```js
new CorruptedParticles(canvas, {
  count:        60,     // desktop particle count (mobile auto-halved)
  includeLewd:  false,  // MUST remain false by default
  speed:        1.0,    // global speed multiplier (0.1–3.0)
  lineDistance: 150,    // px distance threshold for connection lines
})
```

### Methods

| Method | Description |
|---|---|
| `start()` | Begin render loop (no-op if already running) |
| `stop()` | Cancel render loop |
| `destroy()` | Remove listeners, disconnect observers, release context |

---

## Demo Page (`examples/advanced/particles-bg.html`)

- Dark background, particles fill the full viewport
- Overlaid glass panel with controls:
  - Count slider (20–120)
  - Speed slider (0.1–3.0)
  - Line Distance slider (50–300)
  - Lewd mode toggle (clearly labeled 18+)
- Code snippet showing SFW and lewd usage
- Navigation matching other example pages
- Linked from `examples/index.html`

---

## Version Bump

This is a new feature — bump package version `0.1.7 → 0.1.8`.

Files to update:
1. `package.json` line 3
2. `package-lock.json` lines 3 and 7
3. `README.md` installation examples
4. `docs/governance/VERSION_REFERENCES.md`

---

## Testing Criteria

- [ ] Particles render on black background (SFW cyan phrases visible)
- [ ] Depth layers visible: near phrases are larger/brighter, far are tiny/dim
- [ ] Lines connect nearby particles, fade with distance
- [ ] Hover repels particles from cursor
- [ ] Click spawns 6 burst particles at click position
- [ ] Phrase flickering occurs occasionally (opacity pulse)
- [ ] `includeLewd: true` adds purple phrases to the pool
- [ ] Mobile: particle count halved automatically
- [ ] Canvas resizes correctly (ResizeObserver)
- [ ] rAF pauses when canvas is offscreen (IntersectionObserver)
- [ ] `destroy()` removes all listeners and stops rendering cleanly
- [ ] Version number updated in all 4 files

---

## Non-Goals

- tsparticles dependency (vanilla Canvas 2D only)
- WebGL rendering
- Audio reactivity
- SVG or DOM-based particles
