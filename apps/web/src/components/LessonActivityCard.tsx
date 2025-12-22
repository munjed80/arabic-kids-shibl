"use client";

import type { Activity } from "@/features/lesson-engine/lessonSchema";
import { Card } from "@/components/ui/Card";
import { useI18n } from "@/i18n/I18nProvider";
import { useEffect, useMemo, useRef } from "react";

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
  const supportedTypes = useMemo(() => ["choose", "listen", "build", "match", "review"], []);
  const isReview = activity.type === "review";
  const isListen = activity.type === "listen";
  const isUnsupported = !supportedTypes.includes(activity.type);
  const onSubmitRef = useRef(onSubmit);

  useEffect(() => {
    onSubmitRef.current = onSubmit;
  }, [onSubmit]);

  useEffect(() => {
    if (isUnsupported) {
      console.warn(`Unsupported activity type "${activity.type}" encountered. Rendering fallback.`);
    }
  }, [activity.type, isUnsupported]);

  useEffect(() => {
    if (!isReview) return;
    onSubmitRef.current(activity.answer);
  }, [activity.answer, activity.id, isReview]);

  return (
    <Card>
      <p className="text-xs font-semibold uppercase tracking-widest text-amber-600">
        {t("lesson.activityLabel")}
      </p>
      <h2 className="mt-2 text-2xl font-semibold text-slate-900 flex items-center gap-2">
        {activity.prompt}
        {isListen ? (
          <span
            role="img"
            aria-label={t("lesson.listenAria")}
            className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 text-sm text-slate-700"
          >
            ▶
          </span>
        ) : null}
      </h2>
      {activity.hint ? (
        <p className="mt-1 text-sm text-slate-500">
          {t("lesson.hint")}: {activity.hint}
        </p>
      ) : null}

      {isReview ? (
        <div className="mt-6 rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-800">
          <p className="font-semibold text-slate-900">{t("lesson.reviewSummaryTitle")}</p>
          <p className="mt-1">{t("lesson.reviewSummaryBody")}</p>
          {activity.answer ? (
            <p className="mt-2 text-xs text-slate-600">
              {t("lesson.reviewAnswerLabel")}: <span className="font-semibold text-slate-900">{activity.answer}</span>
            </p>
          ) : null}
        </div>
      ) : (
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
      )}

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
      ) : isUnsupported ? (
        <div className="mt-4 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-800">
          {t("lesson.unsupportedType")}
        </div>
      ) : null}
    </Card>
  );
}
