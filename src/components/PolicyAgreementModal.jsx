import { useTranslation } from "react-i18next";
import { useState } from "react";
import { Link } from "react-router";
function PolicyAgreementModal({
  open,
  onAgree,
  onRemindLater
}) {
  const {
    t
  } = useTranslation();
  const [checked, setChecked] = useState(false);
  if (!open) return null;
  return <div className="policy-modal-backdrop" role="dialog" aria-modal="true">
      <div className="policy-modal">
        <div className="policy-modal-icon" aria-hidden="true">{t("policyAgreementModal.injaz")}</div>
        <h2>{t("policyAgreementModal.agreeToTheRulesAndPolicy")}</h2>
        <p>{t("policyAgreementModal.beforeContinuingPleaseReviewOurTermsAndPrivacyPolicyAnd")}</p>

        <div className="policy-modal-links">
          <Link to="/terms" onClick={event => event.stopPropagation()}>{t("policyAgreementModal.termsAndConditions")}</Link>
          <Link to="/privacy" onClick={event => event.stopPropagation()}>{t("policyAgreementModal.privacyPolicy")}</Link>
        </div>

        <label className="policy-check-row">
          <input type="checkbox" checked={checked} onChange={event => setChecked(event.target.checked)} />
          <span>{t("policyAgreementModal.iAgreeToTheTermsAndPolicyAndWillComplyWithThem")}</span>
        </label>

        <div className="policy-modal-actions">
          <button type="button" className="primary-btn" onClick={() => {
          setChecked(false);
          onAgree();
        }} disabled={!checked}>{t("policyAgreementModal.iAgree")}</button>
          <button type="button" className="secondary-btn" onClick={() => {
          setChecked(false);
          onRemindLater();
        }}>{t("policyAgreementModal.remindMeLater")}</button>
        </div>
      </div>
    </div>;
}
export default PolicyAgreementModal;
