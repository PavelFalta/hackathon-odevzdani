import type { KnowledgeHit } from '../../../api/knowledge'
import { agentActionsRef } from '../agent/agentActionsRef'
import { normalizeBrowserUrl } from '../../browser-emulator/normalizeBrowserUrl'

function placeName(record: Record<string, unknown>): string {
  return typeof record.name === 'string' ? record.name.trim() : ''
}

function placeWeb(record: Record<string, unknown>): string | null {
  const raw = record.web
  if (typeof raw !== 'string') return null
  const trimmed = raw.trim()
  return trimmed ? trimmed : null
}

export async function autoOpenForSingleKnowledgeHit(
  hits: KnowledgeHit[],
): Promise<{ reviews: boolean; photos: boolean; website: boolean }> {
  if (hits.length !== 1) return { reviews: false, photos: false, website: false }

  const record = hits[0].record
  const name = placeName(record)
  const web = placeWeb(record)
  const actions = agentActionsRef.current

  let reviews = false
  let photos = false
  let website = false

  if (name && actions.fetchPlaceReviews) {
    const out = JSON.parse(await actions.fetchPlaceReviews(name)) as {
      ok?: boolean
      photos_window_opened?: boolean
      photo_count?: number
    }
    reviews = out.ok === true
    photos = out.photos_window_opened === true
  }

  if (web && normalizeBrowserUrl(web) && actions.openWebsite) {
    const out = JSON.parse(await actions.openWebsite(web)) as { ok?: boolean }
    website = out.ok === true
  }

  return { reviews, photos, website }
}
