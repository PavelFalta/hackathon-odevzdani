import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react'
import type { TimetableBoard } from './timetableTypes'
import { TIMETABLE_WINDOW_ID } from './timetableTypes'

type TimetableContextValue = {
  board: TimetableBoard | null
  show: (board: TimetableBoard) => string
  close: () => void
}

const TimetableContext = createContext<TimetableContextValue | null>(null)

export function TimetableProvider({ children }: { children: ReactNode }) {
  const [board, setBoard] = useState<TimetableBoard | null>(null)
  const show = useCallback((next: TimetableBoard) => {
    setBoard(next)
    return TIMETABLE_WINDOW_ID
  }, [])
  const close = useCallback(() => setBoard(null), [])
  const value = useMemo(() => ({ board, show, close }), [board, show, close])
  return <TimetableContext.Provider value={value}>{children}</TimetableContext.Provider>
}

export function useTimetable() {
  const ctx = useContext(TimetableContext)
  if (!ctx) throw new Error('useTimetable outside TimetableProvider')
  return ctx
}
