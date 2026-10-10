/** Screen-space radii (px) — circles use viewport pitch alignment. */
export const USER_LOCATION_MAP_RADII = {
  halo: 64,
  pulse: 30,
  ring: 17,
  core: 10,
} as const

export const USER_LOCATION_LAYER_IDS = {
  source: 'user-location',
  halo: 'user-location-halo',
  pulse: 'user-location-pulse',
  ring: 'user-location-ring',
  core: 'user-location-core',
} as const
