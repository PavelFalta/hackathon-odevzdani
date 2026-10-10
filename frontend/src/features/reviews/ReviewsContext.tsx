import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react'
import { reviewsQueryKey } from './reviewsQueryKey'

export type ReviewsPanelRef = {
  id: string
  query: string
}

export type OpenReviewsResult = {
  id: string
  reused: boolean
}

export type ReviewsContextValue = {
  panels: ReviewsPanelRef[]
  open: (query: string) => string
  openForQuery: (query: string) => OpenReviewsResult
  close: (id: string) => void
}

const ReviewsContext = createContext<ReviewsContextValue | null>(null)

function newPanelId(): string {
  return `reviews-${crypto.randomUUID()}`
}

export function ReviewsProvider({ children }: { children: ReactNode }) {
  const [panels, setPanels] = useState<ReviewsPanelRef[]>([])
  const panelsRef = useRef(panels)
  panelsRef.current = panels

  const openForQuery = useCallback((query: string): OpenReviewsResult => {
    const trimmed = query.trim()
    const key = reviewsQueryKey(trimmed)
    const existing = panelsRef.current.find((p) => reviewsQueryKey(p.query) === key)
    if (existing) return { id: existing.id, reused: true }
    const id = newPanelId()
    setPanels((prev) => [...prev, { id, query: trimmed }])
    return { id, reused: false }
  }, [])

  const open = useCallback((query: string) => openForQuery(query).id, [openForQuery])

  const close = useCallback((id: string) => {
    setPanels((prev) => prev.filter((p) => p.id !== id))
  }, [])

  const value = useMemo(
    () => ({ panels, open, openForQuery, close }),
    [panels, open, openForQuery, close],
  )

  return <ReviewsContext.Provider value={value}>{children}</ReviewsContext.Provider>
}

export function useReviews() {
  const ctx = useContext(ReviewsContext)
  if (!ctx) throw new Error('useReviews outside ReviewsProvider')
  return ctx
}
