import { useTranslation } from "react-i18next";
import { useState, useEffect } from "react";
import { getMyProfile } from "../../services/profile.Service";
import { getReviewsForFreelancer } from "../../services/review.Service";
import ProfileHeader from "../../components/MyProfile/ProfileHeader";
import EditProfileForm from "../../components/MyProfile/EditProfileForm";
import ProfileOverview from "../../components/MyProfile/ProfileOverview";
import EditOverviewForm from "../../components/MyProfile/EditOverviewForm";
import "../../components/MyProfile/myProfile.css";
import ProfileServices from "../../components/Profile/ProfileServices";
import PageLoader from "../../components/loading-ui/Loading";
function MyProfilePage() {
  const {
    t
  } = useTranslation();
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
    return <PageLoader message={t("myProfile.loading")} />;
  }
  if (error) {
    return <p>{t("myProfile.failedToLoadProfile")}</p>;
  }
  if (!profile) {
    return <p>{t("myProfile.profileNotFound")}</p>;
  }
  return <main className="my-profile-page">
      <div className="my-profile-shell">
        <ProfileHeader profile={profile} reviews={sellerReviews} onEdit={() => setIsEditing(true)} />

        {isEditing && <EditProfileForm profile={profile} onClose={() => setIsEditing(false)} onUpdated={updatedProfile => {
        setProfile(updatedProfile);
        setIsEditing(false);
      }} />}

        <div className="my-profile-content-grid">
          <div className="my-profile-main-column">
            <ProfileOverview profile={profile} onEdit={() => setIsEditingOverview(true)} />

            {isEditingOverview && <EditOverviewForm profile={profile} onClose={() => setIsEditingOverview(false)} onUpdated={updatedProfile => {
            setProfile(updatedProfile);
            setIsEditingOverview(false);
          }} />}
          </div>

          <aside className="my-profile-side-column">
            <div className="my-profile-card">
              <p className="my-profile-side-label">{t("myProfile.atAGlance")}</p>
              <ul className="my-profile-summary-list">
                <li>
                  <span>{t("myProfile.accountType")}</span>
                  <strong>{profile.isSeller ? t("myProfile.seller") : t("myProfile.client")}</strong>
                </li>
                <li>
                  <span>{t("myProfile.location")}</span>
                  <strong>{profile.country || t("myProfile.notAdded")}</strong>
                </li>
                <li>
                  <span>{t("myProfile.memberSince")}</span>
                  <strong>
                    {new Date(profile.createdAt).toLocaleDateString("en-US", {
                    month: "short",
                    year: "numeric"
                  })}
                  </strong>
                </li>
              </ul>
              {profile.isSeller && <div className="my-profile-side-actions">
                  <a href="/payment-details" className="primary-btn full-width-link">{t("myProfile.paymentDetails")}</a>
                </div>}
            </div>
          </aside>
        </div>

        {profile.isSeller && <section className="my-profile-card services-block">
            <div className="my-profile-section-header">
              <div>
                <p className="my-profile-section-kicker">{t("myProfile.services")}</p>
                <h2>{t("myProfile.myServices")}</h2>
              </div>
            </div>
            <ProfileServices id={profile._id} />
          </section>}
      </div>
    </main>;
}
export default MyProfilePage;
