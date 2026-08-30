import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { getServicesByFreelancer } from "../../services/profile.Service";

function ProfileServices({ id }) {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const navigate = useNavigate();

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
    return <div className="profile-section-loading">Loading services...</div>;
  }

  if (error) {
    return (
      <div className="profile-section-empty">
        Unable to load services right now.
      </div>
    );
  }

  if (!services.length) {
    return (
      <div className="profile-section-empty">
        This freelancer has no published services yet.
      </div>
    );
  }

  return (
    <div className="profile-services-grid">
      {services.map((oneService) => (
        <article className="profile-service-card" key={oneService._id}>
          <div className="profile-service-image-wrap">
            {oneService.images?.[0] ? (
              <img
                src={oneService.images[0]}
                alt={oneService.title || "Service"}
              />
            ) : (
              <div className="profile-service-placeholder">Service</div>
            )}
          </div>

          <div className="profile-service-body">
            <div className="profile-service-top-row">
              <span className="profile-service-category">
                {oneService.category || "General"}
              </span>
              <span className="profile-service-price">
                BHD {Number(oneService.price || 0).toFixed(2)}
              </span>
            </div>

            <h3>{oneService.title || "Service"}</h3>
            <p>{oneService.description || "No description provided yet."}</p>

            <div className="profile-service-meta-row">
              <span>⏱ {oneService.deliveryTime || 3} days</span>
              <span>
                {oneService.rating
                  ? `⭐ ${Number(oneService.rating).toFixed(1)}`
                  : "New listing"}
              </span>
            </div>

            <button
              type="button"
              className="profile-secondary-btn full-width"
              onClick={() => navigate(`/services/${oneService._id}`)}
            >
              View Service
            </button>
          </div>
        </article>
      ))}
    </div>
  );
}

export default ProfileServices;
