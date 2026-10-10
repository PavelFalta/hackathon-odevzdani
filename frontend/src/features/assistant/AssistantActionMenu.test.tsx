import { cleanup, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { AssistantActionMenu } from './AssistantActionMenu'

function mockTouchMenu() {
  vi.stubGlobal(
    'matchMedia',
    vi.fn().mockImplementation((query: string) => ({
      matches: query === '(hover: none)',
      media: query,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    })),
  )
}

afterEach(() => {
  cleanup()
  vi.unstubAllGlobals()
})

describe('AssistantActionMenu', () => {
  beforeEach(() => mockTouchMenu())

  it('fires chat after expanding the menu on touch', async () => {
    sessionStorage.clear()
    const onChat = vi.fn()
    const user = userEvent.setup()
    const { container } = render(
      <AssistantActionMenu onChat={onChat} onTalk={vi.fn()} onProfil={vi.fn()} />,
    )
    const menu = container.querySelector('.assistant-action-menu')
    expect(menu).toHaveAttribute('data-hint-pulse', 'true')
    await user.click(screen.getByRole('button', { name: /nabídka asistenta/i }))
    expect(menu).toHaveAttribute('data-hint-pulse', 'false')
    await user.click(screen.getByRole('button', { name: /^psaní$/i }))
    expect(onChat).toHaveBeenCalledOnce()
  })

  it('opens profile from center trigger on desktop', async () => {
    vi.stubGlobal(
      'matchMedia',
      vi.fn().mockImplementation((query: string) => ({
        matches: query === '(hover: hover)',
        media: query,
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
      })),
    )
    const onProfil = vi.fn()
    const user = userEvent.setup()
    render(<AssistantActionMenu onChat={vi.fn()} onTalk={vi.fn()} onProfil={onProfil} />)
    await user.click(screen.getByRole('button', { name: /nabídka asistenta/i }))
    expect(onProfil).toHaveBeenCalledOnce()
  })

  it('opens profile when profil is chosen on touch', async () => {
    sessionStorage.clear()
    const onProfil = vi.fn()
    const user = userEvent.setup()
    render(<AssistantActionMenu onChat={vi.fn()} onTalk={vi.fn()} onProfil={onProfil} />)
    await user.click(screen.getByRole('button', { name: /nabídka asistenta/i }))
    await user.click(screen.getByRole('button', { name: /^profil$/i }))
    expect(onProfil).toHaveBeenCalledOnce()
  })

  it('shows profil after expanding on touch', async () => {
    sessionStorage.clear()
    const user = userEvent.setup()
    render(<AssistantActionMenu onChat={vi.fn()} onTalk={vi.fn()} onProfil={vi.fn()} />)
    await user.click(screen.getByRole('button', { name: /nabídka asistenta/i }))
    expect(screen.getByRole('button', { name: /^profil$/i })).toBeInTheDocument()
  })
})
