import { useEffect, useState } from "react";
import { Link } from "react-router";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";

function ServicesPage() {
  const { user } = useAuth();
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadServices() {
      try {
        const response = await api.get("/services");

        setServices(response.data.services);
      } catch (err) {
        console.log(err);
        setError("Failed to load services");
      } finally {
        setLoading(false);
      }
    }

    loadServices();
  }, []);

  if (loading) {
    return (
      <main>
        <p>Loading services...</p>
      </main>
    );
  }

  if (error) {
    return (
      <main>
        <p>{error}</p>
      </main>
    );
  }

  return (
    <main>
      <section style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "30px", paddingBottom: "10px", borderBottom: "1px solid #e1e8ed" }}>
        <div>
          <h1 style={{ margin: "0 0 10px 0" }}>All Services</h1>
          <p style={{ margin: 0, color: "#777777" }}>Find the right freelancer for your project.</p>
        </div>

        {user?.isSeller && (
          <Link
            to="/services/create"
            className="btn-create-service"
          >
            + Create Service
          </Link>
        )}
      </section>

      {services.length === 0 ? (
        <section>
          <h2>No services found</h2>
          <p>There are currently no services available.</p>
        </section>
      ) : (
        <section>
          {/* تمت إضافة كلاس الشبكة هنا */}
          <div className="services-grid">
            {services.map((service) => (
              <article key={service._id} className="service-card">
                {service.images && service.images.length > 0 && (
                  <img src={service.images[0]} alt={service.title} />
                )}

                {/* قسم تفاصيل البائع والعنوان */}
                <div className="card-content">
                  <div className="card-meta">
                    {service.category} | By:{" "}
                    <Link to={`/profile/${service.freelancer?._id}`}>
                      {service.freelancer?.username || "Unknown Freelancer"}
                    </Link>
                  </div>
                  
                  <h2>{service.title}</h2>
                  
                  <p className="service-desc">{service.description}</p>
                </div>

                {/* قسم السعر ومدة التسليم */}
                <div className="card-footer">
                  <p>
                    Starting at <strong>{service.price} BHD</strong>
                  </p>
                  <p>Delivery: {service.deliveryTime} days</p>
                </div>

                {/* زر العرض */}
                <Link to={`/services/${service._id}`} className="view-service-btn">
                  View Service
                </Link>
              </article>
            ))}
          </div>
        </section>
      )}
    </main>
  );
}

export default ServicesPage;