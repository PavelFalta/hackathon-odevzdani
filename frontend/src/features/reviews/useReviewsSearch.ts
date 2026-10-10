import { useCallback, useState } from 'react'
import { searchReviews } from '../../api/reviews'
import type { ReviewsResult } from './reviewsTypes'

export function useReviewsSearch() {
  const [result, setResult] = useState<ReviewsResult | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const search = useCallback(async (query: string) => {
    const trimmed = query.trim()
    if (!trimmed) {
      setError('Zadej název místa nebo adresu.')
      setResult(null)
      return false
    }

    setLoading(true)
    setError(null)
    setResult(null)
    try {
      const data = await searchReviews(trimmed)
      setResult(data)
      return true
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Recenze se nepodařilo načíst.')
      return false
    } finally {
      setLoading(false)
    }
  }, [])

  return { result, error, loading, search, clear: () => setResult(null) }
}
