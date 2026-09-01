import { useTranslation } from "react-i18next";
import { useState } from "react";
import { Link } from "react-router";
import api from "../services/api";
import MorphingInfinity from "../components/loading-ui/morphing-infinity";
function ForgotPassword() {
  const {
    t
  } = useTranslation();
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(false);
  const handleSubmit = async e => {
    e.preventDefault();
    setLoading(true);
    setStatus("");
    try {
      const response = await api.post("/auth/forgot-password", {
        email
      });
      setStatus({
        type: "success",
        text: response.data.message
      });
      setEmail("");
    } catch (err) {
      setStatus({
        type: "error",
        text: err.response?.data?.message || "Something went wrong. Please try again."
      });
    } finally {
      setLoading(false);
    }
  };
  return <main className="form-container auth-recovery-page auth-recovery-forgot">
      <h1 className="page-title">{t("forgotPassword.forgotPassword")}</h1>
      <p className="auth-recovery-intro">{t("forgotPassword.enterYourEmailAddressAndWeWillSendYouALinkToResetYourPa")}</p>

      <form onSubmit={handleSubmit} className="auth-recovery-form">
        <div className="auth-form-field">
          <label htmlFor="email">{t("forgotPassword.emailAddress")}</label>
          <input type="email" id="email" name="email" autoComplete="email" value={email} onChange={e => setEmail(e.target.value)} required placeholder={t("forgotPassword.youExampleCom")} aria-describedby={status ? "forgot-password-status" : undefined} />
        </div>

        {status && <div className={`form-status ${status.type}`} id="forgot-password-status" role={status.type === "error" ? "alert" : "status"}>
            {status.text}
          </div>}

        <button type="submit" className="btn btn-primary full-width-control" disabled={loading}>
          {loading ? <MorphingInfinity className="size-20" /> : t("forgotPassword.sendResetLink")}
        </button>

        <div className="auth-recovery-back">
          <Link to="/">{t("forgotPassword.backToHome")}</Link>
        </div>
      </form>
    </main>;
}
export default ForgotPassword;
