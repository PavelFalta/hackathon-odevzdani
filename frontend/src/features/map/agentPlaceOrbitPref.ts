const STORAGE_KEY = 'kairos.agentPlaceOrbit'

export function readStoredAgentPlaceOrbit(): boolean {
  try {
    return localStorage.getItem(STORAGE_KEY) !== 'off'
  } catch {
    return true
  }
}

export function storeAgentPlaceOrbit(enabled: boolean): void {
  try {
    localStorage.setItem(STORAGE_KEY, enabled ? 'on' : 'off')
  } catch {
    /* quota / private mode */
  }
}

let runtimeEnabled = readStoredAgentPlaceOrbit()

export function isAgentPlaceOrbitEnabled(): boolean {
  return runtimeEnabled
}

export function setAgentPlaceOrbitEnabledPref(enabled: boolean): void {
  runtimeEnabled = enabled
  storeAgentPlaceOrbit(enabled)
}

export function resetAgentPlaceOrbitPrefForTests(): void {
  runtimeEnabled = true
  try {
    localStorage.removeItem(STORAGE_KEY)
  } catch {
    /* private mode */
  }
}
