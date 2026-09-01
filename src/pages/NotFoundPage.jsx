import { Link } from "react-router";
import Icon from "../components/Icon";
import { useTranslation } from "react-i18next";

function NotFoundPage() {
  const { t } = useTranslation();

  return (
    <section className="not-found-page" aria-labelledby="not-found-title">
      <div className="not-found-card">
        <div className="not-found-mark" aria-hidden="true">
          <Icon name="search" size={30} />
        </div>

        <span className="not-found-badge">
          {t("notFound.eRROR404")}
        </span>
        <p className="not-found-code" aria-hidden="true">404</p>
        <h1 id="not-found-title">
          {t("notFound.pageNotFound")}
        </h1>
        <p className="not-found-copy">
          {t("notFound.thePageYouReLookingForDoesn")

          }
        </p>

        <div className="not-found-actions">
          <Link to="/" className="button-primary">
            {t("notFound.backToHome")}
          </Link>
          <Link to="/services" className="button-secondary">
            {t("notFound.browseServices")}
          </Link>
        </div>
      </div>
    </section>);

}

export default NotFoundPage;
