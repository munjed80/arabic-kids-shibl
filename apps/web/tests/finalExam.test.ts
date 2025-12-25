import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { loadFinalExam } from "@/features/final-exam/loadFinalExam";
import {
  gradeFinalExamSection,
  loadFinalExamResult,
  saveFinalExamResult,
  type FinalExamRating,
} from "@/features/final-exam/finalExamReport";
import type { FinalExamCategory } from "@/features/final-exam/finalExamSchema";

describe("Final exam content", () => {
  it("loads the final checkpoint structure with four sections", () => {
    const exam = loadFinalExam();
    expect(exam.sections).toHaveLength(4);
    exam.sections.forEach((section) => {
      expect(section.activities).toHaveLength(4);
    });
  });
});

describe("Final exam grading and storage", () => {
  const STORAGE_KEY = "shibl-final-exam";

  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    localStorage.clear();
  });

  it("grades sections with strong/good/needsPractice thresholds", () => {
    expect(gradeFinalExamSection(4, 4)).toBe("strong");
    expect(gradeFinalExamSection(3, 4)).toBe("good");
    expect(gradeFinalExamSection(2, 4)).toBe("needsPractice");
    expect(gradeFinalExamSection(0, 0)).toBe("needsPractice");
  });

  it("saves and loads the latest result only", () => {
    const ratings: Record<FinalExamCategory, FinalExamRating> = {
      letters: "good",
      words: "strong",
      sentences: "needsPractice",
      paragraphs: "good",
    };
    saveFinalExamResult(ratings);
    const loaded = loadFinalExamResult();
    expect(loaded?.sections).toEqual(ratings);
  });

  it("ignores malformed stored data", () => {
    localStorage.setItem(STORAGE_KEY, "invalid");
    expect(loadFinalExamResult()).toBeNull();
  });
});
