import { useTranslation } from "react-i18next";
function AdminOrders({
  orders,
  filteredOrders,
  orderSearch,
  setOrderSearch,
  orderStatusFilter,
  setOrderStatusFilter,
  orderStatuses,
  setDeleteConfirm
}) {
  const {
    t
  } = useTranslation();
  return <section className="admin-management" aria-labelledby="orders-title"><div className="admin-section-heading"><div><h2 id="orders-title">{t("adminOrders.orders")}</h2><p>{filteredOrders.length}{t("adminOrders.of")}{orders.length}{t("adminOrders.orders")}</p></div></div><div className="admin-toolbar"><label className="admin-search"><span>{t("adminOrders.searchOrders")}</span><input type="search" placeholder={t("adminOrders.serviceBuyerOrSeller")} value={orderSearch} onChange={e => setOrderSearch(e.target.value)} /></label><label><span>{t("adminOrders.status")}</span><select value={orderStatusFilter} onChange={e => setOrderStatusFilter(e.target.value)}><option value="all">{t("adminOrders.allStatuses")}</option>{orderStatuses.map(status => <option key={status} value={status}>{status}</option>)}</select></label></div>{filteredOrders.length === 0 ? <div className="admin-empty">{t("adminOrders.noOrdersMatchTheseFilters")}</div> : <div className="admin-table-wrap"><table className="admin-table"><thead><tr><th>{t("adminOrders.order")}</th><th>{t("adminOrders.service")}</th><th>{t("adminOrders.buyer")}</th><th>{t("adminOrders.seller")}</th><th>{t("adminOrders.price")}</th><th>{t("adminOrders.status")}</th><th>{t("adminOrders.actions")}</th></tr></thead><tbody>{filteredOrders.map(order => <tr key={order._id}><td data-label={t("adminOrders.order")} dir="ltr">#{String(order._id).slice(-8)}</td><td data-label={t("adminOrders.service")}><strong>{order.service?.title || t("adminOrders.unknown")}</strong></td><td data-label={t("adminOrders.buyer")}>{order.buyer?.name || order.buyer?.username || t("adminOrders.unknown")}</td><td data-label={t("adminOrders.seller")}>{order.seller?.name || order.seller?.username || t("adminOrders.unknown")}</td><td data-label={t("adminOrders.price")} dir="ltr">{order.price !== undefined ? `${order.price} BHD` : "—"}</td><td data-label={t("adminOrders.status")}><span className="admin-badge status">{order.status || t("adminOrders.unknown")}</span></td><td data-label={t("adminOrders.actions")}><button type="button" className="admin-danger-button" onClick={() => setDeleteConfirm({
                type: "order",
                id: order._id,
                name: order.service?.title || "this order"
              })}>{t("adminOrders.delete")}</button></td></tr>)}</tbody></table></div>}</section>;
}
export default AdminOrders;
