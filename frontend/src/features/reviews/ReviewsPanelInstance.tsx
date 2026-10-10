import { useEffect } from 'react'
import { MobileDockPortal } from '../shell/MobileDockPortal'
import { useShellPanelPresentation } from '../shell/useShellPanelPresentation'
import { defaultReviewsWindowSize } from '../floating-windows/floatingWindowDefaults'
import { usePlacePhotosOptional } from './PlacePhotosContext'
import { hasPlacePhotos, reviewsToPlacePhotosInput } from './openPlacePhotosFromReviews'
import { ReviewsResults } from './ReviewsResults'
import { useReviews } from './ReviewsContext'
import { useReviewsSearch } from './useReviewsSearch'

type ReviewsPanelInstanceProps = {
  id: string
  query: string
}

export function ReviewsPanelInstance({ id, query }: ReviewsPanelInstanceProps) {
  const { close } = useReviews()
  const placePhotos = usePlacePhotosOptional()
  const { result, error, loading, search } = useReviewsSearch()

  useEffect(() => {
    void search(query)
  }, [query, search])

  const openPlacePhotos = placePhotos?.openForPlace

  useEffect(() => {
    if (!result || !openPlacePhotos || !hasPlacePhotos(result)) return
    openPlacePhotos(reviewsToPlacePhotosInput(result))
  }, [result, openPlacePhotos])

  const label = result?.place_name ?? query
  const { docked, panelRef, style, drag } = useShellPanelPresentation({
    id,
    kind: 'reviews',
    label,
    anchor: 'bottom-left',
    defaultSize: defaultReviewsWindowSize(),
    onClose: () => close(id),
  })

  const panel = (
    <section
      ref={panelRef}
      className={`reviews-panel kairos-floating-panel${docked ? ' kairos-floating-panel--dock' : ''}`}
      style={style}
      aria-label={`Recenze: ${label}`}
      data-testid="reviews-panel"
      data-window-id={id}
    >
      <header className="reviews-panel__header">
        <div
          className="reviews-panel__drag kairos-floating-panel__drag"
          onPointerDown={docked ? undefined : drag.onPointerDown}
        >
          Recenze
        </div>
        <button
          type="button"
          className="reviews-panel__icon-btn"
          onClick={() => close(id)}
          aria-label="Zavřít recenze"
          title="Zavřít"
        >
          ✕
        </button>
      </header>

      <div className="reviews-panel__body">
        {loading ? (
          <div className="reviews-panel__loading" role="status">
            <span className="reviews-panel__spinner" aria-hidden="true" />
            Načítání…
          </div>
        ) : null}
        {error ? (
          <p className="reviews-panel__error" role="alert">
            {error}
          </p>
        ) : null}
        {!loading && !error && !result ? (
          <p className="reviews-panel__hint">Načítám recenze…</p>
        ) : null}
        {result && !loading ? <ReviewsResults result={result} /> : null}
      </div>
    </section>
  )

  if (docked) {
    return (
      <MobileDockPortal id={id} label={label} kind="reviews" open onClose={() => close(id)}>
        {panel}
      </MobileDockPortal>
    )
  }

  return panel
}
