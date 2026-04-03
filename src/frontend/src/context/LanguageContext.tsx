import type React from "react";
import { createContext, useCallback, useContext, useState } from "react";
import { type LangCode, getTranslation } from "../i18n/translations";

interface LanguageContextType {
  language: string;
  setLanguage: (code: string) => void;
  t: (key: string, fallback?: string) => string;
  isPWA: boolean;
  downloadedLanguages: string[];
  downloadLanguage: (code: string) => void;
  languageSelected: boolean;
  setLanguageSelected: (v: boolean) => void;
}

// Safe default so useLanguage() never throws outside provider
const defaultContext: LanguageContextType = {
  language: "en",
  setLanguage: () => {},
  t: (key: string, fallback?: string) => fallback || key,
  isPWA: false,
  downloadedLanguages: [],
  downloadLanguage: () => {},
  languageSelected: false,
  setLanguageSelected: () => {},
};

const LanguageContext = createContext<LanguageContextType>(defaultContext);

const MAIN_LANGS: LangCode[] = ["en", "hi", "lad-tibt", "lad-rom"];

function detectPWA(): boolean {
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    (window.navigator as any).standalone === true ||
    window.innerWidth <= 768
  );
}

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<string>(
    () => localStorage.getItem("lc_language") || "en",
  );
  const [downloadedLanguages, setDownloadedLanguages] = useState<string[]>(() =>
    JSON.parse(localStorage.getItem("lc_downloaded_langs") || "[]"),
  );
  const [languageSelected, setLanguageSelectedState] = useState<boolean>(
    () => localStorage.getItem("lc_language_selected") === "true",
  );
  const [isPWA] = useState(detectPWA);

  const setLanguage = useCallback((code: string) => {
    setLanguageState(code);
    localStorage.setItem("lc_language", code);
  }, []);

  const setLanguageSelected = useCallback((v: boolean) => {
    setLanguageSelectedState(v);
    localStorage.setItem("lc_language_selected", String(v));
  }, []);

  const downloadLanguage = useCallback((code: string) => {
    setDownloadedLanguages((prev) => {
      if (prev.includes(code)) return prev;
      const next = [...prev, code];
      localStorage.setItem("lc_downloaded_langs", JSON.stringify(next));
      return next;
    });
  }, []);

  const t = useCallback(
    (key: string, fallback?: string): string => {
      const lang = MAIN_LANGS.includes(language as LangCode)
        ? (language as LangCode)
        : "en";
      return getTranslation(lang, key, fallback);
    },
    [language],
  );

  return (
    <LanguageContext.Provider
      value={{
        language,
        setLanguage,
        t,
        isPWA,
        downloadedLanguages,
        downloadLanguage,
        languageSelected,
        setLanguageSelected,
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  return useContext(LanguageContext);
}
