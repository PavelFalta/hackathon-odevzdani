import { useCallback, useEffect, useRef, useState } from 'react'
import { loadBrowserUrl } from './browserUrlLoad'
import { revokeBrowserFrameBlob } from './browserFrameBlob'

export type LoadUrlResult =
  | { ok: true }
  | { ok: false; reason: string; code: 'invalid_url' | 'not_displayable' | 'fetch_failed' }

export function useBrowserEmulatorLoad(initialUrl: string) {
  const [activeUrl, setActiveUrl] = useState<string | null>(null)
  const [frameSrc, setFrameSrc] = useState<string | null>(null)
  const [checking, setChecking] = useState(false)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [contentWidth, setContentWidth] = useState<number | null>(null)
  const frameBlobRef = useRef<string | null>(null)

  useEffect(() => {
    return () => revokeBrowserFrameBlob(frameBlobRef.current)
  }, [])

  const applyPayload = useCallback(
    (payload: {
      activeUrl: string
      frameSrc: string
      blobUrl?: string
      contentWidth?: number | null
    }) => {
      revokeBrowserFrameBlob(frameBlobRef.current)
      frameBlobRef.current = payload.blobUrl ?? null
      setActiveUrl(payload.activeUrl)
      setFrameSrc(payload.frameSrc)
      setContentWidth(payload.contentWidth ?? null)
      setLoadError(null)
    },
    [],
  )

  const loadUrl = useCallback(
    async (url: string): Promise<LoadUrlResult> => {
      setChecking(true)
      setActiveUrl(null)
      setFrameSrc(null)
      setContentWidth(null)
      revokeBrowserFrameBlob(frameBlobRef.current)
      frameBlobRef.current = null

      const result = await loadBrowserUrl(url)
      if (!result.ok) {
        setLoadError(result.reason)
        setChecking(false)
        return result
      }
      if (result.payload) applyPayload(result.payload)
      setChecking(false)
      return { ok: true }
    },
    [applyPayload],
  )

  useEffect(() => {
    if (!initialUrl.trim()) return
    void loadUrl(initialUrl)
  }, [initialUrl])

  return { activeUrl, frameSrc, checking, loadError, contentWidth, loadUrl }
}
