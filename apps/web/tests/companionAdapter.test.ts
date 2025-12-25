import { describe, it, expect, vi } from "vitest";
import { createCompanionAdapter } from "../src/features/companion/companionAdapter";
import { LessonEventBus } from "../src/features/lesson-engine/eventBus";

describe("Companion Adapter", () => {
  it("subscribes to event bus and updates mood on lesson events", () => {
    const eventBus = new LessonEventBus();
    const onStateChange = vi.fn();
    const adapter = createCompanionAdapter({ eventBus, onStateChange });

    adapter.subscribe();

    // Emit a lesson started event
    eventBus.emit({
      type: "LESSON_STARTED",
      payload: { lessonId: "test-lesson" },
    });

    expect(onStateChange).toHaveBeenCalledWith(
      expect.objectContaining({ state: "intro" })
    );
  });

  it("handles story events and maps them to lesson events", () => {
    const onStateChange = vi.fn();
    const adapter = createCompanionAdapter({ onStateChange });

    // Handle story started event
    adapter.handleStoryEvent({
      type: "STORY_STARTED",
      payload: { storyId: "test-story" },
    });

    expect(onStateChange).toHaveBeenCalledWith(
      expect.objectContaining({ state: "intro" })
    );
  });

  it("transitions through states correctly", () => {
    const eventBus = new LessonEventBus();
    const adapter = createCompanionAdapter({ eventBus });

    adapter.subscribe();

    // Start with idle
    expect(adapter.getMood().state).toBe("idle");

    // Lesson started -> intro
    eventBus.emit({
      type: "LESSON_STARTED",
      payload: { lessonId: "test" },
    });
    expect(adapter.getMood().state).toBe("intro");

    // Thinking
    eventBus.emit({
      type: "THINKING",
      payload: { lessonId: "test" },
    });
    expect(adapter.getMood().state).toBe("thinking");

    // Correct answer -> happy
    eventBus.emit({
      type: "ANSWER_CORRECT",
      payload: { lessonId: "test" },
    });
    expect(adapter.getMood().state).toBe("happy");
  });

  it("applies cooldown after reaction events", () => {
    const eventBus = new LessonEventBus();
    const adapter = createCompanionAdapter({ eventBus, cooldownMs: 100 });

    adapter.subscribe();

    // First correct answer
    eventBus.emit({
      type: "ANSWER_CORRECT",
      payload: { lessonId: "test" },
    });
    expect(adapter.getMood().state).toBe("happy");

    // Immediate second correct answer should trigger cooldown
    eventBus.emit({
      type: "ANSWER_CORRECT",
      payload: { lessonId: "test" },
    });
    expect(adapter.getMood().state).toBe("cooldown");
  });

  it("resets state correctly", () => {
    const eventBus = new LessonEventBus();
    const onStateChange = vi.fn();
    const adapter = createCompanionAdapter({ eventBus, onStateChange });

    adapter.subscribe();

    // Transition to a non-idle state
    eventBus.emit({
      type: "LESSON_STARTED",
      payload: { lessonId: "test" },
    });
    expect(adapter.getMood().state).toBe("intro");

    // Reset
    adapter.reset();
    expect(adapter.getMood().state).toBe("idle");
    expect(onStateChange).toHaveBeenCalledWith(
      expect.objectContaining({ state: "idle" })
    );
  });

  it("handles story paragraph changes as thinking state", () => {
    const onStateChange = vi.fn();
    const adapter = createCompanionAdapter({ onStateChange });

    adapter.handleStoryEvent({
      type: "STORY_PARAGRAPH_CHANGED",
      payload: { storyId: "test-story", paragraphIndex: 1 },
    });

    expect(onStateChange).toHaveBeenCalledWith(
      expect.objectContaining({ state: "thinking" })
    );
  });

  it("handles story completion as lesson completion", () => {
    const onStateChange = vi.fn();
    const adapter = createCompanionAdapter({ onStateChange });

    adapter.handleStoryEvent({
      type: "STORY_COMPLETED",
      payload: { storyId: "test-story" },
    });

    expect(onStateChange).toHaveBeenCalledWith(
      expect.objectContaining({ state: "happy" })
    );
  });

  it("works without an event bus (story-only mode)", () => {
    const adapter = createCompanionAdapter();
    
    // Should not throw
    const unsubscribe = adapter.subscribe();
    unsubscribe();

    // Should still handle story events
    adapter.handleStoryEvent({
      type: "STORY_STARTED",
      payload: { storyId: "test" },
    });

    expect(adapter.getMood().state).toBe("intro");
  });
});
