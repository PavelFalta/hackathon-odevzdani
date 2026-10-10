import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
  type RefObject,
} from 'react'
import { MAX_FLOATING_WINDOWS, pickEvictionId } from '../floating-windows/floatingWindowCorners'
import type { FloatingWindowKind, FloatingWindowRecord } from '../floating-windows/floatingWindowTypes'

type SlotRecord = {
  id: string
  label: string
  kind: FloatingWindowKind
}

export type MobileDockSlotInput = {
  id: string
  label: string
  kind: FloatingWindowKind
  onClose?: () => void
}

type MobileDockContextValue = {
  bodyRef: RefObject<HTMLDivElement | null>
  portalTargetReady: boolean
  attachBodyElement: (el: HTMLDivElement | null) => void
  slots: SlotRecord[]
  activeId: string | null
  /** Returns true when the slot was newly added (not a label refresh). */
  register: (slot: MobileDockSlotInput) => boolean
  unregister: (id: string) => void
  setActiveId: (id: string) => void
  listSlots: () => { id: string; kind: FloatingWindowKind; label: string }[]
  closeSlot: (id: string) => boolean
  dockOpen: boolean
}

const MobileDockContext = createContext<MobileDockContextValue | null>(null)

function slotsAsWindowRecords(slots: SlotRecord[]): FloatingWindowRecord[] {
  return slots.map((slot, index) => ({
    id: slot.id,
    kind: slot.kind,
    label: slot.label,
    anchor: 'bottom-left',
    rect: { x: 0, y: 0, w: 100, h: 100 },
    zIndex: index,
    userStacked: false,
  }))
}

export function MobileDockProvider({ children }: { children: ReactNode }) {
  const bodyRef = useRef<HTMLDivElement | null>(null)
  const [portalTargetReady, setPortalTargetReady] = useState(false)
  const [slots, setSlots] = useState<SlotRecord[]>([])
  const slotsRef = useRef(slots)
  slotsRef.current = slots
  const [activeId, setActiveIdState] = useState<string | null>(null)
  const closersRef = useRef<Map<string, () => void>>(new Map())

  const attachBodyElement = useCallback((el: HTMLDivElement | null) => {
    bodyRef.current = el
    setPortalTargetReady(el !== null)
  }, [])

  const register = useCallback((slot: MobileDockSlotInput): boolean => {
    if (slot.onClose) closersRef.current.set(slot.id, slot.onClose)
    else closersRef.current.delete(slot.id)

    const prev = slotsRef.current
    const exists = prev.some((s) => s.id === slot.id)
    if (exists) {
      const current = prev.find((s) => s.id === slot.id)
      if (current && current.label === slot.label && current.kind === slot.kind) {
        return false
      }
      const next = prev.map((s) =>
        s.id === slot.id ? { ...s, label: slot.label, kind: slot.kind } : s,
      )
      slotsRef.current = next
      setSlots(next)
      return false
    }

    let list = prev
    while (list.length >= MAX_FLOATING_WINDOWS) {
      const evictId = pickEvictionId(slotsAsWindowRecords(list), {
        id: slot.id,
        kind: slot.kind,
      })
      if (!evictId) break
      const evictCloser = closersRef.current.get(evictId)
      closersRef.current.delete(evictId)
      list = list.filter((s) => s.id !== evictId)
      if (evictCloser) queueMicrotask(() => evictCloser())
    }
    const next = [...list, { id: slot.id, label: slot.label, kind: slot.kind }]
    slotsRef.current = next
    setSlots(next)
    return true
  }, [])

  const unregister = useCallback((id: string) => {
    closersRef.current.delete(id)
    const next = slotsRef.current.filter((s) => s.id !== id)
    slotsRef.current = next
    setSlots(next)
  }, [])

  const setActiveId = useCallback((id: string) => {
    setActiveIdState(id)
  }, [])

  const listSlots = useCallback(
    () => slots.map((s) => ({ id: s.id, kind: s.kind, label: s.label })),
    [slots],
  )

  const closeSlot = useCallback((id: string) => {
    const close = closersRef.current.get(id)
    if (!close) return false
    close()
    return true
  }, [])

  useEffect(() => {
    if (!activeId) return
    if (slots.some((s) => s.id === activeId)) return
    setActiveIdState(slots[slots.length - 1]?.id ?? null)
  }, [slots, activeId])

  const value = useMemo(
    () => ({
      bodyRef,
      portalTargetReady,
      attachBodyElement,
      slots,
      activeId,
      register,
      unregister,
      setActiveId,
      listSlots,
      closeSlot,
      dockOpen: slots.length > 0,
    }),
    [
      portalTargetReady,
      attachBodyElement,
      slots,
      activeId,
      register,
      unregister,
      setActiveId,
      listSlots,
      closeSlot,
    ],
  )

  return <MobileDockContext.Provider value={value}>{children}</MobileDockContext.Provider>
}

export function useMobileDock(): MobileDockContextValue {
  const ctx = useContext(MobileDockContext)
  if (!ctx) throw new Error('useMobileDock requires MobileDockProvider')
  return ctx
}

export function useMobileDockOptional(): MobileDockContextValue | null {
  return useContext(MobileDockContext)
}
