import { useTranslation } from "react-i18next";
function AdminServices({
  services,
  filteredServices,
  serviceSearch,
  setServiceSearch,
  setDeleteConfirm
}) {
  const {
    t
  } = useTranslation();
  return <section className="admin-management" aria-labelledby="services-title"><div className="admin-section-heading"><div><h2 id="services-title">{t("adminServices.services")}</h2><p>{filteredServices.length}{t("adminServices.of")}{services.length}{t("adminServices.services")}</p></div></div><div className="admin-toolbar"><label className="admin-search"><span>{t("adminServices.searchServices")}</span><input type="search" placeholder={t("adminServices.serviceOrFreelancer")} value={serviceSearch} onChange={e => setServiceSearch(e.target.value)} /></label></div>{filteredServices.length === 0 ? <div className="admin-empty">{t("adminServices.noServicesMatchThisSearch")}</div> : <div className="admin-table-wrap"><table className="admin-table"><thead><tr><th>{t("adminServices.service")}</th><th>{t("adminServices.seller")}</th><th>{t("adminServices.category")}</th><th>{t("adminServices.price")}</th><th>{t("adminServices.created")}</th><th>{t("adminServices.actions")}</th></tr></thead><tbody>{filteredServices.map(service => <tr key={service._id}><td data-label={t("adminServices.service")}><strong>{service.title}</strong></td><td data-label={t("adminServices.seller")}>{service.freelancer?.name || service.freelancer?.username || t("adminServices.unknown")}</td><td data-label={t("adminServices.category")}>{service.category || "—"}</td><td data-label={t("adminServices.price")} dir="ltr">{service.price}{t("adminServices.bhd")}</td><td data-label={t("adminServices.created")}>{service.createdAt ? new Date(service.createdAt).toLocaleDateString() : "—"}</td><td data-label={t("adminServices.actions")}><button type="button" className="admin-danger-button" onClick={() => setDeleteConfirm({
                type: "service",
                id: service._id,
                name: service.title
              })}>{t("adminServices.delete")}</button></td></tr>)}</tbody></table></div>}</section>;
}
export default AdminServices;
