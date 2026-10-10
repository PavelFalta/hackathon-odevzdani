/** Pitch used for agent / cinematic place focus (oblique “panorama” view). */
export const PLACE_FOCUS_PITCH = 58

/** Default zoom when the model does not pass `zoom` — tuned for PLACE_FOCUS_PITCH. */
export function defaultPlaceFocusZoom(pitch = PLACE_FOCUS_PITCH): number {
  const pitchFactor = Math.sin((pitch * Math.PI) / 180)
  return 16.6 + pitchFactor * 1.15
}

export function resolvePlaceFocusZoom(zoom?: number, pitch = PLACE_FOCUS_PITCH): number {
  return zoom ?? defaultPlaceFocusZoom(pitch)
}
