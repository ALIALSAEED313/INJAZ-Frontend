import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router";
import { useTranslation } from "react-i18next";
import { getCurrentUser } from "../services/authService";
import { getReviewByService } from "../services/review.Service";
import RatingStars from "../components/RatingStars";
import Icon from "../components/Icon";
import PageLoader from "../components/loading-ui/Loading";

const API_URL = "http://localhost:3000";

function ServiceDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [service, setService] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [reviewSummary, setReviewSummary] = useState({
    averageRating: 0,
    reviewCount: 0,
    distribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
  });
  const [reviewPage, setReviewPage] = useState(1);
  const [hasMoreReviews, setHasMoreReviews] = useState(false);
  const [reviewSort, setReviewSort] = useState("recent");
  const [reviewLoading, setReviewLoading] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);
  const [ordering, setOrdering] = useState(false);

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "auto" });
  }, [id]);

  useEffect(() => {
    let active = true;
    async function load() {
      try {
        setLoading(true);
        const [serviceResponse, reviewData] = await Promise.all([
          fetch(`${API_URL}/services/${id}`),
          getReviewByService(id, { page: 1, sort: reviewSort }),
        ]);
        if (!serviceResponse.ok) throw new Error("Service not found");
        const serviceData = await serviceResponse.json();
        if (!active) return;
        setService(serviceData);
        setReviews(reviewData.reviews || []);
        setReviewSummary(reviewData.summary || {
          averageRating: 0,
          reviewCount: 0,
          distribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
        });
        setReviewPage(1);
        setHasMoreReviews(Boolean(reviewData.pagination?.hasMore));
      } catch (requestError) {
        if (active) setError(requestError.message || t("serviceDetails.failedToLoadService"));
      } finally {
        if (active) setLoading(false);
      }
    }
    load();
    return () => {
      active = false;
    };
  }, [id, reviewSort, t]);

  useEffect(() => {
    async function loadUser() {
      if (!localStorage.getItem("token")) return;
      try {
        setCurrentUser(await getCurrentUser());
      } catch {
        setCurrentUser(null);
      }
    }
    loadUser();
  }, []);

  const freelancer = service?.freelancer || {};
  const freelancerId = String(freelancer?._id || freelancer || "");
  const currentUserId = String(currentUser?._id || currentUser?.id || "");
  const isOwner = Boolean(freelancerId && currentUserId && freelancerId === currentUserId);
  const freelancerName = freelancer?.username || t("serviceDetails.freelancer");
  const initials = freelancerName.slice(0, 2).toUpperCase();
  const ratingLabel = reviewSummary.reviewCount
    ? `${reviewSummary.averageRating.toFixed(1)} (${reviewSummary.reviewCount})`
    : t("serviceDetails.noReviewsYet", { defaultValue: "No reviews yet" });

  const distributionRows = useMemo(
    () => [5, 4, 3, 2, 1].map(rating => ({
      rating,
      count: Number(reviewSummary.distribution?.[rating] || 0),
      percent: reviewSummary.reviewCount
        ? (Number(reviewSummary.distribution?.[rating] || 0) / reviewSummary.reviewCount) * 100
        : 0,
    })),
    [reviewSummary],
  );

  async function loadMoreReviews() {
    try {
      setReviewLoading(true);
      const nextPage = reviewPage + 1;
      const data = await getReviewByService(id, { page: nextPage, sort: reviewSort });
      setReviews(previous => [...previous, ...(data.reviews || [])]);
      setReviewPage(nextPage);
      setHasMoreReviews(Boolean(data.pagination?.hasMore));
    } catch (requestError) {
      setError(requestError.response?.data?.message || t("serviceDetails.failedToLoadReviews", { defaultValue: "Unable to load more reviews." }));
    } finally {
      setReviewLoading(false);
    }
  }

  async function deleteService() {
    if (!window.confirm(t("serviceDetails.areYouSureYouWantToDeleteThisService"))) return;
    try {
      setDeleting(true);
      const response = await fetch(`${API_URL}/services/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message);
      }
      navigate("/services");
    } catch (requestError) {
      setError(requestError.message || t("serviceDetails.deleteFailed"));
    } finally {
      setDeleting(false);
    }
  }

  async function orderService() {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/sign-in");
      return;
    }
    try {
      setOrdering(true);
      setError("");
      const orderResponse = await fetch(`${API_URL}/orders`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ serviceId: service._id }),
      });
      const orderData = await orderResponse.json();
      if (!orderResponse.ok) throw new Error(orderData.message || orderData.err);
      const orderId = orderData.order?._id;

      const paymentResponse = await fetch(`${API_URL}/payments/${orderId}`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });
      const paymentData = await paymentResponse.json();
      if (!paymentResponse.ok || !paymentData.paymentUrl) {
        throw new Error(paymentData.message || t("serviceDetails.paymentFailed"));
      }
      window.location.assign(paymentData.paymentUrl);
    } catch (requestError) {
      setError(requestError.message || t("serviceDetails.orderFailed"));
      setOrdering(false);
    }
  }

  if (loading) return <PageLoader message={t("serviceDetails.loadingService")} />;
  if (error && !service) {
    return <main className="service-page"><div className="service-error" role="alert">{error}</div></main>;
  }

  return (
    <main className="service-page">
      <div className="service-bg" />
      <div className="service-shell">
        <nav className="service-nav">
          <Link to="/services" className="nav-back">← {t("serviceDetails.back")}</Link>
          <span className="nav-brand"><span className="nav-dot" />{t("serviceDetails.injaz")}</span>
        </nav>

        {error && <div className="service-error" role="alert">{error}</div>}

        {service.images?.length > 0 && (
          <section className="hero-gallery">
            <div className="hero-gallery-main">
              <img src={service.images[0]} alt={service.title} />
            </div>
            {service.images.length > 1 && (
              <div className="hero-gallery-thumbs">
                {service.images.slice(1, 4).map((image, index) => (
                  <img key={image} src={image} alt={`${service.title} ${index + 2}`} />
                ))}
              </div>
            )}
          </section>
        )}

        <section className="hero-block">
          <div className="hero-content">
            <span className="hero-badge">{service.category}</span>
            <h1>{service.title}</h1>
            <p>{service.description}</p>
            <div className="meta-row">
              <span className="meta-pill service-rating-pill">
                <Icon name="star" size={17} />
                {ratingLabel}
              </span>
              <span className="meta-pill">{service.deliveryTime} {t("serviceDetails.days")}</span>
            </div>
          </div>
        </section>

        <div className="content-grid">
          <div className="content-column">
            <section className="panel intro-panel">
              <div className="section-header">
                <div>
                  <p className="eyebrow">{t("serviceDetails.theService")}</p>
                  <h2>{t("serviceDetails.whatYouGet")}</h2>
                </div>
              </div>
              <p>{service.description}</p>
            </section>

            <section className="panel freelancer-panel">
              <div className="section-header compact">
                <div>
                  <p className="eyebrow">{t("serviceDetails.freelancer")}</p>
                  <h2>{freelancerName}</h2>
                </div>
              </div>
              <div className="freelancer-card">
                <div className="avatar-wrap">
                  {freelancer.avatarUrl
                    ? <img src={freelancer.avatarUrl} alt={freelancerName} className="avatar-image-render" />
                    : <div className="avatar-gradient">{initials}</div>}
                </div>
                <div className="freelancer-meta">
                  <strong>{freelancerName}</strong>
                  <span>{t("serviceDetails.injazCreator")}</span>
                </div>
                {freelancerId && (
                  <Link to={`/profile/${freelancerId}`} className="button-secondary profile-button">
                    {t("serviceDetails.viewSellerProfile")}
                  </Link>
                )}
              </div>
            </section>

            <section className="panel service-reviews-panel" aria-labelledby="service-reviews-title">
              <div className="section-header review-section-header">
                <div>
                  <p className="eyebrow">{t("serviceDetails.clientFeedback", { defaultValue: "Client feedback" })}</p>
                  <h2 id="service-reviews-title">{t("serviceDetails.reviews", { defaultValue: "Reviews" })}</h2>
                </div>
                <label className="review-sort-control">
                  <span>{t("serviceDetails.sortReviews", { defaultValue: "Sort reviews" })}</span>
                  <select value={reviewSort} onChange={event => setReviewSort(event.target.value)}>
                    <option value="recent">{t("serviceDetails.mostRecent", { defaultValue: "Most recent" })}</option>
                    <option value="highest">{t("serviceDetails.highestRating", { defaultValue: "Highest rating" })}</option>
                    <option value="lowest">{t("serviceDetails.lowestRating", { defaultValue: "Lowest rating" })}</option>
                  </select>
                </label>
              </div>

              <div className="service-rating-summary">
                <div className="service-rating-score">
                  <strong>{reviewSummary.reviewCount ? reviewSummary.averageRating.toFixed(1) : "—"}</strong>
                  <RatingStars value={reviewSummary.averageRating} readOnly />
                  <span>{reviewSummary.reviewCount} {t("serviceDetails.reviews", { defaultValue: "reviews" })}</span>
                </div>
                <div className="service-rating-distribution">
                  {distributionRows.map(row => (
                    <div className="service-rating-bar" key={row.rating}>
                      <span>{row.rating} ★</span>
                      <div><i style={{ width: `${row.percent}%` }} /></div>
                      <small>{row.count}</small>
                    </div>
                  ))}
                </div>
              </div>

              {reviews.length === 0 ? (
                <div className="service-review-empty">
                  <Icon name="star" size={24} />
                  <h3>{t("serviceDetails.noReviewsYet", { defaultValue: "No reviews yet" })}</h3>
                  <p>{t("serviceDetails.firstReviewMessage", { defaultValue: "Completed-order reviews will appear here." })}</p>
                </div>
              ) : (
                <div className="service-review-list">
                  {reviews.map(review => {
                    const name = review.reviewer?.name || review.reviewer?.username || t("serviceDetails.client", { defaultValue: "Client" });
                    return (
                      <article className="service-review-item" key={review._id}>
                        <header>
                          {review.reviewer?.avatarUrl
                            ? <img src={review.reviewer.avatarUrl} alt={name} />
                            : <span className="reviewer-avatar-fallback" aria-hidden="true">{name.charAt(0).toUpperCase()}</span>}
                          <div>
                            <strong>{name}</strong>
                            <RatingStars value={review.rating} readOnly />
                          </div>
                          <time dateTime={review.createdAt}>
                            {new Intl.DateTimeFormat(undefined, { dateStyle: "medium" }).format(new Date(review.createdAt))}
                          </time>
                        </header>
                        <p>{review.comment || t("serviceDetails.noWrittenComment", { defaultValue: "No written comment." })}</p>
                      </article>
                    );
                  })}
                  {hasMoreReviews && (
                    <button type="button" className="secondary-btn load-more-reviews" disabled={reviewLoading} onClick={loadMoreReviews}>
                      {reviewLoading
                        ? t("common.loading")
                        : t("serviceDetails.loadMore", { defaultValue: "Load more reviews" })}
                    </button>
                  )}
                </div>
              )}
            </section>
          </div>

          <aside className="purchase-column">
            <div className="purchase-panel">
              <div className="purchase-header"><span>{t("serviceDetails.startingFrom")}</span></div>
              <div className="price-row"><span>{service.price}</span><small>{t("serviceDetails.bhd")}</small></div>
              <div className="purchase-details">
                <div className="detail-row"><span>{t("serviceDetails.delivery")}</span><strong>{service.deliveryTime} {t("serviceDetails.days2")}</strong></div>
                <div className="detail-row"><span>{t("serviceDetails.rating")}</span><strong>{ratingLabel}</strong></div>
              </div>
              <div className="purchase-actions">
                {isOwner ? (
                  <>
                    <Link to={`/services/${id}/edit`} className="button-primary purchase-button">{t("serviceDetails.editService")}</Link>
                    <button type="button" className="button-danger" disabled={deleting} onClick={deleteService}>
                      {deleting ? t("serviceDetails.deleting") : t("serviceDetails.deleteService")}
                    </button>
                  </>
                ) : currentUser ? (
                  <button type="button" className="button-primary purchase-button" disabled={ordering} onClick={orderService}>
                    {ordering ? t("serviceDetails.creatingOrder") : t("serviceDetails.orderService")}
                  </button>
                ) : (
                  <Link to="/sign-in" className="button-primary purchase-button">{t("serviceDetails.signInToOrder")}</Link>
                )}
              </div>
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
}

export default ServiceDetailsPage;
