import { useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router";
import api from "../services/api";
import PageLoader from "../components/loading-ui/Loading";
import { useAuth } from "../context/AuthContext";
import { useTranslation } from "react-i18next";
function ServicesPage() {
  const {
    user
  } = useAuth();
  const {
    t
  } = useTranslation();
  const [searchParams] = useSearchParams();
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [query, setQuery] = useState("");
  const [sortBy, setSortBy] = useState("recommended");
  const category = searchParams.get("category");
  const visibleServices = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    const matches = services.filter(service => !normalized || `${service.title || ""} ${service.description || ""} ${service.category || ""} ${service.freelancer?.username || ""}`.toLowerCase().includes(normalized));
    return [...matches].sort((a, b) => {
      if (sortBy === "price-low") return Number(a.price || 0) - Number(b.price || 0);
      if (sortBy === "price-high") return Number(b.price || 0) - Number(a.price || 0);
      if (sortBy === "newest") return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
      return 0;
    });
  }, [query, services, sortBy]);
  const categoryTranslations = {
    "web development": t("services.webDevelopment"),
    "mobile app development": t("services.mobileAppDevelopment"),
    "software development": t("services.softwareDevelopment"),
    "graphic design": t("services.graphicDesign"),
    "ui/ux design": t("services.uIUXDesign"),
    "video & animation": t("services.videoAnimation"),
    photography: t("services.photography"),
    "writing & translation": t("services.writingTranslation"),
    "digital marketing": t("services.digitalMarketing"),
    "social media management": t("services.socialMediaManagement"),
    seo: t("services.sEO"),
    "business & consulting": t("services.businessConsulting"),
    "data science & ai": t("services.dataScienceAI"),
    "music & audio": t("services.musicAudio"),
    "accounting & finance": t("services.accountingFinance")
  };
  const categoryName = category ? categoryTranslations[category.toLowerCase()] || category : "";
  const heroTitle = category ? t("services.categoryTitle", {
    category: categoryName
  }) : t("services.allServices");
  const heroDescription = category ? t("services.categoryDescription", {
    category: categoryName
  }) : t("services.findTheRightFreelancerForYourProject");
  useEffect(() => {
    async function loadServices() {
      try {
        setLoading(true);
        setError("");
        const url = category ? `/services?category=${encodeURIComponent(category)}` : "/services";
        const response = await api.get(url);
        setServices(response.data.services || []);
      } catch (err) {
        console.log(err);
        setError(t("services.loadFailed"));
        setServices([]);
      } finally {
        setLoading(false);
      }
    }
    loadServices();
  }, [category, t]);
  if (loading) {
    return <PageLoader message={t("services.loadingServices")} />;
  }
  if (error) {
    return <main className="services-page">
        <section className="services-hero">
          <div className="services-hero-copy">
            <span className="section-label">
              {t("services.marketplace")}
            </span>
            <h1>{heroTitle}</h1>
            <p>{heroDescription}</p>
          </div>
        </section>
        <div className="empty-state services-empty-state">
          <h3>{error}</h3>
        </div>
      </main>;
  }
  return <main className="services-page">
      <section className="services-hero">
        <div className="services-hero-copy">
          <span className="section-label">
            {t("services.marketplace")}
          </span>
          <h1>{heroTitle}</h1>
          <p>{heroDescription}</p>
        </div>

        {user?.isSeller && <Link to="/services/create" className="btn-create-service">
            {t("common.createService")}
          </Link>}
      </section>

      <section className="marketplace-controls" aria-label={t("services.serviceDiscoveryControls")}>
        <label className="marketplace-search"><span>{t("common.search")}</span><input type="search" value={query} onChange={event => setQuery(event.target.value)} placeholder={t("common.searchPlaceholder")} /></label>
        <label><span>{t("services.sortBy")}</span><select value={sortBy} onChange={event => setSortBy(event.target.value)}><option value="recommended">{t("services.recommended")}</option><option value="newest">{t("services.newest")}</option><option value="price-low">{t("services.priceLowToHigh")}</option><option value="price-high">{t("services.priceHighToLow")}</option></select></label>
      </section>
      <div className="marketplace-results-row"><p>{t("services.resultCount", {
          count: visibleServices.length
        })}</p>{query && <button type="button" onClick={() => setQuery("")}>{t("common.clear")}</button>}</div>

      {visibleServices.length === 0 ? <section className="services-empty-state empty-state">
          <h3>{t("common.noServicesFound")}</h3>
          <p>
            {category ? t("services.noCategoryServices", {
          category: categoryName
        }) : t("services.thereAreCurrentlyNoServicesAvailable")}
          </p>
          {category && <Link to="/services">{t("common.viewAll")}</Link>}
        </section> : <section className="services-grid-wrap">
          <div className="services-list-grid">
            {visibleServices.map(service => <article key={service._id} className="service-tile">
                {service.images && service.images.length > 0 ? <img src={service.images[0]} alt={service.title} className="service-tile-image" /> : <div className="service-tile-image placeholder-image">{t("services.injaz")}</div>}

                <div className="service-tile-content">
                  <p className="service-tile-meta">
                    {service.category} {t("services.by")}{" "}
                    <Link to={`/profile/${service.freelancer?._id}`} className="service-tile-profile-link">

                      {service.freelancer?.username || t("services.unknownFreelancer")}
                    </Link>
                  </p>

                  <h2>{service.title}</h2>

                  <p className="service-tile-description">
                    {service.description}
                  </p>
                  <div className="service-card-rating" aria-label={service.reviewCount ? `${service.averageRating.toFixed(1)} out of 5 from ${service.reviewCount} reviews` : t("services.noReviewsYet", { defaultValue: "No reviews yet" })}>
                    <span aria-hidden="true">★</span>
                    {service.reviewCount
                      ? <strong>{Number(service.averageRating).toFixed(1)} <small>({service.reviewCount})</small></strong>
                      : <span>{t("services.noReviewsYet", { defaultValue: "No reviews yet" })}</span>}
                  </div>
                </div>

                <div className="card-footer">
                  <div className="service-tile-price-row">
                    <span>{t("common.startingAt")}</span>
                    <strong>{service.price}{t("services.bhd")}</strong>
                  </div>

                  <p className="service-tile-delivery">
                    {t("services.delivery")}:{" "}
                    {service.deliveryTime}{" "}
                    {t("common.days", {
                count: service.deliveryTime
              })}
                  </p>

                  <Link to={`/services/${service._id}`} className="service-tile-link">

                    {t("common.viewService")}
                  </Link>
                </div>
              </article>)}
          </div>
        </section>}
    </main>;
}
export default ServicesPage;
