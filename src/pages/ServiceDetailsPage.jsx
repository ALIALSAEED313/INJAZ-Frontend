import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router";
import { getCurrentUser } from "../services/authService";

function ServiceDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [service, setService] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);
  const [ordering, setOrdering] = useState(false);

  // Get service details
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

  // Get current logged-in user
  useEffect(() => {
    async function getUser() {
      const token = localStorage.getItem("token");

      if (!token) {
        return;
      }

      try {
        const user = await getCurrentUser();
        setCurrentUser(user);
      } catch (err) {
        console.log("User is not logged in");
      }
    }

    getUser();
  }, []);

  // Delete service
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

      navigate("/services");
    } catch (err) {
      console.error(err);
      setError(err.message || "Failed to delete service");
    } finally {
      setDeleting(false);
    }
  }

  async function handleOrder() {
    try {
      setOrdering(true);
      setError("");

      const token = localStorage.getItem("token");

      if (!token) {
        navigate("/sign-in");
        return;
      }

      const response = await fetch("http://localhost:3000/orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          serviceId: id,
        }),
      });

      const data = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(data?.message || "Failed to create order");
      }

      console.log("Order created:", data);

      // Go to workspace after successfully creating the order
      navigate(`/workspace/${id}`);
    } catch (err) {
      console.error(err);
      setError(err.message || "Failed to create order");
    } finally {
      setOrdering(false);
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

  const serviceFreelancerId =
    typeof service.freelancer === "object"
      ? service.freelancer?._id
      : service.freelancer;

  const currentUserId = currentUser?._id || currentUser?.id;

  const isOwner =
    currentUserId &&
    serviceFreelancerId &&
    String(currentUserId) === String(serviceFreelancerId);

  return (
    <main>
      <Link to="/services">← Back to Services</Link>

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

          {isOwner ? (
            <div>
              <Link to={`/services/${id}/edit`}>Edit Service</Link>

              <button type="button" onClick={handleDelete} disabled={deleting}>
                {deleting ? "Deleting..." : "Delete Service"}
              </button>
            </div>
          ) : currentUser ? (
            <button type="button" onClick={handleOrder} disabled={ordering}>
              {ordering ? "Creating Order..." : "Order Service"}
            </button>
          ) : (
            <Link to="/sign-in">Sign In to Order</Link>
          )}
        </div>
      </section>
    </main>
  );
}

export default ServiceDetailsPage;
