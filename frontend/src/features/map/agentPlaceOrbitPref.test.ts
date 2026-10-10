import { afterEach, describe, expect, it } from 'vitest'
import {
  isAgentPlaceOrbitEnabled,
  resetAgentPlaceOrbitPrefForTests,
  setAgentPlaceOrbitEnabledPref,
} from './agentPlaceOrbitPref'

describe('agentPlaceOrbitPref', () => {
  afterEach(() => {
    resetAgentPlaceOrbitPrefForTests()
  })

  it('defaults to enabled after reset', () => {
    expect(isAgentPlaceOrbitEnabled()).toBe(true)
  })

  it('syncs runtime flag when preference changes', () => {
    setAgentPlaceOrbitEnabledPref(false)
    expect(isAgentPlaceOrbitEnabled()).toBe(false)
    setAgentPlaceOrbitEnabledPref(true)
    expect(isAgentPlaceOrbitEnabled()).toBe(true)
  })
})
