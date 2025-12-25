"use client";

import type { Activity } from "@/features/lesson-engine/lessonSchema";
import { Card } from "@/components/ui/Card";
import { useI18n } from "@/i18n/I18nProvider";
import { speakArabicLetter, speakUiPrompt } from "@/lib/tts";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

const CORRECT_SFX = "/audio/sfx/correct.wav";
const GENTLE_SFX = "/audio/sfx/gentle.wav";
const arabicRegex = /[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF]/;

type Props = {
  activity: Activity;
  onSubmit: (choice: string) => void;
  disabled?: boolean;
  feedback?: { correct?: boolean; message?: string | null };
  onThinking?: () => void;
  statusMessage?: string | null;
  visualOnly?: boolean;
  autoPlayAudio?: boolean;
  playEffects?: boolean;
};

export function LessonActivityCard({
  activity,
  onSubmit,
  disabled,
  feedback,
  onThinking,
  statusMessage,
  visualOnly,
  autoPlayAudio,
  playEffects,
}: Props) {
  const { t, locale } = useI18n();
  const supportedTypes = useMemo(() => ["choose", "listen", "build", "match", "review"], []);
  const isReview = activity.type === "review";
  const isListen = activity.type === "listen";
  const isUnsupported = !supportedTypes.includes(activity.type);
  const onSubmitRef = useRef(onSubmit);
  const sfxAudioRef = useRef<HTMLAudioElement | null>(null);
  const [isNarrating, setIsNarrating] = useState(false);
  const hasAudioAsset = useMemo(() => Boolean(activity.asset && activity.asset.startsWith("audio/")), [activity.asset]);
  const requiresListening = isListen || hasAudioAsset;
  const promptKey = useMemo(() => {
    if (isListen) return "lesson.prompt.listenChooseLetter";
    if (activity.type === "choose" && hasAudioAsset) return "lesson.prompt.tapLetterBySound";
    return null;
  }, [activity.type, hasAudioAsset, isListen]);
  const uiPrompt = useMemo(() => {
    const fallback = t(promptKey ?? "lesson.activityLabel");
    if (promptKey) return fallback;
    if (!activity.prompt) return fallback;
    return arabicRegex.test(activity.prompt) ? fallback : activity.prompt;
  }, [activity.prompt, promptKey, t]);

  useEffect(() => {
    onSubmitRef.current = onSubmit;
  }, [onSubmit]);

  useEffect(() => {
    if (isUnsupported) {
      console.warn(`Unsupported activity type "${activity.type}" encountered. Rendering fallback.`);
    }
  }, [activity.type, isUnsupported]);

  const playNarration = useCallback(async () => {
    if (!uiPrompt) return;
    setIsNarrating(true);
    try {
      await speakUiPrompt(uiPrompt, locale);
      if (requiresListening && activity.answer) {
        await speakArabicLetter(activity.answer);
      }
    } finally {
      setIsNarrating(false);
    }
  }, [activity.answer, locale, requiresListening, uiPrompt]);

  useEffect(() => {
    if (!autoPlayAudio) return;
    void playNarration();
  }, [activity.id, autoPlayAudio, playNarration]);

  useEffect(() => {
    if (!playEffects) return;
    if (feedback?.correct === undefined) return;
    if (typeof Audio === "undefined") return;

    const sfx = new Audio(feedback.correct ? CORRECT_SFX : GENTLE_SFX);
    sfx.volume = feedback.correct ? 0.8 : 0.6;
    sfxAudioRef.current = sfx;
    void sfx.play().catch(() => {});
  }, [activity.id, feedback?.correct, playEffects]);

  useEffect(() => {
    return () => {
      sfxAudioRef.current?.pause();
      if (typeof window !== "undefined" && "speechSynthesis" in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  useEffect(() => {
    if (!isReview) return;
    onSubmitRef.current(activity.answer);
  }, [activity.answer, activity.id, isReview]);

  const replayAudio = () => {
    void playNarration();
  };

  const resolvedStatus = statusMessage ?? (feedback?.correct === false ? t("lesson.prompt.tryAgain") : null);

  return (
    <Card>
      <div className="flex items-start justify-between gap-3">
        <p
          className={
            visualOnly ? "sr-only" : "text-xs font-semibold uppercase tracking-widest text-amber-600"
          }
        >
          {t("lesson.activityLabel")}
        </p>
        <button
          type="button"
          onClick={replayAudio}
          className={`inline-flex items-center justify-center rounded-full bg-amber-100 text-amber-800 shadow-sm transition hover:-translate-y-0.5 hover:bg-amber-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-amber-500 ${
            visualOnly ? "h-12 w-12 text-xl" : "h-9 w-9 text-sm"
          } ${isNarrating ? "ring-2 ring-amber-400" : ""}`}
          aria-label={t("lesson.listenAria")}
        >
          ▶
        </button>
      </div>

      <div className="mt-2">
        <h2 className="flex items-center gap-2 font-semibold text-slate-900">
          {uiPrompt}
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
            {t("lesson.hint")}:{" "}
            <span className="arabic-content inline" lang="ar">
              {activity.hint}
            </span>
          </p>
        ) : null}
      </div>

      {isReview ? (
        visualOnly ? (
          <div className="mt-6 flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 p-4">
            <div className="grid h-12 w-12 place-items-center rounded-full bg-amber-100 text-lg text-amber-800 shibl-bounce">
              🔁
            </div>
            <span className="sr-only">{t("lesson.reviewSummaryBody")}</span>
          </div>
        ) : (
          <div className="mt-6 rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-800">
            <p className="font-semibold text-slate-900">{t("lesson.reviewSummaryTitle")}</p>
            <p className="mt-1">{t("lesson.reviewSummaryBody")}</p>
            {activity.answer ? (
              <p className="mt-2 text-xs text-slate-600">
                {t("lesson.reviewAnswerLabel")}:{" "}
                <span className="font-semibold text-slate-900">{activity.answer}</span>
              </p>
            ) : null}
          </div>
        )
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
              className="arabic-content flex items-center justify-center rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 font-semibold text-slate-900 transition hover:-translate-y-0.5 hover:border-amber-400 hover:bg-amber-50 hover:shadow disabled:cursor-not-allowed disabled:opacity-70"
              disabled={disabled}
              aria-label={t("lesson.ariaChoose", { choice })}
              lang="ar"
            >
              {choice}
            </button>
          ))}
        </div>
      )}

      {!visualOnly && resolvedStatus ? <p className="mt-3 text-sm text-slate-500">{resolvedStatus}</p> : null}

      {visualOnly ? (
        feedback && feedback.correct !== undefined ? (
          <div className="mt-4 flex items-center gap-2" aria-live="polite" aria-atomic="true">
            <div
              className={`grid h-10 w-10 place-items-center rounded-full ${
                feedback.correct
                  ? "bg-emerald-100 text-emerald-800 shibl-bounce"
                  : "bg-amber-100 text-amber-800 shibl-nod"
              }`}
            >
              {feedback.correct ? "★" : "↺"}
            </div>
            <span className="sr-only">
              {feedback.correct ? t("lesson.feedback.correct") : t("lesson.feedback.incorrect")}
            </span>
          </div>
        ) : isUnsupported ? (
          <div className="mt-4 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-800">
            {t("lesson.unsupportedType")}
          </div>
        ) : null
      ) : feedback?.message ? (
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
