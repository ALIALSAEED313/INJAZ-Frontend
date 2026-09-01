import { useTranslation } from "react-i18next";
import { useEffect, useMemo, useState } from "react";
import { useNavigate, Link } from "react-router";
import { useAuth } from "../context/AuthContext";
import { signIn, signUp } from "../services/authService";
const roleOptions = [{
  value: "seller",
  titleKey: "roleFreelancer",
  descriptionKey: "roleFreelancerDesc",
  icon: "01"
}, {
  value: "buyer",
  titleKey: "roleClient",
  descriptionKey: "roleClientDesc",
  icon: "02"
}];
function AuthModal({
  isOpen,
  onClose,
  initialMode = "sign-in"
}) {
  const navigate = useNavigate();
  const {
    setUser
  } = useAuth();
  const {
    t
  } = useTranslation();
  const [mode, setMode] = useState(initialMode);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [selectedRole, setSelectedRole] = useState("seller");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");
  const [errors, setErrors] = useState({});
  const [formData, setFormData] = useState({
    identifier: "",
    username: "",
    email: "",
    password: "",
    confirmPassword: ""
  });
  useEffect(() => {
    if (!isOpen) return;
    const handleEsc = event => {
      if (event.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleEsc);
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handleEsc);
      document.body.style.overflow = originalOverflow;
    };
  }, [isOpen, onClose]);
  const passwordStrength = useMemo(() => {
    const password = formData.password;
    if (!password) return {
      label: t("authModal.empty"),
      score: 0
    };
    let score = 0;
    if (password.length >= 8) score += 1;
    if (/[A-Z]/.test(password)) score += 1;
    if (/[0-9]/.test(password)) score += 1;
    if (/[^A-Za-z0-9]/.test(password)) score += 1;
    if (score <= 1) return {
      label: t("authModal.weak"),
      score
    };
    if (score === 2) return {
      label: t("authModal.fair"),
      score
    };
    if (score === 3) return {
      label: t("authModal.good"),
      score
    };
    return {
      label: t("authModal.strong"),
      score
    };
  }, [formData.password, t]);
  if (!isOpen) return null;
  function handleChange(event) {
    setFormData(previous => ({
      ...previous,
      [event.target.name]: event.target.value
    }));
    setErrors(previous => ({
      ...previous,
      [event.target.name]: ""
    }));
    setSuccess("");
  }
  function validateLogin() {
    const nextErrors = {};
    if (!formData.identifier.trim()) {
      nextErrors.identifier = t("authModal.pleaseEnterYourUsernameOrEmail");
    }
    if (!formData.password) {
      nextErrors.password = t("authModal.pleaseEnterYourPassword");
    }
    return nextErrors;
  }
  function validateSignup() {
    const nextErrors = {};
    if (!formData.username.trim()) {
      nextErrors.username = t("authModal.usernameIsRequired");
    }
    if (!formData.email.trim()) {
      nextErrors.email = t("authModal.emailIsRequired");
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      nextErrors.email = t("authModal.pleaseEnterAValidEmail");
    }
    if (!formData.password) {
      nextErrors.password = t("authModal.passwordIsRequired");
    } else if (formData.password.length < 6) {
      nextErrors.password = t("authModal.passwordMustBeAtLeast6Characters");
    }
    if (!formData.confirmPassword) {
      nextErrors.confirmPassword = t("authModal.confirmPasswordIsRequired");
    } else if (formData.confirmPassword !== formData.password) {
      nextErrors.confirmPassword = t("authModal.passwordsDoNotMatch");
    }
    return nextErrors;
  }
  async function handleLoginSubmit(event) {
    event.preventDefault();
    const nextErrors = validateLogin();
    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      return;
    }
    setLoading(true);
    setErrors({});
    setSuccess("");
    try {
      const payload = {
        username: formData.identifier,
        email: formData.identifier,
        password: formData.password
      };
      const signedInUser = await signIn(payload);
      setUser(signedInUser);
      setSuccess(t("authModal.loginSuccessful"));
      onClose();
      navigate("/dashboard");
    } catch (error) {
      setErrors({
        submit: error?.response?.data?.message || t("authModal.signInFailedPleaseTryAgain")
      });
    } finally {
      setLoading(false);
    }
  }
  async function handleSignupSubmit(event) {
    event.preventDefault();
    const nextErrors = validateSignup();
    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      return;
    }
    setLoading(true);
    setErrors({});
    setSuccess("");
    try {
      await signUp({
        username: formData.username,
        email: formData.email,
        password: formData.password,
        passwordConf: formData.confirmPassword,
        isSeller: selectedRole === "seller"
      });
      setSuccess(t("authModal.accountCreatedSuccessfullyYouCanSignIn"));
      setMode("sign-in");
      setFormData({
        identifier: formData.email,
        username: "",
        email: "",
        password: "",
        confirmPassword: ""
      });
    } catch (error) {
      setErrors({
        submit: error?.response?.data?.message || t("authModal.unableToCreateAccount")
      });
    } finally {
      setLoading(false);
    }
  }
  function handleBackdropClick(event) {
    if (event.target === event.currentTarget) onClose();
  }
  const formTitle = mode === "sign-in" ? t("authModal.welcomeBack") : t("authModal.createYourAccount");
  const subtitle = mode === "sign-in" ? t("authModal.signInToContinueToINJAZ") : t("authModal.joinINJAZAndTurnYourSkillsInto");
  return <div className="auth-modal-backdrop" onClick={handleBackdropClick}>
      <div className="auth-modal-card" role="dialog" aria-modal="true">
        <button type="button" className="auth-modal-close" onClick={onClose} aria-label={t("common.close")}>

          ×
        </button>

        <div className="auth-modal-inner">
          <div className="auth-modal-visual">
            <span className="auth-modal-badge">{t("authModal.injaz")}</span>
            <h2>{formTitle}</h2>
            <p>{subtitle}</p>
            <div className="auth-modal-points">
              <span>
                {t("authModal.fastMatching")}
              </span>
              <span>
                {t("authModal.securePayments")}
              </span>
              <span>
                {t("authModal.directChat")}
              </span>
            </div>
          </div>

          <div className="auth-modal-panel">
            {mode === "sign-in" ? <form onSubmit={handleLoginSubmit} className="auth-modal-form" noValidate>

                <h3>{t("authModal.signIn")}</h3>

                <label htmlFor="auth-identifier">
                  {t("authModal.emailOrUsername")}
                </label>
                <input id="auth-identifier" type="text" name="identifier" value={formData.identifier} onChange={handleChange} placeholder={t("authModal.enterYourEmailOrUsername")} />

                {errors.identifier && <span className="field-error">{errors.identifier}</span>}

                <label htmlFor="auth-password">
                  {t("authModal.password")}
                </label>
                <div className="password-field">
                  <input id="auth-password" type={showPassword ? "text" : "password"} name="password" value={formData.password} onChange={handleChange} placeholder={t("authModal.enterYourPassword")} />

                  <button type="button" className="password-toggle" onClick={() => setShowPassword(prev => !prev)}>

                    {showPassword ? t("authModal.hide") : t("authModal.show")}
                  </button>
                </div>
                {errors.password && <span className="field-error">{errors.password}</span>}

                <div className="auth-inline-row">
                  <label className="remember-row">
                    <input type="checkbox" />
                    <span>{t("authModal.rememberMe")}</span>
                  </label>

                  <Link to="/forgot-password" className="link-button" onClick={onClose}>

                    {t("authModal.forgotPassword")}
                  </Link>
                </div>

                {errors.submit && <div className="form-alert form-alert-error">
                    {errors.submit}
                  </div>}
                {success && <div className="form-alert form-alert-success">{success}</div>}

                <button type="submit" className="primary-cta" disabled={loading}>

                  {loading ? t("authModal.signingIn") : t("authModal.signIn")}
                </button>

                <p className="auth-switch-copy">
                  {t("authModal.donTHaveAnAccount")}{" "}
                  <button type="button" className="link-button" onClick={() => setMode("sign-up")}>

                    {t("authModal.createAccount")}
                  </button>
                </p>
              </form> : <form onSubmit={handleSignupSubmit} className="auth-modal-form" noValidate>

                <h3>{t("authModal.createAccount")}</h3>

                <label htmlFor="auth-username">
                  {t("authModal.username")}
                </label>
                <input id="auth-username" type="text" name="username" value={formData.username} onChange={handleChange} placeholder={t("authModal.chooseAUsername")} />

                {errors.username && <span className="field-error">{errors.username}</span>}

                <label htmlFor="auth-email">
                  {t("authModal.email")}
                </label>
                <input id="auth-email" type="email" name="email" value={formData.email} onChange={handleChange} placeholder={t("authModal.enterYourEmail")} />

                {errors.email && <span className="field-error">{errors.email}</span>}

                <div className="role-selection">
                  {roleOptions.map(role => <button key={role.value} type="button" className={`role-card ${selectedRole === role.value ? "selected" : ""}`} aria-pressed={selectedRole === role.value} onClick={() => setSelectedRole(role.value)}>

                      <span className="role-icon">{role.icon}</span>
                      <strong>{t(role.titleKey)}</strong>
                      <small>{t(role.descriptionKey)}</small>
                    </button>)}
                </div>

                <label htmlFor="auth-signup-password">
                  {t("authModal.password")}
                </label>
                <div className="password-field">
                  <input id="auth-signup-password" type={showPassword ? "text" : "password"} name="password" value={formData.password} onChange={handleChange} placeholder={t("authModal.createAPassword")} />

                  <button type="button" className="password-toggle" onClick={() => setShowPassword(prev => !prev)}>

                    {showPassword ? t("authModal.hide") : t("authModal.show")}
                  </button>
                </div>
                {errors.password && <span className="field-error">{errors.password}</span>}

                <div className="password-strength">
                  <span>
                    {t("authModal.passwordStrength")}
                  </span>
                  <strong>{passwordStrength.label}</strong>
                </div>
                <div className="strength-bar">
                  <span style={{
                width: `${passwordStrength.score / 4 * 100}%`
              }} />

                </div>

                <label htmlFor="auth-confirm-password">
                  {t("authModal.confirmPassword")}
                </label>
                <div className="password-field">
                  <input id="auth-confirm-password" type={showConfirmPassword ? "text" : "password"} name="confirmPassword" value={formData.confirmPassword} onChange={handleChange} placeholder={t("authModal.reEnterYourPassword")} />

                  <button type="button" className="password-toggle" onClick={() => setShowConfirmPassword(prev => !prev)}>

                    {showConfirmPassword ? t("authModal.hide") : t("authModal.show")}
                  </button>
                </div>
                {errors.confirmPassword && <span className="field-error">{errors.confirmPassword}</span>}

                {errors.submit && <div className="form-alert form-alert-error">
                    {errors.submit}
                  </div>}
                {success && <div className="form-alert form-alert-success">{success}</div>}

                <button type="submit" className="primary-cta" disabled={loading}>

                  {loading ? t("authModal.creatingAccount") : t("authModal.createAccount")}
                </button>

                <p className="auth-switch-copy">
                  {t("authModal.alreadyHaveAnAccount")}{" "}
                  <button type="button" className="link-button" onClick={() => setMode("sign-in")}>

                    {t("authModal.signIn")}
                  </button>
                </p>
              </form>}
          </div>
        </div>
      </div>
    </div>;
}
export default AuthModal;
