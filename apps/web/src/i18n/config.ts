export const supportedLocales = ["en", "nl", "de", "sv"] as const;

export type SupportedLocale = (typeof supportedLocales)[number];

export const defaultLocale: SupportedLocale = "en";

export const storageKey = "arabic-kids-ui-language";

const normalize = (value?: string | null): SupportedLocale | null => {
  if (!value) return null;
  const normalized = value.toLowerCase();
  return supportedLocales.find((locale) => normalized.startsWith(locale)) ?? null;
};

type ResolveLocaleInput = {
  stored?: string | null;
  navigatorLanguages?: readonly string[] | null;
};

export const resolveLocale = ({
  stored,
  navigatorLanguages,
}: ResolveLocaleInput): SupportedLocale => {
  const fromStorage = normalize(stored);
  if (fromStorage) return fromStorage;

  if (navigatorLanguages && navigatorLanguages.length > 0) {
    for (const lang of navigatorLanguages) {
      const normalized = normalize(lang);
      if (normalized) return normalized;
    }
  }

  return defaultLocale;
};
