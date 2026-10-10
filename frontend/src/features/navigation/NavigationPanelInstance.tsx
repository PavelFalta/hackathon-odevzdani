import { defaultNavigationWindowSize } from '../floating-windows/floatingWindowDefaults'
import { MobileDockPortal } from '../shell/MobileDockPortal'
import { useShellPanelPresentation } from '../shell/useShellPanelPresentation'
import { profileLabel } from './navigationFormat'
import { NavigationSteps } from './NavigationSteps'
import { useNavigation } from './NavigationContext'
import type { NavigationPanel } from './navigationTypes'

type NavigationPanelInstanceProps = {
  panel: NavigationPanel
}

export function NavigationPanelInstance({ panel }: NavigationPanelInstanceProps) {
  const { close } = useNavigation()
  const { id, request, state } = panel
  const label =
    state.status === 'ready'
      ? `${state.plan.fromLabel} → ${state.plan.toLabel}`
      : request.destination

  const { docked, panelRef, style, drag } = useShellPanelPresentation({
    id,
    kind: 'navigation',
    label,
    anchor: 'bottom-right',
    defaultSize: defaultNavigationWindowSize(),
    onClose: () => close(id),
  })

  const panelNode = (
    <section
      ref={panelRef}
      className={`navigation-panel kairos-floating-panel${docked ? ' kairos-floating-panel--dock' : ''}`}
      style={style}
      aria-label={`Navigace: ${label}`}
      data-testid="navigation-panel"
      data-window-id={id}
    >
      <header className="navigation-panel__header">
        <div
          className="navigation-panel__drag kairos-floating-panel__drag"
          onPointerDown={docked ? undefined : drag.onPointerDown}
        >
          Navigace · {profileLabel(request.profile ?? 'driving')}
        </div>
        <button
          type="button"
          className="navigation-panel__icon-btn"
          onClick={() => close(id)}
          aria-label="Zavřít navigaci"
          title="Zavřít"
        >
          ✕
        </button>
      </header>

      <div className="navigation-panel__body kairos-scroll">
        {state.status === 'loading' ? (
          <div className="navigation-panel__loading" role="status">
            <span className="navigation-panel__spinner" aria-hidden="true" />
            Plánuji trasu…
          </div>
        ) : null}
        {state.status === 'error' ? (
          <p className="navigation-panel__error" role="alert">
            {state.message}
          </p>
        ) : null}
        {state.status === 'ready' ? <NavigationSteps plan={state.plan} /> : null}
      </div>
    </section>
  )

  if (docked) {
    return (
      <MobileDockPortal id={id} label={label} kind="navigation" open onClose={() => close(id)}>
        {panelNode}
      </MobileDockPortal>
    )
  }

  return panelNode
}
