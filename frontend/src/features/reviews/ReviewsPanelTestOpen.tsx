import { useReviews } from './ReviewsContext'

/** Test-only control to open the reviews panel without the removed launcher. */
export function ReviewsPanelTestOpen({ query = 'Test place' }: { query?: string }) {
  const { open } = useReviews()
  return (
    <button type="button" onClick={() => open(query)}>
      Open reviews for test
    </button>
  )
}
