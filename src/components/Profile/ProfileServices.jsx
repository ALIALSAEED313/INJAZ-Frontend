import { useTranslation } from "react-i18next";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { getServicesByFreelancer } from "../../services/profile.Service";
function ProfileServices({
  id
}) {
  const {
    t
  } = useTranslation();
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const isOwner = String(localStorage.getItem("userId")) === String(id);
  useEffect(() => {
    async function fetchProfileServices() {
      try {
        const profileServices = await getServicesByFreelancer(id);
        setServices(Array.isArray(profileServices) ? profileServices : []);
      } catch (err) {
        console.error("Error fetching current profile services:", err);
        setError(err);
      } finally {
        setLoading(false);
      }
    }
    fetchProfileServices();
  }, [id]);
  if (loading) {
    return <div className="profile-section-loading">{t("profileServices.loadingServices")}</div>;
  }
  if (error) {
    return <div className="profile-section-empty">{t("profileServices.unableToLoadServicesRightNow")}</div>;
  }
  if (!services.length) {
    return <div className="profile-section-empty compact">
        <span className="profile-empty-mark" aria-hidden="true">{t("profileServices.injaz")}</span>
        <p>{t("profileServices.thisFreelancerHasNoPublishedServicesYet")}</p>
        {isOwner && <button type="button" className="profile-secondary-btn" onClick={() => navigate("/services/create")}>{t("profileServices.createService")}</button>}
      </div>;
  }
  return <div className="profile-services-grid">
      {services.map(oneService => <article className="profile-service-card" key={oneService._id}>
          <div className="profile-service-image-wrap">
            {oneService.images?.[0] ? <img src={oneService.images[0]} alt={oneService.title || "Service"} /> : <div className="profile-service-placeholder">{t("profileServices.service")}</div>}
          </div>

          <div className="profile-service-body">
            <div className="profile-service-top-row">
              <span className="profile-service-category">
                {oneService.category || t("profileServices.general")}
              </span>
              <span className="profile-service-price">{t("profileServices.bhd")}{Number(oneService.price || 0).toFixed(2)}
              </span>
            </div>

            <h3>{oneService.title || t("profileServices.service")}</h3>
            <p>{oneService.description || t("profileServices.noDescriptionProvidedYet")}</p>

            <div className="profile-service-meta-row">
              <span>{oneService.deliveryTime || 3}{t("profileServices.daysDelivery")}</span>
              <span>
                {oneService.rating ? `${Number(oneService.rating).toFixed(1)} rating` : t("profileServices.newListing")}
              </span>
            </div>

            <button type="button" className="profile-secondary-btn full-width" onClick={() => navigate(`/services/${oneService._id}`)}>{t("profileServices.viewService")}</button>
          </div>
        </article>)}
    </div>;
}
export default ProfileServices;
