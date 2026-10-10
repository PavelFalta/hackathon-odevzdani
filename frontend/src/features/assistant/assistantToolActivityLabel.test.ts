import { describe, expect, it } from 'vitest'
import { toolActivityLabel } from './assistantToolActivityLabel'

describe('toolActivityLabel', () => {
  it('describes knowledge search with query', () => {
    const label = toolActivityLabel(
      'search_regional_knowledge',
      JSON.stringify({ query: 'rozhledna' }),
    )
    expect(label).toContain('rozhledna')
  })
})
