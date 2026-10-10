import { downloadBlob, downloadTextFile, formatNavigationStepsText } from './navigationExportText'
import { navigationMapCaptureRef } from './navigationMapCaptureRef'
import type { NavigationPanel, NavigationPlan } from './navigationTypes'

export function slugPart(label: string): string {
  return label
    .toLowerCase()
    .replace(/[^\p{L}\p{N}]+/gu, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 40)
}

export function findReadyNavigationPlan(
  panels: NavigationPanel[],
  windowId?: string,
): { panelId: string; plan: NavigationPlan } | null {
  const ready = panels.filter((p) => p.state.status === 'ready')
  if (ready.length === 0) return null
  if (windowId) {
    const match = ready.find((p) => p.id === windowId)
    if (!match || match.state.status !== 'ready') return null
    const { plan } = match.state
    return { panelId: match.id, plan }
  }
  const latest = ready[ready.length - 1]
  if (latest.state.status !== 'ready') return null
  return { panelId: latest.id, plan: latest.state.plan }
}

export function runExportNavigationSteps(plan: NavigationPlan): {
  ok: true
  filename: string
  step_count: number
} {
  const filename = `trasa-${slugPart(plan.fromLabel)}-${slugPart(plan.toLabel)}.txt`
  downloadTextFile(filename, formatNavigationStepsText(plan))
  return { ok: true, filename, step_count: plan.steps.length }
}

export async function runExportNavigationMapScreenshot(
  plan: NavigationPlan,
): Promise<{ ok: true; filename: string } | { ok: false; error: string }> {
  const capture = navigationMapCaptureRef.current
  if (!capture) return { ok: false, error: 'map_unavailable' }
  const blob = await capture()
  if (!blob) return { ok: false, error: 'screenshot_failed' }
  const filename = `mapa-trasy-${slugPart(plan.toLabel)}.png`
  downloadBlob(filename, blob)
  return { ok: true, filename }
}
