import { useEffect, useState } from "react";
import { Link } from "react-router";
import api from "../services/api";

function ServicesPage() {
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
      <section>
        <h1>All Services</h1>

        <p>Find the right freelancer for your project.</p>
      </section>

      {services.length === 0 ? (
        <section>
          <h2>No services found</h2>
          <p>There are currently no services available.</p>
        </section>
      ) : (
        <section>
          <div>
            {services.map((service) => (
              <article key={service._id}>
                {service.images && service.images.length > 0 && (
                  <img src={service.images[0]} alt={service.title} />
                )}

                <p>{service.category}</p>

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
