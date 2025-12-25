import { z } from "zod";
import { activitySchema } from "@/features/lesson-engine/lessonSchema";

export const finalExamCategorySchema = z.enum(["letters", "words", "sentences", "paragraphs"]);
export type FinalExamCategory = z.infer<typeof finalExamCategorySchema>;

export const finalExamSectionSchema = z.object({
  id: z.string(),
  title: z.string(),
  category: finalExamCategorySchema,
  activities: z.array(activitySchema).length(4),
});

export const finalExamSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string(),
  objective: z.string(),
  durationMinutes: z.number().int().positive(),
  sections: z.array(finalExamSectionSchema).length(4),
});

export type FinalExam = z.infer<typeof finalExamSchema>;
export type FinalExamSection = z.infer<typeof finalExamSectionSchema>;
