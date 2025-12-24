import { describe, it, expect } from "vitest";
import { loadExams } from "@/features/exams/loadExams";

describe("loadExams", () => {
  it("should load all exam files", () => {
    const exams = loadExams();
    expect(exams.length).toBeGreaterThan(0);
  });

  it("should load exams in correct order", () => {
    const exams = loadExams();
    const categories = exams.map((exam) => exam.category);
    expect(categories).toEqual(["letters", "words", "sentences", "paragraphs"]);
  });

  it("should validate exam schema", () => {
    const exams = loadExams();
    exams.forEach((exam) => {
      expect(exam.id).toBeDefined();
      expect(exam.category).toBeDefined();
      expect(exam.title).toBeDefined();
      expect(exam.description).toBeDefined();
      expect(exam.objective).toBeDefined();
      expect(exam.durationMinutes).toBeGreaterThan(0);
      expect(exam.activities.length).toBeGreaterThan(0);
    });
  });

  it("should have valid activities", () => {
    const exams = loadExams();
    exams.forEach((exam) => {
      exam.activities.forEach((activity) => {
        expect(activity.id).toBeDefined();
        expect(activity.type).toBeDefined();
        expect(activity.prompt).toBeDefined();
        expect(activity.choices).toBeDefined();
        expect(activity.answer).toBeDefined();
      });
    });
  });
});
