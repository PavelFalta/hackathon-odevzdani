import { useCallback, useEffect, useState } from 'react'
import {
  fetchAdminAnalytics,
  type AdminAnalytics,
  type AdminAnalyticsParams,
} from '../../api/admin'

export function useAdminAnalytics(params: AdminAnalyticsParams) {
  const [data, setData] = useState<AdminAnalytics | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  const reload = useCallback(() => {
    setLoading(true)
    setError(null)
    fetchAdminAnalytics(params)
      .then(setData)
      .catch(() => setError('Nepodařilo se načíst analytiku.'))
      .finally(() => setLoading(false))
  }, [params.period, params.from, params.to, params.username])

  useEffect(() => {
    reload()
  }, [reload])

  return { data, error, loading, reload }
}
