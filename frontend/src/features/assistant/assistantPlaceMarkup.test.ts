import { describe, expect, it } from 'vitest'
import { extractPlaceLinks, firstPlaceInMarkup, splitPlaceMarkup } from './assistantPlaceMarkup'

describe('assistantPlaceMarkup', () => {
  it('splits place links from surrounding text', () => {
    const parts = splitPlaceMarkup('Navštiv [[Cheb;;12.3736;;50.0736]] na mapě.')
    expect(parts).toHaveLength(3)
    expect(parts[1]).toEqual({
      type: 'place',
      label: 'Cheb',
      lon: 12.3736,
      lat: 50.0736,
    })
  })

  it('finds first place', () => {
    const place = firstPlaceInMarkup('[[A;;1;;2]] a [[B;;3;;4]]')
    expect(place?.label).toBe('A')
  })

  it('extracts all place links in order', () => {
    const links = extractPlaceLinks('[[A;;1;;2]] a [[B;;3;;4]]')
    expect(links).toHaveLength(2)
    expect(links[0].label).toBe('A')
    expect(links[1].label).toBe('B')
  })
})
