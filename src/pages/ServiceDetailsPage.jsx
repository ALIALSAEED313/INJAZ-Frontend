import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router";
import { getCurrentUser } from "../services/authService";
import PageLoader from "../components/loading-ui/Loading";
import { useTranslation } from "react-i18next";
function ServiceDetailsPage() {
  const {
    id
  } = useParams();
  const navigate = useNavigate();
  const {
    t
  } = useTranslation();
  const [service, setService] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);
  const [ordering, setOrdering] = useState(false);
  useEffect(() => {
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: "auto"
    });
  }, [id]);
  useEffect(() => {
    async function getService() {
      try {
        setLoading(true);
        setError("");
        const response = await fetch(`http://localhost:3000/services/${id}`);
        if (!response.ok) {
          throw new Error("Service not found");
        }
        const data = await response.json();
        setService(data);
      } catch (err) {
        console.error("Get service error:", err);
        setError(t("serviceDetails.failedToLoadService"));
      } finally {
        setLoading(false);
      }
    }
    if (id) {
      getService();
    }
  }, [id, t]);
  useEffect(() => {
    async function getUser() {
      const token = localStorage.getItem("token");
      if (!token) {
        setCurrentUser(null);
        return;
      }
      try {
        const user = await getCurrentUser();
        setCurrentUser(user);
      } catch (err) {
        console.log("User is not logged in", err);
        setCurrentUser(null);
      }
    }
    getUser();
  }, []);
  async function handleDelete() {
    const confirmed = window.confirm(t("serviceDetails.areYouSureYouWantToDeleteThisService"));
    if (!confirmed) return;
    try {
      setDeleting(true);
      setError("");
      const token = localStorage.getItem("token");
      if (!token) {
        navigate("/sign-in");
        return;
      }
      const response = await fetch(`http://localhost:3000/services/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      const data = await response.json().catch(() => null);
      if (!response.ok) {
        throw new Error(data?.message || t("serviceDetails.deleteFailed"));
      }
      navigate("/services");
    } catch (err) {
      console.error("Delete error:", err);
      setError(err.message || t("serviceDetails.deleteFailed"));
    } finally {
      setDeleting(false);
    }
  }
  async function handleOrder() {
    try {
      setOrdering(true);
      setError("");
      const token = localStorage.getItem("token");
      if (!token) {
        navigate("/sign-in");
        return;
      }
      if (!service) {
        throw new Error("Service information is missing.");
      }
      const serviceId = service._id;
      const sellerId = typeof service.freelancer === "object" ? service.freelancer?._id : service.freelancer;
      const price = service.price;
      if (!sellerId) {
        throw new Error("Unable to find the seller for this service.");
      }
      if (price === undefined || price === null) {
        throw new Error("Unable to find the price for this service.");
      }

      // 1. Create order
      const response = await fetch("http://localhost:3000/orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          serviceId,
          sellerId,
          price
        })
      });
      const data = await response.json().catch(() => null);
      if (!response.ok) {
        throw new Error(data?.err || data?.error || data?.message || t("serviceDetails.orderFailed"));
      }

      // Depending on what your backend returns
      const orderId = data?._id || data?.order?._id;
      if (!orderId) {
        throw new Error("Order created, but order ID was not returned.");
      }

      // 2. Create Tap payment
      const paymentResponse = await fetch(`http://localhost:3000/payments/${orderId}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        }
      });
      const paymentData = await paymentResponse.json().catch(() => null);
      if (!paymentResponse.ok) {
        throw new Error(paymentData?.error?.message || paymentData?.message || t("serviceDetails.paymentFailed"));
      }

      // 3. Redirect user to Tap
      if (!paymentData?.paymentUrl) {
        throw new Error("Tap payment URL was not returned.");
      }
      window.location.href = paymentData.paymentUrl;
    } catch (err) {
      console.error("Order/payment error:", err);
      setError(err.message || t("serviceDetails.orderFailed"));
    } finally {
      setOrdering(false);
    }
  }
  if (loading) {
    return <PageLoader message={t("serviceDetails.loadingService")} />;
  }
  if (error && !service) {
    return <main className="service-page error-page">
        <div className="service-bg" />

        <div className="error-panel">
          <div className="error-icon">!</div>
          <h1>{t("serviceDetails.serviceUnavailable")}</h1>
          <p>{error}</p>
          <Link to="/services" className="button-primary error-button">{t("serviceDetails.exploreServices")}<span>→</span>
          </Link>
        </div>
      </main>;
  }
  if (!service) return null;
  const serviceFreelancerId = typeof service.freelancer === "object" ? service.freelancer?._id : service.freelancer;
  const currentUserId = currentUser?._id || currentUser?.id;
  const isOwner = currentUserId && serviceFreelancerId && String(currentUserId) === String(serviceFreelancerId);
  const freelancer = typeof service.freelancer === "object" ? service.freelancer : null;
  const freelancerName = freelancer?.username || freelancer?.name || freelancer?.fullName || "INJAZ Freelancer";
  const initials = freelancerName.split(" ").map(word => word[0]).join("").slice(0, 2).toUpperCase();
  const categoryTranslation = {
    "web development": t("serviceDetails.webDevelopment"),
    "mobile app development": t("serviceDetails.mobileAppDevelopment"),
    "software development": t("serviceDetails.softwareDevelopment"),
    "graphic design": t("serviceDetails.graphicDesign"),
    "ui/ux design": t("serviceDetails.uIUXDesign"),
    "video & animation": t("serviceDetails.videoAnimation"),
    photography: t("serviceDetails.photography"),
    "writing & translation": t("serviceDetails.writingTranslation"),
    "digital marketing": t("serviceDetails.digitalMarketing"),
    "social media management": t("serviceDetails.socialMediaManagement"),
    seo: t("serviceDetails.sEO"),
    "business & consulting": t("serviceDetails.businessConsulting"),
    "data science & ai": t("serviceDetails.dataScienceAI"),
    "music & audio": t("serviceDetails.musicAudio"),
    "accounting & finance": t("serviceDetails.accountingFinance")
  };
  const serviceCategoryText = categoryTranslation[service.category?.toLowerCase()] || service.category || t("serviceDetails.service");
  return <main className="service-page">
      <div className="service-bg" />

      <div className="container service-shell">
        {error && service && <div className="status-banner">{error}</div>}

        <nav className="service-nav">
          <div className="nav-brand">
            <span className="nav-dot" />
            <span>{t("serviceDetails.injaz")}</span>
          </div>

          <div className="nav-links">
            <Link to="/services">{t("serviceDetails.services")}</Link>
            <Link to="/services">{t("serviceDetails.explore")}</Link>
          </div>

          <Link to="/services" className="nav-back">
            <span>←</span>
            {t("serviceDetails.back")}
          </Link>
        </nav>

        {service.images?.length > 0 && <section className="hero-gallery">
            <div className="hero-gallery-main">
              <img src={service.images[0]} alt={service.title} />
            </div>
            {service.images.length > 1 && <div className="hero-gallery-thumbs">
                {service.images.slice(1, 4).map((image, index) => <img key={`${image}-${index}`} src={image} alt={`${service.title} ${index + 2}`} />)}
              </div>}
          </section>}

        <section className="hero-block">
          <div className="hero-content">
            <span className="hero-badge">{serviceCategoryText}</span>
            <h1>{service.title}</h1>
            <p>{service.description}</p>

            <div className="meta-row">
              <span className="meta-pill">★ 5.0</span>
              <span className="meta-pill">
                ⚡ {service.deliveryTime} {t("serviceDetails.days")}
              </span>
              <span className="meta-pill">
                ✓ {t("serviceDetails.professional")}
              </span>
              <span className="meta-pill">
                ● {t("serviceDetails.available")}
              </span>
            </div>
          </div>
        </section>

        <div className="content-grid">
          <div className="content-column">
            <section className="panel intro-panel">
              <div className="panel-head">
                <span className="panel-index">01</span>
                <div className="panel-line" />
                <span className="panel-label">
                  {t("serviceDetails.theService")}
                </span>
              </div>
              <p>{service.description}</p>
            </section>

            <section className="panel benefit-panel">
              <div className="section-header">
                <div>
                  <p className="eyebrow">
                    {t("serviceDetails.whatYouGet")}
                  </p>
                  <h2>
                    {t("serviceDetails.aCompleteCreativeWorkflow")}
                  </h2>
                </div>
              </div>

              <div className="benefit-grid">
                <article className="benefit-card benefit-card-lg">
                  <div className="benefit-top">
                    <span className="benefit-number">01</span>
                    <span className="benefit-icon accent">✦</span>
                  </div>
                  <h3>{t("serviceDetails.professionalQuality")}</h3>
                  <p>
                    {t("serviceDetails.highQualityWorkDesignedToMatchYour")}
                  </p>
                </article>

                <article className="benefit-card benefit-card-xl">
                  <div className="benefit-top">
                    <span className="benefit-number">02</span>
                    <span className="benefit-icon sand">⚡</span>
                  </div>
                  <h3>{t("serviceDetails.fastDelivery")}</h3>
                  <p>
                    {t("serviceDetails.timelyExecutionWithClearMilestonesAndDependable")}
                  </p>
                </article>

                <article className="benefit-card benefit-card-xl">
                  <div className="benefit-top">
                    <span className="benefit-number">03</span>
                    <span className="benefit-icon sand">💬</span>
                  </div>
                  <h3>{t("serviceDetails.clearCommunication")}</h3>
                  <p>
                    {t("serviceDetails.directCollaborationAndStreamlinedUpdatesFromKickoff")}
                  </p>
                </article>

                <article className="benefit-card benefit-card-lg">
                  <div className="benefit-top">
                    <span className="benefit-number">04</span>
                    <span className="benefit-icon accent">✓</span>
                  </div>
                  <h3>{t("serviceDetails.reliableService")}</h3>
                  <p>
                    {t("serviceDetails.consistencyPrecisionAndASmoothExperienceFrom")}
                  </p>
                </article>
              </div>
            </section>

            <section className="panel freelancer-panel">
              <div className="section-header compact">
                <div>
                  <p className="eyebrow">
                    {t("serviceDetails.freelancer")}
                  </p>
                  <h2>
                    {t("serviceDetails.trustedCreativePartner")}
                  </h2>
                </div>
                <span className="online-pill">
                  {t("serviceDetails.online")}
                </span>
              </div>

              <div className="freelancer-card">
                <div className="avatar-wrap">
                  {freelancer?.avatarUrl ? <img src={freelancer.avatarUrl} alt={freelancerName} className="avatar-image-render" /> : <div className="avatar-gradient">{initials}</div>}
                  <span className="avatar-status" />
                </div>

                <div className="freelancer-meta">
                  <div className="freelancer-identity">
                    <p>{freelancerName}</p>
                    <span className="verified-pill">{t("serviceDetails.verified")}</span>
                  </div>
                  <span>{t("serviceDetails.injazCreator")}</span>
                </div>

                <div className="freelancer-actions">
                  {serviceFreelancerId && <Link to={`/profile/${serviceFreelancerId}`} className="button-secondary profile-button">

                      {t("serviceDetails.viewSellerProfile")}
                    </Link>}
                </div>
              </div>
            </section>
          </div>

          <aside className="purchase-column">
            <div className="purchase-panel">
              <div className="purchase-header">
                <span>{t("serviceDetails.startingFrom")}</span>
                <span className="ready-tag">{t("serviceDetails.ready")}</span>
              </div>

              <div className="price-row">
                <span>{service.price}</span>
                <small>{t("serviceDetails.bhd")}</small>
              </div>

              <div className="purchase-details">
                <div className="detail-row">
                  <div className="detail-left">
                    <span className="detail-icon accent">⚡</span>
                    <span>{t("serviceDetails.delivery")}</span>
                  </div>
                  <strong>
                    {service.deliveryTime} {t("serviceDetails.days2")}
                  </strong>
                </div>

                <div className="detail-row">
                  <div className="detail-left">
                    <span className="detail-icon gold">★</span>
                    <span>{t("serviceDetails.rating")}</span>
                  </div>
                  <strong>5.0 / 5</strong>
                </div>

                <div className="detail-row">
                  <div className="detail-left">
                    <span className="detail-icon sand">✓</span>
                    <span>{t("serviceDetails.professional")}</span>
                  </div>
                  <strong>{t("serviceDetails.included")}</strong>
                </div>
              </div>

              <div className="purchase-actions">
                {isOwner ? <>
                    <Link to={`/services/${id}/edit`} className="button-primary purchase-button">

                      <span>{t("serviceDetails.editService")}</span>
                      <span className="arrow-badge">→</span>
                    </Link>

                    <button type="button" onClick={handleDelete} disabled={deleting} className="button-danger">

                      {deleting ? t("serviceDetails.deleting") : t("serviceDetails.deleteService")}
                    </button>
                  </> : currentUser ? <button type="button" onClick={handleOrder} disabled={ordering} className="button-primary purchase-button">

                    <span>
                      {ordering ? t("serviceDetails.creatingOrder") : t("serviceDetails.orderService")}
                    </span>
                    {!ordering && <span className="arrow-badge">→</span>}
                  </button> : <Link to="/sign-in" className="button-primary purchase-button">

                    <span>
                      {t("serviceDetails.signInToOrder")}
                    </span>
                    <span className="arrow-badge">→</span>
                  </Link>}
              </div>

              <div className="secure-note">
                <span>🔒</span>
                {t("serviceDetails.secureTransactionThroughINJAZ")}
              </div>
            </div>
          </aside>
        </div>

        <section className="cta-panel">
          <div className="cta-copy">
            <p>
              {t("serviceDetails.readyToMakeItHappen")}
            </p>
            <h2>
              {t("serviceDetails.letAposSBuildSomethingGreat")}
            </h2>
          </div>

          <button type="button" className="button-primary cta-button" onClick={() => {
          if (currentUser) {
            handleOrder();
          } else {
            navigate("/sign-in");
          }
        }}>

            {t("serviceDetails.startProject")}
            <span className="arrow-badge">→</span>
          </button>
        </section>
      </div>
    </main>;
}
export default ServiceDetailsPage;
