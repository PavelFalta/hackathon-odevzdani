import { useContext } from 'react'
import {
  FloatingWindowsActionsContext,
  FloatingWindowsStateContext,
} from './FloatingWindowsContext'
import type { FloatingWindowRecord } from './floatingWindowTypes'

export function useFloatingWindowsActions() {
  const ctx = useContext(FloatingWindowsActionsContext)
  if (!ctx) throw new Error('useFloatingWindowsActions outside FloatingWindowsProvider')
  return ctx
}

export function useFloatingWindowRecord(id: string): FloatingWindowRecord | undefined {
  const windows = useContext(FloatingWindowsStateContext)
  return windows.find((w) => w.id === id)
}

export function useFloatingWindowsState(): FloatingWindowRecord[] {
  return useContext(FloatingWindowsStateContext)
}

/** @deprecated Prefer useFloatingWindowsActions + useFloatingWindowRecord */
export function useFloatingWindows() {
  const actions = useFloatingWindowsActions()
  const windows = useContext(FloatingWindowsStateContext)
  return {
    ...actions,
    getWindow: (windowId: string) => windows.find((w) => w.id === windowId),
  }
}
