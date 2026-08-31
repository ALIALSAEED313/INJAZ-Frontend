import { useEffect, useState } from "react";
import { Link } from "react-router";
import { useSettings } from "../context/SettingsContext";

function PolicyAgreementModal({ open, onAgree, onRemindLater }) {
  const { language } = useSettings();
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    if (open) {
      setChecked(false);
    }
  }, [open]);

  if (!open) return null;

  return (
    <div className="policy-modal-backdrop" role="dialog" aria-modal="true">
      <div className="policy-modal">
        <div className="policy-modal-icon">⚖️</div>
        <h2>Agree to the rules & policy</h2>
        <p>
          Before continuing, please review our terms and privacy policy and agree to follow them.
        </p>

        <div className="policy-modal-links">
          <Link to="/terms" onClick={(event) => event.stopPropagation()}>
            Terms & Conditions
          </Link>
          <Link to="/privacy" onClick={(event) => event.stopPropagation()}>
            Privacy Policy
          </Link>
        </div>

        <label className="policy-check-row">
          <input
            type="checkbox"
            checked={checked}
            onChange={(event) => setChecked(event.target.checked)}
          />
          <span>
            I agree to the terms and policy and will comply with them.
          </span>
        </label>

        <div className="policy-modal-actions">
          <button
            type="button"
            className="primary-btn"
            onClick={onAgree}
            disabled={!checked}
          >
            I Agree
          </button>
          <button
            type="button"
            className="secondary-btn"
            onClick={onRemindLater}
          >
            Remind me later
          </button>
        </div>
      </div>
    </div>
  );
}

export default PolicyAgreementModal;
