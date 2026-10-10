import type { NavigationPlan } from './navigationTypes'
import { formatRouteDistance, formatRouteDuration, profileLabel } from './navigationFormat'
import { buildGoogleMapsRouteUrl } from './googleMapsRouteUrl'

export function formatNavigationStepsText(plan: NavigationPlan): string {
  const lines = [
    `Trasa: ${plan.fromLabel} → ${plan.toLabel}`,
    `Režim: ${profileLabel(plan.profile)}`,
    `Celkem: ${formatRouteDistance(plan.distance_m)}, ${formatRouteDuration(plan.duration_s)}`,
    '',
    'Kroky:',
  ]
  plan.steps.forEach((step, index) => {
    const street = step.name ? ` (${step.name})` : ''
    lines.push(
      `${index + 1}. ${step.instruction}${street} — ${formatRouteDistance(step.distance_m)}`,
    )
  })
  lines.push('')
  lines.push(
    `Mapy Google: ${buildGoogleMapsRouteUrl({
      fromLat: plan.fromLat,
      fromLon: plan.fromLon,
      toLat: plan.toLat,
      toLon: plan.toLon,
      profile: plan.profile,
    })}`,
  )
  return lines.join('\n')
}

export function downloadTextFile(filename: string, text: string): void {
  const blob = new Blob([text], { type: 'text/plain;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = filename
  anchor.click()
  URL.revokeObjectURL(url)
}

export function downloadBlob(filename: string, blob: Blob): void {
  const url = URL.createObjectURL(blob)
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = filename
  anchor.click()
  URL.revokeObjectURL(url)
}
