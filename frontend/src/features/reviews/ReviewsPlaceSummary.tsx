import type { ReviewsResult } from './reviewsTypes'
import { formatRatingCs, formatReviewCount } from './reviewsFormat'
import { StarRating } from './StarRating'

type ReviewsPlaceSummaryProps = {
  result: ReviewsResult
}

export function ReviewsPlaceSummary({ result }: ReviewsPlaceSummaryProps) {
  const countLabel = result.rating_count != null ? formatReviewCount(result.rating_count) : null
  const scoreLabel = result.rating != null ? formatRatingCs(result.rating) : null

  return (
    <header className="reviews-panel__place">
      <h3>{result.place_name || 'Místo'}</h3>
      {scoreLabel ? (
        <div className="reviews-panel__place-hero">
          <p className="reviews-panel__score" aria-hidden="true">
            {scoreLabel}
          </p>
          <div className="reviews-panel__place-stats">
            <StarRating value={result.rating} size="lg" />
            {countLabel ? <p className="reviews-panel__count">{countLabel}</p> : null}
          </div>
        </div>
      ) : (
        <div className="reviews-panel__place-stats">
          {countLabel ? <p className="reviews-panel__count">{countLabel}</p> : null}
        </div>
      )}
    </header>
  )
}
