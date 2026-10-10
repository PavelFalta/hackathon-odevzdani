import { useCallback, type PointerEvent as ReactPointerEvent } from 'react'

type Point = { x: number; y: number }

export function useThresholdPointer(options: {
  onDrag: (delta: Point) => void
  onDragEnd?: () => void
  onTap?: () => void
  threshold?: number
}) {
  const { onDrag, onDragEnd, onTap, threshold = 8 } = options

  const onPointerDown = useCallback(
    (event: ReactPointerEvent<HTMLElement>) => {
      if (event.button !== 0) return
      const start = { x: event.clientX, y: event.clientY }
      let last = { ...start }
      let dragged = false

      const onMove = (moveEvent: PointerEvent) => {
        if (
          !dragged &&
          Math.hypot(moveEvent.clientX - start.x, moveEvent.clientY - start.y) >= threshold
        ) {
          dragged = true
        }
        if (!dragged) return
        onDrag({ x: moveEvent.clientX - last.x, y: moveEvent.clientY - last.y })
        last = { x: moveEvent.clientX, y: moveEvent.clientY }
      }

      const onUp = () => {
        window.removeEventListener('pointermove', onMove)
        window.removeEventListener('pointerup', onUp)
        if (dragged) onDragEnd?.()
        else onTap?.()
      }

      window.addEventListener('pointermove', onMove)
      window.addEventListener('pointerup', onUp)
    },
    [onDrag, onDragEnd, onTap, threshold],
  )

  return { onPointerDown }
}
