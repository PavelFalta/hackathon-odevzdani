import { describe, expect, it } from 'vitest'
import { normalizeBrowserUrl } from './normalizeBrowserUrl'

describe('normalizeBrowserUrl', () => {
  it('adds https when protocol is missing', () => {
    expect(normalizeBrowserUrl('example.cz')).toBe('https://example.cz/')
  })

  it('keeps explicit https URLs', () => {
    expect(normalizeBrowserUrl('https://www.karlovarskykraj.cz/')).toBe(
      'https://www.karlovarskykraj.cz/',
    )
  })

  it('rejects empty and invalid input', () => {
    expect(normalizeBrowserUrl('')).toBeNull()
    expect(normalizeBrowserUrl('   ')).toBeNull()
    expect(normalizeBrowserUrl('not a url!!!')).toBeNull()
    expect(normalizeBrowserUrl('javascript:alert(1)')).toBeNull()
  })
})
