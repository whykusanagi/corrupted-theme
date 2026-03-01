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
