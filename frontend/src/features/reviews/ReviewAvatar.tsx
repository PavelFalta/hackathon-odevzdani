type ReviewAvatarProps = {
  name: string
}

export function ReviewAvatar({ name }: ReviewAvatarProps) {
  const initial = name.trim().charAt(0).toUpperCase() || '?'

  return (
    <span className="reviews-avatar" aria-hidden="true">
      <svg className="reviews-avatar__icon" viewBox="0 0 24 24" focusable="false">
        <path
          d="M12 12c2.2 0 4-1.8 4-4s-1.8-4-4-4-4 1.8-4 4 1.8 4 4 4zm0 2c-3.3 0-6 1.8-6 4v1h12v-1c0-2.2-2.7-4-6-4z"
          fill="currentColor"
        />
      </svg>
      <span className="reviews-avatar__initial">{initial}</span>
    </span>
  )
}
