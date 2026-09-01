import { useTranslation } from "react-i18next";
import { useState } from "react";
import { useParams, useNavigate } from "react-router";
import api from "../services/api";
function ResetPassword() {
  const {
    t
  } = useTranslation();
  const {
    token
  } = useParams();
  const navigate = useNavigate();
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(false);
  const handleSubmit = async e => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setStatus({
        type: "error",
        text: t("resetPassword.passwordsDoNotMatch")
      });
      return;
    }
    if (newPassword.length < 6) {
      setStatus({
        type: "error",
        text: t("resetPassword.passwordTooShort")
      });
      return;
    }
    setLoading(true);
    setStatus("");
    try {
      const response = await api.post(`/auth/reset-password/${token}`, {
        newPassword
      });
      setStatus({
        type: "success",
        text: response.data.message
      });
      setTimeout(() => {
        navigate("/");
      }, 3000);
    } catch (err) {
      setStatus({
        type: "error",
        text: err.response?.data?.message || "Invalid or expired token."
      });
    } finally {
      setLoading(false);
    }
  };
  return <main className="form-container auth-recovery-page">
      <h1 className="page-title">{t("resetPassword.createNewPassword")}</h1>

      {status && <div className={`form-status ${status.type}`} role="status">
          {status.text}
        </div>}

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="newPassword">{t("resetPassword.newPassword")}</label>
          <input type="password" id="newPassword" value={newPassword} onChange={e => setNewPassword(e.target.value)} required placeholder={t("resetPassword.enterNewPassword")} />
        </div>

        <div className="form-group">
          <label htmlFor="confirmPassword">{t("resetPassword.confirmPassword")}</label>
          <input type="password" id="confirmPassword" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} required placeholder={t("resetPassword.confirmNewPassword")} />
        </div>

        <button type="submit" className="btn btn-primary full-width-control" disabled={loading || status.type === "success"}>
          {loading ? t("resetPassword.resetting") : t("resetPassword.resetPassword")}
        </button>
      </form>
    </main>;
}
export default ResetPassword;
