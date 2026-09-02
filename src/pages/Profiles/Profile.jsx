import { useTranslation } from "react-i18next";
import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate, useParams } from "react-router";
import axios from "axios";
import { getProfile } from "../../services/profile.Service";
import { getReviewsForFreelancer } from "../../services/review.Service";
import ProfileServices from "../../components/Profile/ProfileServices";
import ProfileReviews from "../../components/Profile/ProfileReviews";
import PageLoader from "../../components/loading-ui/Loading";
import Icon from "../../components/Icon";
import ReportModal from "../../components/ReportModal";
function ProfilePage() {
  const {
    t
  } = useTranslation();
  const {
    id
  } = useParams();
  const navigate = useNavigate();
  const currentUserId = localStorage.getItem("userId");
  const [profile, setProfile] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isFavorite, setIsFavorite] = useState(() => id ? localStorage.getItem(`favorite-profile-${id}`) === "true" : false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [reportOpen, setReportOpen] = useState(false);
  const [reportNotice, setReportNotice] = useState("");
  const menuRef = useRef(null);
  const menuTriggerRef = useRef(null);
  const isOwnProfile = profile && currentUserId && String(profile._id) === String(currentUserId);
  useEffect(() => {
    async function fetchProfileData() {
      if (!id) {
        setLoading(false);
        return;
      }
      try {
        const [profileData, reviewData] = await Promise.all([getProfile(id), getReviewsForFreelancer(id)]);
        setProfile(profileData);
        setReviews(Array.isArray(reviewData) ? reviewData : []);
      } catch (err) {
        console.error("Error fetching profile data:", err);
        setError(t("profile.unableToLoadThisFreelancerProfileRightNow"));
      } finally {
        setLoading(false);
      }
    }
    fetchProfileData();
  }, [id, t]);
  useEffect(() => {
    if (!menuOpen) return undefined;
    const menu = menuRef.current;
    const items = menu?.querySelectorAll('[role="menuitem"]') || [];
    items[0]?.focus();
    function handleMenuEvent(event) {
      if (event.type === "mousedown" && menu && !menu.contains(event.target)) setMenuOpen(false);
      if (event.key === "Escape") {
        setMenuOpen(false);
        menuTriggerRef.current?.focus();
      }
      if ((event.key === "ArrowDown" || event.key === "ArrowUp") && items.length) {
        event.preventDefault();
        const current = Array.from(items).indexOf(document.activeElement);
        const direction = event.key === "ArrowDown" ? 1 : -1;
        items[(current + direction + items.length) % items.length].focus();
      }
    }
    document.addEventListener("mousedown", handleMenuEvent);
    document.addEventListener("keydown", handleMenuEvent);
    return () => {
      document.removeEventListener("mousedown", handleMenuEvent);
      document.removeEventListener("keydown", handleMenuEvent);
    };
  }, [menuOpen]);
  const averageRating = useMemo(() => {
    if (!reviews.length) return 0;
    const total = reviews.reduce((sum, review) => sum + Number(review.rating || 0), 0);
    return total / reviews.length;
  }, [reviews]);
  const profileName = profile?.name || profile?.username || t("profile.freelancer");
  const profileAvatar = profile?.avatarUrl || "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQWC-v0HrKYp0-av4D0eTZv5hoIHoW35GhmKG2djTVP4Q&s";
  const initials = profileName.split(" ").slice(0, 2).map(part => part[0]?.toUpperCase() || "").join("") || "F";
  const headline = profile?.bio || t("profile.defaultHeadline", { name: profileName });
  const portfolio = Array.isArray(profile?.portfolio) ? profile.portfolio : [];
  const experience = profile?.experience || t("profile.noExperience");
  const education = profile?.education || t("profile.noEducation");
  const certifications = Array.isArray(profile?.certifications) && profile.certifications.length ? profile.certifications : [t("profile.independentFreelancer")];
  const normalizeList = value => {
    if (Array.isArray(value)) return value.filter(Boolean);
    if (typeof value === "string") {
      const trimmed = value.trim();
      if (!trimmed) return [];
      try {
        const parsed = JSON.parse(trimmed);
        if (Array.isArray(parsed)) return parsed.filter(Boolean);
      } catch {
        // ignore invalid JSON and continue with a split fallback
      }
      return trimmed.replace(/^\[|\]$/g, "").split(",").map(item => item.replace(/["'[\]]/g, "").trim()).filter(Boolean);
    }
    return [];
  };
  const languages = normalizeList(profile?.languages).length ? normalizeList(profile?.languages) : [t("language.english")];
  const offeredServices = Array.isArray(profile?.services) && profile.services.length ? profile.services : [t("services.webDevelopment"), t("services.uIUXDesign"), t("profile.brandStrategy")];
  const contactDetails = {
    email: profile?.email || "contact@injaz.com",
    phone: profile?.phone || t("profile.notSharedPublicly"),
    website: profile?.website || t("profile.noWebsiteShared")
  };
  async function handleMessage() {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/sign-in");
      return;
    }
    try {
      const response = await axios.post("http://localhost:3000/chat/conversations", {
        participantId: id
      }, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
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
          url: profileUrl
        });
        return;
      }
      if (navigator.clipboard) {
        await navigator.clipboard.writeText(profileUrl);
      }
      window.alert(t("profile.profileLinkCopied"));
    } catch (err) {
      console.error("Unable to share profile:", err);
      if (navigator.clipboard) {
        navigator.clipboard.writeText(profileUrl);
      }
      window.alert(t("profile.profileLinkCopied"));
    }
  }
  function toggleFavorite() {
    if (!id) return;
    const nextValue = !isFavorite;
    setIsFavorite(nextValue);
    localStorage.setItem(`favorite-profile-${id}`, String(nextValue));
  }
  const stats = [{
    label: "Completed Orders",
    value: profile?.sellerStats?.completedOrders || 0
  }, {
    label: "Total Reviews",
    value: profile?.sellerStats?.totalReviews || reviews.length || 0
  }, {
    label: "Average Rating",
    value: (profile?.sellerStats?.totalReviews || reviews.length)
      ? Number(profile?.sellerStats?.averageRating || averageRating).toFixed(1)
      : "—"
  }];
  if (loading) {
    return <PageLoader message={t("profile.loadingProfile")} />;
  }
  if (error) {
    return <main className="profile-page-shell">
        <div className="profile-empty-state large">
          <div className="profile-empty-icon">!</div>
          <h2>{t("profile.profileUnavailable")}</h2>
          <p>{error}</p>
          <Link to="/" className="profile-primary-btn">{t("profile.backToHomepage")}</Link>
        </div>
      </main>;
  }
  if (!profile) {
    return <main className="profile-page-shell">
        <div className="profile-empty-state large">
          <div className="profile-empty-icon">•</div>
          <h2>{t("profile.freelancerNotFound")}</h2>
          <p>{t("profile.thisProfileMayHaveBeenRemovedOrIsNoLongerAvailable")}</p>
          <Link to="/services" className="profile-primary-btn">{t("profile.exploreServices")}</Link>
        </div>
      </main>;
  }
  return <main className="profile-page-shell">
      <section className="profile-hero-card">
        <div className="profile-hero-main">
          <div className="profile-hero-avatar-wrap">
            {profileAvatar ? <img src={profileAvatar} alt={profileName} className="profile-hero-avatar" /> : <div className="profile-hero-avatar fallback">{initials}</div>}
            <span className="profile-status-dot" />
          </div>

          <div className="profile-hero-copy">
            <div className="profile-badges-row">
              {profile.isSeller && <span className="profile-badge verified">{t("profile.erified")}</span>}
            </div>

            <h1>{profileName}</h1>
            <div className="profile-identity-row">
              <span>@{profile.username}</span>
            </div>

            <div className="profile-rating-row">
              <span className="profile-star">★</span>
              <strong>
                {reviews.length ? averageRating.toFixed(1) : "0.0"}
              </strong>
              <span>({t("profile.reviewCount", { count: reviews.length })})</span>
            </div>

            <div className="profile-meta-row">
              <span className="profile-meta-location"><Icon name="location" size={16} /> {profile.country || t("profile.locationNotShared")}</span>
              <span>{t("profile.oined")}{" "}
                {new Date(profile.createdAt).toLocaleDateString("en-US", {
                month: "short",
                year: "numeric"
              })}
              </span>
            </div>

            <p className="profile-headline">{headline}</p>

            <div className="profile-actions-row">
              <button type="button" className="profile-primary-btn" onClick={handleMessage}>{t("profile.message")}</button>

              <Link to={isOwnProfile ? "/my-profile" : "/services"} className="profile-secondary-btn">
                {isOwnProfile ? t("profile.viewMyProfile") : t("profile.viewServices")}
              </Link>

              <button type="button" className={`profile-icon-btn ${isFavorite ? "active" : ""}`} onClick={toggleFavorite} aria-label={t("profile.favoriteFreelancer")} aria-pressed={isFavorite}>
                ♥
              </button>

              <button type="button" className="profile-icon-btn" onClick={handleShare}>{t("profile.share")}</button>

              <div className="profile-menu-wrap" ref={menuRef}>
                <button ref={menuTriggerRef} type="button" className="profile-icon-btn menu" onClick={() => setMenuOpen(value => !value)} aria-label={t("profile.moreProfileActions")} aria-expanded={menuOpen} aria-controls="profile-actions-menu" aria-haspopup="menu">
                  <Icon name="moreVertical" />
                </button>

                {menuOpen && <div className="profile-menu-panel" id="profile-actions-menu" role="menu">
                    {!isOwnProfile && <button type="button" role="menuitem" className="danger" onClick={() => { setMenuOpen(false); setReportOpen(true); }}>{t("profile.reportProfile")}</button>}
                    <button type="button" role="menuitem" onClick={() => setMenuOpen(false)}>{t("profile.blockUser")}</button>
                  </div>}
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
                <p className="profile-section-kicker">{t("profile.about")}</p>
                <h2>{t("profile.professionalOverview")}</h2>
              </div>
            </div>

            <div className="profile-about-grid">
              <div className="profile-about-block">
                <h3>{t("profile.bio")}</h3>
                <p>
                  {profile.bio || t("profile.thisFreelancerHasNotAddedABioYet")}
                </p>
              </div>

              <div className="profile-about-block">
                <h3>{t("profile.experience")}</h3>
                <p>{experience}</p>
              </div>

              <div className="profile-about-block">
                <h3>{t("profile.education")}</h3>
                <p>{education}</p>
              </div>

              <div className="profile-about-block">
                <h3>{t("profile.certifications")}</h3>
                <ul>
                  {certifications.map(certification => <li key={certification}>{certification}</li>)}
                </ul>
              </div>

              <div className="profile-about-block full-width">
                <h3>{t("profile.languages")}</h3>
                <div className="profile-chip-row">
                  {languages.map(language => <span className="profile-chip" key={language}>
                      {language}
                    </span>)}
                </div>
              </div>
            </div>
          </section>

          <section className="profile-panel">
            <div className="profile-section-header">
              <div>
                <p className="profile-section-kicker">{t("profile.skills")}</p>
                <h2>{t("profile.coreStrengths")}</h2>
              </div>
            </div>

            <div className="profile-chip-row">
              {(normalizeList(profile?.skills).length ? normalizeList(profile?.skills) : ["Web Design", "Productivity", "Client Communication"]).map(skill => <span className="profile-chip accent" key={skill}>
                  {skill}
                </span>)}
            </div>
          </section>

          <section className="profile-panel">
            <div className="profile-section-header">
              <div>
                <p className="profile-section-kicker">{t("profile.performance")}</p>
                <h2>{t("profile.workStatistics")}</h2>
              </div>
            </div>

            <div className="profile-stat-grid">
              {stats.map(item => <div className="profile-stat-card" key={item.label}>
                  <span>{item.label}</span>
                  <strong>{item.value}</strong>
                </div>)}
            </div>
          </section>

          <section className="profile-panel">
            <div className="profile-section-header">
              <div>
                <p className="profile-section-kicker">{t("profile.services")}</p>
                <h2>{t("profile.servicesByThisFreelancer")}</h2>
              </div>
            </div>
            <div className="profile-mini-grid">
              {offeredServices.map(service => <div className="profile-mini-card" key={service}>
                  <span className="profile-mini-icon">✓</span>
                  <div>
                    <strong>{service}</strong>
                    <small>{t("profile.availableForHire")}</small>
                  </div>
                </div>)}
            </div>
            <ProfileServices id={id} />
          </section>

          <section className="profile-panel">
            <div className="profile-section-header">
              <div>
                <p className="profile-section-kicker">{t("profile.portfolio")}</p>
                <h2>{t("profile.selectedWork")}</h2>
              </div>
            </div>

            {portfolio.length ? <div className="profile-portfolio-grid">
                {portfolio.map((item, index) => <article className="profile-portfolio-card" key={item.title || item.link || index}>
                    <div className="profile-portfolio-image-wrap">
                      <img src={item.image || "https://images.unsplash.com/..."} alt={item.title || "Portfolio item"} />
                    </div>
                    <div className="profile-portfolio-content">
                      <h3>{item.title || t("profile.project")}</h3>
                      <p>
                        {item.description || t("profile.portfolioInformationWillBeAddedHere")}
                      </p>
                      {item.technologies?.length ? <div className="profile-chip-row small">
                          {item.technologies.map(technology => <span className="profile-chip" key={technology}>
                              {technology}
                            </span>)}
                        </div> : null}
                    </div>
                  </article>)}
              </div> : <div className="profile-empty-state">
                <div className="profile-empty-icon">+</div>
                <h3>{t("profile.portfolioComingSoon")}</h3>
                <p>{t("profile.thisFreelancerHasNotAddedPortfolioItemsYet")}</p>
              </div>}
          </section>

          <section className="profile-panel">
            <div className="profile-section-header">
              <div>
                <p className="profile-section-kicker">{t("profile.reviews")}</p>
                <h2>{t("profile.reviewsAndRatings")}</h2>
              </div>
            </div>
            <ProfileReviews userId={id} />
          </section>
        </div>

        <aside className="profile-side-column">
          <div className="profile-side-card">
            <p className="profile-side-label">{t("profile.availability")}</p>
            <h3>{t("profile.openForFreelanceWork")}</h3>
            <p>{t("profile.usuallyRespondsWithinAFewHoursAndDeliversPolishedProfes")}</p>
          </div>

          <div className="profile-side-card">
            <p className="profile-side-label">{t("profile.quickSummary")}</p>
            <ul className="profile-summary-list">
              <li>
                <span>{t("profile.profile")}</span>
                <strong>{profile.isSeller ? t("profile.seller") : t("profile.user")}</strong>
              </li>
              <li>
                <span>{t("profile.languages")}</span>
                <strong>{languages.join(", ")}</strong>
              </li>
              <li>
                <span>{t("profile.memberSince")}</span>
                <strong>
                  {new Date(profile.createdAt).toLocaleDateString("en-US", {
                  month: "short",
                  year: "numeric"
                })}
                </strong>
              </li>
            </ul>
          </div>

          <div className="profile-side-card">
            <p className="profile-side-label">{t("profile.contact")}</p>
            <ul className="profile-summary-list compact-list">
              <li>
                <span>{t("profile.email")}</span>
                <strong>{contactDetails.email}</strong>
              </li>
              <li>
                <span>{t("profile.phone")}</span>
                <strong>{contactDetails.phone}</strong>
              </li>
              <li>
                <span>{t("profile.website")}</span>
                <strong>{contactDetails.website}</strong>
              </li>
            </ul>
          </div>

          {isOwnProfile && <div className="profile-side-card action-card">
              <p className="profile-side-label">{t("profile.manage")}</p>
              <Link to="/my-profile" className="profile-primary-btn full-width">{t("profile.editProfile")}</Link>
            </div>}
        </aside>
      </div>
      {reportNotice && <div className="report-toast" role="status">{reportNotice}</div>}
      <ReportModal open={reportOpen} targetType="USER" targetId={profile._id} targetLabel={profileName} onClose={() => setReportOpen(false)} onSubmitted={setReportNotice} />
    </main>;
}
export default ProfilePage;
