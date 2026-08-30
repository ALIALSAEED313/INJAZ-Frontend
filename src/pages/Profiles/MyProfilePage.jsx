import { useState, useEffect } from "react";
import { getMyProfile } from "../../services/profile.Service";
import ProfileHeader from "../../components/MyProfile/ProfileHeader";
import EditProfileForm from "../../components/MyProfile/EditProfileForm";
import ProfileOverview from "../../components/MyProfile/ProfileOverview";
import EditOverviewForm from "../../components/MyProfile/EditOverviewForm";
import "../../components/MyProfile/myProfile.css";
import ProfileServices from "../../components/Profile/ProfileServices";

function MyProfilePage() {
  const [profile, setProfile] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isEditingOverview, setIsEditingOverview] = useState(false);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchMyProfile() {
      try {
        const profile = await getMyProfile();
        setProfile(profile);
      } catch (err) {
        console.error("Error fetching my profile:", err);
        setError(err);
      } finally {
        setLoading(false);
      }
    }

    fetchMyProfile();
  }, []);

  if (loading) {
    return <p>Loading...</p>;
  }

  if (error) {
    return <p>Failed to load profile</p>;
  }

  if (!profile) {
    return <p>Profile not found</p>;
  }

  return (
    <>
      <ProfileHeader profile={profile} onEdit={() => setIsEditing(true)} />

      {isEditing && (
        <EditProfileForm
          profile={profile}
          onClose={() => setIsEditing(false)}
          onUpdated={(updatedProfile) => {
            setProfile(updatedProfile);
            setIsEditing(false);
          }}
        />
      )}

      <ProfileOverview
        profile={profile}
        onEdit={() => setIsEditingOverview(true)}
      />

      {isEditingOverview && (
        <EditOverviewForm
          profile={profile}
          onClose={() => setIsEditingOverview(false)}
          onUpdated={(updatedProfile) => {
            setProfile(updatedProfile);
            setIsEditingOverview(false);
          }}
        />
      )}

      {profile.isSeller && <ProfileServices id={profile._id} />}
    </>
  );
}

export default MyProfilePage;
