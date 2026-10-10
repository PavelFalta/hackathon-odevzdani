import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react'
import type { PlacePhoto } from '../../api/reviews'

export type PlacePhotosPanelData = {
  id: string
  placeName: string
  rating: number | null
  ratingCount: number | null
  photos: PlacePhoto[]
}

export type OpenPlacePhotosInput = {
  placeName: string
  rating: number | null
  ratingCount: number | null
  photos: PlacePhoto[]
}

export type OpenPlacePhotosResult = {
  id: string
  reused: boolean
}

export type PlacePhotosContextValue = {
  panels: PlacePhotosPanelData[]
  open: (input: OpenPlacePhotosInput) => string
  openForPlace: (input: OpenPlacePhotosInput) => OpenPlacePhotosResult
  close: (id: string) => void
}

const PlacePhotosContext = createContext<PlacePhotosContextValue | null>(null)

function newPanelId(): string {
  return `photos-${crypto.randomUUID()}`
}

function placeKey(placeName: string): string {
  return placeName.trim().toLowerCase()
}

function photosEqual(a: PlacePhoto[], b: PlacePhoto[]): boolean {
  if (a.length !== b.length) return false
  return a.every((photo, index) => photo.name === b[index]?.name)
}

function panelMatchesInput(panel: PlacePhotosPanelData, input: OpenPlacePhotosInput): boolean {
  return (
    placeKey(panel.placeName) === placeKey(input.placeName) &&
    panel.rating === input.rating &&
    panel.ratingCount === input.ratingCount &&
    photosEqual(panel.photos, input.photos)
  )
}

export function PlacePhotosProvider({ children }: { children: ReactNode }) {
  const [panels, setPanels] = useState<PlacePhotosPanelData[]>([])
  const panelsRef = useRef(panels)
  panelsRef.current = panels

  const openForPlace = useCallback((input: OpenPlacePhotosInput): OpenPlacePhotosResult => {
    const key = placeKey(input.placeName)
    const existing = panelsRef.current.find((p) => placeKey(p.placeName) === key)
    if (existing) {
      if (panelMatchesInput(existing, input)) {
        return { id: existing.id, reused: true }
      }
      setPanels((prev) =>
        prev.map((p) =>
          p.id === existing.id
            ? {
                ...p,
                placeName: input.placeName,
                rating: input.rating,
                ratingCount: input.ratingCount,
                photos: input.photos,
              }
            : p,
        ),
      )
      return { id: existing.id, reused: true }
    }
    const id = newPanelId()
    setPanels((prev) => [
      ...prev,
      {
        id,
        placeName: input.placeName,
        rating: input.rating,
        ratingCount: input.ratingCount,
        photos: input.photos,
      },
    ])
    return { id, reused: false }
  }, [])

  const open = useCallback(
    (input: OpenPlacePhotosInput) => openForPlace(input).id,
    [openForPlace],
  )

  const close = useCallback((id: string) => {
    setPanels((prev) => prev.filter((p) => p.id !== id))
  }, [])

  const value = useMemo(
    () => ({ panels, open, openForPlace, close }),
    [panels, open, openForPlace, close],
  )

  return <PlacePhotosContext.Provider value={value}>{children}</PlacePhotosContext.Provider>
}

export function usePlacePhotos() {
  const ctx = useContext(PlacePhotosContext)
  if (!ctx) throw new Error('usePlacePhotos outside PlacePhotosProvider')
  return ctx
}

export function usePlacePhotosOptional(): PlacePhotosContextValue | null {
  return useContext(PlacePhotosContext)
}
