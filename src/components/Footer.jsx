import { Link } from "react-router";
import { useTranslation } from "react-i18next";
function Footer() {
  const {
    t
  } = useTranslation();
  return <footer className="site-footer">
      <div className="footer-brand">
        <h2>{t("footer.injaz")}</h2>
        <p>
          {t("footer.connectWithSkilledFreelancersAndGetYour")}
        </p>
      </div>

      <div className="footer-links">
        <h3>{t("footer.quickLinks")}</h3>
        <Link to="/">{t("common.home")}</Link>
        <Link to="/services">{t("common.services")}</Link>
        <Link to="/privacy">
          {t("footer.privacyPolicy")}
        </Link>
        <Link to="/terms">
          {t("footer.termsConditions")}
        </Link>
      </div>

      <div className="footer-contact">
        <h3>{t("footer.contact")}</h3>
        <p>{t("footer.supportInjazCom")}</p>
      </div>

      <div className="footer-meta">
        <p>
          {t("footer.2026InjazAllRightsReserved")}
        </p>
      </div>
    </footer>;
}
export default Footer;
