const GOOGLE_MAPS_PREFIX = 'https://www.google.com/maps/'

export function openGoogleMapsTab(url: string): boolean {
  const trimmed = url.trim()
  if (!trimmed.startsWith(GOOGLE_MAPS_PREFIX)) return false
  window.open(trimmed, '_blank', 'noopener,noreferrer')
  return true
}
