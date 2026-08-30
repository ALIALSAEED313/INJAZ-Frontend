import { useMemo, useState } from "react";
import { updateProfile } from "../../services/profile.Service";
import ISO6391 from "iso-639-1";
import { getNames } from "country-list";

function EditOverviewForm({ profile, onClose, onUpdated }) {
  const [formData, setFormData] = useState({
    bio: profile.bio || "",
    country: profile.country || "",
    languages: profile.languages || [],
    skills: profile.skills || [],
    isSeller: profile.isSeller || false,
  });

  const [skillInput, setSkillInput] = useState("");
  const [languageInput, setLanguageInput] = useState("");

  const countryOptions = useMemo(() => getNames(), []);
  const filteredCountryOptions = useMemo(() => {
    const query = formData.country.trim().toLowerCase();

    if (!query) return [];

    return countryOptions.filter((country) =>
      country.toLowerCase().includes(query),
    );
  }, [countryOptions, formData.country]);

  const languageOptions = useMemo(() => ISO6391.getAllNames(), []);
  const filteredLanguageOptions = useMemo(() => {
    const query = languageInput.trim().toLowerCase();

    if (!query) return [];

    return languageOptions.filter(
      (language) =>
        language.toLowerCase().includes(query) &&
        !formData.languages.includes(language),
    );
  }, [formData.languages, languageInput, languageOptions]);

  function handleChange(event) {
    setFormData({
      ...formData,
      [event.target.name]: event.target.value,
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
        languages: [...formData.languages, nextLanguage],
      });
    }

    setLanguageInput("");
  }

  function handleRemoveLanguage(languageToRemove) {
    setFormData({
      ...formData,
      languages: formData.languages.filter(
        (language) => language !== languageToRemove,
      ),
    });
  }

  function handleAddSkill() {
    const newSkill = skillInput.trim();

    if (!newSkill) return;

    if (!formData.skills.includes(newSkill)) {
      setFormData({
        ...formData,
        skills: [...formData.skills, newSkill],
      });
    }

    setSkillInput("");
  }

  function handleRemoveSkill(skillToRemove) {
    setFormData({
      ...formData,
      skills: formData.skills.filter((skill) => skill !== skillToRemove),
    });
  }

  return (
    <>
      <div className="edit-overlay" onClick={onClose}></div>

      <div className="edit-profile-panel">
        <form onSubmit={handleSubmit}>
          <div className="edit-panel-header">
            <h2>Edit your profile overview</h2>

            <button type="button" className="close-btn" onClick={onClose}>
              ✕
            </button>
          </div>

          <div className="edit-panel-content">
            <div className="edit-page-helper-box">
              <strong>Complete your details</strong>
              <p>
                Add a clear description, your location, and the skills you want
                clients to see. This helps buyers understand your expertise.
              </p>
            </div>

            <label htmlFor="bio">Description *</label>

            <textarea
              name="bio"
              id="bio"
              value={formData.bio}
              onChange={handleChange}
              required
            />

            <label htmlFor="country">Country</label>

            <div className="suggestion-input-wrap">
              <input
                type="text"
                name="country"
                id="country"
                value={formData.country}
                onChange={handleChange}
                placeholder="Type your country"
              />

              {filteredCountryOptions.length > 0 && (
                <ul className="suggestion-list">
                  {filteredCountryOptions.slice(0, 6).map((country) => (
                    <li key={country}>
                      <button
                        type="button"
                        onClick={() => setFormData({ ...formData, country })}
                      >
                        {country}
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <label>Languages</label>

            <div className="tags-container">
              {formData.languages.map((language) => (
                <span className="tag" key={language}>
                  {language}

                  <button
                    type="button"
                    className="tag-remove"
                    onClick={() => handleRemoveLanguage(language)}
                  >
                    ✕
                  </button>
                </span>
              ))}
            </div>

            <div className="suggestion-input-wrap">
              <input
                type="text"
                value={languageInput}
                onChange={(event) => setLanguageInput(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter") {
                    event.preventDefault();
                    handleAddLanguage();
                  }
                }}
                placeholder="Type a language and press Enter"
              />

              {filteredLanguageOptions.length > 0 && (
                <ul className="suggestion-list">
                  {filteredLanguageOptions.slice(0, 6).map((language) => (
                    <li key={language}>
                      <button
                        type="button"
                        onClick={() => {
                          setLanguageInput(language);
                          handleAddLanguage();
                        }}
                      >
                        {language}
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <label>Skills *</label>

            <div className="tags-container">
              {formData.skills.map((skill) => (
                <span className="tag" key={skill}>
                  {skill}

                  <button
                    type="button"
                    className="tag-remove"
                    onClick={() => handleRemoveSkill(skill)}
                  >
                    ✕
                  </button>
                </span>
              ))}
            </div>

            <input
              type="text"
              value={skillInput}
              onChange={(event) => setSkillInput(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  event.preventDefault();
                  handleAddSkill();
                }
              }}
              placeholder="e.g. React"
            />

            <div className="role-section">
              <h3>What do you plan to do?</h3>

              <label className="role-card">
                <input type="checkbox" defaultChecked disabled />
                <strong>I am a client</strong>
              </label>

              <label className="role-card">
                <input
                  type="checkbox"
                  checked={formData.isSeller}
                  onChange={(event) =>
                    setFormData({
                      ...formData,
                      isSeller: event.target.checked,
                    })
                  }
                />

                <strong>I am a freelancer</strong>
              </label>
            </div>
          </div>

          <div className="edit-panel-footer">
            <button type="button" className="cancel-btn" onClick={onClose}>
              Cancel
            </button>

            <button type="submit" className="save-btn">
              Save
            </button>
          </div>
        </form>
      </div>
    </>
  );
}

export default EditOverviewForm;
