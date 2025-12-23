"use client";

import { useEffect, useMemo, useState, useCallback } from "react";
import Link from "next/link";
import { CompanionAvatar } from "@/components/CompanionAvatar";
import { LessonActivityCard } from "@/components/LessonActivityCard";
import { LevelProgressList } from "@/components/LevelProgressList";
import { LevelProgressTracker } from "@/components/LevelProgressTracker";
import { ProgressSummary } from "@/components/ProgressSummary";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Container } from "@/components/ui/Container";
import { LanguageSelector } from "@/components/LanguageSelector";
import { CompanionStateMachine } from "@/features/companion/stateMachine";
import { LessonEventBus } from "@/features/lesson-engine/eventBus";
import { LessonEngine } from "@/features/lesson-engine/lessonEngine";
import type { Lesson } from "@/features/lesson-engine/lessonSchema";
import { loadAssessmentSummary, type AssessmentSummary } from "@/features/assessments/localAssessmentSummary";
import {
  getLessonProgressFromLevel,
  loadLevelProgress,
  resetLevelProgress,
  saveLessonProgress,
  updateLevelState,
} from "@/features/progress/localProgress";
import { useI18n } from "@/i18n/I18nProvider";

type FeedbackKey = "lesson.feedback.correct" | "lesson.feedback.incorrect" | "lesson.feedback.lessonComplete";
type Feedback = { key: FeedbackKey | null; correct?: boolean };

type LevelDescriptor = {
  level: number;
  levelId: string;
  lessons: Lesson[];
  firstLessonId: string;
};

type Props = {
  lessons: Lesson[];
};

const feedbackKeys = {
  correct: "lesson.feedback.correct" as const,
  incorrect: "lesson.feedback.incorrect" as const,
  lessonComplete: "lesson.feedback.lessonComplete" as const,
};

