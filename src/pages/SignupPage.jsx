import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router";
import { signUp } from "../services/authService";
import CatMascot from "../components/CatMascot";
import { getCurrentAgreement } from "../services/agreementService";
function Signup() {
  const {
    t
  } = useTranslation();
  const navigate = useNavigate();
  const [error, setError] = useState("");
  const [activeField, setActiveField] = useState("");
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    passwordConf: "",
    accountType: "buyer"
  });
  const [submitting, setSubmitting] = useState(false);
  const [agreement, setAgreement] = useState(null);
  const [agreementAccepted, setAgreementAccepted] = useState(false);
  useEffect(() => { getCurrentAgreement().then(setAgreement).catch(() => setAgreement(null)); }, []);
  const {
    username,
    email,
    password,
    passwordConf,
    accountType
  } = formData;
  const catMode = activeField === "password" ? "password" : activeField ? "focus" : "idle";
  function handleChange(event) {
    setError("");
    setFormData({
      ...formData,
      [event.target.name]: event.target.value
    });
  }
  function handleFieldFocus(fieldName) {
    setActiveField(fieldName);
  }
  function handleFieldBlur() {
    setActiveField("");
  }
  async function handleSubmit(event) {
    event.preventDefault();
    try {
      setSubmitting(true);
      await signUp({
        username,
        email,
        password,
        passwordConf,
        isSeller: accountType === "seller"
        , agreementId: agreement?._id
        , agreementAccepted: agreement ? agreementAccepted : undefined
      });
      navigate("/sign-in");
    } catch (err) {
      setError(err.response?.data?.message || t("signup.signUpFailed"));
      setSubmitting(false);
    }
  }
  function isFormInvalid() {
    return !(username && email && password && password === passwordConf && (!agreement || agreementAccepted));
  }
  return <main className="auth-page">
      <div className="auth-shell auth-shell-signup">
        <div className="auth-visual-panel">
          <CatMascot mode={catMode} />
          <span className="auth-kicker">{t("common.createAccount")}</span>
          <h1>{t("common.joinFreelanceHiring")}</h1>
          <p>
            {t("signup.startBuyingOrSellingServicesWithA")}
          </p>
          <ul className="auth-feature-list">
            <li>{t("common.buildProfile")}</li>
            <li>{t("common.launchServices")}</li>
            <li>{t("common.everythingDashboard")}</li>
          </ul>
        </div>

        <div className="auth-form-panel">
          <h2>{t("common.signUp")}</h2>
          <p className="error">{error}</p>

          <form onSubmit={handleSubmit} className="auth-form">
            <div>
              <label htmlFor="username">{t("common.username")}</label>
              <input type="text" id="username" value={username} name="username" onChange={handleChange} onFocus={() => handleFieldFocus("username")} onBlur={handleFieldBlur} required />

            </div>

            <div>
              <label htmlFor="email">{t("common.email")}</label>
              <input type="email" id="email" value={email} name="email" onChange={handleChange} onFocus={() => handleFieldFocus("email")} onBlur={handleFieldBlur} required />

            </div>

            <div>
              <label htmlFor="accountType">{t("common.iAmJoiningAs")}</label>
              <select id="accountType" name="accountType" value={accountType} onChange={handleChange} required>

                <option value="buyer">{t("common.buyer")}</option>
                <option value="seller">{t("common.seller")}</option>
              </select>
            </div>

            <div>
              <label htmlFor="password">{t("common.password")}</label>
              <input type="password" id="password" value={password} name="password" onChange={handleChange} onFocus={() => handleFieldFocus("password")} onBlur={handleFieldBlur} required />

            </div>

            <div>
              <label htmlFor="confirm">{t("common.confirmPassword")}</label>
              <input type="password" id="confirm" value={passwordConf} name="passwordConf" onChange={handleChange} onFocus={() => handleFieldFocus("password")} onBlur={handleFieldBlur} required />

            </div>

            <div className="auth-actions">
              <button type="submit" disabled={isFormInvalid() || submitting}>
                {submitting ? t("common.signingUp") : t("common.signUp")}
              </button>

              <button type="button" onClick={() => navigate("/")}>
                {t("common.cancel")}
              </button>
            </div>
            {agreement && <label className="agreement-check"><input type="checkbox" checked={agreementAccepted} onChange={e => setAgreementAccepted(e.target.checked)} required /> I have read and agree to the <a href="/legal-agreements" target="_blank" rel="noreferrer">Injaz Buyer & Seller Agreement</a> (version {agreement.version}).</label>}
          </form>
        </div>
      </div>
    </main>;
}
export default Signup;
