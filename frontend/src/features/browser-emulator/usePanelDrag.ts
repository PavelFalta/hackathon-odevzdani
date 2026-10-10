import { useCallback, useRef, type PointerEvent as ReactPointerEvent } from 'react'
import {
  resumeMapForFloatingPanelDrag,
  suspendMapForFloatingPanelDrag,
} from '../map/mapFloatingPanelDragGuard'

type Point = { x: number; y: number }

export function usePanelDrag(onMove: (point: Point) => void, onEnd?: () => void) {
  const dragging = useRef(false)
  const offset = useRef<Point>({ x: 0, y: 0 })

  const onPointerDown = useCallback(
    (event: ReactPointerEvent<HTMLElement>) => {
      if (event.button !== 0) return
      const target = event.currentTarget
      dragging.current = true
      offset.current = { x: event.clientX, y: event.clientY }
      event.preventDefault()
      event.stopPropagation()
      target.setPointerCapture(event.pointerId)
      suspendMapForFloatingPanelDrag()

      function onPointerMove(moveEvent: PointerEvent) {
        if (!dragging.current) return
        moveEvent.preventDefault()
        const dx = moveEvent.clientX - offset.current.x
        const dy = moveEvent.clientY - offset.current.y
        offset.current = { x: moveEvent.clientX, y: moveEvent.clientY }
        onMove({ x: dx, y: dy })
      }

      function finish() {
        if (!dragging.current) return
        dragging.current = false
        resumeMapForFloatingPanelDrag()
        if (target.hasPointerCapture(event.pointerId)) {
          target.releasePointerCapture(event.pointerId)
        }
        window.removeEventListener('pointermove', onPointerMove)
        window.removeEventListener('pointerup', finish)
        window.removeEventListener('pointercancel', finish)
        onEnd?.()
      }

      window.addEventListener('pointermove', onPointerMove)
      window.addEventListener('pointerup', finish)
      window.addEventListener('pointercancel', finish)
    },
    [onMove, onEnd],
  )

  return { onPointerDown }
}
