import { useTranslation } from "react-i18next";
function ProfileOverview({
  profile,
  onEdit
}) {
  const {
    t
  } = useTranslation();
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
  const languages = normalizeList(profile.languages);
  const skills = normalizeList(profile.skills);
  return <section className="my-profile-card">
      <div className="my-profile-section-header">
        <div>
          <p className="my-profile-section-kicker">{t("profileOverview.overview")}</p>
          <h2>{t("profileOverview.professionalProfile")}</h2>
        </div>
        <button type="button" className="my-profile-secondary-btn" onClick={onEdit}>{t("profileOverview.editOverview")}</button>
      </div>

      <div className="my-profile-overview-grid">
        <div className="my-profile-info-box">
          <h3>{t("profileOverview.aboutMe")}</h3>
          <p>{profile.bio || t("profileOverview.tellYourClientsWhatMakesYouStandOut")}</p>
        </div>

        <div className="my-profile-info-box">
          <h3>{t("profileOverview.role")}</h3>
          <p>{profile.isSeller ? t("profileOverview.freelancerSeller") : t("profileOverview.client")}</p>
        </div>

        <div className="my-profile-info-box">
          <h3>{t("profileOverview.country")}</h3>
          <p>{profile.country || t("profileOverview.notSetYet")}</p>
        </div>

        <div className="my-profile-info-box">
          <h3>{t("profileOverview.availability")}</h3>
          <p>
            {profile.isSeller ? t("profileOverview.openForFreelanceWork") : t("profileOverview.availableToHire")}
          </p>
        </div>
      </div>

      {languages.length > 0 && <div className="my-profile-tag-block">
          <h3>{t("profileOverview.languages")}</h3>
          <div className="my-profile-tag-row">
            {languages.map(language => <span className="my-profile-tag" key={language}>
                {language}
              </span>)}
          </div>
        </div>}

      {skills.length > 0 && <div className="my-profile-tag-block">
          <h3>{t("profileOverview.skills")}</h3>
          <div className="my-profile-tag-row">
            {skills.map(skill => <span className="my-profile-tag accent" key={skill}>
                {skill}
              </span>)}
          </div>
        </div>}
    </section>;
}
export default ProfileOverview;
