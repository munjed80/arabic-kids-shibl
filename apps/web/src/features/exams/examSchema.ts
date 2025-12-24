import { z } from "zod";
import { activitySchema } from "@/features/lesson-engine/lessonSchema";

export const examSchema = z
  .object({
    id: z.string(),
    category: z.enum(["letters", "words", "sentences", "paragraphs"]),
    title: z.string(),
    description: z.string(),
    objective: z.string(),
    durationMinutes: z.number().int().positive(),
    activities: z.array(activitySchema).min(1),
  })
  .passthrough();

export type Exam = z.infer<typeof examSchema>;
