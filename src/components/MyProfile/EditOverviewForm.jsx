import { useState } from "react";
import { getNames } from "country-list";
import { updateProfile } from "../../services/profile.Service";
import ISO6391 from "iso-639-1";

function EditOverviewForm({ profile, onClose, onUpdated }) {
  const [formData, setFormData] = useState({
    bio: profile.bio || "",
    country: profile.country || "",
    languages: profile.languages || [],
    skills: profile.skills || [],
    isSeller: profile.isSeller || false,
  });

  const countries = getNames();
  const languagesList = ISO6391.getAllNames();

  const [skillInput, setSkillInput] = useState("");

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

  function handleAddLanguage(event) {
    const selectedLanguage = event.target.value;

    if (!selectedLanguage) return;

    if (!formData.languages.includes(selectedLanguage)) {
      setFormData({
        ...formData,
        languages: [...formData.languages, selectedLanguage],
      });
    }

    event.target.value = "";
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
            <label htmlFor="bio">Description:</label>

            <textarea
              name="bio"
              id="bio"
              value={formData.bio}
              onChange={handleChange}
            />

            <label htmlFor="country">Country</label>

            <select
              name="country"
              id="country"
              value={formData.country}
              onChange={handleChange}
            >
              <option value="">Select your country</option>

              {countries.map((country) => (
                <option key={country} value={country}>
                  {country}
                </option>
              ))}
            </select>

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

            <select defaultValue="" onChange={handleAddLanguage}>
              <option value="">Select language</option>

              {languagesList.map((language) => (
                <option key={language} value={language}>
                  {language}
                </option>
              ))}
            </select>

            <label>Skills</label>

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

            <button type="button" onClick={handleAddSkill}>
              Add
            </button>

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
