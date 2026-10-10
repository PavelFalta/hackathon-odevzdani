import { afterEach, describe, expect, it } from 'vitest'
import { markAssistantMenuTouched, readAssistantMenuTouched } from './assistantMenuSessionHint'

afterEach(() => {
  sessionStorage.clear()
})

describe('assistantMenuSessionHint', () => {
  it('tracks first touch per session', () => {
    expect(readAssistantMenuTouched()).toBe(false)
    markAssistantMenuTouched()
    expect(readAssistantMenuTouched()).toBe(true)
  })
})
