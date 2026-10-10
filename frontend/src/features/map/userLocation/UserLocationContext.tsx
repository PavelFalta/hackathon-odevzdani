import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import { geocodeUserLocationInKvk } from './geocodeUserLocationInKvk'
import { resolveGpsUserLocation } from './resolveGpsUserLocation'
import { readStoredUserLocation, writeStoredUserLocation } from './userLocationSession'
import type { UserLocationFix, UserLocationInputReason } from './userLocationTypes'

export type SetUserLocationFromQueryResult =
  { ok: true; lon: number; lat: number; label: string | null } | { ok: false; error: string }

type UserLocationContextValue = {
  fix: UserLocationFix | null
  autoResolveHint: UserLocationInputReason | null
  resolving: boolean
  setFromPlaceQuery: (query: string) => Promise<SetUserLocationFromQueryResult>
}

const UserLocationContext = createContext<UserLocationContextValue | null>(null)

function applyFix(
  fix: UserLocationFix,
  setFix: (f: UserLocationFix) => void,
  setAutoResolveHint: (r: UserLocationInputReason | null) => void,
) {
  writeStoredUserLocation(fix)
  setFix(fix)
  setAutoResolveHint(null)
}

export function UserLocationProvider({ children }: { children: ReactNode }) {
  const [fix, setFix] = useState<UserLocationFix | null>(() => readStoredUserLocation())
  const [autoResolveHint, setAutoResolveHint] = useState<UserLocationInputReason | null>(null)
  const [resolving, setResolving] = useState(false)

  useEffect(() => {
    if (fix) return undefined

    let cancelled = false
    setResolving(true)
    void resolveGpsUserLocation().then((result) => {
      if (cancelled) return
      setResolving(false)
      if (result.status === 'ok') {
        applyFix(result.fix, setFix, setAutoResolveHint)
        return
      }
      setAutoResolveHint(result.reason)
    })

    return () => {
      cancelled = true
    }
  }, [fix])

  const setFromPlaceQuery = useCallback(
    async (query: string): Promise<SetUserLocationFromQueryResult> => {
      const geocoded = await geocodeUserLocationInKvk(query)
      if (!geocoded.ok) {
        if (geocoded.error === 'empty_query') return { ok: false as const, error: 'query_required' }
        return { ok: false as const, error: 'not_found' }
      }
      applyFix(geocoded.fix, setFix, setAutoResolveHint)
      return {
        ok: true as const,
        lon: geocoded.fix.lon,
        lat: geocoded.fix.lat,
        label: geocoded.fix.label ?? null,
      }
    },
    [],
  )

  const value = useMemo(
    (): UserLocationContextValue => ({
      fix,
      autoResolveHint,
      resolving,
      setFromPlaceQuery,
    }),
    [fix, autoResolveHint, resolving, setFromPlaceQuery],
  )

  return <UserLocationContext.Provider value={value}>{children}</UserLocationContext.Provider>
}

export function useUserLocation(): UserLocationContextValue {
  const ctx = useContext(UserLocationContext)
  if (!ctx) throw new Error('useUserLocation outside UserLocationProvider')
  return ctx
}

export function useUserLocationOptional(): UserLocationContextValue | null {
  return useContext(UserLocationContext)
}
