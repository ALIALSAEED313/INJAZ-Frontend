import { useTranslation } from "react-i18next";
import { useEffect, useState } from "react";
import { getAdminStats, getUsers, getServices, getOrders, getReviews, updateUserRole, deleteUser, deleteService, deleteOrder, deleteReview } from "../../services/admin.Service";
import { useAuth } from "../../context/AuthContext";
import AdminOverview from "../../components/Admin/AdminOverview";
import PageLoader from "../../components/loading-ui/Loading";
import AdminUsers from "../../components/Admin/AdminUsers";
import AdminServices from "../../components/Admin/AdminServices";
import AdminOrders from "../../components/Admin/AdminOrders";
import AdminReviews from "../../components/Admin/AdminReviews";
import DeleteConfirm from "../../components/Admin/DeleteConfirm";
import AdminReports from "../../components/Admin/AdminReports";
import { getReports, updateReportStatus } from "../../services/reportService";
function AdminDashboard() {
  const {
    t
  } = useTranslation();
  const {
    user: currentUser
  } = useAuth();
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [services, setServices] = useState([]);
  const [orders, setOrders] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [reports, setReports] = useState([]);
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
    text: ""
  });
  useEffect(() => {
    async function fetchAdminData() {
      try {
        const [statsData, usersData, servicesData, ordersData, reviewsData, reportsData] = await Promise.all([getAdminStats(), getUsers(), getServices(), getOrders(), getReviews(), getReports()]);
        setStats(statsData);
        setUsers(usersData);
        setServices(servicesData);
        setOrders(ordersData);
        setReviews(reviewsData);
        setReports(reportsData);
      } catch (err) {
        console.error("Error loading admin dashboard:", err);
        setError(t("adminDashboard.failedToLoadAdminDashboard"));
      } finally {
        setLoading(false);
      }
    }
    fetchAdminData();
  }, [t]);
  async function handleRoleChange(userId, newRole) {
    try {
      const updatedUser = await updateUserRole(userId, newRole);
      setUsers(currentUsers => currentUsers.map(user => user._id === userId ? updatedUser : user));
      setMessage({
        type: "success",
        text: t("adminDashboard.roleUpdated")
      });
    } catch (err) {
      console.error("Error updating user role:", err);
      setMessage({
        type: "error",
        text: t("adminDashboard.roleUpdateFailed")
      });
    }
  }
  async function handleDeleteUser(userId) {
    try {
      const userToDelete = users.find(user => user._id === userId);
      await deleteUser(userId);
      setUsers(currentUsers => currentUsers.filter(user => user._id !== userId));
      setStats(currentStats => ({
        ...currentStats,
        users: currentStats.users - 1,
        sellers: userToDelete?.isSeller ? currentStats.sellers - 1 : currentStats.sellers
      }));
      setMessage({
        type: "success",
        text: t("adminDashboard.userDeleted")
      });
    } catch (err) {
      console.error("Error deleting user:", err);
      setMessage({
        type: "error",
        text: t("adminDashboard.userDeleteFailed")
      });
    }
  }
  async function handleDeleteService(serviceId) {
    try {
      await deleteService(serviceId);
      setServices(currentServices => currentServices.filter(service => service._id !== serviceId));
      const [statsData, reviewsData] = await Promise.all([getAdminStats(), getReviews()]);
      setStats(statsData);
      setReviews(reviewsData);
      setMessage({
        type: "success",
        text: t("adminDashboard.serviceDeleted")
      });
    } catch (err) {
      console.error("Error deleting service:", err);
      setMessage({
        type: "error",
        text: t("adminDashboard.serviceDeleteFailed")
      });
    }
  }
  async function handleDeleteOrder(orderId) {
    try {
      await deleteOrder(orderId);
      setOrders(currentOrders => currentOrders.filter(order => order._id !== orderId));
      const [statsData, reviewsData] = await Promise.all([getAdminStats(), getReviews()]);
      setStats(statsData);
      setReviews(reviewsData);
      setMessage({
        type: "success",
        text: t("adminDashboard.orderDeleted")
      });
    } catch (err) {
      console.error("Error deleting order:", err);
      setMessage({
        type: "error",
        text: t("adminDashboard.orderDeleteFailed")
      });
    }
  }
  async function handleDeleteReview(reviewId) {
    try {
      await deleteReview(reviewId);
      setReviews(currentReviews => currentReviews.filter(review => review._id !== reviewId));
      setStats(currentStats => ({
        ...currentStats,
        reviews: currentStats.reviews - 1
      }));
      setMessage({
        type: "success",
        text: t("adminDashboard.reviewDeleted")
      });
    } catch (err) {
      console.error("Error deleting review:", err);
      setMessage({
        type: "error",
        text: t("adminDashboard.reviewDeleteFailed")
      });
    }
  }
  async function handleConfirmDelete() {
    if (!deleteConfirm) return;
    const {
      type,
      id
    } = deleteConfirm;
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
  async function handleReportStatus(reportId, status) {
    try {
      const updated = await updateReportStatus(reportId, status);
      setReports(current => current.map(report => report._id === reportId ? { ...report, ...updated } : report));
      setMessage({ type: "success", text: t("adminDashboard.reportUpdated", { defaultValue: "Report status updated." }) });
    } catch (err) {
      console.error("Error updating report:", err);
      setMessage({ type: "error", text: t("adminDashboard.reportUpdateFailed", { defaultValue: "Unable to update report status." }) });
    }
  }
  const filteredUsers = users.filter(user => {
    const search = userSearch.toLowerCase();
    const matchesSearch = user.username?.toLowerCase().includes(search) || user.name?.toLowerCase().includes(search) || user.email?.toLowerCase().includes(search);
    const matchesRole = userRoleFilter === "all" || user.role === userRoleFilter;
    return matchesSearch && matchesRole;
  });
  const filteredServices = services.filter(service => {
    const search = serviceSearch.toLowerCase();
    return service.title?.toLowerCase().includes(search) || service.freelancer?.name?.toLowerCase().includes(search) || service.freelancer?.username?.toLowerCase().includes(search);
  });
  const orderStatuses = [...new Set(orders.map(order => order.status).filter(Boolean))];
  const filteredOrders = orders.filter(order => {
    const search = orderSearch.toLowerCase();
    const matchesSearch = order.service?.title?.toLowerCase().includes(search) || order.buyer?.name?.toLowerCase().includes(search) || order.buyer?.username?.toLowerCase().includes(search) || order.seller?.name?.toLowerCase().includes(search) || order.seller?.username?.toLowerCase().includes(search);
    const matchesStatus = orderStatusFilter === "all" || order.status === orderStatusFilter;
    return matchesSearch && matchesStatus;
  });
  const filteredReviews = reviews.filter(review => {
    const search = reviewSearch.toLowerCase();
    const matchesSearch = review.reviewer?.name?.toLowerCase().includes(search) || review.reviewer?.username?.toLowerCase().includes(search) || review.service?.title?.toLowerCase().includes(search) || review.comment?.toLowerCase().includes(search);
    const matchesRating = reviewRatingFilter === "all" || review.rating === Number(reviewRatingFilter);
    return matchesSearch && matchesRating;
  });
  if (loading) return <PageLoader message={t("adminDashboard.loadingAdminDashboard")} />;
  if (error) return <p>{error}</p>;
  return <main className="admin-page">
      <header className="admin-header"><div><span className="section-label">{t("adminDashboard.injazOperations")}</span><h1>{t("adminDashboard.adminDashboard")}</h1><p>{t("adminDashboard.manageMarketplaceActivityFromOneClearWorkspace")}</p></div></header>

      {message.text && <div className={`admin-message ${message.type}`} role="status">
          <p>{message.text}</p>

          <button type="button" onClick={() => setMessage({
        type: "",
        text: ""
      })}>{t("adminDashboard.close")}</button>
        </div>}

      <AdminOverview stats={stats} />

      <nav className="admin-tabs" aria-label={t("adminDashboard.adminSections")}>
        <button type="button" className={activeSection === "overview" ? "active" : ""} aria-pressed={activeSection === "overview"} onClick={() => setActiveSection("overview")}>{t("adminDashboard.overview")}</button>

        <button type="button" className={activeSection === "users" ? "active" : ""} aria-pressed={activeSection === "users"} onClick={() => setActiveSection("users")}>{t("adminDashboard.users")}</button>

        <button type="button" className={activeSection === "services" ? "active" : ""} aria-pressed={activeSection === "services"} onClick={() => setActiveSection("services")}>{t("adminDashboard.services")}</button>

        <button type="button" className={activeSection === "orders" ? "active" : ""} aria-pressed={activeSection === "orders"} onClick={() => setActiveSection("orders")}>{t("adminDashboard.orders")}</button>

        <button type="button" className={activeSection === "reviews" ? "active" : ""} aria-pressed={activeSection === "reviews"} onClick={() => setActiveSection("reviews")}>{t("adminDashboard.reviews")}</button>
        <button type="button" className={activeSection === "reports" ? "active" : ""} aria-pressed={activeSection === "reports"} onClick={() => setActiveSection("reports")}>{t("adminReports.title", { defaultValue: "Reports" })}{reports.some(report => report.status === "OPEN") ? ` (${reports.filter(report => report.status === "OPEN").length})` : ""}</button>
      </nav>

      <DeleteConfirm deleteConfirm={deleteConfirm} handleConfirmDelete={handleConfirmDelete} setDeleteConfirm={setDeleteConfirm} />

      {activeSection === "overview" && <section className="admin-welcome-panel"><h2>{t("adminDashboard.operationsCenter")}</h2><p>{t("adminDashboard.selectAManagementSectionToReviewAndMaintainMarketplaceR")}</p></section>}

      {activeSection === "users" && <AdminUsers users={users} filteredUsers={filteredUsers} userSearch={userSearch} setUserSearch={setUserSearch} userRoleFilter={userRoleFilter} setUserRoleFilter={setUserRoleFilter} currentUser={currentUser} handleRoleChange={handleRoleChange} setDeleteConfirm={setDeleteConfirm} />}

      {activeSection === "services" && <AdminServices services={services} filteredServices={filteredServices} serviceSearch={serviceSearch} setServiceSearch={setServiceSearch} setDeleteConfirm={setDeleteConfirm} />}

      {activeSection === "orders" && <AdminOrders orders={orders} filteredOrders={filteredOrders} orderSearch={orderSearch} setOrderSearch={setOrderSearch} orderStatusFilter={orderStatusFilter} setOrderStatusFilter={setOrderStatusFilter} orderStatuses={orderStatuses} setDeleteConfirm={setDeleteConfirm} />}

      {activeSection === "reviews" && <AdminReviews reviews={reviews} filteredReviews={filteredReviews} reviewSearch={reviewSearch} setReviewSearch={setReviewSearch} reviewRatingFilter={reviewRatingFilter} setReviewRatingFilter={setReviewRatingFilter} setDeleteConfirm={setDeleteConfirm} />}
      {activeSection === "reports" && <AdminReports reports={reports} onStatusChange={handleReportStatus} />}
    </main>;
}
export default AdminDashboard;
