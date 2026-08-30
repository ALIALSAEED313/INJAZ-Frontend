import { useEffect, useMemo, useState } from "react";
import { getReviewsForFreelancer } from "../../services/review.Service";

function ProfileReviews({ userId }) {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState("relevant");

  useEffect(() => {
    async function fetchReviews() {
      try {
        const data = await getReviewsForFreelancer(userId);
        setReviews(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("Error fetching reviews:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchReviews();
  }, [userId]);

  const totalReviews = reviews.length;

  const averageRating = useMemo(() => {
    if (!totalReviews) return 0;
    return (
      reviews.reduce((total, review) => total + Number(review.rating || 0), 0) /
      totalReviews
    );
  }, [reviews, totalReviews]);

  const ratingCounts = {
    5: reviews.filter((review) => Number(review.rating) === 5).length,
    4: reviews.filter((review) => Number(review.rating) === 4).length,
    3: reviews.filter((review) => Number(review.rating) === 3).length,
    2: reviews.filter((review) => Number(review.rating) === 2).length,
    1: reviews.filter((review) => Number(review.rating) === 1).length,
  };

  const filteredReviews = useMemo(() => {
    const normalized = [...reviews].filter((review) =>
      (review.comment || "").toLowerCase().includes(search.toLowerCase()),
    );

    return normalized.sort((a, b) => {
      if (sortBy === "newest") {
        return new Date(b.createdAt) - new Date(a.createdAt);
      }

      if (sortBy === "highest") {
        return Number(b.rating) - Number(a.rating);
      }

      if (sortBy === "lowest") {
        return Number(a.rating) - Number(b.rating);
      }

      return (
        Number(b.rating) - Number(a.rating) ||
        new Date(b.createdAt) - new Date(a.createdAt)
      );
    });
  }, [reviews, search, sortBy]);

  if (loading) {
    return <div className="profile-section-loading">Loading reviews...</div>;
  }

  if (!totalReviews) {
    return (
      <div className="profile-empty-state">
        <div className="profile-empty-icon">★</div>
        <h3>No reviews yet</h3>
        <p>This freelancer has not received any reviews yet.</p>
      </div>
    );
  }

  return (
    <div className="profile-review-layout">
      <div className="profile-review-summary">
        <div className="profile-review-score">
          <strong>{averageRating.toFixed(1)}</strong>
          <span>
            {"★".repeat(Math.round(averageRating))}
            {"☆".repeat(5 - Math.round(averageRating))}
          </span>
          <small>
            {totalReviews} review{totalReviews > 1 ? "s" : ""}
          </small>
        </div>

        <div className="profile-review-bars">
          {[5, 4, 3, 2, 1].map((star) => {
            const count = ratingCounts[star];
            const percent = totalReviews ? (count / totalReviews) * 100 : 0;

            return (
              <div className="review-bar-row" key={star}>
                <span>{star}★</span>
                <div className="review-bar-track">
                  <div
                    className="review-bar-fill"
                    style={{ width: `${percent}%` }}
                  />
                </div>
                <small>{count}</small>
              </div>
            );
          })}
        </div>
      </div>

      <div className="profile-review-controls">
        <input
          type="text"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Search review text"
          className="profile-search-input"
        />

        <select
          value={sortBy}
          onChange={(event) => setSortBy(event.target.value)}
          className="profile-sort-select"
        >
          <option value="relevant">Most relevant</option>
          <option value="newest">Newest</option>
          <option value="highest">Highest rating</option>
          <option value="lowest">Lowest rating</option>
        </select>
      </div>

      <div className="profile-review-list">
        {filteredReviews.map((review) => (
          <article key={review._id} className="profile-review-item">
            <div className="profile-review-header">
              <div className="profile-review-user">
                {review.reviewer?.avatarUrl ? (
                  <img
                    src={review.reviewer.avatarUrl}
                    alt={
                      review.reviewer?.name ||
                      review.reviewer?.username ||
                      "Reviewer"
                    }
                  />
                ) : (
                  <div className="profile-review-fallback">
                    {(review.reviewer?.name || review.reviewer?.username || "R")
                      .charAt(0)
                      .toUpperCase()}
                  </div>
                )}

                <div>
                  <strong>
                    {review.reviewer?.name ||
                      review.reviewer?.username ||
                      "Client"}
                  </strong>
                  {review.reviewer?.country ? (
                    <small>{review.reviewer.country}</small>
                  ) : null}
                </div>
              </div>

              <div className="profile-review-meta">
                <span>
                  {"★".repeat(Number(review.rating || 0))}
                  {"☆".repeat(5 - Number(review.rating || 0))}
                </span>
                <small>
                  {new Date(review.createdAt).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })}
                </small>
              </div>
            </div>

            <p className="profile-review-comment">
              {review.comment || "No additional comment provided."}
            </p>
          </article>
        ))}
      </div>
    </div>
  );
}

export default ProfileReviews;
