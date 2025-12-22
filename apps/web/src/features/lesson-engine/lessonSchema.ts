import { z } from "zod";

const knownActivityTypes = ["choose", "listen", "build", "match", "review"] as const;

export const activitySchema = z
  .object({
    id: z.string(),
    type: z.enum(knownActivityTypes).default("choose"),
    prompt: z.string(),
    choices: z.array(z.string()).default([]),
    answer: z.string().default(""),
    hint: z.string().optional(),
    asset: z.string().optional(),
  })
  .passthrough();

export const lessonSchema = z
  .object({
    id: z.string(),
    title: z.string(),
    description: z.string(),
    objective: z.string(),
    level: z.number().int().positive(),
    durationMinutes: z.number().int().positive(),
    activities: z.array(activitySchema).min(1),
    steps: z.array(activitySchema).optional(),
  })
  .passthrough();

export type Activity = z.infer<typeof activitySchema>;
export type Lesson = z.infer<typeof lessonSchema>;
