import { useBrowserEmulator } from './BrowserEmulatorContext'

export function BrowserEmulatorLauncher() {
  const { panels, openEmpty } = useBrowserEmulator()
  if (panels.length > 0) return null

  return (
    <button
      type="button"
      className="browser-emulator-launcher"
      onClick={() => openEmpty()}
      aria-label="Otevřít náhled webu"
    >
      Náhled
    </button>
  )
}
