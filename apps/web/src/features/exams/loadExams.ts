import { readdirSync, readFileSync } from "fs";
import { join } from "path";
import { examSchema, type Exam } from "./examSchema";

const examsDir = join(process.cwd(), "src/content/exams");

export const loadExams = (): Exam[] => {
  const files = readdirSync(examsDir).filter((file) => file.endsWith(".json"));
  const exams: Exam[] = [];

  files.forEach((file) => {
    const filePath = join(examsDir, file);
    const content = readFileSync(filePath, "utf-8");
    const parsed = JSON.parse(content);
    const validated = examSchema.parse(parsed);
    exams.push(validated);
  });

  return exams.sort((a, b) => {
    const order = ["letters", "words", "sentences", "paragraphs"];
    return order.indexOf(a.category) - order.indexOf(b.category);
  });
};
