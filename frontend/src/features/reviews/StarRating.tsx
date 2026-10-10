import { formatRatingCs } from './reviewsFormat'

type StarRatingProps = {
  value: number | null
  size?: 'sm' | 'md' | 'lg'
}

export function StarRating({ value, size = 'md' }: StarRatingProps) {
  if (value == null) return null
  const clamped = Math.min(5, Math.max(0, value))
  const label = `${formatRatingCs(clamped)} z 5`

  return (
    <div className={`star-rating star-rating--${size}`} role="img" aria-label={label} title={label}>
      {Array.from({ length: 5 }, (_, index) => {
        const star = index + 1
        const fill = Math.min(1, Math.max(0, clamped - index))
        return (
          <span key={star} className="star-rating__slot">
            <span className="star-rating__empty" aria-hidden="true">
              ★
            </span>
            <span
              className="star-rating__fill"
              style={{ width: `${fill * 100}%` }}
              aria-hidden="true"
            >
              ★
            </span>
          </span>
        )
      })}
      <span className="star-rating__value">{formatRatingCs(clamped)}</span>
    </div>
  )
}
