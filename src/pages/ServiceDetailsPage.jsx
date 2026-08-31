import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router";
import { getCurrentUser } from "../services/authService";
import { useSettings } from "../context/SettingsContext";

function ServiceDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { language } = useSettings();
  const isArabic = language === "ar";
  const [service, setService] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);
  const [ordering, setOrdering] = useState(false);

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "auto" });
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
        setError("Failed to load service");
      } finally {
        setLoading(false);
      }
    }

    if (id) {
      getService();
    }
  }, [id]);

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
    const confirmed = window.confirm(
      "Are you sure you want to delete this service?",
    );
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
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await response.json().catch(() => null);
      if (!response.ok) {
        throw new Error(data?.message || "Failed to delete service");
      }
      navigate("/services");
    } catch (err) {
      console.error("Delete error:", err);
      setError(err.message || "Failed to delete service");
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
      const sellerId =
        typeof service.freelancer === "object"
          ? service.freelancer?._id
          : service.freelancer;
      const price = service.price;

      if (!sellerId) {
        throw new Error("Unable to find the seller for this service.");
      }
      if (price === undefined || price === null) {
        throw new Error("Unable to find the price for this service.");
      }

      const response = await fetch("http://localhost:3000/orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          serviceId,
          sellerId,
          price,
        }),
      });

      const data = await response.json().catch(() => null);
      if (!response.ok) {
        throw new Error(
          data?.err || data?.error || data?.message || "Failed to create order",
        );
      }

      navigate(`/workspace/${id}`);
    } catch (err) {
      console.error("Order creation error:", err);
      setError(err.message || "Failed to create order");
    } finally {
      setOrdering(false);
    }
  }

  if (loading) {
    return (
      <main className="service-page loading-page">
        <div className="service-bg" />

        <div className="container loading-shell">
          <div className="loading-nav">
            <div className="pulse-dot" />
            <div className="loading-line short" />
            <div className="loading-line tiny" />
          </div>

          <div className="loading-hero">
            <div className="loading-badge" />
            <div className="loading-title" />
            <div className="loading-line" />
            <div className="loading-line medium" />
          </div>

          <div className="loading-pills">
            <div className="loading-pill" />
            <div className="loading-pill" />
            <div className="loading-pill" />
          </div>

          <div className="loading-grid">
            <div className="loading-card large" />
            <div className="loading-card" />
          </div>
        </div>
      </main>
    );
  }

  if (error && !service) {
    return (
      <main className="service-page error-page">
        <div className="service-bg" />

        <div className="error-panel">
          <div className="error-icon">!</div>
          <h1>Service unavailable</h1>
          <p>{error}</p>
          <Link to="/services" className="button-primary error-button">
            Explore Services
            <span>→</span>
          </Link>
        </div>
      </main>
    );
  }

  if (!service) return null;

  const serviceFreelancerId =
    typeof service.freelancer === "object"
      ? service.freelancer?._id
      : service.freelancer;
  const currentUserId = currentUser?._id || currentUser?.id;
  const isOwner =
    currentUserId &&
    serviceFreelancerId &&
    String(currentUserId) === String(serviceFreelancerId);

  const freelancer =
    typeof service.freelancer === "object" ? service.freelancer : null;
  const freelancerName =
    freelancer?.username ||
    freelancer?.name ||
    freelancer?.fullName ||
    "INJAZ Freelancer";
  const initials = freelancerName
    .split(" ")
    .map((word) => word[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const categoryTranslation = {
    "web development": isArabic ? "تطوير الويب" : "Web Development",
    "mobile app development": isArabic
      ? "تطوير التطبيقات"
      : "Mobile App Development",
    "software development": isArabic
      ? "تطوير البرمجيات"
      : "Software Development",
    "graphic design": isArabic ? "التصميم الجرافيكي" : "Graphic Design",
    "ui/ux design": isArabic ? "تصميم واجهات المستخدم" : "UI/UX Design",
    "video & animation": isArabic
      ? "الفيديو والرسوم المتحركة"
      : "Video & Animation",
    photography: isArabic ? "التصوير" : "Photography",
    "writing & translation": isArabic
      ? "الكتابة والترجمة"
      : "Writing & Translation",
    "digital marketing": isArabic ? "التسويق الرقمي" : "Digital Marketing",
    "social media management": isArabic
      ? "إدارة وسائل التواصل"
      : "Social Media Management",
    seo: isArabic ? "تحسين محركات البحث" : "SEO",
    "business & consulting": isArabic
      ? "الأعمال والاستشارات"
      : "Business & Consulting",
    "data science & ai": isArabic
      ? "علوم البيانات والذكاء الاصطناعي"
      : "Data Science & AI",
    "music & audio": isArabic ? "الموسيقى والصوت" : "Music & Audio",
    "accounting & finance": isArabic
      ? "المحاسبة والمالية"
      : "Accounting & Finance",
  };

  const serviceCategoryText =
    categoryTranslation[service.category?.toLowerCase()] ||
    service.category ||
    (isArabic ? "الخدمة" : "Service");

  return (
    <main className="service-page">
      <div className="service-bg" />

      <div className="container service-shell">
        {error && service && <div className="status-banner">{error}</div>}

        <nav className="service-nav">
          <div className="nav-brand">
            <span className="nav-dot" />
            <span>INJAZ</span>
          </div>

          <div className="nav-links">
            <Link to="/services">{isArabic ? "الخدمات" : "Services"}</Link>
            <Link to="/services">{isArabic ? "استكشف" : "Explore"}</Link>
          </div>

          <Link to="/services" className="nav-back">
            <span>←</span>
            {isArabic ? "رجوع" : "Back"}
          </Link>
        </nav>

        {service.images?.length > 0 && (
          <section className="hero-gallery">
            <div className="hero-gallery-main">
              <img src={service.images[0]} alt={service.title} />
            </div>
            {service.images.length > 1 && (
              <div className="hero-gallery-thumbs">
                {service.images.slice(1, 4).map((image, index) => (
                  <img
                    key={`${image}-${index}`}
                    src={image}
                    alt={`${service.title} ${index + 2}`}
                  />
                ))}
              </div>
            )}
          </section>
        )}

        <section className="hero-block">
          <div className="hero-content">
            <span className="hero-badge">{serviceCategoryText}</span>
            <h1>{service.title}</h1>
            <p>{service.description}</p>

            <div className="meta-row">
              <span className="meta-pill">★ 5.0</span>
              <span className="meta-pill">
                ⚡ {service.deliveryTime} {isArabic ? "أيام" : "Days"}
              </span>
              <span className="meta-pill">
                ✓ {isArabic ? "مهني" : "Professional"}
              </span>
              <span className="meta-pill">
                ● {isArabic ? "متاح" : "Available"}
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
                  {isArabic ? "الخدمة" : "The Service"}
                </span>
              </div>
              <p>{service.description}</p>
            </section>

            <section className="panel benefit-panel">
              <div className="section-header">
                <div>
                  <p className="eyebrow">
                    {isArabic ? "ماذا ستحصل عليه" : "What you get"}
                  </p>
                  <h2>
                    {isArabic
                      ? "مسار إبداعي كامل."
                      : "A complete creative workflow."}
                  </h2>
                </div>
              </div>

              <div className="benefit-grid">
                <article className="benefit-card benefit-card-lg">
                  <div className="benefit-top">
                    <span className="benefit-number">01</span>
                    <span className="benefit-icon violet">✦</span>
                  </div>
                  <h3>{isArabic ? "جودة احترافية" : "Professional quality"}</h3>
                  <p>
                    {isArabic
                      ? "عمل عالي الجودة مصمم ليلائم أهدافك بدقة."
                      : "High-quality work designed to match your exact goals."}
                  </p>
                </article>

                <article className="benefit-card benefit-card-xl">
                  <div className="benefit-top">
                    <span className="benefit-number">02</span>
                    <span className="benefit-icon cyan">⚡</span>
                  </div>
                  <h3>{isArabic ? "تسليم سريع" : "Fast delivery"}</h3>
                  <p>
                    {isArabic
                      ? "تنفيذ في الوقت المناسب مع مراحل واضحة وجدول زمني موثوق."
                      : "Timely execution with clear milestones and dependable scheduling."}
                  </p>
                </article>

                <article className="benefit-card benefit-card-xl">
                  <div className="benefit-top">
                    <span className="benefit-number">03</span>
                    <span className="benefit-icon cyan">💬</span>
                  </div>
                  <h3>{isArabic ? "تواصل واضح" : "Clear communication"}</h3>
                  <p>
                    {isArabic
                      ? "تعاون مباشر وتحديثات منظمة من البداية إلى الإطلاق."
                      : "Direct collaboration and streamlined updates from kickoff to launch."}
                  </p>
                </article>

                <article className="benefit-card benefit-card-lg">
                  <div className="benefit-top">
                    <span className="benefit-number">04</span>
                    <span className="benefit-icon violet">✓</span>
                  </div>
                  <h3>{isArabic ? "خدمة موثوقة" : "Reliable service"}</h3>
                  <p>
                    {isArabic
                      ? "التسلسل والدقة وتجربة سلسة من البداية إلى النهاية."
                      : "Consistency, precision, and a smooth experience from start to finish."}
                  </p>
                </article>
              </div>
            </section>

            <section className="panel freelancer-panel">
              <div className="section-header compact">
                <div>
                  <p className="eyebrow">
                    {isArabic ? "المستقل" : "Freelancer"}
                  </p>
                  <h2>
                    {isArabic
                      ? "شريك إبداعي موثوق"
                      : "Trusted creative partner"}
                  </h2>
                </div>
                <span className="online-pill">
                  {isArabic ? "متصل" : "Online"}
                </span>
              </div>

              <div className="freelancer-card">
                <div className="avatar-wrap">
                  {freelancer?.avatarUrl ? (
                    <img
                      src={freelancer.avatarUrl}
                      alt={freelancerName}
                      className="avatar-image-render"
                    />
                  ) : (
                    <div className="avatar-gradient">{initials}</div>
                  )}
                  <span className="avatar-status" />
                </div>

                <div className="freelancer-meta">
                  <p>{freelancerName}</p>
                  <span>INJAZ Creator</span>
                </div>

                <div className="freelancer-actions">
                  <span className="verified-pill">Verified</span>
                  {serviceFreelancerId && (
                    <Link
                      to={`/profile/${serviceFreelancerId}`}
                      className="button-secondary profile-button"
                    >
                      {isArabic ? "عرض ملف البائع" : "View Seller Profile"}
                    </Link>
                  )}
                </div>
              </div>
            </section>
          </div>

          <aside className="purchase-column">
            <div className="purchase-panel">
              <div className="purchase-header">
                <span>{isArabic ? "يبدأ من" : "Starting From"}</span>
                <span className="ready-tag">{isArabic ? "جاهز" : "Ready"}</span>
              </div>

              <div className="price-row">
                <span>{service.price}</span>
                <small>BHD</small>
              </div>

              <div className="purchase-details">
                <div className="detail-row">
                  <div className="detail-left">
                    <span className="detail-icon violet">⚡</span>
                    <span>{isArabic ? "التسليم" : "Delivery"}</span>
                  </div>
                  <strong>
                    {service.deliveryTime} {isArabic ? "أيام" : "days"}
                  </strong>
                </div>

                <div className="detail-row">
                  <div className="detail-left">
                    <span className="detail-icon gold">★</span>
                    <span>{isArabic ? "التقييم" : "Rating"}</span>
                  </div>
                  <strong>5.0 / 5</strong>
                </div>

                <div className="detail-row">
                  <div className="detail-left">
                    <span className="detail-icon cyan">✓</span>
                    <span>{isArabic ? "مهني" : "Professional"}</span>
                  </div>
                  <strong>{isArabic ? "مضمن" : "Included"}</strong>
                </div>
              </div>

              <div className="purchase-actions">
                {isOwner ? (
                  <>
                    <Link
                      to={`/services/${id}/edit`}
                      className="button-primary purchase-button"
                    >
                      <span>{isArabic ? "تعديل الخدمة" : "Edit Service"}</span>
                      <span className="arrow-badge">→</span>
                    </Link>

                    <button
                      type="button"
                      onClick={handleDelete}
                      disabled={deleting}
                      className="button-danger"
                    >
                      {deleting
                        ? isArabic
                          ? "جارٍ الحذف..."
                          : "Deleting..."
                        : isArabic
                          ? "حذف الخدمة"
                          : "Delete Service"}
                    </button>
                  </>
                ) : currentUser ? (
                  <button
                    type="button"
                    onClick={handleOrder}
                    disabled={ordering}
                    className="button-primary purchase-button"
                  >
                    <span>
                      {ordering
                        ? isArabic
                          ? "جارٍ إنشاء الطلب..."
                          : "Creating Order..."
                        : isArabic
                          ? "طلب الخدمة"
                          : "Order Service"}
                    </span>
                    {!ordering && <span className="arrow-badge">→</span>}
                  </button>
                ) : (
                  <Link
                    to="/sign-in"
                    className="button-primary purchase-button"
                  >
                    <span>
                      {isArabic ? "تسجيل الدخول للطلب" : "Sign In to Order"}
                    </span>
                    <span className="arrow-badge">→</span>
                  </Link>
                )}
              </div>

              <div className="secure-note">
                <span>🔒</span>
                {isArabic
                  ? "معاملة آمنة عبر INJAZ"
                  : "Secure transaction through INJAZ"}
              </div>
            </div>
          </aside>
        </div>

        <section className="cta-panel">
          <div className="cta-copy">
            <p>
              {isArabic ? "هل أنت مستعد للبدء؟" : "Ready to make it happen?"}
            </p>
            <h2>
              {isArabic
                ? "لنصنع شيئاً رائعاً."
                : "Let&apos;s build something great."}
            </h2>
          </div>

          <button
            type="button"
            className="button-primary cta-button"
            onClick={() => {
              if (currentUser) {
                handleOrder();
              } else {
                navigate("/sign-in");
              }
            }}
          >
            {isArabic ? "ابدأ المشروع" : "Start Project"}
            <span className="arrow-badge">→</span>
          </button>
        </section>
      </div>
    </main>
  );
}

export default ServiceDetailsPage;
