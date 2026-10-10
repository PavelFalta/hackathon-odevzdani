export const KAIROS_FRAGMENT = `#version 300 es
precision highp float;
uniform float uTime;
uniform vec2 uResolution;
uniform float uScrollMul;
out vec4 outColor;

// 1px hairline plus a short glow; g is the distance to the line in screen pixels.
float hair(float g) {
  return (1.0 - smoothstep(0.4, 1.2, g)) + 0.22 * exp(-g * 0.9);
}

// distance in pixels from a coordinate to its nearest integer
float gridDist(float f) {
  return abs(fract(f - 0.5) - 0.5) / max(fwidth(f), 1e-4);
}

void main() {
  vec2 uv = gl_FragCoord.xy / uResolution;
  float aspect = uResolution.x / uResolution.y;
  float px = (uv.x - 0.5) * aspect;

  vec3 cyan = vec3(0.435, 0.765, 0.875);
  vec3 col = vec3(0.0);

  float horizon = 0.22;
  float d = horizon - uv.y;

  // keep the middle third quiet, the grid lives in the margins
  float margin = mix(0.2, 1.0, smoothstep(0.2, 0.5, abs(px)));

  // horizon hairline
  col += cyan * hair(abs(uv.y - horizon) * uResolution.y) * 0.45 * margin;

  if (d > 0.0) {
    float z = 0.12 / d;
    float fog = smoothstep(0.0, 0.08, d);
    float gx = px * z * 8.0;
    float gz = z * 4.0 - uTime * 0.35 * uScrollMul;

    float lx = hair(gridDist(gx));
    float lz = hair(gridDist(gz));
    col += cyan * max(lx, lz) * 0.4 * fog * margin;
  }

  outColor = vec4(min(col, vec3(1.0)), 1.0);
}
`

export const KAIROS_VERTEX = `#version 300 es
in vec2 aPos;
void main() {
  gl_Position = vec4(aPos, 0.0, 1.0);
}
`
