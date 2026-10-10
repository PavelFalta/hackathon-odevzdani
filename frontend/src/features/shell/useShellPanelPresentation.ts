import { useIsMobileShell } from './useIsMobileShell'
import { useManagedFloatingWindow } from '../floating-windows/useManagedFloatingWindow'
import type { FloatingAnchor, FloatingWindowKind } from '../floating-windows/floatingWindowTypes'

type Options = {
  id: string
  kind: FloatingWindowKind
  label: string
  anchor: FloatingAnchor
  defaultSize: { w: number; h: number }
  onClose?: () => void
  enabled?: boolean
  /** When true, open panels use the bottom dock instead of floating windows on mobile. */
  dockOnMobile?: boolean
}

export function useShellPanelPresentation(options: Options) {
  const mobile = useIsMobileShell()
  const {
    dockOnMobile = true,
    enabled = true,
    id,
    kind,
    label,
    anchor,
    defaultSize,
    onClose,
  } = options

  const docked = mobile && dockOnMobile && enabled

  const floating = useManagedFloatingWindow({
    id,
    kind,
    label,
    anchor,
    defaultSize,
    onClose,
    enabled: enabled && !docked,
  })

  return {
    docked,
    panelRef: floating.panelRef,
    style: docked ? undefined : floating.style,
    drag: docked ? { onPointerDown: () => undefined } : floating.drag,
  }
}
