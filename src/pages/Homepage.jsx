import { useEffect, useState } from "react";
import { Link } from "react-router";
import { searchServices } from "../services/serviceService";
import api from "../services/api";
import { useSettings } from "../context/SettingsContext";

function Homepage() {
  const { t, language } = useSettings();
  const [search, setSearch] = useState("");
  const [services, setServices] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [favorites, setFavorites] = useState([]);
  const [popularSearches, setPopularSearches] = useState([]);
  const categories = [
    {
      name: language === "ar" ? "تطوير الويب" : "Web Development",
      value: "web development",
      icon: "💻",
      description:
        language === "ar"
          ? "مواقع، تطبيقات وبرامج"
          : "Websites, apps & software",
    },
    {
      name: language === "ar" ? "تطوير التطبيقات" : "Mobile App Development",
      value: "mobile app development",
      icon: "📱",
      description:
        language === "ar" ? "تطبيقات الهاتف" : "Mobile apps and interfaces",
    },
    {
      name: language === "ar" ? "تطوير البرمجيات" : "Software Development",
      value: "software development",
      icon: "🧩",
      description:
        language === "ar" ? "حلول وعمليات برمجية" : "Custom software solutions",
    },
    {
      name: language === "ar" ? "التصميم الجرافيكي" : "Graphic Design",
      value: "graphic design",
      icon: "🎨",
      description:
        language === "ar"
          ? "شعارات وهويات بصرية"
          : "Logos, branding & graphics",
    },
    {
      name: language === "ar" ? "تصميم واجهات المستخدم" : "UI/UX Design",
      value: "ui/ux design",
      icon: "🖌️",
      description:
        language === "ar"
          ? "تجربة مستخدم وتصميم"
          : "User experience and interface design",
    },
    {
      name:
        language === "ar" ? "الفيديو والرسوم المتحركة" : "Video & Animation",
      value: "video & animation",
      icon: "🎬",
      description:
        language === "ar"
          ? "مونتاج ومحتوى مرئي"
          : "Videos, editing & animation",
    },
    {
      name: language === "ar" ? "التصوير" : "Photography",
      value: "photography",
      icon: "📷",
      description:
        language === "ar" ? "تصوير وتحرير الصور" : "Photography & editing",
    },
    {
      name: language === "ar" ? "الكتابة والترجمة" : "Writing & Translation",
      value: "writing & translation",
      icon: "✍️",
      description:
        language === "ar" ? "مقالات وترجمة" : "Articles & copywriting",
    },
    {
      name: language === "ar" ? "التسويق الرقمي" : "Digital Marketing",
      value: "digital marketing",
      icon: "📈",
      description:
        language === "ar" ? "إعلانات وتسويق" : "SEO, ads & social media",
    },
    {
      name:
        language === "ar"
          ? "إدارة الشبكات الاجتماعية"
          : "Social Media Management",
      value: "social media management",
      icon: "📱",
      description:
        language === "ar" ? "تنمية المحتوى" : "Content and community growth",
    },
    {
      name: language === "ar" ? "تحسين محركات البحث" : "SEO",
      value: "seo",
      icon: "🔎",
      description:
        language === "ar" ? "تحسين الظهور" : "Search visibility and rankings",
    },
    {
      name: language === "ar" ? "الأعمال والاستشارات" : "Business & Consulting",
      value: "business & consulting",
      icon: "💼",
      description:
        language === "ar" ? "استشارات وتخطيط" : "Consulting & business growth",
    },
    {
      name:
        language === "ar"
          ? "علوم البيانات والذكاء الاصطناعي"
          : "Data Science & AI",
      value: "data science & ai",
      icon: "🤖",
      description: language === "ar" ? "حلول ذكية" : "AI automation & insights",
    },
    {
      name: language === "ar" ? "الموسيقى والصوت" : "Music & Audio",
      value: "music & audio",
      icon: "🎵",
      description:
        language === "ar" ? "محتوى صوتي" : "Audio production and sound design",
    },
    {
      name: language === "ar" ? "المحاسبة والمالية" : "Accounting & Finance",
      value: "accounting & finance",
      icon: "💰",
      description:
        language === "ar" ? "تحليل وتمويل" : "Accounting and financial support",
    },
  ];
  const steps = [
    {
      number: "01",
      title: language === "ar" ? "ابحث عن خدمة" : "Find a Service",
      description:
        language === "ar"
          ? "ابحث عن ما تحتاجه بالضبط من خلال السوق الخاص بنا."
          : "Search for exactly what you need from our marketplace.",
    },
    {
      number: "02",
      title: language === "ar" ? "اختر مستفيدا" : "Choose a Freelancer",
      description:
        language === "ar"
          ? "قارن الخدمات والأسعار وتقييمات المستقلين."
          : "Compare services, prices and freelancer ratings.",
    },
    {
      number: "03",
      title: language === "ar" ? "ضع طلبك" : "Place Your Order",
      description:
        language === "ar"
          ? "اختر الخدمة وتواصل مباشرة مع المستقل."
          : "Choose your service and communicate with the freelancer.",
    },
    {
      number: "04",
      title: language === "ar" ? "استلم عملك" : "Get Your Work",
      description:
        language === "ar"
          ? "استلم العمل المكتمل وترك تقييمك."
          : "Receive your completed work and leave a review.",
    },
  ];
  useEffect(() => {
    async function loadPopularSearches() {
      try {
        const response = await api.get("/services/popular-searches");
        setPopularSearches(response.data || []);
      } catch (error) {
        console.error("Failed to load popular searches:", error);
        setPopularSearches([]);
      }
    }
    loadPopularSearches();
  }, []);
  async function performSearch(searchTerm) {
    const term = searchTerm.trim();
    if (!term) {
      setError(
        language === "ar"
          ? "يرجى إدخال شيء للبحث عنه."
          : "Please enter something to search for.",
      );
      return;
    }
    try {
      setLoading(true);
      setError("");
      setSearched(true);
      const data = await searchServices(term);
      setServices(data?.services || []);
    } catch (err) {
      console.error(err);
      setError(
        language === "ar"
          ? "فشل البحث عن الخدمات. يرجى المحاولة مرة أخرى."
          : "Failed to search services. Please try again.",
      );
      setServices([]);
    } finally {
      setLoading(false);
    }
  }
  function handleSearch(event) {
    event.preventDefault();
    performSearch(search);
  }
  function handlePopularSearch(item) {
    setSearch(item);
    performSearch(item);
  }
  function toggleFavorite(id) {
    setFavorites((current) =>
      current.includes(id)
        ? current.filter((item) => item !== id)
        : [...current, id],
    );
  }
  function clearSearch() {
    setSearched(false);
    setServices([]);
    setSearch("");
    setError("");
  }
  return (
    <main>
      <section className="hero">
        <div className="hero-content">
          <span className="hero-badge">
            🇧🇭{" "}
            {language === "ar"
              ? "سوق البحرين للمستقلين"
              : "Bahrain's Freelance Marketplace"}
          </span>
          <h1>
            {language === "ar" ? "اعثر على" : "Find the perfect"}
            <span>
              {language === "ar"
                ? " مستقل مناسب لمشروعك."
                : " freelancer for your project."}
            </span>
          </h1>
          <p>
            {language === "ar"
              ? "من المواقع والتصميم إلى التسويق والكتابة، اعثر على مستقلين مهرة جاهزين لمساعدتك."
              : "From websites and graphic design to marketing and writing, find skilled freelancers ready to help."}
          </p>
          <form className="search-box" onSubmit={handleSearch}>
            <input
              type="text"
              placeholder={t("searchPlaceholder")}
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              dir={language === "ar" ? "rtl" : "ltr"}
            />
            <button type="submit" disabled={loading}>
              {loading ? t("searching") : `🔎 ${t("search")}`}
            </button>
          </form>
          {error && <p className="error">{error}</p>}
          {popularSearches.length > 0 && (
            <div className="popular-searches">
              <span>{t("popular")}</span>
              {popularSearches.map((item) => (
                <button
                  key={item.term}
                  type="button"
                  onClick={() => handlePopularSearch(item.term)}
                >
                  {item.term}
                </button>
              ))}
            </div>
          )}
        </div>
      </section>
      {searched && (
        <section className="search-results">
          <div className="section-header">
            <div>
              <span className="section-label">
                {language === "ar" ? "نتائج البحث" : "SEARCH RESULTS"}
              </span>
              <h2>
                {language === "ar"
                  ? `خدمات لـ "${search}"`
                  : `Services for "${search}"`}
              </h2>
            </div>
            <button type="button" onClick={clearSearch}>
              {t("clear")}
            </button>
          </div>
          {loading ? (
            <div className="loading">{t("searching")}</div>
          ) : services.length === 0 ? (
            <div className="empty-state">
              <span>🔎</span>
              <h3>{t("noServicesFound")}</h3>
              <p>{t("tryAnotherSearch")}</p>
              <Link to="/services">{t("browseServices")}</Link>
            </div>
          ) : (
            <div className="services-grid">
              {services.map((service) => (
                <Link
                  key={service._id}
                  to={`/services/${service._id}`}
                  className="service-card"
                >
                  <div className="service-image">
                    {service.images?.length > 0 ? (
                      <img src={service.images[0]} alt={service.title} />
                    ) : (
                      <span>💼</span>
                    )}
                    <button
                      type="button"
                      className="favorite-button"
                      onClick={(event) => {
                        event.preventDefault();
                        event.stopPropagation();
                        toggleFavorite(service._id);
                      }}
                    >
                      {favorites.includes(service._id) ? "❤️" : "♡"}
                    </button>
                  </div>
                  <div className="service-content">
                    <span className="service-category">{service.category}</span>
                    <h3>{service.title}</h3>
                    <p>{service.description}</p>
                    <div className="service-rating">
                      ⭐{" "}
                      {service.rating || (language === "ar" ? "جديد" : "New")}
                    </div>
                    <div className="service-footer">
                      <span>{t("startingAt")}</span>
                      <strong>{service.price} BHD</strong>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </section>
      )}
      <section className="categories">
        <div className="section-header">
          <div>
            <span className="section-label">
              {language === "ar" ? "استكشف" : "EXPLORE"}
            </span>
            <h2>{t("popularCategories")}</h2>
            <p>
              {language === "ar"
                ? "اعثر على المستقل المناسب لأي نوع من المشاريع."
                : "Find the right freelancer for any type of project."}
            </p>
          </div>
          <Link to="/services">{t("viewAll")} →</Link>
        </div>
        <div className="categories-grid">
          {categories.map((category) => (
            <Link
              key={category.value}
              to={`/services?category=${encodeURIComponent(category.value)}`}
              className="category-card"
            >
              <span className="category-icon">{category.icon}</span>
              <h3>{category.name}</h3>
              <p>{category.description}</p>
              <span className="category-arrow">→</span>
            </Link>
          ))}
        </div>
      </section>
      <section className="how-it-works">
        <div className="section-header centered">
          <span className="section-label">
            {language === "ar" ? "عملية بسيطة" : "SIMPLE PROCESS"}
          </span>
          <h2>{language === "ar" ? "كيف يعمل INJAZ" : "How INJAZ works"}</h2>
          <p>
            {language === "ar"
              ? "إنجاز العمل المهني أصبح سهلاً."
              : "Getting professional work done is simple."}
          </p>
        </div>
        <div className="steps">
          {steps.map((step) => (
            <div className="step" key={step.number}>
              <span className="step-number">{step.number}</span>
              <h3>{step.title}</h3>
              <p>{step.description}</p>
            </div>
          ))}
        </div>
      </section>
      <section className="trust">
        <div className="trust-content">
          <span className="section-label">
            {language === "ar" ? "لماذا INJAZ" : "WHY INJAZ"}
          </span>
          <h2>
            {language === "ar"
              ? "كل ما تحتاجه في مكان واحد"
              : "Everything you need in one place"}
          </h2>
          <p>
            {language === "ar"
              ? "اكتشف المستقلين وقارن الخدمات وتواصل مع البائعين واستلمه مشروعك."
              : "Discover freelancers, compare services, communicate with sellers and get your project completed."}
          </p>
          <div className="trust-features">
            <div>
              <span>🔍</span>
              <div>
                <h3>
                  {language === "ar"
                    ? "ابحث عن الخدمة المناسبة"
                    : "Find the Right Service"}
                </h3>
                <p>
                  {language === "ar"
                    ? "ابحث وتصفح الخدمات بناءً على احتياجك."
                    : "Search and browse services based on your needs."}
                </p>
              </div>
            </div>
            <div>
              <span>⭐</span>
              <div>
                <h3>
                  {language === "ar"
                    ? "قارن بين المستقلين"
                    : "Compare Freelancers"}
                </h3>
                <p>
                  {language === "ar"
                    ? "قارن الأسعار والتقييمات وتفاصيل الخدمة."
                    : "Compare prices, ratings and service details."}
                </p>
              </div>
            </div>
            <div>
              <span>💬</span>
              <div>
                <h3>
                  {language === "ar" ? "تواصل مباشر" : "Direct Communication"}
                </h3>
                <p>
                  {language === "ar"
                    ? "ناقش مشروعك مباشرة مع المستقل."
                    : "Discuss your project with the freelancer."}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
      <section className="cta">
        <div>
          <h2>
            {language === "ar"
              ? "هل أنت مستعد لبدء مشروعك؟"
              : "Ready to get your project started?"}
          </h2>
          <p>
            {language === "ar"
              ? "اعثر على مستقل أو ابدأ بعرض خدماتك الخاصة."
              : "Find a freelancer or start offering your own services."}
          </p>
          <div className="cta-buttons">
            <Link to="/services">
              {language === "ar" ? "ابحث عن مستقل" : "Find a Freelancer"}
            </Link>
            <Link to="/services/create">
              {language === "ar" ? "كن مستفيدا" : "Become a Freelancer"}
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
export default Homepage;
