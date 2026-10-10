import type { OrbTheme } from 'orb-ui'

/** Kairos palette mapped onto orb-ui cloud theme (hex — orb renders on canvas). */
export const assistantTalkOrbTheme: OrbTheme = {
  name: 'cloud',
  preset: 'expressive',
  motion: {
    responseExponent: 0.85,
    activityRiseMs: 55,
    activityFallMs: 110,
    stateTransitionMs: 160,
    listeningBaseSpeed: 1.15,
    speakingBaseSpeed: 1.35,
  },
  appearance: {
    deepColor: '#020617',
    upperColor: '#6fc3df',
    lowerColor: '#0f2a33',
    highlightColor: '#f38518',
    launchColor: '#6fc3df',
    spinnerColor: '#a5a5a5',
  },
}

export function defaultTalkOrbWindowSize(): { w: number; h: number } {
  return { w: 220, h: 248 }
}
