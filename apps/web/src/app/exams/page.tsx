import { loadExams } from "@/features/exams/loadExams";
import { ExamsPageClient } from "./ExamsPageClient";

export default async function ExamsPage() {
  const exams = loadExams();
  return <ExamsPageClient exams={exams} />;
}
