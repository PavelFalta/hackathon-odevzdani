import { useEffect, useState } from 'react'
import type { Map } from 'mapbox-gl'

export function useMapBearingPitch(map: Map | null): {
  bearing: number
  pitch: number
  zoom: number
} {
  const [bearing, setBearing] = useState(0)
  const [pitch, setPitch] = useState(0)
  const [zoom, setZoom] = useState(0)

  useEffect(() => {
    if (!map) return
    const sync = () => {
      setBearing(map.getBearing())
      setPitch(map.getPitch())
      setZoom(map.getZoom())
    }
    sync()
    map.on('rotate', sync)
    map.on('pitch', sync)
    map.on('zoom', sync)
    return () => {
      map.off('rotate', sync)
      map.off('pitch', sync)
      map.off('zoom', sync)
    }
  }, [map])

  return { bearing, pitch, zoom }
}
