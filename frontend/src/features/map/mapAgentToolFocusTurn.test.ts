import { describe, expect, it, beforeEach } from 'vitest'
import {
  consumeAgentToolMapFocusSkip,
  markAgentToolMapFocusThisTurn,
  resetAgentToolMapFocusTurnForTests,
} from './mapAgentToolFocusTurn'

describe('mapAgentToolMapFocusTurn', () => {
  beforeEach(() => {
    resetAgentToolMapFocusTurnForTests()
  })

  it('consumes skip once after agent tool focus', () => {
    markAgentToolMapFocusThisTurn()
    expect(consumeAgentToolMapFocusSkip()).toBe(true)
    expect(consumeAgentToolMapFocusSkip()).toBe(false)
  })
})
