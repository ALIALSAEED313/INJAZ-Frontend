import { useTranslation } from "react-i18next";
function ProfileHeader({
  profile,
  reviews = [],
  onEdit
}) {
  const {
    t
  } = useTranslation();
  const displayName = profile.name || profile.username || t("profileHeader.freelancer");
  const initials = displayName.split(" ").slice(0, 2).map(part => part[0]?.toUpperCase() || "").join("") || "F";
  const totalReviews = Array.isArray(reviews) ? reviews.length : 0;
  const averageRating = totalReviews ? reviews.reduce((sum, review) => sum + Number(review.rating || 0), 0) / totalReviews : 0;
  return <section className="my-profile-hero-card">
      <div className="my-profile-hero-content">
        <div className="my-profile-hero-avatar-wrap">
          {profile.avatarUrl ? <img className="my-profile-hero-avatar" src={profile.avatarUrl} alt={t("profileHeader.profileAvatar")} /> : <div className="my-profile-hero-avatar fallback">{initials}</div>}
          <span className="my-profile-online-dot" />
        </div>

        <div className="my-profile-hero-copy">
          <div className="my-profile-badges-row">
            <span className="my-profile-badge verified">{t("profileHeader.verified")}</span>
            <span className="my-profile-badge premium">
              {profile.isSeller ? t("profileHeader.seller") : t("profileHeader.client")}
            </span>
            <span className="my-profile-badge fast">{t("profileHeader.availableNow")}</span>
          </div>

          <h1>{displayName}</h1>
          <div className="my-profile-identity-row">
            <span>@{profile.username}</span>
            <span>•</span>
            <span>{profile.country || t("profileHeader.locationNotShared")}</span>
          </div>

          <div className="my-profile-metrics-row">
            <span>★ {averageRating ? averageRating.toFixed(1) : "0.0"}</span>
            <span>
              {totalReviews}{t("profileHeader.review")}{totalReviews === 1 ? "" : t("profileHeader.s")}
            </span>
            <span>{t("profileHeader.joined")}{" "}
              {new Date(profile.createdAt).toLocaleDateString("en-US", {
              month: "short",
              year: "numeric"
            })}
            </span>
          </div>

          {profile.bio && <p className="my-profile-hero-bio">{profile.bio}</p>}
        </div>
      </div>

      <div className="my-profile-hero-actions">
        <button type="button" className="my-profile-primary-btn" onClick={onEdit}>{t("profileHeader.editProfile")}</button>
      </div>
    </section>;
}
export default ProfileHeader;
