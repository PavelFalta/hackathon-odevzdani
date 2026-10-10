import { useEffect } from 'react'
import { searchReviews } from '../../../api/reviews'
import { useBrowserEmulator } from '../../browser-emulator/BrowserEmulatorContext'
import { hasPlacePhotos, reviewsToPlacePhotosInput } from '../../reviews/openPlacePhotosFromReviews'
import { usePlacePhotos } from '../../reviews/PlacePhotosContext'
import { useReviews } from '../../reviews/ReviewsContext'
import { registerAgentAction } from './agentActionsRef'
import { onlineDataSource } from '../realtime/agentDataSource'
import { runKnowledgeTool } from '../realtime/runKnowledgeTool'
import { normalizeBrowserUrl } from '../../browser-emulator/normalizeBrowserUrl'

export function BrowserReviewsAgentBridge() {
  const browser = useBrowserEmulator()
  const reviews = useReviews()
  const placePhotos = usePlacePhotos()

  useEffect(() => {
    const unregisters = [
      registerAgentAction('searchKnowledge', runKnowledgeTool),
      registerAgentAction('openWebsite', async (url) => {
        const normalized = normalizeBrowserUrl(url)
        if (!normalized) {
          return JSON.stringify({ ok: false, error: 'invalid_url' })
        }
        const result = await browser.loadUrl(normalized, {
          openPanelOnSuccess: true,
          closePanelOnFailure: true,
        })
        if (!result.ok) {
          return JSON.stringify({
            ok: false,
            error: result.code,
            reason: result.reason,
            url: normalized,
          })
        }
        const panelId = 'panelId' in result ? result.panelId : undefined
        const reused = 'reused' in result && result.reused === true
        return JSON.stringify({
          ok: true,
          url: normalized,
          window_id: panelId,
          reused,
        })
      }),
      registerAgentAction('fetchPlaceReviews', async (query) => {
        const trimmed = query.trim()
        if (!trimmed) return JSON.stringify({ ok: false, error: 'query_required' })
        const { id: windowId, reused } = reviews.openForQuery(trimmed)
        if (reused) {
          return JSON.stringify({
            ok: true,
            reused: true,
            window_id: windowId,
            place_name: trimmed,
          })
        }
        try {
          const data = await searchReviews(trimmed)
          let photosOpened = false
          if (hasPlacePhotos(data)) {
            placePhotos.openForPlace(reviewsToPlacePhotosInput(data))
            photosOpened = true
          }
          const sample = data.reviews.slice(0, 3).map((r) => ({
            rating: r.rating,
            text: r.text.slice(0, 280),
            author: r.author,
          }))
          return JSON.stringify({
            ok: true,
            data_source: onlineDataSource(true),
            window_id: windowId,
            photos_window_opened: photosOpened,
            photo_count: data.photos.length,
            place_name: data.place_name,
            rating: data.rating,
            review_count: data.rating_count,
            sample_reviews: sample,
          })
        } catch (err) {
          return JSON.stringify({
            ok: false,
            error: err instanceof Error ? err.message : 'reviews_failed',
          })
        }
      }),
    ]

    return () => {
      for (const unregister of unregisters) unregister()
    }
  }, [browser, placePhotos, reviews])

  return null
}
