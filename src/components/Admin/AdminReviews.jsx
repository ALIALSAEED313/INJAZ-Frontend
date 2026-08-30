function AdminReviews({
  reviews,
  filteredReviews,
  reviewSearch,
  setReviewSearch,
  reviewRatingFilter,
  setReviewRatingFilter,
  setDeleteConfirm,
}) {
  return (
    <section>
      <h2>Reviews</h2>

      <p>
        Showing: {filteredReviews.length} of {reviews.length}
      </p>

      <input
        type="text"
        placeholder="Search reviews..."
        value={reviewSearch}
        onChange={(event) => setReviewSearch(event.target.value)}
      />

      <select
        value={reviewRatingFilter}
        onChange={(event) => setReviewRatingFilter(event.target.value)}
      >
        <option value="all">All Ratings</option>
        <option value="5">5 Stars</option>
        <option value="4">4 Stars</option>
        <option value="3">3 Stars</option>
        <option value="2">2 Stars</option>
        <option value="1">1 Star</option>
      </select>

      {filteredReviews.length === 0 ? (
        <p>No reviews found.</p>
      ) : (
        filteredReviews.map((review) => (
          <div key={review._id}>
            <p>
              <strong>Reviewer:</strong>{" "}
              {review.reviewer?.name || review.reviewer?.username || "Unknown"}
            </p>

            <p>
              <strong>Service:</strong> {review.service?.title || "Unknown"}
            </p>

            <p>
              <strong>Rating:</strong> {review.rating}
            </p>

            <p>
              <strong>Comment:</strong> {review.comment}
            </p>

            <button
              type="button"
              onClick={() =>
                setDeleteConfirm({
                  type: "review",
                  id: review._id,
                  name: review.service?.title || "this review",
                })
              }
            >
              Delete Review
            </button>

            <hr />
          </div>
        ))
      )}
    </section>
  );
}

export default AdminReviews;
