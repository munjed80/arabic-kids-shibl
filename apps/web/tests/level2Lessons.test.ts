/// <reference types="vitest" />

import { loadLessonsFromDisk } from "@/features/lesson-engine/loadLessons";

const level2Targets: Record<string, string> = {
  "level2-thaa-shapes": "ث",
  "level2-noon-shapes": "ن",
  "level2-yaa-shapes": "ي",
};

const allowedLetters = new Set(["ا", "ب", "ت", "ث", "ن", "ي"]);
const arabicChar = /[\u0600-\u06FF]/;
const arabicLetters = /[\u0600-\u06FF]/g;

const getSteps = (lesson: Awaited<ReturnType<typeof loadLessonsFromDisk>>[number]) =>
  lesson.steps ?? lesson.activities;

const extractLetters = (text = "") => (text.match(arabicLetters) ?? []).filter((ch) => ch !== "ـ");

describe("Level 2 curriculum", () => {
  let level2Lessons: Awaited<ReturnType<typeof loadLessonsFromDisk>>;

  beforeAll(async () => {
    level2Lessons = (await loadLessonsFromDisk()).filter((lesson) => lesson.level === 2);
  });

  it("includes only the three Level 2 shape lessons", () => {
    expect(level2Lessons).toHaveLength(3);
    const ids = level2Lessons.map((lesson) => lesson.id);
    expect(ids.sort()).toEqual(Object.keys(level2Targets).sort());
  });

  it("expands each letter into 12 ordered steps with the required mix and TTS assets", () => {
    const requiredCounts = { listen: 2, choose: 5, match: 2, build: 2, review: 1 };

    level2Lessons.forEach((lesson) => {
      const steps = getSteps(lesson);
      const counts: Record<string, number> = {};

      expect(steps).toHaveLength(12);
      expect(lesson.activities).toHaveLength(12);

      steps.forEach((step) => {
        counts[step.type] = (counts[step.type] ?? 0) + 1;
        expect(step.asset).toBeTruthy();
        expect(arabicChar.test(step.prompt ?? "")).toBe(false);
        if (step.hint) {
          expect(arabicChar.test(step.hint)).toBe(false);
        }
      });

      expect(counts).toMatchObject(requiredCounts);
    });
  });

  it("restricts Arabic content to the target letter forms and allowed distractors", () => {
    level2Lessons.forEach((lesson) => {
      const target = level2Targets[lesson.id];
      expect(target).toBeDefined();
      const steps = getSteps(lesson);

      steps.forEach((step) => {
        const answerLetters = extractLetters(step.answer ?? "");
        if (answerLetters.length > 0) {
          answerLetters.forEach((letter) => {
            expect(letter).toBe(target);
          });
        } else if (step.type !== "review") {
          // Non-review steps should always carry an explicit target answer.
          expect(step.answer).toBeTruthy();
        }

        (step.choices ?? []).forEach((choice) => {
          const letters = extractLetters(choice);
          letters.forEach((letter) => {
            expect(allowedLetters.has(letter)).toBe(true);
          });
        });
      });
    });
  });
});
