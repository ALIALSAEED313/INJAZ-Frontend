import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";
import { useSettings } from "../context/SettingsContext";

function ServicesPage() {
  const { user } = useAuth();
  const { t, language } = useSettings();
  const [searchParams] = useSearchParams();
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const category = searchParams.get("category");

  useEffect(() => {
    async function loadServices() {
      try {
        setLoading(true);
        setError("");
        const url = category
          ? `/services?category=${encodeURIComponent(category)}`
          : "/services";
        const response = await api.get(url);
        setServices(response.data.services || []);
      } catch (err) {
        console.log(err);
        setError("Failed to load services");
        setServices([]);
      } finally {
        setLoading(false);
      }
    }

    loadServices();
  }, [category]);

  if (loading) {
    return (
      <main className="services-page">
        <section className="services-hero">
          <div className="services-hero-copy">
            <span className="section-label">Marketplace</span>
            <h1>{category ? `${category} Services` : "All Services"}</h1>
            <p>
              {category
                ? `Find the best ${category} services for your project.`
                : "Find the right freelancer for your project."}
            </p>
          </div>
        </section>
        <div className="empty-state services-empty-state">
          <span>⏳</span>
          <h3>{t("searching")}</h3>
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="services-page">
        <section className="services-hero">
          <div className="services-hero-copy">
            <span className="section-label">Marketplace</span>
            <h1>{category ? `${category} Services` : "All Services"}</h1>
            <p>
              {category
                ? `Find the best ${category} services for your project.`
                : "Find the right freelancer for your project."}
            </p>
          </div>
        </section>
        <div className="empty-state services-empty-state">
          <span>⚠️</span>
          <h3>{error}</h3>
        </div>
      </main>
    );
  }

  return (
    <main className="services-page">
      <section className="services-hero">
        <div className="services-hero-copy">
          <span className="section-label">Marketplace</span>
          <h1>{category ? `${category} Services` : "All Services"}</h1>
          <p>
            {category
              ? `Find the best ${category} services for your project.`
              : "Find the right freelancer for your project."}
          </p>
        </div>

        {user?.isSeller && (
          <Link to="/services/create" className="btn-create-service">
            {t("createService")}
          </Link>
        )}
      </section>

      {services.length === 0 ? (
        <section className="services-empty-state empty-state">
          <span>🔎</span>
          <h3>{t("noServicesFound")}</h3>
          <p>
            {category
              ? language === "ar"
                ? `لا توجد خدمات ${category} متاحة حاليًا.`
                : `There are currently no ${category} services available.`
              : language === "ar"
                ? "لا توجد خدمات متاحة حاليًا."
                : "There are currently no services available."}
          </p>
          {category && <Link to="/services">{t("viewAll")}</Link>}
        </section>
      ) : (
        <section className="services-grid-wrap">
          <div className="services-list-grid">
            {services.map((service) => (
              <article key={service._id} className="service-tile">
                {service.images && service.images.length > 0 ? (
                  <img
                    src={service.images[0]}
                    alt={service.title}
                    className="service-tile-image"
                  />
                ) : (
                  <div className="service-tile-image placeholder-image">💼</div>
                )}

                <div className="service-tile-content">
                  <p className="service-tile-meta">
                    {service.category} {language === "ar" ? "بواسطة:" : "By:"}{" "}
                    <Link
                      to={`/profile/${service.freelancer?._id}`}
                      className="service-tile-profile-link"
                    >
                      {service.freelancer?.username || "Unknown Freelancer"}
                    </Link>
                  </p>
                  
                  <h2>{service.title}</h2>
                  
                  <p className="service-tile-description">{service.description}</p>
                </div>

                {/* قسم السعر ومدة التسليم */}
                <div className="card-footer">
                  <div className="service-tile-price-row">
                    <span>{t("startingAt")}</span>
                    <strong>{service.price} BHD</strong>
                  </div>

                  <p className="service-tile-delivery">
                    {language === "ar" ? "التسليم" : "Delivery"}:{" "}
                    {service.deliveryTime} {t("days")}
                  </p>

                  <Link
                    to={`/services/${service._id}`}
                    className="service-tile-link"
                  >
                    {t("viewService")}
                  </Link>
                </div>
              </article>
            ))}
          </div>
        </section>
      )}
    </main>
  );
}

export default ServicesPage;