import { LessonEventBus } from "./eventBus";
import type { Lesson } from "./lessonSchema";

export type LessonEngineResult = {
  correct: boolean;
  completed: boolean;
  nextIndex: number;
};

export class LessonEngine {
  private currentLesson?: Lesson;
  private currentIndex = 0;

  constructor(private readonly bus: LessonEventBus) {}

  startLesson(lesson: Lesson, startIndex = 0): void {
    this.currentLesson = lesson;
    this.currentIndex = Math.max(0, Math.min(startIndex, lesson.activities.length - 1));
    this.bus.emit({
      type: "LESSON_STARTED",
      payload: { lessonId: lesson.id, activityId: lesson.activities[this.currentIndex]?.id },
    });
  }

  getCurrentActivity() {
    return this.currentLesson?.activities[this.currentIndex];
  }

  submitAnswer(choice: string): LessonEngineResult {
    if (!this.currentLesson) {
      throw new Error("Lesson has not been started.");
    }

    const activity = this.currentLesson.activities[this.currentIndex];
    this.bus.emit({
      type: "ANSWER_SUBMITTED",
      payload: { lessonId: this.currentLesson.id, activityId: activity.id, choice },
    });

    const correct = activity.answer === choice;
    const isLast = this.currentIndex === this.currentLesson.activities.length - 1;

    if (correct) {
      this.bus.emit({
        type: "ANSWER_CORRECT",
        payload: { lessonId: this.currentLesson.id, activityId: activity.id, choice },
      });
      if (isLast) {
        this.bus.emit({
          type: "LEVEL_COMPLETED",
          payload: { lessonId: this.currentLesson.id, activityId: activity.id },
        });
      } else {
        this.currentIndex += 1;
      }
    } else {
      this.bus.emit({
        type: "ANSWER_WRONG",
        payload: { lessonId: this.currentLesson.id, activityId: activity.id, choice },
      });
    }

    return {
      correct,
      completed: correct && isLast,
      nextIndex: this.currentIndex,
    };
  }

  restart(): void {
    if (!this.currentLesson) return;
    this.currentIndex = 0;
    this.startLesson(this.currentLesson, 0);
  }
}
