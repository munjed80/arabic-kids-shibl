import { describe, expect, it } from "vitest";
import { defaultLocale, resolveLocale, supportedLocales } from "@/i18n/config";
import en from "@/i18n/en.json";
import nl from "@/i18n/nl.json";
import de from "@/i18n/de.json";
import sv from "@/i18n/sv.json";

describe("resolveLocale", () => {
  it("returns stored locale when supported", () => {
    expect(resolveLocale({ stored: "nl" })).toBe("nl");
  });

  it("falls back to browser preference when storage is empty", () => {
    const locale = resolveLocale({ navigatorLanguages: ["de-DE", "en-US"] });
    expect(supportedLocales).toContain(locale);
    expect(locale).toBe("de");
  });

  it("defaults to English when nothing matches", () => {
    expect(resolveLocale({ navigatorLanguages: ["fr-FR"] })).toBe(defaultLocale);
  });

  it("provides localized error fallback strings in all locales", () => {
    const dictionaries = { en, nl, de, sv } as const;
    const errorKeys = ["guardLabel", "title", "message", "retry", "backHome"] as const;

    Object.entries(dictionaries).forEach(([locale, dictionary]) => {
      errorKeys.forEach((key) => {
        const value = dictionary.error?.[key];
        expect(value, `${locale} missing ${key}`).toBeTypeOf("string");
        expect(value, `${locale} empty ${key}`).not.toHaveLength(0);
      });
    });
  });
});
