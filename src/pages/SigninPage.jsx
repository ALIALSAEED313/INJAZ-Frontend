// src/components/SignInForm/SignInForm.jsx

import { useState } from "react";
import { useNavigate } from "react-router";

import { signIn } from "../services/authService";
import { useAuth } from "../context/AuthContext";
import { useSettings } from "../context/SettingsContext";
import CatMascot from "../components/CatMascot";

const SignInForm = () => {
  const { setUser } = useAuth();
  const { t, language } = useSettings();
  const navigate = useNavigate();
  const [error, setError] = useState("");
  const [activeField, setActiveField] = useState("");
  const [formData, setFormData] = useState({
    username: "",
    password: "",
  });

  const catMode =
    activeField === "password" ? "password" : activeField ? "focus" : "idle";

  function handleChange(event) {
    setFormData({ ...formData, [event.target.name]: event.target.value });
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
      const signedInUser = await signIn(formData);

      setUser(signedInUser);

      const isFirstSignIn = !localStorage.getItem("profilePromptSeen");
      if (isFirstSignIn) {
        localStorage.setItem("profilePromptSeen", "true");
      }

      navigate("/dashboard", {
        state: { openProfileSetup: isFirstSignIn },
      });
    } catch (err) {
      console.log(`Error: ${err}`);
      setError(err?.response?.data?.message);
    }
  }

  return (
    <main className="auth-page">
      <div className="auth-shell auth-shell-signin">
        <div className="auth-visual-panel">
          <CatMascot mode={catMode} />
          <span className="auth-kicker">{t("welcomeBack")}</span>
          <h1>{t("signInWorkspace")}</h1>
          <p>
            {language === "ar"
              ? "تتبع المشاريع والرسائل والطلبات ونشاطك المستقل في مكان واحد."
              : "Track projects, messages, orders, and your freelance activity in one place."}
          </p>
          <ul className="auth-feature-list">
            <li>{t("manageActiveOrders")}</li>
            <li>{t("reviewNotifications")}</li>
            <li>{t("accessProfile")}</li>
          </ul>
        </div>

        <div className="auth-form-panel">
          <h2>{t("signIn")}</h2>
          <p className="error">{error}</p>
          <form
            autoComplete="off"
            onSubmit={handleSubmit}
            className="auth-form"
          >
            <div>
              <label htmlFor="username">{t("username")}</label>
              <input
                type="text"
                autoComplete="off"
                id="username"
                value={formData.username}
                name="username"
                onChange={handleChange}
                onFocus={() => handleFieldFocus("username")}
                onBlur={handleFieldBlur}
                required
              />
            </div>
            <div>
              <label htmlFor="password">{t("password")}</label>
              <input
                type="password"
                autoComplete="off"
                id="password"
                value={formData.password}
                name="password"
                onChange={handleChange}
                onFocus={() => handleFieldFocus("password")}
                onBlur={handleFieldBlur}
                required
              />
            </div>
            <div className="auth-actions">
              <button type="submit">{t("signIn")}</button>
              <button type="button" onClick={() => navigate("/")}>
                {t("cancel")}
              </button>
            </div>
          </form>
        </div>
      </div>
    </main>
  );
};

export default SignInForm;
