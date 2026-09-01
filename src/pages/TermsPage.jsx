import { useTranslation } from "react-i18next";

function TermsPage() {
  const { t } = useTranslation();
  const sections = t("terms.sections", { returnObjects: true });

  return (
    <main className="policy-page">
      <h1>{t("terms.title")}</h1>
      <p>{t("terms.intro")}</p>
      {sections.map((section) => (
        <section key={section.title}>
          <h2>{section.title}</h2>
          <p>{section.body}</p>
        </section>
      ))}
    </main>
  );
}

export default TermsPage;
