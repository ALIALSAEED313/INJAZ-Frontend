import { useState } from "react";
import { updateProfile } from "../../services/profile.Service";

function EditProfileForm({ profile, onClose, onUpdated }) {
  const [formData, setFormData] = useState({
    name: profile.name || "",
    avatar: null,
  });

  const [imagePreview, setImagePreview] = useState(profile.avatarUrl || "");

  async function handleSubmit(event) {
    event.preventDefault();

    try {
      const data = new FormData();

      data.append("name", formData.name);

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
    setFormData({
      ...formData,
      [event.target.name]: event.target.value,
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
            <h2>Edit your name and photo</h2>

            <button type="button" className="close-btn" onClick={onClose}>
              ✕
            </button>
          </div>

          <div className="edit-panel-content">
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

            <label htmlFor="name">Name</label>

            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
            />

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
