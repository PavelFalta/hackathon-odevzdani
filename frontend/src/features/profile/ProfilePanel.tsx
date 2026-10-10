import { useCallback, useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import {
  fetchConversation,
  fetchConversations,
  type ConversationDetail,
  type ConversationSummary,
} from '../../api/conversations'
import { useProfileMapLock } from './useProfileMapLock'
import './profile.css'

type ProfilePanelProps = {
  onClose: () => void
}

export function ProfilePanel({ onClose }: ProfilePanelProps) {
  const [list, setList] = useState<ConversationSummary[]>([])
  const [detail, setDetail] = useState<ConversationDetail | null>(null)
  const [error, setError] = useState<string | null>(null)

  useProfileMapLock(true)

  const loadList = useCallback(() => {
    fetchConversations()
      .then(setList)
      .catch(() => setError('Historii se nepodařilo načíst.'))
  }, [])

  useEffect(() => {
    loadList()
  }, [loadList])

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  const openConversation = (id: string) => {
    fetchConversation(id)
      .then(setDetail)
      .catch(() => setError('Konverzaci se nepodařilo otevřít.'))
  }

  const overlay = (
    <div className="profile-overlay">
      <button
        type="button"
        className="profile-overlay__scrim"
        aria-label="Zavřít historii"
        onClick={onClose}
      />
      <div
        className="profile-panel"
        role="dialog"
        aria-modal="true"
        aria-label="Historie konverzací"
      >
        <header className="profile-panel__header">
          <h2>Historie konverzací</h2>
          <button type="button" className="profile-panel__close" onClick={onClose}>
            Zavřít
          </button>
        </header>
        {error ? <p className="profile-panel__error">{error}</p> : null}
        <div className="profile-panel__body">
          <ul className="profile-panel__list kairos-scroll">
            {list.map((row) => (
              <li key={row.id}>
                <button
                  type="button"
                  className="profile-panel__row"
                  onClick={() => openConversation(row.id)}
                >
                  <span className="profile-panel__title">
                    {row.title ?? (row.mode === 'voice' ? 'Hlasová relace' : 'Konverzace')}
                  </span>
                  <span className="profile-panel__meta">
                    {row.mode} · {new Date(row.updated_at).toLocaleString('cs-CZ')}
                  </span>
                </button>
              </li>
            ))}
          </ul>
          <div className="profile-panel__detail kairos-scroll">
            {detail ? (
              <>
                <h3>{detail.title ?? 'Konverzace'}</h3>
                <ol className="profile-panel__timeline">
                  {detail.items.map((item, index) => (
                    <li key={`${item.created_at}-${index}`} data-kind={item.kind}>
                      {item.body}
                    </li>
                  ))}
                </ol>
              </>
            ) : (
              <p className="profile-panel__placeholder">Vyber konverzaci vlevo.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  )

  return createPortal(overlay, document.body)
}
