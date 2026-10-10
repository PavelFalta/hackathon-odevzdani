export function formatRouteDistance(meters: number): string {
  if (meters >= 1000) {
    const km = meters / 1000
    return km >= 10 ? `${Math.round(km)} km` : `${km.toFixed(1)} km`
  }
  return `${Math.round(meters)} m`
}

export function formatRouteDuration(seconds: number): string {
  const totalMin = Math.max(1, Math.round(seconds / 60))
  if (totalMin < 60) return `${totalMin} min`
  const h = Math.floor(totalMin / 60)
  const m = totalMin % 60
  return m > 0 ? `${h} hod ${m} min` : `${h} hod`
}

export function profileLabel(profile: string): string {
  switch (profile) {
    case 'walking':
      return 'Pěšky'
    case 'cycling':
      return 'Na kole'
    default:
      return 'Autem'
  }
}
