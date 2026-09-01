import { useEffect, useState } from "react";
import { Link } from "react-router";
import { searchServices } from "../services/serviceService";
import api from "../services/api";
import Icon from "../components/Icon";
import MorphingInfinity from "../components/loading-ui/morphing-infinity";
function Homepage() {
  const {
    t
  } = useTranslation();
  const [search, setSearch] = useState("");
  const [services, setServices] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [favorites, setFavorites] = useState([]);
  const [popularSearches, setPopularSearches] = useState([]);
  const categories = [{
    name: t("homepage.webDevelopment"),
    value: "web development",
    icon: "code",
    description: t("homepage.websitesAppsSoftware")
  }, {
    name: t("homepage.mobileAppDevelopment"),
    value: "mobile app development",
    icon: "mobile",
    description: t("homepage.mobileAppsAndInterfaces")
  }, {
    name: t("homepage.softwareDevelopment"),
    value: "software development",
    icon: "software",
    description: t("homepage.customSoftwareSolutions")
  }, {
    name: t("homepage.graphicDesign"),
    value: "graphic design",
    icon: "palette",
    description: t("homepage.logosBrandingGraphics")
  }, {
    name: t("homepage.uIUXDesign"),
    value: "ui/ux design",
    icon: "layout",
    description: t("homepage.userExperienceAndInterfaceDesign")
  }, {
    name: t("homepage.videoAnimation"),
    value: "video & animation",
    icon: "video",
    description: t("homepage.videosEditingAnimation")
  }, {
    name: t("homepage.photography"),
    value: "photography",
    icon: "camera",
    description: t("homepage.photographyEditing")
  }, {
    name: t("homepage.writingTranslation"),
    value: "writing & translation",
    icon: "writing",
    description: t("homepage.articlesCopywriting")
  }, {
    name: t("homepage.digitalMarketing"),
    value: "digital marketing",
    icon: "MKT",
    description: t("homepage.sEOAdsSocialMedia")
  }, {
    name: t("homepage.socialMediaManagement"),
    value: "social media management",
    icon: "SOC",
    description: t("homepage.contentAndCommunityGrowth")
  }, {
    name: t("homepage.sEO"),
    value: "seo",
    icon: "SEO",
    description: t("homepage.searchVisibilityAndRankings")
  }, {
    name: t("homepage.businessConsulting"),
    value: "business & consulting",
    icon: "BIZ",
    description: t("homepage.consultingBusinessGrowth")
  }, {
    name: t("homepage.dataScienceAI"),
    value: "data science & ai",
    icon: "AI",
    description: t("homepage.aIAutomationInsights")
  }, {
    name: t("homepage.musicAudio"),
    value: "music & audio",
    icon: "AUD",
    description: t("homepage.audioProductionAndSoundDesign")
  }, {
    name: t("homepage.accountingFinance"),
    value: "accounting & finance",
    icon: "FIN",
    description: t("homepage.accountingAndFinancialSupport")
  }];
  const steps = [{
    number: "01",
    title: t("homepage.findAService"),
    description: t("homepage.searchForExactlyWhatYouNeedFrom")
  }, {
    number: "02",
    title: t("homepage.chooseAFreelancer"),
    description: t("homepage.compareServicesPricesAndFreelancerRatings")
  }, {
    number: "03",
    title: t("homepage.placeYourOrder"),
    description: t("homepage.chooseYourServiceAndCommunicateWithThe")
  }, {
    number: "04",
    title: t("homepage.getYourWork"),
    description: t("homepage.receiveYourCompletedWorkAndLeaveA")
  }];
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
      setError(t("homepage.pleaseEnterSomethingToSearchFor"));
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
      setError(t("homepage.failedToSearchServicesPleaseTryAgain"));
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
    setFavorites(current => current.includes(id) ? current.filter(item => item !== id) : [...current, id]);
  }
  function clearSearch() {
    setSearched(false);
    setServices([]);
    setSearch("");
    setError("");
  }
  return <main>
      <section className="hero">
        <div className="hero-content">
          <span className="hero-badge">
            {t("homepage.bahrainSFreelanceMarketplace")}
          </span>
          <h1>
            {t("homepage.findThePerfect")}
            <span>
              {t("homepage.freelancerForYourProject")}
            </span>
          </h1>
          <p>
            {t("homepage.fromWebsitesAndGraphicDesignToMarketing")}
          </p>
          <form className="search-box" onSubmit={handleSearch}>
            <input type="text" placeholder={t("common.searchPlaceholder")} value={search} onChange={event => setSearch(event.target.value)} dir="auto" />

            <button type="submit" disabled={loading}>
              {loading ? <MorphingInfinity className="size-20" /> : t("common.search")}
            </button>
          </form>
          {error && <p className="error">{error}</p>}
          {popularSearches.length > 0 && <div className="popular-searches">
              <span>{t("common.popular")}</span>
              {popularSearches.map(item => <button key={item.term} type="button" onClick={() => handlePopularSearch(item.term)}>

                  {item.term}
                </button>)}
            </div>}
        </div>
      </section>
      {searched && <section className="search-results">
          <div className="section-header">
            <div>
              <span className="section-label">
                {t("homepage.sEARCHRESULTS")}
              </span>
              <h2>{t("homepage.servicesFor", {
              search
            })}</h2>
            </div>
            <button type="button" onClick={clearSearch}>
              {t("common.clear")}
            </button>
          </div>
          {loading ? <div className="loading"><MorphingInfinity className="size-24" /> <span>{t("common.searching")}</span></div> : services.length === 0 ? <div className="empty-state">
              <Icon name="search" size={28} />
              <h3>{t("common.noServicesFound")}</h3>
              <p>{t("common.tryAnotherSearch")}</p>
              <Link to="/services">{t("common.browseServices")}</Link>
            </div> : <div className="services-grid">
              {services.map(service => <article key={service._id} className="service-card">

                  <div className="service-image">
                    {service.images?.length > 0 ? <img src={service.images[0]} alt={service.title} /> : <span className="service-placeholder">{t("homepage.injaz")}</span>}
                    <button type="button" className="favorite-button" onClick={() => {
              toggleFavorite(service._id);
            }} aria-label={favorites.includes(service._id) ? t("homepage.removeFromFavorites") : t("homepage.addToFavorites")} aria-pressed={favorites.includes(service._id)}>

                      {favorites.includes(service._id) ? "♥" : "♡"}
                    </button>
                  </div>
                  <div className="service-content">
                    <span className="service-category">{service.category}</span>
                    <h3><Link to={`/services/${service._id}`}>{service.title}</Link></h3>
                    <p>{service.description}</p>
                    <div className="service-rating">
                      ⭐{" "}
                      {service.rating || t("homepage.new")}
                    </div>
                    <div className="service-footer">
                      <span>{t("common.startingAt")}</span>
                      <strong>{service.price}{t("homepage.bhd")}</strong>
                    </div>
                  </div>
                </article>)}
            </div>}
        </section>}
      <section className="categories">
        <div className="section-header">
          <div>
            <span className="section-label">
              {t("homepage.eXPLORE")}
            </span>
            <h2>{t("common.popularCategories")}</h2>
            <p>
              {t("homepage.findTheRightFreelancerForAnyType")}
            </p>
          </div>
          <Link to="/services">{t("common.viewAll")} →</Link>
        </div>
        <div className="categories-grid">
          {categories.slice(0, 8).map(category => <Link key={category.value} to={`/services?category=${encodeURIComponent(category.value)}`} className="category-card">

              <span className="category-icon"><Icon name={category.icon} size={26} /></span>
              <h3>{category.name}</h3>
              <p>{category.description}</p>
              <span className="category-arrow">→</span>
            </Link>)}
        </div>
      </section>
      <section className="how-it-works">
        <div className="section-header centered">
          <span className="section-label">
            {t("homepage.sIMPLEPROCESS")}
          </span>
          <h2>{t("homepage.howINJAZWorks")}</h2>
          <p>
            {t("homepage.gettingProfessionalWorkDoneIsSimple")}
          </p>
        </div>
        <div className="steps">
          {steps.map(step => <div className="step" key={step.number}>
              <span className="step-number">{step.number}</span>
              <h3>{step.title}</h3>
              <p>{step.description}</p>
            </div>)}
        </div>
      </section>
      <section className="trust">
        <div className="trust-content">
          <span className="section-label">
            {t("homepage.wHYINJAZ")}
          </span>
          <h2>
            {t("homepage.everythingYouNeedInOnePlace")}
          </h2>
          <p>
            {t("homepage.discoverFreelancersCompareServicesCommunicateWithSellers")}
          </p>
          <div className="trust-features">
            <div>
              <span aria-hidden="true">01</span>
              <div>
                <h3>
                  {t("homepage.findTheRightService")}
                </h3>
                <p>
                  {t("homepage.searchAndBrowseServicesBasedOnYour")}
                </p>
              </div>
            </div>
            <div>
              <span aria-hidden="true">02</span>
              <div>
                <h3>
                  {t("homepage.compareFreelancers")}
                </h3>
                <p>
                  {t("homepage.comparePricesRatingsAndServiceDetails")}
                </p>
              </div>
            </div>
            <div>
              <span aria-hidden="true">03</span>
              <div>
                <h3>
                  {t("homepage.directCommunication")}
                </h3>
                <p>
                  {t("homepage.discussYourProjectWithTheFreelancer")}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
      <section className="cta">
        <div>
          <h2>
            {t("homepage.readyToGetYourProjectStarted")}
          </h2>
          <p>
            {t("homepage.findAFreelancerOrStartOfferingYour")}
          </p>
          <div className="cta-buttons">
            <Link to="/services">
              {t("homepage.findAFreelancer")}
            </Link>
            <Link to="/services/create">
              {t("homepage.becomeAFreelancer")}
            </Link>
          </div>
        </div>
      </section>
    </main>;
}
export default Homepage;
import { useTranslation } from "react-i18next";
