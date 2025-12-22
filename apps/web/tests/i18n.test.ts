/// <reference types="vitest" />

import { describe, expect, it } from "vitest";
import { defaultLocale, resolveLocale, supportedLocales } from "@/i18n/config";

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
});
