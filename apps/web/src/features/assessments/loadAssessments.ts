import { promises as fs } from "fs";
import path from "path";
import { assessmentSchema, type Assessment } from "./assessmentSchema";

const preferredOrder = ["letters", "words", "sentences", "paragraphs"];

const sortAssessments = (assessments: Assessment[]) =>
  [...assessments].sort((a, b) => {
    const orderA = preferredOrder.indexOf(a.category);
    const orderB = preferredOrder.indexOf(b.category);
    if (orderA !== -1 && orderB !== -1) {
      if (orderA === -1) return 1;
      if (orderB === -1) return -1;
      if (orderA !== orderB) return orderA - orderB;
    }
    return a.id.localeCompare(b.id);
  });

export async function loadAssessmentsFromDisk(): Promise<Assessment[]> {
  const assessmentsDir = path.join(process.cwd(), "src", "content", "assessments");
  const entries = await fs.readdir(assessmentsDir);
  const assessments: Assessment[] = [];

  for (const entry of entries) {
    if (!entry.endsWith(".json")) continue;
    const filePath = path.join(assessmentsDir, entry);
    const contents = await fs.readFile(filePath, "utf-8");
    try {
      const raw = JSON.parse(contents);
      const parsed = assessmentSchema.parse(raw);
      assessments.push(parsed);
    } catch (error) {
      console.warn(`Skipping invalid assessment file ${entry}:`, error);
    }
  }

  return sortAssessments(assessments);
}
