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
import type { Exam } from "@/features/exams/examSchema";
import {
  saveExamReport,
  getLatestReportForCategory,
  type ExamCategory,
  type ExamRating,
} from "@/features/exams/localExamReport";
import { createCompanionAdapter } from "@/features/companion/companionAdapter";

type Props = {
  exams: Exam[];
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

const rubric = (correct: number, total: number): ExamRating => {
  if (total === 0) return "needsPractice";
  const ratio = correct / total;
  if (ratio >= STRONG_THRESHOLD) return "strong";
  if (ratio >= GOOD_THRESHOLD) return "good";
  return "needsPractice";
};

const categoryOrder: ExamCategory[] = ["letters", "words", "sentences", "paragraphs"];

const toLesson = (exam: Exam): Lesson => ({
  ...exam,
  level: 0,
});

export function ExamsPageClient({ exams }: Props) {
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
  
  const [selectedCategory, setSelectedCategory] = useState<ExamCategory>(
    exams[0]?.category ?? "letters",
  );
  const categoryTotal = (category: ExamCategory) =>
    exams.find((entry) => entry.category === category)?.activities.length ?? 0;
  const [reportRefresh, setReportRefresh] = useState(0);
  const [runState, setRunState] = useState<RunState>(() => ({
    ...initialRunState,
    total: categoryTotal(exams[0]?.category ?? "letters"),
  }));
  const [currentActivity, setCurrentActivity] = useState<Activity | undefined>(undefined);
  const engineRef = useRef(new LessonEngine(eventBus));

  // Subscribe to event bus for companion reactions
  useEffect(() => {
    const unsubscribe = companion.subscribe();
    return () => unsubscribe();
  }, [companion]);

  // Force re-render when report is updated
  useEffect(() => {
    // This effect runs when reportRefresh changes, causing components to re-render
  }, [reportRefresh]);

  const examsByCategory = useMemo(
    () => Object.fromEntries(exams.map((entry) => [entry.category, entry] as const)),
    [exams],
  );

  const selectedExam = examsByCategory[selectedCategory];

  const selectCategory = (category: ExamCategory) => {
    setSelectedCategory(category);
    setRunState({ ...initialRunState, total: categoryTotal(category) });
    setCurrentActivity(undefined);
  };

  const startExam = () => {
    if (!selectedExam) return;
    engineRef.current.startLesson(toLesson(selectedExam), 0);
    setRunState({
      started: true,
      completed: false,
      activityIndex: 0,
      correctCount: 0,
      total: selectedExam.activities.length,
      feedback: undefined,
    });
    setCurrentActivity(engineRef.current.getCurrentActivity());
  };

  const retryExam = () => {
    if (!selectedExam) return;
    engineRef.current.startLesson(toLesson(selectedExam), 0);
    setRunState({
      started: true,
      completed: false,
      activityIndex: 0,
      correctCount: 0,
      total: selectedExam.activities.length,
      feedback: undefined,
    });
    setCurrentActivity(engineRef.current.getCurrentActivity());
  };

  const submitAnswer = (choice: string) => {
    if (!selectedExam || !runState.started) return;
    const result = engineRef.current.submitAnswer(choice);
    const nextActivity = engineRef.current.getCurrentActivity();
    const nextCorrect = result.correct ? runState.correctCount + 1 : runState.correctCount;

    const completed = result.completed;
    if (completed) {
      const rating = rubric(nextCorrect, runState.total);
      saveExamReport(selectedExam.category, rating);
      setReportRefresh((prev) => prev + 1);
    }

    setRunState((state) => ({
      ...state,
      activityIndex: result.nextIndex,
      correctCount: nextCorrect,
      completed,
      feedback: {
        correct: result.correct,
        message: t(result.correct ? "exams.feedback.correct" : "exams.feedback.incorrect"),
      },
    }));
    setCurrentActivity(nextActivity);
  };

  const statusLabel = (category: ExamCategory) => {
    const latest = getLatestReportForCategory(category);
    if (!latest) return t("exams.status.notStarted");
    return t(`exams.rating.${latest.rating}`);
  };

  const parentFeedback = (category: ExamCategory) => {
    const latest = getLatestReportForCategory(category);
    if (!latest) return null;
    return {
      rating: latest.rating,
      whatChildCanDo: t(`exams.parent.canDo.${category}.${latest.rating}`),
      nextSteps: t(`exams.parent.nextSteps.${category}.${latest.rating}`),
    };
  };

  return (
    <Container className="space-y-6 py-8">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-purple-600">
            {t("exams.badge")}
          </p>
          <h1 className="mt-2 text-3xl font-semibold text-slate-900">{t("exams.title")}</h1>
          <p className="mt-2 max-w-2xl text-sm text-slate-700">{t("exams.lede")}</p>
          <p className="mt-1 text-xs text-slate-600">{t("exams.safety")}</p>
        </div>
        <Link
          href="/"
          className="rounded-full border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-purple-400 hover:text-purple-700"
        >
          {t("exams.backToHome")}
        </Link>
      </div>

      <CompanionAvatar mood={companionMood} />

      <Card className="flex flex-col gap-4 border-purple-200 bg-purple-50 p-4 text-purple-900">
        <div className="flex flex-wrap justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold">{t("exams.parentReportHeading")}</h2>
            <p className="text-sm text-purple-800">{t("exams.parentReportBody")}</p>
          </div>
          <p className="text-xs text-purple-700">{t("exams.localOnly")}</p>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {categoryOrder.map((category) => {
            const feedback = parentFeedback(category);
            return (
              <div key={category} className="rounded-xl border border-purple-200 bg-white p-3">
                <p className="text-xs font-semibold uppercase tracking-widest text-slate-500">
                  {t(`exams.types.${category}.label`)}
                </p>
                <p className="mt-1 text-sm font-semibold text-slate-900">{statusLabel(category)}</p>
                {feedback ? (
                  <div className="mt-2 space-y-1 text-xs text-slate-700">
                    <p className="font-semibold text-slate-900">{t("exams.parent.canDoLabel")}</p>
                    <p>{feedback.whatChildCanDo}</p>
                    <p className="mt-1 font-semibold text-slate-900">{t("exams.parent.nextStepsLabel")}</p>
                    <p>{feedback.nextSteps}</p>
                  </div>
                ) : null}
              </div>
            );
          })}
        </div>
      </Card>

      <section className="grid gap-4 lg:grid-cols-3">
        <div className="lg:col-span-1">
          <Card className="space-y-3 border-purple-200 bg-purple-50 p-4 text-purple-900">
            <h3 className="text-lg font-semibold">{t("exams.chooseType")}</h3>
            <p className="text-sm">{t("exams.chooseTypeBody")}</p>
            <div className="grid gap-2">
              {categoryOrder.map((category) => {
                const data = examsByCategory[category];
                return (
                  <button
                    key={category}
                    type="button"
                    onClick={() => selectCategory(category)}
                    className={`flex flex-col rounded-xl border px-3 py-2 text-left transition hover:-translate-y-0.5 ${
                      selectedCategory === category
                        ? "border-purple-500 bg-white text-purple-900 shadow-sm"
                        : "border-purple-100 bg-purple-50 text-purple-900"
                    }`}
                  >
                    <span className="text-sm font-semibold">{t(`exams.types.${category}.label`)}</span>
                    <span className="text-xs text-purple-800">
                      {data ? data.description : t("exams.placeholder")}
                    </span>
                    <span className="mt-1 text-xs text-purple-700">
                      {t("exams.duration", { minutes: data?.durationMinutes ?? 5 })}
                    </span>
                  </button>
                );
              })}
            </div>
            <p className="text-xs text-purple-800">{t("exams.retries")}</p>
          </Card>
        </div>

        <div className="space-y-4 lg:col-span-2">
          {selectedExam ? (
            <Card className="space-y-3">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-widest text-purple-600">
                    {t(`exams.types.${selectedExam.category}.label`)}
                  </p>
                  <h3 className="text-2xl font-semibold text-slate-900">{selectedExam.title}</h3>
                  <p className="text-sm text-slate-700">{selectedExam.objective}</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  {!runState.started || runState.completed ? (
                    <Button type="button" onClick={startExam}>
                      {t("exams.start")}
                    </Button>
                  ) : (
                    <Button type="button" onClick={retryExam} variant="ghost">
                      {t("exams.retry")}
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
                      {t("exams.progressLabel", { current: runState.activityIndex + 1, total: runState.total })}
                    </span>
                    {runState.completed ? (
                      <span className="text-emerald-700">{t("exams.completed")}</span>
                    ) : (
                      <span className="text-slate-600">{t("exams.tryUntilReady")}</span>
                    )}
                  </div>
                </div>
              ) : (
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-800">
                  <p>{t("exams.readyToStart")}</p>
                  <p className="mt-1 text-xs text-slate-600">{t("exams.noScores")}</p>
                </div>
              )}

              <div className="rounded-xl border border-purple-200 bg-purple-50 p-4 text-xs text-purple-800">
                <p className="font-semibold text-purple-900">{t("exams.noteTitle")}</p>
                <p className="mt-1">{t("exams.noteBody")}</p>
              </div>
            </Card>
          ) : (
            <Card className="text-slate-700">{t("exams.placeholder")}</Card>
          )}
        </div>
      </section>
    </Container>
  );
}
