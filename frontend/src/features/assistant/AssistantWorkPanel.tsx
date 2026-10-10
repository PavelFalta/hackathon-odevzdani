import { useEffect, useState } from 'react'

type AssistantWorkPanelProps = {
  steps: string[]
  busy: boolean
}

export function AssistantWorkPanel({ steps = [], busy }: AssistantWorkPanelProps) {
  const [expanded, setExpanded] = useState(false)

  useEffect(() => {
    if (steps.length === 0) setExpanded(false)
  }, [steps.length])

  if (steps.length === 0) return null

  const latest = steps[steps.length - 1]
  const summary = busy
    ? latest
    : `Hotovo (${steps.length} ${steps.length === 1 ? 'krok' : 'kroky'})`

  return (
    <div className="assistant-work" data-busy={busy ? 'true' : 'false'}>
      <button
        type="button"
        className="assistant-work__toggle"
        aria-expanded={expanded}
        onClick={() => setExpanded((open) => !open)}
      >
        <span className="assistant-work__label">{busy ? 'Pracuji' : 'Pracoval jsem'}</span>
        <span className="assistant-work__current">{summary}</span>
        <span className="assistant-work__chevron" aria-hidden="true">
          {expanded ? '▾' : '▸'}
        </span>
      </button>
      {expanded ? (
        <ol className="assistant-work__steps">
          {steps.map((step, index) => (
            <li key={`${index}-${step}`}>{step}</li>
          ))}
        </ol>
      ) : null}
    </div>
  )
}
