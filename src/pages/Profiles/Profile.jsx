import { useState, useEffect } from "react";
import { useParams } from "react-router";
import { getProfile } from "../../services/profile.Service";
import ProfileServices from "../../components/Profile/ProfileServices";
import ProfileReviews from "../../components/Profile/ProfileReviews";

function ProfilePage() {
  const [profile, setProfile] = useState(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const { id } = useParams();

  useEffect(() => {
    async function fetchProfile() {
      try {
        const profile = await getProfile(id);
        setProfile(profile);
      } catch (err) {
        console.error("Error fetching current Profile:", err);
        setError(err);
      } finally {
        setLoading(false);
      }
    }

    fetchProfile();
  }, [id]);

  if (loading) {
    return <p>Loading...</p>;
  }

  if (error) {
    return <p>Failed to load profile: {error}</p>;
  }

  if (!profile) {
    return <p>Profile not found</p>;
  }
  return (
    <>
      <div>
        <div>
          <img src={profile.avatarUrl} alt="Profile avatar" />
          <h1 aria-label="Public name">{profile.name || profile.username}</h1>
          <div aria-label="username">@{profile.username}</div>
          {profile.isSeller && <div>Seller</div>}
          <div>
            Member since:{" "}
            {new Date(profile.createdAt).toLocaleDateString("en-US", {
              month: "short",
              year: "numeric",
            })}
          </div>
          <div>
            <div>{profile.country}</div>
            <div>
              {profile.languages?.map((language) => (
                <div key={language}>{language}</div>
              ))}
            </div>
          </div>
          <div>
            {profile.bio ? (
              <div>
                <h1>About Me</h1>
                {profile.bio}
              </div>
            ) : null}
            <div>
              {profile.skills?.map((oneSkill) => (
                <div key={oneSkill}>{oneSkill}</div>
              ))}
            </div>
          </div>
        </div>

        {profile.isSeller && (
          <>
            <ProfileServices id={id} />
            <ProfileReviews userId={id} />
          </>
        )}
      </div>
    </>
  );
}

export default ProfilePage;
