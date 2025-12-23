export type AssessmentCategory = "letters" | "words" | "sentences" | "paragraphs";
export type AssessmentRating = "strong" | "good" | "needsPractice";

export type AssessmentSummary = Partial<Record<AssessmentCategory, AssessmentRating>>;

const STORAGE_KEY = "shibl-assessment-summary";

const hasStorage = () => typeof window !== "undefined" && typeof window.localStorage !== "undefined";

export const loadAssessmentSummary = (): AssessmentSummary => {
  if (!hasStorage()) return {};
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    if (parsed && typeof parsed === "object") return parsed as AssessmentSummary;
    return {};
  } catch {
    return {};
  }
};

export const saveAssessmentSummary = (summary: AssessmentSummary) => {
  if (!hasStorage()) return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(summary));
};
