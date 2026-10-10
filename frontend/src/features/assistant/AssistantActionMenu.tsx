import { useCallback, useEffect, useRef, useState } from 'react'
import { useAssistantMenuSessionHint } from './hooks/useAssistantMenuSessionHint'
import { useCoarsePointer } from './hooks/useCoarsePointer'
import './assistant-action-menu.css'

type AssistantActionMenuProps = {
  busy?: boolean
  onChat: () => void
  onTalk: () => void
  onProfil: () => void
}

export function AssistantActionMenu({ busy, onChat, onTalk, onProfil }: AssistantActionMenuProps) {
  const coarse = useCoarsePointer()
  const { showHint, markTouched } = useAssistantMenuSessionHint()
  const [expanded, setExpanded] = useState(false)
  const [hovered, setHovered] = useState(false)
  const rootRef = useRef<HTMLElement>(null)
  const menuOpen = coarse ? expanded : hovered

  const collapse = useCallback(() => {
    setExpanded(false)
    setHovered(false)
  }, [])

  useEffect(() => {
    if (!coarse || !expanded) return
    const onDoc = (event: PointerEvent) => {
      const root = rootRef.current
      if (root && !root.contains(event.target as Node)) collapse()
    }
    document.addEventListener('pointerdown', onDoc)
    return () => document.removeEventListener('pointerdown', onDoc)
  }, [coarse, expanded, collapse])

  const pickChat = () => {
    markTouched()
    collapse()
    onChat()
  }

  const pickTalk = () => {
    markTouched()
    collapse()
    onTalk()
  }

  const pickProfil = () => {
    markTouched()
    collapse()
    onProfil()
  }

  const onMenuPointerDown = () => {
    markTouched()
  }

  const onTriggerClick = () => {
    markTouched()
    if (coarse) {
      if (expanded) pickProfil()
      else setExpanded(true)
      return
    }
    pickProfil()
  }

  return (
    <nav
      ref={rootRef}
      className="assistant-action-menu"
      aria-label="Akce asistenta"
      data-expanded={expanded ? 'true' : 'false'}
      data-hint-pulse={showHint && !expanded && !busy ? 'true' : 'false'}
      data-busy={busy ? 'true' : 'false'}
      onPointerDown={onMenuPointerDown}
      onMouseEnter={() => {
        if (!coarse) setHovered(true)
      }}
      onMouseLeave={() => {
        if (!coarse) setHovered(false)
      }}
    >
      <div className="assistant-action-menu__dock">
        <div className="assistant-action-menu__cylinder" aria-hidden="true">
          <span className="assistant-action-menu__chamber assistant-action-menu__chamber--a" />
          <span className="assistant-action-menu__chamber assistant-action-menu__chamber--b" />
          <span className="assistant-action-menu__chamber assistant-action-menu__chamber--c" />
        </div>
        <button
          type="button"
          className="assistant-action-menu__side assistant-action-menu__side--chat"
          onClick={pickChat}
          aria-label="Psaní"
        >
          <span className="assistant-action-menu__side-label">Psaní</span>
        </button>
        <button
          type="button"
          className="assistant-action-menu__trigger"
          onClick={onTriggerClick}
          aria-expanded={coarse ? expanded : undefined}
          aria-haspopup="menu"
          aria-label={menuOpen ? 'Profil' : 'Nabídka asistenta'}
        >
          <span className="assistant-action-menu__trigger-ring" aria-hidden="true" />
          <span className="assistant-action-menu__trigger-core" aria-hidden="true" />
          <span className="assistant-action-menu__trigger-label assistant-action-menu__side-label">
            Profil
          </span>
        </button>
        <button
          type="button"
          className="assistant-action-menu__side assistant-action-menu__side--talk"
          onClick={pickTalk}
          aria-label="Hlas"
        >
          <span className="assistant-action-menu__side-label">Hlas</span>
        </button>
      </div>
    </nav>
  )
}
