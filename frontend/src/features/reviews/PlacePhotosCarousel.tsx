import { useEffect, useState } from 'react'
import type { PlacePhoto } from '../../api/reviews'
import { PlacePhotoExpandIcon } from './PlacePhotoExpandIcon'
import { PlacePhotoExpandModal } from './PlacePhotoExpandModal'
import { canGoNext, canGoPrevious, clampPhotoIndex } from './placePhotosCarousel'
import { photoAttributionLine } from './placePhotoAttribution'
import { useAuthenticatedPhoto } from './useAuthenticatedPhoto'

type PlacePhotosCarouselProps = {
  placeName: string
  photos: PlacePhoto[]
}

export function PlacePhotosCarousel({ placeName, photos }: PlacePhotosCarouselProps) {
  const [index, setIndex] = useState(0)
  const [expanded, setExpanded] = useState(false)
  const safeIndex = clampPhotoIndex(index, photos.length)
  const current = photos[safeIndex] ?? null
  const { src, loading, error } = useAuthenticatedPhoto(current?.name ?? null)
  const [imageReady, setImageReady] = useState(false)
  const credit = current ? photoAttributionLine(current) : null

  useEffect(() => {
    setImageReady(false)
  }, [current?.name])

  const showSpinner = loading || (src != null && !imageReady && !error)
  const atStart = !canGoPrevious(safeIndex)
  const atEnd = !canGoNext(safeIndex, photos.length)
  const canExpand = Boolean(src && imageReady && !error)

  return (
    <div className="place-photos-panel__carousel" data-testid="place-photos-carousel">
      <div className="place-photos-panel__stage">
        {canExpand ? (
          <button
            type="button"
            className="place-photos-panel__expand"
            aria-label="Zvětšit fotografii"
            onClick={() => setExpanded(true)}
          >
            <PlacePhotoExpandIcon />
          </button>
        ) : null}

        {!atStart ? (
          <button
            type="button"
            className="place-photos-panel__step place-photos-panel__step--prev"
            aria-label="Předchozí fotografie"
            onClick={() => setIndex(safeIndex - 1)}
          >
            ‹
          </button>
        ) : null}
        {!atEnd ? (
          <button
            type="button"
            className="place-photos-panel__step place-photos-panel__step--next"
            aria-label="Další fotografie"
            onClick={() => setIndex(safeIndex + 1)}
          >
            ›
          </button>
        ) : null}

        {photos.length > 1 ? (
          <span className="place-photos-panel__counter" aria-live="polite">
            {safeIndex + 1}/{photos.length}
          </span>
        ) : null}

        {error ? (
          <p className="place-photos-panel__error" role="alert">{error}</p>
        ) : null}
        {showSpinner && !error ? (
          <div className="place-photos-panel__loading" role="status">
            <span className="reviews-panel__spinner" aria-hidden="true" />
          </div>
        ) : null}
        {src && !error ? (
          <img
            className="place-photos-panel__image"
            src={src}
            alt={`${placeName} — ${safeIndex + 1}. fotografie`}
            onLoad={() => setImageReady(true)}
            style={{ visibility: imageReady ? 'visible' : 'hidden' }}
          />
        ) : null}
      </div>

      {credit ? (
        <p className="place-photos-panel__credit">
          {current?.attributions[0]?.uri ? (
            <a href={current.attributions[0].uri} rel="noopener noreferrer" target="_blank">
              {credit}
            </a>
          ) : (
            credit
          )}
        </p>
      ) : null}

      {expanded ? (
        <PlacePhotoExpandModal
          placeName={placeName}
          photos={photos}
          index={safeIndex}
          onClose={() => setExpanded(false)}
          onIndexChange={setIndex}
        />
      ) : null}
    </div>
  )
}
