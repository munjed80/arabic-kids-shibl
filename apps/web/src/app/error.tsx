"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useI18n } from "@/i18n/I18nProvider";

type ErrorPageProps = {
  error: Error & { digest?: string };
  reset: () => void;
};

export default function Error({ error, reset }: ErrorPageProps) {
  const { t } = useI18n();

  useEffect(() => {
    console.error("Unhandled error boundary hit", error);
  }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 px-6 py-16">
      <div className="max-w-lg w-full text-center space-y-4">
        <p className="text-xs font-semibold uppercase tracking-wide text-orange-700">
          {t("error.guardLabel")}
        </p>
        <h1 className="text-3xl font-semibold text-slate-900">{t("error.title")}</h1>
        <p className="text-slate-700">{t("error.message")}</p>
        <div className="flex flex-col gap-3 items-center justify-center sm:flex-row sm:justify-center">
          <button
            type="button"
            onClick={reset}
            className="rounded-md bg-orange-500 px-4 py-2 text-white font-medium shadow-sm hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-orange-300"
          >
            {t("error.retry")}
          </button>
          <Link
            href="/"
            className="rounded-md border border-slate-300 px-4 py-2 font-medium text-slate-900 hover:border-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-300"
          >
            {t("error.backHome")}
          </Link>
        </div>
      </div>
    </div>
  );
}
