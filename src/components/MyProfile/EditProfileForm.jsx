import { useMemo, useState } from "react";
import { getNames } from "country-list";
import ISO6391 from "iso-639-1";
import { updateProfile } from "../../services/profile.Service";

function EditProfileForm({ profile, onClose, onUpdated }) {
  const [formData, setFormData] = useState({
    name: profile.name || "",
    bio: profile.bio || "",
    country: profile.country || "",
    gender: profile.gender || "",
    languages: profile.languages || [],
    skills: profile.skills || [],
    isSeller: profile.isSeller || false,
    avatar: null,
  });

  const [imagePreview, setImagePreview] = useState(profile.avatarUrl || "");
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

  async function handleSubmit(event) {
    event.preventDefault();

    try {
      const data = new FormData();

      data.append("name", formData.name);
      data.append("bio", formData.bio || "");
      data.append("country", formData.country || "");
      data.append("gender", formData.gender || "");
      data.append("languages", JSON.stringify(formData.languages));
      data.append("skills", JSON.stringify(formData.skills));
      data.append("isSeller", String(formData.isSeller));

      if (formData.avatar) {
        data.append("avatar", formData.avatar);
      }

      const updatedProfile = await updateProfile(data);
      onUpdated(updatedProfile);
    } catch (err) {
      console.error("Error updating profile:", err);
    }
  }

  function handleChange(event) {
    const { name, value } = event.target;

    setFormData({
      ...formData,
      [name]: value,
    });
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

  function handleImageChange(event) {
    const file = event.target.files[0];

    if (!file) return;

    setFormData({
      ...formData,
      avatar: file,
    });

    setImagePreview(URL.createObjectURL(file));
  }

  return (
    <>
      <div className="edit-overlay" onClick={onClose}></div>

      <div className="edit-profile-panel">
        <form onSubmit={handleSubmit}>
          <div className="edit-panel-header">
            <h2>Complete your profile</h2>

            <button type="button" className="close-btn" onClick={onClose}>
              ✕
            </button>
          </div>

          <div className="edit-panel-content">
            <div className="edit-page-helper-box">
              <strong>Profile setup</strong>
              <p>
                Add the basics that help clients trust you: your profile photo,
                name, bio, country, skills, and languages.
              </p>
            </div>

            <div className="avatar-upload">
              <label htmlFor="avatar" className="avatar-label">
                {imagePreview ? (
                  <img
                    src={imagePreview}
                    alt="profile avatar"
                    className="avatar-image"
                  />
                ) : (
                  <div className="avatar-placeholder">
                    {profile.name?.charAt(0).toUpperCase() ||
                      profile.username?.charAt(0).toUpperCase()}
                  </div>
                )}

                <div className="avatar-hover">
                  <span className="camera-icon">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      height="24px"
                      viewBox="0 -960 960 960"
                      width="24px"
                      fill="currentColor"
                    >
                      <path d="M480-260q75 0 127.5-52.5T660-440q0-75-52.5-127.5T480-620q-75 0-127.5 52.5T300-440q0 75 52.5 127.5T480-260Zm0-80q-42 0-71-29t-29-71q0-42 29-71t71-29q42 0 71 29t29 71q0 42-29 71t-71 29ZM160-120q-33 0-56.5-23.5T80-200v-480q0-33 23.5-56.5T160-760h126l74-80h240l74 80h126q33 0 56.5 23.5T880-680v480q0 33-23.5 56.5T800-120H160Zm0-80h640v-480H638l-73-80H395l-73 80H160v480Zm320-240Z" />
                    </svg>
                  </span>
                </div>
              </label>

              <input
                type="file"
                id="avatar"
                accept="image/*"
                onChange={handleImageChange}
                hidden
              />
            </div>

            <label htmlFor="name">Full name</label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
            />

            <label htmlFor="bio">Bio</label>
            <textarea
              id="bio"
              name="bio"
              value={formData.bio}
              onChange={handleChange}
              rows={4}
              placeholder="Tell people about yourself"
            />

            <label htmlFor="country">Country</label>
            <div className="suggestion-input-wrap">
              <input
                type="text"
                id="country"
                name="country"
                value={formData.country}
                onChange={handleChange}
                placeholder="Type your country"
                autoComplete="off" 
              />

              {filteredCountryOptions.length > 0 && formData.country !== filteredCountryOptions[0] && (
                <ul className="suggestion-list">
                  {filteredCountryOptions.slice(0, 6).map((country) => (
                    <li key={country}>
                      <button
                        type="button"
                        onMouseDown={() => {
                          setFormData({ ...formData, country });
                        }}
                      >
                        {country}
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div> 

            <label htmlFor="gender">Gender</label>
            <select
              name="gender"
              id="gender"
              value={formData.gender}
              onChange={handleChange}
            >
              <option value="">Select gender</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
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
              placeholder="Add a skill, e.g. React"
            />
            <div className="role-section">
              <h3>Profile type</h3>

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
                <strong>I am a freelancer / seller</strong>
              </label>
            </div>

            <label>Username</label>
            <input type="text" value={profile.username} disabled />
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

export default EditProfileForm;
