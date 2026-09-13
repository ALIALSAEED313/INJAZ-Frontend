import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { acceptAgreement, getAgreementStatus } from "../services/agreementService";
import { useAuth } from "../context/AuthContext";
import { formatEffectiveDate } from "./AgreementDocument";

export default function AgreementGate() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [status, setStatus] = useState(null);
  const [scrolledToEnd, setScrolledToEnd] = useState(false);
  const [accepted, setAccepted] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  useEffect(() => {
    setStatus(null);
    setScrolledToEnd(false);
    setAccepted(false);
    setError("");
    if (!user || user.role === "admin") return;
    let active = true;
    getAgreementStatus().then(data => { if (active) setStatus(data); }).catch(() => { if (active) setStatus(null); });
    return () => { active = false; };
  }, [user]);
  if (!status?.requiresAcceptance) return null;
  const { agreement } = status;
  async function accept() {
    setBusy(true);
    setError("");
    try {
      await acceptAgreement(agreement._id);
      setStatus({ ...status, requiresAcceptance: false });
    } catch (err) {
      setError(err.response?.data?.message || t("agreementGate.acceptFailed", { defaultValue: "Unable to record acceptance. Please try again." }));
    } finally {
      setBusy(false);
    }
  }
  return <div className="agreement-overlay" role="dialog" aria-modal="true" aria-labelledby="agreement-gate-title">
    <section className="agreement-modal">
      <p className="section-label">{t("agreementGate.actionRequired", { defaultValue: "Legal · action required" })}</p>
      <h1 id="agreement-gate-title">{t("agreementGate.title", { defaultValue: "Buyer & Seller Agreement" })}</h1>
      <p className="legal-meta">{t("agreementGate.version", { defaultValue: "Version" })} {agreement.version}{agreement.effectiveDate ? ` · ${t("agreementGate.effective", { defaultValue: "Effective" })} ${formatEffectiveDate(agreement.effectiveDate)}` : ""}</p>
      <div className="agreement-content" tabIndex={0} role="region" aria-label={t("agreementGate.fullAgreement", { defaultValue: "Full agreement text" })} onScroll={e => { const el = e.currentTarget; if (el.scrollTop + el.clientHeight >= el.scrollHeight - 8) setScrolledToEnd(true); }}>
        <pre>{agreement.content}</pre>
      </div>
      <label className="agreement-check"><input type="checkbox" checked={accepted} disabled={!scrolledToEnd} onChange={e => setAccepted(e.target.checked)} /> {t("agreementGate.iHaveReadAndAgree", { defaultValue: "I have read and agree to this agreement." })}</label>
      {!scrolledToEnd && <small>{t("agreementGate.scrollToEnable", { defaultValue: "Scroll through the complete agreement to enable acceptance." })}</small>}
      {error && <p className="error">{error}</p>}
      <button className="primary-btn" disabled={!scrolledToEnd || !accepted || busy} onClick={accept}>{busy ? t("agreementGate.saving", { defaultValue: "Saving…" }) : t("agreementGate.accept", { defaultValue: "Accept agreement" })}</button>
    </section>
  </div>;
}
