import { useEffect, useState } from 'react'
import { fetchPlacePhotoBlob } from '../../api/reviews'

type PhotoLoadState = {
  src: string | null
  loading: boolean
  error: string | null
}

export function useAuthenticatedPhoto(
  photoName: string | null,
  maxPx?: number,
): PhotoLoadState {
  const [src, setSrc] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!photoName) {
      setSrc(null)
      setLoading(false)
      setError(null)
      return
    }

    let objectUrl: string | null = null
    let cancelled = false
    setSrc(null)
    setError(null)
    setLoading(true)

    void fetchPlacePhotoBlob(photoName, maxPx)
      .then((blob) => {
        if (cancelled) return
        objectUrl = URL.createObjectURL(blob)
        setSrc(objectUrl)
      })
      .catch((err: unknown) => {
        if (cancelled) return
        setError(err instanceof Error ? err.message : 'Fotografii se nepodařilo načíst.')
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    return () => {
      cancelled = true
      if (objectUrl) URL.revokeObjectURL(objectUrl)
    }
  }, [photoName, maxPx])

  return { src, loading, error }
}
