"use client";

import { useI18n } from "@/i18n/I18nProvider";

export function LanguageSelector() {
  const { availableLanguages, setLocale, locale, t } = useI18n();

  return (
    <div className="flex flex-col gap-2 text-sm text-slate-700">
      <div className="flex items-center gap-2">
        <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">
          {t("language.label")}
        </span>
        <span className="text-xs text-slate-500">{t("language.selectorHint")}</span>
      </div>
      <div className="flex flex-wrap gap-2">
        {availableLanguages.map((lang) => (
          <button
            key={lang.code}
            type="button"
            onClick={() => setLocale(lang.code)}
            className={`rounded-full border px-3 py-1.5 text-sm font-semibold transition ${
              locale === lang.code
                ? "border-amber-500 bg-amber-50 text-amber-800"
                : "border-slate-200 bg-white text-slate-700 hover:border-amber-400 hover:text-amber-700"
            }`}
            aria-pressed={locale === lang.code}
          >
            {lang.label}
          </button>
        ))}
      </div>
    </div>
  );
}
