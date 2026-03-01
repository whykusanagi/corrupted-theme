# CorruptedVortex Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add `src/lib/corrupted-vortex.js` — a reusable WebGL1 class that renders an animated raymarched spiral-vortex shader with a quasar color palette, matching the `CorruptedText` API pattern.

**Architecture:** A single ES5-compatible JS class (`CorruptedVortex`) compiles two inline GLSL shaders, binds them to the provided `<canvas>`, and drives a `requestAnimationFrame` render loop. A `ResizeObserver` keeps pixel dimensions correct; an `IntersectionObserver` pauses rendering when the canvas is offscreen. The demo page at `examples/advanced/glsl-vortex.html` acts as both a functional test and a usage reference.

**Tech Stack:** WebGL1 (no external libs), vanilla JS (ES2015 classes), HTML5 Canvas, ResizeObserver, IntersectionObserver.

---

## Design reference

`docs/plans/2026-02-28-corrupted-vortex-design.md` — read this first for the full color-system rationale and architecture decisions.

---

## Task 1: GLSL shader constants

**Files:**
- Create: `src/lib/corrupted-vortex.js`

These are the two shader source strings placed at the top of the file as `const` strings. Write them first; they are the logical core of the component and define every visual detail.

**Step 1: Create the file with the vertex shader constant**

```javascript
// src/lib/corrupted-vortex.js

const VERT_SRC = `
attribute vec2 aPosition;
void main() {
  gl_Position = vec4(aPosition, 0.0, 1.0);
}
`;
```

The vertex shader is a simple pass-through. We draw a single oversized triangle that covers the whole NDC square — no UV math needed in the vertex shader.

**Step 2: Add the fragment shader constant immediately below**

```javascript
const FRAG_SRC = `
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

void main() {
  vec4 o = vec4(0.0);
  float i = 0.0, e = 0.0, R = 0.0, s;
  vec3 q = vec3(0.0), p = vec3(0.0);
  vec3 d = vec3((gl_FragCoord.xy - 0.5 * uResolution) / uResolution.y, 0.7);
  q.z -= 1.0;

  for (; i < 99.0; i += 1.0) {
    float h = (uHue >= 0.0)
      ? uHue
      : mix(0.14, 0.87, fract(i / 33.0)) + p.y * 0.05;
    o.rgb += hsv(h, e * 0.4 + p.y, e / 30.0 * uIntensity);

    p = q += d * max(e, 0.01) * R * 0.14;
    p.xy *= rotate2D(0.8 * uRotationRate);

    R = length(p);
    float newPy = -p.z / R - 0.8;
    e = newPy;
    p = vec3(log2(R) - uTime, newPy, atan(p.x * 0.08, p.y) - uTime * 0.2);

    for (s = 1.0; s < 1000.0; s += s)
      e += abs(dot(sin(p.yzx * s), cos(p.yyz * s))) / s;
  }

  gl_FragColor = clamp(o, 0.0, 1.0);
}
`;
```

