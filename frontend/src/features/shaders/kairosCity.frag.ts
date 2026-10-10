import { CITY_BLOCKS, CITY_COMMON } from './cityBlocks.glsl'

// Instance id = ((row * uCols + column) * 2 + sideBit). Rows run from the near plane toward the
// horizon, columns outward from the center. Instances are drawn in that order and the first
// fragment to survive wins (depth test LESS against a constant depth), which reproduces the
// old "nearer row first, then first column" loop. Empty / off-screen cells collapse to nothing.
export const CITY_VERTEX = `#version 300 es
precision highp float;
precision highp int;
uniform float uTime;
uniform vec2 uResolution;
uniform int uCols;
flat out vec3 vInst;
${CITY_COMMON}
void main() {
  int id = gl_InstanceID;
  float side = (id & 1) == 0 ? 1.0 : -1.0;
  int cellIdx = id >> 1;
  float ixm = float(cellIdx % uCols);
  float row = float(cellIdx / uCols);
  float scroll = uTime * C_SCROLL * uScrollMul;
  float i0 = ceil(4.0 * C_DEPTH / C_HORIZON - 0.325 - scroll);
  float iz = i0 + row;

  vec2 cell = vec2(side > 0.0 ? ixm : -1.0 - ixm, iz);
  gl_Position = vec4(2.0, 2.0, 2.0, 1.0);
  vInst = vec3(ixm, side, iz);
  if (cellHash(cell, 0.0) > 0.4) return;

  Block k = makeBlock(ixm, side, iz);
  float roofUp = step(k.a2.y, k.d2.y);
  vec2 lo = min(min(min(k.a, k.b), min(k.b2, k.a2)), min(k.d, k.d2));
  vec2 hi = max(max(max(k.a, k.b), max(k.b2, k.a2)), max(k.d, k.d2));
  if (roofUp > 0.5) {
    lo = min(lo, k.c2);
    hi = max(hi, k.c2);
  }

  // Glow only counts where hair() > 0.05, i.e. within ~1.7 px of an edge; 4 px is ample.
  float m = 4.0 / uResolution.y;
  float aspect = uResolution.x / uResolution.y;
  lo = vec2(max(lo.x - m, 0.0), lo.y - m);
  hi = hi + m;
  if (lo.x >= 0.5 * aspect + m || lo.x >= hi.x || hi.y < 0.0 || lo.y > 1.0) return;

  vec2 corner = vec2(float(gl_VertexID & 1), float(gl_VertexID >> 1));
  vec2 pp = mix(lo, hi, corner);
  gl_Position = vec4(pp.x * side / aspect * 2.0, pp.y * 2.0 - 1.0, 0.0, 1.0);
}
`

export const CITY_FRAGMENT = `#version 300 es
precision highp float;
precision highp int;
uniform float uTime;
uniform vec2 uResolution;
uniform ivec3 uHoverCells[6];
uniform float uHoverGlows[6];
flat in vec3 vInst;
out vec4 outColor;

float hair(float g) {
  return (1.0 - smoothstep(0.4, 1.2, g)) + 0.22 * exp(-g * 0.9);
}
${CITY_COMMON}
${CITY_BLOCKS}
void main() {
  vec3 cyan = vec3(0.435, 0.765, 0.875);
  vec2 uv = gl_FragCoord.xy / uResolution;
  float aspect = uResolution.x / uResolution.y;
  float pix = 1.0 / uResolution.y;
  float px = (uv.x - 0.5) * aspect;
  float side = px < 0.0 ? -1.0 : 1.0;
  if (side != vInst.y) discard;

  vec4 bk = blockAt(vec2(abs(px), uv.y), vInst.x, vInst.y, vInst.z, pix);
  if (max(bk.y, step(0.05, bk.x)) <= 0.5) discard;

  gl_FragDepth = 0.5;
  // round(), not int(x + 0.5): the latter truncates negatives the wrong way (iz scrolls below 0).
  ivec3 cell = ivec3(int(round(vInst.x)), int(round(vInst.y)), int(round(vInst.z)));
  float hover = 0.0;
  for (int i = 0; i < 6; i++) {
    hover = max(hover, uHoverGlows[i] * float(cell == uHoverCells[i]));
  }
  vec3 orange = vec3(0.953, 0.522, 0.094);
  vec3 base = mix(cyan, orange, hover * 0.92);
  float edge = min(bk.x, 1.0) * mix(0.55, 1.05, hover);
  outColor = vec4(base * edge, bk.z);
}
`

/** Encodes vInst into RGBA for gl.readPixels (same visibility rules as CITY_FRAGMENT). */
export const CITY_PICK_FRAGMENT = `#version 300 es
precision highp float;
precision highp int;
uniform float uTime;
uniform vec2 uResolution;
flat in vec3 vInst;
out vec4 outColor;

float hair(float g) {
  return (1.0 - smoothstep(0.4, 1.2, g)) + 0.22 * exp(-g * 0.9);
}
${CITY_COMMON}
${CITY_BLOCKS}
void main() {
  vec2 uv = gl_FragCoord.xy / uResolution;
  float aspect = uResolution.x / uResolution.y;
  float pix = 1.0 / uResolution.y;
  float px = (uv.x - 0.5) * aspect;
  float side = px < 0.0 ? -1.0 : 1.0;
  if (side != vInst.y) discard;

  vec4 bk = blockAt(vec2(abs(px), uv.y), vInst.x, vInst.y, vInst.z, pix);
  if (max(bk.y, step(0.05, bk.x)) <= 0.5) discard;

  gl_FragDepth = 0.5;
  int izi = int(round(vInst.z));
  int bits = izi < 0 ? izi + 65536 : izi;
  float sideA = vInst.y > 0.0 ? 1.0 : 0.4;
  outColor = vec4(
    vInst.x / 255.0,
    float(bits & 255) / 255.0,
    float((bits >> 8) & 255) / 255.0,
    sideA
  );
}
`
