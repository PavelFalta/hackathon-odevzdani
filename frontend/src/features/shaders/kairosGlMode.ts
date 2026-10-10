export type KairosGlOptions = {
  buildingHover?: boolean
  /** Static mature skyline: no scroll or build-in (map boot overlay). */
  ambient?: boolean
}

export function resolveKairosGlMode(options: KairosGlOptions = {}) {
  const ambient = options.ambient ?? false
  return {
    ambient,
    buildingHover: ambient ? false : (options.buildingHover ?? false),
    scrollMul: ambient ? 0 : 1,
    mature: ambient ? 1 : 0,
  }
}
