import { MobileDockPortal } from '../shell/MobileDockPortal'
import { useShellPanelPresentation } from '../shell/useShellPanelPresentation'
import { defaultPhotosWindowSize } from '../floating-windows/floatingWindowDefaults'
import { PlacePhotosCarousel } from './PlacePhotosCarousel'
import { usePlacePhotos, type PlacePhotosPanelData } from './PlacePhotosContext'
import './place-photos-panel.css'

type PlacePhotosPanelInstanceProps = {
  panel: PlacePhotosPanelData
}

export function PlacePhotosPanelInstance({ panel }: PlacePhotosPanelInstanceProps) {
  const { close } = usePlacePhotos()
  const { docked, panelRef, style, drag } = useShellPanelPresentation({
    id: panel.id,
    kind: 'photos',
    label: panel.placeName,
    anchor: 'bottom-right',
    defaultSize: defaultPhotosWindowSize(),
    onClose: () => close(panel.id),
  })

  const shell = (
    <section
      ref={panelRef}
      className={`place-photos-panel kairos-floating-panel${docked ? ' kairos-floating-panel--dock' : ''}`}
      style={style}
      aria-label={`Fotografie: ${panel.placeName}`}
      data-testid="place-photos-panel"
      data-window-id={panel.id}
    >
      <header className="reviews-panel__header">
        <div
          className="reviews-panel__drag kairos-floating-panel__drag place-photos-panel__drag"
          onPointerDown={docked ? undefined : drag.onPointerDown}
          title={panel.placeName}
        >
          {panel.placeName}
        </div>
        <button
          type="button"
          className="reviews-panel__icon-btn"
          onClick={() => close(panel.id)}
          aria-label="Zavřít fotografie"
          title="Zavřít"
        >
          ✕
        </button>
      </header>
      <div className="place-photos-panel__body">
        <PlacePhotosCarousel placeName={panel.placeName} photos={panel.photos} />
      </div>
    </section>
  )

  if (docked) {
    return (
      <MobileDockPortal
        id={panel.id}
        label={panel.placeName}
        kind="photos"
        open
        onClose={() => close(panel.id)}
      >
        {shell}
      </MobileDockPortal>
    )
  }

  return shell
}
