import { buildGoogleMapsRouteUrl } from './googleMapsRouteUrl'
import { runExportNavigationMapScreenshot, runExportNavigationSteps } from './navigationExportRun'
import type { NavigationPlan } from './navigationTypes'

type NavigationToolbarProps = {
  plan: NavigationPlan
}

export function NavigationToolbar({ plan }: NavigationToolbarProps) {
  const googleUrl = buildGoogleMapsRouteUrl({
    fromLat: plan.fromLat,
    fromLon: plan.fromLon,
    toLat: plan.toLat,
    toLon: plan.toLon,
    profile: plan.profile,
  })

  return (
    <div className="navigation-panel__toolbar">
      <a
        className="navigation-panel__tool-btn"
        href={googleUrl}
        target="_blank"
        rel="noopener noreferrer"
      >
        Mapy Google
      </a>
      <button
        type="button"
        className="navigation-panel__tool-btn"
        onClick={() => {
          runExportNavigationSteps(plan)
        }}
      >
        Stáhnout kroky
      </button>
      <button
        type="button"
        className="navigation-panel__tool-btn"
        onClick={() => {
          void runExportNavigationMapScreenshot(plan)
        }}
      >
        Screenshot mapy
      </button>
    </div>
  )
}
