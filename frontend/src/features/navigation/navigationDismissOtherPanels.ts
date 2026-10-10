/** Panel ids to close when navigation is active (assistant panels are not floating-window managed here). */
export function panelsToDismissForNavigation(
  navigationPanelIds: string[],
  reviewPanelIds: string[],
  browserPanelIds: string[],
): {
  reviewIds: string[]
  browserIds: string[]
  staleNavigationIds: string[]
} {
  const latestNavId = navigationPanelIds[navigationPanelIds.length - 1]
  const staleNavigationIds = latestNavId
    ? navigationPanelIds.filter((id) => id !== latestNavId)
    : []
  return {
    reviewIds: reviewPanelIds,
    browserIds: browserPanelIds,
    staleNavigationIds,
  }
}
