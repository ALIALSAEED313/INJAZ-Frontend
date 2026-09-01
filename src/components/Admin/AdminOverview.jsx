import { useTranslation } from "react-i18next";
function AdminOverview({
  stats
}) {
  const {
    t
  } = useTranslation();
  const cards = [["Total users", stats?.users ?? 0], ["Total services", stats?.services ?? 0], ["Total orders", stats?.orders ?? 0], ["Total reviews", stats?.reviews ?? 0]];
  return <section className="admin-overview" aria-labelledby="statistics-title"><div className="admin-section-heading"><div><h2 id="statistics-title">{t("adminOverview.marketplaceOverview")}</h2><p>{t("adminOverview.aCurrentSnapshotOfActivityAcrossInjaz")}</p></div></div><div className="admin-stat-grid">{cards.map(([label, value]) => <article className="admin-stat-card" key={label}><span>{label}</span><strong>{value}</strong></article>)}</div>{stats?.sellers !== undefined && <p className="admin-supporting-stat"><strong>{stats.sellers}</strong>{t("adminOverview.registeredFreelancers")}</p>}</section>;
}
export default AdminOverview;
