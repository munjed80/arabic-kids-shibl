import { type FinalExamCategory } from "./finalExamSchema";

export type FinalExamRating = "strong" | "good" | "needsPractice";

export type FinalExamResult = {
  sections: Record<FinalExamCategory, FinalExamRating>;
};

const STORAGE_KEY = "shibl-final-exam";
const validCategories: FinalExamCategory[] = ["letters", "words", "sentences", "paragraphs"];
const validRatings: FinalExamRating[] = ["strong", "good", "needsPractice"];

const hasStorage = () => typeof window !== "undefined" && typeof window.localStorage !== "undefined";

const sanitize = (input: unknown): FinalExamResult | null => {
  if (!input || typeof input !== "object") return null;
  const data = input as { sections?: Record<string, unknown> };
  if (!data.sections || typeof data.sections !== "object") return null;

  const sections: Partial<Record<FinalExamCategory, FinalExamRating>> = {};
  for (const key of Object.keys(data.sections)) {
    const category = key as FinalExamCategory;
    const rating = data.sections[key] as FinalExamRating;
    if (validCategories.includes(category) && validRatings.includes(rating)) {
      sections[category] = rating;
    }
  }

  if (Object.keys(sections).length === 0) return null;

  return { sections: sections as Record<FinalExamCategory, FinalExamRating> };
};

export const loadFinalExamResult = (): FinalExamResult | null => {
  if (!hasStorage()) return null;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return sanitize(parsed);
  } catch {
    return null;
  }
};

export const saveFinalExamResult = (sections: Record<FinalExamCategory, FinalExamRating>) => {
  if (!hasStorage()) return;
  window.localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify({
      sections,
    }),
  );
};

const STRONG_THRESHOLD = 0.85;
const GOOD_THRESHOLD = 0.6;

export const gradeFinalExamSection = (correct: number, total: number): FinalExamRating => {
  if (total <= 0) return "needsPractice";
  const ratio = correct / total;
  if (ratio >= STRONG_THRESHOLD) return "strong";
  if (ratio >= GOOD_THRESHOLD) return "good";
  return "needsPractice";
};
