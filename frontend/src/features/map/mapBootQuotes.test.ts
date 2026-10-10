import { describe, expect, it } from 'vitest'
import { MAP_BOOT_QUOTES, mapBootQuoteAt } from './mapBootQuotes'

describe('mapBootQuoteAt', () => {
  it('cycles through the quote list', () => {
    expect(mapBootQuoteAt(0)).toBe(MAP_BOOT_QUOTES[0])
    expect(mapBootQuoteAt(MAP_BOOT_QUOTES.length)).toBe(MAP_BOOT_QUOTES[0])
    expect(mapBootQuoteAt(-1)).toBe(MAP_BOOT_QUOTES[MAP_BOOT_QUOTES.length - 1])
  })
})
