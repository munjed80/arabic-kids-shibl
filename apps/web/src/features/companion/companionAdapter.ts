/**
 * Companion Adapter
 * 
 * Unified adapter layer that maps application events to companion state transitions.
 * Works consistently across lessons, exams, assessments, and stories.
 */

import { CompanionStateMachine } from "./stateMachine";
import type { LessonEvent, LessonEventBus } from "../lesson-engine/eventBus";

export type StoryEvent = {
  type: "STORY_STARTED" | "STORY_PARAGRAPH_CHANGED" | "STORY_COMPLETED";
  payload: {
    storyId: string;
    paragraphIndex?: number;
  };
};

export type CompanionAdapter = {
  subscribe: () => () => void;
  getMood: () => ReturnType<CompanionStateMachine["getMood"]>;
  reset: () => void;
  handleStoryEvent: (event: StoryEvent) => void;
};

type CompanionAdapterOptions = {
  eventBus?: LessonEventBus;
  cooldownMs?: number;
  onStateChange?: (state: ReturnType<CompanionStateMachine["getMood"]>) => void;
};

/**
 * Creates a companion adapter that listens to events and manages companion state.
 * 
 * @param options - Configuration options
 * @returns CompanionAdapter instance
 */
export function createCompanionAdapter(options: CompanionAdapterOptions = {}): CompanionAdapter {
  const { eventBus, cooldownMs = 1400, onStateChange } = options;
  const stateMachine = new CompanionStateMachine(cooldownMs);

  const handleLessonEvent = (event: LessonEvent): void => {
    stateMachine.handleEvent(event);
    onStateChange?.(stateMachine.getMood());
  };

  const subscribe = (): (() => void) => {
    if (!eventBus) {
      return () => {};
    }
    return eventBus.subscribe(handleLessonEvent);
  };

  const handleStoryEvent = (event: StoryEvent): void => {
    // Map story events to lesson events for the state machine
    switch (event.type) {
      case "STORY_STARTED":
        stateMachine.handleEvent({
          type: "LESSON_STARTED",
          payload: { lessonId: event.payload.storyId },
        });
        break;
      case "STORY_PARAGRAPH_CHANGED":
        // Use thinking state for page turns
        stateMachine.handleEvent({
          type: "THINKING",
          payload: { lessonId: event.payload.storyId },
        });
        break;
      case "STORY_COMPLETED":
        stateMachine.handleEvent({
          type: "LESSON_COMPLETED",
          payload: { lessonId: event.payload.storyId },
        });
        break;
    }
    onStateChange?.(stateMachine.getMood());
  };

  return {
    subscribe,
    getMood: () => stateMachine.getMood(),
    reset: () => {
      stateMachine.reset();
      onStateChange?.(stateMachine.getMood());
    },
    handleStoryEvent,
  };
}
