function ProfileOverview({ profile, onEdit }) {
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

  const languages = normalizeList(profile.languages);
  const skills = normalizeList(profile.skills);

  return (
    <section className="my-profile-card">
      <div className="my-profile-section-header">
        <div>
          <p className="my-profile-section-kicker">Overview</p>
          <h2>Professional profile</h2>
        </div>
        <button
          type="button"
          className="my-profile-secondary-btn"
          onClick={onEdit}
        >
          Edit overview
        </button>
      </div>

      <div className="my-profile-overview-grid">
        <div className="my-profile-info-box">
          <h3>About me</h3>
          <p>{profile.bio || "Tell your clients what makes you stand out."}</p>
        </div>

        <div className="my-profile-info-box">
          <h3>Role</h3>
          <p>{profile.isSeller ? "Freelancer / Seller" : "Client"}</p>
        </div>

        <div className="my-profile-info-box">
          <h3>Country</h3>
          <p>{profile.country || "Not set yet"}</p>
        </div>

        <div className="my-profile-info-box">
          <h3>Availability</h3>
          <p>
            {profile.isSeller ? "Open for freelance work" : "Available to hire"}
          </p>
        </div>
      </div>

      {languages.length > 0 && (
        <div className="my-profile-tag-block">
          <h3>Languages</h3>
          <div className="my-profile-tag-row">
            {languages.map((language) => (
              <span className="my-profile-tag" key={language}>
                {language}
              </span>
            ))}
          </div>
        </div>
      )}

      {skills.length > 0 && (
        <div className="my-profile-tag-block">
          <h3>Skills</h3>
          <div className="my-profile-tag-row">
            {skills.map((skill) => (
              <span className="my-profile-tag accent" key={skill}>
                {skill}
              </span>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}

export default ProfileOverview;
