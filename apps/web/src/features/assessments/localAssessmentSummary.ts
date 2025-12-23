export type AssessmentCategory = "letters" | "words" | "sentences" | "paragraphs";
export type AssessmentRating = "strong" | "good" | "needsPractice";

export type AssessmentSummary = Partial<Record<AssessmentCategory, AssessmentRating>>;

const STORAGE_KEY = "shibl-assessment-summary";
const validCategories: AssessmentCategory[] = ["letters", "words", "sentences", "paragraphs"];
const validRatings: AssessmentRating[] = ["strong", "good", "needsPractice"];

const hasStorage = () => typeof window !== "undefined" && typeof window.localStorage !== "undefined";

const sanitizeSummary = (input: unknown): AssessmentSummary => {
  if (!input || typeof input !== "object") return {};
  const summary: AssessmentSummary = {};
  for (const [key, value] of Object.entries(input as Record<string, unknown>)) {
    if (validCategories.includes(key as AssessmentCategory) && validRatings.includes(value as AssessmentRating)) {
      summary[key as AssessmentCategory] = value as AssessmentRating;
    }
  }
  return summary;
};

export const loadAssessmentSummary = (): AssessmentSummary => {
  if (!hasStorage()) return {};
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    return sanitizeSummary(parsed);
  } catch {
    return {};
  }
};

export const saveAssessmentSummary = (summary: AssessmentSummary) => {
  if (!hasStorage()) return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(summary));
};
