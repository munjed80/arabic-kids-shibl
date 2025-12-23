import { loadAssessmentsFromDisk } from "@/features/assessments/loadAssessments";
import { AssessmentsPageClient } from "./AssessmentsPageClient";

export default async function AssessmentsPage() {
  const assessments = await loadAssessmentsFromDisk();
  return <AssessmentsPageClient assessments={assessments} />;
}
