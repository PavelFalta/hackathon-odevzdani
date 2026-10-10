import { useLayoutEffect, useRef, type ReactNode } from 'react'
import { createPortal } from 'react-dom'
import type { FloatingWindowKind } from '../floating-windows/floatingWindowTypes'
import { useMobileDock } from './MobileDockContext'
import { kindFromDockSlotId } from './mobileDockSlotKind'
import { useIsMobileShell } from './useIsMobileShell'

type MobileDockPortalProps = {
  id: string
  label: string
  kind?: FloatingWindowKind
  open: boolean
  onClose?: () => void
  children: ReactNode
}

/** Renders panel content into the fixed bottom dock on mobile shells. */
export function MobileDockPortal({
  id,
  label,
  kind,
  open,
  onClose,
  children,
}: MobileDockPortalProps) {
  const mobile = useIsMobileShell()
  const dock = useMobileDock()
  const slotKind = kind ?? kindFromDockSlotId(id)

  const { register, unregister, setActiveId } = dock
  const onCloseRef = useRef(onClose)
  onCloseRef.current = onClose

  useLayoutEffect(() => {
    if (!mobile || !open) return undefined
    const isNew = register({
      id,
      label,
      kind: slotKind,
      onClose: () => onCloseRef.current?.(),
    })
    if (isNew) setActiveId(id)
    return () => unregister(id)
  }, [mobile, open, id, label, slotKind, register, unregister, setActiveId])

  if (!mobile || !open || !dock.portalTargetReady || !dock.bodyRef.current) return null

  const active = dock.activeId === id
  return createPortal(
    <div
      className="shell-dock__pane"
      data-dock-pane-id={id}
      data-active={active ? 'true' : 'false'}
      aria-hidden={!active}
    >
      {children}
    </div>,
    dock.bodyRef.current,
  )
}
