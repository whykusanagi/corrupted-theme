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
    const dpr  = Math.min(window.devicePixelRatio || 1, 2.0);
    const rect = this.canvas.getBoundingClientRect();
    if (rect.width === 0 || rect.height === 0) return;
    this.canvas.width  = Math.round(rect.width  * dpr);
    this.canvas.height = Math.round(rect.height * dpr);
    gl.viewport(0, 0, this.canvas.width, this.canvas.height);
  }

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
