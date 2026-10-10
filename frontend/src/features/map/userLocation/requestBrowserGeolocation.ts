export type GeolocationFailureReason = 'denied' | 'unavailable' | 'timeout' | 'unsupported'

export type GeolocationSuccess = {
  ok: true
  lon: number
  lat: number
  accuracyM: number
}

export type GeolocationFailure = { ok: false; reason: GeolocationFailureReason }

export type GeolocationOutcome = GeolocationSuccess | GeolocationFailure

export function requestBrowserGeolocation(timeoutMs: number): Promise<GeolocationOutcome> {
  if (!navigator.geolocation) {
    return Promise.resolve({ ok: false, reason: 'unsupported' })
  }

  return new Promise((resolve) => {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          ok: true,
          lon: position.coords.longitude,
          lat: position.coords.latitude,
          accuracyM: position.coords.accuracy,
        })
      },
      (error) => {
        let reason: GeolocationFailureReason = 'unavailable'
        if (error.code === error.PERMISSION_DENIED) reason = 'denied'
        else if (error.code === error.TIMEOUT) reason = 'timeout'
        resolve({ ok: false, reason })
      },
      { enableHighAccuracy: true, timeout: timeoutMs, maximumAge: 60_000 },
    )
  })
}
