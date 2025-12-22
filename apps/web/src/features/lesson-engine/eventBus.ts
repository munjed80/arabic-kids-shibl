export type LessonEventType =
  | "LESSON_STARTED"
  | "LESSON_COMPLETED"
  | "ANSWER_CORRECT"
  | "ANSWER_WRONG"
  | "LEVEL_COMPLETED"
  | "ANSWER_SUBMITTED"
  | "THINKING";

export type LessonEventPayload = {
  lessonId: string;
  activityId?: string;
  choice?: string;
};

export type LessonEvent = {
  type: LessonEventType;
  payload: LessonEventPayload;
};

export type LessonEventListener = (event: LessonEvent) => void;

export class LessonEventBus {
  private listeners = new Set<LessonEventListener>();

  emit(event: LessonEvent): void {
    this.listeners.forEach((listener) => listener(event));
  }

  subscribe(listener: LessonEventListener): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }
}
