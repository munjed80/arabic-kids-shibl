"use client";

import { useMemo } from "react";
import { useI18n } from "@/i18n/I18nProvider";

type Props = {
  current: number;
  total: number;
  completed: boolean;
};

export function ProgressSummary({ current, total, completed }: Props) {
  const { t } = useI18n();
  const safeCurrent = Math.max(0, current);
  const percent = useMemo(
    () => Math.round(((safeCurrent + (completed ? 1 : 0)) / Math.max(1, total)) * 100),
    [completed, safeCurrent, total],
  );
  const displayCurrent = total === 0 ? 0 : Math.min(safeCurrent + 1, total);

  return (
    <div className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium text-slate-700">
      <span>
        {t("lesson.progressLabel", { current: displayCurrent, total })}
      </span>
      <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-800">
        {t("lesson.completePercent", { percent })}
      </span>
    </div>
  );
}
