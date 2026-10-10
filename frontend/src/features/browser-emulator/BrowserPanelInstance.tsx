import { useCallback, useEffect, useState } from 'react'
import { defaultBrowserWindowSize } from '../floating-windows/floatingWindowDefaults'
import { useFloatingWindowsActions } from '../floating-windows/floatingWindowsHooks'
import { getFloatingViewport } from '../floating-windows/floatingWindowViewport'
import { MobileDockPortal } from '../shell/MobileDockPortal'
import { useShellPanelPresentation } from '../shell/useShellPanelPresentation'
import { resolveBrowserPanelHeight, resolveBrowserPanelWidth } from './browserContentWidth'
import { BrowserEmulatorViewport } from './BrowserEmulatorViewport'
import { useBrowserEmulator } from './BrowserEmulatorContext'
import { useBrowserEmulatorLoad } from './useBrowserEmulatorLoad'

type BrowserPanelInstanceProps = {
  id: string
  initialUrl: string
}

export function BrowserPanelInstance({ id, initialUrl }: BrowserPanelInstanceProps) {
  const { close } = useBrowserEmulator()
  const { activeUrl, frameSrc, checking, loadError, contentWidth } =
    useBrowserEmulatorLoad(initialUrl)
  const fw = useFloatingWindowsActions()
  const [documentHeight, setDocumentHeight] = useState<number | null>(null)
  const onDocumentHeight = useCallback((height: number | null) => {
    setDocumentHeight(height)
  }, [])

  const label = activeUrl ?? (initialUrl || 'Náhled')

  const { docked, panelRef, style, drag } = useShellPanelPresentation({
    id,
    kind: 'browser',
    label,
    anchor: 'top-right',
    defaultSize: defaultBrowserWindowSize(),
    onClose: () => close(id),
  })

  useEffect(() => {
    if (docked) return
    if (checking || !frameSrc) return
    const panel = panelRef.current
    if (!panel) return
    const viewportEl = panel.querySelector('.browser-emulator__viewport')
    const chrome =
      panel.offsetHeight - (viewportEl instanceof HTMLElement ? viewportEl.offsetHeight : 0)
    const viewport = getFloatingViewport()
    const w = resolveBrowserPanelWidth(contentWidth, viewport)
    const h = resolveBrowserPanelHeight(documentHeight, viewport, chrome)
    fw.updateMeasuredSize(id, { w, h })
  }, [
    docked,
    checking,
    contentWidth,
    documentHeight,
    frameSrc,
    fw.updateMeasuredSize,
    id,
    panelRef,
  ])

  function openExternal() {
    if (!activeUrl) return
    window.open(activeUrl, '_blank', 'noopener,noreferrer')
  }

  const panel = (
    <section
      ref={panelRef}
      className={`browser-emulator kairos-floating-panel${docked ? ' kairos-floating-panel--dock' : ''}`}
      style={style}
      aria-label="Náhled webu"
      data-testid="browser-emulator"
      data-window-id={id}
    >
      <header className="browser-emulator__header">
        <div
          className="browser-emulator__drag kairos-floating-panel__drag"
          onPointerDown={docked ? undefined : drag.onPointerDown}
        >
          Náhled
        </div>
        <div className="browser-emulator__window-actions">
          {activeUrl ? (
            <span className="browser-emulator__url-readout" title={activeUrl}>
              {activeUrl}
            </span>
          ) : null}
          <button
            type="button"
            className="browser-emulator__icon-btn"
            onClick={openExternal}
            disabled={!activeUrl}
            aria-label="Otevřít na nové kartě"
            title="Otevřít na nové kartě"
          >
            ↗
          </button>
          <button
            type="button"
            className="browser-emulator__icon-btn"
            onClick={() => close(id)}
            aria-label="Zavřít náhled webu"
            title="Zavřít"
          >
            ✕
          </button>
        </div>
      </header>

      {loadError ? (
        <p className="browser-emulator__error" role="alert">
          {loadError}
        </p>
      ) : null}

      <BrowserEmulatorViewport
        frameSrc={frameSrc}
        checking={checking}
        onDocumentHeight={onDocumentHeight}
      />
    </section>
  )

  if (docked) {
    return (
      <MobileDockPortal id={id} label={label} kind="browser" open onClose={() => close(id)}>
        {panel}
      </MobileDockPortal>
    )
  }

  return panel
}
