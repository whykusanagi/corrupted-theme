// src/lib/corrupted-vortex.js
// CorruptedVortex — WebGL1 raymarched spiral-vortex component
// Part of @whykusanagi/corrupted-theme

const VERT_SRC = `
attribute vec2 aPosition;
void main() {
  gl_Position = vec4(aPosition, 0.0, 1.0);
}
`;

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

// Continuous 3-D accretion disk viewed at ~60° inclination, major axis 45° CW.
// Perpendicular-distance-to-radial-ray trick gives analytic nearest orbit:
//   phi = atan((sx+sy)/B, sx-sy)                   [orbital angle, r-invariant]
//   K   = 0.7071*(cos φ+B·sin φ, -cos φ+B·sin φ)  [radial direction on ellipse]
//   r0  = dot(uv, K) / dot(K,K)                    [nearest orbital radius]
//   dr  = length(uv - r0·K)                        [perpendicular disk offset]
vec3 diskSample(vec2 uv) {
  float B   = 0.38;
  float phi = atan((uv.x + uv.y) / B, uv.x - uv.y);
  vec2  K   = vec2(0.7071 * (cos(phi) + B * sin(phi)),
                   0.7071 * (-cos(phi) + B * sin(phi)));
  float r0  = dot(uv, K) / dot(K, K);
  float dr  = length(uv - r0 * K);

  // Radial extent: inner edge near photon sphere, outer at 0.65
  float radial = smoothstep(0.185, 0.235, r0) * smoothstep(0.65, 0.50, r0);

  // Disk height (flared outward; spaghettifies near horizon)
  float fall   = smoothstep(0.30, 0.19, length(uv));
  float sigma  = (0.020 + r0 * 0.042) * max(0.07, 1.0 - fall * 0.93);
  float height = exp(-pow(dr / sigma, 2.0));

  // Gas-flow striations along orbital direction
  float fiber  = 0.62 + 0.38 * abs(sin(phi * 18.0 + r0 * 22.0 - uTime * 0.25));

  // Doppler: approaching half (sin φ > 0) → brighter
  float dop    = 0.30 + 1.40 * max(0.0, sin(phi));

  // Color: inner cream-white → gold → dark orange outer
  float t = clamp((r0 - 0.18) / (0.62 - 0.18), 0.0, 1.0);
  vec3  col;
  if (t < 0.25) {
    col = mix(vec3(1.00, 0.97, 0.85), vec3(1.00, 0.72, 0.18), t / 0.25);
  } else {
    col = mix(vec3(1.00, 0.72, 0.18), vec3(0.38, 0.12, 0.01), (t - 0.25) / 0.75);
  }

  // Tidal brightening near inner edge
  float innerBoost = 1.0 + 1.5 * exp(-pow((r0 - 0.21) / 0.10, 2.0));

  return col * (height * radial * fiber * dop * innerBoost);
}

