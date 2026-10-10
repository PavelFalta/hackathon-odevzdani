import { describe, expect, it } from 'vitest'
import { formatRouteDistance, formatRouteDuration, profileLabel } from './navigationFormat'

describe('navigationFormat', () => {
  it('formats distance and duration', () => {
    expect(formatRouteDistance(450)).toBe('450 m')
    expect(formatRouteDistance(2400)).toBe('2.4 km')
    expect(formatRouteDuration(90)).toBe('2 min')
    expect(formatRouteDuration(3900)).toBe('1 hod 5 min')
  })

  it('labels profiles in Czech', () => {
    expect(profileLabel('driving')).toBe('Autem')
    expect(profileLabel('walking')).toBe('Pěšky')
  })
})
