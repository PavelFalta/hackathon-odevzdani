import { useEffect, useRef } from 'react'
import { useBrowserEmulator } from '../browser-emulator/BrowserEmulatorContext'
import { useReviews } from '../reviews/ReviewsContext'
import { panelsToDismissForNavigation } from './navigationDismissOtherPanels'
import { useNavigation } from './NavigationContext'

export function NavigationWorkspaceBridge() {
  const { panels, close: closeNavigation } = useNavigation()
  const reviews = useReviews()
  const browser = useBrowserEmulator()
  const latestNavId = panels[panels.length - 1]?.id ?? null
  const dismissedForRef = useRef<string | null>(null)

  useEffect(() => {
    if (!latestNavId) {
      dismissedForRef.current = null
      return
    }
    if (dismissedForRef.current === latestNavId) return
    dismissedForRef.current = latestNavId

    const { reviewIds, browserIds, staleNavigationIds } = panelsToDismissForNavigation(
      panels.map((p) => p.id),
      reviews.panels.map((p) => p.id),
      browser.panels.map((p) => p.id),
    )
    for (const id of reviewIds) reviews.close(id)
    for (const id of browserIds) browser.close(id)
    for (const id of staleNavigationIds) closeNavigation(id)
  }, [
    latestNavId,
    panels,
    reviews.panels,
    browser.panels,
    reviews.close,
    browser.close,
    closeNavigation,
  ])

  return null
}
