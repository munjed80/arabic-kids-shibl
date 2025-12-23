import { describe, expect, it } from "vitest";
import { loadAssessmentsFromDisk } from "@/features/assessments/loadAssessments";
import { loadAssessmentSummary, saveAssessmentSummary } from "@/features/assessments/localAssessmentSummary";

describe("assessments track", () => {
  it("loads the four assessment types in the preferred order with activities", async () => {
    const assessments = await loadAssessmentsFromDisk();
    expect(assessments.map((entry) => entry.category)).toEqual([
      "letters",
      "words",
      "sentences",
      "paragraphs",
    ]);
    assessments.forEach((entry) => {
      expect(entry.activities.length).toBeGreaterThan(0);
    });
  });

  it("stores only the latest qualitative summary and sanitizes stored data", () => {
    saveAssessmentSummary({ letters: "good" });
    expect(loadAssessmentSummary()).toEqual({ letters: "good" });

    saveAssessmentSummary({ words: "needsPractice" });
    expect(loadAssessmentSummary()).toEqual({ words: "needsPractice" });

    window.localStorage.setItem(
      "shibl-assessment-summary",
      JSON.stringify({ letters: "strong", score: 90 }),
    );
    expect(loadAssessmentSummary()).toEqual({ letters: "strong" });
  });
});
