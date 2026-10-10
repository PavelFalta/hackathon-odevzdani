import { describe, expect, it } from 'vitest'
import { buildUserLocationAgentSnapshot } from './userLocationAgentSnapshot'

describe('buildUserLocationAgentSnapshot', () => {
  it('reports fix and clears auto hint when set', () => {
    const snap = buildUserLocationAgentSnapshot({
      fix: { lon: 12.3, lat: 50.1, source: 'gps' },
      resolving: false,
      autoResolveHint: 'imprecise',
    })
    expect(snap.has_fix).toBe(true)
    expect(snap.lon).toBe(12.3)
    expect(snap.auto_resolve_hint).toBe(null)
  })

  it('exposes auto resolve hint when no fix', () => {
    const snap = buildUserLocationAgentSnapshot({
      fix: null,
      resolving: false,
      autoResolveHint: 'denied',
    })
    expect(snap.has_fix).toBe(false)
    expect(snap.auto_resolve_hint).toBe('denied')
  })
})
