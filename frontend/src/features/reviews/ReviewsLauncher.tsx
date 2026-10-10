import { useReviews } from './ReviewsContext'

export function ReviewsLauncher() {
  const { panels, open } = useReviews()
  if (panels.length > 0) return null

  return (
    <button
      type="button"
      className="reviews-panel-launcher"
      onClick={() => open('')}
      aria-label="Otevřít recenze"
    >
      Recenze
    </button>
  )
}
