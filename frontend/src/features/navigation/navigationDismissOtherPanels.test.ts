import { describe, expect, it } from 'vitest'
import { panelsToDismissForNavigation } from './navigationDismissOtherPanels'

describe('panelsToDismissForNavigation', () => {
  it('closes all reviews, browser, and older navigation panels', () => {
    const result = panelsToDismissForNavigation(['nav-a', 'nav-b'], ['rev-1'], ['br-1', 'br-2'])
    expect(result.reviewIds).toEqual(['rev-1'])
    expect(result.browserIds).toEqual(['br-1', 'br-2'])
    expect(result.staleNavigationIds).toEqual(['nav-a'])
  })

  it('keeps the only navigation panel', () => {
    const result = panelsToDismissForNavigation(['nav-only'], [], [])
    expect(result.staleNavigationIds).toEqual([])
  })
})
