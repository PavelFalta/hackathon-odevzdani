import { act, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { MapTimeWheel } from './MapTimeWheel'
import { requestMapTimeWheelAnimate } from './mapTimeWheelAgent'

const setStyle = vi.fn()

vi.mock('./MapContext', () => ({
  useMapControllerOptional: () => ({
    phase: 'ready',
    style: { lightPreset: 'dusk' },
    setStyle,
  }),
}))

describe('MapTimeWheel', () => {
  it('stays hidden until the agent animates time', () => {
    render(<MapTimeWheel />)
    expect(screen.queryByLabelText('Čas na mapě')).not.toBeInTheDocument()
    act(() => {
      requestMapTimeWheelAnimate(12 * 60)
    })
    expect(screen.getByLabelText('Čas na mapě')).toBeInTheDocument()
    expect(screen.getByText('Aktuální čas')).toBeInTheDocument()
  })
})
