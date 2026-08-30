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

        console.log("Service:", data);

        setService(data);
      } catch (err) {
        console.error("Get service error:", err);
        setError("Failed to load service");
      } finally {
        setLoading(false);
      }
    }

    if (id) {
      getService();
    }
  }, [id]);

  useEffect(() => {
    async function getUser() {
      const token = localStorage.getItem("token");

      if (!token) {
        setCurrentUser(null);
        return;
      }

      try {
        const user = await getCurrentUser();

        console.log("Current user:", user);

        setCurrentUser(user);
      } catch (err) {
        console.log("User is not logged in", err);
        setCurrentUser(null);
      }
    }

    getUser();
  }, []);

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

      if (!token) {
        navigate("/sign-in");
        return;
      }

      const response = await fetch(`http://localhost:3000/services/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(data?.message || "Failed to delete service");
      }

      navigate("/services");
    } catch (err) {
      console.error("Delete error:", err);
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

      if (!service) {
        throw new Error("Service information is missing.");
      }

      const serviceId = service._id;

      const sellerId =
        typeof service.freelancer === "object"
          ? service.freelancer?._id
          : service.freelancer;

      const price = service.price;

      console.log("Creating order with:", {
        serviceId,
        sellerId,
        price,
      });

      if (!sellerId) {
        throw new Error("Unable to find the seller for this service.");
      }
      if (price === undefined || price === null) {
        throw new Error("Unable to find the price for this service.");
      }

      const response = await fetch("http://localhost:3000/orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          serviceId: serviceId,
          sellerId: sellerId,
          price: price,
        }),
      });

      const data = await response.json().catch(() => null);

      console.log("Create order response:", data);

      if (!response.ok) {
        throw new Error(
          data?.err || data?.error || data?.message || "Failed to create order",
        );
      }

      console.log("Order created successfully:", data);

      navigate(`/workspace/${id}`);
    } catch (err) {
      console.error("Order creation error:", err);

      setError(err.message || "Failed to create order");
    } finally {
      setOrdering(false);
    }
  }

  if (loading) {
    return (
      <main>
        <p>Loading service...</p>
      </main>
    );
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
    return (
      <main>
        <p>Service not found.</p>

        <Link to="/services">Back to Services</Link>
      </main>
    );
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

      {error && (
        <p
          style={{
            color: "red",
            marginTop: "15px",
          }}
        >
          {error}
        </p>
      )}

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

              <button className="btn btn-primary" type="button" onClick={handleDelete} disabled={deleting}>
                {deleting ? "Deleting..." : "Delete Service"}
              </button>
            </div>
          ) : currentUser ? (
            <button className="btn btn-primary" type="button" onClick={handleOrder} disabled={ordering}>
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
