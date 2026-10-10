import { describe, expect, it } from 'vitest'
import { openWindowsTurnContextEvent } from './sendOpenWindowsTurnContext'

describe('openWindowsTurnContextEvent', () => {
  it('embeds the windows snapshot and housekeeping hint', () => {
    const payload = JSON.parse(
      openWindowsTurnContextEvent('{"windows":[{"id":"r1","kind":"reviews","label":"Spa"}]}'),
    ) as { item: { content: { text: string }[] } }
    const text = payload.item.content[0].text
    expect(text).toContain('Europe/Prague')
    expect(text).toContain('search_web up to three times')
    expect(text).toContain('last resort')
    expect(text).toContain('list_open_windows')
    expect(text).toContain('close_window')
    expect(text).toContain('Spa')
  })
})
