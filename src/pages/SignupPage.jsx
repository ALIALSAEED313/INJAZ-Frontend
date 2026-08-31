import { useState } from "react";
import { useNavigate } from "react-router";
import { signUp } from "../services/authService";
import { useSettings } from "../context/SettingsContext";
import CatMascot from "../components/CatMascot";

function Signup() {
  const { t, language } = useSettings();
  const navigate = useNavigate();
  const [error, setError] = useState("");
  const [activeField, setActiveField] = useState("");
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    passwordConf: "",
    accountType: "buyer",
  });
  const [submitting, setSubmitting] = useState(false);

  const { username, email, password, passwordConf, accountType } = formData;
  const catMode =
    activeField === "password" ? "password" : activeField ? "focus" : "idle";

  function handleChange(event) {
    setError("");
    setFormData({
      ...formData,
      [event.target.name]: event.target.value,
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
        isSeller: accountType === "seller",
      });
      navigate("/sign-in");
    } catch (err) {
      setError(err.response?.data?.message || "Sign up failed");
      setSubmitting(false);
    }
  }

  function isFormInvalid() {
    return !(username && email && password && password === passwordConf);
  }

  return (
    <main className="auth-page">
      <div className="auth-shell auth-shell-signup">
        <div className="auth-visual-panel">
          <CatMascot mode={catMode} />
          <span className="auth-kicker">{t("createAccount")}</span>
          <h1>{t("joinFreelanceHiring")}</h1>
          <p>
            {language === "ar"
              ? "ابدأ بشراء أو بيع الخدمات بتجربة سوق آمنة وسريعة."
              : "Start buying or selling services with a secure, streamlined marketplace experience."}
          </p>
          <ul className="auth-feature-list">
            <li>{t("buildProfile")}</li>
            <li>{t("launchServices")}</li>
            <li>{t("everythingDashboard")}</li>
          </ul>
        </div>

        <div className="auth-form-panel">
          <h2>{t("signUp")}</h2>
          <p className="error">{error}</p>

          <form onSubmit={handleSubmit} className="auth-form">
            <div>
              <label htmlFor="username">{t("username")}</label>
              <input
                type="text"
                id="username"
                value={username}
                name="username"
                onChange={handleChange}
                onFocus={() => handleFieldFocus("username")}
                onBlur={handleFieldBlur}
                required
              />
            </div>

            <div>
              <label htmlFor="email">{t("email")}</label>
              <input
                type="email"
                id="email"
                value={email}
                name="email"
                onChange={handleChange}
                onFocus={() => handleFieldFocus("email")}
                onBlur={handleFieldBlur}
                required
              />
            </div>

            <div>
              <label htmlFor="accountType">{t("iAmJoiningAs")}</label>
              <select
                id="accountType"
                name="accountType"
                value={accountType}
                onChange={handleChange}
                required
              >
                <option value="buyer">{t("buyer")}</option>
                <option value="seller">{t("seller")}</option>
              </select>
            </div>

            <div>
              <label htmlFor="password">{t("password")}</label>
              <input
                type="password"
                id="password"
                value={password}
                name="password"
                onChange={handleChange}
                onFocus={() => handleFieldFocus("password")}
                onBlur={handleFieldBlur}
                required
              />
            </div>

            <div>
              <label htmlFor="confirm">{t("confirmPassword")}</label>
              <input
                type="password"
                id="confirm"
                value={passwordConf}
                name="passwordConf"
                onChange={handleChange}
                onFocus={() => handleFieldFocus("password")}
                onBlur={handleFieldBlur}
                required
              />
            </div>

            <div className="auth-actions">
              <button type="submit" disabled={isFormInvalid() || submitting}>
                {submitting ? t("signingUp") : t("signUp")}
              </button>

              <button type="button" onClick={() => navigate("/")}>
                {t("cancel")}
              </button>
            </div>
          </form>
        </div>
      </div>
    </main>
  );
}

export default Signup;
