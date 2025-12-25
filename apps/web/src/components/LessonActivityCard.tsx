"use client";

import type { Activity } from "@/features/lesson-engine/lessonSchema";
import { Card } from "@/components/ui/Card";
import { useI18n } from "@/i18n/I18nProvider";
import { useEffect, useMemo, useRef, useState } from "react";

const CORRECT_SFX = "/audio/sfx/correct.wav";
const GENTLE_SFX = "/audio/sfx/gentle.wav";

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
  const { t } = useI18n();
  const supportedTypes = useMemo(() => ["choose", "listen", "build", "match", "review"], []);
  const isReview = activity.type === "review";
  const isListen = activity.type === "listen";
  const isUnsupported = !supportedTypes.includes(activity.type);
  const onSubmitRef = useRef(onSubmit);
  const letterAudioRef = useRef<HTMLAudioElement | null>(null);
  const sfxAudioRef = useRef<HTMLAudioElement | null>(null);
  const [needsManualAudio, setNeedsManualAudio] = useState(false);

  const resolveAudioSrc = (asset?: string) => {
    if (!asset || !asset.startsWith("audio/")) return null;
    if (asset.endsWith(".mp3") || asset.endsWith(".wav")) return `/${asset}`;
    return `/${asset}.wav`;
  };

  const audioSrc = resolveAudioSrc(activity.asset);
  const showAudioControl = Boolean(audioSrc);

  useEffect(() => {
    onSubmitRef.current = onSubmit;
  }, [onSubmit]);

  useEffect(() => {
    if (isUnsupported) {
      console.warn(`Unsupported activity type "${activity.type}" encountered. Rendering fallback.`);
    }
  }, [activity.type, isUnsupported]);

  useEffect(() => {
    if (!autoPlayAudio) return;
    if (!audioSrc || typeof Audio === "undefined") return;
    setNeedsManualAudio(false);
    const sound = new Audio(audioSrc);
    sound.preload = "auto";
    letterAudioRef.current = sound;

    const tryPlay = async () => {
      try {
        await sound.play();
        setNeedsManualAudio(false);
      } catch {
        setNeedsManualAudio(true);
      }
    };

    void tryPlay();

    return () => {
      sound.pause();
    };
  }, [activity.id, audioSrc, autoPlayAudio]);

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
      letterAudioRef.current?.pause();
      sfxAudioRef.current?.pause();
    };
  }, []);

  useEffect(() => {
    if (!isReview) return;
    onSubmitRef.current(activity.answer);
  }, [activity.answer, activity.id, isReview]);

  const replayAudio = () => {
    if (!audioSrc || typeof Audio === "undefined") return;
    const player = letterAudioRef.current ?? new Audio(audioSrc);
    player.preload = "auto";
    letterAudioRef.current = player;
    player.currentTime = 0;
    void player.play().then(() => setNeedsManualAudio(false)).catch(() => setNeedsManualAudio(true));
  };

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
        {showAudioControl ? (
          <button
            type="button"
            onClick={replayAudio}
            className={`inline-flex items-center justify-center rounded-full bg-amber-100 text-amber-800 shadow-sm transition hover:-translate-y-0.5 hover:bg-amber-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-amber-500 ${
              visualOnly ? "h-12 w-12 text-xl" : "h-9 w-9 text-sm"
            } ${needsManualAudio ? "ring-2 ring-amber-400" : ""}`}
            aria-label={t("lesson.listenAria")}
          >
            ▶
          </button>
        ) : null}
      </div>

      {visualOnly ? (
        <div className="sr-only">{activity.prompt}</div>
      ) : (
        <>
          <h2 className="arabic-content mt-2 flex items-center gap-2 font-semibold text-slate-900" lang="ar">
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
              {t("lesson.hint")}:{" "}
              <span className="arabic-content inline" lang="ar">
                {activity.hint}
              </span>
            </p>
          ) : null}
        </>
      )}

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

      {!visualOnly && statusMessage ? <p className="mt-3 text-sm text-slate-500">{statusMessage}</p> : null}

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
