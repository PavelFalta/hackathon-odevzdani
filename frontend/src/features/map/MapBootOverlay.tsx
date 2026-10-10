import { MapBootBuildingStrip } from './MapBootBuildingStrip'
import { useMapController } from './MapContext'
import { useBootQuote } from './useBootQuote'
import './map-boot.css'

export function MapBootOverlay() {
  const { phase, bootProgress } = useMapController()
  const quote = useBootQuote(phase === 'loading')
  if (phase !== 'loading') return null

  const pct = Math.round(Math.min(1, Math.max(0, bootProgress)) * 100)

  return (
    <div className="map-boot" data-testid="map-boot-overlay">
      <svg className="map-boot-outline" aria-hidden="true">
        <rect className="map-boot-edge" pathLength={100} />
        <rect className="map-boot-sweep" pathLength={100} />
      </svg>
      <div className="map-boot-copy">
        <MapBootBuildingStrip />
        <p key={quote} className="map-boot-quote" role="status" aria-live="polite">
          {quote}
        </p>
        <div
          className="map-boot-meter"
          role="progressbar"
          aria-label="Načítání mapy"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={pct}
        >
          <span style={{ width: `${pct}%` }} />
        </div>
      </div>
    </div>
  )
}
