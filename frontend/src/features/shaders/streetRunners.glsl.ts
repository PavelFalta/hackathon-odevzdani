// Spliced into KAIROS_FRAGMENT after CITY_BLOCKS. Uses uTime, uResolution, hair(), and the C_* camera
// constants and cellHash() from CITY_BLOCKS. Block cells are occupied when cellHash(cell, 0.0) <= 0.4.
export const STREET_RUNNERS = `
const vec3 R_ORANGE = vec3(0.953, 0.522, 0.094);
// Fixed screen depth s = 4 * z of both orbs: z = 1.0, just past where blocks are born (s = 2.18).
const float R_S = 4.0;
// World height of the head above its street, so it floats above the floor lines.
const float R_LIFT = 0.03;
// How far the beam runs toward the horizon, in screen depth s.
const float R_BEAM = 6.0;

bool taken(float cx, float r, float side) {
  return cellHash(vec2(side > 0.0 ? cx : -1.0 - cx, r), 0.0) <= 0.4;
}

// Column the orb sits in while the world row n is at its depth. It needs rows n (the cell under it)
// and n - 1 (the next cell to arrive) free. The band is |uv.x - 0.5| from 0.03 to 0.36. A target
// sweeps across it with sin(uTime); the orb sits at the target, or at the nearest free column.
// Returns the world x of the orb (cell centers are at c + 0.5).
float runnerX(float n, float side, float aspect) {
  float cmin = max(ceil(0.03 * 2.0 * aspect * R_S - 0.5), 0.0);
  float cmax = max(floor(0.36 * 2.0 * aspect * R_S - 0.5), cmin);
  float phase = side < 0.0 ? 0.0 : 1.7;
  float xt = mix(cmin + 0.15, cmax + 0.85, 0.5 + 0.5 * sin(uTime * 1.25 + phase));
  float best = xt;
  float bestD = 1e3;
  for (int i = 0; i < 16; i++) {
    float c = cmin + float(i);
    if (c > cmax) break;
    float d = max(max(c + 0.15 - xt, xt - (c + 0.85)), 0.0);
    if (d < bestD && !taken(c, n, side) && !taken(c, n - 1.0, side)) {
      bestD = d;
      best = clamp(xt, c + 0.15, c + 0.85);
    }
  }
  return best;
}

// (pixel distance to segment ab, position along it)
vec2 segHit(vec2 p, vec2 a, vec2 b, float pix) {
  vec2 pa = p - a;
  vec2 ba = b - a;
  float h = clamp(dot(pa, ba) / (dot(ba, ba) + 1e-9), 0.0, 1.0);
  return vec2(length(pa - ba * h) / pix, h);
}

// One orb: white-hot head with a wide glow, and one thin beam on its street toward the horizon.
// Returns (color, coverage); coverage is how much it replaces the floor behind it.
vec4 runner(vec2 p, float pix, float aspect, float side) {
  float z = R_S * 0.25;
  float g = R_S - C_SCROLL * uTime;
  float n = floor(g + 0.5);
  float x = mix(runnerX(n - 1.0, side, aspect), runnerX(n, side, aspect), smoothstep(-0.25, 0.25, g - n));

  vec2 q = vec2(side * x / (8.0 * z), C_HORIZON - (C_DEPTH - R_LIFT) / z);
  float ze = (R_S + R_BEAM) * 0.25;
  vec2 qe = vec2(side * x / (8.0 * ze), C_HORIZON - (C_DEPTH - R_LIFT) / ze);

  float r0 = max(0.0105 / z / pix, 2.7);
  float d0 = length(p - q) / pix;
  float disc = 1.0 - smoothstep(r0 * 0.8, r0 * 1.05, d0);
  float halo = 1.6 * exp(-d0 / (r0 * 2.2 + 6.0));
  float white = 1.0 - smoothstep(0.0, r0 * 0.4, d0);

  vec2 sd = segHit(p, q, qe, pix);
  float thin = sd.x * (1.0 + 2.0 * sd.y);
  float beam = (hair(thin) + 0.25 * exp(-thin / 4.0)) * (1.0 - sd.y) * (1.0 - sd.y);

  vec3 color = mix(R_ORANGE * 2.2, vec3(1.0), white);
  return vec4(color, clamp(disc + halo + beam, 0.0, 1.0));
}

// Two orbs at one fixed depth, one per side, sliding sideways around blocks.
vec4 streetRunners(vec2 uv) {
  float aspect = uResolution.x / uResolution.y;
  vec2 p = vec2((uv.x - 0.5) * aspect, uv.y);
  float pix = 1.0 / uResolution.y;
  vec4 a = runner(p, pix, aspect, -1.0);
  vec4 b = runner(p, pix, aspect, 1.0);
  return vec4(mix(a.rgb, b.rgb, b.a / (a.a + b.a + 1e-4)), max(a.a, b.a));
}
`
