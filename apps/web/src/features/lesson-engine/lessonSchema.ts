import { z } from "zod";

export const activitySchema = z.object({
  id: z.string(),
  prompt: z.string(),
  choices: z.array(z.string()).min(2),
  answer: z.string(),
  hint: z.string().optional(),
  asset: z.string().optional(),
});

export const lessonSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string(),
  objective: z.string(),
  level: z.number().int().positive(),
  durationMinutes: z.number().int().positive(),
  activities: z.array(activitySchema).min(1),
});

export type Activity = z.infer<typeof activitySchema>;
export type Lesson = z.infer<typeof lessonSchema>;
