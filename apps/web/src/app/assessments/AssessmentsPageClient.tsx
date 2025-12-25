"use client";

import Link from "next/link";
import { useMemo, useRef, useState, useEffect } from "react";
import { Card } from "@/components/ui/Card";
import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";
import { LessonActivityCard } from "@/components/LessonActivityCard";
import { CompanionAvatar } from "@/components/CompanionAvatar";
import { useI18n } from "@/i18n/I18nProvider";
import { LessonEventBus } from "@/features/lesson-engine/eventBus";
import { LessonEngine } from "@/features/lesson-engine/lessonEngine";
import type { Activity, Lesson } from "@/features/lesson-engine/lessonSchema";
import type { Assessment } from "@/features/assessments/assessmentSchema";
import {
  loadAssessmentSummary,
  saveAssessmentSummary,
  type AssessmentCategory,
  type AssessmentRating,
  type AssessmentSummary,
} from "@/features/assessments/localAssessmentSummary";
import { createCompanionAdapter } from "@/features/companion/companionAdapter";

type Props = {
  assessments: Assessment[];
};

type RunState = {
  started: boolean;
  completed: boolean;
  activityIndex: number;
  correctCount: number;
  total: number;
  feedback?: { correct?: boolean; message?: string | null };
};

const initialRunState: RunState = {
  started: false,
  completed: false,
  activityIndex: 0,
  correctCount: 0,
  total: 0,
};

const STRONG_THRESHOLD = 0.85;
const GOOD_THRESHOLD = 0.6;

const rubric = (correct: number, total: number): AssessmentRating => {
  if (total === 0) return "needsPractice";
  const ratio = correct / total;
  if (ratio >= STRONG_THRESHOLD) return "strong";
  if (ratio >= GOOD_THRESHOLD) return "good";
  return "needsPractice";
};

const categoryOrder: AssessmentCategory[] = ["letters", "words", "sentences", "paragraphs"];

const toLesson = (assessment: Assessment): Lesson => ({
  ...assessment,
  level: 0,
});

