/// <reference types="vitest" />

import { LessonEngine } from "@/features/lesson-engine/lessonEngine";
import { LessonEventBus } from "@/features/lesson-engine/eventBus";
import { loadLessonsFromDisk } from "@/features/lesson-engine/loadLessons";

const level1Targets: Record<string, string> = {
  "level1-sound-a": "ا",
  "level1-sound-b": "ب",
  "level1-sound-t": "ت",
};

const arabicRegex = /[\u0600-\u06FF]/g;

describe("Level 1 curriculum", () => {
  let level1Lessons: Awaited<ReturnType<typeof loadLessonsFromDisk>>;

  beforeAll(async () => {
    level1Lessons = (await loadLessonsFromDisk()).filter((lesson) => lesson.level === 1);
  });

  it("expands each letter into 12 ordered activities with the required mix", () => {
    const requiredCounts = { listen: 2, choose: 4, match: 2, build: 3, review: 1 };

    level1Lessons.forEach((lesson) => {
      const counts: Record<string, number> = {};
      lesson.activities.forEach((activity) => {
        counts[activity.type] = (counts[activity.type] ?? 0) + 1;
      });

      expect(lesson.activities).toHaveLength(12);
      expect(counts).toMatchObject(requiredCounts);
    });
  });

  it("contains only the target letter for Arabic content and no words", () => {
    level1Lessons.forEach((lesson) => {
      const target = level1Targets[lesson.id];
      expect(target).toBeDefined();

      lesson.activities.forEach((activity) => {
        if (activity.type === "review") {
          expect([target, ""]).toContain(activity.answer ?? "");
        } else {
          expect(activity.answer).toBe(target);
        }

        const answerLetters = (activity.answer ?? "").match(arabicRegex) ?? [];
        answerLetters.forEach((letter) => {
          expect(letter).toBe(target);
        });

        activity.choices.forEach((choice) => {
          const letters = choice.match(arabicRegex) ?? [];
          if (letters.length > 0) {
            expect(new Set(letters).size).toBe(1);
            letters.forEach((letter) => {
              expect(letter).toBe(target);
            });
          }
          expect(choice.length).toBeLessThanOrEqual(3);
        });
      });
    });
  });

  it("only completes a lesson after all 12 activities succeed", () => {
    const bus = new LessonEventBus();
    const engine = new LessonEngine(bus);
    const sampleLesson = level1Lessons[0];

    engine.startLesson(sampleLesson);

    sampleLesson.activities.forEach((activity, index) => {
      const result = engine.submitAnswer(activity.answer);
      if (index < sampleLesson.activities.length - 1) {
        expect(result.completed).toBe(false);
        expect(result.nextIndex).toBe(index + 1);
      } else {
        expect(result.completed).toBe(true);
      }
    });
  });
});
