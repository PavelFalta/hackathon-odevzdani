/** Share of the load spent on basemap setup before tile viewpoints. */
const SETUP_SHARE = 0.15

export function mapBootLoadFraction(finishedStops: number, totalStops: number) {
  const preload = totalStops <= 0 ? 1 : Math.min(1, finishedStops / totalStops)
  return Math.min(1, SETUP_SHARE + preload * (1 - SETUP_SHARE))
}
