import { cleanup, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { fetchBrowserHtml, fetchEmbedCheck } from '../../api/browser'
import { FloatingWindowsProvider } from '../floating-windows/FloatingWindowsContext'
import { BrowserPanelTestLoad } from './BrowserPanelTestLoad'
import { BrowserEmulatorProvider } from './BrowserEmulatorContext'
import { FloatingBrowserEmulator } from './FloatingBrowserEmulator'

vi.mock('../../api/browser', () => ({
  fetchEmbedCheck: vi.fn(),
  fetchBrowserHtml: vi.fn(),
}))

afterEach(() => {
  cleanup()
  vi.clearAllMocks()
})

function renderEmulator() {
  return render(
    <FloatingWindowsProvider>
      <BrowserEmulatorProvider>
        <BrowserPanelTestLoad url="example.org" />
        <FloatingBrowserEmulator />
      </BrowserEmulatorProvider>
    </FloatingWindowsProvider>,
  )
}

describe('FloatingBrowserEmulator', () => {
  it('uses proxied blob HTML when the API returns a page', async () => {
    vi.mocked(fetchBrowserHtml).mockResolvedValue({
      html: '<!DOCTYPE html><html><head></head><body>ok</body></html>',
      final_url: 'https://example.org/',
    })
    const user = userEvent.setup()
    renderEmulator()

    await user.click(screen.getByRole('button', { name: /load test url/i }))

    await waitFor(() => {
      const frame = screen.getByTitle('Náhled webové stránky')
      expect(frame.getAttribute('src')).toMatch(/^blob:/)
    })
    expect(fetchEmbedCheck).not.toHaveBeenCalled()
  })

  it('falls back to direct URL when proxy fails but embed is allowed', async () => {
    vi.mocked(fetchBrowserHtml).mockRejectedValue(new Error('fail'))
    vi.mocked(fetchEmbedCheck).mockResolvedValue({ embeddable: true, reason: null })
    const user = userEvent.setup()
    renderEmulator()

    await user.click(screen.getByRole('button', { name: /load test url/i }))

    await waitFor(() => {
      expect(screen.getByTitle('Náhled webové stránky')).toHaveAttribute(
        'src',
        'https://example.org/',
      )
    })
  })

  it('shows an error and no iframe when embedding is blocked', async () => {
    vi.mocked(fetchBrowserHtml).mockRejectedValue(new Error('fail'))
    vi.mocked(fetchEmbedCheck).mockResolvedValue({
      embeddable: false,
      reason: 'Tuto stránku nelze vložit z jiné aplikace.',
    })
    const user = userEvent.setup()
    renderEmulator()

    await user.click(screen.getByRole('button', { name: /load test url/i }))

    await waitFor(() => {
      expect(screen.queryByTestId('browser-emulator')).not.toBeInTheDocument()
    })
  })

  it('closes from the close button', async () => {
    vi.mocked(fetchBrowserHtml).mockResolvedValue({
      html: '<!DOCTYPE html><html><head></head><body>ok</body></html>',
      final_url: 'https://example.org/',
    })
    const user = userEvent.setup()
    renderEmulator()
    await user.click(screen.getByRole('button', { name: /load test url/i }))
    await waitFor(() => expect(screen.getByTestId('browser-emulator')).toBeInTheDocument())
    await user.click(screen.getByRole('button', { name: /zavřít náhled webu/i }))
    expect(screen.queryByTestId('browser-emulator')).not.toBeInTheDocument()
  })
})
