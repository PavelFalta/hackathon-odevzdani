import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { MAX_FLOATING_WINDOWS } from '../floating-windows/floatingWindowCorners'
import { MobileDockProvider } from './MobileDockContext'
import { MobileDockPortal } from './MobileDockPortal'
import { ShellDock } from './ShellDock'

vi.mock('./useIsMobileShell', () => ({
  useIsMobileShell: () => true,
}))

function DockHarness() {
  const closers: Record<string, () => void> = {}
  const slots = Array.from({ length: MAX_FLOATING_WINDOWS + 1 }, (_, index) => {
    const id = `reviews-slot-${index}`
    return (
      <MobileDockPortal
        key={id}
        id={id}
        label={`Tab ${index}`}
        kind="reviews"
        open
        onClose={() => {
          closers[id]?.()
        }}
      >
        <p>Body {index}</p>
      </MobileDockPortal>
    )
  })
  return (
    <>
      <ShellDock />
      {slots}
    </>
  )
}

describe('mobile dock tabs', () => {
  it('shows only the active pane in the dock body', async () => {
    const user = userEvent.setup()
    render(
      <MobileDockProvider>
        <ShellDock />
        <MobileDockPortal id="assistant-chat" label="Chat" kind="assistant" open onClose={() => {}}>
          <p>Chat pane</p>
        </MobileDockPortal>
        <MobileDockPortal id="reviews-a" label="Recenze" kind="reviews" open onClose={() => {}}>
          <p>Reviews pane</p>
        </MobileDockPortal>
      </MobileDockProvider>,
    )

    expect(document.querySelector('[data-dock-pane-id="reviews-a"]')).toHaveAttribute(
      'data-active',
      'true',
    )
    expect(document.querySelector('[data-dock-pane-id="assistant-chat"]')).toHaveAttribute(
      'data-active',
      'false',
    )

    await user.click(screen.getByRole('button', { name: 'Chat' }))
    expect(document.querySelector('[data-dock-pane-id="assistant-chat"]')).toHaveAttribute(
      'data-active',
      'true',
    )
    expect(document.querySelector('[data-dock-pane-id="reviews-a"]')).toHaveAttribute(
      'data-active',
      'false',
    )
  })

  it(`keeps at most ${MAX_FLOATING_WINDOWS} dock tabs`, () => {
    render(<MobileDockProvider>{<DockHarness />}</MobileDockProvider>)
    const tabs = screen.getAllByRole('button', { name: /^Tab / })
    expect(tabs).toHaveLength(MAX_FLOATING_WINDOWS)
  })
})
