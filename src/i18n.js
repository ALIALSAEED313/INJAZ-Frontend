import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import en from "./locales/en.json";
import ar from "./locales/ar.json";

const savedLanguage = localStorage.getItem("injaz-language");
const initialLanguage = ["en", "ar"].includes(savedLanguage) ? savedLanguage : "en";

i18n.use(initReactI18next).init({
  resources: { en: { translation: en }, ar: { translation: ar } },
  lng: initialLanguage,
  fallbackLng: "en",
  supportedLngs: ["en", "ar"],
  interpolation: { escapeValue: false },
  returnNull: false,
});

function applyDocumentLanguage(language) {
  document.documentElement.lang = language;
  document.documentElement.dir = i18n.dir(language);
  document.body.dir = i18n.dir(language);
  localStorage.setItem("injaz-language", language);
}

applyDocumentLanguage(i18n.resolvedLanguage || initialLanguage);
i18n.on("languageChanged", applyDocumentLanguage);

export default i18n;
