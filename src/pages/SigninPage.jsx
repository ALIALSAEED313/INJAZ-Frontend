// src/components/SignInForm/SignInForm.jsx

import { useState } from "react";
import { useNavigate, Link } from "react-router";
import { signIn } from "../services/authService";
import { useAuth } from "../context/AuthContext";
import CatMascot from "../components/CatMascot";
import Icon from "../components/Icon";
const SignInForm = () => {
  const {
    setUser
  } = useAuth();
  const {
    t
  } = useTranslation();
  const navigate = useNavigate();
  const [error, setError] = useState("");
  const [activeField, setActiveField] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    username: "",
    password: ""
  });
  const catMode = activeField === "password" ? showPassword ? "peek" : "password" : activeField ? "focus" : "idle";
  function handleChange(event) {
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
    setError("");
    setSubmitting(true);
    try {
      const signedInUser = await signIn(formData);
      setUser(signedInUser);
      const isFirstSignIn = !localStorage.getItem("profilePromptSeen");
      if (isFirstSignIn) {
        localStorage.setItem("profilePromptSeen", "true");
      }
      navigate("/dashboard", {
        state: {
          openProfileSetup: isFirstSignIn
        }
      });
    } catch (err) {
      console.log(`Error: ${err}`);
      setError(err?.response?.data?.message);
    } finally {
      setSubmitting(false);
    }
  }
  return <main className="auth-page">
      <div className="auth-shell auth-shell-signin">
        <div className="auth-visual-panel">
          <CatMascot mode={catMode} />
          <span className="auth-kicker">{t("common.welcomeBack")}</span>
          <h1>{t("common.signInWorkspace")}</h1>
          <p>
            {t("signin.trackProjectsMessagesOrdersAndYourFreelance")}
          </p>
          <ul className="auth-feature-list">
            <li>{t("common.manageActiveOrders")}</li>
            <li>{t("common.reviewNotifications")}</li>
            <li>{t("common.accessProfile")}</li>
          </ul>
        </div>

        <div className="auth-form-panel">
          <h2>{t("common.signIn")}</h2>
          {error && <p className="error" role="alert">{error}</p>}
          <form autoComplete="on" onSubmit={handleSubmit} className="auth-form">

            <div>
              <label htmlFor="username">{t("common.username")}</label>
              <input type="text" autoComplete="username" id="username" value={formData.username} name="username" onChange={handleChange} onFocus={() => handleFieldFocus("username")} onBlur={handleFieldBlur} required />

            </div>
            <div>
              <label htmlFor="password">{t("common.password")}</label>
              <div className="password-input-wrap">
                <input type={showPassword ? "text" : "password"} autoComplete="current-password" id="password" value={formData.password} name="password" onChange={handleChange} onFocus={() => handleFieldFocus("password")} onBlur={handleFieldBlur} required />

                <button type="button" className="password-visibility" onMouseDown={event => event.preventDefault()} onClick={() => setShowPassword(value => !value)} aria-label={showPassword ? t("signin.hidePassword") : t("signin.showPassword")} aria-pressed={showPassword}>
                  <Icon name={showPassword ? "eyeOff" : "eye"} />
                </button>
              </div>

              <div className="auth-forgot-row">
                <Link to="/forgot-password" className="auth-forgot-link">

                  {t("signin.forgotPassword")}
                </Link>
              </div>
            </div>

            <div className="auth-actions">
              <button type="submit" disabled={submitting}>{submitting ? t("signin.signingIn") : t("common.signIn")}</button>
              <button type="button" onClick={() => navigate("/")}>
                {t("common.cancel")}
              </button>
            </div>
          </form>
        </div>
      </div>
    </main>;
};
export default SignInForm;
import { useTranslation } from "react-i18next";