void main() {
  vec4 o = vec4(0.0);
  float e = 0.0, R = 0.0;
  vec3 q = vec3(0.0), p = vec3(0.0);
  vec3 d = vec3((gl_FragCoord.xy - 0.5 * uResolution) / uResolution.y, 0.7);
  q.z -= 1.0;

  for (float i = 0.0; i < 33.0; i += 1.0) {
    // Corrupted-theme quasar palette:
    //   0–25%  early iters (dim)   → magenta outer glow  [0.83–0.88]
    //   25–70% mid   iters         → purple body          [0.65–0.74]
    //   70–85% bright inner iters  → magenta burst        [0.82–0.88]
    //   85–100% late iters (high e)→ gold/yellow sparks   [0.14–0.19]
    float t = fract(i / 33.0);
    float base;
    if (t < 0.25) {
      base = mix(0.83, 0.88, t / 0.25);
    } else if (t < 0.70) {
      base = mix(0.65, 0.74, (t - 0.25) / 0.45);
    } else if (t < 0.85) {
      base = mix(0.82, 0.88, (t - 0.70) / 0.15);
    } else {
      base = mix(0.14, 0.19, (t - 0.85) / 0.15);
    }
    float h = (uHue >= 0.0) ? uHue : base + p.y * 0.04;
    o.rgb += hsv(h, clamp(e * 0.4, 0.0, 1.0), e / 30.0 * uIntensity);

    p = q += d * max(e, 0.01) * R * 0.14;
    p.xy *= rotate2D(0.8 * uRotationRate);

    R = length(p);
    float newPy = -p.z / R - 0.8;
    e = newPy;
    p = vec3(log2(R) + uTime, newPy, atan(p.x * 0.08, p.y) - uTime * 0.2);

    float s = 1.0;
    for (int si = 0; si < 10; si++) {
      e += abs(dot(sin(p.yzx * s), cos(p.yyz * s))) / s;
      s += s;
    }
  }

  // Reinhard + contrast curve: compress sum then collapse dim areas to black.
  // pow(x, 2.2) leaves 0→0 and 1→1 intact but pushes midtones down hard
  // (e.g. 0.2→0.03, 0.5→0.22) so cloud artifacts fall off to black rather
  // than accumulating to washed-out white.
  o.rgb = o.rgb / (1.0 + o.rgb);
  o.rgb = pow(o.rgb, vec3(2.2));

  // ── Continuous 3-D accretion disk (Interstellar-style) ────────────────────
  o.rgb += diskSample(d.xy) * 2.8 * uIntensity;

  // Gravitational lensing: back-side of disk bent ~π over the photon sphere,
  // producing a bright arc above the shadow (Interstellar top-arc effect).
  float lensR   = length(d.xy);
  float lensThe = atan(d.y, d.x);
  float bend    = exp(-(lensR - 0.19) * 9.0);
  float thetaS  = lensThe + 3.14159 * bend;
  vec2  uvLens  = vec2(cos(thetaS), sin(thetaS)) * lensR;
  float lensFade = exp(-pow((lensR - 0.23) * 8.0, 2.0))
                 * smoothstep(0.0, 0.04, d.y);
  o.rgb += diskSample(uvLens) * lensFade * 0.7 * uIntensity;

  // Black-hole event horizon: pitch-black centre, warm white photon ring at boundary
  float dist   = length(d.xy);
  float shadow = smoothstep(0.12, 0.18, dist);  // flat black void 0→0.12, ramps 0.12→0.18
  float ring   = exp(-pow((dist - 0.18) * 30.0, 2.0)) * 0.9;
  o.rgb = o.rgb * shadow + vec3(ring, ring * 0.80, ring * 0.45);  // warm white/gold photon ring

  o.a = 1.0;
  gl_FragColor = clamp(o, 0.0, 1.0);
}
`;

class CorruptedVortex {
  constructor(canvas, options = {}) {
    this.canvas = canvas;
    this.options = {
      speed:        options.speed        ?? 1.0,
      intensity:    options.intensity    ?? 1.0,
      rotationRate: options.rotationRate ?? 1.0,
      hue:          options.hue          ?? null,
    };

    this.gl                    = null;
    this.program               = null;
    this.uniforms              = {};
    this.buffer                = null;
    this._rafId                = null;
    this._isRunning            = false;
    this._elapsed              = 0;
    this._lastTs               = null;
    this._resizeObserver       = null;
    this._intersectionObserver = null;

    this.init();
  }

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

  init() {
    const gl = this.canvas.getContext('webgl', { alpha: false });
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

    this._resizeObserver = new ResizeObserver(() => this._resize());
    this._resizeObserver.observe(this.canvas);

    this._intersectionObserver = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting) {
        this.start();
      } else {
        this.stop();
      }
    }, { threshold: 0.1 });
    this._intersectionObserver.observe(this.canvas);

    this._resize();
    this.start();
  }

  _resize() {
    const gl = this.gl;
    if (!gl || !this.canvas) return;
    const dpr  = 0.5;  // half-res: GPU renders fewer pixels, CSS scales up
    const rect = this.canvas.getBoundingClientRect();
    if (rect.width === 0 || rect.height === 0) return;
    this.canvas.width  = Math.round(rect.width  * dpr);
    this.canvas.height = Math.round(rect.height * dpr);
    gl.viewport(0, 0, this.canvas.width, this.canvas.height);
  }

  _render(ts) {
    if (!this._isRunning) return;

    // Throttle to ~30fps to keep GPU load manageable
    if (this._lastTs !== null && ts - this._lastTs < 33) {
      this._rafId = requestAnimationFrame(ts => this._render(ts));
      return;
    }

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

  start() {
    if (this._isRunning || !this.gl) return;
    this._isRunning = true;
    this._lastTs = null;
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
}

// Export for manual use / build pipelines
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { CorruptedVortex };
}
