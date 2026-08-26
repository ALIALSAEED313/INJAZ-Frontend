import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router";

function ServiceDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [service, setService] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);

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
        console.error(err);
        setError("Failed to load service");
      } finally {
        setLoading(false);
      }
    }

    getService();
  }, [id]);

  async function handleDelete() {
    const confirmed = window.confirm(
      "Are you sure you want to delete this service?",
    );

    if (!confirmed) {
      return;
    }

    try {
      setDeleting(true);
      setError("");

      const token = localStorage.getItem("token");

      const response = await fetch(`http://localhost:3000/services/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const data = await response.json().catch(() => null);
        throw new Error(data?.message || "Failed to delete service");
      }

      navigate("/");
    } catch (err) {
      console.error(err);
      setError(err.message || "Failed to delete service");
    } finally {
      setDeleting(false);
    }
  }

  if (loading) {
    return <p>Loading service...</p>;
  }

  if (error && !service) {
    return (
      <main>
        <p>{error}</p>
        <Link to="/">Back to Home</Link>
      </main>
    );
  }

  if (!service) {
    return <p>Service not found.</p>;
  }

  return (
    <main>
      <Link to="/">← Back to Home</Link>

      {error && <p>{error}</p>}

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

          {service.category && <p>{service.category}</p>}

          <p>{service.description}</p>

          <div>
            <h2>{service.price} BHD</h2>

            <p>Delivery time: {service.deliveryTime} days</p>
          </div>

          <div>
            <Link to={`/services/${id}/edit`}>Edit Service</Link>

            <button type="button" onClick={handleDelete} disabled={deleting}>
              {deleting ? "Deleting..." : "Delete Service"}
            </button>
          </div>
        </div>
      </section>
    </main>
  );
}

export default ServiceDetailsPage;
