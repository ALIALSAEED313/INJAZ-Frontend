import { useEffect, useState } from "react";
import {
  getAdminStats,
  getUsers,
  getServices,
  getOrders,
  getReviews,
  updateUserRole,
  deleteUser,
  deleteService,
  deleteOrder,
  deleteReview,
} from "../../services/admin.Service";
import { useAuth } from "../../context/AuthContext";
import AdminOverview from "../../components/Admin/AdminOverview";
import AdminUsers from "../../components/Admin/AdminUsers";
import AdminServices from "../../components/Admin/AdminServices";
import AdminOrders from "../../components/Admin/AdminOrders";
import AdminReviews from "../../components/Admin/AdminReviews";
import DeleteConfirm from "../../components/Admin/DeleteConfirm";

function AdminDashboard() {
  const { user: currentUser } = useAuth();

  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [services, setServices] = useState([]);
  const [orders, setOrders] = useState([]);
  const [reviews, setReviews] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [activeSection, setActiveSection] = useState("overview");

  const [userSearch, setUserSearch] = useState("");
  const [userRoleFilter, setUserRoleFilter] = useState("all");

  const [serviceSearch, setServiceSearch] = useState("");

  const [orderSearch, setOrderSearch] = useState("");
  const [orderStatusFilter, setOrderStatusFilter] = useState("all");

  const [reviewSearch, setReviewSearch] = useState("");
  const [reviewRatingFilter, setReviewRatingFilter] = useState("all");

  const [deleteConfirm, setDeleteConfirm] = useState(null);

  const [message, setMessage] = useState({
    type: "",
    text: "",
  });

  useEffect(() => {
    async function fetchAdminData() {
      try {
        const [statsData, usersData, servicesData, ordersData, reviewsData] =
          await Promise.all([
            getAdminStats(),
            getUsers(),
            getServices(),
            getOrders(),
            getReviews(),
          ]);

        setStats(statsData);
        setUsers(usersData);
        setServices(servicesData);
        setOrders(ordersData);
        setReviews(reviewsData);
      } catch (err) {
        console.error("Error loading admin dashboard:", err);
        setError("Failed to load admin dashboard.");
      } finally {
        setLoading(false);
      }
    }

    fetchAdminData();
  }, []);

  async function handleRoleChange(userId, newRole) {
    try {
      const updatedUser = await updateUserRole(userId, newRole);

      setUsers((currentUsers) =>
        currentUsers.map((user) => (user._id === userId ? updatedUser : user)),
      );

      setMessage({
        type: "success",
        text: "User role updated successfully.",
      });
    } catch (err) {
      console.error("Error updating user role:", err);

      setMessage({
        type: "error",
        text: "Failed to update user role.",
      });
    }
  }

  async function handleDeleteUser(userId) {
    try {
      const userToDelete = users.find((user) => user._id === userId);

      await deleteUser(userId);

      setUsers((currentUsers) =>
        currentUsers.filter((user) => user._id !== userId),
      );

      setStats((currentStats) => ({
        ...currentStats,
        users: currentStats.users - 1,
        sellers: userToDelete?.isSeller
          ? currentStats.sellers - 1
          : currentStats.sellers,
      }));

      setMessage({
        type: "success",
        text: "User deleted successfully.",
      });
    } catch (err) {
      console.error("Error deleting user:", err);

      setMessage({
        type: "error",
        text: "Failed to delete user.",
      });
    }
  }

  async function handleDeleteService(serviceId) {
    try {
      await deleteService(serviceId);

      setServices((currentServices) =>
        currentServices.filter((service) => service._id !== serviceId),
      );

      const [statsData, reviewsData] = await Promise.all([
        getAdminStats(),
        getReviews(),
      ]);

      setStats(statsData);
      setReviews(reviewsData);

      setMessage({
        type: "success",
        text: "Service deleted successfully.",
      });
    } catch (err) {
      console.error("Error deleting service:", err);

      setMessage({
        type: "error",
        text: "Failed to delete service.",
      });
    }
  }

  async function handleDeleteOrder(orderId) {
    try {
      await deleteOrder(orderId);

      setOrders((currentOrders) =>
        currentOrders.filter((order) => order._id !== orderId),
      );

      const [statsData, reviewsData] = await Promise.all([
        getAdminStats(),
        getReviews(),
      ]);

      setStats(statsData);
      setReviews(reviewsData);

      setMessage({
        type: "success",
        text: "Order deleted successfully.",
      });
    } catch (err) {
      console.error("Error deleting order:", err);

      setMessage({
        type: "error",
        text: "Failed to delete order.",
      });
    }
  }

  async function handleDeleteReview(reviewId) {
    try {
      await deleteReview(reviewId);

      setReviews((currentReviews) =>
        currentReviews.filter((review) => review._id !== reviewId),
      );

      setStats((currentStats) => ({
        ...currentStats,
        reviews: currentStats.reviews - 1,
      }));

      setMessage({
        type: "success",
        text: "Review deleted successfully.",
      });
    } catch (err) {
      console.error("Error deleting review:", err);

      setMessage({
        type: "error",
        text: "Failed to delete review.",
      });
    }
  }

  async function handleConfirmDelete() {
    if (!deleteConfirm) return;

    const { type, id } = deleteConfirm;

    if (type === "user") {
      await handleDeleteUser(id);
    }

    if (type === "service") {
      await handleDeleteService(id);
    }

    if (type === "order") {
      await handleDeleteOrder(id);
    }

    if (type === "review") {
      await handleDeleteReview(id);
    }

    setDeleteConfirm(null);
  }

  const filteredUsers = users.filter((user) => {
    const search = userSearch.toLowerCase();

    const matchesSearch =
      user.username?.toLowerCase().includes(search) ||
      user.name?.toLowerCase().includes(search) ||
      user.email?.toLowerCase().includes(search);

    const matchesRole =
      userRoleFilter === "all" || user.role === userRoleFilter;

    return matchesSearch && matchesRole;
  });

  const filteredServices = services.filter((service) => {
    const search = serviceSearch.toLowerCase();

    return (
      service.title?.toLowerCase().includes(search) ||
      service.freelancer?.name?.toLowerCase().includes(search) ||
      service.freelancer?.username?.toLowerCase().includes(search)
    );
  });

  const orderStatuses = [
    ...new Set(orders.map((order) => order.status).filter(Boolean)),
  ];

  const filteredOrders = orders.filter((order) => {
    const search = orderSearch.toLowerCase();

    const matchesSearch =
      order.service?.title?.toLowerCase().includes(search) ||
      order.buyer?.name?.toLowerCase().includes(search) ||
      order.buyer?.username?.toLowerCase().includes(search) ||
      order.seller?.name?.toLowerCase().includes(search) ||
      order.seller?.username?.toLowerCase().includes(search);

    const matchesStatus =
      orderStatusFilter === "all" || order.status === orderStatusFilter;

    return matchesSearch && matchesStatus;
  });

  const filteredReviews = reviews.filter((review) => {
    const search = reviewSearch.toLowerCase();

    const matchesSearch =
      review.reviewer?.name?.toLowerCase().includes(search) ||
      review.reviewer?.username?.toLowerCase().includes(search) ||
      review.service?.title?.toLowerCase().includes(search) ||
      review.comment?.toLowerCase().includes(search);

    const matchesRating =
      reviewRatingFilter === "all" ||
      review.rating === Number(reviewRatingFilter);

    return matchesSearch && matchesRating;
  });

  if (loading) return <p>Loading admin dashboard...</p>;

  if (error) return <p>{error}</p>;

  return (
    <div>
      <h1>Admin Dashboard</h1>

      {message.text && (
        <div>
          <p>{message.text}</p>

          <button
            type="button"
            onClick={() => setMessage({ type: "", text: "" })}
          >
            Close
          </button>
        </div>
      )}

      <nav>
        <button type="button" onClick={() => setActiveSection("overview")}>
          Overview
        </button>

        <button type="button" onClick={() => setActiveSection("users")}>
          Users
        </button>

        <button type="button" onClick={() => setActiveSection("services")}>
          Services
        </button>

        <button type="button" onClick={() => setActiveSection("orders")}>
          Orders
        </button>

        <button type="button" onClick={() => setActiveSection("reviews")}>
          Reviews
        </button>
      </nav>

      <DeleteConfirm
        deleteConfirm={deleteConfirm}
        handleConfirmDelete={handleConfirmDelete}
        setDeleteConfirm={setDeleteConfirm}
      />

      {activeSection === "overview" && <AdminOverview stats={stats} />}

      {activeSection === "users" && (
        <AdminUsers
          users={users}
          filteredUsers={filteredUsers}
          userSearch={userSearch}
          setUserSearch={setUserSearch}
          userRoleFilter={userRoleFilter}
          setUserRoleFilter={setUserRoleFilter}
          currentUser={currentUser}
          handleRoleChange={handleRoleChange}
          setDeleteConfirm={setDeleteConfirm}
        />
      )}

      {activeSection === "services" && (
        <AdminServices
          services={services}
          filteredServices={filteredServices}
          serviceSearch={serviceSearch}
          setServiceSearch={setServiceSearch}
          setDeleteConfirm={setDeleteConfirm}
        />
      )}

      {activeSection === "orders" && (
        <AdminOrders
          orders={orders}
          filteredOrders={filteredOrders}
          orderSearch={orderSearch}
          setOrderSearch={setOrderSearch}
          orderStatusFilter={orderStatusFilter}
          setOrderStatusFilter={setOrderStatusFilter}
          orderStatuses={orderStatuses}
          setDeleteConfirm={setDeleteConfirm}
        />
      )}

      {activeSection === "reviews" && (
        <AdminReviews
          reviews={reviews}
          filteredReviews={filteredReviews}
          reviewSearch={reviewSearch}
          setReviewSearch={setReviewSearch}
          reviewRatingFilter={reviewRatingFilter}
          setReviewRatingFilter={setReviewRatingFilter}
          setDeleteConfirm={setDeleteConfirm}
        />
      )}
    </div>
  );
}

export default AdminDashboard;
