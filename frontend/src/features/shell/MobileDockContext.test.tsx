import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useState } from 'react'
import { describe, expect, it, vi } from 'vitest'
import { MobileDockProvider } from './MobileDockContext'
import { MobileDockPortal } from './MobileDockPortal'
import { ShellDock } from './ShellDock'

vi.mock('./useIsMobileShell', () => ({
  useIsMobileShell: () => true,
}))

function RegisterAndUnmount() {
  const [open, setOpen] = useState(true)
  const [ticks, setTicks] = useState(0)
  return (
    <>
      <button type="button" onClick={() => setOpen(false)}>close</button>
      <button type="button" onClick={() => setTicks((n) => n + 1)}>tick</button>
      <MobileDockPortal id="test-slot" label="Test" open={open} onClose={() => ticks}>
        <p>Panel body</p>
      </MobileDockPortal>
    </>
  )
}

describe('MobileDockProvider', () => {
  it('unregisters a slot without exceeding React update depth', async () => {
    const user = userEvent.setup()
    render(
      <MobileDockProvider>
        <ShellDock />
        <RegisterAndUnmount />
      </MobileDockProvider>,
    )
    expect(screen.getByText('Panel body')).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'tick' }))
    await user.click(screen.getByRole('button', { name: 'tick' }))
    expect(screen.getByText('Panel body')).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'close' }))
    expect(screen.queryByText('Panel body')).not.toBeInTheDocument()
  })
})
