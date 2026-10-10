import type { DirectionsStep } from '../../api/mapDirections'
import { formatRouteDistance, formatRouteDuration } from './navigationFormat'
import { NavigationToolbar } from './NavigationToolbar'
import type { NavigationPlan } from './navigationTypes'

type NavigationStepsProps = {
  plan: NavigationPlan
}

function StepRow({ step, index }: { step: DirectionsStep; index: number }) {
  return (
    <li className="navigation-panel__step">
      <span className="navigation-panel__step-index" aria-hidden="true">
        {index + 1}
      </span>
      <div className="navigation-panel__step-body">
        <p className="navigation-panel__step-instruction">{step.instruction}</p>
        <p className="navigation-panel__step-meta">
          {formatRouteDistance(step.distance_m)}
          {step.name ? ` · ${step.name}` : ''}
        </p>
      </div>
    </li>
  )
}

export function NavigationSteps({ plan }: NavigationStepsProps) {
  return (
    <div className="navigation-panel__summary">
      <p className="navigation-panel__endpoints">
        <span className="navigation-panel__endpoint-label">Z</span> {plan.fromLabel}
      </p>
      <p className="navigation-panel__endpoints">
        <span className="navigation-panel__endpoint-label">Do</span> {plan.toLabel}
      </p>
      <p className="navigation-panel__totals">
        {formatRouteDistance(plan.distance_m)} · {formatRouteDuration(plan.duration_s)}
      </p>
      <NavigationToolbar plan={plan} />
      <ol className="navigation-panel__steps" aria-label="Navigační kroky">
        {plan.steps.map((step, index) => (
          <StepRow key={`${index}-${step.instruction}`} step={step} index={index} />
        ))}
      </ol>
    </div>
  )
}
