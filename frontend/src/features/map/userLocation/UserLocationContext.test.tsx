import { cleanup, render, screen, waitFor } from '@testing-library/react'
import { describe, expect, it, vi, beforeEach } from 'vitest'
import { UserLocationProvider, useUserLocation } from './UserLocationContext'

vi.mock('./resolveGpsUserLocation', () => ({
  resolveGpsUserLocation: vi.fn(),
}))

import { resolveGpsUserLocation } from './resolveGpsUserLocation'

function Probe() {
  const { fix, autoResolveHint } = useUserLocation()
  return (
    <div>
      <span data-testid="fix">{fix ? `${fix.lon},${fix.lat}` : 'none'}</span>
      <span data-testid="hint">{autoResolveHint ?? 'none'}</span>
    </div>
  )
}

describe('UserLocationProvider', () => {
  beforeEach(() => {
    cleanup()
    sessionStorage.clear()
    vi.mocked(resolveGpsUserLocation).mockReset()
  })

  it('records auto hint when GPS is imprecise without UI prompt', async () => {
    vi.mocked(resolveGpsUserLocation).mockResolvedValue({
      status: 'needs_input',
      reason: 'imprecise',
    })

    render(
      <UserLocationProvider>
        <Probe />
      </UserLocationProvider>,
    )

    await waitFor(() => {
      expect(screen.getByTestId('hint').textContent).toBe('imprecise')
    })
    expect(screen.getByTestId('fix').textContent).toBe('none')
  })

  it('stores a precise GPS fix', async () => {
    vi.mocked(resolveGpsUserLocation).mockResolvedValue({
      status: 'ok',
      fix: { lon: 12.37, lat: 50.07, source: 'gps' },
    })

    render(
      <UserLocationProvider>
        <Probe />
      </UserLocationProvider>,
    )

    await waitFor(() => {
      expect(screen.getByTestId('fix').textContent).toBe('12.37,50.07')
    })
  })
})
