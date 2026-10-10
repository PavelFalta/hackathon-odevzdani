import {
  useCallback,
  useEffect,
  useRef,
  type CSSProperties,
  type PointerEvent as ReactPointerEvent,
  type RefObject,
} from 'react'
import { usePanelDrag } from '../browser-emulator/usePanelDrag'
import type { FloatingAnchor, FloatingWindowKind } from './floatingWindowTypes'
import { useFloatingWindowRecord, useFloatingWindowsActions } from './floatingWindowsHooks'

type Options = {
  id: string
  kind: FloatingWindowKind
  label: string
  anchor: FloatingAnchor
  defaultSize: { w: number; h: number }
  onClose?: () => void
  enabled?: boolean
}

export function useManagedFloatingWindow(options: Options): {
  panelRef: RefObject<HTMLElement | null>
  style: CSSProperties
  drag: {
    onPointerDown: (event: ReactPointerEvent<HTMLElement>) => void
  }
} {
  const actions = useFloatingWindowsActions()
  const win = useFloatingWindowRecord(options.id)
  const panelRef = useRef<HTMLElement | null>(null)
  const { id, label, onClose, kind, anchor, defaultSize, enabled = true } = options
  const onCloseRef = useRef(onClose)
  onCloseRef.current = onClose

  useEffect(() => {
    if (!enabled) return undefined
    return actions.register({
      id,
      kind,
      anchor,
      defaultSize,
      label,
      onClose: () => onCloseRef.current?.(),
    })
  }, [actions.register, id, kind, anchor, defaultSize.w, defaultSize.h, enabled])

  useEffect(() => {
    actions.updateLabel(id, label)
  }, [actions.updateLabel, id, label])

  useEffect(() => {
    const el = panelRef.current
    if (!el) return
    const ro = new ResizeObserver(() => {
      const rect = el.getBoundingClientRect()
      if (rect.width > 0 && rect.height > 0) {
        actions.updateMeasuredSize(id, { w: rect.width, h: rect.height })
      }
    })
    ro.observe(el)
    return () => ro.disconnect()
  }, [actions.updateMeasuredSize, id])

  const onDrag = useCallback(
    (delta: { x: number; y: number }) => {
      actions.moveBy(id, delta)
    },
    [actions.moveBy, id],
  )

  const endDrag = useCallback(() => {
    actions.endDrag(id)
  }, [actions.endDrag, id])

  const drag = usePanelDrag(onDrag, endDrag)

  const onPointerDown = useCallback(
    (event: ReactPointerEvent<HTMLElement>) => {
      actions.bringToFront(id)
      drag.onPointerDown(event)
    },
    [actions.bringToFront, drag, id],
  )

  const style: CSSProperties = win
    ? {
        position: 'fixed',
        left: win.rect.x,
        top: win.rect.y,
        width: win.rect.w,
        height: win.rect.h,
        boxSizing: 'border-box',
        zIndex: win.zIndex,
      }
    : { position: 'fixed', visibility: 'hidden', pointerEvents: 'none' }

  return {
    panelRef,
    style,
    drag: { onPointerDown },
  }
}
