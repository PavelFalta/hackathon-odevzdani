"""CLI demo — uses the same logic as POST /api/reviews/search."""

import json
import os
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent / "backend"))

from app.services.google_places_reviews import ReviewsServiceError, search_place_reviews


def main() -> None:
    api_key = os.environ.get("REVIEWS_API_KEY", "").strip()
    if not api_key:
        print("Set REVIEWS_API_KEY in the environment.", file=sys.stderr)
        sys.exit(1)

    query = sys.argv[1] if len(sys.argv) > 1 else "Rozhledna Boubinský výhled, Karlovarský kraj"
    print(f"Hledám: {query!r}\n")

    try:
        result = search_place_reviews(query, api_key)
    except ReviewsServiceError as exc:
        print(exc)
        sys.exit(1)

    print(
        json.dumps(
            {
                "place_name": result.place_name,
                "rating": result.rating,
                "rating_count": result.rating_count,
                "reviews": [
                    {
                        "author": r.author,
                        "rating": r.rating,
                        "text": r.text,
                        "published_at": r.published_at,
                    }
                    for r in result.reviews
                ],
            },
            ensure_ascii=False,
            indent=2,
        ),
    )


if __name__ == "__main__":
    main()
