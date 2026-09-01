import { useTranslation } from "react-i18next";

function PrivacyPolicyPage() {
  const { t } = useTranslation();
  const sections = t("privacy.sections", { returnObjects: true });

  return (
    <main className="policy-page">
      <h1>{t("privacy.title")}</h1>
      <p>{t("privacy.intro")}</p>
      {sections.map((section) => (
        <section key={section.title}>
          <h2>{section.title}</h2>
          <p>{section.body}</p>
        </section>
      ))}
    </main>
  );
}

export default PrivacyPolicyPage;
