import { useTranslation } from "react-i18next";
import { useMemo, useState } from "react";
import { updateProfile } from "../../services/profile.Service";
import ISO6391 from "iso-639-1";
import { getNames } from "country-list";
function EditOverviewForm({
  profile,
  onClose,
  onUpdated
}) {
  const {
    t
  } = useTranslation();
  const [formData, setFormData] = useState({
    bio: profile.bio || "",
    country: profile.country || "",
    languages: profile.languages || [],
    skills: profile.skills || [],
    isSeller: profile.isSeller || false
  });
  const [skillInput, setSkillInput] = useState("");
  const [languageInput, setLanguageInput] = useState("");
  const countryOptions = useMemo(() => getNames(), []);
  const filteredCountryOptions = useMemo(() => {
    const query = formData.country.trim().toLowerCase();
    if (!query) return [];
    return countryOptions.filter(country => country.toLowerCase().includes(query));
  }, [countryOptions, formData.country]);
  const languageOptions = useMemo(() => ISO6391.getAllNames(), []);
  const filteredLanguageOptions = useMemo(() => {
    const query = languageInput.trim().toLowerCase();
    if (!query) return [];
    return languageOptions.filter(language => language.toLowerCase().includes(query) && !formData.languages.includes(language));
  }, [formData.languages, languageInput, languageOptions]);
  function handleChange(event) {
    setFormData({
      ...formData,
      [event.target.name]: event.target.value
    });
  }
  async function handleSubmit(event) {
    event.preventDefault();
    try {
      const updatedProfile = await updateProfile(formData);
      onUpdated(updatedProfile);
    } catch (err) {
      console.error("Error updating overview:", err);
    }
  }
  function handleAddLanguage() {
    const nextLanguage = languageInput.trim();
    if (!nextLanguage) return;
    if (!formData.languages.includes(nextLanguage)) {
      setFormData({
        ...formData,
        languages: [...formData.languages, nextLanguage]
      });
    }
    setLanguageInput("");
  }
  function handleRemoveLanguage(languageToRemove) {
    setFormData({
      ...formData,
      languages: formData.languages.filter(language => language !== languageToRemove)
    });
  }
  function handleAddSkill() {
    const newSkill = skillInput.trim();
    if (!newSkill) return;
    if (!formData.skills.includes(newSkill)) {
      setFormData({
        ...formData,
        skills: [...formData.skills, newSkill]
      });
    }
    setSkillInput("");
  }
  function handleRemoveSkill(skillToRemove) {
    setFormData({
      ...formData,
      skills: formData.skills.filter(skill => skill !== skillToRemove)
    });
  }
  return <>
      <div className="edit-overlay" onClick={onClose}></div>

      <div className="edit-profile-panel">
        <form onSubmit={handleSubmit}>
          <div className="edit-panel-header">
            <h2>{t("editOverviewForm.editYourProfileOverview")}</h2>

            <button type="button" className="close-btn" onClick={onClose}>
              ✕
            </button>
          </div>

          <div className="edit-panel-content">
            <div className="edit-page-helper-box">
              <strong>{t("editOverviewForm.completeYourDetails")}</strong>
              <p>{t("editOverviewForm.addAClearDescriptionYourLocationAndTheSkillsYouWantClie")}</p>
            </div>

            <label htmlFor="bio">{t("editOverviewForm.description")}</label>

            <textarea name="bio" id="bio" value={formData.bio} onChange={handleChange} required />

            <label htmlFor="country">{t("editOverviewForm.country")}</label>

            <div className="suggestion-input-wrap">
              <input type="text" name="country" id="country" value={formData.country} onChange={handleChange} placeholder={t("editOverviewForm.typeYourCountry")} />

              {filteredCountryOptions.length > 0 && <ul className="suggestion-list">
                  {filteredCountryOptions.slice(0, 6).map(country => <li key={country}>
                      <button type="button" onClick={() => setFormData({
                  ...formData,
                  country
                })}>
                        {country}
                      </button>
                    </li>)}
                </ul>}
            </div>

            <label>{t("editOverviewForm.languages")}</label>

            <div className="tags-container">
              {formData.languages.map(language => <span className="tag" key={language}>
                  {language}

                  <button type="button" className="tag-remove" onClick={() => handleRemoveLanguage(language)}>
                    ✕
                  </button>
                </span>)}
            </div>

            <div className="suggestion-input-wrap">
              <input type="text" value={languageInput} onChange={event => setLanguageInput(event.target.value)} onKeyDown={event => {
              if (event.key === "Enter") {
                event.preventDefault();
                handleAddLanguage();
              }
            }} placeholder={t("editOverviewForm.typeALanguageAndPressEnter")} />

              {filteredLanguageOptions.length > 0 && <ul className="suggestion-list">
                  {filteredLanguageOptions.slice(0, 6).map(language => <li key={language}>
                      <button type="button" onClick={() => {
                  setLanguageInput(language);
                  handleAddLanguage();
                }}>
                        {language}
                      </button>
                    </li>)}
                </ul>}
            </div>

            <label>{t("editOverviewForm.skills")}</label>

            <div className="tags-container">
              {formData.skills.map(skill => <span className="tag" key={skill}>
                  {skill}

                  <button type="button" className="tag-remove" onClick={() => handleRemoveSkill(skill)}>
                    ✕
                  </button>
                </span>)}
            </div>

            <input type="text" value={skillInput} onChange={event => setSkillInput(event.target.value)} onKeyDown={event => {
            if (event.key === "Enter") {
              event.preventDefault();
              handleAddSkill();
            }
          }} placeholder={t("editOverviewForm.eGReact")} />

            <div className="role-section">
              <h3>{t("editOverviewForm.whatDoYouPlanToDo")}</h3>

              <label className="role-card">
                <input type="checkbox" defaultChecked disabled />
                <strong>{t("editOverviewForm.iAmAClient")}</strong>
              </label>

              <label className="role-card">
                <input type="checkbox" checked={formData.isSeller} onChange={event => setFormData({
                ...formData,
                isSeller: event.target.checked
              })} />

                <strong>{t("editOverviewForm.iAmAFreelancer")}</strong>
              </label>
            </div>
          </div>

          <div className="edit-panel-footer">
            <button type="button" className="cancel-btn" onClick={onClose}>{t("editOverviewForm.cancel")}</button>

            <button type="submit" className="save-btn">{t("editOverviewForm.save")}</button>
          </div>
        </form>
      </div>
    </>;
}
export default EditOverviewForm;
