/** Axis-aligned bounds from `public/data/kvk-boundary.geojson` (northern/southern/eastern/western extrema). */
export const KVK_BOUNDS: [[number, number], [number, number]] = [
  [12.090655826881756, 49.890521978525065],
  [13.301826758606405, 50.46040361556867],
]

/** Cheb — default map focus */
export const CHEB_CENTER: [number, number] = [12.3736, 50.0736]

/** Wide regional view for opening panorama */
export const PANORAMA_START = {
  center: [12.72, 50.05] as [number, number],
  zoom: 8.4,
  pitch: 42,
  bearing: -48,
}

export const CHEB_VIEW = {
  center: CHEB_CENTER,
  zoom: 15.6,
  pitch: 62,
  bearing: -22,
}

export const PANORAMA_DURATION_MS = 5200
