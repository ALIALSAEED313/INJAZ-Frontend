import { useEffect, useState } from "react";
import { useParams } from "react-router";

function ServiceDetailsPage() {
  const { id } = useParams();
  const [service, setService] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    async function getService() {
      try {
        const response = await fetch(`http://localhost:3000/services/${id}`);

        if (!response.ok) {
          throw new Error("Service not found");
        }

        const data = await response.json();
        setService(data);
      } catch (err) {
        setError(err.message);
      }
    }

    getService();
  }, [id]);

  if (error) {
    return <p>{error}</p>;
  }

  if (!service) {
    return <p>Loading...</p>;
  }

  return (
    <main>
      <h1>{service.title}</h1>

      <p>{service.description}</p>

      <p>Price: {service.price} BHD</p>

      <p>Delivery Time: {service.deliveryTime} days</p>

      {service.images && service.images.length > 0 && (
        <div>
          {service.images.map((image, index) => (
            <img key={index} src={image} alt={service.title} />
          ))}
        </div>
      )}
    </main>
  );
}

export default ServiceDetailsPage;
