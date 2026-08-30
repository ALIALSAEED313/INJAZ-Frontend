function ProfileHeader({ profile, reviews = [], onEdit }) {
  const displayName = profile.name || profile.username || "Freelancer";
  const initials =
    displayName
      .split(" ")
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase() || "")
      .join("") || "F";

  const totalReviews = Array.isArray(reviews) ? reviews.length : 0;
  const averageRating = totalReviews
    ? reviews.reduce((sum, review) => sum + Number(review.rating || 0), 0) /
      totalReviews
    : 0;

  return (
    <section className="my-profile-hero-card">
      <div className="my-profile-hero-content">
        <div className="my-profile-hero-avatar-wrap">
          {profile.avatarUrl ? (
            <img
              className="my-profile-hero-avatar"
              src={profile.avatarUrl}
              alt="profile avatar"
            />
          ) : (
            <div className="my-profile-hero-avatar fallback">{initials}</div>
          )}
          <span className="my-profile-online-dot" />
        </div>

        <div className="my-profile-hero-copy">
          <div className="my-profile-badges-row">
            <span className="my-profile-badge verified">Verified</span>
            <span className="my-profile-badge premium">
              {profile.isSeller ? "Seller" : "Client"}
            </span>
            <span className="my-profile-badge fast">Available now</span>
          </div>

          <h1>{displayName}</h1>
          <div className="my-profile-identity-row">
            <span>@{profile.username}</span>
            <span>•</span>
            <span>{profile.country || "Location not shared"}</span>
          </div>

          <div className="my-profile-metrics-row">
            <span>★ {averageRating ? averageRating.toFixed(1) : "0.0"}</span>
            <span>
              {totalReviews} Review{totalReviews === 1 ? "" : "s"}
            </span>
            <span>
              Joined{" "}
              {new Date(profile.createdAt).toLocaleDateString("en-US", {
                month: "short",
                year: "numeric",
              })}
            </span>
          </div>

          {profile.bio && <p className="my-profile-hero-bio">{profile.bio}</p>}
        </div>
      </div>

      <div className="my-profile-hero-actions">
        <button
          type="button"
          className="my-profile-primary-btn"
          onClick={onEdit}
        >
          Edit Profile
        </button>
      </div>
    </section>
  );
}

export default ProfileHeader;
