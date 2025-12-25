import { readFileSync } from "fs";
import { join } from "path";
import { finalExamSchema, type FinalExam } from "./finalExamSchema";

const finalExamPath = join(process.cwd(), "src/content/final-exam/final-checkpoint.json");

export const loadFinalExam = (): FinalExam => {
  const raw = readFileSync(finalExamPath, "utf-8");
  const parsed = JSON.parse(raw);
  return finalExamSchema.parse(parsed);
};
