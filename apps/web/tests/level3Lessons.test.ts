/// <reference types="vitest" />

import { loadLessonsFromDisk } from "@/features/lesson-engine/loadLessons";

const level3Targets: Record<string, string> = {
  "level3-jeem-shapes": "ج",
  "level3-haa-shapes": "ح",
  "level3-khaa-shapes": "خ",
};

const supportedLocales = ["en", "nl", "de", "sv"] as const;
const allowedLetters = new Set(["ا", "ب", "ت", "ث", "ن", "ي", "ج", "ح", "خ"]);
const arabicChar = /[\u0600-\u06FF]/;
const arabicLetters = /[\u0600-\u06FF]/g;

const getSteps = (lesson: Awaited<ReturnType<typeof loadLessonsFromDisk>>[number]) =>
  lesson.steps ?? lesson.activities;

const extractLetters = (text = "") => (text.match(arabicLetters) ?? []).filter((ch) => ch !== "ـ");

const assertLocalizedField = (field?: Record<string, string>) => {
  expect(field).toBeTruthy();
  supportedLocales.forEach((locale) => {
    const value = field?.[locale];
    expect(value, `${locale} missing`).toBeTypeOf("string");
    expect(value, `${locale} empty`).not.toHaveLength(0);
  });
};

describe("Level 3 curriculum", () => {
  let level3Lessons: Awaited<ReturnType<typeof loadLessonsFromDisk>>;

  beforeAll(async () => {
    level3Lessons = (await loadLessonsFromDisk()).filter((lesson) => lesson.level === 3);
  });

  it("includes only the three Level 3 shape lessons", () => {
    expect(level3Lessons).toHaveLength(3);
    const ids = level3Lessons.map((lesson) => lesson.id);
    expect(ids.sort()).toEqual(Object.keys(level3Targets).sort());
  });

  it("expands each letter into 12 ordered steps with the required mix and localized prompts", () => {
    const requiredCounts = { listen: 3, choose: 4, match: 2, build: 2, review: 1 };

    level3Lessons.forEach((lesson) => {
      const steps = getSteps(lesson);
      const counts: Record<string, number> = {};

      expect(steps).toHaveLength(12);
      steps.forEach((step) => {
        counts[step.type] = (counts[step.type] ?? 0) + 1;
        expect(step.asset).toBeTruthy();
        assertLocalizedField(step.promptI18n as Record<string, string> | undefined);
        if (step.hint) {
          assertLocalizedField(step.hintI18n as Record<string, string> | undefined);
        }
        expect(arabicChar.test(step.prompt ?? "")).toBe(false);
        if (step.hint) {
          expect(arabicChar.test(step.hint)).toBe(false);
        }
      });

      expect(counts).toMatchObject(requiredCounts);
    });
  });

  it("restricts Arabic content to the target letter forms and allowed distractors", () => {
    level3Lessons.forEach((lesson) => {
      const target = level3Targets[lesson.id];
      expect(target).toBeDefined();
      const steps = getSteps(lesson);

      steps.forEach((step) => {
        const answerLetters = extractLetters(step.answer ?? "");
        if (answerLetters.length > 0) {
          answerLetters.forEach((letter) => {
            expect(letter).toBe(target);
          });
        } else if (step.type !== "review") {
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

  it("includes explicit /ḥ/ vs /kh/ discrimination using listen or choose steps", () => {
    const haaLesson = level3Lessons.find((lesson) => lesson.id === "level3-haa-shapes");
    const khaaLesson = level3Lessons.find((lesson) => lesson.id === "level3-khaa-shapes");
    expect(haaLesson).toBeTruthy();
    expect(khaaLesson).toBeTruthy();

    const hasContrast = (lesson: (typeof level3Lessons)[number] | undefined) =>
      getSteps(lesson!).some(
        (step) =>
          (step.type === "listen" || step.type === "choose") &&
          step.choices?.includes("ح") &&
          step.choices?.includes("خ")
      );

    expect(hasContrast(haaLesson)).toBe(true);
    expect(hasContrast(khaaLesson)).toBe(true);
  });
});
