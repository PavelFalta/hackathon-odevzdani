/** Geographic bearing from point A to B (degrees, 0 = north). */
export function geographicBearingDeg(
  fromLon: number,
  fromLat: number,
  toLon: number,
  toLat: number,
): number {
  const φ1 = (fromLat * Math.PI) / 180
  const φ2 = (toLat * Math.PI) / 180
  const Δλ = ((toLon - fromLon) * Math.PI) / 180
  const y = Math.sin(Δλ) * Math.cos(φ2)
  const x = Math.cos(φ1) * Math.sin(φ2) - Math.sin(φ1) * Math.cos(φ2) * Math.cos(Δλ)
  const deg = (Math.atan2(y, x) * 180) / Math.PI
  return ((deg % 360) + 360) % 360
}

/** Map bearing so the route runs left (start) → right (finish) on screen. */
export function mapBearingForRouteLeftToRight(
  fromLon: number,
  fromLat: number,
  toLon: number,
  toLat: number,
): number {
  const along = geographicBearingDeg(fromLon, fromLat, toLon, toLat)
  return along - 90
}
