import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router";
import { useTranslation } from "react-i18next";
import { submitReport } from "../services/reportService";

const REASONS = ["SPAM", "SCAM", "HARASSMENT", "INAPPROPRIATE", "MISLEADING", "COPYRIGHT", "SUSPICIOUS", "OTHER"];

export default function ReportModal({ open, targetType, targetId, targetLabel, onClose, onSubmitted }) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const dialogRef = useRef(null);
  const [reason, setReason] = useState("SPAM");
  const [details, setDetails] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  async function handleSubmit(event) {
    event.preventDefault();
    if (!localStorage.getItem("token")) {
      onClose();
      navigate("/sign-in");
      return;
    }
    try {
      setSubmitting(true);
      setError("");
      await submitReport({ targetType, targetId, reason, details });
      setReason("SPAM");
      setDetails("");
      onSubmitted?.(t("reports.submitted", { defaultValue: "Report submitted. Our team will review it." }));
      onClose();
    } catch (requestError) {
      setError(requestError.response?.data?.message || t("reports.failed", { defaultValue: "Unable to submit this report." }));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <dialog ref={dialogRef} className="report-dialog" onCancel={onClose} onClose={() => open && onClose()}>
      <form className="report-dialog-surface" onSubmit={handleSubmit}>
        <span className="workspace-kicker">{t("reports.safety", { defaultValue: "Marketplace safety" })}</span>
        <h2>{t(`reports.title.${targetType?.toLowerCase()}`, { defaultValue: `Report ${targetLabel || "content"}` })}</h2>
        <p>{t("reports.prompt", { defaultValue: "Why are you reporting this?" })}</p>
        <label htmlFor={`report-reason-${targetId}`}>{t("reports.reason", { defaultValue: "Reason" })}</label>
        <select id={`report-reason-${targetId}`} value={reason} onChange={event => setReason(event.target.value)}>
          {REASONS.map(value => <option value={value} key={value}>{t(`reports.reasons.${value}`, { defaultValue: value.replaceAll("_", " ").toLowerCase() })}</option>)}
        </select>
        <label htmlFor={`report-details-${targetId}`}>{t("reports.details", { defaultValue: "Additional details (optional)" })}</label>
        <textarea id={`report-details-${targetId}`} maxLength={1000} value={details} onChange={event => setDetails(event.target.value)} />
        {error && <p className="field-error" role="alert">{error}</p>}
        <div className="report-dialog-actions action-group">
          <button type="button" className="secondary-btn" onClick={onClose}>{t("common.cancel", { defaultValue: "Cancel" })}</button>
          <button type="submit" className="primary-btn" disabled={submitting}>{submitting ? t("common.loading") : t("reports.submit", { defaultValue: "Submit report" })}</button>
        </div>
      </form>
    </dialog>
  );
}
