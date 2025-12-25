import { loadFinalExam } from "@/features/final-exam/loadFinalExam";
import { FinalExamPageClient } from "./FinalExamPageClient";

export default function FinalExamPage() {
  const exam = loadFinalExam();
  return <FinalExamPageClient exam={exam} />;
}
