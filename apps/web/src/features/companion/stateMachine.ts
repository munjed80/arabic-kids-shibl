import type { LessonEvent, LessonEventType } from "../lesson-engine/eventBus";

export type CompanionState =
  | "idle"
  | "intro"
  | "thinking"
  | "happy"
  | "celebrate"
  | "sad"
  | "cooldown";

export type CompanionMood = {
  state: CompanionState;
  label: string;
  accent: "calm" | "success" | "warning" | "info";
};

export const companionLabelKeyByState: Record<CompanionState, string> = {
  idle: "companion.ready",
  intro: "companion.readyToLearn",
  thinking: "companion.thinking",
  happy: "companion.greatJob",
  celebrate: "companion.levelComplete",
  sad: "companion.tryAgain",
  cooldown: "companion.cooldown",
};

export class CompanionStateMachine {
  private state: CompanionState = "idle";
  private lastReactionAt = 0;

  constructor(private readonly cooldownMs = 1400) {}

  get current(): CompanionState {
    return this.state;
  }

  handleEvent(event: LessonEvent): CompanionState {
    const now = Date.now();
    const reactionEvents: LessonEventType[] = ["ANSWER_CORRECT", "ANSWER_WRONG", "LEVEL_COMPLETED"];
    const isReactionEvent = reactionEvents.includes(event.type);

    if (this.shouldThrottle(event.type, now)) {
      this.state = "cooldown";
      return this.state;
    }

    switch (event.type) {
      case "LESSON_STARTED":
        this.state = "intro";
        break;
      case "ANSWER_SUBMITTED":
      case "THINKING":
        this.state = "thinking";
        break;
      case "ANSWER_CORRECT":
        this.state = "happy";
        break;
      case "LEVEL_COMPLETED":
        this.state = "celebrate";
        break;
      case "ANSWER_WRONG":
        this.state = "sad";
        break;
      default:
        this.state = "idle";
    }

    if (isReactionEvent) {
      this.lastReactionAt = now;
    }
    return this.state;
  }

  reset(): CompanionState {
    this.state = "idle";
    this.lastReactionAt = 0;
    return this.state;
  }

  getMood(): CompanionMood {
    const label = companionLabelKeyByState[this.state] ?? companionLabelKeyByState.idle;
    switch (this.state) {
      case "intro":
        return { state: this.state, label, accent: "info" };
      case "thinking":
        return { state: this.state, label, accent: "info" };
      case "happy":
        return { state: this.state, label, accent: "success" };
      case "celebrate":
        return { state: this.state, label, accent: "success" };
      case "sad":
        return { state: this.state, label, accent: "warning" };
      case "cooldown":
        return { state: this.state, label, accent: "calm" };
      default:
        return { state: "idle", label: companionLabelKeyByState.idle, accent: "calm" };
    }
  }

  private shouldThrottle(eventType: LessonEventType, now: number): boolean {
    if (this.lastReactionAt === 0) return false;
    const soonAfterPrevious = now - this.lastReactionAt < this.cooldownMs;
    const isReactionEvent = ["ANSWER_CORRECT", "ANSWER_WRONG", "LEVEL_COMPLETED"].includes(
      eventType,
    );
    return soonAfterPrevious && isReactionEvent;
  }
}