export function AssessmentsPageClient({ assessments }: Props) {
  const { t } = useI18n();
  const eventBus = useMemo(() => new LessonEventBus(), []);
  const [companionMood, setCompanionMood] = useState(() => 
    createCompanionAdapter({ eventBus }).getMood()
  );
  const companion = useMemo(
    () => createCompanionAdapter({ 
      eventBus, 
      onStateChange: (mood) => setCompanionMood(mood) 
    }),
    [eventBus]
  );
  
  const [selectedCategory, setSelectedCategory] = useState<AssessmentCategory>(
    assessments[0]?.category ?? "letters",
  );
  const categoryTotal = (category: AssessmentCategory) =>
    assessments.find((entry) => entry.category === category)?.activities.length ?? 0;
  const [summary, setSummary] = useState<AssessmentSummary>(() => loadAssessmentSummary());
  const [runState, setRunState] = useState<RunState>(() => ({
    ...initialRunState,
    total: categoryTotal(assessments[0]?.category ?? "letters"),
  }));
  const [currentActivity, setCurrentActivity] = useState<Activity | undefined>(undefined);
  const engineRef = useRef(new LessonEngine(eventBus));

  // Subscribe to event bus for companion reactions
  useEffect(() => {
    const unsubscribe = companion.subscribe();
    return () => unsubscribe();
  }, [companion]);

  const assessmentsByCategory = useMemo(
    () => Object.fromEntries(assessments.map((entry) => [entry.category, entry] as const)),
    [assessments],
  );

  const selectedAssessment = assessmentsByCategory[selectedCategory];

  const selectCategory = (category: AssessmentCategory) => {
    setSelectedCategory(category);
    setRunState({ ...initialRunState, total: categoryTotal(category) });
    setCurrentActivity(undefined);
  };

  const startAssessment = () => {
    if (!selectedAssessment) return;
    engineRef.current.startLesson(toLesson(selectedAssessment), 0);
    setRunState({
      started: true,
      completed: false,
      activityIndex: 0,
      correctCount: 0,
      total: selectedAssessment.activities.length,
      feedback: undefined,
    });
    setCurrentActivity(engineRef.current.getCurrentActivity());
  };

  const retryAssessment = () => {
    if (!selectedAssessment) return;
    engineRef.current.startLesson(toLesson(selectedAssessment), 0);
    setRunState({
      started: true,
      completed: false,
      activityIndex: 0,
      correctCount: 0,
      total: selectedAssessment.activities.length,
      feedback: undefined,
    });
    setCurrentActivity(engineRef.current.getCurrentActivity());
  };

  const submitAnswer = (choice: string) => {
    if (!selectedAssessment || !runState.started) return;
    const result = engineRef.current.submitAnswer(choice);
    const nextActivity = engineRef.current.getCurrentActivity();
    const nextCorrect = result.correct ? runState.correctCount + 1 : runState.correctCount;

    const completed = result.completed;
    if (completed) {
      const rating = rubric(nextCorrect, runState.total);
      const updatedSummary = { ...summary, [selectedAssessment.category]: rating };
      setSummary(updatedSummary);
      saveAssessmentSummary(updatedSummary);
    }

    setRunState((state) => ({
      ...state,
      activityIndex: result.nextIndex,
      correctCount: nextCorrect,
      completed,
      feedback: {
        correct: result.correct,
        message: t(result.correct ? "assessments.feedback.correct" : "assessments.feedback.incorrect"),
      },
    }));
    setCurrentActivity(nextActivity);
  };

  const statusLabel = (category: AssessmentCategory) => {
    const rating = summary[category];
    if (!rating) return t("assessments.status.notStarted");
    return t(`assessments.rating.${rating}`);
  };

  return (
    <Container className="space-y-6 py-8">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-amber-600">
            {t("assessments.badge")}
          </p>
          <h1 className="mt-2 text-3xl font-semibold text-slate-900">{t("assessments.title")}</h1>
          <p className="mt-2 max-w-2xl text-sm text-slate-700">{t("assessments.lede")}</p>
          <p className="mt-1 text-xs text-slate-600">{t("assessments.safety")}</p>
        </div>
        <Link
          href="/"
          className="rounded-full border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-amber-400 hover:text-amber-700"
        >
          {t("assessments.backToLessons")}
        </Link>
      </div>

      <CompanionAvatar mood={companionMood} />

      <Card className="flex flex-col gap-4 border-slate-200 bg-slate-50 p-4 text-slate-900">
        <div className="flex flex-wrap justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold">{t("assessments.resultsHeading")}</h2>
            <p className="text-sm text-slate-700">{t("assessments.resultsBody")}</p>
          </div>
          <p className="text-xs text-slate-600">{t("assessments.localOnly")}</p>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {categoryOrder.map((category) => (
            <div key={category} className="rounded-xl border border-slate-200 bg-white p-3">
              <p className="text-xs font-semibold uppercase tracking-widest text-slate-500">
                {t(`assessments.types.${category}.label`)}
              </p>
              <p className="mt-1 text-sm font-semibold text-slate-900">{statusLabel(category)}</p>
              {summary[category] ? (
                <p className="mt-1 text-xs text-slate-600">{t("assessments.latestSaved")}</p>
              ) : null}
            </div>
          ))}
        </div>
      </Card>

      <section className="grid gap-4 lg:grid-cols-3">
        <div className="lg:col-span-1">
          <Card className="space-y-3 border-amber-200 bg-amber-50 p-4 text-amber-900">
            <h3 className="text-lg font-semibold">{t("assessments.chooseType")}</h3>
            <p className="text-sm">{t("assessments.chooseTypeBody")}</p>
            <div className="grid gap-2">
              {categoryOrder.map((category) => {
                const data = assessmentsByCategory[category];
                return (
                  <button
                    key={category}
                    type="button"
                    onClick={() => selectCategory(category)}
                    className={`flex flex-col rounded-xl border px-3 py-2 text-left transition hover:-translate-y-0.5 ${
                      selectedCategory === category
                        ? "border-amber-500 bg-white text-amber-900 shadow-sm"
                        : "border-amber-100 bg-amber-50 text-amber-900"
                    }`}
                  >
                    <span className="text-sm font-semibold">{t(`assessments.types.${category}.label`)}</span>
                    <span className="text-xs text-amber-800">
                      {data ? data.description : t("assessments.placeholder")}
                    </span>
                    <span className="mt-1 text-xs text-amber-700">
                      {t("assessments.duration", { minutes: data?.durationMinutes ?? 3 })}
                    </span>
                  </button>
                );
              })}
            </div>
            <p className="text-xs text-amber-800">{t("assessments.retries")}</p>
          </Card>
        </div>

        <div className="space-y-4 lg:col-span-2">
          {selectedAssessment ? (
            <Card className="space-y-3">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-widest text-amber-600">
                    {t(`assessments.types.${selectedAssessment.category}.label`)}
                  </p>
                  <h3 className="text-2xl font-semibold text-slate-900">{selectedAssessment.title}</h3>
                  <p className="text-sm text-slate-700">{selectedAssessment.objective}</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  {!runState.started || runState.completed ? (
                    <Button type="button" onClick={startAssessment}>
                      {t("assessments.start")}
                    </Button>
                  ) : (
                    <Button type="button" onClick={retryAssessment} variant="ghost">
                      {t("assessments.retry")}
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
                  />
                  <div className="flex flex-wrap items-center justify-between gap-3 text-sm text-slate-700">
                    <span>
                      {t("assessments.progressLabel", { current: runState.activityIndex + 1, total: runState.total })}
                    </span>
                    {runState.completed ? (
                      <span className="text-emerald-700">{t("assessments.completed")}</span>
                    ) : (
                      <span className="text-slate-600">{t("assessments.tryUntilReady")}</span>
                    )}
                  </div>
                </div>
              ) : (
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-800">
                  <p>{t("assessments.readyToStart")}</p>
                  <p className="mt-1 text-xs text-slate-600">{t("assessments.noScores")}</p>
                </div>
              )}

              <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-xs text-slate-700">
                <p className="font-semibold text-slate-900">{t("assessments.noteTitle")}</p>
                <p className="mt-1">{t("assessments.noteBody")}</p>
              </div>
            </Card>
          ) : (
            <Card className="text-slate-700">{t("assessments.placeholder")}</Card>
          )}
        </div>
      </section>
    </Container>
  );
}
