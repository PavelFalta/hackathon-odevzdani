import {
  createContext,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react'
import { layoutWindowAtCorner, MAX_FLOATING_WINDOWS, pickEvictionId } from './floatingWindowCorners'
import {
  clampRectToViewport,
  clampWindowsToViewport,
  placeNewWindow,
  resizeWindowRect,
} from './floatingWindowLayout'
import { getFloatingViewport } from './floatingWindowViewport'
import type {
  FloatingAnchor,
  FloatingRect,
  FloatingWindowKind,
  FloatingWindowRecord,
} from './floatingWindowTypes'
import { bumpFloatingWindowZIndex } from './floatingWindowZIndex'

type RegisterInput = {
  id: string
  kind: FloatingWindowKind
  label: string
  anchor: FloatingAnchor
  defaultSize: Pick<FloatingRect, 'w' | 'h'>
  onClose?: () => void
}

type FloatingWindowsActions = {
  register: (input: RegisterInput) => () => void
  updateLabel: (id: string, label: string) => void
  updateMeasuredSize: (id: string, size: Pick<FloatingRect, 'w' | 'h'>) => void
  moveBy: (id: string, delta: { x: number; y: number }) => void
  travelTo: (id: string, position: { x: number; y: number }) => void
  endDrag: (id: string) => void
  bringToFront: (id: string) => void
  listWindows: () => { id: string; kind: FloatingWindowKind; label: string }[]
  closeWindow: (id: string) => boolean
}

export const FloatingWindowsActionsContext = createContext<FloatingWindowsActions | null>(null)
export const FloatingWindowsStateContext = createContext<FloatingWindowRecord[]>([])

export function FloatingWindowsProvider({ children }: { children: ReactNode }) {
  const [windows, setWindows] = useState<FloatingWindowRecord[]>([])
  const windowsRef = useRef(windows)
  windowsRef.current = windows
  const closersRef = useRef<Map<string, () => void>>(new Map())

  const register = useCallback((input: RegisterInput) => {
    setWindows((prev) => {
      let list = prev.filter((w) => w.id !== input.id)
      if (list.length >= MAX_FLOATING_WINDOWS) {
        const evictId = pickEvictionId(list, { id: input.id, kind: input.kind })
        if (evictId) {
          const evictCloser = closersRef.current.get(evictId)
          closersRef.current.delete(evictId)
          list = list.filter((w) => w.id !== evictId)
          if (evictCloser) queueMicrotask(() => evictCloser())
        }
      }
      const entry = placeNewWindow(list, input, bumpFloatingWindowZIndex())
      if (input.onClose) closersRef.current.set(input.id, input.onClose)
      return [...list, entry]
    })

    return () => {
      closersRef.current.delete(input.id)
      setWindows((prev) => prev.filter((w) => w.id !== input.id))
    }
  }, [])

  const updateLabel = useCallback((id: string, label: string) => {
    setWindows((prev) => prev.map((w) => (w.id === id ? { ...w, label } : w)))
  }, [])

  const updateMeasuredSize = useCallback((id: string, size: Pick<FloatingRect, 'w' | 'h'>) => {
    setWindows((prev) => {
      const self = prev.find((w) => w.id === id)
      if (!self) return prev
      const others = prev.filter((w) => w.id !== id)
      const rect = resizeWindowRect(self, others, size)
      if (
        rect.w === self.rect.w &&
        rect.h === self.rect.h &&
        rect.x === self.rect.x &&
        rect.y === self.rect.y
      ) {
        return prev
      }
      return prev.map((w) => (w.id === id ? { ...w, rect } : w))
    })
  }, [])

  const moveBy = useCallback((id: string, delta: { x: number; y: number }) => {
    const viewport = getFloatingViewport()
    setWindows((prev) =>
      prev.map((w) => {
        if (w.id !== id) return w
        const rect = clampRectToViewport(
          { ...w.rect, x: w.rect.x + delta.x, y: w.rect.y + delta.y },
          viewport,
        )
        return { ...w, rect, userStacked: true, zIndex: bumpFloatingWindowZIndex() }
      }),
    )
  }, [])

  const travelTo = useCallback((id: string, position: { x: number; y: number }) => {
    const viewport = getFloatingViewport()
    setWindows((prev) =>
      prev.map((w) => {
        if (w.id !== id) return w
        const rect = clampRectToViewport({ ...w.rect, x: position.x, y: position.y }, viewport)
        return { ...w, rect, userStacked: true, zIndex: bumpFloatingWindowZIndex() }
      }),
    )
  }, [])

  const endDrag = useCallback((id: string) => {
    const viewport = getFloatingViewport()
    setWindows((prev) =>
      prev.map((w) => {
        if (w.id !== id) return w
        if (w.userStacked) {
          return { ...w, rect: clampRectToViewport(w.rect, viewport) }
        }
        return layoutWindowAtCorner(w)
      }),
    )
  }, [])

  const bringToFront = useCallback((id: string) => {
    setWindows((prev) =>
      prev.map((w) => (w.id === id ? { ...w, zIndex: bumpFloatingWindowZIndex() } : w)),
    )
  }, [])

  const listWindows = useCallback(
    () => windowsRef.current.map((w) => ({ id: w.id, kind: w.kind, label: w.label })),
    [],
  )

  const closeWindow = useCallback((id: string) => {
    const close = closersRef.current.get(id)
    if (!close) return false
    close()
    return true
  }, [])

  useEffect(() => {
    function onResize() {
      setWindows((prev) => clampWindowsToViewport(prev))
    }
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [])

  const actions = useMemo(
    () => ({
      register,
      updateLabel,
      updateMeasuredSize,
      moveBy,
      travelTo,
      endDrag,
      bringToFront,
      listWindows,
      closeWindow,
    }),
    [
      register,
      updateLabel,
      updateMeasuredSize,
      moveBy,
      travelTo,
      endDrag,
      bringToFront,
      listWindows,
      closeWindow,
    ],
  )

  return (
    <FloatingWindowsActionsContext.Provider value={actions}>
      <FloatingWindowsStateContext.Provider value={windows}>
        {children}
      </FloatingWindowsStateContext.Provider>
    </FloatingWindowsActionsContext.Provider>
  )
}
