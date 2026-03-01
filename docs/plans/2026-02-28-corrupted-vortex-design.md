# CorruptedVortex — Design Document

**Date:** 2026-02-28
**Branch:** feature/myoshi-profile-animation-layer
**Status:** Approved — ready for implementation

---

## Overview

Add a reusable WebGL shader component `CorruptedVortex` to `src/lib/` that renders an animated raymarched vortex tunnel. The shader originates from a #つぶやきGLSL (tweet GLSL) entry — a compact 280-character GLSL shader — and is adapted for production use with configurable uniforms and a quasar/black-hole color palette matching the corrupted-theme aesthetic.

The component follows the same class-based API pattern as `CorruptedText`.

---

## Source Shader

Original tweet GLSL:
```glsl
float i,e,R,s;vec3 q,p,d=vec3((FC.xy-.5*r)/r,.7);for(q.z--;i++<99.;){o.rgb+=hsv(.6,e*.4+p.y,e/3e1);p=q+=d*max(e,.01)*R*.14;p.xy*=rotate2D(.8);p=vec3(log2(R=length(p))-t,e=-p.z/R-.8,atan(p.x*.08,p.y)-t*.2);for(s=1.;s<1e3;s+=s)e+=abs(dot(sin(p.yzx*s),cos(p.yyz*s)))/s;}#つぶやきGLSL
```

Technique: raymarched log-polar tunnel with fractal sin/cos noise field and HSV coloring. Produces an animated spiral vortex.

Variable mapping (tweet → WebGL):
- `FC.xy` → `gl_FragCoord.xy`
- `r` → `uResolution`
- `t` → `uTime` (internal, driven by `uSpeed`)
- `o` → `fragColor`

---

## File Layout

```
src/lib/corrupted-vortex.js          ← new component
examples/advanced/glsl-vortex.html   ← demo page
```

`examples/index.html` — add link to the new demo.

---

## Architecture

### Class: `CorruptedVortex`

```
constructor(canvas, options)
  init()           — compile shaders, create fullscreen quad buffer, attach observers
  start()          — begin requestAnimationFrame loop
  stop()           — cancel rAF
  destroy()        — release WebGL resources, disconnect observers
  _render(ts)      — internal: update uniforms, draw
  _resize()        — internal: sync canvas dimensions and devicePixelRatio
```

### Observers (attached in `init`)

| Observer | Target | Behavior |
|---|---|---|
| `ResizeObserver` | canvas element | calls `_resize()` on size change |
| `IntersectionObserver` | canvas element | `stop()` when hidden, `start()` when visible |

### WebGL target

WebGL1 — broader support; the shader math does not require WebGL2 features.

---

## Shader Design

### GLSL Preamble (helpers)

```glsl
precision highp float;

uniform vec2  uResolution;
uniform float uTime;
uniform float uIntensity;
uniform float uRotationRate;
uniform float uHue;

vec3 hsv(float h, float s, float v) {
  vec4 K = vec4(1.0, 2.0/3.0, 1.0/3.0, 3.0);
  vec3 p = abs(fract(vec3(h) + K.xyz) * 6.0 - K.www);
  return v * mix(K.xxx, clamp(p - K.xxx, 0.0, 1.0), s);
}
mat2 rotate2D(float a) {
  float c = cos(a), s = sin(a);
  return mat2(c, -s, s, c);
}
```

### Color System

**Quasar/black-hole palette** (default, `uHue < 0.0`):

Hue is driven by depth iteration index `i` to create natural banding through the raymarching loop:

| Zone | Color | Hue |
|---|---|---|
| Core / innermost | Yellow / amber | 0.14 |
| Mid disk | Magenta | 0.87 |
| Outer disk | Purple | 0.75 |
| Far edge accent | Cyan | 0.50 |

Implementation: `float hue = mix(0.14, 0.87, fract(i / 33.0)) + p.y * 0.05;`
This cycles the hue through the palette with each iteration band, producing the swirling quasar effect.

**Fixed hue mode** (`uHue >= 0.0`):
When the user passes `hue: 0.6` (or any 0–1 value), `uHue` is set to that value and the shader uses it directly — bypassing the multi-color logic.

**Theme color alignment:**

| Color | Hue | Theme variable |
|---|---|---|
| Magenta | 0.87 | `--corrupted-magenta: #ff00ff` |
| Purple | 0.75 | `--corrupted-purple: #8b5cf6` |
| Cyan | 0.50 | `--corrupted-cyan: #00ffff` |
| Yellow | 0.14 | — (quasar hot zone) |

---

## Public API

### Constructor options

```js
new CorruptedVortex(canvas, {
  speed:        1.0,   // time multiplier (0.1 = slow, 3.0 = fast)
  intensity:    1.0,   // overall brightness scale
  rotationRate: 1.0,   // spiral rotation speed multiplier
  hue:          null,  // null = quasar multi-color; 0.0–1.0 = fixed override hue
})
```

### Methods

| Method | Description |
|---|---|
| `start()` | Begin render loop (no-op if already running) |
| `stop()` | Cancel render loop |
| `destroy()` | Release WebGL resources, disconnect all observers |

### Error handling

- If WebGL is not supported: logs a `console.warn` and returns without throwing.
- If shader compilation fails: logs the GLSL info log and calls `destroy()`.

---

## Demo Page (`examples/advanced/glsl-vortex.html`)

- Full-screen canvas, vortex centered
- Live controls panel (sliders):
  - Speed (0.1 – 3.0)
  - Intensity (0.1 – 3.0)
  - Rotation Rate (0.0 – 5.0)
  - Hue toggle: "Quasar" (multi-color) vs fixed hue slider (0.0 – 1.0)
- Code snippet section showing minimal usage example
- Navigation header matching other example pages
- Linked from `examples/index.html`

---

## Performance Notes

- Renders a single fullscreen triangle (2 vertices, no index buffer needed)
- `IntersectionObserver` pauses rAF when canvas is offscreen — zero GPU cost when hidden
- `devicePixelRatio` clamped to max 2.0 to limit fragment count on high-DPI displays
- Recommendation: do not run more than 2–3 `CorruptedVortex` instances simultaneously

---

## Testing Criteria

- [ ] WebGL1 context created successfully on Chrome, Firefox, Safari
- [ ] Canvas resizes correctly on window resize and container resize
- [ ] rAF pauses when canvas scrolls offscreen; resumes on scroll back
- [ ] All 4 config options visibly affect the render
- [ ] Quasar mode shows magenta/purple/yellow color banding
- [ ] Fixed hue mode shows uniform hue
- [ ] `destroy()` releases all resources (no memory leak on repeated init/destroy)
- [ ] Demo page sliders update live without restarting the component

---

## Non-Goals

- WebGL2 features (not needed)
- Audio reactivity
- Multiple simultaneous vortex layers
- CSS fallback (WebGL is required; unsupported browsers get a warning)
