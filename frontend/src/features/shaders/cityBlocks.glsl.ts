// Block geometry shared by the instanced building pass (vertex + fragment).
// Floor numbers match the floor pass: horizon 0.22, z = 0.12 / d, gx = px * z * 8, gz = z * 4 - uTime * 0.35.
// Needs uTime in scope.
export const CITY_COMMON = `
const float C_HORIZON = 0.22;
const float C_DEPTH = 0.12;
const float C_SCROLL = 0.35;
uniform float uScrollMul;
uniform float uMature;

float cellHash(vec2 c, float k) {
  vec3 p = fract(vec3(c + k * vec2(37.1, 11.7), k) * 0.1031);
  p += dot(p, p.yzx + 33.33);
  return fract((p.x + p.y) * p.z);
}

struct Block {
  vec2 a, b, c, d, a2, b2, c2, d2;
  float zn;
  float fog;
};

// One box on cell (ixm, iz); coordinates are (|px|, y), so every block is a right-hand one.
Block makeBlock(float ixm, float side, float iz) {
  vec2 cell = vec2(side > 0.0 ? ixm : -1.0 - ixm, iz);

  float dep = mix(0.35, 0.8, cellHash(cell, 4.0));
  float w = mix(0.3, 0.75, cellHash(cell, 1.0));
  float x0 = ixm + 0.5 - 0.5 * w;
  float x1 = x0 + w;
  float scrollT = uTime * C_SCROLL * uScrollMul;
  float zn = (iz + 0.5 - 0.5 * dep + scrollT) * 0.25;
  float zf = zn + dep * 0.25;

  float hr = cellHash(cell, 2.0);
  float tall = step(0.86, hr);
  float hgt = mix(mix(0.03, 0.09, hr / 0.86), mix(0.2, 0.5, (hr - 0.86) / 0.14), tall);
  float growRaw = smoothstep(0.0, 3.0, 4.0 * zn - 4.0 * C_DEPTH / C_HORIZON);
  float grow = mix(growRaw, 1.0, uMature);

  // four ground corners, each with its own depth, then the same four raised by hgt * grow / z
  float yn = C_HORIZON - C_DEPTH / zn;
  float yf = C_HORIZON - C_DEPTH / zf;
  Block k;
  k.a = vec2(x0 / (8.0 * zn), yn);
  k.b = vec2(x1 / (8.0 * zn), yn);
  k.c = vec2(x1 / (8.0 * zf), yf);
  k.d = vec2(x0 / (8.0 * zf), yf);
  k.a2 = k.a + vec2(0.0, hgt * grow / zn);
  k.b2 = k.b + vec2(0.0, hgt * grow / zn);
  k.c2 = k.c + vec2(0.0, hgt * grow / zf);
  k.d2 = k.d + vec2(0.0, hgt * grow / zf);
  k.zn = zn;

  // fade in over the first two cell steps, alongside the growth
  float bornRaw = smoothstep(0.0, 2.0, 4.0 * zn - 4.0 * C_DEPTH / C_HORIZON);
  k.fog = smoothstep(0.006, 0.02, C_DEPTH / zn) * mix(bornRaw, 1.0, uMature);
  return k;
}
`

// Fragment-only part. Needs hair() in scope.
export const CITY_BLOCKS = `
float side2(vec2 a, vec2 b, vec2 p) {
  return (b.x - a.x) * (p.y - a.y) - (b.y - a.y) * (p.x - a.x);
}

float inQuad(vec2 p, vec2 a, vec2 b, vec2 c, vec2 d) {
  float s0 = side2(a, b, p);
  float s1 = side2(b, c, p);
  float s2 = side2(c, d, p);
  float s3 = side2(d, a, p);
  float lo = min(min(s0, s1), min(s2, s3));
  float hi = max(max(s0, s1), max(s2, s3));
  return (lo >= 0.0 || hi <= 0.0) ? 1.0 : 0.0;
}

// pixel distance from p to segment ab
float segPx(vec2 p, vec2 a, vec2 b, float pix) {
  vec2 pa = p - a;
  vec2 ba = b - a;
  float h = clamp(dot(pa, ba) / (dot(ba, ba) + 1e-9), 0.0, 1.0);
  return length(pa - ba * h) / pix;
}

// Returns (edge light, face coverage, opacity, near-face depth zn).
vec4 blockAt(vec2 p, float ixm, float side, float iz, float pix) {
  vec2 cell = vec2(side > 0.0 ? ixm : -1.0 - ixm, iz);
  if (cellHash(cell, 0.0) > 0.4) return vec4(0.0);

  Block k = makeBlock(ixm, side, iz);
  float roofUp = step(k.a2.y, k.d2.y);

  // front, roof (only when it is below eye level), and the side facing the card
  float face = inQuad(p, k.a, k.b, k.b2, k.a2);
  face = max(face, inQuad(p, k.a, k.d, k.d2, k.a2));
  face = max(face, inQuad(p, k.a2, k.b2, k.c2, k.d2) * roofUp);

  float e = segPx(p, k.a, k.b, pix);
  e = min(e, segPx(p, k.a, k.a2, pix));
  e = min(e, segPx(p, k.b, k.b2, pix));
  e = min(e, segPx(p, k.a2, k.b2, pix));
  e = min(e, segPx(p, k.a, k.d, pix));
  e = min(e, segPx(p, k.d, k.d2, pix));
  e = min(e, segPx(p, k.a2, k.d2, pix));
  e = min(e, mix(1e3, min(segPx(p, k.b2, k.c2, pix), segPx(p, k.c2, k.d2, pix)), roofUp));

  return vec4(hair(e), face, k.fog, k.zn);
}
`
