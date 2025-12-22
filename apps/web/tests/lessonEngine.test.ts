/// <reference types="vitest" />

import { LessonEngine } from "@/features/lesson-engine/lessonEngine";
import { LessonEventBus } from "@/features/lesson-engine/eventBus";
import type { Lesson } from "@/features/lesson-engine/lessonSchema";

const lesson: Lesson = {
  id: "test-lesson",
  title: "Test Lesson",
  description: "A simple lesson for automated checks.",
  objective: "Validate engine flow",
  level: 1,
  durationMinutes: 3,
  activities: [
    {
      id: "a1",
      prompt: "Pick A",
      choices: ["A", "B"],
      answer: "A",
    },
    {
      id: "a2",
      prompt: "Pick B",
      choices: ["B", "C"],
      answer: "B",
    },
  ],
};

describe("LessonEngine", () => {
  it("emits typed events for answers and completion", () => {
    const bus = new LessonEventBus();
    const engine = new LessonEngine(bus);
    const events: string[] = [];

    bus.subscribe((event) => events.push(event.type));

    engine.startLesson(lesson);
    const wrong = engine.submitAnswer("B");
    expect(wrong.correct).toBe(false);

    const next = engine.submitAnswer("A");
    expect(next.correct).toBe(true);
    const completed = engine.submitAnswer("B");
    expect(completed.completed).toBe(true);

    expect(events).toEqual([
      "LESSON_STARTED",
      "ANSWER_SUBMITTED",
      "ANSWER_WRONG",
      "ANSWER_SUBMITTED",
      "ANSWER_CORRECT",
      "ANSWER_SUBMITTED",
      "ANSWER_CORRECT",
      "LESSON_COMPLETED",
    ]);
  });
});
