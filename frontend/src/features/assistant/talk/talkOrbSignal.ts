import type { OrbSignal, OrbState } from 'orb-ui'
import { createVolumeNormalizer, PROVIDER_VOLUME_CALIBRATIONS } from 'orb-ui/adapters'

const inputNormalizer = createVolumeNormalizer(PROVIDER_VOLUME_CALIBRATIONS.openai.input)
const outputNormalizer = createVolumeNormalizer(PROVIDER_VOLUME_CALIBRATIONS.openai.output)

export function initialTalkOrbSignal(): OrbSignal {
  return { state: 'idle', inputVolume: 0, outputVolume: 0 }
}

export function normalizeInputLevel(rms: number): number {
  return inputNormalizer.sample(rms).normalized
}

export function normalizeOutputLevel(rms: number): number {
  return outputNormalizer.sample(rms).normalized
}

export function mergeTalkOrbSignal(
  current: OrbSignal,
  patch: Partial<OrbSignal> & { state?: OrbState },
): OrbSignal {
  const nextState = patch.state ?? current.state
  const merged: OrbSignal = {
    ...current,
    ...patch,
    state: nextState,
  }

  if (nextState === 'idle' || nextState === 'error') {
    inputNormalizer.reset()
    outputNormalizer.reset()
    return { state: nextState, inputVolume: 0, outputVolume: 0 }
  }

  if (nextState === 'connecting') {
    return { state: nextState, inputVolume: 0, outputVolume: 0 }
  }

  return merged
}
