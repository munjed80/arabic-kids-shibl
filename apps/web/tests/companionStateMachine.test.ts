/// <reference types="vitest" />

import { CompanionStateMachine } from "@/features/companion/stateMachine";
import type { LessonEvent } from "@/features/lesson-engine/eventBus";

const makeEvent = (type: LessonEvent["type"]): LessonEvent => ({
  type,
  payload: { lessonId: "lesson-1", activityId: "a1" },
});

describe("CompanionStateMachine", () => {
  it("moves through intro, thinking, and happy states", () => {
    const machine = new CompanionStateMachine(2000);

    machine.handleEvent(makeEvent("LESSON_STARTED"));
    expect(machine.getMood().state).toBe("intro");

    machine.handleEvent(makeEvent("ANSWER_SUBMITTED"));
    expect(machine.getMood().state).toBe("thinking");

    machine.handleEvent(makeEvent("ANSWER_CORRECT"));
    expect(machine.getMood().state).toBe("happy");
  });

  it("applies cooldown to rapid reaction events", () => {
    const machine = new CompanionStateMachine(5000);
    machine.handleEvent(makeEvent("ANSWER_CORRECT"));
    const state = machine.handleEvent(makeEvent("ANSWER_WRONG"));
    expect(state).toBe("cooldown");
  });
});
