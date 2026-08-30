import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router";
import axios from "axios";
import { getProfile } from "../../services/profile.Service";
import { getReviewsForFreelancer } from "../../services/review.Service";
import ProfileServices from "../../components/Profile/ProfileServices";
import ProfileReviews from "../../components/Profile/ProfileReviews";

function ProfilePage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const currentUserId = localStorage.getItem("userId");
  const [profile, setProfile] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isFavorite, setIsFavorite] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  const isOwnProfile =
    profile && currentUserId && String(profile._id) === String(currentUserId);

  useEffect(() => {
    async function fetchProfileData() {
      if (!id) {
        setLoading(false);
        return;
      }

      try {
        const [profileData, reviewData] = await Promise.all([
          getProfile(id),
          getReviewsForFreelancer(id),
        ]);

        setProfile(profileData);
        setReviews(Array.isArray(reviewData) ? reviewData : []);
      } catch (err) {
        console.error("Error fetching profile data:", err);
        setError("Unable to load this freelancer profile right now.");
      } finally {
        setLoading(false);
      }
    }

    fetchProfileData();
  }, [id]);

  useEffect(() => {
    if (!id) return;
    setIsFavorite(localStorage.getItem(`favorite-profile-${id}`) === "true");
  }, [id]);

  const averageRating = useMemo(() => {
    if (!reviews.length) return 0;
    const total = reviews.reduce(
      (sum, review) => sum + Number(review.rating || 0),
      0,
    );
    return total / reviews.length;
  }, [reviews]);

  const profileName = profile?.name || profile?.username || "Freelancer";
  const profileAvatar =
    profile?.avatarUrl ||
    "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQWC-v0HrKYp0-av4D0eTZv5hoIHoW35GhmKG2djTVP4Q&s";
  const initials =
    profileName
      .split(" ")
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase() || "")
      .join("") || "F";

  const headline =
    profile?.bio ||
    `${profileName} is creating high-quality work on INJAZ and building trusted client relationships.`;

  const portfolio = Array.isArray(profile?.portfolio) ? profile.portfolio : [];
  const experience =
    profile?.experience ||
    "This freelancer has not added experience details yet.";
  const education =
    profile?.education || "No education details were shared yet.";
  const certifications =
    Array.isArray(profile?.certifications) && profile.certifications.length
      ? profile.certifications
      : ["Independent freelancer on INJAZ"];
  const normalizeList = (value) => {
    if (Array.isArray(value)) return value.filter(Boolean);

    if (typeof value === "string") {
      const trimmed = value.trim();
      if (!trimmed) return [];

      try {
        const parsed = JSON.parse(trimmed);
        if (Array.isArray(parsed)) return parsed.filter(Boolean);
      } catch (err) {
        // ignore invalid JSON and continue with a split fallback
      }

      return trimmed
        .replace(/^\[|\]$/g, "")
        .split(",")
        .map((item) => item.replace(/["'\[\]]/g, "").trim())
        .filter(Boolean);
    }

    return [];
  };

  const languages = normalizeList(profile?.languages).length
    ? normalizeList(profile?.languages)
    : ["English"];
  const offeredServices =
    Array.isArray(profile?.services) && profile.services.length
      ? profile.services
      : ["Web Development", "UI/UX Design", "Brand Strategy"];
  const contactDetails = {
    email: profile?.email || "contact@injaz.com",
    phone: profile?.phone || "Not shared publicly",
    website: profile?.website || "No website shared",
  };

  async function handleMessage() {
    const token = localStorage.getItem("token");

    if (!token) {
      navigate("/sign-in");
      return;
    }

    try {
      const response = await axios.post(
        "http://localhost:3000/chat/conversations",
        { participantId: id },
        { headers: { Authorization: `Bearer ${token}` } },
      );

      const conversationId = response?.data?.conversation?._id;

      if (conversationId) {
        navigate(`/chat/${conversationId}`);
        return;
      }

      navigate("/chat");
    } catch (err) {
      console.error("Unable to open chat:", err);
      navigate("/chat");
    }
  }

  async function handleShare() {
    const profileUrl = window.location.href;

    try {
      if (navigator.share) {
        await navigator.share({
          title: `${profileName} on INJAZ`,
          text: `Check out ${profileName}'s profile on INJAZ.`,
          url: profileUrl,
        });
        return;
      }

      if (navigator.clipboard) {
        await navigator.clipboard.writeText(profileUrl);
      }

      window.alert("Profile link copied!");
    } catch (err) {
      console.error("Unable to share profile:", err);
      if (navigator.clipboard) {
        navigator.clipboard.writeText(profileUrl);
      }
      window.alert("Profile link copied!");
    }
  }

  function toggleFavorite() {
    if (!id) return;
    const nextValue = !isFavorite;
    setIsFavorite(nextValue);
    localStorage.setItem(`favorite-profile-${id}`, String(nextValue));
  }

  const stats = [
    { label: "Completed Orders", value: reviews.length || 0 },
    { label: "Total Reviews", value: reviews.length || 0 },
    {
      label: "Average Rating",
      value: reviews.length ? averageRating.toFixed(1) : "0.0",
    },
    { label: "Response Rate", value: profile?.responseRate || "95%" },
    { label: "On-Time Delivery", value: profile?.onTimeDelivery || "98%" },
  ];

  if (loading) {
    return (
      <main className="profile-page-shell">
        <div className="profile-loading-shell">
          <div className="profile-loading-card hero" />
          <div className="profile-loading-card" />
          <div className="profile-loading-card" />
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="profile-page-shell">
        <div className="profile-empty-state large">
          <div className="profile-empty-icon">!</div>
          <h2>Profile unavailable</h2>
          <p>{error}</p>
          <Link to="/" className="profile-primary-btn">
            Back to homepage
          </Link>
        </div>
      </main>
    );
  }

  if (!profile) {
    return (
      <main className="profile-page-shell">
        <div className="profile-empty-state large">
          <div className="profile-empty-icon">•</div>
          <h2>Freelancer not found</h2>
          <p>This profile may have been removed or is no longer available.</p>
          <Link to="/services" className="profile-primary-btn">
            Explore services
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="profile-page-shell">
      <section className="profile-hero-card">
        <div className="profile-hero-main">
          <div className="profile-hero-avatar-wrap">
            {profileAvatar ? (
              <img
                src={profileAvatar}
                alt={profileName}
                className="profile-hero-avatar"
              />
            ) : (
              <div className="profile-hero-avatar fallback">{initials}</div>
            )}
            <span className="profile-status-dot" />
          </div>

          <div className="profile-hero-copy">
            <div className="profile-badges-row">
              {profile.isSeller && (
                <span className="profile-badge verified">✓ Verified</span>
              )}
              <span className="profile-badge top">🏆 Top Rated</span>
              <span className="profile-badge fast">⚡ Fast Response</span>
            </div>

            <h1>{profileName}</h1>
            <div className="profile-identity-row">
              <span>@{profile.username}</span>
              <span className="profile-status-pill">Available now</span>
            </div>

            <div className="profile-rating-row">
              <span className="profile-star">★</span>
              <strong>
                {reviews.length ? averageRating.toFixed(1) : "0.0"}
              </strong>
              <span>({reviews.length || 0} reviews)</span>
            </div>

            <div className="profile-meta-row">
              <span>📍 {profile.country || "Location not shared"}</span>
              <span>
                📆 Joined{" "}
                {new Date(profile.createdAt).toLocaleDateString("en-US", {
                  month: "short",
                  year: "numeric",
                })}
              </span>
            </div>

            <p className="profile-headline">{headline}</p>

            <div className="profile-actions-row">
              <button
                type="button"
                className="profile-primary-btn"
                onClick={handleMessage}
              >
                Message
              </button>

              <Link
                to={isOwnProfile ? "/my-profile" : "/services"}
                className="profile-secondary-btn"
              >
                {isOwnProfile ? "View My Profile" : "View Services"}
              </Link>

              <button
                type="button"
                className={`profile-icon-btn ${isFavorite ? "active" : ""}`}
                onClick={toggleFavorite}
                aria-label="Favorite freelancer"
              >
                ♥
              </button>

              <button
                type="button"
                className="profile-icon-btn"
                onClick={handleShare}
              >
                Share
              </button>

              <div className="profile-menu-wrap">
                <button
                  type="button"
                  className="profile-icon-btn menu"
                  onClick={() => setMenuOpen((value) => !value)}
                  aria-label="More profile actions"
                >
                  •••
                </button>

                {menuOpen && (
                  <div className="profile-menu-panel">
                    <button type="button" onClick={() => setMenuOpen(false)}>
                      Report Profile
                    </button>
                    <button type="button" onClick={() => setMenuOpen(false)}>
                      Block User
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="profile-content-layout">
        <div className="profile-main-column">
          <section className="profile-panel">
            <div className="profile-section-header">
              <div>
                <p className="profile-section-kicker">About</p>
                <h2>Professional overview</h2>
              </div>
            </div>

            <div className="profile-about-grid">
              <div className="profile-about-block">
                <h3>Bio</h3>
                <p>
                  {profile.bio || "This freelancer has not added a bio yet."}
                </p>
              </div>

              <div className="profile-about-block">
                <h3>Experience</h3>
                <p>{experience}</p>
              </div>

              <div className="profile-about-block">
                <h3>Education</h3>
                <p>{education}</p>
              </div>

              <div className="profile-about-block">
                <h3>Certifications</h3>
                <ul>
                  {certifications.map((certification) => (
                    <li key={certification}>{certification}</li>
                  ))}
                </ul>
              </div>

              <div className="profile-about-block full-width">
                <h3>Languages</h3>
                <div className="profile-chip-row">
                  {languages.map((language) => (
                    <span className="profile-chip" key={language}>
                      {language}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </section>

          <section className="profile-panel">
            <div className="profile-section-header">
              <div>
                <p className="profile-section-kicker">Skills</p>
                <h2>Core strengths</h2>
              </div>
            </div>

            <div className="profile-chip-row">
              {(normalizeList(profile?.skills).length
                ? normalizeList(profile?.skills)
                : ["Web Design", "Productivity", "Client Communication"]
              ).map((skill) => (
                <span className="profile-chip accent" key={skill}>
                  {skill}
                </span>
              ))}
            </div>
          </section>

          <section className="profile-panel">
            <div className="profile-section-header">
              <div>
                <p className="profile-section-kicker">Performance</p>
                <h2>Work statistics</h2>
              </div>
            </div>

            <div className="profile-stat-grid">
              {stats.map((item) => (
                <div className="profile-stat-card" key={item.label}>
                  <span>{item.label}</span>
                  <strong>{item.value}</strong>
                </div>
              ))}
            </div>
          </section>

          <section className="profile-panel">
            <div className="profile-section-header">
              <div>
                <p className="profile-section-kicker">Services</p>
                <h2>Services by this freelancer</h2>
              </div>
            </div>
            <div className="profile-mini-grid">
              {offeredServices.map((service) => (
                <div className="profile-mini-card" key={service}>
                  <span className="profile-mini-icon">✓</span>
                  <div>
                    <strong>{service}</strong>
                    <small>Available for hire</small>
                  </div>
                </div>
              ))}
            </div>
            <ProfileServices id={id} />
          </section>

          <section className="profile-panel">
            <div className="profile-section-header">
              <div>
                <p className="profile-section-kicker">Portfolio</p>
                <h2>Selected work</h2>
              </div>
            </div>

            {portfolio.length ? (
              <div className="profile-portfolio-grid">
                {portfolio.map((item) => (
                  <article
                    className="profile-portfolio-card"
                    key={item.title || item.link || Math.random()}
                  >
                    <div className="profile-portfolio-image-wrap">
                      <img
                        src={item.image || "https://images.unsplash.com/..."}
                        alt={item.title || "Portfolio item"}
                      />
                    </div>
                    <div className="profile-portfolio-content">
                      <h3>{item.title || "Project"}</h3>
                      <p>
                        {item.description ||
                          "Portfolio information will be added here."}
                      </p>
                      {item.technologies?.length ? (
                        <div className="profile-chip-row small">
                          {item.technologies.map((technology) => (
                            <span className="profile-chip" key={technology}>
                              {technology}
                            </span>
                          ))}
                        </div>
                      ) : null}
                    </div>
                  </article>
                ))}
              </div>
            ) : (
              <div className="profile-empty-state">
                <div className="profile-empty-icon">+</div>
                <h3>Portfolio coming soon</h3>
                <p>This freelancer has not added portfolio items yet.</p>
              </div>
            )}
          </section>

          <section className="profile-panel">
            <div className="profile-section-header">
              <div>
                <p className="profile-section-kicker">Reviews</p>
                <h2>Reviews & ratings</h2>
              </div>
            </div>
            <ProfileReviews userId={id} />
          </section>
        </div>

        <aside className="profile-side-column">
          <div className="profile-side-card">
            <p className="profile-side-label">Availability</p>
            <h3>Open for freelance work</h3>
            <p>
              Usually responds within a few hours and delivers polished,
              professional results.
            </p>
          </div>

          <div className="profile-side-card">
            <p className="profile-side-label">Quick summary</p>
            <ul className="profile-summary-list">
              <li>
                <span>Profile</span>
                <strong>{profile.isSeller ? "Seller" : "User"}</strong>
              </li>
              <li>
                <span>Languages</span>
                <strong>{languages.join(", ")}</strong>
              </li>
              <li>
                <span>Member since</span>
                <strong>
                  {new Date(profile.createdAt).toLocaleDateString("en-US", {
                    month: "short",
                    year: "numeric",
                  })}
                </strong>
              </li>
            </ul>
          </div>

          <div className="profile-side-card">
            <p className="profile-side-label">Contact</p>
            <ul className="profile-summary-list compact-list">
              <li>
                <span>Email</span>
                <strong>{contactDetails.email}</strong>
              </li>
              <li>
                <span>Phone</span>
                <strong>{contactDetails.phone}</strong>
              </li>
              <li>
                <span>Website</span>
                <strong>{contactDetails.website}</strong>
              </li>
            </ul>
          </div>

          {isOwnProfile && (
            <div className="profile-side-card action-card">
              <p className="profile-side-label">Manage</p>
              <Link to="/my-profile" className="profile-primary-btn full-width">
                Edit profile
              </Link>
            </div>
          )}
        </aside>
      </div>
    </main>
  );
}

export default ProfilePage;
