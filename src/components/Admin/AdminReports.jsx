import { useTranslation } from "react-i18next";

const TARGET_PATHS = {
  USER: report => report.targetId && `/profile/${report.targetId}`,
  SERVICE: report => report.targetId && `/services/${report.targetId}`,
};

export default function AdminReports({ reports, onStatusChange }) {
  const { t } = useTranslation();
  const targetName = report => report.target?.title || report.target?.name || report.target?.username || report.target?.comment || t("adminReports.removedTarget", { defaultValue: "Unavailable target" });

  return (
    <section className="admin-management" aria-labelledby="reports-title">
      <div className="admin-section-heading"><div><h2 id="reports-title">{t("adminReports.title", { defaultValue: "Reports" })}</h2><p>{t("adminReports.subtitle", { defaultValue: "Review marketplace safety reports without automatically removing content." })}</p></div></div>
      {!reports.length ? <div className="admin-empty">{t("adminReports.empty", { defaultValue: "No reports have been submitted." })}</div> : (
        <div className="admin-table-wrap"><table className="admin-table"><thead><tr><th>{t("adminReports.type", { defaultValue: "Type" })}</th><th>{t("adminReports.target", { defaultValue: "Target" })}</th><th>{t("adminReports.reporter", { defaultValue: "Reporter" })}</th><th>{t("adminReports.reason", { defaultValue: "Reason" })}</th><th>{t("adminReports.details", { defaultValue: "Details" })}</th><th>{t("adminReports.date", { defaultValue: "Date" })}</th><th>{t("adminReports.status", { defaultValue: "Status" })}</th><th>{t("adminReports.actions", { defaultValue: "Actions" })}</th></tr></thead><tbody>
          {reports.map(report => {
            const targetPath = TARGET_PATHS[report.targetType]?.(report);
            return <tr key={report._id}><td data-label={t("adminReports.type", { defaultValue: "Type" })}>{report.targetType}</td><td data-label={t("adminReports.target", { defaultValue: "Target" })}><strong>{targetName(report)}</strong>{targetPath && <a className="admin-target-link" href={targetPath}>{t("adminReports.view", { defaultValue: "View target" })}</a>}</td><td data-label={t("adminReports.reporter", { defaultValue: "Reporter" })}>{report.reporter?.name || report.reporter?.username || "—"}</td><td data-label={t("adminReports.reason", { defaultValue: "Reason" })}>{report.reason}</td><td data-label={t("adminReports.details", { defaultValue: "Details" })} className="admin-comment">{report.details || "—"}</td><td data-label={t("adminReports.date", { defaultValue: "Date" })}>{new Date(report.createdAt).toLocaleDateString()}</td><td data-label={t("adminReports.status", { defaultValue: "Status" })}><span className={`report-status report-status--${report.status.toLowerCase()}`}>{report.status.replace("_", " ")}</span></td><td data-label={t("adminReports.actions", { defaultValue: "Actions" })}><div className="admin-report-actions">{report.status !== "UNDER_REVIEW" && <button type="button" onClick={() => onStatusChange(report._id, "UNDER_REVIEW")}>{t("adminReports.review", { defaultValue: "Review" })}</button>}{report.status !== "RESOLVED" && <button type="button" onClick={() => onStatusChange(report._id, "RESOLVED")}>{t("adminReports.resolve", { defaultValue: "Resolve" })}</button>}{report.status !== "DISMISSED" && <button type="button" onClick={() => onStatusChange(report._id, "DISMISSED")}>{t("adminReports.dismiss", { defaultValue: "Dismiss" })}</button>}</div></td></tr>;
          })}
        </tbody></table></div>
      )}
    </section>
  );
}
