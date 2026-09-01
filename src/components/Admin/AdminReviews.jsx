import { useTranslation } from "react-i18next";
function AdminReviews({
  reviews,
  filteredReviews,
  reviewSearch,
  setReviewSearch,
  reviewRatingFilter,
  setReviewRatingFilter,
  setDeleteConfirm
}) {
  const {
    t
  } = useTranslation();
  return <section className="admin-management" aria-labelledby="reviews-title"><div className="admin-section-heading"><div><h2 id="reviews-title">{t("adminReviews.reviews")}</h2><p>{filteredReviews.length}{t("adminReviews.of")}{reviews.length}{t("adminReviews.reviews")}</p></div></div><div className="admin-toolbar"><label className="admin-search"><span>{t("adminReviews.searchReviews")}</span><input type="search" placeholder={t("adminReviews.reviewerServiceOrComment")} value={reviewSearch} onChange={e => setReviewSearch(e.target.value)} /></label><label><span>{t("adminReviews.rating")}</span><select value={reviewRatingFilter} onChange={e => setReviewRatingFilter(e.target.value)}><option value="all">{t("adminReviews.allRatings")}</option>{[5, 4, 3, 2, 1].map(rating => <option value={rating} key={rating}>{rating}{t("adminReviews.stars")}</option>)}</select></label></div>{filteredReviews.length === 0 ? <div className="admin-empty">{t("adminReviews.noReviewsMatchTheseFilters")}</div> : <div className="admin-table-wrap"><table className="admin-table"><thead><tr><th>{t("adminReviews.reviewer")}</th><th>{t("adminReviews.service")}</th><th>{t("adminReviews.rating")}</th><th>{t("adminReviews.comment")}</th><th>{t("adminReviews.date")}</th><th>{t("adminReviews.actions")}</th></tr></thead><tbody>{filteredReviews.map(review => <tr key={review._id}><td data-label={t("adminReviews.reviewer")}><strong>{review.reviewer?.name || review.reviewer?.username || t("adminReviews.unknown")}</strong></td><td data-label={t("adminReviews.service")}>{review.service?.title || t("adminReviews.unknown")}</td><td data-label={t("adminReviews.rating")}><span className="admin-rating">{review.rating}/5</span></td><td data-label={t("adminReviews.comment")} className="admin-comment">{review.comment || "—"}</td><td data-label={t("adminReviews.date")}>{review.createdAt ? new Date(review.createdAt).toLocaleDateString() : "—"}</td><td data-label={t("adminReviews.actions")}><button type="button" className="admin-danger-button" onClick={() => setDeleteConfirm({
                type: "review",
                id: review._id,
                name: review.service?.title || "this review"
              })}>{t("adminReviews.delete")}</button></td></tr>)}</tbody></table></div>}</section>;
}
export default AdminReviews;
