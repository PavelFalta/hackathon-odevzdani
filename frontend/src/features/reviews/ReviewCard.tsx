import type { ReviewItem } from '../../api/reviews'
import { ReviewAvatar } from './ReviewAvatar'
import { formatReviewDate } from './reviewsFormat'
import { StarRating } from './StarRating'

type ReviewCardProps = {
  review: ReviewItem
}

export function ReviewCard({ review }: ReviewCardProps) {
  const date = formatReviewDate(review.published_at)

  return (
    <article className="reviews-panel__card">
      <div className="reviews-panel__card-head">
        <ReviewAvatar name={review.author} />
        <div className="reviews-panel__card-meta">
          <span className="reviews-panel__author">{review.author}</span>
          <div className="reviews-panel__card-rating">
            <StarRating value={review.rating} size="sm" />
            {date ? <time className="reviews-panel__date">{date}</time> : null}
          </div>
        </div>
      </div>
      {review.text ? (
        <p className="reviews-panel__card-text">{review.text}</p>
      ) : (
        <p className="reviews-panel__muted">Bez textu.</p>
      )}
    </article>
  )
}
