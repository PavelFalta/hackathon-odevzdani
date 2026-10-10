import type { NavigationPanel } from './navigationTypes'
import { openGoogleMapsTab } from './openGoogleMapsTab'
import {
  findReadyNavigationPlan,
  runExportNavigationMapScreenshot,
  runExportNavigationSteps,
} from './navigationExportRun'

type ExportScreenshotArgs = {
  window_id?: string
  google_maps_url?: string
}

function parseExportScreenshotArgs(raw: string): ExportScreenshotArgs {
  try {
    return JSON.parse(raw) as ExportScreenshotArgs
  } catch {
    return {}
  }
}

function parseWindowId(args: ExportScreenshotArgs): string | undefined {
  const id = args.window_id?.trim()
  return id || undefined
}

export async function agentExportRouteSteps(
  panels: NavigationPanel[],
  argumentsJson: string,
): Promise<string> {
  const args = parseExportScreenshotArgs(argumentsJson)
  const found = findReadyNavigationPlan(panels, parseWindowId(args))
  if (!found) {
    return JSON.stringify({ ok: false, error: 'no_ready_route' })
  }
  const result = runExportNavigationSteps(found.plan)
  return JSON.stringify({ ...result, window_id: found.panelId })
}

export async function agentExportRouteScreenshot(
  panels: NavigationPanel[],
  argumentsJson: string,
): Promise<string> {
  const args = parseExportScreenshotArgs(argumentsJson)
  const found = findReadyNavigationPlan(panels, parseWindowId(args))
  if (!found) {
    return JSON.stringify({ ok: false, error: 'no_ready_route' })
  }
  let google_maps_opened = false
  const mapsUrl = args.google_maps_url?.trim()
  if (mapsUrl) {
    google_maps_opened = openGoogleMapsTab(mapsUrl)
  }
  const result = await runExportNavigationMapScreenshot(found.plan)
  if (!result.ok) return JSON.stringify(result)
  return JSON.stringify({
    ...result,
    window_id: found.panelId,
    google_maps_opened,
  })
}
