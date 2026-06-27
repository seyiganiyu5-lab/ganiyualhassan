"use client";

import React, {
  createContext,
  useCallback,
  useContext,
  useSyncExternalStore,
} from "react";
import { translations, type Locale, type Translations } from "./translations";

// Global subscription mechanism for locale changes
const localeListeners = new Set<() => void>();

function subscribeLocale(callback: () => void) {
  localeListeners.add(callback);
  // No cross-tab sync — each tab keeps its own language independently.
  return () => {
    localeListeners.delete(callback);
  };
}

function getLocaleClient(): Locale {
  if (typeof window === "undefined") return "en";
  const saved = localStorage.getItem("locale");
  return saved === "fr" ? "fr" : "en";
}

function getLocaleServer(): Locale {
  return "en";
}

interface I18nContextValue {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: Translations;
}

const I18nContext = createContext<I18nContextValue | undefined>(undefined);

export function I18nProvider({ children }: { children: React.ReactNode }) {
  // useSyncExternalStore returns the server snapshot ("en") during SSR and
  // hydration, then switches to the client snapshot (localStorage) after
  // hydration. This prevents hydration mismatches.
  const locale = useSyncExternalStore(
    subscribeLocale,
    getLocaleClient,
    getLocaleServer
  );

  const setLocale = useCallback((newLocale: Locale) => {
    if (typeof window !== "undefined") {
      localStorage.setItem("locale", newLocale);
      document.documentElement.lang = newLocale;
      localeListeners.forEach((l) => l());
    }
  }, []);

  return (
    <I18nContext.Provider value={{ locale, setLocale, t: translations[locale] }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useI18n() {
  const ctx = useContext(I18nContext);
  if (!ctx) {
    throw new Error("useI18n must be used within I18nProvider");
  }
  return ctx;
}

export function useT() {
  return useI18n().t;
}
