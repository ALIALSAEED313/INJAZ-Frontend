import { useEffect, useMemo, useState } from "react";
import { useNavigate, Link } from "react-router"; // 👈 تم إضافة Link هنا
import { useAuth } from "../context/AuthContext";
import { useSettings } from "../context/SettingsContext";
import { signIn, signUp } from "../services/authService";

const roleOptions = [
  {
    value: "seller",
    title: "Freelancer",
    description: "I want to offer my skills and services.",
    icon: "💼",
  },
  {
    value: "buyer",
    title: "Client",
    description: "I want to hire talented freelancers.",
    icon: "🛒",
  },
];

function AuthModal({ isOpen, onClose, initialMode = "sign-in" }) {
  const navigate = useNavigate();
  const { setUser } = useAuth();
  const { t, language } = useSettings();
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
    confirmPassword: "",
  });

  useEffect(() => {
    setMode(initialMode);
  }, [initialMode, isOpen]);

  useEffect(() => {
    if (!isOpen) return;

    const handleEsc = (event) => {
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
    if (!password)
      return { label: language === "ar" ? "غير مكتملة" : "Empty", score: 0 };
    let score = 0;
    if (password.length >= 8) score += 1;
    if (/[A-Z]/.test(password)) score += 1;
    if (/[0-9]/.test(password)) score += 1;
    if (/[^A-Za-z0-9]/.test(password)) score += 1;

    if (score <= 1)
      return { label: language === "ar" ? "ضعيفة" : "Weak", score };
    if (score === 2)
      return { label: language === "ar" ? "متوسطة" : "Fair", score };
    if (score === 3)
      return { label: language === "ar" ? "جيدة" : "Good", score };
    return { label: language === "ar" ? "قوية" : "Strong", score };
  }, [formData.password, language]);

  if (!isOpen) return null;

  function handleChange(event) {
    setFormData((previous) => ({
      ...previous,
      [event.target.name]: event.target.value,
    }));
    setErrors((previous) => ({
      ...previous,
      [event.target.name]: "",
    }));
    setSuccess("");
  }

  function validateLogin() {
    const nextErrors = {};
    if (!formData.identifier.trim()) {
      nextErrors.identifier =
        language === "ar"
          ? "يرجى إدخال اسم المستخدم أو البريد الإلكتروني"
          : "Please enter your username or email.";
    }
    if (!formData.password) {
      nextErrors.password =
        language === "ar"
          ? "يرجى إدخال كلمة المرور"
          : "Please enter your password.";
    }
    return nextErrors;
  }

  function validateSignup() {
    const nextErrors = {};
    if (!formData.username.trim()) {
      nextErrors.username =
        language === "ar" ? "اسم المستخدم مطلوب" : "Username is required.";
    }
    if (!formData.email.trim()) {
      nextErrors.email =
        language === "ar" ? "البريد الإلكتروني مطلوب" : "Email is required.";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      nextErrors.email =
        language === "ar"
          ? "صيغة البريد الإلكتروني غير صحيحة"
          : "Please enter a valid email.";
    }
    if (!formData.password) {
      nextErrors.password =
        language === "ar" ? "كلمة المرور مطلوبة" : "Password is required.";
    } else if (formData.password.length < 6) {
      nextErrors.password =
        language === "ar"
          ? "يجب أن تكون كلمة المرور 6 أحرف أو أكثر"
          : "Password must be at least 6 characters.";
    }
    if (!formData.confirmPassword) {
      nextErrors.confirmPassword =
        language === "ar"
          ? "تأكيد كلمة المرور مطلوب"
          : "Confirm password is required.";
    } else if (formData.confirmPassword !== formData.password) {
      nextErrors.confirmPassword =
        language === "ar"
          ? "كلمتا المرور غير متطابقتين"
          : "Passwords do not match.";
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
        password: formData.password,
      };
      const signedInUser = await signIn(payload);
      setUser(signedInUser);
      setSuccess(
        language === "ar" ? "تم تسجيل الدخول بنجاح" : "Login successful.",
      );
      onClose();
      navigate("/dashboard");
    } catch (error) {
      setErrors({
        submit:
          error?.response?.data?.message ||
          (language === "ar"
            ? "فشل تسجيل الدخول. حاول مرة أخرى."
            : "Sign in failed. Please try again."),
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
        isSeller: selectedRole === "seller",
      });
      setSuccess(
        language === "ar"
          ? "تم إنشاء الحساب بنجاح. يمكنك الآن تسجيل الدخول."
          : "Account created successfully. You can sign in now.",
      );
      setMode("sign-in");
      setFormData({
        identifier: formData.email,
        username: "",
        email: "",
        password: "",
        confirmPassword: "",
      });
    } catch (error) {
      setErrors({
        submit:
          error?.response?.data?.message ||
          (language === "ar"
            ? "تعذر إنشاء الحساب"
            : "Unable to create account."),
      });
    } finally {
      setLoading(false);
    }
  }

  function handleBackdropClick(event) {
    if (event.target === event.currentTarget) onClose();
  }

  const formTitle =
    mode === "sign-in"
      ? language === "ar"
        ? "مرحباً بعودتك 👋"
        : "Welcome Back 👋"
      : language === "ar"
        ? "أنشئ حسابك 🚀"
        : "Create your account 🚀";

  const subtitle =
    mode === "sign-in"
      ? language === "ar"
        ? "تسجيل الدخول للمتابعة إلى INJAZ"
        : "Sign in to continue to INJAZ"
      : language === "ar"
        ? "انضم إلى INJAZ وحقق فرصك المهنية."
        : "Join INJAZ and turn your skills into opportunities.";

  return (
    <div className="auth-modal-backdrop" onClick={handleBackdropClick}>
      <div className="auth-modal-card" role="dialog" aria-modal="true">
        <button
          type="button"
          className="auth-modal-close"
          onClick={onClose}
          aria-label="Close"
        >
          ×
        </button>

        <div className="auth-modal-inner">
          <div className="auth-modal-visual">
            <span className="auth-modal-badge">INJAZ</span>
            <h2>{formTitle}</h2>
            <p>{subtitle}</p>
            <div className="auth-modal-points">
              <span>
                ⚡ {language === "ar" ? "تواصل سريع" : "Fast matching"}
              </span>
              <span>
                🔐 {language === "ar" ? "أمان عالي" : "Secure payments"}
              </span>
              <span>
                💬 {language === "ar" ? "دردشة مباشرة" : "Direct chat"}
              </span>
            </div>
          </div>

          <div className="auth-modal-panel">
            {mode === "sign-in" ? (
              <form
                onSubmit={handleLoginSubmit}
                className="auth-modal-form"
                noValidate
              >
                <h3>{language === "ar" ? "تسجيل الدخول" : "Sign In"}</h3>

                <label htmlFor="auth-identifier">
                  {language === "ar"
                    ? "البريد الإلكتروني أو اسم المستخدم"
                    : "Email or Username"}
                </label>
                <input
                  id="auth-identifier"
                  type="text"
                  name="identifier"
                  value={formData.identifier}
                  onChange={handleChange}
                  placeholder={
                    language === "ar"
                      ? "أدخل بريدك أو اسم المستخدم"
                      : "Enter your email or username"
                  }
                />
                {errors.identifier && (
                  <span className="field-error">{errors.identifier}</span>
                )}

                <label htmlFor="auth-password">
                  {language === "ar" ? "كلمة المرور" : "Password"}
                </label>
                <div className="password-field">
                  <input
                    id="auth-password"
                    type={showPassword ? "text" : "password"}
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder={
                      language === "ar"
                        ? "أدخل كلمة المرور"
                        : "Enter your password"
                    }
                  />
                  <button
                    type="button"
                    className="password-toggle"
                    onClick={() => setShowPassword((prev) => !prev)}
                  >
                    {showPassword
                      ? language === "ar"
                        ? "إخفاء"
                        : "Hide"
                      : language === "ar"
                        ? "إظهار"
                        : "Show"}
                  </button>
                </div>
                {errors.password && (
                  <span className="field-error">{errors.password}</span>
                )}

                <div className="auth-inline-row">
                  <label className="remember-row">
                    <input type="checkbox" />
                    <span>{language === "ar" ? "تذكرني" : "Remember me"}</span>
                  </label>
                  
                  {/* 👇 التعديل تم هنا: استخدام Link مع تمرير onClose لإغلاق النافذة */}
                  <Link 
                    to="/forgot-password" 
                    className="link-button"
                    onClick={onClose}
                  >
                    {language === "ar"
                      ? "نسيت كلمة المرور؟"
                      : "Forgot password?"}
                  </Link>
                </div>

                {errors.submit && (
                  <div className="form-alert form-alert-error">
                    {errors.submit}
                  </div>
                )}
                {success && (
                  <div className="form-alert form-alert-success">{success}</div>
                )}

                <button
                  type="submit"
                  className="primary-cta"
                  disabled={loading}
                >
                  {loading
                    ? language === "ar"
                      ? "جاري تسجيل الدخول..."
                      : "Signing in..."
                    : language === "ar"
                      ? "تسجيل الدخول"
                      : "Sign In"}
                </button>

                <p className="auth-switch-copy">
                  {language === "ar"
                    ? "ليس لديك حساب؟"
                    : "Don’t have an account?"}{" "}
                  <button
                    type="button"
                    className="link-button"
                    onClick={() => setMode("sign-up")}
                  >
                    {language === "ar" ? "إنشاء حساب" : "Create Account"}
                  </button>
                </p>
              </form>
            ) : (
              <form
                onSubmit={handleSignupSubmit}
                className="auth-modal-form"
                noValidate
              >
                <h3>{language === "ar" ? "إنشاء حساب" : "Create Account"}</h3>

                <label htmlFor="auth-username">
                  {language === "ar" ? "اسم المستخدم" : "Username"}
                </label>
                <input
                  id="auth-username"
                  type="text"
                  name="username"
                  value={formData.username}
                  onChange={handleChange}
                  placeholder={
                    language === "ar" ? "اختر اسم مستخدم" : "Choose a username"
                  }
                />
                {errors.username && (
                  <span className="field-error">{errors.username}</span>
                )}

                <label htmlFor="auth-email">
                  {language === "ar" ? "البريد الإلكتروني" : "Email"}
                </label>
                <input
                  id="auth-email"
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder={
                    language === "ar"
                      ? "أدخل بريدك الإلكتروني"
                      : "Enter your email"
                  }
                />
                {errors.email && (
                  <span className="field-error">{errors.email}</span>
                )}

                <div className="role-selection">
                  {roleOptions.map((role) => (
                    <button
                      key={role.value}
                      type="button"
                      className={`role-card ${selectedRole === role.value ? "selected" : ""}`}
                      onClick={() => setSelectedRole(role.value)}
                    >
                      <span className="role-icon">{role.icon}</span>
                      <strong>
                        {language === "ar" && role.value === "seller"
                          ? "مستقل"
                          : role.title}
                      </strong>
                      <small>
                        {language === "ar"
                          ? role.value === "seller"
                            ? "أريد تقديم مهاراتي وخدماتي."
                            : "أريد توظيف مستقلين."
                          : role.description}
                      </small>
                    </button>
                  ))}
                </div>

                <label htmlFor="auth-signup-password">
                  {language === "ar" ? "كلمة المرور" : "Password"}
                </label>
                <div className="password-field">
                  <input
                    id="auth-signup-password"
                    type={showPassword ? "text" : "password"}
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder={
                      language === "ar" ? "أنشئ كلمة مرور" : "Create a password"
                    }
                  />
                  <button
                    type="button"
                    className="password-toggle"
                    onClick={() => setShowPassword((prev) => !prev)}
                  >
                    {showPassword
                      ? language === "ar"
                        ? "إخفاء"
                        : "Hide"
                      : language === "ar"
                        ? "إظهار"
                        : "Show"}
                  </button>
                </div>
                {errors.password && (
                  <span className="field-error">{errors.password}</span>
                )}

                <div className="password-strength">
                  <span>
                    {language === "ar"
                      ? "قوة كلمة المرور"
                      : "Password strength"}
                  </span>
                  <strong>{passwordStrength.label}</strong>
                </div>
                <div className="strength-bar">
                  <span
                    style={{ width: `${(passwordStrength.score / 4) * 100}%` }}
                  />
                </div>

                <label htmlFor="auth-confirm-password">
                  {language === "ar" ? "تأكيد كلمة المرور" : "Confirm Password"}
                </label>
                <div className="password-field">
                  <input
                    id="auth-confirm-password"
                    type={showConfirmPassword ? "text" : "password"}
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    placeholder={
                      language === "ar"
                        ? "أعد إدخال كلمة المرور"
                        : "Re-enter your password"
                    }
                  />
                  <button
                    type="button"
                    className="password-toggle"
                    onClick={() => setShowConfirmPassword((prev) => !prev)}
                  >
                    {showConfirmPassword
                      ? language === "ar"
                        ? "إخفاء"
                        : "Hide"
                      : language === "ar"
                        ? "إظهار"
                        : "Show"}
                  </button>
                </div>
                {errors.confirmPassword && (
                  <span className="field-error">{errors.confirmPassword}</span>
                )}

                {errors.submit && (
                  <div className="form-alert form-alert-error">
                    {errors.submit}
                  </div>
                )}
                {success && (
                  <div className="form-alert form-alert-success">{success}</div>
                )}

                <button
                  type="submit"
                  className="primary-cta"
                  disabled={loading}
                >
                  {loading
                    ? language === "ar"
                      ? "جارٍ إنشاء الحساب..."
                      : "Creating account..."
                    : language === "ar"
                      ? "إنشاء الحساب"
                      : "Create Account"}
                </button>

                <p className="auth-switch-copy">
                  {language === "ar"
                    ? "هل لديك حساب؟"
                    : "Already have an account?"}{" "}
                  <button
                    type="button"
                    className="link-button"
                    onClick={() => setMode("sign-in")}
                  >
                    {language === "ar" ? "تسجيل الدخول" : "Sign In"}
                  </button>
                </p>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default AuthModal;