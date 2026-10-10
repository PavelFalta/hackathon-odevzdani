import { BrowserPanelInstance } from './BrowserPanelInstance'
import { useBrowserEmulator } from './BrowserEmulatorContext'
import './browser-emulator.css'

export function FloatingBrowserEmulator() {
  const { panels } = useBrowserEmulator()
  return (
    <>
      {panels.map((panel) => (
        <BrowserPanelInstance key={panel.id} id={panel.id} initialUrl={panel.initialUrl} />
      ))}
    </>
  )
}
