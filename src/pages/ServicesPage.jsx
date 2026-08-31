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

  const categoryTranslations = {
    "web development": language === "ar" ? "تطوير الويب" : "Web Development",
    "mobile app development":
      language === "ar" ? "تطوير التطبيقات" : "Mobile App Development",
    "software development":
      language === "ar" ? "تطوير البرمجيات" : "Software Development",
    "graphic design":
      language === "ar" ? "التصميم الجرافيكي" : "Graphic Design",
    "ui/ux design":
      language === "ar" ? "تصميم واجهات المستخدم" : "UI/UX Design",
    "video & animation":
      language === "ar" ? "الفيديو والرسوم المتحركة" : "Video & Animation",
    photography: language === "ar" ? "التصوير" : "Photography",
    "writing & translation":
      language === "ar" ? "الكتابة والترجمة" : "Writing & Translation",
    "digital marketing":
      language === "ar" ? "التسويق الرقمي" : "Digital Marketing",
    "social media management":
      language === "ar" ? "إدارة وسائل التواصل" : "Social Media Management",
    seo: language === "ar" ? "تحسين محركات البحث" : "SEO",
    "business & consulting":
      language === "ar" ? "الأعمال والاستشارات" : "Business & Consulting",
    "data science & ai":
      language === "ar"
        ? "علوم البيانات والذكاء الاصطناعي"
        : "Data Science & AI",
    "music & audio": language === "ar" ? "الموسيقى والصوت" : "Music & Audio",
    "accounting & finance":
      language === "ar" ? "المحاسبة والمالية" : "Accounting & Finance",
  };

  const translateServiceText = (value) => {
    if (language !== "ar" || !value) return value;

    const replacements = {
      web: "ويب",
      website: "موقع",
      app: "تطبيق",
      mobile: "موبايل",
      development: "تطوير",
      design: "تصميم",
      marketing: "تسويق",
      video: "فيديو",
      animation: "رسوم متحركة",
      photography: "تصوير",
      business: "أعمال",
      consulting: "استشارات",
      seo: "تحسين محركات البحث",
      writing: "كتابة",
      translation: "ترجمة",
      social: "اجتماعي",
      media: "وسائط",
      finance: "مالية",
      accounting: "محاسبة",
      music: "موسيقى",
      audio: "صوت",
      data: "بيانات",
      science: "علوم",
      ai: "ذكاء اصطناعي",
      service: "خدمة",
      freelancer: "مستقل",
      seller: "بائع",
      project: "مشروع",
      order: "طلب",
      delivery: "تسليم",
      days: "أيام",
      from: "من",
      ready: "جاهز",
      secure: "آمن",
      professional: "مهني",
      quality: "جودة",
      communication: "تواصل",
      using: "استخدام",
    };

    let translated = String(value);
    Object.entries(replacements).forEach(([key, valueAr]) => {
      const regex = new RegExp(key, "gi");
      translated = translated.replace(regex, valueAr);
    });

    return translated;
  };

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
            <span className="section-label">
              {language === "ar" ? "السوق" : "Marketplace"}
            </span>
            <h1>
              {category
                ? language === "ar"
                  ? `${categoryTranslations[category.toLowerCase()] || category} خدمات`
                  : `${category} Services`
                : language === "ar"
                  ? "جميع الخدمات"
                  : "All Services"}
            </h1>
            <p>
              {category
                ? language === "ar"
                  ? `اعثر على أفضل خدمات ${categoryTranslations[category.toLowerCase()] || category} لمشروعك.`
                  : `Find the best ${category} services for your project.`
                : language === "ar"
                  ? "اعثر على المستقل المناسب لمشروعك."
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
            <span className="section-label">
              {language === "ar" ? "السوق" : "Marketplace"}
            </span>
            <h1>
              {category
                ? language === "ar"
                  ? `${categoryTranslations[category.toLowerCase()] || category} خدمات`
                  : `${category} Services`
                : language === "ar"
                  ? "جميع الخدمات"
                  : "All Services"}
            </h1>
            <p>
              {category
                ? language === "ar"
                  ? `اعثر على أفضل خدمات ${categoryTranslations[category.toLowerCase()] || category} لمشروعك.`
                  : `Find the best ${category} services for your project.`
                : language === "ar"
                  ? "اعثر على المستقل المناسب لمشروعك."
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
          <span className="section-label">
            {language === "ar" ? "السوق" : "Marketplace"}
          </span>
          <h1>
            {category
              ? language === "ar"
                ? `${categoryTranslations[category.toLowerCase()] || category} خدمات`
                : `${category} Services`
              : language === "ar"
                ? "جميع الخدمات"
                : "All Services"}
          </h1>
          <p>
            {category
              ? language === "ar"
                ? `اعثر على أفضل خدمات ${categoryTranslations[category.toLowerCase()] || category} لمشروعك.`
                : `Find the best ${category} services for your project.`
              : language === "ar"
                ? "اعثر على المستقل المناسب لمشروعك."
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
                    {categoryTranslations[service.category?.toLowerCase()] ||
                      translateServiceText(service.category) ||
                      service.category ||
                      (language === "ar" ? "خدمة" : "Service")}{" "}
                    {language === "ar" ? "بواسطة" : "By:"}{" "}
                    <Link
                      to={`/profile/${service.freelancer?._id}`}
                      className="service-tile-profile-link"
                    >
                      {service.freelancer?.username ||
                        (language === "ar"
                          ? "مستقل غير معروف"
                          : "Unknown Freelancer")}
                    </Link>
                  </p>

                  <h2>
                    {translateServiceText(service.title) || service.title}
                  </h2>
                  <p className="service-tile-description">
                    {translateServiceText(service.description) ||
                      service.description}
                  </p>

                  <div className="service-tile-price-row">
                    <span>{t("startingAt")}</span>
                    <strong>{service.price} BHD</strong>
                  </div>

                  <p className="service-tile-delivery">
                    {language === "ar" ? "التسليم" : "Delivery"}:{" "}
                    {service.deliveryTime}{" "}
                    {language === "ar" ? "أيام" : t("days")}
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
