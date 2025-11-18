"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { t } from "@/i18n/config";


type Language = "en" | "es";

interface LanguageContextProps {
  language: Language;
  selectLanguage: (lang: Language) => Promise<void>;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextProps>({
  language: "es",
  selectLanguage: async () => {},
  t: (key: string) => key,
});

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguage] = useState<Language>("es");

  useEffect(() => {
    const stored = localStorage.getItem("appLanguage");
    if (stored === "en" || stored === "es") {
      setLanguage(stored);
    }
  }, []);

  const selectLanguage = async (lang: Language) => {
    setLanguage(lang);
    localStorage.setItem("appLanguage", lang);
  };

  const translate = (key: string) => t(language, key);

  return (
    <LanguageContext.Provider value={{ language, selectLanguage, t: translate }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  return useContext(LanguageContext);
}
