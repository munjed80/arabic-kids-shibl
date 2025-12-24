import { describe, it, expect, beforeEach, afterEach } from "vitest";
import {
  loadExamReport,
  saveExamReport,
  getLatestReportForCategory,
  type ExamCategory,
  type ExamRating,
} from "@/features/exams/localExamReport";

describe("Exam Report localStorage", () => {
  const STORAGE_KEY = "shibl-exam-report";

  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    localStorage.clear();
  });

  it("should return empty report when nothing is stored", () => {
    const report = loadExamReport();
    expect(report).toEqual({ reports: [] });
  });

  it("should save and load exam report correctly", () => {
    const category: ExamCategory = "letters";
    const rating: ExamRating = "strong";

    saveExamReport(category, rating);
    const report = loadExamReport();

    expect(report.reports).toHaveLength(1);
    expect(report.reports[0].category).toBe(category);
    expect(report.reports[0].rating).toBe(rating);
    expect(report.reports[0].completedAt).toBeDefined();
  });

  it("should overwrite existing report for same category", () => {
    const category: ExamCategory = "words";

    saveExamReport(category, "good");
    const first = loadExamReport();
    const firstTimestamp = first.reports[0].completedAt;

    // Wait a bit to ensure different timestamp
    const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));
    return wait(10).then(() => {
      saveExamReport(category, "strong");
      const second = loadExamReport();

      expect(second.reports).toHaveLength(1);
      expect(second.reports[0].rating).toBe("strong");
      expect(second.reports[0].completedAt).not.toBe(firstTimestamp);
    });
  });

  it("should store reports for different categories", () => {
    saveExamReport("letters", "strong");
    saveExamReport("words", "good");
    saveExamReport("sentences", "needsPractice");

    const report = loadExamReport();

    expect(report.reports).toHaveLength(3);
    expect(report.reports.find((r) => r.category === "letters")?.rating).toBe("strong");
    expect(report.reports.find((r) => r.category === "words")?.rating).toBe("good");
    expect(report.reports.find((r) => r.category === "sentences")?.rating).toBe("needsPractice");
  });

  it("should get latest report for category", () => {
    saveExamReport("letters", "strong");
    saveExamReport("words", "good");

    const lettersReport = getLatestReportForCategory("letters");
    const wordsReport = getLatestReportForCategory("words");
    const sentencesReport = getLatestReportForCategory("sentences");

    expect(lettersReport?.rating).toBe("strong");
    expect(wordsReport?.rating).toBe("good");
    expect(sentencesReport).toBeNull();
  });

  it("should handle corrupted localStorage data gracefully", () => {
    localStorage.setItem(STORAGE_KEY, "invalid json");
    const report = loadExamReport();
    expect(report).toEqual({ reports: [] });
  });

  it("should sanitize invalid category data", () => {
    const invalidData = {
      reports: [
        { category: "invalid", rating: "strong", completedAt: "2024-01-01" },
        { category: "letters", rating: "invalid", completedAt: "2024-01-01" },
        { category: "letters", rating: "strong", completedAt: "2024-01-01" },
      ],
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(invalidData));

    const report = loadExamReport();
    expect(report.reports).toHaveLength(1);
    expect(report.reports[0].category).toBe("letters");
  });
});
