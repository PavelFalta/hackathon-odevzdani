import { useEffect, useRef, useState } from 'react'
import { measureIframeDocumentHeight } from './iframeDocumentHeight'
import { useBrowserAutoScroll } from './useBrowserAutoScroll'

type BrowserEmulatorViewportProps = {
  frameSrc: string | null
  checking: boolean
  onDocumentHeight?: (height: number | null) => void
}

export function BrowserEmulatorViewport({
  frameSrc,
  checking,
  onDocumentHeight,
}: BrowserEmulatorViewportProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null)
  const [readySrc, setReadySrc] = useState<string | null>(null)
  const frameLoading = Boolean(frameSrc) && frameSrc !== readySrc

  useEffect(() => {
    setReadySrc(null)
    onDocumentHeight?.(null)
  }, [frameSrc, onDocumentHeight])

  useBrowserAutoScroll(iframeRef, Boolean(readySrc))

  if (checking) {
    return (
      <div className="browser-emulator__viewport kairos-scroll">
        <div className="browser-emulator__loading" role="status" aria-live="polite">
          <span className="browser-emulator__spinner" aria-hidden="true" />
          Kontrola…
        </div>
      </div>
    )
  }

  return (
    <div className="browser-emulator__viewport">
      {frameSrc ? (
        <>
          {frameLoading ? (
            <div className="browser-emulator__loading" role="status" aria-live="polite">
              <span className="browser-emulator__spinner" aria-hidden="true" />
              Načítání…
            </div>
          ) : null}
          <iframe
            ref={iframeRef}
            key={frameSrc}
            title="Náhled webové stránky"
            src={frameSrc}
            className="browser-emulator__frame"
            sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
            referrerPolicy="no-referrer-when-downgrade"
            onLoad={(event) => {
              const iframe = event.currentTarget
              const applyHeight = () => {
                const docHeight = measureIframeDocumentHeight(iframe)
                onDocumentHeight?.(docHeight)
              }
              applyHeight()
              requestAnimationFrame(applyHeight)
              setReadySrc(frameSrc)
            }}
          />
        </>
      ) : (
        <p className="browser-emulator__idle">Vlož URL a načti stránku.</p>
      )}
    </div>
  )
}
