"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { LessonActivityCard } from "@/components/LessonActivityCard";
import { CompanionAvatar } from "@/components/CompanionAvatar";
import { useI18n } from "@/i18n/I18nProvider";
import { LessonEventBus } from "@/features/lesson-engine/eventBus";
import { LessonEngine } from "@/features/lesson-engine/lessonEngine";
import type { Activity, Lesson } from "@/features/lesson-engine/lessonSchema";
import type { FinalExam } from "@/features/final-exam/finalExamSchema";
import {
  gradeFinalExamSection,
  loadFinalExamResult,
  saveFinalExamResult,
  type FinalExamRating,
} from "@/features/final-exam/finalExamReport";
import type { FinalExamCategory } from "@/features/final-exam/finalExamSchema";
import { createCompanionAdapter } from "@/features/companion/companionAdapter";

type Props = {
  exam: FinalExam;
};

type RunState = {
  started: boolean;
  completed: boolean;
  activityIndex: number;
  feedback?: { correct?: boolean; message?: string | null };
};

type SectionScore = {
  correct: number;
  total: number;
};

const initialRunState: RunState = {
  started: false,
  completed: false,
  activityIndex: 0,
};

export function FinalExamPageClient({ exam }: Props) {
  const { t } = useI18n();
  const eventBus = useMemo(() => new LessonEventBus(), []);
  const [companionMood, setCompanionMood] = useState(() =>
    createCompanionAdapter({ eventBus }).getMood(),
  );
  const companion = useMemo(
    () =>
      createCompanionAdapter({
        eventBus,
        onStateChange: (mood) => setCompanionMood(mood),
      }),
    [eventBus],
  );

  const flattened = useMemo(
    () =>
      exam.sections.flatMap((section) =>
        section.activities.map((activity) => ({
          activity,
          category: section.category,
        })),
      ),
    [exam.sections],
  );

  const combinedLesson: Lesson = useMemo(
    () => ({
      id: exam.id,
      title: exam.title,
      description: exam.description,
      objective: exam.objective,
      level: 0,
      durationMinutes: exam.durationMinutes,
      activities: flattened.map((entry) => entry.activity),
    }),
    [exam.description, exam.durationMinutes, exam.id, exam.objective, exam.title, flattened],
  );

  const totals = useMemo<Record<FinalExamCategory, SectionScore>>(() => {
    const base: Record<FinalExamCategory, SectionScore> = {
      letters: { correct: 0, total: 0 },
      words: { correct: 0, total: 0 },
      sentences: { correct: 0, total: 0 },
      paragraphs: { correct: 0, total: 0 },
    };
    exam.sections.forEach((section) => {
      base[section.category] = { correct: 0, total: section.activities.length };
    });
    return base;
  }, [exam.sections]);

  const [sectionScores, setSectionScores] = useState<Record<FinalExamCategory, SectionScore>>(totals);
  const [runState, setRunState] = useState<RunState>(initialRunState);
  const [currentActivity, setCurrentActivity] = useState<Activity | undefined>(undefined);
  const [sessionRatings, setSessionRatings] =
    useState<Record<FinalExamCategory, FinalExamRating> | null>(null);
  const [latestResult, setLatestResult] = useState<Record<FinalExamCategory, FinalExamRating> | null>(() => {
    const latest = loadFinalExamResult();
    return latest?.sections ?? null;
  });
  const engineRef = useRef(new LessonEngine(eventBus));

  // Companion subscription
  useEffect(() => {
    const unsubscribe = companion.subscribe();
    return () => unsubscribe();
  }, [companion]);

  const startExam = () => {
    engineRef.current.startLesson(combinedLesson, 0);
    setSectionScores(totals);
    setRunState({
      ...initialRunState,
      started: true,
      completed: false,
      activityIndex: 0,
      feedback: undefined,
    });
    setSessionRatings(null);
    setCurrentActivity(engineRef.current.getCurrentActivity());
  };

  const submitAnswer = (choice: string) => {
    if (!runState.started || !currentActivity) return;
    const meta = flattened[runState.activityIndex];
    const result = engineRef.current.submitAnswer(choice);
    const nextActivity = engineRef.current.getCurrentActivity();

    const updatedScores: Record<FinalExamCategory, SectionScore> = { ...sectionScores };
    if (result.correct && meta) {
      updatedScores[meta.category] = {
        ...updatedScores[meta.category],
        correct: updatedScores[meta.category].correct + 1,
      };
    }

    if (result.completed) {
      const ratings = Object.fromEntries(
        exam.sections.map((section) => [
          section.category,
          gradeFinalExamSection(
            updatedScores[section.category].correct,
            updatedScores[section.category].total,
          ),
        ]),
      ) as Record<FinalExamCategory, FinalExamRating>;
      saveFinalExamResult(ratings);
      setLatestResult(ratings);
      setSessionRatings(ratings);
    }

    setSectionScores(updatedScores);
    setRunState((state) => ({
      ...state,
      activityIndex: result.nextIndex,
      completed: result.completed,
      feedback: {
        correct: result.correct,
        message: t(result.correct ? "finalExam.feedback.correct" : "finalExam.feedback.incorrect"),
      },
    }));
    setCurrentActivity(nextActivity);
  };

  const displayedRatings = sessionRatings ?? latestResult;

  const currentSectionCategory = runState.started
    ? flattened[runState.activityIndex]?.category
    : undefined;

  return (
    <Container className="space-y-6 py-8">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-amber-600">
            {t("finalExam.badge")}
          </p>
          <h1 className="mt-2 text-3xl font-semibold text-slate-900">{t("finalExam.title")}</h1>
          <p className="mt-2 max-w-2xl text-sm text-slate-700">{t("finalExam.lede")}</p>
          <p className="mt-1 text-xs text-slate-600">{t("finalExam.safety")}</p>
        </div>
        <Link
          href="/"
          className="rounded-full border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-amber-400 hover:text-amber-700"
        >
          {t("finalExam.backToHome")}
        </Link>
      </div>

      <CompanionAvatar mood={companionMood} />

      <Card className="flex flex-wrap items-center justify-between gap-3 border-amber-200 bg-amber-50 p-4 text-amber-900">
        <div className="space-y-1">
          <p className="text-lg font-semibold">{t("finalExam.readinessHeading")}</p>
          <p className="text-sm text-amber-800">{t("finalExam.readinessBody")}</p>
          <p className="text-xs text-amber-700">{t("finalExam.localOnly")}</p>
        </div>
        <div className="flex gap-2">
          {!runState.started || runState.completed ? (
            <Button type="button" onClick={startExam}>
              {t("finalExam.start")}
            </Button>
          ) : (
            <Button type="button" onClick={startExam} variant="ghost">
              {t("finalExam.restart")}
            </Button>
          )}
        </div>
      </Card>

      {displayedRatings ? (
        <Card className="border-emerald-200 bg-emerald-50 p-4 text-emerald-900">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-emerald-700">
                {t("finalExam.latestResultBadge")}
              </p>
              <h2 className="text-lg font-semibold text-slate-900">{t("finalExam.resultHeading")}</h2>
              <p className="text-sm text-emerald-800">{t("finalExam.resultBody")}</p>
            </div>
            <p className="text-xs text-emerald-700">{t("finalExam.localOnly")}</p>
          </div>
          <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {(Object.keys(displayedRatings) as FinalExamCategory[]).map((category) => (
              <div key={category} className="rounded-xl border border-emerald-200 bg-white p-3 text-sm text-slate-800">
                <p className="text-xs font-semibold uppercase tracking-widest text-slate-500">
                  {t(`finalExam.types.${category}.label`)}
                </p>
                <p className="mt-1 font-semibold text-slate-900">
                  {t(`finalExam.rating.${displayedRatings[category]}`)}
                </p>
              </div>
            ))}
          </div>
        </Card>
      ) : null}

      <section className="grid gap-4 lg:grid-cols-3">
        <div className="lg:col-span-1">
          <Card className="space-y-3 border-slate-200 bg-slate-50 p-4 text-slate-900">
            <h3 className="text-lg font-semibold">{t("finalExam.structureHeading")}</h3>
            <p className="text-sm text-slate-700">{t("finalExam.structureBody")}</p>
            <ul className="list-disc space-y-1 pl-4 text-sm text-slate-800">
              {exam.sections.map((section) => (
                <li key={section.id}>
                  <span className="font-semibold">{t(`finalExam.types.${section.category}.label`)}</span>{" "}
                  <span className="text-slate-700">{t("finalExam.sectionCount")}</span>
                </li>
              ))}
            </ul>
            <p className="text-xs text-slate-600">{t("finalExam.retries")}</p>
          </Card>
        </div>

        <div className="space-y-4 lg:col-span-2">
          <Card className="space-y-3">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-widest text-amber-600">
                  {currentSectionCategory
                    ? t(`finalExam.types.${currentSectionCategory}.label`)
                    : t("finalExam.notStarted")}
                </p>
                <h3 className="text-2xl font-semibold text-slate-900">{t("finalExam.title")}</h3>
                <p className="text-sm text-slate-700">{t("finalExam.objective")}</p>
              </div>
              <div className="flex flex-wrap gap-2">
                {!runState.started || runState.completed ? (
                  <Button type="button" onClick={startExam}>
                    {t("finalExam.start")}
                  </Button>
                ) : (
                  <Button type="button" onClick={startExam} variant="ghost">
                    {t("finalExam.restart")}
                  </Button>
                )}
              </div>
            </div>

            {runState.started && currentActivity ? (
              <div className="space-y-3">
                <LessonActivityCard
                  activity={currentActivity}
                  onSubmit={submitAnswer}
                  feedback={runState.feedback}
                  disabled={runState.completed}
                  onThinking={() =>
                    eventBus.emit({
                      type: "THINKING",
                      payload: { lessonId: combinedLesson.id, activityId: currentActivity.id },
                    })
                  }
                  statusMessage={
                    runState.completed
                      ? t("finalExam.completed")
                      : t("finalExam.progressLabel", {
                          current: runState.activityIndex + 1,
                          total: combinedLesson.activities.length,
                        })
                  }
                />
                <div className="flex flex-wrap items-center justify-between gap-3 text-sm text-slate-700">
                  <span>
                    {currentSectionCategory
                      ? t("finalExam.sectionNow", { section: t(`finalExam.types.${currentSectionCategory}.label`) })
                      : t("finalExam.notStarted")}
                  </span>
                  {runState.completed ? (
                    <span className="text-emerald-700">{t("finalExam.completed")}</span>
                  ) : (
                    <span className="text-slate-600">{t("finalExam.tryUntilReady")}</span>
                  )}
                </div>
              </div>
            ) : (
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-800">
                <p>{t("finalExam.readyToStart")}</p>
                <p className="mt-1 text-xs text-slate-600">{t("finalExam.noScores")}</p>
              </div>
            )}

            <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-xs text-amber-800">
              <p className="font-semibold text-amber-900">{t("finalExam.noteTitle")}</p>
              <p className="mt-1">{t("finalExam.noteBody")}</p>
            </div>
          </Card>
        </div>
      </section>
    </Container>
  );
}
