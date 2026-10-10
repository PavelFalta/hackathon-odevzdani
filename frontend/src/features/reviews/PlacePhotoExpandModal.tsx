import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { PHOTO_EXPAND_MAX_PX } from '../../api/reviews'
import type { PlacePhoto } from '../../api/reviews'
import { canGoNext, canGoPrevious, clampPhotoIndex } from './placePhotosCarousel'
import { photoAttributionLine } from './placePhotoAttribution'
import { useAuthenticatedPhoto } from './useAuthenticatedPhoto'
import './place-photo-expand.css'

type PlacePhotoExpandModalProps = {
  placeName: string
  photos: PlacePhoto[]
  index: number
  onClose: () => void
  onIndexChange: (index: number) => void
}

export function PlacePhotoExpandModal({
  placeName,
  photos,
  index,
  onClose,
  onIndexChange,
}: PlacePhotoExpandModalProps) {
  const safeIndex = clampPhotoIndex(index, photos.length)
  const current = photos[safeIndex] ?? null
  const { src, loading, error } = useAuthenticatedPhoto(current?.name ?? null, PHOTO_EXPAND_MAX_PX)
  const [imageReady, setImageReady] = useState(false)
  const credit = current ? photoAttributionLine(current) : null

  useEffect(() => {
    setImageReady(false)
  }, [current?.name])

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose()
      if (event.key === 'ArrowLeft' && canGoPrevious(safeIndex)) onIndexChange(safeIndex - 1)
      if (event.key === 'ArrowRight' && canGoNext(safeIndex, photos.length)) {
        onIndexChange(safeIndex + 1)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose, onIndexChange, photos.length, safeIndex])

  const showSpinner = loading || (src != null && !imageReady && !error)

  return createPortal(
    <div className="place-photo-expand" data-testid="place-photo-expand">
      <button
        type="button"
        className="place-photo-expand__scrim"
        aria-label="Zavřít zvětšení"
        onClick={onClose}
      />
      <div
        className="place-photo-expand__dialog"
        role="dialog"
        aria-modal="true"
        aria-label={`Fotografie: ${placeName}`}
      >
        <header className="place-photo-expand__header">
          <span className="place-photo-expand__title">{placeName}</span>
          <button type="button" className="place-photo-expand__close" onClick={onClose}>
            Zavřít
          </button>
        </header>
        <div className="place-photo-expand__stage">
          {error ? <p className="place-photo-expand__error" role="alert">{error}</p> : null}
          {showSpinner && !error ? (
            <div className="place-photo-expand__loading" role="status">
              <span className="reviews-panel__spinner" aria-hidden="true" />
            </div>
          ) : null}
          {src && !error ? (
            <img
              className="place-photo-expand__image"
              src={src}
              alt={`${placeName} — ${safeIndex + 1}. fotografie`}
              onLoad={() => setImageReady(true)}
              style={{ visibility: imageReady ? 'visible' : 'hidden' }}
            />
          ) : null}
        </div>
        <footer className="place-photo-expand__footer">
          <div className="place-photo-expand__nav">
            <button
              type="button"
              onClick={() => onIndexChange(safeIndex - 1)}
              disabled={!canGoPrevious(safeIndex)}
            >
              Předchozí
            </button>
            {photos.length > 1 ? (
              <span>{safeIndex + 1} / {photos.length}</span>
            ) : null}
            <button
              type="button"
              onClick={() => onIndexChange(safeIndex + 1)}
              disabled={!canGoNext(safeIndex, photos.length)}
            >
              Další
            </button>
          </div>
          {credit ? (
            <p className="place-photo-expand__credit">
              {current?.attributions[0]?.uri ? (
                <a href={current.attributions[0].uri} rel="noopener noreferrer" target="_blank">
                  {credit}
                </a>
              ) : (
                credit
              )}
            </p>
          ) : null}
        </footer>
      </div>
    </div>,
    document.body,
  )
}
