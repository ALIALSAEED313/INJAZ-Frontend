import { useEffect, useState } from "react";
import { Link, useParams } from "react-router";

function ServiceDetailsPage() {
  const { id } = useParams();

  const [service, setService] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function getService() {
      try {
        setLoading(true);
        setError("");

        const response = await fetch(`http://localhost:3000/services/${id}`);

        if (!response.ok) {
          throw new Error("Service not found");
        }

        const data = await response.json();

        setService(data);
      } catch (err) {
        console.log(err);
        setError("Failed to load service");
      } finally {
        setLoading(false);
      }
    }

    getService();
  }, [id]);

  if (loading) {
    return <p>Loading service...</p>;
  }

  if (error) {
    return (
      <main>
        <p>{error}</p>
        <Link to="/">Back to Home</Link>
      </main>
    );
  }

  return (
    <main>
      <Link to="/">← Back to Home</Link>

      <section>
        {service.images && service.images.length > 0 && (
          <div>
            {service.images.map((image, index) => (
              <img
                key={index}
                src={image}
                alt={`${service.title} ${index + 1}`}
              />
            ))}
          </div>
        )}

        <div>
          <h1>{service.title}</h1>

          <p>{service.description}</p>

          <div>
            <h2>{service.price} BHD</h2>

            <p>Delivery time: {service.deliveryTime} days</p>
          </div>
        </div>
      </section>
    </main>
  );
}

export default ServiceDetailsPage;
