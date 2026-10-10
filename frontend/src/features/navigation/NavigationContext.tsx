import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react'
import type {
  NavigationPanel,
  NavigationPlanState,
  NavigationRouteRequest,
} from './navigationTypes'

export type NavigationContextValue = {
  panels: NavigationPanel[]
  open: (request: NavigationRouteRequest) => string
  close: (id: string) => void
  setPanelState: (id: string, state: NavigationPlanState) => void
}

const NavigationContext = createContext<NavigationContextValue | null>(null)

function newPanelId(): string {
  return `navigation-${crypto.randomUUID()}`
}

export function NavigationProvider({ children }: { children: ReactNode }) {
  const [panels, setPanels] = useState<NavigationPanel[]>([])

  const open = useCallback((request: NavigationRouteRequest) => {
    const id = newPanelId()
    setPanels((prev) => [...prev, { id, request, state: { status: 'loading' } }])
    return id
  }, [])

  const close = useCallback((id: string) => {
    setPanels((prev) => prev.filter((p) => p.id !== id))
  }, [])

  const setPanelState = useCallback((id: string, state: NavigationPlanState) => {
    setPanels((prev) => prev.map((p) => (p.id === id ? { ...p, state } : p)))
  }, [])

  const value = useMemo(
    () => ({ panels, open, close, setPanelState }),
    [panels, open, close, setPanelState],
  )

  return <NavigationContext.Provider value={value}>{children}</NavigationContext.Provider>
}

export function useNavigation() {
  const ctx = useContext(NavigationContext)
  if (!ctx) throw new Error('useNavigation outside NavigationProvider')
  return ctx
}
