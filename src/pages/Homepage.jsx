import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { searchServices } from "../services/serviceService";
import api from "../services/api";
function Homepage() {
  const [search, setSearch] = useState("");
  const [services, setServices] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [favorites, setFavorites] = useState([]);
  const [popularSearches, setPopularSearches] = useState([]);
  const categories = [
    {
      name: "Web Development",
      value: "web development",
      icon: "💻",
      description: "Websites, apps & software",
    },
    {
      name: "Graphic Design",
      value: "graphic design",
      icon: "🎨",
      description: "Logos, branding & graphics",
    },
    {
      name: "Digital Marketing",
      value: "digital marketing",
      icon: "📈",
      description: "SEO, ads & social media",
    },
    {
      name: "Video Editing",
      value: "video editing",
      icon: "🎬",
      description: "Videos, editing & animation",
    },
    {
      name: "Writing",
      value: "writing",
      icon: "✍️",
      description: "Articles & copywriting",
    },
    {
      name: "Business",
      value: "business",
      icon: "💼",
      description: "Consulting & business",
    },
    {
      name: "AI Services",
      value: "ai services",
      icon: "🤖",
      description: "AI automation & solutions",
    },
    {
      name: "Photography",
      value: "photography",
      icon: "📷",
      description: "Photography & editing",
    },
  ];
  const steps = [
    {
      number: "01",
      title: "Find a Service",
      description: "Search for exactly what you need from our marketplace.",
    },
    {
      number: "02",
      title: "Choose a Freelancer",
      description: "Compare services, prices and freelancer ratings.",
    },
    {
      number: "03",
      title: "Place Your Order",
      description: "Choose your service and communicate with the freelancer.",
    },
    {
      number: "04",
      title: "Get Your Work",
      description: "Receive your completed work and leave a review.",
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
      setError("Please enter something to search for.");
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
      setError("Failed to search services. Please try again.");
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
          <span className="hero-badge">🇧🇭 Bahrain's Freelance Marketplace</span>
          <h1>
            Find the perfect
            <span> freelancer for your project.</span>
          </h1>
          <p>
            From websites and graphic design to marketing and writing, find
            skilled freelancers ready to help.
          </p>
          <form className="search-box" onSubmit={handleSearch}>
            <input
              type="text"
              placeholder="What service are you looking for?"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />
            <button type="submit" disabled={loading}>
              {loading ? "Searching..." : "🔎 Search"}
            </button>
          </form>
          {error && <p className="error">{error}</p>}
          {popularSearches.length > 0 && (
            <div className="popular-searches">
              <span>Popular:</span>
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
              <span className="section-label">SEARCH RESULTS</span>
              <h2>Services for "{search}"</h2>
            </div>
            <button type="button" onClick={clearSearch}>
              Clear
            </button>
          </div>
          {loading ? (
            <div className="loading">Searching for services...</div>
          ) : services.length === 0 ? (
            <div className="empty-state">
              <span>🔎</span>
              <h3>No services found</h3>
              <p>Try another search term or browse our categories.</p>
              <Link to="/services">Browse All Services</Link>
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
                      ⭐ {service.rating || "New"}
                    </div>
                    <div className="service-footer">
                      <span>Starting at</span>
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
            <span className="section-label">EXPLORE</span>
            <h2>Explore Popular Categories</h2>
            <p>Find the right freelancer for any type of project.</p>
          </div>
          <Link to="/services">View All →</Link>
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
          <span className="section-label">SIMPLE PROCESS</span>
          <h2>How INJAZ works</h2>
          <p>Getting professional work done is simple.</p>
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
          <span className="section-label">WHY INJAZ</span>
          <h2>Everything you need in one place</h2>
          <p>
            Discover freelancers, compare services, communicate with sellers and
            get your project completed.
          </p>
          <div className="trust-features">
            <div>
              <span>🔍</span>
              <div>
                <h3>Find the Right Service</h3>
                <p>Search and browse services based on your needs.</p>
              </div>
            </div>
            <div>
              <span>⭐</span>
              <div>
                <h3>Compare Freelancers</h3>
                <p>Compare prices, ratings and service details.</p>
              </div>
            </div>
            <div>
              <span>💬</span>
              <div>
                <h3>Direct Communication</h3>
                <p>Discuss your project with the freelancer.</p>
              </div>
            </div>
          </div>
        </div>
      </section>
      <section className="cta">
        <div>
          <h2>Ready to get your project started?</h2>
          <p>Find a freelancer or start offering your own services.</p>
          <div className="cta-buttons">
            <Link to="/services">Find a Freelancer</Link>
            <Link to="/services/create">Become a Freelancer</Link>
          </div>
        </div>
      </section>
    </main>
  );
}
export default Homepage;
