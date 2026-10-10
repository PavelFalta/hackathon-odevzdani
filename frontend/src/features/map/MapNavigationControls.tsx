import { useMapController } from './MapContext'
import { mapResetNorthAndPitch, mapZoomIn, mapZoomOut } from './mapNavigationActions'
import { useMapBearingPitch } from './useMapBearingPitch'
import { flyToUserLocationFix } from './userLocation/flyToUserLocationFix'
import { useUserLocationOptional } from './userLocation/UserLocationContext'
import './map-navigation.css'

export function MapNavigationControls() {
  const { map, phase, performanceMode, setPerformanceMode, placeOrbitEnabled, setPlaceOrbitEnabled } =
    useMapController()
  const { bearing, pitch, zoom } = useMapBearingPitch(map)
  const userLocation = useUserLocationOptional()
  const fix = userLocation?.fix ?? null

  if (phase !== 'ready' || !map) return null

  const atMaxZoom = zoom >= map.getMaxZoom() - 0.01
  const atMinZoom = zoom <= map.getMinZoom() + 0.01
  const is2d = performanceMode === '2d'

  return (
    <div className="map-nav" aria-label="Navigace mapy">
      <button
        type="button"
        className={`map-nav-btn map-nav-btn--perf${is2d ? ' map-nav-btn--perf-on' : ''}`}
        aria-label={is2d ? 'Přepnout na 3D zobrazení' : 'Přepnout na 2D zobrazení (úspora výkonu)'}
        aria-pressed={is2d}
        title={is2d ? '3D mapa' : '2D mapa — vhodné pro pomalejší zařízení'}
        onClick={() => setPerformanceMode(is2d ? '3d' : '2d')}
      >
        <span className="map-nav-perf-label" aria-hidden>
          {is2d ? '3D' : '2D'}
        </span>
      </button>
      <button
        type="button"
        className={`map-nav-btn map-nav-btn--orbit${placeOrbitEnabled ? ' map-nav-btn--orbit-on' : ''}`}
        aria-label={
          placeOrbitEnabled
            ? 'Vypnout otáčení mapy po přiblížení na místo'
            : 'Zapnout otáčení mapy po přiblížení na místo'
        }
        aria-pressed={placeOrbitEnabled}
        title={
          placeOrbitEnabled
            ? 'Otáčení po přiblížení — zapnuto'
            : 'Otáčení po přiblížení — vypnuto'
        }
        onClick={() => setPlaceOrbitEnabled(!placeOrbitEnabled)}
      >
        <span className="map-nav-orbit-icon" aria-hidden />
      </button>
      {fix ? (
        <button
          type="button"
          className="map-nav-btn map-nav-btn--location"
          aria-label="Přejít na mou polohu"
          title={fix.label ?? 'Moje poloha'}
          onClick={() => flyToUserLocationFix(map, fix.lon, fix.lat)}
        >
          <span className="map-nav-location-icon" aria-hidden />
        </button>
      ) : null}
      <button
        type="button"
        className="map-nav-btn map-nav-btn--zoom"
        aria-label="Přiblížit"
        disabled={atMaxZoom}
        onClick={() => mapZoomIn(map)}
      >
        +
      </button>
      <button
        type="button"
        className="map-nav-btn map-nav-btn--zoom"
        aria-label="Oddálit"
        disabled={atMinZoom}
        onClick={() => mapZoomOut(map)}
      >
        −
      </button>
      <button
        type="button"
        className="map-nav-btn map-nav-compass"
        aria-label="Obnovit sever a náklon"
        onClick={() => mapResetNorthAndPitch(map)}
      >
        <span
          className="map-nav-compass__scene"
          style={{ transform: `rotateX(${pitch}deg)` }}
          aria-hidden
        >
          <span className="map-nav-compass__needle" style={{ transform: `rotate(${-bearing}deg)` }}>
            S
          </span>
        </span>
      </button>
    </div>
  )
}
