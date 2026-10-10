import { ReviewsPanelInstance } from './ReviewsPanelInstance'
import { useReviews } from './ReviewsContext'
import './reviews-panel.css'

export function FloatingReviewsPanel() {
  const { panels } = useReviews()
  return (
    <>
      {panels.map((panel) => (
        <ReviewsPanelInstance key={panel.id} id={panel.id} query={panel.query} />
      ))}
    </>
  )
}
