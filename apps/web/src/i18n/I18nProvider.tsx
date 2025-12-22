"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import en from "./en.json";
import nl from "./nl.json";
import de from "./de.json";
import sv from "./sv.json";
import { defaultLocale, resolveLocale, storageKey, supportedLocales } from "./config";
import type { SupportedLocale } from "./config";

type Dictionary = typeof en;

const dictionaries: Record<SupportedLocale, Dictionary> = {
  en,
  nl,
  de,
  sv,
};

const languageLabelKey: Record<SupportedLocale, string> = {
  en: "language.english",
  nl: "language.dutch",
  de: "language.german",
  sv: "language.swedish",
};

type TranslateValues = Record<string, string | number>;

type I18nContextValue = {
  locale: SupportedLocale;
  setLocale: (locale: SupportedLocale) => void;
  t: (key: string, values?: TranslateValues) => string;
  availableLanguages: { code: SupportedLocale; label: string }[];
};

const I18nContext = createContext<I18nContextValue | null>(null);

const getNested = (dictionary: Dictionary, key: string): string | undefined => {
  const result = key.split(".").reduce<unknown>((acc, part) => {
    if (typeof acc === "object" && acc !== null && part in acc) {
      return (acc as Record<string, unknown>)[part];
    }
    return undefined;
  }, dictionary);
  return typeof result === "string" ? result : undefined;
};

const interpolate = (template: string, values?: TranslateValues) => {
  if (!values) return template;
  return template.replace(/{(\w+)}/g, (_, token) =>
    Object.hasOwn(values, token) ? String(values[token]) : `{${token}}`,
  );
};

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocaleState] = useState<SupportedLocale>(defaultLocale);

  useEffect(() => {
    const initial = resolveLocale({
      stored: typeof window !== "undefined" ? localStorage.getItem(storageKey) : undefined,
      navigatorLanguages: typeof navigator !== "undefined" ? navigator.languages : undefined,
    });
    setLocaleState(initial);
    if (typeof document !== "undefined") {
      document.documentElement.lang = initial;
    }
    if (typeof window !== "undefined") {
      localStorage.setItem(storageKey, initial);
    }
  }, []);

  const setLocale = (value: SupportedLocale) => {
    setLocaleState(value);
    if (typeof document !== "undefined") {
      document.documentElement.lang = value;
    }
    if (typeof window !== "undefined") {
      localStorage.setItem(storageKey, value);
    }
  };

  const value = useMemo<I18nContextValue>(() => {
    const dictionary = dictionaries[locale] ?? dictionaries[defaultLocale];
    const fallbackDictionary = dictionaries[defaultLocale];
    const translate = (key: string, values?: TranslateValues) => {
      const message = getNested(dictionary, key) ?? getNested(fallbackDictionary, key);
      if (typeof message === "string") {
        return interpolate(message, values);
      }
      return key;
    };

    const availableLanguages = supportedLocales.map((code) => ({
      code,
      label: translate(languageLabelKey[code]),
    }));

    return {
      locale,
      setLocale,
      t: translate,
      availableLanguages,
    };
  }, [locale]);

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export const useI18n = () => {
  const context = useContext(I18nContext);
  if (!context) {
    throw new Error("useI18n must be used within I18nProvider");
  }
  return context;
};