export function HomePageClient({ lessons }: Props) {
  const { t } = useI18n();
  const levels = useMemo<LevelDescriptor[]>(() => {
    const grouped = new Map<number, Lesson[]>();
    lessons.forEach((lesson) => {
      grouped.set(lesson.level, [...(grouped.get(lesson.level) ?? []), lesson]);
    });
    return Array.from(grouped.entries())
      .map(([level, entries]) => ({
        level,
        levelId: `level-${level}`,
        lessons: entries,
        firstLessonId: entries[0]?.id ?? "",
      }))
      .sort((a, b) => a.level - b.level);
  }, [lessons]);

  const levelMap = useMemo(
    () => Object.fromEntries(levels.map((level) => [level.levelId, level])),
    [levels],
  );
  const [activeLevelId, setActiveLevelId] = useState(() => levels[0]?.levelId ?? "");
  const [assessmentSummary] = useState<AssessmentSummary>(() => loadAssessmentSummary());
  const [progressByLevel, setProgressByLevel] = useState(() => {
    const initial: Record<string, ReturnType<typeof loadLevelProgress>> = {};
    levels.forEach((level) => {
      if (level.firstLessonId) {
        initial[level.levelId] = loadLevelProgress(level.levelId, level.firstLessonId);
      }
    });
    return initial;
  });
  const eventBus = useMemo(() => new LessonEventBus(), []);
  const companion = useMemo(() => new CompanionStateMachine(), []);
  const engine = useMemo(() => new LessonEngine(eventBus), [eventBus]);
  const [feedback, setFeedback] = useState<Feedback>({ key: null });
  const [mood, setMood] = useState(companion.getMood());

  const activeLevel = levelMap[activeLevelId] ?? levels[0];
  const activeProgress = activeLevel
    ? progressByLevel[activeLevel.levelId] ?? loadLevelProgress(activeLevel.levelId, activeLevel.firstLessonId)
    : null;
  const currentLesson =
    activeLevel?.lessons.find((lesson) => lesson.id === activeProgress?.currentLessonId) ??
    activeLevel?.lessons[0];
  const currentLessonIndex = activeLevel?.lessons.findIndex((lesson) => lesson.id === currentLesson?.id) ?? 0;
  const currentLessonProgress =
    activeProgress && currentLesson
      ? getLessonProgressFromLevel(activeProgress, currentLesson.id)
      : { activityIndex: 0, completed: false, lessonId: currentLesson?.id ?? "" };
  const levelCompleted = activeProgress?.levelCompleted ?? false;
  const lessonCompleted = currentLessonProgress.completed;
  const activityIndex = currentLessonProgress.activityIndex;
  const activity = activeProgress?.started ? engine.getCurrentActivity() : currentLesson?.activities[0];

  const isLevelUnlocked = useCallback(
    (level: number) => {
      if (levels.length === 0) return false;
      const lowestLevel = Math.min(...levels.map((entry) => entry.level));
      if (level === lowestLevel) return true;

      const previousLevel = levels.find((entry) => entry.level === level - 1);
      if (!previousLevel) return true;
      const previousProgress =
        progressByLevel[previousLevel.levelId] ??
        loadLevelProgress(previousLevel.levelId, previousLevel.firstLessonId);

    return previousProgress.levelCompleted;
  },
  [levels, progressByLevel],
);

  useEffect(() => {
    const unsubscribe = eventBus.subscribe((event) => {
      companion.handleEvent(event);
      setMood(companion.getMood());
    });
    return () => unsubscribe();
  }, [companion, eventBus]);

  useEffect(() => {
    if (!activeLevel || !activeProgress?.started || !currentLesson) return;
    engine.startLesson(currentLesson, currentLessonProgress.activityIndex);
  }, [activeLevel, activeProgress?.started, currentLesson, currentLessonProgress.activityIndex, engine]);

  const updateProgress = useCallback(
    (levelId: string, firstLessonId: string, progress: ReturnType<typeof loadLevelProgress>) => {
      setProgressByLevel((prev) => ({ ...prev, [levelId]: progress }));
    },
    [],
  );

  const selectLevelTab = useCallback((levelId: string) => {
    setActiveLevelId(levelId);
    setFeedback({ key: null });
  }, []);

  const submitAnswer = useCallback(
    (choice: string) => {
      if (!activeLevel || !activeProgress?.started || !currentLesson) return;
      const levelId = activeLevel.levelId;
      const firstLessonId = activeLevel.firstLessonId;
      const result = engine.submitAnswer(choice);

      setFeedback({
        correct: result.correct,
        key: result.correct
          ? result.completed
            ? feedbackKeys.lessonComplete
            : feedbackKeys.correct
          : feedbackKeys.incorrect,
      });

      const updated = saveLessonProgress(levelId, firstLessonId, {
        lessonId: currentLesson.id,
        activityIndex: result.nextIndex,
        completed: result.completed,
      });
      updateProgress(levelId, firstLessonId, updated);

      const allLessonsComplete =
        activeLevel.lessons.length > 0 &&
        activeLevel.lessons.every((lesson) => getLessonProgressFromLevel(updated, lesson.id).completed);

      if (result.completed && currentLessonIndex < activeLevel.lessons.length - 1) {
        const nextLesson = activeLevel.lessons[currentLessonIndex + 1];
        const nextRecord = updateLevelState(levelId, firstLessonId, {
          currentLessonId: nextLesson.id,
          started: true,
        });
        const nextProgress = getLessonProgressFromLevel(nextRecord, nextLesson.id);
        updateProgress(levelId, firstLessonId, nextRecord);
        setFeedback({ key: feedbackKeys.correct, correct: true });
        engine.startLesson(nextLesson, nextProgress.activityIndex);
      }

      if (allLessonsComplete && !updated.levelCompleted) {
        const completedRecord = updateLevelState(levelId, firstLessonId, {
          levelCompleted: true,
          started: true,
        });
        updateProgress(levelId, firstLessonId, completedRecord);
        eventBus.emit({
          type: "LEVEL_COMPLETED",
          payload: { lessonId: currentLesson.id, activityId: activity?.id },
        });
      }
    },
    [
      activeLevel,
      activeProgress?.started,
      activity?.id,
      currentLesson,
      currentLessonIndex,
      engine,
      eventBus,
      updateProgress,
    ],
  );

  const resetLevel = useCallback(() => {
    if (!activeLevel) return;
    resetLevelProgress(activeLevel.levelId, activeLevel.firstLessonId);
    const fresh = loadLevelProgress(activeLevel.levelId, activeLevel.firstLessonId);
    updateProgress(activeLevel.levelId, activeLevel.firstLessonId, fresh);
    setFeedback({ key: null });
    companion.reset();
    setMood(companion.getMood());
  }, [activeLevel, companion, updateProgress]);

  const startLevel = useCallback(() => {
    if (!activeLevel || !currentLesson || !isLevelUnlocked(activeLevel.level)) return;
    const started = updateLevelState(activeLevel.levelId, activeLevel.firstLessonId, {
      started: true,
      currentLessonId: currentLesson.id,
    });
    updateProgress(activeLevel.levelId, activeLevel.firstLessonId, started);
    const progress = getLessonProgressFromLevel(started, currentLesson.id);
    engine.startLesson(currentLesson, progress.activityIndex);
    setFeedback({ key: null });
  }, [activeLevel, currentLesson, engine, isLevelUnlocked, updateProgress]);

  const selectLesson = useCallback(
    (lessonId: string) => {
      if (!activeLevel) return;
      const levelId = activeLevel.levelId;
      const next = updateLevelState(levelId, activeLevel.firstLessonId, {
        currentLessonId: lessonId,
        started: true,
      });
      updateProgress(levelId, activeLevel.firstLessonId, next);
      const progress = getLessonProgressFromLevel(next, lessonId);
      const lesson = activeLevel.lessons.find((entry) => entry.id === lessonId);
      if (lesson) {
        engine.startLesson(lesson, progress.activityIndex);
      }
      setFeedback({ key: null });
    },
    [activeLevel, engine, updateProgress],
  );

  const levelLocked = activeLevel ? !isLevelUnlocked(activeLevel.level) : true;
  const completedLessonsCount =
    activeLevel?.lessons.filter(
      (lesson) => activeProgress && getLessonProgressFromLevel(activeProgress, lesson.id).completed,
    ).length ?? 0;

  return (
    <Container as="main" className="flex min-h-screen flex-col gap-8 py-12">
      <Card as="header" className="flex flex-col gap-4 card-shadow backdrop-blur">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex flex-col gap-2">
            <p className="text-sm font-semibold uppercase tracking-widest text-amber-600">
              {t("app.title")}
            </p>
            <h1 className="text-3xl font-bold text-slate-900">{t("app.tagline")}</h1>
            <p className="mt-2 max-w-2xl text-base text-slate-600">{t("app.subheading")}</p>
          </div>
          <LanguageSelector />
        </div>
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <CompanionAvatar mood={mood} />
        </div>
        <div className="flex flex-wrap gap-3 text-sm text-slate-700">
          <span className="rounded-full bg-emerald-50 px-4 py-2 font-semibold text-emerald-800">
            {t("app.badgeSafe")}
          </span>
          <span className="rounded-full bg-amber-50 px-4 py-2 font-semibold text-amber-800">
            {t("app.badgeProgress")}
          </span>
          <span className="rounded-full bg-sky-50 px-4 py-2 font-semibold text-sky-800">
            {t("app.badgeContent")}
          </span>
        </div>
        <div className="flex flex-wrap gap-3 text-sm font-semibold text-slate-800">
          <Link href="/login" className="rounded-full border border-slate-300 px-4 py-2 hover:border-amber-400 hover:text-amber-700">
            {t("app.parentLogin")}
          </Link>
          <Link href="/register" className="rounded-full border border-slate-300 px-4 py-2 hover:border-amber-400 hover:text-amber-700">
            {t("app.parentRegister")}
          </Link>
        </div>
      </Card>

      <Card className="flex flex-col gap-3 border-slate-200 bg-slate-50">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-amber-600">
              {t("assessments.entryBadge")}
            </p>
            <h2 className="text-xl font-semibold text-slate-900">{t("assessments.entryTitle")}</h2>
            <p className="text-sm text-slate-700">{t("assessments.entryBody")}</p>
          </div>
          <Link
            href="/assessments"
            className="rounded-full bg-amber-500 px-4 py-2 text-sm font-semibold text-white shadow hover:bg-amber-600"
          >
            {t("assessments.entryCta")}
          </Link>
        </div>
        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
          {(["letters", "words", "sentences", "paragraphs"] as const).map((category) => (
            <div key={category} className="rounded-xl border border-slate-200 bg-white p-3 text-sm text-slate-800">
              <p className="text-xs font-semibold uppercase tracking-widest text-slate-500">
                {t(`assessments.types.${category}.label`)}
              </p>
              <p className="mt-1 font-semibold text-slate-900">
                {assessmentSummary[category]
                  ? t(`assessments.rating.${assessmentSummary[category]}`)
                  : t("assessments.status.notStarted")}
              </p>
            </div>
          ))}
        </div>
      </Card>

      <section className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-4 lg:col-span-2">
          <div className="flex flex-wrap gap-2">
            {levels.map((entry) => {
              const unlocked = isLevelUnlocked(entry.level);
              return (
                <button
                  key={entry.levelId}
                  type="button"
                  className={`rounded-full border px-3 py-1 text-sm font-semibold transition ${
                    entry.levelId === activeLevel?.levelId
                      ? "border-amber-400 bg-amber-50 text-amber-800"
                      : "border-slate-200 bg-white text-slate-800 hover:border-amber-300 hover:text-amber-800"
                  } ${!unlocked ? "cursor-not-allowed opacity-60" : ""}`}
                  onClick={() => unlocked && selectLevelTab(entry.levelId)}
                  disabled={!unlocked}
                  aria-label={t("level.switchAria", { level: entry.level })}
                >
                  {t("level.switchLabel", { level: entry.level })}
                  {!unlocked ? ` • ${t("level.lockedLabel")}` : ""}
                </button>
              );
            })}
          </div>
          {activeProgress ? (
            <LevelProgressTracker lessons={activeLevel?.lessons ?? []} progress={activeProgress} />
          ) : null}
          {activeProgress?.levelCompleted ? (
            <Card className="flex flex-col gap-3 border-emerald-200 bg-emerald-50 text-emerald-900">
              <h2 className="text-xl font-semibold">
                {t("level.completedHeading", { level: activeLevel?.level ?? 1 })}
              </h2>
              <p className="text-sm text-emerald-800">
                {t("level.completedBody", { level: activeLevel?.level ?? 1 })}
              </p>
              <div className="flex flex-wrap gap-3">
                <Button type="button" onClick={resetLevel} className="bg-white text-emerald-800">
                  {t("level.reset")}
                </Button>
              </div>
            </Card>
          ) : levelLocked ? (
            <Card className="flex flex-col gap-4 border-slate-200 bg-slate-50 text-slate-900">
              <h2 className="text-xl font-semibold">
                {t("level.startHeading", { level: activeLevel?.level ?? 1 })}
              </h2>
              <p className="text-sm text-slate-700">
                {t("level.lockedCopy", { previous: (activeLevel?.level ?? 2) - 1 })}
              </p>
              <div className="flex flex-wrap gap-3">
                <Button type="button" onClick={resetLevel}>
                  {t("level.reset")}
                </Button>
              </div>
            </Card>
          ) : !activeProgress?.started ? (
            <Card className="flex flex-col gap-4 border-amber-200 bg-amber-50 text-amber-900">
              <h2 className="text-xl font-semibold">
                {t("level.startHeading", { level: activeLevel?.level ?? 1 })}
              </h2>
              <p className="text-sm text-amber-800">
                {levelLocked
                  ? t("level.lockedCopy", { previous: (activeLevel?.level ?? 2) - 1 })
                  : t("level.startCopy", { level: activeLevel?.level ?? 1 })}
              </p>
              <div className="flex flex-wrap gap-3">
                <Button type="button" onClick={startLevel} disabled={levelLocked}>
                  {t("level.startCta")}
                </Button>
                <Button type="button" variant="ghost" onClick={resetLevel}>
                  {t("level.reset")}
                </Button>
              </div>
            </Card>
          ) : activity ? (
            <>
              <LessonActivityCard
                activity={activity}
                onSubmit={submitAnswer}
                onThinking={() =>
                  eventBus.emit({
                    type: "THINKING",
                    payload: { lessonId: currentLesson?.id ?? "", activityId: activity.id },
                  })
                }
                feedback={{
                  correct: feedback.correct,
                  message: feedback.key ? t(feedback.key) : null,
                }}
                disabled={lessonCompleted || levelCompleted}
                statusMessage={lessonCompleted ? t("lesson.completedStatus") : undefined}
              />
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <ProgressSummary
                  current={activityIndex}
                  total={currentLesson?.activities.length ?? 0}
                  completed={lessonCompleted}
                />
                <div className="flex flex-wrap gap-2">
                  <Button type="button" onClick={resetLevel} className="self-start">
                    {t("level.reset")}
                  </Button>
                </div>
              </div>
            </>
          ) : (
            <Card className="text-slate-700">{t("lesson.noActivity")}</Card>
          )}
        </div>

        <Card as="aside" className="flex flex-col gap-3">
          <h3 className="text-lg font-semibold text-slate-900">
            {t("level.lessonListTitle", { level: activeLevel?.level ?? 1 })}
          </h3>
          <p className="text-sm text-slate-700">
            {t("level.lessonListSubtitle", {
              total: activeLevel?.lessons.length ?? 0,
              completed: completedLessonsCount,
            })}
          </p>
          <LevelProgressList
            lessons={activeLevel?.lessons ?? []}
            progress={activeProgress ?? loadLevelProgress(activeLevel?.levelId ?? "", activeLevel?.firstLessonId ?? "")}
            currentLessonId={currentLesson?.id ?? ""}
            onSelect={selectLesson}
            locked={levelLocked}
          />
          {currentLesson ? (
            <div className="rounded-xl bg-slate-50 p-4 text-sm text-slate-800">
              <h4 className="text-base font-semibold text-slate-900">{currentLesson.title}</h4>
              <p className="mt-1 text-xs text-slate-600">{currentLesson.description}</p>
              <ul className="mt-3 space-y-1 text-xs text-slate-700">
                <li>
                  <span className="font-semibold text-slate-900">{t("lesson.objective")}: </span>
                  {currentLesson.objective}
                </li>
                <li>
                  <span className="font-semibold text-slate-900">{t("lesson.level")}: </span>
                  {currentLesson.level}
                </li>
                <li>
                  <span className="font-semibold text-slate-900">{t("lesson.duration")}: </span>
                  {t("lesson.durationValue", { minutes: currentLesson.durationMinutes })}
                </li>
                <li>
                  <span className="font-semibold text-slate-900">{t("lesson.activities")}: </span>
                  {currentLesson.activities.length}
                </li>
              </ul>
            </div>
          ) : null}
          <div className="rounded-xl bg-amber-50 p-4 text-sm text-amber-900">
            {t("lesson.safetyNote")}
          </div>
        </Card>
      </section>
    </Container>
  );
}
