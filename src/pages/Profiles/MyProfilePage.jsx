import { useState, useEffect } from "react";
import { getMyProfile } from "../../services/profile.Service";
import { getReviewsForFreelancer } from "../../services/review.Service";
import ProfileHeader from "../../components/MyProfile/ProfileHeader";
import EditProfileForm from "../../components/MyProfile/EditProfileForm";
import ProfileOverview from "../../components/MyProfile/ProfileOverview";
import EditOverviewForm from "../../components/MyProfile/EditOverviewForm";
import "../../components/MyProfile/myProfile.css";
import ProfileServices from "../../components/Profile/ProfileServices";

function MyProfilePage() {
  const [profile, setProfile] = useState(null);
  const [sellerReviews, setSellerReviews] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  const [isEditingOverview, setIsEditingOverview] = useState(false);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchMyProfile() {
      try {
        const profileData = await getMyProfile();
        setProfile(profileData);

        if (profileData?.isSeller && profileData?._id) {
          const reviews = await getReviewsForFreelancer(profileData._id);
          setSellerReviews(Array.isArray(reviews) ? reviews : []);
        } else {
          setSellerReviews([]);
        }
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
    <main className="my-profile-page">
      <div className="my-profile-shell">
        <ProfileHeader
          profile={profile}
          reviews={sellerReviews}
          onEdit={() => setIsEditing(true)}
        />

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

        <div className="my-profile-content-grid">
          <div className="my-profile-main-column">
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
          </div>

          <aside className="my-profile-side-column">
            <div className="my-profile-card">
              <p className="my-profile-side-label">At a glance</p>
              <ul className="my-profile-summary-list">
                <li>
                  <span>Account type</span>
                  <strong>{profile.isSeller ? "Seller" : "Client"}</strong>
                </li>
                <li>
                  <span>Location</span>
                  <strong>{profile.country || "Not added"}</strong>
                </li>
                <li>
                  <span>Member since</span>
                  <strong>
                    {new Date(profile.createdAt).toLocaleDateString("en-US", {
                      month: "short",
                      year: "numeric",
                    })}
                  </strong>
                </li>
              </ul>
              {profile.isSeller && (
                <div className="my-profile-side-actions">
                  <a href="/payment-details" className="primary-btn full-width-link">
                    Payment Details
                  </a>
                </div>
              )}
            </div>
          </aside>
        </div>

        {profile.isSeller && (
          <section className="my-profile-card services-block">
            <div className="my-profile-section-header">
              <div>
                <p className="my-profile-section-kicker">Services</p>
                <h2>My services</h2>
              </div>
            </div>
            <ProfileServices id={profile._id} />
          </section>
        )}
      </div>
    </main>
  );
}

export default MyProfilePage;
