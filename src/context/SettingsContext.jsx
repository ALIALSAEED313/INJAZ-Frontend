import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";

const SettingsContext = createContext(null);

export function SettingsProvider({ children }) {
  const { i18n } = useTranslation();
  const [theme, setTheme] = useState(() => {
    const saved = localStorage.getItem("injaz-theme");
    return saved === "light" || saved === "dark" ? saved : "dark";
  });
  const [language, setLanguageState] = useState(i18n.resolvedLanguage || "en");

  useEffect(() => {
    document.body.dataset.theme = theme;
    document.body.style.colorScheme = theme;
    localStorage.setItem("injaz-theme", theme);
  }, [theme]);

  useEffect(() => {
    const syncLanguage = (nextLanguage) => setLanguageState(nextLanguage);
    i18n.on("languageChanged", syncLanguage);
    return () => i18n.off("languageChanged", syncLanguage);
  }, [i18n]);

  const value = useMemo(
    () => ({
      theme,
      setTheme,
      language,
      setLanguage: (nextLanguage) => i18n.changeLanguage(nextLanguage),
    }),
    [i18n, language, theme],
  );

  return (
    <SettingsContext.Provider value={value}>
      {children}
    </SettingsContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useSettings() {
  return useContext(SettingsContext);
}
