import { useBrowserEmulator } from './BrowserEmulatorContext'

export function BrowserPanelTestLoad({ url }: { url: string }) {
  const { loadUrl } = useBrowserEmulator()
  return (
    <button
      type="button"
      onClick={() => void loadUrl(url, { openPanelOnSuccess: true, closePanelOnFailure: false })}
    >
      Load test url
    </button>
  )
}
