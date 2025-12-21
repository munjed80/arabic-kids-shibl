/// <reference types="vitest" />

import { LessonEventBus } from "@/features/lesson-engine/eventBus";

describe("LessonEventBus", () => {
  it("delivers events to subscribers", () => {
    const bus = new LessonEventBus();
    const events: string[] = [];

    const unsubscribe = bus.subscribe((event) => {
      events.push(event.type);
    });

    bus.emit({ type: "LESSON_STARTED", payload: { lessonId: "1" } });
    unsubscribe();
    bus.emit({ type: "ANSWER_CORRECT", payload: { lessonId: "1" } });

    expect(events).toEqual(["LESSON_STARTED"]);
  });
});
