export type UserLocationFix = {
  lon: number
  lat: number
  source: 'gps' | 'manual'
  label?: string
}

export type UserLocationInputReason =
  'imprecise' | 'denied' | 'unavailable' | 'out_of_region' | 'not_found'
