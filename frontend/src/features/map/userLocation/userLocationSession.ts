import type { UserLocationFix } from './userLocationTypes'

const FIX_KEY = 'kairos-user-location-v1'

export function readStoredUserLocation(): UserLocationFix | null {
  try {
    const raw = sessionStorage.getItem(FIX_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw) as UserLocationFix
    if (!Number.isFinite(parsed.lon) || !Number.isFinite(parsed.lat)) return null
    if (parsed.source !== 'gps' && parsed.source !== 'manual') return null
    return parsed
  } catch {
    return null
  }
}

export function writeStoredUserLocation(fix: UserLocationFix): void {
  sessionStorage.setItem(FIX_KEY, JSON.stringify(fix))
}
