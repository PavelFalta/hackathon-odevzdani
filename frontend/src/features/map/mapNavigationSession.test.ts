import { describe, expect, it } from 'vitest'
import {
  isNavigationSessionActive,
  resetNavigationSessionForTests,
  setNavigationSessionActive,
} from './mapNavigationSession'

describe('mapNavigationSession', () => {
  it('tracks nested navigation sessions', () => {
    resetNavigationSessionForTests()
    const map = {} as never
    setNavigationSessionActive(map, true)
    expect(isNavigationSessionActive()).toBe(true)
    setNavigationSessionActive(map, true)
    setNavigationSessionActive(map, false)
    expect(isNavigationSessionActive()).toBe(true)
    setNavigationSessionActive(map, false)
    expect(isNavigationSessionActive()).toBe(false)
  })
})
