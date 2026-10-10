function parseCssLengthPx(raw: string): number {
  if (raw.endsWith('dvh') || raw.endsWith('vh')) {
    const n = Number.parseFloat(raw)
    if (Number.isNaN(n)) return 0
    return Math.round((window.innerHeight * n) / 100)
  }
  const n = Number.parseFloat(raw)
  return Number.isNaN(n) ? 0 : Math.round(n)
}

/**
 * How many pixels of the map canvas are still covered by the mobile dock.
 * When the map host is already shortened above the dock, this is 0 so route
 * padding does not reserve that space a second time.
 */
export function readMobileMapBottomInsetPx(): number {
  if (typeof document === 'undefined') return 0
  const workspace = document.querySelector('.map-workspace--shell.map-workspace--mobile-dock')
  if (!workspace) return 0
  const raw =
    getComputedStyle(workspace).getPropertyValue('--mobile-dock-height').trim() || '45dvh'
  const dockPx = parseCssLengthPx(raw)
  if (dockPx <= 0) return 0

  const host = workspace.querySelector('.map-fixed-host')
  if (!host) return dockPx
  const rect = host.getBoundingClientRect()
  if (rect.height <= 0) return dockPx
  const dockTop = window.innerHeight - dockPx
  return Math.max(0, Math.round(rect.bottom - dockTop))
}
