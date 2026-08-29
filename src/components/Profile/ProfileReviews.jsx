import { useEffect, useState } from "react"
import { getReviewsForFreelancer } from "../../services/review.Service"

function ProfileReviews({ userId }) {
  const [reviews, setReviews] = useState([])
  const [loading, setLoading] = useState(true)

  const [search, setSearch] = useState("")
  const [sortBy, setSortBy] = useState("relevant")

  useEffect(() => {
    async function fetchReviews() {
      try {
        const data = await getReviewsForFreelancer(userId)
        setReviews(data)
      } catch (err) {
        console.error("Error fetching reviews:", err)
      } finally {
        setLoading(false)
      }
    }

    fetchReviews()
  }, [userId])

  if (loading) return <p>Loading reviews...</p>

  if (reviews.length === 0) {
    return <p>No reviews yet.</p>
  }

  const totalReviews = reviews.length

  const averageRating =
    reviews.reduce((total, review) => total + review.rating, 0) / totalReviews

  const ratingCounts = {
    5: reviews.filter((review) => review.rating === 5).length,
    4: reviews.filter((review) => review.rating === 4).length,
    3: reviews.filter((review) => review.rating === 3).length,
    2: reviews.filter((review) => review.rating === 2).length,
    1: reviews.filter((review) => review.rating === 1).length,
  }

  const filteredReviews = [...reviews]
    .filter((review) =>
      review.comment?.toLowerCase().includes(search.toLowerCase()),
    )
    .sort((a, b) => {
      if (sortBy === "newest") {
        return new Date(b.createdAt) - new Date(a.createdAt)
      }

      if (sortBy === "highest") {
        return b.rating - a.rating
      }

      if (sortBy === "lowest") {
        return a.rating - b.rating
      }

      if (b.rating !== a.rating) {
        return b.rating - a.rating
      }

      return new Date(b.createdAt) - new Date(a.createdAt)
    })

  return (
    <div>
      <h2>Reviews</h2>

      <div>
        <h3>{totalReviews} reviews</h3>

        <div>
          {[5, 4, 3, 2, 1].map((star) => (
            <div key={star}>
              <span>{star} Stars</span>

              <progress value={ratingCounts[star]} max={totalReviews} />

              <span>({ratingCounts[star]})</span>
            </div>
          ))}
        </div>

        <div>
          <span>
            {"★".repeat(Math.round(averageRating))}
            {"☆".repeat(5 - Math.round(averageRating))}
          </span>

          <strong>{averageRating.toFixed(1)}</strong>
        </div>
      </div>

      <div>
        <input
          type="text"
          placeholder="Search reviews"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
        />
      </div>

      <div>
        <label htmlFor="sortReviews">Sort By </label>

        <select
          id="sortReviews"
          value={sortBy}
          onChange={(event) => setSortBy(event.target.value)}
        >
          <option value="relevant">Most relevant</option>
          <option value="newest">Newest</option>
          <option value="highest">Highest rating</option>
          <option value="lowest">Lowest rating</option>
        </select>
      </div>

      {filteredReviews.map((review) => (
        <div key={review._id}>
          <div>
            {review.reviewer?.avatarUrl ? (
              <img src={review.reviewer.avatarUrl} alt="reviewer avatar" />
            ) : (
              <div>
                {(review.reviewer?.name || review.reviewer?.username)
                  ?.charAt(0)
                  .toUpperCase()}
              </div>
            )}

            <div>
              <h3>{review.reviewer?.name || review.reviewer?.username}</h3>

              {review.reviewer?.country && <p>{review.reviewer.country}</p>}
            </div>
          </div>
          <p>
            {"★".repeat(review.rating)}
            {"☆".repeat(5 - review.rating)} {review.rating}
          </p>

          <p>{review.comment}</p>

          <p>{new Date(review.createdAt).toLocaleDateString()}</p>
        </div>
      ))}
    </div>
  )
}

export default ProfileReviews
