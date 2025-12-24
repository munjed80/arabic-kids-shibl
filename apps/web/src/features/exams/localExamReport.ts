export type ExamCategory = "letters" | "words" | "sentences" | "paragraphs";
export type ExamRating = "strong" | "good" | "needsPractice";

export type ExamReport = {
  category: ExamCategory;
  rating: ExamRating;
  completedAt: string;
};

export type ParentReport = {
  reports: ExamReport[];
};

const STORAGE_KEY = "shibl-exam-report";
const validCategories: ExamCategory[] = ["letters", "words", "sentences", "paragraphs"];
const validRatings: ExamRating[] = ["strong", "good", "needsPractice"];

const hasStorage = () => typeof window !== "undefined" && typeof window.localStorage !== "undefined";

const sanitizeReport = (input: unknown): ParentReport => {
  if (!input || typeof input !== "object") return { reports: [] };
  const data = input as { reports?: unknown };
  
  if (!Array.isArray(data.reports)) return { reports: [] };
  
  const validReports: ExamReport[] = [];
  for (const item of data.reports) {
    if (
      item &&
      typeof item === "object" &&
      "category" in item &&
      "rating" in item &&
      "completedAt" in item &&
      validCategories.includes(item.category as ExamCategory) &&
      validRatings.includes(item.rating as ExamRating) &&
      typeof item.completedAt === "string"
    ) {
      validReports.push(item as ExamReport);
    }
  }
  
  return { reports: validReports };
};

export const loadExamReport = (): ParentReport => {
  if (!hasStorage()) return { reports: [] };
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return { reports: [] };
    const parsed = JSON.parse(raw);
    return sanitizeReport(parsed);
  } catch {
    return { reports: [] };
  }
};

export const saveExamReport = (category: ExamCategory, rating: ExamRating) => {
  if (!hasStorage()) return;
  
  const current = loadExamReport();
  const existingIndex = current.reports.findIndex((r) => r.category === category);
  
  const newReport: ExamReport = {
    category,
    rating,
    completedAt: new Date().toISOString(),
  };
  
  if (existingIndex >= 0) {
    current.reports[existingIndex] = newReport;
  } else {
    current.reports.push(newReport);
  }
  
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(current));
};

export const getLatestReportForCategory = (category: ExamCategory): ExamReport | null => {
  const report = loadExamReport();
  return report.reports.find((r) => r.category === category) ?? null;
};
