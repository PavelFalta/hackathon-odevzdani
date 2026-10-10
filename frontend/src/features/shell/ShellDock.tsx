import { useMobileDock } from './MobileDockContext'
import { useIsMobileShell } from './useIsMobileShell'
import './shell-mobile.css'

export function ShellDock() {
  const mobile = useIsMobileShell()
  const { attachBodyElement, slots, activeId, setActiveId, dockOpen } = useMobileDock()

  if (!mobile || !dockOpen) return null

  return (
    <aside className="shell-dock" aria-label="Panel asistenta">
      <nav className="shell-dock__tabs" aria-label="Záložky panelu">
        {slots.map((slot) => {
          const active = slot.id === activeId
          return (
            <button
              key={slot.id}
              type="button"
              className="shell-dock__tab"
              data-active={active ? 'true' : 'false'}
              aria-current={active ? 'page' : undefined}
              onClick={() => setActiveId(slot.id)}
            >
              <span className="shell-dock__tab-label">{slot.label}</span>
            </button>
          )
        })}
      </nav>
      <div ref={attachBodyElement} className="shell-dock__body" />
    </aside>
  )
}
