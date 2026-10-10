import { cleanup, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'
import { AssistantWorkPanel } from './AssistantWorkPanel'

afterEach(() => cleanup())

describe('AssistantWorkPanel', () => {
  it('shows present tense label while busy', () => {
    render(<AssistantWorkPanel steps={['Hledám na mapě…']} busy />)
    expect(screen.getByText('Pracuji')).toBeInTheDocument()
  })

  it('shows past tense label when the turn finished', () => {
    render(<AssistantWorkPanel steps={['Hledám na mapě…']} busy={false} />)
    expect(screen.getByText('Pracoval jsem')).toBeInTheDocument()
    expect(screen.getByText(/hotovo/i)).toBeInTheDocument()
  })
})
