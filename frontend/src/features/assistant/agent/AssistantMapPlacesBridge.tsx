import { useEffect, useRef } from 'react'
import { useAssistant } from '../AssistantContext'
import { extractPlaceLinks } from '../assistantPlaceMarkup'
import { registerAgentAction } from './agentActionsRef'
import { useMapController } from '../../map/MapContext'
import { focusAgentMapPlaces } from '../../map/mapAgentFocus'
import { consumeAgentToolMapFocusSkip } from '../../map/mapAgentToolFocusTurn'
import { useAgentCompareMapRefit } from '../../map/useAgentCompareMapRefit'

function lastAssistantIndex(messages: { role: string }[]): number {
  for (let i = messages.length - 1; i >= 0; i--) {
    if (messages[i].role === 'assistant') return i
  }
  return -1
}

export function AssistantMapPlacesBridge() {
  const { map, phase, style } = useMapController()
  const { messages, busy } = useAssistant()
  const handledAssistantIndexRef = useRef(-1)
  const { setComparePlaces, fitPadding } = useAgentCompareMapRefit(map, phase)

  useEffect(() => {
    if (!map || phase === 'loading') return

    const tryBuildingSelect = style.basemapAppearance === 'standard'

    return registerAgentAction('showAssistantPlaces', async (places, primaryIndex = 0) => {
      if (!places.length) return JSON.stringify({ ok: false, error: 'no_places' })
      const focus = places[primaryIndex] ?? places[0]
      const mode = places.length > 1 ? 'compare' : 'focus'
      setComparePlaces(mode === 'compare' ? places : null)
      await focusAgentMapPlaces(map, places, primaryIndex, {
        mode,
        fitPadding: mode === 'compare' ? fitPadding() : undefined,
        tryBuildingSelect: mode === 'focus' ? tryBuildingSelect : false,
      })
      return JSON.stringify({ ok: true, count: places.length, focus: focus.label, mode })
    })
  }, [map, phase, style.basemapAppearance])

  useEffect(() => {
    if (!map || phase === 'loading' || busy) return
    const assistIndex = lastAssistantIndex(messages)
    if (assistIndex < 0 || assistIndex === handledAssistantIndexRef.current) return
    const content = messages[assistIndex]?.content
    if (!content) return
    const places = extractPlaceLinks(content)
    if (places.length === 0) return

    if (consumeAgentToolMapFocusSkip()) {
      handledAssistantIndexRef.current = assistIndex
      if (places.length <= 1) setComparePlaces(null)
      return
    }

    handledAssistantIndexRef.current = assistIndex
    const mode = places.length > 1 ? 'compare' : 'focus'
    setComparePlaces(mode === 'compare' ? places : null)
    void focusAgentMapPlaces(map, places, 0, {
      mode,
      fitPadding: mode === 'compare' ? fitPadding() : undefined,
      tryBuildingSelect: places.length === 1 && style.basemapAppearance === 'standard',
    })
  }, [map, phase, busy, messages, style.basemapAppearance, fitPadding, setComparePlaces])

  return null
}
