"use client";

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
import { lessonSchema } from "@/features/lesson-engine/lessonSchema";
import {
  getLessonProgressFromLevel,
  loadLevelProgress,
  resetLevelProgress,
  saveLessonProgress,
  updateLevelState,
} from "@/features/progress/localProgress";
import lessonData from "@/content/lessons/lesson-letters.json";
import wordsLessonData from "@/content/lessons/lesson-words.json";
import readingLessonData from "@/content/lessons/lesson-reading.json";
import reviewLessonData from "@/content/lessons/lesson-review.json";
import { useI18n } from "@/i18n/I18nProvider";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

const feedbackKeys = {
  correct: "lesson.feedback.correct",
  incorrect: "lesson.feedback.incorrect",
  lessonComplete: "lesson.feedback.lessonComplete",
} as const;

type FeedbackKey = (typeof feedbackKeys)[keyof typeof feedbackKeys];
type Feedback = { key: FeedbackKey | null; correct?: boolean };
const LEVEL_ID = "level-1";

export default function Home() {
  const { t } = useI18n();
  const lessons = useMemo(
    () => [
      lessonSchema.parse(lessonData),
      lessonSchema.parse(wordsLessonData),
      lessonSchema.parse(readingLessonData),
      lessonSchema.parse(reviewLessonData),
    ],
    [],
  );
  const eventBus = useMemo(() => new LessonEventBus(), []);
  const companion = useMemo(() => new CompanionStateMachine(), []);
  const engine = useMemo(() => new LessonEngine(eventBus), [eventBus]);
  const firstLessonId = lessons[0].id;
  const [levelProgress, setLevelProgress] = useState(() =>
    loadLevelProgress(LEVEL_ID, firstLessonId),
  );
  const [feedback, setFeedback] = useState<Feedback>({ key: null });
  const [activityIndex, setActivityIndex] = useState(
    levelProgress.started ? getLessonProgressFromLevel(levelProgress, firstLessonId).activityIndex : -1,
  );
  const [lessonCompleted, setLessonCompleted] = useState(
    levelProgress.started ? getLessonProgressFromLevel(levelProgress, firstLessonId).completed : false,
  );
  const [mood, setMood] = useState(companion.getMood());

  const currentLesson =
    lessons.find((lesson) => lesson.id === levelProgress.currentLessonId) ?? lessons[0];
  const currentLessonIndex = lessons.findIndex((lesson) => lesson.id === currentLesson.id);

  useEffect(() => {
    const unsubscribe = eventBus.subscribe((event) => {
      companion.handleEvent(event);
      setMood(companion.getMood());
    });
    return () => unsubscribe();
  }, [companion, eventBus]);

  useEffect(() => {
    if (!levelProgress.started || !currentLesson) return;
    const progress = getLessonProgressFromLevel(levelProgress, currentLesson.id);
    engine.startLesson(currentLesson, progress.activityIndex);
  }, [currentLesson, engine, levelProgress]);

  const submitAnswer = (choice: string) => {
    if (!levelProgress.started) return;
    const activity = engine.getCurrentActivity();
    const result = engine.submitAnswer(choice);
    setActivityIndex(result.nextIndex);
    setLessonCompleted(result.completed);
    setFeedback({
      correct: result.correct,
      key: result.correct
        ? result.completed
          ? feedbackKeys.lessonComplete
          : feedbackKeys.correct
        : feedbackKeys.incorrect,
    });
    const updated = saveLessonProgress(LEVEL_ID, firstLessonId, {
      lessonId: currentLesson.id,
      activityIndex: result.nextIndex,
      completed: result.completed,
    });
    setLevelProgress(updated);

    const allLessonsComplete = lessons.every(
      (lesson) => getLessonProgressFromLevel(updated, lesson.id).completed,
    );

    if (result.completed && currentLessonIndex < lessons.length - 1) {
      const nextLesson = lessons[currentLessonIndex + 1];
      const nextRecord = updateLevelState(LEVEL_ID, firstLessonId, {
        currentLessonId: nextLesson.id,
        started: true,
      });
      const nextProgress = getLessonProgressFromLevel(nextRecord, nextLesson.id);
      setActivityIndex(nextProgress.activityIndex);
      setLessonCompleted(nextProgress.completed);
      setLevelProgress(nextRecord);
      setFeedback({ key: feedbackKeys.correct, correct: true });
      engine.startLesson(nextLesson, nextProgress.activityIndex);
    }

    if (allLessonsComplete && !updated.levelCompleted) {
      const completedRecord = updateLevelState(LEVEL_ID, firstLessonId, {
        levelCompleted: true,
        started: true,
      });
      setLevelProgress(completedRecord);
      eventBus.emit({
        type: "LEVEL_COMPLETED",
        payload: { lessonId: currentLesson.id, activityId: activity?.id },
      });
    }
  };

  const resetLevel = () => {
    resetLevelProgress(LEVEL_ID, firstLessonId);
    const fresh = loadLevelProgress(LEVEL_ID, firstLessonId);
    setLevelProgress(fresh);
    setActivityIndex(-1);
    setLessonCompleted(false);
    setFeedback({ key: null });
    companion.reset();
    setMood(companion.getMood());
  };

  const startLevel = () => {
    const started = updateLevelState(LEVEL_ID, firstLessonId, {
      started: true,
      currentLessonId: currentLesson.id,
    });
    const progress = getLessonProgressFromLevel(started, currentLesson.id);
    setLevelProgress(started);
    setActivityIndex(progress.activityIndex);
    setLessonCompleted(progress.completed);
    engine.startLesson(currentLesson, progress.activityIndex);
    setFeedback({ key: null });
  };

  const selectLesson = (lessonId: string) => {
    const next = updateLevelState(LEVEL_ID, firstLessonId, {
      currentLessonId: lessonId,
      started: true,
    });
    const progress = getLessonProgressFromLevel(next, lessonId);
    setLevelProgress(next);
    setActivityIndex(progress.activityIndex);
    setLessonCompleted(progress.completed);
    const lesson = lessons.find((entry) => entry.id === lessonId);
    if (lesson) {
      engine.startLesson(lesson, progress.activityIndex);
    }
    setFeedback({ key: null });
  };

  const activity = levelProgress.started ? engine.getCurrentActivity() : currentLesson?.activities[0];
  const completedLessonsCount = lessons.filter(
    (lesson) => getLessonProgressFromLevel(levelProgress, lesson.id).completed,
  ).length;

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

      <section className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-4 lg:col-span-2">
          <LevelProgressTracker lessons={lessons} progress={levelProgress} />
          {levelProgress.levelCompleted ? (
            <Card className="flex flex-col gap-3 border-emerald-200 bg-emerald-50 text-emerald-900">
              <h2 className="text-xl font-semibold">{t("level.completedHeading")}</h2>
              <p className="text-sm text-emerald-800">{t("level.completedBody")}</p>
              <div className="flex flex-wrap gap-3">
                <Button type="button" onClick={resetLevel} className="bg-white text-emerald-800">
                  {t("level.reset")}
                </Button>
              </div>
            </Card>
          ) : !levelProgress.started ? (
            <Card className="flex flex-col gap-4 border-amber-200 bg-amber-50 text-amber-900">
              <h2 className="text-xl font-semibold">{t("level.startHeading")}</h2>
              <p className="text-sm text-amber-800">{t("level.startCopy")}</p>
              <div className="flex flex-wrap gap-3">
                <Button type="button" onClick={startLevel}>
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
                    payload: { lessonId: currentLesson.id, activityId: activity.id },
                  })
                }
                feedback={{
                  correct: feedback.correct,
                  message: feedback.key ? t(feedback.key) : null,
                }}
                disabled={lessonCompleted || levelProgress.levelCompleted}
                statusMessage={
                  lessonCompleted ? t("lesson.completedStatus") : undefined
                }
              />
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <ProgressSummary
                  current={activityIndex}
                  total={currentLesson.activities.length}
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
          <h3 className="text-lg font-semibold text-slate-900">{t("level.lessonListTitle")}</h3>
          <p className="text-sm text-slate-700">
            {t("level.lessonListSubtitle", { total: lessons.length, completed: completedLessonsCount })}
          </p>
          <LevelProgressList
            lessons={lessons}
            progress={levelProgress}
            currentLessonId={currentLesson.id}
            onSelect={selectLesson}
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