**Key translation notes vs the original tweet GLSL:**
- `FC.xy` → `gl_FragCoord.xy`
- `r` (resolution vec2) → `uResolution`
- `t` (time float) → `uTime`
- `o` (output) → `gl_FragColor` (WebGL1 uses the built-in, not a declared out variable)
- The inner loop `e +=` ADDS to `e` — `e` starts at `newPy` before the inner loop (that's the `e = newPy` line). Do NOT reset `e = 0.0` before the inner loop; that would break the original math.
- `atan(x, y)` 2-argument form is valid in GLSL 1.0 (WebGL1).
- Color hue: `uHue < 0.0` is the sentinel for quasar multi-color mode (yellow→magenta cycling per depth band). `uHue >= 0.0` uses the value directly.

**Step 3: Verify the file exists with correct content**

```bash
head -5 src/lib/corrupted-vortex.js
```

Expected output: `const VERT_SRC = \``

---

## Task 2: Class scaffold

**Files:**
- Modify: `src/lib/corrupted-vortex.js`

**Step 1: Add the class definition below the shader constants**

```javascript
class CorruptedVortex {
  constructor(canvas, options = {}) {
    this.canvas = canvas;
    this.options = {
      speed:        options.speed        ?? 1.0,
      intensity:    options.intensity    ?? 1.0,
      rotationRate: options.rotationRate ?? 1.0,
      hue:          options.hue          ?? null,
    };

    this.gl                   = null;
    this.program              = null;
    this.uniforms             = {};
    this.buffer               = null;
    this._rafId               = null;
    this._isRunning           = false;
    this._elapsed             = 0;
    this._lastTs              = null;
    this._resizeObserver      = null;
    this._intersectionObserver = null;

    this.init();
  }
}
```

**Step 2: Verify the class declaration parses without error**

Open the browser console and run:
```javascript
const cv = new CorruptedVortex(document.createElement('canvas'));
console.log(cv.options);
```
Expected: `{ speed: 1, intensity: 1, rotationRate: 1, hue: null }` — and no errors (since `init()` isn't defined yet it will throw a `TypeError: this.init is not a function`; that's fine at this stage, it confirms the constructor body runs).

---

## Task 3: `_compileShader` and WebGL setup in `init()`

**Files:**
- Modify: `src/lib/corrupted-vortex.js` — add methods inside the class

**Step 1: Add `_compileShader` helper**

```javascript
  _compileShader(type, src) {
    const gl = this.gl;
    const shader = gl.createShader(type);
    gl.shaderSource(shader, src);
    gl.compileShader(shader);
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
      console.warn('CorruptedVortex: shader compile failed\n', gl.getShaderInfoLog(shader));
      gl.deleteShader(shader);
      return null;
    }
    return shader;
  }
```

**Step 2: Add `init()`**

```javascript
  init() {
    const gl = this.canvas.getContext('webgl');
    if (!gl) {
      console.warn('CorruptedVortex: WebGL not supported in this browser.');
      return;
    }
    this.gl = gl;

    const vs = this._compileShader(gl.VERTEX_SHADER,   VERT_SRC);
    const fs = this._compileShader(gl.FRAGMENT_SHADER, FRAG_SRC);
    if (!vs || !fs) { this.destroy(); return; }

    this.program = gl.createProgram();
    gl.attachShader(this.program, vs);
    gl.attachShader(this.program, fs);
    gl.linkProgram(this.program);
    gl.deleteShader(vs);
    gl.deleteShader(fs);

    if (!gl.getProgramParameter(this.program, gl.LINK_STATUS)) {
      console.warn('CorruptedVortex: program link failed\n', gl.getProgramInfoLog(this.program));
      this.destroy();
      return;
    }

    gl.useProgram(this.program);

    this.uniforms = {
      resolution:   gl.getUniformLocation(this.program, 'uResolution'),
      time:         gl.getUniformLocation(this.program, 'uTime'),
      intensity:    gl.getUniformLocation(this.program, 'uIntensity'),
      rotationRate: gl.getUniformLocation(this.program, 'uRotationRate'),
      hue:          gl.getUniformLocation(this.program, 'uHue'),
    };

    // Fullscreen triangle — one triangle covers the full NDC square
    this.buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, this.buffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1,  3, -1,  -1, 3]), gl.STATIC_DRAW);

    const posLoc = gl.getAttribLocation(this.program, 'aPosition');
    gl.enableVertexAttribArray(posLoc);
    gl.vertexAttribPointer(posLoc, 2, gl.FLOAT, false, 0, 0);
  }
```

**Step 3: Verify shaders compile** (run in any browser console with the file loaded):

```javascript
const c = document.createElement('canvas');
const cv = new CorruptedVortex(c);
console.log('program valid:', cv.gl && cv.gl.getProgramParameter(cv.program, cv.gl.LINK_STATUS));
```

Expected: `program valid: true`

If it prints a compile warning instead, read the info log printed to console — it will point to the GLSL line with the error.

---

## Task 4: `_resize()` and observers

**Files:**
- Modify: `src/lib/corrupted-vortex.js`

**Step 1: Add `_resize()`**

```javascript
  _resize() {
    const gl = this.gl;
    if (!gl) return;
    const dpr  = Math.min(window.devicePixelRatio || 1, 2.0);
    const rect = this.canvas.getBoundingClientRect();
    this.canvas.width  = Math.round(rect.width  * dpr);
    this.canvas.height = Math.round(rect.height * dpr);
    gl.viewport(0, 0, this.canvas.width, this.canvas.height);
  }
```

DPR is clamped to 2.0 to prevent excessive fragment shader invocations on 3× or 4× displays.

**Step 2: Add observer setup at the end of `init()` (append inside the `init` method after the buffer setup)**

```javascript
    this._resizeObserver = new ResizeObserver(() => this._resize());
    this._resizeObserver.observe(this.canvas);

    this._intersectionObserver = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting) {
        this.start();
      } else {
        this.stop();
      }
    });
    this._intersectionObserver.observe(this.canvas);

    this._resize();
    this.start();
```

The observers go inside `init()` — they're part of setup, not public API.

---

## Task 5: `_render()`, `start()`, `stop()`, `destroy()`

**Files:**
- Modify: `src/lib/corrupted-vortex.js`

**Step 1: Add `_render()`**

```javascript
  _render(ts) {
    if (!this._isRunning) return;

    if (this._lastTs !== null) {
      this._elapsed += (ts - this._lastTs) / 1000.0;
    }
    this._lastTs = ts;

    const gl = this.gl;
    gl.useProgram(this.program);
    gl.uniform2f(this.uniforms.resolution, this.canvas.width, this.canvas.height);
    gl.uniform1f(this.uniforms.time,         this._elapsed * this.options.speed);
    gl.uniform1f(this.uniforms.intensity,    this.options.intensity);
    gl.uniform1f(this.uniforms.rotationRate, this.options.rotationRate);
    gl.uniform1f(this.uniforms.hue,          this.options.hue !== null ? this.options.hue : -1.0);

    gl.drawArrays(gl.TRIANGLES, 0, 3);

    this._rafId = requestAnimationFrame(ts => this._render(ts));
  }
```

The `_elapsed` / `_lastTs` pattern means pause/resume works correctly — time does not jump when the `IntersectionObserver` resumes after an offscreen period.

**Step 2: Add `start()`, `stop()`, `destroy()`**

```javascript
  start() {
    if (this._isRunning || !this.gl) return;
    this._isRunning = true;
    this._lastTs = null;  // reset delta on resume
    this._rafId = requestAnimationFrame(ts => this._render(ts));
  }

  stop() {
    this._isRunning = false;
    this._lastTs = null;
    if (this._rafId) {
      cancelAnimationFrame(this._rafId);
      this._rafId = null;
    }
  }

  destroy() {
    this.stop();
    const gl = this.gl;
    if (gl) {
      if (this.program) gl.deleteProgram(this.program);
      if (this.buffer)  gl.deleteBuffer(this.buffer);
    }
    if (this._resizeObserver)       { this._resizeObserver.disconnect();       this._resizeObserver = null; }
    if (this._intersectionObserver) { this._intersectionObserver.disconnect(); this._intersectionObserver = null; }
    this.gl     = null;
    this.canvas = null;
  }
```

**Step 3: Manual browser validation**

Create a minimal test in the browser console:
```javascript
const c = document.createElement('canvas');
c.style.cssText = 'width:400px;height:300px;position:fixed;top:0;left:0;';
document.body.appendChild(c);
const cv = new CorruptedVortex(c, { speed: 1.0, intensity: 1.0, rotationRate: 1.0 });
// Expected: animated quasar vortex visible in the top-left
// After 3 seconds:
cv.stop();
// Expected: animation freezes
cv.start();
// Expected: animation resumes from where it paused (no time jump)
cv.destroy();
c.remove();
// Expected: no JS errors, no memory leak warnings
```

Verify:
- [ ] The vortex renders — magenta/purple/yellow swirling bands visible
- [ ] `stop()` freezes the animation
- [ ] `start()` resumes without a time jump
- [ ] `destroy()` removes the animation cleanly

**Step 4: Commit the component**

```bash
git add src/lib/corrupted-vortex.js
git commit -m "feat(lib): add CorruptedVortex WebGL raymarched vortex component

WebGL1 class-based component matching CorruptedText API.
Renders tweet-GLSL raymarched spiral tunnel with quasar color
palette (magenta/purple/yellow, cyan accent). Configurable via
speed, intensity, rotationRate, hue options. ResizeObserver +
IntersectionObserver lifecycle management.

Co-Authored-By: Claude Sonnet 4.6 <noreply@anthropic.com>"
```

---

## Task 6: Demo page

**Files:**
- Create: `examples/advanced/glsl-vortex.html`

**Step 1: Write the full demo page**

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>GLSL Vortex - Corrupted Theme</title>
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.2/css/all.min.css">
  <link rel="stylesheet" href="../../src/css/theme.css">
  <style>
    body { margin: 0; background: #000; overflow-x: hidden; }

    .vortex-wrap {
      position: relative;
      width: 100%;
      height: 100vh;
    }

    #vortex-canvas {
      display: block;
      width: 100%;
      height: 100%;
    }

    .overlay {
      position: absolute;
      inset: 0;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: flex-end;
      padding: var(--spacing-2xl);
      pointer-events: none;
    }

    .controls-panel {
      pointer-events: all;
      background: var(--glass);
      border: 1px solid var(--border);
      border-radius: var(--radius-lg);
      padding: var(--spacing-lg);
      width: 100%;
      max-width: 480px;
      backdrop-filter: blur(12px);
    }

    .controls-panel h2 {
      color: var(--accent);
      margin: 0 0 var(--spacing-md);
      font-size: 1rem;
      text-transform: uppercase;
      letter-spacing: 0.1em;
    }

    .control-row {
      display: flex;
      align-items: center;
      gap: var(--spacing-md);
      margin-bottom: var(--spacing-sm);
    }

    .control-row label {
      color: var(--text-muted);
      font-size: 0.8rem;
      width: 120px;
      flex-shrink: 0;
    }

    .control-row input[type="range"] {
      flex: 1;
      accent-color: var(--corrupted-magenta);
    }

    .control-row .val {
      color: var(--corrupted-cyan);
      font-size: 0.8rem;
      width: 40px;
      text-align: right;
    }

    .hue-row {
      border-top: 1px solid var(--border);
      margin-top: var(--spacing-sm);
      padding-top: var(--spacing-sm);
    }

    .hue-toggle {
      display: flex;
      gap: var(--spacing-sm);
      margin-bottom: var(--spacing-sm);
    }

    .hue-toggle button {
      flex: 1;
      padding: 4px 8px;
      font-size: 0.75rem;
      border-radius: var(--radius-sm);
      cursor: pointer;
      border: 1px solid var(--border);
      background: transparent;
      color: var(--text-muted);
      transition: all 0.2s;
    }

    .hue-toggle button.active {
      background: var(--corrupted-magenta);
      border-color: var(--corrupted-magenta);
      color: #000;
    }

    .code-block {
      margin-top: var(--spacing-2xl);
      max-width: 700px;
      width: 100%;
      background: var(--glass);
      border: 1px solid var(--border);
      border-radius: var(--radius-lg);
      padding: var(--spacing-lg);
    }

    .code-block h3 {
      color: var(--accent);
      font-size: 0.85rem;
      text-transform: uppercase;
      letter-spacing: 0.1em;
      margin: 0 0 var(--spacing-md);
    }

    .code-block pre {
      margin: 0;
      overflow-x: auto;
      font-size: 0.78rem;
      color: var(--corrupted-cyan);
      line-height: 1.5;
    }
  </style>
</head>
<body>

  <!-- Navigation -->
  <nav class="navbar">
    <div class="nav-brand">
      <a href="../index.html" class="brand-link">
        <i class="fas fa-radiation"></i>
        <span>corrupted-theme</span>
      </a>
    </div>
    <ul class="nav-links">
      <li><a href="../index.html"><i class="fas fa-home"></i> Home</a></li>
      <li><a href="../showcase-complete.html"><i class="fas fa-book"></i> Docs</a></li>
    </ul>
  </nav>

  <!-- Full-screen vortex -->
  <div class="vortex-wrap">
    <canvas id="vortex-canvas"></canvas>
    <div class="overlay">

      <!-- Controls -->
      <div class="controls-panel">
        <h2><i class="fas fa-sliders-h"></i> Vortex Controls</h2>

        <div class="control-row">
          <label>Speed</label>
          <input type="range" id="ctrl-speed" min="0.1" max="3.0" step="0.05" value="1.0">
          <span class="val" id="val-speed">1.00</span>
        </div>

        <div class="control-row">
          <label>Intensity</label>
          <input type="range" id="ctrl-intensity" min="0.1" max="3.0" step="0.05" value="1.0">
          <span class="val" id="val-intensity">1.00</span>
        </div>

        <div class="control-row">
          <label>Rotation Rate</label>
          <input type="range" id="ctrl-rotation" min="0.0" max="5.0" step="0.05" value="1.0">
          <span class="val" id="val-rotation">1.00</span>
        </div>

        <div class="hue-row">
          <div class="hue-toggle">
            <button id="btn-quasar" class="active">Quasar (multi-color)</button>
            <button id="btn-fixed">Fixed Hue</button>
          </div>
          <div class="control-row" id="hue-slider-row" style="display:none;">
            <label>Hue</label>
            <input type="range" id="ctrl-hue" min="0.0" max="1.0" step="0.01" value="0.6">
            <span class="val" id="val-hue">0.60</span>
          </div>
        </div>
      </div>

      <!-- Code snippet -->
      <div class="code-block">
        <h3>Minimal Usage</h3>
        <pre><code>&lt;canvas id="my-canvas" style="width:100%;height:400px;"&gt;&lt;/canvas&gt;
&lt;script src="src/lib/corrupted-vortex.js"&gt;&lt;/script&gt;
&lt;script&gt;
  const vortex = new CorruptedVortex(
    document.getElementById('my-canvas'),
    {
      speed:        1.0,   // 0.1–3.0
      intensity:    1.0,   // 0.1–3.0
      rotationRate: 1.0,   // 0.0–5.0
      hue:          null,  // null = quasar; 0.0–1.0 = fixed hue
    }
  );
  // vortex.stop();
  // vortex.start();
  // vortex.destroy();
&lt;/script&gt;</code></pre>
      </div>

    </div><!-- /overlay -->
  </div><!-- /vortex-wrap -->

  <script src="../../src/lib/corrupted-vortex.js"></script>
  <script>
    const canvas = document.getElementById('vortex-canvas');
    const vortex = new CorruptedVortex(canvas);

    function bind(sliderId, valId, prop) {
      const slider = document.getElementById(sliderId);
      const display = document.getElementById(valId);
      slider.addEventListener('input', () => {
        const v = parseFloat(slider.value);
        vortex.options[prop] = v;
        display.textContent = v.toFixed(2);
      });
    }

    bind('ctrl-speed',    'val-speed',    'speed');
    bind('ctrl-intensity','val-intensity','intensity');
    bind('ctrl-rotation', 'val-rotation', 'rotationRate');

    document.getElementById('ctrl-hue').addEventListener('input', function() {
      vortex.options.hue = parseFloat(this.value);
      document.getElementById('val-hue').textContent = parseFloat(this.value).toFixed(2);
    });

    document.getElementById('btn-quasar').addEventListener('click', () => {
      vortex.options.hue = null;
      document.getElementById('btn-quasar').classList.add('active');
      document.getElementById('btn-fixed').classList.remove('active');
      document.getElementById('hue-slider-row').style.display = 'none';
    });

    document.getElementById('btn-fixed').addEventListener('click', () => {
      const hue = parseFloat(document.getElementById('ctrl-hue').value);
      vortex.options.hue = hue;
      document.getElementById('btn-fixed').classList.add('active');
      document.getElementById('btn-quasar').classList.remove('active');
      document.getElementById('hue-slider-row').style.display = 'flex';
    });
  </script>
</body>
</html>
```

**Step 2: Open the page in a browser and verify**

```bash
open examples/advanced/glsl-vortex.html
```

Validate:
- [ ] Vortex renders (swirling magenta/purple/yellow spiral visible on black)
- [ ] Speed slider changes animation pace live
- [ ] Intensity slider changes brightness live
- [ ] Rotation Rate slider changes spin speed live
- [ ] "Quasar" button = multi-color mode
- [ ] "Fixed Hue" button reveals hue slider; sliding it changes color
- [ ] No JS console errors

---

## Task 7: Wire up `examples/index.html`

**Files:**
- Modify: `examples/index.html` — add a nav link and quick-link card for the vortex demo

**Step 1: Add nav link**

In `examples/index.html`, find the line:
```html
            <a href="advanced/nsfw-corruption.html"><i class="fas fa-exclamation-triangle"></i> NSFW (18+)</a>
```

Add immediately before it:
```html
            <a href="advanced/glsl-vortex.html"><i class="fas fa-hurricane"></i> GLSL Vortex</a>
```

**Step 2: Add a quick-link card**

Find any existing `.quick-link` block in the page (e.g. near `nikke-team-builder.html`). Add:
```html
        <a href="advanced/glsl-vortex.html" class="quick-link">
          <i class="fas fa-hurricane"></i>
          <span>GLSL Vortex</span>
        </a>
```

**Step 3: Verify the link resolves**

Open `examples/index.html` in a browser, click the GLSL Vortex link, confirm the demo page loads.

---

## Task 8: Final commit

```bash
git add examples/advanced/glsl-vortex.html examples/index.html
git commit -m "feat(examples): add GLSL vortex demo page and nav links

Interactive demo for CorruptedVortex with live sliders for speed,
intensity, rotation rate, and hue (quasar multi-color or fixed).
Linked from examples/index.html nav and quick-links.

Co-Authored-By: Claude Sonnet 4.6 <noreply@anthropic.com>"
```

---

## Validation Checklist (pre-PR)

- [ ] `src/lib/corrupted-vortex.js` exists and renders the vortex
- [ ] Constructor options (speed, intensity, rotationRate, hue) all affect the render
- [ ] Quasar mode: magenta/purple/yellow color banding visible
- [ ] Fixed hue mode: uniform single-hue color
- [ ] `stop()` → animation freezes; `start()` → resumes without time jump
- [ ] `destroy()` → no JS errors, no dangling rAF
- [ ] Canvas auto-resizes correctly when the container is resized
- [ ] Canvas pauses when scrolled offscreen (open DevTools Performance tab and confirm rAF stops)
- [ ] Demo page loads without console errors in Chrome, Firefox, Safari
- [ ] Nav link in `examples/index.html` resolves to the demo page
- [ ] No changes to `main` branch (all work on `feature/myoshi-profile-animation-layer`)
