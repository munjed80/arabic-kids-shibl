"use client";

import type { Activity } from "@/features/lesson-engine/lessonSchema";
import { Card } from "@/components/ui/Card";
import { useI18n } from "@/i18n/I18nProvider";

type Props = {
  activity: Activity;
  onSubmit: (choice: string) => void;
  disabled?: boolean;
  feedback?: { correct?: boolean; message?: string | null };
  onThinking?: () => void;
  statusMessage?: string | null;
};

export function LessonActivityCard({
  activity,
  onSubmit,
  disabled,
  feedback,
  onThinking,
  statusMessage,
}: Props) {
  const { t } = useI18n();

  return (
    <Card>
      <p className="text-xs font-semibold uppercase tracking-widest text-amber-600">
        {t("lesson.activityLabel")}
      </p>
      <h2 className="mt-2 text-2xl font-semibold text-slate-900">{activity.prompt}</h2>
      {activity.hint ? (
        <p className="mt-1 text-sm text-slate-500">
          {t("lesson.hint")}: {activity.hint}
        </p>
      ) : null}

      <div className="mt-6 grid gap-3 sm:grid-cols-2">
        {activity.choices.map((choice) => (
          <button
            key={choice}
            type="button"
            onClick={() => {
              onThinking?.();
              onSubmit(choice);
            }}
            className="flex items-center justify-center rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-lg font-semibold text-slate-900 transition hover:-translate-y-0.5 hover:border-amber-400 hover:bg-amber-50 hover:shadow disabled:cursor-not-allowed disabled:opacity-70"
            disabled={disabled}
            aria-label={t("lesson.ariaChoose", { choice })}
          >
            {choice}
          </button>
        ))}
      </div>

      {statusMessage ? (
        <p className="mt-3 text-sm text-slate-500">{statusMessage}</p>
      ) : null}

      {feedback?.message ? (
        <div
          className={`mt-4 rounded-lg border px-3 py-2 text-sm ${
            feedback.correct
              ? "border-emerald-200 bg-emerald-50 text-emerald-800"
              : "border-amber-200 bg-amber-50 text-amber-800"
          }`}
        >
          {feedback.message}
        </div>
      ) : null}
    </Card>
  );
}
