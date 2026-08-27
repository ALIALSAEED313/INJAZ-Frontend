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
    setFormData({ ...formData, [event.target.name]: event.target.value });
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
        <div>
          <h2>Edit your profile</h2>
          <button onClick={onClose}>✕</button>
        </div>

        <form onSubmit={handleSubmit}>
          <img src={imagePreview} alt="profile avatar" />
          <input type="file" accept="image/*" onChange={handleImageChange} />

          <label>Name</label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
          />

          <label>Username</label>
          <input type="text" value={profile.username} disabled />
          <button type="submit">Save</button>
        </form>
      </div>
    </>
  );
}

export default EditProfileForm;
