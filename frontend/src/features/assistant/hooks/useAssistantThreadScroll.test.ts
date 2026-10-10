import { renderHook } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { useAssistantThreadScroll } from './useAssistantThreadScroll'

describe('useAssistantThreadScroll', () => {
  it('returns a ref for the thread container', () => {
    const { result } = renderHook(() => useAssistantThreadScroll([], false))
    expect(result.current).toEqual({ current: null })
  })
})
