import { afterEach, describe, expect, it, vi } from 'vitest'
import { waitForOpenDataChannel } from './waitForOpenDataChannel'

afterEach(() => {
  vi.restoreAllMocks()
})

describe('waitForOpenDataChannel', () => {
  it('resolves when the channel opens', async () => {
    const channel = { readyState: 'open', send: () => undefined, addEventListener: () => undefined }
    await expect(
      waitForOpenDataChannel(() => ({ dataChannel: channel, close: () => undefined })),
    ).resolves.toBe(channel)
  })

  it('waits until the channel becomes open', async () => {
    const channel: {
      readyState: string
      send: () => void
      addEventListener: () => void
    } = {
      readyState: 'connecting',
      send: () => undefined,
      addEventListener: () => undefined,
    }
    const getConnection = () => ({ dataChannel: channel, close: () => undefined })
    const promise = waitForOpenDataChannel(getConnection)
    channel.readyState = 'open'
    await expect(promise).resolves.toBe(channel)
  })
})
