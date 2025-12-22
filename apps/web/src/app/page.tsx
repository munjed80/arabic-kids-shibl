"use client";

import { CompanionAvatar } from "@/components/CompanionAvatar";
import { LessonActivityCard } from "@/components/LessonActivityCard";
import { ProgressSummary } from "@/components/ProgressSummary";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Container } from "@/components/ui/Container";
import { CompanionStateMachine } from "@/features/companion/stateMachine";
import { LessonEventBus } from "@/features/lesson-engine/eventBus";
import { LessonEngine } from "@/features/lesson-engine/lessonEngine";
import { lessonSchema } from "@/features/lesson-engine/lessonSchema";
import { clearProgress, loadProgress, saveProgress } from "@/features/progress/localProgress";
import lessonData from "@/content/lessons/lesson-letters.json";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

type Feedback = { message: string | null; correct?: boolean };

export default function Home() {
  const lesson = useMemo(() => lessonSchema.parse(lessonData), []);
  const eventBus = useMemo(() => new LessonEventBus(), []);
  const companion = useMemo(() => new CompanionStateMachine(), []);
  const engine = useMemo(() => new LessonEngine(eventBus), [eventBus]);

  const initialProgress = useMemo(
    () => loadProgress(lesson.id) ?? { activityIndex: 0, completed: false },
    [lesson.id],
  );
  const [feedback, setFeedback] = useState<Feedback>({ message: null });
  const [activityIndex, setActivityIndex] = useState(initialProgress.activityIndex);
  const [completed, setCompleted] = useState(initialProgress.completed);
  const [mood, setMood] = useState(companion.getMood());

  useEffect(() => {
    const unsubscribe = eventBus.subscribe((event) => {
      companion.handleEvent(event);
      setMood(companion.getMood());
    });
    return () => unsubscribe();
  }, [companion, eventBus]);

  useEffect(() => {
    engine.startLesson(lesson, initialProgress.activityIndex);
  }, [engine, initialProgress.activityIndex, lesson]);

  const activity = engine.getCurrentActivity();

  const submitAnswer = (choice: string) => {
    const result = engine.submitAnswer(choice);
    setActivityIndex(result.nextIndex);
    setCompleted(result.completed);
    setFeedback({
      correct: result.correct,
      message: result.correct ? "Correct! Shibl is happy." : "Not quite. Try again.",
    });
    saveProgress(lesson.id, {
      activityIndex: result.nextIndex,
      completed: result.completed,
    });
  };

  const resetLesson = () => {
    clearProgress(lesson.id);
    engine.restart();
    setActivityIndex(0);
    setCompleted(false);
    setFeedback({ message: null });
    companion.reset();
    setMood(companion.getMood());
  };

  return (
    <Container as="main" className="flex min-h-screen flex-col gap-8 py-12">
      <Card as="header" className="flex flex-col gap-4 card-shadow backdrop-blur">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-widest text-amber-600">
              Arabic Kids • Shibl
            </p>
            <h1 className="text-3xl font-bold text-slate-900">
              Playful Arabic practice with a non-verbal companion
            </h1>
            <p className="mt-2 max-w-2xl text-base text-slate-600">
              Short, guided activities keep learners focused. Shibl reacts with simple animations
              only—no chat, no accounts, and all progress stays on this device.
            </p>
          </div>
          <CompanionAvatar mood={mood} />
        </div>
        <div className="flex flex-wrap gap-3 text-sm text-slate-700">
          <span className="rounded-full bg-emerald-50 px-4 py-2 font-semibold text-emerald-800">
            Child-safe: no tracking, no ads
          </span>
          <span className="rounded-full bg-amber-50 px-4 py-2 font-semibold text-amber-800">
            Progress saved locally
          </span>
          <span className="rounded-full bg-sky-50 px-4 py-2 font-semibold text-sky-800">
            Content-driven lessons
          </span>
          <Link href="/login" className="ml-auto">
            <Button variant="ghost" className="px-3">
              Parent login
            </Button>
          </Link>
        </div>
        <div className="flex flex-wrap gap-3 text-sm font-semibold text-slate-800">
          <Link href="/login" className="rounded-full border border-slate-300 px-4 py-2 hover:border-amber-400 hover:text-amber-700">
            Parent login
          </Link>
          <Link href="/register" className="rounded-full border border-slate-300 px-4 py-2 hover:border-amber-400 hover:text-amber-700">
            Create parent account
          </Link>
        </div>
      </Card>

      <section className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-4 lg:col-span-2">
          {activity ? (
            <LessonActivityCard
              activity={activity}
              onSubmit={submitAnswer}
              onThinking={() =>
                eventBus.emit({
                  type: "THINKING",
                  payload: { lessonId: lesson.id, activityId: activity.id },
                })
              }
              feedback={feedback}
            />
          ) : (
            <Card className="text-slate-700">No activity found.</Card>
          )}
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <ProgressSummary
              current={activityIndex}
              total={lesson.activities.length}
              completed={completed}
            />
            <Button type="button" onClick={resetLesson} className="self-start">
              Reset lesson
            </Button>
          </div>
        </div>

        <Card as="aside" className="flex flex-col gap-3">
          <h3 className="text-lg font-semibold text-slate-900">Lesson details</h3>
          <p className="text-sm text-slate-700">{lesson.description}</p>
          <ul className="space-y-2 text-sm text-slate-700">
            <li>
              <span className="font-semibold text-slate-900">Objective: </span>
              {lesson.objective}
            </li>
            <li>
              <span className="font-semibold text-slate-900">Level: </span>
              {lesson.level}
            </li>
            <li>
              <span className="font-semibold text-slate-900">Duration: </span>
              ~{lesson.durationMinutes} minutes
            </li>
            <li>
              <span className="font-semibold text-slate-900">Activities: </span>
              {lesson.activities.length}
            </li>
          </ul>
          <div className="rounded-xl bg-amber-50 p-4 text-sm text-amber-900">
            Shibl reacts visually to lesson events only. No chat or free text is collected.
          </div>
        </Card>
      </section>
    </Container>
  );
}
