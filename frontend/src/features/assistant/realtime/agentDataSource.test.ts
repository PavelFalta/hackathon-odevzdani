import { describe, expect, it } from 'vitest'
import { openDataSource, onlineDataSource } from './agentDataSource'

describe('agentDataSource', () => {
  it('includes disclosure only when there are hits', () => {
    expect(openDataSource(true).disclosure_cs).toContain('datazapad')
    expect(openDataSource(false).disclosure_cs).toBeNull()
    expect(onlineDataSource(true).disclosure_cs).toContain('online')
    expect(onlineDataSource(false).disclosure_cs).toBeNull()
  })
})
