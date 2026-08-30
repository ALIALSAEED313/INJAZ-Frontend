import { Link } from "react-router";
import { useSettings } from "../context/SettingsContext";

function Footer() {
  const { language, t } = useSettings();

  return (
    <footer className="site-footer">
      <div className="footer-brand">
        <h2>INJAZ</h2>
        <p>
          {language === "ar"
            ? "تواصل مع مستقلين مهرة وانهِ عملك بكفاءة."
            : "Connect with skilled freelancers and get your work done."}
        </p>
      </div>

      <div className="footer-links">
        <h3>{language === "ar" ? "روابط سريعة" : "Quick Links"}</h3>
        <Link to="/">{t("home")}</Link>
        <Link to="/services">{t("services")}</Link>
        <Link to="/privacy">
          {language === "ar" ? "سياسة الخصوصية" : "Privacy Policy"}
        </Link>
        <Link to="/terms">
          {language === "ar" ? "الشروط والأحكام" : "Terms & Conditions"}
        </Link>
      </div>

      <div className="footer-contact">
        <h3>{language === "ar" ? "تواصل" : "Contact"}</h3>
        <p>support@injaz.com</p>
      </div>

      <div className="footer-meta">
        <p>
          {language === "ar"
            ? "© 2026 Injaz. جميع الحقوق محفوظة."
            : "© 2026 Injaz. All rights reserved."}
        </p>
      </div>
    </footer>
  );
}

export default Footer;
