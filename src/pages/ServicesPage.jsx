import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";
function ServicesPage() {
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const category = searchParams.get("category");
  useEffect(() => {
    async function loadServices() {
      try {
        setLoading(true);
        setError("");
        const url = category
          ? `/services?category=${encodeURIComponent(category)}`
          : "/services";
        const response = await api.get(url);
        setServices(response.data.services || []);
      } catch (err) {
        console.log(err);
        setError("Failed to load services");
        setServices([]);
      } finally {
        setLoading(false);
      }
    }
    loadServices();
  }, [category]);
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
      <section
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <div>
          <h1>{category ? `${category} Services` : "All Services"}</h1>
          <p>
            {category
              ? `Find the best ${category} services for your project.`
              : "Find the right freelancer for your project."}
          </p>
        </div>
        {user?.isSeller && (
          <Link
            to="/services/create"
            className="btn-create-service"
            style={{
              padding: "10px 18px",
              backgroundColor: "#0070f3",
              color: "#fff",
              borderRadius: "6px",
              textDecoration: "none",
              fontWeight: "600",
            }}
          >
            + Create Service
          </Link>
        )}
      </section>
      {services.length === 0 ? (
        <section>
          <h2>No services found</h2>
          <p>
            {category
              ? `There are currently no ${category} services available.`
              : "There are currently no services available."}
          </p>
          {category && <Link to="/services">View All Services</Link>}
        </section>
      ) : (
        <section>
          <div>
            {services.map((service) => (
              <article key={service._id}>
                {service.images && service.images.length > 0 && (
                  <img src={service.images[0]} alt={service.title} />
                )}
                <span>
                  <p>
                    {service.category} By:{" "}
                    <Link
                      to={`/profile/${service.freelencer?._id}`}
                      style={{
                        textDecoration: "underline",
                        color: "blue",
                        fontWeight: "bold",
                      }}
                    >
                      {service.freelencer?.username || "Unknown Freelancer"}
                    </Link>
                  </p>
                </span>
                <h2>{service.title}</h2>
                <p>{service.description}</p>
                <p>
                  Starting at <strong>{service.price} BHD</strong>
                </p>
                <p>Delivery: {service.deliveryTime} days</p>
                <Link to={`/services/${service._id}`}>View Service</Link>
              </article>
            ))}
          </div>
        </section>
      )}
    </main>
  );
}
export default ServicesPage;
