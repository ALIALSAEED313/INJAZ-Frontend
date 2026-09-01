import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router";
import { useTranslation } from "react-i18next";
import axios from "axios";
import { useAuth } from "../../context/AuthContext";
import EditProfileForm from "../../components/MyProfile/EditProfileForm";
import PageLoader from "../../components/loading-ui/Loading";
import Icon from "../../components/Icon";

const getEntityId = entity => String(entity?._id || entity || "");

function UserDashboard() {
  const {
    user,
    setUser
  } = useAuth();
  const location = useLocation();
  const {
    t
  } = useTranslation();
  const [orders, setOrders] = useState([]);
  const [myServices, setMyServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showProfileSetupModal, setShowProfileSetupModal] = useState(() => Boolean(location.state?.openProfileSetup && user));
  useEffect(() => {
    let isMounted = true;
    async function fetchData() {
      try {
        const token = localStorage.getItem("token");
        const headers = {
          Authorization: `Bearer ${token}`
        };
        const ordersRes = await axios.get("http://localhost:3000/orders/my-orders", {
          headers
        });
        if (!isMounted) return;
        setOrders(ordersRes.data.orders || []);
        if (user?.isSeller) {
          const servicesRes = await axios.get("http://localhost:3000/services/my-services", {
            headers
          });
          if (!isMounted) return;
          setMyServices(servicesRes.data || []);
        }
        setLoading(false);
      } catch (err) {
        console.error(err);
        if (!isMounted) return;
        setError(t("userDashboard.failedToFetchDashboardData"));
        setLoading(false);
      }
    }
    fetchData();
    return () => {
      isMounted = false;
    };
  }, [user?.isSeller, t]);
  const currentUserId = String(user?._id || user?.id || localStorage.getItem("userId") || "");
  const myPurchases = orders.filter(order => getEntityId(order.buyer) === currentUserId);
  const ordersReceived = orders.filter(order => getEntityId(order.seller) === currentUserId);
  const pendingOrdersForSeller = ordersReceived.filter(order => order.status === "Requested" || order.status === "Pending");

  const renderOrderSection = ({
    id,
    title,
    subtitle,
    items,
    counterpart,
    emptyMessage,
    showBrowseAction = false
  }) => <section className="dashboard-panel dashboard-orders-panel" aria-labelledby={`${id}-title`}>
      <div className="dashboard-order-heading">
        <div>
          <div className="dashboard-order-title-row">
            <h2 id={`${id}-title`}>{title}</h2>
            <span className="dashboard-order-count">{t("userDashboard.orderCount", { count: items.length })}</span>
          </div>
          <p>{subtitle}</p>
        </div>
      </div>

      {items.length === 0 ? <div className="empty-card dashboard-order-empty">
          <p>{emptyMessage}</p>
          {showBrowseAction && <Link to="/services" className="secondary-btn dashboard-empty-action">{t("common.browseServices")}</Link>}
        </div> : <div className="table-container">
          <table className="orders-table">
            <thead>
              <tr>
                <th>{t("common.orderId")}</th>
                <th>{t("common.service")}</th>
                <th>{counterpart === "seller" ? t("common.seller") : t("common.buyer")}</th>
                <th>{t("common.price")}</th>
                <th>{t("common.status")}</th>
                <th>{t("common.action")}</th>
              </tr>
            </thead>
            <tbody>
              {items.map(order => {
            const isIncomingNewOrder = counterpart === "buyer" && (order.status === "Requested" || order.status === "Pending");
            const counterpartUser = counterpart === "seller" ? order.seller : order.buyer;
            const counterpartName = counterpartUser?.username || counterpartUser?.name || counterpartUser?.email || t("userDashboard.unknownUser");
            return <tr key={order._id} className="order-row">
                    <td className="order-id" data-label={t("common.orderId")}>
                      <span dir="ltr">{String(order._id).slice(0, 8)}...</span>
                      {isIncomingNewOrder && <span className="order-tag">{t("userDashboard.new")}</span>}
                    </td>
                    <td className="order-service" data-label={t("common.service")}>{order.service?.title || t("userDashboard.unknownService")}</td>
                    <td className="order-counterpart" data-label={counterpart === "seller" ? t("common.seller") : t("common.buyer")}>{counterpartName}</td>
                    <td className="order-price" data-label={t("common.price")}><span dir="ltr">{order.price} {t("userDashboard.bhd")}</span></td>
                    <td className="order-status-cell" data-label={t("common.status")}><span className="order-status">{order.status}</span></td>
                    <td className="order-action" data-label={t("common.action")}><Link to={`/workspace/${order._id}`} className="workspace-link">{t("common.workspace")}</Link></td>
                  </tr>;
          })}
            </tbody>
          </table>
        </div>}
    </section>;
  if (loading) return <PageLoader message={t("userDashboard.loading")} />;
  if (error) return <div className="error-state">{error}</div>;
  return <main className="dashboard-page">
      {showProfileSetupModal && user && <EditProfileForm profile={user} onClose={() => setShowProfileSetupModal(false)} onUpdated={updatedProfile => {
      setUser(updatedProfile);
      setShowProfileSetupModal(false);
    }} />}

      <div className="dashboard-shell">
        <header className="dashboard-header">
          <div>
            <span className="section-label">{t("common.dashboard")}</span>
            <h1 className="dashboard-title">
              {t("common.welcomeBackUser")}, {user?.username || t("userDashboard.creator")}
            </h1>
          </div>
          <div className="dashboard-header-actions button-group">
            {user?.isSeller && <Link to="/payment-details" className="secondary-btn dashboard-link-btn">{t("userDashboard.paymentDetails")}</Link>}
            <Link to="/services" className="primary-btn dashboard-link-btn">
              {t("common.exploreServices")}
            </Link>
          </div>
        </header>

        {user?.isSeller && pendingOrdersForSeller.length > 0 && <div className="alert-banner">
            <Icon name="bell" size={20} />
            <span>{t("userDashboard.youHave")}{" "}
              <strong>
                {pendingOrdersForSeller.length}{t("userDashboard.newOrderRequestS")}</strong>{" "}{t("userDashboard.waitingForYourActionInTheWorkspace")}</span>
          </div>}

        <section className="dashboard-summary">
          <div className="summary-card">
            <span className="summary-label">{t("common.totalOrders")}</span>
            <strong className="summary-value">{orders.length}</strong>
          </div>
          <div className="summary-card">
            <span className="summary-label">{t("common.openRequests")}</span>
            <strong className="summary-value">
              {pendingOrdersForSeller.length}
            </strong>
          </div>
          <div className="summary-card">
            <span className="summary-label">{t("common.accountType")}</span>
            <strong className="summary-value">
              {user?.isSeller ? t("common.seller") : t("common.buyer")}
            </strong>
          </div>
        </section>

        <div className="dashboard-order-sections">
          {renderOrderSection({
          id: "my-purchases",
          title: t("userDashboard.myPurchases"),
          subtitle: t("userDashboard.myPurchasesSubtitle"),
          items: myPurchases,
          counterpart: "seller",
          emptyMessage: t("userDashboard.noPurchases"),
          showBrowseAction: true
        })}
          {renderOrderSection({
          id: "orders-received",
          title: t("userDashboard.ordersReceived"),
          subtitle: t("userDashboard.ordersReceivedSubtitle"),
          items: ordersReceived,
          counterpart: "buyer",
          emptyMessage: t("userDashboard.noOrdersReceived")
        })}
        </div>

        {user?.isSeller && <section className="dashboard-panel my-services-section">
            <div className="section-header-row">
              <h2>{t("common.myOfferedServices")}</h2>
              <Link to="/services/create" className="primary-btn">
                {t("common.addNewService")}
              </Link>
            </div>

            {myServices.length === 0 ? <div className="empty-card">
                <p>{t("common.noServicesCreated")}</p>
              </div> : <div className="service-portfolio-grid">
                {myServices.map(service => <div key={service._id} className="service-mini-card">
                    <h3>{service.title}</h3>
                    {service.category && <p className="service-category-pill">
                        {service.category}
                      </p>}
                    <p className="service-price-line">
                      {service.price}{t("userDashboard.bhd")}{" "}
                      <span>({service.deliveryTime}{t("userDashboard.dayDelivery")}</span>
                    </p>
                    <div className="service-actions">
                      <Link to={`/services/${service._id}`} className="text-link">{t("userDashboard.view")}</Link>
                      <Link to={`/services/${service._id}/edit`} className="text-link muted-link">{t("userDashboard.edit")}</Link>
                    </div>
                  </div>)}
              </div>}
          </section>}
      </div>
    </main>;
}
export default UserDashboard;
