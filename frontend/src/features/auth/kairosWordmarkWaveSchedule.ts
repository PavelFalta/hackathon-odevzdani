const WAVE_DELAY_MIN_MS = 9_000
const WAVE_DELAY_MAX_MS = 22_000
export const KAIROS_WORDMARK_WAVE_MS = 580

export function pickKairosWaveDelayMs(): number {
  const span = WAVE_DELAY_MAX_MS - WAVE_DELAY_MIN_MS
  return WAVE_DELAY_MIN_MS + Math.random() * span
}
