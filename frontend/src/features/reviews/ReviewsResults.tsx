import { useRef } from 'react'
import { ReviewCard } from './ReviewCard'
import { ReviewsPlaceSummary } from './ReviewsPlaceSummary'
import type { ReviewsResult } from './reviewsTypes'
import { useReviewsAutoScroll } from './useReviewsAutoScroll'

type ReviewsResultsProps = {
  result: ReviewsResult
}

export function ReviewsResults({ result }: ReviewsResultsProps) {
  const scrollRef = useRef<HTMLDivElement>(null)
  useReviewsAutoScroll(scrollRef, result.reviews.length > 0)

  return (
    <div className="reviews-panel__results">
      <ReviewsPlaceSummary result={result} />
      <div ref={scrollRef} className="reviews-panel__reviews-scroll kairos-scroll">
        {result.reviews.length === 0 ? (
          <p className="reviews-panel__empty">Google pro toto místo nevrátilo text recenzí.</p>
        ) : (
          <ul className="reviews-panel__list">
            {result.reviews.map((review, index) => (
              <li key={`${review.author}-${index}`}>
                <ReviewCard review={review} />
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}
