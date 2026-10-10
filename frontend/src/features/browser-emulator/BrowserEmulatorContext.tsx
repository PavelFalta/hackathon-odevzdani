import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react'
import { browserUrlsMatch } from './browserUrlSame'
import { loadBrowserUrl } from './browserUrlLoad'
import { normalizeBrowserUrl } from './normalizeBrowserUrl'
import type { LoadUrlResult } from './useBrowserEmulatorLoad'

export type LoadUrlOptions = {
  openPanelOnSuccess?: boolean
  closePanelOnFailure?: boolean
}

export type BrowserLoadUrlResult = LoadUrlResult | { ok: true; panelId?: string; reused?: boolean }

export type BrowserPanelRef = {
  id: string
  initialUrl: string
}

export type BrowserEmulatorContextValue = {
  panels: BrowserPanelRef[]
  openEmpty: () => void
  close: (id: string) => void
  loadUrl: (url: string, options?: LoadUrlOptions) => Promise<BrowserLoadUrlResult>
}

const BrowserEmulatorContext = createContext<BrowserEmulatorContextValue | null>(null)

function newPanelId(): string {
  return `browser-${crypto.randomUUID()}`
}

export function BrowserEmulatorProvider({ children }: { children: ReactNode }) {
  const [panels, setPanels] = useState<BrowserPanelRef[]>([])
  const panelsRef = useRef(panels)
  panelsRef.current = panels

  const close = useCallback((id: string) => {
    setPanels((prev) => prev.filter((p) => p.id !== id))
  }, [])

  const openEmpty = useCallback(() => {
    setPanels((prev) => [...prev, { id: newPanelId(), initialUrl: '' }])
  }, [])

  const loadUrl = useCallback(
    async (url: string, options?: LoadUrlOptions): Promise<BrowserLoadUrlResult> => {
      const openOnSuccess = options?.openPanelOnSuccess ?? false
      if (openOnSuccess) {
        const normalized = normalizeBrowserUrl(url)
        if (normalized) {
          const existing = panelsRef.current.find((p) => browserUrlsMatch(p.initialUrl, normalized))
          if (existing) {
            return { ok: true, panelId: existing.id, reused: true }
          }
        }
      }
      const result = await loadBrowserUrl(url)
      if (!result.ok) return result
      if (openOnSuccess && result.payload) {
        const { activeUrl } = result.payload
        const existing = panelsRef.current.find((p) => browserUrlsMatch(p.initialUrl, activeUrl))
        if (existing) {
          return { ok: true, panelId: existing.id, reused: true }
        }
        const id = newPanelId()
        setPanels((prev) => [...prev, { id, initialUrl: activeUrl }])
        return { ok: true, panelId: id, reused: false }
      }
      return { ok: true }
    },
    [],
  )

  const value = useMemo(
    () => ({ panels, openEmpty, close, loadUrl }),
    [panels, openEmpty, close, loadUrl],
  )

  return <BrowserEmulatorContext.Provider value={value}>{children}</BrowserEmulatorContext.Provider>
}

export function useBrowserEmulator() {
  const ctx = useContext(BrowserEmulatorContext)
  if (!ctx) throw new Error('useBrowserEmulator outside BrowserEmulatorProvider')
  return ctx
}
