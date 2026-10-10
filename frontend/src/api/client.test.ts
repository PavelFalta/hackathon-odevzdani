import { afterEach, describe, expect, it, vi } from 'vitest'
import { postJson } from './client'

describe('postJson', () => {
  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('returns parsed JSON on success', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ ok: true }),
      }),
    )
    const data = await postJson<{ ok: boolean }>('/api/test', { a: 1 })
    expect(data).toEqual({ ok: true })
  })

  it('throws when response is not ok', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: false,
        status: 500,
      }),
    )
    await expect(postJson('/api/test', {})).rejects.toThrow('Požadavek selhal: 500')
  })
})
